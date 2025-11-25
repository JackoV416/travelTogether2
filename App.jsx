import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc,
    query, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import {
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus,
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays,
    Calculator, Clock, Check, Edit, User, Globe
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
// 這裡使用的是 Canvas 環境提供的全局變數
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Tailwind CSS 輔助類別 (新的 Threads 風格)
const primaryColor = 'indigo-600';
const accentColor = 'teal-500';

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100";
const inputClasses = `w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${primaryColor} focus:border-transparent`;
const buttonPrimaryClasses = `flex items-center justify-center bg-${primaryColor} text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md whitespace-nowrap`;
const buttonSecondaryClasses = "flex items-center justify-center bg-gray-200 text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-300 transition duration-200 whitespace-nowrap";
const tabClasses = (isActive) =>
    `flex-1 py-3 px-3 text-sm font-medium transition-all duration-300 rounded-t-xl
    ${isActive
        ? `bg-indigo-600 text-white shadow-lg`
        : 'text-indigo-600 hover:bg-indigo-100'
    }`;


// --- 1. Firebase Hook 處理認證和初始化 ---
const useFirebase = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing.");
            setIsAuthReady(true); // 即使配置缺失，也要標記為準備好，防止無限加載
            return;
        }

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    } else {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (error) {
                    console.error("Firebase Auth Error, falling back to anonymous ID:", error);
                    // 認證失敗時使用隨機 ID，但這會導致資料無法寫入
                    setUserId(crypto.randomUUID());
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    return { db, auth, userId, isAuthReady };
};


// --- 2. 資料操作輔助函數 ---
const getCollectionPath = (tripId, collectionName) =>
    `artifacts/${appId}/public/data/trips/${tripId}/${collectionName}`;

// 通用新增函數
const addTripItem = async (db, tripId, collectionName, itemData) => {
    if (!db) return false;
    const path = getCollectionPath(tripId, collectionName);
    try {
        await addDoc(collection(db, path), {
            ...itemData,
            createdAt: serverTimestamp(), // 使用服務器時間戳進行排序
        });
        return true;
    } catch (e) {
        console.error(`Error adding ${collectionName} item: `, e);
        return false;
    }
};

// 通用更新函數
const updateTripItem = async (db, tripId, collectionName, itemId, updateData) => {
    if (!db) return false;
    const path = getCollectionPath(tripId, collectionName);
    try {
        const itemRef = doc(db, path, itemId);
        await updateDoc(itemRef, updateData);
        return true;
    } catch (e) {
        console.error(`Error updating ${collectionName} item: `, e);
        return false;
    }
};

// 通用刪除函數
const deleteTripItem = async (db, tripId, collectionName, itemId) => {
    if (!db) return false;
    const path = getCollectionPath(tripId, collectionName);
    try {
        const itemRef = doc(db, path, itemId);
        await deleteDoc(itemRef);
        return true;
    } catch (e) {
        console.error(`Error deleting ${collectionName} item: `, e);
        return false;
    }
};

// --- 3. 專門用於行程子集合的 Hook ---
const useTripSubcollectionData = (db, tripId, collectionName, customOrder = 'createdAt') => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !tripId) {
            setData([]);
            setIsLoading(false);
            return;
        }

        const path = getCollectionPath(tripId, collectionName);
        const dataCollectionRef = collection(db, path);
        // 使用自定義排序或時間戳
        const q = query(dataCollectionRef, orderBy(customOrder, 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setData(items);
            setIsLoading(false);
        }, (err) => {
            console.error(`Error fetching ${collectionName}:`, err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, tripId, collectionName, customOrder]);

    return { data, isLoading };
};


// --- 4. 內容分頁組件 ---

