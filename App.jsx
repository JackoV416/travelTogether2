import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle
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
const inputClasses = `w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-${primaryColor}/50 focus:border-${primaryColor} dark:bg-gray-700 dark:text-white transition duration-200`;
const buttonClasses = (isActive = false, isAccent = false) => 
    `w-full text-center py-3 px-4 rounded-xl font-bold transition duration-300 shadow-md ${
        isActive 
        ? `bg-${primaryColor} text-white shadow-${primaryColor}/40 hover:bg-${primaryColor}/90`
        : isAccent
        ? `bg-${accentColor} text-white shadow-${accentColor}/40 hover:bg-${accentColor}/90`
        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`;

const tabClasses = (isActive) => 
    `relative p-2 flex-1 flex flex-col items-center rounded-xl transition duration-300 ${
        isActive 
        ? `bg-${primaryColor} text-white shadow-lg shadow-${primaryColor}/50` 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

// --- Firestore 路徑輔助函式 ---

// 私人資料路徑: /artifacts/{appId}/users/{userId}/{collectionName}
const getPrivateCollectionPath = (userId, collectionName) => 
    `artifacts/${appId}/users/${userId}/${collectionName}`;

// 公共/協作資料路徑: /artifacts/{appId}/public/data/{collectionName}
const getPublicCollectionPath = (collectionName) => 
    `artifacts/${appId}/public/data/${collectionName}`;

const getTripCollectionRef = (userId) => collection(db, getPrivateCollectionPath(userId, 'trips'));
const getTripDocRef = (userId, tripId) => doc(db, getPrivateCollectionPath(userId, 'trips'), tripId);

// 行程詳細資料子集合
const getSubCollectionRef = (tripId, collectionName) => 
    collection(db, `artifacts/${appId}/public/data/trips/${tripId}/${collectionName}`);

// --- 共用 UI 元件 ---

const Header = ({ title, userId, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const handleLogout = () => {
        // Firebase 登出邏輯 (對於自定義Token，通常是重新載入或清除session)
        // 在這個模擬環境中，我們只顯示訊息
        console.log("Logout function triggered. In this environment, we just log the action.");
        // 如果是標準認證，會是: signOut(auth);
    };

    return (
        <div className={`sticky top-0 z-10 p-4 shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center max-w-4xl mx-auto">
                <h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center">
                    <Map className="w-6 h-6 mr-2" />
                    {title}
                </h1>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={onTutorialStart} 
                        className={`p-2 rounded-full transition duration-200 ${isDarkMode ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-gray-100'}`}
                        aria-label="應用程式教學"
                    >
                        <BookOpenText className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={toggleDarkMode} 
                        className={`p-2 rounded-full transition duration-200 ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        aria-label="切換深色模式"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full pl-3 pr-2 py-1">
                        <User className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                        <span className="truncate w-24 dark:text-gray-200">ID: {userId.substring(0, 8)}...</span>
                        <button 
                            onClick={handleLogout} 
                            className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                            aria-label="登出"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Modal = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className={`max-w-md w-full ${cardClasses} transform transition-all scale-100`}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- TripDetail Components (子頁面) ---

const LoadingIndicator = ({ isDarkMode }) => (
    <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className={`ml-3 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>資料載入中...</span>
    </div>
);

