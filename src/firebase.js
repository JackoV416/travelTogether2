import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// --- 1. 全域變數定義 (Canvas/Immersive 環境要求) ---
// 確保讀取 appId 和 Auth Token
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 必須將字串形式的 __firebase_config 轉換為 JSON 物件
let firebaseConfig = {};
try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        firebaseConfig = JSON.parse(__firebase_config);
    } else {
        console.warn("警告：全域變數 __firebase_config 缺失或為空。Firebase 初始化將跳過。");
    }
} catch (e) {
    console.error("錯誤：解析 __firebase_config 失敗，請檢查 JSON 格式。", e);
}


// --- 2. 初始化 Firebase 服務 ---
let app = null;
let db = null;
let auth = null;

try {
    // 關鍵檢查：確保配置中至少有 projectId，這是修復您之前錯誤的關鍵
    if (firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        setLogLevel('debug');
        console.log("Firebase 服務初始化成功。Project ID:", firebaseConfig.projectId);
    } else {
        const errorMsg = "Firebase 初始化失敗：配置缺少 projectId。請確認環境變數正確傳入。";
        console.error(errorMsg);
    }

} catch (error) {
    console.error("Firebase 服務初始化時發生例外錯誤：", error);
}

// 導出初始化後的實例
export { app, db, auth };

/**
 * 處理初始認證邏輯：使用自定義 Token 或匿名登入。
 *
 * @param {import('firebase/auth').Auth} authInstance Firebase Auth 實例。
 * @param {string | null} token 提供的自定義認證 Token。
 * @returns {Promise<void>}
 */
export async function performInitialAuth(authInstance, token) {
    if (!authInstance) {
        console.warn("Firebase Auth 實例未初始化 (auth 為 null)，跳過登入。");
        return;
    }
    try {
        if (token) {
            await signInWithCustomToken(authInstance, token);
            console.log("Firebase Auth: 使用自定義 Token 登入成功。");
        } else {
            await signInAnonymously(authInstance);
            console.log("Firebase Auth: 匿名登入成功。");
        }
    } catch (error) {
        console.error("Firebase Auth 登入失敗：", error);
    }
}

// 導出其他常用的 Firebase Auth 相關函式
export { onAuthStateChanged, firebaseSignOut as signOut };
