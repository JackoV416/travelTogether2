import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'; 
// *** 新增 Firestore 相關導入 ***
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'; 

import { auth, googleProvider, db } from './firebase'; 

// 確保組件導入路徑正確
import Home from './pages/Home'; 
import CreateTrip from './pages/CreateTrip'; 
import TripDetail from './pages/TripDetail'; 

// useAuth Hook: 處理用戶登入/登出狀態
function useAuth() {
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
      console.error("Google 登入錯誤:", error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
          console.log("用戶關閉了登入視窗。");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
}


function App() {
  const { user, loading, login, logout } = useAuth();
  
  // ------------------------------------------------------------------
  // *** Firestore 數據核心邏輯 (步驟 2-C) ***
  const [trips, setTrips] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    // 檢查用戶是否存在
    if (!user) {
        setTrips([]); // 清空行程，避免看到前一個用戶的數據
        setIsDataLoading(false);
        return; 
    }

    // 1. 建立查詢：從 'trips' 集合中，依照建立時間排序
    const tripsCollection = collection(db, 'trips');
    const q = query(tripsCollection, orderBy('createdAt', 'desc'));

    // 2. 實時監聽數據變化 (onSnapshot)
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setTrips(tripsData);
        setIsDataLoading(false);
    }, (error) => {
        console.error("Firestore 數據監聽錯誤:", error);
        setIsDataLoading(false);
    });

    // 清理函數：當元件卸載或 user 改變時停止監聽
    return () => unsubscribe();
  }, [user]);

  // 函式：將新行程數據寫入 Firestore
  const addTrip = async (newTripData) => {
      try {
          // 使用 addDoc 寫入數據庫
          await addDoc(collection(db, 'trips'), {
              ...newTripData,
              ownerId: user.uid, 
              ownerName: user.displayName,
              collaborators: [user.email], 
              createdAt: serverTimestamp() 
          });
      } catch (error) {
          console.error("新增行程到 Firestore 錯誤:", error);
      }
  };
  // ------------------------------------------------------------------

  // 1. Auth 載入中
  if (loading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">身份驗證載入中...</div>;
  }

  // 2. 數據載入中 (已登入)
  if (user && isDataLoading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">數據載入中...</div>;
  }

  // 3. 未登入畫面
  if (!user) {
    return (
      <div className="min-h-screen bg-jp-bg flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">一起旅行 Travel Together</h1>
        <p className="mb-8">請使用 Google 帳戶登入，即可開始規劃與共同編輯行程。</p>
        <button 
          onClick={login}
          className="bg-black text-white p-3 rounded-full font-medium w-60 active:scale-95 transition-transform"
        >
          使用 Google 登入
        </button>
      </div>
    );
  }

  // 4. 已登入並載入完成，渲染主應用程式
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home trips={trips} user={user} logout={logout} />} /> 
        {/* 將 onAddTrip prop 設定為新的 addTrip 函式 */}
        <Route path="/create" element={<CreateTrip onAddTrip={addTrip} />} />
        <Route path="/trip/:id" element={<TripDetail user={user} trips={trips} />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
