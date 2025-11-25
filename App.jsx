import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, where, serverTimestamp
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Clock, Check, User, AlertTriangle
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 視圖狀態
const VIEW_DASHBOARD = 'dashboard';
const VIEW_TRIP_DETAIL = 'trip_detail';
const VIEW_NOTIFICATIONS = 'notifications';

// 顏色和樣式
const cardClasses = "bg-white p-5 rounded-xl shadow-lg transition duration-300 border border-gray-100";
const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150";
const buttonClasses = "py-2 px-4 rounded-lg font-semibold transition duration-150 shadow-md";

// 使用 debounce 函數來限制 Firestore 寫入操作的頻率
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// --- 主要應用程式組件 ---
const App = () => {
    // 1. 核心 Firebase 狀態
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    // 2. 應用程式視圖和資料狀態
    const [currentView, setCurrentView] = useState(VIEW_DASHBOARD);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [items, setItems] = useState([]); // 當前選定旅程的所有項目 (Todo, Expense, Note, Location)
    const [notifications, setNotifications] = useState([]);
    const [notificationCounts, setNotificationCounts] = useState({ chat: 0, system: 0, mention: 0 });
    const [loading, setLoading] = useState(true);

    // 3. 模態視窗狀態
    const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState('');
    
    // 4. 自定義 Alert 狀態
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');

    const alertUser = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => setAlertMessage(null), 3000);
    };

    // 5. Firebase 初始化與認證
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestore);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    if (initialAuthToken) {
                        signInWithCustomToken(firebaseAuth, initialAuthToken)
                            .then(userCredential => setUserId(userCredential.user.uid))
                            .catch(error => {
                                console.error("Custom token sign-in failed, attempting anonymous sign-in:", error);
                                signInAnonymously(firebaseAuth).then(userCredential => setUserId(userCredential.user.uid));
                            });
                    } else {
                        signInAnonymously(firebaseAuth).then(userCredential => setUserId(userCredential.user.uid));
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsAuthReady(true);
        }
    }, []);

    // 6. Firestore 讀取：旅程資料 (Dashboard View)
    useEffect(() => {
        if (!isAuthReady || !db || !userId || currentView !== VIEW_DASHBOARD) return;

        const tripsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        const qTrips = query(tripsCollectionRef); // 避免使用 orderBy

        const unsubscribe = onSnapshot(qTrips, (snapshot) => {
            // 在客戶端進行排序
            const newTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                           .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setTrips(newTrips);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch trips:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, userId, currentView]);

    // 7. Firestore 讀取：當前旅程項目 (Trip Detail View)
    useEffect(() => {
        if (!isAuthReady || !db || !userId || !selectedTripId || currentView !== VIEW_TRIP_DETAIL) return;

        // 公有/協作資料路徑：/artifacts/{appId}/public/data/trips/{tripId}/items
        const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/trips/${selectedTripId}/items`);
        const qItems = query(itemsCollectionRef); // 避免使用 orderBy

        const unsubscribe = onSnapshot(qItems, (snapshot) => {
            const newItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                          .sort((a, b) => (a.order || 0) - (b.order || 0)); // 假設項目有 order 欄位
            setItems(newItems);
        }, (error) => {
            console.error("Failed to fetch trip items:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, userId, selectedTripId, currentView]);

    // 8. Firestore 讀取：通知資料 (Notifications View)
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;
        const notificationsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/notifications`);
        const qNotifications = query(notificationsCollectionRef);

        const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(newNotifications);
            const counts = newNotifications.reduce((acc, notif) => {
                if (!notif.read) {
                    acc[notif.type] = (acc[notif.type] || 0) + 1;
                }
                return acc;
            }, { chat: 0, system: 0, mention: 0 });
            setNotificationCounts(counts);
        }, (error) => {
            console.error("Failed to fetch notifications:", error);
        });
        return () => unsubscribeNotifications();
    }, [isAuthReady, db, userId]);
    
    // 9. 旅程操作
    const handleAddTrip = async () => {
        if (!db || !userId || !newTripTitle.trim()) {
            alertUser('旅程標題不能為空!', 'error');
            return;
        }

        const tripsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        
        try {
            await addDoc(tripsCollectionRef, {
                title: newTripTitle.trim(),
                createdAt: serverTimestamp(),
                ownerId: userId,
                // 初始化旅程項目，以確保協作文件存在
                items: {} // 舊版結構，新版使用子集合
            });
            setIsNewTripModalOpen(false);
            setNewTripTitle('');
            alertUser('新旅程已成功建立。');
        } catch (error) {
            console.error("Failed to add new trip:", error);
            alertUser('建立旅程失敗！', 'error');
        }
    };
    
    const handleDeleteTrip = async (tripId) => {
        if (!db || !userId) return;
        
        const confirmed = window.confirm(`確定要刪除旅程 "${trips.find(t => t.id === tripId)?.title || '此旅程'}" 嗎？`);
        if (!confirmed) return;

        // 私有旅程文件
        const tripDocRef = doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId);
        // 公有旅程項目子集合 (需要更複雜的批量刪除，這裡僅刪除旅程文件本身)
        // const publicItemsRef = collection(db, `artifacts/${appId}/public/data/trips/${tripId}/items`);

        try {
            await deleteDoc(tripDocRef);
            setSelectedTripId(null);
            setCurrentView(VIEW_DASHBOARD);
            alertUser('旅程已刪除。');
        } catch (error) {
            console.error("Failed to delete trip:", error);
            alertUser('刪除旅程失敗！', 'error');
        }
    };

    // 10. 旅程項目操作 (Todo, Expense, Note, Location, Itinerary)
    const getTripItemRef = (tripId, itemId) => doc(db, `artifacts/${appId}/public/data/trips/${tripId}/items`, itemId);
    const getTripItemsCollectionRef = (tripId) => collection(db, `artifacts/${appId}/public/data/trips/${tripId}/items`);

    const saveItem = async (tripId, itemData) => {
        if (!db || !userId) return;

        const baseData = {
            ...itemData,
            updatedAt: serverTimestamp(),
            editorId: userId,
            type: itemData.type,
        };

        try {
            if (itemData.id) {
                // 更新現有項目
                await updateDoc(getTripItemRef(tripId, itemData.id), baseData);
                // alertUser('項目已更新。', 'success');
            } else {
                // 新增項目
                await addDoc(getTripItemsCollectionRef(tripId), {
                    ...baseData,
                    createdAt: serverTimestamp(),
                    order: items.length, // 簡單的順序
                });
                alertUser('新項目已新增。', 'success');
            }
        } catch (error) {
            console.error("Failed to save item:", error);
            alertUser('儲存項目失敗！', 'error');
        }
    };

    const deleteItem = async (tripId, itemId) => {
        if (!db || !userId) return;
        
        const confirmed = window.confirm('確定要刪除此項目嗎？');
        if (!confirmed) return;

        try {
            await deleteDoc(getTripItemRef(tripId, itemId));
            alertUser('項目已刪除。', 'success');
        } catch (error) {
            console.error("Failed to delete item:", error);
            alertUser('刪除項目失敗！', 'error');
        }
    };
    
    const toggleTodo = (tripId, item) => {
        saveItem(tripId, { ...item, completed: !item.completed });
    };

    // 11. 通知操作
    const totalUnread = useMemo(() => Object.values(notificationCounts).reduce((sum, count) => sum + count, 0), [notificationCounts]);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        if (!db || !userId) return;
        const notifDocRef = doc(db, `artifacts/${appId}/users/${userId}/notifications`, notificationId);
        try {
            await updateDoc(notifDocRef, { read: true });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, [db, userId]);

    const handleGenerateMockNotification = useCallback(async () => {
        if (!db || !userId) return;
        const types = ['chat', 'system', 'mention'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const messagesMap = {
            chat: `用戶-${userId.substring(0, 4)} 傳來了一條新訊息。`,
            system: '旅程文件已備份到雲端。',
            mention: '有人在文件中提到了您。'
        };

        const notificationData = {
            text: messagesMap[randomType],
            type: randomType,
            read: false,
            timestamp: serverTimestamp(),
        };

        const notificationsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/notifications`);
        try {
            await addDoc(notificationsCollectionRef, notificationData);
            alertUser('成功生成模擬通知！', 'success');
        } catch (error) {
            console.error("Failed to generate mock notification:", error);
            alertUser('生成通知失敗！', 'error');
        }
    }, [db, userId]);


    // --- 輔助組件 ---

    // 儀表板視圖
    const Dashboard = () => (
        <div className="flex-1 w-full max-w-xl mx-auto pt-24 pb-20 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">我的旅程儀表板</h1>
            
            <button
                onClick={() => setIsNewTripModalOpen(true)}
                className={`${buttonClasses} w-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center space-x-2 mb-6`}
            >
                <Plus size={20} />
                <span>新增旅程</span>
            </button>

            <div className="space-y-4">
                {trips.length === 0 ? (
                    <p className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">
                        目前沒有任何旅程。請點擊上方按鈕開始規劃！
                    </p>
                ) : (
                    trips.map(trip => (
                        <div
                            key={trip.id}
                            className={`flex justify-between items-center ${cardClasses} p-4 cursor-pointer hover:shadow-xl hover:scale-[1.01]`}
                            onClick={() => {
                                setSelectedTripId(trip.id);
                                setCurrentView(VIEW_TRIP_DETAIL);
                            }}
                        >
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800">{trip.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    建立於: {trip.createdAt ? new Date(trip.createdAt.seconds * 1000).toLocaleDateString('zh-TW') : 'N/A'}
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                                className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                                title="刪除旅程"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <NewTripModal isOpen={isNewTripModalOpen} onClose={() => setIsNewTripModalOpen(false)} />
        </div>
    );
    
    // 新增旅程模態視窗
    const NewTripModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClasses} w-full max-w-md`}>
                    <h2 className="text-2xl font-bold mb-4">新增旅程</h2>
                    <input
                        type="text"
                        placeholder="輸入旅程名稱 (例如: 2025 日本櫻花之旅)"
                        value={newTripTitle}
                        onChange={(e) => setNewTripTitle(e.target.value)}
                        className={inputClasses}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTrip()}
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className={`${buttonClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}>
                            <X size={20} className="inline mr-1" />
                            取消
                        </button>
                        <button onClick={handleAddTrip} className={`${buttonClasses} bg-indigo-600 text-white hover:bg-indigo-700`}>
                            <Save size={20} className="inline mr-1" />
                            儲存
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 通知中心視圖
    const NotificationsView = () => (
        <div className="flex-1 w-full max-w-4xl pt-24 pb-20 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">通知中心</h1>
            
            <button
                onClick={handleGenerateMockNotification}
                className="w-full bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg hover:bg-indigo-200 transition duration-150 mb-6 shadow-md flex items-center justify-center space-x-2 font-medium"
            >
                <Plus size={20} />
                <span>生成模擬通知 (測試功能)</span>
            </button>
            
            <div className="space-y-4">
                {notifications.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)).map(notif => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-xl flex items-start space-x-4 transition duration-150 shadow-sm border ${notif.read ? 'bg-white text-gray-500 border-gray-200' : 'bg-indigo-50 border-indigo-200 text-gray-800'}`}
                    >
                        <div className="mt-1 flex-shrink-0">
                            {notif.read ? <Check size={20} className="text-green-500" /> : <Bell size={20} className="text-indigo-600 animate-pulse" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{notif.text}</p>
                            <span className="text-xs block mt-1">
                                類型: <span className="capitalize font-mono">{notif.type}</span> |
                                時間: {notif.timestamp ? new Date(notif.timestamp.seconds * 1000).toLocaleString('zh-TW') : 'N/A'}
                            </span>
                        </div>
                        {!notif.read && (
                            <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap p-1 rounded hover:bg-indigo-100 transition flex-shrink-0"
                            >
                                標記為已讀
                            </button>
                        )}
                    </div>
                ))}
                {notifications.length === 0 && (
                    <p className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">目前沒有任何通知。</p>
                )}
            </div>
        </div>
    );
    
    // 旅程詳情視圖 (包含所有 tabs)
    const TripDetail = () => {
        const trip = useMemo(() => trips.find(t => t.id === selectedTripId), [trips, selectedTripId]);
        const [activeTab, setActiveTab] = useState('itinerary');
        
        // 旅程標題狀態 (用於編輯)
        const [localTripTitle, setLocalTripTitle] = useState(trip?.title || '');
        
        useEffect(() => {
            if (trip) setLocalTripTitle(trip.title);
        }, [trip]);

        // 旅程內容狀態 (行程編輯器)
        const initialItinerary = useMemo(() => items.find(item => item.type === 'itinerary')?.content || '', [items]);
        const [itineraryContent, setItineraryContent] = useState(initialItinerary);
        const [status, setStatus] = useState(trip ? `最後編輯於: ${trip.updatedAt?.toDate().toLocaleTimeString('zh-TW') || 'N/A'}` : '載入中...');
        
        useEffect(() => {
            setItineraryContent(initialItinerary);
        }, [initialItinerary]);
        
        const currentItineraryItem = useMemo(() => items.find(item => item.type === 'itinerary'), [items]);
        
        // 儲存 Itinerary 內容
        const saveItineraryContent = useCallback(async (content) => {
            if (!selectedTripId) return;

            const itemData = {
                id: currentItineraryItem?.id, // 嘗試更新現有文件
                type: 'itinerary',
                content: content,
            };
            
            try {
                 await saveItem(selectedTripId, itemData);
                 setStatus(`已自動儲存於 ${new Date().toLocaleTimeString('zh-TW')}`);
            } catch (error) {
                console.error("Failed to save itinerary:", error);
                setStatus('儲存失敗！');
            }
        }, [selectedTripId, currentItineraryItem, saveItem]);
        
        const debouncedSaveItinerary = useMemo(() => debounce(saveItineraryContent, 1000), [saveItineraryContent]);

        const handleItineraryChange = (e) => {
            const newContent = e.target.value;
            setItineraryContent(newContent);
            setStatus('正在編輯中...');
            debouncedSaveItinerary(newContent);
        };
        
        // Tab 類別
        const tabClasses = (isActive) => 
            `flex-1 text-center py-3 px-2 text-sm md:text-base font-semibold border-b-2 transition duration-200 ${
                isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`;
            
        // 渲染項目列表
        const renderItemList = (itemType, ItemComponent) => (
            <div className="space-y-4">
                <ItemAdder itemType={itemType} saveItem={saveItem} tripId={selectedTripId} />
                {items.filter(item => item.type === itemType).map(item => (
                    <ItemComponent key={item.id} item={item} tripId={selectedTripId} deleteItem={deleteItem} toggleTodo={toggleTodo} saveItem={saveItem} />
                ))}
                {items.filter(item => item.type === itemType).length === 0 && (
                    <p className="text-center py-5 text-gray-500">尚無 {activeTab} 項目。</p>
                )}
            </div>
        );

        // Tab 內容組件
        const TabContent = () => {
            switch (activeTab) {
                case 'itinerary':
                    return (
                         <div className="bg-white p-6 rounded-xl shadow-lg h-full min-h-[70vh] border border-gray-100 mt-6">
                            <textarea
                                value={itineraryContent}
                                onChange={handleItineraryChange}
                                className="w-full h-full text-lg font-serif leading-relaxed resize-none border-none focus:outline-none"
                                placeholder="在此處規劃您的每日行程..."
                                rows={25}
                                disabled={loading}
                            />
                        </div>
                    );
                case 'todo':
                    return renderItemList('todo', TodoItem);
                case 'expense':
                    return renderItemList('expense', ExpenseItem);
                case 'note':
                    return renderItemList('note', NoteItem);
                case 'location':
                    return renderItemList('location', LocationItem);
                default:
                    return <p className="text-center py-10 text-gray-500">請選擇一個分頁。</p>;
            }
        };

        return (
            <div className="flex-1 w-full max-w-4xl mx-auto pt-24 pb-20 px-4">
                {/* 狀態列和標題編輯 */}
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6">
                     <input
                        type="text"
                        value={localTripTitle}
                        onChange={(e) => {
                             setLocalTripTitle(e.target.value);
                             // 這裡省略 debounce 儲存旅程標題到 trips collection 的邏輯
                        }}
                        className="text-xl font-bold border-none focus:outline-none bg-transparent p-0 w-full mb-2"
                        placeholder="旅程標題"
                    />
                    <p className="text-sm text-gray-500">{status}</p>
                </div>

                {/* Tab 導航 */}
                <div className="flex justify-around bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {[
                        { id: 'itinerary', name: '行程', icon: CalendarDays },
                        { id: 'todo', name: '待辦', icon: ListTodo },
                        { id: 'expense', name: '支出', icon: PiggyBank },
                        { id: 'note', name: '筆記', icon: NotebookPen },
                        { id: 'location', name: '地點', icon: MapPin },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={tabClasses(activeTab === tab.id)}
                        >
                            <tab.icon className="w-5 h-5 inline mr-1" />
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Tab 內容 */}
                <div className="mt-4">
                    <TabContent />
                </div>
            </div>
        );
    };

    // --- 項目組件 (Item Components) ---

    // 項目新增器
    const ItemAdder = ({ itemType, saveItem, tripId }) => {
        const [input, setInput] = useState('');
        const [amount, setAmount] = useState(''); // 僅用於 expense
        
        const handleAddItem = () => {
            if (!input.trim()) return;

            let newItemData = { content: input.trim(), type: itemType };

            if (itemType === 'todo') {
                newItemData.completed = false;
            } else if (itemType === 'expense') {
                const numAmount = parseFloat(amount);
                if (isNaN(numAmount) || numAmount <= 0) {
                     alertUser('請輸入有效的支出金額。', 'error');
                     return;
                }
                newItemData.amount = numAmount;
                newItemData.currency = 'TWD'; // 預設幣別
                newItemData.description = input.trim();
            } else if (itemType === 'location') {
                 newItemData.name = input.trim();
                 newItemData.address = ''; // 待輸入
                 newItemData.time = 'N/A';
            }

            saveItem(tripId, newItemData);
            setInput('');
            setAmount('');
        };

        return (
            <div className={`${cardClasses} p-4 flex flex-col space-y-3`}>
                <div className="flex space-x-2">
                    {itemType === 'expense' && (
                        <input
                            type="number"
                            placeholder="金額"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-1/4 p-3 border border-gray-300 rounded-lg"
                        />
                    )}
                    <input
                        type="text"
                        placeholder={`新增${
                            itemType === 'todo' ? '待辦事項' : 
                            itemType === 'expense' ? '支出項目描述' :
                            itemType === 'location' ? '地點名稱' : '筆記標題'
                        }...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        className={itemType === 'expense' ? 'flex-1 p-3 border border-gray-300 rounded-lg' : inputClasses}
                    />
                    <button onClick={handleAddItem} className={`${buttonClasses} bg-green-500 text-white hover:bg-green-600 flex items-center`}>
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        );
    };

    // 待辦事項組件
    const TodoItem = ({ item, tripId, deleteItem, toggleTodo }) => (
        <div className={`${cardClasses} p-4 flex items-center justify-between`}>
            <div 
                className={`flex items-center flex-1 cursor-pointer`}
                onClick={() => toggleTodo(tripId, item)}
            >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition duration-150 ${item.completed ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-400'}`}>
                    {item.completed && <Check size={16} className="text-white" />}
                </div>
                <span className={`ml-3 text-lg ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.content}</span>
            </div>
            <button onClick={() => deleteItem(tripId, item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition">
                <Trash2 size={20} />
            </button>
        </div>
    );

    // 支出項目組件
    const ExpenseItem = ({ item, tripId, deleteItem }) => (
        <div className={`${cardClasses} p-4 flex items-center justify-between`}>
            <div className="flex-1">
                <p className="text-xl font-bold text-gray-800">
                    {item.currency || 'TWD'} {item.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <button onClick={() => deleteItem(tripId, item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition">
                <Trash2 size={20} />
            </button>
        </div>
    );

    // 筆記組件
    const NoteItem = ({ item, tripId, deleteItem }) => (
        <div className={`${cardClasses} p-4`}>
            <h3 className="text-lg font-semibold text-gray-800">{item.content}</h3>
            <p className="text-sm text-gray-600 mt-2">{item.details || '尚未填寫筆記內容。'}</p>
            <div className="flex justify-end mt-3">
                <button onClick={() => deleteItem(tripId, item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition">
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
    
    // 地點組件
    const LocationItem = ({ item, tripId, deleteItem }) => (
        <div className={`${cardClasses} p-4 flex items-start justify-between`}>
            <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                <div className='flex-1'>
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.address || '尚未設定地址'}</p>
                    <div className='flex items-center text-xs text-gray-500 mt-1'>
                         <Clock size={14} className='mr-1' />
                         <span>{item.time || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <button onClick={() => deleteItem(tripId, item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition">
                <Trash2 size={20} />
            </button>
        </div>
    );


    // --- 渲染主介面 ---

    // 簡潔的用戶頭像
    const UserAvatar = ({ uid }) => (
        <div 
            className="h-8 w-8 bg-indigo-200 rounded-full flex items-center justify-center font-semibold text-indigo-700 text-xs shadow-md"
            title={`當前用戶 ID: ${uid}`}
        >
            <User size={16} />
        </div>
    );

    const tripTitle = useMemo(() => trips.find(t => t.id === selectedTripId)?.title || '旅程規劃', [trips, selectedTripId]);
    
    // 判斷主標題
    const mainTitle = useMemo(() => {
        if (currentView === VIEW_NOTIFICATIONS) return '通知中心';
        if (currentView === VIEW_TRIP_DETAIL) return tripTitle;
        return '我的旅程';
    }, [currentView, tripTitle]);
    
    // 判斷狀態文字 (簡化)
    const statusText = useMemo(() => {
        if (currentView === VIEW_DASHBOARD) return `您已擁有 ${trips.length} 個旅程。用戶 ID: ${userId?.substring(0, 8)}...`;
        if (currentView === VIEW_TRIP_DETAIL) return `協作中。最後編輯: ${new Date().toLocaleTimeString('zh-TW')}`;
        return '系統狀態良好';
    }, [currentView, trips.length, userId]);


    if (!isAuthReady || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-gray-800">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                <p className="mt-4 text-lg font-medium">初始化中... (載入功能)</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 text-gray-800 flex flex-col items-center font-sans">
            {/* 頂部 Header */}
            <header className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm z-20">
                <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                    
                    <div className='flex items-center space-x-2'>
                        {/* 回到儀表板按鈕 */}
                        {(currentView === VIEW_TRIP_DETAIL) && (
                            <button 
                                onClick={() => {
                                    setSelectedTripId(null);
                                    setCurrentView(VIEW_DASHBOARD);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                                title="返回儀表板"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        
                        {/* 標題和狀態 */}
                        <div className="flex flex-col cursor-pointer" onClick={() => {
                            if (currentView !== VIEW_DASHBOARD) {
                                setCurrentView(VIEW_DASHBOARD);
                                setSelectedTripId(null);
                            }
                        }}>
                            <h1 className="text-xl font-bold text-gray-800">{mainTitle}</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{statusText}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* 通知按鈕 */}
                        <button
                            onClick={() => setCurrentView(VIEW_NOTIFICATIONS)}
                            className={`relative p-2 rounded-full transition duration-150 ${currentView === VIEW_NOTIFICATIONS ? 'bg-gray-200 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="查看通知"
                        >
                            <Bell size={24} />
                            {totalUnread > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 bg-red-600 rounded-full text-xs font-bold text-white ring-2 ring-white">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </span>
                            )}
                        </button>
                        {/* 用戶頭像 */}
                        <UserAvatar uid={userId} />
                    </div>
                </div>
            </header>

            {/* 主要內容區 - 根據視圖切換 */}
            <main className="flex-1 w-full pt-16">
                {currentView === VIEW_DASHBOARD && <Dashboard />}
                {currentView === VIEW_TRIP_DETAIL && selectedTripId && <TripDetail />}
                {currentView === VIEW_NOTIFICATIONS && <NotificationsView />}
            </main>
            
            {/* 自定義 Alert 訊息 */}
            {alertMessage && (
                <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl transition duration-300 z-50 flex items-center space-x-2 ${alertType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {alertType === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                    <span>{alertMessage}</span>
                </div>
            )}
        </div>
    );
};

export default App;
