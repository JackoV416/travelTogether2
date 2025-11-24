// src/pages/TripDetail.jsx - 包含所有功能、圖片相簿、地圖導航和待辦清單的最終版本

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { db, storage } from '../firebase'; 
import { ref, deleteObject } from 'firebase/storage'; 
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// 導入 LogService
import LogService from '../services/logService'; 
import ItineraryForm from '../components/ItineraryForm';
import FlightForm from '../components/FlightForm';
import ExpenseForm from '../components/ExpenseForm';
import AIGuideModal from '../components/AIGuideModal'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import ExpenseChart from '../components/ExpenseChart';
import { getDestinationTimeZone, getShortTimeZoneName } from '../utils/timeZoneMap'; 
import { exportJsonToFile, importJsonFromFile } from '../utils/dataManager'; 
import { useToast } from '../hooks/useToast'; 
import { uploadTripPhoto } from '../utils/imageUpload'; 
import { 
    EXPENSE_CATEGORIES, 
    EXPENSE_CATEGORY_COLORS, 
    ITINERARY_CATEGORY_COLORS 
} from '../constants';


// 輔助函式：將 Date 對象格式化為 YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// 輔助函式：產生旅行期間的所有日期列表
const getDatesArray = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    while (currentDate <= stopDate) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

// 輔助函式：產生 Google 地圖導航 URL
const getMapsUrl = (location) => {
    if (!location) return '#';
    const encodedLocation = encodeURIComponent(location);
    // 標準 Google Maps search URL，用於在移動設備上開啟 App
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
};


