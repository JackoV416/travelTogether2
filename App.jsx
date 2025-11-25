import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, where, serverTimestamp, setLogLevel 
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, Maximize2, Minimize2, Settings, User
} from 'lucide-react';

// 設定 Firebase 偵錯日誌級別
setLogLevel('debug');

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- 輔助函數和 Hook ---

/**
 * 自定義 Hook 來處理 Firebase 初始化和身份驗證。
 * @returns {object} 包含 db, auth, userId, isAuthReady 的物件。
 */
const useFirebase = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            
            setDb(firestore);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // 如果沒有用戶，嘗試使用自定義 token 登入或匿名登入
                    if (initialAuthToken) {
                        try {
                            await signInWithCustomToken(authInstance, initialAuthToken);
                        } catch (error) {
                            console.error("Custom token sign-in failed, signing in anonymously:", error);
                            await signInAnonymously(authInstance);
                        }
                    } else {
                        await signInAnonymously(authInstance);
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase Initialization Error:", e);
            setIsAuthReady(true); // 即使出錯也標記為準備好，避免無限載入
        }
    }, []);

    return { db, auth, userId, isAuthReady };
};

/**
 * 自定義 Hook 獲取並監聽特定集合的數據。
 * @param {object} db - Firestore 實例。
 * @param {string} collectionPath - 集合路徑。
 * @param {string} userId - 當前用戶 ID。
 * @param {string} dataKey - 數據在 state 中的鍵。
 * @returns {object} 包含該數據的物件。
 */
