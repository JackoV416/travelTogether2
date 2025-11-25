import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    Wand2
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase (確保只執行一次)
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// 設置 Firestore 日誌級別以幫助偵錯
// setLogLevel('Debug');

// --- 輔助函數 ---

/**
 * 根據用戶 ID 獲取 Trips 集合的路徑
 * @param {string} userId - 當前用戶 ID
 * @returns {import('firebase/firestore').CollectionReference}
 */
const getTripCollectionPath = (userId) => {
    // 儲存路徑為 /artifacts/{appId}/users/{userId}/trips
    return collection(db, 'artifacts', appId, 'users', userId, 'trips');
};

/**
 * 格式化貨幣顯示
 * @param {number} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return `NT$ ${Math.round(amount).toLocaleString()}`;
};

/**
 * 格式化時間，顯示小時和分鐘
 * @param {Date | import('firebase/firestore').Timestamp} timestamp 
 * @returns {string}
 */
const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// --- 共用 UI 元件 ---

/**
 * 頂部導覽列/Header 元件
 * 已移除 projectId (appId) 的顯示，並將 userId 的顯示最小化。
 */
const Header = React.memo(({ title, userId, isDarkMode, toggleDarkMode, onBack, onLogout }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-colors">
            {/* 左側：返回按鈕 / 標題 */}
            <div className="flex items-center">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="p-2 mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="返回"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                ) : (
                    <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                )}
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={title}>
                    {title}
                </h1>
            </div>

            {/* 右側：功能按鈕 */}
            <div className="flex items-center space-x-3">
                {/* 僅顯示 userId 的前四位作為簡單標示，不顯示完整 ID 或 App ID (project ID) */}
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                    {userId ? `ID: ${userId.substring(0, 4)}...` : '訪客'}
                </span>

                {/* 切換黑暗模式按鈕 */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="登出"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                )}
            </div>
        </header>
    );
});

// ... [其他元件的定義，如 LoadingSpinner, Dialog, TripDetail, Dashboard, TutorialView] ...

// 由於檔案內容很長，我將假設您其他元件（如 LoadingSpinner, Dialog, TripDetail, Dashboard, TutorialView）的定義沒有改變，並將它們包含進來。

/**
 * 加載動畫元件
 */
const LoadingSpinner = ({ isDarkMode }) => (
    <div className="flex justify-center items-center h-full min-h-[200px] p-8">
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <p className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>加載中...</p>
    </div>
);

/**
 * 簡單的對話框元件
 */
