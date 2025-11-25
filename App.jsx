import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, setDoc
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft,
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

// --- Mock User Data for Collaboration Display ---
// 模擬協作夥伴資料，用於在介面中顯示頭像和名稱
const mockUsers = {
    'user-A': { name: '劉德華 (您)', avatarUrl: 'https://placehold.co/40x40/4F46E5/FFFFFF?text=A' }, 
    'user-B': { name: '張學友', avatarUrl: 'https://placehold.co/40x40/06B6D4/FFFFFF?text=B' },
    'user-C': { name: '黎明', avatarUrl: 'https://placehold.co/40x40/10B981/FFFFFF?text=C' },
    'user-D': { name: '郭富城', avatarUrl: 'https://placehold.co/40x40/F59E0B/FFFFFF?text=D' },
};

// 隨機生成用戶 ID 到 Mock 用戶名的映射 (確保每位匿名用戶都有一個預設名稱)
const getUserProfile = (userId) => {
    // 簡單的哈希映射，將 Firebase ID 映射到一個 Mock 用戶
    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockKeys = Object.keys(mockUsers);
    const mockKey = mockKeys[hash % mockKeys.length];

    // 如果是當前用戶，則使用第一個預設用戶的頭像但保持真實名稱 (或標記為您)
    const baseProfile = mockUsers[mockKey];

    // 為當前用戶創建專屬標籤
    if (userId === auth.currentUser?.uid) {
        return {
            name: `${baseProfile.name.split(' ')[0]} (您)`,
            avatarUrl: `https://placehold.co/40x40/4F46E5/FFFFFF?text=${baseProfile.name[0]}`,
        };
    }

    return baseProfile;
};


// Tailwind CSS 輔助類別
const cardClasses = "bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-slate-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition duration-150`;
const buttonClasses = `flex items-center justify-center px-4 py-2 font-semibold rounded-xl transition duration-150 shadow-md`;
const primaryButtonClasses = `${buttonClasses} bg-indigo-600 text-white hover:bg-indigo-700`;
const secondaryButtonClasses = `${buttonClasses} bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-slate-600`;


// --- 通用工具組件 ---

// 頂部導航列 (包含 Dark Mode, 用戶, 提醒, 登出)
const TopNavbar = React.memo(({ userId, isDarkMode, toggleDarkMode }) => {
    // 模擬登出功能
    const handleLogout = () => {
        console.log("模擬登出功能，實際應用中應呼叫 Firebase signOut()");
        // 實際應用中: auth.signOut();
    };
    
    const userProfile = getUserProfile(userId);

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
            {/* 左側標誌 */}
            <div className="flex items-center">
                <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">
                    協作旅程規劃
                </span>
            </div>

            {/* 右側互動區 */}
            <div className="flex items-center space-x-4">
                {/* 暗黑模式切換 */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    title={isDarkMode ? "切換至淺色模式" : "切換至暗黑模式"}
                >
                    {isDarkMode ? (
                        <Sun className="w-6 h-6 text-yellow-400" />
                    ) : (
                        <Moon className="w-6 h-6 text-gray-600" />
                    )}
                </button>

                {/* 提醒圖標 (模擬通知) */}
                <Bell className="w-6 h-6 text-red-500 cursor-pointer animate-pulse" title="新通知" />
                
                {/* 登出按鈕 */}
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition hidden sm:inline"
                    title="登出"
                >
                    <LogOut className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>


                {/* 用戶頭像 */}
                <div className="flex items-center space-x-2">
                     <img
                        src={userProfile.avatarUrl}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full cursor-pointer ring-2 ring-indigo-500"
                        title={`當前用戶 ID: ${userId}`}
                    />
                    <span className="hidden md:inline font-medium text-gray-800 dark:text-gray-100">{userProfile.name.split(' ')[0]}</span>
                </div>
            </div>
        </div>
    );
});


// --- 行程詳情組件 (TripDetail) ---

