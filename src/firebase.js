// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ 重要：請去 Firebase Console 複製你的設定並替換下面這一塊
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// DEBUG: Check if environment variables are loading
console.log('🔍 Firebase Config Debug:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ SET' : '❌ MISSING',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '❌ UNDEFINED',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '❌ UNDEFINED',
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);