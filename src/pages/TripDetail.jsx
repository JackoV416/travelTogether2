// src/pages/TripDetail.jsx - 旅行詳情 (同時支援 Light/Dark 模式)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <-- 引入 useTheme
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import { v4 as uuidv4 } from 'uuid';

// ... (fetchTripData, handleAddExpense, totalSpent, settlementStatus 邏輯保持不變)
// ... (handleAddItineraryItem, handleDeleteItineraryItem, handleEditItineraryItem 邏輯保持不變)
// ... (handleSaveFlight, handleDeleteFlight, handleDeleteTrip 邏輯保持不變)
// ... (formatDateRange 保持不變)

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); // <-- 獲取主題狀態和切換函式

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 
    
    // ... (fetchTripData, handleAddExpense, totalSpent, settlementStatus, 行程/航班 CRUD 邏輯) ...
    // 請將上一個回覆中的所有邏輯函式複製到這裡，確保完整性。
    // 因為程式碼量大，這裡省略以避免重複。

    // 重新載入數據的 useEffect
    useEffect(() => {
        // ... (fetchTripData)
    }, [fetchTripData]);


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    // ... (formatDateRange 函式) ...

    return (
        // 頁面背景：淺色/深色切換
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <div className="flex space-x-3">
                    {/* 主題切換按鈕 */}
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    {/* 刪除按鈕 */}
                    <button onClick={handleDeleteTrip} className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm transition-colors active:scale-95">
                        刪除旅程
                    </button>
                </div>
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                
                {/* 標題與基本資訊卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-extrabold mb-1 text-gray-900 dark:text-indigo-300">
                        {trip.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
                        日期: {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="text-md font-semibold text-green-600 dark:text-green-400">
                        總預算 ({trip.currency}): HK$ {trip.totalBudget.toLocaleString()}
                    </p>
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h2 className="text-lg font-bold mb-2 flex items-center text-gray-700 dark:text-indigo-400">
                            👥 旅行成員
                        </h2>
                        <ul className="space-y-1">
                            {(trip.collaborators || []).map((member, index) => (
                                <li key={member.uid || index} className="text-gray-600 dark:text-gray-300 text-sm">
                                    • {member.name} (預算: {trip.currency} {member.budgetShare.toLocaleString()})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 費用追蹤與結算卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-600 dark:text-red-400 font-semibold">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            目前沒有費用記錄。
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-yellow-400">
                                誰欠誰？ (最終結算 - {trip.currency})
                            </h3>
                            <span className="text-yellow-600 dark:text-yellow-400">{settlementStatus}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{trip.collaborators[0].name} 待處理</p>

                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>


                {/* 行程規劃卡片 - 新增/編輯/刪除 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.itinerary && trip.itinerary.length > 0) ? (
                            trip.itinerary.map(item => (
                                <li key={item.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex flex-col shadow-sm border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>{item.date} {item.time}</span>
                                        <span className="font-semibold text-teal-600 dark:text-yellow-400">[{item.category}]</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-800 dark:text-white flex-grow">{item.activity}</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItineraryItem(item);
                                                    setIsItineraryFormOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItineraryItem(item.id)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">目前沒有行程項目。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingItineraryItem(null); setIsItineraryFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增行程項目
                    </button>
                </div>

                {/* 航班資訊卡片 - 新增/編輯/刪除 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        ✈️ 航班資訊
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.flights && trip.flights.length > 0) ? (
                            trip.flights.map(flight => (
                                <li key={flight.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-800 dark:text-white text-md">{flight.flightNumber} ({flight.departureCity} → {flight.arrivalCity})</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingFlight(flight);
                                                    setIsFlightFormOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFlight(flight.id)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">出發: {flight.departureTime} ({flight.departureAirport})</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">抵達: {flight.arrivalTime} ({flight.arrivalAirport})</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">目前沒有航班記錄。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingFlight(null); setIsFlightFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增航班資訊
                    </button>
                </div>

            </main>

            {/* Modals 區域 - 背景設定在 Modal component 內或使用透明度 */}
            {/* 為了簡潔，這裡只保留 Modals 的容器結構 */}
            {/* ... (ItineraryForm, FlightForm, ExpenseForm Modals 容器) ... */}
        </div>
    );
};

export default TripDetail;
