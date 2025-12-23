// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - using direct values for Vercel deployment
// Firebase API keys are public - protected by Firebase security rules
const firebaseConfig = {
  apiKey: "AIzaSyBGlEoflf06E_lBi7FHnU1k2xNRN3_QBes",
  authDomain: "travel-together2-byjamie.firebaseapp.com",
  projectId: "travel-together2-byjamie",
  storageBucket: "travel-together2-byjamie.firebasestorage.app",
  messagingSenderId: "270079374388",
  appId: "1:270079374388:web:93aeeb483945dbab7ac661",
  measurementId: "G-WB5T9XJ42E"
};

import { getStorage } from "firebase/storage";

import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with persistent cache (new API)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentLocalCache.tabManager,
    cacheSizeBytes: persistentLocalCache.cacheSizeBytes
  })
});

export const storage = getStorage(app);