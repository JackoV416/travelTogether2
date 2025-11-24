// src/components/FlightForm.jsx

import React, { useState } from 'react';

const FlightForm = ({ initialData = {}, onSaveFlight, onClose }) => {
    
    const [formData, setFormData] = useState({
        departureFlight: initialData.departureFlight || '', 
        departureDate: initialData.departureDate || '',     
        returnFlight: initialData.returnFlight || '',       
        returnDate: initialData.returnDate || '',           
        notes: initialData.notes || '',                     
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

        onSaveFlight(formData);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-white">
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
                        className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                        required
                    />
                    <input
                        type="date"
                        name="departureDate"
                        placeholder="去程日期 (必填)"
                        value={formData.departureDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white"
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
                        className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                    />
                    <input
                        type="date"
                        name="returnDate"
                        placeholder="回程日期"
                        value={formData.returnDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white"
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
                        className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white resize-none placeholder-gray-400"
                    />
                </div>


                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 font-medium active:scale-95 transition-transform"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 font-bold active:scale-95 transition-transform"
                    >
                        儲存航班
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FlightForm;
