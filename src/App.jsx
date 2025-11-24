import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'; 
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'; 

import { auth, googleProvider, db } from './firebase'; 

// 確保組件導入路徑正確
import Home from './pages/Home'; 
import CreateTrip from './pages/CreateTrip'; 
import TripDetail from './pages/TripDetail'; 


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
  // *** Firestore 數據核心邏輯 ***
  const [trips, setTrips] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setTrips([]); 
        setIsDataLoading(false);
        return; 
    }

    const tripsCollection = collection(db, 'trips');
    const q = query(tripsCollection, orderBy('createdAt', 'desc'));

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

    return () => unsubscribe();
  }, [user]);

  // 函式：將新行程數據寫入 Firestore
  // 變更：接受 members 陣列
  const addTrip = async (newTripData) => {
      try {
          await addDoc(collection(db, 'trips'), {
              ...newTripData,
              // *** 新增的數據結構欄位 ***
              flights: [], // 用於功能 1 & 2
              expenses: [], // 用於功能 4 & 5
              members: newTripData.members, // 接受從 CreateTrip 傳入的成員列表
              // **********************
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

  if (loading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">身份驗證載入中...</div>;
  }

  if (user && isDataLoading) {
    return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">數據載入中...</div>;
  }

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home trips={trips} user={user} logout={logout} />} /> 
        <Route path="/create" element={<CreateTrip onAddTrip={addTrip} user={user} />} />
        <Route path="/trip/:id" element={<TripDetail user={user} trips={trips} />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
