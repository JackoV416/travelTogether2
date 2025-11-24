import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronRight, LogOut, User } from 'lucide-react';

// Home 元件現在接收 user 和 logout prop
function Home({ trips, user, logout }) { 
  const navigate = useNavigate();

  // 檢查是否登入用戶有頭像
  const userPhoto = user?.photoURL || 'https://via.placeholder.com/150/EEEEEE/AAAAAA?text=U'; 

  return (
    <div className="min-h-screen bg-jp-bg p-6 pb-24">
      <header className="mb-8 mt-2 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-jp-black">我的旅程</h1>
          <p className="text-xs text-gray-500 mt-1">Hello, {user?.displayName || "用戶"}</p>
        </div>
        
        {/* 右上角用戶頭像與登出按鈕 */}
        <div className="flex items-center gap-3">
          <button 
             onClick={logout}
             className="p-2 rounded-full hover:bg-gray-100 text-gray-500 active:scale-90 transition-transform"
             title="登出"
          >
            <LogOut size={20} />
          </button>
          <img 
            src={userPhoto} 
            alt="User Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-md" 
          />
        </div>
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
                {/* 簡單計算進度，這裡假設總預算是 100000 */}
                <div className="bg-jp-accent/50 h-1 rounded-full" style={{ width: `${Math.min(100, (20000 / trip.budget) * 100)}%` }}></div> 
              </div>
            </div>
          </div>
        ))}

        {/* 若無行程顯示提示 */}
        {trips.length === 0 && (
            <div className="text-center text-gray-400 mt-20 text-sm">
                尚未建立任何行程，點擊右下角按鈕新增
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
