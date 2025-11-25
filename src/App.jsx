import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction, arrayRemove, arrayUnion
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp, Search, Menu
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
    // 設置 Firestore 日誌級別為 Debug
    // setLogLevel('Debug'); // 由於 setLogLevel 可能在某些版本的 SDK 中被移除或改變，暫時移除
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// --- Firebase 輔助函數 ---

/**
 * 取得特定行程的 Firestore 參考路徑
 * @param {string} userId - 使用者 ID
 * @param {string} tripId - 行程 ID
 * @returns {import('firebase/firestore').DocumentReference}
 */
const getTripDocRef = (userId, tripId) => {
    return doc(db, 'artifacts', appId, 'users', userId, 'trips', tripId);
};

/**
 * 取得行程集合的 Firestore 參考路徑 (私有資料)
 * @param {string} userId - 使用者 ID
 * @returns {import('firebase/firestore').CollectionReference}
 */
const getTripsCollectionRef = (userId) => {
    return collection(db, 'artifacts', appId, 'users', userId, 'trips');
};

/**
 * 取得行程內子集合的參考路徑
 * @param {string} userId - 使用者 ID
 * @param {string} tripId - 行程 ID
 * @param {string} subcollectionName - 子集合名稱 (e.g., 'tasks', 'budget', 'packing')
 * @returns {import('firebase/firestore').CollectionReference}
 */
const getSubcollectionRef = (userId, tripId, subcollectionName) => {
    return collection(getTripDocRef(userId, tripId), subcollectionName);
};

/**
 * 執行帶有指數退避的 Firebase 寫入操作
 * @param {function(): Promise<any>} operation - 要執行的 Firebase 異步操作
 * @param {number} maxRetries - 最大重試次數
 * @returns {Promise<any>}
 */
const runWithExponentialBackoff = async (operation, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error("Firebase operation failed after multiple retries:", error);
                throw error;
            }
            // 指數退避: 1s, 2s, 4s, 8s, 16s
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            console.warn(`Retrying operation (Attempt ${i + 2}/${maxRetries})...`);
        }
    }
};

// --- 組件定義 ---

/**
 * 通用載入指示器組件
 */
const LoadingSpinner = ({ text = "載入中...", isDarkMode }) => (
    <div className={`flex flex-col items-center justify-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'}`}>
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-3" />
        <p className="text-sm font-medium">{text}</p>
    </div>
);

/**
 * 通用錯誤訊息組件
 */
const ErrorMessage = ({ message, isDarkMode }) => (
    <div className={`flex items-center justify-center p-6 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-gray-800 text-red-400' : 'bg-red-100 text-red-700'}`}>
        <AlertTriangle className="h-6 w-6 mr-3" />
        <p className="font-medium">{message}</p>
    </div>
);

/**
 * 通用按鈕組件
 */
const Button = ({ children, onClick, className = '', icon: Icon, disabled = false, isPrimary = true, type = 'button' }) => {
    const baseStyle = isPrimary 
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
        : 'bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 shadow-sm';
    
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition duration-150 ease-in-out ${baseStyle} ${disabledStyle} ${className}`}
        >
            {Icon && <Icon className="h-5 w-5 mr-2" />}
            {children}
        </button>
    );
};

/**
 * 標題/導航欄組件
 */
const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode, rightContent }) => {
    const Icon = isDarkMode ? Sun : Moon;

    return (
        <header className={`sticky top-0 z-10 w-full ${isDarkMode ? 'bg-gray-900 border-b border-gray-700 text-white' : 'bg-white border-b border-gray-200 text-gray-900'} shadow-sm`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition duration-150`}
                            aria-label="返回"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}
                    <h1 className={`text-xl font-bold ml-3 ${onBack ? 'md:ml-0' : ''}`}>{title}</h1>
                </div>

                <div className="flex items-center space-x-3">
                    {rightContent}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition duration-150`}
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        <Icon className="h-6 w-6" />
                    </button>
                    <div className={`text-xs p-2 rounded-xl font-mono truncate max-w-[100px] sm:max-w-none ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        ID: {userId.substring(0, 4)}...
                    </div>
                </div>
            </div>
        </header>
    );
};


