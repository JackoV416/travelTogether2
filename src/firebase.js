import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// --- 全域變數定義 (Canvas 環境要求) ---
// 確保全域變數存在，這是 Canvas/Immersive 環境的要求
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// 必須將字串形式的 __firebase_config 轉換為 JSON 物件
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- 初始化 Firebase 服務 (確保只執行一次) ---
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 設定日誌級別 (用於調試)
setLogLevel('debug');

/**
 * 處理初始認證邏輯：使用自定義 Token 或匿名登入。
 * 這個函式應在應用程式的主元件中被調用，以確保其非同步性質得到正確處理。
 * * @param {import('firebase/auth').Auth} authInstance Firebase Auth 實例。
 * @param {string | null} token 提供的自定義認證 Token。
 */
export async function performInitialAuth(authInstance, token) {
    try {
        if (token) {
            // 使用提供的自定義 token 登入
            await signInWithCustomToken(authInstance, token);
            console.log("Firebase Auth: Signed in with custom token.");
        } else {
            // 如果 token 不存在，則匿名登入
            await signInAnonymously(authInstance);
            console.log("Firebase Auth: Signed in anonymously.");
        }
    } catch (error) {
        console.error("Firebase Auth initialization failed:", error);
    }
}

// 導出其他常用的 Firebase Auth 相關函式
export { onAuthStateChanged, firebaseSignOut as signOut };
