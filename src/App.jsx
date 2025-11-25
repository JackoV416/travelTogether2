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
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// 安全地解析 firebaseConfig，如果環境變數不存在，則使用空物件
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase 服務並追蹤錯誤
let app, db, auth;
let firebaseInitError = null; // 全域錯誤追蹤變數

try {
    // CRITICAL FIX: 檢查配置是否為空或缺少關鍵的 projectId
    if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.projectId) {
        // 拋出包含詳細資訊的錯誤，以便在 ErrorScreen 中顯示
        throw new Error(`Firebase configuration is missing 'projectId' or is empty. Please check the environment configuration.`);
    }
    
    // 確保只初始化一次
    if (!app) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    }
} catch (error) {
    console.error("Firebase initialization failed:", error.message);
    // 捕捉錯誤訊息，用於在 React 元件中顯示
    firebaseInitError = error.message;
}

// ----------------------------------------------------------------------
// 1. 公用元件
// ----------------------------------------------------------------------

// 錯誤訊息畫面元件
const ErrorScreen = ({ message, isDarkMode }) => (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-red-50 text-gray-900'}`}>
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">應用程式啟動錯誤</h1>
        <p className="text-lg font-medium mb-4">Firebase 服務初始化失敗。</p>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">錯誤詳情:</h3>
            <pre className="text-sm text-left whitespace-pre-wrap break-words text-red-700 dark:text-red-300">
                {message}
            </pre>
        </div>
        <p className="mt-6 text-gray-600 dark:text-gray-400">
            請檢查您的應用程式配置或網路連線，然後嘗試重新整理頁面。
        </p>
    </div>
);


// 模態框 (Custom Modal)
const Modal = ({ title, children, onClose, footer, className = "" }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transition-all duration-300 transform scale-100 ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// 載入狀態元件
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-indigo-500 dark:text-indigo-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">載入中...</p>
    </div>
);

// 無資料狀態元件
const EmptyState = ({ icon: Icon, title, description, className = "" }) => (
    <div className={`text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700 ${className}`}>
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
);

// Header 元件
const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode }) => {
    // 為了在 UI 中顯示完整的 userId，方便使用者分享
    const displayUserId = userId || "N/A";

    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-700/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="返回"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                    <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4 inline-block mr-1 align-middle" />
                        <span title="使用者 ID">{displayUserId}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

// ----------------------------------------------------------------------
// 2. 資料存取與結構
// ----------------------------------------------------------------------

// 取得 Firestore 集合路徑
const getCollectionPath = (userId, collectionName, isPublic = false) => {
    // 為了確保 Firestore 安全規則的運作，必須使用 __app_id
    const base = `artifacts/${appId}`;
    if (isPublic) {
        return `${base}/public/data/${collectionName}`;
    }
    // 私人資料路徑
    return `${base}/users/${userId}/${collectionName}`;
};

// ----------------------------------------------------------------------
// 3. TripDetail 相關元件 (精簡版)
// ----------------------------------------------------------------------

const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 只有在認證完成且服務初始化後才執行 Firestore 查詢
        if (!authReady || !db || !userId || !tripId) return;

        const path = getCollectionPath(userId, 'trips');
        const tripRef = doc(db, path, tripId);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
                setError(null);
            } else {
                setError("找不到該行程。");
                setTrip(null);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching trip detail:", err);
            setError("載入行程詳情時發生錯誤。");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId, authReady]);

    if (!authReady || isLoading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
                <Header title="載入行程..." onBack={onBack} userId={userId} isDarkMode={isDarkMode} toggleDarkMode={()=>{}}/>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
                <Header title="錯誤" onBack={onBack} userId={userId} isDarkMode={isDarkMode} toggleDarkMode={()=>{}}/>
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <EmptyState 
                        icon={AlertTriangle} 
                        title="行程載入失敗" 
                        description={error} 
                        className="bg-white dark:bg-gray-800"
                    />
                </div>
            </div>
        );
    }
    
    // 渲染行程詳情 (簡化版)
    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
            <Header title={trip?.name || "行程詳情"} onBack={onBack} userId={userId} isDarkMode={isDarkMode} toggleDarkMode={()=>{}}/>
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{trip.name}</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-indigo-500" /> 日期: {trip.dates || '未定'}</p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-indigo-500" /> 地點: {trip.destination || '未定'}</p>
                    
                    <div className="mt-6 border-t dark:border-gray-700 pt-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><NotebookPen className="w-5 h-5 mr-2" /> 行程筆記 (簡化)</h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{trip.notes || '尚無筆記。'}</p>
                    </div>

                    {/* 這裡可以擴展顯示其他細節，例如待辦清單、預算等 */}
                </div>
            </main>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. Dashboard 相關元件
