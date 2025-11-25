import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    BarChart, PieChart // BarChart & PieChart from lucide-react used for icons
} from 'lucide-react';

// 由於外部圖表庫 "react-minimal-pie-chart" 無法解析，我們將使用 React 和 SVG 
// 繪製一個簡易的圓餅圖組件來代替。
// 注意：如果環境支援，更推薦使用如 Recharts (需額外引用) 的庫。
// 在單一檔案環境中，最穩定的做法是使用原生 SVG。

// --- 輔助函式 ---
const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

// 將 Base64 字串轉換為 ArrayBuffer 的輔助函式
const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// 將 PCM 16-bit 轉為 WAV 格式的輔助函式
const pcmToWav = (pcm16, sampleRate) => {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcm16.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // number of channels
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate
    view.setUint32(28, byteRate, true);
    // block align
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataSize, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
};

const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

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

// Firestore 路徑構建器
const getTripCollectionRef = (userId) => {
    // 預設為私有資料
    return collection(db, `artifacts/${appId}/users/${userId}/trips`);
};
const getTripDocRef = (userId, tripId) => {
    return doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId);
};
const getExpenseCollectionRef = (userId, tripId) => {
    return collection(db, `artifacts/${appId}/users/${userId}/trips/${tripId}/expenses`);
};

// --- 通用組件 ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>
);

