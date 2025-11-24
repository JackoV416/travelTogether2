// src/firebase.js

import { initializeApp } from 'firebase/app';
// 引入 Authentication 服務和需要的函式
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; 
// 引入 Firestore 服務
import { getFirestore } from 'firebase/firestore'; 

// TODO: 請用你的 Firebase 專案設定替換下方內容 (保持不變)
const firebaseConfig = {
    // ... 您的 Firebase 設定內容 ...
};

// 1. 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 2. 匯出所需的服務
export const auth = getAuth(app); // 認證服務
export const googleAuthProvider = new GoogleAuthProvider(); // Google 登入提供者
export const db = getFirestore(app); // Firestore 資料庫

// 3. 匯出 Auth 相關函式供 App.jsx 和其他地方使用 (關鍵修正！)
export { signInWithPopup, signOut };
