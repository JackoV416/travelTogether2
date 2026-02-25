
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    arrayUnion,
    increment,
    startAfter,
    deleteDoc,
    writeBatch,
    arrayRemove
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

/**
 * Creates or gets an existing 1-on-1 conversation between current user and target user.
 * @param {string} currentUserId
 * @param {object} targetUser { uid, displayName, photoURL }
 * @returns {Promise<string>} conversationId
 */
export const getOrCreateConversation = async (currentUserId, targetUser) => {
    if (!currentUserId || !targetUser?.uid) throw new Error("Invalid users");

    // 1. Check if conversation already exists
    // Note: For scalability, we might store direct conversation IDs in a subcollection of users or perform a specific query.
    // For MVP, we can enable a composite index on 'participants' array-contains.
    // BUT array-contains + array-contains is not supported directly.
    // Better approach: Store a unique ID for 1-1 chats, e.g., sort(uid1, uid2).join('_')
    const sortedIds = [currentUserId, targetUser.uid].sort();
    const consistentId = `${sortedIds[0]}_${sortedIds[1]}`;

    const convRef = doc(db, CONVERSATIONS_COLLECTION, consistentId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
        return consistentId;
    }

    // 2. Create new conversation
    const newConv = {
        type: 'direct',
        participants: [currentUserId, targetUser.uid],
        participantDetails: {
            [targetUser.uid]: {
                displayName: targetUser.displayName || 'User',
                photoURL: targetUser.photoURL || null
            }
            // Current user details will be updated by the other user or shared context
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        unreadCounts: {
            [currentUserId]: 0,
            [targetUser.uid]: 0
        },
        updatedAt: serverTimestamp()
    };

    await setDoc(convRef, newConv);
    return consistentId;
};

/**
 * Sends a message in a conversation.
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} text
 * @param {File} [imageFile] Optional image
 * @param {object} [metadata] e.g., type: 'location' | 'trip_invite'
 */
export const sendMessage = async (conversationId, senderId, text, imageFile = null, metadata = {}) => {
    if (!text && !imageFile && !metadata.type) return;

    let mediaUrl = null;
    let messageType = metadata.type || 'text';

    // Upload Image if present
    if (imageFile) {
        messageType = 'image';
        const storageRef = ref(storage, `chat/${conversationId}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        mediaUrl = await getDownloadURL(snapshot.ref);
    }

    const messageData = {
        senderId,
        text: text || '',
        type: messageType,
        mediaUrl,
        ...metadata,
        createdAt: serverTimestamp(),
        readBy: [senderId]
    };

    // batch write for atomicity (Message + Conversation Update)
    // Firestore batch is good here, but for simplicity/speed standard implementation:

    // 1. Add Message
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    await addDoc(messagesRef, messageData);

    // 2. Update Conversation (Last Message & Unread Count)
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

    // We need to increment unread count for ALL participants EXCEPT sender
    // Since we don't know exact other IDs easily without reading, strictly for 1-1 we know the ID from conversation ID logic or just map.
    // For MVP, we presume participants field exists.
    // We will use dot notation for nested field update if possible or just generic logic.
    // However, unreadCounts is a map. We cannot dynamically update keys in one go easily without knowing them.
    // We will fetch participants from doc? Optimistic update:
    // Actually, `getOrCreateConversation` ensures `participants` array.

    // Efficient way:
    // Since we can't easily increment dynamic keys in one update without knowing keys.
    // We will just update updated_at and lastMessage for now, letting the UI subscription handle "unread" based on lastMessage/readBy.
    // OR we fetch the conv first.

    // Simplified: Just update lastMessage.
    await updateDoc(convRef, {
        lastMessage: {
            text: text || (messageType === 'image' ? '[圖片]' : '[訊息]'),
            senderId,
            timestamp: serverTimestamp(),
            read: false
        },
        updatedAt: serverTimestamp()
    });
};

/**
 * Listens to all conversations for a user.
 * @param {string} userId
 * @param {function} callback
 */
export const listenToConversations = (userId, callback) => {
    // FIX: Remove orderBy to avoid "Missing Index" error. Sort client-side instead.
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId)
        // orderBy('updatedAt', 'desc') // Removed to bypass index requirement
    );

    return onSnapshot(q, async (snapshot) => {
        const conversationsRaw = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch blocked users for current user to filter
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const blockedUsers = userSnap.data()?.blockedUsers || [];

        // Filter and Client-side sort (Newest first)
        const conversations = conversationsRaw
            .filter(conv => {
                const otherId = conv.participants.find(id => id !== userId);
                return !blockedUsers.includes(otherId);
            })
            .sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds * 1000 || 0);
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds * 1000 || 0);
                return timeB - timeA;
            });

        callback(conversations);
    });
};

/**
 * Listens to messages in a specific conversation.
 * @param {string} conversationId
 * @param {function} callback
 */
export const listenToMessages = (conversationId, callback) => {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
        orderBy('createdAt', 'asc'),
        limit(100)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
};

/**
 * Marks a conversation as read (updates lastMessage read status or specific user read timestamp).
 * @param {string} conversationId
 * @param {string} userId
 */
export const markConversationAsRead = async (conversationId, userId) => {
    // Ideally we track specific 'lastReadTimestamp' per user in conversation
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(convRef, {
        [`unreadCounts.${userId}`]: 0, // Reset counter if using counters
        [`lastRead.${userId}`]: serverTimestamp() // Track read time
    });
};

/**
 * Clears all messages in a specific conversation.
 * @param {string} conversationId
 */
export const clearChatHistory = async (conversationId, currentUserId) => {
    // 1. Ownership/Participant Check
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists() || !convSnap.data().participants.includes(currentUserId)) {
        throw new Error("Unauthorized to clear history");
    }

    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const snapshot = await getDocs(messagesRef);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // Also update the conversation's last message
    batch.update(convRef, {
        lastMessage: null,
        updatedAt: serverTimestamp()
    });

    await batch.commit();
};

/**
 * Blocks a user by adding their ID to the current user's blocked list.
 * @param {string} currentUserId
 * @param {string} targetUserId
 */
export const blockUser = async (currentUserId, targetUserId) => {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
        blockedUsers: arrayUnion(targetUserId)
    });
};

/**
 * Unblocks a user.
 * @param {string} currentUserId
 * @param {string} targetUserId
 */
export const unblockUser = async (currentUserId, targetUserId) => {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
        blockedUsers: arrayRemove(targetUserId)
    });
};

