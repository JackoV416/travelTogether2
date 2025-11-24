// src/pages/TripDetail.jsx - 整合了所有功能和圖片相簿的最終版本

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { db, storage } from '../firebase'; // 確保導入 storage
import { ref, deleteObject } from 'firebase/storage'; // 用於刪除圖片
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
import { useToast } from '../hooks/useToast'; 
import { uploadTripPhoto } from '../utils/imageUpload'; // 導入圖片上傳邏輯
// 導入常數
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
    const [selectedDate, setSelectedDate] = useState('all'); // 'all' 或 'YYYY-MM-DD'
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
        if (!tripId || authLoading) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'trips', tripId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const tripData = docSnap.data();
                // 檢查協作者列表是否包含當前用戶
                const isCollaborator = tripData.collaborators.some(c => c.uid === user.uid);
                if (isCollaborator) {
                    // 確保 photos 陣列存在
                    if (!tripData.photos) {
                        tripData.photos = [];
                    }
                    setTrip(tripData);
                } else {
                    showToast('您無權訪問此旅程。', 'error');
                    navigate('/'); 
                }
            } else {
                showToast('找不到該旅程。', 'error');
                navigate('/');
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
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
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
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
        } catch (error) {
            console.error("Error adding collaborator:", error);
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
        } catch (error) {
            showToast(`導入失敗: ${error.message}`, 'error');
            console.error("Import error:", error);
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
        
        const debtMap = {};
        const settlements = [];

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
        // 使用導入的常數
        return ITINERARY_CATEGORY_COLORS[category] || 'border-gray-400'; 
    };

    // 輔助函式：獲取費用類別文本顏色
    const getExpenseCategoryColor = (category) => {
        // 使用導入的常數
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
        } catch (error) {
            console.error("Photo upload failed:", error);
            // 由於 uploadTripPhoto 已經提供了錯誤信息，我們直接使用
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
            // 從 URL 解析出 Storage 的路徑
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
        } catch (error) {
            console.error("Photo deletion failed:", error);
            showToast('照片刪除失敗，請檢查權限或連線。', 'error');
        }
    };

    // 拖曳結束處理
    const onDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        if (!isOwner) return;

        const newItinerary = [...trip.itinerary];
        const [removed] = newItinerary.splice(result.source.index, 1);
        newItinerary.splice(result.destination.index, 0, removed);

        // 更新 Firebase
        try {
            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, { itinerary: newItinerary });
            fetchTrip();
            showToast('行程順序已更新！', 'success');
        } catch (error) {
            console.error("Error updating itinerary order:", error);
            showToast('更新順序失敗。', 'error');
        }
    };

    // 處理日期切換的鍵盤邏輯 (步驟十五)
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
                {/* 旅程概覽卡片 (保持不變) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        概覽 
                    </h2>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p>目的地: <span className="font-semibold">{trip.destination}</span></p>
                        <p>貨幣: <span className="font-semibold">{trip.currency}</span></p>
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
                                輸出 (.json)
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
                            <button onClick={handleImportClick}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                導入 (.json)
                            </button>
                        </div>
                    </div>
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
                        </select>

                        <select
                            value={expenseFilterCategory}
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
                                            </div>
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
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                {expenseFilterCategory !== 'all' ? `在「${expenseFilterCategory}」類別中沒有找到支出。` : '目前沒有支出紀錄。'}
                            </p>
                        )}
                    </div>
                    
                    <button onClick={() => setIsExpenseFormOpen(true)}
                        className="w-full mt-4 p-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                        + 新增支出
                    </button>

                    {/* 結算資訊 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-md font-bold text-gray-700 dark:text-white mb-2">
                            結算 ({trip.currency} {totalSpent.toLocaleString()})
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {Object.entries(balances).map(([uid, balance]) => (
                                <li key={uid} className="flex justify-between">
                                    <span>{getCollaboratorName(uid)}</span>
                                    <span className={balance < 0 ? 'text-red-500' : 'text-green-500'}>
                                        {balance > 0 ? '應收' : '應付'} {Math.abs(balance).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {settlements.length > 0 && (
                             <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">建議結算方式：</h4>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                                    {settlements.map((s, index) => (
                                        <li key={index}>
                                            {getCollaboratorName(s.fromId)} 應付 {getCollaboratorName(s.toId)} {trip.currency} {s.amount.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 行程規劃卡片 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                        🗺️ 行程規劃 (當地時間)
                        <button onClick={() => setIsItineraryFormOpen(true)}
                            className="text-sm p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                            + 新增行程
                        </button>
                    </h2>
                    
                    <input type="text" placeholder="搜索活動、地點或備註..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    {/* 鍵盤提示 */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        💡 使用 ← / → 鍵快速切換日期
                    </p>

                    {/* 日期選擇器 */}
                    <div className="flex space-x-2 overflow-x-auto pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setSelectedDate('all')} 
                            className={`p-2 text-sm rounded-full whitespace-nowrap transition-colors ${selectedDate === 'all' 
                                ? 'bg-indigo-500 text-white font-bold' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            所有日期 ({trip.itinerary?.length || 0})
                        </button>
                        {allTripDates.map(date => (
                            <button key={date} onClick={() => setSelectedDate(date)}
                                className={`p-2 text-sm rounded-full whitespace-nowrap transition-colors ${selectedDate === date 
                                    ? 'bg-indigo-500 text-white font-bold' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </button>
                        ))}
                    </div>

                    {/* 行程列表 */}
                    <DragDropContext onDragEnd={isOwner ? onDragEnd : () => {}}> 
                        <Droppable droppableId="itinerary">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {filteredItinerary.length > 0 ? (
                                        filteredItinerary.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isOwner}>
                                                {(provided, snapshot) => (
                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                        onClick={() => handleEditItinerary(item)}
                                                        className={`p-3 pl-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-grab border-l-4 ${getCategoryBorderClass(item.category)}
                                                                ${snapshot.isDragging 
                                                                    ? 'shadow-2xl border-2 border-indigo-500 transform scale-[1.02] rotate-1' 
                                                                    : 'hover:shadow-lg'
                                                                }`}> 
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400">
                                                                {item.category}
                                                            </div>
                                                            <div className="font-bold text-gray-800 dark:text-white truncate">
                                                                {item.activity}
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                                                <span>{item.date}</span>
                                                                <span className="font-mono text-xs p-0.5 rounded-sm bg-gray-200 dark:bg-gray-600">
                                                                    {item.time} ({getShortTimeZoneName(destinationTimeZone)})
                                                                </span>
                                                                {/* 創建者頭像 */}
                                                                {item.creatorId && (
                                                                    <span title={`${getCollaboratorName(item.creatorId)} 創建`}
                                                                        className={`w-5 h-5 flex items-center justify-center text-xs font-semibold text-white rounded-full ${getAvatarColor(item.creatorId)}`}>
                                                                        {getCreatorName(item.creatorId)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* 編輯/刪除按鈕 */}
                                                        {isOwner && (
                                                            <div className="flex space-x-2 ml-3">
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteItem('itinerary', item); }}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            {searchQuery !== '' ? `找不到與「${searchQuery}」相關的行程。` : (selectedDate === 'all' ? '目前沒有行程項目。' : `這一天 (${selectedDate}) 沒有行程。`)}
                                        </p>
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                
                {/* 航班資訊卡片 (保持不變) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-blue-600 dark:text-blue-400">
                        ✈️ 航班/交通資訊
                        {isOwner && (
                            <button onClick={() => setIsFlightFormOpen(true)}
                                className="text-sm p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                {trip.flightInfo ? '編輯' : '+ 新增'}
                            </button>
                        )}
                    </h2>
                    
                    {trip.flightInfo ? (
                        <div className="text-gray-700 dark:text-gray-300 space-y-2">
                            <p>出發：<span className="font-semibold">{trip.flightInfo.departureAirport} ({trip.flightInfo.departureTime})</span></p>
                            <p>抵達：<span className="font-semibold">{trip.flightInfo.arrivalAirport} ({trip.flightInfo.arrivalTime})</span></p>
                            <p>航班號：<span className="font-semibold">{trip.flightInfo.flightNumber}</span></p>
                            <p>備註：<span className="font-semibold">{trip.flightInfo.notes}</span></p>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">目前沒有航班資訊。</p>
                    )}
                </div>

                {/* 圖片相簿區塊 (新功能) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-3 flex items-center justify-between text-yellow-600 dark:text-yellow-400">
                        🖼️ 旅程相簿
                    </h2>
                    
                    <div className="mb-4">
                        {/* 上傳輸入 */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoUpload}
                            disabled={uploading || !isOwner}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800 disabled:opacity-50"
                        />
                        
                        {/* 上傳進度條 */}
                        {uploading && (
                            <div className="mt-2">
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                                    上傳中 ({uploadProgress.toFixed(0)}%)
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                    <div className="bg-indigo-600 h-1.5 rounded-full" 
                                        style={{ width: `${uploadProgress}%` }}>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            * 僅限圖片，單張檔案大小限制為 5MB。
                        </p>
                    </div>
                    
                    {/* 照片畫廊 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(trip.photos || []).length > 0 ? (
                            (trip.photos || []).slice().reverse().map((photo) => ( // 反轉顯示，最新在上
                                <div key={photo.id} className="relative group overflow-hidden rounded-lg shadow-md aspect-square bg-gray-200 dark:bg-gray-700">
                                    <img src={photo.url} alt={photo.fileName || 'Trip Photo'} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onClick={() => window.open(photo.url, '_blank')} // 點擊查看大圖
                                    />
                                    
                                    {isOwner && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo); }}
                                            title="刪除照片"
                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        上傳者: {getCreatorName(photo.creatorId)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                                目前相簿中沒有照片。
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            {/* Modals 區域 */}
            <ItineraryForm
                isOpen={isItineraryFormOpen}
                onClose={handleCloseForm}
                tripId={tripId}
                currentTrip={trip}
                initialData={editItem}
                onSuccess={handleFormSuccess}
                defaultDate={selectedDate !== 'all' ? selectedDate : trip.startDate}
            />
            <ExpenseForm
                isOpen={isExpenseFormOpen}
                onClose={handleCloseForm}
                tripId={tripId}
                currentTrip={trip}
                initialData={editItem}
                onSuccess={handleFormSuccess}
            />
            <FlightForm
                isOpen={isFlightFormOpen}
                onClose={handleCloseForm}
                tripId={tripId}
                currentTrip={trip}
                onSuccess={handleFormSuccess}
            />
            <AIGuideModal
                isOpen={isAIGuideModalOpen}
                onClose={() => setIsAIGuideModalOpen(false)}
                trip={trip}
            />
        </div>
    );
};

export default TripDetail;
