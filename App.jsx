import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, orderBy, where, getDocs, runTransaction, setLogLevel, serverTimestamp 
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Menu, Settings, Calendar, DollarSign, RefreshCw, HandCoins,
    Pencil, TrendingDown, ClipboardList
} from 'lucide-react';

// 設定 Firestore Log Level
setLogLevel('Debug');

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

// 基礎結算貨幣設定為港元 (HKD)
const BASE_CURRENCY = 'HKD';
const CURRENCY_OPTIONS = [
    { code: 'HKD', name: '港元', symbol: '$' },
    { code: 'TWD', name: '新台幣', symbol: 'NT$' },
    { code: 'USD', name: '美元', symbol: '$' },
    { code: 'JPY', name: '日圓', symbol: '¥' },
    { code: 'EUR', name: '歐元', symbol: '€' },
    { code: 'CNY', name: '人民幣', symbol: '¥' },
];

const TRANSACTION_CATEGORIES = [
    { id: 'food', name: '餐飲', icon: Utensils, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'transport', name: '交通', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'lodging', name: '住宿', icon: Home, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'shopping', name: '購物', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'activity', name: '活動', icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'other', name: '其他', icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-50' },
];


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

/** 取得交易紀錄的集合路徑 (巢狀於行程下) */
const getTransactionsCollectionRef = (tripId, userId) => {
    return collection(getDocumentRef('trips', tripId, userId), 'transactions');
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
 * 格式化金額
 * @param {number} amount - 金額
 * @param {string} currencyCode - 貨幣代碼
 * @returns {string} 格式化後的金額字串 (含符號)
 */
const formatCurrency = (amount, currencyCode) => {
    const symbol = CURRENCY_OPTIONS.find(c => c.code === currencyCode)?.symbol || currencyCode;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * 查詢即時匯率
 * @param {string} fromCurrency - 原始貨幣代碼 (e.g., JPY)
 * @param {string} toCurrency - 目標貨幣代碼 (e.g., HKD)
 * @returns {Promise<number>} 匯率值
 */
const fetchExchangeRate = async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1;

    const query = `匯率 ${fromCurrency} 兌 ${toCurrency}`;
    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt = "You are a specialized currency exchange rate engine. For the given query, find the current exchange rate and output ONLY the numerical rate from the source currency to the target currency. Do not include currency codes, text, or explanations. If the rate cannot be found, output 0.";
    
    const payload = {
        contents: [{ parts: [{ text: query }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    // 實作指數退避 (Exponential Backoff) 進行重試
    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && i < 2) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                    continue;
                }
                throw new Error(`API response status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            
            // 嘗試解析數值
            const rate = parseFloat(text);
            if (isNaN(rate) || rate === 0) {
                 return 0; 
            }
            return rate;

        } catch (error) {
            console.error(`Fetch Exchange Rate Error (Attempt ${i + 1}):`, error);
            if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            } else {
                return 0; // 最終失敗
            }
        }
    }
    return 0;
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
                    baseCurrency: data.baseCurrency || BASE_CURRENCY, 
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

// --- Dashboard Component ---
// ... (Dashboard Component 保持不變)
const Dashboard = ({ setCurrentView, setSelectedTripId }) => {
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
            baseCurrency: BASE_CURRENCY, // 新增基礎貨幣設定為 HKD
        };

        try {
            const docRef = await addDoc(getCollectionRef('trips', userId), tripData);
            console.log("行程建立成功:", docRef.id);
            setNewTripName('');
            setIsAdding(false);
            // 建立成功後直接進入詳情頁
            setSelectedTripId(docRef.id);
            setCurrentView('trip-detail');
        } catch (e) {
            console.error("建立行程失敗:", e);
            // 改用自定義彈窗或訊息
            // NOTE: 使用者可能會要求在首頁顯示債務，但目前的首頁(Dashboard)不載入所有交易，故此處先省略Dashboard上的債務卡片
            alert("建立行程失敗，請稍後再試。"); 
        }
    };

    const handleDeleteTrip = async (tripId) => {
        // 使用自定義 modal 代替 window.confirm
        const isConfirmed = window.confirm("確定要刪除這個行程嗎？此操作不可逆。"); 
        if (!isConfirmed) return;
        
        try {
            await deleteDoc(getDocumentRef('trips', tripId, userId));
            console.log("刪除行程成功:", tripId);
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
                                onNavigate={() => {
                                    setSelectedTripId(trip.id);
                                    setCurrentView('trip-detail');
                                }}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const TripCard = ({ trip, onDelete, onNavigate }) => {
    const cardContent = (
        <div className="flex justify-between items-center cursor-pointer" onClick={onNavigate}>
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p className="text-xs font-medium text-indigo-500 mt-1">
                    結算貨幣: {trip.baseCurrency || BASE_CURRENCY}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${trip.collaborators.length > 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    共 {trip.collaborators.length} 人
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
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

    return (
        <div 
            className={`${cardClasses} hover:shadow-2xl hover:border-indigo-300`}
        >
            {cardContent}
        </div>
    );
};

// --- Trip Detail Component ---
const TripDetail = ({ tripId, setCurrentView }) => {
    const { userId, isAuthReady, db } = useAppState();
    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('budget'); 
    const [notificationCounts, setNotificationCounts] = useState({ itinerary: 0, budget: 1, todo: 3, note: 0, location: 0 });

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
                    baseCurrency: data.baseCurrency || BASE_CURRENCY, 
                });
                setIsLoading(false);
            } else {
                console.error("行程不存在");
                setIsLoading(false);
                setCurrentView('dashboard'); // 導航回 Dashboard
            }
        }, (err) => {
            console.error("載入行程詳情失敗:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId, tripId, setCurrentView]);

    // 模擬計算通知數量
    useEffect(() => {
        // 在實務中，這裡會根據未結清的債務數量來決定 budget 的通知計數
        setNotificationCounts({
            itinerary: 0,
            budget: 1, 
            todo: 3,   
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

        // 我們將使用一個固定的同伴名稱來示範債務功能
        const coTravelerName = '同伴'; 

        switch (activeTab) {
            case 'itinerary':
                return <ItineraryContent tripId={tripId} userId={userId} db={db} tripData={tripData} />;
            case 'budget':
                return <BudgetContent 
                    tripId={tripId} 
                    userId={userId} 
                    db={db} 
                    baseCurrency={tripData.baseCurrency}
                    coTravelerName={coTravelerName} // 傳遞同伴名稱
                />;
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
                    {/* 返回按鈕 */}
                    <button 
                        onClick={() => setCurrentView('dashboard')} 
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
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        結算: {tripData.baseCurrency}
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

// --- Budget Transaction Modal Component ---

const AddTransactionModal = ({ isVisible, onClose, onSave, baseCurrency, tripId, userId, coTravelerName }) => {
    const defaultCurrency = CURRENCY_OPTIONS.find(c => c.code !== baseCurrency) || CURRENCY_OPTIONS[0];
    
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(TRANSACTION_CATEGORIES[0].id);
    const [fromCurrency, setFromCurrency] = useState(defaultCurrency.code);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [rate, setRate] = useState(0);
    const [loadingRate, setLoadingRate] = useState(false);
    const [rateError, setRateError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    
    // NEW DEBT STATES
    const [paidBy, setPaidBy] = useState('self'); // 'self', 'coTraveler'
    const [splitType, setSplitType] = useState('full-me'); // 'full-me', 'full-coTraveler', 'split-50/50'


    // 重置所有狀態
    const resetForm = useCallback(() => {
        setAmount(0);
        setDescription('');
        setCategory(TRANSACTION_CATEGORIES[0].id);
        setFromCurrency(defaultCurrency.code);
        setConvertedAmount(0);
        setRate(0);
        setRateError(null);
        setSaveLoading(false);
        setPaidBy('self'); // Reset payment fields
        setSplitType('full-me');
    }, [defaultCurrency.code]);

    useEffect(() => {
        if (isVisible) {
            resetForm();
        }
    }, [isVisible, resetForm]);

    // 匯率轉換邏輯 (與 BudgetContent 共享)
    const handleConvert = useCallback(async (currentAmount, currentFromCurrency) => {
        if (currentAmount <= 0 || currentFromCurrency === baseCurrency) {
            setConvertedAmount(currentAmount);
            setRate(1);
            setRateError(null);
            return;
        }

        setLoadingRate(true);
        setRateError(null);

        try {
            const exchangeRate = await fetchExchangeRate(currentFromCurrency, baseCurrency);
            
            if (exchangeRate > 0) {
                const converted = currentAmount * exchangeRate;
                setRate(exchangeRate);
                setConvertedAmount(parseFloat(converted.toFixed(2)));
            } else {
                setRate(0);
                setConvertedAmount(0);
                setRateError(`無法取得 ${currentFromCurrency} 兌 ${baseCurrency} 的即時匯率。`);
            }
        } catch (e) {
            setRate(0);
            setConvertedAmount(0);
            setRateError('獲取匯率時發生網路錯誤，請稍後重試。');
            console.error(e);
        } finally {
            setLoadingRate(false);
        }
    }, [baseCurrency]);

    useEffect(() => {
        if (amount > 0) {
            handleConvert(amount, fromCurrency);
        } else {
            setConvertedAmount(0);
            setRate(0);
            setRateError(null);
        }
    }, [amount, fromCurrency, handleConvert]);

    // 儲存交易
    const handleSaveTransaction = async () => {
        if (amount <= 0 || !description.trim() || convertedAmount <= 0) {
            alert("請確保輸入有效的金額、描述和匯率轉換成功。");
            return;
        }
        
        setSaveLoading(true);

        const transactionData = {
            description: description.trim(),
            category: category,
            originalAmount: amount,
            originalCurrency: fromCurrency,
            convertedAmount: convertedAmount,
            baseCurrency: baseCurrency,
            exchangeRate: rate,
            createdAt: serverTimestamp(), // 使用 Firestore 伺服器時間戳
            tripId: tripId,
            userId: userId,
            // NEW DEBT FIELDS
            paidBy: paidBy,
            splitType: splitType,
        };

        try {
            const collectionRef = getTransactionsCollectionRef(tripId, userId);
            await addDoc(collectionRef, transactionData);
            onSave(); // 通知父組件儲存成功
            resetForm();
            onClose();
        } catch (e) {
            console.error("儲存交易失敗:", e);
            alert("儲存交易記錄失敗，請檢查網路或權限。");
        } finally {
            setSaveLoading(false);
        }
    };


    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg ${cardClasses} p-6 overflow-y-auto max-h-[90vh] transition-all transform duration-300 scale-100`}>
                <header className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <HandCoins className="w-6 h-6 mr-2 text-indigo-600" />
                        新增交易記錄
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="space-y-4">
                    {/* 交易描述 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">描述/項目名稱</label>
                        <input
                            type="text"
                            placeholder="例如: 午餐拉麵"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {/* 類別選擇 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">支出類別</label>
                        <div className="flex flex-wrap gap-2">
                            {TRANSACTION_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition duration-150 flex items-center 
                                        ${cat.id === category 
                                            ? `bg-indigo-600 text-white shadow-md border-indigo-600`
                                            : `bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200`
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4 mr-1" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 金額和貨幣選擇 */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 block mb-1">原始金額</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="金額"
                                value={amount || ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className={inputClasses}
                            />
                        </div>
                        <div className="w-2/5">
                            <label className="text-sm font-medium text-gray-700 block mb-1">貨幣</label>
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className={inputClasses}
                            >
                                {CURRENCY_OPTIONS.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 誰付的錢？ */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">誰付了這筆款項？</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaidBy('self')}
                                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition duration-150 ${paidBy === 'self' ? 'bg-indigo-600 text-white shadow-md border-indigo-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                            >
                                我 (Self)
                            </button>
                            <button
                                onClick={() => setPaidBy('coTraveler')}
                                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition duration-150 ${paidBy === 'coTraveler' ? 'bg-indigo-600 text-white shadow-md border-indigo-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                            >
                                {coTravelerName} (Other)
                            </button>
                        </div>
                    </div>

                    {/* 如何分攤？ */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">如何分攤費用？</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setSplitType('full-me')}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border transition duration-150 ${splitType === 'full-me' ? 'bg-teal-500 text-white shadow-md border-teal-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                            >
                                {paidBy === 'self' ? '我獨自承擔' : `${coTravelerName} 獨自承擔`}
                            </button>
                            <button
                                onClick={() => setSplitType('full-coTraveler')}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border transition duration-150 ${splitType === 'full-coTraveler' ? 'bg-teal-500 text-white shadow-md border-teal-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                            >
                                {paidBy === 'self' ? `${coTravelerName} 獨自承擔` : '我獨自承擔'}
                            </button>
                            <button
                                onClick={() => setSplitType('split-50/50')}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border transition duration-150 ${splitType === 'split-50/50' ? 'bg-red-500 text-white shadow-md border-red-500' : 'bg-gray-100 text-gray-700 border-gray-700 hover:bg-gray-200'}`}
                            >
                                平均分攤 (50/50)
                            </button>
                        </div>
                    </div>

                    {/* 轉換結果顯示 */}
                    <div className="mt-4 p-3 bg-indigo-50 border border-dashed border-indigo-300 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            轉換至結算貨幣 ({baseCurrency})
                        </p>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-extrabold text-indigo-700">
                                {loadingRate ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : formatCurrency(convertedAmount, baseCurrency)}
                            </p>
                            
                        </div>
                        
                        {(rate > 0) && fromCurrency !== baseCurrency && (
                            <p className="text-xs text-gray-500 mt-2">
                                匯率: 1 {fromCurrency} = {rate.toFixed(4)} {baseCurrency}
                            </p>
                        )}
                        {rateError && (
                            <div className="text-xs text-red-600 mt-2">{rateError}</div>
                        )}
                    </div>
                </div>

                {/* 儲存按鈕 */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveTransaction}
                        disabled={saveLoading || convertedAmount <= 0 || !description.trim()}
                        className={buttonClasses('bg-indigo-600', 'hover:bg-indigo-700')}
                    >
                        {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        儲存 ({formatCurrency(convertedAmount, baseCurrency)})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 債務結算卡片 ---
const DebtSummaryCard = ({ debtSummary, baseCurrency, coTravelerName }) => {
    const { totalIOwe, totalOwedToMe, netSettlement } = debtSummary;
    
    // 檢查是否已結清 (小於 $0.01 視為結清)
    const isSettled = Math.abs(netSettlement) < 0.01;
    
    // 判斷最終誰欠誰
    let netMessage;
    let netClasses;

    if (isSettled) {
        netMessage = "已結清 (無需結算)";
        netClasses = "bg-green-100 text-green-700 border-green-300";
    } else if (netSettlement > 0) {
        // netSettlement > 0 意味著 totalOwedToMe > totalIOwe
        netMessage = `${coTravelerName} 應付給我 ${formatCurrency(netSettlement, baseCurrency)}`;
        netClasses = "bg-green-100 text-green-700 border-green-300";
    } else {
        // netSettlement < 0 意味著 totalIOwe > totalOwedToMe
        netMessage = `我應付給 ${coTravelerName} ${formatCurrency(Math.abs(netSettlement), baseCurrency)}`;
        netClasses = "bg-red-100 text-red-700 border-red-300";
    }
    
    return (
        <div className={`${cardClasses} p-4 sm:p-6 border border-gray-200 shadow-md`}>
            <h4 className="text-lg font-bold text-gray-700 flex items-center mb-3">
                <HandCoins className="w-5 h-5 mr-2 text-indigo-600" />
                債務結算概覽 (與 {coTravelerName})
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-center border-b pb-3 mb-3">
                <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-medium text-red-700">我欠 {coTravelerName}</p>
                    <p className="text-xl font-bold text-red-600">
                        {formatCurrency(totalIOwe, baseCurrency)}
                    </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-xs font-medium text-green-700">{coTravelerName} 欠我</p>
                    <p className="text-xl font-bold text-green-600">
                        {formatCurrency(totalOwedToMe, baseCurrency)}
                    </p>
                </div>
            </div>

            <div className={`p-3 rounded-xl font-bold text-center ${netClasses} border`}>
                <p className="text-sm">最終結算：</p>
                <p className="text-lg mt-1">{netMessage}</p>
            </div>
            
            <button className={`${secondaryButtonClasses} mt-4 text-sm w-full bg-gray-300 hover:bg-gray-400`}>
                <Check className="w-4 h-4 mr-1" />
                標記為已結算 (手動清零)
            </button>
        </div>
    );
};


// 2. 預算 (Budget) - 實現即時貨幣轉換和交易記錄
const BudgetContent = ({ tripId, userId, db, baseCurrency, coTravelerName }) => {
    const [transactions, setTransactions] = useState([]);
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState(0);
    const [fromCurrency, setFromCurrency] = useState('JPY'); 
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [rate, setRate] = useState(0);
    const [loadingRate, setLoadingRate] = useState(false);
    const [rateError, setRateError] = useState(null);

    // 交易記錄監聽
    useEffect(() => {
        if (!tripId || !userId) return;

        const q = query(getTransactionsCollectionRef(tripId, userId), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    ...docData,
                    createdAt: docData.createdAt ? new Date(docData.createdAt.seconds * 1000) : new Date(),
                    // 新增的預設值，防止舊資料出錯
                    paidBy: docData.paidBy || 'self', 
                    splitType: docData.splitType || 'full-me',
                };
            });
            setTransactions(data);
            setIsTransactionsLoading(false);
        }, (err) => {
            console.error("載入交易記錄失敗:", err);
            setIsTransactionsLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId]);


    // 計算總支出
    const totalSpent = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.convertedAmount, 0);
    }, [transactions]);
    
    // NEW: 計算債務
    const debtSummary = useMemo(() => {
        let totalIOwe = 0; // 我欠同伴多少錢
        let totalOwedToMe = 0; // 同伴欠我多少錢 (同伴欠我的)

        transactions.forEach(t => {
            // 只計算平均分攤的交易
            if (t.splitType === 'split-50/50') {
                const halfAmount = t.convertedAmount / 2;

                if (t.paidBy === 'self') {
                    // 我付的，同伴欠我一半 (Owed To Me)
                    totalOwedToMe += halfAmount;
                } else if (t.paidBy === 'coTraveler') {
                    // 同伴付的，我欠同伴一半 (I Owe)
                    totalIOwe += halfAmount;
                }
            }
        });

        // 淨結算 (正值: 同伴欠我; 負值: 我欠同伴)
        const netSettlement = totalOwedToMe - totalIOwe;

        return {
            totalIOwe: parseFloat(totalIOwe.toFixed(2)),
            totalOwedToMe: parseFloat(totalOwedToMe.toFixed(2)),
            netSettlement: parseFloat(netSettlement.toFixed(2)),
        };
    }, [transactions]);


    // 匯率轉換邏輯 (用於主畫面的計算器)
    const handleConvert = useCallback(async (currentAmount, currentFromCurrency) => {
        if (currentAmount <= 0 || currentFromCurrency === baseCurrency) {
            setConvertedAmount(currentAmount);
            setRate(1);
            setRateError(null);
            return;
        }

        setLoadingRate(true);
        setRateError(null);

        try {
            const exchangeRate = await fetchExchangeRate(currentFromCurrency, baseCurrency);
            
            if (exchangeRate > 0) {
                const converted = currentAmount * exchangeRate;
                setRate(exchangeRate);
                setConvertedAmount(parseFloat(converted.toFixed(2)));
            } else {
                setRate(0);
                setConvertedAmount(0);
                setRateError(`無法取得 ${currentFromCurrency} 兌 ${baseCurrency} 的即時匯率。`);
            }
        } catch (e) {
            setRate(0);
            setConvertedAmount(0);
            setRateError('獲取匯率時發生網路錯誤，請稍後重試。');
            console.error(e);
        } finally {
            setLoadingRate(false);
        }
    }, [baseCurrency]);

    useEffect(() => {
        if (amount > 0) {
            handleConvert(amount, fromCurrency);
        } else {
            setConvertedAmount(0);
            setRate(0);
            setRateError(null);
        }
    }, [amount, fromCurrency, baseCurrency, handleConvert]);

    // 處理金額輸入
    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        setAmount(isNaN(value) ? 0 : value);
    };

    const targetCurrencyName = CURRENCY_OPTIONS.find(c => c.code === baseCurrency)?.name || baseCurrency;

    // 刪除交易紀錄
    const handleDeleteTransaction = async (transactionId) => {
        const isConfirmed = window.confirm("確定要刪除這筆交易記錄嗎？"); 
        if (!isConfirmed) return;
        
        try {
            const docRef = doc(getTransactionsCollectionRef(tripId, userId), transactionId);
            await deleteDoc(docRef);
            console.log("交易刪除成功:", transactionId);
        } catch (e) {
            console.error("刪除交易失敗:", e);
            alert("刪除交易失敗，請稍後再試。");
        }
    };


    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <PiggyBank className="w-5 h-5 mr-2 text-indigo-600" />
                預算管理 (結算貨幣: {baseCurrency})
            </h3>

            {/* 總支出概覽 */}
            <div className={`${cardClasses} p-4 sm:p-6 bg-indigo-50 border-indigo-300`}>
                <p className="text-sm font-medium text-indigo-700 mb-1">總支出 (以 {baseCurrency} 結算)</p>
                <p className="text-4xl font-extrabold text-indigo-800">
                    {formatCurrency(totalSpent, baseCurrency)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    {transactions.length} 筆記錄 | 協作者: {coTravelerName}
                </p>
            </div>
            
            {/* NEW: 債務概覽卡片 */}
            <DebtSummaryCard debtSummary={debtSummary} baseCurrency={baseCurrency} coTravelerName={coTravelerName} />

            {/* 匯率轉換區塊 (計算器) */}
            <div className={`${cardClasses} border border-indigo-200 shadow-lg space-y-3`}>
                <h4 className="text-lg font-bold text-indigo-700 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    即時匯率計算器
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 block mb-1">原始金額</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="輸入金額"
                            value={amount || ''}
                            onChange={handleAmountChange}
                            className={inputClasses}
                        />
                    </div>
                    <div className="w-full sm:w-1/3">
                        <label className="text-xs font-medium text-gray-600 block mb-1">原始貨幣</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className={inputClasses}
                        >
                            {CURRENCY_OPTIONS.map(option => (
                                <option key={option.code} value={option.code}>
                                    {option.code} ({option.name})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-dashed border-indigo-300 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                        等值 {targetCurrencyName} ({baseCurrency})
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-extrabold text-indigo-600">
                            {loadingRate ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : formatCurrency(convertedAmount, baseCurrency)}
                        </p>
                    </div>
                    
                    {(rate > 0) && fromCurrency !== baseCurrency && (
                        <p className="text-xs text-gray-500 mt-2">
                            目前匯率: 1 {fromCurrency} = {rate.toFixed(4)} {baseCurrency}
                        </p>
                    )}
                    {rateError && (
                         <div className="text-sm text-red-600 bg-red-100 p-2 rounded-lg flex items-center">
                            <X className="w-4 h-4 mr-2" />
                            {rateError}
                        </div>
                    )}
                </div>

                {/* 按鈕：新增交易 */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={convertedAmount <= 0}
                    className={buttonClasses('bg-teal-500', 'hover:bg-teal-600')}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    新增交易紀錄 ({formatCurrency(convertedAmount, baseCurrency)})
                </button>
            </div>
            
            {/* 交易記錄列表 */}
            <div className={`${cardClasses} p-4 sm:p-6 space-y-4`}>
                <h4 className="text-lg font-semibold text-gray-700 flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                        詳細交易記錄
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className={secondaryButtonClasses}
                    >
                         <Plus className="w-4 h-4 mr-1" />
                        新增
                    </button>
                </h4>
                
                {isTransactionsLoading ? (
                    <LoadingScreen message="載入交易記錄中..." />
                ) : transactions.length === 0 ? (
                    <div className="text-center p-6 bg-gray-100 rounded-xl text-gray-500">
                        <PiggyBank className="w-8 h-8 mx-auto mb-2" />
                        <p>還沒有任何交易記錄。</p>
                        <p>點擊「新增交易」開始記錄您的支出吧！</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={handleDeleteTransaction} coTravelerName={coTravelerName} />)}
                    </div>
                )}
            </div>

            <AddTransactionModal 
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => console.log("交易儲存成功")}
                baseCurrency={baseCurrency}
                tripId={tripId}
                userId={userId}
                coTravelerName={coTravelerName} // 傳遞同伴名稱給 Modal
            />
        </div>
    );
};

const TransactionItem = ({ transaction, onDelete, coTravelerName }) => {
    const category = TRANSACTION_CATEGORIES.find(c => c.id === transaction.category) || TRANSACTION_CATEGORIES[5];
    
    // 顯示分攤資訊
    let splitInfo = '';
    if (transaction.splitType === 'split-50/50') {
        splitInfo = transaction.paidBy === 'self' ? `[我付/50-50] ${coTravelerName}欠我一半` : `[同伴付/50-50] 我欠${coTravelerName}一半`;
    } else if (transaction.paidBy === 'self') {
        splitInfo = transaction.splitType === 'full-me' ? '[我獨付/我承擔]' : `[我獨付/${coTravelerName}承擔]`;
    } else { // paidBy === 'coTraveler'
        splitInfo = transaction.splitType === 'full-me' ? `[同伴獨付/我承擔]` : `[同伴獨付/${coTravelerName}承擔]`;
    }

    return (
        <div className={`flex items-center p-3 rounded-xl transition duration-150 border ${category.bg} hover:shadow-md`}>
            <div className={`p-2 rounded-full mr-3 ${category.color} bg-white shadow-sm`}>
                <category.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-grow min-w-0">
                <p className="font-semibold truncate text-gray-900">{transaction.description}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                    {category.name} | {formatCurrency(transaction.originalAmount, transaction.originalCurrency)} 
                    <span className="ml-2 font-medium text-indigo-500 hidden sm:inline-block">({splitInfo})</span>
                </p>
                <p className="text-xs font-medium text-indigo-500 sm:hidden">{splitInfo}</p>
            </div>
            
            <div className="text-right ml-4 flex items-center space-x-2">
                <div className="flex flex-col items-end">
                    <p className={`font-bold text-lg text-red-600`}>
                        {formatCurrency(transaction.convertedAmount, transaction.baseCurrency)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                </div>
                <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition duration-150 rounded-full hover:bg-red-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


// 1. 行程 (Itinerary) - 保持不變
const ItineraryContent = ({ tripId, userId, tripData }) => {
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


// 3. 待辦清單 (Todo) - 保持不變
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

// 4. 筆記 (Note) - 保持不變
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

// 5. 地點 (Location) - 保持不變
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
    const [selectedTripId, setSelectedTripId] = useState(null); 
    const { trips } = useAppState();

    // 啟動時檢查是否有行程，如果有則預設進入第一個行程的詳情頁
    useEffect(() => {
        if (trips.length > 0 && selectedTripId === null) {
            setSelectedTripId(trips[0].id);
            // setCurrentView('trip-detail'); // 保持在 dashboard 讓使用者選擇
        } else if (trips.length === 0) {
            setCurrentView('dashboard');
        }
    }, [trips, selectedTripId]);
    
    // 如果我們在詳情頁但行程被刪除，則返回 Dashboard
    useEffect(() => {
        if (selectedTripId && currentView === 'trip-detail' && !trips.some(t => t.id === selectedTripId)) {
            setCurrentView('dashboard');
            setSelectedTripId(null);
        }
    }, [trips, selectedTripId, currentView]);


    return (
        <div className="font-sans antialiased bg-slate-50 min-h-screen">
            {currentView === 'dashboard' ? (
                <Dashboard 
                    setCurrentView={setCurrentView} 
                    setSelectedTripId={setSelectedTripId}
                />
            ) : selectedTripId ? (
                <TripDetail 
                    tripId={selectedTripId} 
                    setCurrentView={setCurrentView}
                />
            ) : (
                <LoadingScreen message="正在準備您的儀表板..." />
            )}
        </div>
    );
};

export default App;