// [1. 行程概覽] - 協作使用者列表
const CollaborationView = ({ tripId, userId, isDarkMode }) => {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;

        const collabRef = getSubCollectionRef(tripId, 'collaborators');
        const q = query(collabRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCollaborators(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching collaborators: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId]);

    const handleAddCollaborator = () => {
        // 由於我們使用匿名/自定義Token認證，無法直接添加真實使用者
        // 在此模擬一個使用者加入
        const newUserId = `user-${Math.random().toString(36).substring(2, 9)}`;
        const collabRef = getSubCollectionRef(tripId, 'collaborators');
        addDoc(collabRef, {
            userId: newUserId,
            name: `Guest ${newUserId.substring(0, 4)}`,
            joinedAt: serverTimestamp(),
            role: 'Editor'
        }).catch(e => console.error("Error adding collaborator: ", e));
    };

    return (
        <div className={cardClasses}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    協作夥伴
                </h3>
                <button 
                    onClick={handleAddCollaborator} 
                    className={buttonClasses(false, true) + " !w-auto !px-4 !py-2 flex items-center text-sm"}
                >
                    <Plus className="w-4 h-4 mr-1" /> 邀請夥伴 (模擬)
                </button>
            </div>
            {loading ? <LoadingIndicator isDarkMode={isDarkMode} /> : (
                <ul className="space-y-3">
                    {collaborators.map(collab => (
                        <li 
                            key={collab.id} 
                            className={`flex justify-between items-center p-3 rounded-lg ${collab.userId === userId ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200'} border transition duration-150`}
                        >
                            <div className="flex items-center">
                                <User className={`w-5 h-5 mr-3 ${collab.userId === userId ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`} />
                                <div>
                                    <p className="font-semibold dark:text-white">
                                        {collab.userId === userId ? '您 (Owner)' : collab.name || `User ${collab.userId.substring(0, 4)}...`}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{collab.role}</p>
                                </div>
                            </div>
                            {collab.userId === userId && <span className="text-xs text-indigo-500 dark:text-indigo-300 font-medium">本人</span>}
                        </li>
                    ))}
                </ul>
            )}
            {collaborators.length === 0 && !loading && (
                 <p className="text-center text-gray-500 dark:text-gray-400 italic py-4">目前沒有協作夥伴。</p>
            )}
        </div>
    );
};

