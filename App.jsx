import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft
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

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-slate-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`;
const buttonPrimaryClasses = `px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md flex items-center justify-center whitespace-nowrap`;
const buttonSecondaryClasses = `px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition duration-200 flex items-center justify-center whitespace-nowrap`;
const iconButtonClasses = "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition duration-200 text-gray-600 dark:text-gray-300";

// Firestore 路徑計算
const getTripCollectionPath = () => `/artifacts/${appId}/public/data/trips`;
const getTripDocumentPath = (tripId) => `artifacts/${appId}/public/data/trips/${tripId}`;
const getSubcollectionPath = (tripId, collectionName) => `${getTripDocumentPath(tripId)}/${collectionName}`;

// --- 通用 CRUD 函數 ---
const useSubcollectionData = (tripId, collectionName, orderField = 'createdAt') => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !tripId) return;

        const path = getSubcollectionPath(tripId, collectionName);
        const q = query(collection(db, path), orderBy(orderField, 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setData(items);
            setLoading(false);
        }, (err) => {
            console.error(`Error fetching ${collectionName}:`, err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, collectionName, orderField]);

    return { data, loading };
};

const addItem = async (tripId, collectionName, itemData) => {
    if (!db) return false;
    try {
        await addDoc(collection(db, getSubcollectionPath(tripId, collectionName)), {
            ...itemData,
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (e) {
        console.error(`Error adding ${collectionName}: `, e);
        return false;
    }
};

const updateItem = async (tripId, collectionName, itemId, updateData) => {
    if (!db) return false;
    try {
        await updateDoc(doc(db, getSubcollectionPath(tripId, collectionName), itemId), updateData);
        return true;
    } catch (e) {
        console.error(`Error updating ${collectionName}: `, e);
        return false;
    }
};

const deleteItem = async (tripId, collectionName, itemId) => {
    if (!db) return false;
    try {
        await deleteDoc(doc(db, getSubcollectionPath(tripId, collectionName), itemId));
        return true;
    } catch (e) {
        console.error(`Error deleting ${collectionName}: `, e);
        return false;
    }
};


// --- 功能分頁組件 ---

// 1. 行程規劃 (Itinerary)
const ItineraryContent = ({ tripId }) => {
    const { data: scheduleItems, loading } = useSubcollectionData(tripId, 'schedule', 'day');
    const [newItem, setNewItem] = useState({ day: 1, time: '09:00', title: '', location: '' });
    const [isAdding, setIsAdding] = useState(false);
    
    // 根據 Day 分組並按時間排序
    const groupedItems = useMemo(() => {
        const groups = {};
        scheduleItems.forEach(item => {
            const dayKey = `Day ${item.day || 1}`;
            if (!groups[dayKey]) groups[dayKey] = [];
            groups[dayKey].push(item);
        });
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
        });
        return groups;
    }, [scheduleItems]);

    const handleAdd = async () => {
        if (!newItem.title || !newItem.day) return;
        setIsAdding(true);
        await addItem(tripId, 'schedule', {
            day: Number(newItem.day),
            time: newItem.time,
            title: newItem.title,
            location: newItem.location || ''
        });
        setNewItem({ day: newItem.day, time: '09:00', title: '', location: '' });
        setIsAdding(false);
    };

    const handleDelete = (itemId) => {
        deleteItem(tripId, 'schedule', itemId);
    };

    return (
        <div className="space-y-6">
            {/* 新增項目表單 */}
            <div className={`${cardClasses} p-4 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800`}>
                <h3 className="font-semibold text-lg mb-3 text-indigo-800 dark:text-indigo-300 flex items-center"><Plus className="w-5 h-5 mr-2"/>新增行程項目</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                        type="number"
                        placeholder="第幾天 (e.g. 1)"
                        className={inputClasses}
                        min="1"
                        value={newItem.day}
                        onChange={(e) => setNewItem({ ...newItem, day: Number(e.target.value) })}
                    />
                    <input
                        type="time"
                        placeholder="時間 (e.g. 09:00)"
                        className={inputClasses}
                        value={newItem.time}
                        onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    />
                </div>
                <input
                    type="text"
                    placeholder="活動名稱 (必填)"
                    className={inputClasses + " mb-3"}
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="地點/備註"
                    className={inputClasses + " mb-3"}
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                />
                <button onClick={handleAdd} className={buttonPrimaryClasses + " w-full"} disabled={isAdding || !newItem.title}>
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-1" />}
                    儲存項目
                </button>
            </div>

            {/* 行程列表 */}
            {loading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : Object.keys(groupedItems).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">尚未有任何行程項目。開始規劃你的旅程吧！</p>
            ) : (
                Object.keys(groupedItems).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0])).map(dayKey => (
                    <div key={dayKey} className={`${cardClasses} p-4`}>
                        <h3 className="text-xl font-bold mb-4 text-teal-600 dark:text-teal-400 border-b dark:border-slate-700 pb-2">{dayKey}</h3>
                        <div className="space-y-4">
                            {groupedItems[dayKey].map((item, index) => (
                                <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600 transition-all hover:shadow-md">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />{item.time}
                                        </p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate mb-1">{item.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center truncate">
                                            <MapPin className="w-4 h-4 mr-1 text-red-500" />{item.location || '無地點/備註'}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="ml-4 text-red-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full transition duration-150">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// 2. 預算規劃 (Budget)
const BudgetContent = ({ tripId }) => {
    const { data: budgetItems, loading } = useSubcollectionData(tripId, 'budget', 'createdAt');
    const [newItem, setNewItem] = useState({ category: '食物', amount: '', notes: '' });
    const [isAdding, setIsAdding] = useState(false);
    const categories = ['食物', '交通', '住宿', '景點門票', '購物', '雜項'];
    const currency = 'NTD'; 

    const handleAdd = async () => {
        if (!newItem.amount || isNaN(Number(newItem.amount)) || Number(newItem.amount) <= 0) return;
        setIsAdding(true);
        await addItem(tripId, 'budget', {
            ...newItem,
            amount: Number(newItem.amount),
            currency,
        });
        setNewItem({ category: '食物', amount: '', notes: '' });
        setIsAdding(false);
    };

    const handleDelete = (itemId) => {
        deleteItem(tripId, 'budget', itemId);
    };

    const totalSpent = useMemo(() => {
        return budgetItems.reduce((sum, item) => sum + item.amount, 0);
    }, [budgetItems]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-xl shadow-md border border-indigo-300 dark:border-indigo-800">
                <span className="font-semibold text-lg text-indigo-800 dark:text-indigo-300">總支出:</span>
                <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">
                    {currency} {totalSpent.toLocaleString()}
                </span>
            </div>

            {/* 新增支出表單 */}
            <div className={`${cardClasses} p-4 bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800`}>
                <h3 className="font-semibold text-lg mb-3 text-orange-800 dark:text-orange-300 flex items-center"><Plus className="w-5 h-5 mr-2"/>記錄新支出</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <select
                        className={inputClasses}
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input
                        type="number"
                        placeholder="金額 (e.g. 500)"
                        className={inputClasses}
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        min="0.01"
                        step="0.01"
                    />
                </div>
                <input
                    type="text"
                    placeholder="備註/項目說明"
                    className={inputClasses + " mb-3"}
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
                <button onClick={handleAdd} className={buttonPrimaryClasses + " w-full bg-orange-600 hover:bg-orange-700"} disabled={isAdding || !newItem.amount || isNaN(Number(newItem.amount))}>
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Calculator className="w-5 h-5 mr-1" />}
                    新增支出
                </button>
            </div>

            {/* 支出列表 */}
            {loading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : budgetItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">尚未記錄任何支出。</p>
            ) : (
                <div className="space-y-2">
                    {budgetItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200">{item.category}</span>
                                <p className="font-medium text-gray-800 dark:text-gray-100 mt-1 truncate">{item.notes}</p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-red-600 mr-4 whitespace-nowrap">
                                    {currency} {item.amount.toLocaleString()}
                                </span>
                                <button onClick={() => handleDelete(item.id)} className="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full transition duration-150">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 3. 筆記與待辦 (Notes/Todo)
const NotesTodoContent = ({ tripId }) => {
    const { data: noteItems, loading: loadingNotes } = useSubcollectionData(tripId, 'notes', 'createdAt');
    const { data: todoItems, loading: loadingTodos } = useSubcollectionData(tripId, 'todos', 'createdAt');
    
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newTask, setNewTask] = useState('');

    // --- Note Logic ---
    const handleAddNote = async () => {
        if (!newNoteTitle.trim()) return;
        await addItem(tripId, 'notes', {
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
        });
        setNewNoteTitle('');
        setNewNoteContent('');
    };
    const handleDeleteNote = (itemId) => deleteItem(tripId, 'notes', itemId);

    // --- Todo Logic ---
    const handleAddTodo = async () => {
        if (!newTask.trim()) return;
        await addItem(tripId, 'todos', {
            task: newTask.trim(),
            completed: false,
        });
        setNewTask('');
    };

    const handleToggleTodo = (item) => {
        updateItem(tripId, 'todos', item.id, { completed: !item.completed });
    };

    const handleDeleteTodo = (itemId) => deleteItem(tripId, 'todos', itemId);

    const sortedTodos = useMemo(() => {
        return [...todoItems].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        });
    }, [todoItems]);


    return (
        <div className="space-y-6">
            
            {/* 待辦事項區塊 */}
            <div className={`${cardClasses} p-4 bg-teal-50 dark:bg-teal-900/50 border-teal-200 dark:border-teal-800`}>
                <h3 className="font-semibold text-xl mb-3 text-teal-800 dark:text-teal-300 flex items-center"><ListTodo className="w-6 h-6 mr-2"/>待辦清單</h3>
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="新增任務 (e.g. 預訂飯店)"
                        className={inputClasses + " flex-grow"}
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    />
                    <button onClick={handleAddTodo} className={`${buttonPrimaryClasses} bg-teal-600 hover:bg-teal-700`} disabled={!newTask.trim()}>
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                
                {loadingTodos ? (
                    <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-teal-500" /></div>
                ) : sortedTodos.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">目前沒有待辦事項。</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {sortedTodos.map(item => (
                            <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl shadow-sm border transition-all ${item.completed ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 opacity-80' : 'bg-white dark:bg-slate-700 border-gray-100 dark:border-slate-600 hover:shadow-md'}`}>
                                <div className="flex items-center flex-1 min-w-0">
                                    <button
                                        onClick={() => handleToggleTodo(item)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600'}`}
                                    >
                                        {item.completed && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                    <span className={`text-base flex-1 min-w-0 truncate dark:text-gray-100 ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800'}`}>
                                        {item.task}
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteTodo(item.id)} className="ml-4 text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full transition duration-150">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 筆記區塊 */}
            <div className={`${cardClasses} p-4 bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800`}>
                <h3 className="font-semibold text-xl mb-3 text-blue-800 dark:text-blue-300 flex items-center"><NotebookPen className="w-6 h-6 mr-2"/>旅遊筆記</h3>
                <input
                    type="text"
                    placeholder="標題 (必填)"
                    className={inputClasses + " mb-3"}
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                />
                <textarea
                    placeholder="筆記內容..."
                    className={inputClasses + " mb-3 min-h-[100px]"}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                />
                <button onClick={handleAddNote} className={buttonPrimaryClasses + " w-full bg-blue-600 hover:bg-blue-700"} disabled={!newNoteTitle.trim()}>
                    <Save className="w-5 h-5 mr-1" />
                    儲存筆記
                </button>
            </div>

            {/* 筆記列表 */}
            {loadingNotes ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : noteItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">目前沒有任何筆記。</p>
            ) : (
                <div className="space-y-3">
                    {noteItems.map(item => (
                        <div key={item.id} className="p-4 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-gray-100 dark:border-slate-600 transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.title}</h4>
                                <button onClick={() => handleDeleteNote(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full transition duration-150">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.content}</p>
                            <span className="block text-right text-xs text-gray-400 mt-2">
                                {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : '最近更新'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 4. 成員與協作 (Members)
const MembersContent = ({ tripId, userId }) => {
    return (
        <div className="space-y-6">
            <div className={`${cardClasses} p-6 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800`}>
                <h3 className="text-xl font-bold mb-3 text-indigo-800 dark:text-indigo-300 flex items-center"><Users className="w-6 h-6 mr-2"/>協作說明</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    此行程資料存放於公開的 FireStore 路徑中。任何擁有此應用程式連結並登入的用戶，都可以查看和編輯此行程的所有資料。
                </p>

                <div className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-600">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">您的當前用戶 ID (協作識別碼):</p>
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 break-all">{userId || 'Loading...'}</span>
                </div>
            </div>

            <div className={cardClasses}>
                <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-100 mb-3">當前成員</h3>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <Users className="w-6 h-6 mr-3 text-indigo-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">您 ({userId ? userId.substring(0, 8) + '...' : 'Guest'})</span>
                </div>
            </div>
        </div>
    );
};

// 5. 地點與地圖 (Location)
const LocationContent = ({ tripId }) => {
    return (
        <div className="space-y-6">
            <div className={`${cardClasses} p-8 text-center h-96 flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600`}>
                <Map className="w-16 h-16 text-indigo-400 dark:text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">地點規劃與地圖</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    此功能用於顯示您在「行程規劃」中輸入的地點在地圖上的位置。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span className="font-bold text-red-500">提示:</span> 請在行程頁面填寫詳細地點名稱，以便未來集成地圖服務。
                </p>
            </div>
        </div>
    );
};


// --- TripDetail 主組件 ---
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('itinerary');
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificationCounts, setNotificationCounts] = useState({
        itinerary: 0, members: 0, budget: 0, notes: 0, location: 0,
    }); // 實時更新通知點數

    // 獲取主行程資料
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;
        const tripDocRef = doc(db, getTripDocumentPath(tripId));
        
        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTripData({ id: docSnap.id, ...docSnap.data() });
            } else {
                setTripData(null);
                console.log("No such trip document!");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, userId, tripId]);


    const tabClasses = (isActive) => 
        `flex-1 py-2 px-3 text-sm font-medium rounded-full transition duration-300 ${
            isActive 
                ? `bg-indigo-600 text-white shadow-lg` 
                : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700`
        }`;

    const renderContent = useCallback(() => {
        if (!tripData) return <p className="text-center text-gray-500 dark:text-gray-400">找不到行程資料。</p>;

        switch (activeTab) {
            case 'itinerary':
                return <ItineraryContent tripId={tripId} />;
            case 'members':
                return <MembersContent tripId={tripId} userId={userId} />;
            case 'budget':
                return <BudgetContent tripId={tripId} />;
            case 'notes':
                return <NotesTodoContent tripId={tripId} />;
            case 'location':
                return <LocationContent tripId={tripId} />;
            default:
                return <p className="p-4 text-gray-500 dark:text-gray-400">選擇一個標籤來開始規劃。</p>;
        }
    }, [activeTab, tripId, userId, tripData]);

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b dark:border-slate-700 pb-3">
                <button onClick={onBack} className={`${buttonSecondaryClasses} h-10 w-auto`} aria-label="返回">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    返回
                </button>
                <div className="text-center flex-1 min-w-0 mx-2">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 truncate">{tripData?.name || '行程詳情'}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {tripData?.destination || '未指定目的地'} | {tripData?.startDate} - {tripData?.endDate}
                    </p>
                </div>
                <Briefcase className="w-6 h-6 text-indigo-500" />
            </div>

            {/* 內容分頁導航 */}
            <div className="flex justify-between space-x-2 overflow-x-auto pb-2 scrollbar-hide bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md sticky top-0 z-10 border dark:border-slate-700">
                {[
                    { id: 'itinerary', name: '行程', icon: CalendarDays },
                    { id: 'notes', name: '筆記&待辦', icon: AlignLeft },
                    { id: 'budget', name: '預算', icon: PiggyBank },
                    { id: 'location', name: '地點', icon: MapPin },
                    { id: 'members', name: '成員', icon: Users },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                        style={{ flexShrink: 0 }}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 mr-1`} />
                            <span>{tab.name}</span>
                            {notificationCounts[tab.id] > 0 && (
                                <Bell className="w-4 h-4 ml-1 text-yellow-300 fill-yellow-300" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            {renderContent()}
        </div>
    );
};


// --- Dashboard 主組件 ---
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode }) => {
    const [newTripName, setNewTripName] = useState('');
    const [newTripDestination, setNewTripDestination] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTrip = async (e) => {
        e.preventDefault();
        if (!newTripName.trim() || !newTripDestination.trim() || !authReady || !userId) return;

        setIsAdding(true);
        try {
            const newTrip = {
                name: newTripName.trim(),
                destination: newTripDestination.trim(),
                startDate: newTripStartDate || '待定',
                endDate: newTripEndDate || '待定',
                ownerId: userId,
                members: [{ id: userId, name: `User-${userId.substring(0, 4)}` }],
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, getTripCollectionPath()), newTrip);
            setNewTripName('');
            setNewTripDestination('');
            setNewTripStartDate('');
            setNewTripEndDate('');
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsAdding(false);
        }
    };
    
    // 模擬登出
    const handleLogout = () => {
        if (auth) {
            auth.signOut().then(() => {
                console.log("用戶已登出 (模擬)");
                // 由於 Canvas 環境會自動重新認證，這裡只做控制台輸出
            }).catch((error) => {
                console.error("登出失敗:", error);
            });
        }
    };

    // 模擬通知點擊
    const handleNotificationClick = () => {
        console.log("開啟通知面板 (模擬)");
        // 實際應用中可以在此處彈出通知 Modal
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            
            {/* 頂部導航/功能列 (新介面設計) */}
            <header className="flex items-center justify-between py-2 border-b dark:border-slate-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">旅遊規劃中心</h1>
                
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* 提醒/通知按鈕 */}
                    <button onClick={handleNotificationClick} className={iconButtonClasses} aria-label="通知">
                        <Bell className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
                    </button>

                    {/* 暗黑模式切換 */}
                    <button onClick={toggleDarkMode} className={iconButtonClasses} aria-label="切換暗黑模式">
                        {isDarkMode ? (
                            <Sun className="w-6 h-6 text-orange-400" />
                        ) : (
                            <Moon className="w-6 h-6 text-indigo-600" />
                        )}
                    </button>

                    {/* 登出按鈕 */}
                    <button onClick={handleLogout} className={iconButtonClasses} aria-label="登出">
                        <LogOut className="w-6 h-6 text-red-500" />
                    </button>
                    
                    {/* Google 頭像/用戶頭像 */}
                    <div className="relative group cursor-pointer" onClick={() => console.log("開啟用戶選單 (模擬)")}>
                        <img 
                            src="https://placehold.co/40x40/4F46E5/FFFFFF?text=G" // 模擬 Google 帳號頭像
                            alt="用戶頭像"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 dark:ring-indigo-400 transition duration-300 group-hover:ring-offset-2"
                        />
                    </div>
                </div>
            </header>

            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-indigo-500 pl-3">所有行程</h2>
            
            {/* 新增行程卡片 */}
            <div className={`${cardClasses} p-6 bg-indigo-50 dark:bg-slate-700 border-indigo-300 dark:border-slate-600`}>
                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center"><Plus className="w-5 h-5 mr-2"/>建立新行程</h3>
                <form onSubmit={handleAddTrip} className="space-y-3">
                    <input
                        type="text"
                        placeholder="行程名稱 (必填)"
                        value={newTripName}
                        onChange={(e) => setNewTripName(e.target.value)}
                        className={inputClasses}
                        disabled={!authReady}
                        required
                    />
                    <input
                        type="text"
                        placeholder="目的地 (必填)"
                        value={newTripDestination}
                        onChange={(e) => setNewTripDestination(e.target.value)}
                        className={inputClasses}
                        disabled={!authReady}
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            placeholder="開始日期"
                            className={inputClasses}
                            value={newTripStartDate}
                            onChange={(e) => setNewTripStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            placeholder="結束日期"
                            className={inputClasses}
                            value={newTripEndDate}
                            onChange={(e) => setNewTripEndDate(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className={buttonPrimaryClasses + " w-full"}
                        disabled={isAdding || !newTripName.trim() || !newTripDestination.trim() || !authReady}
                    >
                        {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {isAdding ? '建立中...' : '儲存並開始規劃'}
                    </button>
                </form>
            </div>

            {/* 行程列表 */}
            {trips.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                    <Briefcase className="w-8 h-8 mx-auto text-indigo-400 mb-2"/>
                    <p className="text-gray-500 dark:text-gray-400">目前沒有公開行程。請建立一個新行程來開始規劃吧！</p>
                    <p className="text-xs text-gray-400 mt-1">您的 ID: {userId}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {trips.map(trip => (
                        <div key={trip.id} className={`${cardClasses} hover:shadow-2xl hover:scale-[1.02] cursor-pointer`} onClick={() => onSelectTrip(trip.id)}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 truncate pr-2">{trip.name}</h3>
                                <ChevronLeft className="w-5 h-5 transform rotate-180 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-teal-500" />
                                {trip.destination}
                            </p>
                            <div className="mt-3 pt-3 border-t dark:border-slate-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className='flex items-center'>
                                    <CalendarDays className="w-4 h-4 mr-1"/> 
                                    {trip.startDate || '待定'} - {trip.endDate || '待定'}
                                </span>
                                <span className='text-xs text-gray-400 dark:text-gray-500'>
                                    {trip.members ? trip.members.length : 1} 位成員
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- App 根組件 ---
const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);

    // 1. 暗黑模式切換邏輯
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newState = !prev;
            if (newState) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newState;
        });
    }, []);

    // 2. Firebase 認證與資料監聽
    useEffect(() => {
        const initializeAuthAndFetchData = async () => {
            if (!auth) return;

            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }

            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // Fallback to anonymous ID if sign in fails (shouldn't happen with token/anonymous)
                    setUserId(crypto.randomUUID()); 
                }
                setAuthReady(true);
            });

            return () => unsubscribeAuth();
        };

        initializeAuthAndFetchData();
    }, []);

    // 3. 取得所有行程資料
    useEffect(() => {
        if (!authReady) return; // Wait for authentication

        const tripsColRef = collection(db, getTripCollectionPath());
        // Ordering by 'createdAt' requires an index, which is usually fine for public collections.
        const q = query(tripsColRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toMillis() || Date.now(), // 確保 createdAt 總是可排序的數字
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady]);

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
