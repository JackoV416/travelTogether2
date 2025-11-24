// src/pages/TripDetail.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseForm from '../components/ExpenseForm';
import FlightForm from '../components/FlightForm'; 
import ItineraryForm from '../components/ItineraryForm'; // <-- 新增行程表單

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
    
    // Modal 狀態
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false); 


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


    // --- 核心計算邏輯 ---
    const { 
        calculatedTotalBudget, 
        totalExpensesInHKD, 
        balances 
    } = useMemo(() => {
        if (!trip) return { calculatedTotalBudget: 0, totalExpensesInHKD: 0, balances: {} };

        // 1. 計算總預算
        let totalBudget = 0;
        trip.members.forEach(member => {
            const budgetInHKD = convertToHKD(member.initialBudget, member.budgetCurrency);
            totalBudget += budgetInHKD;
        });

        // 2. 計算總支出
        const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.cost, 0);

        // 3. 計算分攤結餘 (Balances)
        const initialBalances = trip.members.reduce((acc, member) => {
            acc[member.id] = 0;
            return acc;
        }, {});

        const calculatedBalances = trip.expenses.reduce((acc, expense) => {
            const shareCount = expense.sharedBy.length;
            const shareAmount = expense.cost / shareCount;

            acc[expense.paidById] = (acc[expense.paidById] || 0) + expense.cost;

            expense.sharedBy.forEach(memberId => {
                acc[memberId] = (acc[memberId] || 0) - shareAmount;
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
    
    // 處理新增/編輯航班資訊
    const handleAddFlight = async (flightData) => {
        if (!trip) return;

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                flightInfo: flightData 
            });

            setTrip(prev => ({
                ...prev,
                flightInfo: flightData
            }));
            
            setIsFlightFormOpen(false);
        } catch (e) {
            console.error('新增航班資訊失敗:', e);
            alert('新增航班資訊失敗，請檢查網路。');
        }
    };

    // 處理新增行程項目
    const handleAddItineraryItem = async (newItem) => {
        if (!trip) return;
        
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                itinerary: arrayUnion(newItem)
            });

            setTrip(prev => ({
                ...prev,
                itinerary: [...(prev.itinerary || []), newItem]
            }));
            
            setIsItineraryFormOpen(false);
        } catch (e) {
            console.error('新增行程項目失敗:', e);
            alert('新增行程項目失敗，請檢查網路或權限。');
        }
    };


    // --- 渲染錯誤/載入中 (略) ---
    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">載入中...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">錯誤: {error}</div>;
    if (!trip) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">無資料</div>;


    // --- 主渲染 ---
    return (
        <div className="min-h-screen bg-gray-900 p-4 max-w-xl mx-auto text-white">
            <button 
                onClick={() => navigate('/')}
                className="text-blue-400 hover:text-blue-300 mb-6 flex items-center font-medium"
            >
                &larr; 返回行程列表
            </button>

            {/* 標題與預算摘要 */}
            <h1 className="text-3xl font-extrabold mb-2">{trip.title}</h1>
            <p className="text-gray-400 mb-4 text-sm">
                日期: {trip.startDate} - {trip.endDate}
            </p>
            <div className="p-4 bg-gray-800 rounded-xl shadow-lg mb-6">
                <p className="text-lg font-semibold text-green-400">
                    預算總計: {BASE_CURRENCY} {calculatedTotalBudget.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    (由 {trip.members.length} 位成員個人預算匯總)
                </p>
            </div>

            {/* 旅行成員列表 */}
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-3 text-indigo-400">👨‍👩‍👧‍👦 旅行成員</h2>
                <div className="space-y-2">
                    {trip.members.map(member => (
                        <div key={member.id} className="p-3 rounded-lg flex justify-between items-center border border-gray-700">
                            <span>{member.name}</span>
                            <span className="text-sm text-gray-400">
                                {member.initialBudget.toFixed(2)} {member.budgetCurrency}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            
            {/* 1. 行程規劃區塊 */}
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🗺️ 行程規劃
                </h2>
                
                {trip.itinerary && trip.itinerary.length > 0 ? (
                    <ul className="space-y-3">
                        {trip.itinerary
                            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)) 
                            .map((item) => (
                                <li key={item.id} className="bg-gray-700 p-3 rounded-xl flex flex-col shadow-md">
                                    <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                                        <span>{item.date} {item.time}</span>
                                        <span className="font-semibold text-yellow-400">[{item.category}]</span>
                                    </div>
                                    <span className="font-medium text-white">{item.activity}</span>
                                </li>
                            ))
                        }
                    </ul>
                ) : (
                    <p className="text-gray-500 mb-4">目前沒有行程項目。點擊下方按鈕新增。</p>
                )}

                <button
                    onClick={() => setIsItineraryFormOpen(true)}
                    className="w-full bg-indigo-600 text-white p-3 rounded-full font-medium hover:bg-indigo-700 mt-4 active:scale-95 transition-transform"
                >
                    + 新增行程項目 (美食 / 景點 / 交通)
                </button>
            </div>
            
            
            {/* 2. 航班資訊區塊 */}
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🛫 航班資訊
                </h2>

                {trip.flightInfo ? (
                    <div className="bg-gray-700 p-4 rounded-xl space-y-2 shadow-md">
                        <p className="font-semibold text-teal-400">去程:</p>
                        <p className="ml-4 text-sm">{trip.flightInfo.departureFlight} ({trip.flightInfo.departureDate})</p>
                        
                        {trip.flightInfo.returnFlight && (
                            <>
                                <p className="font-semibold text-teal-400">回程:</p>
                                <p className="ml-4 text-sm">{trip.flightInfo.returnFlight} ({trip.flightInfo.returnDate})</p>
                            </>
                        )}
                        
                        {trip.flightInfo.notes && (
                            <p className="text-xs text-gray-400 border-t border-gray-600 pt-2 mt-2">備註: {trip.flightInfo.notes}</p>
                        )}
                        
                        <button 
                            onClick={() => setIsFlightFormOpen(true)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 font-medium"
                        >
                            編輯航班資訊
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-4">目前沒有航班資訊。</p>
                        <button 
                            onClick={() => setIsFlightFormOpen(true)}
                            className="w-full bg-teal-600 text-white p-3 rounded-full font-medium hover:bg-teal-700 active:scale-95 transition-transform"
                        >
                            + 新增航班資訊
                        </button>
                    </>
                )}
            </div>
            
            
            {/* 3. 費用追蹤與結算區塊 */}
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">💰 費用追蹤與結算</h2>
                <p className="text-xl font-medium mb-4 text-red-400">總支出: {BASE_CURRENCY} {totalExpensesInHKD.toFixed(2)}</p>
                
                {/* 費用列表 */}
                <div className="space-y-3 mb-6">
                    {trip.expenses && trip.expenses.length > 0 ? (
                        trip.expenses.map(expense => (
                            <div key={expense.id} className="bg-gray-700 p-3 rounded-xl shadow-md border-l-4 border-red-500">
                                <p className="font-semibold text-lg">{expense.description}</p>
                                <p className="text-red-300">
                                    -{expense.originalCost.toFixed(2)} {expense.originalCurrency} 
                                    <span className="text-gray-400 ml-2 text-sm">({expense.cost.toFixed(2)} {BASE_CURRENCY})</span>
                                </p>
                                <p className="text-sm text-gray-400">由 {trip.members.find(m => m.id === expense.paidById)?.name} 支付</p>
                                <p className="text-xs text-gray-500">分攤者: {expense.sharedBy.map(id => trip.members.find(m => m.id === id)?.name).join(', ')}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">目前沒有費用記錄。</p>
                    )}
                </div>

                {/* 結算狀態 */}
                <h3 className="text-xl font-semibold mb-3 text-yellow-400 border-t border-gray-700 pt-4">結餘概覽 ({BASE_CURRENCY})</h3>
                <div className="space-y-2">
                    {Object.entries(balances).map(([memberId, balance]) => {
                        const memberName = trip.members.find(m => m.id === memberId)?.name;
                        const statusClass = balance > 0 ? 'text-green-400' : balance < 0 ? 'text-red-400' : 'text-gray-400';
                        const statusText = balance > 0 ? '應收' : balance < 0 ? '應付' : '平衡';

                        return (
                            <div key={memberId} className="flex justify-between p-3 bg-gray-700 rounded-lg font-medium">
                                <span>{memberName}</span>
                                <span className={statusClass}>
                                    {statusText}: {Math.abs(balance).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                <button 
                    onClick={() => setIsExpenseFormOpen(true)}
                    className="w-full bg-red-600 text-white p-3 rounded-full font-bold hover:bg-red-700 mt-6 active:scale-95 transition-transform"
                >
                    + 新增支出
                </button>
            </div>

            {/* Modals 區域 */}
            {isExpenseFormOpen && ( /* ... ExpenseForm Modal ... */ )}
            {isFlightFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <FlightForm
                        initialData={trip.flightInfo}
                        onSaveFlight={handleAddFlight} 
                        onClose={() => setIsFlightFormOpen(false)}
                    />
                </div>
            )}
            {isItineraryFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <ItineraryForm
                        onAddItem={handleAddItineraryItem} 
                        onClose={() => setIsItineraryFormOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default TripDetail;
