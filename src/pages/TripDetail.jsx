// src/pages/TripDetail.jsx - 最終版本 (新增編輯權限鎖定)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'; 
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import AIGuideModal from '../components/AIGuideModal'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import ExpenseChart from '../components/ExpenseChart';
import { getDestinationTimeZone, getShortTimeZoneName } from '../utils/timeZoneMap'; 


// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('all'); 
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); 
    
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(localStorage.getItem(`lastSeen_${tripId}_${user?.uid}`) || new Date(0).toISOString());

    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    const fetchTripData = useCallback(async () => { /* ... */ }, [tripId, navigate, selectedDate]);
    useEffect(() => { fetchTripData(); }, [fetchTripData]);
    
    // ***********************************************
    // 1. 判斷使用者是否為 Owner
    const isOwner = useMemo(() => {
        return user?.uid === trip?.ownerUid;
    }, [user?.uid, trip?.ownerUid]);
    // ***********************************************


    const calculateUnreadCount = useMemo(() => { /* ... */ }, [trip, lastSeenNotificationTime]);
    const handleMarkNotificationsAsRead = () => { /* ... */ };

    const destinationTimeZone = useMemo(() => { /* ... */ }, [trip?.destination]);
    const formatTimeInTimeZone = useCallback((datetime, tzOverride = destinationTimeZone) => { /* ... */ }, [destinationTimeZone]);


    // ... (所有 CRUD/DND/Expense 邏輯保持不變 - 但這些函式在非 Owner 情況下，不應被調用) ...
    
    // ***********************************************
    // 2. 更新 handleDeleteTrip 
    const handleDeleteTrip = async () => {
        if (!isOwner) {
            alert('只有旅程創建者才能刪除整個旅程。');
            return;
        }
        if (window.confirm('確定要刪除整個旅程嗎？此操作不可逆！')) {
            try {
                await deleteDoc(doc(db, 'trips', tripId));
                navigate('/');
                alert('旅程已成功刪除。');
            } catch (error) {
                console.error('刪除旅程失敗:', error);
                alert('刪除旅程失敗。');
            }
        }
    };
    // ***********************************************

    // ... (其他 DND/Expense 邏輯保持不變) ...
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <div className="flex space-x-3 items-center">
                    {/* ... (通知鈴鐺 UI 保持不變) ... */}
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    
                    {/* 3. 只有 Owner 能看到刪除按鈕 */}
                    {isOwner && (
                        <button onClick={handleDeleteTrip} className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm transition-colors active:scale-95">
                            刪除旅程
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* 旅程概覽卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
                        {trip.destination}
                    </h1>
                    {destinationTimeZone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            時區: {getShortTimeZoneName(destinationTimeZone)}
                        </p>
                    )}
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {trip.startDate} - {trip.endDate} ({allTripDates.length}天)
                    </div>
                    {/* 顯示鎖定狀態 */}
                    {!isOwner && (
                        <p className="mt-3 text-sm font-semibold text-yellow-600 dark:text-yellow-400 p-2 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg">
                            🔒 您的權限為協作者，無法修改行程、航班和支出。
                        </p>
                    )}
                </div>

                {/* 費用追蹤與結算卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    {/* ... (圖表和結算結果保持不變) ... */}
                    
                    {/* 最近支出列表 (需修改刪除按鈕) */}
                    {/* ... (recent expenses mapping) ... */}
                    {/* 找到 handleDeleteExpense 附近的渲染邏輯，只有 isOwner 才顯示刪除按鈕 */}
                    {/* ... */}
                    <button onClick={() => setIsExpenseFormOpen(true)}
                        // 4. 只有 Owner 能新增支出
                        disabled={!isOwner} 
                        className={`w-full p-3 text-white font-bold rounded-lg transition-transform mt-2 ${
                            isOwner 
                                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95' 
                                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        }`}>
                        {isOwner ? '+ 新增支出' : '支出已鎖定'}
                    </button>
                </div>

                {/* 行程規劃卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (當地時間)
                        {/* 5. 只有 Owner 能新增行程 */}
                        {isOwner && (
                            <button onClick={() => setIsItineraryFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                + 新增行程
                            </button>
                        )}
                    </h2>
                    
                    {/* ... (日期選擇器 保持不變) ... */}

                    {/* 行程列表 - 修改編輯/刪除按鈕 */}
                    <DragDropContext onDragEnd={isOwner ? onDragEnd : () => {}}> 
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {filteredItinerary.length > 0 ? (
                                        filteredItinerary.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isOwner}> {/* 6. 非 Owner 禁用拖曳 */}
                                                {(provided) => (
                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-grab">
                                                        {/* ... (行程內容顯示保持不變) ... */}
                                                        <div className="flex space-x-2">
                                                            {/* 7. 只有 Owner 能編輯和刪除 */}
                                                            {isOwner ? (
                                                                <>
                                                                    <button onClick={() => { setEditingItineraryItem(item); setIsItineraryFormOpen(true); }} className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">編輯</button>
                                                                    <button onClick={() => handleDeleteItineraryItem(item.id)} className="text-red-500 hover:text-red-600 transition-colors text-sm">刪除</button>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500 text-sm">已鎖定</span>
                                                            )}
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            {selectedDate === 'all' ? '目前沒有行程項目。' : `這一天 (${selectedDate}) 沒有行程。`}
                                        </p>
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                
                {/* 航班資訊卡片 - 修改新增/編輯/刪除按鈕 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        ✈️ 航班資訊
                        {/* 8. 只有 Owner 能新增航班 */}
                        {isOwner && (
                            <button onClick={() => setIsFlightFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                + 新增航班
                            </button>
                        )}
                    </h2>
                    
                    {trip.flights && trip.flights.length > 0 ? (
                        <div className="space-y-4">
                            {trip.flights.map((flight) => (
                                <div key={flight.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-bold text-gray-800 dark:text-white">{flight.flightNumber}</span>
                                        <div className="space-x-2">
                                            {/* 9. 只有 Owner 能編輯和刪除航班 */}
                                            {isOwner ? (
                                                <>
                                                    <button onClick={() => handleEditFlight(flight)} className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">編輯</button>
                                                    <button onClick={() => handleDeleteFlight(flight.id)} className="text-red-500 hover:text-red-600 transition-colors text-sm">刪除</button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500 text-sm">已鎖定</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* ... (航班時間顯示保持不變) ... */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            尚未新增任何航班資訊。
                        </p>
                    )}
                </div>


                {/* ... (AI Guide Modal 保持不變) ... */}
            </main>
            
            {/* Modals 區域 - 只有 Owner 才能打開 */}
            {isOwner && isItineraryFormOpen && ( /* ... ItineraryForm ... */ )}
            {isOwner && isFlightFormOpen && ( /* ... FlightForm ... */ )}
            {isOwner && isExpenseFormOpen && ( /* ... ExpenseForm ... */ )}
        </div>
    );
};

export default TripDetail;
