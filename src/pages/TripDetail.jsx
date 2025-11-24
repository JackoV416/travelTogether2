// src/pages/TripDetail.jsx - 最終版 (新增 AI 行程建議按鈕)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'; // 引入 arrayUnion
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import AIGuideModal from '../components/AIGuideModal'; // <-- 引入新的 AI Modal
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
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false); // <-- 新增 AI Modal 狀態
    
    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    const [editingFlight, setEditingFlight] = useState(null); 

    // ... (fetchTripData 保持不變) ...
    const fetchTripData = useCallback(async () => { /* ... */ }, [tripId, navigate]);
    useEffect(() => { fetchTripData(); }, [fetchTripData]);

    // =================================================================
    // 行程規劃 (Itinerary) 邏輯 - 新增/編輯/刪除/AI 新增
    // =================================================================
    
    // AI 建議行程確認後，批量新增到 Firestore
    const handleAddAIGuideItems = async (items) => {
        if (!trip || items.length === 0) return;
        
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            // 使用 arrayUnion 批量新增項目到 itinerary 陣列
            await updateDoc(tripDocRef, {
                itinerary: arrayUnion(...items)
            });

            // 處理本地狀態更新：將新項目加到現有列表
            setTrip(prev => ({ 
                ...prev, 
                itinerary: [...(prev.itinerary || []), ...items] 
            }));

            setIsAIGuideModalOpen(false); // 關閉 Modal
        } catch (e) {
            console.error('批量新增 AI 行程失敗:', e);
            alert('批量新增 AI 行程失敗，請檢查網路。');
        }
    };

    const handleAddItineraryItem = async (newItem) => { /* ... */ };
    const handleDeleteItineraryItem = async (itemId) => { /* ... */ };
    const handleEditItineraryItem = async (editedItem) => { /* ... */ };
    const onDragEnd = async (result) => { /* ... */ }; // 拖拉邏輯保持不變

    // ... (費用追蹤, 航班資訊, handleDeleteTrip 邏輯保持不變) ...

    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const settlementStatus = '待結算'; 
    const recentExpenses = (trip?.expenses || []).slice(-3).reverse(); 

    const getCollaboratorName = (uid) => { /* ... */ };
    const handleAddExpense = (newExpense) => { /* ... */ };
    const handleSaveFlight = async (flightData) => { /* ... */ };
    const handleDeleteFlight = async (flightId) => { /* ... */ };
    const handleDeleteTrip = async () => { /* ... */ };
    const formatDateRange = (start, end) => { /* ... */ };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* Header 保持不變 */}

            <main className="max-w-xl mx-auto space-y-4"> 
                
                {/* 費用追蹤與結算卡片 保持不變 */}
                {/* ... */}

                {/* ================================================================= */}
                {/* 行程規劃卡片 - 新增 AI 按鈕 */}
                {/* ================================================================= */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (可拖拉排序)
                    </h2>
                    
                    {/* 新增 AI 建議按鈕 */}
                    <button 
                        onClick={() => setIsAIGuideModalOpen(true)}
                        className="w-full p-3 mb-4 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 active:scale-95 transition-transform flex items-center justify-center space-x-2">
                        <span>🤖 AI 建議行程 (Gemini)</span>
                    </button>

                    {/* DND 列表保持不變 */}
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
                                            {/* ... (Draggable 元素內容保持不變) ... */}
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

                {/* 航班資訊卡片 保持不變 */}
                {/* ... */}

            </main>

            {/* Modals 區域 */}
            
            {/* AI 建議行程 Modal */}
            {isAIGuideModalOpen && trip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <AIGuideModal
                        trip={trip}
                        onAddItems={handleAddAIGuideItems}
                        onClose={() => setIsAIGuideModalOpen(false)}
                    />
                </div>
            )}

            {/* ItineraryForm Modal 保持不變 */}
            {isItineraryFormOpen && ( /* ... */ )}

            {/* FlightForm Modal 保持不變 */}
            {isFlightFormOpen && ( /* ... */ )}

            {/* ExpenseForm Modal 保持不變 */}
            {isExpenseFormOpen && ( /* ... */ )}
        </div>
    );
};

export default TripDetail;
