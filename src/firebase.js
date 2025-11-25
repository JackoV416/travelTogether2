import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// --- 1. 全域變數定義 (Canvas/Immersive 環境要求) ---
// __app_id 也是一個由平台提供的全域變數
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// ****** 關鍵部分：從全域變數 __firebase_config 讀取配置 ******
let firebaseConfig = {};
try {
    // 這一行讀取了平台提供的字串形式的 Firebase 配置
    if (typeof __firebase_config !== 'undefined' && __firebase_config) { 
        // 這一行將字串轉換為 JavaScript 物件，其中就包含 projectId、apiKey 等
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
    // 檢查配置是否成功讀取 (例如是否有 projectId)
    if (firebaseConfig.projectId) {
        // 使用讀取到的 firebaseConfig 物件來初始化 Firebase 應用程式
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
