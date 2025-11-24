// src/pages/TripDetail.jsx - 最終版 (新增分日篩選邏輯)

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // <-- 引入 useMemo
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

// 輔助函式：產生旅行期間的所有日期列表
const getDatesArray = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    
    // 確保日期是以 YYYY-MM-DD 格式比較
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    while (currentDate <= stopDate) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    // ... 其他狀態
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); 

    // ***********************************************
    // 1. 新增當前選中日期狀態
    const [selectedDate, setSelectedDate] = useState('all'); 
    // ***********************************************
    
    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    

    const fetchTripData = useCallback(async () => { /* ... 保持不變 ... */
        if (!tripId) return;

        try {
            const docRef = doc(db, 'trips', tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                setTrip(data);
                
                // ***********************************************
                // 如果是第一次載入，且行程不為空，則預設選中第一天
                if (data.startDate && selectedDate === 'all') {
                    const allDates = getDatesArray(data.startDate, data.endDate);
                    if (allDates.length > 0) {
                        // 預設選擇第一天，但延遲設置以確保 UI 更新
                        setTimeout(() => setSelectedDate(allDates[0]), 0);
                    }
                }
                // ***********************************************

            } else {
                alert('找不到該旅行計畫！');
                navigate('/');
            }
        } catch (error) {
            console.error('獲取旅行計畫失敗:', error);
            alert('載入資料失敗，請檢查網路。');
        } finally {
            setLoading(false);
        }
    }, [tripId, navigate]);

    useEffect(() => {
        fetchTripData();
    }, [fetchTripData]);

    // ***********************************************
    // 2. 計算過濾後的行程列表
    const filteredItinerary = useMemo(() => {
        if (!trip || !trip.itinerary) return [];
        
        // 將行程按日期排序
        const sortedItinerary = [...trip.itinerary].sort((a, b) => {
            const dateA = a.date + ' ' + a.time;
            const dateB = b.date + ' ' + b.time;
            return dateA.localeCompare(dateB);
        });

        if (selectedDate === 'all') {
            return sortedItinerary;
        }

        // 過濾只顯示選定日期的行程
        return sortedItinerary.filter(item => item.date === selectedDate);

    }, [trip, selectedDate]);
    // ***********************************************

    // ***********************************************
    // 3. 處理 DND 拖拉排序邏輯更新 (只影響當前過濾後的列表)
    const onDragEnd = async (result) => {
        if (!result.destination) { return; }

        // 取得當前所有行程的完整列表
        const fullItinerary = Array.from(trip.itinerary || []);
        
        // 取得當前被拖動的項目
        const draggedItem = filteredItinerary[result.source.index];
        
        // 從完整列表中移除被拖動的項目
        const tempItinerary = fullItinerary.filter(item => item.id !== draggedItem.id);
        
        // 重新計算在完整列表中的目標插入索引
        // 找到目標日期列表中的所有行程 ID
        const targetDateItems = filteredItinerary.map(item => item.id);
        
        // 由於我們只在 filteredItinerary 中拖動，我們需要在 tempItinerary 中找到正確的插入點
        
        // 在目標日期列表中的目標位置 (destination.index) 插入被拖動項目
        const targetIndex = result.destination.index;
        
        // 重新插入項目到過濾後列表的正確位置
        const newFilteredList = Array.from(filteredItinerary);
        const [removed] = newFilteredList.splice(result.source.index, 1);
        newFilteredList.splice(targetIndex, 0, removed);
        
        // 現在，將 newFilteredList 的內容（僅限當前日期）與 tempItinerary (其他日期) 合併
        let finalItinerary = tempItinerary;
        let insertionPoint = tempItinerary.length; // 預設插到最後

        if (selectedDate !== 'all') {
            // 複雜情況：如果不是顯示全部，則需要找到第一個非當前日期的行程，將新列表插入到前面
            let firstIndexOfNextDay = tempItinerary.findIndex(item => item.date > selectedDate);
            insertionPoint = firstIndexOfNextDay !== -1 ? firstIndexOfNextDay : tempItinerary.length;
            
            // 這裡的邏輯變複雜，為簡化，我們只更新 filteredItinerary 的順序，然後替換 fullItinerary 中對應的項目
            
            // 取得當前選定日期的所有項目 ID
            const selectedDateItemIds = fullItinerary
                .filter(item => item.date === selectedDate)
                .map(item => item.id);
            
            // 根據 newFilteredList 的順序來構建最終列表
            finalItinerary = [];
            let newFilteredIndex = 0;
            
            for (const item of fullItinerary.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))) {
                if (selectedDateItemIds.includes(item.id)) {
                    // 如果這個項目在當前日期列表，使用新排序後的列表中的項目
                    finalItinerary.push(newFilteredList[newFilteredIndex]);
                    newFilteredIndex++;
                } else {
                    // 否則使用原有的項目
                    finalItinerary.push(item);
                }
            }
        } else {
            // 簡單情況：如果顯示全部，則直接使用新排序後的列表
            finalItinerary = newFilteredList;
        }
        
        // 1. 本地更新狀態 (即時反應)
        setTrip(prev => ({ ...prev, itinerary: finalItinerary }));

        // 2. 更新 Firestore
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: finalItinerary });
        } catch (e) {
            console.error('行程排序更新失敗:', e);
        }
    };
    // ***********************************************
    
    // ... (費用追蹤, 航班資訊, handleDeleteTrip, handleAddAIGuideItems 邏輯保持不變) ...

    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const settlementStatus = '待結算'; 
    const recentExpenses = (trip?.expenses || []).slice(-3).reverse(); 

    const getCollaboratorName = (uid) => { /* ... */ };
    const handleAddExpense = (newExpense) => { /* ... */ };
    const handleSaveFlight = async (flightData) => { /* ... */ };
    const handleDeleteFlight = async (flightId) => { /* ... */ };
    const handleDelete
