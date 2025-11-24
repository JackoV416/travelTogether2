// src/pages/TripDetail.jsx - 最終版本 (費用列表、航班 CRUD、拖拉)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
    // 費用追蹤 (Expense) 邏輯
    // =================================================================
    const handleAddExpense = (newExpense) => {
        if (!trip) return;
        setIsExpenseFormOpen(false);
        // 由於 expense 是 arrayUnion 加入的，我們需要重新獲取數據或手動更新狀態
        fetchTripData(); 
    };

    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const settlementStatus = '待結算'; 
    const recentExpenses = (trip?.expenses || []).slice(-3).reverse(); // 顯示最近 3 筆費用

    const getCollaboratorName = (uid) => {
        return trip?.collaborators?.find(c => c.uid === uid)?.name || '未知成員';
    };


    // =================================================================
    // 行程規劃 (Itinerary) 邏輯 (使用 DND)
    // =================================================================
    
    // (handleAddItineraryItem, handleDeleteItineraryItem, handleEditItineraryItem 邏輯與上次提供的相同)

    const handleAddItineraryItem = async (newItem) => { /* ... */ };
    const handleDeleteItineraryItem = async (itemId) => { /* ... */ };
    const handleEditItineraryItem = async (editedItem) => { /* ... */ };
    
    const onDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(trip.itinerary || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setTrip(prev => ({ ...prev, itinerary: items })); // 本地更新

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: items }); // Firestore 更新
        } catch (e) {
            console.error('行程排序更新失敗:', e);
            alert('行程排序更新失敗，請重新整理頁面。');
        }
    };

    // =================================================================
    // 航班資訊 (Flights) 邏輯 - 新增/編輯/刪除
    // =================================================================

    const handleSaveFlight = async (flightData) => {
        if (!trip) return;
        
        try {
            let newFlights;
            if (editingFlight) {
                // 編輯模式
                newFlights = (trip.flights || []).map(f => f.id === editingFlight.id ? flightData : f);
            } else {
                // 新增模式
                newFlights = [...(trip.flights || []), { ...flightData, id: uuidv4() }];
            }

            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { flights: newFlights });
            setTrip(prev => ({ ...prev, flights: newFlights }));
            
            setEditingFlight(null);
            setIsFlightFormOpen(false);
            
        } catch (e) {
            console.error('儲存航班資訊失敗:', e);
            alert('儲存航班資訊失敗，請檢查網路或權限。');
        }
    };
    
    const handleDeleteFlight = async (flightId) => {
        if (!trip || !window.confirm('確定要刪除這筆航班資訊嗎？')) return;

        try {
            const newFlights = (trip.flights || []).filter(f => f.id !== flightId);
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { flights: newFlights });
            setTrip(prev => ({ ...prev, flights: newFlights }));
        } catch (e) {
            console.error('刪除航班資訊失敗:', e);
            alert('刪除航班資訊失敗，請檢查網路或權限。');
        }
    };
    
    // ... (handleDeleteTrip 邏輯保持不變) ...

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <div className="flex space-x-3">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
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
                    {/* ... (旅行成員資訊) ... */}
                </div>

                {/* 費用追蹤與結算卡片 - 顯示費用列表 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-600 dark:text-red-400 font-semibold">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>
                        
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
                        
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-yellow-400">
                                誰欠誰？ (最終結算 - {trip.currency})
                            </h3>
                            <span className="text-yellow-600 dark:text-yellow-400">{settlementStatus}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">...</p>

                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>

                {/* 行程規劃卡片 - 支援拖拉排序 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (可拖拉排序)
                    </h2>
                    {/* ... (Drag and Drop 列表邏輯保持不變) ... */}
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


                {/* 航班資訊卡片 - 支援編輯和刪除 */}
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

            {/* Modals 區域 - 使用 fixed inset-0 bg-black bg-opacity-50 來實現背景遮罩 */}
            
            {isItineraryFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ItineraryForm
                        initialData={editingItineraryItem}
                        onAddItem={handleAddItineraryItem} 
                        onEditItem={handleEditItineraryItem}
                        onClose={() => {
                            setIsItineraryFormOpen(false);
                            setEditingItineraryItem(null);
                        }}
                    />
                </div>
            )}

            {isFlightFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <FlightForm
                        initialData={editingFlight}
                        onSave={handleSaveFlight}
                        onClose={() => {
                            setIsFlightFormOpen(false);
                            setEditingFlight(null);
                        }}
                    />
                </div>
            )}

            {isExpenseFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ExpenseForm 
                        tripId={tripId}
                        collaborators={trip.collaborators || []}
                        currency={trip.currency}
                        onSave={handleAddExpense}
                        onClose={() => setIsExpenseFormOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default TripDetail;
