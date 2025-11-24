// src/pages/TripDetail.jsx - 最終版本 (新增數據導出功能)

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
// 引入數據導出工具
import { exportJsonToFile } from '../utils/dataExporter'; 


// ... (費用類別常數, getDatesArray 輔助函式等保持不變) ...

const TripDetail = () => {
    // ... (所有狀態和 hooks 保持不變) ...

    // ... (isOwner, 通知計算邏輯, 時區計算邏輯, CRUD 邏輯保持不變) ...
    
    // ***********************************************
    // 1. 導出數據函式
    const handleExportData = () => {
        if (!trip) {
            alert('無法導出數據，旅程資料不存在。');
            return;
        }

        // 為了避免導出不必要的數據 (如 React 的內部狀態或大型物件)，我們只導出核心數據
        const exportableData = {
            tripId: tripId,
            destination: trip.destination,
            dates: `${trip.startDate} to ${trip.endDate}`,
            collaborators: trip.collaborators,
            ownerUid: trip.ownerUid,
            itinerary: trip.itinerary,
            flights: trip.flights,
            expenses: trip.expenses,
            // 排除其他可能不需要或敏感的欄位
        };

        // 呼叫工具函式導出文件
        exportJsonToFile(exportableData, trip.destination);
    };
    // ***********************************************
    
    
    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (Header 保持不變) ... */}

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* 旅程概覽卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    {/* ... (概覽資訊保持不變) ... */}
                    
                    <div className="flex space-x-3 mt-4">
                        {/* AI 導覽按鈕 */}
                        <button onClick={handleOpenAIGuide} 
                            className="flex-1 p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600 active:scale-95 transition-transform">
                            🤖 啟動 AI 導覽
                        </button>
                        
                        {/* 2. 導出數據按鈕 */}
                        <button onClick={handleExportData} 
                            className="flex-1 p-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 active:scale-95 transition-transform">
                            ⬇️ 導出數據 (.json)
                        </button>
                    </div>
                </div>

                {/* ... (其他卡片和 Modals 保持不變) ... */}
                
            </main>
            
            {/* ... (Modals 區域保持不變) ... */}
        </div>
    );
};

export default TripDetail;
