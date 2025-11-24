// src/pages/TripDetail.jsx - 最終版本 (新增行程日期切換快捷鍵)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'; 
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import AIGuideModal from '../components/AIGuideModal'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import ExpenseChart from '../components/ExpenseChart';
import { getDestinationTimeZone, getShortTimeZoneName } from '../utils/timeZoneMap'; 
import { exportJsonToFile, importJsonFromFile } from '../utils/dataManager'; 


// ... (所有常數保持不變) ...

// 輔助函式：將 Date 對象格式化為 YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// 輔助函式：產生旅行期間的所有日期列表 (保持不變)
const getDatesArray = (startDate, endDate) => { /* ... */ };

const TripDetail = () => {
    // ... (所有狀態和 hooks 保持不變) ...

    const fileInputRef = useRef(null); 
    
    // ... (所有邏輯函式和 useMemo 保持不變) ...

    const allTripDates = useMemo(() => { 
        if (!trip || !trip.startDate || !trip.endDate) return [];
        return getDatesArray(trip.startDate, trip.endDate);
    }, [trip]);


    // ***********************************************
    // 1. 處理日期切換的鍵盤邏輯
    const handleKeyDown = useCallback((event) => {
        // 確保當前沒有表單開啟，且不是在輸入框中
        if (isItineraryFormOpen || isFlightFormOpen || isExpenseFormOpen || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const dates = allTripDates;
        if (dates.length === 0) return;

        // 找到當前選定日期的索引，如果選定 'all' 則從第一個日期開始
        const currentIndex = selectedDate === 'all' ? -1 : dates.indexOf(selectedDate);

        let newDate = null;

        if (event.key === 'ArrowRight') {
            // 切換到後一個日期
            if (selectedDate === 'all') {
                newDate = dates[0];
            } else if (currentIndex < dates.length - 1) {
                newDate = dates[currentIndex + 1];
            }
        } else if (event.key === 'ArrowLeft') {
            // 切換到前一個日期
            if (currentIndex > 0) {
                newDate = dates[currentIndex - 1];
            } else if (currentIndex === 0) {
                // 如果在第一個日期，切換到 'all'
                newDate = 'all'; 
            }
        }

        if (newDate !== null) {
            setSelectedDate(newDate);
            event.preventDefault(); // 防止瀏覽器預設滾動行為
        }
    }, [allTripDates, selectedDate, isItineraryFormOpen, isFlightFormOpen, isExpenseFormOpen]); 
    // ***********************************************

    // ***********************************************
    // 2. 註冊和清理鍵盤事件監聽器
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    // ***********************************************
    

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white
