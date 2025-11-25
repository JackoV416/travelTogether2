import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
    query, orderBy, limit, where 
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Tailwind CSS 輔助類別
const cardClasses = "bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300";
const inputClasses = "w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150";
const buttonPrimary = "bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-150 flex items-center justify-center";
const buttonSecondary = "bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300 transition duration-150 flex items-center justify-center";
const iconClasses = "w-5 h-5 mr-2";
const tabClasses = (isActive) => 
    `flex-1 py-3 px-1 text-center font-medium transition duration-200 
    ${isActive 
        ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50' 
        : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'}`;

/**
 * 主要應用程式元件
 * 負責認證、頂層狀態管理和導航
 */
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail'
    const [loading, setLoading] = useState(true);

    // 初始化 Firebase 和認證
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
                    // 使用 custom token 或匿名登入
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(authInstance, initialAuthToken);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (e) {
                        console.error("Firebase Auth failed:", e);
                    }
                }
                setIsAuthReady(true);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            setIsAuthReady(true);
            setLoading(false);
        }
    }, []);

    // 訂閱 trips 集合
    useEffect(() => {
        if (!db || !isAuthReady || !userId) return;

        const tripsRef = collection(db, 'artifacts', appId, 'public', 'data', 'trips');
        // 查詢所有使用者是成員的行程 (簡化：只讀取所有公開行程)
        const q = query(tripsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips: ", error);
        });

        return () => unsubscribe();
    }, [db, isAuthReady, userId]);

    // Firestore 輔助函數
    const getTripCollectionRef = (tripId, collectionName) => 
        collection(db, 'artifacts', appId, 'public', 'data', 'trips', tripId, collectionName);

    const getTripDocRef = (tripId, collectionName, docId) => 
        doc(db, 'artifacts', appId, 'public', 'data', 'trips', tripId, collectionName, docId);

    // 載入中畫面
    if (loading || !isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                <p className="ml-2 text-gray-600">載入中...</p>
            </div>
        );
    }
    
    // 處理行程新增
    const handleAddTrip = async (name) => {
        if (!db || !userId || !name.trim()) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'trips'), {
                name: name,
                members: [userId],
                createdAt: new Date(),
                ownerId: userId,
                // 初始化筆記文檔
                notes: "",
                // 額外的新功能欄位
                lastActivity: new Date().toISOString(), // 用於通知追蹤
            });
        } catch (error) {
            console.error("Error adding trip: ", error);
        }
    };

    // 處理行程刪除
    const handleDeleteTrip = async (id) => {
        if (!db || !window.confirm("確定要刪除這個行程嗎？所有相關資料將會遺失。")) return;
        try {
            // 注意：Firestore 不會自動刪除子集合，但我們在單一檔案中，先不實作遞迴刪除。
            // 實際應用中，需要使用 Cloud Functions 或其他方法來刪除子集合。
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'trips', id));
        } catch (error) {
            console.error("Error deleting trip: ", error);
        }
    };

    // 導航到行程細節
    const handleSelectTrip = (id) => {
        setSelectedTripId(id);
        setCurrentView('tripDetail');
    };

    // 儀表板組件 (Trip List)
    const Dashboard = () => {
        const [newTripName, setNewTripName] = useState('');

        return (
            <div className="p-4 md:p-8 min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Home className={iconClasses} />
                        旅程儀表板 (User ID: {userId.substring(0, 8)}...)
                    </h1>

                    <div className={`${cardClasses} mb-6`}>
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">新增協作旅程</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="輸入旅程名稱 (例如: 北海道七天六夜)"
                                value={newTripName}
                                onChange={(e) => setNewTripName(e.target.value)}
                                className={inputClasses}
                            />
                            <button
                                onClick={() => {
                                    handleAddTrip(newTripName);
                                    setNewTripName('');
                                }}
                                className={buttonPrimary}
                                disabled={!newTripName.trim()}
                            >
                                <Plus className="w-5 h-5" /> 建立
                            </button>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Briefcase className={iconClasses} />
                        我的旅程 ({trips.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className={`${cardClasses} flex flex-col justify-between`}>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-600 mb-2">{trip.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        成員: {trip.members?.length || 1} 人
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button 
                                        onClick={() => handleSelectTrip(trip.id)} 
                                        className={`${buttonPrimary} px-4 py-2 text-sm`}
                                    >
                                        進入行程
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTrip(trip.id)} 
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // 行程詳細組件
    const TripDetail = ({ tripId }) => {
        const [tripData, setTripData] = useState(null);
        const [loadingDetail, setLoadingDetail] = useState(true);
        const [activeTab, setActiveTab] = useState('itinerary');
        
        // 子集合數據
        const [itinerary, setItinerary] = useState([]);
        const [tasks, setTasks] = useState([]);
        const [expenses, setExpenses] = useState([]);
        const [notes, setNotes] = useState('');

        // 訂閱主行程數據和子集合
        useEffect(() => {
            if (!db || !tripId) return;

            setLoadingDetail(true);

            // 1. 主行程數據訂閱
            const tripDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'trips', tripId);
            const unsubscribeTrip = onSnapshot(tripDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setTripData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    alert('行程不存在或已被刪除。');
                    setSelectedTripId(null);
                    setCurrentView('dashboard');
                }
                setLoadingDetail(false);
            }, (error) => console.error("Error fetching trip data:", error));


            // 2. Itinerary 訂閱
            const unsubscribeItinerary = onSnapshot(
                query(getTripCollectionRef(tripId, 'itinerary'), orderBy('date', 'asc')),
                (snapshot) => {
                    setItinerary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => console.error("Error fetching itinerary:", error));

            // 3. Tasks 訂閱
            const unsubscribeTasks = onSnapshot(
                query(getTripCollectionRef(tripId, 'tasks')),
                (snapshot) => {
                    setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => console.error("Error fetching tasks:", error));

            // 4. Expenses 訂閱
            const unsubscribeExpenses = onSnapshot(
                query(getTripCollectionRef(tripId, 'expenses'), orderBy('date', 'desc')),
                (snapshot) => {
                    setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => console.error("Error fetching expenses:", error));
            
            // 5. Notes 訂閱 (單一文檔)
            const notesDocRef = getTripDocRef(tripId, 'notes', 'shared_note');
            const unsubscribeNotes = onSnapshot(notesDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setNotes(docSnap.data().content || '');
                } else {
                    // 如果不存在，則建立一個空白文檔
                    setDoc(notesDocRef, { content: '' }, { merge: true });
                    setNotes('');
                }
            }, (error) => console.error("Error fetching notes:", error));


            return () => {
                unsubscribeTrip();
                unsubscribeItinerary();
                unsubscribeTasks();
                unsubscribeExpenses();
                unsubscribeNotes();
            };
        }, [db, tripId]);


        // --- 通知邏輯：檢查是否有新的活動 ---
        const getNotificationCount = (collection) => {
            if (!tripData || !tripData.lastActivity) return 0;
            const lastViewed = new Date(tripData.lastViewed || 0).getTime();
            
            const newItems = collection.filter(item => {
                const itemTime = item.updatedAt?.toDate().getTime() || item.createdAt?.toDate().getTime();
                return itemTime > lastViewed;
            });

            return newItems.length > 0 ? 1 : 0;
        };

        const notificationCounts = {
            tasks: getNotificationCount(tasks),
            expenses: getNotificationCount(expenses),
            itinerary: getNotificationCount(itinerary),
        };
        
        // 標記為已讀
        const markAsViewed = useCallback(async () => {
            if (!db || !tripId || !tripData) return;
            const tripDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'trips', tripId);
            try {
                // 更新 trip 文件的 lastViewed 時間
                await updateDoc(tripDocRef, {
                    lastViewed: new Date().toISOString()
                });
            } catch (error) {
                console.error("Error marking as viewed:", error);
            }
        }, [db, tripId, tripData]);

        // 當切換分頁時，如果該分頁有新活動，則標記為已讀
        useEffect(() => {
            // 由於 notifications 邏輯較為複雜，我們將簡化為：只要進入行程，就標記為已讀。
            markAsViewed();
        }, [tripId, markAsViewed]); 

        // 載入中畫面
        if (loadingDetail || !tripData) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                    <p className="ml-2 text-gray-600">載入行程細節中...</p>
                </div>
            );
        }

        // --- 子組件：行程分頁 ---
        const ItineraryView = () => {
            const [newDate, setNewDate] = useState('');
            const [newActivity, setNewActivity] = useState({ dateId: '', time: '', description: '', type: 'Sightseeing' });

            const sortedItinerary = useMemo(() => {
                return [...itinerary].sort((a, b) => new Date(a.date) - new Date(b.date));
            }, [itinerary]);

            // 處理新增日期 (作為子集合文檔)
            const handleAddDate = async () => {
                if (!db || !newDate) return;
                const dateExists = sortedItinerary.some(item => item.date === newDate);
                if (dateExists) {
                    alert('該日期已存在。');
                    return;
                }
                try {
                    // 日期文檔 (只有日期資訊，作為行程分組)
                    await addDoc(getTripCollectionRef(tripId, 'itinerary'), {
                        date: newDate,
                        createdAt: new Date(),
                    });
                    setNewDate('');
                } catch (error) {
                    console.error("Error adding date:", error);
                }
            };

            // 處理新增活動到該日期下
            const handleAddActivity = async () => {
                if (!db || !newActivity.dateId || !newActivity.description.trim()) return;
                const itineraryItemRef = getTripDocRef(tripId, 'itinerary', newActivity.dateId);
                
                try {
                    // 將活動作為陣列新增到日期文件內
                    await updateDoc(itineraryItemRef, {
                        activities: [...(itinerary.find(d => d.id === newActivity.dateId)?.activities || []), {
                            id: Date.now().toString(), // 簡單唯一 ID
                            time: newActivity.time,
                            description: newActivity.description,
                            type: newActivity.type,
                            completed: false,
                        }],
                        updatedAt: new Date(),
                    });
                    setNewActivity({ dateId: '', time: '', description: '', type: 'Sightseeing' });
                } catch (error) {
                    console.error("Error adding activity:", error);
                }
            };

            const handleDeleteDate = async (dateId) => {
                if (!db || !window.confirm("確定要刪除這天的所有行程細節嗎？")) return;
                try {
                    await deleteDoc(getTripDocRef(tripId, 'itinerary', dateId));
                } catch (error) {
                    console.error("Error deleting date:", error);
                }
            };
            
            const handleDeleteActivity = async (dateId, activityId) => {
                if (!db) return;
                const itineraryItem = itinerary.find(d => d.id === dateId);
                const updatedActivities = itineraryItem.activities.filter(a => a.id !== activityId);
                try {
                     await updateDoc(getTripDocRef(tripId, 'itinerary', dateId), {
                        activities: updatedActivities,
                        updatedAt: new Date(),
                    });
                } catch (error) {
                    console.error("Error deleting activity:", error);
                }
            };

            const ActivityIcon = ({ type }) => {
                switch (type) {
                    case 'Food': return <Utensils className="w-4 h-4 text-orange-500 mr-1" />;
                    case 'Transport': return <Bus className="w-4 h-4 text-blue-500 mr-1" />;
                    case 'Shopping': return <ShoppingBag className="w-4 h-4 text-green-500 mr-1" />;
                    default: return <Clock className="w-4 h-4 text-gray-500 mr-1" />;
                }
            };

            return (
                <div>
                    <div className={`${cardClasses} mb-6`}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                            <Plus className={iconClasses} /> 新增日期
                        </h3>
                        <div className="flex space-x-2 mb-4">
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className={inputClasses}
                            />
                            <button onClick={handleAddDate} className={buttonPrimary}>
                                <CalendarDays className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                            <Clock className={iconClasses} /> 新增活動
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <select 
                                value={newActivity.dateId} 
                                onChange={(e) => setNewActivity({...newActivity, dateId: e.target.value})}
                                className={inputClasses}
                            >
                                <option value="">選擇日期...</option>
                                {sortedItinerary.map(item => (
                                    <option key={item.id} value={item.id}>{item.date}</option>
                                ))}
                            </select>
                            <input
                                type="time"
                                value={newActivity.time}
                                onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                                className={inputClasses}
                            />
                             <select 
                                value={newActivity.type} 
                                onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                                className={inputClasses}
                            >
                                <option value="Sightseeing">觀光</option>
                                <option value="Food">餐飲</option>
                                <option value="Transport">交通</option>
                                <option value="Shopping">購物</option>
                            </select>
                            <input
                                type="text"
                                placeholder="活動描述 (例如: 10:00 參觀東京鐵塔)"
                                value={newActivity.description}
                                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                                className="col-span-1 md:col-span-4 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                        <button onClick={handleAddActivity} className={`${buttonPrimary} w-full mt-3`}>
                            <Plus className="w-5 h-5" /> 儲存活動
                        </button>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <CalendarDays className={iconClasses} />
                        每日行程
                    </h2>

                    {sortedItinerary.map(day => (
                        <div key={day.id} className={`${cardClasses} mb-4`}>
                            <div className="flex justify-between items-center mb-3 border-b pb-2">
                                <h4 className="text-xl font-bold text-gray-700">{day.date}</h4>
                                <button onClick={() => handleDeleteDate(day.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <ul className="space-y-3">
                                {(day.activities || []).sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(activity => (
                                    <li key={activity.id} className="flex justify-between items-start text-gray-700 border-l-4 border-blue-400 pl-3">
                                        <div className="flex items-center">
                                            <ActivityIcon type={activity.type} />
                                            <span className="font-semibold w-16 mr-2 text-sm text-gray-500">{activity.time}</span>
                                            <span className="flex-1">{activity.description}</span>
                                        </div>
                                        <button onClick={() => handleDeleteActivity(day.id, activity.id)} className="text-gray-400 hover:text-red-500 ml-2">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                                {(day.activities?.length === 0 || !day.activities) && (
                                    <p className="text-gray-500 italic">這天沒有活動，新增一個吧！</p>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        };

        // --- 子組件：任務分頁 (精簡版) ---
        const TasksView = () => {
            const [newTask, setNewTask] = useState('');
            const handleAddTask = async () => {
                if (!db || !newTask.trim()) return;
                try {
                    await addDoc(getTripCollectionRef(tripId, 'tasks'), {
                        description: newTask,
                        completed: false,
                        assignedTo: userId, // 預設指派給自己
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    setNewTask('');
                } catch (error) {
                    console.error("Error adding task:", error);
                }
            };

            const handleToggleTask = async (task) => {
                if (!db) return;
                try {
                    await updateDoc(getTripDocRef(tripId, 'tasks', task.id), {
                        completed: !task.completed,
                        updatedAt: new Date(),
                    });
                } catch (error) {
                    console.error("Error updating task:", error);
                }
            };
            
            const handleDeleteTask = async (taskId) => {
                if (!db) return;
                try {
                    await deleteDoc(getTripDocRef(tripId, 'tasks', taskId));
                } catch (error) {
                    console.error("Error deleting task:", error);
                }
            };

            return (
                <div>
                    <div className={`${cardClasses} mb-6`}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                            <Plus className={iconClasses} /> 新增待辦任務
                        </h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="例如: 預訂飯店"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className={inputClasses}
                            />
                            <button onClick={handleAddTask} className={buttonPrimary} disabled={!newTask.trim()}>
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <ListTodo className={iconClasses} />
                        協作任務列表
                    </h2>
                    <div className="space-y-3">
                        {tasks.sort((a, b) => a.completed - b.completed).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
                                <div className="flex items-center flex-1 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(task)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded-lg cursor-pointer"
                                    />
                                    <span className={`ml-3 text-gray-700 truncate ${task.completed ? 'line-through text-gray-500 italic' : ''}`}>
                                        {task.description}
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-600 ml-4">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-gray-500 italic p-3">目前沒有任何任務。</p>}
                    </div>
                </div>
            );
        };

        // --- 子組件：預算分頁 ---
        const BudgetView = () => {
            const [newExpense, setNewExpense] = useState({ description: '', amount: 0, date: new Date().toISOString().substring(0, 10), paidBy: userId });
            
            const totalMembers = tripData.members.length > 0 ? tripData.members.length : 1;

            const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            const costPerPerson = totalExpenses / totalMembers;

            const handleAddExpense = async () => {
                if (!db || !newExpense.description.trim() || !newExpense.amount || parseFloat(newExpense.amount) <= 0) return;
                try {
                    await addDoc(getTripCollectionRef(tripId, 'expenses'), {
                        description: newExpense.description,
                        amount: parseFloat(newExpense.amount),
                        date: newExpense.date,
                        paidBy: userId, // 簡化：預設為當前使用者支付
                        createdAt: new Date(),
                    });
                    setNewExpense({ description: '', amount: 0, date: new Date().toISOString().substring(0, 10), paidBy: userId });
                } catch (error) {
                    console.error("Error adding expense:", error);
                }
            };
            
            const handleDeleteExpense = async (expenseId) => {
                if (!db) return;
                try {
                    await deleteDoc(getTripDocRef(tripId, 'expenses', expenseId));
                } catch (error) {
                    console.error("Error deleting expense:", error);
                }
            };


            return (
                <div>
                    <div className={`${cardClasses} mb-6 bg-blue-50 border-blue-200 border`}>
                        <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                            <Calculator className={iconClasses} /> 預算總覽
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">總支出 (TWD)</p>
                                <p className="text-2xl font-extrabold text-blue-600">${totalExpenses.toFixed(0)}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">參與人數</p>
                                <p className="text-2xl font-extrabold text-gray-800">{totalMembers}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">每人平均分攤</p>
                                <p className="text-2xl font-extrabold text-green-600">${costPerPerson.toFixed(0)}</p>
                            </div>
                        </div>
                        {/* 這裡可以加入更複雜的結算功能 */}
                    </div>

                    <div className={`${cardClasses} mb-6`}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                            <Plus className={iconClasses} /> 記錄新支出
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            <input
                                type="text"
                                placeholder="描述 (例如: 晚餐)"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                                className="col-span-2 p-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="金額 (TWD)"
                                value={newExpense.amount || ''}
                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                className="p-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                                className="p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <button onClick={handleAddExpense} className={`${buttonPrimary} w-full mt-3`} disabled={!newExpense.description || parseFloat(newExpense.amount) <= 0}>
                            <PiggyBank className="w-5 h-5" /> 儲存支出
                        </button>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <ListTodo className={iconClasses} />
                        支出明細
                    </h2>
                    <div className="space-y-3">
                        {expenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition border-l-4 border-red-400">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{expense.description}</p>
                                    <p className="text-sm text-gray-500">日期: {expense.date} | 支付者: {expense.paidBy.substring(0, 8)}...</p>
                                </div>
                                <p className="text-lg font-bold text-red-600 ml-4">${expense.amount.toFixed(0)}</p>
                                <button onClick={() => handleDeleteExpense(expense.id)} className="text-gray-400 hover:text-red-600 ml-4">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {expenses.length === 0 && <p className="text-gray-500 italic p-3">目前沒有支出記錄。</p>}
                    </div>
                </div>
            );
        };

        // --- 子組件：筆記分頁 ---
        const NotesView = () => {
            const [localNotes, setLocalNotes] = useState(notes);
            const [isSaving, setIsSaving] = useState(false);
            
            // 處理即時輸入
            const handleChange = (e) => {
                setLocalNotes(e.target.value);
            };

            // 處理儲存
            const handleSaveNotes = async () => {
                if (!db) return;
                setIsSaving(true);
                const notesDocRef = getTripDocRef(tripId, 'notes', 'shared_note');
                try {
                    await setDoc(notesDocRef, { 
                        content: localNotes, 
                        updatedAt: new Date(), 
                        updatedBy: userId 
                    });
                    // 同步 trip 的 lastActivity 時間
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'trips', tripId), {
                        lastActivity: new Date().toISOString()
                    });
                } catch (error) {
                    console.error("Error saving notes:", error);
                } finally {
                    setIsSaving(false);
                }
            };
            
            // 讓本地狀態與遠端同步
            useEffect(() => {
                setLocalNotes(notes);
            }, [notes]);

            return (
                <div className={`${cardClasses}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <NotebookPen className={iconClasses} /> 共享記事本
                    </h3>
                    <textarea
                        value={localNotes}
                        onChange={handleChange}
                        className={`${inputClasses} h-80 resize-none mb-4`}
                        placeholder="在此輸入您的行程筆記、預定資訊或任何想分享的內容..."
                    />
                    <div className="flex justify-between items-center">
                        <button onClick={handleSaveNotes} className={buttonPrimary} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            {isSaving ? '儲存中...' : '儲存變更'}
                        </button>
                        <p className="text-sm text-gray-500">
                            最後更新: {tripData.lastActivity ? new Date(tripData.lastActivity).toLocaleTimeString('zh-TW') : 'N/A'}
                        </p>
                    </div>
                </div>
            );
        };

        // --- 子組件：地點/地圖分頁 (Placeholder) ---
        const LocationView = () => {
            const [searchQuery, setSearchQuery] = useState('');
            const [searchResults, setSearchResults] = useState([]);

            const handleSearch = () => {
                if (!searchQuery.trim()) return;
                // 這是模擬的搜索結果，實際應用需要整合地圖 API
                const mockResults = [
                    { name: searchQuery + ' 飯店', address: '東京, 日本', type: '住宿' },
                    { name: searchQuery + ' 景點', address: '京都, 日本', type: '景點' },
                    { name: '附近餐廳: ' + searchQuery, address: '大阪, 日本', type: '餐飲' },
                ];
                setSearchResults(mockResults);
                setSearchQuery('');
            };

            return (
                <div className={`${cardClasses}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <MapPin className={iconClasses} /> 地點與地圖 (規劃中)
                    </h3>
                    
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-2">地點搜索</h4>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="搜索地點、餐廳或景點名稱..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={inputClasses}
                            />
                            <button onClick={handleSearch} className={buttonPrimary}>
                                搜索
                            </button>
                        </div>
                    </div>

                    <div className="h-64 bg-gray-200 flex items-center justify-center rounded-xl mb-6 border border-dashed border-gray-400">
                        <p className="text-gray-500 font-medium">地圖顯示區 (需整合 Google Maps API)</p>
                    </div>

                    <h4 className="font-semibold text-gray-700 mb-2">搜索結果</h4>
                    <div className="space-y-2">
                        {searchResults.map((result, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-blue-600">{result.name}</p>
                                    <p className="text-sm text-gray-500">{result.address}</p>
                                </div>
                                <span className="text-xs bg-gray-300 text-gray-800 px-2 py-1 rounded-full">{result.type}</span>
                            </div>
                        ))}
                        {searchResults.length === 0 && <p className="text-gray-500 italic">請輸入關鍵字搜索地點。</p>}
                    </div>
                </div>
            );
        };


        const renderContent = () => {
            switch (activeTab) {
                case 'itinerary': return <ItineraryView />;
                case 'tasks': return <TasksView />;
                case 'budget': return <BudgetView />;
                case 'notes': return <NotesView />;
                case 'location': return <LocationView />;
                default: return <ItineraryView />;
            }
        };

        return (
            <div className="p-4 md:p-8 min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    {/* 標題與返回按鈕 */}
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={() => setCurrentView('dashboard')} 
                            className={`${buttonSecondary} p-2 mr-4`}
                        >
                            <ChevronLeft className="w-5 h-5" /> 返回儀表板
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 truncate flex-1">
                            <Users className={iconClasses} />
                            {tripData.name} - 協作規劃
                        </h1>
                        <div className="text-sm text-gray-600 bg-white p-2 rounded-lg shadow-md">
                            您的ID: {userId.substring(0, 8)}...
                        </div>
                    </div>

                    {/* 導航分頁 */}
                    <div className="flex bg-white rounded-t-xl shadow-md overflow-x-auto mb-6 sticky top-0 z-10">
                        {[{ id: 'itinerary', name: '行程', icon: CalendarDays },
                         { id: 'tasks', name: '任務', icon: ListTodo },
                         { id: 'budget', name: '預算', icon: PiggyBank },
                         { id: 'notes', name: '筆記', icon: NotebookPen },
                         { id: 'location', name: '地點', icon: MapPin },
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={tabClasses(activeTab === tab.id)}
                            >
                                <div className="flex items-center justify-center">
                                    <tab.icon className="w-5 h-5" />
                                    <span className="ml-1">{tab.name}</span>
                                    {notificationCounts[tab.id] > 0 && (
                                        <Bell className="w-4 h-4 ml-1 text-red-500 animate-pulse" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 內容區塊 */}
                    {renderContent()}
                </div>
            </div>
        );
    };


    return (
        <div className="font-sans antialiased bg-gray-50">
            {currentView === 'dashboard' ? (
                <Dashboard />
            ) : (
                <TripDetail tripId={selectedTripId} />
            )}
        </div>
    );
};

export default App;
