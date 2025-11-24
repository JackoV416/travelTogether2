import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// 導入 Firestore 實時監聽、新增文檔和查詢相關函式
import { collection, onSnapshot, addDoc, setDoc, doc, query, orderBy } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 

// 導入頁面和組件
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';

// ----------------------------------------------------------------------
// 輔助函式：Google 身份驗證 Hook
// ----------------------------------------------------------------------
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Google 登入錯誤:', error);
        }
    };

    const logout = () => {
        signOut(auth);
    };

    return { user, loading, login, logout };
};

// ----------------------------------------------------------------------
// 應用程式主要組件
// ----------------------------------------------------------------------
function App() {
    const { user, loading, login, logout } = useAuth();
    const [trips, setTrips] = useState([]); // 儲存所有行程數據

    // *** 1. 用戶資料寫入 Firestore (新功能) ***
    useEffect(() => {
        if (user) {
            // 每次成功登入後，將用戶資料寫入 'users' 集合
            const userRef = doc(db, 'users', user.uid);
            setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                lastLogin: new Date().toISOString()
            }, { merge: true }); // 使用 merge: true 以免覆蓋其他資訊
        }
    }, [user]); 
    // **********************************


    // *** 2. 實時監聽 Firestore (Home 頁面數據來源) ***
    useEffect(() => {
        if (!user) {
            setTrips([]);
            return;
        }

        const q = query(
            collection(db, 'trips'),
            // 僅顯示該用戶擁有的行程（未來可擴展為包含該用戶的行程）
            orderBy('createdAt', 'desc') 
        );

        // 設置實時監聽
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tripsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);
        }, (error) => {
            console.error("Firestore 實時監聽錯誤:", error);
            // 可以在這裡處理錯誤顯示給用戶
        });

        return () => unsubscribe(); // 組件卸載時取消監聽
    }, [user]);
    // **********************************


    // 新增行程到 Firestore
    const addTrip = async (tripData) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'trips'), tripData);
        } catch (error) {
            console.error('新增行程錯誤:', error);
            alert('新增行程失敗。');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl font-medium">載入中...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-jp-bg p-4">
                <h1 className="text-4xl font-bold mb-6 text-gray-800">🧳 旅行小幫手</h1>
                <p className="text-lg mb-8 text-gray-600">請登入以管理您的旅行計畫和費用。</p>
                <button 
                    onClick={login} 
                    className="flex items-center space-x-3 bg-white border border-gray-300 p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google_%282015-2020%29.svg" alt="Google logo" className="w-6 h-6"/>
                    <span className="text-gray-700 font-medium">使用 Google 帳戶登入</span>
                </button>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Home 頁面：顯示所有行程 */}
                <Route 
                    path="/" 
                    element={<Home trips={trips} user={user} logout={logout} />} 
                />
                
                {/* 創建行程頁面 */}
                <Route 
                    path="/create" 
                    element={<CreateTrip onAddTrip={addTrip} user={user} />} 
                />
                
                {/* 行程詳情頁面 */}
                <Route 
                    path="/trip/:id" 
                    element={<TripDetail user={user} />} 
                />
                
                {/* 404
