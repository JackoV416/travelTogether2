// src/App.jsx

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, googleAuthProvider, signInWithPopup, db } from './firebase'; // 確保路徑正確
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import LandingPage from './pages/LandingPage'; // 引入登陸頁

// ----------------------------------------------------------------------
// 登入/登出和用戶狀態管理 Hook
// ----------------------------------------------------------------------
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // 如果用戶登入，檢查並儲存用戶資料到 Firestore (若不存在)
                const userRef = doc(db, 'users', currentUser.uid);
                await setDoc(userRef, {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                }, { merge: true }); // 使用 merge: true 避免覆蓋現有資料

                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
        } catch (error) {
            console.error('Google 登入錯誤:', error);
            // 處理登入彈窗關閉等情況
            if (error.code === 'auth/popup-closed-by-user') {
                alert('您已取消 Google 登入。');
            } else {
                alert(`登入失敗: ${error.message}`);
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return { user, loading, login, logout };
};

// ----------------------------------------------------------------------
// 主應用程式組件
// ----------------------------------------------------------------------
function App() {
    // 獲取用戶狀態和認證函式
    const { user, loading, login, logout } = useAuth();
    
    // 行程資料狀態
    const [trips, setTrips] = useState([]);

    // 獲取行程資料
    const fetchTrips = async (userId) => {
        if (!userId) return;
        try {
            const tripsCollectionRef = collection(db, 'trips');
            const data = await getDocs(tripsCollectionRef);
            
            // 過濾出屬於該用戶或他參與的行程
            const tripList = data.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(trip => 
                    trip.ownerId === userId || 
                    trip.members.some(member => member.id === userId)
                );
            setTrips(tripList);
        } catch (error) {
            console.error('獲取行程列表錯誤:', error);
        }
    };
    
    useEffect(() => {
        if (user) {
            fetchTrips(user.uid);
        } else {
            setTrips([]);
        }
    }, [user]);


    // 新增行程到 Firestore
    const handleAddTrip = async (newTripData) => {
        try {
            const docRef = await addDoc(collection(db, 'trips'), newTripData);
            const savedTrip = { id: docRef.id, ...newTripData };
            setTrips(prevTrips => [...prevTrips, savedTrip]);
            return savedTrip;
        } catch (error) {
            console.error('新增行程錯誤:', error);
            alert('新增行程失敗。');
        }
    };


    if (loading) {
        return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-white text-xl">載入中...</div>;
    }

    // 判斷是否顯示登陸頁
    if (!user) {
        return <LandingPage login={login} />;
    }

    return (
        <Router>
            <div className="min-h-screen bg-jp-bg">
                <Routes>
                    <Route 
                        path="/" 
                        element={<Home trips={trips} logout={logout} user={user} />} 
                    />
                    <Route 
                        path="/create" 
                        element={<CreateTrip onAddTrip={handleAddTrip} user={user} />} 
                    />
                    <Route 
                        path="/trip/:id" 
                        element={<TripDetail user={user} fetchTrips={fetchTrips} />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
