// src/pages/TripDetail.jsx - 最終版本 (新增數據匯入功能)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // <-- 引入 useRef
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
// 引入數據管理工具 (dataManager.js)
import { exportJsonToFile, importJsonFromFile } from '../utils/dataManager'; 


// ... (費用類別常數, getDatesArray 輔助函式等保持不變) ...

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    // ... (所有狀態定義) ...

    // ***********************************************
    // 1. 引用文件輸入欄位
    const fileInputRef = useRef(null); 
    // ***********************************************

    // ... (所有其他邏輯和狀態保持不變) ...
    const isOwner = useMemo(() => { /* ... */ }, [user?.uid, trip?.ownerUid]);
    // ... (handleExportData 函式保持不變) ...
    
    // ***********************************************
    // 2. 匯入數據函式
    const handleImportData = async (event) => {
        if (!isOwner) {
            alert('只有旅程創建者才能匯入數據。');
            return;
        }
        
        const file = event.target.files[0];
        if (!file) return;

        // 清空 input 欄位，確保下次選擇同一個文件也能觸發 onChange
        event.target.value = null; 

        if (!window.confirm('確定要匯入數據嗎？匯入的行程、航班和支出將會**合併到**現有數據中！')) {
            return;
        }

        try {
            const importedData = await importJsonFromFile(file);

            // 簡單驗證結構
            if (!importedData.itinerary && !importedData.flights && !importedData.expenses) {
                throw new Error("匯入的 JSON 文件中沒有有效的 'itinerary', 'flights', 或 'expenses' 欄位。");
            }

            const newItinerary = importedData.itinerary?.map(item => ({...item, id: uuidv4()})) || [];
            const newFlights = importedData.flights?.map(item => ({...item, id: uuidv4()})) || [];
            const newExpenses = importedData.expenses?.map(item => ({...item, id: uuidv4()})) || [];
            
            // 構建更新對象：使用 arrayUnion 進行合併，確保不覆蓋現有的其他欄位
            const updateData = {};
            if (newItinerary.length > 0) updateData.itinerary = arrayUnion(...newItinerary);
            if (newFlights.length > 0) updateData.flights = arrayUnion(...newFlights);
            if (newExpenses.length > 0) updateData.expenses = arrayUnion(...newExpenses);

            if (Object.keys(updateData).length === 0) {
                alert('匯入文件中未包含任何可匯入的數據 (行程、航班、支出)。');
                return;
            }

            await updateDoc(doc(db, 'trips', tripId), updateData);
            alert('數據已成功匯入並合併！');
            // 重新拉取數據以更新 UI
            fetchTripData(); 

        } catch (error) {
            console.error('數據匯入失敗:', error);
            alert(`數據匯入失敗: ${error.message}`);
        }
    };

    // 觸發文件選擇的函式
    const handleTriggerImport = () => {
        if (isOwner) {
            fileInputRef.current.click();
        } else {
            alert('只有旅程創建者才能匯入數據。');
        }
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
                        
                        {/* 導出按鈕 */}
                        <button onClick={handleExportData} 
                            className="p-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 active:scale-95 transition-transform">
                            ⬇️ 導出
                        </button>
                        
                        {/* 3. 匯入按鈕與隱藏的 file input */}
                        <button onClick={handleTriggerImport}
                            className="p-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-transform">
                            ⬆️ 匯入
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef} // 綁定 ref
                            onChange={handleImportData} // 處理文件
                            accept=".json"
                            style={{ display: 'none' }} // 隱藏 input
                            disabled={!isOwner}
                        />
                    </div>
                </div>

                {/* ... (其他卡片和 Modals 保持不變) ... */}
                
            </main>
            
            {/* ... (Modals 區域保持不變) ... */}
        </div>
    );
};

export default TripDetail;
