import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronRight } from 'lucide-react';

function Home({ trips }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-jp-bg p-6 pb-24">
      <header className="mb-8 mt-2">
        <h1 className="text-2xl font-bold tracking-widest text-jp-black">我的旅程</h1>
        <p className="text-xs text-gray-500 mt-1">Travel Together</p>
      </header>

      {/* 行程列表 */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div 
            key={trip.id}
            onClick={() => navigate(`/trip/${trip.id}`)}
            className="bg-white rounded-2xl p-5 shadow-sm active:scale-98 transition-transform cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-jp-black">{trip.title}</h3>
                <div className="flex items-center text-gray-400 text-xs mt-2 gap-1">
                  <Calendar size={12} />
                  <span>{trip.startDate} - {trip.endDate}</span>
                </div>
              </div>
              <ChevronRight className="text-gray-300" />
            </div>
            
            {/* 預算進度條小預覽 */}
            <div className="mt-6">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>預算</span>
                <span>¥ {parseInt(trip.budget).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-jp-accent/50 h-1 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        ))}

        {/* 若無行程顯示提示 */}
        {trips.length === 0 && (
            <div className="text-center text-gray-400 mt-20 text-sm">
                尚未建立任何行程
            </div>
        )}
      </div>

      {/* 懸浮新增按鈕 (FAB) */}
      <button 
        onClick={() => navigate('/create')}
        className="fixed bottom-8 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default Home;

2. src/pages/CreateTrip.jsx (建立行程頁)
這裡加入了預算設定欄位。
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

function CreateTrip({ onAddTrip }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    budget: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) return;
    
    // 呼叫 App.jsx 傳下來的新增函式
    onAddTrip(formData);
    navigate('/'); // 回到首頁
  };

  return (
    <div className="min-h-screen bg-white text-jp-black">
      {/* 頂部導航 */}
      <header className="px-6 py-4 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">建立新旅程</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
        
        {/* 目的地 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 tracking-wider">目的地 / 標題</label>
          <input 
            type="text" 
            placeholder="例如：東京五天四夜"
            className="w-full text-xl font-bold border-b border-gray-200 py-2 focus:outline-none focus:border-black placeholder:text-gray-300"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        {/* 日期選擇 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 tracking-wider">開始日期</label>
            <input 
              type="date" 
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-black bg-transparent"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 tracking-wider">結束日期</label>
            <input 
              type="date" 
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-black bg-transparent"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
        </div>

        {/* 預算設定 */}
        <div className="space-y-2 pt-4">
          <label className="text-xs font-bold text-gray-400 tracking-wider">總預算 (JPY)</label>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">¥</span>
            <input 
              type="number" 
              placeholder="100000"
              className="w-full text-3xl font-mono border-b border-gray-200 py-2 focus:outline-none focus:border-black placeholder:text-gray-200"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>
        </div>

        {/* 儲存按鈕 */}
        <button 
          type="submit"
          className="w-full bg-black text-white py-4 rounded-full font-bold mt-12 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-gray-200"
        >
          <Save size={18} />
          <span>建立行程</span>
        </button>

      </form>
    </div>
  );
}

export default CreateTrip;

3. src/pages/TripDetail.jsx
這其實就是你原本的 App.jsx 內容，但我們稍微修改一下，讓它能接收路由參數 (雖然這裡我們先用模擬資料，不真正讀取 ID)。
(請將你原本 App.jsx 的內容複製進來，並做以下小修改)：
 * 把元件名稱從 App 改為 TripDetail。
 * 加入 useNavigate 讓它可以點擊左上角返回首頁。
<!-- end list -->
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 新增 useParams
import { MapPin, Coffee, Car, Navigation, CloudSun, User, Plane, ArrowLeft } from 'lucide-react'; // 新增 ArrowLeft

// 模擬資料 (之後會根據 ID 撈取)
const mockTripData = {
  title: "京都・大阪", // 這裡應該動態顯示
  date: "2024.11.24 - 11.30",
  weather: "14°C 晴",
  budget: { current: 45200, total: 100000 },
  onlineUsers: 3
};

function TripDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // 獲取網址上的 ID
  const [user, setUser] = useState(null); 

  // ... 這裡保留你原本的 handleLogin 和其他邏輯 ...

  return (
    <div className="min-h-screen bg-jp-bg text-jp-black font-sans pb-24 select-none">
      
      {/* Header 修改：加入返回按鈕 */}
      <header className="fixed top-0 w-full z-50 bg-jp-bg/95 backdrop-blur px-4 py-4 flex justify-between items-center border-b border-gray-200/50">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1 -ml-1">
                <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
                {/* 這裡應該顯示動態標題，目前先用 Mock */}
                <h1 className="text-lg font-bold tracking-widest">{mockTripData.title}</h1>
                <p className="text-[10px] text-gray-500 mt-0.5">{mockTripData.date}</p>
            </div>
        </div>
        
        {/* ... 保留原本的右側協作頭像 ... */}
        <div className="flex items-center space-x-3">
             {/* 請保留原本的 User Icon 程式碼 */}
             <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                +{mockTripData.onlineUsers}
              </div>
        </div>
      </header>

      {/* ... 保留原本的 Main Content 和 Nav ... */}
      <main className="mt-20 px-4 space-y-5">
           {/* 為了節省篇幅，請保留你原本的卡片代碼 */}
           {/* 預算條、Day 1、交通卡片、景點卡片、餐廳卡片 */}
           <section className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider">BUDGET</h3>
                <span className="text-sm font-bold font-mono">¥ {mockTripData.budget.current.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-black h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </section>
            
            {/* 範例內容... */}
            <div className="text-center py-10 text-gray-400">
               (這裡是 ID: {id} 的行程詳細內容)
            </div>
      </main>

       {/* Bottom Tab Bar (保留) */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur border-t border-gray-100 pb-safe">
        <div className="flex justify-around items-center h-16">
           <button className="flex flex-col items-center justify-center w-16 text-black">
                <MapPin size={20} />
                <span className="text-[10px] font-medium mt-1">行程</span>
           </button>
           {/* 其他按鈕... */}
        </div>
      </nav>
    </div>
  );
}

export default TripDetail;
