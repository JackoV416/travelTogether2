import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, where, getDocs, Timestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Plane, DollarSign, Edit, Star, XCircle, Settings,
    Sun, Moon // 新增 Sun 和 Moon 圖示
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 初始化 Firebase 應用
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Tailwind CSS 輔助類別 (新的簡約風格，已加入 Dark Mode 響應)
const primaryColor = 'indigo-600';
const primaryBg = 'bg-indigo-600';
const accentColor = 'teal-500';

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md transition duration-300 border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl";
const inputClasses = "w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
const buttonPrimary = `px-4 py-2 font-semibold text-white ${primaryBg} rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 flex items-center justify-center`;
const buttonSecondary = "px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 flex items-center justify-center";
const tabClasses = (isActive) => 
    `flex-1 py-2 text-sm font-medium rounded-lg transition duration-200 ease-in-out flex items-center justify-center 
     ${isActive 
        ? `${primaryBg} text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900` 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

// Firebase 資料路徑輔助函數
const getPrivateCollectionPath = (userId, collectionName) => 
    `artifacts/${appId}/users/${userId}/${collectionName}`;
const getPublicCollectionPath = (collectionName) => 
    `artifacts/${appId}/public/data/${collectionName}`;

// --- 共用組件 ---

// 載入中狀態
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900">
        <Loader2 className={`w-8 h-8 text-${primaryColor} animate-spin`} />
        <p className="mt-3 text-gray-500 dark:text-gray-400">載入中...</p>
    </div>
);

// 訊息顯示框 (取代 alert/confirm)
const Modal = ({ title, message, isOpen, onClose, onConfirm, isConfirm = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${cardClasses} w-full max-w-sm`}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {isConfirm && (
                        <button onClick={onConfirm} className={`${buttonPrimary} !bg-red-500 hover:!bg-red-600`}>
                            確認
                        </button>
                    )}
                    <button onClick={onClose} className={buttonSecondary}>
                        {isConfirm ? '取消' : '關閉'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 行程細節子組件 (TripDetail Content) ---

// 1. 行程規劃 (Itinerary)
const ItineraryContent = ({ tripId, userId, tripData }) => {
    const itineraryQuery = useMemo(() => {
        if (!userId) return null;
        const path = getPublicCollectionPath('itinerary_items');
        return query(collection(db, path), where('tripId', '==', tripId), orderBy('dateTime'));
    }, [tripId, userId]);

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!itineraryQuery) return;
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(itineraryQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching itinerary items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [itineraryQuery]);

    if (isLoading) return <LoadingSpinner />;
    if (items.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400 p-8">尚未規劃行程細節。</p>;

    // 按日期分組
    const groupedByDate = items.reduce((acc, item) => {
        const dateKey = item.dateTime ? new Date(item.dateTime.toDate()).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' }) : '未定日期';
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, activities]) => (
                <div key={date} className={cardClasses}>
                    <h4 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-4">{date}</h4>
                    <ul className="space-y-4">
                        {activities.sort((a, b) => (a.dateTime && b.dateTime) ? a.dateTime.toDate() - b.dateTime.toDate() : 0).map((activity, index) => (
                            <li key={index} className="flex items-start space-x-3 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                <Clock className="w-5 h-5 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{activity.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.dateTime ? new Date(activity.dateTime.toDate()).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '時間未定'}
                                        {' - '}
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">{activity.type || '活動'}</span>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

// 2. 代辦事項 (To-Do)
const TodoContent = ({ tripId, userId }) => {
    const todoQuery = useMemo(() => {
        if (!userId) return null;
        const path = getPrivateCollectionPath(userId, 'todo_items');
        return query(collection(db, path), where('tripId', '==', tripId), orderBy('createdAt'));
    }, [tripId, userId]);

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!todoQuery) return;
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(todoQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching todo items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [todoQuery]);

    const toggleDone = useCallback(async (item) => {
        if (!userId) return;
        const itemRef = doc(db, getPrivateCollectionPath(userId, 'todo_items'), item.id);
        try {
            await updateDoc(itemRef, {
                done: !item.done
            });
        } catch (error) {
            console.error("Error toggling todo status: ", error);
        }
    }, [userId]);

    const deleteItem = useCallback(async (itemId) => {
        if (!userId) return;
        const itemRef = doc(db, getPrivateCollectionPath(userId, 'todo_items'), itemId);
        try {
            await deleteDoc(itemRef);
        } catch (error) {
            console.error("Error deleting todo item: ", error);
        }
    }, [userId]);

    if (isLoading) return <LoadingSpinner />;
    if (items.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400 p-8">沒有代辦事項。</p>;

    const pendingItems = items.filter(item => !item.done);
    const completedItems = items.filter(item => item.done);

    return (
        <div className="space-y-6">
            {/* 待完成事項 */}
            <div className={cardClasses}>
                <h4 className="text-lg font-bold text-red-500 dark:text-red-400 mb-4">待辦 ({pendingItems.length})</h4>
                <ul className="space-y-3">
                    {pendingItems.map(item => (
                        <li key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition duration-150">
                            <div className="flex items-center flex-1 min-w-0">
                                <button 
                                    onClick={() => toggleDone(item)}
                                    className="p-1.5 rounded-full border border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-700 transition duration-150 flex-shrink-0 mr-3"
                                    aria-label="Mark as done"
                                >
                                    <Check className="w-4 h-4 text-white opacity-0" />
                                </button>
                                <span className="text-gray-800 dark:text-gray-100 break-words flex-1 min-w-0">{item.description}</span>
                            </div>
                            <button 
                                onClick={() => deleteItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition duration-150 ml-3 flex-shrink-0"
                                aria-label="Delete item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 已完成事項 */}
            {completedItems.length > 0 && (
                <div className={cardClasses}>
                    <h4 className="text-lg font-bold text-green-500 dark:text-green-400 mb-4">已完成 ({completedItems.length})</h4>
                    <ul className="space-y-3">
                        {completedItems.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950 transition duration-150 opacity-70">
                                <div className="flex items-center flex-1 min-w-0">
                                    <button 
                                        onClick={() => toggleDone(item)}
                                        className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 transition duration-150 flex-shrink-0 mr-3"
                                        aria-label="Mark as pending"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="text-gray-500 dark:text-gray-400 line-through break-words flex-1 min-w-0">{item.description}</span>
                                </div>
                                <button 
                                    onClick={() => deleteItem(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition duration-150 ml-3 flex-shrink-0"
                                    aria-label="Delete item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// 3. 預算 (Budget)
const BudgetContent = ({ tripId, userId }) => {
    const budgetQuery = useMemo(() => {
        if (!userId) return null;
        const path = getPrivateCollectionPath(userId, 'budget_items');
        return query(collection(db, path), where('tripId', '==', tripId), orderBy('timestamp', 'desc'));
    }, [tripId, userId]);

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!budgetQuery) return;
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(budgetQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching budget items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [budgetQuery]);

    const deleteItem = useCallback(async (itemId) => {
        if (!userId) return;
        const itemRef = doc(db, getPrivateCollectionPath(userId, 'budget_items'), itemId);
        try {
            await deleteDoc(itemRef);
        } catch (error) {
            console.error("Error deleting budget item: ", error);
        }
    }, [userId]);

    const totalSpent = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const initialBudget = 10000;
    const percentageSpent = (totalSpent / initialBudget) * 100;
    const barColor = percentageSpent > 100 ? 'bg-red-500' : percentageSpent > 75 ? 'bg-yellow-500' : 'bg-green-500';

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {/* 預算摘要卡片 */}
            <div className={`${cardClasses} p-6`}>
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">預算摘要</h4>
                <div className="flex justify-between items-center text-lg font-medium mb-2">
                    <span className="text-gray-500 dark:text-gray-400">總預算:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">${initialBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-medium mb-4">
                    <span className="text-gray-500 dark:text-gray-400">總支出:</span>
                    <span className={`${totalSpent > initialBudget ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'} font-extrabold`}>
                        ${totalSpent.toLocaleString()}
                    </span>
                </div>
                
                {/* 進度條 */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full ${barColor}`} 
                        style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                        aria-valuenow={percentageSpent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                </div>
                <p className={`text-sm mt-2 font-medium ${percentageSpent > 100 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {percentageSpent.toFixed(1)}% 已用 ({initialBudget - totalSpent > 0 ? `尚餘 $${(initialBudget - totalSpent).toLocaleString()}` : `超支 $${(totalSpent - initialBudget).toLocaleString()}`})
                </p>
            </div>

            {/* 支出列表 */}
            <div className={cardClasses}>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">支出明細</h4>
                {items.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">沒有支出記錄。</p>
                ) : (
                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150">
                                <div className="flex items-center flex-1 min-w-0">
                                    <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.category || '一般'}
                                            {item.timestamp && ` - ${new Date(item.timestamp.toDate()).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric'})}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                                    <span className="text-lg font-bold text-red-500 dark:text-red-400">${(item.amount || 0).toLocaleString()}</span>
                                    <button 
                                        onClick={() => deleteItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition duration-150"
                                        aria-label="Delete expense"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

// 4. 筆記 (Notes)
const NotesContent = ({ tripId, userId }) => {
    const notesQuery = useMemo(() => {
        if (!userId) return null;
        const path = getPrivateCollectionPath(userId, 'notes_items');
        return query(collection(db, path), where('tripId', '==', tripId), orderBy('createdAt', 'desc'));
    }, [tripId, userId]);

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!notesQuery) return;
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching notes items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [notesQuery]);
    
    const deleteItem = useCallback(async (itemId) => {
        if (!userId) return;
        const itemRef = doc(db, getPrivateCollectionPath(userId, 'notes_items'), itemId);
        try {
            await deleteDoc(itemRef);
        } catch (error) {
            console.error("Error deleting note item: ", error);
        }
    }, [userId]);

    if (isLoading) return <LoadingSpinner />;
    if (items.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400 p-8">沒有任何筆記。</p>;

    return (
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className={cardClasses}>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.title || '無標題筆記'}</h4>
                        <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition duration-150 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                            aria-label="Delete note"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        建立於: {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString('zh-TW') : 'N/A'}
                    </p>
                </div>
            ))}
        </div>
    );
};

// 5. 地點 (Locations)
const LocationsContent = ({ tripId, userId }) => {
    const locationQuery = useMemo(() => {
        if (!userId) return null;
        const path = getPublicCollectionPath('location_items');
        return query(collection(db, path), where('tripId', '==', tripId), orderBy('createdAt', 'desc'));
    }, [tripId, userId]);

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!locationQuery) return;
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(locationQuery, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching location items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [locationQuery]);

    const deleteItem = useCallback(async (itemId) => {
        if (!userId) return;
        const itemRef = doc(db, getPublicCollectionPath('location_items'), itemId);
        try {
            await deleteDoc(itemRef);
        } catch (error) {
            console.error("Error deleting location item: ", error);
        }
    }, [userId]);

    if (isLoading) return <LoadingSpinner />;
    if (items.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400 p-8">沒有儲存任何地點。</p>;

    return (
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className={cardClasses}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2 flex-shrink-0" />
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.name || '未知地點'}</h4>
                        </div>
                        <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition duration-150 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                            aria-label="Delete location"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{item.address || '無地址資訊'}</p>
                    {item.notes && <p className="text-sm text-gray-500 dark:text-gray-400 italic">備註: {item.notes}</p>}
                </div>
            ))}
        </div>
    );
};

// --- TripDetail 主要組件 ---
const TripDetail = ({ tripId, onBack, userId, isDarkMode, toggleDarkMode }) => {
    const [tripData, setTripData] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isLoading, setIsLoading] = useState(true);

    // 1. 取得單一行程資料 (公開集合)
    useEffect(() => {
        if (!tripId || !userId) return;

        const tripDocRef = doc(db, getPublicCollectionPath('trips'), tripId);
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTripData({ id: docSnap.id, ...docSnap.data() });
            } else {
                setTripData(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trip data: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId]);


    const renderContent = useCallback(() => {
        if (!tripData) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">行程資料不存在。</div>;
        
        const props = { tripId: tripData.id, userId, tripData };

        switch (activeTab) {
            case 'itinerary':
                return <ItineraryContent {...props} />;
            case 'todo':
                return <TodoContent {...props} />;
            case 'budget':
                return <BudgetContent {...props} />;
            case 'notes':
                return <NotesContent {...props} />;
            case 'location':
                return <LocationsContent {...props} />;
            default:
                return <div className="p-8 text-gray-500 dark:text-gray-400">請選擇一個分頁。</div>;
        }
    }, [activeTab, tripData, userId]);


    if (isLoading) return <LoadingSpinner />;
    if (!tripData) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">載入行程失敗或行程不存在。</div>;

    const tabs = [
        { id: 'itinerary', name: '行程規劃', icon: Plane },
        { id: 'todo', name: '代辦', icon: ListTodo },
        { id: 'budget', name: '預算', icon: PiggyBank },
        { id: 'notes', name: '筆記', icon: NotebookPen },
        { id: 'location', name: '地點', icon: MapPin },
    ];

    const startDate = tripData.startDate ? new Date(tripData.startDate.toDate()).toLocaleDateString('zh-TW') : 'N/A';
    const endDate = tripData.endDate ? new Date(tripData.endDate.toDate()).toLocaleDateString('zh-TW') : 'N/A';
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            {/* 標頭區塊 */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-xl mx-auto p-4 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 rounded-full transition duration-150" aria-label="返回儀表板">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate flex-1 text-center mx-4">
                        {tripData.name || '行程詳情'}
                    </h1>
                    <div className="flex items-center space-x-2">
                        {/* 暗黑模式切換按鈕 */}
                        <button 
                            onClick={toggleDarkMode} 
                            className="p-2 text-gray-600 dark:text-yellow-400 hover:text-indigo-600 dark:hover:text-yellow-300 rounded-full transition duration-150"
                            aria-label="切換暗黑模式"
                        >
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 rounded-full transition duration-150" aria-label="設定">
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                {/* 行程資訊卡片 (在標頭下方) */}
                <div className="max-w-xl mx-auto px-4 pb-4">
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            <span>{tripData.destination || '目的地未定'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            <span>{startDate} - {endDate}</span>
                        </div>
                    </div>
                </div>

                {/* 分頁導航 */}
                <div className="max-w-xl mx-auto px-4 pb-4">
                    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={tabClasses(activeTab === tab.id)}
                            >
                                <div className="flex items-center justify-center whitespace-nowrap">
                                    <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-300' : 'text-white'} `} />
                                    <span className="ml-1 hidden sm:inline">{tab.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 內容區塊 */}
            <div className="max-w-xl mx-auto p-4">
                {renderContent()}
            </div>
        </div>
    );
};


// --- Dashboard 主要組件 ---
const Dashboard = ({ onSelectTrip, userId, userRole, isDarkMode, toggleDarkMode }) => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', isConfirm: false, onConfirm: null });

    // 1. 取得所有行程資料 (公開集合)
    useEffect(() => {
        if (!userId) return;

        const tripsQuery = query(collection(db, getPublicCollectionPath('trips')), orderBy('startDate', 'desc'));
        
        setIsLoading(true);
        const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrips(fetchedTrips);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trips: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. 刪除行程功能
    const handleDelete = useCallback((tripId) => {
        setModal({
            isOpen: true,
            title: '確認刪除',
            message: '確定要刪除此行程嗎？此操作無法恢復。',
            isConfirm: true,
            onConfirm: async () => {
                setModal({ ...modal, isOpen: false });
                if (!userId) return;

                const tripDocRef = doc(db, getPublicCollectionPath('trips'), tripId);
                try {
                    await deleteDoc(tripDocRef);
                } catch (error) {
                    console.error("Error deleting trip: ", error);
                }
            }
        });
    }, [userId, modal]);


    if (isLoading) return <LoadingSpinner />;
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
            
            {/* 標頭 */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-xl mx-auto p-4 flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                        我的行程
                    </h1>
                    <div className="flex items-center space-x-3">
                        {/* 暗黑模式切換按鈕 */}
                        <button 
                            onClick={toggleDarkMode} 
                            className="p-2 text-gray-600 dark:text-yellow-400 hover:text-indigo-600 dark:hover:text-yellow-300 rounded-full transition duration-150"
                            aria-label="切換暗黑模式"
                        >
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>

                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 hidden sm:inline">{userRole}</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold">
                            {userId.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-4">
                {/* 新增行程按鈕 (功能鎖定) */}
                <button 
                    className={`${buttonPrimary} w-full mb-6 opacity-60 cursor-not-allowed`}
                    disabled
                >
                    <Plus className="w-5 h-5 mr-2" />
                    新增行程 (目前功能已鎖定)
                </button>
                
                {/* 行程列表 */}
                <div className="space-y-4">
                    {trips.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-10">尚無任何行程。</p>
                    ) : (
                        trips.map(trip => {
                            const startDate = trip.startDate ? new Date(trip.startDate.toDate()).toLocaleDateString('zh-TW') : 'N/A';
                            const endDate = trip.endDate ? new Date(trip.endDate.toDate()).toLocaleDateString('zh-TW') : 'N/A';
                            
                            return (
                                <div key={trip.id} className={cardClasses}>
                                    <div className="flex justify-between items-start">
                                        {/* 行程名稱和地點 */}
                                        <div 
                                            className="flex-1 cursor-pointer"
                                            onClick={() => onSelectTrip(trip.id)}
                                        >
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-600 transition duration-150">
                                                {trip.name || '未命名行程'}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                <MapPin className="w-4 h-4 mr-1 text-pink-500" />
                                                {trip.destination || '目的地未定'}
                                            </p>
                                        </div>

                                        {/* 操作按鈕 */}
                                        <div className="flex space-x-2 ml-4 flex-shrink-0">
                                            {/* 編輯按鈕 (功能鎖定) */}
                                            <button 
                                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 cursor-not-allowed"
                                                disabled
                                                aria-label="編輯行程"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            
                                            {/* 刪除按鈕 (保留刪除功能) */}
                                            <button 
                                                onClick={() => handleDelete(trip.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition duration-150"
                                                aria-label="刪除行程"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 日期和狀態 */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                        <p className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                                            <CalendarDays className="w-4 h-4 mr-1" />
                                            {startDate} - {endDate}
                                        </p>
                                        <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-semibold">
                                            {trip.status || '規劃中'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};


// --- App 主應用程式 ---
const App = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    // 0. 暗黑模式狀態管理
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 從 localStorage 讀取偏好設定，預設為淺色模式
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('darkMode');
            return savedMode ? JSON.parse(savedMode) : false;
        }
        return false;
    });

    // 實作切換模式的函數
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', JSON.stringify(newMode));
            return newMode;
        });
    }, []);

    // 應用 'dark' class 到主容器
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    // 1. Firebase 認證和初始化
    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (initialAuthToken) {
                        const credential = await signInWithCustomToken(auth, initialAuthToken);
                        setUserId(credential.user.uid);
                    } else {
                        const credential = await signInAnonymously(auth);
                        setUserId(credential.user.uid);
                    }
                } catch (error) {
                    console.error("Firebase Auth Error:", error);
                    setUserId(crypto.randomUUID());
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // 2. 處理行程選擇
    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('detail');
    }, []);

    // 3. 處理返回儀表板
    const handleBackToDashboard = useCallback(() => {
        setSelectedTripId(null);
        setCurrentView('dashboard');
    }, []);

    if (!isAuthReady) {
        return <LoadingSpinner />;
    }

    // 將 isDarkMode 和 toggleDarkMode 傳遞給子組件
    const commonProps = { isDarkMode, toggleDarkMode };

    return (
        <div className="font-sans antialiased min-h-screen">
            {currentView === 'dashboard' ? (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    userId={userId} 
                    userRole={initialAuthToken ? '協作者' : '匿名使用者'}
                    {...commonProps}
                />
            ) : (
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    {...commonProps}
                />
            )}
        </div>
    );
};

export default App;
