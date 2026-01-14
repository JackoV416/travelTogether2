/**
 * 🔒 Per-User AI Quota Service (V1.2.3)
 * Firestore-based daily quota tracking for each user
 */
import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';

// Default quota settings
const DEFAULT_DAILY_LIMIT = 20; // V1.3.1: Adjusted to 20 RPD (Free Tier Safety Limit)
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
            customUsed: data.customCount || 0,
            features: data.features || {}, // V1.2.5: Return feature breakdown
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
 * ➕ Increment user's AI usage count with Granular Tracking
 * @param {string} uid - User ID
 * @param {string} feature - Feature name (e.g., 'Chat', 'Weather')
 * @param {number} keyIndex - Index of the API key used
 * @param {boolean} isCustomKey - Whether a custom BYOK key was used
 * @returns {Promise<Object>} Updated quota status
 */
export async function incrementUserQuota(uid, feature = 'General', keyIndex = -1, isCustomKey = false, provider = 'gemini') {
    if (!uid) return null;

    const today = getTodayKey();
    const quotaRef = doc(db, QUOTA_COLLECTION, uid, 'usage', QUOTA_DOC);

    // Admin Analytics Reference
    const systemRef = doc(db, 'system', 'ai_analytics');

    try {
        const quotaSnap = await getDoc(quotaRef);
        let currentCount = 0;
        let featureBreakdown = {};
        let providerBreakdown = {}; // V1.2.8
        let data = {}; // Define data scope

        if (quotaSnap.exists()) {
            data = quotaSnap.data();
            // Reset if new day
            if (data.date === today) {
                currentCount = data.count || 0;
                featureBreakdown = data.features || {};
                providerBreakdown = data.providers || {};
            }
        }

        const newCount = currentCount + 1;

        // Update feature breakdown
        featureBreakdown[feature] = (featureBreakdown[feature] || 0) + 1;

        // Update provider breakdown (V1.2.8)
        providerBreakdown[provider] = (providerBreakdown[provider] || 0) + 1;

        // 1. Update User Quota
        const updates = {
            lastUpdated: serverTimestamp()
        };

        if (isCustomKey) {
            // Track custom usage separatedly
            const newCustomCount = (data.customCount || 0) + 1;
            updates.customCount = newCustomCount;
            // distinct breakdown for custom? optionally, but for now we mix features or keep simple
            // Let's keep a shared feature breakdown for simplicity, or just track total custom calls.
        } else {
            // Track System Usage (Quota applies)
            updates.date = today;
            updates.count = newCount;
        }

        updates.features = featureBreakdown; // Keep tracking features regardless of source
        updates.providers = providerBreakdown; // Track which provider is being used (V1.2.8)

        await setDoc(quotaRef, updates, { merge: true });

        // 2. Update System Analytics (Fire & Forget for performance)
        // Only if we have a valid keyIndex
        if (keyIndex >= 0) {
            const updates = {
                lastUpdated: serverTimestamp(),
                [`total_calls`]: increment(1)
            };

            // Track System vs Custom
            if (isCustomKey) {
                updates[`type_custom`] = increment(1);
            } else {
                updates[`type_system`] = increment(1);
            }
            // Track Provider (V1.2.8)
            updates[`provider_${provider}`] = increment(1);
            // Optional: Still track raw key index internally if needed, but per user request we focus on aggregates
            // updates[`keys.raw_key_${keyIndex}`] = increment(1); 

            setDoc(systemRef, updates, { merge: true }).catch(err => console.error("Analytics Error:", err));
        }

        // Usage logged

        // Broadcast update for real-time UI
        // Broadcast update for real-time UI
        const currentCustomCount = quotaSnap.exists() ? (quotaSnap.data().customCount || 0) : 0;

        window.dispatchEvent(new CustomEvent('AI_QUOTA_UPDATED', {
            detail: {
                used: isCustomKey ? currentCount : newCount, // If custom, system count doesn't increase
                customUsed: isCustomKey ? currentCustomCount + 1 : currentCustomCount,
                total: DEFAULT_DAILY_LIMIT,
                remaining: Math.max(0, DEFAULT_DAILY_LIMIT - (isCustomKey ? currentCount : newCount)),
                breakdown: featureBreakdown
            }
        }));

        return { used: newCount, total: DEFAULT_DAILY_LIMIT, breakdown: featureBreakdown };

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

    // V1.3.3 Auto-Fix: If used > total (likely leftover from debug mode), reset it once.
    if (status.used > status.total) {
        console.warn(`[AI Quota] Detected overflow (${status.used}/${status.total}). Auto-fixing for user ${uid}.`);
        await resetUserQuota(uid);
        // Allow this request immediately after reset
        return { allowed: true, message: "Quota auto-corrected", retryIn: null };
    }

    if (status.allowed) {
        return { allowed: true, message: null, retryIn: null };
    }

    const resetTime = status.resetTime;
    const hoursUntilReset = resetTime ? Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60)) : null;

    return {
        allowed: false,
        message: `你今日 Jarvis 限額已用完 (${status.used}/${status.total})。請聯絡真人客服，或等待明天重置。`,
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
            features: {},
            lastUpdated: serverTimestamp()
        });
        // Reset quota for user
        return true;
    } catch (error) {
        console.error('[AI Quota] Error resetting quota:', error);
        return false;
    }
}

/**
 * 🕵️‍♂️ Get System Analytics (Admin Only)
 * V1.2.5: Added daily reset based on date field
 */
export async function getSystemAnalytics() {
    const today = getTodayKey();

    try {
        const docRef = doc(db, 'system', 'ai_analytics');
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
            return { keys: {}, total_calls: 0, type_system: 0, type_custom: 0, date: today };
        }

        const data = snap.data();

        // V1.2.5: Check if it's a new day - reset counters
        if (data.date !== today) {
            // Reset analytics for new day
            const resetData = {
                date: today,
                total_calls: 0,
                type_system: 0,
                type_custom: 0,
                lastUpdated: serverTimestamp()
            };

            // Fire and forget - don't block UI
            setDoc(docRef, resetData, { merge: true }).catch(err =>
                console.error('[Analytics] Failed to reset daily stats:', err)
            );

            return resetData;
        }

        return data;
    } catch (error) {
        console.error("Failed to get analytics", error);
        return null;
    }
}
