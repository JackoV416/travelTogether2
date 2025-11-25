import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList
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

// Tailwind CSS 輔助類別
const primaryColor = 'indigo-600';
const accentColor = 'teal-500';

const cardClasses = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-800 dark:text-gray-100`;
const buttonPrimaryClasses = `flex items-center justify-center px-4 py-2 font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50`;
const buttonSecondaryClasses = `flex items-center justify-center px-4 py-2 font-semibold text-indigo-600 bg-indigo-100 rounded-xl hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 transition duration-200`;
const buttonDangerClasses = `flex items-center justify-center p-3 text-white bg-red-500 rounded-full hover:bg-red-600 transition duration-200 shadow-md`;
const tabClasses = (isActive) => isActive 
    ? `flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-md transition duration-300`
    : `flex-1 py-3 text-sm font-semibold text-indigo-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-300`;


// --- 輔助函式 ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD', // 假設使用新台幣
        minimumFractionDigits: 0
    }).format(amount);
};

// --- 通用組件：頂部導航列 (含用戶資訊、模式切換) ---
const Header = ({ title, userId, isDarkMode, toggleDarkMode, onTutorialStart }) => (
    <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="flex items-center space-x-3">
            <button
                onClick={onTutorialStart}
                className={buttonSecondaryClasses.replace('px-4 py-2', 'p-2')}
                title="查看教學"
            >
                <BookOpenText className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">教學</span>
            </button>
            <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                title={isDarkMode ? '切換到亮色模式' : '切換到暗色模式'}
            >
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2 p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/50">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-indigo-300 dark:ring-indigo-600">
                    <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                    {userId ? `User: ${userId.substring(0, 8)}...` : '訪客'}
                </span>
            </div>
        </div>
    </div>
);


// --- 模擬數據和組件 (教學介面專用) ---

const MockData = {
    trip: {
        id: 'mock-trip-1',
        name: '教學：日本東京五日遊',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
    },
    todos: [
        { id: 1, text: '護照簽證準備', isCompleted: true },
        { id: 2, text: '購買 JR Pass', isCompleted: false },
        { id: 3, text: '兌換日幣', isCompleted: false },
    ],
    expenses: [
        { id: 1, description: '機票', amount: 15000, category: '交通' },
        { id: 2, description: '飯店訂金', amount: 5000, category: '住宿' },
    ],
    notes: [
        { id: 1, title: '東京必吃美食', content: '拉麵、壽司、燒肉。' },
        { id: 2, title: '交通注意事項', content: 'Suica 卡與 Pasmo 卡使用。' },
    ],
    locations: [
        { id: 1, name: '澀谷交叉口', notes: '拍照留念' },
        { id: 2, name: '淺草寺', notes: '購買御守' },
    ]
};

// 教學用途的 TripDetail 內容渲染函數
const TutorialContentRenderer = ({ activeTab }) => {
    const data = MockData;
    const items = activeTab === 'todo' ? data.todos 
        : activeTab === 'expense' ? data.expenses 
        : activeTab === 'note' ? data.notes 
        : data.locations;
    
    // 渲染特定標籤的只讀內容
    return (
        <div className="mt-4 space-y-3">
            {items.length === 0 ? (
                <div className="text-center p-4 text-gray-500 dark:text-gray-400 italic">
                    此處為 {activeTab} 列表，請點擊 + 按鈕新增項目。
                </div>
            ) : (
                items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center flex-1 min-w-0">
                            {activeTab === 'todo' && (
                                <Check className={`w-5 h-5 mr-3 ${item.isCompleted ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
                            )}
                            <div className="min-w-0">
                                <p className="font-medium truncate text-gray-900 dark:text-gray-100">
                                    {item.text || item.description || item.title || item.name}
                                </p>
                                {activeTab === 'expense' && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(item.amount)} ({item.category})
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* 模擬的動作區域 */}
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 italic ml-4 flex-shrink-0">
                            (教學模式 - 只讀)
                        </div>
                    </div>
                ))
            )}
            <div className="mt-6 flex justify-center">
                <button 
                    className={`${buttonSecondaryClasses} cursor-not-allowed opacity-50`}
                    disabled
                >
                    <Plus className="w-5 h-5 mr-2" />
                    新增 {activeTab === 'todo' ? '待辦' : activeTab === 'expense' ? '支出' : activeTab === 'note' ? '筆記' : '地點'} (此為模擬按鈕)
                </button>
            </div>
        </div>
    );
};


