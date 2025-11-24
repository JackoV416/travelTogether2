import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'; // 從 firebase SDK 導入
import { auth, googleProvider, db } from './firebase'; // 從我們設定的 firebase.js 導入

import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';

// 假設這是所有頁面都要使用的 Auth Context (專業做法，但此處為簡化直接在 App.jsx 處理)
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽登入狀態的變化
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 清除監聽
    return () => unsubscribe();
  }, []);

  // Google 登入操作
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google 登入錯誤:", error);
    }
  };

  // 登出操作
  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
};


function App() {
  const { user, loading, login, logout } = useAuth();
  
  // * 以下保留原本的 trips 狀態管理 (仍使用 localStorage 模擬) *
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
    // ... (保留原本的 handleAddTrip 邏輯)
    const newTrip = { id: Date.now(), ...newTripData }; 
    setTrips([newTrip, ...trips]);
  };
  // ***************

  // 1. 如果正在載入狀態，顯示載入畫面
  if (loading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">載入中...</div>;
  }

  // 2. 如果用戶未登入，顯示登入提示畫面
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


  // 3. 用戶已登入，顯示主 App 畫面 (Routing)
  return (
    <BrowserRouter>
      <Routes>
        {/* Home 和 CreateTrip 現在可以知道當前登入用戶是誰了 */}
        <Route path="/" element={<Home trips={trips} user={user} logout={logout} />} /> 
        <Route path="/create" element={<CreateTrip onAddTrip={handleAddTrip} />} />
        <Route path="/trip/:id" element={<TripDetail user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
