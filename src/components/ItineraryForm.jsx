// src/components/ItineraryForm.jsx - 行程規劃表單 (淺色風格)

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['美食', '交通', '景點', '購物', '住宿', '其他'];

const ItineraryForm = ({ initialData = null, onAddItem, onEditItem, onClose }) => {
    
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
            const editedItem = { ...initialData, date, time, category, activity };
            onEditItem(editedItem);
        } else {
            const newItem = { id: uuidv4(), date, time, category, activity, createdAt: new Date().toISOString() };
            onAddItem(newItem);
        }
        onClose(); 
    };

    return (
        // Modal 背景改為白色/淺色
        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl text-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
                {isEditMode ? '編輯行程項目' : '新增行程項目'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <label className="block text-sm font-medium text-gray-600">日期</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" />
                
                <label className="block text-sm font-medium text-gray-600">時間</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" />
                
                <label className="block text-sm font-medium text-gray-600">類別</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <label className="block text-sm font-medium text-gray-600">活動描述</label>
                <textarea value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="活動描述 (例如: 築地市場午餐)" required
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none placeholder-gray-400" rows="3" />
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-bold active:scale-95 transition-transform">
                        {isEditMode ? '儲存修改' : '儲存行程'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default ItineraryForm;
