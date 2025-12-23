/**
 * 🔒 Per-User AI Quota Service (V1.2.3)
 * Firestore-based daily quota tracking for each user
 */
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Default quota settings
const DEFAULT_DAILY_LIMIT = 50; // V1.2.3: Increased to 50 for multi-key support
const QUOTA_COLLECTION = 'users';
const QUOTA_DOC = 'ai_quota';

/**
 * 📅 Get today's date key (HKT timezone)
 */
function getTodayKey() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });
}

/**
 * 📊 Get user's current quota status from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} { used, total, remaining, allowed, resetTime }
 */
export async function getUserQuotaStatus(uid) {
    if (!uid) {
        return { used: 0, total: DEFAULT_DAILY_LIMIT, remaining: DEFAULT_DAILY_LIMIT, allowed: true, resetTime: null };
    }

    const today = getTodayKey();

    try {
        const quotaRef = doc(db, QUOTA_COLLECTION, uid, 'usage', QUOTA_DOC);
        const quotaSnap = await getDoc(quotaRef);

        if (!quotaSnap.exists()) {
            return {
                used: 0,
                total: DEFAULT_DAILY_LIMIT,
                remaining: DEFAULT_DAILY_LIMIT,
                allowed: true,
                resetTime: getNextMidnight()
            };
        }

        const data = quotaSnap.data();

        // Check if it's a new day
        if (data.date !== today) {
            return {
                used: 0,
                total: DEFAULT_DAILY_LIMIT,
                remaining: DEFAULT_DAILY_LIMIT,
                allowed: true,
                resetTime: getNextMidnight()
            };
        }

        const used = data.count || 0;
        const remaining = Math.max(0, DEFAULT_DAILY_LIMIT - used);

        return {
            used,
            total: DEFAULT_DAILY_LIMIT,
            remaining,
            allowed: used < DEFAULT_DAILY_LIMIT,
            resetTime: getNextMidnight()
        };

    } catch (error) {
        console.error('[AI Quota] Error fetching quota:', error);
        // Fail open - allow the request if we can't check
        return { used: 0, total: DEFAULT_DAILY_LIMIT, remaining: DEFAULT_DAILY_LIMIT, allowed: true, resetTime: null };
    }
}

/**
 * ➕ Increment user's AI usage count
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Updated quota status
 */
export async function incrementUserQuota(uid) {
    if (!uid) return null;

    const today = getTodayKey();
    const quotaRef = doc(db, QUOTA_COLLECTION, uid, 'usage', QUOTA_DOC);

    try {
        const quotaSnap = await getDoc(quotaRef);
        let currentCount = 0;

        if (quotaSnap.exists()) {
            const data = quotaSnap.data();
            // Reset if new day
            if (data.date === today) {
                currentCount = data.count || 0;
            }
        }

        const newCount = currentCount + 1;

        await setDoc(quotaRef, {
            date: today,
            count: newCount,
            lastUpdated: serverTimestamp()
        });

        console.log(`[AI Quota] User ${uid.slice(0, 8)} used ${newCount}/${DEFAULT_DAILY_LIMIT} calls today`);

        // Broadcast update for real-time UI
        window.dispatchEvent(new CustomEvent('AI_QUOTA_UPDATED', {
            detail: {
                used: newCount,
                total: DEFAULT_DAILY_LIMIT,
                remaining: Math.max(0, DEFAULT_DAILY_LIMIT - newCount)
            }
        }));

        return { used: newCount, total: DEFAULT_DAILY_LIMIT };

    } catch (error) {
        console.error('[AI Quota] Error incrementing quota:', error);
        return null;
    }
}

/**
 * 🔄 Check if user can make an AI call
 * @param {string} uid - User ID
 * @returns {Promise<Object>} { allowed: boolean, message: string, retryIn: number|null }
 */
export async function checkUserQuota(uid) {
    const status = await getUserQuotaStatus(uid);

    if (status.allowed) {
        return { allowed: true, message: null, retryIn: null };
    }

    const resetTime = status.resetTime;
    const hoursUntilReset = resetTime ? Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60)) : null;

    return {
        allowed: false,
        message: `你今日 AI 限額已用完 (${status.used}/${status.total})。請聯絡真人客服，或等待明天重置。`,
        retryIn: hoursUntilReset,
        resetTime
    };
}

/**
 * ⏰ Get next midnight in HKT
 */
function getNextMidnight() {
    const now = new Date();
    const hkt = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
    hkt.setHours(24, 0, 0, 0);
    return hkt.getTime();
}

/**
 * 🎁 Reset user quota (admin function)
 */
export async function resetUserQuota(uid) {
    if (!uid) return false;

    const quotaRef = doc(db, QUOTA_COLLECTION, uid, 'usage', QUOTA_DOC);

    try {
        await setDoc(quotaRef, {
            date: getTodayKey(),
            count: 0,
            lastUpdated: serverTimestamp()
        });
        console.log(`[AI Quota] Reset quota for user ${uid.slice(0, 8)}`);
        return true;
    } catch (error) {
        console.error('[AI Quota] Error resetting quota:', error);
        return false;
    }
}
