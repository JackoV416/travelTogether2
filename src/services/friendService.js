import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    onSnapshot,
    addDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';

// --- Friend Request Logic ---

// 1. Send Friend Request (by Email OR Exact Display Name)
export const sendFriendRequest = async (currentUserId, currentUserData, targetIdentifier) => {
    try {
        const usersRef = collection(db, "users");
        let querySnapshot;

        // A. Find target user
        // Optimistic check: if it looks like an email, search email first
        const isEmail = targetIdentifier.includes('@');

        if (isEmail) {
            const qEmail = query(usersRef, where("email", "==", targetIdentifier));
            querySnapshot = await getDocs(qEmail);
        }

        // If not email OR email search yielded nothing, try display name
        if (!isEmail || querySnapshot.empty) {
            const qName = query(usersRef, where("displayName", "==", targetIdentifier));
            const nameSnapshot = await getDocs(qName);
            if (!nameSnapshot.empty) {
                querySnapshot = nameSnapshot;
            }
        }

        if (!querySnapshot || querySnapshot.empty) {
            throw new Error("USER_NOT_FOUND");
        }

        const targetUserDoc = querySnapshot.docs[0];
        const targetUserId = targetUserDoc.id;

        if (targetUserId === currentUserId) {
            throw new Error("CANNOT_ADD_SELF");
        }

        // B. Check if already friends
        const friendCheck = await getDoc(doc(db, "users", currentUserId, "friends", targetUserId));
        if (friendCheck.exists()) {
            throw new Error("ALREADY_FRIENDS");
        }

        // C. Check if request already Pending
        const existingReqQ = query(
            collection(db, "users", targetUserId, "friendRequests"),
            where("fromUserId", "==", currentUserId),
            where("status", "==", "pending")
        );
        const existingReqSnap = await getDocs(existingReqQ);
        if (!existingReqSnap.empty) {
            throw new Error("REQUEST_ALREADY_SENT");
        }

        // D. Create Request Doc in Target User's Subcollection
        await addDoc(collection(db, "users", targetUserId, "friendRequests"), {
            fromUserId: currentUserId,
            fromUserName: currentUserData.displayName || "Unknown",
            fromUserPhoto: currentUserData.photoURL || "",
            status: "pending",
            createdAt: serverTimestamp()
        });

        return { success: true, targetUser: targetUserDoc.data() };
    } catch (error) {
        console.error("Error sending friend request:", error);
        throw error;
    }
};


// 1.5 Send Friend Request (by UID - Direct from Profile)
export const sendFriendRequestByUid = async (currentUserId, currentUserData, targetUserId) => {
    try {
        if (!targetUserId) throw new Error("USER_NOT_FOUND");
        if (targetUserId === currentUserId) throw new Error("CANNOT_ADD_SELF");

        // A. Check if already friends
        const friendCheck = await getDoc(doc(db, "users", currentUserId, "friends", targetUserId));
        if (friendCheck.exists()) {
            // Check status
            if (friendCheck.data().status === 'accepted') throw new Error("ALREADY_FRIENDS");
            // If status is something else?
        }

        // B. Check if request already Pending
        const usersRef = collection(db, "users");
        // We need target user data? We might already have it in SocialProfile, 
        // but here we just need to write to their subcollection.
        // But we usually want to verify they exist?
        // Assume valid UID if coming from profile.

        // Check pending requests
        const existingReqQ = query(
            collection(db, "users", targetUserId, "friendRequests"),
            where("fromUserId", "==", currentUserId),
            where("status", "==", "pending")
        );
        const existingReqSnap = await getDocs(existingReqQ);
        if (!existingReqSnap.empty) {
            throw new Error("REQUEST_ALREADY_SENT");
        }

        // C. Create Request Doc
        await addDoc(collection(db, "users", targetUserId, "friendRequests"), {
            fromUserId: currentUserId,
            fromUserName: currentUserData.displayName || "Unknown",
            fromUserPhoto: currentUserData.photoURL || "",
            status: "pending",
            createdAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending friend request by UID:", error);
        throw error;
    }
};

// 2. Accept Friend Request
export const acceptFriendRequest = async (currentUserId, currentUserData, requestId, requestData) => {
    try {
        const batch = db.batch(); // Use transactional logic ideally, but batch is good for now

        const targetUserId = requestData.fromUserId;

        // A. Add Target to Current User's Friends
        const myFriendRef = doc(db, "users", currentUserId, "friends", targetUserId);
        batch.set(myFriendRef, {
            friendId: targetUserId,
            nickname: requestData.fromUserName,
            photoURL: requestData.fromUserPhoto,
            status: "accepted",
            since: serverTimestamp()
        });

        // B. Add Current User to Target's Friends (Reciprocal)
        const theirFriendRef = doc(db, "users", targetUserId, "friends", currentUserId);
        batch.set(theirFriendRef, {
            friendId: currentUserId,
            nickname: currentUserData.displayName,
            photoURL: currentUserData.photoURL,
            status: "accepted",
            since: serverTimestamp()
        });

        // C. Update Request Status
        const requestRef = doc(db, "users", currentUserId, "friendRequests", requestId);
        batch.update(requestRef, { status: "accepted" });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error accepting friend request:", error);
        throw error;
    }
};

// 3. Reject/Cancel Friend Request
export const rejectFriendRequest = async (userId, requestId) => {
    try {
        await deleteDoc(doc(db, "users", userId, "friendRequests", requestId));
        return { success: true };
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        throw error;
    }
};

// 3.5 Cancel Sent Friend Request
export const cancelFriendRequest = async (currentUserId, targetUserId) => {
    try {
        // Find the request ID first
        const q = query(
            collection(db, "users", targetUserId, "friendRequests"),
            where("fromUserId", "==", currentUserId),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return { success: false, message: "Request not found" };

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error("Error cancelling friend request:", error);
        throw error;
    }
};

// 3.6 Remove Friend (Unfriend)
export const removeFriend = async (currentUserId, targetUserId) => {
    try {
        const batch = db.batch();

        // Remove from my list
        const myRef = doc(db, "users", currentUserId, "friends", targetUserId);
        batch.delete(myRef);

        // Remove from their list
        const theirRef = doc(db, "users", targetUserId, "friends", currentUserId);
        batch.delete(theirRef);

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error removing friend:", error);
        throw error;
    }
};

// 3.7 Block User
export const blockUser = async (currentUserId, targetUserId) => {
    try {
        const batch = db.batch();

        // 1. Remove friendship if exists (both ways)
        const myFriendRef = doc(db, "users", currentUserId, "friends", targetUserId);
        batch.delete(myFriendRef);
        const theirFriendRef = doc(db, "users", targetUserId, "friends", currentUserId);
        batch.delete(theirFriendRef);

        // 2. Add to blocked list
        const blockedRef = doc(db, "users", currentUserId, "blocked", targetUserId);
        batch.set(blockedRef, {
            blockedId: targetUserId,
            since: serverTimestamp()
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
    }
};

// --- Listeners ---

// 4. Listen to Friend List
export const listenToFriends = (userId, callback) => {
    const q = query(collection(db, "users", userId, "friends"));
    return onSnapshot(q, (snapshot) => {
        const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(friends);
    });
};

// 5. Listen to Friend Requests
export const listenToFriendRequests = (userId, callback) => {
    const q = query(
        collection(db, "users", userId, "friendRequests"),
        where("status", "==", "pending")
    );
    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
    });
};
