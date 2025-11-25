import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction, arrayUnion, arrayRemove, setDoc
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    Info, DollarSign, Globe, Layers
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
    // 設置 Firestore 服務的日誌級別，以便在控制台中查看詳細資訊
    // import { setLogLevel } from 'firebase/firestore';
    // setLogLevel('debug'); 
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// --- Firestore 輔助函式 ---

/**
 * 構建 Firestore 集合路徑。
 * @param {string} collectionName 集合名稱 (例如: 'trips', 'items')
 * @param {string} userId 當前用戶 ID
 * @param {string} type 'private' 或 'public'
 * @returns {string} Firestore 路徑
 */
const getCollectionPath = (collectionName, userId, type = 'private') => {
    if (type === 'public') {
        return `artifacts/${appId}/public/data/${collectionName}`;
    }
    // 預設為 private (個人資料)
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

// --- 通用 UI 組件 ---

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, icon: Icon, loading = false, type = 'button' }) => {
    let baseStyle = 'flex items-center justify-center font-semibold py-2 px-4 rounded-xl transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50';
    let variantStyle = '';
    let disabledStyle = 'opacity-50 cursor-not-allowed';

    if (variant === 'primary') {
        variantStyle = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
    } else if (variant === 'secondary') {
        variantStyle = 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400';
    } else if (variant === 'danger') {
        variantStyle = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
    } else if (variant === 'ghost') {
        baseStyle = 'font-semibold py-1 px-2 rounded-lg transition duration-200 ease-in-out focus:outline-none';
        variantStyle = 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700';
    } else if (variant === 'icon') {
        baseStyle = 'p-2 rounded-full transition duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700';
        variantStyle = 'text-gray-600 dark:text-gray-300';
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variantStyle} ${disabled ? disabledStyle : ''} ${className}`}
            disabled={disabled || loading}
        >
            {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : Icon ? (
                <Icon className="mr-2 h-5 w-5" />
            ) : null}
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const Input = React.forwardRef(({ label, id, type = 'text', value, onChange, className = '', required = false, ...props }, ref) => (
    <div className="flex flex-col space-y-1">
        {label && (
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
            {...props}
        />
    </div>
));

const Select = ({ label, id, value, onChange, options, className = '', required = false, ...props }) => (
    <div className="flex flex-col space-y-1">
        {label && (
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none cursor-pointer ${className}`}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

