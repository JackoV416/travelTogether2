// src/firebase.js - 從環境變量讀取配置

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ***********************************************
// 從環境變量讀取配置
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
// ***********************************************

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 導出服務
export const auth = getAuth(app);
export const db = getFirestore(app);

// 注意：如果您的專案使用其他 Firebase 服務（如 Storage），
// 請確保也在此處初始化並導出它們。
