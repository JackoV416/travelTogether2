// src/pages/TripDetail.jsx - 最終版本 (新增時區轉換與顯示)

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
// 引入時區工具
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
    
    // ... (通知計算邏輯 保持不變) ...
    const calculateUnreadCount = useMemo(() => { /* ... */ }, [trip, lastSeenNotificationTime]);
    const handleMarkNotificationsAsRead = () => { /* ... */ };


    // ***********************************************
    // 1. 計算目的地時區
    const destinationTimeZone = useMemo(() => {
        if (!trip?.destination) return null;
        return getDestinationTimeZone(trip.destination);
    }, [trip?.destination]);
    
    // 2. 輔助函式：獲取特定時區的時間字串
    // 該函式現在可選地接受一個覆蓋的時區 (tzOverride)
    const formatTimeInTimeZone = useCallback((datetime, tzOverride = destinationTimeZone) => {
        // 使用覆蓋的時區或目的地時區
        const targetTimeZone = tzOverride || destinationTimeZone;
        if (!datetime || !targetTimeZone) return datetime; 
        
        try {
            // 由於行程和航班時間是儲存為日期時間字串 (如 2025-11-25T12:00:00.000Z 或 yyyy-mm-dd hh:mm)，
            // 這裡將其轉換為 Date 物件，然後用 toLocaleTimeString 依據 targetTimeZone 格式化。
            const date = new Date(datetime); 
            // 如果只有 "hh:mm" 格式 (如 ItineraryForm)，需要補齊日期才能創建有效的 Date 物件。
            // 為了簡化，我們假設儲存的都是有效日期時間字串。
            
            return date.toLocaleTimeString('zh-TW', { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: targetTimeZone,
                timeZoneName: 'short' // 顯示時區縮寫 (e.g., JST, CST)
            });
        } catch (e) {
            console.error("時間格式化錯誤:", e);
            return datetime;
        }
    }, [destinationTimeZone]);
    // ***********************************************


    // ... (所有 CRUD/DND/Expense 邏輯保持不變) ...
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);
    const getCollaboratorName = (uid) => { /* ... */ };
    const filteredItinerary = useMemo(() => { /* ... */ }, [trip, selectedDate]);
    const onDragEnd = async (result) => { /* ... */ };
    const allTripDates = useMemo(() => { /* ... */ }, [trip]);
    const handleDeleteTrip = async () => { /* ... */ };
    const handleDeleteItineraryItem = async (id) => { /* ... */ };
    const handleEditItineraryItem = async (updatedItem) => { /* ... */ };
    const handleAddItineraryItem = async (newItem) => { /* ... */ };
    const handleSaveFlight = async (flightData) => { /* ... */ };
    const handleEditFlight = (flight) => { /* ... */ };
    const handleDeleteFlight = async (id) => { /* ... */ };
    const handleAddExpense = async () => { /* ... */ };
    const handleDeleteExpense = async (id) => { /* ... */ };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                {/* ... (Header & 通知鈴鐺 UI 保持不變) ... */}
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* 旅程概覽卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
                        {trip.destination}
                    </h1>
                    {/* 顯示時區名稱 */}
                    {destinationTimeZone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            時區: {getShortTimeZoneName(destinationTimeZone)}
                        </p>
                    )}
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {trip.startDate} - {trip.endDate} ({allTripDates.length}天)
                    </div>
                    {/* ... (協作者列表) ... */}
                </div>

                {/* ... (費用追蹤與結算卡片 保持不變) ... */}

                {/* ================================================================= */}
                {/* 行程規劃卡片 - 使用當地時間顯示 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (當地時間)
                        <button onClick={() => setIsItineraryFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                            + 新增行程
                        </button>
                    </h2>
                    
                    {/* 日期選擇器 保持不變 */}
                    {/* ... */}

                    {/* 行程列表 */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {filteredItinerary.length > 0 ? (
                                        filteredItinerary.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-grab">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400">
                                                                {item.category}
                                                            </div>
                                                            <div className="font-bold text-gray-800 dark:text-white truncate">
                                                                {item.activity}
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                                                <span>{item.date}</span>
                                                                <span className="font-mono text-xs p-0.5 rounded-sm bg-gray-200 dark:bg-gray-600">
                                                                    {/* 這裡的 item.time 假設是當地時間，現在加上時區顯示 */}
                                                                    {item.time} ({getShortTimeZoneName(destinationTimeZone)})
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => handleEditItineraryItem(item)} className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">編輯</button>
                                                            <button onClick={() => handleDeleteItineraryItem(item.id)} className="text-red-500 hover:text-red-600 transition-colors text-sm">刪除</button>
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
                
                {/* ================================================================= */}
                /* 航班資訊卡片 - 使用起飛/抵達城市各自的時區 */
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        ✈️ 航班資訊
                        <button onClick={() => setIsFlightFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                            + 新增航班
                        </button>
                    </h2>
                    
                    {trip.flights && trip.flights.length > 0 ? (
                        <div className="space-y-4">
                            {trip.flights.map((flight) => (
                                <div key={flight.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-bold text-gray-800 dark:text-white">{flight.flightNumber}</span>
                                        <div className="space-x-2">
                                            <button onClick={() => handleEditFlight(flight)} className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">編輯</button>
                                            <button onClick={() => handleDeleteFlight(flight.id)} className="text-red-500 hover:text-red-600 transition-colors text-sm">刪除</button>
                                        </div>
                                    </div>
                                    
                                    {/* 起飛資訊 */}
                                    <div className="mb-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-300">起飛: {flight.departureCity} ({flight.departureAirport})</p>
                                        <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {/* 使用起飛城市的時區格式化時間 */}
                                            {formatTimeInTimeZone(flight.departureTime, getDestinationTimeZone(flight.departureCity))}
                                        </p>
                                    </div>
                                    
                                    {/* 抵達資訊 */}
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">抵達: {flight.arrivalCity} ({flight.arrivalAirport})</p>
                                        <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {/* 使用抵達城市的時區格式化時間 */}
                                            {formatTimeInTimeZone(flight.arrivalTime, getDestinationTimeZone(flight.arrivalCity))}
                                        </p>
                                    </div>
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
            
            {/* Modals 區域 保持不變 */}
            {/* ... */}
        </div>
    );
};

export default TripDetail;
