// src/pages/TripDetail.jsx - 最終版 (新增通知中心)

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
    
    // ***********************************************
    // 1. 新增通知相關狀態
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(localStorage.getItem(`lastSeen_${tripId}_${user?.uid}`) || new Date(0).toISOString());
    // ***********************************************

    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    // ... (fetchTripData 保持不變, 但現在會讀取 trip.notifications 欄位) ...
    const fetchTripData = useCallback(async () => { /* ... */ }, [tripId, navigate, selectedDate]);
    useEffect(() => { fetchTripData(); }, [fetchTripData]);
    
    // ***********************************************
    // 2. 通知計算邏輯
    const calculateUnreadCount = useMemo(() => {
        if (!trip?.notifications) return 0;
        
        // 將上次查看時間轉換為 Date 物件
        const lastSeen = new Date(lastSeenNotificationTime);
        
        // 過濾出創建時間晚於上次查看時間的通知
        const unread = trip.notifications.filter(notification => {
            return new Date(notification.timestamp) > lastSeen;
        });
        
        return unread.length;
    }, [trip, lastSeenNotificationTime]);

    // 3. 標記通知為已讀
    const handleMarkNotificationsAsRead = () => {
        const now = new Date().toISOString();
        setLastSeenNotificationTime(now);
        // 將這個時間點儲存到瀏覽器，以便下次載入時使用
        localStorage.setItem(`lastSeen_${tripId}_${user?.uid}`, now);
        setIsNotificationDropdownOpen(false); // 關閉下拉選單
    };
    // ***********************************************


    // ... (所有 CRUD/DND/Expense 邏輯保持不變) ...

    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);
    const getCollaboratorName = (uid) => { /* ... */ };
    const filteredItinerary = useMemo(() => { /* ... */ }, [trip, selectedDate]);
    const onDragEnd = async (result) => { /* ... */ };
    const allTripDates = useMemo(() => { /* ... */ }, [trip]);

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <div className="flex space-x-3 items-center">
                    
                    {/* *********************************************** */}
                    {/* 通知鈴鐺 UI */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setIsNotificationDropdownOpen(prev => !prev);
                                // 如果是開啟下拉選單，自動標記為已讀
                                if (!isNotificationDropdownOpen) {
                                    handleMarkNotificationsAsRead();
                                }
                            }} 
                            className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
                            title="通知"
                        >
                            {/* 鈴鐺圖標 */}
                            🔔
                            {/* 未讀計數 */}
                            {calculateUnreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                                    {calculateUnreadCount}
                                </span>
                            )}
                        </button>

                        {/* 下拉選單內容 */}
                        {isNotificationDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-600">
                                <div className="p-3 font-bold border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">
                                    最新通知
                                </div>
                                <ul className="max-h-64 overflow-y-auto">
                                    {(trip.notifications || []).slice().reverse().map((n, index) => (
                                        <li key={index} 
                                            className={`p-3 text-sm border-b dark:border-gray-600 
                                                ${new Date(n.timestamp) > new Date(lastSeenNotificationTime) 
                                                ? 'bg-indigo-50 dark:bg-indigo-900/40 font-semibold' 
                                                : 'text-gray-600 dark:text-gray-300'}`}>
                                            <p>{n.message}</p>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(n.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                            </span>
                                        </li>
                                    ))}
                                    {(trip.notifications || []).length === 0 && (
                                        <li className="p-3 text-center text-gray-500 dark:text-gray-400">目前沒有通知。</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* *********************************************** */}

                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button onClick={handleDeleteTrip} className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm transition-colors active:scale-95">
                        刪除旅程
                    </button>
                </div>
            </header>

            {/* ... (Main Content 保持不變) ... */}
        </div>
    );
};

export default TripDetail;