const useCollectionData = (db, collectionPath, userId, dataKey) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !userId) {
            setIsLoading(false);
            return;
        }

        const fullPath = `/artifacts/${appId}/users/${userId}/${collectionPath}`;
        const q = query(collection(db, fullPath));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setData(list);
            setIsLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionPath}:`, error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, collectionPath]);

    return { [dataKey]: data, [`is${dataKey}Loading`]: isLoading };
};

/**
 * 主應用程式元件
 */
const App = () => {
    // ----------------------------------------------------
    // I. 主題狀態 (新增暗黑模式功能)
    // ----------------------------------------------------
    const [theme, setTheme] = useState(() => {
        // 從 localStorage 讀取主題，或預設為 'light'
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    // 儲存主題到 localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    // 根據系統偏好設置初始主題
    useEffect(() => {
        if (theme === 'system' && window.matchMedia) {
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setTheme(systemPreference);
        }
    }, []);


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // ----------------------------------------------------
    // II. Firebase/Auth 狀態
    // ----------------------------------------------------
    const { db, userId, isAuthReady } = useFirebase();

    // ----------------------------------------------------
    // III. 應用程式狀態
    // ----------------------------------------------------
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'tripDetail'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isAddingTrip, setIsAddingTrip] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [newTripDate, setNewTripDate] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 新增用於手機漢堡菜單

    // ----------------------------------------------------
    // IV. 數據狀態 (使用 useCollectionData Hook)
    // ----------------------------------------------------
    const { trips: tripsData, istripsDataLoading } = useCollectionData(db, 'trips', userId, 'trips');
    const { todos: todosData, istodosDataLoading } = useCollectionData(db, 'todos', userId, 'todos');
    const { budgets: budgetsData, isbudgetsDataLoading } = useCollectionData(db, 'budgets', userId, 'budgets');

    // ----------------------------------------------------
    // V. 樣式定義 (主題感知樣式)
    // ----------------------------------------------------

    const primaryColor = 'indigo-600';
    const primaryColorDark = 'indigo-400';
    const accentColor = 'teal-500';
    const accentColorDark = 'teal-300';

    const baseTransition = "transition duration-300 ease-in-out";

    const getCardClasses = (additionalClasses = "") => 
        `p-5 rounded-2xl shadow-lg border ${baseTransition} 
         bg-white dark:bg-gray-800 
         border-gray-100 dark:border-gray-700 
         ${additionalClasses}`;

    const getInputClasses = (error = false) => 
        `w-full p-3 rounded-xl ${baseTransition} 
         bg-gray-50 dark:bg-gray-700 
         text-gray-900 dark:text-gray-100 
         border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
         focus:ring-2 focus:ring-${primaryColor} dark:focus:ring-${primaryColorDark} 
         focus:border-transparent`;

    const getButtonPrimaryClasses = () => 
        `flex items-center justify-center px-4 py-2 font-semibold rounded-xl text-white shadow-md ${baseTransition}
         bg-${primaryColor} hover:bg-indigo-700 active:bg-indigo-800
         dark:bg-${primaryColorDark} dark:hover:bg-indigo-500 dark:active:bg-indigo-600
         focus:outline-none focus:ring-4 focus:ring-indigo-500/50`;

    const getButtonSecondaryClasses = () => 
        `flex items-center justify-center px-4 py-2 font-semibold rounded-xl shadow-sm ${baseTransition}
         bg-gray-200 text-gray-700 hover:bg-gray-300
         dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
         focus:outline-none focus:ring-4 focus:ring-gray-400/50`;

    // ----------------------------------------------------
    // VI. 數據操作 (CRUD 函數)
    // ----------------------------------------------------
    const getTripDocRef = useCallback((tripId) => {
        if (!db || !userId) return null;
        return doc(db, `/artifacts/${appId}/users/${userId}/trips`, tripId);
    }, [db, userId]);

    const getSubCollectionRef = useCallback((tripId, subCollectionName) => {
        if (!db || !userId) return null;
        return collection(db, `/artifacts/${appId}/users/${userId}/trips/${tripId}/${subCollectionName}`);
    }, [db, userId]);

    // 建立新行程
    const addTrip = async () => {
        if (!db || !userId || !newTripName || !newTripDate) {
            console.error("Missing data for addTrip.");
            return;
        }
        try {
            await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/trips`), {
                name: newTripName,
                date: newTripDate,
                createdAt: serverTimestamp(),
            });
            setNewTripName('');
            setNewTripDate('');
            setIsAddingTrip(false);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 刪除行程
    const deleteTrip = async (tripId) => {
        if (!db || !userId || !tripId) return;
        try {
            await deleteDoc(getTripDocRef(tripId));
        } catch (e) {
            console.error("Error deleting trip: ", e);
        }
    };

    // 新增/更新子項目 (Todo/Budget/Location/Note)
    const addSubItem = async (tripId, collectionName, data) => {
        const ref = getSubCollectionRef(tripId, collectionName);
        if (!ref) return;

        try {
            await addDoc(ref, {
                ...data,
                createdAt: serverTimestamp(),
                tripId: tripId,
            });
        } catch (e) {
            console.error(`Error adding ${collectionName} item: `, e);
        }
    };

    const updateSubItem = async (tripId, collectionName, itemId, data) => {
        const itemRef = doc(db, `/artifacts/${appId}/users/${userId}/trips/${tripId}/${collectionName}`, itemId);
        try {
            await updateDoc(itemRef, data);
        } catch (e) {
            console.error(`Error updating ${collectionName} item: `, e);
        }
    };

    const deleteSubItem = async (tripId, collectionName, itemId) => {
        const itemRef = doc(db, `/artifacts/${appId}/users/${userId}/trips/${tripId}/${collectionName}`, itemId);
        try {
            await deleteDoc(itemRef);
        } catch (e) {
            console.error(`Error deleting ${collectionName} item: `, e);
        }
    };
    
    // ----------------------------------------------------
    // VII. 元件定義 (Dashboard, TripDetail, Sub-Components)
    // ----------------------------------------------------

    const TodoList = ({ tripId }) => {
        const todos = useMemo(() => 
            todosData.filter(t => t.tripId === tripId), 
            [todosData, tripId]
        );
        const [newTask, setNewTask] = useState('');

        const handleAdd = () => {
            if (newTask.trim()) {
                addSubItem(tripId, 'todos', { task: newTask, completed: false });
                setNewTask('');
            }
        };

        const toggleComplete = (todo) => {
            updateSubItem(tripId, 'todos', todo.id, { completed: !todo.completed });
        };

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-gray-100">待辦清單 ({todos.length})</h3>
                <div className="flex space-x-2">
                    <input
                        className={getInputClasses()}
                        type="text"
                        placeholder="新增待辦事項..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button onClick={handleAdd} className={getButtonPrimaryClasses()}>
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-2">
                    {todos.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4 border rounded-xl border-dashed dark:border-gray-700">
                            目前沒有待辦事項。
                        </p>
                    ) : (
                        todos.map(todo => (
                            <div key={todo.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700 shadow-sm">
                                <span 
                                    className={`flex-1 text-gray-800 dark:text-gray-200 cursor-pointer ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}
                                    onClick={() => toggleComplete(todo)}
                                >
                                    {todo.task}
                                </span>
                                <div className="flex space-x-2 items-center">
                                    {todo.completed && <Check className="w-5 h-5 text-teal-500 dark:text-teal-400" />}
                                    <button 
                                        onClick={() => deleteSubItem(tripId, 'todos', todo.id)} 
                                        className="text-red-500 dark:text-red-400 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800"
                                        title="刪除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const BudgetTracker = ({ tripId }) => {
        const budgets = useMemo(() => 
            budgetsData.filter(b => b.tripId === tripId), 
            [budgetsData, tripId]
        );
        const [newDesc, setNewDesc] = useState('');
        const [newAmount, setNewAmount] = useState('');
        const [newType, setNewType] = useState('expense'); // 'expense' or 'income'

        const totalBudget = budgets.reduce((sum, item) => 
            sum + (item.type === 'income' ? item.amount : -item.amount), 0
        );

        const handleAdd = () => {
            const amount = parseFloat(newAmount);
            if (newDesc.trim() && !isNaN(amount) && amount > 0) {
                addSubItem(tripId, 'budgets', { 
                    description: newDesc, 
                    amount: amount, 
                    type: newType 
                });
                setNewDesc('');
                setNewAmount('');
            } else {
                // 簡易錯誤處理 (不使用 alert)
                console.warn("Invalid budget entry.");
            }
        };

        const typeColors = {
            income: 'text-green-600 dark:text-green-400',
            expense: 'text-red-600 dark:text-red-400',
        };

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-gray-100">預算追蹤</h3>
                <div className={`p-4 rounded-xl text-center font-bold text-lg shadow-inner ${totalBudget >= 0 ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'}`}>
                    總結餘：
                    <span className={totalBudget >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        ${totalBudget.toFixed(2)}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <select 
                        className={getInputClasses()}
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                    >
                        <option value="expense">支出</option>
                        <option value="income">收入</option>
                    </select>
                    <input
                        className={getInputClasses()}
                        type="text"
                        placeholder="描述 (e.g. 晚餐)"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />
                    <div className="flex space-x-2 col-span-3 sm:col-span-1">
                        <input
                            className={getInputClasses()}
                            type="number"
                            placeholder="金額"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button onClick={handleAdd} className={getButtonPrimaryClasses()}>
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {budgets.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4 border rounded-xl border-dashed dark:border-gray-700">
                            尚未記錄任何預算項目。
                        </p>
                    ) : (
                        budgets.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map(budget => (
                            <div key={budget.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700 shadow-sm">
                                <span className={`font-medium ${typeColors[budget.type]}`}>
                                    {budget.type === 'income' ? '+$' : '-$'}
                                    {budget.amount.toFixed(2)}
                                </span>
                                <span className="flex-1 ml-4 text-gray-800 dark:text-gray-200">
                                    {budget.description}
                                </span>
                                <button 
                                    onClick={() => deleteSubItem(tripId, 'budgets', budget.id)} 
                                    className="text-red-500 dark:text-red-400 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800"
                                    title="刪除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };
    
    // 預留位置元件
    const PlaceholderComponent = ({ title, icon: Icon }) => (
        <div className={getCardClasses("text-center space-y-4")}>
            <Icon className="w-12 h-12 text-indigo-500 dark:text-indigo-400 mx-auto" />
            <h3 className="text-xl font-bold dark:text-gray-100">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400">
                這是用於規劃 {title} 的預留位置。
            </p>
            <button className={getButtonSecondaryClasses()}>
                <Plus className="w-4 h-4 mr-2" />
                新增 {title}
            </button>
        </div>
    );

    // 行程詳細頁面
    const TripDetail = ({ tripId }) => {
        const trip = useMemo(() => tripsData.find(t => t.id === tripId), [tripsData, tripId]);
        const [activeTab, setActiveTab] = useState('todo'); // 預設顯示待辦清單
        
        // 根據 tripId 過濾相關數據，計算提醒數量
        const tripTodos = useMemo(() => todosData.filter(t => t.tripId === tripId), [todosData, tripId]);
        const tripBudgets = useMemo(() => budgetsData.filter(b => b.tripId === tripId), [budgetsData, tripId]);
        
        const notificationCounts = useMemo(() => ({
            todo: tripTodos.filter(t => !t.completed).length,
            budget: tripBudgets.length,
            // 其他標籤的提醒可以自行定義
        }), [tripTodos, tripBudgets]);


        if (!trip) {
            return (
                <div className="p-8 text-center dark:text-gray-300">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                    <p>載入中或行程不存在...</p>
                </div>
            );
        }

        const tabClasses = (isActive) => 
            `flex-1 py-2 text-sm font-medium rounded-xl text-center ${baseTransition} 
            ${isActive 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`;

        const renderContent = () => {
            switch (activeTab) {
                case 'todo':
                    return <TodoList tripId={tripId} />;
                case 'budget':
                    return <BudgetTracker tripId={tripId} />;
                case 'notes':
                    return <PlaceholderComponent title="筆記" icon={NotebookPen} />;
                case 'location':
                    return <PlaceholderComponent title="地點與行程" icon={MapPin} />;
                default:
                    return null;
            }
        };

        return (
            <div className={`min-h-screen ${baseTransition} bg-gray-50 dark:bg-gray-900`}>
                <header className="sticky top-0 z-10 p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-800 shadow-md">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <button 
                            onClick={() => setCurrentView('dashboard')} 
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate flex-1 text-center">
                            {trip.name}
                        </h1>
                        <div className="flex space-x-2">
                            <button onClick={toggleTheme} className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full">
                                {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                            </button>
                            <button onClick={() => deleteTrip(tripId)} title="刪除行程" className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 rounded-full">
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>
                
                <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                    {/* 行程資訊卡 */}
                    <div className={getCardClasses("flex justify-between items-center")}>
                        <div className="flex items-center space-x-3">
                            <CalendarDays className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">日期</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{trip.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                             <User className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">用戶 ID (方便協作)</p>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">{userId}</p>
                            </div>
                        </div>
                    </div>

                    {/* 標籤頁導航 */}
                    <div className={getCardClasses("p-3")}>
                        <div className="flex justify-around space-x-2">
                            {[
                                { id: 'todo', name: '待辦清單', icon: ListTodo, count: notificationCounts.todo },
                                { id: 'budget', name: '預算', icon: PiggyBank, count: tripBudgets.length },
                                { id: 'notes', name: '筆記', icon: NotebookPen, count: 0 },
                                { id: 'location', name: '地點', icon: MapPin, count: 0 },
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={tabClasses(activeTab === tab.id)}
                                >
                                    <div className="flex items-center justify-center whitespace-nowrap">
                                        <tab.icon className="w-5 h-5 mr-1" />
                                        <span>{tab.name}</span>
                                        {tab.count > 0 && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                                                {tab.count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 內容區塊 */}
                    <div className={getCardClasses()}>
                        {renderContent()}
                    </div>
                </main>
            </div>
        );
    };


    // 儀表板元件
    const Dashboard = () => {
        const isLoading = istripsDataLoading || !isAuthReady;

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
            );
        }

        const handleSelectTrip = (tripId) => {
            setSelectedTripId(tripId);
            setCurrentView('tripDetail');
        };

        const handleAddTripToggle = () => {
            setIsAddingTrip(prev => !prev);
            setNewTripName('');
            setNewTripDate('');
        };

        return (
            <div className={`min-h-screen ${baseTransition} bg-gray-50 dark:bg-gray-900`}>
                <header className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-800 shadow-md">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                            旅程規劃
                        </h1>
                        <div className="flex space-x-3 items-center">
                            <button onClick={toggleTheme} className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full">
                                {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                            </button>
                            <Settings className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                    {/* 用戶 ID 卡片 */}
                    <div className={getCardClasses("flex items-center justify-between")}>
                        <div className="flex items-center space-x-3">
                            <User className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">當前用戶 ID (協作用)</p>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{userId}</p>
                            </div>
                        </div>
                        
                    </div>
                    
                    {/* 新增行程區塊 */}
                    <div className={getCardClasses()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">我的旅程</h2>
                            <button onClick={handleAddTripToggle} className={getButtonPrimaryClasses()}>
                                {isAddingTrip ? <X className="w-5 h-5 mr-1" /> : <Plus className="w-5 h-5 mr-1" />}
                                {isAddingTrip ? '取消' : '新增旅程'}
                            </button>
                        </div>
                        
                        {isAddingTrip && (
                            <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                <input
                                    className={getInputClasses()}
                                    type="text"
                                    placeholder="旅程名稱 (e.g. 日本東京五日遊)"
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                />
                                <input
                                    className={getInputClasses()}
                                    type="date"
                                    placeholder="開始日期"
                                    value={newTripDate}
                                    onChange={(e) => setNewTripDate(e.target.value)}
                                />
                                <button 
                                    onClick={addTrip} 
                                    disabled={!newTripName || !newTripDate}
                                    className={`${getButtonPrimaryClasses()} w-full disabled:opacity-50`}
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    確認建立
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* 行程列表 */}
                    <div className="space-y-4">
                        {tripsData.length === 0 ? (
                            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl dark:text-gray-400">
                                <Briefcase className="w-10 h-10 mx-auto mb-3 text-indigo-400 dark:text-indigo-500" />
                                <p>尚未有任何旅程。點擊上方按鈕開始規劃！</p>
                            </div>
                        ) : (
                            tripsData
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map(trip => (
                                    <div 
                                        key={trip.id} 
                                        className={`${getCardClasses("cursor-pointer hover:shadow-2xl")} flex justify-between items-center`}
                                        onClick={() => handleSelectTrip(trip.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                                                <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{trip.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                    <CalendarDays className="w-4 h-4 mr-1" />
                                                    {trip.date}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronLeft className="w-5 h-5 text-gray-500 transform rotate-180" />
                                    </div>
                                ))
                        )}
                    </div>
                </main>
            </div>
        );
    };

    // ----------------------------------------------------
    // VIII. 主渲染邏輯
    // ----------------------------------------------------
    return (
        // 外部容器根據主題應用 'dark' class
        <div className={`font-sans antialiased min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
            {currentView === 'dashboard' ? (
                <Dashboard />
            ) : (
                <TripDetail tripId={selectedTripId} />
            )}
        </div>
    );
};

export default App;
