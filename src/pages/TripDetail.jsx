// src/pages/TripDetail.jsx - 最終版本 (新增快速新增今天的行程功能)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { exportJsonToFile, importJsonFromFile } from '../utils/dataManager'; 


// ... (費用類別常數, 顏色映射常數保持不變) ...

// 輔助函式：將 Date 對象格式化為 YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

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
    
    // ... (其他狀態保持不變) ...
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    
    // ***********************************************
    // 1. 新增狀態以傳遞快速新增的預設日期
    const [quickAddDate, setQuickAddDate] = useState(null); 
    // ***********************************************
    
    // ... (所有邏輯和 useMemo 保持不變) ...

    const isOwner = useMemo(() => { /* ... */ }, [user?.uid, trip?.ownerUid]);
    // ... (其他 useMemo 保持不變) ...
    
    // ***********************************************
    // 2. 判斷今天是否在行程期間內
    const todayTripDate = useMemo(() => {
        if (!trip || !trip.startDate || !trip.endDate) return null;

        const today = new Date();
        const todayStr = formatDate(today);
        
        // 確保日期範圍包含今天
        if (todayStr >= trip.startDate && todayStr <= trip.endDate) {
            return todayStr;
        }
        return null;
    }, [trip]);
    // ***********************************************
    
    // ***********************************************
    // 3. 快速新增今天的行程
    const handleQuickAddItinerary = () => {
        if (!isOwner) {
            alert('只有旅程創建者才能新增行程。');
            return;
        }
        
        if (todayTripDate) {
            // 設置預設日期並打開表單
            setQuickAddDate(todayTripDate); 
            setEditingItineraryItem(null); // 確保是新增模式
            setIsItineraryFormOpen(true);
        } else {
            alert('今天不在旅程期間內，請使用一般新增功能手動選擇日期。');
            setIsItineraryFormOpen(true);
        }
    };
    // ***********************************************

    // 關閉表單時重置 quickAddDate
    const handleCloseItineraryForm = () => {
        setIsItineraryFormOpen(false);
        setEditingItineraryItem(null);
        setQuickAddDate(null); // <-- 重置狀態
    };


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (Header & 費用追蹤卡片 保持不變) ... */}

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* ... (旅程概覽卡片 保持不變) ... */}
                
                {/* ... (費用追蹤與結算卡片 保持不變) ... */}

                {/* 行程規劃卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (當地時間)
                        <div className="flex space-x-2">
                            {/* 4. 新增快速新增按鈕 */}
                            {isOwner && todayTripDate && (
                                <button onClick={handleQuickAddItinerary} className="text-sm bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                    + 新增今天
                                </button>
                            )}
                            {isOwner && (
                                <button onClick={() => { setIsItineraryFormOpen(true); setQuickAddDate(null); setEditingItineraryItem(null); }} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                    + 新增行程
                                </button>
                            )}
                        </div>
                    </h2>
                    
                    {/* ... (搜索輸入框 & 日期選擇器 保持不變) ... */}

                    {/* 行程列表 - 保持不變 */}
                    {/* ... */}
                </div>
                
                {/* ... (航班資訊卡片 保持不變) ... */}
            </main>
            
            {/* Modals 區域 */}
            {isOwner && isItineraryFormOpen && (
                <ItineraryForm
                    isOpen={isItineraryFormOpen}
                    onClose={handleCloseItineraryForm} // <-- 使用新的關閉函式
                    tripId={tripId}
                    currentTrip={trip}
                    initialData={editingItineraryItem}
                    // ***********************************************
                    // 5. 傳遞預設日期給表單
                    defaultDate={quickAddDate} 
                    // ***********************************************
                    onSuccess={fetchTripData}
                />
            )}
            {/* ... (其他 Modals 保持不變) ... */}
        </div>
    );
};

export default TripDetail;
