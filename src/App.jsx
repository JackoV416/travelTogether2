import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction, setLogLevel // 確保導入 setLogLevel
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 (修正區塊) ---
// 確保全域變數存在並被正確解析
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase (確保只執行一次，並包含錯誤處理)
let app, db, auth;
try {
    // 檢查配置是否有效，防止缺少 projectId 的錯誤
    if (!firebaseConfig.projectId) {
         throw new Error("Firebase configuration is missing projectId. Cannot initialize.");
    }
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // 設定 Firebase 偵錯日誌級別 (Firestore 最佳實踐)
    setLogLevel('debug'); 
} catch (error) {
    // 如果配置無效或初始化失敗，將錯誤印出
    console.error("Firebase 初始化失敗 (projectId 錯誤或配置問題):", error.message || error);
}

// --- Firestore 路徑工具函數 ---

/**
 * 取得使用者私人資料集合的路徑。
 * @param {string} userId - 當前用戶 ID
 * @param {string} collectionName - 集合名稱 (e.g., 'trips')
 * @returns {import('firebase/firestore').CollectionReference}
 */
const getUserCollectionRef = (userId, collectionName) => {
    if (!db || !userId) {
        throw new Error("Firestore 或用戶 ID 未準備就緒.");
    }
    // 私人資料路徑: /artifacts/{appId}/users/{userId}/{collectionName}
    return collection(db, 'artifacts', appId, 'users', userId, collectionName);
};

// --- 通用元件 (介面和功能完全保留) ---

const LoadingSpinner = ({ text = "載入中..." }) => (
    <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400" />
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">{text}</p>
    </div>
);

