import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'; 
// (其他導入保持不變，確保 auth, googleProvider, db 都從 './firebase' 導入)
import { auth, googleProvider, db } from './firebase'; 

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'; 
import { auth, googleProvider, db } from './firebase';  // 注意這裡只需要 auth 和 provider

// 確保這三個頁面組件的路徑和名稱是正確的
import Home from './pages/Home'; // Home.jsx
import CreateTrip from './pages/CreateTrip'; // CreateTrip.jsx
import TripDetail from './pages/TripDetail'; // TripDetail.jsx

// ------------------------------------------------------------------
// useAuth Hook: 處理用戶登入狀態
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 預設為 true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

const login = async () => {
    try {
      // 在嘗試彈出 Google 登入視窗時
      await signInWithPopup(auth, googleProvider); 
    } catch (error) {
      // * 確保這裡有 try...catch *
      // 在瀏覽器控制台打印錯誤，但不會讓整個 App 崩潰
      console.error("Google 登入錯誤:", error.code, error.message);
      
      // 如果用戶手動關閉登入視窗，則跳出
      if (error.code === 'auth/popup-closed-by-user') {
          console.log("用戶關閉了登入視窗。");
      }
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
  
 // ------------------------------------------------------------------
// 核心數據邏輯：即時監聽 Firestore 行程
const [trips, setTrips] = useState([]);
const [isDataLoading, setIsDataLoading] = useState(true); // 新增數據載入狀態

useEffect(() => {
    // 檢查用戶是否存在 (理論上已經登入)
    if (!user) return; 

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
        setIsDataLoading(false); // 數據載入完成
    }, (error) => {
        console.error("Firestore 數據監聽錯誤:", error);
        setIsDataLoading(false);
    });

    // 清理函數：當元件卸載時停止監聽
    return () => unsubscribe();
}, [user]);

// 函式：將新行程寫入 Firestore
const addTrip = async (newTripData) => {
    try {
        await addDoc(collection(db, 'trips'), {
            ...newTripData,
            ownerId: user.uid, // 記錄創建者
            ownerName: user.displayName,
            collaborators: [user.email], // 預設創建者為協作者
            createdAt: serverTimestamp() // Firestore 時間戳記
        });
    } catch (error) {
        console.error("新增行程到 Firestore 錯誤:", error);
    }
};
// ------------------------------------------------------------------


  if (loading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">載入中...</div>;
  }
    // 原本的 loading 檢查現在用來檢查 Auth
    // 這裡新增一個數據載入檢查
  if (isDataLoading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">數據載入中...</div>;
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
 return user ? ( // <--- 新增這行：確保 user 存在 (非 null) 才渲染
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home trips={trips} user={user} logout={logout} />} /> 
      {/* 將原來的 handleAddTrip 替換為新的 addTrip 函式 */}
      <Route path="/create" element={<CreateTrip onAddTrip={addTrip} />} />
      <Route path="/trip/:id" element={<TripDetail user={user} trips={trips} />} /> 
    </Routes>
  </BrowserRouter>
) : null; // 如果 user 是 null 且未進入 if (!user) 區塊，則渲染 null (空白)，但這可以幫助我們隔離問題。
// 注意：理論上不會執行到這裡，但可以防止意外崩潰。
}

export default App;
