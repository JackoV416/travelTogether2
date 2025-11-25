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
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp
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

// ====================================================================
// --- 輔助函式 (Helpers) ---
// ====================================================================

const getCollectionPath = (collectionName, userId) => {
    // 使用者的私有資料路徑
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ====================================================================
// --- 通用組件 (General Components) ---
// ====================================================================

// **修正點 1: 新增 LoadingScreen 以優化初始體驗**
const LoadingScreen = ({ isDarkMode }) => {
    const themeClass = isDarkMode ? 'bg-gray-900 text-slate-100' : 'bg-slate-50 text-gray-900';
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${themeClass} p-8`}>
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">載入中...</h1>
            <p className="text-slate-500 dark:text-slate-400">正在準備您的旅程規劃工具</p>
        </div>
    );
};

const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode }) => {
    const bgColor = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <header className={`sticky top-0 z-10 w-full border-b shadow-md ${bgColor}`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between p-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-full transition-colors ${textColor} hover:bg-slate-100 dark:hover:bg-gray-700`}
                            aria-label="返回"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className={`text-xl font-bold truncate ${textColor}`}>{title}</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors ${textColor} hover:bg-slate-100 dark:hover:bg-gray-700`}
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {/* 這裡顯示使用者ID，方便多人協作測試 */}
                    <div className={`hidden sm:block text-xs font-mono px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        ID: {userId ? userId.substring(0, 8) + '...' : 'Guest'}
                    </div>
                </div>
            </div>
        </header>
    );
};

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-gray-700 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
    let baseStyle = 'flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md';
    let variantStyle = '';

    switch (variant) {
        case 'primary':
            variantStyle = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50';
            break;
        case 'secondary':
            variantStyle = 'bg-slate-200 text-gray-800 hover:bg-slate-300 dark:bg-gray-700 dark:text-slate-100 dark:hover:bg-gray-600';
            break;
        case 'danger':
            variantStyle = 'bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/50';
            break;
        case 'outline':
            variantStyle = 'border border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700';
            break;
        case 'ghost':
            variantStyle = 'text-gray-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700 shadow-none';
            break;
        default:
            variantStyle = 'bg-indigo-600 text-white hover:bg-indigo-700';
    }

    if (disabled) {
        variantStyle = 'bg-slate-400 text-slate-600 dark:bg-gray-600 dark:text-slate-400 cursor-not-allowed shadow-none';
    }

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variantStyle} ${className}`}
            disabled={disabled}
        >
            {Icon && <Icon className="w-5 h-5" />}
            <span>{children}</span>
        </button>
    );
};

// ====================================================================
// --- 儀表板組件 (Dashboard) ---
// (為節省篇幅，這裡僅保留框架，假設詳細邏輯在應用中實現)
// ====================================================================

const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const handleCreateNewTrip = useCallback(async () => {
        if (!userId) return;
        const newTripData = {
            name: '我的新旅程',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            destination: '未定地點',
            createdAt: serverTimestamp(),
            userId: userId,
        };
        try {
            const path = getCollectionPath('trips', userId);
            await addDoc(collection(db, path), newTripData);
        } catch (error) {
            console.error("創建新旅程失敗:", error);
        }
    }, [userId]);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';

    return (
        <div className={`min-h-screen ${bgClass}`}>
            <Header 
                title="旅程規劃儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
            />
            
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <Card className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">我的旅程</h2>
                    <div className="flex space-x-3">
                        <Button onClick={onTutorialStart} variant="secondary" icon={BookOpenText} className="text-sm">
                            應用程式教學
                        </Button>
                        <Button onClick={handleCreateNewTrip} icon={Plus} className="text-sm">
                            新增旅程
                        </Button>
                    </div>
                </Card>

                {trips.length === 0 ? (
                    <Card className="text-center py-12">
                        <MapPin className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                        <p className="text-lg font-medium dark:text-slate-300">尚未有任何旅程。點擊「新增旅程」開始規劃吧！</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <Card key={trip.id} className="cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{trip.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    {trip.startDate} 至 {trip.endDate}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                        <MapPin className="w-4 h-4 mr-1" /> {trip.destination}
                                    </span>
                                    <Button onClick={() => onSelectTrip(trip.id)} variant="ghost" className="text-sm">
                                        查看詳情
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// ====================================================================
// --- 旅程詳情組件 (TripDetail) ---
// (為節省篇幅，這裡僅保留框架，假設詳細邏輯在應用中實現)
// ====================================================================

const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    // 假設這裡有複雜的 state 和 Firebase 數據訂閱
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        setIsLoading(true);
        const path = getCollectionPath('trips', userId);
        const tripRef = doc(db, path, tripId);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.log("No such document!");
                setTrip(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, userId, tripId]);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';

    if (isLoading) {
        return (
            <div className={`min-h-screen ${bgClass}`}>
                <Header title="載入旅程..." onBack={onBack} userId={userId} isDarkMode={isDarkMode} />
                <LoadingScreen isDarkMode={isDarkMode} />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className={`min-h-screen ${bgClass}`}>
                <Header title="錯誤" onBack={onBack} userId={userId} isDarkMode={isDarkMode} />
                <Card className="max-w-4xl mx-auto mt-8 p-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <p className="text-lg dark:text-slate-300">找不到該旅程。</p>
                </Card>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bgClass}`}>
            <Header 
                title={trip.name} 
                onBack={onBack} 
                userId={userId} 
                isDarkMode={isDarkMode} 
            />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <Card>
                    <h2 className="text-xl font-bold dark:text-white mb-4">旅程概覽</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm dark:text-slate-300">
                        <p><strong>目的地:</strong> {trip.destination}</p>
                        <p><strong>日期:</strong> {trip.startDate} - {trip.endDate}</p>
                    </div>
                </Card>
                {/* 這裡應該包含行程、預算、筆記等詳細功能組件 */}
                <Card>
                    <h3 className="text-lg font-semibold dark:text-white">行程計畫 (假設組件)</h3>
                    <p className="text-slate-500 mt-2">（此處為行程規劃列表和地圖組件）</p>
                </Card>
            </main>
        </div>
    );
};