const TripDetail = () => {
    const { tripId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { showToast } = useToast(); 

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isItineraryFormOpen, setIsItineraryFormOpen] = useState(false);
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
    const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectedDate, setSelectedDate] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState('');
    
    // 圖片上傳狀態
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // 費用追蹤狀態 (已持久化)
    const getInitialExpenseSortBy = () => localStorage.getItem(`trip_${tripId}_sort`) || 'date';
    const getInitialExpenseFilterCategory = () => localStorage.getItem(`trip_${tripId}_filter`) || 'all';
    const [expenseSortBy, setExpenseSortBy] = useState(getInitialExpenseSortBy);
    const [expenseFilterCategory, setExpenseFilterCategory] = useState(getInitialExpenseFilterCategory);

    const fileInputRef = useRef(null); 

    // 持久化費用追蹤狀態
    useEffect(() => {
        if (tripId) {
            localStorage.setItem(`trip_${tripId}_sort`, expenseSortBy);
        }
    }, [tripId, expenseSortBy]);

    useEffect(() => {
        if (tripId) {
            localStorage.setItem(`trip_${tripId}_filter`, expenseFilterCategory);
        }
    }, [tripId, expenseFilterCategory]);

    const fetchTrip = useCallback(async () => {
        if (!tripId || authLoading || !user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const docRef = doc(db, 'trips', tripId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const tripData = docSnap.data();
                // 檢查協作者列表是否包含當前用戶
                const isCollaborator = tripData.collaborators.some(c => c.uid === user.uid);
                if (isCollaborator) {
                    // 確保 photos 和 memos 陣列存在
                    if (!tripData.photos) {
                        tripData.photos = [];
                    }
                    if (!tripData.memos) { // 確保 memos 存在
                        tripData.memos = [];
                    }
                    setTrip(tripData);
                    // INFO Log
                    LogService.info('Trip details fetched successfully.', { tripId, userId: user.uid });
                } else {
                    showToast('您無權訪問此旅程。', 'error');
                    navigate('/'); 
                    // WARN Log
                    LogService.warn('Unauthorized trip access attempt.', { tripId, userId: user.uid });
                }
            } else {
                showToast('找不到該旅程。', 'error');
                navigate('/');
                // WARN Log
                LogService.warn('Trip not found.', { tripId, userId: user.uid });
            }
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'FETCH_TRIP_DETAIL',
                tripId: tripId,
                userId: user?.uid
            });
            showToast('載入旅程資料失敗。', 'error');
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [tripId, authLoading, user?.uid, navigate, showToast]);

    useEffect(() => {
        fetchTrip();
    }, [fetchTrip]);

    const isOwner = useMemo(() => trip?.ownerId === user?.uid, [trip, user]);

    const destinationTimeZone = useMemo(() => {
        if (!trip?.destination) return Intl.DateTimeFormat().resolvedOptions().timeZone;
        return getDestinationTimeZone(trip.destination);
    }, [trip?.destination]);

    const handleFormSuccess = () => {
        fetchTrip(); // 重新載入數據
    };

    const handleEditItinerary = (item) => {
        setEditItem(item);
        setIsItineraryFormOpen(true);
    };

    const handleEditExpense = (item) => {
        setEditItem(item);
        setIsExpenseFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditItem(null);
        setIsItineraryFormOpen(false);
        setIsExpenseFormOpen(false);
        setIsFlightFormOpen(false);
    };

    const handleDeleteItem = async (type, item) => {
        if (!window.confirm(`確定要刪除這筆${type === 'itinerary' ? '行程' : '費用'}嗎？`)) return;

        try {
            const tripRef = doc(db, 'trips', tripId);
            const field = type === 'itinerary' ? 'itinerary' : 'expenses';
            
            await updateDoc(tripRef, {
                [field]: arrayRemove(item)
            });

            fetchTrip();
            showToast(`${type === 'itinerary' ? '行程' : '費用'}已刪除！`, 'success');
            // INFO Log
            LogService.info(`${type} item deleted.`, { tripId, userId: user.uid, itemId: item.id });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: `DELETE_${type.toUpperCase()}`,
                tripId: tripId,
                userId: user?.uid,
                itemId: item.id
            });
            showToast(`刪除失敗，請重試。`, 'error');
        }
    };
    
    const handleAddCollaborator = async () => {
        const email = prompt("請輸入協作者的 Email：");
        if (!email || email === user.email) return;

        try {
            const tripRef = doc(db, 'trips', tripId);
            
            // 實作：這裡應該檢查該 Email 是否為註冊用戶，簡化為直接新增
            const newCollaborator = {
                uid: uuidv4(), // 這裡應該是該用戶的真實 UID
                email: email,
                displayName: email.split('@')[0], 
                role: 'editor',
            };

            await updateDoc(tripRef, {
                collaborators: arrayUnion(newCollaborator),
                notifications: arrayUnion({ message: `${user.displayName || user.email} 邀請了 ${email} 加入旅程。`, timestamp: new Date().toISOString() })
            });

            fetchTrip();
            showToast(`已邀請 ${email} 加入！`, 'success');
            // INFO Log
            LogService.info('Collaborator invited.', { tripId, userId: user.uid, invitedEmail: email });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'ADD_COLLABORATOR',
                tripId: tripId,
                userId: user?.uid,
                emailToInvite: email
            });
            showToast('邀請失敗，請確認 Email 格式正確。', 'error');
        }
    };

    // 文件匯入/匯出
    const handleExport = () => exportJsonToFile(trip, trip.name);
    
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const importedData = await importJsonFromFile(file);
            if (!importedData.itinerary || !importedData.expenses) {
                 throw new Error("文件內容格式不正確。");
            }

            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                itinerary: [...trip.itinerary, ...importedData.itinerary.map(item => ({...item, id: uuidv4(), creatorId: user.uid}))],
                expenses: [...trip.expenses, ...importedData.expenses.map(item => ({...item, id: uuidv4(), creatorId: user.uid}))],
                notifications: arrayUnion({ message: `${user.displayName || user.email} 導入了數據。`, timestamp: new Date().toISOString() })
            });

            showToast('數據成功導入並合併！', 'success');
            fetchTrip();
            // INFO Log
            LogService.info('Data imported and merged successfully.', { tripId, userId: user.uid });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'IMPORT_DATA',
                tripId: tripId,
                userId: user?.uid,
                fileName: file?.name
            });
            showToast(`導入失敗: ${error.message}`, 'error');
        }
    };
    
    // --- 備忘錄處理邏輯 (新功能) ---

    const handleAddMemo = async () => {
        const content = prompt("請輸入新的待辦事項或備忘錄：");
        if (!content || content.trim() === '') return;

        try {
            const newMemo = {
                id: uuidv4(),
                content: content.trim(),
                isCompleted: false,
                creatorId: user.uid,
                timestamp: new Date().toISOString(),
            };

            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                memos: arrayUnion(newMemo),
                notifications: arrayUnion({ message: `${user.displayName || user.email} 新增了待辦事項：「${content.substring(0, 20)}...」。`, timestamp: new Date().toISOString() })
            });

            showToast('備忘錄新增成功！', 'success');
            fetchTrip();
            // INFO Log
            LogService.info('New memo added.', { tripId, userId: user.uid, memoId: newMemo.id });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'ADD_MEMO',
                tripId: tripId,
                userId: user?.uid,
                content: content.substring(0, 50)
            });
            showToast('新增備忘錄失敗。', 'error');
        }
    };

    const handleToggleMemo = async (memo) => {
        try {
            const tripRef = doc(db, 'trips', tripId);
            
            // 1. 從陣列中移除舊項目
            await updateDoc(tripRef, {
                memos: arrayRemove(memo)
            });

            // 2. 新增更新後的項目
            const updatedMemo = { ...memo, isCompleted: !memo.isCompleted };
            await updateDoc(tripRef, {
                memos: arrayUnion(updatedMemo)
            });
            
            showToast(updatedMemo.isCompleted ? '事項已完成！' : '事項已重啟。', 'success');
            fetchTrip();
            // INFO Log
            LogService.info(`Memo status toggled to ${updatedMemo.isCompleted ? 'completed' : 'pending'}.`, { tripId, userId: user.uid, memoId: memo.id });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'TOGGLE_MEMO_STATUS',
                tripId: tripId,
                userId: user?.uid,
                memoId: memo.id
            });
            showToast('更新備忘錄狀態失敗。', 'error');
        }
    };

    const handleDeleteMemo = async (memo) => {
        if (!window.confirm("確定要刪除這筆備忘錄嗎？")) return;
        
        try {
            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                memos: arrayRemove(memo),
                notifications: arrayUnion({ message: `${user.displayName || user.email} 刪除了待辦事項：「${memo.content.substring(0, 20)}...」。`, timestamp: new Date().toISOString() })
            });

            showToast('備忘錄已刪除！', 'success');
            fetchTrip();
            // INFO Log
            LogService.info('Memo deleted.', { tripId, userId: user.uid, memoId: memo.id });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'DELETE_MEMO',
                tripId: tripId,
                userId: user?.uid,
                memoId: memo.id
            });
            showToast('刪除備忘錄失敗。', 'error');
        }
    };
    
    // 行程列表處理
    const allTripDates = useMemo(() => {
        if (!trip || !trip.startDate || !trip.endDate) return [];
        return getDatesArray(trip.startDate, trip.endDate);
    }, [trip]);

    const filteredItinerary = useMemo(() => {
        let items = trip?.itinerary || [];

        // 1. 日期篩選
        if (selectedDate !== 'all') {
            items = items.filter(item => item.date === selectedDate);
        }

        // 2. 排序 (按時間排序，時間相同則按創建時間)
        items.sort((a, b) => {
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            if (timeA < timeB) return -1;
            if (timeA > timeB) return 1;
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        
        // 3. 搜索篩選
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            items = items.filter(item => 
                item.activity.toLowerCase().includes(lowerCaseQuery) ||
                item.location?.toLowerCase().includes(lowerCaseQuery) ||
                item.notes?.toLowerCase().includes(lowerCaseQuery)
            );
        }

        return items;
    }, [trip?.itinerary, selectedDate, searchQuery]);
    
    // 費用列表處理
    const { sortedAndFilteredExpenses, balances, totalSpent, settlements } = useMemo(() => {
        let expenses = trip?.expenses || [];
        
        // 1. 類別篩選
        if (expenseFilterCategory !== 'all') {
            expenses = expenses.filter(exp => exp.category === expenseFilterCategory);
        }
        
        // 2. 排序
        let sorted = [...expenses];
        if (expenseSortBy === 'date') {
            sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 最新優先
        } else if (expenseSortBy === 'amount') {
            sorted.sort((a, b) => b.amount - a.amount); // 金額高至低
        } else if (expenseSortBy === 'category') {
            sorted.sort((a, b) => a.category.localeCompare(b.category)); // 類別 A-Z
        }

        // 3. 結算計算 (保持不變)
        const collaboratorMap = (trip?.collaborators || []).reduce((map, c) => {
            map[c.uid] = { displayName: c.displayName || c.email, paid: 0, spent: 0, uid: c.uid };
            return map;
        }, {});

        let total = 0;
        sorted.forEach(expense => {
            total += expense.amount;
            if (collaboratorMap[expense.payerId]) {
                collaboratorMap[expense.payerId].paid += expense.amount;
            }
        });

        const perPerson = (total / (trip?.collaborators.length || 1));
        const finalBalances = {};

        Object.values(collaboratorMap).forEach(c => {
            c.spent = perPerson;
            finalBalances[c.uid] = c.paid - c.spent;
        });
        
        const settlements = [];

        // 簡化計算，實際應用中會需要更複雜的債務優化演算法
        Object.keys(finalBalances).forEach(debtorId => {
            Object.keys(finalBalances).forEach(creditorId => {
                if (debtorId !== creditorId && finalBalances[debtorId] < 0 && finalBalances[creditorId] > 0) {
                    const debtAmount = Math.min(-finalBalances[debtorId], finalBalances[creditorId]);

                    if (debtAmount > 0.01) {
                        finalBalances[debtorId] += debtAmount;
                        finalBalances[creditorId] -= debtAmount;

                        settlements.push({
                            fromId: debtorId,
                            toId: creditorId,
                            amount: debtAmount,
                        });
                    }
                }
            });
        });

        return { 
            sortedAndFilteredExpenses: sorted, 
            balances: finalBalances,
            totalSpent: total,
            settlements: settlements,
        };
    }, [trip?.expenses, trip?.collaborators, expenseSortBy, expenseFilterCategory]);

    const getCollaboratorName = (uid) => {
        return trip?.collaborators.find(c => c.uid === uid)?.displayName || '未知用戶';
    };

    // 輔助函式：獲取行程項目邊框顏色
    const getCategoryBorderClass = (category) => {
        return ITINERARY_CATEGORY_COLORS[category] || 'border-gray-400'; 
    };

    // 輔助函式：獲取費用類別文本顏色
    const getExpenseCategoryColor = (category) => {
        return EXPENSE_CATEGORY_COLORS[category] || 'text-gray-500';
    };

    // 輔助函式：根據 UID 獲取創建者名稱或其縮寫 (用於頭像)
    const getCreatorName = useCallback((uid) => {
        if (!trip?.collaborators || !uid) return '未知';
        
        const collaborator = trip.collaborators.find(c => c.uid === uid);
        if (!collaborator) return '已離開';

        const displayName = collaborator.displayName || collaborator.email;
        const namePart = displayName.split(' ')[0];
        return namePart.charAt(0); // 返回首字母
    }, [trip?.collaborators]);

    // 輔助函式：獲取頭像背景顏色 (基於 UID hash)
    const getAvatarColor = (uid) => {
        const hash = uid ? uid.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) : 0;
        const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
        return colors[hash % colors.length];
    };

    // 圖片上傳處理
    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const photoURL = await uploadTripPhoto(file, tripId, setUploadProgress);
            
            // 圖片上傳成功後，將 URL 和元數據儲存到 Firestore 的 trip.photos 陣列中
            const newPhoto = {
                id: uuidv4(),
                url: photoURL,
                creatorId: user.uid,
                timestamp: new Date().toISOString(),
                fileName: file.name,
                size: file.size,
            };

            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                photos: arrayUnion(newPhoto),
                notifications: arrayUnion({ message: `${user.displayName || user.email} 上傳了一張新照片。`, timestamp: new Date().toISOString() })
            });

            showToast('照片上傳成功！', 'success');
            fetchTrip(); // 重新載入數據
            // INFO Log
            LogService.info('New photo uploaded.', { tripId, userId: user.uid, fileName: file.name });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'PHOTO_UPLOAD',
                tripId: tripId,
                userId: user?.uid,
                fileName: file?.name
            });
            showToast(error.message || '照片上傳失敗，請重試。', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };
    
    // 圖片刪除處理
    const handleDeletePhoto = async (photo) => {
        if (!window.confirm("確定要刪除這張照片嗎？這將會從雲端永久移除。")) return;

        try {
            // 1. 刪除 Storage 中的檔案
            const urlParts = photo.url.split('o/');
            const pathWithQuery = urlParts[1].split('?')[0];
            const storagePath = decodeURIComponent(pathWithQuery);
            
            const imageRef = ref(storage, storagePath);
            await deleteObject(imageRef);

            // 2. 刪除 Firestore 中的紀錄
            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                photos: arrayRemove(photo),
                notifications: arrayUnion({ message: `${user.displayName || user.email} 刪除了一張照片。`, timestamp: new Date().toISOString() })
            });

            showToast('照片已成功刪除！', 'success');
            fetchTrip();
            // INFO Log
            LogService.info('Photo deleted successfully.', { tripId, userId: user.uid, photoId: photo.id });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'PHOTO_DELETE',
                tripId: tripId,
                userId: user?.uid,
                photoId: photo.id
            });
            showToast('照片刪除失敗，請檢查權限或連線。', 'error');
        }
    };

    // 拖曳結束處理
    const onDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        if (!isOwner) return;

        // 僅在 'all' 模式下允許拖曳排序，否則會有索引問題
        if (selectedDate !== 'all' || searchQuery) {
            showToast('在篩選或限定日期模式下，無法更改行程順序。', 'warning');
            return;
        }

        const newItinerary = [...trip.itinerary];
        const [removed] = newItinerary.splice(result.source.index, 1);
        newItinerary.splice(result.destination.index, 0, removed);

        // 更新 Firebase
        try {
            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, { itinerary: newItinerary });
            fetchTrip();
            showToast('行程順序已更新！', 'success');
            // INFO Log
            LogService.info('Itinerary order updated by drag and drop.', { tripId, userId: user.uid });
        } catch (error) {
            // *** 整合 LogService ***
            LogService.error(error, {
                operation: 'UPDATE_ITINERARY_ORDER',
                tripId: tripId,
                userId: user?.uid
            });
            showToast('更新順序失敗。', 'error');
        }
    };

    // 處理日期切換的鍵盤邏輯
    const handleKeyDown = useCallback((event) => {
        // 確保當前沒有表單開啟，且不是在輸入框中
        if (isItineraryFormOpen || isFlightFormOpen || isExpenseFormOpen || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const dates = allTripDates;
        if (dates.length === 0) return;

        const currentIndex = selectedDate === 'all' ? -1 : dates.indexOf(selectedDate);
        let newDate = null;

        if (event.key === 'ArrowRight') {
            if (selectedDate === 'all') {
                newDate = dates[0];
            } else if (currentIndex < dates.length - 1) {
                newDate = dates[currentIndex + 1];
            }
        } else if (event.key === 'ArrowLeft') {
            if (currentIndex > 0) {
                newDate = dates[currentIndex - 1];
            } else if (currentIndex === 0) {
                newDate = 'all'; 
            }
        }

        if (newDate !== null) {
            setSelectedDate(newDate);
            event.preventDefault(); 
        }
    }, [allTripDates, selectedDate, isItineraryFormOpen, isFlightFormOpen, isExpenseFormOpen]); 

    // 註冊和清理鍵盤事件監聽器
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);


    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* Header 區域 */}
            <header className="max-w-xl mx-auto mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">{trip.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{trip.startDate} ~ {trip.endDate} ({trip.duration} 天)</p>
                </div>
                {/* 協作者管理 */}
                <div className="flex space-x-2">
                    <div className="flex -space-x-2 overflow-hidden items-center">
                        {trip.collaborators.map((c, index) => (
                            <span key={index} title={c.displayName} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-300 dark:bg-gray-600 text-center text-sm font-semibold pt-1">
                                {c.displayName ? c.displayName.charAt(0) : c.email.charAt(0)}
                            </span>
                        ))}
                    </div>
                    {isOwner && (
                        <button onClick={handleAddCollaborator} title="新增協作者"
                            className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors">
                            +
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-xl mx-auto space-y-4"> 
                {/* 旅程概覽卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        概覽 
                    </h2>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p>目的地: <span className="font-semibold">{trip.destination}</span></p>
                        <p>貨幣: <span className="font-semibold">{trip.currency}</span></p>
      在 }
                        <p>擁有者: <span className="font-semibold">{trip.ownerName}</span></p>
                    </div>
                    
                    <div className="flex justify-between mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
                        <button onClick={() => setIsAIGuideModalOpen(true)}
                            className="text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center">
                            💡 AI 旅程嚮導
                        </button>
                        <div className="flex space-x-3">
                            <button onClick={handleExport}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
      在                             輸出 (.json)
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
                            <button onClick={handleImportClick}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                導入 (.json)
                            </button>
                        </div>
                    </div>
                </div>

                {/* 目的地地圖與導航卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-green-600 dark:text-green-400">
                        📍 目的地導航
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        當前主要目的地：<span className="font-bold">{trip.destination}</span>
                    </p>
                    
                    <a 
                        href={getMapsUrl(trip.destination)} 
          在                     target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V14a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        在 Google 地圖上查看並導航
                    </a>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        * 點擊將開啟 Google 地圖 App 或網頁版。
                    </p>
                </div>


                {/* 費用追蹤與結算卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 text-red-600 dark:text-red-400">
                        💰 費用追蹤
                    </h2>
                    
                    <ExpenseChart expenses={sortedAndFilteredExpenses} currency={trip.currency} />

                    {/* 排序和篩選下拉選單 (已持久化) */}
                    <div className="flex space-x-3 pt-2">
                        <select
                            value={expenseSortBy}
                            onChange={(e) => setExpenseSortBy(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="date">依時間排序 (最新)</option>
                            <option value="amount">依金額排序 (高至低)</option>
                            <option value="category">依類別排序 (A-Z)</option>
                  在           </select>

                        <select
          在                             value={expenseFilterCategory}
                            onChange={(e) => setExpenseFilterCategory(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">所有類別</option>
                            {/* 使用導入的常數 */}
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* 最近支出 - 使用排序和篩選後的數據 */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <h3 className="text-md font-bold text-gray-700 dark:text-white mb-2">
                            支出紀錄 ({sortedAndFilteredExpenses.length} 筆)
                        </h3>
                        
                        {sortedAndFilteredExpenses.length > 0 ? (
                            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {sortedAndFilteredExpenses.map((expense) => (
                                    <li key={expense.id} 
                                        className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center 
                                                    transition-colors hover:bg-gray-200 dark:hover:bg-gray-600`}
                                        onClick={() => handleEditExpense(expense)}>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-semibold uppercase truncate ${getExpenseCategoryColor(expense.category)}`}>
                                                {expense.category || '一般'}
                                  在         </div>
                                            <div className="font-bold text-gray-800 dark:text-white truncate">
                                                {expense.description}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                                <span>{getCollaboratorName(expense.payerId)} 支付</span>
                                                {expense.creatorId && (
                                                    <span title={`${getCollaboratorName(expense.creatorId)} 創建`} 
                                                        className={`w-5 h-5 flex items-center justify-center text-xs font-semibold text-white rounded-full ${getAvatarColor(expense.creatorId)}`}>
                                                        {getCreatorName(expense.creatorId)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="font-extrabold text-lg text-red-600 dark:text-red-400">
                                                {trip.currency} {expense.amount.toLocaleString()}
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem('expense', expense); }}
                                                className="text-gray-400 hover:text-red-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">尚無支出紀錄。</p>
                        )}
                    </div>

                    {/* 結算區塊 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-2">
                            💸 最終結算 ({trip.currency} {totalSpent.toLocaleString()})
                        </h3>
                        {settlements.length > 0 ? (
                            <ul className="space-y-2">
                                {settlements.map((s, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm p-2 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                                        <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                                            {getCollaboratorName(s.fromId)} 應付
                                        </span>
                                        <span className="font-extrabold text-yellow-900 dark:text-yellow-300">
                                            {trip.currency} {s.amount.toFixed(2)}
                                        </span>
                                        <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                                            給 {getCollaboratorName(s.toId)}
          在                     </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-green-600 dark:text-green-400 font-semibold text-sm text-center">🎉 費用已結清！</p>
                        )}
                    </div>

                    <button onClick={() => setIsExpenseFormOpen(true)}
                        className="w-full mt-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg">
                        + 新增費用
                    </button>
                </div>


                {/* 圖片相簿與上傳卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400">
                        📸 共享相簿 ({trip.photos.length})
                    </h2>
                    
                    {/* 圖片列表 */}
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                        {trip.photos.length > 0 ? (
                            trip.photos.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((photo) => (
                                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-md">
                                    <img src={photo.url} alt={photo.fileName} className="w-full h-full object-cover" loading="lazy" />
                                    {/* 刪除按鈕疊層 */}
                                    <button onClick={() => handleDeletePhoto(photo)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        title="刪除照片">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-3 text-gray-500 dark:text-gray-400 text-center text-sm">還沒有照片，快來上傳第一張吧！</p>
                        )}
                    </div>

                    <input type="file" onChange={handlePhotoUpload} accept="image/*" id="photo-upload" style={{ display: 'none' }} />
                    <label htmlFor="photo-upload"
                        className="flex items-center justify-center w-full mt-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors shadow-lg cursor-pointer">
                        {uploading ? `上傳中... (${uploadProgress}%)` : '上傳新照片'}
                    </label>
                </div>

                {/* 待辦清單/備忘錄卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">
                        📝 待辦清單與備忘錄 ({trip.memos.filter(m => !m.isCompleted).length} 待辦)
                    </h2>
                    
                    {trip.memos.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {trip.memos.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((memo) => (
                                <li key={memo.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${memo.isCompleted ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                    <div className="flex items-center flex-1 min-w-0 mr-4">
                                        <input
                                            type="checkbox"
                                            checked={memo.isCompleted}
                                            onChange={() => handleToggleMemo(memo)}
      在                                       className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className={`ml-3 text-sm flex-1 ${memo.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                            {memo.content}
                                        </span>
                                    </div>
                      在               <button onClick={() => handleDeleteMemo(memo)}
                                            className="text-gray-400 hover:text-red-500 transition-colors ml-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">沒有任何備忘錄或待辦事項。</p>
    在                 )}

                    <button onClick={handleAddMemo}
                        className="w-full mt-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
                        + 新增備忘錄 / 待辦事項
                    </button>
                </div>


                {/* 行程清單卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 text-yellow-600 dark:text-yellow-400">
                        🗓️ 行程安排
                    </h2>

                    {/* 日期篩選 & 搜索 */}
                    <div className="space-y-3 mb-4">
                        {/* 橫向日期選擇器 */}
                        <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
                            <button
                                onClick={() => setSelectedDate('all')}
                                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedDate === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                全部
          在               </button>
                            {allTripDates.map(date => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedDate === date ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                >
                                    {date.substring(5)}
                                </button>
                  在           ))}
                        </div>

                        {/* 搜索框 */}
                        <input
                            type="text"
                            placeholder="搜索行程名稱、地點或備註..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* 行程列表 (D&D) */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                                    {filteredItinerary.length > 0 ? (
                                        filteredItinerary.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
        在                                               {...provided.dragHandleProps}
                                                        onClick={() => handleEditItinerary(item)}
              在                                             className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm border-l-4 ${getCategoryBorderClass(item.category)} cursor-pointer hover:shadow-lg transition-all`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                                                    {item.date} {item.time} ({getShortTimeZoneName(destinationTimeZone)})
                                                                </p>
                                                                <h3 className="text-lg font-bold truncate text-gray-800 dark:text-white">{item.activity}</h3>
                                                            </div>
                                                            <div className="flex items-center space-x-2 ml-4">
                                                                {item.creatorId && (
                                                                    <span title={`${getCollaboratorName(item.creatorId)} 創建`} 
                                                                        className={`w-6 h-6 flex items-center justify-center text-xs font-semibold text-white rounded-full ${getAvatarColor(item.creatorId)}`}>
                                                                        {getCreatorName(item.creatorId)}
                                                                    </span>
                                                                )}
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteItem('itinerary', item); }}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {item.location && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {item.location}</p>
                                                        )}
                                                        {item.notes && (
    在                                                           <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic whitespace-pre-wrap">「{item.notes}」</p>
                                                        )}
                                                    </div>
                                                )}}
                                            </Draggable>
                                        ))
                                    ) : (
                      在                           <p className="text-gray-500 dark:text-gray-400 text-center text-sm p-4">
                                                {selectedDate === 'all' ? '尚無行程安排。' : '此日期沒有行程安排。'}
                                            </p>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className="mt-4 flex space-x-3">
                        <button onClick={() => setIsItineraryFormOpen(true)}
                            className="flex-1 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg">
                            + 新增行程
                        </button>
                        <button onClick={() => setIsFlightFormOpen(true)}
                            className="py-2 px-4 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors shadow-lg">
                            ✈️ 航班
                        </button>
                    </div>
                </div>


                {/* 彈出視窗：新增/編輯行程 */}
                {isItineraryFormOpen && (
                    <ItineraryForm
                        tripId={tripId}
                        tripDetails={trip}
                        existingItem={editItem}
                        onClose={handleCloseForm}
                        onSuccess={handleFormSuccess}
                    />
                )}

                {/* 彈出視窗：新增/編輯費用 */}
                {isExpenseFormOpen && (
                    <ExpenseForm
                        tripId={tripId}
                        collaborators={trip.collaborators}
        在                         currency={trip.currency}
                        existingExpense={editItem}
                        onClose={handleCloseForm}
                        onSuccess={handleFormSuccess}
                    />
                )}
                
                {/* 彈出視窗：新增/編輯航班 (需自定義 FlightForm) */}
                {isFlightFormOpen && (
                    <FlightForm
                        tripId={tripId}
                        onClose={handleCloseForm}
                        onSuccess={handleFormSuccess}
                        // 假設 FlightForm 會自行處理數據
                    />
                )}

                {/* 彈出視窗：AI 嚮導 (需自定義 AIGuideModal) */}
                {isAIGuideModalOpen && (
                    <AIGuideModal
                        tripDetails={trip}
                        onClose={() => setIsAIGuideModalOpen(false)}
                    />
                )}


            </main>
        </div>
    );
};

export default TripDetail;
