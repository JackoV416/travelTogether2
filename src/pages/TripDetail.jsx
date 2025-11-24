// src/pages/TripDetail.jsx - 最終版本 (新增行程搜尋功能)

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
    
    // ... (通知, 編輯狀態等保持不變) ...
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(localStorage.getItem(`lastSeen_${tripId}_${user?.uid}`) || new Date(0).toISOString());

    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    // ***********************************************
    // 1. 新增搜尋狀態
    const [searchQuery, setSearchQuery] = useState('');
    // ***********************************************

    const fetchTripData = useCallback(async () => { /* ... */ }, [tripId, navigate, selectedDate]);
    useEffect(() => { fetchTripData(); }, [fetchTripData]);
    
    // ... (isOwner, 通知計算邏輯, 時區計算邏輯, CRUD 邏輯保持不變) ...
    
    const isOwner = useMemo(() => { /* ... */ }, [user?.uid, trip?.ownerUid]);
    const calculateUnreadCount = useMemo(() => { /* ... */ }, [trip, lastSeenNotificationTime]);
    const handleMarkNotificationsAsRead = () => { /* ... */ };

    const destinationTimeZone = useMemo(() => { /* ... */ }, [trip?.destination]);
    const formatTimeInTimeZone = useCallback((datetime, tzOverride = destinationTimeZone) => { /* ... */ }, [destinationTimeZone]);
    
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);
    const getCollaboratorName = (uid) => { /* ... */ };
    const allTripDates = useMemo(() => { /* ... */ }, [trip]);

    // ***********************************************
    // 2. 更新行程篩選邏輯 (新增全文檢索)
    const filteredItinerary = useMemo(() => {
        if (!trip || !trip.itinerary) return [];
        
        // 處理搜索關鍵字
        const query = searchQuery.toLowerCase().trim();

        return trip.itinerary
            // 步驟 1: 依日期篩選
            .filter(item => selectedDate === 'all' || item.date === selectedDate)
            // 步驟 2: 依搜索關鍵字篩選
            .filter(item => {
                if (query === '') return true; // 如果沒有關鍵字，則全部顯示
                // 檢查活動內容、類別是否包含關鍵字
                return item.activity.toLowerCase().includes(query) || 
                       item.category.toLowerCase().includes(query);
            })
            // 步驟 3: 排序 (日期 + 時間)
            .sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.time.localeCompare(b.time);
            });
    }, [trip, selectedDate, searchQuery]); // <-- 依賴新增 searchQuery
    // ***********************************************

    // ... (所有 CRUD/DND 邏輯函式保持不變) ...

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                {/* ... (Header & 通知鈴鐺 UI 保持不變) ... */}
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* ... (旅程概覽卡片 保持不變) ... */}

                {/* ... (費用追蹤與結算卡片 保持不變) ... */}

                {/* 行程規劃卡片 - 新增搜尋欄位 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (當地時間)
                        {isOwner && (
                            <button onClick={() => setIsItineraryFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                + 新增行程
                            </button>
                        )}
                    </h2>
                    
                    {/* 3. 新增搜尋輸入框 */}
                    <input
                        type="text"
                        placeholder="🔍 搜索活動或類別..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 mb-4 border border-gray-300
