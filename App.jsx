import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp, where, getDocs, runTransaction
} from 'firebase/firestore';
import {
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus,
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays,
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    BarChart3
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // 用於生成唯一 ID

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

// Tailwind CSS 輔助類別
const primaryColor = 'indigo-600';
const primaryBg = 'bg-indigo-600 hover:bg-indigo-700';
const secondaryBg = 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600';
const focusRing = 'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

// 顏色列表（用於支出圖表）
const categoryColors = {
    '餐飲': '#f87171', // Red 400
    '交通': '#60a5fa', // Blue 400
    '住宿': '#34d399', // Green 400
    '購物': '#facc15', // Yellow 400
    '門票/活動': '#a78bfa', // Violet 400
    '其他': '#f472b6', // Pink 400
};

// ---------------------- 輔助功能元件 ----------------------

/**
 * 顯示通知或錯誤訊息的 Toast 元件
 */
const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <Check className="w-5 h-5 text-white" /> : <AlertTriangle className="w-5 h-5 text-white" />;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 ${bgColor}`}>
            {icon}
            <span className="text-white font-medium">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-white hover:text-gray-900 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

/**
 * 模態對話框元件
 */
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()} // 阻止點擊模態框內容時關閉
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Loading 元件
 */
const LoadingSpinner = ({ isDarkMode }) => (
    <div className="flex justify-center items-center h-full min-h-[200px] p-8">
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <span className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>載入中...</span>
    </div>
);


/**
 * 預算條形圖 (替代 PieChart)
 */
const BudgetBarChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">目前沒有支出數據。</p>;
    }

    // Sort by value descending for better visual impact
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-4 pt-2">
            {sortedData.map((item, index) => {
                const percentage = (item.value / total) * 100;
                return (
                    <div key={index} className="flex flex-col">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium dark:text-gray-200 flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                {item.title}
                            </span>
                            <span className="font-semibold dark:text-white">${item.value.toFixed(0)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: item.color
                                }}
                                title={`${item.title}: $${item.value.toFixed(0)} (${percentage.toFixed(1)}%)`}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ---------------------- Firebase 資料存取路徑 ----------------------

/**
 * 取得特定行程的私有資料集合路徑
 * @param {string} collectionName 集合名稱 (e.g., 'itinerary', 'tasks', 'budget')
 * @param {string} tripId 行程 ID
 * @param {string} userId 使用者 ID
 */
const getPrivateTripCollectionPath = (collectionName, tripId, userId) => (
    `artifacts/${appId}/users/${userId}/trips/${tripId}/${collectionName}`
);

/**
 * 取得公開行程文件路徑 (所有使用者都可以讀取和寫入)
 * @param {string} tripId 行程 ID
 */
const getPublicTripDocPath = (tripId) => (
    `artifacts/${appId}/public/data/trips/${tripId}`
);

/**
 * 取得行程集合路徑
 */
const getTripsCollectionPath = () => (
    `artifacts/${appId}/public/data/trips`
);

// ---------------------- 核心元件 ----------------------

/**
 * 應用程式主 Header
 */
const Header = ({ title, userId, isDarkMode, toggleDarkMode, onBack, onTutorialStart }) => {
    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="返回"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                        <span>{title}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={onTutorialStart}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block"
                        title="應用程式教學"
                    >
                        <BookOpenText className="w-6 h-6" />
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                    <div className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-full" title={`用戶 ID: ${userId}`}>
                        <User className="w-5 h-5 inline mr-1" />
                        {userId.substring(0, 8)}...
                    </div>
                </div>
            </div>
        </header>
    );
};

/**
 * 行程卡片
 */
const TripCard = ({ trip, onSelectTrip, isDarkMode }) => {
    const tripDuration = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return '日期未定';
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${trip.startDate.substring(5)} - ${trip.endDate.substring(5)} (${diffDays} 天)`;
    }, [trip.startDate, trip.endDate]);

    const cardClass = isDarkMode
        ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
        : "bg-white hover:bg-gray-50 border-gray-200";

    return (
        <div
            className={`cursor-pointer border rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${cardClass}`}
            onClick={() => onSelectTrip(trip.id)}
        >
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2 truncate dark:text-white">{trip.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-indigo-500" />
                    {tripDuration}
                </p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">成員: {trip.members?.length || 1} 人</span>
                    <button
                        className={`text-sm font-semibold text-white py-1 px-3 rounded-full transition-colors ${primaryBg} shadow-md`}
                        onClick={(e) => { e.stopPropagation(); onSelectTrip(trip.id); }}
                    >
                        查看詳情
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 創建行程模態框
 */
const CreateTripModal = ({ isOpen, onClose, userId, authReady, showToast }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateTrip = useCallback(async (e) => {
        e.preventDefault();
        if (!authReady || !db || !name || !startDate || !endDate) {
            showToast('error', '請填寫所有欄位並確保登入。');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            showToast('error', '出發日期不能晚於結束日期。');
            return;
        }

        setIsLoading(true);
        try {
            const tripsCollection = collection(db, getTripsCollectionPath());
            await addDoc(tripsCollection, {
                name,
                startDate,
                endDate,
                ownerId: userId,
                members: [{ id: userId, name: '我' }],
                itinerary: { days: [] },
                tasks: [],
                budget: { currency: 'TWD', expenses: [] },
                createdAt: serverTimestamp(),
            });
            showToast('success', '行程建立成功！');
            onClose();
        } catch (e) {
            console.error("Error adding document: ", e);
            showToast('error', '建立行程失敗，請稍後再試。');
        } finally {
            setIsLoading(false);
            setName('');
            setStartDate('');
            setEndDate('');
        }
    }, [authReady, db, name, startDate, endDate, userId, onClose, showToast]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="建立新行程">
            <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                    <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">行程名稱</label>
                    <input
                        id="tripName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例如：日本東京五日遊"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        required
                    />
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">出發日期</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">結束日期</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${primaryBg} ${focusRing} flex justify-center items-center disabled:opacity-50`}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    建立行程
                </button>
            </form>
        </Modal>
    );
};

/**
 * 儀表板 (Dashboard)
 */
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // 過濾行程：只顯示用戶是成員或建立者的行程
    const userTrips = useMemo(() => {
        if (!userId) return [];
        return trips.filter(trip => trip.members?.some(member => member.id === userId) || trip.ownerId === userId);
    }, [trips, userId]);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
            <Header
                title="旅遊規劃儀表板"
                userId={userId}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                onTutorialStart={onTutorialStart}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {authReady ? (
                    <div className="space-y-8">
                        {/* 頂部操作區 */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">我的行程</h2>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white ${primaryBg} ${focusRing} transition-all duration-150`}
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                建立新行程
                            </button>
                        </div>

                        {/* 行程列表 */}
                        {userTrips.length === 0 ? (
                            <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">還沒有任何行程</h3>
                                <p className="text-gray-500 dark:text-gray-400">點擊上方按鈕開始規劃您的第一次旅行！</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userTrips.map(trip => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onSelectTrip={onSelectTrip}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <LoadingSpinner isDarkMode={isDarkMode} />
                )}
            </main>

            <CreateTripModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
                authReady={authReady}
                showToast={showToast}
            />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
};

/**
 * 行程詳細頁面
 */
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // 實時監聽行程數據
    useEffect(() => {
        if (!authReady || !db || !tripId) return;

        const tripRef = doc(db, getPublicTripDocPath(tripId));
        setIsLoading(true);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.log("No such trip document!");
                setTrip(null);
                onBack(); // 如果行程被刪除，則返回儀表板
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trip data: ", error);
            showToast('error', '載入行程數據失敗。');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, db, tripId, onBack, showToast]);

    if (isLoading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
                <Header title="行程規劃" userId={userId} onBack={onBack} isDarkMode={isDarkMode} />
                <LoadingSpinner isDarkMode={isDarkMode} />
            </div>
        );
    }

    if (!trip) {
        return null; // 應該被 onBack() 處理
    }

    const { name, startDate, endDate, ownerId } = trip;

    // 計算行程天數
    const days = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        let current = new Date(start);
        const dateArray = [];
        while (current <= end) {
            dateArray.push(current.toISOString().substring(0, 10));
            current.setDate(current.getDate() + 1);
        }
        return dateArray;
    }, [startDate, endDate]);

    // 檢查用戶是否為行程成員
    const isMember = trip.members?.some(m => m.id === userId);

    // ------------------- 行程規劃 (Itinerary) 邏輯 -------------------

    const ItinerarySection = () => {
        const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
        const [newItemModal, setNewItemModal] = useState({ isOpen: false, dayIndex: null });
        const [newItemName, setNewItemName] = useState('');
        const [newItemTime, setNewItemTime] = useState('');
        const [newItemType, setNewItemType] = useState('MapPin');

        const itineraryDays = trip.itinerary?.days || [];

        // 確保行程天數和數據結構一致
        const structuredItinerary = useMemo(() => {
            return days.map((dateStr, index) => {
                const existingDay = itineraryDays.find(d => d.date === dateStr);
                return {
                    date: dateStr,
                    dayNumber: index + 1,
                    items: existingDay?.items || [],
                };
            });
        }, [days, itineraryDays]);

        // 新增行程項目
        const handleAddItem = useCallback(async (dayIndex) => {
            if (!authReady || !db || !newItemName || newItemModal.dayIndex === null) return;
            const targetDay = structuredItinerary[dayIndex];

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const newItem = {
                    id: uuidv4(),
                    name: newItemName,
                    time: newItemTime || null,
                    type: newItemType,
                    createdAt: new Date().toISOString(),
                };

                const newItems = [...targetDay.items, newItem];
                const newDays = structuredItinerary.map((day, index) =>
                    index === dayIndex ? { ...day, items: newItems } : day
                );

                const itineraryUpdate = { days: newDays.map(({ date, items }) => ({ date, items })) };

                await updateDoc(tripRef, { itinerary: itineraryUpdate });
                showToast('success', '行程項目新增成功！');

                setNewItemModal({ isOpen: false, dayIndex: null });
                setNewItemName('');
                setNewItemTime('');
                setNewItemType('MapPin');
            } catch (e) {
                console.error("Error adding itinerary item: ", e);
                showToast('error', '新增行程項目失敗。');
            }
        }, [authReady, db, tripId, newItemName, newItemTime, newItemType, newItemModal.dayIndex, structuredItinerary, showToast]);

        // 刪除行程項目
        const handleDeleteItem = useCallback(async (dayIndex, itemId) => {
            if (!authReady || !db || !window.confirm('確定要刪除此行程項目嗎？')) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const targetDay = structuredItinerary[dayIndex];

                const newItems = targetDay.items.filter(item => item.id !== itemId);
                const newDays = structuredItinerary.map((day, index) =>
                    index === dayIndex ? { ...day, items: newItems } : day
                );

                const itineraryUpdate = { days: newDays.map(({ date, items }) => ({ date, items })) };
                await updateDoc(tripRef, { itinerary: itineraryUpdate });
                showToast('success', '行程項目刪除成功！');
            } catch (e) {
                console.error("Error deleting itinerary item: ", e);
                showToast('error', '刪除行程項目失敗。');
            }
        }, [authReady, db, tripId, structuredItinerary, showToast]);

        // 移動行程項目 (替代 D&D)
        const moveItineraryItem = useCallback(async (dayIndex, itemIndex, direction) => {
            if (!db || !authReady) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));

                await runTransaction(db, async (transaction) => {
                    const tripDoc = await transaction.get(tripRef);
                    if (!tripDoc.exists()) {
                        throw new Error("Trip does not exist!");
                    }

                    const tripData = tripDoc.data();
                    const days = tripData.itinerary?.days || [];
                    const dayToUpdate = days.findIndex(d => d.date === structuredItinerary[dayIndex].date);

                    if (dayToUpdate === -1) return;

                    const dayItems = days[dayToUpdate].items;
                    const newIndex = itemIndex + direction;

                    if (newIndex >= 0 && newIndex < dayItems.length) {
                        const newItems = [...dayItems];
                        // Swap elements
                        [newItems[itemIndex], newItems[newIndex]] = [newItems[newIndex], newItems[itemIndex]];

                        const newDays = [...days];
                        newDays[dayToUpdate] = { ...newDays[dayToUpdate], items: newItems };

                        transaction.update(tripRef, { itinerary: { days: newDays } });
                        showToast('success', '行程項目移動成功！');
                    }
                });
            } catch (e) {
                console.error("Error moving itinerary item: ", e);
                showToast('error', '移動行程項目失敗。');
            }
        }, [db, authReady, tripId, structuredItinerary, showToast]);


        // 圖示映射
        const iconMap = {
            MapPin: MapPin, Utensils: Utensils, Bus: Bus, ShoppingBag: ShoppingBag, Bell: Bell, NotebookPen: NotebookPen
        };
        const ItemIcon = iconMap[newItemType] || MapPin;

        const renderItineraryItem = (item, dayIndex, itemIndex, totalItems) => {
            const IconComponent = iconMap[item.type] || MapPin;

            return (
                <div
                    key={item.id}
                    className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 space-x-3 transition-shadow duration-200"
                >
                    <div className="flex-shrink-0 pt-1">
                        <IconComponent className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-lg font-semibold dark:text-white">{item.name}</p>
                        {item.time && <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {item.time}</p>}
                    </div>
                    {isMember && (
                        <div className="flex flex-col space-y-1">
                            {/* 上移按鈕 */}
                            <button
                                onClick={() => moveItineraryItem(dayIndex, itemIndex, -1)}
                                disabled={itemIndex === 0}
                                className="p-1 rounded-full text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                title="上移"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            {/* 下移按鈕 */}
                            <button
                                onClick={() => moveItineraryItem(dayIndex, itemIndex, 1)}
                                disabled={itemIndex === totalItems - 1}
                                className="p-1 rounded-full text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                title="下移"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {/* 刪除按鈕 */}
                            <button
                                onClick={() => handleDeleteItem(dayIndex, item.id)}
                                className="p-1 rounded-full text-red-400 hover:text-red-600 transition-colors"
                                title="刪除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="pt-6 space-y-8">
                {structuredItinerary.map((day, dayIndex) => (
                    <div key={day.date} className="relative">
                        <h3 className="text-xl font-bold mb-4 p-3 bg-indigo-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-white sticky top-[68px] z-5">
                            第 {day.dayNumber} 天: {day.date}
                        </h3>
                        <div className="relative border-l-4 border-indigo-200 dark:border-indigo-800 ml-5">
                            {day.items.length === 0 ? (
                                <div className="ml-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                                    此日無行程。
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {day.items.map((item, itemIndex) => (
                                        <div key={item.id} className="relative ml-8">
                                            {/* 時間軸圓點 */}
                                            <div className="absolute -left-10 top-0 mt-2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"></div>
                                            {renderItineraryItem(item, dayIndex, itemIndex, day.items.length)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isMember && (
                                <button
                                    onClick={() => setNewItemModal({ isOpen: true, dayIndex })}
                                    className="mt-4 ml-8 flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    新增項目
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* 新增行程項目 Modal */}
                <Modal
                    isOpen={newItemModal.isOpen}
                    onClose={() => setNewItemModal({ isOpen: false, dayIndex: null })}
                    title={`新增項目到 第 ${newItemModal.dayIndex !== null ? structuredItinerary[newItemModal.dayIndex]?.dayNumber : ''} 天`}
                >
                    <form onSubmit={(e) => { e.preventDefault(); handleAddItem(newItemModal.dayIndex); }} className="space-y-4">
                        <div>
                            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">項目名稱/地點</label>
                            <input
                                id="itemName"
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                                placeholder="例如：東京迪士尼樂園"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor="itemTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">時間 (選填)</label>
                                <input
                                    id="itemTime"
                                    type="time"
                                    value={newItemTime}
                                    onChange={(e) => setNewItemTime(e.target.value)}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">類型</label>
                                <select
                                    id="itemType"
                                    value={newItemType}
                                    onChange={(e) => setNewItemType(e.target.value)}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    {Object.keys(iconMap).map(key => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${primaryBg} ${focusRing} flex justify-center items-center`}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            確認新增
                        </button>
                    </form>
                </Modal>
            </div>
        );
    };

    // ------------------- 待辦事項 (Tasks) 邏輯 -------------------

    const TasksSection = () => {
        const [newTaskName, setNewTaskName] = useState('');
        const tasks = trip.tasks || [];

        // 新增待辦事項
        const handleAddTask = useCallback(async (e) => {
            e.preventDefault();
            if (!authReady || !db || !newTaskName.trim()) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const newTask = {
                    id: uuidv4(),
                    name: newTaskName,
                    isCompleted: false,
                    assignedTo: null, // 暫時不處理指派人
                    createdAt: serverTimestamp(),
                };

                await updateDoc(tripRef, {
                    tasks: [...tasks, newTask]
                });
                showToast('success', '待辦事項新增成功！');
                setNewTaskName('');
            } catch (e) {
                console.error("Error adding task: ", e);
                showToast('error', '新增待辦事項失敗。');
            }
        }, [authReady, db, tripId, newTaskName, tasks, showToast]);

        // 切換待辦事項狀態
        const handleToggleTask = useCallback(async (taskId) => {
            if (!authReady || !db) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const taskToUpdate = tasks.find(t => t.id === taskId);

                if (!taskToUpdate) return;

                const updatedTasks = tasks.map(t =>
                    t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                );

                await updateDoc(tripRef, { tasks: updatedTasks });
                showToast('success', '待辦事項狀態已更新。');
            } catch (e) {
                console.error("Error toggling task: ", e);
                showToast('error', '更新待辦事項狀態失敗。');
            }
        }, [authReady, db, tripId, tasks, showToast]);

        // 刪除待辦事項
        const handleDeleteTask = useCallback(async (taskId) => {
            if (!authReady || !db || !window.confirm('確定要刪除此待辦事項嗎？')) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const updatedTasks = tasks.filter(t => t.id !== taskId);

                await updateDoc(tripRef, { tasks: updatedTasks });
                showToast('success', '待辦事項刪除成功！');
            } catch (e) {
                console.error("Error deleting task: ", e);
                showToast('error', '刪除待辦事項失敗。');
            }
        }, [authReady, db, tripId, tasks, showToast]);

        const pendingTasks = tasks.filter(t => !t.isCompleted);
        const completedTasks = tasks.filter(t => t.isCompleted);

        return (
            <div className="pt-6 space-y-6">
                {isMember && (
                    <form onSubmit={handleAddTask} className="flex space-x-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="輸入新的待辦事項..."
                            className="flex-grow p-3 border rounded-lg dark:bg-gray-700 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            className={`px-4 py-3 rounded-lg font-semibold text-white ${primaryBg} ${focusRing} flex items-center`}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>
                )}

                {/* 待處理事項 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <ClipboardList className="w-6 h-6 mr-2 text-indigo-500" />
                        待處理 ({pendingTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingTasks.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">太棒了！所有事項都已完成。</p>
                        ) : (
                            pendingTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-b-0">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleTask(task.id)}
                                            className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                            disabled={!isMember}
                                        />
                                        <span className="ml-3 text-gray-900 dark:text-white">{task.name}</span>
                                    </div>
                                    {isMember && (
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1 rounded-full text-red-400 hover:text-red-600 transition-colors"
                                            title="刪除"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 已完成事項 */}
                {completedTasks.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Check className="w-6 h-6 mr-2 text-green-500" />
                            已完成 ({completedTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {completedTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-b-0 opacity-60">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleTask(task.id)}
                                            className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                            disabled={!isMember}
                                        />
                                        <span className="ml-3 text-gray-900 dark:text-white line-through">{task.name}</span>
                                    </div>
                                    {isMember && (
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1 rounded-full text-red-400 hover:text-red-600 transition-colors"
                                            title="刪除"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ------------------- 預算 (Budget) 邏輯 -------------------

    const BudgetSection = () => {
        const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
        const [newExpense, setNewExpense] = useState({ name: '', amount: 0, category: '餐飲' });
        const expenses = trip.budget?.expenses || [];

        const categories = Object.keys(categoryColors);

        // 處理新增支出
        const handleAddExpense = useCallback(async (e) => {
            e.preventDefault();
            if (!authReady || !db || !newExpense.name || newExpense.amount <= 0) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const expense = {
                    id: uuidv4(),
                    name: newExpense.name,
                    amount: Number(newExpense.amount),
                    category: newExpense.category,
                    paidBy: userId, // 假設是當前用戶支付
                    createdAt: serverTimestamp(),
                };

                await updateDoc(tripRef, {
                    'budget.expenses': [...expenses, expense]
                });
                showToast('success', '支出新增成功！');
                setNewExpense({ name: '', amount: 0, category: categories[0] });
                setIsAddExpenseModalOpen(false);
            } catch (e) {
                console.error("Error adding expense: ", e);
                showToast('error', '新增支出失敗。');
            }
        }, [authReady, db, tripId, newExpense, expenses, categories, userId, showToast]);

        // 處理刪除支出
        const handleDeleteExpense = useCallback(async (expenseId) => {
            if (!authReady || !db || !window.confirm('確定要刪除此筆支出嗎？')) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const updatedExpenses = expenses.filter(e => e.id !== expenseId);

                await updateDoc(tripRef, { 'budget.expenses': updatedExpenses });
                showToast('success', '支出刪除成功！');
            } catch (e) {
                console.error("Error deleting expense: ", e);
                showToast('error', '刪除支出失敗。');
            }
        }, [authReady, db, tripId, expenses, showToast]);

        // 計算總支出和按類別分組的數據
        const expenseSummary = useMemo(() => {
            const summary = {};
            let total = 0;

            expenses.forEach(expense => {
                total += expense.amount;
                summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
            });

            const chartData = Object.entries(summary).map(([category, value]) => ({
                title: category,
                value: value,
                color: categoryColors[category] || categoryColors['其他'],
            }));

            return { total, chartData };
        }, [expenses]);

        return (
            <div className="pt-6 space-y-6">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold dark:text-white">總支出：</h3>
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">${expenseSummary.total.toFixed(0)} {trip.budget?.currency || 'TWD'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 支出分佈圖 (替代 Pie Chart) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
                            支出類別分佈
                        </h3>
                        <BudgetBarChart data={expenseSummary.chartData} />
                    </div>

                    {/* 支出列表 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <PiggyBank className="w-6 h-6 mr-2 text-indigo-500" />
                                所有支出 ({expenses.length})
                            </h3>
                            {isMember && (
                                <button
                                    onClick={() => setIsAddExpenseModalOpen(true)}
                                    className={`flex items-center px-3 py-1 text-sm font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md`}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    記一筆
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">尚未記錄任何支出。</p>
                            ) : (
                                expenses.slice().sort((a, b) => b.createdAt?.toMillis ? b.createdAt.toMillis() - a.createdAt.toMillis() : (new Date(b.createdAt) - new Date(a.createdAt))).map(expense => (
                                    <div key={expense.id} className="flex justify-between items-center p-3 border-b dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[expense.category] || categoryColors['其他'] }}></div>
                                            <div>
                                                <p className="font-medium dark:text-white">{expense.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{expense.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                                ${expense.amount.toFixed(0)}
                                            </span>
                                            {isMember && (
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="p-1 rounded-full text-red-400 hover:text-red-600 transition-colors"
                                                    title="刪除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 新增支出 Modal */}
                <Modal
                    isOpen={isAddExpenseModalOpen}
                    onClose={() => setIsAddExpenseModalOpen(false)}
                    title="記錄新支出"
                >
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <div>
                            <label htmlFor="expenseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">支出項目</label>
                            <input
                                id="expenseName"
                                type="text"
                                value={newExpense.name}
                                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                                placeholder="例如：晚餐費用"
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">金額 ({trip.budget?.currency || 'TWD'})</label>
                                <input
                                    id="expenseAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">類別</label>
                                <select
                                    id="expenseCategory"
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${primaryBg} ${focusRing} flex justify-center items-center`}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            記錄支出
                        </button>
                    </form>
                </Modal>
            </div>
        );
    };

    // ------------------- 成員 (Members) 邏輯 -------------------

    const MembersSection = () => {
        const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
        const [newMemberId, setNewMemberId] = useState('');
        const members = trip.members || [];
        const isOwner = ownerId === userId;

        // 處理新增成員
        const handleAddMember = useCallback(async (e) => {
            e.preventDefault();
            if (!authReady || !db || !newMemberId.trim()) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const newMember = { id: newMemberId.trim(), name: `新成員 (${newMemberId.substring(0, 4)}...)` };

                // 防止重複添加
                if (members.some(m => m.id === newMemberId.trim())) {
                    showToast('error', '此成員已在行程中。');
                    return;
                }

                await updateDoc(tripRef, {
                    members: [...members, newMember]
                });
                showToast('success', '成員新增成功！');
                setNewMemberId('');
                setIsAddMemberModalOpen(false);
            } catch (e) {
                console.error("Error adding member: ", e);
                showToast('error', '新增成員失敗。');
            }
        }, [authReady, db, tripId, newMemberId, members, showToast]);

        // 處理移除成員
        const handleRemoveMember = useCallback(async (memberId) => {
            if (!authReady || !db || memberId === ownerId || !window.confirm('確定要移除此成員嗎？')) return;

            try {
                const tripRef = doc(db, getPublicTripDocPath(tripId));
                const updatedMembers = members.filter(m => m.id !== memberId);

                await updateDoc(tripRef, { members: updatedMembers });
                showToast('success', '成員移除成功！');
            } catch (e) {
                console.error("Error removing member: ", e);
                showToast('error', '移除成員失敗。');
            }
        }, [authReady, db, tripId, members, ownerId, showToast]);

        return (
            <div className="pt-6 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Users className="w-6 h-6 mr-2 text-indigo-500" />
                            行程成員 ({members.length})
                        </h3>
                        {isOwner && (
                            <button
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className={`flex items-center px-3 py-1 text-sm font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md`}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                新增成員
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium dark:text-white">{member.name}</p>
                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400" title={`用戶 ID: ${member.id}`}>{member.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {member.id === ownerId && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">擁有者</span>}
                                    {member.id === userId && <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-semibold">你</span>}
                                    {isOwner && member.id !== ownerId && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 rounded-full text-red-400 hover:text-red-600 transition-colors"
                                            title="移除成員"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 新增成員 Modal */}
                <Modal
                    isOpen={isAddMemberModalOpen}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    title="邀請新成員"
                >
                    <form onSubmit={handleAddMember} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">請輸入您想邀請成員的完整用戶 ID (可在其儀表板右上角找到)。</p>
                        <div>
                            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">成員 ID</label>
                            <input
                                id="memberId"
                                type="text"
                                value={newMemberId}
                                onChange={(e) => setNewMemberId(e.target.value)}
                                placeholder="輸入用戶 ID"
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${primaryBg} ${focusRing} flex justify-center items-center`}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            新增成員
                        </button>
                    </form>
                </Modal>
            </div>
        );
    };

    // ------------------- 渲染主結構 -------------------

    const TabButton = ({ tab, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center p-3 sm:p-4 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
        >
            <Icon className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0" />
            <span>{label}</span>
        </button>
    );

    const activeComponent = useMemo(() => {
        switch (activeTab) {
            case 'itinerary':
                return <ItinerarySection />;
            case 'tasks':
                return <TasksSection />;
            case 'budget':
                return <BudgetSection />;
            default:
                return <ItinerarySection />;
        }
    }, [activeTab, trip]); // 依賴 trip 確保數據更新

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
            <Header title={name} userId={userId} onBack={onBack} isDarkMode={isDarkMode} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* 行程資訊卡 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{name}</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                        <CalendarDays className="w-5 h-5 text-indigo-500" />
                        <span>{startDate} 到 {endDate} ({days.length} 天)</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">由 <span className="font-semibold">{trip.members?.find(m => m.id === ownerId)?.name || ownerId.substring(0, 8) + '...'}</span> 建立</p>
                </div>

                {/* 標籤頁導航 */}
                <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md border-b dark:border-gray-700 sticky top-[68px] z-10">
                    <nav className="flex space-x-1">
                        <TabButton tab="itinerary" icon={Map} label="行程" />
                        <TabButton tab="tasks" icon={ListTodo} label="待辦" />
                        <TabButton tab="budget" icon={Calculator} label="預算" />
                        <TabButton tab="members" icon={Users} label="成員" />
                    </nav>
                </div>

                {/* 內容區域 */}
                <div className="py-4">
                    {activeComponent}
                </div>
            </main>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
};


/**
 * 教學頁面
 */
const TutorialView = ({ onBack, isDarkMode }) => {
    const tutorialSteps = [
        {
            title: "歡迎使用旅遊規劃器",
            icon: Home,
            content: "這是一個協同旅遊規劃應用程式，您可以與朋友或家人一起規劃行程、分配任務和管理預算。所有數據都將實時同步。",
        },
        {
            title: "建立新行程",
            icon: Plus,
            content: "在『儀表板』頁面點擊右下角的『建立新行程』按鈕。只需輸入行程名稱、出發日期和結束日期即可開始。",
        },
        {
            title: "行程安排 (Itinerary)",
            icon: Map,
            content: "在『行程規劃』標籤中，您可以為每一天新增地點、活動或預訂項目。我們使用上下箭頭按鈕來調整行程項目的順序。",
        },
        {
            title: "待辦事項 (Tasks)",
            icon: ListTodo,
            content: "在『待辦』標籤中，您可以新增和管理所有旅行前的準備工作。勾選方框標記為已完成，方便您追蹤進度。",
        },
        {
            title: "預算追蹤 (Budget)",
            icon: Calculator,
            content: "在『預算』標籤中，您可以記錄每一筆支出，並按類別查看支出分佈。您可以看到誰支付了什麼，以利於後續的費用結算。",
        },
        {
            title: "協同合作 (Members)",
            icon: Users,
            content: "在『成員』標籤中，您可以透過輸入其他用戶的 ID 來邀請他們加入您的行程，與您共同編輯和查看所有規劃內容。",
        }
    ];

    const containerClass = isDarkMode
        ? "bg-gray-800 text-gray-200"
        : "bg-white text-gray-800";

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b pb-4 border-indigo-200 dark:border-indigo-700">應用程式教學</h2>

            <div className="space-y-8">
                {tutorialSteps.map((step, index) => (
                    <div key={index} className={`flex p-6 rounded-xl shadow-lg transition-shadow duration-300 ${containerClass}`}>
                        <div className="flex-shrink-0 mr-6">
                            <step.icon className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center">
                                {step.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">{step.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-center">
                <button
                    onClick={onBack}
                    className={`flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white ${primaryBg} ${focusRing} transition-all duration-150`}
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    返回儀表板
                </button>
            </div>
        </div>
    );
};


/**
 * 主應用程式元件
 */
const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 嘗試從 localStorage 載入主題設定
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // ------------------- 主題切換 -------------------

    useEffect(() => {
        // 根據 isDarkMode 狀態設定或移除 dark 類別
        const htmlElement = document.documentElement;
        if (isDarkMode) {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode);
    }, []);

    // ------------------- Firebase 認證 -------------------

    useEffect(() => {
        const handleAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }
        };

        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    setUserId(null);
                }
                setAuthReady(true);
            });

            handleAuth();
            return () => unsubscribe();
        } else {
            setAuthReady(false);
        }
    }, []);

    // ------------------- 數據訂閱 (行程列表) -------------------

    useEffect(() => {
        if (!authReady || !db || !userId) return;

        // 查詢所有公開行程（供協作）
        const tripsColRef = collection(db, getTripsCollectionPath());
        const q = query(tripsColRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // 處理 serverTimestamp 轉換
                createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips: ", error);
            // 這裡不使用 toast 以避免 Dashboard 載入時出錯
        });

        return () => unsubscribe();
    }, [authReady, db, userId]); // 依賴 authReady 和 userId

    // ------------------- 視圖切換邏輯 -------------------

    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setSelectedTripId(null);
        setCurrentView('dashboard');
    }, []);

    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
    }, []);

    // ------------------- 渲染 -------------------

    return (
        <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
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
