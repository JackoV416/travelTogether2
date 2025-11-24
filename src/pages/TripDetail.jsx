import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Coffee, Car, Navigation, CloudSun, User, Plane, ArrowLeft, MoreVertical } from 'lucide-react';

// 模擬資料 (之後會根據 ID 撈取)
const mockTripData = {
  title: "京都・大阪", 
  date: "2024.11.24 - 11.30",
  weather: "14°C 晴",
  budget: { current: 45200, total: 100000 },
  onlineUsers: 3
};

function TripDetail({ user }) {
  const navigate = useNavigate();
  const { id } = useParams(); // 獲取網址上的行程 ID

  // 檢查是否登入用戶有頭像
  const userPhoto = user?.photoURL || 'https://via.placeholder.com/150/EEEEEE/AAAAAA?text=U'; 

  // 小組件：底部導航按鈕
  const NavItem = ({ icon, label, active }) => (
    <button className={`flex flex-col items-center justify-center w-16 ${active ? 'text-black' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );


  return (
    <div className="min-h-screen bg-jp-bg text-jp-black font-sans pb-24 select-none">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-jp-bg/95 backdrop-blur px-4 py-4 flex justify-between items-center border-b border-gray-200/50">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1 -ml-1">
                <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
                <h1 className="text-lg font-bold tracking-widest">{mockTripData.title}</h1>
                <p className="text-[10px] text-gray-500 mt-0.5">{mockTripData.date}</p>
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
             {/* 協作人數顯示 */}
            <div className="flex -space-x-2 mr-2">
                <img className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={userPhoto} alt="Me" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                    +{mockTripData.onlineUsers}
                </div>
            </div>
            <MoreVertical size={20} className="text-gray-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-20 px-4 space-y-5">
        
        {/* 預算條 */}
        <section className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider">BUDGET</h3>
            <span className="text-sm font-bold font-mono">¥ {mockTripData.budget.current.toLocaleString()} / ¥ {mockTripData.budget.total.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-black h-1.5 rounded-full transition-all duration-500" style={{ width: `${(mockTripData.budget.current / mockTripData.budget.total) * 100}%` }}></div>
          </div>
        </section>

        {/* Day 1 Title */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-[10px] px-2 py-1 rounded">DAY 1</span>
            <h2 className="font-bold text-md">抵達與祇園漫步</h2>
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-1">
            <CloudSun size={14} />
            <span>{mockTripData.weather}</span>
          </div>
        </div>

        {/* 交通卡片 - 飛機/火車 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm relative border-l-[3px] border-gray-400">
           <button className="absolute top-4 right-4 bg-black text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
             <Navigation size={10} /> 導航
           </button>
           <div className="flex items-start gap-3">
             <div className="mt-1 text-gray-400"><Plane size={20} /></div>
             <div>
               <h3 className="font-bold text-sm">關西機場 → 京都車站</h3>
               <p className="text-xs text-gray-500 mt-1">HARUKA 特急列車 (新幹線)</p>
               <div className="mt-2 flex gap-2">
                 <span className="text-[10px] px-2 py-1 bg-gray-50 text-red-600 rounded">重要預約號: 442B</span>
                 <span className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded">13:15 發</span>
               </div>
             </div>
           </div>
        </div>

        {/* 景點卡片 (有圖片) */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-32 w-full bg-gray-200 relative">
            <img 
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80" 
              className="w-full h-full object-cover"
              alt="清水寺"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
               <h3 className="text-white font-bold text-lg">清水寺 (Kiyomizu-dera)</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              京都最古老的寺院。必看「清水舞台」與求姻緣的「地主神社」。
            </p>
            <div className="flex gap-2 text-[10px]">
              <span className="bg-red-50 text-red-500 px-2 py-1 rounded">必買伴手禮: 七味粉</span>
              <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded">景點故事: 舞台跳躍的傳說</span>
            </div>
          </div>
        </div>

        {/* 餐廳卡片 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-[3px] border-orange-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sm">菊乃井 無碍山房</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">日式甜點 / 懷石</p>
                </div>
                <button className="bg-black text-white h-8 w-8 rounded-full flex items-center justify-center text-xs">
                    <Navigation size={14} />
                </button>
            </div>
            <div className="mt-3 bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                <p className="text-[10px] text-gray-600">
                  <span className="font-bold text-orange-600">AI 推薦必吃：</span> 必點 <span className="font-bold">抹茶濃味聖代</span>。
                </p>
            </div>
        </div>

      </main>

      {/* Bottom Tab Bar (資訊分頁區) */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur border-t border-gray-100 pb-safe">
        <div className="flex justify-around items-center h-16">
           <NavItem icon={<MapPin size={20} />} label="行程" active />
           <NavItem icon={<Coffee size={20} />} label="美食" />
           <NavItem icon={<Car size={20} />} label="交通" />
           <NavItem icon={<User size={20} />} label="資訊/預算" /> {/* 資訊/預算專門分頁 */}
        </div>
      </nav>
    </div>
  );
}

export default TripDetail;