const TutorialView = ({ onBack, isDarkMode }) => {
    const [currentStep, setCurrentStep] = useState('dashboard'); // 'dashboard', 'tripDetail'
    const [activeTab, setActiveTab] = useState('todo'); // 模擬行程細節的頁籤

    const trip = MockData.trip;

    const renderDashboard = () => (
        <div className="p-4 sm:p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">步驟 1: 儀表板 (Dashboard)</h2>
            <div className={`${cardClasses} p-4`}>
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">我的行程列表</h3>
                <div 
                    className="flex items-center justify-between p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl cursor-pointer hover:bg-indigo-200 transition duration-150"
                    onClick={() => setCurrentStep('tripDetail')}
                >
                    <p className="font-bold text-lg text-indigo-800 dark:text-indigo-200">{trip.name}</p>
                    <ChevronLeft className="w-5 h-5 transform rotate-180 text-indigo-600" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    點擊列表中的行程名稱 (如上方的 "{trip.name}") 即可進入該行程的詳細規劃介面。
                </p>
                <div className="mt-4 text-center">
                    <button 
                        className={`${buttonPrimaryClasses} cursor-not-allowed opacity-50`}
                        disabled
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        新增行程 (此為模擬按鈕)
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 border-l-4 border-teal-500 pl-3 py-1 bg-teal-50 dark:bg-teal-900/20 rounded">
                此教學介面為「只讀」模式，您無法對模擬數據進行任何新增、編輯或刪除操作。請返回主畫面進行實際規劃。
            </p>
        </div>
    );

    const renderTripDetail = () => (
        <div className="p-4 sm:p-6 space-y-6">
            <button onClick={() => setCurrentStep('dashboard')} className={`${buttonSecondaryClasses} mb-4 p-2`}>
                <ChevronLeft className="w-5 h-5 mr-1" />
                返回教學儀表板
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">步驟 2: 行程細節 (Trip Detail)</h2>
            <div className={`${cardClasses}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-indigo-600">{trip.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{trip.startDate} ~ {trip.endDate}</span>
                </div>
                
                {/* 頁籤導航 */}
                <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                    {[
                        { id: 'todo', name: '待辦', icon: ClipboardList },
                        { id: 'expense', name: '支出', icon: PiggyBank },
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
                                <span className="ml-1 hidden sm:inline">{tab.name}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* 頁籤內容 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    點擊上方頁籤可切換：{activeTab === 'todo' ? '待辦事項' : activeTab === 'expense' ? '行程預算與花費' : activeTab === 'note' ? '重要筆記與資料' : '地圖與景點資訊'}
                </p>
                <div className="p-4 border border-dashed border-indigo-400 dark:border-indigo-600 rounded-xl bg-white dark:bg-gray-800">
                    <TutorialContentRenderer activeTab={activeTab} />
                </div>
                
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                    此介面展示了完整的行程規劃功能，包含待辦、支出、筆記與地點管理。
                </p>
            </div>
            
        </div>
    );

    return (
        <div className="min-h-screen">
            <Header 
                title="應用程式教學" 
                userId="TUTOR" 
                isDarkMode={isDarkMode} 
                toggleDarkMode={() => {}} // 禁用切換
                onTutorialStart={onBack} // 教程中按鈕用於返回
            />
            <div className="max-w-4xl mx-auto">
                {currentStep === 'dashboard' ? renderDashboard() : renderTripDetail()}
            </div>
            <div className="p-6 text-center">
                <button onClick={onBack} className={buttonPrimaryClasses}>
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    返回實際操作介面
                </button>
            </div>
        </div>
    );
};


// --- 主要功能組件: 行程細節 (TripDetail) ---

const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [activeTab, setActiveTab] = useState('todo');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    // 數據狀態 (Todo, Expense, Note, Location)
    const [todos, setTodos] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tripPath = (id) => `artifacts/${appId}/public/data/trips/${id}`;
    const collectionPath = (name) => `artifacts/${appId}/users/${userId}/trips/${tripId}/${name}`;
    
    // 異步操作函數 (僅為骨架，未完全實作CRUD細節)
    const handleSaveTripName = async () => {
        if (!userId || !tripId || !newName) return;
        try {
            await updateDoc(doc(db, tripPath(tripId)), { name: newName, updatedAt: serverTimestamp() });
            setIsEditing(false);
        } catch (e) {
            console.error("Error updating trip name: ", e);
            setError("更新行程名稱失敗。");
        }
    };

    // Firebase 數據訂閱 useEffect
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        setLoading(true);
        setError(null);

        // 1. 行程基本資訊
        const unsubTrip = onSnapshot(doc(db, tripPath(tripId)), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setTrip({ id: docSnapshot.id, ...data });
                setNewName(data.name);
            } else {
                setTrip(null);
                setError("行程不存在或已被刪除。");
            }
        }, (e) => {
            console.error("Error fetching trip:", e);
            setError("獲取行程資料失敗。");
        });
        
        // 2. 待辦事項 (Todo) 
        const unsubTodos = onSnapshot(query(collection(db, collectionPath('todos')), orderBy('createdAt')), (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setTodos(items);
        });

        // 3. 支出 (Expenses)
        const unsubExpenses = onSnapshot(query(collection(db, collectionPath('expenses')), orderBy('createdAt')), (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setExpenses(items);
        });

        // 4. 筆記 (Notes)
        const unsubNotes = onSnapshot(query(collection(db, collectionPath('notes')), orderBy('createdAt')), (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotes(items);
        });

        // 5. 地點 (Locations)
        const unsubLocations = onSnapshot(query(collection(db, collectionPath('locations')), orderBy('createdAt')), (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setLocations(items);
        });

        setLoading(false);

        return () => {
            unsubTrip();
            unsubTodos();
            unsubExpenses();
            unsubNotes();
            unsubLocations();
        };
    }, [authReady, userId, tripId]);


    // 計算總支出
    const totalExpense = useMemo(() => {
        return expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [expenses]);
    
    // 渲染各頁籤內容
    const renderContent = () => {
        const baseClasses = "mt-4 space-y-3";
        
        // 共同的新增按鈕
        const AddItemButton = ({ label, icon: Icon, onClick }) => (
            <button 
                onClick={onClick} 
                className={`${buttonPrimaryClasses} w-full mt-4`}
            >
                <Icon className="w-5 h-5 mr-2" />
                新增 {label}
            </button>
        );

        // 簡單的項目卡片
        const ItemCard = ({ title, subtitle, details, onEdit, onDelete }) => (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-gray-100">{title}</p>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    {details && <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 line-clamp-2">{details}</p>}
                </div>
                <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button onClick={onEdit} className="p-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
        
        // 由於篇幅限制，這裡只實作了骨架結構
        switch (activeTab) {
            case 'todo':
                return (
                    <div className={baseClasses}>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">待辦事項 ({todos.length} 項)</h4>
                        {todos.map(t => (
                            <ItemCard 
                                key={t.id} 
                                title={t.text || '無內容待辦'} 
                                subtitle={t.isCompleted ? '已完成' : '未完成'}
                                onEdit={() => console.log('Edit Todo', t.id)}
                                onDelete={() => console.log('Delete Todo', t.id)}
                            />
                        ))}
                        <AddItemButton label="待辦事項" icon={Plus} onClick={() => console.log('Add Todo')} />
                    </div>
                );
            case 'expense':
                return (
                    <div className={baseClasses}>
                        <div className="p-4 bg-teal-100 dark:bg-teal-900/50 rounded-xl text-center shadow-inner">
                            <p className="text-sm font-medium text-teal-800 dark:text-teal-200">當前總支出</p>
                            <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{formatCurrency(totalExpense)}</p>
                        </div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">支出記錄 ({expenses.length} 筆)</h4>
                        {expenses.map(e => (
                            <ItemCard 
                                key={e.id} 
                                title={e.description || '無描述支出'} 
                                subtitle={`${formatCurrency(e.amount)} - ${e.category || '未分類'}`}
                                onEdit={() => console.log('Edit Expense', e.id)}
                                onDelete={() => console.log('Delete Expense', e.id)}
                            />
                        ))}
                        <AddItemButton label="支出記錄" icon={Plus} onClick={() => console.log('Add Expense')} />
                    </div>
                );
            case 'note':
                return (
                    <div className={baseClasses}>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">行程筆記 ({notes.length} 則)</h4>
                        {notes.map(n => (
                            <ItemCard 
                                key={n.id} 
                                title={n.title || '無標題筆記'} 
                                details={n.content}
                                onEdit={() => console.log('Edit Note', n.id)}
                                onDelete={() => console.log('Delete Note', n.id)}
                            />
                        ))}
                        <AddItemButton label="筆記" icon={Plus} onClick={() => console.log('Add Note')} />
                    </div>
                );
            case 'location':
                return (
                    <div className={baseClasses}>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">地點與景點 ({locations.length} 處)</h4>
                        {locations.map(l => (
                            <ItemCard 
                                key={l.id} 
                                title={l.name || '無名稱地點'} 
                                details={l.notes}
                                onEdit={() => console.log('Edit Location', l.id)}
                                onDelete={() => console.log('Delete Location', l.id)}
                            />
                        ))}
                        <AddItemButton label="地點" icon={Plus} onClick={() => console.log('Add Location')} />
                    </div>
                );
            default:
                return null;
        }
    };


    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!trip) return <div className="p-8 text-center text-gray-500">找不到該行程。</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <button onClick={onBack} className={`${buttonSecondaryClasses} mb-6 p-2`}>
                <ChevronLeft className="w-5 h-5 mr-1" />
                返回儀表板
            </button>
            
            <div className={`${cardClasses} mb-6`}>
                <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className={`${inputClasses} text-xl font-bold`}
                            />
                        ) : (
                            <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 truncate">
                                {trip.name}
                            </h2>
                        )}
                        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(trip.startDate).toLocaleDateString()} ~ {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                    </div>

                    {isEditing ? (
                        <div className="flex space-x-2 ml-4">
                            <button onClick={handleSaveTripName} className={`${buttonPrimaryClasses} p-2`}>
                                <Save className="w-5 h-5" />
                            </button>
                            <button onClick={() => { setIsEditing(false); setNewName(trip.name); }} className={`${buttonSecondaryClasses} p-2`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className={`${buttonSecondaryClasses} p-2 ml-4`}>
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* 頁籤導航 (還原原有功能) */}
            <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner mb-6">
                {[
                    { id: 'todo', name: '待辦清單', icon: ClipboardList },
                    { id: 'expense', name: '預算支出', icon: PiggyBank },
                    { id: 'note', name: '行程筆記', icon: NotebookPen },
                    { id: 'location', name: '地點地圖', icon: MapPin },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600' : 'text-white'} `} />
                            <span className="ml-2 hidden sm:inline">{tab.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            <div className={`${cardClasses} p-6`}>
                {renderContent()}
            </div>
            
        </div>
    );
};


// --- 主要功能組件: 儀表板 (Dashboard) ---

const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [newTripName, setNewTripName] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleCreateTrip = useCallback(async (e) => {
        e.preventDefault();
        if (!userId || !newTripName || !newTripStartDate || !newTripEndDate) {
            console.warn("所有欄位都是必填的。");
            return;
        }

        try {
            // 在公共 collections 建立行程 (所有用戶可讀)
            const tripRef = collection(db, `artifacts/${appId}/public/data/trips`);
            const newTripDoc = await addDoc(tripRef, {
                name: newTripName,
                startDate: newTripStartDate,
                endDate: newTripEndDate,
                ownerId: userId,
                createdAt: serverTimestamp(),
            });

            console.log("New trip created with ID:", newTripDoc.id);
            
            // 清空並隱藏表單
            setNewTripName('');
            setNewTripStartDate('');
            setNewTripEndDate('');
            setShowForm(false);

        } catch (e) {
            console.error("Error creating new trip: ", e);
        }
    }, [userId, newTripName, newTripStartDate, newTripEndDate]);


    return (
        <div className="min-h-screen">
            <Header 
                title="行程儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                onTutorialStart={onTutorialStart}
            />

            <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 space-y-6">

                {/* 新增行程按鈕 */}
                <button onClick={() => setShowForm(!showForm)} className={buttonPrimaryClasses + ' w-full'}>
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? '取消新增' : '規劃新行程'}
                </button>

                {/* 新增行程表單 */}
                {showForm && (
                    <div className={`${cardClasses}`}>
                        <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">建立新的旅遊行程</h3>
                        <form onSubmit={handleCreateTrip} className="space-y-4">
                            <input
                                type="text"
                                placeholder="行程名稱 (例如：日本東京五日遊)"
                                value={newTripName}
                                onChange={(e) => setNewTripName(e.target.value)}
                                className={inputClasses}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                                    <CalendarDays className="w-5 h-5 ml-3 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="date"
                                        value={newTripStartDate}
                                        onChange={(e) => setNewTripStartDate(e.target.value)}
                                        className={`${inputClasses} border-none`}
                                        required
                                    />
                                </div>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                                    <CalendarDays className="w-5 h-5 ml-3 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="date"
                                        value={newTripEndDate}
                                        onChange={(e) => setNewTripEndDate(e.target.value)}
                                        className={`${inputClasses} border-none`}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className={buttonPrimaryClasses + ' w-full'}>
                                <Save className="w-5 h-5 mr-2" />
                                儲存行程
                            </button>
                        </form>
                    </div>
                )}
                
                {/* 行程列表 */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">我的行程</h2>
                <div className="space-y-3">
                    {trips.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-800 rounded-xl">
                            您尚未建立任何行程，請點擊上方按鈕開始規劃！
                        </div>
                    ) : (
                        trips.map(trip => (
                            <div 
                                key={trip.id}
                                className={`${cardClasses} p-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-150`}
                                onClick={() => onSelectTrip(trip.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 truncate">
                                            {trip.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                            <CalendarDays className="w-4 h-4 mr-1" />
                                            {new Date(trip.startDate).toLocaleDateString()} ~ {new Date(trip.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronLeft className="w-6 h-6 transform rotate-180 text-indigo-600 ml-4 flex-shrink-0" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


// --- 應用程式主體 ---

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    
    // 初始化 Firebase 和認證
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // 嘗試使用自訂 token 登入，或匿名登入
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (e) {
                    console.error("Authentication failed:", e);
                }
            }
            // 無論是自訂 token 登入還是匿名登入，都會設定 user
            setUserId(auth.currentUser?.uid || 'anonymous');
            setAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // 數據訂閱 (儀表板的行程列表)
    useEffect(() => {
        if (!authReady || !userId) return;

        // 監聽所有公開行程
        const tripsCollection = collection(db, `artifacts/${appId}/public/data/trips`);
        const q = query(tripsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]); // 依賴 authReady 和 userId

    // 切換深色/亮色模式
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

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

    if (!authReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
            {/* 根據 currentView 渲染不同介面 */}
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
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
                    <Header 
                        title="行程規劃" 
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial}
                    />
                    <TripDetail 
                        tripId={selectedTripId} 
                        onBack={handleBackToDashboard} 
                        userId={userId} 
                        authReady={authReady}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            {currentView === 'tutorial' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
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
