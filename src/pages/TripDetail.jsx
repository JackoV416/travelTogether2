// src/pages/TripDetail.jsx - 最終版本 (新增費用排序/篩選功能)

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


// 費用類別常數，用於篩選下拉選單
const EXPENSE_CATEGORIES = ['餐飲', '交通', '住宿', '門票', '購物', '一般', '其他'];


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
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); 
    
    // ... (通知, 編輯狀態等保持不變) ...
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(localStorage.getItem(`lastSeen_${tripId}_${user?.uid}`) || new Date(0).toISOString());

    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    
    // ***********************************************
    // 1. 新增費用排序/篩選狀態
    const [expenseSortBy, setExpenseSortBy] = useState('date'); // 'date', 'amount', 'category'
    const [expenseFilterCategory, setExpenseFilterCategory] = useState('all'); // 'all' or a specific category
    // ***********************************************


    const fetchTripData = useCallback(async () => { /* ... */ }, [tripId, navigate, selectedDate]);
    useEffect(() => { fetchTripData(); }, [fetchTripData]);
    
    // ... (isOwner, 通知計算邏輯, 時區計算邏輯, CRUD 邏輯保持不變) ...
    const isOwner = useMemo(() => { /* ... */ }, [user?.uid, trip?.ownerUid]);
    const calculateUnreadCount = useMemo(() => { /* ... */ }, [trip, lastSeenNotificationTime]);
    const handleMarkNotificationsAsRead = () => { /* ... */ };

    const destinationTimeZone = useMemo(() => { /* ... */ }, [trip?.destination]);
    const formatTimeInTimeZone = useCallback((datetime, tzOverride = destinationTimeZone) => { /* ... */ }, [destinationTimeZone]);
    
    const { balances, totalSpent, settlements } = useMemo(() => { /* ... */ }, [trip]);
    const getCollaboratorName = (uid) => { /* ... */ };
    const allTripDates = useMemo(() => { /* ... */ }, [trip]);

    const filteredItinerary = useMemo(() => { /* ... */ }, [trip, selectedDate, searchQuery]);
    const onDragEnd = async (result) => { /* ... */ };

    // ... (其他 CRUD 邏輯保持不變) ...

    // ***********************************************
    // 2. 實作排序與篩選邏輯
    const sortedAndFilteredExpenses = useMemo(() => {
        if (!trip?.expenses) return [];

        let expenses = [...trip.expenses];

        // 1. 篩選
        if (expenseFilterCategory !== 'all') {
            expenses = expenses.filter(
                // 確保 expense.category 存在，否則預設為 '一般'
                (expense) => (expense.category || '一般') === expenseFilterCategory
            );
        }

        // 2. 排序
        expenses.sort((a, b) => {
            if (expenseSortBy === 'amount') {
                return b.amount - a.amount; // 金額降序 (最高在前)
            } else if (expenseSortBy === 'category') {
                return (a.category || '一般').localeCompare(b.category || '一般'); // 類別升序 (A-Z)
            }
            // 預設或 'date': 依日期時間降序 (最新在前)
            // 假設 expense.date 是 ISO 格式，可以直接比較
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return expenses;
    }, [trip?.expenses, expenseSortBy, expenseFilterCategory]); // <-- 依賴狀態
    // ***********************************************


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                {/* ... (Header & 通知鈴鐺 UI 保持不變) ... */}
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* ... (旅程概覽卡片 保持不變) ... */}

                {/* 費用追蹤與結算卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        {/* ... (總支出與圖表保持不變) ... */}

                        {/* 實時結算結果 */}
                        {/* ... (結算結果 UI 保持不變) ... */}

                        {/* 3. 新增排序和篩選下拉選單 */}
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
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {getCollaboratorName(expense.payerId)} 支付
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center space-x-3 flex-shrink-0">
                                                <span className="font-extrabold text-lg text-red-600 dark:text-red-400">
                                                    {trip.currency} {expense.amount.toLocaleString()}
                                                </span>
                                                {isOwner && (
                                                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-500 hover:text-red-600 transition-colors text-sm">
                                                        刪除
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    {expenseFilterCategory !== 'all' ? `在「${expenseFilterCategory}」類別中沒有找到支出。` : '目前沒有支出紀錄。'}
                                </p>
                            )}

                        </div>
                        
                        <button onClick={() => setIsExpenseFormOpen(true)}
                            disabled={!isOwner} 
                            className={`w-full p-3 text-white font-bold rounded-lg transition-transform mt-2 ${
                                isOwner 
                                    ? 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95' 
                                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            }`}>
                            {isOwner ? '+ 新增支出' : '支出已鎖定'}
                        </button>
                    </div>
                </div>

                {/* ... (行程規劃卡片 & 航班資訊卡片 保持不變) ... */}
            </main>
            
            {/* ... (Modals 區域 保持不變) ... */}
        </div>
    );
};

export default TripDetail;
