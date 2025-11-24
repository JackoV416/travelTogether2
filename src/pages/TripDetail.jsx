// src/pages/TripDetail.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseForm from '../components/ExpenseForm';
import { v4 as uuidv4 } from 'uuid';
// 引入您將要創建的航班表單
import FlightForm from '../components/FlightForm'; 


// 貨幣與匯率定義 (必須與 CreateTrip 保持一致)
const BASE_CURRENCY = 'HKD'; 
const EXCHANGE_RATES = {
    'HKD': 1.0,
    'JPY': 19.5, 
    'USD': 0.13,
    'TWD': 4.1,
    'EUR': 0.12,
};

// 輔助函式：將任何貨幣金額轉換為基礎結算貨幣 (HKD)
const convertToHKD = (amount, currency) => {
    if (!amount || !currency || currency === BASE_CURRENCY) {
        return amount || 0;
    }
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount / rate;
};


const TripDetail = ({ user }) => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 費用表單 Modal 狀態
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    // 航班表單 Modal 狀態
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false); 


    // --- 數據載入邏輯 ---
    useEffect(() => {
        const fetchTrip = async () => {
            if (!user || !tripId) return;
            setLoading(true);
            try {
                const tripDocRef = doc(db, 'trips', tripId);
                const docSnap = await getDoc(tripDocRef);

                if (docSnap.exists()) {
                    setTrip({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('找不到該旅行計畫。');
                }
            } catch (err) {
                console.error('載入旅行計畫錯誤:', err);
                setError('載入資料失敗。');
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [user, tripId]);


    // --- 核心計算邏輯 (使用 useMemo 最佳化) ---
    const { 
        calculatedTotalBudget, 
        totalExpensesInHKD, 
        balances 
    } = useMemo(() => {
        if (!trip) return { calculatedTotalBudget: 0, totalExpensesInHKD: 0, balances: {} };

        // 1. 計算總預算 (將所有成員的個人預算轉換為 HKD 後加總)
        let totalBudget = 0;
        trip.members.forEach(member => {
            const budgetInHKD = convertToHKD(member.initialBudget, member.budgetCurrency);
            totalBudget += budgetInHKD;
        });

        // 2. 計算總支出 (所有費用的 cost 欄位已經是 HKD)
        const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.cost, 0);

        // 3. 計算分攤結餘 (Balances)
        const initialBalances = trip.members.reduce((acc, member) => {
            acc[member.id] = 0;
            return acc;
        }, {});

        const calculatedBalances = trip.expenses.reduce((acc, expense) => {
            const shareCount = expense.sharedBy.length;
            const shareAmount = expense.cost / shareCount;

            // 支付者 (Paid By) 得到支付的金額 (正數)
            acc[expense.paidById] = (acc[expense.paidById] || 0) + expense.cost;

            // 分攤者 (Shared By) 扣除應分攤的金額 (負數)
            expense.sharedBy.forEach(memberId => {
                acc[memberId] -= shareAmount;
            });

            return acc;
        }, initialBalances);

        return { 
            calculatedTotalBudget: totalBudget, 
            totalExpensesInHKD: totalExpenses, 
            balances: calculatedBalances 
        };

    }, [trip]);


    // --- 數據操作函式 ---

    // 處理新增費用
    const handleAddExpense = async (newExpense) => {
        if (!trip) return;
        
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                expenses: arrayUnion(newExpense)
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                expenses: [...(prev.expenses || []), newExpense]
            }));
            
            setIsExpenseFormOpen(false);
        } catch (e) {
            console.error('新增費用失敗:', e);
            alert('新增費用失敗，請檢查網路或權限。');
        }
    };
    
    // 處理新增航班資訊
    const handleAddFlight = async (flightData) => {
        if (!trip) return;

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            // 航班資訊通常是覆蓋或更新，而不是數組 union (除非有多段航班)
            await updateDoc(tripDocRef, {
                flightInfo: flightData // 儲存航班資訊
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                flightInfo: flightData
            }));
