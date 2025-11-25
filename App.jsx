import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, AlertTriangle, 
    Settings, Info
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
    // 啟用 Firestore 偵錯日誌
    // setLogLevel('Debug');
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// Tailwind CSS 輔助類別 (針對 Light/Dark 模式調整)
const primaryColor = 'indigo-600 dark:text-indigo-400';
const primaryBg = 'bg-indigo-600 dark:bg-indigo-700';
const primaryHover = 'hover:bg-indigo-700 dark:hover:bg-indigo-600';

const cardClasses = "bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-slate-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-gray-100`;
const buttonClasses = `px-4 py-2 font-semibold rounded-xl transition duration-200 shadow-md ${primaryBg} text-white ${primaryHover}`;
const iconButtonClasses = "p-2 rounded-full transition duration-200 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300";

// --- 輔助函式 ---
const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleTimeString('zh-TW', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });
};

// --- Firebase 儲存路徑函式 ---
// 公開資料 (例如：行程、待辦清單、筆記等)
const getPublicCollectionPath = (collectionName, tripId) => `/artifacts/${appId}/public/data/trips/${tripId}/${collectionName}`;
// 使用者私有資料 (例如：通知、設定等，在此範例中未使用，但保留結構)
const getUserPrivateCollectionPath = (userId, collectionName) => `/artifacts/${appId}/users/${userId}/${collectionName}`;
// 行程列表
const getTripCollectionPath = () => `/artifacts/${appId}/public/data/trips`;

