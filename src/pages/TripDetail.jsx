// src/pages/TripDetail.jsx - 旅行詳情

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import { v4 as uuidv4 } from 'uuid';

const TripDetail = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    
    // 行程編輯狀態
    const [editingItineraryItem, setEditingItineraryItem] = useState(null); 
    // 航班編輯狀態
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

    // 處理費用新增/編輯後的更新
    const handleAddExpense = (newExpense) => {
        if (!trip) return;
        
        // 費用追蹤的實作 (ExpenseForm) 假設會將數據寫入 Firebase，這裡只負責關閉 Modal 並重新載入
        setIsExpenseFormOpen(false);
        fetchTripData(); // 重新載入數據以更新總支出
    };

    // 計算總支出 (簡單加總，複雜分攤在 ExpenseForm 中處理)
    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;

    // 簡單的結算狀態 (假設結清)
    const settlementStatus = '已結清';

    // =================================================================
    // 行程規劃 (Itinerary) 邏輯 - 新增/編輯/刪除
    // =================================================================

    // 處理新增行程項目
    const handleAddItineraryItem = async (newItem) => {
        if (!trip) return;

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                itinerary: [...(trip.itinerary || []), newItem]
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

    // 處理刪除行程項目
    const handleDeleteItineraryItem = async (itemId) => {
        if (!trip || !window.confirm('確定要刪除這個行程項目嗎？')) return;

        try {
            const newItinerary = (trip.itinerary || []).filter(item => item.id !== itemId);
            
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                itinerary: newItinerary
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                itinerary: newItinerary
            }));
        } catch (e) {
            console.error('刪除行程項目失敗:', e);
            alert('刪除行程項目失敗，請檢查網路或權限。');
        }
    };

    // 處理編輯行程項目 (從 Modal 接收新的數據)
    const handleEditItineraryItem = async (editedItem) => {
        if (!trip) return;

        try {
            const newItinerary = (trip.itinerary || []).map(item => 
                item.id === editedItem.id ? editedItem : item
            );
            
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                itinerary: newItinerary
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                itinerary: newItinerary
            }));
            
            setEditingItineraryItem(null); // 清除編輯狀態
            setIsItineraryFormOpen(false); // 關閉 Modal
        } catch (e) {
            console.error('編輯行程項目失敗:', e);
            alert('編輯行程項目失敗，請檢查網路或權限。');
        }
    };

    // =================================================================
    // 航班資訊 (Flights) 邏輯 - 新增/編輯
    // =================================================================
    
    // 處理航班新增/編輯後的更新
    const handleSaveFlight = async (flightData) => {
        if (!trip) return;
        
        try {
            let newFlights;
            if (editingFlight) {
                // 編輯現有航班
                newFlights = (trip.flights || []).map(f => 
                    f.id === editingFlight.id ? flightData : f
                );
            } else {
                // 新增航班
                newFlights = [...(trip.flights || []), { ...flightData, id: uuidv4() }];
            }

            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                flights: newFlights
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                flights: newFlights
            }));

            setEditingFlight(null);
            setIsFlightFormOpen(false);
            
        } catch (e) {
            console.error('儲存航班資訊失敗:', e);
            alert('儲存航班資訊失敗，請檢查網路或權限。');
        }
    };
    
    // 處理刪除航班
    const handleDeleteFlight = async (flightId) => {
        if (!trip || !window.confirm('確定要刪除這筆航班資訊嗎？')) return;

        try {
            const newFlights = (trip.flights || []).filter(f => f.id !== flightId);
            
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                flights: newFlights
            });

            // 本地更新狀態
            setTrip(prev => ({
                ...prev,
                flights: newFlights
            }));
        } catch (e) {
            console.error('刪除航班資訊失敗:', e);
            alert('刪除航班資訊失敗，請檢查網路或權限。');
        }
    };


    // =================================================================
    // 其他功能
    // =================================================================

    const handleDeleteTrip = async () => {
        if (!window.confirm('確定要永久刪除此旅行計畫嗎？此操作無法撤銷。')) return;

        try {
            await deleteDoc(doc(db, 'trips', tripId));
            alert('旅行計畫已刪除！');
            navigate('/');
        } catch (e) {
            console.error('刪除旅行計畫失敗:', e);
            alert('刪除失敗，請稍後再試。');
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;


    // 格式化日期
    const formatDateRange = (start, end) => {
        const formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const dF = (dateString) => new Date(dateString).toLocaleDateString(undefined, formatOptions);
        return `${dF(start)} - ${dF(end)}`;
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 text-white">
            <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <button onClick={handleDeleteTrip} className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 text-sm transition-colors active:scale-95">
                    刪除旅程
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-6">
                
                {/* 標題與基本資訊卡片 */}
                <div className="bg-gray-800 p-6 rounded-3xl shadow-xl">
                    <h1 className="text-3xl font-extrabold mb-2 text-indigo-300">
                        {trip.title}
                    </h1>
                    <p className="text-gray-400 mb-1 text-sm">
                        日期: {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="text-lg font-semibold text-green-400">
                        總預算 ({trip.currency}): HK$ {trip.totalBudget.toLocaleString()}
                    </p>
                </div>

                {/* 旅行成員卡片 */}
                <div className="bg-gray-800 p-6 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-400">
                        👥 旅行成員
                    </h2>
                    <ul className="space-y-1">
                        {(trip.collaborators || []).map((member, index) => (
                            <li key={member.uid || index} className="text-gray-300">
                                • {member.name} (預算: {trip.currency} {member.budgetShare.toLocaleString()})
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ================================================================= */}
                {/* 費用追蹤與結算卡片 */}
                {/* ================================================================= */}
                <div className="bg-gray-800 p-6 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-400">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-400 font-semibold">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                            目前沒有費用記錄。
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                            <h3 className="text-md font-semibold text-yellow-400">
                                誰欠誰？ (最終結算 - {trip.currency})
                            </h3>
                            <span className="text-green-400">{settlementStatus}</span>
                        </div>
                        <p className="text-sm text-gray-300">{trip.collaborators[0].name} 已結清</p>

                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>


                {/* ================================================================= */}
                {/* 行程規劃卡片 - 新增/編輯/刪除 */}
                {/* ================================================================= */}
                <div className="bg-gray-800 p-6 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-400">
                        🗺️ 行程規劃
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.itinerary && trip.itinerary.length > 0) ? (
                            trip.itinerary.map(item => (
                                <li key={item.id} className="bg-gray-700 p-3 rounded-xl flex flex-col shadow-md">
                                    <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                                        <span>{item.date} {item.time}</span>
                                        <span className="font-semibold text-yellow-400">[{item.category}]</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-white flex-grow">{item.activity}</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItineraryItem(item); // 設定要編輯的項目
                                                    setIsItineraryFormOpen(true);  // 開啟 Modal
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItineraryItem(item.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400">目前沒有行程項目。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingItineraryItem(null); setIsItineraryFormOpen(true); }}
                        className="w-full p-3 border border-indigo-600 text-indigo-300 font-bold rounded-xl hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增行程項目
                    </button>
                </div>

                {/* ================================================================= */}
                {/* 航班資訊卡片 - 新增/編輯 */}
                {/* ================================================================= */}
                <div className="bg-gray-800 p-6 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-400">
                        ✈️ 航班資訊
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.flights && trip.flights.length > 0) ? (
                            trip.flights.map(flight => (
                                <li key={flight.id} className="bg-gray-700 p-3 rounded-xl shadow-md space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-white">{flight.flightNumber} ({flight.departureCity} → {flight.arrivalCity})</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingFlight(flight); // 設定要編輯的項目
                                                    setIsFlightFormOpen(true);  // 開啟 Modal
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFlight(flight.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">出發: {flight.departureTime} ({flight.departureAirport})</p>
                                    <p className="text-sm text-gray-400">抵達: {flight.arrivalTime} ({flight.arrivalAirport})</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400">目前沒有航班記錄。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingFlight(null); setIsFlightFormOpen(true); }}
                        className="w-full p-3 border border-indigo-600 text-indigo-300 font-bold rounded-xl hover:bg-indigo-900 active:scale-95 transition-transform">
                        + 新增航班資訊
                    </button>
                </div>


                {/* AI 推薦行程 (已移除，避免與新功能混淆) */}
            </main>

            {/* ================================================================= */}
            {/* Modals 區域 */}
            {/* ================================================================= */}

            {/* 行程規劃 Modal */}
            {isItineraryFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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

            {/* 航班資訊 Modal */}
            {isFlightFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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

            {/* 費用追蹤 Modal (假設 ExpenseForm 已存在) */}
            {isExpenseFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
