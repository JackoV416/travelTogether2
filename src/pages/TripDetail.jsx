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
    const handleDeleteTrip = async () => { /* ... */ };
    const formatDateRange = (start, end) => { /* ... */ };


    // ***********************************************
    // 4. 產生日期選擇器選項
    const allTripDates = useMemo(() => {
        if (!trip || !trip.startDate || !trip.endDate) return [];
        return getDatesArray(trip.startDate, trip.endDate);
    }, [trip]);
    // ***********************************************


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* Header 保持不變 */}
            {/* ... */}
            <main className="max-w-xl mx-auto space-y-4"> 
                
                {/* 費用追蹤與結算卡片 保持不變 */}
                {/* ... */}

                {/* ================================================================= */}
                {/* 行程規劃卡片 - 新增日期篩選器 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 
                    </h2>
                    
                    {/* AI 建議按鈕 */}
                    <button 
                        onClick={() => setIsAIGuideModalOpen(true)}
                        className="w-full p-3 mb-4 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 active:scale-95 transition-transform flex items-center justify-center space-x-2">
                        <span>🤖 AI 建議行程 (Gemini)</span>
                    </button>

                    {/* 日期篩選器 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            查看日期:
                        </label>
                        <select 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">顯示全部 ({trip.itinerary ? trip.itinerary.length : 0} 項)</option>
                            {allTripDates.map((date) => (
                                <option key={date} value={date}>
                                    {date} ({filteredItinerary.filter(i => i.date === date).length} 項)
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* DND 列表 - 現在使用 filteredItinerary */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul 
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-3 mb-4"
                                >
                                    {(filteredItinerary || []).map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided, snapshot) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps} 
                                                    className={`
                                                        p-3 rounded-lg flex flex-col shadow-sm border border-gray-200 dark:border-gray-600
                                                        ${snapshot.isDragging ? 'bg-indigo-100 dark:bg-indigo-900 shadow-xl border-indigo-500 transform scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700'}
                                                        transition-all duration-150 ease-in-out
                                                    `}
                                                >
                                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        <span className="flex items-center space-x-2">
                                                            <span className="text-gray-400 dark:text-gray-500 cursor-grab">⠿</span> 
                                                            {/* 顯示日期和時間 */}
                                                            <span>{selectedDate === 'all' ? `${item.date} ` : ''}{item.time}</span>
                                                        </span>
                                                        <span className="font-semibold text-teal-600 dark:text-yellow-400">[{item.category}]</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-800 dark:text-white flex-grow">{item.activity}</span>
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => { 
                                                                    setEditingItineraryItem(item); 
                                                                    setIsItineraryFormOpen(true); 
                                                                }}
                                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                                            >
                                                                編輯
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItineraryItem(item.id)}
                                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                            >
                                                                刪除
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                    
                    {/* 篩選後為空時的提示 */}
                    {(filteredItinerary || []).length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {selectedDate === 'all' ? '目前沒有行程項目。' : `日期 ${selectedDate} 沒有行程項目。`}
                        </p>
                    )}

                    <button onClick={() => { setEditingItineraryItem(null); setIsItineraryFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增行程項目
                    </button>
                </div>


                {/* 航班資訊卡片 保持不變 */}
                {/* ... */}

            </main>

            {/* Modals 區域 保持不變 */}
            {/* ... */}

            {/* AI 建議行程 Modal */}
            {isAIGuideModalOpen && trip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <AIGuideModal
                        trip={trip}
                        onAddItems={handleAddAIGuideItems}
                        onClose={() => setIsAIGuideModalOpen(false)}
                    />
                </div>
            )}
            {/* ... 其他 Modals ... */}
        </div>
    );
};

export default TripDetail;