// ----------------------------------------------------------------------

// 行程卡片
const TripCard = ({ trip, onSelectTrip }) => (
    <div 
        onClick={() => onSelectTrip(trip.id)} 
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{trip.name}</h3>
            <MapPin className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{trip.destination || '目的地未定'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{trip.dates || '日期未定'}</p>
    </div>
);

// 新增行程表單
const AddTripForm = ({ userId, onAdded, onError }) => {
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [dates, setDates] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !userId || !db) return;
        
        setIsSubmitting(true);
        try {
            const path = getCollectionPath(userId, 'trips');
            await addDoc(collection(db, path), {
                name,
                destination,
                dates,
                notes: "",
                createdAt: serverTimestamp(),
            });
            onAdded();
        } catch (err) {
            console.error("Error adding document: ", err);
            onError("新增行程失敗。請稍後再試。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="trip-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">行程名稱</label>
                <input
                    id="trip-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white p-2"
                    placeholder="例如：日本賞櫻之旅"
                />
            </div>
            <div>
                <label htmlFor="trip-destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">目的地</label>
                <input
                    id="trip-destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white p-2"
                    placeholder="例如：東京, 日本"
                />
            </div>
            <div>
                <label htmlFor="trip-dates" className="block text-sm font-medium text-gray-700 dark:text-gray-300">日期</label>
                <input
                    id="trip-dates"
                    type="text"
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white p-2"
                    placeholder="例如：2025/03/20 - 2025/03/27"
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !name}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-1" />}
                    新增行程
                </button>
            </div>
        </form>
    );
};

