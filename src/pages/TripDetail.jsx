// src/pages/TripDetail.jsx - 最終版本 (費用排序/篩選狀態持久化)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'; 
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// ... (所有 components imports 保持不變) ...
import { exportJsonToFile, importJsonFromFile } from '../utils/dataManager'; 


// ... (所有常數和輔助函式保持不變) ...


const TripDetail = () => {
    const { tripId } = useParams();
    // ... (所有 hooks 保持不變) ...

    const [trip, setTrip] = useState(null);
    // ... (其他狀態保持不變) ...
    
    const [searchQuery, setSearchQuery] = useState('');
    
    // ***********************************************
    // 1. 狀態初始化：從 localStorage 讀取狀態
    
    const getInitialExpenseSortBy = () => {
        return localStorage.getItem(`trip_${tripId}_sort`) || 'date';
    };
    const getInitialExpenseFilterCategory = () => {
        return localStorage.getItem(`trip_${tripId}_filter`) || 'all';
    };

    const [expenseSortBy, setExpenseSortBy] = useState(getInitialExpenseSortBy);
    const [expenseFilterCategory, setExpenseFilterCategory] = useState(getInitialExpenseFilterCategory);
    // ***********************************************

    // ***********************************************
    // 2. useEffect: 持久化 expenseSortBy 狀態
    useEffect(() => {
        // 確保 tripId 存在時才寫入，避免重複設置
        if (tripId) {
            localStorage.setItem(`trip_${tripId}_sort`, expenseSortBy);
        }
    }, [tripId, expenseSortBy]);

    // 3. useEffect: 持久化 expenseFilterCategory 狀態
    useEffect(() => {
        if (tripId) {
            localStorage.setItem(`trip_${tripId}_filter`, expenseFilterCategory);
        }
    }, [tripId, expenseFilterCategory]);
    // ***********************************************

    // ... (所有邏輯函式和 useMemo 保持不變) ...
    // 注意：sortedAndFilteredExpenses 會自動響應這些狀態的變化
    
    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (所有 UI 渲染部分保持不變) ... */}
            <main className="max-w-xl mx-auto space-y-4"> 
                {/* ... (旅程概覽卡片 & 行程規劃卡片保持不變) ... */}

                {/* 費用追蹤與結算卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    {/* ... (總支出與圖表保持不變) ... */}

                    {/* 排序和篩選下拉選單 - 保持不變 (它們現在會觸發狀態更新，進而觸發 useEffect 寫入 localStorage) */}
                    <div className="flex space-x-3 pt-2">
                        {/* 排序下拉選單 */}
                        <select
                            value={expenseSortBy}
                            onChange={(e) => setExpenseSortBy(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="date">依時間排序 (最新)</option>
                            <option value="amount">依金額排序 (高至低)</option>
                            <option value="category">依類別排序 (A-Z)</option>
                        </select>

                        {/* 篩選下拉選單 */}
                        <select
                            value={expenseFilterCategory}
                            onChange={(e) => setExpenseFilterCategory(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">所有類別</option>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* ... (支出紀錄列表和按鈕保持不變) ... */}
                </div>

                {/* ... (行程規劃卡片 & 航班資訊卡片 保持不變) ... */}
            </main>
            
            {/* ... (Modals 區域保持不變) ... */}
        </div>
    );
};

export default TripDetail;
