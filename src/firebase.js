// src/firebase.js
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Suppress noisy Firestore warnings in development (HMR causes benign lock contention)
if (import.meta.env.DEV) {
  setLogLevel('error'); // Only show errors, not warnings
}

// Unified configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGlEoflf06E_lBi7FHnU1k2xNRN3_QBes",
  authDomain: "travel-together2-byjamie.firebaseapp.com",
  projectId: "travel-together2-byjamie",
  storageBucket: "travel-together2-byjamie.firebasestorage.app",
  messagingSenderId: "270079374388",
  appId: "1:270079374388:web:93aeeb483945dbab7ac661",
  measurementId: "G-WB5T9XJ42E"
};

// Singleton App Initialization for HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Initialize Firestore with robust Singleton + Multi-tab support
// Use globalThis to persist instance across HMR reloads
let db;

if (globalThis._firestore_db) {
  // Reuse existing instance (HMR or already initialized)
  db = globalThis._firestore_db;
} else {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    globalThis._firestore_db = db;
    // Firestore initialized (Multi-tab Persistence Enabled)
  } catch (error) {
    // Silently handle known HMR/multi-tab lock scenarios
    db = getFirestore(app);
    globalThis._firestore_db = db;
    // No console warning - this is expected during HMR
  }
}

export { db };