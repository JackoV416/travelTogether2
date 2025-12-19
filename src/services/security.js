import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Rate Limits (actions per minute)
const LIMITS = {
    create_trip: 5,
    upload_file: 10,
    send_feedback: 5
};

// Abuse Check Function
export const checkAbuse = async (user, actionType) => {
    if (!user || !user.uid) return false;

    const now = Date.now();
    const minuteKey = Math.floor(now / 60000); // Current minute timestamp
    const rateLimitRef = doc(db, "rate_limits", `${user.uid}_${minuteKey}`);

    try {
        // 1. Increment counter for this minute
        const snapshot = await getDoc(rateLimitRef);
        let count = 1;

        if (snapshot.exists()) {
            const data = snapshot.data();
            count = (data[actionType] || 0) + 1;
            await updateDoc(rateLimitRef, {
                [actionType]: increment(1),
                lastUpdated: serverTimestamp()
            });
        } else {
            await setDoc(rateLimitRef, {
                [actionType]: 1,
                uid: user.uid,
                minute: minuteKey,
                lastUpdated: serverTimestamp()
            });
        }

        // 2. Check Exceedance
        if (count > LIMITS[actionType]) {
            console.warn(`[Security] User ${user.uid} exceeded limit for ${actionType}: ${count}/${LIMITS[actionType]}`);

            // 3. Ban User
            await updateDoc(doc(db, "users", user.uid), {
                isBanned: true,
                banReason: `Automated: Exceeded ${actionType} limit (${count}/min)`,
                bannedAt: serverTimestamp()
            });

            // 4. Notify Admin (via Feedback system for now as a high-priority alert)
            await addDoc(collection(db, "feedback"), {
                type: 'bug', // Use 'bug' or 'other' to ensure visibility
                message: `[SYSTEM ALERT] User ${user.displayName} (${user.email}) has been autobanned.\nReason: Exceeded ${actionType} rate limit.`,
                email: 'security@system',
                uid: 'system',
                userName: 'System Security',
                createdAt: serverTimestamp(),
                status: 'open',
                isSystemAlert: true
            });

            return true; // Abuse detected
        }

        return false; // Safe
    } catch (error) {
        console.error("Security check failed:", error);
        return false; // Fail open to avoid blocking legit users on error
    }
};
