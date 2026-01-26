import { db } from '../firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    query,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { BADGES_DATA, LEVEL_THRESHOLDS } from '../constants/badges';

// --- Helpers ---

export const calculateLevel = (totalXP) => {
    let currentLevel = 1;
    let nextLevelXP = 100;

    for (const threshold of LEVEL_THRESHOLDS) {
        if (totalXP >= threshold.xp) {
            currentLevel = threshold.level;
        } else {
            nextLevelXP = threshold.xp;
            break;
        }
    }

    // Fallback for max level
    if (currentLevel === LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level) {
        nextLevelXP = 'MAX';
    }

    return { level: currentLevel, nextLevelXP };
};

// --- Core Functions ---

/**
 * Check and unlock achievements based on a specific triggered action.
 * @param {string} userId 
 * @param {string} type - 'trips', 'countries', 'friends', 'photos', 'items'
 * @param {any} value - The current count or value to check against (optional, if logic needs to fetch it)
 */
export const checkAndUnlockAchievements = async (userId, type, currentValue = null) => {
    if (!userId) return [];

    const unlockedBadges = [];
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);

    // 1. Get current User Achievements to know what's already unlocked
    const achievementsRef = collection(userRef, 'achievements');
    const snapshot = await getDocs(achievementsRef);
    const existingBadgeIds = new Set(snapshot.docs.map(d => d.id));

    // 2. Determine value if not provided (Optimization: Pass value to save reads)
    let valueToCheck = currentValue;

    if (valueToCheck === null) {
        // Fetch from user profile stats if available
        // For efficiency, we rely on the caller passing it, otherwise we default to 0 to avoid crashes
        console.warn("Achievement check: value not provided for type", type);
        valueToCheck = 0;
    }

    // 3. Filter potential badges
    const potentialBadges = BADGES_DATA.filter(b =>
        b.condition.type === type && !existingBadgeIds.has(b.id)
    );

    let xpGained = 0;

    for (const badge of potentialBadges) {
        let isUnlocked = false;

        // Logic Check
        if (typeof badge.condition.count === 'number' && typeof valueToCheck === 'number') {
            // Standard Check: value >= required (e.g. 5 Trips >= 5)
            isUnlocked = valueToCheck >= badge.condition.count;
        } else if (type === 'join_date' && badge.condition.year) {
            // Special check for join date
            isUnlocked = valueToCheck <= badge.condition.year;
        } else if (badge.condition.category === type) {
            // Check for category-based matches (items_category)
            if (badge.condition.count && valueToCheck >= badge.condition.count) {
                isUnlocked = true;
            }
        }

        if (isUnlocked) {
            const badgeRef = doc(achievementsRef, badge.id);
            // Use batch.set to create badge doc
            batch.set(badgeRef, {
                badgeId: badge.id,
                unlockedAt: serverTimestamp(),
                notified: false
            });
            xpGained += badge.xp;
            unlockedBadges.push(badge);
        }
    }

    // 4. Update Total XP and Level if badges unlocked
    if (unlockedBadges.length > 0) {
        // Calculate new level (Optimization: Read current totalXP first or use increment return if possible, 
        // but for Firestore strict increment, we might need a separate trigger or better, transaction.
        // For MVP: We will increment XP, then client will see new XP in component.
        // Server-Side-Like Logic: We want to store 'level' in DB so client doesn't need to calc it.
        // Since we are using 'increment', we don't know the final value here easily without a transaction.
        // However, we can approximate or use a transaction reading the doc first.

        // Transaction approach to ensure Level is updated with XP
        await cn.runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) return;

            const newTotalXP = (userDoc.data().totalXP || 0) + xpGained;
            const newLevel = calculateLevel(newTotalXP).level;

            transaction.update(userRef, {
                totalXP: newTotalXP,
                level: newLevel // Store level in DB
            });

            // Unlocking badges in transaction? No, batch is fine for badges collection, 
            // but we want level updated atomically.
            // We'll use the transaction for everything for safety.
        });

        // Note: The original generic implementation used batch. 
        // Changing to transaction requires refactoring the badge sets.
        // Let's stick to update for now, but realizing 'increment' prevents knowing the new total without a read.
        // User requested "XP calculation to Level can be server calculation".
        // Let's do a READ then WRITE pattern (optimistic).

        const userSnap = await getDoc(userRef);
        const currentXP = userSnap.data()?.totalXP || 0;
        const newTotalXP = currentXP + xpGained;
        const newLevel = calculateLevel(newTotalXP).level;

        batch.update(userRef, {
            totalXP: newTotalXP,
            level: newLevel
        });

        await batch.commit();

        // Recursively check for Level Up badges
        // We need to fetch new totalXP to check level
        // Simplified: Just add gaining XP to current (approximation) or fetch fresh
        // For accuracy, let's just trigger a separate check later or rely on listener

        // V1.9.4 Improvement: Check for Level Up immediately
        // Note: calculating new level here is tricky without knowing current total. 
        // We will leave level-up badge checking for a separate trigger or useEffect on client side.
    }

    return unlockedBadges; // Return for UI notification
};

/**
 * Fetch all unlocked achievements for a user
 */
export const getUserAchievements = async (userId) => {
    if (!userId) return [];

    // Get unlocked IDs
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const snapshot = await getDocs(achievementsRef);

    const unlockedMap = {};
    snapshot.docs.forEach(doc => {
        unlockedMap[doc.id] = doc.data(); // Contains timestamp
    });

    // Merge with static data
    return BADGES_DATA.map(badge => ({
        ...badge,
        unlocked: !!unlockedMap[badge.id],
        unlockedAt: unlockedMap[badge.id]?.unlockedAt?.toDate() || null
    }));
};

/**
 * Mark achievement as notified (to stop showing popup)
 */
export const markAchievementAsNotified = async (userId, badgeId) => {
    const ref = doc(db, 'users', userId, 'achievements', badgeId);
    await updateDoc(ref, { notified: true });
};
