// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// 確保全域變數存在
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 設定日誌級別 (用於調試)
setLogLevel('debug');

/**
 * 處理初始認證邏輯：使用自定義 Token 或匿名登入。
 */
async function handleInitialAuth() {
    try {
        if (initialAuthToken) {
            // 使用提供的自定義 token 登入
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            // 如果 token 不存在，則匿名登入
            await signInAnonymously(auth);
        }
        console.log("Firebase Auth initialized successfully.");
    } catch (error) {
        console.error("Firebase Auth initialization failed:", error);
    }
}

// 在應用程式啟動時執行初始認證
handleInitialAuth();

export { app, db, auth, onAuthStateChanged, firebaseSignOut as signOut, appId };
