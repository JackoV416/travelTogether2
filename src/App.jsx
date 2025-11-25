import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { 
    getFirestore, setLogLevel, collection, onSnapshot, addDoc, serverTimestamp
} from 'firebase/firestore';

import { 
    Loader2, ChevronLeft, Sun, Moon, LogOut, User, BookOpenText, Plus, AlertTriangle 
} from 'lucide-react';


// =================================================================================
// --- 全域變數和 Firebase 設定 ---
// =================================================================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let firebaseConfig = {};
try {
    // 讀取並解析全域 Firebase 配置字串
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        firebaseConfig = JSON.parse(__firebase_config);
    } else {
        console.warn("警告：全域變數 __firebase_config 缺失或為空。Firebase 初始化將跳過。");
    }
} catch (e) {
    console.error("錯誤：解析 __firebase_config 失敗，請檢查 JSON 格式。", e);
}

// 初始化 Firebase (確保只執行一次)
let app = null;
let db = null;
let auth = null;

try {
    if (firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        setLogLevel('debug');
        console.log("Firebase 服務初始化成功。Project ID:", firebaseConfig.projectId);
    } else {
        console.error("Firebase 初始化失敗：配置缺少 projectId。請確認環境變數正確傳入。");
    }
} catch (error) {
    console.error("Firebase 服務初始化時發生例外錯誤：", error);
}

/**
 * 處理初始認證邏輯：使用自定義 Token 或匿名登入。
 */
async function performInitialAuth(authInstance, token) {
    if (!authInstance) {
        console.warn("Firebase Auth 實例未初始化 (auth 為 null)，跳過登入。");
        return;
    }
    try {
        if (token) {
            await signInWithCustomToken(authInstance, token);
        } else {
            await signInAnonymously(authInstance);
        }
    } catch (error) {
        console.error("Firebase Auth 登入失敗：", error);
    }
}


// =================================================================================
// 輔助函式 (Helper Components)
// =================================================================================

/**
 * 應用程式的導覽列
 */
