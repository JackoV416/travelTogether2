// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ 重要：請去 Firebase Console 複製你的設定並替換下面這一塊
const firebaseConfig = {
  apiKey: "REACT_APP_FIREBASE_API_KEY",
  authDomain: "REACT_APP_FIREBASE_AUTH_DOMAIN",
  projectId: "REACT_APP_FIREBASE_PROJECT_ID",
  storageBucket: "REACT_APP_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REACT_APP_FIREBASE_APP_ID",
  measurementId: "REACT_APP_FIREBASE_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);