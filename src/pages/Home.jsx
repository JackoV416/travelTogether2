// src/pages/Home.jsx - 儀表板優化，新增任務和通知數量顯示

import React from 'react';
import { useNavigate } from 'react-router-dom';
// 引入新的圖標：Bell 鈴鐺（通知）、CheckSquare 待辦事項
import { Plus, Calendar, ChevronRight, LogOut, User, Bell, CheckSquare } from 'lucide-react'; 

// 輔助組件：狀態資訊膠囊
const StatusPill = ({ icon, count, label }) => (
    <div className="flex items-center text-xs font-medium bg-gray-50 dark:bg-gray-700/50 p-2 rounded-full text-gray-700 dark:text-gray-300">
        {icon}
        <span className="ml-1 mr-1.5 font-semibold text-sm">
            {count > 99 ? '99+' : count}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);

// Home 元件現在接收 user 和 logout prop
function Home({ trips: originalTrips, user, logout }) { 
    const navigate = useNavigate();

    // 檢查是否登入用戶有頭像
    const userPhoto = user?.photoURL || 'https://via.placeholder.com/150/EEEEEE/AAAAAA?text=U'; 

    // --- 【模擬資料】 ---
    // 由於我們無法修改傳入的 trips prop，這裡暫時將數據「模擬」進去，以展示 UI 效果。
    // 在真實應用中，這些數據應從後端獲取並包含在 originalTrips 中。
    const trips = originalTrips.map((trip, index) => ({
        ...trip,
        // 模擬未完成待辦事項數量
        incompleteTasksCount: (index + 1) * 2, 
        // 模擬新通知數量
        newNotificationsCount: index % 2 === 0 ? 1 : 0, 
        // 模擬旅伴數量
        membersCount: 3,
        // 模擬預算（假設原始 trip.budget 是字串，這裡確保是數字）
        budget: parseInt(trip.budget || '100000', 10),
        // 模擬已用費用 (假設固定比例)
        usedBudget: parseInt(trip.budget || '100000', 10) * (index === 0 ? 0.35 : 0.6),
    }));
    // --- 【模擬資料結束】 ---

    return (
        <div className="min-h-screen bg-jp-bg dark:bg-gray-900 p-6 pb-24 transition-colors">
            <header className="mb-8 mt-2 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-jp-black dark:text-white">我的旅程</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hello, {user?.displayName || "用戶"}</p>
                </div>
                
                {/* 右上角用戶頭像與登出按鈕 */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={logout}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 active:scale-90 transition-transform"
                        title="登出"
                    >
                        <LogOut size={20} />
                    </button>
                    <img 
                        src={userPhoto} 
                        alt="User Profile" 
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md" 
                    />
                </div>
            </header>

            {/* 行程列表 */}
            <div className="space-y-4">
                {trips.map((trip) => {
                    // 計算預算進度
                    const budgetPercent = Math.min(100, (trip.usedBudget / trip.budget) * 100);

                    return (
                        <div 
                            key={trip.id}
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl active:scale-98 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-jp-black dark:text-white group-hover:text-indigo-600 transition-colors">{trip.title}</h3>
                                    <div className="flex items-center text-gray-400 text-xs mt-2 gap-1">
                                        <Calendar size={14} className="text-indigo-400" />
                                        <span className="font-semibold">{trip.startDate} - {trip.endDate}</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            
                            {/* 預算進度條小預覽 */}
                            <div className="mt-6">
                                <div className="flex justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    <span>預算使用進度</span>
                                    <span>已用 ¥ {Math.round(trip.usedBudget).toLocaleString()} / 總預算 ¥ {trip.budget.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                    <div 
                                        className="bg-jp-accent h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${budgetPercent}%` }}
                                    ></div> 
                                </div>
                            </div>

                            {/* --- 新增狀態列：任務和通知 --- */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
                                <div className="flex gap-2">
                                    {/* 待辦事項狀態 */}
                                    <StatusPill 
                                        icon={<CheckSquare size={14} className="text-blue-500" />}
                                        count={trip.incompleteTasksCount}
                                        label="待辦事項"
                                    />
                                    
                                    {/* 新通知狀態 */}
                                    <StatusPill 
                                        icon={<Bell size={14} className="text-red-500" />}
                                        count={trip.newNotificationsCount}
                                        label="新通知"
                                    />
                                </div>

                                {/* 旅伴數量 */}
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-full">
                                    <User size={14} className="mr-1 text-green-500" />
                                    <span className="font-semibold">{trip.membersCount}</span>
                                    <span className="ml-1">位旅伴</span>
                                </div>
                            </div>
                            {/* --- 狀態列結束 --- */}
                        </div>
                    );
                })}

                {/* 若無行程顯示提示 */}
                {trips.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 mt-20 text-sm">
                        尚未建立任何行程，點擊右下角按鈕新增
                    </div>
                )}
            </div>

            {/* 懸浮新增按鈕 (FAB) */}
            <button 
                onClick={() => navigate('/create')}
                className="fixed bottom-8 right-6 w-14 h-14 bg-black dark:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-50 hover:bg-indigo-700 dark:hover:bg-indigo-700"
            >
                <Plus size={24} />
            </button>
        </div>
    );
}

export default Home;
