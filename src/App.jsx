import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'; 
import { auth, googleProvider } from './firebase'; // 注意這裡只需要 auth 和 provider

// 確保這三個頁面組件的路徑和名稱是正確的
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';

// ------------------------------------------------------------------
// useAuth Hook: 處理用戶登入狀態
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google 登入錯誤:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
};
// ------------------------------------------------------------------


function App() {
  const { user, loading, login, logout } = useAuth();
  
  // *** 臨時的 trips 狀態管理 (之後會替換為 Firestore) ***
  const [trips, setTrips] = useState(() => {
    const savedTrips = localStorage.getItem('myTrips');
    return savedTrips ? JSON.parse(savedTrips) : [
      { id: 1, title: '京都・大阪', startDate: '2024-11-24', endDate: '2024-11-30', budget: 100000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('myTrips', JSON.stringify(trips));
  }, [trips]);

  const handleAddTrip = (newTripData) => {
    const newTrip = { id: Date.now(), ...newTripData }; 
    setTrips([newTrip, ...trips]);
  };
  // ***************************************************************

  if (loading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">載入中...</div>;
  }

  // 未登入畫面
  if (!user) {
    return (
      <div className="min-h-screen bg-jp-bg flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">一起旅行 Travel Together</h1>
        <p className="text-center text-gray-500 mb-8">請使用 Google 帳戶登入，即可開始規劃和共同編輯行程。</p>
        <button 
          onClick={login}
          className="bg-black text-white px-6 py-3 rounded-full font-medium active:scale-95 transition-transform shadow-lg"
        >
          使用 Google 登入
        </button>
      </div>
    );
  }

  // 已登入畫面
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home trips={trips} user={user} logout={logout} />} /> 
        <Route path="/create" element={<CreateTrip onAddTrip={handleAddTrip} />} />
        {/* 注意：這裡我們使用 trips 數據來查找詳情，因為還沒用 Firestore */}
        <Route path="/trip/:id" element={<TripDetail user={user} trips={trips} />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