// ====================================================================
// --- 教學視圖組件 (TutorialView) ---
// (為節省篇幅，這裡僅保留框架，假設詳細邏輯在應用中實現)
// ====================================================================

const TutorialView = ({ onBack, isDarkMode }) => {
    const tutorialSteps = [
        { title: "步驟 1: 新增旅程", content: "從儀表板點擊「新增旅程」，為您的旅途設定名稱和日期。", icon: Plus },
        { title: "步驟 2: 旅程詳情", content: "進入旅程後，您可以管理行程、預算和筆記。", icon: ClipboardList },
        { title: "步驟 3: 預算追蹤", content: "使用預算功能追蹤每筆花費，確保不超支。", icon: PiggyBank },
        { title: "步驟 4: 筆記和清單", content: "紀錄重要事項或打包清單。", icon: NotebookPen },
    ];
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 text-center mb-8">
                快速入門指南
            </h2>
            <div className="space-y-6">
                {tutorialSteps.map((step, index) => (
                    <Card key={index}>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    {step.content}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="text-center pt-4">
                <Button onClick={onBack} variant="primary" className="mt-4">
                    開始規劃我的旅程
                </Button>
            </div>
        </div>
    );
};

// ====================================================================
// --- 主要應用程式 (App Component) ---
// ====================================================================

const App = () => {
    // 狀態管理
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false); // 新增深色模式狀態

    // 處理深色模式切換
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // 設置深色模式 class
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    // 1. Firebase 認證和初始化
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth initialization error:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null); // 在極少數情況下，使用者可能會登出
            }
            setAuthReady(true);
        });

        // 啟動認證流程
        if (!auth.currentUser) {
            initializeAuth();
        } else {
            setAuthReady(true);
        }

        return () => unsubscribe();
    }, []);

    // 2. 旅程數據訂閱 (在認證完成後執行)
    useEffect(() => {
        if (!authReady || !userId) return;

        const path = getCollectionPath('trips', userId);
        const tripsQuery = query(collection(db, path), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]); // 依賴於 authReady 和 userId

    // 視圖切換邏輯
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

    // **修正點 2: 在未認證完成時顯示 LoadingScreen**
    if (!authReady) {
        return <LoadingScreen isDarkMode={isDarkMode} />;
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
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
