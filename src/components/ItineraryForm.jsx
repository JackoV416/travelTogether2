// src/components/ItineraryForm.jsx - 行程規劃表單

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['美食', '交通', '景點', '購物', '住宿', '其他'];

// initialData: 來自 TripDetail.jsx，用於編輯模式
const ItineraryForm = ({ initialData = null, onAddItem, onEditItem, onClose }) => {
    
    // 判斷是否為編輯模式
    const isEditMode = initialData !== null;
    
    const [date, setDate] = useState(initialData?.date || '');
    const [time, setTime] = useState(initialData?.time || '');
    const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
    const [activity, setActivity] = useState(initialData?.activity || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !activity) {
            alert('請填寫日期、時間和活動描述。');
            return;
        }

        if (isEditMode) {
            // 編輯模式：呼叫 onEditItem
            const editedItem = {
                ...initialData,
                date,
                time,
                category,
                activity,
            };
            onEditItem(editedItem);

        } else {
            // 新增模式：呼叫 onAddItem
            const newItem = {
                id: uuidv4(),
                date,
                time,
                category,
                activity,
                createdAt: new Date().toISOString(),
            };
            onAddItem(newItem);
        }
        onClose(); // 關閉表單
    };

    return (
        <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">
                {isEditMode ? '編輯行程項目' : '新增行程項目'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <label className="block text-sm font-medium text-gray-300">日期</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                
                <label className="block text-sm font-medium text-gray-300">時間</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required 
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                
                <label className="block text-sm font-medium text-gray-300">類別</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <label className="block text-sm font-medium text-gray-300">活動描述</label>
                <textarea value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="活動描述 (例如: 築地市場午餐)" required
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white resize-none placeholder-gray-400" rows="3" />
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-bold active:scale-95 transition-transform">
                        {isEditMode ? '儲存修改' : '儲存行程'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default ItineraryForm;
