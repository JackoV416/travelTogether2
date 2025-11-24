// src/components/FlightForm.jsx - 新增通知邏輯

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; 
import { db } from '../firebase'; 


// 注意：這個元件需要 tripId 來寫入通知
const FlightForm = ({ tripId, initialData, onSave, onClose }) => {
    const isEditing = !!initialData;
    const { theme } = useTheme();
    const { user } = useAuth(); // 獲取當前用戶信息

    // ... (所有狀態保持不變)
    const [flightNumber, setFlightNumber] = useState(initialData?.flightNumber || '');
    const [departureCity, setDepartureCity] = useState(initialData?.departureCity || '');
    const [arrivalCity, setArrivalCity] = useState(initialData?.arrivalCity || '');
    const [departureAirport, setDepartureAirport] = useState(initialData?.departureAirport || '');
    const [arrivalAirport, setArrivalAirport] = useState(initialData?.arrivalAirport || '');
    const [departureTime, setDepartureTime] = useState(initialData?.departureTime || '');
    const [arrivalTime, setArrivalTime] = useState(initialData?.arrivalTime || '');


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

        // ... (驗證邏輯) ...
        if (!flightNumber || !departureCity || !arrivalCity || !departureTime || !arrivalTime) {
            alert('請填寫所有必填的航班資訊。');
            return;
        }

        const flightData = {
            id: initialData?.id, // 新增時為空, 編輯時有值
            flightNumber,
            departureCity,
            arrivalCity,
            departureAirport,
            arrivalAirport,
            departureTime,
            arrivalTime,
        };

        try {
            onSave(flightData);

            // ***********************************************
            // 新增通知
            if (isEditing) {
                await addNotification(`${user.displayName || '一位成員'} 更新了航班：${flightNumber} (${departureCity} → ${arrivalCity})`);
            } else {
                await addNotification(`${user.displayName || '一位成員'} 新增了航班：${flightNumber} (${departureCity} → ${arrivalCity})`);
            }
            // ***********************************************
            
            onClose();
        } catch (error) {
            console.error('儲存航班資訊失敗:', error);
            alert('儲存失敗，請重試。');
        }
    };

    return (
        // ... (UI 保持不變) ...
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                {isEditing ? '編輯航班資訊' : '新增航班資訊'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* ... (所有 input 欄位保持不變) ... */}

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 font-bold active:scale-95 transition-transform">
                        {isEditing ? '儲存變更' : '新增航班'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default FlightForm;
