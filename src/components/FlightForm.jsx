// src/components/FlightForm.jsx - 航班資訊表單

import React, { useState } from 'react';

const FlightForm = ({ initialData = null, onSave, onClose }) => {
    
    const isEditMode = initialData !== null;

    // State for flight details
    const [flightNumber, setFlightNumber] = useState(initialData?.flightNumber || '');
    const [departureCity, setDepartureCity] = useState(initialData?.departureCity || '');
    const [arrivalCity, setArrivalCity] = useState(initialData?.arrivalCity || '');
    const [departureAirport, setDepartureAirport] = useState(initialData?.departureAirport || '');
    const [arrivalAirport, setArrivalAirport] = useState(initialData?.arrivalAirport || '');
    const [departureTime, setDepartureTime] = useState(initialData?.departureTime || '');
    const [arrivalTime, setArrivalTime] = useState(initialData?.arrivalTime || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!flightNumber || !departureCity || !arrivalCity || !departureTime || !arrivalTime) {
            alert('請填寫所有標記欄位。');
            return;
        }

        const flightData = {
            id: initialData?.id, // Keep ID for editing
            flightNumber,
            departureCity,
            arrivalCity,
            departureAirport,
            arrivalAirport,
            departureTime,
            arrivalTime,
        };

        onSave(flightData);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
                {isEditMode ? '編輯航班資訊' : '新增航班資訊'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <label className="block text-sm font-medium text-gray-300">航班號碼 (必填)</label>
                <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} required
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                    placeholder="例如: CX888" />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">出發城市 (必填)</label>
                        <input type="text" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} required
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                            placeholder="例如: 香港" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">抵達城市 (必填)</label>
                        <input type="text" value={arrivalCity} onChange={(e) => setArrivalCity(e.target.value)} required
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                            placeholder="例如: 東京" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">出發機場代號 (IATA)</label>
                        <input type="text" value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                            placeholder="例如: HKG" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">抵達機場代號 (IATA)</label>
                        <input type="text" value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                            placeholder="例如: NRT" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">出發時間 (必填)</label>
                        <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">抵達時間 (必填)</label>
                        <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white" />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-500 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-bold active:scale-95 transition-transform">
                        {isEditMode ? '儲存修改' : '新增航班'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default FlightForm;
