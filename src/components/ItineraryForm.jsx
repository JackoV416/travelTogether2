// src/components/ItineraryForm.jsx - 整合 Toast

import React, { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment-timezone';
// 引入 useToast
import { useToast } from '../hooks/useToast'; 


// ... (所有輔助函式和常量保持不變) ...

const ItineraryForm = ({ isOpen, onClose, tripId, currentTrip, initialData, onSuccess, defaultDate = null }) => {
    const { user } = useAuth();
    // 獲取 Toast Hook
    const { showToast } = useToast(); 
    
    // ... (所有狀態初始化保持不變) ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ... (數據驗證和準備邏輯保持不變) ...

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
            
            // ***********************************************
            // 調用 Toast 提示成功
            showToast(`${action}行程成功！`, 'success'); 
            // ***********************************************

        } catch (error) {
            console.error(`Error ${action} itinerary: `, error);
            // ***********************************************
            // 調用 Toast 提示失敗
            showToast(`${action}行程失敗：請重試。`, 'error'); 
            // ***********************************************
        }
    };
    
    // ... (return 語句及其內容保持不變) ...
};

export default ItineraryForm;
