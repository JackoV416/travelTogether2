// src/pages/TripDetail.jsx - 旅行詳情 (Threads 介面 + 拖拉排序)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <-- 主題 Context
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // <-- 拖拉函式庫
import { v4 as uuidv4 } from 'uuid';

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 

    const fetchTripData = useCallback(async () => {
        if (!tripId) return;
        try {
            const docRef = doc(db, 'trips', tripId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                alert('找不到該旅行計畫！');
                navigate('/');
            }
        } catch (error) {
            console.error('獲取旅行計畫失敗:', error);
            alert('載入資料失敗，請檢查網路。');
        } finally {
            setLoading(false);
        }
    }, [tripId, navigate]);

    useEffect(() => {
        fetchTripData();
    }, [fetchTripData]);

    // =================================================================
    // 行程規劃 (Itinerary) 邏輯
    // =================================================================
    
    const handleAddItineraryItem = async (newItem) => {
        if (!trip) return;
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                itinerary: [...(trip.itinerary || []), newItem]
            });
            setTrip(prev => ({ ...prev, itinerary: [...(prev.itinerary || []), newItem] }));
            setIsItineraryFormOpen(false);
        } catch (e) { console.error('新增行程項目失敗:', e); alert('新增行程項目失敗。'); }
    };

    const handleDeleteItineraryItem = async (itemId) => {
        if (!trip || !window.confirm('確定要刪除這個行程項目嗎？')) return;
        try {
            const newItinerary = (trip.itinerary || []).filter(item => item.id !== itemId);
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: newItinerary });
            setTrip(prev => ({ ...prev, itinerary: newItinerary }));
        } catch (e) { console.error('刪除行程項目失敗:', e); alert('刪除行程項目失敗。'); }
    };

    const handleEditItineraryItem = async (editedItem) => {
        if (!trip) return;
        try {
            const newItinerary = (trip.itinerary || []).map(item => 
                item.id === editedItem.id ? editedItem : item
            );
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: newItinerary });
            setTrip(prev => ({ ...prev, itinerary: newItinerary }));
            setEditingItineraryItem(null); 
            setIsItineraryFormOpen(false); 
        } catch (e) { console.error('編輯行程項目失敗:', e); alert('編輯行程項目失敗。'); }
    };

    // =================================================================
    // DND 拖拉結束處理函式
    // =================================================================
    const onDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(trip.itinerary || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 1. 本地更新狀態
        setTrip(prev => ({
            ...prev,
            itinerary: items
        }));

        // 2. 更新 Firestore
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: items });
        } catch (e) {
            console.error('行程排序更新失敗:', e);
            // 如果失敗，可以提示使用者並重新載入
        }
    };
    
    // ... (費用追蹤, 航班資訊, handleDeleteTrip 邏輯保持不變) ...
    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const settlementStatus = '待結算'; 

    const handleAddExpense = (newExpense) => {
        if (!trip) return;
        setIsExpenseFormOpen(false);
        fetchTripData(); 
    };

    const handleSaveFlight = async (flightData) => { /* ... */ };
    const handleDeleteFlight = async (flightId) => { /* ... */ };
    const handleDeleteTrip = async () => { /* ... */ };

    // 格式化日期
    const formatDateRange = (start, end) => {
        const formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const dF = (dateString) => new Date(dateString).toLocaleDateString(undefined, formatOptions);
        return `${dF(start)} - ${dF(end)}`;
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        // 頁面背景：Threads 風格（淺灰）或 Dark Mode
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
                
                {/* 標題與基本資訊卡片 - Threads 卡片風格 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-extrabold mb-1 text-gray-900 dark:text-indigo-300">
                        {trip.title}
                    </h1>
                    {/* ... (其他資訊) ... */}
                </div>

                {/* 費用追蹤與結算卡片 - Threads 卡片風格 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    {/* ... (費用內容) ... */}
                </div>

                {/* ================================================================= */}
                {/* 行程規劃卡片 - 支援拖拉排序 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (可拖拉排序)
                    </h2>
                    
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul 
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-3 mb-4"
                                >
                                    {(trip.itinerary || []).map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided, snapshot) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps} 
                                                    className={`
                                                        p-3 rounded-lg flex flex-col shadow-sm border border-gray-200 dark:border-gray-600
                                                        ${snapshot.isDragging ? 'bg-indigo-100 dark:bg-indigo-900 shadow-xl border-indigo-500 transform scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700'}
                                                        transition-all duration-150 ease-in-out
                                                    `}
                                                >
                                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        <span className="flex items-center space-x-2">
                                                            <span className="text-gray-400 dark:text-gray-500 cursor-grab">⠿</span> 
                                                            <span>{item.date} {item.time}</span>
                                                        </span>
                                                        <span className="font-semibold text-teal-600 dark:text-yellow-400">[{item.category}]</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-800 dark:text-white flex-grow">{item.activity}</span>
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => { setEditingItineraryItem(item); setIsItineraryFormOpen(true); }}
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
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {(trip.itinerary || []).length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 mb-4">目前沒有行程項目。</p>
                    )}

                    <button onClick={() => { setEditingItineraryItem(null); setIsItineraryFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增行程項目
                    </button>
                </div>

                {/* 航班資訊卡片 - Threads 卡片風格 */}
                {/* ... (航班資訊) ... */}
            </main>

            {/* Modals 區域 */}
            {/* ... (ItineraryForm, FlightForm, ExpenseForm Modals) ... */}
        </div>
    );
};

export default TripDetail;