/**
 * 儀表板組件 - 顯示和管理行程
 */
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [newTripStart, setNewTripStart] = useState('');
    const [newTripEnd, setNewTripEnd] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateTrip = useCallback(async (e) => {
        e.preventDefault();
        if (!newTripName || !newTripStart || !newTripEnd || !authReady) return;

        setLoading(true);
        setError(null);
        
        // 確保結束日期不早於開始日期
        if (new Date(newTripStart) > new Date(newTripEnd)) {
            setError("結束日期不能早於開始日期！");
            setLoading(false);
            return;
        }

        try {
            await runWithExponentialBackoff(() => 
                addDoc(getTripsCollectionRef(userId), {
                    name: newTripName,
                    startDate: newTripStart,
                    endDate: newTripEnd,
                    createdAt: serverTimestamp(),
                })
            );
            setNewTripName('');
            setNewTripStart('');
            setNewTripEnd('');
            setIsAdding(false);
        } catch (err) {
            console.error("Error creating trip: ", err);
            setError("無法建立行程。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [newTripName, newTripStart, newTripEnd, userId, authReady]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTrips = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return trips
            .filter(trip => trip.name.toLowerCase().includes(lowerCaseSearch))
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // 按開始日期排序
    }, [trips, searchTerm]);

    const formatDate = (dateString) => {
        if (!dateString) return '未定';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
        } catch {
            return dateString;
        }
    };

    const handleDeleteTrip = useCallback(async (tripId) => {
        if (!window.confirm("您確定要永久刪除此行程嗎？所有相關資料將會遺失。")) return;

        setLoading(true);
        setError(null);

        try {
            // 由於 Firestore 沒有級聯刪除，這裡只刪除行程文件。
            // 為了完整性，實際應用中應考慮刪除所有子集合數據，但這裡僅作基本刪除。
            await runWithExponentialBackoff(() => 
                deleteDoc(getTripDocRef(userId, tripId))
            );
        } catch (err) {
            console.error("Error deleting trip: ", err);
            setError("無法刪除行程。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const TripCard = ({ trip }) => (
        <div 
            className={`flex flex-col p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-indigo-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onClick={() => onSelectTrip(trip.id)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg font-semibold truncate ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{trip.name}</h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                    }}
                    className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'} transition duration-150`}
                    aria-label={`刪除行程 ${trip.name}`}
                    disabled={loading}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            
            <div className="flex items-center text-sm font-medium">
                <CalendarDays className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
            </div>
            
            {/* 顯示建立日期 */}
            <div className="mt-2 text-xs font-light flex items-center">
                <Clock className={`h-3 w-3 mr-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                    建立於: {trip.createdAt ? new Date(trip.createdAt.toDate()).toLocaleDateString('zh-TW') : '載入中...'}
                </span>
            </div>
        </div>
    );

    const AddTripForm = () => (
        <form onSubmit={handleCreateTrip} className={`p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition duration-300`}>
            <h3 className={`text-xl font-bold mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>建立新行程</h3>
            
            <div className="space-y-4">
                {/* 行程名稱 */}
                <div>
                    <label htmlFor="newTripName" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>行程名稱</label>
                    <input
                        type="text"
                        id="newTripName"
                        value={newTripName}
                        onChange={(e) => setNewTripName(e.target.value)}
                        placeholder="例如：日本北海道五日遊"
                        required
                        className={`w-full p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                </div>
                
                {/* 開始日期 */}
                <div>
                    <label htmlFor="newTripStart" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>開始日期</label>
                    <input
                        type="date"
                        id="newTripStart"
                        value={newTripStart}
                        onChange={(e) => setNewTripStart(e.target.value)}
                        required
                        className={`w-full p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                </div>
                
                {/* 結束日期 */}
                <div>
                    <label htmlFor="newTripEnd" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>結束日期</label>
                    <input
                        type="date"
                        id="newTripEnd"
                        value={newTripEnd}
                        onChange={(e) => setNewTripEnd(e.target.value)}
                        required
                        className={`w-full p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                </div>
            </div>
            
            {error && <ErrorMessage message={error} isDarkMode={isDarkMode} />}

            <div className="flex justify-end space-x-3 mt-6">
                <Button 
                    onClick={() => { setIsAdding(false); setError(null); }}
                    isPrimary={false}
                    disabled={loading}
                    icon={X}
                >
                    取消
                </Button>
                <Button type="submit" disabled={loading || !newTripName || !newTripStart || !newTripEnd} icon={Save}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : '建立行程'}
                </Button>
            </div>
        </form>
    );

    if (!authReady) {
        return <LoadingSpinner text="正在驗證使用者..." isDarkMode={isDarkMode} />;
    }

    if (isAdding) {
        return (
            <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
                <AddTripForm />
            </div>
        );
    }

    const tripCount = filteredTrips.length;

    return (
        <div className={`p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <div className="w-full sm:w-1/2 flex items-center space-x-2">
                        <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        {/* 修正錯誤處: 確保 input 標籤和屬性引號正確 */}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`flex-1 p-2 rounded-xl border focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                            id="searchTerm"
                            placeholder="搜尋行程名稱..." 
                        />
                    </div>
                    
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <Button onClick={onTutorialStart} isPrimary={false} icon={BookOpenText} className="flex-1 sm:flex-none">
                            教學
                        </Button>
                        <Button onClick={() => setIsAdding(true)} icon={Plus} className="flex-1 sm:flex-none">
                            新增行程
                        </Button>
                    </div>
                </div>

                {loading && <LoadingSpinner text="正在處理您的請求..." isDarkMode={isDarkMode} />}
                {error && <div className="mb-4"><ErrorMessage message={error} isDarkMode={isDarkMode} /></div>}

                {tripCount > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div className={`p-10 text-center rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-white text-gray-500'}`}>
                        <Briefcase className="w-10 h-10 mx-auto mb-4 text-indigo-500" />
                        <h3 className="text-xl font-semibold mb-2">尚未規劃任何行程</h3>
                        <p className="mb-4">點擊「新增行程」開始您的第一次旅行規劃吧！</p>
                        <Button onClick={() => setIsAdding(true)} icon={Plus}>
                            開始規劃
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 子任務組件 (Task Management) ---

/**
 * 子任務：待辦事項/任務
 */
const TaskItem = React.memo(({ task, updateTask, deleteTask, isDarkMode }) => {
    const handleToggle = () => updateTask(task.id, { completed: !task.completed });
    const handleDelete = () => deleteTask(task.id);

    const checkIcon = task.completed ? Check : ListTodo;

    return (
        <div className={`flex items-center p-3 rounded-xl shadow-sm transition duration-150 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
                onClick={handleToggle}
                className={`p-1 mr-3 rounded-full ${task.completed ? 'bg-indigo-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-indigo-600 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'} transition duration-150`}
                aria-label={task.completed ? "標記為未完成" : "標記為完成"}
            >
                <checkIcon className="h-5 w-5" />
            </button>
            <span className={`flex-1 text-base ${task.completed ? 'line-through opacity-60' : 'font-medium'} ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {task.description}
            </span>
            <button
                onClick={handleDelete}
                className={`p-1 ml-3 rounded-full text-gray-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-100'} transition duration-150`}
                aria-label="刪除任務"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
});

/**
 * 待辦事項/任務列表組件
 */
const TaskList = ({ tasks, userId, tripId, isDarkMode }) => {
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const taskCollectionRef = useMemo(() => getSubcollectionRef(userId, tripId, 'tasks'), [userId, tripId]);

    const handleAddTask = useCallback(async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await runWithExponentialBackoff(() => 
                addDoc(taskCollectionRef, {
                    description: newTask.trim(),
                    completed: false,
                    createdAt: serverTimestamp(),
                })
            );
            setNewTask('');
        } catch (err) {
            console.error("Error adding task: ", err);
            setError("無法新增任務。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [newTask, taskCollectionRef]);

    const updateTask = useCallback(async (taskId, updates) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                updateDoc(doc(taskCollectionRef, taskId), updates)
            );
        } catch (err) {
            console.error("Error updating task: ", err);
            setError("無法更新任務。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [taskCollectionRef]);

    const deleteTask = useCallback(async (taskId) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                deleteDoc(doc(taskCollectionRef, taskId))
            );
        } catch (err) {
            console.error("Error deleting task: ", err);
            setError("無法刪除任務。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [taskCollectionRef]);

    const completedTasks = tasks.filter(t => t.completed).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));

    return (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg h-full`}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                <ListTodo className="h-6 w-6 mr-3" /> 待辦事項
            </h2>
            
            {loading && <LoadingSpinner text="處理中..." isDarkMode={isDarkMode} />}
            {error && <div className="mb-4"><ErrorMessage message={error} isDarkMode={isDarkMode} /></div>}

            {/* 新增任務表單 */}
            <form onSubmit={handleAddTask} className="flex mb-6 space-x-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="新增一項待辦事項..."
                    required
                    className={`flex-1 p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                <Button type="submit" disabled={loading || !newTask.trim()} icon={Plus}>
                    新增
                </Button>
            </form>

            {/* 任務列表 */}
            <div className="space-y-4">
                {pendingTasks.length > 0 && (
                    <>
                        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>未完成 ({pendingTasks.length})</h3>
                        <div className="space-y-3">
                            {pendingTasks.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    updateTask={updateTask} 
                                    deleteTask={deleteTask} 
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </>
                )}

                {completedTasks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>已完成 ({completedTasks.length})</h3>
                        <div className="space-y-3">
                            {completedTasks.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    updateTask={updateTask} 
                                    deleteTask={deleteTask} 
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                        <ClipboardList className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                        <p className="font-medium">一切就緒！沒有待辦事項。</p>
                        <p className="text-sm">您隨時可以新增任務。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 子任務組件 (Budget Management) ---

/**
 * 子任務：預算
 */
const BudgetEntry = React.memo(({ entry, updateEntry, deleteEntry, isDarkMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(entry.description);
    const [amount, setAmount] = useState(entry.amount);

    const handleSave = () => {
        if (!description.trim() || isNaN(amount) || amount <= 0) return;
        updateEntry(entry.id, { description: description.trim(), amount: Number(amount) });
        setIsEditing(false);
    };

    const expenseColor = entry.type === 'expense' ? 'text-red-500' : 'text-green-500';
    const amountPrefix = entry.type === 'expense' ? '-' : '+';
    const icon = entry.type === 'expense' ? ShoppingBag : PiggyBank;

    if (isEditing) {
        return (
            <div className={`flex items-center p-3 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-50'} border border-indigo-300`}>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`flex-1 p-2 mr-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-24 p-2 mr-2 border rounded-lg text-right ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <Button onClick={handleSave} icon={Check} className="p-2 mr-1">儲存</Button>
                <button onClick={() => setIsEditing(false)} className={`p-2 rounded-full text-gray-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <X className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <div className={`flex items-center p-3 rounded-xl shadow-sm transition duration-150 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <icon className={`h-5 w-5 mr-3 ${expenseColor}`} />
            <span className={`flex-1 font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {entry.description}
            </span>
            <span className={`font-bold text-lg mr-4 ${expenseColor}`}>
                {amountPrefix} ${entry.amount.toLocaleString()}
            </span>
            <button
                onClick={() => setIsEditing(true)}
                className={`p-1 mr-2 rounded-full text-gray-400 hover:text-indigo-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-indigo-100'} transition duration-150`}
                aria-label="編輯"
            >
                <Edit className="h-4 w-4" />
            </button>
            <button
                onClick={() => deleteEntry(entry.id)}
                className={`p-1 rounded-full text-gray-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-100'} transition duration-150`}
                aria-label="刪除"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
});

/**
 * 預算管理列表組件
 */
const BudgetManager = ({ budgetEntries, userId, tripId, isDarkMode }) => {
    const [newDescription, setNewDescription] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newType, setNewType] = useState('expense'); // 'expense' or 'income'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const budgetCollectionRef = useMemo(() => getSubcollectionRef(userId, tripId, 'budget'), [userId, tripId]);

    const handleAddEntry = useCallback(async (e) => {
        e.preventDefault();
        if (!newDescription.trim() || isNaN(newAmount) || Number(newAmount) <= 0) return;

        setLoading(true);
        setError(null);

        try {
            await runWithExponentialBackoff(() => 
                addDoc(budgetCollectionRef, {
                    description: newDescription.trim(),
                    amount: Number(newAmount),
                    type: newType,
                    createdAt: serverTimestamp(),
                })
            );
            setNewDescription('');
            setNewAmount('');
            setNewType('expense');
        } catch (err) {
            console.error("Error adding budget entry: ", err);
            setError("無法新增預算項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [newDescription, newAmount, newType, budgetCollectionRef]);

    const updateEntry = useCallback(async (entryId, updates) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                updateDoc(doc(budgetCollectionRef, entryId), updates)
            );
        } catch (err) {
            console.error("Error updating budget entry: ", err);
            setError("無法更新預算項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [budgetCollectionRef]);

    const deleteEntry = useCallback(async (entryId) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                deleteDoc(doc(budgetCollectionRef, entryId))
            );
        } catch (err) {
            console.error("Error deleting budget entry: ", err);
            setError("無法刪除預算項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [budgetCollectionRef]);

    const totalIncome = budgetEntries
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = budgetEntries
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpense;

    const balanceColor = balance >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg h-full`}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                <PiggyBank className="h-6 w-6 mr-3" /> 預算管理
            </h2>
            
            {/* 總結面板 */}
            <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="text-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>總收入</p>
                    <p className="text-xl font-bold text-green-500">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>總支出</p>
                    <p className="text-xl font-bold text-red-500">${totalExpense.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>結餘</p>
                    <p className={`text-xl font-bold ${balanceColor}`}>${balance.toLocaleString()}</p>
                </div>
            </div>

            {loading && <LoadingSpinner text="處理中..." isDarkMode={isDarkMode} />}
            {error && <div className="mb-4"><ErrorMessage message={error} isDarkMode={isDarkMode} /></div>}

            {/* 新增預算表單 */}
            <form onSubmit={handleAddEntry} className="flex space-x-2 mb-6">
                <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className={`p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                    <option value="expense">支出</option>
                    <option value="income">收入</option>
                </select>
                <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="描述 (e.g., 機票, 住宿)"
                    required
                    className={`flex-1 p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="金額"
                    required
                    min="0.01"
                    step="0.01"
                    className={`w-28 p-3 text-right border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                <Button type="submit" disabled={loading || !newDescription.trim() || !newAmount} icon={Plus}>
                    新增
                </Button>
            </form>

            {/* 預算項目列表 */}
            <div className="space-y-3">
                {budgetEntries
                    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
                    .map(entry => (
                        <BudgetEntry 
                            key={entry.id} 
                            entry={entry} 
                            updateEntry={updateEntry} 
                            deleteEntry={deleteEntry} 
                            isDarkMode={isDarkMode} 
                        />
                    ))}

                {budgetEntries.length === 0 && (
                    <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                        <Calculator className="w-8 h-8 mx-auto mb-3 text-green-500" />
                        <p className="font-medium">您的預算表目前是空的。</p>
                        <p className="text-sm">新增收入和支出以追蹤您的旅行財務。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 子任務組件 (Packing List) ---

/**
 * 子任務：行李項目
 */
const PackingItem = React.memo(({ item, updateItem, deleteItem, isDarkMode }) => {
    const handleToggle = () => updateItem(item.id, { packed: !item.packed });
    const handleDelete = () => deleteItem(item.id);

    const checkIcon = item.packed ? Check : ShoppingBag;

    return (
        <div className={`flex items-center p-3 rounded-xl shadow-sm transition duration-150 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
                onClick={handleToggle}
                className={`p-1 mr-3 rounded-full ${item.packed ? 'bg-indigo-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-indigo-600 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'} transition duration-150`}
                aria-label={item.packed ? "標記為未打包" : "標記為已打包"}
            >
                <checkIcon className="h-5 w-5" />
            </button>
            <span className={`flex-1 text-base ${item.packed ? 'line-through opacity-60' : 'font-medium'} ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {item.name}
                {item.quantity > 1 && <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>x{item.quantity}</span>}
            </span>
            <button
                onClick={handleDelete}
                className={`p-1 ml-3 rounded-full text-gray-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-100'} transition duration-150`}
                aria-label="刪除項目"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
});

/**
 * 行李清單組件
 */
const PackingList = ({ packingItems, userId, tripId, isDarkMode }) => {
    const [newName, setNewName] = useState('');
    const [newQuantity, setNewQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const packingCollectionRef = useMemo(() => getSubcollectionRef(userId, tripId, 'packing'), [userId, tripId]);

    const handleAddItem = useCallback(async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await runWithExponentialBackoff(() => 
                addDoc(packingCollectionRef, {
                    name: newName.trim(),
                    quantity: Number(newQuantity),
                    packed: false,
                    createdAt: serverTimestamp(),
                })
            );
            setNewName('');
            setNewQuantity(1);
        } catch (err) {
            console.error("Error adding packing item: ", err);
            setError("無法新增行李項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [newName, newQuantity, packingCollectionRef]);

    const updateItem = useCallback(async (itemId, updates) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                updateDoc(doc(packingCollectionRef, itemId), updates)
            );
        } catch (err) {
            console.error("Error updating packing item: ", err);
            setError("無法更新行李項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [packingCollectionRef]);

    const deleteItem = useCallback(async (itemId) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                deleteDoc(doc(packingCollectionRef, itemId))
            );
        } catch (err) {
            console.error("Error deleting packing item: ", err);
            setError("無法刪除行李項目。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [packingCollectionRef]);

    const packedItems = packingItems.filter(i => i.packed).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    const unpackedItems = packingItems.filter(i => !i.packed).sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));

    const totalItems = packingItems.length;
    const packedCount = packedItems.length;
    const progress = totalItems === 0 ? 0 : Math.round((packedCount / totalItems) * 100);

    return (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg h-full`}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <Briefcase className="h-6 w-6 mr-3" /> 行李清單
            </h2>
            
            {loading && <LoadingSpinner text="處理中..." isDarkMode={isDarkMode} />}
            {error && <div className="mb-4"><ErrorMessage message={error} isDarkMode={isDarkMode} /></div>}

            {/* 進度條 */}
            <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`flex justify-between text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>打包進度</span>
                    <span>{progress}% ({packedCount}/{totalItems})</span>
                </div>
                <div className={`w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5`}>
                    <div 
                        className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* 新增項目表單 */}
            <form onSubmit={handleAddItem} className="flex space-x-2 mb-6">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="新增行李項目名稱..."
                    required
                    className={`flex-1 p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    min="1"
                    className={`w-16 p-3 text-center border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
                <Button type="submit" disabled={loading || !newName.trim()} icon={Plus}>
                    新增
                </Button>
            </form>

            {/* 項目列表 */}
            <div className="space-y-4">
                {unpackedItems.length > 0 && (
                    <>
                        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>待打包 ({unpackedItems.length})</h3>
                        <div className="space-y-3">
                            {unpackedItems.map(item => (
                                <PackingItem 
                                    key={item.id} 
                                    item={item} 
                                    updateItem={updateItem} 
                                    deleteItem={deleteItem} 
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </>
                )}

                {packedItems.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>已打包 ({packedItems.length})</h3>
                        <div className="space-y-3">
                            {packedItems.map(item => (
                                <PackingItem 
                                    key={item.id} 
                                    item={item} 
                                    updateItem={updateItem} 
                                    deleteItem={deleteItem} 
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {packingItems.length === 0 && (
                    <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                        <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                        <p className="font-medium">您的行李清單是空的。</p>
                        <p className="text-sm">新增您需要帶的物品！</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 子任務組件 (Itinerary Planner) ---

/**
 * 子任務：行程日規劃
 */
const DayPlanner = ({ trip, userId, isDarkMode }) => {
    // 獲取行程日期範圍
    const startDate = trip?.startDate ? new Date(trip.startDate) : null;
    const endDate = trip?.endDate ? new Date(trip.endDate) : null;
    
    // 計算日期間隔
    const days = useMemo(() => {
        if (!startDate || !endDate || startDate > endDate) return [];

        const dayList = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dayList.push({
                date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
                display: currentDate.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' })
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dayList;
    }, [trip?.startDate, trip?.endDate]);

    const [currentDay, setCurrentDay] = useState(days[0]?.date || null);
    const [itineraryEntries, setItineraryEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // 新增行程活動的 state
    const [newTime, setNewTime] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newLocation, setNewLocation] = useState('');

    useEffect(() => {
        // 確保當 days 改變時，currentDay 被重置或設定為有效值
        if (days.length > 0 && (!currentDay || !days.some(day => day.date === currentDay))) {
            setCurrentDay(days[0].date);
        } else if (days.length === 0) {
            setCurrentDay(null);
        }
    }, [days, currentDay]);

    // 實時監聽當前日期的行程
    useEffect(() => {
        if (!userId || !trip.id || !currentDay) return;

        setLoading(true);
        const q = query(
            getSubcollectionRef(userId, trip.id, 'itinerary'),
            where('date', '==', currentDay),
            orderBy('time', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItineraryEntries(entries);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching itinerary: ", err);
            setError("無法載入行程細節。");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, trip.id, currentDay]);

    const handleAddEntry = useCallback(async (e) => {
        e.preventDefault();
        if (!newDescription.trim() || !currentDay) return;

        setLoading(true);
        setError(null);

        // 格式化時間，確保排序一致性
        const formattedTime = newTime.trim().padStart(5, '0');

        try {
            await runWithExponentialBackoff(() => 
                addDoc(getSubcollectionRef(userId, trip.id, 'itinerary'), {
                    date: currentDay,
                    time: formattedTime, // HH:MM 格式
                    description: newDescription.trim(),
                    location: newLocation.trim() || '',
                    createdAt: serverTimestamp(),
                })
            );
            setNewTime('');
            setNewDescription('');
            setNewLocation('');
            setIsAdding(false);
        } catch (err) {
            console.error("Error adding itinerary entry: ", err);
            setError("無法新增行程活動。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [newDescription, newTime, newLocation, userId, trip.id, currentDay]);

    const deleteEntry = useCallback(async (entryId) => {
        setLoading(true);
        setError(null);
        try {
            await runWithExponentialBackoff(() => 
                deleteDoc(doc(getSubcollectionRef(userId, trip.id, 'itinerary'), entryId))
            );
        } catch (err) {
            console.error("Error deleting itinerary entry: ", err);
            setError("無法刪除行程活動。請稍後再試。");
        } finally {
            setLoading(false);
        }
    }, [userId, trip.id]);

    const DaySelector = () => (
        <div className={`overflow-x-auto whitespace-nowrap py-3 ${isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            <div className="flex space-x-3 px-1">
                {days.map((day, index) => (
                    <button
                        key={day.date}
                        onClick={() => setCurrentDay(day.date)}
                        className={`inline-flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[70px] ${
                            day.date === currentDay 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : isDarkMode 
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-current={day.date === currentDay ? 'date' : undefined}
                    >
                        <span className="text-xs font-semibold">Day {index + 1}</span>
                        <span className="text-sm font-bold mt-1">{day.display.split(',')[0]}</span>
                        <span className="text-xs">{day.display.split(',')[1]}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const AddEntryForm = () => (
        <form onSubmit={handleAddEntry} className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-50'} shadow-inner space-y-3`}>
            <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-indigo-700'}`}>新增活動 ({currentDay})</h4>
            <div className="flex space-x-3">
                <div className="w-1/4">
                    <label htmlFor="newTime" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>時間</label>
                    <input
                        type="time"
                        id="newTime"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                        className={`w-full p-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="newDescription" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>活動描述</label>
                    <input
                        type="text"
                        id="newDescription"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="e.g., 參觀博物館"
                        required
                        className={`w-full p-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="newLocation" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>地點 (選填)</label>
                <input
                    type="text"
                    id="newLocation"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., 台北 101"
                    className={`w-full p-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
                <Button onClick={() => setIsAdding(false)} isPrimary={false} icon={X}>取消</Button>
                <Button type="submit" disabled={loading || !newDescription} icon={Plus}>新增活動</Button>
            </div>
        </form>
    );

    const ItineraryItem = ({ entry }) => (
        <div className={`flex items-start p-4 rounded-xl shadow-sm transition duration-150 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex flex-col items-center p-2 rounded-xl mr-4 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500'} text-white`}>
                <Clock className="h-5 w-5" />
                <span className="text-xs font-bold mt-1">{entry.time}</span>
            </div>
            <div className="flex-1">
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{entry.description}</p>
                {entry.location && (
                    <p className={`text-sm flex items-center mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <MapPin className="h-4 w-4 mr-1 opacity-75" />
                        {entry.location}
                    </p>
                )}
            </div>
            <button
                onClick={() => deleteEntry(entry.id)}
                className={`p-1 ml-3 rounded-full text-gray-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-100'} transition duration-150`}
                aria-label="刪除活動"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    if (!startDate || !endDate || days.length === 0) {
        return (
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg h-full`}>
                <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <Map className="h-6 w-6 mr-3" /> 行程規劃
                </h2>
                <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                    <CalendarDays className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                    <p className="font-medium">請在行程詳細資訊中設定有效的開始和結束日期，</p>
                    <p className="text-sm">才能開始規劃每日行程。</p>
                </div>
            </div>
        );
    }


    return (
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-lg h-full overflow-hidden`}>
            <div className="p-6">
                <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <Map className="h-6 w-6 mr-3" /> 行程規劃
                </h2>
                {error && <div className="mb-4"><ErrorMessage message={error} isDarkMode={isDarkMode} /></div>}
            </div>

            <DaySelector />

            <div className="p-6">
                
                {isAdding ? (
                    <AddEntryForm />
                ) : (
                    <Button onClick={() => setIsAdding(true)} icon={Plus} className="w-full mb-6">
                        為 {currentDay} 新增活動
                    </Button>
                )}
                
                {loading && <LoadingSpinner text="載入今日行程..." isDarkMode={isDarkMode} />}
                
                {!loading && itineraryEntries.length > 0 ? (
                    <div className="space-y-4 mt-6">
                        {itineraryEntries.map(entry => (
                            <ItineraryItem key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : !loading && (
                    <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                        <CalendarDays className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                        <p className="font-medium">這一天還沒有規劃活動。</p>
                        <p className="text-sm">點擊上方按鈕開始新增。</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- 行程詳細資訊組件 (Trip Detail) ---

/**
 * 行程詳細資訊組件 - 聚合子任務
 */
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [budgetEntries, setBudgetEntries] = useState([]);
    const [packingItems, setPackingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary', 'tasks', 'budget', 'packing'

    // 1. 實時監聽主要行程資料
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        setIsLoading(true);
        const tripDocRef = getTripDocRef(userId, tripId);

        const unsubscribe = onSnapshot(tripDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setTrip({ id: docSnapshot.id, ...docSnapshot.data() });
            } else {
                setError("行程不存在。");
                setTrip(null);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching trip data: ", err);
            setError("無法載入行程資料。");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, userId, tripId]);

    // 2. 實時監聽子集合數據 (Tasks, Budget, Packing)
    const setupSubcollectionListener = useCallback((subcollectionName, setter) => {
        if (!authReady || !userId || !tripId) return () => {};

        const subcollectionRef = getSubcollectionRef(userId, tripId, subcollectionName);
        const q = query(subcollectionRef, orderBy('createdAt', 'asc')); // 暫時排序

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setter(data);
        }, (err) => {
            console.error(`Error fetching ${subcollectionName}: `, err);
            setError(`無法載入 ${subcollectionName} 資料。`);
        });

        return unsubscribe;
    }, [authReady, userId, tripId]);

    useEffect(() => {
        const unsubTasks = setupSubcollectionListener('tasks', setTasks);
        const unsubBudget = setupSubcollectionListener('budget', setBudgetEntries);
        const unsubPacking = setupSubcollectionListener('packing', setPackingItems);
        
        return () => {
            unsubTasks();
            unsubBudget();
            unsubPacking();
        };
    }, [setupSubcollectionListener]);

    // 3. 行程資訊編輯功能 (名稱, 日期)
    const handleUpdateTripInfo = useCallback(async (updates) => {
        setIsLoading(true);
        setError(null);
        try {
             // 確保結束日期不早於開始日期
            if (updates.startDate && updates.endDate && new Date(updates.startDate) > new Date(updates.endDate)) {
                setError("結束日期不能早於開始日期！");
                setIsLoading(false);
                return;
            }
            
            await runWithExponentialBackoff(() => 
                updateDoc(getTripDocRef(userId, tripId), updates)
            );
        } catch (err) {
            console.error("Error updating trip info: ", err);
            setError("無法更新行程資訊。請稍後再試。");
        } finally {
            setIsLoading(false);
        }
    }, [userId, tripId]);

    // 顯示內容根據 Tab 切換
    const renderContent = () => {
        if (!trip) return null; // 錯誤已在外面處理

        switch (activeTab) {
            case 'itinerary':
                return <DayPlanner trip={trip} userId={userId} isDarkMode={isDarkMode} />;
            case 'tasks':
                return <TaskList tasks={tasks} userId={userId} tripId={tripId} isDarkMode={isDarkMode} />;
            case 'budget':
                return <BudgetManager budgetEntries={budgetEntries} userId={userId} tripId={tripId} isDarkMode={isDarkMode} />;
            case 'packing':
                return <PackingList packingItems={packingItems} userId={userId} tripId={tripId} isDarkMode={isDarkMode} />;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'itinerary', label: '行程', icon: Map, count: null, color: 'blue' },
        { id: 'tasks', label: '任務', icon: ListTodo, count: tasks.filter(t => !t.completed).length, color: 'indigo' },
        { id: 'budget', label: '預算', icon: PiggyBank, count: null, color: 'green' },
        { id: 'packing', label: '行李', icon: Briefcase, count: packingItems.filter(i => !i.packed).length, color: 'yellow' },
    ];

    if (!authReady || isLoading) {
        return (
            <div className={`min-h-screen flex items-start justify-center pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
                <LoadingSpinner isDarkMode={isDarkMode} />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className={`min-h-screen flex items-start justify-center pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
                <ErrorMessage message={error || "無法載入行程。"} isDarkMode={isDarkMode} />
            </div>
        );
    }
    
    // 行程資訊編輯組件
    const TripInfoEditor = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [name, setName] = useState(trip.name);
        const [startDate, setStartDate] = useState(trip.startDate);
        const [endDate, setEndDate] = useState(trip.endDate);

        const handleSave = () => {
            if (!name.trim() || !startDate || !endDate) return;
            handleUpdateTripInfo({ name: name.trim(), startDate, endDate });
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
                    <div className="flex flex-col space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full p-2 text-xl font-bold border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                        />
                        <div className="flex space-x-3">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`flex-1 p-2 border rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`flex-1 p-2 border rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button onClick={() => setIsEditing(false)} isPrimary={false} icon={X}>取消</Button>
                        <Button onClick={handleSave} icon={Check}>儲存</Button>
                    </div>
                    {error && <ErrorMessage message={error} isDarkMode={isDarkMode} />}
                </div>
            );
        }

        return (
            <div className={`flex justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{trip.name}</h2>
                    <p className={`text-sm flex items-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {trip.startDate} - {trip.endDate}
                    </p>
                </div>
                <Button onClick={() => setIsEditing(true)} icon={Edit} isPrimary={false}>
                    編輯
                </Button>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'}`}>
            {/* 使用 Header 組件作為導航欄 */}
            <Header 
                title="行程詳細資訊" 
                onBack={onBack} 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={() => {}} // 為了避免循環，這裡不啟用 Dark Mode 切換
            />

            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* 行程資訊 (名稱、日期) */}
                <TripInfoEditor />
                
                {/* Tab 導航 */}
                <div className={`flex flex-wrap border-b mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 
                                ${tab.id === activeTab 
                                    ? `border-${tab.color}-500 ${isDarkMode ? 'text-white' : `text-${tab.color}-600`}` 
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                }`}
                        >
                            <tab.icon className="h-5 w-5 mr-2" />
                            {tab.label}
                            {tab.count !== null && tab.count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full 
                                    ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab 內容 */}
                <div className="pb-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};


/**
 * 教學視圖組件
 */
const TutorialView = ({ onBack, isDarkMode }) => {
    const steps = [
        {
            title: "歡迎使用旅行規劃應用程式",
            content: "本應用程式旨在幫助您輕鬆組織和追蹤您的旅行細節。點擊左上角的箭頭圖示返回儀表板。",
            icon: Home,
            color: 'indigo'
        },
        {
            title: "建立新行程",
            content: "在儀表板上，點擊「新增行程」按鈕來開始規劃您的下一次旅行。您需要提供行程名稱、開始日期和結束日期。",
            icon: Plus,
            color: 'green'
        },
        {
            title: "行程詳細資訊",
            content: "進入行程後，您會看到四個核心標籤：行程、任務、預算、行李。所有數據都將即時同步並安全地儲存在雲端。",
            icon: NotebookPen,
            color: 'blue'
        },
        {
            title: "規劃每日行程",
            content: "在「行程」標籤中，點擊日期來切換每日視圖，並新增活動的時間和描述。",
            icon: Map,
            color: 'orange'
        },
        {
            title: "管理任務與行李",
            content: "「任務」和「行李」標籤讓您可以新增待辦事項和打包項目，並追蹤完成或打包的進度。",
            icon: ListTodo,
            color: 'yellow'
        },
        {
            title: "追蹤預算",
            content: "在「預算」標籤中，記錄您的收入和支出，應用程式會自動計算結餘，幫助您控制旅行花費。",
            icon: PiggyBank,
            color: 'red'
        },
        {
            title: "黑暗模式",
            content: "您可以使用導航欄右上角的月亮/太陽圖示隨時切換黑暗模式，以獲得更舒適的視覺體驗。",
            icon: Moon,
            color: 'gray'
        },
    ];

    return (
        <div className={`p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-3xl font-extrabold mb-8">應用程式快速入門指南</h1>
            
            <div className="space-y-8">
                {steps.map((step, index) => (
                    <div 
                        key={index} 
                        className={`p-6 rounded-xl shadow-xl transition duration-300 transform hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-${step.color}-500/50`}
                    >
                        <div className="flex items-center mb-4">
                            <step.icon className={`h-8 w-8 mr-4 text-${step.color}-500`} />
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{index + 1}. {step.title}</h2>
                        </div>
                        <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{step.content}</p>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-center">
                <Button onClick={onBack} icon={ChevronLeft}>
                    返回儀表板，開始規劃
                </Button>
            </div>
        </div>
    );
};

// --- 主要應用程式組件 ---

const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState('loading');
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(true); // 預設為黑暗模式

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // 1. Firebase 身份驗證和初始化
    useEffect(() => {
        const handleAuth = async (authInstance, token) => {
            try {
                if (token) {
                    await signInWithCustomToken(authInstance, token);
                } else {
                    await signInAnonymously(authInstance);
                }
            } catch (error) {
                console.error("Firebase Auth failed:", error);
                // 即使驗證失敗，仍嘗試繼續，但設置 authReady 為 true
            }
        };

        if (auth && initialAuthToken !== 'loading') {
            // 執行驗證操作
            runWithExponentialBackoff(() => handleAuth(auth, initialAuthToken), 3).catch(console.error);

            // 設置身份驗證狀態監聽器
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    setUserId(crypto.randomUUID()); // 未登入時使用隨機 ID
                }
                setAuthReady(true);
            });
            return () => unsubscribe();
        }
    }, []);

    // 2. 實時監聽行程列表 (一旦 authReady)
    useEffect(() => {
        if (!authReady || userId === 'loading') return;

        const collectionRef = getTripsCollectionRef(userId);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // 轉換時間戳為 Date 對象，以便在組件中使用
                createdAt: doc.data().createdAt, 
            }));
            setTrips(fetchedTrips);
        }, (err) => {
            console.error("Error fetching trips: ", err);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    const handleSelectTrip = useCallback((id) => {
        setSelectedTripId(id);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setSelectedTripId(null);
        setCurrentView('dashboard');
    }, []);

    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
    }, []);

    // 設置整體主題類名
    useEffect(() => {
        document.body.className = isDarkMode ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
            
            {currentView === 'dashboard' && (
                <div className="min-h-screen">
                    {/* 儀表板的 Header 包含標題和使用者 ID */}
                    <Header 
                        title="我的旅行儀表板" 
                        onBack={null} // 儀表板無返回
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                    />
                    <Dashboard 
                        onSelectTrip={handleSelectTrip} 
                        trips={trips} 
                        userId={userId} 
                        authReady={authReady}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial} // 新增教學入口
                    />
                </div>
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
                <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
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
