// src/pages/TripDetail.jsx - 最終版本 (新增行程項目顏色標籤)

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


// 費用類別常數 (保持不變)
const EXPENSE_CATEGORIES = ['餐飲', '交通', '住宿', '門票', '購物', '一般', '其他'];

// ***********************************************
// 1. 行程類別顏色映射 (新增)
const ITINERARY_CATEGORY_COLORS = {
    '住宿': 'border-indigo-500', 
    '景點': 'border-blue-500',
    '餐飲': 'border-yellow-500',
    '交通': 'border-green-500',
    '購物': 'border-pink-500',
    '活動': 'border-red-500',
    '其他': 'border-gray-500',
};
// ***********************************************


// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };

const TripDetail = () => {
    const { tripId } = useParams();
    // ... (所有狀態和 hooks 保持不變) ...
    const fileInputRef = useRef(null); 

    // ... (所有邏輯函式和 useMemo 保持不變) ...

    // ***********************************************
    // 2. 獲取顏色類名
    const getCategoryBorderClass = useCallback((category) => {
        return ITINERARY_CATEGORY_COLORS[category] || ITINERARY_CATEGORY_COLORS['其他'];
    }, []);
    // ***********************************************
    
    // ... (handleExportData, handleImportData 等保持不變) ...
    
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
                        {isOwner && (
                            <button onClick={() => setIsItineraryFormOpen(true)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full transition-colors active:scale-95">
                                + 新增行程
                            </button>
                        )}
                    </h2>
                    
                    {/* ... (搜索輸入框 & 日期選擇器 保持不變) ... */}

                    {/* 行程列表 - 修改 li 元素的樣式 */}
                    <DragDropContext onDragEnd={isOwner ? onDragEnd : () => {}}> 
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {filteredItinerary.length > 0 ? (
                                        filteredItinerary.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isOwner}>
                                                {(provided) => (
                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        // ***********************************************
                                                        // 3. 應用顏色標籤樣式 (border-l-4 和動態顏色類名)
                                                        className={`p-3 pl-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-grab border-l-4 ${getCategoryBorderClass(item.category)}`}> 
                                                        {/* *********************************************** */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400">
                                                                {item.category}
                                                            </div>
                                                            <div className="font-bold text-gray-800 dark:text-white truncate">
                                                                {item.activity}
                                                            </div>
                                                            {/* ... (時間顯示保持不變) ... */}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            {/* ... (編輯/刪除按鈕保持不變) ... */}
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        /* ... (列表為空提示保持不變) ... */
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            {searchQuery !== '' ? `找不到與「${searchQuery}」相關的行程。` : (selectedDate === 'all' ? '目前沒有行程項目。' : `這一天 (${selectedDate}) 沒有行程。`)}
                                        </p>
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                
                {/* ... (航班資訊卡片 保持不變) ... */}
            </main>
            
            {/* ... (Modals 區域保持不變) ... */}
        </div>
    );
};

export default TripDetail;
