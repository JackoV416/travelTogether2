// src/components/ItineraryForm.jsx - 更新部分

import React, { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment-timezone';


// ... (格式化日期等輔助函式保持不變) ...

// ***********************************************
// 1. 接收 defaultDate prop
const ItineraryForm = ({ isOpen, onClose, tripId, currentTrip, initialData, onSuccess, defaultDate = null }) => {
// ***********************************************
    const { user } = useAuth();
    
    // ... (類別選項保持不變) ...
    
    // 獲取當前日期 (YYYY-MM-DD) 和時間 (HH:MM)
    const now = new Date();
    const todayFormatted = now.toISOString().split('T')[0];
    const timeFormatted = now.toTimeString().slice(0, 5); // 獲取當前時間 HH:MM

    // ***********************************************
    // 2. 根據 initialData 或 defaultDate 設置預設日期
    const [date, setDate] = useState(initialData ? initialData.date : (defaultDate || currentTrip.startDate || todayFormatted));
    const [time, setTime] = useState(initialData ? initialData.time : timeFormatted);
    // ... (其他狀態保持不變) ...
    // ***********************************************

    // ... (useEffect, handleSubmit 等邏輯保持不變) ...
    
    // 由於我們假設 date 狀態已經正確初始化，表單的其他部分保持不變。
    
    // ... (return 語句及其內容保持不變) ...
};

export default ItineraryForm;
