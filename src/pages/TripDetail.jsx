// src/pages/TripDetail.jsx - 最終版本 (整合 AI 提示與 VPN 錯誤狀態)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// ... (所有 imports 保持不變) ...


// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };

const TripDetail = () => {
    // ... (所有狀態定義) ...
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); 
    
    // ***********************************************
    // 1. 新增模擬 AI API 錯誤狀態
    // 實際應用中，此狀態應由 API 服務連線或請求失敗時設置。
    const [apiError, setApiError] = useState(false); 
    // ***********************************************
    
    // ... (所有其他邏輯和狀態保持不變) ...

    // ***********************************************
    // 2. 確保 AI 導覽按鈕能觸發錯誤模擬 (可選，用於展示)
    // 我們可以模擬在載入時檢查連線，如果失敗就設置錯誤狀態
    const handleOpenAIGuide = () => {
        // 模擬檢查連線 (例如，有 20% 的機率連線失敗)
        // const connectionFailed = Math.random() < 0.2;
        // setApiError(connectionFailed);
        
        // 為了確保用戶能看到 VPN 提示，我們先將其設為 true 進行展示
        setApiError(true); // 設為 true 讓用戶看到 VPN 提示
        setIsAIGuideModalOpen(true);
    }
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
                    
                    {/* AI 導覽按鈕 - 使用新的開啟函式 */}
                    <button onClick={handleOpenAIGuide} // <-- 使用新的開啟函式
                        className="w-full mt-4 p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600 active:scale-95 transition-transform">
                        🤖 啟動 AI 導覽
                    </button>
                </div>

                {/* ... (其他卡片保持不變) ... */}
            </main>

            {/* Modals 區域 */}
            {isOwner && isItineraryFormOpen && ( /* ... ItineraryForm ... */ )}
            {isOwner && isFlightFormOpen && ( /* ... FlightForm ... */ )}
            {isOwner && isExpenseFormOpen && ( /* ... ExpenseForm ... */ )}
            
            {/* 3. AIGuideModal - 傳遞目的地和錯誤狀態 */}
            <AIGuideModal 
                isOpen={isAIGuideModalOpen} 
                onClose={() => {setIsAIGuideModalOpen(false); setApiError(false);}} // 關閉時重置錯誤狀態
                tripDestination={trip.destination}
                apiError={apiError} // <-- 傳遞錯誤狀態
            />
        </div>
    );
};

export default TripDetail;
