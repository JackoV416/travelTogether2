import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 匯出主要的服務
export const auth = getAuth(app); // 用於登入
export const googleProvider = new GoogleAuthProvider(); // Google 登入專用
export const db = getFirestore(app); // 用於 Firestore 資料庫