const TripDetail = ({ tripId, onBack, userId, isDarkMode }) => {
    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('schedule'); // 預設為行程

    // 模擬子任務的計數 (用於提醒標籤)
    const [notificationCounts, setNotificationCounts] = useState({
        schedule: 0,
        budget: 0,
        todo: 3, // 模擬 3 個待辦事項
        notes: 1, // 模擬 1 條新筆記
        location: 0,
        members: 0, // 新增成員標籤
    });

    const getTripDocRef = (id) => doc(db, `/artifacts/${appId}/public/data/trips`, id);

    // Firebase 監聽行程數據
    useEffect(() => {
        if (!db || !tripId) return;

        const unsubscribe = onSnapshot(getTripDocRef(tripId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTripData(data);

                // 如果 tripData 中沒有 members 陣列，則新增當前用戶作為預設成員
                if (!data.members) {
                    const initialMembers = [userId];
                    updateDoc(getTripDocRef(tripId), { members: initialMembers })
                        .catch(err => console.error("Error setting initial members:", err));
                }

                setIsLoading(false);
            } else {
                console.error("No such trip document!");
                onBack(); // 回到儀表板
            }
        }, (error) => {
            console.error("Error fetching trip details:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, onBack, userId]);


    // 定義所有分頁及其圖標
    const tabs = useMemo(() => [
        { id: 'schedule', name: '行程', icon: CalendarDays },
        { id: 'budget', name: '預算', icon: PiggyBank },
        { id: 'todo', name: '待辦', icon: ListTodo },
        { id: 'notes', name: '筆記', icon: NotebookPen },
        { id: 'location', name: '地點', icon: MapPin },
        { id: 'members', name: '成員', icon: Users }, // 新增的成員分頁
    ], []);

    // Tab 按鈕樣式
    const tabClasses = useCallback((isActive) => 
        `flex-1 md:flex-initial md:px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-300
         ${isActive 
            ? 'text-white bg-indigo-600 dark:bg-indigo-500 shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}
        `, []
    );

    // --- 內容渲染函式 ---
    
    // 渲染行程成員列表 (新的協作功能)
    const renderMembersList = useCallback(() => {
        if (!tripData || !tripData.members || tripData.members.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p>此行程目前沒有協作者。</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 p-4">
                <h3 className="text-xl font-semibold dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-slate-700">
                    協作成員 ({tripData.members.length})
                </h3>
                {tripData.members.map((memberId) => {
                    // 獲取用戶資料，如果不存在則使用預設
                    const userProfile = getUserProfile(memberId);
                    const isCurrentUser = memberId === userId;

                    return (
                        <div 
                            key={memberId} 
                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-xl shadow-lg border-l-4 border-indigo-500 transition duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center">
                                <img 
                                    src={userProfile.avatarUrl} 
                                    alt={userProfile.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400"
                                />
                                <div className="ml-4">
                                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                        {userProfile.name}
                                    </span>
                                    {isCurrentUser && (
                                        <span className="ml-2 px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-600/50 rounded-full">
                                            您
                                        </span>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-24 sm:w-auto" title={`ID: ${memberId}`}>
                                        ID: {memberId.substring(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            {/* 模擬管理按鈕 (未來可擴展為邀請或移除功能) */}
                            {!isCurrentUser && (
                                <button
                                    className="text-sm px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition duration-200 shadow-md"
                                    onClick={() => console.log(`模擬管理 ${userProfile.name}`)}
                                >
                                    管理權限
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }, [tripData, userId]);


    // 渲染通用內容 (用於行程/預算/待辦等)
    const renderGenericContent = (title, icon) => (
        <div className="p-6 text-center">
            {React.createElement(icon, { className: "w-16 h-16 text-indigo-400 mx-auto mb-4" })}
            <h3 className="text-2xl font-bold mb-2 dark:text-gray-100">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">
                這是 **{tripData.name}** 行程的 **{title}** 協作區塊。所有團隊成員都可以即時編輯和查看。
            </p>
            <div className="mt-8">
                <button className={primaryButtonClasses}>
                    <Plus className="w-5 h-5 mr-2" />
                    新增{title.substring(0, 2)}項目
                </button>
            </div>
        </div>
    );

    const renderContent = useCallback(() => {
        if (!tripData) return null;

        const currentTab = tabs.find(t => t.id === activeTab);
        
        switch (activeTab) {
            case 'schedule':
                return renderGenericContent('行程規劃', CalendarDays);
            case 'budget':
                return renderGenericContent('共同預算', PiggyBank);
            case 'todo':
                return renderGenericContent('待辦清單', ListTodo);
            case 'notes':
                return renderGenericContent('協作筆記', NotebookPen);
            case 'location':
                return renderGenericContent('地點導航', MapPin);
            case 'members':
                return renderMembersList(); // 渲染新的成員列表
            default:
                return null;
        }
    }, [activeTab, tripData, tabs, renderMembersList]);


    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入行程詳情...</span>
            </div>
        );
    }

    if (!tripData) return null; // 應由 loading 狀態處理

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {/* 頂部操作區 */}
            <button 
                onClick={onBack} 
                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 transition"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                <span className="font-medium">返回儀表板</span>
            </button>

            <div className={`${cardClasses} p-0 overflow-hidden`}>
                <div className="p-5 bg-indigo-50 dark:bg-slate-700/50">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">{tripData.name}</h1>
                    <p className="text-lg text-indigo-700 dark:text-indigo-300">
                        {tripData.startDate} ~ {tripData.endDate}
                    </p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{tripData.description}</p>
                </div>
                
                {/* 協作分頁導航 */}
                <div className="flex flex-wrap justify-between md:justify-start gap-1 p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={tabClasses(activeTab === tab.id)}
                        >
                            <div className="flex items-center justify-center whitespace-nowrap">
                                <tab.icon className={`w-5 h-5 mr-1 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'} `} />
                                <span className="hidden sm:inline">{tab.name}</span>
                                {notificationCounts[tab.id] > 0 && (
                                    <Bell className="w-4 h-4 ml-1 text-yellow-400 animate-pulse fill-yellow-400" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 內容區塊 */}
                <div className="p-4 sm:p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


// --- 儀表板組件 (Dashboard) ---

const Dashboard = React.memo(({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onNewTrip }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTrip, setNewTrip] = useState({ name: '', description: '', startDate: '', endDate: '' });

    const handleNewTripChange = (e) => {
        const { name, value } = e.target;
        setNewTrip(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewTrip = async () => {
        if (!newTrip.name || !newTrip.startDate || !newTrip.endDate) {
            console.error("行程名稱和日期為必填項。");
            return;
        }

        const tripData = {
            ...newTrip,
            createdAt: serverTimestamp(),
            // 關鍵更新：模擬協作，新增時將當前用戶 ID 加入 members 陣列
            members: [userId], 
        };

        try {
            const tripsCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips`);
            await addDoc(tripsCollectionRef, tripData);
            setNewTrip({ name: '', description: '', startDate: '', endDate: '' });
            setIsAdding(false);
            console.log("新行程已儲存");
        } catch (error) {
            console.error("儲存新行程失敗:", error);
        }
    };

    const handleDeleteTrip = async (tripId) => {
        if (window.confirm("您確定要永久刪除此行程嗎？")) {
            try {
                const tripDocRef = doc(db, `/artifacts/${appId}/public/data/trips`, tripId);
                await deleteDoc(tripDocRef);
                console.log("行程已刪除");
            } catch (error) {
                console.error("刪除行程失敗:", error);
            }
        }
    };

    const tripCardClasses = "flex flex-col h-full bg-white dark:bg-slate-700 p-5 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02] cursor-pointer border border-indigo-200 dark:border-slate-600";

    return (
        <div className="min-h-screen">
            {/* 現代風格頂部導航欄 */}
            <TopNavbar userId={userId} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
                    我的協作旅程儀表板
                </h1>
                
                {/* 新增行程按鈕/表單 */}
                <div className="mb-8">
                    {isAdding ? (
                        <div className={cardClasses}>
                            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">新增行程</h2>
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="行程名稱 (例如: 2025 日本京都之旅)" 
                                value={newTrip.name} 
                                onChange={handleNewTripChange} 
                                className={`${inputClasses} mb-3`}
                            />
                            <textarea
                                name="description"
                                placeholder="簡短描述"
                                value={newTrip.description}
                                onChange={handleNewTripChange}
                                className={`${inputClasses} mb-3`}
                                rows="2"
                            />
                            <div className="flex space-x-3 mb-4">
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    value={newTrip.startDate} 
                                    onChange={handleNewTripChange} 
                                    className={inputClasses} 
                                />
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    value={newTrip.endDate} 
                                    onChange={handleNewTripChange} 
                                    className={inputClasses} 
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button onClick={() => setIsAdding(false)} className={secondaryButtonClasses}>
                                    <X className="w-5 h-5 mr-2" />
                                    取消
                                </button>
                                <button onClick={handleSaveNewTrip} className={primaryButtonClasses}>
                                    <Save className="w-5 h-5 mr-2" />
                                    儲存行程
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAdding(true)} className={`${primaryButtonClasses} w-full md:w-auto`}>
                            <Plus className="w-5 h-5 mr-2" />
                            開始新的協作旅程
                        </button>
                    )}
                </div>

                {/* 行程列表 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.length > 0 ? (
                        trips.map(trip => (
                            <div key={trip.id} className={tripCardClasses}>
                                <div onClick={() => onSelectTrip(trip.id)}>
                                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 truncate">
                                        {trip.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        <CalendarDays className="w-4 h-4 inline mr-1" />
                                        {trip.startDate} ~ {trip.endDate}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                                        {trip.description || "無描述"}
                                    </p>
                                    <div className="flex items-center text-sm text-teal-600 dark:text-teal-400 font-medium">
                                        <Users className="w-4 h-4 mr-1" />
                                        協作夥伴: {trip.members ? trip.members.length : 1} 人
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleDeleteTrip(trip.id)} 
                                    className="mt-4 self-end text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
                                    title="刪除行程"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl shadow-inner">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                            <p className="text-lg">尚無行程，點擊上方按鈕開始規劃您的旅程！</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


// --- 主應用程式組件 (App) ---

const App = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false); // 新增暗黑模式狀態

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // 1. Firebase 初始化與認證
    useEffect(() => {
        if (!auth) return;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        // onAuthStateChanged 會再次觸發，設置 user.uid
                    } else {
                        const anonUser = await signInAnonymously(auth);
                        setUserId(anonUser.user.uid);
                    }
                } catch (error) {
                    console.error("認證失敗:", error);
                }
            }
            setAuthReady(true);
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. 獲取行程數據 (需等待認證完成)
    useEffect(() => {
        if (!db || !authReady) return;

        // 僅當認證完成後才開始監聽 Firestore
        const tripsCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips`);
        const q = query(tripsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribeTrips = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("獲取行程列表失敗:", error);
        });

        return () => unsubscribeTrips();
    }, [authReady]); // 依賴 authReady 確保認證完成


    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setCurrentView('dashboard');
        setSelectedTripId(null);
    }, []);

    if (!authReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        <div className={`font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-900 ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
            {currentView === 'dashboard' ? (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                />
            ) : (
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
};

export default App;