// --- UI 組件：通知列表 (新增) ---
const Notifications = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 模擬從 Firestore 獲取通知的過程
        // 由於我們沒有實際的通知集合，這裡使用一個模擬的資料結構
        // 在真實應用中，您會使用 onSnapshot 監聽特定的通知集合
        
        // 模擬資料，包含系統訊息和協作訊息
        const mockMessages = [
            { id: 1, text: '歡迎回來！您的旅程資料已成功同步。', type: 'info', timestamp: serverTimestamp() },
            { id: 2, text: '「巴黎之旅」的待辦清單有新項目被標記完成。', type: 'success', timestamp: serverTimestamp() },
            { id: 3, text: '您的「泰國曼谷」行程預算已超出 10%。請注意！', type: 'warning', timestamp: serverTimestamp() },
            { id: 4, text: '系統維護通知：將於今晚 02:00 進行。', type: 'info', timestamp: serverTimestamp() },
        ];

        setMessages(mockMessages.map((m, index) => ({
            ...m,
            // 由於 serverTimestamp 在客戶端是 null，這裡使用當前時間作為 fallback
            date: new Date(Date.now() - index * 3600000) // 模擬不同時間
        })));
        setLoading(false);

        // 如果要實現真實的通知監聽，代碼結構如下：
        // const q = query(collection(db, getNotificationCollectionPath(userId)), orderBy('timestamp', 'desc'));
        // const unsubscribe = onSnapshot(q, (snapshot) => {
        //     const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().timestamp?.toDate() }));
        //     setMessages(fetchedMessages);
        //     setLoading(false);
        // }, (error) => {
        //     console.error("Error fetching notifications: ", error);
        //     setLoading(false);
        // });
        // return () => unsubscribe();

    }, [userId]);

    const getIconAndColor = (type) => {
        switch (type) {
            case 'success':
                return { icon: Check, color: 'text-green-500 bg-green-100 dark:bg-green-900' };
            case 'warning':
                return { icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900' };
            case 'info':
            default:
                return { icon: Info, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">最新提醒與通知</h2>
            {messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">目前沒有新的通知。</p>
            ) : (
                messages.map(msg => {
                    const { icon: Icon, color } = getIconAndColor(msg.type);
                    return (
                        <div key={msg.id} className={`${cardClasses} flex items-start space-x-3`}>
                            <div className={`p-2 rounded-full ${color} flex-shrink-0`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{msg.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {msg.date.toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

// --- UI 組件：TripDetail (部分簡化) ---
const TripDetail = React.memo(({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todo'); // 預設顯示待辦清單
    const [todos, setTodos] = useState([]);
    const [notes, setNotes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDates, setEditDates] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!authReady || !tripId) return;

        const tripDocRef = doc(db, getTripCollectionPath(), tripId);
        const unsubscribeTrip = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
                setEditName(docSnap.data().name);
                setEditDates(docSnap.data().dates);
            } else {
                setMessage('找不到此行程。');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            setMessage('載入行程詳情失敗。');
            setLoading(false);
        });

        // 訂閱子集合 (待辦清單, 筆記, 地點, 預算)
        const subscribeCollection = (collectionName, setter) => {
            const q = query(collection(db, getPublicCollectionPath(collectionName, tripId)), orderBy('timestamp', 'asc'));
            return onSnapshot(q, (snapshot) => {
                setter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            }, (error) => {
                console.error(`Error fetching ${collectionName}:`, error);
            });
        };

        const unsubTodos = subscribeCollection('todos', setTodos);
        const unsubNotes = subscribeCollection('notes', setNotes);
        const unsubLocations = subscribeCollection('locations', setLocations);
        const unsubBudgets = subscribeCollection('budgets', setBudgets);

        return () => {
            unsubscribeTrip();
            unsubTodos();
            unsubNotes();
            unsubLocations();
            unsubBudgets();
        };
    }, [tripId, authReady]);

    const handleUpdateTrip = async () => {
        if (!editName.trim() || !editDates.trim()) {
            setMessage('行程名稱和日期不能為空。');
            return;
        }
        try {
            await updateDoc(doc(db, getTripCollectionPath(), trip.id), {
                name: editName,
                dates: editDates,
                updatedAt: serverTimestamp(),
            });
            setIsEditing(false);
            setMessage('行程資訊更新成功。');
        } catch (e) {
            console.error("Error updating trip: ", e);
            setMessage('更新行程資訊失敗。');
        }
    };

    // 簡化版的內容渲染器 (只包含基本的待辦清單)
    const renderContent = () => {
        // ... (其他標籤內容，如 Locations, Notes, Budget 的組件定義)
        const TodoList = ({ list, collectionName }) => {
            const [newItemText, setNewItemText] = useState('');
            const itemCollectionRef = collection(db, getPublicCollectionPath(collectionName, tripId));

            const handleAddItem = async () => {
                if (!newItemText.trim()) return;
                try {
                    await addDoc(itemCollectionRef, {
                        text: newItemText.trim(),
                        completed: false,
                        timestamp: serverTimestamp(),
                        userId: userId,
                    });
                    setNewItemText('');
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            };

            const handleToggleComplete = async (id, currentStatus) => {
                try {
                    await updateDoc(doc(itemCollectionRef, id), {
                        completed: !currentStatus,
                    });
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            };

            const handleDeleteItem = async (id) => {
                try {
                    await deleteDoc(doc(itemCollectionRef, id));
                } catch (e) {
                    console.error("Error deleting document: ", e);
                }
            };

            return (
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="新增待辦項目..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            className={inputClasses}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                        />
                        <button onClick={handleAddItem} className={buttonClasses}>
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {list.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">此處暫無項目。</p>
                    ) : (
                        <ul className="space-y-2">
                            {list.map(item => (
                                <li key={item.id} className={`${cardClasses} flex justify-between items-center px-4 py-3`}>
                                    <span 
                                        className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}
                                        onClick={() => handleToggleComplete(item.id, item.completed)}
                                    >
                                        {item.text}
                                    </span>
                                    <button onClick={() => handleDeleteItem(item.id)} className="ml-4 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        };

        switch (activeTab) {
            case 'todo':
                return <TodoList list={todos} collectionName="todos" />;
            case 'budget':
                return <div className="p-4 text-center text-gray-500 dark:text-gray-400">預算追蹤功能 (未來新增)</div>;
            case 'note':
                return <div className="p-4 text-center text-gray-500 dark:text-gray-400">筆記功能 (未來新增)</div>;
            case 'location':
                return <div className="p-4 text-center text-gray-500 dark:text-gray-400">地點地圖功能 (未來新增)</div>;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'todo', name: '待辦清單', icon: ListTodo, count: todos.filter(t => !t.completed).length },
        { id: 'budget', name: '預算', icon: PiggyBank, count: budgets.length },
        { id: 'note', name: '筆記', icon: NotebookPen, count: notes.length },
        { id: 'location', name: '地點', icon: MapPin, count: locations.length },
    ];

    const tabClasses = (isActive) => 
        `flex-1 p-3 text-sm font-medium rounded-xl transition duration-200 ${isActive ? `${primaryBg} text-white shadow-lg` : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="p-5 text-center">
                <p className="text-red-500">{message}</p>
                <button onClick={onBack} className={`${buttonClasses} mt-4`}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    返回儀表板
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <header className="flex items-center justify-between mb-6">
                <button onClick={onBack} className={iconButtonClasses}>
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold truncate flex-1 text-center mx-4">
                    {trip.name}
                </h1>
                <button onClick={() => setIsEditing(!isEditing)} className={iconButtonClasses}>
                    <Edit className="w-5 h-5" />
                </button>
            </header>

            {/* 編輯/詳情區塊 */}
            <div className={cardClasses}>
                {isEditing ? (
                    <div className="space-y-4">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClasses} placeholder="行程名稱" />
                        <input type="text" value={editDates} onChange={(e) => setEditDates(e.target.value)} className={inputClasses} placeholder="日期範圍" />
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleUpdateTrip} className={buttonClasses}>
                                <Save className="w-5 h-5 mr-1" />
                                儲存
                            </button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 font-semibold rounded-xl transition duration-200 bg-gray-400 hover:bg-gray-500 text-white shadow-md">
                                <X className="w-5 h-5 mr-1" />
                                取消
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-lg font-semibold">{trip.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2" />
                            {trip.dates}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            由 {trip.userId.substring(0, 8)}... 創建於 {formatDate(trip.createdAt)}
                        </p>
                    </div>
                )}
            </div>

            {/* 標籤切換區塊 */}
            <div className={`flex p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-2xl shadow-inner`}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'}`} />
                            <span className="ml-1">{tab.name}</span>
                            {tab.count > 0 && (
                                <span className={`ml-2 text-xs font-bold rounded-full px-2 py-0.5 ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-900'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            {renderContent()}

            {message && (
                <div className="fixed bottom-4 right-4 p-3 bg-green-500 text-white rounded-xl shadow-lg animate-bounce">
                    {message}
                </div>
            )}
        </div>
    );
});


// --- UI 組件：Dashboard (包含暗黑模式和登出按鈕) ---
const Dashboard = React.memo(({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onLogout }) => {
    const [newTripName, setNewTripName] = useState('');
    const [newTripDates, setNewTripDates] = useState('');
    const [activeTab, setActiveTab] = useState('home'); // 新增 'notifications' tab
    const [message, setMessage] = useState('');

    const handleCreateTrip = async () => {
        if (!newTripName.trim() || !newTripDates.trim()) {
            setMessage('請填寫行程名稱和日期。');
            return;
        }
        try {
            const tripCollectionRef = collection(db, getTripCollectionPath());
            await addDoc(tripCollectionRef, {
                name: newTripName.trim(),
                dates: newTripDates.trim(),
                createdAt: serverTimestamp(),
                userId: userId,
            });
            setNewTripName('');
            setNewTripDates('');
            setMessage('行程建立成功！');
        } catch (e) {
            console.error("Error creating new trip: ", e);
            setMessage('行程建立失敗。');
        }
    };

    // 模擬通知計數，讓 Bell 鈴鐺圖標閃爍
    const notificationCounts = useMemo(() => ({
        notifications: 4, // 模擬有 4 條新通知
        // 其他 tab 的計數保持為 0 或根據實際資料計算
    }), []);
    
    // 渲染儀表板的內容區塊
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-6">
                        {/* 建立新行程卡片 */}
                        <div className={cardClasses}>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">建立新行程</h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="行程名稱 (例如: 巴黎浪漫之旅)"
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                    className={inputClasses}
                                />
                                <input
                                    type="text"
                                    placeholder="日期範圍 (例如: 2025/12/01 - 2025/12/07)"
                                    value={newTripDates}
                                    onChange={(e) => setNewTripDates(e.target.value)}
                                    className={inputClasses}
                                />
                                <button onClick={handleCreateTrip} className={buttonClasses + ' w-full'}>
                                    <Plus className="w-5 h-5 mr-1 inline" />
                                    確認建立
                                </button>
                            </div>
                        </div>

                        {/* 現有行程列表 */}
                        <div className={cardClasses}>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">我的行程 ({trips.length})</h2>
                            {trips.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">目前沒有任何行程。</p>
                            ) : (
                                <ul className="space-y-3">
                                    {trips.map(trip => (
                                        <li 
                                            key={trip.id} 
                                            className="p-4 rounded-xl transition duration-200 cursor-pointer bg-gray-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-gray-100 dark:border-slate-600"
                                            onClick={() => onSelectTrip(trip.id)}
                                        >
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{trip.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                <CalendarDays className="w-4 h-4 mr-2" />
                                                {trip.dates}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                創建於 {formatDate(trip.createdAt)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            case 'notifications':
                return <Notifications userId={userId} />;
            case 'collaborators':
                return <div className="p-4 text-center text-gray-500 dark:text-gray-400">協作者管理功能 (未來新增)</div>;
            case 'settings':
                return (
                    <div className={cardClasses + " space-y-4"}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">設定</h2>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                            <span className="font-medium flex items-center">
                                {isDarkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
                                暗黑模式
                            </span>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-400'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                        <div className="p-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                使用者 ID: <span className="font-mono text-xs break-all">{userId}</span>
                            </p>
                        </div>
                        <hr className="border-gray-200 dark:border-slate-700" />
                        <button onClick={onLogout} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md">
                            <LogOut className="w-5 h-5 mr-2" />
                            登出
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'home', name: '行程', icon: Briefcase },
        { id: 'notifications', name: '通知', icon: Bell }, // 新增通知標籤
        { id: 'collaborators', name: '協作者', icon: Users },
        { id: 'settings', name: '設定', icon: Settings }, // 新增設定標籤，包含暗黑模式和登出
    ];

    const tabClasses = (isActive) => 
        `flex-1 p-3 text-sm font-medium rounded-xl transition duration-200 flex items-center justify-center ${isActive ? `${primaryBg} text-white shadow-lg` : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">旅程儀表板</h1>
                {/* 登出和暗黑模式切換現在移到了 'settings' tab */}
            </header>

            {/* 標籤切換區塊 (頂部) */}
            <div className={`flex p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-2xl shadow-inner`}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'} `} />
                            <span className="ml-1">{tab.name}</span>
                            {notificationCounts[tab.id] > 0 && tab.id === 'notifications' && (
                                <Bell className="w-4 h-4 ml-1 text-yellow-300 animate-pulse fill-yellow-300" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            {renderContent()}
            
            {message && (
                <div className="fixed bottom-4 right-4 p-3 bg-green-500 text-white rounded-xl shadow-lg animate-bounce">
                    {message}
                </div>
            )}
        </div>
    );
});


// --- 主應用程式組件 ---
const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedTripId, setSelectedTripId] = useState(null);
    
    // --- 暗黑模式狀態 ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 從 localStorage 讀取設定，或預設為系統偏好
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
            return JSON.parse(savedMode);
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 暗黑模式切換函式
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            localStorage.setItem('darkMode', JSON.stringify(newMode));
            return newMode;
        });
    }, []);

    // 認證與 Firebase 監聽
    useEffect(() => {
        if (!auth) return;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // 嘗試使用自訂 token 登入
                if (initialAuthToken) {
                    try {
                        await signInWithCustomToken(auth, initialAuthToken);
                        // onAuthStateChanged 會再次觸發，並拿到新的 user
                    } catch (e) {
                        console.error("Custom token sign-in failed, trying anonymous:", e);
                        try {
                            // 失敗則使用匿名登入
                            await signInAnonymously(auth);
                        } catch (eAnon) {
                            console.error("Anonymous sign-in failed:", eAnon);
                            setAuthReady(true);
                        }
                    }
                } else {
                    // 如果沒有 token，直接匿名登入
                    try {
                        await signInAnonymously(auth);
                    } catch (eAnon) {
                        console.error("Anonymous sign-in failed:", eAnon);
                        setAuthReady(true);
                    }
                }
            } else {
                setUserId(user.uid);
                setAuthReady(true);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 行程資料監聽
    useEffect(() => {
        if (!authReady || !userId) return;

        const q = query(
            collection(db, getTripCollectionPath()),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribeTrips = onSnapshot(q, (snapshot) => {
            setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching trips: ", error);
        });

        return () => unsubscribeTrips();
    }, [authReady, userId]);

    // 登出函式 (新增)
    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            // 登出後 Firebase 會自動嘗試重新登入 (因為 onAuthStateChanged 邏輯)
            // 介面會自動回到載入狀態直到新的登入完成
        } catch (error) {
            console.error("登出失敗:", error);
        }
    }, []);


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
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        // 主容器應用暗黑模式類別和顏色
        <div className={`font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-900 ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
            {currentView === 'dashboard' ? (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout} // 傳遞登出函式
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
