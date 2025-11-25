import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
    // Firebase App & Init
    initializeApp 
} from 'firebase/app';
import { 
    // Firebase Auth
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, setPersistence, browserSessionPersistence 
} from 'firebase/auth';
import { 
    // Firebase Firestore
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, serverTimestamp, getDocs
} from 'firebase/firestore';
import { 
    // Lucide Icons for UI
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Check, Sun, Moon, Map, Edit, AlignLeft, BookOpenText,
    User, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    Plane, Hotel, Landmark, DollarSign, Wallet, CheckCircle, Package, Minus, Globe, Sparkles, Clock
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 (由 Canvas 環境提供) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase (確保只執行一次)
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // 可選：啟用 Firebase Firestore Debug Logging
    // setLogLevel('Debug');
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// --- 輔助函式 (Helpers) ---

// Helper: 格式化日期為 YYYY-MM-DD
const formatDate = (dateString) => {
    if (!dateString) return '';
    // 確保日期字串是 ISO 格式，避免時區問題
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
};

// Helper: 建立 Firestore Collection 路徑
const getCollectionPath = (collectionName, userId, tripId = null) => {
    // 私人數據路徑：/artifacts/{appId}/users/{userId}/<collection>
    if (tripId) {
        return `artifacts/${appId}/users/${userId}/trips/${tripId}/${collectionName}`;
    }
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

// Helper: 建立 Firestore Document 路徑
const getDocPath = (collectionName, userId, docId, tripId = null) => {
    return `${getCollectionPath(collectionName, userId, tripId)}/${docId}`;
};

// Helper: 將數字格式化為貨幣 (無小數點)
const formatCurrency = (amount, currency = 'TWD') => {
    if (typeof amount !== 'number') return 'N/A';
    return amount.toLocaleString('zh-TW', { style: 'currency', currency: currency, minimumFractionDigits: 0 });
};

// Helper: 簡單的字串轉色碼（用於用戶ID顯示）
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

// --- 配置映射 ---

// 行程類型圖標和顏色
const typeColorMap = {
    'flight': { bg: 'bg-blue-100', text: 'text-blue-600', icon: Plane, label: '航班' },
    'hotel': { bg: 'bg-red-100', text: 'text-red-600', icon: Hotel, label: '住宿' },
    'sightseeing': { bg: 'bg-green-100', text: 'text-green-600', icon: Landmark, label: '景點' },
    'food': { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Utensils, label: '餐飲' },
    'transport': { bg: 'bg-purple-100', text: 'text-purple-600', icon: Bus, label: '交通' },
    'shopping': { bg: 'bg-pink-100', text: 'text-pink-600', icon: ShoppingBag, label: '購物' },
    'other': { bg: 'bg-gray-100', text: 'text-gray-600', icon: Bell, label: '其他' },
};

// 預算類別圖標和顏色
const budgetCategoryMap = {
    'accommodation': { bg: 'bg-red-500', icon: Hotel, label: '住宿' },
    'transportation': { bg: 'bg-blue-500', icon: Bus, label: '交通' },
    'food': { bg: 'bg-green-500', icon: Utensils, label: '餐飲' },
    'activities': { bg: 'bg-purple-500', icon: Landmark, label: '活動' },
    'shopping': { bg: 'bg-pink-500', icon: ShoppingBag, label: '購物' },
    'miscellaneous': { bg: 'bg-gray-500', icon: Bell, label: '其他' },
};

// --- 通用 UI 元件 ---

/**
 * 通用 Modal 彈窗元件
 */
const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={onClose}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transition-transform scale-100 ${className}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * 確認刪除彈窗元件
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title} 
            className="max-w-md"
        >
            <div className="text-gray-700 dark:text-gray-300 mb-6">
                <AlertTriangle className="inline w-6 h-6 mr-2 text-yellow-500" />
                {message}
            </div>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    取消
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-500/50"
                >
                    確認刪除
                </button>
            </div>
        </Modal>
    );
};


/**
 * 應用程式頂部導航列元件
 */
