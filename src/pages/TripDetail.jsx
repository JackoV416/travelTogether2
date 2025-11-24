// src/pages/TripDetail.jsx - 最終版 (新增費用圖表)

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
import ExpenseChart from '../components/ExpenseChart'; // <-- 引入圖表元件

// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };

const TripDetail = () => {
    // ... (所有狀態和 Hooks 保持不變) ...
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    // ... (所有狀態定義) ...

    // ... (fetchTripData 保持不變) ...

    // ... (calculateUnreadCount, handleMarkNotificationsAsRead 保持不變) ...

    // ... (費用結算的核心邏輯 useMemo 保持不變) ...
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);

    // ... (其他邏輯函式保持不變) ...

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                {/* ... (Header 保持不變，包含通知鈴鐺) ... */}
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                
                {/* ================================================================= */}
                {/* 費用追蹤與結算卡片 - 整合圖表 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-600 dark:text-red-400 font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>

                        {/* 費用圖表 (新增) */}
                        <ExpenseChart
                            expenses={trip.expenses}
                            currency={trip.currency}
                            totalSpent={totalSpent}
                        />

                        {/* 實時結算結果 */}
                        <div className="pt-2">
                            <h3 className="text-md font-extrabold text-gray-700 dark:text-white mb-3 flex items-center">
                                🤝 結算結果 ({trip.currency})
                            </h3>

                            {settlements.length > 0 ? (
                                <ul className="space-y-2">
                                    {settlements.map((s, index) => (
                                        <li key={index} className="text-base flex justify-between p-2 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <span className="font-medium text-gray-800 dark:text-gray-100">
                                                {getCollaboratorName(s.from)}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-300 mx-2">
                                                應付給
                                            </span>
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {getCollaboratorName(s.to)}
                                            </span>
                                            <span className="ml-auto font-extrabold text-green-600 dark:text-green-400">
                                                {s.amount.toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-green-600 dark:text-green-400 font-medium p-2 bg-green-50 dark:bg-green-900/40 rounded-lg">
                                    ✅ 恭喜！目前費用已結清或尚無記錄。
                                </p>
                            )}
                        </div>

                        {/* 最近支出 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            {/* ... (最近支出列表保持不變) ... */}
                        </div>
                        
                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>

                {/* 行程規劃卡片 & 航班資訊卡片 保持不變 */}
                {/* ... */}
            </main>

            {/* Modals 區域 保持不變 */}
            {/* ... */}
        </div>
    );
};

export default TripDetail;
