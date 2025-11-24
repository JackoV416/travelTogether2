// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 

// =========================================================================
// !! 請用 Firebase 控制台複製的內容替換整個 firebaseConfig 變數 !!
// =========================================================================
const firebaseConfig = {
    // !! 請用您正確的設定替換這裡的註釋 !!
  apiKey: "AIzaSyBGlEoflf06E_lBi7FHnU1k2xNRN3_QBes",
  authDomain: "travel-together2-byjamie.firebaseapp.com",
  projectId: "travel-together2-byjamie",
  storageBucket: "travel-together2-byjamie.firebasestorage.app",
  messagingSenderId: "270079374388",
  appId: "1:270079374388:web:93aeeb483945dbab7ac661",
  measurementId: "G-WB5T9XJ42E"
};
// =========================================================================


// 1. 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 2. 匯出所需的服務
export const auth = getAuth(app); 
export const googleAuthProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app); 

// 3. 匯出 Auth 相關函式 (包含 onAuthStateChanged 解決 App.jsx 的依賴)
export { signInWithPopup, signOut, onAuthStateChanged };
