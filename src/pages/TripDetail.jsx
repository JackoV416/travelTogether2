// src/pages/TripDetail.jsx (新版，包含 ItineraryForm 和 FlightForm 邏輯)

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseForm from '../components/ExpenseForm';
import FlightForm from '../components/FlightForm'; // <-- 引入 FlightForm
import ItineraryForm from '../components/ItineraryForm'; // <-- 引入 ItineraryForm

// 貨幣與匯率定義 (保持不變)
const BASE_CURRENCY = 'HKD'; 
const EXCHANGE_RATES = { /* ... 略 ... */ };
const convertToHKD = (amount, currency) => { /* ... 略 ... */ };

const TripDetail = ({ user }) => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal 狀態
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false); 
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false); // <-- 新增行程表單狀態


    // --- 數據載入邏輯 (略) ---
    useEffect(() => { /* ... 略 ... */ }, [user, tripId]);
    const fetchTrip = async () => { /* ... 略 ... */ };

    // --- 核心計算邏輯 (略) ---
    const { calculatedTotalBudget, totalExpensesInHKD, balances } = useMemo(() => { /* ... 略 ... */ }, [trip]);


    // --- 數據操作函式 ---

    // 處理新增費用 (略)
    const handleAddExpense = async (newExpense) => { /* ... 略 ... */ };
    
    // 處理新增/編輯航班資訊 (略)
    const handleAddFlight = async (flightData) => { /* ... 略 ... */ };
    
    // 處理新增行程項目
    const handleAddItineraryItem = async (newItem) => {
        if (!trip) return;
        
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                // 將新的行程項目加入 itinerary 數組
                itinerary: arrayUnion(newItem)
            });

            // 本地更新狀態
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
        // ********************** 暗黑模式確保 **********************
        <div className="min-h-screen bg-gray-900 p-4 max-w-xl mx-auto text-white">
            <button /* ... 返回按鈕略 ... */ >&larr; 返回行程列表</button>

            {/* 標題與預算摘要 (略) */}
            <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
            {/* ... */}
            
            {/* 旅行成員列表 (略) */}
            
            
            {/* 1. 行程規劃區塊 - 恢復原有功能 */}
            <div className="mb-8 border-t border-gray-700 pt-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🗺️ 行程規劃
                </h2>
                
                {/* 顯示現有行程項目 (現在包含類別) */}
                {trip.itinerary && trip.itinerary.length > 0 ? (
                    <ul className="space-y-3">
                        {trip.itinerary
                            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)) // 按日期時間排序
                            .map((item) => (
                                <li key={item.id} className="bg-gray-800 p-3 rounded-lg flex flex-col">
                                    <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                                        <span>{item.date} {item.time}</span>
                                        <span className="font-semibold text-indigo-400">[{item.category}]</span>
                                    </div>
                                    <span className="font-medium text-white">{item.activity}</span>
                                </li>
                            ))
                        }
                    </ul>
                ) : (
                    <p className="text-gray-500 mb-4">目前沒有行程項目。點擊下方按鈕新增。</p>
                )}

                {/* 新增行程按鈕 */}
                <button
                    onClick={() => setIsItineraryFormOpen(true)}
                    className="w-full bg-indigo-600 text-white p-3 rounded-full font-medium hover:bg-indigo-700 mt-2"
                >
                    + 新增行程項目 (美食 / 景點 / 交通)
                </button>
            </div>
            
            
            {/* 2. 航班資訊區塊 - 新功能 (略) */}
            <div className="mb-8 border-t border-gray-700 pt-6">
                 {/* ... 這裡的 FlightForm 顯示邏輯保持不變 ... */}
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🛫 航班資訊
                </h2>

                {trip.flightInfo ? (
                    <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                        <p>去程: {trip.flightInfo.departureFlight} ({trip.flightInfo.departureDate})</p>
                        <p>回程: {trip.flightInfo.returnFlight} ({trip.flightInfo.returnDate})</p>
                        <p className="text-sm text-gray-400">備註: {trip.flightInfo.notes}</p>
                        <button 
                            onClick={() => setIsFlightFormOpen(true)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm mt-1"
                        >
                            編輯航班資訊
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-4">目前沒有航班資訊。</p>
                        <button 
                            onClick={() => setIsFlightFormOpen(true)}
                            className="w-full bg-teal-600 text-white p-3 rounded-full font-medium hover:bg-teal-700"
                        >
                            + 新增航班資訊
                        </button>
                    </>
                )}
            </div>
            
            
            {/* 3. 費用追蹤與結算區塊 (略) */}
            {/* ... 保持不變 ... */}

            {/* 費用表單 Modal (略) */}
            {isExpenseFormOpen && ( /* ... 略 ... */ )}
            
            {/* 航班表單 Modal (略) */}
            {isFlightFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <FlightForm
                        initialData={trip.flightInfo}
                        onSaveFlight={handleAddFlight} 
                        onClose={() => setIsFlightFormOpen(false)}
                    />
                </div>
            )}

            {/* 行程表單 Modal <-- 新增這個 Modal */}
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
