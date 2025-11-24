import { initializeApp } from 'firebase/app';
// 引入 Authentication 服務和 Google 登入提供者
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; 
// 引入 Firestore 服務
import { getFirestore } from 'firebase/firestore'; 

// TODO: 請用你的 Firebase 專案設定替換下方內容
const firebaseConfig = {
  apiKey: "AIzaSyBGlEoflf06E_lBi7FHnU1k2xNRN3_QBes",
  authDomain: "travel-together2-byjamie.firebaseapp.com",
  projectId: "travel-together2-byjamie",
  storageBucket: "travel-together2-byjamie.firebasestorage.app",
  messagingSenderId: "270079374388",
  appId: "1:270079374388:web:93aeeb483945dbab7ac661",
  measurementId: "G-WB5T9XJ42E"
};

// 1. 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 2. 匯出所需的服務
export const auth = getAuth(app); // 認證服務
export const googleAuthProvider = new GoogleAuthProvider(); // Google 登入提供者
export const db = getFirestore(app); // Firestore 資料庫

// 3. 匯出 Auth 相關函式供 App.jsx 和其他地方使用
export { signInWithPopup, signOut }; 