const Dialog = ({ title, content, onConfirm, onCancel, confirmText = '確定', cancelText = '取消', isConfirmDangerous = false, isDarkMode }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-sm p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h3 className="text-xl font-bold mb-4 border-b pb-2">{title}</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">{content}</p>
                <div className="flex justify-end space-x-3">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white ${isConfirmDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- TripDetail 元件 ---

/**
 * 顯示單次旅行的詳細資訊，包含行程、預算和待辦事項
 */
const TripDetail = React.memo(({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemType, setNewItemType] = useState('itinerary'); // 'itinerary', 'budget', 'todo'
    const [dialog, setDialog] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary', 'budget', 'todo'
    const tripRef = useMemo(() => authReady && userId ? doc(getTripCollectionPath(userId), tripId) : null, [tripId, userId, authReady]);

    useEffect(() => {
        if (!tripRef) return;

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTrip({ id: docSnap.id, ...data });
                setError(null);
            } else {
                setError("找不到該旅行計劃。");
                setTrip(null);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Firestore Snapshot error:", err);
            setError("加載資料時發生錯誤。");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripRef]);

    // 處理新增項目
    const handleAddItem = async (itemData) => {
        if (!tripRef) return;
        setIsAddingItem(false);
        try {
            // 使用 runTransaction 來確保操作的原子性
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(tripRef);
                if (!tripDoc.exists()) {
                    throw "旅行計劃不存在！";
                }

                const currentItems = tripDoc.data()[newItemType] || [];
                const newItem = {
                    ...itemData,
                    timestamp: serverTimestamp(),
                    id: crypto.randomUUID(), // 使用 UUID 作為子項目 ID
                };

                transaction.update(tripRef, {
                    [newItemType]: [...currentItems, newItem]
                });
            });
        } catch (e) {
            console.error("新增項目失敗:", e);
            setDialog({
                title: "新增失敗",
                content: `無法新增 ${newItemType} 項目: ${e.message || e}`,
                onConfirm: () => setDialog(null),
                isDarkMode,
            });
        }
    };

    // 處理更新項目 (例如完成待辦事項或修改行程)
    const handleUpdateItem = async (type, id, updates) => {
        if (!tripRef) return;
        try {
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(tripRef);
                if (!tripDoc.exists()) {
                    throw "旅行計劃不存在！";
                }

                const currentItems = tripDoc.data()[type] || [];
                const updatedItems = currentItems.map(item => 
                    item.id === id ? { ...item, ...updates } : item
                );

                transaction.update(tripRef, {
                    [type]: updatedItems
                });
            });
        } catch (e) {
            console.error("更新項目失敗:", e);
        }
    };

    // 處理刪除項目
    const handleDeleteItem = (type, id) => {
        setDialog({
            title: "確認刪除",
            content: `您確定要刪除此 ${type === 'itinerary' ? '行程' : type === 'budget' ? '預算' : '待辦'} 項目嗎？此操作無法撤銷。`,
            onConfirm: async () => {
                setDialog(null);
                if (!tripRef) return;

                try {
                    await runTransaction(db, async (transaction) => {
                        const tripDoc = await transaction.get(tripRef);
                        if (!tripDoc.exists()) {
                            throw "旅行計劃不存在！";
                        }

                        const currentItems = tripDoc.data()[type] || [];
                        const updatedItems = currentItems.filter(item => item.id !== id);

                        transaction.update(tripRef, {
                            [type]: updatedItems
                        });
                    });
                } catch (e) {
                    console.error("刪除項目失敗:", e);
                    setDialog({
                        title: "刪除失敗",
                        content: `無法刪除 ${type} 項目: ${e.message || e}`,
                        onConfirm: () => setDialog(null),
                        isDarkMode,
                    });
                }
            },
            onCancel: () => setDialog(null),
            isConfirmDangerous: true,
            isDarkMode,
        });
    };

    // 計算總預算
    const totalBudget = useMemo(() => {
        if (!trip || !trip.budget) return 0;
        return trip.budget.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [trip]);

    // UI 輔助函數
    const getTabClass = (tabName) => (
        `py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`
    );

    if (isLoading) return <LoadingSpinner isDarkMode={isDarkMode} />;
    if (error) return <p className="text-red-500 p-4">{error}</p>;
    if (!trip) return null;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'}`}>
            {/* Header for Trip Detail */}
            <Header
                title={trip.name}
                userId={userId} // 仍需傳遞 userId
                isDarkMode={isDarkMode}
                toggleDarkMode={() => {}} // 在詳情頁不提供切換模式
                onBack={onBack}
            />

            <main className="p-4 sm:p-6 max-w-4xl mx-auto">
                {/* 概述卡片 */}
                <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{trip.name}</h2>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                            {trip.days} 天 / {trip.cities} 城市
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{trip.description}</p>
                    <div className="flex justify-between text-sm font-medium">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-red-600 dark:text-red-400">
                            <PiggyBank className="w-4 h-4 mr-1" />
                            <span>總花費: {formatCurrency(totalBudget)}</span>
                        </div>
                    </div>
                </div>

                {/* Tab 導航 */}
                <div className={`flex justify-start space-x-2 p-2 rounded-xl mb-6 sticky top-[72px] z-10 ${isDarkMode ? 'bg-gray-900/90 backdrop-blur-sm' : 'bg-slate-50/90 backdrop-blur-sm'}`}>
                    <button className={getTabClass('itinerary')} onClick={() => setActiveTab('itinerary')}><Map className="w-4 h-4 mr-1 inline-block" /> 行程 ({trip.itinerary?.length || 0})</button>
                    <button className={getTabClass('budget')} onClick={() => setActiveTab('budget')}><Calculator className="w-4 h-4 mr-1 inline-block" /> 預算 ({trip.budget?.length || 0})</button>
                    <button className={getTabClass('todo')} onClick={() => setActiveTab('todo')}><ListTodo className="w-4 h-4 mr-1 inline-block" /> 待辦 ({trip.todo?.length || 0})</button>
                </div>

                {/* 內容區塊 */}
                <div className="space-y-6">
                    {/* 行程 Tab */}
                    {activeTab === 'itinerary' && (
                        <ItineraryList
                            items={trip.itinerary || []}
                            onDelete={(id) => handleDeleteItem('itinerary', id)}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {/* 預算 Tab */}
                    {activeTab === 'budget' && (
                        <BudgetList
                            items={trip.budget || []}
                            totalBudget={totalBudget}
                            onDelete={(id) => handleDeleteItem('budget', id)}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {/* 待辦事項 Tab */}
                    {activeTab === 'todo' && (
                        <TodoList
                            items={trip.todo || []}
                            onToggleComplete={(id, isCompleted) => handleUpdateItem('todo', id, { isCompleted })}
                            onDelete={(id) => handleDeleteItem('todo', id)}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>

                {/* 新增項目按鈕 */}
                <button
                    onClick={() => setIsAddingItem(true)}
                    className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105"
                    aria-label="新增項目"
                >
                    <Plus className="w-6 h-6" />
                </button>

                {/* 新增項目表單 (Modal) */}
                {isAddingItem && (
                    <AddItemModal
                        onClose={() => setIsAddingItem(false)}
                        onSave={handleAddItem}
                        initialType={activeTab}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* 對話框 */}
                {dialog && <Dialog {...dialog} />}
            </main>
        </div>
    );
});

// --- ItineraryList / BudgeList / TodoList / AddItemModal 元件 ---

/**
 * 行程列表元件
 */
const ItineraryList = React.memo(({ items, onDelete, isDarkMode }) => {
    const sortedItems = useMemo(() => {
        // 先按日期排序，再按時間排序 (日期是字符串，時間是 hh:mm 字符串)
        return [...items].sort((a, b) => {
            const dateA = a.date;
            const dateB = b.date;
            if (dateA !== dateB) {
                return dateA.localeCompare(dateB);
            }
            return a.time.localeCompare(b.time);
        });
    }, [items]);

    if (sortedItems.length === 0) {
        return <AlertPlaceholder message="此旅行尚未新增任何行程。" isDarkMode={isDarkMode} />;
    }

    const groupedByDate = sortedItems.reduce((acc, item) => {
        const dateKey = item.date;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    const ItineraryItemCard = ({ item }) => (
        <div className={`p-4 rounded-xl shadow-md flex items-start space-x-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            {/* 時間軸標記 */}
            <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div className="w-px h-full bg-gray-300 dark:bg-gray-700 mt-1"></div>
            </div>

            {/* 內容 */}
            <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">{item.time}</p>
                <h4 className="font-semibold text-lg truncate mb-1">{item.activity}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.location}</p>
                {item.notes && <p className="text-xs italic text-gray-500 dark:text-gray-400">{item.notes}</p>}
            </div>

            {/* 動作按鈕 */}
            <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full transition-colors flex-shrink-0"
                aria-label="刪除行程"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, activities]) => (
                <div key={date}>
                    <h3 className={`text-xl font-bold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-700 text-indigo-400' : 'border-gray-200 text-indigo-600'}`}>
                        {date} ({new Date(date).toLocaleDateString('zh-TW', { weekday: 'short' })})
                    </h3>
                    <div className="space-y-4">
                        {activities.map(item => (
                            <ItineraryItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
});

/**
 * 預算列表元件
 */
const BudgetList = React.memo(({ items, totalBudget, onDelete, isDarkMode }) => {
    if (items.length === 0) {
        return <AlertPlaceholder message="此旅行尚未新增任何預算項目。" isDarkMode={isDarkMode} />;
    }

    const BudgetCard = ({ item }) => (
        <div className={`p-4 rounded-xl shadow-md flex justify-between items-center ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            <div className="flex items-center space-x-3">
                <Utensils className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">{item.category}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <span className={`font-bold text-lg ${item.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                    {item.isExpense ? '-' : '+'}{formatCurrency(item.amount)}
                </span>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full transition-colors"
                    aria-label="刪除預算項目"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className={`p-4 rounded-xl shadow-lg border-2 ${isDarkMode ? 'bg-gray-800 border-indigo-600' : 'bg-white border-indigo-300'}`}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">總支出預估：</span>
                    <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">{formatCurrency(totalBudget)}</span>
                </div>
            </div>
            {items.map(item => (
                <BudgetCard key={item.id} item={item} />
            ))}
        </div>
    );
});

/**
 * 待辦事項列表元件
 */
const TodoList = React.memo(({ items, onToggleComplete, onDelete, isDarkMode }) => {
    if (items.length === 0) {
        return <AlertPlaceholder message="此旅行尚未新增任何待辦事項。" isDarkMode={isDarkMode} />;
    }

    const TodoCard = ({ item }) => (
        <div className={`p-4 rounded-xl shadow-md flex items-center justify-between ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors`}>
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => onToggleComplete(item.id, !item.isCompleted)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-400 dark:border-gray-600'
                    }`}
                    aria-label={item.isCompleted ? "標記為未完成" : "標記為已完成"}
                >
                    {item.isCompleted && <Check className="w-4 h-4" />}
                </button>
                <span className={`text-lg ${item.isCompleted ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {item.task}
                </span>
            </div>
            <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full transition-colors"
                aria-label="刪除待辦事項"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            {items.map(item => (
                <TodoCard key={item.id} item={item} />
            ))}
        </div>
    );
});


/**
 * 新增項目模態框
 */
const AddItemModal = ({ onClose, onSave, initialType, isDarkMode }) => {
    const [type, setType] = useState(initialType);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // 簡單驗證
        let isValid = true;
        if (type === 'itinerary' && (!formData.activity || !formData.date || !formData.time)) {
            setError("行程必須填寫活動、日期和時間。");
            isValid = false;
        } else if (type === 'budget' && (!formData.category || !formData.amount)) {
            setError("預算必須填寫類別和金額。");
            isValid = false;
        } else if (type === 'todo' && !formData.task) {
            setError("待辦事項必須填寫任務內容。");
            isValid = false;
        }

        if (isValid) {
            const finalData = { ...formData };
            if (type === 'budget') {
                finalData.amount = parseFloat(formData.amount) || 0;
                finalData.isExpense = finalData.isExpense ?? true; // 預設為支出
            }
            if (type === 'todo') {
                finalData.isCompleted = false;
            }
            onSave(finalData);
            onClose();
        }
    };

    const typeOptions = [
        { key: 'itinerary', label: '行程', icon: Map, color: 'text-indigo-500' },
        { key: 'budget', label: '預算', icon: Calculator, color: 'text-red-500' },
        { key: 'todo', label: '待辦事項', icon: ListTodo, color: 'text-green-500' },
    ];

    const TypeSelector = () => (
        <div className="flex space-x-3 mb-4">
            {typeOptions.map(option => (
                <button
                    key={option.key}
                    type="button"
                    onClick={() => { setType(option.key); setFormData({}); }}
                    className={`flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        type === option.key
                            ? 'bg-indigo-600 text-white shadow-md'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                >
                    <option.icon className={`w-4 h-4 mr-1 ${type !== option.key && option.color}`} />
                    {option.label}
                </button>
            ))}
        </div>
    );

    const ItineraryFields = () => (
        <>
            <InputField label="活動名稱" name="activity" required onChange={handleChange} isDarkMode={isDarkMode} />
            <InputField label="地點" name="location" onChange={handleChange} isDarkMode={isDarkMode} />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="日期" name="date" type="date" required onChange={handleChange} isDarkMode={isDarkMode} />
                <InputField label="時間" name="time" type="time" required onChange={handleChange} isDarkMode={isDarkMode} />
            </div>
            <InputField label="備註" name="notes" isTextArea onChange={handleChange} isDarkMode={isDarkMode} />
        </>
    );

    const BudgetFields = () => (
        <>
            <InputField label="類別" name="category" required onChange={handleChange} isDarkMode={isDarkMode} />
            <InputField label="描述" name="description" onChange={handleChange} isDarkMode={isDarkMode} />
            <InputField label="金額 (NT$)" name="amount" type="number" required onChange={handleChange} isDarkMode={isDarkMode} min="0" />
            <CheckboxField label="是支出 (取消勾選則為收入)" name="isExpense" defaultChecked onChange={handleChange} isDarkMode={isDarkMode} />
        </>
    );

    const TodoFields = () => (
        <InputField label="任務內容" name="task" required onChange={handleChange} isDarkMode={isDarkMode} />
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">新增項目</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full p-1" aria-label="關閉">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <TypeSelector />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {type === 'itinerary' && <ItineraryFields />}
                    {type === 'budget' && <BudgetFields />}
                    {type === 'todo' && <TodoFields />}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Save className="w-4 h-4 mr-1 inline-block" /> 儲存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, name, type = 'text', required, isTextArea, onChange, isDarkMode, ...props }) => {
    const inputClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
        isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;
    
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            {isTextArea ? (
                <textarea
                    name={name}
                    required={required}
                    onChange={onChange}
                    className={`${inputClasses} h-20`}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    required={required}
                    onChange={onChange}
                    className={inputClasses}
                    {...props}
                />
            )}
        </div>
    );
};

const CheckboxField = ({ label, name, onChange, isDarkMode, ...props }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            name={name}
            id={name}
            onChange={onChange}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            {...props}
        />
        <label htmlFor={name} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            {label}
        </label>
    </div>
);

const AlertPlaceholder = ({ message, isDarkMode }) => (
    <div className={`p-4 rounded-xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
        <AlertTriangle className="w-8 h-8 mb-3 text-yellow-500" />
        <p className="text-lg">{message}</p>
        <p className="text-sm mt-1">點擊右下角的 <Plus className="w-4 h-4 inline-block" /> 按鈕新增第一個項目。</p>
    </div>
);


// --- Dashboard 元件 ---

/**
 * 儀表板，顯示旅行列表
 */
const Dashboard = React.memo(({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isAddingTrip, setIsAddingTrip] = useState(false);
    const [newTripData, setNewTripData] = useState({ name: '', startDate: '', days: 1, cities: 1, description: '' });
    const [error, setError] = useState(null);
    const [dialog, setDialog] = useState(null);
    const tripsCollectionRef = useMemo(() => authReady && userId ? getTripCollectionPath(userId) : null, [userId, authReady]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTripData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTrip = async (e) => {
        e.preventDefault();
        setError(null);

        // 簡單驗證
        if (!newTripData.name || !newTripData.startDate) {
            setError("旅行名稱和開始日期是必填項。");
            return;
        }

        if (!tripsCollectionRef) {
            setError("用戶未就緒，無法儲存。");
            return;
        }

        try {
            await addDoc(tripsCollectionRef, {
                ...newTripData,
                days: parseInt(newTripData.days, 10),
                cities: parseInt(newTripData.cities, 10),
                ownerId: userId,
                createdAt: serverTimestamp(),
                // 初始化子集合陣列
                itinerary: [],
                budget: [],
                todo: [],
            });
            setIsAddingTrip(false);
            setNewTripData({ name: '', startDate: '', days: 1, cities: 1, description: '' });
        } catch (e) {
            console.error("新增旅行失敗:", e);
            setError("無法新增旅行計劃。請重試。");
        }
    };

    const handleDeleteTrip = (tripId) => {
        setDialog({
            title: "確認刪除",
            content: "您確定要永久刪除此旅行計劃嗎？此操作無法撤銷。",
            onConfirm: async () => {
                setDialog(null);
                if (!tripsCollectionRef) return;
                try {
                    await deleteDoc(doc(tripsCollectionRef, tripId));
                } catch (e) {
                    console.error("刪除旅行失敗:", e);
                    setDialog({
                        title: "刪除失敗",
                        content: `無法刪除旅行計劃: ${e.message}`,
                        onConfirm: () => setDialog(null),
                        isDarkMode,
                    });
                }
            },
            onCancel: () => setDialog(null),
            isConfirmDangerous: true,
            isDarkMode,
        });
    };

    const TripCard = ({ trip }) => (
        <div 
            className={`p-5 rounded-xl shadow-lg border-l-4 border-indigo-500 cursor-pointer flex flex-col justify-between h-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-all`}
            onClick={() => onSelectTrip(trip.id)}
        >
            <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 truncate">{trip.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{trip.description || '無描述'}</p>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>開始日期: {new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>時長: {trip.days} 天 / {trip.cities} 城市</span>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                    className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full transition-colors"
                    aria-label="刪除旅行"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'}`}>
            <Header
                title="旅行規劃儀表板"
                userId={userId}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={() => signOut(auth)}
            />

            <main className="p-4 sm:p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">您的旅行計劃 ({trips.length})</h2>
                    <div className="flex space-x-3">
                         <button
                            onClick={onTutorialStart}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-colors ${isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            應用程式教學
                        </button>
                        <button
                            onClick={() => setIsAddingTrip(true)}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新增旅行
                        </button>
                    </div>
                </div>

                {trips.length === 0 ? (
                    <div className={`p-10 rounded-xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
                        <MapPin className="w-12 h-12 mb-4 text-indigo-500" />
                        <p className="text-xl font-medium mb-2">開始您的第一次旅行規劃！</p>
                        <p className="text-md mb-4">點擊「新增旅行」按鈕來建立您的第一個行程。</p>
                        <button
                            onClick={() => setIsAddingTrip(true)}
                            className="mt-3 flex items-center px-6 py-3 text-lg font-medium rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            新增旅行
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                )}

                {/* 新增旅行 Modal */}
                {isAddingTrip && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                            <h3 className="text-xl font-bold mb-4 border-b pb-2">新增旅行計劃</h3>
                            <form onSubmit={handleAddTrip} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <InputField label="旅行名稱" name="name" required onChange={handleInputChange} isDarkMode={isDarkMode} />
                                <InputField label="開始日期" name="startDate" type="date" required onChange={handleInputChange} isDarkMode={isDarkMode} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="預計天數" name="days" type="number" min="1" required value={newTripData.days} onChange={handleInputChange} isDarkMode={isDarkMode} />
                                    <InputField label="預計城市數" name="cities" type="number" min="1" required value={newTripData.cities} onChange={handleInputChange} isDarkMode={isDarkMode} />
                                </div>
                                <InputField label="描述/筆記" name="description" isTextArea onChange={handleInputChange} isDarkMode={isDarkMode} />
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingTrip(false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Save className="w-4 h-4 mr-1 inline-block" /> 建立旅行
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* 對話框 */}
                {dialog && <Dialog {...dialog} />}
            </main>
        </div>
    );
});


// --- 教學 View 元件 ---
const TutorialView = React.memo(({ onBack, isDarkMode }) => {
    const steps = [
        { 
            title: "歡迎使用旅行規劃應用程式", 
            content: "本應用程式旨在幫助您輕鬆組織和管理您的旅行計畫，從行程到預算和待辦事項。",
            icon: Home 
        },
        { 
            title: "步驟一：建立旅行", 
            content: "在儀表板上點擊「新增旅行」按鈕，填寫旅行名稱、日期等基本資訊，即可建立您的第一個旅行計劃。",
            icon: Plus 
        },
        { 
            title: "步驟二：查看旅行詳情", 
            content: "點擊任一旅行卡片，即可進入詳情頁面，在這裡您可以管理三大核心區塊：行程、預算和待辦事項。",
            icon: NotebookPen 
        },
        { 
            title: "步驟三：規劃行程 (Itinerary)", 
            content: "在「行程」Tab 中，點擊右下角的 <Plus /> 按鈕，新增您的每日活動、地點和時間。",
            icon: Map 
        },
        { 
            title: "步驟四：管理預算 (Budget)", 
            content: "在「預算」Tab 中，紀錄所有預期支出或收入（如訂金退款），隨時掌握總花費預估。",
            icon: PiggyBank 
        },
        { 
            title: "步驟五：追蹤待辦事項 (To-do)", 
            content: "在「待辦事項」Tab 中，列出您需要完成的事項（如訂機票、換外幣），並在完成後勾選標記。",
            icon: Check 
        },
        { 
            title: "協作與數據安全", 
            content: "您的所有數據都安全地儲存在 Firestore 雲端資料庫中，並與您的用戶 ID 綁定，支援即時更新和協作。由於這是協作環境，請確保您的用戶 ID 僅用於測試。",
            icon: Users 
        },
    ];

    const StepCard = ({ step, index }) => (
        <div className={`p-5 rounded-xl shadow-lg flex space-x-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-white ${index % 2 === 0 ? 'bg-indigo-600' : 'bg-green-600'}`}>
                <step.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{index + 1}. {step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.content}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6">應用程式功能總覽</h2>
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <StepCard key={index} step={step} index={index} />
                ))}
            </div>
            <div className="flex justify-center pt-6">
                <button
                    onClick={onBack}
                    className="flex items-center px-6 py-3 text-lg font-medium rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    返回儀表板
                </button>
            </div>
        </div>
    );
});


// --- App 主元件 ---

const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // 設置 Auth 監聽器和 Firebase 初始化
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // 如果沒有用戶，則使用自定義 token 或匿名登入
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase 登入失敗:", error);
                }
            }
            // 無論是否登入成功，一旦嘗試完成，就將 authReady 設為 true
            setAuthReady(true);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 處理旅行列表的即時更新
    useEffect(() => {
        if (!authReady || !userId) return;

        const tripsCollectionRef = getTripCollectionPath(userId);
        
        // 由於 Firestore 的限制，我們將在客戶端排序
        const q = query(tripsCollectionRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 在客戶端按建立日期排序
            fetchedTrips.sort((a, b) => {
                const dateA = a.createdAt?.toMillis() || 0;
                const dateB = b.createdAt?.toMillis() || 0;
                return dateB - dateA; // 降序 (最新的在前面)
            });

            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 處理視圖切換
    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setCurrentView('dashboard');
        setSelectedTripId(null);
    }, []);
    
    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
    }, []);

    // 應用黑暗模式 CSS 類
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
                <LoadingSpinner isDarkMode={isDarkMode} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
            {currentView === 'dashboard' && (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onTutorialStart={handleStartTutorial} // 新增教學入口
                />
            )}
            
            {currentView === 'tripDetail' && (
                // TripDetail 已經在內部處理自己的 Header
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                />
            )}

            {currentView === 'tutorial' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
                    {/* 教學頁面的 Header 包含返回功能 */}
                    <Header 
                        title="應用程式教學" 
                        onBack={handleBackToDashboard} // 返回儀表板
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                    />
                    <TutorialView 
                        onBack={handleBackToDashboard} 
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}
        </div>
    );
};

export default App;
