// src/pages/TripDetail.jsx - 最終版 (新增費用結算邏輯)

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

// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };


const TripDetail = () => {
    // ... (狀態和 Hooks 保持不變) ...
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('all'); 
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); 
    
    // ... 其他表單狀態

    const fetchTripData = useCallback(async () => { /* ... 保持不變 ... */
        if (!tripId) return;
        try { /* ... */ } catch (error) { /* ... */ } finally { setLoading(false); }
    }, [tripId, navigate]);

    useEffect(() => {
        fetchTripData();
    }, [fetchTripData]);

    // ***********************************************
    // 費用結算的核心邏輯 (新增)
    // ***********************************************
    const { balances, totalSpent, settlements } = useMemo(() => {
        if (!trip || !trip.expenses || !trip.collaborators) {
            return { balances: {}, totalSpent: 0, settlements: [] };
        }

        const collaborators = trip.collaborators;
        const expenses = trip.expenses;

        // 1. 初始化所有成員的餘額
        const balances = collaborators.reduce((acc, c) => {
            acc[c.uid] = 0; // 淨餘額 (Paid - Owed)
            return acc;
        }, {});

        let total = 0;

        // 2. 處理每筆支出
        for (const expense of expenses) {
            total += expense.amount;
            
            // 支付者將獲得等值的餘額 (Paid)
            if (balances.hasOwnProperty(expense.paidBy)) {
                balances[expense.paidBy] += expense.amount;
            }

            // 分攤者將扣除應付的金額 (Owed)
            for (const splitItem of expense.splitWith) {
                if (balances.hasOwnProperty(splitItem.uid)) {
                    balances[splitItem.uid] -= splitItem.share;
                }
            }
        }

        // 3. 處理結算 (Settlement)
        // 找出債權人 (Balances > 0) 和債務人 (Balances < 0)
        const creditors = []; // 應收款
        const debtors = [];   // 應付款

        for (const uid in balances) {
            const balance = Math.round(balances[uid] * 100) / 100; // 確保兩位小數
            if (balance > 0) {
                creditors.push({ uid, amount: balance });
            } else if (balance < 0) {
                debtors.push({ uid, amount: -balance }); // 儲存為正值
            }
        }

        const settlements = [];
        let cIndex = 0; // 債權人索引
        let dIndex = 0; // 債務人索引
        
        // 貪心演算法：從最大的債權人和債務人開始結算
        while (cIndex < creditors.length && dIndex < debtors.length) {
            const creditor = creditors[cIndex];
            const debtor = debtors[dIndex];

            // 結算金額為兩者中較小的
            const amountToSettle = Math.min(creditor.amount, debtor.amount);

            settlements.push({
                from: debtor.uid,
                to: creditor.uid,
                amount: Math.round(amountToSettle * 100) / 100, // 精確到兩位小數
            });

            // 更新餘額
            creditor.amount -= amountToSettle;
            debtor.amount -= amountToSettle;

            // 移動到下一個債權人/債務人
            if (creditor.amount === 0) cIndex++;
            if (debtor.amount === 0) dIndex++;
        }


        return { balances, totalSpent: total, settlements };
    }, [trip]);

    // 輔助函式：根據 UID 獲取成員名稱
    const getCollaboratorName = (uid) => {
        return trip?.collaborators?.find(c => c.uid === uid)?.name || '未知成員';
    };

    // ... (filteredItinerary, onDragEnd, handleAddAIGuideItems 保持不變) ...

    const filteredItinerary = useMemo(() => { /* ... */ }, [trip, selectedDate]);
    const onDragEnd = async (result) => { /* ... */ };
    const handleAddAIGuideItems = async (items) => { /* ... */ };
    
    // ... (其他 CRUD 邏輯保持不變) ...

    const recentExpenses = (trip?.expenses || []).slice(-3).reverse(); 
    const allTripDates = useMemo(() => { /* ... */ }, [trip]);

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (Header) ... */}

            <main className="max-w-xl mx-auto space-y-4"> 
                
                {/* ================================================================= */}
                {/* 費用追蹤與結算卡片 - 顯示結算結果 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-600 dark:text-red-400 font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>
                        
                        {/* 實時結算結果 (新增) */}
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

                        {/* 最近支出 (保持不變) */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-white mb-2">最近支出</h3>
                            <ul className="space-y-2">
                                {(recentExpenses.length > 0) ? (
                                    recentExpenses.map(expense => (
                                        <li key={expense.id} className="text-sm flex justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                            <span className="text-gray-800 dark:text-gray-200 truncate">{expense.description}</span>
                                            <span className="font-medium text-red-500 dark:text-red-400">
                                                {expense.amount.toLocaleString()} ({getCollaboratorName(expense.paidBy)})
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">目前沒有費用記錄。</p>
                                )}
                            </ul>
                        </div>
                        
                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>

                {/* 行程規劃卡片 保持不變 */}
                {/* ... */}
            </main>

            {/* Modals 區域 */}
            {/* ... (所有 Modals 保持不變) ... */}
        </div>
    );
};

export default TripDetail;