const Header = ({ title, userId, isDarkMode, toggleDarkMode, onBack, loading = false }) => {
    // 隱藏 userColor，只顯示 ID
    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="p-2 mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            aria-label="返回"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
                        <Globe className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                        {title}
                        {loading && <Loader2 className="w-5 h-5 ml-2 animate-spin text-indigo-500" />}
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                    </button>

                    {/* User ID Display */}
                    <div className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        <User size={16} className="text-indigo-500" />
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                            ID: {userId || 'Loading...'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- 儀表板元件 (Dashboard Components) ---

/**
 * 旅程卡片元件
 */
const TripCard = ({ trip, onSelect, onDelete }) => {
    const start = formatDate(trip.startDate);
    const end = formatDate(trip.endDate);
    const dateRange = (start && end) ? `${start} ~ ${end}` : '日期未定';

    return (
        <div 
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700"
        >
            <div onClick={() => onSelect(trip.id)} className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{trip.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-4">
                    <CalendarDays size={16} className="mr-2 text-indigo-500" />
                    {dateRange}
                </p>
                <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <MapPin size={16} className="mr-2 text-teal-500" />
                        目的地: {trip.destination || '未設定'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <DollarSign size={16} className="mr-2 text-green-500" />
                        預算幣別: {trip.currency || 'TWD'}
                    </p>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(trip.id, trip.name); }}
                className="absolute top-3 right-3 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title={`刪除旅程: ${trip.name}`}
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

/**
 * 新增旅程彈窗元件
 */
const CreateTripModal = ({ isOpen, onClose, userId }) => {
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currency, setCurrency] = useState('TWD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !userId) {
            setError('旅程名稱是必填項。');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const newTrip = {
                userId: userId,
                name: name.trim(),
                destination: destination.trim(),
                startDate: startDate || null,
                endDate: endDate || null,
                currency: currency,
                createdAt: serverTimestamp(),
            };

            const tripsCollectionRef = collection(db, getCollectionPath('trips', userId));
            await addDoc(tripsCollectionRef, newTrip);

            // Reset form and close
            setName('');
            setDestination('');
            setStartDate('');
            setEndDate('');
            setCurrency('TWD');
            onClose();
        } catch (err) {
            console.error("Error creating trip:", err);
            setError(`建立旅程失敗: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新增旅程">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                        <AlertTriangle size={20} className="mr-2" />
                        {error}
                    </div>
                )}
                
                {/* 旅程名稱 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        旅程名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition"
                        placeholder="例如：日本關西賞櫻之旅"
                    />
                </div>

                {/* 目的地 */}
                <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目的地
                    </label>
                    <input
                        type="text"
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition"
                        placeholder="例如：大阪/京都"
                    />
                </div>

                {/* 日期區間 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            開始日期
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            結束日期
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition"
                        />
                    </div>
                </div>

                {/* 幣別 */}
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        主要預算幣別
                    </label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition appearance-none"
                    >
                        <option value="TWD">TWD (新臺幣)</option>
                        <option value="USD">USD (美元)</option>
                        <option value="JPY">JPY (日圓)</option>
                        <option value="EUR">EUR (歐元)</option>
                        <option value="CNY">CNY (人民幣)</option>
                        <option value="HKD">HKD (港幣)</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 flex items-center"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Plus size={20} className="mr-1" />}
                        建立旅程
                    </button>
                </div>
            </form>
        </Modal>
    );
};


/**
 * 儀表板主介面
 */
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);
    const [loading, setLoading] = useState(!authReady);

    useEffect(() => {
        // 只有在 authReady 狀態改變時才更新 loading 狀態
        if (authReady) {
             setLoading(false);
        } else {
            setLoading(true);
        }
    }, [authReady]);

    const handleDeleteClick = (tripId, tripName) => {
        setTripToDelete({ id: tripId, name: tripName });
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteTrip = async () => {
        if (!tripToDelete) return;
        setIsConfirmModalOpen(false);
        setLoading(true); // 開始刪除時顯示 loading

        try {
            const tripDocRef = doc(db, getDocPath('trips', userId, tripToDelete.id));
            
            // 手動刪除子集合中的所有文件 (Firestore 不支援級聯刪除)
            const subcollections = ['itinerary', 'budget', 'packing'];
            for (const collectionName of subcollections) {
                const subCollectionRef = collection(db, getCollectionPath(collectionName, userId, tripToDelete.id));
                const snapshot = await getDocs(subCollectionRef);
                const batch = [];
                snapshot.forEach(doc => {
                    batch.push(deleteDoc(doc.ref));
                });
                await Promise.all(batch);
            }

            // 最後刪除主文件
            await deleteDoc(tripDocRef);
            console.log("Trip and subcollections deleted successfully.");
        } catch (err) {
            console.error("Error deleting trip:", err);
            // 這裡可以新增一個錯誤提示給用戶
        } finally {
            setTripToDelete(null);
            setLoading(false);
        }
    };

    // 過濾和排序旅程 (按開始日期排序，未定日期的在最後)
    const sortedTrips = useMemo(() => {
        if (!trips) return [];
        return [...trips].sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate) : new Date(8640000000000000); // 最大時間
            const dateB = b.startDate ? new Date(b.startDate) : new Date(8640000000000000);
            return dateA - dateB;
        });
    }, [trips]);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header 
                title="我的旅程儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                loading={loading}
            />
            
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        規劃我的下一趟旅程
                    </h2>
                    <div className='flex space-x-3'>
                        <button
                            onClick={onTutorialStart}
                            className="flex items-center px-4 py-2 bg-teal-500 text-white font-medium rounded-lg shadow-md hover:bg-teal-600 transition duration-150 text-sm"
                        >
                            <BookOpenText size={20} className="mr-2 hidden sm:inline" />
                            使用教學
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 text-sm"
                        >
                            <Plus size={20} className="mr-2 hidden sm:inline" />
                            新增旅程
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">正在載入旅程資料...</span>
                    </div>
                )}

                {!loading && sortedTrips.length === 0 && (
                    <div className="text-center p-10 border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                        <MapPin size={48} className="mx-auto text-indigo-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">還沒有規劃任何旅程！</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">點擊「新增旅程」或「使用教學」開始您的第一次規劃吧。</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150"
                        >
                            開始規劃
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading && sortedTrips.map(trip => (
                        <TripCard 
                            key={trip.id} 
                            trip={trip} 
                            onSelect={onSelectTrip} 
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            </div>

            <CreateTripModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                userId={userId} 
                isDarkMode={isDarkMode}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeleteTrip}
                title="確認刪除旅程"
                message={`您確定要刪除旅程「${tripToDelete?.name || ''}」嗎？此操作將永久刪除所有相關行程、預算和清單資料。`}
            />
        </div>
    );
};

// --- 旅程詳情元件 (TripDetail Components) ---

/**
 * 行程項目卡片
 */
const ItineraryItem = ({ item, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(item);
    const { icon: Icon } = typeColorMap[item.type] || typeColorMap['other'];

    const handleSave = async () => {
        if (!editData.name.trim() || !editData.date.trim()) return;
        setIsEditing(false);
        await onUpdate(item.id, editData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 border-l-4 border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-800 rounded-r-lg shadow-sm mb-4 transition duration-200 hover:shadow-md">
            {isEditing ? (
                <div className="space-y-3">
                    <input 
                        type="text" name="name" value={editData.name} onChange={handleChange}
                        className="w-full text-lg font-semibold px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="活動名稱" required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="date" name="date" value={editData.date} onChange={handleChange}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required
                        />
                        <input 
                            type="time" name="time" value={editData.time} onChange={handleChange}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <textarea 
                        name="notes" value={editData.notes} onChange={handleChange}
                        rows="2"
                        className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="備註/地點/訂位資訊"
                    />
                    <select name="type" value={editData.type} onChange={handleChange} className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 appearance-none">
                        {Object.keys(typeColorMap).map(key => (
                            <option key={key} value={key}>{typeColorMap[key].label}</option>
                        ))}
                    </select>

                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsEditing(false)} className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X size={20} /></button>
                        <button onClick={handleSave} className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"><Save size={20} /></button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center mb-1">
                            <Icon size={20} className={`mr-2 ${typeColorMap[item.type]?.text || 'text-gray-600'}`} />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex flex-wrap gap-x-3">
                            {item.date && (
                                <span className="flex items-center">
                                    <CalendarDays size={14} className="inline mr-1" />
                                    {formatDate(item.date)}
                                </span>
                            )}
                            {item.time && (
                                <span className="flex items-center">
                                    <Clock size={14} className="inline mr-1" />
                                    {item.time}
                                </span>
                            )}
                        </p>
                        {item.notes && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.notes}</p>
                        )}
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => setIsEditing(true)} className="p-1 rounded-full text-indigo-500 hover:bg-indigo-100 dark:hover:bg-gray-700"><Edit size={18} /></button>
                        <button onClick={() => onDelete(item.id, item.name)} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-gray-700"><Trash2 size={18} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * 行程規劃 Tab
 */
const ItineraryTab = ({ tripId, userId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', date: formatDate(new Date()), time: '', notes: '', type: 'sightseeing' });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // 格式化和分類行程
    const groupedItems = useMemo(() => {
        const groups = {};
        items.forEach(item => {
            const dateKey = item.date || '未定日期';
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });

        // 排序：未定日期在最後
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === '未定日期') return 1;
            if (b === '未定日期') return -1;
            return new Date(a) - new Date(b);
        });

        // 在每個日期組內，按時間排序
        const sortedGroups = {};
        sortedKeys.forEach(key => {
            sortedGroups[key] = groups[key].sort((a, b) => {
                const timeA = a.time || '23:59';
                const timeB = b.time || '23:59';
                if (timeA < timeB) return -1;
                if (timeA > timeB) return 1;
                return 0;
            });
        });

        return sortedGroups;
    }, [items]);

    useEffect(() => {
        if (!userId || !tripId) return;
        setLoading(true);

        const path = getCollectionPath('itinerary', userId, tripId);
        const q = query(collection(db, path)); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(newItems);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching itinerary:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim() || !userId || !tripId || !newItem.date) return;

        try {
            const itemsCollectionRef = collection(db, getCollectionPath('itinerary', userId, tripId));
            await addDoc(itemsCollectionRef, {
                ...newItem,
                name: newItem.name.trim(),
                notes: newItem.notes.trim(),
                createdAt: serverTimestamp(),
            });

            setNewItem({ name: '', date: formatDate(new Date()), time: '', notes: '', type: 'sightseeing' });
            setIsAdding(false);
        } catch (err) {
            console.error("Error adding itinerary item:", err);
        }
    };

    const handleUpdateItem = async (itemId, data) => {
        try {
            const itemDocRef = doc(db, getDocPath('itinerary', userId, itemId, tripId));
            await updateDoc(itemDocRef, data);
        } catch (err) {
            console.error("Error updating itinerary item:", err);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        setIsConfirmModalOpen(false);
        try {
            const itemDocRef = doc(db, getDocPath('itinerary', userId, itemToDelete.id, tripId));
            await deleteDoc(itemDocRef);
        } catch (err) {
            console.error("Error deleting itinerary item:", err);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDeleteClick = (itemId, itemName) => {
        setItemToDelete({ id: itemId, name: itemName });
        setIsConfirmModalOpen(true);
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
                {isAdding ? <Minus size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                {isAdding ? '取消新增' : '新增行程項目'}
            </button>

            {isAdding && (
                <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg shadow-inner">
                    <form onSubmit={handleAddItem} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                                type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-500"
                                placeholder="活動名稱 (必填)" required
                            />
                            <select value={newItem.type} onChange={(e) => setNewItem({...newItem, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white appearance-none">
                                {Object.keys(typeColorMap).map(key => (
                                    <option key={key} value={key}>{typeColorMap[key].label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="date" value={newItem.date} onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white" required
                            />
                            <input 
                                type="time" value={newItem.time} onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <textarea 
                            value={newItem.notes} onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                            rows="2" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-500"
                            placeholder="備註/地址/訂位資訊"
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
                                <Save size={18} className="mr-1" />
                                儲存行程
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {Object.keys(groupedItems).length === 0 && !isAdding && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <AlignLeft size={36} className="mx-auto mb-3" />
                    <p>尚未有任何行程規劃。點擊「新增行程項目」開始安排活動！</p>
                </div>
            )}

            {Object.entries(groupedItems).map(([date, items]) => (
                <div key={date} className="relative">
                    <h3 className="sticky top-[73px] z-30 text-xl font-bold py-2 px-3 mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 shadow-md">
                        {date === '未定日期' ? '未定日期行程' : formatDate(date)}
                    </h3>
                    <div className="space-y-4">
                        {items.map(item => (
                            <ItineraryItem 
                                key={item.id} 
                                item={item} 
                                onUpdate={handleUpdateItem} 
                                onDelete={handleDeleteClick} 
                            />
                        ))}
                    </div>
                </div>
            ))}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteItem}
                title="確認刪除行程"
                message={`您確定要刪除行程「${itemToDelete?.name || ''}」嗎？`}
            />
        </div>
    );
};

/**
 * 預算項目卡片
 */
const BudgetEntry = ({ entry, onUpdate, onDelete, currency }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(entry);
    const { icon: Icon, bg: bgColor, label } = budgetCategoryMap[entry.category] || budgetCategoryMap['miscellaneous'];
    const amountClass = entry.isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

    const handleSave = async () => {
        if (!editData.description.trim() || typeof editData.amount !== 'number' || editData.amount <= 0) return;
        setIsEditing(false);
        await onUpdate(entry.id, editData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (name === 'amount' ? parseFloat(value) || 0 : value) 
        }));
    };

    return (
        <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition duration-200 hover:shadow-md">
            {isEditing ? (
                <div className="flex-1 space-y-2">
                    <input 
                        type="text" name="description" value={editData.description} onChange={handleChange}
                        className="w-full text-lg font-semibold px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="描述"
                    />
                    <div className="grid grid-cols-2 gap-2">
                         <input 
                            type="number" name="amount" value={editData.amount} onChange={handleChange}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="金額" min="0.01" step="any"
                        />
                        <select name="category" value={editData.category} onChange={handleChange} className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 appearance-none">
                            {Object.keys(budgetCategoryMap).map(key => (
                                <option key={key} value={key}>{budgetCategoryMap[key].label}</option>
                            ))}
                        </select>
                    </div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            name="isExpense"
                            checked={editData.isExpense}
                            onChange={handleChange}
                            className="form-checkbox h-4 w-4 text-indigo-600 rounded dark:bg-gray-600 dark:border-gray-500 mr-2"
                        />
                        設為支出 (勾選為支出，不勾選為收入)
                    </label>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsEditing(false)} className="p-1 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X size={20} /></button>
                        <button onClick={handleSave} className="p-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"><Save size={20} /></button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`p-3 rounded-full mr-4 text-white ${bgColor}`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label} ({formatDate(entry.date)})</p>
                    </div>
                    <div className="text-right mr-4">
                        <p className={`font-semibold ${amountClass}`}>
                            {entry.isExpense ? '-' : '+'} {formatCurrency(entry.amount, currency)}
                        </p>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => setIsEditing(true)} className="p-1 rounded-full text-indigo-500 hover:bg-indigo-100 dark:hover:bg-gray-700"><Edit size={18} /></button>
                        <button onClick={() => onDelete(entry.id, entry.description)} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-gray-700"><Trash2 size={18} /></button>
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * 預算管理 Tab
 */
const BudgetTab = ({ tripId, userId, currency = 'TWD' }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = useState({ description: '', amount: '', category: 'accommodation', isExpense: true, date: formatDate(new Date()) });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    useEffect(() => {
        if (!userId || !tripId) return;
        setLoading(true);

        const path = getCollectionPath('budget', userId, tripId);
        const q = query(collection(db, path)); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newEntries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                amount: doc.data().amount || 0, // 確保 amount 是數字
            }));
            setEntries(newEntries);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching budget:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId]);

    // 計算總餘額、總收入和總支出
    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;

        entries.forEach(entry => {
            if (entry.isExpense) {
                expense += entry.amount;
            } else {
                income += entry.amount;
            }
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
        };
    }, [entries]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newEntry.description.trim() || !userId || !tripId || !newEntry.amount || parseFloat(newEntry.amount) <= 0) return;

        try {
            const budgetCollectionRef = collection(db, getCollectionPath('budget', userId, tripId));
            await addDoc(budgetCollectionRef, {
                ...newEntry,
                description: newEntry.description.trim(),
                amount: parseFloat(newEntry.amount), // 確保儲存為數字
                createdAt: serverTimestamp(),
            });

            setNewEntry({ description: '', amount: '', category: 'accommodation', isExpense: true, date: formatDate(new Date()) });
            setIsAdding(false);
        } catch (err) {
            console.error("Error adding budget entry:", err);
        }
    };

    const handleUpdateItem = async (entryId, data) => {
        try {
            const entryDocRef = doc(db, getDocPath('budget', userId, entryId, tripId));
            await updateDoc(entryDocRef, {
                ...data,
                description: data.description.trim(),
                amount: parseFloat(data.amount),
            });
        } catch (err) {
            console.error("Error updating budget entry:", err);
        }
    };

    const handleDeleteItem = async () => {
        if (!entryToDelete) return;
        setIsConfirmModalOpen(false);
        try {
            const entryDocRef = doc(db, getDocPath('budget', userId, entryToDelete.id, tripId));
            await deleteDoc(entryDocRef);
        } catch (err) {
            console.error("Error deleting budget entry:", err);
        } finally {
            setEntryToDelete(null);
        }
    };

    const handleDeleteClick = (entryId, entryName) => {
        setEntryToDelete({ id: entryId, name: entryName });
        setIsConfirmModalOpen(true);
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6">
            {/* 總覽卡片 */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-600 p-4 rounded-xl shadow-lg text-white">
                    <div className="flex items-center space-x-2">
                        <Wallet size={24} />
                        <p className="text-sm font-medium opacity-80">總餘額 ({currency})</p>
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold mt-1 ${balance < 0 ? 'text-red-300' : 'text-green-300'}`}>
                        {formatCurrency(balance, currency)}
                    </p>
                </div>
                <div className="bg-green-500 p-4 rounded-xl shadow-lg text-white">
                    <div className="flex items-center space-x-2">
                        <Plus size={24} />
                        <p className="text-sm font-medium opacity-80">總收入 ({currency})</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(totalIncome, currency)}</p>
                </div>
                <div className="bg-red-500 p-4 rounded-xl shadow-lg text-white">
                    <div className="flex items-center space-x-2">
                        <Minus size={24} />
                        <p className="text-sm font-medium opacity-80">總支出 ({currency})</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(totalExpense, currency)}</p>
                </div>
            </div>

            <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
                {isAdding ? <Minus size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                {isAdding ? '取消新增紀錄' : '新增收支紀錄'}
            </button>

            {isAdding && (
                <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg shadow-inner">
                    <form onSubmit={handleAddItem} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                                type="text" name="description" value={newEntry.description} onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-500"
                                placeholder="描述 (例如：機票, 晚餐)" required
                            />
                            <select name="category" value={newEntry.category} onChange={(e) => setNewEntry({...newEntry, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white appearance-none">
                                {Object.keys(budgetCategoryMap).map(key => (
                                    <option key={key} value={key}>{budgetCategoryMap[key].label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <input 
                                type="number" name="amount" value={newEntry.amount} onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                placeholder="金額 (必填)" required min="0.01" step="any"
                            />
                            <input 
                                type="date" name="date" value={newEntry.date} onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            />
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    name="isExpense"
                                    checked={newEntry.isExpense}
                                    onChange={(e) => setNewEntry({...newEntry, isExpense: e.target.checked})}
                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded dark:bg-gray-600 dark:border-gray-500 mr-2"
                                />
                                設為支出
                            </label>
                        </div>
                        
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
                                <Save size={18} className="mr-1" />
                                儲存紀錄
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">交易紀錄</h3>
            <div className="space-y-3">
                {sortedEntries.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <PiggyBank size={36} className="mx-auto mb-3" />
                        <p>尚未有任何收支紀錄。開始記錄您的花費和收入吧！</p>
                    </div>
                ) : (
                    sortedEntries.map(entry => (
                        <BudgetEntry
                            key={entry.id}
                            entry={entry}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteClick}
                            currency={currency}
                        />
                    ))
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteItem}
                title="確認刪除紀錄"
                message={`您確定要刪除收支紀錄「${entryToDelete?.name || ''}」嗎？`}
            />
        </div>
    );
};

/**
 * 打包項目卡片
 */
const PackingItem = ({ item, onUpdate, onDelete }) => {
    const handleToggle = () => {
        onUpdate(item.id, { isChecked: !item.isChecked });
    };

    return (
        <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition duration-200 hover:shadow-md">
            <button
                onClick={handleToggle}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 transition duration-200 ${item.isChecked 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-400 dark:border-gray-600 text-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={item.isChecked ? '標記為未打包' : '標記為已打包'}
            >
                <Check size={16} className="mx-auto" />
            </button>
            <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.isChecked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'} transition duration-200`}>
                    {item.name}
                </p>
                {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.notes}</p>
                )}
            </div>
            <button
                onClick={() => onDelete(item.id, item.name)}
                className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 transition"
                title="刪除項目"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

/**
 * 打包清單 Tab
 */
const PackingTab = ({ tripId, userId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (!userId || !tripId) return;
        setLoading(true);

        const path = getCollectionPath('packing', userId, tripId);
        // 使用 onSnapshot 監聽即時更新
        const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
            const newItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(newItems);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching packing list:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim() || !userId || !tripId) return;

        try {
            const packingCollectionRef = collection(db, getCollectionPath('packing', userId, tripId));
            await addDoc(packingCollectionRef, {
                name: newItemName.trim(),
                notes: newItemNotes.trim(),
                isChecked: false,
                createdAt: serverTimestamp(),
            });

            setNewItemName('');
            setNewItemNotes('');
        } catch (err) {
            console.error("Error adding packing item:", err);
        }
    };

    const handleUpdateItem = async (itemId, data) => {
        try {
            const itemDocRef = doc(db, getDocPath('packing', userId, itemId, tripId));
            await updateDoc(itemDocRef, data);
        } catch (err) {
            console.error("Error updating packing item:", err);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        setIsConfirmModalOpen(false);
        try {
            const itemDocRef = doc(db, getDocPath('packing', userId, itemToDelete.id, tripId));
            await deleteDoc(itemDocRef);
        } catch (err) {
            console.error("Error deleting packing item:", err);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDeleteClick = (itemId, itemName) => {
        setItemToDelete({ id: itemId, name: itemName });
        setIsConfirmModalOpen(true);
    };

    const { packed, unpacked } = useMemo(() => {
        const p = items.filter(item => item.isChecked);
        const u = items.filter(item => !item.isChecked);
        // 按名稱排序
        const sortByName = (a, b) => a.name.localeCompare(b.name, 'zh-TW');
        return { packed: p.sort(sortByName), unpacked: u.sort(sortByName) };
    }, [items]);

    const totalItems = items.length;
    const packedCount = packed.length;
    const progress = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            {/* 進度條 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">打包進度</h3>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">已打包 {packedCount} / 共 {totalItems} 項</p>
            </div>

            {/* 新增項目 */}
            <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg shadow-inner">
                <form onSubmit={handleAddItem} className="space-y-3">
                    <div className="flex space-x-3">
                        <input 
                            type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-500"
                            placeholder="打包項目名稱 (必填)" required
                        />
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
                            <Plus size={18} className="mr-1" />
                            新增
                        </button>
                    </div>
                    <input 
                        type="text" value={newItemNotes} onChange={(e) => setNewItemNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white placeholder-gray-500"
                        placeholder="備註/數量"
                    />
                </form>
            </div>

            {totalItems === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <ClipboardList size={36} className="mx-auto mb-3" />
                    <p>您的打包清單是空的。新增一些旅行必需品吧！</p>
                </div>
            )}

            {/* 未打包清單 */}
            {unpacked.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ListTodo size={20} className="mr-2 text-red-500" />
                        未打包 ({unpacked.length})
                    </h3>
                    {unpacked.map(item => (
                        <PackingItem
                            key={item.id}
                            item={item}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* 已打包清單 */}
            {packed.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CheckCircle size={20} className="mr-2 text-green-500" />
                        已打包 ({packed.length})
                    </h3>
                    {packed.map(item => (
                        <PackingItem
                            key={item.id}
                            item={item}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteItem}
                title="確認刪除項目"
                message={`您確定要從清單中刪除「${itemToDelete?.name || ''}」嗎？`}
            />
        </div>
    );
};


/**
 * 旅程詳情主元件
 */
const TripDetail = ({ tripId, onBack, userId, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary', 'budget', 'packing'

    // Fetch Trip Metadata
    useEffect(() => {
        if (!userId || !tripId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, getDocPath('trips', userId, tripId));
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
                setLoading(false);
            } else {
                console.warn("Trip not found, returning to dashboard.");
                onBack(); // 如果旅程不存在，返回儀表板
            }
        }, (error) => {
            console.error("Error fetching trip detail:", error);
            // 這裡可以新增錯誤提示
        });

        return () => unsubscribe();
    }, [tripId, userId, onBack]);

    const tabClasses = (tabName) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap
         ${activeTab === tabName 
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 shadow-t' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-b-2 border-transparent'
        }`;

    if (loading) return (
        <div className="min-h-screen flex flex-col">
            <Header 
                title="載入旅程..." 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={()=>{}} 
                onBack={onBack}
                loading={true}
            />
             <div className="flex justify-center items-center flex-grow">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        </div>
    );
    
    if (!trip) return null;

    const tripDates = (trip.startDate && trip.endDate) ? 
        `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` : 
        '日期未定';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* 頂部 Header & 旅程資訊 */}
            <Header 
                title={trip.name} 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={()=>{}} 
                onBack={onBack}
            />

            {/* 旅程概覽 */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{trip.name}</p>
                    <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-400 space-x-4">
                        <span className='flex items-center'><MapPin size={16} className="mr-1 text-teal-500" />{trip.destination || '目的地未定'}</span>
                        <span className='flex items-center'><CalendarDays size={16} className="mr-1 text-indigo-500" />{tripDates}</span>
                        <span className='flex items-center'><DollarSign size={16} className="mr-1 text-green-500" />預算幣別: {trip.currency || 'TWD'}</span>
                    </div>
                </div>
            </div>

            {/* Tab 切換 */}
            <div className="sticky top-[73px] z-30 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto">
                    <button onClick={() => setActiveTab('itinerary')} className={tabClasses('itinerary')}>
                        <AlignLeft size={18} className="inline mr-1" /> 行程規劃
                    </button>
                    <button onClick={() => setActiveTab('budget')} className={tabClasses('budget')}>
                        <PiggyBank size={18} className="inline mr-1" /> 預算管理
                    </button>
                    <button onClick={() => setActiveTab('packing')} className={tabClasses('packing')}>
                        <ClipboardList size={18} className="inline mr-1" /> 打包清單
                    </button>
                </div>
            </div>

            {/* 內容區塊 */}
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {activeTab === 'itinerary' && (
                    <ItineraryTab tripId={tripId} userId={userId} isDarkMode={isDarkMode} />
                )}
                {activeTab === 'budget' && (
                    <BudgetTab tripId={tripId} userId={userId} isDarkMode={isDarkMode} currency={trip.currency} />
                )}
                {activeTab === 'packing' && (
                    <PackingTab tripId={tripId} userId={userId} isDarkMode={isDarkMode} />
                )}
            </div>
        </div>
    );
};

// --- 教學元件 (Tutorial Components) ---

/**
 * 應用程式教學視圖
 */
const TutorialView = ({ onBack }) => {
    const tutorialSteps = [
        {
            icon: Globe,
            title: "1. 儀表板總覽",
            description: "這是應用程式的起點。您可以在這裡查看所有已建立的旅程，點擊旅程卡片進入詳情頁面，或點擊「新增旅程」開始新的規劃。",
            color: "text-indigo-500",
        },
        {
            icon: Plus,
            title: "2. 建立新旅程",
            description: "在新增旅程視窗中，填寫旅程名稱、目的地、日期和主要預算幣別。這些資訊將作為您規劃的基礎。",
            color: "text-green-500",
        },
        {
            icon: AlignLeft,
            title: "3. 行程規劃 (Itinerary)",
            description: "在行程規劃頁面，您可以按日期新增各種活動，包括航班、住宿、景點、餐飲等。您可以隨時編輯或刪除項目，並按日期和時間排序。",
            color: "text-blue-500",
        },
        {
            icon: PiggyBank,
            title: "4. 預算管理 (Budget)",
            description: "此頁面用於追蹤您的旅行開支和收入。您可以設定幣別，新增支出或收入紀錄，並即時查看總餘額、總收入和總支出，確保不超支。",
            color: "text-red-500",
        },
        {
            icon: ClipboardList,
            title: "5. 打包清單 (Packing)",
            description: "建立您的旅行打包清單。您可以新增物品，標記已打包/未打包，並追蹤您的整體打包進度，避免遺漏重要物品。",
            color: "text-yellow-500",
        },
        {
            icon: Sun,
            title: "6. 深色模式",
            description: "應用程式支援深色模式。點擊右上角的太陽/月亮圖標，隨時在淺色和深色模式間切換，保護您的眼睛。",
            color: "text-teal-500",
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">旅遊規劃應用程式快速導覽</h2>
            
            <div className="space-y-8">
                {tutorialSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div 
                            key={index} 
                            className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-indigo-500 dark:border-indigo-400"
                        >
                            <div className={`flex-shrink-0 p-3 rounded-full ${step.color} bg-indigo-50 dark:bg-gray-700`}>
                                <Icon size={28} />
                            </div>
                            <div className="ml-4">
                                <h3 className={`text-xl font-bold ${step.color} mb-1`}>{step.title}</h3>
                                <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">現在，您可以開始規劃您的夢想旅程了！</p>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 flex items-center mx-auto"
                >
                    <Home size={20} className="mr-2" />
                    返回儀表板
                </button>
            </div>
        </div>
    );
};


// --- 主應用程式元件 ---
const App = () => {
    // 認證和使用者狀態
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    
    // 應用程式狀態
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 1. 處理 Firebase 認證和 User ID
    useEffect(() => {
        const handleAuth = async () => {
            try {
                // 設定 Session Persistence
                await setPersistence(auth, browserSessionPersistence);

                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
                // 登入失敗的 fallback
                try {
                    await signInAnonymously(auth);
                } catch (anonError) {
                    console.error("Firebase Anonymous Auth Error (Fallback):", anonError);
                }
            }
        };

        handleAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // 如果仍未登入 (理論上不應發生)，使用隨機 ID 避免錯誤
                setUserId(crypto.randomUUID()); 
            }
            setAuthReady(true);
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. 載入 Trips 資料 (只在 authReady 後執行)
    useEffect(() => {
        if (!authReady || !userId) return;

        const path = getCollectionPath('trips', userId);
        const q = query(collection(db, path));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTrips(newTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 3. Dark Mode 邏輯 (使用 localStorage 儲存偏好)
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newState = !prev;
            if (newState) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newState;
        });
    }, []);

    // 4. 視圖切換函數
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


    return (
        <div className={isDarkMode ? 'dark' : ''}>
            
            {currentView === 'dashboard' && (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onTutorialStart={handleStartTutorial} 
                />
            )}
            
            {currentView === 'tripDetail' && (
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    isDarkMode={isDarkMode}
                />
            )}

            {currentView === 'tutorial' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
                    <Header 
                        title="應用程式教學" 
                        onBack={handleBackToDashboard} 
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                    />
                    <TutorialView 
                        onBack={handleBackToDashboard} 
                    />
                </div>
            )}
        </div>
    );
};

export default App;