const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode }) => (
    <div className={`flex justify-between items-center p-4 shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex items-center space-x-2">
            {onBack && <button onClick={onBack} className="text-xl p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition"><ChevronLeft size={24} /></button>}
            <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
            {/* 顯示用戶 ID 的前幾個字符 */}
            <span className="text-sm font-mono truncate max-w-[100px] sm:max-w-none">
                <User size={16} className="inline mr-1" />{userId.substring(0, 8)}...
            </span>
            {auth && (
                <>
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition" title="切換黑暗模式">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => firebaseSignOut(auth)} className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition" title="登出">
                        <LogOut size={20} />
                    </button>
                </>
            )}
        </div>
    </div>
);

/**
 * 旅行儀表板 (Dashboard)
 */
const Dashboard = ({ onSelectTrip, trips, onTutorialStart }) => {
    // 範例：新增一個旅行計劃
    const handleAddTrip = async () => {
        if (!db || !auth.currentUser) {
            console.error("Firestore 或用戶未準備好。");
            // 可以在 UI 上顯示一個警告訊息
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            // 私有資料路徑: /artifacts/{appId}/users/{userId}/trips
            const collectionPath = `artifacts/${appId}/users/${userId}/trips`;

            await addDoc(collection(db, collectionPath), {
                name: `我的新旅行 - ${new Date().toLocaleDateString()}`,
                destination: "未定地點",
                startDate: new Date().toISOString().substring(0, 10),
                timestamp: serverTimestamp(),
            });
            console.log("新旅行已新增。");
        } catch (error) {
            console.error("新增旅行失敗:", error);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">旅行儀表板</h2>
            
            <div className="flex justify-between items-center mb-4 space-x-2">
                <button onClick={handleAddTrip} 
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center shadow-lg transition">
                    <Plus size={20} className="mr-2"/> 新增旅行計劃
                </button>
                <button onClick={onTutorialStart} 
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center shadow-lg transition">
                    <BookOpenText size={20} className="mr-2"/> 應用程式教學
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.length === 0 ? (
                    <p className="col-span-full text-center p-8 border-dashed border-2 rounded-lg text-gray-500 dark:text-gray-400">
                        目前沒有旅行計劃。點擊 "新增旅行計劃" 開始規劃吧！
                    </p>
                ) : (
                    trips.map(trip => (
                        <div key={trip.id} onClick={() => onSelectTrip(trip.id)} 
                             className="p-5 border rounded-xl shadow-md hover:shadow-lg cursor-pointer transition 
                                        bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <h3 className="text-xl font-bold mb-1 truncate">{trip.name}</h3>
                            <p className="text-sm text-blue-500 dark:text-blue-400">目的地: {trip.destination}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                開始日期: {trip.startDate}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * 旅行細節頁面 (TripDetail)
 */
const TripDetail = ({ tripId, onBack, userId, isDarkMode }) => (
    <div className="min-h-screen">
        <div className="p-8">
            <h2 className="text-3xl font-semibold mb-4">旅行 {tripId.substring(0, 6)}... 的詳細資訊</h2>
            <p className="mt-4 p-8 text-center border-2 border-dashed rounded-xl text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                這是旅行規劃的詳細編輯介面 (待實現所有功能，如日程、預算等)。
            </p>
        </div>
    </div>
);

/**
 * 教學視圖 (TutorialView)
 */
const TutorialView = ({ onBack }) => (
    <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-500">應用程式教學</h2>
        <p className="mb-4 text-lg">
            歡迎使用旅行規劃應用程式！所有資料都會安全地儲存在您的私人 Firestore 集合中。
        </p>
        <ul className="list-disc list-inside space-y-3 text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <li><span className="font-semibold">Firebase 配置</span>: 應用程式自動讀取平台提供的 <code>__firebase_config</code> 全域變數進行初始化。</li>
            <li><span className="font-semibold">認證</span>: 您是透過 <code>__initial_auth_token</code> 自動登入的，如果 Token 不存在，則會執行匿名登入。</li>
            <li><span className="font-semibold">資料路徑</span>: 您的旅行資料儲存於 <code>/artifacts/{appId}/users/{userId}/trips</code>，確保資料隔離。</li>
            <li><span className="font-semibold">即時同步</span>: 儀表板上的所有旅行計劃都會使用 <code>onSnapshot</code> 實時更新。</li>
        </ul>
        <button onClick={onBack} className="mt-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-3 rounded-lg transition flex items-center font-semibold">
            <ChevronLeft size={20} className="mr-2" />返回儀表板
        </button>
    </div>
);


// =================================================================================
// 主應用程式元件 (App)
// =================================================================================

const App = () => {
    // 狀態管理
    const [userId, setUserId] = useState('');
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);

    // 黑暗模式切換
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // 認證和初始化效果
    useEffect(() => {
        // 1. 檢查 Firebase 實例是否成功初始化
        if (!auth || !db) {
            console.error("Firebase 服務未準備好。請檢查初始化邏輯。");
            setAuthReady(true); 
            return;
        }

        // 2. 執行初始登入
        performInitialAuth(auth, initialAuthToken);

        // 3. 設定 Auth State 監聽器
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId('');
            }
            setAuthReady(true); // 無論登入與否，都標記為認證流程已完成
        });

        // 清理 function
        return () => unsubscribe();
    }, []); // 空依賴陣列確保只在元件掛載時執行一次

    // Firestore 資料監聽
    useEffect(() => {
        // 只有在認證流程完成、取得 userId 且 db 實例存在時才開始監聽
        if (!authReady || !userId || !db) {
            return;
        }

        // 私有資料路徑: /artifacts/{appId}/users/{userId}/trips
        const collectionPath = `artifacts/${appId}/users/${userId}/trips`;
        const tripsCollection = collection(db, collectionPath);
        
        console.log("開始監聽 Trips 資料庫路徑:", collectionPath);

        const unsubscribe = onSnapshot(tripsCollection, (snapshot) => {
            try {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // 客戶端排序：根據 timestamp 降序排列 (避免 Firestore orderBy 造成 index 問題)
                fetchedTrips.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
                
                setTrips(fetchedTrips);
            } catch (error) {
                console.error("處理 Trips Snapshot 失敗:", error);
            }
        }, (error) => {
            console.error("Firestore 監聽器發生錯誤:", error);
        });

        // 清理 function
        return () => unsubscribe();
    }, [authReady, userId]); // 依賴於認證狀態和 userId

    // 視圖切換邏輯
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


    // 載入狀態
    if (!authReady) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Loader2 className="animate-spin mr-2 mb-4" size={32} />
                <span className="text-lg font-semibold">正在驗證身份並載入應用程式...</span>
            </div>
        );
    }
    
    // 渲染 Firebase 錯誤提示
    if (!db) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 p-8">
                <AlertTriangle size={48} className="mb-4"/>
                <h1 className="text-2xl font-bold mb-2">Firebase 錯誤</h1>
                <p className="text-center">應用程式無法初始化 Firebase 服務。這可能是由於 <code>__firebase_config</code> 配置錯誤或缺失。</p>
                <p className="text-sm mt-4 font-mono">請檢查控制台 (Console) 中的錯誤訊息以獲取詳細資訊。</p>
            </div>
        )
    }

    // 應用程式主體
    const appClass = isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800';

    // 根據當前視圖渲染內容
    let content;
    let headerTitle;
    let onBackAction = null;

    switch (currentView) {
        case 'dashboard':
            headerTitle = "旅行規劃儀表板";
            content = (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    onTutorialStart={handleStartTutorial}
                />
            );
            break;
        case 'tripDetail':
            headerTitle = `旅行細節: ${selectedTripId?.substring(0, 6)}...`;
            onBackAction = handleBackToDashboard;
            content = (
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    isDarkMode={isDarkMode}
                />
            );
            break;
        case 'tutorial':
            headerTitle = "應用程式教學";
            onBackAction = handleBackToDashboard;
            content = (
                <TutorialView 
                    onBack={handleBackToDashboard} 
                />
            );
            break;
        default:
            headerTitle = "錯誤";
            content = <div className="p-8 text-center text-red-500">未知視圖</div>;
    }

    return (
        <div className={appClass + " min-h-screen font-sans"}>
            
            <Header 
                title={headerTitle} 
                onBack={onBackAction}
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
            />

            <main className="pb-8">
                {content}
            </main>
        </div>
    );
};

export default App;