// 儀表板 (Dashboard)
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState(null); // 用於顯示成功/失敗訊息

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleTripAdded = () => {
        setIsModalOpen(false);
        setMessage({ type: 'success', text: '行程新增成功！' });
    };

    const handleTripError = (errorText) => {
        setMessage({ type: 'error', text: errorText });
    };

    // 處理行程刪除（簡化）
    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm("確定要刪除此行程嗎？所有相關資料將會遺失。")) return;

        try {
            const path = getCollectionPath(userId, 'trips');
            await deleteDoc(doc(db, path, tripId));
            setMessage({ type: 'success', text: '行程已刪除。' });
        } catch (error) {
            console.error("Error deleting trip:", error);
            setMessage({ type: 'error', text: '刪除行程失敗。' });
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
            <Header 
                title="旅行規劃儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
            />
            
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                
                {/* 訊息提示 */}
                {message && (
                    <div className={`p-3 rounded-lg mb-6 shadow-md transition-opacity duration-500 ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {message.text}
                    </div>
                )}

                {/* 行動區塊 */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        新增行程
                    </button>
                    <button
                        onClick={onTutorialStart}
                        className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium py-2 px-4 rounded-xl border border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <BookOpenText className="w-5 h-5 mr-2" />
                        應用程式教學
                    </button>
                </div>

                {/* 行程列表 */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Briefcase className="w-6 h-6 mr-2 text-indigo-500" /> 我的行程</h2>
                
                {authReady && trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className="relative group">
                                <TripCard trip={trip} onSelectTrip={onSelectTrip} />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                                    aria-label="刪除行程"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : authReady ? (
                    <EmptyState 
                        icon={Map} 
                        title="尚未建立任何行程" 
                        description="點擊「新增行程」開始規劃您的下一趟旅程！"
                        className="mt-8 bg-white dark:bg-gray-800"
                    />
                ) : (
                    <LoadingSpinner />
                )}

                {/* 新增行程模態框 */}
                {isModalOpen && (
                    <Modal 
                        title="規劃新行程" 
                        onClose={() => setIsModalOpen(false)}
                    >
                        <AddTripForm 
                            userId={userId} 
                            onAdded={handleTripAdded} 
                            onError={handleTripError}
                        />
                    </Modal>
                )}
            </main>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. 應用程式教學 (TutorialView - 簡化版)
// ----------------------------------------------------------------------

const TutorialView = ({ onBack, isDarkMode }) => {
    const steps = [
        { icon: Plus, title: "1. 新增行程", content: "點擊儀表板上的「新增行程」按鈕，輸入行程名稱、目的地和日期。" },
        { icon: MapPin, title: "2. 查看與編輯", content: "點擊任何行程卡片進入詳情頁面，您可以在那裡新增筆記、待辦清單和預算。" },
        { icon: ListTodo, title: "3. 待辦清單", content: "在行程詳情頁面，您可以管理行前準備清單，例如預訂機票、辦理簽證等。" },
        { icon: PiggyBank, title: "4. 預算追蹤", content: "（此為未來功能）將來您可以追蹤旅行預算，記錄支出，確保不超支。" },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-8">開始使用「一起旅行」</h2>
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex space-x-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 dark:border-indigo-400">
                        <step.icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300">{step.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-10 text-center">
                <button
                    onClick={onBack}
                    className="inline-flex items-center bg-indigo-100 text-indigo-700 font-medium py-2 px-6 rounded-xl hover:bg-indigo-200 transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    返回儀表板
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 6. 主要應用程式元件
// ----------------------------------------------------------------------

const App = () => {
    // 檢查黑暗模式
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // 認證與狀態管理
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);

    // Firebase 認證邏輯
    useEffect(() => {
        // 如果 Firebase 初始化失敗，則停止執行認證邏輯
        if (firebaseInitError) {
            setAuthReady(true); // 設置為 true，讓 App 組件跳過載入畫面直接顯示錯誤
            return;
        }

        if (!auth) {
            console.error("Auth service is not initialized, but firebaseInitError is null.");
            return;
        }

        // 1. 設定認證狀態觀察者
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 已登入（可能是 custom token 或匿名登入）
                setUserId(user.uid);
                setAuthReady(true);
            } else {
                // 2. 執行初始登入 (Custom Token > 匿名登入)
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Initial sign-in failed:", error);
                    // 即使登入失敗，也標記認證準備就緒，但 userId 仍為 null
                    setAuthReady(true); 
                }
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Firestore 資料訂閱邏輯
    useEffect(() => {
        // 只有在認證完成且有 userId 時才開始訂閱資料
        if (!authReady || !userId || !db) return;

        const path = getCollectionPath(userId, 'trips');
        const q = query(collection(db, path), orderBy("createdAt", "desc"));

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
            // 這裡可以設置一個 state 來顯示資料載入錯誤
        });

        return () => unsubscribeSnapshot();
    }, [userId, authReady]);


    // 視圖切換函數
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

    // ------------------------------------------------------------------
    // 渲染
    // ------------------------------------------------------------------

    // 1. 如果 Firebase 初始化失敗，顯示錯誤畫面
    if (firebaseInitError) {
        return <ErrorScreen message={firebaseInitError} isDarkMode={isDarkMode} />;
    }

    // 2. 如果認證尚未準備就緒，顯示載入畫面
    if (!authReady) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
                <Header title="旅行規劃" userId={null} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                <LoadingSpinner />
            </div>
        );
    }

    // 3. 根據當前視圖渲染主內容
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
