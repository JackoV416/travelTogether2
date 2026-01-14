/**
 * 👤 Account Service (V1.2.5)
 * User profile management and account deletion
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';

/**
 * 📝 Update user profile (display name, avatar)
 * @param {Object} user - Firebase auth user
 * @param {Object} data - { displayName?: string, photoURL?: string }
 */
export async function updateUserProfile(user, data) {
    if (!user) throw new Error('User not authenticated');

    // 1. Update Firebase Auth Profile
    await updateProfile(user, {
        displayName: data.displayName ?? user.displayName,
        photoURL: data.photoURL ?? user.photoURL
    });

    // 2. Update Firestore User Doc
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        displayName: data.displayName ?? user.displayName,
        photoURL: data.photoURL ?? user.photoURL,
        email: user.email,
        lastUpdated: serverTimestamp()
    }, { merge: true });

    return { success: true };
}

/**
 * 📤 Upload user avatar to Firebase Storage
 * @param {Object} user - Firebase auth user
 * @param {File} file - File object to upload
 * @returns {Promise<string>} Download URL
 */
export async function uploadUserAvatar(user, file) {
    if (!user) throw new Error('User not authenticated');

    // Create reference: users/{uid}/avatar_{timestamp}
    // We add timestamp to avoid caching issues
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `users/${user.uid}/${fileName}`);

    // Upload
    await uploadBytes(storageRef, file);

    // Get URL
    const url = await getDownloadURL(storageRef);
    return url;
}

/**
 * 🗑️ Delete user account and all associated data
 * @param {Object} user - Firebase auth user
 * @param {string} password - User's password for re-authentication
 */
export async function deleteUserAccount(user, password) {
    if (!user) throw new Error('User not authenticated');

    // 1. Re-authenticate user (required for account deletion)
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // 2. Delete user data from Firestore
    const batch = writeBatch(db);

    // Delete user doc
    batch.delete(doc(db, 'users', user.uid));

    // Delete user's usage/quota data
    const usageRef = doc(db, 'users', user.uid, 'usage', 'ai_quota');
    batch.delete(usageRef);

    // Delete user's settings
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    batch.delete(settingsRef);

    await batch.commit();

    // 3. Delete Firebase Auth account
    await deleteUser(user);

    // 4. Clear local storage
    localStorage.clear();

    return { success: true, message: '帳戶已永久刪除' };
}

/**
 * 💾 Save user settings to Firestore (for cross-device sync)
 * @param {string} uid - User ID
 * @param {Object} settings - Settings object
 */
export async function saveUserSettings(uid, settings) {
    if (!uid) throw new Error('User not authenticated');

    const settingsRef = doc(db, 'users', uid, 'settings', 'preferences');
    await setDoc(settingsRef, {
        ...settings,
        lastUpdated: serverTimestamp()
    }, { merge: true });

    return { success: true };
}

/**
 * 📥 Load user settings from Firestore
 * @param {string} uid - User ID
 * @returns {Object|null} Settings object or null if not found
 */
export async function loadUserSettings(uid) {
    if (!uid) return null;

    try {
        const settingsRef = doc(db, 'users', uid, 'settings', 'preferences');
        const snap = await getDoc(settingsRef);

        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (error) {
        console.error('[Account] Failed to load settings:', error);
        return null;
    }
}

/**
 * 📤 Upload user banner to Firebase Storage
 * @param {Object} user - Firebase auth user
 * @param {File} file - File object to upload
 * @returns {Promise<string>} Download URL
 */
export async function uploadUserBanner(user, file) {
    if (!user) throw new Error('User not authenticated');

    // Create reference: users/{uid}/banner_{timestamp}
    const fileExt = file.name.split('.').pop();
    const fileName = `banner_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `users/${user.uid}/${fileName}`);

    // Upload
    await uploadBytes(storageRef, file);

    // Get URL
    const url = await getDownloadURL(storageRef);

    // Update Firestore User Doc with bannerURL
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        bannerURL: url,
        lastUpdated: serverTimestamp()
    }, { merge: true });

    return url;
}