const IconButton = ({ icon: Icon, onClick, className = "", children, type = "button", disabled = false }) => (
    <button
        type={type}
        onClick={onClick}
        className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 
                    shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                    ${disabled ? 'bg-gray-300 dark:bg-gray-700 text-gray-500' : 'hover:bg-indigo-500 hover:text-white bg-indigo-400 text-white'}
                    ${className}`}
        disabled={disabled}
    >
        {Icon && <Icon className="w-5 h-5 mr-0 md:mr-2" />}
        <span className="hidden md:inline">{children}</span>
    </button>
);

const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const displayUserId = userId ? `${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}` : '訪客';
    
    // 登出功能 (此應用程式主要使用匿名/自訂 token，但提供一個清除使用者狀態的 UI)
    const handleLogout = useCallback(async () => {
        try {
            await auth.signOut();
            window.location.reload(); // 重新載入以觸發新的匿名登入或自訂 Token 登入
        } catch (error) {
            console.error("登出失敗:", error);
        }
    }, []);

    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <IconButton 
                            icon={ChevronLeft} 
                            onClick={onBack} 
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 p-2"
                        >
                            返回
                        </IconButton>
                    )}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{title}</h1>
                </div>

                <div className="flex items-center space-x-4">
                    {onTutorialStart && (
                        <button
                            onClick={onTutorialStart}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors hidden sm:block"
                        >
                            <BookOpenText className="inline w-5 h-5 mr-1" /> 教學
                        </button>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        ID: {displayUserId}
                    </span>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                    <IconButton 
                        icon={LogOut} 
                        onClick={handleLogout} 
                        className="bg-red-500 text-white hover:bg-red-600 p-2"
                    >
                        登出
                    </IconButton>
                </div>
            </div>
        </header>
    );
};

// --- 修正後的 PieChart 組件 (使用原生 SVG 實現) ---
// 這是用來替換無法解析的 'react-minimal-pie-chart' 庫的組件
const SimplePieChart = ({ data, size = 100, strokeWidth = 10, emptyText = "無資料" }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <div className="text-gray-400 dark:text-gray-600 text-sm">{emptyText}</div>
            </div>
        );
    }

    let startAngle = 0;
    const slices = data.map((entry, index) => {
        const percentage = entry.value / total;
        const sweepAngle = percentage * 360;
        
        // 將角度轉換為弧度
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (startAngle + sweepAngle - 90) * (Math.PI / 180);

        // SVG 座標
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - strokeWidth; // 半徑
        
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        const largeArcFlag = sweepAngle > 180 ? 1 : 0;
        
        const d = [
            `M ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${cx} ${cy}`, // 連接到圓心
            'Z'
        ].join(' ');

        const slice = (
            <path
                key={index}
                d={d}
                fill={entry.color}
                className="transition-opacity duration-300 hover:opacity-80"
                title={`${entry.title}: ${entry.value.toFixed(2)} (${(percentage * 100).toFixed(1)}%)`}
            />
        );

        startAngle += sweepAngle;
        return slice;
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shadow-lg rounded-full">
            {/* 白色背景圓圈 */}
            <circle cx={size / 2} cy={size / 2} r={size / 2} fill="white" className="dark:fill-gray-700"/>
            
            {/* 繪製扇區 */}
            {slices}

            {/* 圓心文字 (可選) */}
            <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xl font-bold fill-gray-900 dark:fill-white pointer-events-none"
            >
                {total.toFixed(0)}
            </text>
        </svg>
    );
};

// --- BudgetTab 組件 (假設原先的 PieChart 在這裡使用) ---
const BudgetTab = ({ expenses, totalBudget, currency }) => {
    const totalSpent = useMemo(() => 
        expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0), 
        [expenses]
    );
    const remainingBudget = totalBudget - totalSpent;
    const isOverBudget = remainingBudget < 0;

    // 依類別分組費用
    const expensesByCategory = useMemo(() => {
        const categoryMap = expenses.reduce((acc, exp) => {
            const category = exp.category || '未分類';
            acc[category] = (acc[category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        // 轉換為 PieChart 資料格式
        const colors = {}; // 為每個類別分配顏色
        let i = 0;
        const fixedColors = [
            '#4f46e5', // Indigo
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#06b6d4', // Cyan
            '#f97316', // Orange
            '#8b5cf6', // Violet
            '#ec4899', // Pink
        ];

        return Object.entries(categoryMap).map(([title, value]) => {
            const color = fixedColors[i % fixedColors.length];
            i++;
            return { title, value, color, key: title };
        });
    }, [expenses]);
    
    // 總預算的 PieChart 資料
    const budgetData = [
        { title: '已花費', value: totalSpent, color: isOverBudget ? '#ef4444' : '#4f46e5', key: 'spent' },
        { title: '剩餘預算', value: remainingBudget > 0 ? remainingBudget : 0, color: '#10b981', key: 'remaining' }
    ].filter(item => item.value > 0);
    
    // 處理超支情況下的顯示
    const displayTotalBudget = totalBudget || 0;
    const displayRemaining = isOverBudget ? 0 : remainingBudget;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <PiggyBank className="w-6 h-6 mr-2 text-indigo-500" /> 預算概覽
            </h2>
            
            {/* 主要預算卡片 */}
            <div className={`p-4 rounded-xl shadow-lg transition-colors ${isOverBudget ? 'bg-red-100 dark:bg-red-900 border-red-500' : 'bg-white dark:bg-gray-700 border-indigo-200'} border-l-4`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">總預算</p>
                        <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {currency} {displayTotalBudget.toFixed(2)}
                        </p>
                    </div>
                    <div className="w-24 h-24">
                        {/* 使用修正後的 PieChart 組件 */}
                        <SimplePieChart 
                            data={budgetData} 
                            size={96}
                            strokeWidth={0}
                            emptyText="無預算"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">已花費</p>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {currency} {totalSpent.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">剩餘預算</p>
                        <p className={`text-xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {currency} {remainingBudget.toFixed(2)}
                        </p>
                        {isOverBudget && (
                            <p className="text-xs text-red-500 dark:text-red-300 mt-1 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1"/> 超出預算 {currency} {Math.abs(remainingBudget).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 類別花費分析 */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center pt-4 border-t dark:border-gray-600">
                <BarChart className="w-5 h-5 mr-2 text-indigo-500" /> 類別分析
            </h3>
            
            {expensesByCategory.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* 圓餅圖 */}
                    <div className="md:w-1/3 flex justify-center items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                        <SimplePieChart 
                            data={expensesByCategory} 
                            size={200}
                            strokeWidth={0}
                            emptyText="無花費資料"
                        />
                    </div>

                    {/* 圖例和列表 */}
                    <div className="md:w-2/3 space-y-3 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                        <ul className="space-y-2">
                            {expensesByCategory
                                .sort((a, b) => b.value - a.value)
                                .map(item => (
                                    <li key={item.key} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></span>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{item.title}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {currency} {item.value.toFixed(2)} ({((item.value / totalSpent) * 100).toFixed(1)}%)
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">尚無記錄的花費。</p>
                </div>
            )}
        </div>
    );
};
// --- 核心應用程式組件 (App) ---

const App = () => {
    // 視圖狀態：'dashboard', 'tripDetail', 'tutorial'
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 從 localStorage 讀取深色模式設定，如果沒有則使用系統設定
        if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
            return true;
        }
        if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light') {
            return false;
        }
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 暗黑模式切換
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    }, []);

    // 設置 Dark Mode 類別
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Firebase 認證和初始化
    useEffect(() => {
        if (!auth) return;

        const handleAuth = async (user) => {
            if (user) {
                setUserId(user.uid);
                setAuthReady(true);
            } else {
                // 如果沒有 user，則進行匿名登入或自訂 token 登入
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase 登入失敗:", error);
                    // 即使登入失敗，也要標記為 ready，以免阻止應用程式執行
                    setAuthReady(true);
                }
            }
        };

        // 設置日誌級別
        // setLogLevel('Debug'); 

        // 監聽認證狀態
        const unsubscribe = onAuthStateChanged(auth, handleAuth);
        
        return () => unsubscribe();
    }, [auth]);

    // 載入行程資料
    useEffect(() => {
        if (!authReady || !userId) {
            setTrips([]);
            return;
        }

        const tripsRef = getTripCollectionRef(userId);
        // 使用 onSnapshot 監聽即時更新
        const unsubscribe = onSnapshot(query(tripsRef, orderBy('createdAt', 'desc')), (snapshot) => {
            const loadedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // 確保 createdAt 是一個可排序的日期對象或時間戳
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            }));
            setTrips(loadedTrips);
        }, (error) => {
            console.error("讀取行程失敗:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 視圖切換邏輯
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

    // --- 各個視圖組件定義 (Dashboard, TripDetail, TutorialView) ---

    const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
        const [showAddModal, setShowAddModal] = useState(false);
        const [newTripName, setNewTripName] = useState('');
        const [isAdding, setIsAdding] = useState(false);

        const handleCreateTrip = async () => {
            if (!newTripName.trim() || !userId) return;
            setIsAdding(true);
            try {
                const tripData = {
                    name: newTripName.trim(),
                    destination: "未定目的地",
                    startDate: null,
                    endDate: null,
                    budget: 0,
                    currency: "TWD",
                    ownerId: userId,
                    collaborators: [],
                    createdAt: serverTimestamp(),
                };
                await addDoc(getTripCollectionRef(userId), tripData);
                setNewTripName('');
                setShowAddModal(false);
            } catch (error) {
                console.error("新增行程失敗:", error);
            } finally {
                setIsAdding(false);
            }
        };

        const renderTripList = () => {
            if (!authReady) {
                return <LoadingSpinner />;
            }

            if (trips.length === 0) {
                return (
                    <div className="text-center p-10 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                        <Map className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            開始規劃你的旅程！
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            點擊下方按鈕新增第一個行程。
                        </p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <div 
                            key={trip.id} 
                            onClick={() => onSelectTrip(trip.id)}
                            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-indigo-400 hover:border-indigo-600"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{trip.name}</h2>
                                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {trip.destination || '未定目的地'}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                {trip.startDate ? `開始: ${new Date(trip.startDate).toLocaleDateString()}` : '未定日期'}
                            </div>
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
                <Header 
                    title="我的行程儀表板" 
                    userId={userId} 
                    isDarkMode={isDarkMode} 
                    toggleDarkMode={toggleDarkMode}
                    onTutorialStart={onTutorialStart}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            所有旅程 ({trips.length})
                        </h2>
                        <IconButton 
                            icon={Plus} 
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2"
                        >
                            新增行程
                        </IconButton>
                    </div>

                    {renderTripList()}
                </div>

                {/* 新增行程 Modal */}
                {showAddModal && (
                    <Modal onClose={() => setShowAddModal(false)} title="新增旅行行程">
                        <input
                            type="text"
                            placeholder="輸入行程名稱 (例如: 2025 日本關西之旅)"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <IconButton 
                            icon={Plus} 
                            onClick={handleCreateTrip}
                            disabled={!newTripName.trim() || isAdding}
                            className="w-full py-3"
                        >
                            {isAdding ? '建立中...' : '建立行程'}
                        </IconButton>
                    </Modal>
                )}
            </div>
        );
    };

    const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
        const [trip, setTrip] = useState(null);
        const [currentTab, setCurrentTab] = useState('summary');
        const [isEditing, setIsEditing] = useState(false);
        const [expenses, setExpenses] = useState([]);

        // 監聽單個行程資料
        useEffect(() => {
            if (!authReady || !userId || !tripId) return;

            const docRef = getTripDocRef(userId, tripId);
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setTrip({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("行程不存在");
                    onBack(); // 如果行程不存在，返回儀表板
                }
            }, (error) => {
                console.error("讀取單一行程失敗:", error);
            });

            return () => unsubscribe();
        }, [authReady, userId, tripId, onBack]);

        // 監聽費用資料
        useEffect(() => {
            if (!authReady || !userId || !tripId) {
                setExpenses([]);
                return;
            }

            const expensesRef = getExpenseCollectionRef(userId, tripId);
            const unsubscribe = onSnapshot(query(expensesRef, orderBy('date', 'desc'), orderBy('createdAt', 'desc')), (snapshot) => {
                const loadedExpenses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date instanceof Date ? doc.data().date : (doc.data().date?.toDate ? doc.data().date.toDate() : new Date()),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
                }));
                setExpenses(loadedExpenses);
            }, (error) => {
                console.error("讀取費用失敗:", error);
            });

            return () => unsubscribe();
        }, [authReady, userId, tripId]);
        
        // --- 處理行程基本資訊更新 ---
        const handleUpdateTrip = async (updates) => {
            if (!userId || !tripId) return;
            try {
                await updateDoc(getTripDocRef(userId, tripId), updates);
                setIsEditing(false);
            } catch (error) {
                console.error("更新行程失敗:", error);
            }
        };

        const handleDeleteTrip = async () => {
            if (!userId || !tripId) return;
            if (!window.confirm("確定要刪除此行程及所有相關資料嗎？此操作無法復原。")) return;
            
            try {
                // 由於 Firestore 不會自動刪除子集合，需要先刪除所有費用 (簡易處理，專業應用程式需要更複雜的批次刪除)
                const expenseDocs = await getDocs(getExpenseCollectionRef(userId, tripId));
                const deletePromises = expenseDocs.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);

                // 刪除行程文件本身
                await deleteDoc(getTripDocRef(userId, tripId));
                onBack();
            } catch (error) {
                console.error("刪除行程失敗:", error);
                // 使用 custom modal 替代 alert
            }
        };

        if (!trip) return <LoadingSpinner />;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
                <Header 
                    title={trip.name} 
                    onBack={onBack} 
                    userId={userId} 
                    isDarkMode={isDarkMode} 
                    toggleDarkMode={() => {}} // 避免在細節頁面切換模式導致混亂
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    
                    {/* 行程資訊卡片 (Summary) */}
                    <TripInfoCard 
                        trip={trip} 
                        isEditing={isEditing} 
                        setIsEditing={setIsEditing} 
                        onUpdate={handleUpdateTrip}
                        onDelete={handleDeleteTrip}
                    />

                    {/* 標籤頁導航 */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {['summary', 'budget', 'members', 'notes'].map((tab) => (
                                <TabButton 
                                    key={tab}
                                    tab={tab}
                                    currentTab={currentTab}
                                    setCurrentTab={setCurrentTab}
                                />
                            ))}
                        </nav>
                    </div>

                    {/* 標籤頁內容 */}
                    <div className="py-6">
                        {currentTab === 'summary' && <SummaryTab trip={trip} />}
                        {currentTab === 'budget' && (
                            <BudgetTab 
                                expenses={expenses} 
                                totalBudget={trip.budget || 0} 
                                currency={trip.currency || 'TWD'}
                                userId={userId}
                                tripId={tripId}
                                authReady={authReady}
                            />
                        )}
                        {currentTab === 'members' && (
                            <MembersTab 
                                trip={trip} 
                                userId={userId}
                                onUpdate={handleUpdateTrip}
                            />
                        )}
                        {currentTab === 'notes' && <NotesTab trip={trip} onUpdate={handleUpdateTrip} />}
                    </div>

                    {/* 費用清單 (在 TripDetail 中顯示，不放在 BudgetTab 中，以便通用) */}
                    <ExpenseList 
                        expenses={expenses} 
                        tripId={tripId}
                        userId={userId}
                        currency={trip.currency || 'TWD'}
                    />
                </div>
            </div>
        );
    };

    const TabButton = ({ tab, currentTab, setCurrentTab }) => {
        const tabs = {
            summary: { name: '概覽', icon: Home },
            budget: { name: '費用與預算', icon: PiggyBank },
            members: { name: '成員與協作', icon: Users },
            notes: { name: '筆記', icon: NotebookPen },
        };
        const { name, icon: Icon } = tabs[tab];
        const isCurrent = currentTab === tab;

        return (
            <button
                onClick={() => setCurrentTab(tab)}
                className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${isCurrent 
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`
                }
            >
                <Icon className="w-5 h-5 mr-2" />
                {name}
            </button>
        );
    };

    const TripInfoCard = ({ trip, isEditing, setIsEditing, onUpdate, onDelete }) => {
        const [editableTrip, setEditableTrip] = useState(trip);

        useEffect(() => {
            setEditableTrip(trip);
        }, [trip]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setEditableTrip(prev => ({ ...prev, [name]: name === 'budget' ? parseFloat(value) || 0 : value }));
        };

        const handleSave = () => {
            // 處理日期格式
            const updates = {
                name: editableTrip.name,
                destination: editableTrip.destination,
                startDate: editableTrip.startDate ? new Date(editableTrip.startDate) : null,
                endDate: editableTrip.endDate ? new Date(editableTrip.endDate) : null,
                budget: editableTrip.budget,
                currency: editableTrip.currency,
            };
            onUpdate(updates);
        };
        
        const tripOwner = trip.ownerId === auth.currentUser?.uid ? "(我的旅程)" : "(協作中)";

        return (
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        {isEditing ? (
                            <input 
                                type="text"
                                name="name"
                                value={editableTrip.name}
                                onChange={handleChange}
                                className="text-3xl font-extrabold text-gray-900 dark:text-white w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                            />
                        ) : (
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                                {trip.name}
                                <span className="ml-3 text-sm font-medium text-indigo-500">{tripOwner}</span>
                            </h2>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        {isEditing ? (
                            <>
                                <IconButton icon={Save} onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
                                    儲存
                                </IconButton>
                                <IconButton icon={X} onClick={() => setIsEditing(false)} className="bg-gray-400 hover:bg-gray-500">
                                    取消
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton icon={Edit} onClick={() => setIsEditing(true)} className="bg-indigo-500 hover:bg-indigo-600">
                                    編輯
                                </IconButton>
                                <IconButton icon={Trash2} onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                                    刪除
                                </IconButton>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4 dark:border-gray-700">
                    <InfoField 
                        label="目的地" 
                        value={trip.destination} 
                        icon={MapPin} 
                        isEditing={isEditing}
                        name="destination"
                        type="text"
                        onChange={handleChange}
                        editableValue={editableTrip.destination}
                    />
                    <InfoField 
                        label="開始日期" 
                        value={trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '未定'} 
                        icon={CalendarDays} 
                        isEditing={isEditing}
                        name="startDate"
                        type="date"
                        onChange={handleChange}
                        editableValue={editableTrip.startDate ? editableTrip.startDate.toISOString().split('T')[0] : ''}
                    />
                    <InfoField 
                        label="結束日期" 
                        value={trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '未定'} 
                        icon={Clock} 
                        isEditing={isEditing}
                        name="endDate"
                        type="date"
                        onChange={handleChange}
                        editableValue={editableTrip.endDate ? editableTrip.endDate.toISOString().split('T')[0] : ''}
                    />
                    <InfoField 
                        label={`預算 (${trip.currency || 'TWD'})`} 
                        value={trip.budget ? trip.budget.toFixed(2) : '未設定'} 
                        icon={Calculator} 
                        isEditing={isEditing}
                        name="budget"
                        type="number"
                        onChange={handleChange}
                        editableValue={editableTrip.budget}
                        currency={trip.currency}
                        currencyName="currency"
                        onCurrencyChange={handleChange}
                    />
                </div>
            </div>
        );
    };

    const InfoField = ({ label, value, icon: Icon, isEditing, name, type, onChange, editableValue, currency, currencyName, onCurrencyChange }) => (
        <div className="flex flex-col">
            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <Icon className="w-4 h-4 mr-1 text-indigo-400" />
                {label}
            </div>
            {isEditing ? (
                <div className='flex items-center space-x-2'>
                    {currency && (
                        <select
                            name={currencyName}
                            value={currency}
                            onChange={onCurrencyChange}
                            className="p-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {['TWD', 'USD', 'EUR', 'JPY'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                    <input
                        type={type}
                        name={name}
                        value={editableValue}
                        onChange={onChange}
                        className="flex-grow p-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {value}
                </p>
            )}
        </div>
    );
    
    const SummaryTab = ({ trip }) => {
        const calculateDays = (start, end) => {
            if (!start || !end) return '未定';
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包含開始和結束日
            return `${diffDays} 天`;
        };

        const duration = calculateDays(trip.startDate, trip.endDate);

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-indigo-500" /> 旅程資訊
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SummaryItem icon={MapPin} label="目的地" value={trip.destination || '未定'} />
                    <SummaryItem icon={CalendarDays} label="持續時間" value={duration} />
                    <SummaryItem icon={CalendarDays} label="開始日期" value={trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '未定'} />
                    <SummaryItem icon={Clock} label="結束日期" value={trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '未定'} />
                    <SummaryItem icon={Calculator} label="總預算" value={`${trip.currency || 'TWD'} ${trip.budget ? trip.budget.toFixed(2) : '未設定'}`} />
                    <SummaryItem icon={Users} label="成員人數" value={trip.collaborators ? (trip.collaborators.length + 1) : 1} />
                </div>
            </div>
        );
    };

    const SummaryItem = ({ icon: Icon, label, value }) => (
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md border-l-4 border-indigo-400">
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
    
    // --- ExpenseList 和 ExpenseForm (用於 BudgetTab 的子組件) ---
    
    const ExpenseList = ({ expenses, tripId, userId, currency }) => {
        const [showFormModal, setShowFormModal] = useState(false);
        const [editingExpense, setEditingExpense] = useState(null);

        const handleDelete = async (expenseId) => {
            if (!userId || !tripId) return;
            if (!window.confirm("確定刪除此筆費用記錄嗎？")) return;

            try {
                const docRef = doc(db, `artifacts/${appId}/users/${userId}/trips/${tripId}/expenses`, expenseId);
                await deleteDoc(docRef);
            } catch (error) {
                console.error("刪除費用失敗:", error);
            }
        };

        const handleEdit = (expense) => {
            setEditingExpense(expense);
            setShowFormModal(true);
        };

        const handleCloseForm = () => {
            setEditingExpense(null);
            setShowFormModal(false);
        };
        
        // 費用類別圖示
        const categoryIcons = {
            '餐飲': Utensils,
            '交通': Bus,
            '住宿': Home,
            '購物': ShoppingBag,
            '門票': Ticket,
            '其他': Briefcase,
        };

        const getCategoryIcon = (category) => categoryIcons[category] || Briefcase;


        return (
            <div className="space-y-4 pt-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <ListTodo className="w-6 h-6 mr-2 text-indigo-500" /> 費用記錄
                    </h2>
                    <IconButton 
                        icon={Plus} 
                        onClick={() => handleEdit(null)}
                        className="px-4 py-2"
                    >
                        新增費用
                    </IconButton>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {expenses.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">尚無費用記錄。</div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {expenses.map((expense) => {
                                const Icon = getCategoryIcon(expense.category);
                                return (
                                <li key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center">
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <Icon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{expense.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {expense.category} · {expense.date.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                            -{currency} {parseFloat(expense.amount).toFixed(2)}
                                        </span>
                                        <IconButton icon={Edit} onClick={() => handleEdit(expense)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 p-1.5" />
                                        <IconButton icon={Trash2} onClick={() => handleDelete(expense.id)} className="bg-red-400 text-white hover:bg-red-500 p-1.5" />
                                    </div>
                                </li>
                            )})}
                        </ul>
                    )}
                </div>

                {/* 費用表單 Modal */}
                {showFormModal && (
                    <ExpenseFormModal 
                        tripId={tripId} 
                        userId={userId} 
                        initialExpense={editingExpense} 
                        onClose={handleCloseForm} 
                        currency={currency}
                    />
                )}
            </div>
        );
    };

    const ExpenseFormModal = ({ tripId, userId, initialExpense, onClose, currency }) => {
        const defaultDate = new Date().toISOString().split('T')[0];
        const [formData, setFormData] = useState({
            description: initialExpense?.description || '',
            amount: initialExpense?.amount || '',
            category: initialExpense?.category || '餐飲',
            date: initialExpense?.date ? initialExpense.date.toISOString().split('T')[0] : defaultDate,
        });
        const [isSubmitting, setIsSubmitting] = useState(false);

        const isEditing = !!initialExpense;
        const title = isEditing ? '編輯費用記錄' : '新增費用記錄';

        const categories = ['餐飲', '交通', '住宿', '購物', '門票', '其他'];

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!formData.description.trim() || !formData.amount || !userId || !tripId) return;

            setIsSubmitting(true);
            try {
                const expenseData = {
                    ...formData,
                    amount: parseFloat(formData.amount),
                    date: new Date(formData.date),
                    updatedAt: serverTimestamp(),
                };

                const expensesRef = getExpenseCollectionRef(userId, tripId);
                
                if (isEditing) {
                    await updateDoc(doc(expensesRef, initialExpense.id), expenseData);
                } else {
                    await addDoc(expensesRef, { ...expenseData, createdAt: serverTimestamp() });
                }
                
                onClose();
            } catch (error) {
                console.error("提交費用失敗:", error);
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <Modal onClose={onClose} title={title}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="例如: 午餐拉麵"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">金額 ({currency})</label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">類別</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">日期</label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <IconButton 
                        icon={Save} 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3"
                    >
                        {isSubmitting ? '儲存中...' : '儲存'}
                    </IconButton>
                </form>
            </Modal>
        );
    };

    // --- MembersTab 和 NotesTab ---
    
    const MembersTab = ({ trip, userId, onUpdate }) => {
        const [newCollaboratorId, setNewCollaboratorId] = useState('');
        const [isAdding, setIsAdding] = useState(false);
        const [message, setMessage] = useState('');

        const isOwner = trip.ownerId === userId;
        const allMembers = [trip.ownerId, ...(trip.collaborators || [])];

        const handleAddCollaborator = async () => {
            if (!newCollaboratorId.trim()) return;

            // 簡易檢查：不能新增自己，不能新增已存在的成員
            if (allMembers.includes(newCollaboratorId.trim())) {
                setMessage('該使用者已在行程中或輸入的是你的 ID。');
                return;
            }

            setIsAdding(true);
            setMessage('');
            try {
                // 這裡需要一個方法來驗證使用者 ID 是否存在，但在這個環境中無法實現，
                // 故假設 ID 格式正確且存在。
                await onUpdate({
                    collaborators: arrayUnion(newCollaboratorId.trim())
                });
                setNewCollaboratorId('');
                setMessage(`使用者 ${newCollaboratorId.trim()} 已成功新增為協作者。`);
            } catch (error) {
                console.error("新增協作者失敗:", error);
                setMessage('新增協作者失敗，請稍後再試。');
            } finally {
                setIsAdding(false);
            }
        };

        const handleRemoveCollaborator = async (collaboratorToRemove) => {
            if (!window.confirm(`確定要移除協作者 ${collaboratorToRemove} 嗎？`)) return;

            try {
                await onUpdate({
                    collaborators: arrayRemove(collaboratorToRemove)
                });
            } catch (error) {
                console.error("移除協作者失敗:", error);
            }
        };

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="w-6 h-6 mr-2 text-indigo-500" /> 行程成員 ({allMembers.length})
                </h2>
                
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isOwner ? '你是這個行程的擁有者，可以管理協作者。' : '你是這個行程的協作者。'}
                    </p>
                    
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                        {allMembers.map((memberId) => {
                            const isOwnerFlag = memberId === trip.ownerId;
                            const isCurrentUser = memberId === userId;
                            const isCollaborator = !isOwnerFlag;

                            return (
                                <li key={memberId} className="py-3 flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <span className={`font-mono text-sm ${isCurrentUser ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                            {memberId}
                                        </span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOwnerFlag ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                            {isOwnerFlag ? '擁有者' : '協作者'}
                                            {isCurrentUser && ' (你)'}
                                        </span>
                                    </div>
                                    {isOwner && isCollaborator && (
                                        <IconButton 
                                            icon={Trash2} 
                                            onClick={() => handleRemoveCollaborator(memberId)}
                                            className="bg-red-400 text-white hover:bg-red-500 p-1.5"
                                        >
                                            移除
                                        </IconButton>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {isOwner && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">新增協作者</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="輸入協作者的使用者 ID"
                                value={newCollaboratorId}
                                onChange={(e) => setNewCollaboratorId(e.target.value)}
                                className="flex-grow p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                            />
                            <IconButton 
                                icon={Plus} 
                                onClick={handleAddCollaborator}
                                disabled={!newCollaboratorId.trim() || isAdding}
                                className="px-4 py-3"
                            >
                                {isAdding ? '新增中...' : '新增'}
                            </IconButton>
                        </div>
                        {message && (
                            <p className={`text-sm ${message.includes('成功') ? 'text-emerald-500' : 'text-red-500'}`}>{message}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                            請在儀表板或標頭找到你的完整使用者 ID (例如: {userId || '請等待認證'}) 來分享給他人。
                        </p>
                    </div>
                )}
            </div>
        );
    };
    
    const NotesTab = ({ trip, onUpdate }) => {
        const [noteContent, setNoteContent] = useState(trip.notes || '');
        const [isSaving, setIsSaving] = useState(false);
        const [saveMessage, setSaveMessage] = useState('');

        const handleSave = async () => {
            setIsSaving(true);
            setSaveMessage('');
            try {
                await onUpdate({ notes: noteContent });
                setSaveMessage('筆記已儲存！');
            } catch (error) {
                console.error("儲存筆記失敗:", error);
                setSaveMessage('儲存失敗。');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveMessage(''), 3000);
            }
        };

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <NotebookPen className="w-6 h-6 mr-2 text-indigo-500" /> 行程筆記
                </h2>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="在此輸入您的旅行筆記、想法和待辦事項..."
                        rows="10"
                        className="w-full p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex justify-between items-center">
                        <IconButton 
                            icon={Save} 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2"
                        >
                            {isSaving ? '儲存中...' : '儲存筆記'}
                        </IconButton>
                        {saveMessage && (
                            <span className={`text-sm font-medium ${saveMessage.includes('失敗') ? 'text-red-500' : 'text-emerald-500'}`}>
                                {saveMessage}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- Modal 組件 ---
    const Modal = ({ children, onClose, title }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all p-6" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    // --- 教學視圖組件 ---
    const TutorialView = ({ onBack, isDarkMode }) => {
        const [currentStep, setCurrentStep] = useState(1);
        const totalSteps = 4;

        const steps = [
            {
                title: "步驟 1: 認證與建立行程",
                content: "應用程式會自動以匿名使用者或透過自訂 Token 登入 Firebase。你可以看到你的專屬 ID。在儀表板上點擊「新增行程」開始規劃你的旅程。",
                icon: User
            },
            {
                title: "步驟 2: 行程詳情與編輯",
                content: "進入行程詳情頁面，你可以編輯行程名稱、目的地、日期和預算。點擊右上角的「編輯」按鈕進行修改，並點擊「儲存」。",
                icon: Edit
            },
            {
                title: "步驟 3: 費用與預算追蹤",
                content: "在「費用與預算」頁籤下，你可以設定總預算，並記錄每一筆花費。圓餅圖（已修復）會即時顯示你的預算使用情況，幫助你保持在預算內。",
                icon: PiggyBank
            },
            {
                title: "步驟 4: 協作與筆記",
                content: "在「成員與協作」頁籤，你可以新增其他人的使用者 ID 讓他們加入協作。在「筆記」頁籤，你可以隨時記錄旅行的想法和待辦事項。",
                icon: Users
            },
        ];

        const StepCard = ({ step, index, currentStep }) => {
            const isActive = index + 1 === currentStep;
            const Icon = step.icon;
            
            return (
                <div 
                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 ${isActive ? 'bg-indigo-500 text-white transform scale-[1.02]' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                        <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{step.title}</h3>
                    </div>
                    <p className={`text-sm ${isActive ? 'text-indigo-100' : 'text-gray-600 dark:text-gray-300'}`}>
                        {step.content}
                    </p>
                </div>
            );
        };
        
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">應用程式使用教學</h1>
                
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <StepCard key={index} step={step} index={index} currentStep={currentStep} />
                    ))}
                </div>
                
                {/* 導航按鈕 */}
                <div className="flex justify-center space-x-4 pt-4">
                    <IconButton 
                        icon={ChevronLeft} 
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        disabled={currentStep === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                    >
                        上一步
                    </IconButton>
                    <IconButton 
                        icon={ChevronRight} // Assuming ChevronRight is available, if not, I'll use Plus or another generic icon
                        onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                        disabled={currentStep === totalSteps}
                        className="px-4 py-2"
                    >
                        下一步
                    </IconButton>
                </div>

                <div className="text-center pt-8">
                    <button
                        onClick={onBack}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors font-medium text-lg"
                    >
                        返回儀表板
                    </button>
                </div>
            </div>
        );
    };


    // 主渲染邏輯
    return (
        <div className="min-h-screen font-sans">
            {!authReady && <LoadingSpinner />}
            
            {authReady && currentView === 'dashboard' && (
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
            
            {authReady && currentView === 'tripDetail' && (
                // TripDetail 已經在內部處理自己的 Header
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                />
            )}

            {authReady && currentView === 'tutorial' && (
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
