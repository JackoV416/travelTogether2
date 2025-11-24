// src/components/ItineraryForm.jsx

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['美食', '交通', '景點', '購物', '住宿', '其他'];

const ItineraryForm = ({ onAddItem, onClose }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [activity, setActivity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !activity) {
            alert('請填寫日期、時間和活動描述。');
            return;
        }

        const newItem = {
            id: uuidv4(),
            date,
            time,
            category,
            activity,
            createdAt: new Date().toISOString(),
        };

        onAddItem(newItem);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">新增行程項目</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required 
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <textarea value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="活動描述 (例如: 築地市場午餐)" required
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white resize-none placeholder-gray-400" rows="3" />
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-bold active:scale-95 transition-transform">儲存行程</button>
                </div>
            </form>
        </div>
    );
};
export default ItineraryForm;
