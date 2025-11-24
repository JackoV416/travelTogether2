// src/components/FlightForm.jsx

import React, { useState } from 'react';

/**
 * 航班資訊輸入表單 (以 Modal 形式顯示)
 *
 * @param {Object} props
 * @param {Object} props.initialData - 現有的航班資訊 (用於編輯模式)
 * @param {function} props.onSaveFlight - 點擊儲存時的回調函式
 * @param {function} props.onClose - 關閉 Modal 的回調函式
 */
const FlightForm = ({ initialData = {}, onSaveFlight, onClose }) => {
    
    // 初始化狀態，如果傳入了 initialData 則進入編輯模式
    const [formData, setFormData] = useState({
        departureFlight: initialData.departureFlight || '', // 去程航班號
        departureDate: initialData.departureDate || '',     // 去程日期
        returnFlight: initialData.returnFlight || '',       // 回程航班號
        returnDate: initialData.returnDate || '',           // 回程日期
        notes: initialData.notes || '',                     // 備註
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.departureFlight || !formData.departureDate) {
            alert('請至少填寫去程航班號和日期。');
            return;
        }

        // 傳遞整理後的數據給父組件 (TripDetail) 進行 Firestore 儲存
        onSaveFlight(formData);
    };

    return (
        // Modal 容器，實現暗黑模式下的置中顯示
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-white">
                <h2 className="text-2xl font-bold mb-4 text-white">
                    {initialData.departureFlight ? '編輯航班資訊' : '新增航班資訊'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* 去程航班資訊 */}
                    <div className="space-y-2 border-b border-gray-700 pb-4">
                        <label className="block text-lg font-medium text-blue-400">🛫 去程</label>
                        <input
                            type="text"
                            name="departureFlight"
                            placeholder="去程航班號 (必填)"
                            value={formData.departureFlight}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                            required
                        />
                        <input
                            type="date"
                            name="departureDate"
                            placeholder="去程日期 (必填)"
                            value={formData.departureDate}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                            required
                        />
                    </div>

                    {/* 回程航班資訊 */}
                    <div className="space-y-2 pt-4">
                        <label className="block text-lg font-medium text-blue-400">🛬 回程 (可選)</label>
                        <input
                            type="text"
                            name="returnFlight"
                            placeholder="回程航班號"
                            value={formData.returnFlight}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        />
                        <input
                            type="date"
                            name="returnDate"
                            placeholder="回程日期"
                            value={formData.returnDate}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        />
                    </div>
                    
                    {/* 備註 */}
                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-400">備註 / 航廈資訊 (可選)</label>
                        <textarea
                            name="notes"
                            placeholder="例如：TPE-HKG 華航 CI903"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none"
                        />
                    </div>


                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 font-medium"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 font-bold"
                        >
                            儲存航班
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlightForm;
