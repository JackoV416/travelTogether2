import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// --- Canvas 環境變數後備 (僅用於本運行環境) ---
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 從全域變數讀取後備配置 (在標準專案中，您會刪除這整個區塊)
let _CANVAS_GLOBAL_CONFIG = {};
try {
    _CANVAS_GLOBAL_CONFIG = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
} catch (e) {
    console.error("錯誤: __firebase_config JSON 解析失敗。使用空配置。", e);
}


// --- 核心配置：從 process.env 讀取，並使用全域配置作為後備 ---
// **在您的實際專案中，如果 .env 設置正確，您只需使用 process.env.REACT_APP_...**

const firebaseConfig = {
    // 這是常見的 React 環境變數命名慣例 (REACT_APP_)
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || _CANVAS_GLOBAL_CONFIG.apiKey,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || _CANVAS_GLOBAL_CONFIG.authDomain,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || _CANVAS_GLOBAL_CONFIG.projectId,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || _CANVAS_GLOBAL_CONFIG.storageBucket,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || _CANVAS_GLOBAL_CONFIG.messagingSenderId,
    appId: process.env.REACT_APP_FIREBASE_APP_ID || _CANVAS_GLOBAL_CONFIG.appId,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || _CANVAS_GLOBAL_CONFIG.measurementId,
};

// 檢查配置是否包含最小必要欄位
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("警告: Firebase 配置缺少 'apiKey' 或 'projectId'。應用程式可能無法正常初始化。");
    console.error("Firebase Config:", firebaseConfig);
}