// [2. 行程規劃] - 顯示/新增活動
const ItineraryView = ({ tripId, isDarkMode }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newActivity, setNewActivity] = useState({
        name: '',
        date: '',
        time: '',
        type: 'Sightseeing', // Default type
    });

    const activityTypes = [
        { name: '觀光', icon: MapPin, value: 'Sightseeing' },
        { name: '餐飲', icon: Utensils, value: 'Food' },
        { name: '交通', icon: Bus, value: 'Transport' },
        { name: '購物', icon: ShoppingBag, value: 'Shopping' },
        { name: '其他', icon: Edit, value: 'Other' },
    ];

    useEffect(() => {
        if (!tripId) return;

        const activitiesRef = getSubCollectionRef(tripId, 'activities');
        // 依照日期和時間排序
        const q = query(activitiesRef, orderBy('date', 'asc'), orderBy('time', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActivities(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching activities: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewActivity(prev => ({ ...prev, [name]: value }));
    };

    const handleAddActivity = async () => {
        if (!newActivity.name || !newActivity.date) return;

        const activitiesRef = getSubCollectionRef(tripId, 'activities');
        try {
            await addDoc(activitiesRef, {
                ...newActivity,
                createdAt: serverTimestamp(),
            });
            setNewActivity({ name: '', date: '', time: '', type: 'Sightseeing' });
            setIsAdding(false);
        } catch (e) {
            console.error("Error adding activity: ", e);
        }
    };

    const handleDeleteActivity = async (id) => {
        if (!window.confirm('確定要刪除此行程活動嗎？')) return;
        
        const docRef = doc(getSubCollectionRef(tripId, 'activities'), id);
        try {
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting activity: ", e);
        }
    };

    const groupedActivities = activities.reduce((acc, activity) => {
        const dateKey = activity.date || '未定日期';
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className={cardClasses}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        行程活動
                    </h3>
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className={buttonClasses(true, true) + " !w-auto !px-4 !py-2 flex items-center text-sm"}
                    >
                        <Plus className="w-4 h-4 mr-1" /> 新增活動
                    </button>
                </div>

                {loading ? <LoadingIndicator isDarkMode={isDarkMode} /> : (
                    Object.keys(groupedActivities).length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 italic py-4">此行程尚未新增任何活動。</p>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(groupedActivities).map(date => (
                                <div key={date} className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4">
                                    <h4 className="text-lg font-extrabold mb-3 text-indigo-600 dark:text-indigo-400">{date}</h4>
                                    <div className="space-y-4">
                                        {groupedActivities[date].map((activity, index) => {
                                            const TypeIcon = activityTypes.find(t => t.value === activity.type)?.icon || MapPin;
                                            return (
                                                <div 
                                                    key={activity.id} 
                                                    className={`p-4 rounded-xl shadow-md flex justify-between items-start ${isDarkMode ? 'bg-gray-700' : 'bg-white'} transition duration-150`}
                                                >
                                                    <div className="flex items-start">
                                                        <TypeIcon className="w-5 h-5 mr-3 mt-1 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-bold dark:text-white">{activity.name}</p>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-3">
                                                                {activity.time && (
                                                                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {activity.time}</span>
                                                                )}
                                                                <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 text-xs font-medium px-2 py-0.5 rounded-full">{activityTypes.find(t => t.value === activity.type)?.name || '未知'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteActivity(activity.id)} 
                                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full transition duration-150 flex-shrink-0"
                                                        aria-label="刪除活動"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {isAdding && (
                <Modal title="新增行程活動" onClose={() => setIsAdding(false)}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            value={newActivity.name}
                            onChange={handleInputChange}
                            placeholder="活動名稱 (e.g. 參觀故宮博物院)"
                            className={inputClasses}
                        />
                        <div className="flex space-x-4">
                            <input
                                type="date"
                                name="date"
                                value={newActivity.date}
                                onChange={handleInputChange}
                                className={inputClasses + " flex-1"}
                            />
                            <input
                                type="time"
                                name="time"
                                value={newActivity.time}
                                onChange={handleInputChange}
                                className={inputClasses + " flex-1"}
                            />
                        </div>
                        <select
                            name="type"
                            value={newActivity.type}
                            onChange={handleInputChange}
                            className={inputClasses}
                        >
                            {activityTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleAddActivity} 
                            disabled={!newActivity.name || !newActivity.date}
                            className={buttonClasses(true, true) + " !mt-6"}
                        >
                            <Save className="w-5 h-5 mr-2" /> 儲存活動
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// --- TripDetail 主要元件 ---

const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('collaboration'); // 預設為協作
    const [notificationCounts, setNotificationCounts] = useState({ collaboration: 0, itinerary: 0, budget: 0, todo: 0, notes: 0, location: 0 });

    const pages = useMemo(() => ({
        collaboration: { name: '協作', icon: Users, component: CollaborationView },
        itinerary: { name: '行程', icon: Map, component: ItineraryView },
        // ... 其他頁面可以在此處擴充
    }), []);

    // 1. 載入行程基本資料
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        const docRef = getTripDocRef(userId, tripId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                setTrip(null);
                console.error("Trip not found");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, userId, tripId]);

    // 2. 渲染內容
    const renderContent = () => {
        if (!trip) return <p className="text-center py-10 text-xl text-red-500 dark:text-red-400"><AlertTriangle className="inline w-6 h-6 mr-2" />行程資料載入失敗或不存在。</p>;

        const CurrentComponent = pages[activeTab]?.component;
        if (!CurrentComponent) return null;

        return (
            <CurrentComponent 
                tripId={tripId} 
                userId={userId} 
                isDarkMode={isDarkMode} 
            />
        );
    };

    if (loading) {
        return <LoadingIndicator isDarkMode={isDarkMode} />;
    }

    const tripDetailClasses = `max-w-4xl mx-auto p-4 sm:p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800'}`;

    return (
        <div className={tripDetailClasses}>
            {/* 返回儀表板按鈕 */}
            <button 
                onClick={onBack} 
                className={`flex items-center text-lg font-medium mb-6 transition duration-200 ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                aria-label="返回儀表板"
            >
                <ChevronLeft className="w-6 h-6 mr-1" />
                返回總覽
            </button>

            {/* 行程標題卡片 */}
            <div className={`${cardClasses} mb-6`}>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{trip?.name || '未知行程'}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    <CalendarDays className="inline w-5 h-5 mr-1 text-teal-500" /> 
                    {trip?.startDate || '日期未定'} - {trip?.endDate || '日期未定'}
                </p>
            </div>

            {/* Tab Navigation (已修正 JSX 語法錯誤) */}
            <div className={`flex justify-around p-2 mb-6 rounded-2xl shadow-inner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {Object.keys(pages).map(pageKey => {
                    const IconComponent = pages[pageKey].icon; // 正確地提取 component
                    return (
                        <button
                            key={pageKey}
                            onClick={() => setActiveTab(pageKey)}
                            className={tabClasses(activeTab === pageKey)}
                        >
                            <IconComponent className={`w-6 h-6 mx-auto mb-1 ${activeTab === pageKey ? 'text-white' : 'text-indigo-600 dark:text-indigo-300'}`} />
                            <span className={`text-xs font-semibold ${activeTab === pageKey ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{pages[pageKey].name}</span>
                            {notificationCounts[pageKey] > 0 && (
                                <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {notificationCounts[pageKey]}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 內容區塊 */}
            {renderContent()}
        </div>
    );
};


// --- Dashboard 元件 ---

const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [isAddingTrip, setIsAddingTrip] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');

    const handleAddTrip = async () => {
        if (!newTripName || !newTripStartDate) return;

        const tripRef = getTripCollectionRef(userId);
        try {
            await addDoc(tripRef, {
                name: newTripName,
                startDate: newTripStartDate,
                endDate: newTripEndDate || null,
                createdAt: serverTimestamp(),
                ownerId: userId,
            });
            setNewTripName('');
            setNewTripStartDate('');
            setNewTripEndDate('');
            setIsAddingTrip(false);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const handleDeleteTrip = async (id) => {
        if (!window.confirm('確定要刪除此行程嗎？')) return;

        // 刪除私人行程文件
        const tripDocRef = getTripDocRef(userId, id);
        try {
            await deleteDoc(tripDocRef);

            // 這裡可以選擇性地清理公共子集合數據，但為了保持代碼簡潔，暫時省略。
            // 實際應用中需要額外邏輯來批量刪除子集合數據。

        } catch (e) {
            console.error("Error deleting trip: ", e);
        }
    };

    return (
        <div className="min-h-screen">
            <Header 
                title="旅遊協作儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                onTutorialStart={onTutorialStart}
            />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">我的行程</h2>
                    <button 
                        onClick={() => setIsAddingTrip(true)} 
                        className={buttonClasses(true, true) + " !w-auto !px-4 !py-2 flex items-center shadow-indigo-400/50"}
                    >
                        <Plus className="w-5 h-5 mr-1" /> 建立新行程
                    </button>
                </div>

                <div className={`${cardClasses} p-4 sm:p-6`}>
                    <h3 className="text-xl font-bold mb-4 border-b dark:border-gray-700 pb-2 text-indigo-600 dark:text-indigo-400">
                        <ClipboardList className="inline w-5 h-5 mr-2" />
                        所有行程列表 ({trips.length})
                    </h3>
                    
                    {trips.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 italic py-4">您尚未建立任何行程。</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trips.map(trip => (
                                <div 
                                    key={trip.id} 
                                    className={`relative p-5 rounded-xl shadow-lg cursor-pointer transition duration-300 hover:shadow-xl hover:scale-[1.01] ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
                                    onClick={() => onSelectTrip(trip.id)}
                                >
                                    <h4 className="text-xl font-bold dark:text-white mb-1 truncate">{trip.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <CalendarDays className="w-4 h-4 mr-1 text-teal-500" />
                                        {trip.startDate} {trip.endDate ? ` - ${trip.endDate}` : ''}
                                    </p>
                                    <div className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                                        建立於: {trip.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                        aria-label={`刪除行程 ${trip.name}`}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 應用程式資訊 */}
                 <div className={`${cardClasses} text-center text-sm text-gray-500 dark:text-gray-400`}>
                    <p>應用程式 ID: {appId}</p>
                    <p className='mt-1'>所有行程資料儲存於 <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">Firestore 公共與私人集合</span> 中。</p>
                </div>
            </div>

            {isAddingTrip && (
                <Modal title="建立新行程" onClose={() => setIsAddingTrip(false)}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            placeholder="行程名稱 (e.g. 日本東京五日遊)"
                            className={inputClasses}
                        />
                        <div className="flex space-x-4">
                            <input
                                type="date"
                                value={newTripStartDate}
                                onChange={(e) => setNewTripStartDate(e.target.value)}
                                className={inputClasses + " flex-1"}
                                required
                            />
                            <input
                                type="date"
                                value={newTripEndDate}
                                onChange={(e) => setNewTripEndDate(e.target.value)}
                                className={inputClasses + " flex-1"}
                                placeholder="結束日期 (可選)"
                            />
                        </div>
                        <button 
                            onClick={handleAddTrip} 
                            disabled={!newTripName || !newTripStartDate}
                            className={buttonClasses(true, true)}
                        >
                            <Plus className="w-5 h-5 mr-2" /> 建立行程
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// --- 教學元件 ---
const TutorialView = ({ onBack, isDarkMode }) => {
    const steps = [
        { 
            title: "歡迎來到旅遊協作應用程式", 
            description: "這是一個基於 Firebase Firestore 的協作式旅遊規劃工具。", 
            icon: Home 
        },
        { 
            title: "儀表板總覽", 
            description: "您可以在這裡建立、查看和管理您的所有行程。所有行程都與您的使用者 ID 相關聯。", 
            icon: ClipboardList 
        },
        { 
            title: "協作功能", 
            description: "進入行程後，您可以邀請協作夥伴（模擬）一起規劃，所有行程數據都儲存在一個共享的公共集合中。", 
            icon: Users 
        },
        { 
            title: "行程規劃", 
            description: "在 '行程' 頁面中，您可以新增包含日期、時間和類型（觀光、餐飲、交通等）的活動，並會自動按日期排序。", 
            icon: Map 
        },
        { 
            title: "深色模式", 
            description: "點擊右上角的月亮/太陽圖標，隨時切換深色或淺色主題。", 
            icon: Sun 
        },
        { 
            title: "開始使用", 
            description: "點擊下方的按鈕返回，開始建立您的第一個行程吧！", 
            icon: Check 
        },
    ];

    const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textPrimary = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';

    return (
        <div className={`max-w-4xl mx-auto p-4 sm:p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800'}`}>
            <button 
                onClick={onBack} 
                className={`flex items-center text-lg font-medium mb-8 transition duration-200 ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                aria-label="返回"
            >
                <ChevronLeft className="w-6 h-6 mr-1" />
                返回儀表板
            </button>
            <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-600 dark:text-indigo-400">應用程式教學</h2>
            
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                        <div 
                            key={index} 
                            className={`${cardClasses} flex items-start p-5 ${cardBg}`}
                        >
                            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full mr-4 ${textPrimary} bg-indigo-50 dark:bg-indigo-900`}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white mb-1 flex items-center">
                                    <span className="mr-2 text-indigo-500 dark:text-indigo-300">{index + 1}.</span> {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10">
                <button 
                    onClick={onBack} 
                    className={buttonClasses(true, true)}
                >
                    <Check className="w-5 h-5 mr-2" /> 開始您的旅程
                </button>
            </div>
        </div>
    );
};


// --- App 主要元件 ---

const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'tripDetail' or 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false); // 深色模式狀態

    // 認證與 Firebase 監聽
    useEffect(() => {
        if (!auth) return;
        
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase authentication error:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setAuthReady(true);
            } else {
                setUserId(null);
                setAuthReady(false);
            }
        });

        authenticate();
        return () => unsubscribe();
    }, []);

    // 監聽行程列表
    useEffect(() => {
        if (!authReady || !userId) return;

        const tripsQuery = query(getTripCollectionRef(userId), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
            const tripsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTrips(tripsList);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 處理行程選擇
    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('tripDetail');
    }, []);

    // 返回儀表板
    const handleBackToDashboard = useCallback(() => {
        setCurrentView('dashboard');
        setSelectedTripId(null);
    }, []);
    
    // 進入教學頁面
    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
    }, []);

    // 切換深色模式
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    if (!authReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    // 主應用程式結構
    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800'}`}>
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
                    <Header 
                        title="應用程式教學" 
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial}
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
