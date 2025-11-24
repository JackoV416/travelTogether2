// src/components/ItineraryForm.jsx - 最終版本 (已移除常數，並導入)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment-timezone';
import { useToast } from '../hooks/useToast'; 
// ***********************************************
// 導入常數
import { 
    ITINERARY_CATEGORIES, 
    ITINERARY_REQUIRED_COLUMNS, 
    ITINERARY_BATCH_GUIDE_STORAGE_KEY 
} from '../constants';
// ***********************************************


const formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
};

const ItineraryForm = ({ isOpen, onClose, tripId, currentTrip, initialData, onSuccess, defaultDate = null }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    
    // 批量新增相關狀態
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchDataText, setBatchDataText] = useState('');
    const [showBatchGuide, setShowBatchGuide] = useState(false);
    const [parsingError, setParsingError] = useState(null);

    // 狀態初始化邏輯
    const now = new Date();
    const todayFormatted = now.toISOString().split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5); 

    // 使用導入的常數
    const [date, setDate] = useState(initialData ? initialData.date : (defaultDate || currentTrip.startDate || todayFormatted));
    const [time, setTime] = useState(initialData ? initialData.time : timeFormatted);
    const [activity, setActivity] = useState(initialData?.activity || '');
    const [category, setCategory] = useState(initialData?.category || ITINERARY_CATEGORIES[0]);
    const [location, setLocation] = useState(initialData?.location || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [loading, setLoading] = useState(false);

    // 重設狀態
    useEffect(() => {
        if (!isOpen) {
            setEditItemState(null);
            setIsBatchMode(false);
            setBatchDataText('');
            setParsingError(null);
        }
    }, [isOpen]);
    
    const setEditItemState = useCallback((data) => {
        if (data) {
            setDate(data.date);
            setTime(data.time);
            setActivity(data.activity);
            setCategory(data.category);
            setLocation(data.location || '');
            setNotes(data.notes || '');
        } else {
            // 處理新增模式下的預設值
            const today = new Date();
            setDate(defaultDate || currentTrip.startDate || today.toISOString().split('T')[0]);
            setTime(today.toTimeString().slice(0, 5));
            setActivity('');
            setCategory(ITINERARY_CATEGORIES[0]);
            setLocation('');
            setNotes('');
        }
    }, [currentTrip, defaultDate]);

    useEffect(() => {
        setEditItemState(initialData);
    }, [initialData, setEditItemState]);

    
    // 批量模式開關與教學顯示邏輯
    const handleToggleBatchMode = () => {
        if (isBatchMode) {
            setIsBatchMode(false);
            setParsingError(null);
            setBatchDataText('');
        } else {
            // 檢查是否已看過教學，使用導入的 KEY
            const guideShown = localStorage.getItem(ITINERARY_BATCH_GUIDE_STORAGE_KEY) === 'true';
            if (!guideShown) {
                setShowBatchGuide(true);
            } else {
                setIsBatchMode(true);
            }
        }
    };
    
    const handleStartBatchMode = () => {
        // 使用導入的 KEY
        localStorage.setItem(ITINERARY_BATCH_GUIDE_STORAGE_KEY, 'true');
        setShowBatchGuide(false);
        setIsBatchMode(true);
    };

    // 數據解析器
    const parseBatchData = useCallback((text) => {
        const lines = text.trim().split('\n').filter(line => line.trim() !== '');
        const parsedItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // 嘗試使用 Tab 分隔，如果欄位不足，則嘗試用逗號
            let parts = line.split('\t');
            if (parts.length < ITINERARY_REQUIRED_COLUMNS.length) {
                parts = line.split(',').map(p => p.trim());
            }
            
            // 至少需要日期和活動名稱，使用導入的常數
            if (parts.length < ITINERARY_REQUIRED_COLUMNS.length) {
                throw new Error(`第 ${i + 1} 行數據格式不完整。需要至少「日期」和「活動」。`);
            }

            const [rawDate, rawActivity, rawTime, rawCategory, rawLocation, rawNotes] = parts;
            
            // 簡單日期驗證
            if (!moment(rawDate, 'YYYY-MM-DD', true).isValid() || rawDate.length !== 10) {
                throw new Error(`第 ${i + 1} 行的日期格式無效 (應為 YYYY-MM-DD)。`);
            }

            // 類別檢查，使用導入的常數
            const itemCategory = rawCategory && ITINERARY_CATEGORIES.includes(rawCategory.trim()) ? rawCategory.trim() : ITINERARY_CATEGORIES[0];
            
            parsedItems.push({
                id: uuidv4(),
                date: rawDate.trim(),
                time: rawTime ? rawTime.trim() : '00:00', 
                activity: rawActivity.trim(),
                category: itemCategory,
                location: rawLocation ? rawLocation.trim() : '',
                notes: rawNotes ? rawNotes.trim() : '',
                creatorId: user.uid,
                timestamp: new Date().toISOString(),
            });
        }
        return parsedItems;
    }, [user?.uid]);

    // 批量提交處理
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setParsingError(null);

        if (!batchDataText.trim()) {
            setParsingError('請貼上數據。');
            setLoading(false);
            return;
        }

        let newItineraryItems;
        try {
            newItineraryItems = parseBatchData(batchDataText);
        } catch (error) {
            setParsingError(error.message);
            setLoading(false);
            return;
        }

        if (newItineraryItems.length === 0) {
            setParsingError('解析失敗，未找到有效數據行。');
            setLoading(false);
            return;
        }
        
        try {
            const tripRef = doc(db, 'trips', tripId);
            const batchCount = newItineraryItems.length;

            await updateDoc(tripRef, {
                itinerary: arrayUnion(...newItineraryItems),
                notifications: arrayUnion({ message: `新增了 ${batchCount} 個行程項目。`, timestamp: new Date().toISOString() })
            });

            onSuccess();
            onClose();
            showToast(`成功批量新增 ${batchCount} 個行程！`, 'success'); 
        } catch (error) {
            console.error('Error batch adding itinerary: ', error);
            showToast(`批量新增行程失敗：請重試。`, 'error'); 
        } finally {
            setLoading(false);
        }
    };

    // 單個項目提交處理
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const dataToSave = {
            id: initialData ? initialData.id : uuidv4(),
            date,
            time,
            activity,
            category,
            location,
            notes,
            creatorId: user.uid,
            timestamp: initialData ? initialData.timestamp : new Date().toISOString(),
        };

        try {
            const tripRef = doc(db, 'trips', tripId);
            const action = initialData ? '更新' : '新增';
            const notificationMsg = `${user?.displayName || '協作者'} ${action}了一個行程：${dataToSave.activity}`;
            
            if (initialData) {
                // 更新模式：先刪除舊的，再新增新的
                await updateDoc(tripRef, {
                    itinerary: arrayRemove(initialData),
                    notifications: arrayUnion({ message: notificationMsg, timestamp: new Date().toISOString() })
                });
                await updateDoc(tripRef, {
                    itinerary: arrayUnion(dataToSave)
                });
            } else {
                // 新增模式
                await updateDoc(tripRef, {
                    itinerary: arrayUnion(dataToSave),
                    notifications: arrayUnion({ message: notificationMsg, timestamp: new Date().toISOString() })
                });
            }
            
            onSuccess();
            onClose();
            showToast(`${action}行程成功！`, 'success'); 

        } catch (error) {
            console.error(`Error ${action} itinerary: `, error);
            showToast(`${action}行程失敗：請重試。`, 'error'); 
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------
    // 渲染 UI
    // ----------------------------------------------

    // 批量貼上教學介面 (優先顯示)
    if (showBatchGuide) {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4 transition-opacity`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">📋 批量貼上教學</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                        這個功能讓您可以從試算表（如 Excel 或 Google Sheets）中複製多行數據並一次貼上。
                    </p>
                    
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">✅ 必需格式要求：</h3>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <li>數據必須以 **換行** 分隔每一筆行程。</li>
                        <li>數據行內的欄位可以透過 **Tab 鍵** 或 **逗號** 分隔。</li>
                        <li>**前兩個欄位**必須是：<span className="font-bold text-red-500">日期</span> 和 <span className="font-bold text-red-500">活動名稱</span>。</li>
                    </ul>
                    
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">範例 (複製貼上內容):</h3>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto mb-4 border border-dashed border-gray-300 dark:border-gray-600">
                        2025-12-01	搭乘高鐵前往東京	09:00	交通	東京車站<br/>
                        2025-12-01	入住旅館	12:00	住宿	新宿希爾頓<br/>
                        2025-12-02	逛淺草寺	14:30	景點<br/>
                        2025-12-03	拉麵午餐	13:00	餐飲	一蘭拉麵
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">欄位順序（選填部分）：</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li><span className="font-bold">日期 (YYYY-MM-DD)</span></li>
                        <li><span className="font-bold">活動名稱</span></li>
                        <li>時間 (HH:MM，選填)</li>
                        <li>類別 (選填，如果非 `住宿`, `餐飲`, `景點` 等預設值，將被設為 `其他`)</li>
                        <li>地點 (選填)</li>
                        <li>備註 (選填)</li>
                    </ol>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={() => { setShowBatchGuide(false); onClose(); }}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            取消
                        </button>
                        <button onClick={handleStartBatchMode}
                            className="p-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 active:scale-95 transition-transform">
                            了解，開始批量貼上
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // 主要表單介面
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out">
                
                {/* 標題與模式切換 */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {initialData ? '編輯行程' : (isBatchMode ? '批量貼上行程' : '新增行程')}
                    </h2>
                    <div className="flex space-x-2">
                        {/* 批量模式切換按鈕 */}
                        {!initialData && (
                            <button onClick={handleToggleBatchMode} disabled={loading}
                                className={`p-2 text-sm rounded-full transition-colors ${isBatchMode 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                {isBatchMode ? '❌ 切換為單筆' : '📋 批量貼上'}
                            </button>
                        )}
                        <button onClick={onClose} disabled={loading} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                            <span className="text-xl font-bold">×</span>
                        </button>
                    </div>
                </div>
                
                {/* 渲染批量模式或單筆模式 */}
                {isBatchMode ? (
                    // 批量貼上表單
                    <form onSubmit={handleBatchSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                貼上多行數據
                            </label>
                            <textarea
                                value={batchDataText}
                                onChange={(e) => {
                                    setBatchDataText(e.target.value);
                                    setParsingError(null); 
                                }}
                                rows="10"
                                placeholder="請將試算表數據貼到這裡..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                            ></textarea>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                每行數據代表一個行程。請確保數據順序正確（日期, 活動, [時間], [類別], [地點], [備註]）。
                            </p>
                            
                            {parsingError && (
                                <div className="mt-2 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-500 rounded-lg text-sm">
                                    解析錯誤: {parsingError}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} disabled={loading}
                                className="p-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors active:scale-95">
                                取消
                            </button>
                            <button type="submit" disabled={loading}
                                className="p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors active:scale-95 disabled:bg-indigo-400">
                                {loading ? '處理中...' : `批量新增 (${batchDataText.split('\n').filter(l => l.trim() !== '').length} 行)`}
                            </button>
                        </div>
                    </form>
                ) : (
                    // 單筆貼上表單
                    <form onSubmit={handleSubmit}>
                        {/* 日期和時間 */}
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-1">
                                <label htmlFor="date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">日期</label>
                                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required
                                    min={currentTrip.startDate} max={currentTrip.endDate}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="w-24">
                                <label htmlFor="time" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">時間</label>
                                <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>

                        {/* 活動名稱 */}
                        <div className="mb-4">
                            <label htmlFor="activity" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">活動名稱</label>
                            <input type="text" id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} required
                                placeholder="例如：參觀羅浮宮"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>

                        {/* 類別和地點 */}
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-1">
                                <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">類別</label>
                                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                                    {/* 使用導入的常數 */}
                                    {ITINERARY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)} 
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">地點 (選填)</label>
                                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                                    placeholder="例如：羅浮宮博物館"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>

                        {/* 備註 */}
                        <div className="mb-6">
                            <label htmlFor="notes" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">備註 (選填)</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"
                                placeholder="任何備註，例如門票信息、交通方式等"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>

                        {/* 提交按鈕 */}
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} disabled={loading}
                                className="p-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors active:scale-95">
                                取消
                            </button>
                            <button type="submit" disabled={loading}
                                className="p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors active:scale-95 disabled:bg-indigo-400">
                                {loading ? (initialData ? '儲存中...' : '新增中...') : (initialData ? '儲存變更' : '新增行程')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ItineraryForm;