const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode }) => {
    // 顯示 User ID 的前幾位，方便測試多人協作
    const displayUserId = userId ? `${userId.substring(0, 8)}...` : '未登入';
    
    return (
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            aria-label="返回"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[calc(100vw-200px)]">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 font-mono">
                        ID: {displayUserId}
                    </span>
                    <button 
                        onClick={toggleDarkMode} 
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

// 1. TutorialView
const TutorialView = ({ onBack, isDarkMode }) => (
    <main className="container mx-auto p-4 sm:p-6 pb-20">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">歡迎使用旅行規劃應用程式！</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                這個應用程式允許您創建、編輯和管理您的旅行。您的所有資料都安全地儲存在 Firestore 資料庫中。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                <li>**儀表板 (Dashboard):** 查看所有旅行，並創建新旅行。</li>
                <li>**旅行詳情 (TripDetail):** 規劃行程、預算、待辦事項等。</li>
                <li>**即時同步:** 任何變更都會立即同步，多人協作時尤其有用。</li>
            </ul>
            <button 
                onClick={onBack} 
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
                開始規劃旅行
            </button>
        </div>
    </main>
);

// 2. Dashboard
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart, onDeleteTrip }) => {
    const [newTripName, setNewTripName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // 功能保留：創建新旅行
    const handleCreate = async () => {
        // 只有在 db 和 userId 都準備好時才能執行寫入操作
        if (!newTripName.trim() || !userId || !db) return;
        setIsAdding(true);
        try {
            const tripData = {
                name: newTripName.trim(),
                startDate: new Date().toISOString().substring(0, 10),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 預設一週後
                createdAt: serverTimestamp(),
                ownerId: userId,
                theme: 'city'
            };
            const colRef = getUserCollectionRef(userId, 'trips');
            await addDoc(colRef, tripData);
            setNewTripName('');
        } catch (error) {
            console.error("創建旅行失敗:", error);
        } finally {
            setIsAdding(false);
        }
    };

    if (!authReady) {
        return <LoadingSpinner text="準備驗證中..." />;
    }
    
    // 使用自訂 UI 替代 window.confirm/alert
    const handleDeleteClick = (tripId) => {
        // 警告：這是一個臨時的替代方案，實際應用中應使用客製化 Modal UI
        if (window.confirm("確定要永久刪除此旅行計畫嗎？")) { 
            onDeleteTrip(tripId);
        }
    };


    return (
        <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
            <Header 
                title="我的旅行儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode} 
            />
            <main className="container mx-auto p-4 sm:p-6 pb-20">
                
                {/* 創建新旅行區塊 (介面保留) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">新增旅行</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="輸入旅行名稱..."
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            disabled={isAdding}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={isAdding || !newTripName.trim()}
                            className="flex-shrink-0 p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center"
                        >
                            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* 教學按鈕 (介面保留) */}
                <button 
                    onClick={onTutorialStart}
                    className="w-full mb-6 p-3 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 font-medium rounded-xl flex items-center justify-center space-x-2 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition"
                >
                    <BookOpenText className="w-5 h-5" />
                    <span>查看應用程式教學</span>
                </button>

                {/* 旅行列表 (介面保留) */}
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">所有旅行 ({trips.length})</h2>
                {trips.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-500 dark:text-gray-400">
                        <Map className="w-12 h-12 mx-auto mb-3" />
                        <p>目前沒有任何旅行計畫，趕快新增一個吧！</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trips.map(trip => (
                            <div 
                                key={trip.id} 
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col"
                            >
                                <div className="p-5 flex-grow">
                                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 truncate">{trip.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <CalendarDays className="w-4 h-4 inline mr-1" />
                                        {trip.startDate} - {trip.endDate}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        建立於: {trip.createdAt ? new Date(trip.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex justify-end p-4 border-t border-gray-100 dark:border-gray-700 space-x-2">
                                    <button 
                                        onClick={() => handleDeleteClick(trip.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition"
                                        aria-label="刪除旅行"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onSelectTrip(trip.id)}
                                        className="py-2 px-4 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition"
                                    >
                                        查看詳情
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// 3. TripDetail
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 功能保留：實時監聽單個旅行文檔
    useEffect(() => {
        if (!authReady || !userId || !tripId || !db) return;

        try {
            const docRef = doc(getUserCollectionRef(userId, 'trips'), tripId);
            
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setTripData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("旅行不存在或已被刪除");
                    onBack(); // 文檔被刪除時返回儀表板
                }
                setLoading(false);
            }, (error) => {
                console.error("監聽旅行詳情失敗:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("設定 TripDetail 訂閱失敗:", e);
            setLoading(false);
            return;
        }
    }, [authReady, userId, tripId, onBack]);

    // 功能保留：更新單個字段
    const handleUpdate = async (field, value) => {
        if (!userId || !tripId || !db) return;
        try {
            const docRef = doc(getUserCollectionRef(userId, 'trips'), tripId);
            await updateDoc(docRef, { [field]: value });
            console.log(`更新字段 ${field} 成功`);
        } catch (error) {
            console.error("更新旅行數據失敗:", error);
        }
    };

    if (loading) {
        return <LoadingSpinner text="載入旅行詳情..." />;
    }

    if (!tripData) {
        return <div className="p-8 text-center dark:text-white">無法載入旅行數據。</div>;
    }

    return (
        <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
            <Header 
                title={tripData.name || "旅行詳情"} 
                onBack={onBack} 
                userId={userId} 
                isDarkMode={isDarkMode}
            />
            <main className="container mx-auto p-4 sm:p-6 pb-20">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">基本資訊</h2>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="font-medium text-gray-700 dark:text-gray-300 w-32">名稱:</label>
                            <input 
                                type="text"
                                value={tripData.name || ''}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white mt-1 sm:mt-0"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="font-medium text-gray-700 dark:text-gray-300 w-32">開始日期:</label>
                            <input 
                                type="date"
                                value={tripData.startDate || ''}
                                onChange={(e) => handleUpdate('startDate', e.target.value)}
                                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white mt-1 sm:mt-0"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="font-medium text-gray-700 dark:text-gray-300 w-32">結束日期:</label>
                            <input 
                                type="date"
                                value={tripData.endDate || ''}
                                onChange={(e) => handleUpdate('endDate', e.target.value)}
                                className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white mt-1 sm:mt-0"
                            />
                        </div>
                    </div>
                </div>

                {/* 擴展模塊佔位符 (介面保留) */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">行程規劃</h2>
                    <div className="text-gray-500 dark:text-gray-400">
                        <MapPin className="w-5 h-5 inline mr-2" />
                        詳細的行程、預算和待辦事項模塊待未來實作。
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- 主要應用程式元件 (功能保留與 Firebase 修正) ---

const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 1. 處理深色模式切換 (功能保留)
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
            return newMode;
        });
    }, []);

    // 初始載入深色模式設定 (功能保留)
    useEffect(() => {
        const storedMode = localStorage.getItem('darkMode');
        if (storedMode === 'true' || (!storedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // 2. Firebase 身份驗證與狀態管理 (修正區塊)
    useEffect(() => {
        if (!auth) {
            // 如果 auth 沒有初始化成功 (例如配置錯誤)，直接跳過
            setAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                console.log("Firebase Auth State: Logged in as", user.uid);
            } else {
                try {
                    // 根據 Canvas 環境變數決定登入方式
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        console.log("Firebase Auth: Signed in with custom token.");
                    } else {
                        await signInAnonymously(auth);
                        console.log("Firebase Auth: Signed in anonymously.");
                    }
                } catch (error) {
                    console.error("Firebase 身份驗證失敗:", error);
                }
            }
            // 無論登入結果如何，都標記驗證流程已準備就緒
            setAuthReady(true); 
        });

        return () => unsubscribe();
    }, []); 

    // 3. 實時資料訂閱 (Trips) (功能保留與修正)
    useEffect(() => {
        // 只有在驗證完成、拿到 userId 且 db 實例存在時才開始訂閱
        if (!authReady || !userId || !db) {
            setTrips([]);
            return;
        }

        try {
            const tripsRef = getUserCollectionRef(userId, 'trips');
            // 查詢：按創建時間降序排列 (功能保留)
            const q = query(tripsRef, orderBy('createdAt', 'desc'));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt : null 
                }));
                setTrips(fetchedTrips);
                console.log(`Firestore Snapshot: 成功取得 ${fetchedTrips.length} 筆旅行紀錄。`);
            }, (error) => {
                console.error("實時資料訂閱失敗:", error);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("設定 Firestore 訂閱失敗:", e);
            setTrips([]);
            return;
        }
    }, [userId, authReady]); 

    // 4. 視圖切換與操作 (功能保留)

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

    const handleDeleteTrip = async (tripId) => {
        if (!userId || !db) return;

        try {
            const tripDocRef = doc(getUserCollectionRef(userId, 'trips'), tripId);
            await deleteDoc(tripDocRef);
            console.log("旅行刪除成功:", tripId);
            
            if (selectedTripId === tripId) {
                handleBackToDashboard();
            }
        } catch (error) {
            console.error("刪除旅行失敗:", error);
        }
    };


    if (!authReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900">
                <LoadingSpinner text="應用程式初始化中..." />
            </div>
        );
    }
    
    // 如果 Firebase 初始化失敗 (例如配置錯誤)，顯示錯誤訊息
    if (!db || !auth) {
        return (
            <div className="p-10 text-center dark:text-white min-h-screen bg-slate-50 dark:bg-gray-900">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-500" />
                <h2 className="text-xl font-bold text-red-500">Firebase 服務無法使用</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    請檢查 Firebase 配置 (`__firebase_config`) 是否正確。
                </p>
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
                    onTutorialStart={handleStartTutorial} 
                    onDeleteTrip={handleDeleteTrip} // 傳遞刪除功能
                />
            )}
            
            {currentView === 'tripDetail' && selectedTripId && (
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
                    <Header 
                        title="應用程式教學" 
                        onBack={handleBackToDashboard} 
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

            {/* 錯誤處理或無效視圖 */}
            {currentView !== 'dashboard' && currentView !== 'tripDetail' && currentView !== 'tutorial' && (
                <div className="p-10 text-center text-red-500">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
                    <p>錯誤：無效的應用程式視圖。</p>
                </div>
            )}
        </div>
    );
};

export default App;