// 行程規劃內容
const ScheduleContent = ({ tripId, db }) => {
    const { data: scheduleItems, isLoading } = useTripSubcollectionData(db, tripId, 'schedule', 'day');
    const [newItem, setNewItem] = useState({ day: 1, time: '09:00', title: '', location: '' });
    const [isAdding, setIsAdding] = useState(false);
    
    // 根據 Day 分組
    const groupedItems = useMemo(() => {
        const groups = {};
        scheduleItems.forEach(item => {
            const dayKey = `Day ${item.day}`;
            if (!groups[dayKey]) groups[dayKey] = [];
            groups[dayKey].push(item);
        });
        // 對每個 Day 內部的項目按時間排序
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
        });
        return groups;
    }, [scheduleItems]);

    const handleAdd = async () => {
        if (!newItem.title || !newItem.day) return;
        setIsAdding(true);
        await addTripItem(db, tripId, 'schedule', {
            day: Number(newItem.day),
            time: newItem.time,
            title: newItem.title,
            location: newItem.location
        });
        setNewItem({ day: 1, time: '09:00', title: '', location: '' });
        setIsAdding(false);
    };

    const handleDelete = (itemId) => {
        deleteTripItem(db, tripId, 'schedule', itemId);
    };

    const maxDay = scheduleItems.reduce((max, item) => Math.max(max, item.day || 1), 1);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><CalendarDays className="w-6 h-6 mr-2 text-indigo-500" />行程規劃</h2>
            
            {/* 新增項目表單 */}
            <div className={`${cardClasses} p-4 bg-indigo-50 border-indigo-200`}>
                <h3 className="font-semibold text-lg mb-3 text-indigo-800">新增行程項目</h3>
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
                <button onClick={handleAdd} className={buttonPrimaryClasses} disabled={isAdding || !newItem.title}>
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-1" />}
                    新增項目
                </button>
            </div>

            {/* 行程列表 */}
            {isLoading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : Object.keys(groupedItems).length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚未有任何行程項目。開始規劃你的旅程吧！</p>
            ) : (
                Object.keys(groupedItems).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0])).map(dayKey => (
                    <div key={dayKey} className={`${cardClasses} p-4`}>
                        <h3 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">{dayKey}</h3>
                        <div className="space-y-4">
                            {groupedItems[dayKey].map((item, index) => (
                                <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 font-mono mb-1 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />{item.time}
                                        </p>
                                        <p className="font-semibold text-gray-800 truncate mb-1">{item.title}</p>
                                        <p className="text-sm text-gray-600 flex items-center truncate">
                                            <MapPin className="w-4 h-4 mr-1 text-teal-500" />{item.location || '無地點/備註'}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full transition duration-150">
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

// 待辦事項內容
const TodoContent = ({ tripId, db }) => {
    const { data: todoItems, isLoading } = useTripSubcollectionData(db, tripId, 'todos', 'createdAt');
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!newTask.trim()) return;
        setIsAdding(true);
        await addTripItem(db, tripId, 'todos', {
            task: newTask.trim(),
            completed: false,
        });
        setNewTask('');
        setIsAdding(false);
    };

    const handleToggle = (item) => {
        updateTripItem(db, tripId, 'todos', item.id, { completed: !item.completed });
    };

    const handleDelete = (itemId) => {
        deleteTripItem(db, tripId, 'todos', itemId);
    };

    const sortedTodos = useMemo(() => {
        return [...todoItems].sort((a, b) => {
            // 未完成的在前，已完成的在後
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 保持原本的創建順序
            return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        });
    }, [todoItems]);


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><ListTodo className="w-6 h-6 mr-2 text-indigo-500" />待辦事項</h2>

            {/* 新增項目表單 */}
            <div className={`${cardClasses} p-4 bg-teal-50 border-teal-200`}>
                <h3 className="font-semibold text-lg mb-3 text-teal-800">新增任務</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="e.g. 預訂機票"
                        className={inputClasses + " flex-grow"}
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button onClick={handleAdd} className={`${buttonPrimaryClasses} bg-teal-600 hover:bg-teal-700`} disabled={isAdding || !newTask.trim()}>
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 列表 */}
            {isLoading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : sortedTodos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">目前沒有待辦事項。盡情享受吧！</p>
            ) : (
                <div className="space-y-2">
                    {sortedTodos.map(item => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl shadow-sm border transition-all ${item.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                            <div className="flex items-center flex-1 min-w-0">
                                <button
                                    onClick={() => handleToggle(item)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:bg-gray-100'}`}
                                >
                                    {item.completed && <Check className="w-4 h-4 text-white" />}
                                </button>
                                <span className={`text-gray-800 text-base flex-1 min-w-0 truncate ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                    {item.task}
                                </span>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="ml-4 text-red-400 hover:text-red-600 p-1 rounded-full transition duration-150">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 預算規劃內容
const BudgetContent = ({ tripId, db }) => {
    const { data: budgetItems, isLoading } = useTripSubcollectionData(db, tripId, 'budget', 'createdAt');
    const [newItem, setNewItem] = useState({ category: '食物', amount: '', notes: '' });
    const [isAdding, setIsAdding] = useState(false);
    const categories = ['食物', '交通', '住宿', '景點', '購物', '雜項'];
    const currency = 'TWD'; // 假設預設幣別為新台幣

    const handleAdd = async () => {
        if (!newItem.amount || isNaN(Number(newItem.amount))) return;
        setIsAdding(true);
        await addTripItem(db, tripId, 'budget', {
            ...newItem,
            amount: Number(newItem.amount),
            currency,
        });
        setNewItem({ category: '食物', amount: '', notes: '' });
        setIsAdding(false);
    };

    const handleDelete = (itemId) => {
        deleteTripItem(db, tripId, 'budget', itemId);
    };

    const totalSpent = useMemo(() => {
        return budgetItems.reduce((sum, item) => sum + item.amount, 0);
    }, [budgetItems]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><PiggyBank className="w-6 h-6 mr-2 text-indigo-500" />預算規劃 ({currency})</h2>

            <div className="flex justify-between items-center bg-indigo-100 p-4 rounded-xl shadow-md border border-indigo-300">
                <span className="font-semibold text-lg text-indigo-800">總支出:</span>
                <span className="text-2xl font-extrabold text-indigo-700">
                    {currency} {totalSpent.toLocaleString()}
                </span>
            </div>

            {/* 新增項目表單 */}
            <div className={`${cardClasses} p-4 bg-orange-50 border-orange-200`}>
                <h3 className="font-semibold text-lg mb-3 text-orange-800">新增支出</h3>
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
                    />
                </div>
                <input
                    type="text"
                    placeholder="備註/項目說明"
                    className={inputClasses + " mb-3"}
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
                <button onClick={handleAdd} className={`${buttonPrimaryClasses} bg-orange-600 hover:bg-orange-700`} disabled={isAdding || !newItem.amount || isNaN(Number(newItem.amount))}>
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-1" />}
                    新增支出
                </button>
            </div>

            {/* 列表 */}
            {isLoading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : budgetItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚未記錄任何支出。</p>
            ) : (
                <div className="space-y-2">
                    {budgetItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{item.category}</span>
                                <p className="font-medium text-gray-800 mt-1">{item.notes}</p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-red-600 mr-4 whitespace-nowrap">
                                    {currency} {item.amount.toLocaleString()}
                                </span>
                                <button onClick={() => handleDelete(item.id)} className="ml-2 text-red-400 hover:text-red-600 p-1 rounded-full transition duration-150">
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

// 筆記內容
const NotesContent = ({ tripId, db }) => {
    const { data: noteItems, isLoading } = useTripSubcollectionData(db, tripId, 'notes', 'createdAt');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        setIsAdding(true);
        await addTripItem(db, tripId, 'notes', {
            title: newTitle.trim(),
            content: newContent.trim(),
        });
        setNewTitle('');
        setNewContent('');
        setIsAdding(false);
    };

    const handleDelete = (itemId) => {
        deleteTripItem(db, tripId, 'notes', itemId);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><NotebookPen className="w-6 h-6 mr-2 text-indigo-500" />旅遊筆記</h2>

            {/* 新增筆記表單 */}
            <div className={`${cardClasses} p-4 bg-blue-50 border-blue-200`}>
                <h3 className="font-semibold text-lg mb-3 text-blue-800">新增筆記</h3>
                <input
                    type="text"
                    placeholder="標題 (必填)"
                    className={inputClasses + " mb-3"}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                    placeholder="筆記內容..."
                    className={inputClasses + " mb-3 min-h-[100px]"}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                />
                <button onClick={handleAdd} className={`${buttonPrimaryClasses} bg-blue-600 hover:bg-blue-700`} disabled={isAdding || !newTitle.trim()}>
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-1" />}
                    儲存筆記
                </button>
            </div>

            {/* 列表 */}
            {isLoading ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : noteItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">目前沒有任何筆記。</p>
            ) : (
                <div className="space-y-3">
                    {noteItems.map(item => (
                        <div key={item.id} className="p-4 bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-1 rounded-full transition duration-150">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
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

// 成員和協作內容
const MembersContent = ({ tripId, userId }) => {
    // 由於我們沒有一個單獨的 members collection，這裡只是顯示用戶 ID 以進行共享
    // 實際的 trip members 應該從 main trip document 中獲取，但我們目前只顯示當前用戶 ID
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><Users className="w-6 h-6 mr-2 text-indigo-500" />成員與協作</h2>

            <div className={`${cardClasses} p-4 bg-indigo-50 border-indigo-200`}>
                <p className="text-indigo-800 font-semibold mb-2">共享此行程：</p>
                <p className="text-sm text-gray-600 mb-4">您可以將此應用程式的連結分享給其他用戶。由於行程資料是公開的 (`public/data/trips/{tripId}`), 任何已認證的用戶都能查看和編輯。</p>

                <div className="bg-white p-3 rounded-xl border border-dashed border-indigo-300">
                    <p className="text-xs font-mono text-gray-600 mb-1">您的用戶 ID (分享給夥伴):</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-indigo-700 break-all">{userId || 'Loading...'}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                    <span className="font-bold text-red-500">注意:</span> 由於是協作應用程式，任何擁有此頁面連結並登入的用戶都可以編輯行程。
                </p>
            </div>

            <div className={cardClasses}>
                <h3 className="font-semibold text-lg text-gray-800 mb-3">當前成員 (僅顯示您):</h3>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <User className="w-6 h-6 mr-3 text-indigo-500" />
                    <span className="font-medium text-gray-700">您 ({userId ? userId.substring(0, 8) + '...' : 'Guest'})</span>
                </div>
            </div>
        </div>
    );
};

// 地點內容
const LocationContent = ({ tripId }) => {
    // 這裡只是一個佔位符，因為完整的地圖集成需要額外的庫
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><MapPin className="w-6 h-6 mr-2 text-indigo-500" />地點與地圖 (規劃中)</h2>

            <div className={`${cardClasses} p-4 text-center h-64 flex flex-col justify-center items-center bg-gray-50 border-gray-200`}>
                <Globe className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">地圖功能佔位符</h3>
                <p className="text-gray-600">將行程中的地點標註在地圖上的功能仍在開發中。</p>
                <p className="text-sm text-gray-500 mt-2">請在行程 (Schedule) 頁面新增帶有地點的項目。</p>
            </div>
        </div>
    );
};


// --- 5. TripDetail 主組件 ---
const TripDetail = ({ tripId, onBack, db, userId }) => {
    const [activeTab, setActiveTab] = useState('schedule');
    const [trip, setTrip] = useState(null);
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    const [notificationCounts, setNotificationCounts] = useState({
        schedule: 0, members: 0, todo: 0, budget: 0, notes: 0, location: 0
    });

    // 獲取主行程資料
    useEffect(() => {
        if (!db || !tripId) return;

        const tripRef = doc(db, `artifacts/${appId}/public/data/trips`, tripId);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                setTrip(null);
                console.error("Trip not found.");
            }
            setIsLoadingTrip(false);
        }, (err) => {
            console.error("Error fetching trip details:", err);
            setIsLoadingTrip(false);
        });

        return () => unsubscribe();
    }, [db, tripId]);


    // 根據 activeTab 渲染內容
    const renderContent = useCallback(() => {
        if (isLoadingTrip || !trip) {
            return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>;
        }

        switch (activeTab) {
            case 'schedule':
                return <ScheduleContent tripId={tripId} db={db} />;
            case 'members':
                return <MembersContent tripId={tripId} userId={userId} />;
            case 'todo':
                return <TodoContent tripId={tripId} db={db} />;
            case 'budget':
                return <BudgetContent tripId={tripId} db={db} />;
            case 'notes':
                return <NotesContent tripId={tripId} db={db} />;
            case 'location':
                return <LocationContent tripId={tripId} />;
            default:
                return <p className="p-4 text-gray-500">選擇一個標籤來開始規劃。</p>;
        }
    }, [activeTab, tripId, db, userId, isLoadingTrip, trip]);


    if (isLoadingTrip) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
    }

    if (!trip) {
        return <div className="p-8 text-center">行程不存在或已刪除。</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto">
                {/* 頂部標頭 */}
                <header className="sticky top-0 bg-white shadow-md p-4 flex items-center justify-between z-10 rounded-b-xl border-b">
                    <button onClick={onBack} className={buttonSecondaryClasses}>
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        返回
                    </button>
                    <div className="text-center flex-1 min-w-0 mx-2">
                        <h1 className="text-xl font-bold text-gray-900 truncate">{trip.name || '未命名行程'}</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {trip.destination || '未指定目的地'} | {trip.startDate} - {trip.endDate}
                        </p>
                    </div>
                    <Briefcase className="w-6 h-6 text-indigo-500" />
                </header>

                <div className="p-4">
                    {/* 導航標籤 */}
                    <div className="flex bg-white rounded-xl shadow-lg p-2 mb-6 sticky top-20 z-10 border border-gray-100">
                        {[
                            { id: 'schedule', name: '行程', icon: Bus },
                            { id: 'todo', name: '待辦', icon: ListTodo },
                            { id: 'budget', name: '預算', icon: PiggyBank },
                            { id: 'notes', name: '筆記', icon: NotebookPen },
                            { id: 'location', name: '地點', icon: MapPin },
                            { id: 'members', name: '成員', icon: Users },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={tabClasses(activeTab === tab.id)}
                            >
                                <div className="flex items-center justify-center whitespace-nowrap">
                                    <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600' : 'text-white'} `} />
                                    <span className="ml-1 hidden sm:inline">{tab.name}</span>
                                    {notificationCounts[tab.id] > 0 && (
                                        <Bell className="w-4 h-4 ml-1 text-yellow-300 animate-pulse fill-yellow-300" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 內容區塊 */}
                    <div className="pb-10">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 6. Dashboard 組件 (新增行程) ---
const Dashboard = ({ onSelectTrip, db, userId, isAuthReady }) => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTripName, setNewTripName] = useState('');
    const [newTripDestination, setNewTripDestination] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // 獲取所有公開行程
    useEffect(() => {
        if (!db || !isAuthReady) return;

        const tripPath = `artifacts/${appId}/public/data/trips`;
        const q = query(collection(db, tripPath), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = [];
            snapshot.forEach((doc) => {
                fetchedTrips.push({ id: doc.id, ...doc.data() });
            });
            setTrips(fetchedTrips);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching trips:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, isAuthReady]);

    const handleAddTrip = async () => {
        if (!newTripName || !newTripDestination) return;

        setIsAdding(true);
        const tripPath = `artifacts/${appId}/public/data/trips`;
        try {
            await addDoc(collection(db, tripPath), {
                name: newTripName,
                destination: newTripDestination,
                startDate: newTripStartDate,
                endDate: newTripEndDate,
                // 初始化成員列表
                members: [{ id: userId, name: `User-${userId ? userId.substring(0, 4) : 'Guest'}` }],
                createdAt: serverTimestamp(),
            });
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

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="text-center pt-8 pb-4 border-b border-indigo-200">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center">
                        <Home className="w-8 h-8 mr-3 text-indigo-600" />
                        旅行計畫中心
                    </h1>
                    <p className="text-gray-500 mt-1">協作式行程規劃與管理</p>
                    <p className="text-sm text-indigo-500 mt-2">您的用戶 ID: <span className="font-mono text-xs break-all">{userId}</span></p>
                </header>

                {/* 新增行程卡片 */}
                <div className={`${cardClasses} p-6 bg-white border-indigo-300`}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                        建立新行程
                    </h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="行程名稱 (e.g. 台北美食之旅)"
                            className={inputClasses}
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="目的地 (e.g. 台北)"
                            className={inputClasses}
                            value={newTripDestination}
                            onChange={(e) => setNewTripDestination(e.target.value)}
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

                        <button onClick={handleAddTrip} className={buttonPrimaryClasses + " w-full mt-3"} disabled={isAdding || !newTripName || !newTripDestination}>
                            {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                            建立行程
                        </button>
                    </div>
                </div>

                {/* 現有行程列表 */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                        所有公開行程
                    </h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <span className="ml-3 text-indigo-600">載入行程中...</span>
                        </div>
                    ) : trips.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 border rounded-xl bg-white">目前沒有行程。請建立一個新行程！</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trips.map(trip => (
                                <div
                                    key={trip.id}
                                    className={`${cardClasses} cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                                    onClick={() => onSelectTrip(trip.id)}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{trip.name}</h3>
                                    <p className="text-sm text-indigo-600 font-medium flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />{trip.destination}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <CalendarDays className="w-3 h-3 inline mr-1" />{trip.startDate} - {trip.endDate}
                                    </p>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">成員: {trip.members ? trip.members.length : 1} 人</span>
                                        <button className={`${buttonPrimaryClasses} text-xs h-8 px-3 py-1`}>
                                            查看詳情
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- 7. App 根組件 ---
const App = () => {
    const { db, auth, userId, isAuthReady } = useFirebase();
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'trip_detail'
    const [selectedTripId, setSelectedTripId] = useState(null);

    const handleSelectTrip = (tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('trip_detail');
    };

    const handleBackToDashboard = () => {
        setSelectedTripId(null);
        setCurrentView('dashboard');
    };

    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600">載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased bg-slate-50 min-h-screen">
            {currentView === 'dashboard' ? (
                <Dashboard
                    onSelectTrip={handleSelectTrip}
                    db={db}
                    userId={userId}
                    isAuthReady={isAuthReady}
                />
            ) : (
                <TripDetail
                    tripId={selectedTripId}
                    onBack={handleBackToDashboard}
                    db={db}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default App;