const DateInput = ({ label, id, value, onChange, className = '', required = false, min = '', max = '' }) => (
    <div className="flex flex-col space-y-1">
        {label && (
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <input
            id={id}
            type="date"
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            max={max}
            className={`w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
        />
    </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    let maxWidth = 'max-w-xl';
    if (size === 'lg') maxWidth = 'max-w-3xl';
    if (size === 'xl') maxWidth = 'max-w-5xl';
    if (size === 'sm') maxWidth = 'max-w-md';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto transition-transform duration-300 transform scale-100 opacity-100`}
                onClick={(e) => e.stopPropagation()} // 阻止點擊模態框內容時關閉
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <Button variant="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = '確認', cancelText = '取消', isDanger = false }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
        <div className="text-center space-y-6">
            <AlertTriangle className={`h-12 w-12 mx-auto ${isDanger ? 'text-red-500' : 'text-yellow-500'}`} />
            <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
            <div className="flex justify-center space-x-4">
                <Button onClick={onClose} variant="secondary">
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} variant={isDanger ? 'danger' : 'primary'}>
                    {confirmText}
                </Button>
            </div>
        </div>
    </Modal>
);

const Spinner = ({ className = 'text-indigo-600' }) => (
    <div className="flex justify-center items-center p-8">
        <Loader2 className={`w-8 h-8 animate-spin ${className}`} />
    </div>
);

// --- 輔助函式 ---

/**
 * 格式化時間戳或日期字串為 YYYY-MM-DD
 * @param {Date | firebase.firestore.Timestamp | string} date 
 * @returns {string} 格式化的日期字串
 */
const formatDate = (date) => {
    if (!date) return '';

    let d;
    if (date instanceof Date) {
        d = date;
    } else if (date.toDate) { // 處理 Firebase Timestamp
        d = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
        d = new Date(date);
    } else {
        return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * 計算兩個日期字串之間的天數
 * @param {string} start_date YYYY-MM-DD
 * @param {string} end_date YYYY-MM-DD
 * @returns {number} 天數 (包含起止日)
 */
const calculateDays = (start_date, end_date) => {
    if (!start_date || !end_date) return 0;
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    // 轉換為天，並加 1 (包含起止日)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 0 : diffDays;
};

// --- 主要組件 ---

const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode, onLogout }) => {
    return (
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-md dark:shadow-lg transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <Button variant="icon" onClick={onBack} className="text-gray-600 dark:text-gray-300">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                        {title}
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="icon" onClick={toggleDarkMode} title={isDarkMode ? '切換到淺色模式' : '切換到深色模式'}>
                        {isDarkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-indigo-600" />}
                    </Button>
                    {userId && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="h-5 w-5" />
                            <span className="hidden sm:inline">ID: {userId.substring(0, 8)}...</span>
                        </div>
                    )}
                    {onLogout && (
                        <Button variant="icon" onClick={onLogout} title="登出">
                            <LogOut className="h-6 w-6 text-red-500" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

// --- 1. Dashboard 儀表板組件 ---

const TripForm = ({ trip, onSave, onCancel, isSaving }) => {
    const [title, setTitle] = useState(trip?.title || '');
    const [destination, setDestination] = useState(trip?.destination || '');
    const [startDate, setStartDate] = useState(trip?.startDate || formatDate(new Date()));
    const [endDate, setEndDate] = useState(trip?.endDate || formatDate(new Date()));
    const [description, setDescription] = useState(trip?.description || '');

    const isEditMode = !!trip?.id;
    const days = calculateDays(startDate, endDate);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !destination || !startDate || !endDate) {
            alert('請填寫所有標記 * 的欄位！');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('結束日期不能早於開始日期！');
            return;
        }

        const newTrip = {
            title,
            destination,
            startDate,
            endDate,
            description,
            // collaborators: trip?.collaborators || [], // 協作者管理在 TripDetail 內
            // ownerId: 保持不變
        };
        onSave(newTrip);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                label="旅行標題 *" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="例如：日本關西十日遊"
            />
            <Input 
                label="目的地 *" 
                id="destination" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                required 
                placeholder="例如：京都, 大阪, 奈良"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateInput 
                    label="開始日期 *" 
                    id="startDate" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                />
                <DateInput 
                    label="結束日期 *" 
                    id="endDate" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required 
                    min={startDate}
                />
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                旅行總天數: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{days}</span> 天
            </div>
            <div className="flex flex-col space-y-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">旅行描述</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="簡要描述您的旅行計畫..."
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <Button variant="secondary" onClick={onCancel} type="button">
                    取消
                </Button>
                <Button variant="primary" type="submit" loading={isSaving}>
                    <Save className="h-5 w-5 mr-2" />
                    {isEditMode ? '更新旅行' : '創建旅行'}
                </Button>
            </div>
        </form>
    );
};

const TripCard = ({ trip, onSelectTrip, onDelete, isDarkMode, userId }) => {
    const days = calculateDays(trip.startDate, trip.endDate);
    const isOwner = trip.ownerId === userId;
    
    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
            <div onClick={() => onSelectTrip(trip.id)} className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                        {trip.title}
                    </h2>
                    <MapPin className="h-6 w-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                    目的地: {trip.destination}
                </p>
                <div className="flex flex-wrap items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                        {trip.startDate} - {trip.endDate}
                    </div>
                    <div className="flex items-center font-semibold text-indigo-600 dark:text-indigo-400">
                        <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                        {days} 天
                    </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 line-clamp-3">
                    {trip.description || '無描述。'}
                </p>
                {trip.collaborators?.length > 0 && (
                     <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Users className="h-4 w-4 mr-1" /> 協作者: {trip.collaborators.length} 人
                     </div>
                )}
            </div>
            <div className="mt-4 flex justify-between items-center border-t pt-3 border-gray-100 dark:border-gray-700">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${isOwner ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'}`}>
                    {isOwner ? '擁有者' : '協作者'}
                </span>
                <Button variant="icon" onClick={(e) => { e.stopPropagation(); onDelete(trip.id, trip.title); }} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </Card>
    );
};

const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);

    const tripsColRef = useMemo(() => authReady && userId ? collection(db, getCollectionPath('trips', userId, 'public')) : null, [authReady, userId]);

    const handleCreateTrip = async (newTripData) => {
        if (!tripsColRef) return;
        setIsSaving(true);
        try {
            const docRef = await addDoc(tripsColRef, {
                ...newTripData,
                ownerId: userId, // 設定擁有者
                collaborators: [], // 初始沒有協作者
                createdAt: serverTimestamp(),
            });

            // 初始化子集合 (例如，行程、預算、清單)
            // 為了簡化，我們可以在 TripDetail 中初次載入時自動創建這些子文檔，但這裡先創建基礎結構

            // 確保主行程文件創建後，用戶ID作為擁有者被加入協作者列表 (如果需要)
            // 這裡不需要，因為權限規則會處理。如果需要 UI 顯示，則在 TripDetail 處理。

            console.log("New trip created with ID: ", docRef.id);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Error creating trip: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (tripId, tripTitle) => {
        setTripToDelete({ id: tripId, title: tripTitle });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tripToDelete || !tripsColRef) return;
        const tripDocRef = doc(tripsColRef, tripToDelete.id);

        // 使用 Transaction 確保原子性：檢查是否為擁有者，然後刪除
        try {
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(tripDocRef);

                if (!tripDoc.exists()) {
                    throw new Error("旅行不存在。");
                }
                
                // 只能由擁有者刪除
                if (tripDoc.data().ownerId !== userId) {
                    throw new Error("您不是此旅行的擁有者，無法刪除。");
                }

                transaction.delete(tripDocRef);
            });
            console.log("Trip successfully deleted!");
        } catch (error) {
            console.error("Error deleting trip: ", error);
            // 可以在此處彈出一個錯誤提示給用戶
        } finally {
            setIsConfirmModalOpen(false);
            setTripToDelete(null);
        }
    };

    const sortedTrips = useMemo(() => {
        if (!trips) return [];
        // 按開始日期排序，最早的在前
        return [...trips].sort((a, b) => {
            if (a.startDate < b.startDate) return -1;
            if (a.startDate > b.startDate) return 1;
            return 0;
        });
    }, [trips]);

    if (!authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Spinner className="text-indigo-600 dark:text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            <Header 
                title="旅伴規劃儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
            />
            
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="mb-8 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">我的旅行計畫</h2>
                        <p className="text-gray-600 dark:text-gray-400">目前共有 {trips?.length || 0} 個旅行計畫。</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
                        <Button variant="secondary" onClick={onTutorialStart} icon={BookOpenText}>
                            應用程式教學
                        </Button>
                        <Button onClick={() => setIsFormOpen(true)} icon={Plus} className="w-full sm:w-auto">
                            創建新旅行
                        </Button>
                    </div>
                </Card>

                {sortedTrips.length === 0 ? (
                    <Card className="text-center p-12">
                        <Map className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                            尚未有任何旅行計畫
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            點擊上方的「創建新旅行」按鈕來開始您的第一個旅程吧！
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedTrips.map(trip => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onSelectTrip={onSelectTrip} 
                                onDelete={handleDeleteClick}
                                isDarkMode={isDarkMode}
                                userId={userId}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={isSaving ? '正在保存...' : '創建/編輯旅行'}>
                <TripForm 
                    onSave={handleCreateTrip} 
                    onCancel={() => setIsFormOpen(false)} 
                    isSaving={isSaving} 
                    trip={null} // 儀表板只用於創建
                />
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="確認刪除旅行"
                message={`您確定要永久刪除旅行 "${tripToDelete?.title}" 嗎？此操作無法撤銷。`}
                confirmText="確認刪除"
                isDanger
            />
        </div>
    );
};


// --- 2. TripDetail 旅行詳情組件 (包含子規劃器) ---

const PlannerTab = ({ title, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 py-3 px-4 sm:px-6 text-sm font-medium transition-all duration-300 border-b-4 
            ${isActive 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50 dark:bg-gray-700/50' 
                : 'border-transparent text-gray-500 hover:text-indigo-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-indigo-400'}`
        }
    >
        <Icon className="h-5 w-5" />
        <span className="hidden sm:inline">{title}</span>
    </button>
);

// --- 2.1 行程規劃器 ItineraryPlanner ---
const ItineraryPlanner = ({ trip, userId, authReady, tripDocRef, isDarkMode }) => {
    const [itinerary, setItinerary] = useState(null); // { date: "YYYY-MM-DD", events: [{time, name, location, notes}] }
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({ date: trip.startDate, time: '', name: '', location: '', notes: '' });
    const [expandedDays, setExpandedDays] = useState({});

    const itineraryDocRef = useMemo(() => tripDocRef ? doc(tripDocRef, 'itinerary', 'main') : null, [tripDocRef]);

    useEffect(() => {
        if (!itineraryDocRef || !authReady) return;

        // 監聽行程文件
        const unsubscribe = onSnapshot(itineraryDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setItinerary(data.itinerary || []);
            } else {
                // 如果文件不存在，創建一個空的結構
                setItinerary([]);
                setDoc(itineraryDocRef, { itinerary: [] }, { merge: true }).catch(e => console.error("Error setting initial itinerary:", e));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to itinerary:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [itineraryDocRef, authReady]);

    const handleUpdateItinerary = useCallback(async (newItinerary) => {
        if (!itineraryDocRef) return;
        try {
            await updateDoc(itineraryDocRef, { itinerary: newItinerary });
            console.log("Itinerary updated successfully.");
            return true;
        } catch (error) {
            console.error("Error updating itinerary:", error);
            return false;
        }
    }, [itineraryDocRef]);

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.name || !newEvent.date) return;

        const eventToAdd = {
            ...newEvent,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // 簡單 ID
            timestamp: serverTimestamp() // 用於排序
        };

        const currentItinerary = itinerary || [];
        const existingDayIndex = currentItinerary.findIndex(day => day.date === newEvent.date);
        
        let updatedItinerary;

        if (existingDayIndex !== -1) {
            // 更新現有日期
            updatedItinerary = currentItinerary.map((day, index) => 
                index === existingDayIndex 
                    ? { ...day, events: [...day.events, eventToAdd] }
                    : day
            );
        } else {
            // 添加新日期
            const newDay = {
                date: newEvent.date,
                events: [eventToAdd],
            };
            updatedItinerary = [...currentItinerary, newDay];
            // 在添加後按日期排序
            updatedItinerary.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        const success = await handleUpdateItinerary(updatedItinerary);
        if (success) {
            setIsAdding(false);
            setNewEvent({ date: trip.startDate, time: '', name: '', location: '', notes: '' });
        }
    };

    const handleDeleteEvent = useCallback(async (date, eventId) => {
        const updatedItinerary = itinerary.map(day => {
            if (day.date === date) {
                return { 
                    ...day, 
                    events: day.events.filter(event => event.id !== eventId)
                };
            }
            return day;
        }).filter(day => day.events.length > 0); // 移除空日期的行程

        await handleUpdateItinerary(updatedItinerary);
    }, [itinerary, handleUpdateItinerary]);
    
    // 按時間排序當日行程
    const sortedItinerary = useMemo(() => {
        if (!itinerary) return [];
        return itinerary.map(day => ({
            ...day,
            events: [...day.events].sort((a, b) => {
                // 優先考慮有時間的事件
                if (a.time && b.time) {
                    return a.time.localeCompare(b.time);
                }
                if (a.time) return -1;
                if (b.time) return 1;
                // 都沒有時間的，按名稱排序
                return a.name.localeCompare(b.name);
            })
        }));
    }, [itinerary]);

    const toggleDayExpansion = (date) => {
        setExpandedDays(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };
    
    if (isLoading) return <Spinner />;

    const dayCount = calculateDays(trip.startDate, trip.endDate);

    return (
        <Card className="p-4 sm:p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Map className="h-6 w-6 mr-2 text-indigo-500" /> 行程規劃 (共 {dayCount} 天)
            </h3>
            
            {/* 創建新事件的表單 */}
            <Card className="p-4 bg-indigo-50 dark:bg-gray-700 shadow-lg">
                <Button variant="ghost" onClick={() => setIsAdding(prev => !prev)} className="w-full text-indigo-600 dark:text-indigo-400 justify-center">
                    {isAdding ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {isAdding ? '關閉新增行程' : '新增行程事件'}
                </Button>
                {isAdding && (
                    <form onSubmit={handleAddEvent} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4 border-indigo-200 dark:border-gray-600">
                        <DateInput
                            label="日期 *"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                            required
                            min={trip.startDate}
                            max={trip.endDate}
                        />
                        <Input
                            label="時間 (可選)"
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                        />
                        <Input
                            label="事件名稱 *"
                            placeholder="例如: 參觀清水寺"
                            value={newEvent.name}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="sm:col-span-2"
                        />
                        <Input
                            label="地點/地址 (可選)"
                            placeholder="例如: 京都府京都市東山区清水1丁目294"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                            className="sm:col-span-2"
                        />
                        <div className="sm:col-span-2 lg:col-span-3">
                            <Input
                                label="備註 (可選)"
                                placeholder="例如: 預計停留 2 小時，需預約門票"
                                value={newEvent.notes}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-end lg:col-span-1">
                            <Button type="submit" variant="primary" icon={Plus} className="w-full">
                                添加事件
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* 行程日曆顯示 */}
            <div className="space-y-4 pt-4">
                {sortedItinerary.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Layers className="h-10 w-10 mx-auto mb-3" />
                        <p>目前沒有任何行程事件。請新增您的第一個事件。</p>
                    </div>
                ) : (
                    sortedItinerary.map((day, index) => (
                        <Card key={day.date} className="p-4 space-y-3">
                            <div 
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleDayExpansion(day.date)}
                            >
                                <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {day.date} (第 {index + 1} 天)
                                </h4>
                                <Button variant="icon">
                                    {expandedDays[day.date] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </Button>
                            </div>
                            
                            {expandedDays[day.date] && (
                                <div className="space-y-2 border-t pt-3 border-gray-200 dark:border-gray-700">
                                    {day.events.map(event => (
                                        <div key={event.id} className="flex items-start justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {event.time || '全天事件'} - {event.name}
                                                    </span>
                                                </div>
                                                {event.location && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" /> {event.location}
                                                    </p>
                                                )}
                                                {event.notes && (
                                                    <p className="text-xs italic text-gray-500 dark:text-gray-500">
                                                        備註: {event.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <Button 
                                                variant="icon" 
                                                onClick={() => handleDeleteEvent(day.date, event.id)}
                                                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 ml-4 flex-shrink-0"
                                                title="刪除行程"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </Card>
    );
};

// --- 2.2 預算規劃器 BudgetPlanner ---

const BudgetPlanner = ({ trip, userId, authReady, tripDocRef, isDarkMode }) => {
    const [budget, setBudget] = useState(null); // { totalBudget: 0, currency: 'TWD', expenses: [] }
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', amount: 0, category: '餐飲', date: formatDate(new Date()) });
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [totalBudget, setTotalBudget] = useState(0);
    const [currency, setCurrency] = useState('TWD');

    const budgetDocRef = useMemo(() => tripDocRef ? doc(tripDocRef, 'budget', 'main') : null, [tripDocRef]);

    const expenseCategories = ['餐飲', '交通', '住宿', '門票/活動', '購物', '機票/火車', '雜項'];

    useEffect(() => {
        if (!budgetDocRef || !authReady) return;

        const unsubscribe = onSnapshot(budgetDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBudget(data);
                setTotalBudget(data.totalBudget || 0);
                setCurrency(data.currency || 'TWD');
            } else {
                const initialData = { totalBudget: 0, currency: 'TWD', expenses: [] };
                setBudget(initialData);
                setDoc(budgetDocRef, initialData, { merge: true }).catch(e => console.error("Error setting initial budget:", e));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to budget:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [budgetDocRef, authReady]);

    const handleUpdateBudget = useCallback(async (updates) => {
        if (!budgetDocRef) return;
        try {
            await updateDoc(budgetDocRef, updates);
            console.log("Budget updated successfully.");
            return true;
        } catch (error) {
            console.error("Error updating budget:", error);
            return false;
        }
    }, [budgetDocRef]);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        await handleUpdateBudget({ totalBudget: parseFloat(totalBudget), currency });
        setIsSettingsModalOpen(false);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.name || parseFloat(newExpense.amount) <= 0) return;

        const expenseToAdd = {
            ...newExpense,
            amount: parseFloat(newExpense.amount),
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            timestamp: serverTimestamp()
        };

        await handleUpdateBudget({
            expenses: arrayUnion(expenseToAdd)
        });
        
        setIsFormOpen(false);
        setNewExpense({ name: '', amount: 0, category: '餐飲', date: formatDate(new Date()) });
    };

    const handleDeleteExpense = async (expenseId) => {
        // 從 expenses 陣列中刪除項目
        const expenseToRemove = budget.expenses.find(e => e.id === expenseId);
        if (expenseToRemove) {
            // Firestore 不支持直接刪除陣列中的單個元素，需要使用 arrayRemove
            // arrayRemove 依賴於完整的 object 匹配，但由於我們使用了 serverTimestamp，
            // 這裡最好的做法是讀取整個陣列，過濾後再寫回去 (使用 runTransaction 確保安全)
            try {
                await runTransaction(db, async (transaction) => {
                    const docSnap = await transaction.get(budgetDocRef);
                    if (!docSnap.exists()) {
                        throw new Error("Budget document does not exist!");
                    }
                    const currentExpenses = docSnap.data().expenses || [];
                    const updatedExpenses = currentExpenses.filter(e => e.id !== expenseId);
                    
                    transaction.update(budgetDocRef, { expenses: updatedExpenses });
                });
                console.log("Expense deleted successfully.");
            } catch (error) {
                console.error("Error deleting expense:", error);
            }
        }
    };

    const totalExpenses = useMemo(() => {
        return (budget?.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    }, [budget?.expenses]);

    const remainingBudget = totalBudget - totalExpenses;

    const getCategoryColor = (category) => {
        const colors = {
            '餐飲': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            '交通': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            '住宿': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            '門票/活動': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            '購物': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            '機票/火車': 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
            '雜項': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
        };
        return colors[category] || colors['雜項'];
    };

    if (isLoading) return <Spinner />;

    return (
        <Card className="p-4 sm:p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center"><PiggyBank className="h-6 w-6 mr-2 text-indigo-500" /> 預算規劃</span>
                <Button variant="ghost" onClick={() => setIsSettingsModalOpen(true)} icon={Settings}>
                    預算設定
                </Button>
            </h3>

            {/* 總結卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-indigo-50 dark:bg-indigo-900/50 shadow-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">總預算 ({currency})</p>
                    <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                        {totalBudget.toLocaleString()}
                    </p>
                </Card>
                <Card className="p-4 bg-red-50 dark:bg-red-900/50 shadow-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">總支出 ({currency})</p>
                    <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                        {totalExpenses.toLocaleString()}
                    </p>
                </Card>
                <Card className={`p-4 shadow-lg text-center ${remainingBudget >= 0 ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-300">剩餘預算 ({currency})</p>
                    <p className={`text-3xl font-extrabold mt-1 ${remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {remainingBudget.toLocaleString()}
                    </p>
                </Card>
            </div>

            <Button onClick={() => setIsFormOpen(true)} icon={Plus} className="w-full">
                新增支出項目
            </Button>

            {/* 支出列表 */}
            <div className="space-y-3 pt-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">詳細支出紀錄</h4>
                {(budget?.expenses || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <DollarSign className="h-10 w-10 mx-auto mb-3" />
                        <p>目前沒有任何支出紀錄。</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {[...(budget.expenses || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => (
                            <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex-grow space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                                            {expense.category}
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {expense.name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <CalendarDays className="h-4 w-4 mr-1" /> {expense.date}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3 flex-shrink-0">
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                        {currency} {expense.amount.toLocaleString()}
                                    </span>
                                    <Button variant="icon" onClick={() => handleDeleteExpense(expense.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 新增支出 Modal */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="新增支出">
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <Input
                        label="項目名稱 *"
                        value={newExpense.name}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="例如: 午餐拉麵"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={`金額 (${currency}) *`}
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                            required
                            min="0.01"
                            step="0.01"
                        />
                        <Select
                            label="類別"
                            value={newExpense.category}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                            options={expenseCategories.map(c => ({ label: c, value: c }))}
                        />
                    </div>
                    <DateInput
                        label="日期"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                        min={trip.startDate}
                        max={trip.endDate}
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit" icon={Save}>
                            儲存支出
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* 預算設定 Modal */}
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="預算設定" size="sm">
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <Input
                        label="總預算金額"
                        type="number"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        required
                        min="0"
                        step="1"
                    />
                    <Select
                        label="貨幣單位"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        options={[
                            { label: '新台幣 (TWD)', value: 'TWD' },
                            { label: '日圓 (JPY)', value: 'JPY' },
                            { label: '美元 (USD)', value: 'USD' },
                            { label: '歐元 (EUR)', value: 'EUR' },
                            { label: '人民幣 (CNY)', value: 'CNY' },
                            { label: '港幣 (HKD)', value: 'HKD' },
                        ]}
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit" icon={Check}>
                            保存設定
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
};

// --- 2.3 清單規劃器 ChecklistPlanner ---
const ChecklistPlanner = ({ trip, userId, authReady, tripDocRef, isDarkMode }) => {
    const [checklist, setChecklist] = useState(null); // { packing: [], todo: [] }
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', type: 'packing' });

    const checklistDocRef = useMemo(() => tripDocRef ? doc(tripDocRef, 'checklist', 'main') : null, [tripDocRef]);

    useEffect(() => {
        if (!checklistDocRef || !authReady) return;

        const unsubscribe = onSnapshot(checklistDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChecklist({
                    packing: data.packing || [],
                    todo: data.todo || [],
                });
            } else {
                const initialData = { packing: [], todo: [] };
                setChecklist(initialData);
                setDoc(checklistDocRef, initialData, { merge: true }).catch(e => console.error("Error setting initial checklist:", e));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to checklist:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [checklistDocRef, authReady]);

    const handleUpdateChecklist = useCallback(async (updates) => {
        if (!checklistDocRef) return;
        try {
            await updateDoc(checklistDocRef, updates);
            console.log("Checklist updated successfully.");
            return true;
        } catch (error) {
            console.error("Error updating checklist:", error);
            return false;
        }
    }, [checklistDocRef]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;

        const itemToAdd = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name: newItem.name.trim(),
            completed: false,
            timestamp: serverTimestamp()
        };

        const field = newItem.type; // 'packing' or 'todo'
        
        await handleUpdateChecklist({
            [field]: arrayUnion(itemToAdd)
        });
        
        setIsFormOpen(false);
        setNewItem({ name: '', type: 'packing' });
    };

    const handleToggleItem = async (type, itemId) => {
        const list = checklist[type] || [];
        const itemIndex = list.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return;

        // 必須讀取整個陣列，更新後再寫回
        const updatedList = list.map((item, index) => 
            index === itemIndex ? { ...item, completed: !item.completed } : item
        );

        await handleUpdateChecklist({
            [type]: updatedList
        });
    };

    const handleDeleteItem = async (type, itemId) => {
        const list = checklist[type] || [];
        const itemToRemove = list.find(item => item.id === itemId);

        if (!itemToRemove) return;

        // 使用 Transaction 安全地移除項目 (因為 arrayRemove 對於複雜對象依賴精確匹配，讀寫整個陣列更可靠)
        try {
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(checklistDocRef);
                if (!docSnap.exists()) {
                    throw new Error("Checklist document does not exist!");
                }
                const currentList = docSnap.data()[type] || [];
                const updatedList = currentList.filter(item => item.id !== itemId);
                
                transaction.update(checklistDocRef, { [type]: updatedList });
            });
            console.log("Item deleted successfully.");
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };
    
    const renderList = (type, title, icon: Icon) => {
        const list = checklist?.[type] || [];
        const completedCount = list.filter(item => item.completed).length;
        const totalCount = list.length;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        const sortedList = [...list].sort((a, b) => a.completed - b.completed || a.name.localeCompare(b.name));

        return (
            <Card className="p-4 space-y-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Icon className="h-6 w-6 mr-2 text-indigo-500" /> {title}
                </h4>
                
                {/* 進度條 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span>進度</span>
                        <span>{completedCount} / {totalCount} ({progress.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* 列表 */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {sortedList.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p>沒有項目。點擊「新增清單項目」添加。</p>
                        </div>
                    ) : (
                        sortedList.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-shadow">
                                <div className="flex items-center flex-grow">
                                    <Button 
                                        variant="icon" 
                                        onClick={() => handleToggleItem(type, item.id)}
                                        className={`mr-3 ${item.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 hover:text-indigo-600'}`}
                                    >
                                        {item.completed ? <Check className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                                    </Button>
                                    <span className={`text-gray-900 dark:text-white font-medium ${item.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <Button 
                                    variant="icon" 
                                    onClick={() => handleDeleteItem(type, item.id)} 
                                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 ml-4 flex-shrink-0"
                                    title="刪除項目"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        );
    };

    if (isLoading) return <Spinner />;

    return (
        <Card className="p-4 sm:p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <ClipboardList className="h-6 w-6 mr-2 text-indigo-500" /> 行前清單與待辦事項
            </h3>

            <Button onClick={() => setIsFormOpen(true)} icon={Plus} className="w-full">
                新增清單項目
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {renderList('packing', '行李打包清單', Briefcase)}
                {renderList('todo', '行前待辦事項', ListTodo)}
            </div>

            {/* 新增項目 Modal */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="新增清單項目" size="sm">
                <form onSubmit={handleAddItem} className="space-y-4">
                    <Input
                        label="項目名稱 *"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="例如: 護照、預訂住宿"
                    />
                    <Select
                        label="類型"
                        value={newItem.type}
                        onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                        options={[
                            { label: '打包清單 (Packing)', value: 'packing' },
                            { label: '待辦事項 (To-Do)', value: 'todo' },
                        ]}
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit" icon={Save}>
                            儲存項目
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
};

// --- 2.4 協作者管理 CollaboratorManager ---
const CollaboratorManager = ({ trip, userId, authReady, tripDocRef, isDarkMode }) => {
    const [collaborators, setCollaborators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newUserId, setNewUserId] = useState('');
    const [message, setMessage] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [collabToRemove, setCollabToRemove] = useState(null);

    const isOwner = trip.ownerId === userId;

    useEffect(() => {
        if (!tripDocRef || !authReady) return;

        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // 協作者列表包含擁有者和所有被邀請的用戶
                const currentCollaborators = [{ id: data.ownerId, role: '擁有者', isOwner: true }];
                (data.collaborators || []).forEach(collabId => {
                    if (collabId !== data.ownerId) { // 避免重複添加擁有者
                        currentCollaborators.push({ id: collabId, role: '協作者', isOwner: false });
                    }
                });
                setCollaborators(currentCollaborators);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to trip collaborators:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripDocRef, authReady]);
    
    // 檢查用戶 ID 格式是否正確
    const isValidUserId = (id) => id && id.length >= 20 && id.length <= 60; // 簡單檢查 Firebase uid 長度

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        setMessage('');
        const trimmedId = newUserId.trim();

        if (!isValidUserId(trimmedId)) {
            setMessage('錯誤：請輸入有效的用戶 ID (至少 20 個字符)。');
            return;
        }

        if (trimmedId === userId) {
            setMessage('錯誤：您已經是此旅行的成員。');
            return;
        }
        
        if (collaborators.some(collab => collab.id === trimmedId)) {
            setMessage('錯誤：此用戶已經是協作者。');
            return;
        }

        try {
            await updateDoc(tripDocRef, {
                collaborators: arrayUnion(trimmedId)
            });
            setMessage(`成功添加用戶 ID ${trimmedId.substring(0, 8)}... 為協作者。`);
            setNewUserId('');
        } catch (error) {
            console.error("Error adding collaborator:", error);
            setMessage('錯誤：添加協作者失敗。');
        }
    };

    const handleRemoveClick = (collabId) => {
        const collab = collaborators.find(c => c.id === collabId);
        if (collab.isOwner) {
            alert('無法移除擁有者！');
            return;
        }
        setCollabToRemove(collab);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!collabToRemove) return;

        try {
            await updateDoc(tripDocRef, {
                collaborators: arrayRemove(collabToRemove.id)
            });
            setMessage(`成功移除協作者 ID ${collabToRemove.id.substring(0, 8)}...`);
        } catch (error) {
            console.error("Error removing collaborator:", error);
            setMessage('錯誤：移除協作者失敗。');
        } finally {
            setIsConfirmModalOpen(false);
            setCollabToRemove(null);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <Card className="p-4 sm:p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="h-6 w-6 mr-2 text-indigo-500" /> 協作者管理
            </h3>

            {/* 當前用戶 ID 提示 */}
            <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-xl border border-indigo-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Info className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" /> 您的用戶 ID (請分享給協作者):
                </p>
                <div className="flex justify-between items-center mt-1">
                    <code className="break-all text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400">
                        {userId}
                    </code>
                    <Button 
                        variant="ghost" 
                        onClick={() => { 
                            navigator.clipboard.writeText(userId); 
                            setMessage('已複製您的用戶 ID！');
                            setTimeout(() => setMessage(''), 3000);
                        }}
                        className="text-xs ml-2 flex-shrink-0"
                    >
                        複製
                    </Button>
                </div>
            </div>
            
            {/* 添加協作者表單 (只有擁有者可以操作) */}
            {isOwner && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-700/50 shadow-inner">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">邀請新協作者</h4>
                    <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <div className="flex-grow">
                            <Input
                                id="collabId"
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                required
                                placeholder="請輸入您要邀請的協作者的用戶 ID"
                            />
                        </div>
                        <Button type="submit" icon={Plus} className="flex-shrink-0">
                            添加
                        </Button>
                    </form>
                </Card>
            )}

            {/* 訊息提示 */}
            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.startsWith('錯誤') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                    {message}
                </div>
            )}

            {/* 協作者列表 */}
            <div className="space-y-3 pt-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">成員列表 ({collaborators.length} 人)</h4>
                {collaborators.map(collab => (
                    <div key={collab.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex-grow space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${collab.isOwner ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'}`}>
                                    {collab.role}
                                </span>
                                {collab.id === userId && (
                                     <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300">
                                         (您)
                                     </span>
                                )}
                            </div>
                            <code className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                                ID: {collab.id}
                            </code>
                        </div>
                        {isOwner && !collab.isOwner && (
                            <Button 
                                variant="icon" 
                                onClick={() => handleRemoveClick(collab.id)} 
                                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 ml-4 flex-shrink-0"
                                title="移除協作者"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmRemove}
                title="確認移除協作者"
                message={`您確定要從此旅行中移除用戶 ID ${collabToRemove?.id.substring(0, 8)}... 嗎？`}
                confirmText="確認移除"
                isDanger
            />
        </Card>
    );
};

// --- TripDetail 主要組件 ---
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 使用 useMemo 確保 tripDocRef 穩定
    const tripDocRef = useMemo(() => {
        if (!authReady || !userId || !tripId) return null;
        // 假設所有的 trips 都儲存在公用路徑下 (artifacts/{appId}/public/data/trips/{tripId})
        const path = getCollectionPath('trips', userId, 'public');
        return doc(db, path, tripId);
    }, [authReady, userId, tripId]);

    useEffect(() => {
        if (!tripDocRef || !authReady) return;

        setIsLoading(true);

        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTrip({ id: docSnap.id, ...data });
                // 檢查用戶是否有權限 (擁有者或協作者)
                const isMember = data.ownerId === userId || (data.collaborators || []).includes(userId);
                if (!isMember) {
                    alert('您無權訪問此旅行計畫！將返回儀表板。');
                    onBack();
                }
            } else {
                console.error("Trip not found!");
                alert('旅行計畫不存在，將返回儀表板。');
                onBack();
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to trip detail:", error);
            alert('載入旅行詳情失敗，將返回儀表板。');
            onBack();
        });

        return () => unsubscribe();
    }, [tripDocRef, authReady, onBack, userId]);


    const handleUpdateTrip = async (updatedData) => {
        if (!tripDocRef) return;
        setIsSaving(true);
        try {
            await updateDoc(tripDocRef, updatedData);
            console.log("Trip updated successfully!");
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating trip:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Spinner className="text-indigo-600 dark:text-indigo-400" />
            </div>
        );
    }

    const { title, destination, startDate, endDate, description } = trip;
    const days = calculateDays(startDate, endDate);

    const isOwner = trip.ownerId === userId;
    const isCollaborator = trip.collaborators?.includes(userId) || isOwner;

    if (!isCollaborator) {
        // 如果用戶不是成員 (應該在 useEffect 中被處理，但這裡再加一層安全檢查)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="text-center p-10">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">權限不足</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">您無權訪問此旅行計畫。</p>
                    <Button onClick={onBack} className="mt-4" icon={ChevronLeft}>返回儀表板</Button>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header / 頂部資訊欄 */}
            <Header 
                title={title} 
                onBack={onBack} 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 旅行總覽卡片 */}
                <Card className="mb-6 p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{title}</h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 flex items-center"><MapPin className="h-5 w-5 mr-2" /> {destination}</p>
                        </div>
                        <Button 
                            variant="primary" 
                            onClick={() => setIsEditModalOpen(true)} 
                            icon={Edit} 
                            className="flex-shrink-0"
                            title="編輯旅行基本資訊"
                        >
                            編輯
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium border-t pt-4 border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <CalendarDays className="h-5 w-5 text-gray-500" />
                            <span>開始: {startDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CalendarDays className="h-5 w-5 text-gray-500" />
                            <span>結束: {endDate}</span>
                        </div>
                        <div className="flex items-center space-x-2 font-bold text-indigo-600 dark:text-indigo-400">
                            <Clock className="h-5 w-5" />
                            <span>{days} 天</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <User className="h-5 w-5" />
                            <span>擁有者: {trip.ownerId.substring(0, 8)}...</span>
                        </div>
                    </div>
                    
                    {description && (
                        <p className="text-gray-700 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <AlignLeft className="h-4 w-4 mr-1 inline-block" /> {description}
                        </p>
                    )}
                </Card>

                {/* 標籤頁導航 */}
                <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6 sticky top-20 bg-slate-50 dark:bg-gray-900 z-10 rounded-t-xl overflow-x-auto">
                    <PlannerTab 
                        title="行程" 
                        icon={Map} 
                        isActive={activeTab === 'itinerary'} 
                        onClick={() => setActiveTab('itinerary')}
                    />
                    <PlannerTab 
                        title="預算" 
                        icon={PiggyBank} 
                        isActive={activeTab === 'budget'} 
                        onClick={() => setActiveTab('budget')}
                    />
                    <PlannerTab 
                        title="清單" 
                        icon={ListTodo} 
                        isActive={activeTab === 'checklist'} 
                        onClick={() => setActiveTab('checklist')}
                    />
                    <PlannerTab 
                        title="協作者" 
                        icon={Users} 
                        isActive={activeTab === 'collaborators'} 
                        onClick={() => setActiveTab('collaborators')}
                    />
                </div>

                {/* 內容區域 */}
                <div className="tab-content">
                    {activeTab === 'itinerary' && (
                        <ItineraryPlanner 
                            trip={trip} 
                            userId={userId} 
                            authReady={authReady} 
                            tripDocRef={tripDocRef} 
                            isDarkMode={isDarkMode}
                        />
                    )}
                    {activeTab === 'budget' && (
                        <BudgetPlanner
                            trip={trip} 
                            userId={userId} 
                            authReady={authReady} 
                            tripDocRef={tripDocRef} 
                            isDarkMode={isDarkMode}
                        />
                    )}
                    {activeTab === 'checklist' && (
                        <ChecklistPlanner
                            trip={trip} 
                            userId={userId} 
                            authReady={authReady} 
                            tripDocRef={tripDocRef} 
                            isDarkMode={isDarkMode}
                        />
                    )}
                    {activeTab === 'collaborators' && (
                        <CollaboratorManager
                            trip={trip} 
                            userId={userId} 
                            authReady={authReady} 
                            tripDocRef={tripDocRef} 
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </main>

            {/* 編輯旅行 Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="編輯旅行資訊">
                <TripForm
                    trip={trip}
                    onSave={handleUpdateTrip}
                    onCancel={() => setIsEditModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>
        </div>
    );
};

// --- 3. 教學頁面組件 ---
const TutorialStep = ({ icon: Icon, title, content, isDarkMode }) => (
    <div className="flex space-x-4">
        <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                <Icon className="h-6 w-6" />
            </div>
        </div>
        <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
            <p className="text-gray-700 dark:text-gray-300">{content}</p>
        </div>
    </div>
);

const TutorialView = ({ onBack, isDarkMode }) => {
    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="space-y-8 p-6 sm:p-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">歡迎使用旅伴規劃器</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        這是一個協同合作的旅行規劃工具，讓您和旅伴一起輕鬆安排行程、預算和待辦事項。
                    </p>
                </div>

                <div className="space-y-10">
                    <TutorialStep
                        icon={Home}
                        title="儀表板 (Dashboard)"
                        content="這裡是您所有旅行計畫的總覽。您可以創建新旅行、刪除舊旅行，並查看每個旅行的基本資訊。所有旅行計畫都會自動儲存在雲端並與協作者同步。"
                        isDarkMode={isDarkMode}
                    />

                    <TutorialStep
                        icon={MapPin}
                        title="行程規劃 (Itinerary)"
                        content="進入旅行詳情後，您可以在這裡為每一天添加詳細的行程事件，包括時間、地點和備註。所有協作者都可以實時看到和編輯這些內容。"
                        isDarkMode={isDarkMode}
                    />

                    <TutorialStep
                        icon={PiggyBank}
                        title="預算規劃 (Budget)"
                        content="設定旅行的總預算和貨幣單位。您可以記錄每次的支出，並根據類別分類。系統會自動計算總支出和剩餘預算，幫助您控制花費。"
                        isDarkMode={isDarkMode}
                    />

                    <TutorialStep
                        icon={ListTodo}
                        title="行前清單 (Checklist)"
                        content="分為 '打包清單' 和 '行前待辦事項' 兩部分。您可以添加項目、標記完成狀態。這確保您不會忘記任何重要的行李或出發前的準備工作。"
                        isDarkMode={isDarkMode}
                    />

                    <TutorialStep
                        icon={Users}
                        title="協作者管理 (Collaboration)"
                        content="在協作者頁面，您可以查看自己的用戶 ID。將您的 ID 分享給旅伴，他們就可以在他們的儀表板上添加您為協作者，或由您將他們的 ID 添加到旅行中，以實現實時協同規劃。"
                        isDarkMode={isDarkMode}
                    />
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onBack} icon={ChevronLeft} className="w-full sm:w-auto">
                        返回儀表板，開始規劃
                    </Button>
                </div>
            </Card>
        </main>
    );
};


// --- 頂層應用程式組件 ---
const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState(null); // 從 Firestore 載入的旅行列表
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', JSON.stringify(newMode));
            return newMode;
        });
    }, []);

    // 1. 設置深色模式 class
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // 2. Firebase 認證與用戶 ID 設置
    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // 如果沒有用戶，使用 custom token 或匿名登錄
                try {
                    if (initialAuthToken) {
                        const credential = await signInWithCustomToken(auth, initialAuthToken);
                        user = credential.user;
                    } else {
                        const credential = await signInAnonymously(auth);
                        user = credential.user;
                    }
                } catch (error) {
                    console.error("Firebase Auth Sign-in Failed:", error);
                }
            }
            
            if (user) {
                setUserId(user.uid);
            }
            setAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // 3. Firestore 數據訂閱 (儀表板數據)
    useEffect(() => {
        if (!authReady || !userId || !db) {
            setTrips(null); // 在未準備好時清空數據
            return;
        }

        // 查詢：用戶是擁有者 (ownerId) 或協作者 (collaborators 陣列包含 userId) 的所有旅行
        const tripsCollectionRef = collection(db, getCollectionPath('trips', userId, 'public'));

        // 由於 Firestore 不支持單個查詢中的 OR 邏輯，我們需要獲取所有文件，並在客戶端過濾，或使用兩個查詢
        // 在 Firestore 安全規則下，通常會允許讀取 ownerId=userId 或 collaborators array-contains userId 的文檔
        // 但由於這裡需要兩個不同的 where 條件，我們將在客戶端合併結果，以簡化查詢邏輯（假設規則允許訪問）

        // 為了符合單一查詢的最佳實踐，我們將假設 Firebase 規則已經配置，並且我們只需要獲取所有公開的 trips 集合，並在客戶端過濾
        // **警告：這在大型數據集上會非常低效。最佳實踐是執行兩個查詢並合併結果，但由於環境限制，我們盡量用一個快照，並依賴後端規則。**

        // 實際在 Canvas 環境中，我們依賴安全規則來限制訪問權限。
        // 為了避免多個 onSnapshot 導致的複雜性，我們先假設一個通用的查詢，並在客戶端進行最終過濾。
        // 但為了性能和正確性，我們將只監聽用戶作為協作者的列表。

        // **正確的實時協同查詢模式 (需要兩個查詢，但 Firestore 不推薦在 onSnapshot 中使用兩個查詢)
        // 為了簡化並避免在 onSnapshot 內處理多個訂閱，我們將使用 `where('collaborators', 'array-contains', userId)` 
        // 加上 `where('ownerId', '==', userId)` 的組合邏輯來獲取所有相關旅行，並在客戶端合併，以確保數據完整性。
        // 這裡我們只執行一個 onSnapshot 來獲取所有相關 trips：

        let unsubscribeOwner, unsubscribeCollaborator;
        let ownerTrips = [];
        let collaboratorTrips = [];

        const updateTrips = () => {
            const allTripsMap = new Map();
            [...ownerTrips, ...collaboratorTrips].forEach(trip => {
                // 協作者列表可能包含擁有者，使用 Map 根據 ID 去重
                allTripsMap.set(trip.id, trip);
            });
            setTrips(Array.from(allTripsMap.values()));
        };

        // 1. 查詢用戶是擁有者的旅行
        const ownerQuery = query(
            tripsCollectionRef,
            where('ownerId', '==', userId)
        );

        unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
            ownerTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updateTrips();
        }, (error) => console.error("Error fetching owner trips:", error));

        // 2. 查詢用戶是協作者的旅行
        const collaboratorQuery = query(
            tripsCollectionRef,
            where('collaborators', 'array-contains', userId)
        );

        unsubscribeCollaborator = onSnapshot(collaboratorQuery, (snapshot) => {
            collaboratorTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updateTrips();
        }, (error) => console.error("Error fetching collaborator trips:", error));


        return () => {
            if (unsubscribeOwner) unsubscribeOwner();
            if (unsubscribeCollaborator) unsubscribeCollaborator();
        };

    }, [authReady, userId]);

    // 導航處理
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

    if (!authReady || trips === null) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
                <Spinner className="text-indigo-600 dark:text-indigo-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">正在連接雲端並驗證身份...</p>
            </div>
        );
    }

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
                    onTutorialStart={handleStartTutorial} // 新增教學入口
                />
            )}
            
            {currentView === 'tripDetail' && selectedTripId && (
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
