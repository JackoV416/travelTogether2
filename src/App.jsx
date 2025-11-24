import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';

function App() {
  // 1. 初始化行程狀態 (嘗試從 localStorage 讀取，沒有則使用預設值)
  const [trips, setTrips] = useState(() => {
    const savedTrips = localStorage.getItem('myTrips');
    return savedTrips ? JSON.parse(savedTrips) : [
      { id: 1, title: '京都・大阪', startDate: '2024-11-24', endDate: '2024-11-30', budget: 100000 }
    ];
  });

  // 2. 當 trips 改變時，自動存回 localStorage (簡單的持久化)
  useEffect(() => {
    localStorage.setItem('myTrips', JSON.stringify(trips));
  }, [trips]);

  // 3. 新增行程的函式
  const handleAddTrip = (newTripData) => {
    const newTrip = {
      id: Date.now(), // 用時間戳記當作簡易 ID
      ...newTripData
    };
    setTrips([newTrip, ...trips]); // 把新行程加到最前面
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁：顯示行程列表 */}
        <Route path="/" element={<Home trips={trips} />} />
        
        {/* 建立頁：傳入新增函式 */}
        <Route path="/create" element={<CreateTrip onAddTrip={handleAddTrip} />} />
        
        {/* 詳細頁：根據 ID 顯示 */}
        <Route path="/trip/:id" element={<TripDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
