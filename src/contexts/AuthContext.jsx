import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app'; // 直接靜態匯入 initializeApp

// --- 全域變數和 Firebase 設定 ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 在檔案頂層宣告，用於保存 Firebase 實例，避免在 Context 內重複初始化
let authInstance = null;
let dbInstance = null;
let isFirebaseInitialized = false;

// 建立 Context
const AuthContext = createContext({
    currentUser: null,
    userId: null,
    authReady: false,
    db: null, // 預設為 null
    auth: null  // 預設為 null
});

// 建立 Hook 供子組件使用
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider Component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [loading, setLoading] = useState(true);

    // 在 useEffect 中處理 Firebase 初始化和認證
    useEffect(() => {
        const initializeFirebaseAndAuth = async () => {
            // 1. 檢查是否已經初始化
            if (isFirebaseInitialized) {
                // 如果已經初始化，只需設定監聽器
                setLoading(false); 
                return;
            }

            try {
                // 2. 初始化 Firebase 應用程式
                const app = initializeApp(firebaseConfig);
                authInstance = getAuth(app);
                dbInstance = getFirestore(app);
                isFirebaseInitialized = true;
                
                // 3. 設定認證狀態變更監聽器
                const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                    if (user) {
                        setCurrentUser(user);
                    } else {
                        // 如果登出，根據是否有 Custom Token 來決定登入方式
                        if (initialAuthToken) {
                            try {
                                await signInWithCustomToken(authInstance, initialAuthToken);
                            } catch (error) {
                                console.error("Error signing in with custom token:", error);
                                await signInAnonymously(authInstance); // Custom Token 失敗，改為匿名登入
                            }
                        } else {
                            await signInAnonymously(authInstance); // 沒有 Custom Token，匿名登入
                        }
                    }
                    
                    // 首次認證完成後，設定 authReady 和 loading
                    if (!authReady) {
                        setAuthReady(true);
                    }
                    setLoading(false);
                });
                
                // 返回清理函數
                return unsubscribe;

            } catch (error) {
                console.error("Firebase initialization or authentication failed:", error);
                setAuthReady(false);
                setLoading(false);
            }
        };

        initializeFirebaseAndAuth();

        // 清理函數 (當元件卸載時，如果 onAuthStateChanged 監聽器已設定，則取消監聽)
        return () => {
            // 這裡不需要額外的清理，因為 onAuthStateChanged 返回的 unsubscribe 已經處理了
        };
    }, []); // 空陣列確保只在元件掛載時執行一次

    const value = {
        currentUser,
        userId: currentUser?.uid,
        authReady,
        db: dbInstance,
        auth: authInstance
    };

    return (
        <AuthContext.Provider value={value}>
            {/* 確保只有在認證載入完成後才渲染應用程式 */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 匯出元件
export default AuthContext;

