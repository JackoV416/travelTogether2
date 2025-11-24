// src/pages/TripDetail.jsx - 旅行詳情 (Threads 淺色風格)

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
    // 費用追蹤 (Expense) 邏輯 (略)
    // =================================================================

    const handleAddExpense = (newExpense) => {
        if (!trip) return;
        setIsExpenseFormOpen(false);
        fetchTripData(); 
    };

    const totalSpent = trip?.expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const settlementStatus = '待結算'; // 淺色模式下，調整為更中性的待結算

    // =================================================================
    // 行程規劃 (Itinerary) 邏輯 - 新增/編輯/刪除
    // =================================================================

    const handleAddItineraryItem = async (newItem) => {
        if (!trip) return;

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: [...(trip.itinerary || []), newItem] });
            setTrip(prev => ({ ...prev, itinerary: [...(prev.itinerary || []), newItem] }));
            setIsItineraryFormOpen(false);
        } catch (e) {
            console.error('新增行程項目失敗:', e);
            alert('新增行程項目失敗，請檢查網路或權限。');
        }
    };

    const handleDeleteItineraryItem = async (itemId) => {
        if (!trip || !window.confirm('確定要刪除這個行程項目嗎？')) return;

        try {
            const newItinerary = (trip.itinerary || []).filter(item => item.id !== itemId);
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, { itinerary: newItinerary });
            setTrip(prev => ({ ...prev, itinerary: newItinerary }));
        } catch (e) {
            console.error('刪除行程項目失敗:', e);
            alert('刪除行程項目失敗，請檢查網路或權限。');
        }
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
        } catch (e) {
            console.error('編輯行程項目失敗:', e);
            alert('編輯行程項目失敗，請檢查網路或權限。');
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
                newFlights = (trip.flights || []).map(f => f.id === editingFlight.id ? flightData : f);
            } else {
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

    if (loading) return <div className="min-h-screen bg-gray-50 text-gray-800 flex justify-center items-center">載入中...</div>;
    if (!trip) return null;


    // 格式化日期
    const formatDateRange = (start, end) => {
        const formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const dF = (dateString) => new Date(dateString).toLocaleDateString(undefined, formatOptions);
        return `${dF(start)} - ${dF(end)}`;
    };

    return (
        // 頁面背景改為淺灰色
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 text-gray-800">
            <header className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center">
                    ← 返回行程列表
                </button>
                <button onClick={handleDeleteTrip} className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm transition-colors active:scale-95">
                    刪除旅程
                </button>
            </header>

            <main className="max-w-xl mx-auto space-y-4"> {/* 縮小最大寬度，更像貼文 */}
                
                {/* 標題與基本資訊卡片 */}
                {/* 使用白色背景，圓角，類似貼文卡片 */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                    <h1 className="text-2xl font-extrabold mb-1 text-gray-900">
                        {trip.title}
                    </h1>
                    <p className="text-gray-500 mb-1 text-sm">
                        日期: {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="text-md font-semibold text-green-600">
                        總預算 ({trip.currency}): HK$ {trip.totalBudget.toLocaleString()}
                    </p>
                    <div className="mt-4 border-t border-gray-200 pt-3">
                        <h2 className="text-lg font-bold mb-2 flex items-center text-gray-700">
                            👥 旅行成員
                        </h2>
                        <ul className="space-y-1">
                            {(trip.collaborators || []).map((member, index) => (
                                <li key={member.uid || index} className="text-gray-600 text-sm">
                                    • {member.name} (預算: {trip.currency} {member.budgetShare.toLocaleString()})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ================================================================= */}
                {/* 費用追蹤與結算卡片 */}
                {/* ================================================================= */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-indigo-600">
                        💰 費用追蹤與結算
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg text-red-600 font-semibold">
                            總支出: {trip.currency} {totalSpent.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-sm">
                            目前沒有費用記錄。
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                            <h3 className="text-md font-semibold text-gray-700">
                                誰欠誰？ (最終結算 - {trip.currency})
                            </h3>
                            <span className="text-yellow-600">{settlementStatus}</span>
                        </div>
                        <p className="text-sm text-gray-500">{trip.collaborators[0].name} 待處理</p>

                        <button onClick={() => setIsExpenseFormOpen(true)}
                            className="w-full p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-transform mt-2">
                            + 新增支出
                        </button>
                    </div>
                </div>


                {/* ================================================================= */}
                {/* 行程規劃卡片 - 新增/編輯/刪除 */}
                {/* ================================================================= */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600">
                        🗺️ 行程規劃
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.itinerary && trip.itinerary.length > 0) ? (
                            trip.itinerary.map(item => (
                                // 行程項目卡片使用淺灰色背景
                                <li key={item.id} className="bg-gray-100 p-3 rounded-lg flex flex-col shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                        <span>{item.date} {item.time}</span>
                                        <span className="font-semibold text-teal-600">[{item.category}]</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-800 flex-grow">{item.activity}</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItineraryItem(item);
                                                    setIsItineraryFormOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItineraryItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500">目前沒有行程項目。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingItineraryItem(null); setIsItineraryFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 active:scale-95 transition-transform">
                        + 新增行程項目
                    </button>
                </div>

                {/* ================================================================= */}
                {/* 航班資訊卡片 - 新增/編輯/刪除 */}
                {/* ================================================================= */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-600">
                        ✈️ 航班資訊
                    </h2>
                    
                    <ul className="space-y-3 mb-4">
                        {(trip.flights && trip.flights.length > 0) ? (
                            trip.flights.map(flight => (
                                <li key={flight.id} className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-200 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-800 text-md">{flight.flightNumber} ({flight.departureCity} → {flight.arrivalCity})</span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingFlight(flight);
                                                    setIsFlightFormOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFlight(flight.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">出發: {flight.departureTime} ({flight.departureAirport})</p>
                                    <p className="text-sm text-gray-600">抵達: {flight.arrivalTime} ({flight.arrivalAirport})</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500">目前沒有航班記錄。</p>
                        )}
                    </ul>

                    <button onClick={() => { setEditingFlight(null); setIsFlightFormOpen(true); }}
                        className="w-full p-3 border border-indigo-500 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 active:scale-95 transition-transform">
                        + 新增航班資訊
                    </button>
                </div>

            </main>

            {/* ================================================================= */}
            {/* Modals 區域 (需確保 ItineraryForm 和 FlightForm 也是淺色樣式) */}
            {/* ================================================================= */}
            
            {/* 行程規劃 Modal */}
            {isItineraryFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> {/* 背景透明度降低 */}
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

            {/* 費用追蹤 Modal (假設 ExpenseForm 已存在) */}
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
