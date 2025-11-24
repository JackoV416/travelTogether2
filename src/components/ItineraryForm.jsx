// src/components/ItineraryForm.jsx - 新增通知邏輯

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
// 引入 Firestore 相關函式
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import { useAuth } from '../contexts/AuthContext'; 

// 注意：這個元件需要 tripId 來寫入通知
const ItineraryForm = ({ tripId, initialData, onAddItem, onEditItem, onClose }) => {
    const isEditing = !!initialData;
    const { theme } = useTheme();
    const { user } = useAuth(); // 獲取當前用戶信息

    const [date, setDate] = useState(initialData?.date || '');
    const [time, setTime] = useState(initialData?.time || '12:00');
    const [activity, setActivity] = useState(initialData?.activity || '');
    const [category, setCategory] = useState(initialData?.category || '觀光');
    const [uploading, setUploading] = useState(false); // 保持 uploading 狀態，如果沒有上傳邏輯則設為 false

    const ITINERARY_CATEGORIES = ['觀光', '餐飲', '交通', '住宿', '購物', '其他'];
    
    // ***********************************************
    // 輔助函式：新增通知
    const addNotification = async (message) => {
        if (!tripId || !message) return;
        try {
            const tripDocRef = doc(db, 'trips', tripId);
            const notification = {
                message,
                timestamp: new Date().toISOString(),
                byUid: user.uid,
            };
            await updateDoc(tripDocRef, {
                notifications: arrayUnion(notification)
            });
        } catch (e) {
            console.error('寫入通知失敗:', e);
        }
    };
    // ***********************************************


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!date || !time || !activity) {
            alert('請填寫日期、時間和活動內容。');
            return;
        }

        // setUploading(true); // 由於我們沒有圖片上傳，這裡先註釋掉
        
        try {
            const itemData = {
                id: initialData?.id || uuidv4(),
                date,
                time,
                activity,
                category,
                // imageUrl: '', // 如果暫時不實作圖片，先移除或設為空
            };

            if (isEditing) {
                onEditItem(itemData);
                await addNotification(`${user.displayName || '一位成員'} 更新了行程：${activity} (${date})`);
            } else {
                onAddItem(itemData);
                await addNotification(`${user.displayName || '一位成員'} 新增了行程：${activity} (${date})`);
            }
            
            onClose();

        } catch (error) {
            console.error('行程儲存失敗:', error);
            alert('儲存行程失敗。');
        } finally {
            // setUploading(false);
        }
    };

    return (
        // ... (UI 保持不變，注意移除或註釋掉圖片上傳相關的 UI 部分，使用上次更新前的 ItineraryForm.jsx 內容) ...
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                {isEditing ? '編輯行程項目' : '新增行程項目'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 日期和時間 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* 日期 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">日期 (必填)</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {/* 時間 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">時間 (必填)</label>
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                
                {/* 活動內容 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">活動內容 (必填)</label>
                    <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                        placeholder="東京鐵塔觀景" />
                </div>

                {/* 類別 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">類別</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                        {ITINERARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} 
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 font-medium active:scale-95 transition-transform">
                        取消
                    </button>
                    <button type="submit" disabled={uploading}
                        className={`px-4 py-2 text-white rounded-full font-bold active:scale-95 transition-transform ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'}`}>
                        {isEditing ? '儲存變更' : '新增項目'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default ItineraryForm;
