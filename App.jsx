import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, orderBy, where, getDocs, runTransaction 
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Menu, Settings, Calendar
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Tailwind CSS 輔助類別 (Threads 風格)
const primaryColor = 'indigo-600';
const accentColor = 'teal-500';

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100";
const inputClasses = `w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${primaryColor} focus:border-${primaryColor} transition duration-150`;
const buttonClasses = (bgColor = 'bg-indigo-600', hoverColor = 'hover:bg-indigo-700') => 
    `${bgColor} text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02] ${hoverColor} flex items-center justify-center whitespace-nowrap`;
const secondaryButtonClasses = `bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 hover:bg-gray-300 flex items-center justify-center whitespace-nowrap`;


// Firebase 服務初始化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// --- Utility Hooks & Functions ---

/** 取得特定路徑的 Firestore 集合參考 */
const getCollectionRef = (collectionName, userId) => {
    // 使用公開路徑：/artifacts/{appId}/public/data/{collectionName}
    return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
};

/** 取得單一文件路徑 */
const getDocumentRef = (collectionName, documentId, userId) => {
    return doc(db, 'artifacts', appId, 'public', 'data', collectionName, documentId);
};

/**
 * 格式化時間戳為易讀的字串
 * @param {Date | null} dateObj - Date 物件
 * @returns {string} 格式化後的日期字串
 */
const formatDate = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

/**
 * 格式化時間戳為易讀的日期和時間字串
 * @param {Date | null} dateObj - Date 物件
 * @returns {string} 格式化後的日期時間字串
 */
const formatDateTime = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString('zh-TW', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });
};


/**
 * 主要的狀態管理 Hook (包括身份驗證和資料庫連線)
 */
const useAppState = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. 身份驗證
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (e) {
                console.error("Firebase 身份驗證失敗:", e);
                setError("身份驗證失敗，請重新載入。");
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // 如果沒有登入，嘗試登入
                if (!userId) {
                    authenticate();
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // 2. 資料監聽
        if (!isAuthReady || !userId) {
            setIsLoading(true);
            return;
        }

        const q = query(getCollectionRef('trips', userId), orderBy('startDate', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tripsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : null,
                    endDate: data.endDate ? new Date(data.endDate.seconds * 1000) : null,
                };
            });
            setTrips(tripsData);
            setIsLoading(false);
        }, (err) => {
            console.error("Firestore 資料監聽錯誤:", err);
            setError("無法載入行程資料。");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId]);

    return { userId, isAuthReady, trips, isLoading, error, db, auth };
};

// --- Trip/Dashboard Component ---

