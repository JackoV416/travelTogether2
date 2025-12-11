// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with fallback for production
// Note: Firebase API keys are meant to be public - they're protected by Firebase security rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGlEoflf06E_lBi7FHnU1k2xNRN3_QBes",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "travel-together2-byjamie.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "travel-together2-byjamie",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "travel-together2-byjamie.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "270079374388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:270079374388:web:93aeeb483945dbab7ac661",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WB5T9XJ42E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);