import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase'; // 假設 auth 服務從這裡導入
import LogService from '../services/logService'; // <<< 導入 LogService

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 註冊功能
    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // 登入功能
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // 登出功能
    const logout = () => {
        return signOut(auth);
    };

    // Google 登入
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            
            if (currentUser) {
                // INFO Log: 記錄用戶登入
                LogService.info('User authenticated successfully.', { uid: currentUser.uid, email: currentUser.email });
            }
        });
        // 註銷監聽器
        return unsubscribe;
    }, []);

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        signInWithGoogle,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* 確保只有在載入完成後才渲染應用程式 */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