const Dashboard = () => {
    const { userId, isAuthReady, trips, isLoading, error, db } = useAppState();
    const [isAdding, setIsAdding] = useState(false);
    const [newTripName, setNewTripName] = useState('');

    const handleCreateTrip = async () => {
        if (!newTripName.trim()) return;

        const tripData = {
            name: newTripName.trim(),
            userId: userId,
            startDate: new Date(),
            endDate: new Date(),
            collaborators: [userId],
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(getCollectionRef('trips', userId), tripData);
            console.log("行程建立成功:", docRef.id);
            setNewTripName('');
            setIsAdding(false);
        } catch (e) {
            console.error("建立行程失敗:", e);
            alert("建立行程失敗，請稍後再試。");
        }
    };

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm("確定要刪除這個行程嗎？此操作不可逆。")) return;
        try {
            await deleteDoc(getDocumentRef('trips', tripId, userId));
            console.log("行程刪除成功:", tripId);
        } catch (e) {
            console.error("刪除行程失敗:", e);
            alert("刪除行程失敗，請稍後再試。");
        }
    };

    if (!isAuthReady) {
        return <LoadingScreen message="初始化中..." />;
    }

    if (error) {
        return <ErrorScreen message={error} />;
    }

    const userIdDisplay = userId ? `${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}` : 'N/A';

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Briefcase className={`w-7 h-7 mr-2 text-${primaryColor}`} />
                    我的旅行
                </h1>
                <div className="text-sm text-gray-500 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    使用者 ID: {userIdDisplay}
                </div>
            </header>

            {/* 新增行程區塊 */}
            <div className={`${cardClasses} mb-8`}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">規劃新旅程</h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={buttonClasses('bg-indigo-600', 'hover:bg-indigo-700')}
                    >
                        {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        <span className="ml-2">{isAdding ? '取消' : '新增行程'}</span>
                    </button>
                </div>

                {isAdding && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="輸入新行程名稱 (例如: 日本京都之旅)"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            className={inputClasses}
                        />
                        <button
                            onClick={handleCreateTrip}
                            disabled={!newTripName.trim()}
                            className={buttonClasses(`bg-${accentColor}`, `hover:bg-teal-600`)}
                        >
                            <Save className="w-5 h-5" />
                            <span className="ml-2">建立</span>
                        </button>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">所有行程 ({trips.length})</h2>
            
            {isLoading ? (
                <LoadingScreen message="載入行程中..." />
            ) : (
                <div className="space-y-4">
                    {trips.length === 0 ? (
                        <div className="text-center p-10 bg-gray-100 rounded-xl text-gray-600">
                            <CalendarDays className="w-10 h-10 mx-auto mb-3" />
                            <p>您還沒有任何行程。點擊「新增行程」開始規劃吧！</p>
                        </div>
                    ) : (
                        trips.map(trip => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onDelete={handleDeleteTrip} 
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const TripCard = ({ trip, onDelete }) => {
    // 雖然這裡不使用 setView 和 setSelectedTripId，但在實際應用中，會由父組件傳遞這些狀態變更函數
    const cardContent = (
        <div className="flex justify-between items-center cursor-pointer">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${trip.collaborators.length > 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    共 {trip.collaborators.length} 人
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // 防止觸發卡片的點擊事件
                        onDelete(trip.id);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 rounded-full transition duration-150 hover:bg-red-50"
                    aria-label={`刪除行程 ${trip.name}`}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    // 模擬點擊卡片進入詳情頁 (實際應該使用 prop 傳入的函式)
    return (
        <div 
            className={`${cardClasses} hover:shadow-2xl hover:border-indigo-300`}
            onClick={() => {
                // 在這裡處理跳轉到 TripDetail (假設 App 組件會處理 state change)
                console.log(`進入行程詳情: ${trip.id}`);
            }}
        >
            {cardContent}
        </div>
    );
};


// --- Trip Detail Component (包含 5 大功能模組) ---

const TripDetail = ({ tripId }) => {
    const { userId, isAuthReady, db } = useAppState();
    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary'); // 預設為 行程
    const [notificationCounts, setNotificationCounts] = useState({ itinerary: 0, budget: 0, todo: 0, note: 0, location: 0 });

    useEffect(() => {
        if (!isAuthReady || !userId || !tripId) return;

        const tripDocRef = getDocumentRef('trips', tripId, userId);

        const unsubscribe = onSnapshot(tripDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setTripData({
                    id: doc.id,
                    ...data,
                    startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : null,
                    endDate: data.endDate ? new Date(data.endDate.seconds * 1000) : null,
                });
                setIsLoading(false);
            } else {
                console.error("行程不存在");
                setIsLoading(false);
                // 應導航回 Dashboard
            }
        }, (err) => {
            console.error("載入行程詳情失敗:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId, tripId]);


    // 模擬計算通知數量
    useEffect(() => {
        // 這裡應該是根據各個子集合的資料計算實際的待辦/提醒數量
        // 為了演示，我們使用一個固定值
        setNotificationCounts({
            itinerary: 0,
            budget: 1, // 假設有預算超支提醒
            todo: 3,   // 假設有 3 個未完成的待辦
            note: 0,
            location: 0,
        });
    }, [tripData]);


    const tabClasses = (isActive) => 
        `px-3 py-2 text-sm font-medium rounded-xl transition duration-200 ${
            isActive 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`;

    const renderContent = useCallback(() => {
        if (!tripData) return <div className="text-center p-8">載入中...</div>;

        switch (activeTab) {
            case 'itinerary':
                return <ItineraryContent tripId={tripId} userId={userId} db={db} tripData={tripData} />;
            case 'budget':
                return <BudgetContent tripId={tripId} userId={userId} db={db} />;
            case 'todo':
                return <TodoContent tripId={tripId} userId={userId} db={db} />;
            case 'note':
                return <NoteContent tripId={tripId} userId={userId} db={db} />;
            case 'location':
                return <LocationContent tripId={tripId} userId={userId} db={db} />;
            default:
                return <div className="p-8 text-center text-gray-500">選擇一個功能模組開始規劃。</div>;
        }
    }, [activeTab, tripId, userId, db, tripData]);

    if (isLoading) {
        return <LoadingScreen message="載入行程詳情中..." />;
    }

    if (!tripData) {
        return <ErrorScreen message="無法找到此行程。" />;
    }

    return (
        <div className="max-w-4xl mx-auto p-0 sm:p-4 md:p-6 lg:p-8">
            <header className="bg-white p-4 sm:p-6 shadow-md rounded-b-2xl mb-4">
                <div className="flex items-center mb-3">
                    {/* 模擬返回按鈕 (實際應處理導航) */}
                    <button 
                        onClick={() => console.log('返回 Dashboard')} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition duration-150"
                        aria-label="返回"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 truncate flex-grow ml-2">
                        {tripData.name}
                    </h1>
                </div>
                <div className="text-sm text-gray-600 flex justify-between items-center">
                    <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
                    </p>
                    <p className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        協作者: {tripData.collaborators.length} 人
                    </p>
                </div>
            </header>

            <div className="sticky top-0 bg-slate-50 z-10 p-2 sm:p-0">
                {/* 5 大功能標籤導航 */}
                <div className="flex flex-wrap justify-start gap-2 p-2 rounded-xl bg-white shadow-inner mb-4 overflow-x-auto">
                    {[
                         { id: 'itinerary', name: '行程', icon: Bus },
                         { id: 'budget', name: '預算', icon: PiggyBank },
                         { id: 'todo', name: '待辦清單', icon: ListTodo },
                         { id: 'note', name: '筆記', icon: NotebookPen },
                         { id: 'location', name: '地點', icon: MapPin },
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={tabClasses(activeTab === tab.id)}
                            >
                                <div className="flex items-center justify-center whitespace-nowrap">
                                    <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600' : 'text-white'} `} />
                                    <span className="ml-1">{tab.name}</span>
                                    {notificationCounts[tab.id] > 0 && (
                                        <Bell className="w-4 h-4 ml-1 text-yellow-300 animate-pulse fill-yellow-300" />
                                    )}
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* 內容區塊 */}
            <div className="p-2 sm:p-0">
                {renderContent()}
            </div>
        </div>
    );
};

// --- Sub-Components for 5 Core Features ---

// 1. 行程 (Itinerary) - 僅作為佔位符
const ItineraryContent = ({ tripId, userId, tripData }) => {
    // 假設行程資料需要按日期分組
    const days = useMemo(() => {
        if (!tripData.startDate || !tripData.endDate) return [];
        const start = tripData.startDate.getTime();
        const end = tripData.endDate.getTime();
        const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        return Array.from({ length: dayCount }, (_, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return {
                date,
                dayIndex: i + 1,
                activities: [], // 實際應從 Firestore 載入
            };
        });
    }, [tripData]);


    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <Bus className="w-5 h-5 mr-2 text-indigo-600" />
                行程安排 ({days.length} 天)
            </h3>
            
            {days.map(day => (
                <div key={day.dayIndex} className={`${cardClasses} p-4 sm:p-6`}>
                    <h4 className="text-lg font-bold text-indigo-600 border-b pb-2 mb-3">
                        第 {day.dayIndex} 天: {formatDate(day.date)}
                    </h4>
                    {day.activities.length === 0 ? (
                        <p className="text-gray-500 text-sm">點擊新增按鈕來規劃這天的活動。</p>
                    ) : (
                        // 這裡應該渲染活動列表
                        <p>行程活動列表...</p>
                    )}
                    <button className={`${secondaryButtonClasses} mt-3 text-sm w-full`}>
                        <Plus className="w-4 h-4 mr-1" />
                        新增活動
                    </button>
                </div>
            ))}
        </div>
    );
};

// 2. 預算 (Budget) - 僅作為佔位符
const BudgetContent = ({ tripId, userId, db }) => (
    <div className={`${cardClasses} space-y-4`}>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <PiggyBank className="w-5 h-5 mr-2 text-indigo-600" />
            預算管理
        </h3>
        <p className="text-gray-600">這個模組用於記錄您的支出並追蹤預算。目前有 1 個超支提醒！</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md text-sm text-yellow-700">
            <p className="font-medium">提醒:</p>
            <p>餐飲預算已超出 $500 TWD。</p>
        </div>
        <button className={buttonClasses(`bg-${accentColor}`, `hover:bg-teal-600`)}>
            <Calculator className="w-5 h-5 mr-2" />
            新增交易紀錄
        </button>
    </div>
);

// 3. 待辦清單 (Todo) - 僅作為佔位符
const TodoContent = ({ tripId, userId, db }) => (
    <div className={`${cardClasses} space-y-4`}>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <ListTodo className="w-5 h-5 mr-2 text-indigo-600" />
            待辦清單
        </h3>
        <p className="text-gray-600">您有 3 個未完成的項目。</p>
        <ul className="space-y-2">
            <li className="flex items-center p-2 bg-gray-50 rounded-lg justify-between">
                <span className="flex items-center text-gray-800"><Check className="w-4 h-4 mr-2 text-red-500" /> 護照檢查</span>
                <Clock className="w-4 h-4 text-gray-400" />
            </li>
            <li className="flex items-center p-2 bg-gray-50 rounded-lg justify-between">
                <span className="flex items-center text-gray-800"><Check className="w-4 h-4 mr-2 text-red-500" /> 訂旅館</span>
                <Clock className="w-4 h-4 text-gray-400" />
            </li>
            <li className="flex items-center p-2 bg-gray-50 rounded-lg justify-between">
                <span className="flex items-center text-gray-800"><Check className="w-4 h-4 mr-2 text-red-500" /> 購買保險</span>
                <Clock className="w-4 h-4 text-gray-400" />
            </li>
        </ul>
        <button className={buttonClasses(`bg-${accentColor}`, `hover:bg-teal-600`)}>
            <Plus className="w-5 h-5 mr-2" />
            新增待辦事項
        </button>
    </div>
);

// 4. 筆記 (Note) - 僅作為佔位符
const NoteContent = ({ tripId, userId, db }) => (
    <div className={`${cardClasses} space-y-4`}>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <NotebookPen className="w-5 h-5 mr-2 text-indigo-600" />
            筆記本
        </h3>
        <p className="text-gray-600">這個模組用於存放旅行中所有重要的筆記和文件（如電子機票資訊）。</p>
        <textarea
            className={`${inputClasses} h-40 resize-none`}
            placeholder="記錄您的想法、重要電話號碼或預訂代碼..."
            defaultValue="備註：請記得攜帶轉接頭，日本的插座是兩孔的。"
        ></textarea>
        <button className={buttonClasses('bg-indigo-600', 'hover:bg-indigo-700')}>
            <Save className="w-5 h-5 mr-2" />
            儲存筆記
        </button>
    </div>
);

// 5. 地點 (Location) - 僅作為佔位符
const LocationContent = ({ tripId, userId, db }) => (
    <div className={`${cardClasses} space-y-4`}>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
            地點地圖
        </h3>
        <p className="text-gray-600">在這裡管理您想去的所有景點、餐廳和住宿地點。</p>
        <div className="h-64 w-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 border border-dashed border-gray-400">
            [地圖佔位符：顯示所有地點]
        </div>
        <ul className="space-y-2">
            <li className="flex items-center text-gray-800"><Utensils className="w-4 h-4 mr-2" /> 一蘭拉麵 (午餐)</li>
            <li className="flex items-center text-gray-800"><Home className="w-4 h-4 mr-2" /> XXX 飯店 (住宿)</li>
            <li className="flex items-center text-gray-800"><ShoppingBag className="w-4 h-4 mr-2" /> 祇園商店街 (購物)</li>
        </ul>
        <button className={buttonClasses(`bg-${accentColor}`, `hover:bg-teal-600`)}>
            <Plus className="w-5 h-5 mr-2" />
            新增地點
        </button>
    </div>
);

// --- 輔助畫面 ---

const LoadingScreen = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="font-medium">{message || "載入中..."}</p>
    </div>
);

const ErrorScreen = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 p-8 rounded-xl text-red-600">
        <X className="w-8 h-8 mb-3" />
        <p className="font-semibold">發生錯誤:</p>
        <p className="text-sm">{message || "應用程式發生未知錯誤。"}</p>
    </div>
);

// --- 主應用程式組件 ---

const App = () => {
    // 模擬導航狀態: 'dashboard' 或 'trip-detail'
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [selectedTripId, setSelectedTripId] = useState('mock-trip-123'); // 用於演示 TripDetail

    // 由於我們只顯示一個單一文件，這裡必須模擬狀態來展示 TripDetail 頁面
    // 實際應用中，會通過點擊 TripCard 來改變這兩個 state

    // 為了讓使用者看到 TripDetail 的結構，我們預設先展示它，並設定一個 mock ID
    useEffect(() => {
        // 為了確保在 Canvas 環境中能夠看到詳情頁面，我們預設導航到 'trip-detail'
        setCurrentView('trip-detail'); 
    }, []);

    const DashboardWithNavigation = () => {
        // 這是 Dashboard 實際上應有的樣子，但因為 App 只有一個，我們必須在頂層處理導航
        return <Dashboard />;
    };

    const TripDetailWithNavigation = () => {
         // 在這裡，我們模擬一個行程 ID 來展示詳情頁面
        const MockTripDetail = ({ tripId }) => {
            const { userId, isAuthReady, db } = useAppState();

            // 這裡模擬 TripDetail 的行為
            const [tripData, setTripData] = useState({
                id: 'mock-trip-123',
                name: '日本關西賞櫻之旅',
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                collaborators: ['user1', 'user2'],
            });
            const [isLoading, setIsLoading] = useState(false);
            const [activeTab, setActiveTab] = useState('itinerary'); 
            const [notificationCounts, setNotificationCounts] = useState({ itinerary: 0, budget: 1, todo: 3, note: 0, location: 0 });


            const tabClasses = (isActive) => 
                `px-3 py-2 text-sm font-medium rounded-xl transition duration-200 ${
                    isActive 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`;

            const renderContent = useCallback(() => {
                if (isLoading || !tripData) return <div className="text-center p-8">載入中...</div>;

                switch (activeTab) {
                    case 'itinerary':
                        return <ItineraryContent tripId={tripId} userId={userId} db={db} tripData={tripData} />;
                    case 'budget':
                        return <BudgetContent tripId={tripId} userId={userId} db={db} />;
                    case 'todo':
                        return <TodoContent tripId={tripId} userId={userId} db={db} />;
                    case 'note':
                        return <NoteContent tripId={tripId} userId={userId} db={db} />;
                    case 'location':
                        return <LocationContent tripId={tripId} userId={userId} db={db} />;
                    default:
                        return <div className="p-8 text-center text-gray-500">選擇一個功能模組開始規劃。</div>;
                }
            }, [activeTab, tripId, userId, db, tripData, isLoading]);

            if (isLoading) return <LoadingScreen message="載入行程詳情中..." />;
            
            return (
                 <div className="max-w-4xl mx-auto p-0 sm:p-4 md:p-6 lg:p-8">
                    <header className="bg-white p-4 sm:p-6 shadow-md rounded-b-2xl mb-4">
                        <div className="flex items-center mb-3">
                            <button 
                                onClick={() => setCurrentView('dashboard')} // 實際導航回 Dashboard
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition duration-150"
                                aria-label="返回"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 truncate flex-grow ml-2">
                                {tripData.name}
                            </h1>
                            <Menu className="w-6 h-6 text-gray-500 cursor-pointer hover:text-indigo-600" />
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between items-center">
                            <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
                            </p>
                            <p className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                協作者: {tripData.collaborators.length} 人
                            </p>
                        </div>
                    </header>

                    <div className="sticky top-0 bg-slate-50 z-10 p-2 sm:p-0">
                        {/* 5 大功能標籤導航 */}
                        <div className="flex flex-wrap justify-start gap-2 p-2 rounded-xl bg-white shadow-inner mb-4 overflow-x-auto">
                            {[
                                 { id: 'itinerary', name: '行程', icon: Bus },
                                 { id: 'budget', name: '預算', icon: PiggyBank },
                                 { id: 'todo', name: '待辦清單', icon: ListTodo },
                                 { id: 'note', name: '筆記', icon: NotebookPen },
                                 { id: 'location', name: '地點', icon: MapPin },
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={tabClasses(activeTab === tab.id)}
                                    >
                                        <div className="flex items-center justify-center whitespace-nowrap">
                                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600' : 'text-white'} `} />
                                            <span className="ml-1">{tab.name}</span>
                                            {notificationCounts[tab.id] > 0 && (
                                                <Bell className="w-4 h-4 ml-1 text-yellow-300 animate-pulse fill-yellow-300" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* 內容區塊 */}
                    <div className="p-2 sm:p-0">
                        {renderContent()}
                    </div>
                </div>
            );
        };

        return <MockTripDetail tripId={selectedTripId} />;
    };


    return (
        <div className="font-sans antialiased bg-slate-50 min-h-screen">
            {/* 這裡使用一個簡單的 switch 語句來切換視圖 */}
            {currentView === 'dashboard' ? (
                <DashboardWithNavigation />
            ) : (
                <TripDetailWithNavigation />
            )}
        </div>
    );
};

export default App;
