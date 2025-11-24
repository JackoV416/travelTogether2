// src/pages/TripDetail.jsx - 最終版本 (新增行程項目創建者名稱)

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


// ... (費用類別常數, 顏色映射常數, formatDate, getDatesArray 保持不變) ...

const TripDetail = () => {
    // ... (所有狀態和 hooks 保持不變) ...

    const fileInputRef = useRef(null); 
    
    // ... (所有邏輯函式和 useMemo 保持不變) ...
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);
    const getCollaboratorName = (uid) => { /* ... */ }; // <-- 這個函式已經存在，用於費用支付者
    
    // ***********************************************
    // 1. 輔助函式：根據 UID 獲取創建者名稱或其縮寫
    const getCreatorName = useCallback((uid) => {
        if (!trip?.collaborators || !uid) return '未知';
        
        const collaborator = trip.collaborators.find(c => c.uid === uid);
        if (!collaborator) return '已離開';

        // 僅返回姓氏或簡短名稱的首字母
        const displayName = collaborator.displayName || collaborator.email;
        const namePart = displayName.split(' ')[0];
        return namePart.charAt(0); // 返回首字母
    }, [trip?.collaborators]);

    // 輔助函式：獲取頭像背景顏色 (可選：基於 UID 進行 Hash 得到顏色，這裡簡單使用固定顏色)
    const getAvatarColor = (uid) => {
        const hash = uid ? uid.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) : 0;
        const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
        return colors[hash % colors.length];
    };
    // ***********************************************


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (Header 保持不變) ... */}

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* ... (旅程概覽卡片 保持不變) ... */}

                {/* 費用追蹤與結算卡片 - 更新費用列表 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    {/* ... (圖表, 排序/篩選 UI 保持不變) ... */}
                        
                    {/* 最近支出 - 使用排序和篩選後的數據 */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h3 className="text-md font-bold text-gray-700 dark:text-white mb-2">
                            支出紀錄 ({sortedAndFilteredExpenses.length} 筆)
                        </h3>
                        
                        {sortedAndFilteredExpenses.length > 0 ? (
                            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {sortedAndFilteredExpenses.map((expense) => (
                                    <li key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold uppercase text-red-500 dark:text-red-400 truncate">
                                                {expense.category || '一般'}
                                            </div>
                                            <div className="font-bold text-gray-800 dark:text-white truncate">
                                                {expense.description}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                                <span>{getCollaboratorName(expense.payerId)} 支付</span>
                                                {/* 2. 在費用項目中顯示創建者頭像 */}
                                                {expense.creatorId && (
                                                    <span title={`${getCollaboratorName(expense.creatorId)} 創建`} 
                                                        className={`w-5 h-5 flex items-center justify-center text-xs font-semibold text-white rounded-full ${getAvatarColor(expense.creatorId)}`}>
                                                        {getCreatorName(expense.creatorId)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* ... (金額和刪除按鈕保持不變) ... */}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            /* ... (列表為空提示保持不變) ... */
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                {expenseFilterCategory !== 'all' ? `在
