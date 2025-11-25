import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, 
    GoogleAuthProvider, signInWithPopup, signOut 
} from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, where, serverTimestamp, arrayUnion, arrayRemove, orderBy
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, Bell, ChevronLeft, CalendarDays, LogOut, Map, 
    User, UserPlus, Sun, Moon, AlertTriangle, BookOpenText, Check, Clock, Edit, Send
} from 'lucide-react';

// --- Firebase 設定 ---
const firebaseConfig = {
    apiKey: "process.env.VITE_FIREBASE_API_KEY", // <-- 必須
    authDomain: "process.env.VITE_FIREBASE_AUTH_DOMAIN", // <-- 必須
    projectId: "process.env.VITE_FIREBASE_PROJECT_ID", // <-- 必須
    storageBucket: "process.env.VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "process.env.VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "process.env.VITE_FIREBASE_APP_ID" // <-- 必須
};

// 初始化 Firebase 服務
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // 可選：設定日誌級別以便調試
    // setLogLevel('debug'); 
} catch (error) {
    console.error("Firebase 初始化失敗:", error);
}

// Firestore 路徑：使用私有資料集
const getTripsCollectionRef = (userId) => 
    collection(db, `artifacts/${appId}/users/${userId}/trips`);

const getTripDocRef = (userId, tripId) => 
    doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId);

// --- UI 組件：Header ---
const Header = ({ title, onBack, userId, isDarkMode, toggleDarkMode, onProfileClick }) => {
    const AuthButton = () => {
        const provider = new GoogleAuthProvider();
        
        const handleGoogleSignIn = async () => {
            try {
                // 執行 Google 彈出視窗登入
                await signInWithPopup(auth, provider);
            } catch (error) {
                console.error("Google 登入失敗:", error);
            }
        };

        if (userId && userId.length > 10) { 
            return (
                <button
                    onClick={onProfileClick}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="使用者設定與登出"
                >
                    <User className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </button>
            );
        } else {
            return (
                <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center space-x-2 px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg"
                >
                    <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Google Icon SVG for minimal config */}
                        <path d="M44.5 20H24V28H35.5C34.6 30.2 33 32 31 33.3L37 38.6C40.6 35.3 43 31 44.5 27V20Z" fill="#4285F4"/>
                        <path d="M24 44C30.6 44 36.3 41.8 40.5 38.6L34.5 33.3C32.1 34.9 29.3 36 26 36C20.3 36 15.3 32.2 13.5 27.5L7.5 32.2C10.7 38.2 17 42 24 42C26 42 28 41.7 29.8 41.2L34.5 45.4C32.7 46.1 30.6 46.5 28.5 46.5C18.6 46.5 10.1 40 6 30.5L12 25.8C13.8 30.5 18.8 34 24 34C26.5 34 28.9 33.5 31 32.6L37 38C34.8 39.7 32.5 40.8 30 41.5L34.5 45.4ZM24 10C26.7 10 29.2 11 31.3 12.5L36 7.8C32.7 5.2 28.6 4 24 4C18.6 4 13.6 6 9.5 9.7L15.5 14.4C17.3 11.7 20.3 10 24 10Z" fill="#34A853"/>
                        <path d="M7.5 20H24V28H7.5V20Z" fill="#FBBC05"/>
                        <path d="M12.5 14.4L6.5 9.7C4 13 2.5 17 2.5 20H7.5V14.4Z" fill="#EA4335"/>
                    </svg>
                    <span>Google 登入</span>
                </button>
            );
        }
    };

    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto p-4 flex justify-between items-center max-w-7xl">
                <div className="flex items-center space-x-2">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="返回"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate max-w-[60vw]">{title}</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        aria-label="切換深色模式"
                    >
                        {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-500" />}
                    </button>
                    <AuthButton />
                </div>
            </div>
        </header>
    );
};

// --- 組件：TripCard ---
const TripCard = ({ trip, onSelectTrip }) => {
    const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }) : 'N/A';
    const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }) : 'N/A';
    
    // 隨機選擇主題色
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-indigo-500', 'bg-orange-500', 'bg-pink-500'];
    const color = colors[trip.id.charCodeAt(0) % colors.length];

    return (
        <div 
            onClick={() => onSelectTrip(trip.id)}
            className={`p-4 rounded-xl shadow-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300 ${color} text-white`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold mb-1 truncate max-w-[90%]">{trip.name}</h3>
                    <p className="text-sm opacity-90 font-medium flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1 opacity-75" />
                        {startDate} - {endDate}
                    </p>
                </div>
                <div className="text-right text-sm font-semibold p-1 bg-black/10 rounded-full min-w-[70px] text-center">
                    <p>{trip.members.length} 成員</p>
                </div>
            </div>
        </div>
    );
};

// --- 組件：RemindersSection (提醒事項) ---
const RemindersSection = ({ tripId, userId }) => {
    // 使用子集合的路徑
    const remindersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/trips/${tripId}/reminders`);
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // 實時監聽提醒事項
    useEffect(() => {
        if (!tripId || !userId) return;

        // 查詢：按時間戳升序排列 (最新的在最下面)
        const q = query(remindersCollectionRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReminders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReminders(fetchedReminders);
        }, (error) => {
            console.error("Reminders 監聽失敗:", error);
            setStatusMessage({ type: 'error', text: '載入提醒失敗。' });
        });

        return () => unsubscribe();
    }, [tripId, userId]);

    const handleAddReminder = async () => {
        if (!newReminder.trim()) {
            setStatusMessage({ type: 'error', text: '提醒內容不能為空。' });
            return;
        }
        setStatusMessage({ type: '', text: '' });
        try {
            await addDoc(remindersCollectionRef, {
                text: newReminder.trim(),
                isCompleted: false,
                timestamp: serverTimestamp(),
                createdBy: userId,
            });
            setNewReminder('');
        } catch (error) {
            console.error("新增提醒失敗:", error);
            setStatusMessage({ type: 'error', text: '新增失敗，請檢查權限。' });
        }
    };

    const handleToggleCompleted = async (reminderId, isCompleted) => {
        try {
            const reminderRef = doc(remindersCollectionRef, reminderId);
            await updateDoc(reminderRef, {
                isCompleted: !isCompleted,
            });
        } catch (error) {
            console.error("更新提醒狀態失敗:", error);
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        try {
            await deleteDoc(doc(remindersCollectionRef, reminderId));
        } catch (error) {
            console.error("刪除提醒失敗:", error);
        }
    };

    return (
        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                協作提醒事項
            </h3>
            
            {/* 新增提醒輸入框 */}
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="新增重要提醒或待辦事項"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()}
                    className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                    onClick={handleAddReminder}
                    className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center shadow-md"
                    aria-label="新增提醒"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            {statusMessage.text && (
                 <p className={`mb-3 text-sm font-medium ${statusMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{statusMessage.text}</p>
            )}

            {/* 提醒事項列表 */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {reminders.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">沒有待辦提醒，旅程一切就緒！</p>
                ) : (
                    reminders.map(reminder => (
                        <div 
                            key={reminder.id} 
                            className={`flex items-center p-3 rounded-lg transition-all border ${reminder.isCompleted ? 'bg-green-50 dark:bg-gray-700/50 line-through text-gray-500 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                        >
                            <button
                                onClick={() => handleToggleCompleted(reminder.id, reminder.isCompleted)}
                                className={`p-1 mr-3 rounded-full border-2 transition-colors flex-shrink-0 ${reminder.isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-400 dark:border-gray-500 text-transparent hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                aria-label={reminder.isCompleted ? '標記為未完成' : '標記為已完成'}
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <span className="flex-grow dark:text-white text-sm break-words pr-2">{reminder.text}</span>
                            <button
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="ml-2 p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex-shrink-0"
                                aria-label="刪除提醒"
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

// --- 組件：MembersSection (成員管理) ---
const MembersSection = ({ tripId, currentTrip, userId }) => {
    const [newMemberId, setNewMemberId] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAddMember = async () => {
        const idToAdd = newMemberId.trim();
        if (!idToAdd) {
            setMessage({ type: 'error', text: '請輸入有效的用戶 ID/Email' });
            return;
        }

        // 避免重複添加
        if (currentTrip.members.includes(idToAdd)) {
            setMessage({ type: 'error', text: '此用戶已在成員列表中。' });
            setNewMemberId('');
            return;
        }

        try {
            // 由於安全性限制，行程只能由創建者或指定用戶存取。
            // 這裡我們假設 tripId 存在於當前用戶的路徑下，我們將新成員 ID 加入成員陣列。
            // 在一個真正的公開協作應用中，這一步需要額外的安全規則或中介服務。
            const tripRef = getTripDocRef(userId, tripId);
            
            await updateDoc(tripRef, {
                members: arrayUnion(idToAdd), // 加入新成員 ID
            });
            
            setMessage({ type: 'success', text: `已成功邀請 ${idToAdd}。` });
            setNewMemberId('');

        } catch (error) {
            console.error("新增成員失敗:", error);
            setMessage({ type: 'error', text: '新增成員失敗。請檢查 ID 或網路狀態。' });
        }
    };
    
    // 顯示成員列表
    const renderMembers = currentTrip?.members?.map((member, index) => (
        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <User className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span className="text-sm dark:text-white truncate flex-grow">{member}</span>
            {member === userId && <span className="text-xs font-semibold text-green-500 flex-shrink-0">(您)</span>}
        </div>
    ));

    return (
        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                行程成員 ({currentTrip?.members?.length || 0})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-40 overflow-y-auto pr-2">
                {renderMembers}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium dark:text-white mb-2">邀請新成員 (輸入其 User ID)</p>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="輸入 User ID/Email"
                        value={newMemberId}
                        onChange={(e) => setNewMemberId(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                        onClick={handleAddMember}
                        className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center shadow-md"
                        title="新增成員"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>
                {message.text && (
                    <p className={`mt-2 text-sm font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

// --- 組件：ItinerarySection (行程日曆規劃) ---
// 這裡僅提供一個骨架，讓使用者知道可以新增功能
const ItinerarySection = ({ currentTrip }) => {
    // 假設行程資料中有一個 'dailyItinerary' 陣列
    const dailyItinerary = currentTrip?.dailyItinerary || [];
    
    // 計算天數
    const days = dailyItinerary.length > 0 ? dailyItinerary.length : 
        (currentTrip.startDate && currentTrip.endDate) 
            ? Math.floor((new Date(currentTrip.endDate) - new Date(currentTrip.startDate)) / (1000 * 60 * 60 * 24)) + 1 
            : 0;

    return (
        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <Map className="w-5 h-5 mr-2 text-indigo-500" />
                每日行程規劃 ({days} 天)
            </h3>
            
            {days > 0 ? (
                <div className="space-y-3">
                    {/* 這裡應該渲染每日的行程卡片 */}
                    {[...Array(days)].map((_, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                            <span className="font-medium dark:text-white">Day {index + 1}</span>
                            <span className="text-sm text-indigo-500 cursor-pointer hover:text-indigo-400 flex items-center">
                                <Edit className="w-4 h-4 mr-1" /> 編輯細節
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">請設定行程日期以開始規劃每日行程。</p>
            )}
        </div>
    );
};

// --- 組件：TripDetail (行程詳情) ---
const TripDetail = ({ tripId, onBack, userId, authReady }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // 實時監聽單個行程資料
    useEffect(() => {
        if (!tripId || !authReady) return;

        const tripRef = getTripDocRef(userId, tripId);

        setIsLoading(true);
        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.warn("行程不存在或權限不足，將返回儀表板。");
                onBack(); // 回到儀表板
            }
            setIsLoading(false);
        }, (err) => {
            console.error("行程詳情監聽失敗:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, userId, authReady, onBack]);

    // 儲存/更新行程基本資訊
    const handleSaveTrip = async () => {
        if (!trip.name || !trip.startDate || !trip.endDate) {
            // 這裡應該用自訂 Modal 顯示錯誤
            alert("請填寫所有必要的行程資訊。");
            return;
        }
        try {
            const tripRef = getTripDocRef(userId, tripId);
            await updateDoc(tripRef, {
                name: trip.name,
                startDate: trip.startDate,
                endDate: trip.endDate,
            });
            setIsEditing(false);
        } catch (err) {
            console.error("更新行程失敗:", err);
            alert("儲存失敗，請重試。");
        }
    };
    
    // 刪除行程
    const handleDeleteTrip = async () => {
        if (!window.confirm("確定要永久刪除這個行程嗎？")) return;
        try {
            await deleteDoc(getTripDocRef(userId, tripId));
            onBack();
        } catch (err) {
            console.error("刪除行程失敗:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="ml-3 text-lg dark:text-gray-300">正在載入行程詳情...</p>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
            <Header 
                title={trip.name} 
                onBack={onBack} 
                userId={userId} 
                isDarkMode={false} // 不在詳情頁切換模式
                toggleDarkMode={() => {}}
            />
            
            <main className="container mx-auto p-4 max-w-4xl">
                
                {/* 基本資訊卡片 */}
                <div className="p-5 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-4 border border-indigo-500/50">
                    <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                            <CalendarDays className="w-6 h-6 mr-2 text-indigo-500" />
                            行程總覽
                        </h2>
                        <button
                            onClick={() => setIsEditing(prev => !prev)}
                            className="px-3 py-1 text-sm font-medium rounded-full transition-colors flex items-center 
                                       shadow-md border border-gray-300 dark:border-gray-600 
                                       text-gray-700 dark:text-gray-300 hover:bg-indigo-500 hover:text-white"
                        >
                            {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                            {isEditing ? '取消' : '編輯'}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['name', 'startDate', 'endDate'].map(key => (
                             <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                                    {key === 'name' ? '名稱' : key === 'startDate' ? '開始日期' : '結束日期'}
                                </label>
                                <input
                                    type={key === 'name' ? 'text' : 'date'}
                                    value={trip[key] || ''}
                                    onChange={(e) => setTrip(prev => ({ ...prev, [key]: e.target.value }))}
                                    readOnly={!isEditing}
                                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white transition-all 
                                        ${isEditing ? 'border-indigo-500 focus:ring-indigo-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}
                                />
                            </div>
                        ))}
                    </div>
                    
                    {isEditing && (
                        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={handleDeleteTrip}
                                className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> 刪除
                            </button>
                            <button
                                onClick={handleSaveTrip}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg"
                            >
                                <Save className="w-4 h-4 mr-2" /> 儲存變更
                            </button>
                        </div>
                    )}
                </div>

                {/* 主要功能區塊：多用戶與提醒 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <MembersSection 
                        tripId={tripId} 
                        currentTrip={trip}
                        userId={userId} 
                    />
                    <RemindersSection 
                        tripId={tripId} 
                        userId={userId} 
                    />
                </div>
                
                {/* 行程日曆與其他模塊 */}
                <div className="space-y-6">
                    <ItinerarySection currentTrip={trip} />
                    
                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-xl flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
                        <PiggyBank className="w-6 h-6 text-teal-500" />
                        <h3 className="text-lg font-semibold dark:text-white">共同預算管理 (待開發)</h3>
                    </div>
                    
                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-xl flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
                        <Briefcase className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-semibold dark:text-white">文件與票券庫 (待開發)</h3>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- 組件：Dashboard (儀表板) ---
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart, onProfileClick }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    // 排序行程：即將到來的優先
    const sortedTrips = useMemo(() => {
        if (!trips) return [];
        return trips.slice().sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
            return dateA - dateB; 
        });
    }, [trips]);

    const handleCreateTrip = async () => {
        if (!newTripName.trim() || !newTripStartDate || !newTripEndDate || !authReady) {
            setStatusMessage({ type: 'error', text: '請填寫所有欄位並確認已登入。' });
            return;
        }
        
        // 確保結束日期不早於開始日期
        if (new Date(newTripStartDate) > new Date(newTripEndDate)) {
             setStatusMessage({ type: 'error', text: '結束日期不能早於開始日期。' });
             return;
        }

        setStatusMessage({ type: '', text: '' });
        
        try {
            await addDoc(getTripsCollectionRef(userId), {
                name: newTripName.trim(),
                startDate: newTripStartDate,
                endDate: newTripEndDate,
                members: [userId], // 初始成員為建立者
                createdAt: serverTimestamp(),
            });
            setNewTripName('');
            setNewTripStartDate('');
            setNewTripEndDate('');
            setIsCreating(false);
        } catch (error) {
            console.error("創建行程失敗:", error);
            setStatusMessage({ type: 'error', text: '創建行程失敗，請檢查網路或權限。' });
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <Header 
                title="一起旅行 Travel Together" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                onProfileClick={onProfileClick}
            />
            <main className="container mx-auto p-4 max-w-4xl">
                {/* 狀態提示 */}
                {!authReady && (
                    <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg mb-6 flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        <p className="font-semibold text-sm">正在驗證身份中，請稍候...</p>
                    </div>
                )}
                {/* 行程列表 */}
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex justify-between items-center">
                    我的行程
                    <button 
                        onClick={onTutorialStart}
                        className="text-sm flex items-center text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        <BookOpenText className="w-4 h-4 mr-1" />
                        教學指南
                    </button>
                </h2>
                
                <div className="space-y-4 mb-8">
                    {trips === null ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            <p>正在載入您的行程...</p>
                        </div>
                    ) : sortedTrips.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-300">您還沒有建立任何行程。點擊下方按鈕開始規劃吧！</p>
                        </div>
                    ) : (
                        sortedTrips.map(trip => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onSelectTrip={onSelectTrip} 
                            />
                        ))
                    )}
                </div>

                {/* 新增行程表單/按鈕 */}
                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        新增旅行規劃
                    </button>
                ) : (
                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-4 border border-indigo-300 dark:border-indigo-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">規劃新行程</h3>
                        {statusMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${statusMessage.type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'}`}>
                                {statusMessage.text}
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="行程名稱 (例如: 東京美食之旅 2026)"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <div className="flex space-x-4">
                            <input
                                type="date"
                                placeholder="開始日期"
                                value={newTripStartDate}
                                onChange={(e) => setNewTripStartDate(e.target.value)}
                                className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="date"
                                placeholder="結束日期"
                                value={newTripEndDate}
                                onChange={(e) => setNewTripEndDate(e.target.value)}
                                className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => { setIsCreating(false); setStatusMessage({ type: '', text: '' }); }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreateTrip}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" /> 儲存行程
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- 組件：UserProfileView (使用者設定/個人檔案) ---
const UserProfileView = ({ user, onBack, handleSignOut }) => {
    const isAnonymous = user.isAnonymous;
    const name = user.displayName || (isAnonymous ? '匿名使用者' : '已登入用戶');
    const email = user.email || 'N/A';
    // 簡單的頭像佔位符
    const photoURL = user.photoURL || `https://placehold.co/100x100/A3A3A3/FFFFFF?text=${name.charAt(0)}`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <Header 
                title="個人檔案與設定" 
                onBack={onBack} 
                userId={user.uid} 
                isDarkMode={false} 
                toggleDarkMode={() => {}}
            />
            <main className="container mx-auto p-4 max-w-lg">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
                    <img
                        src={photoURL}
                        alt="使用者頭像"
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500 object-cover"
                    />
                    
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{email}</p>

                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium dark:text-white">使用者 ID (用於協作)</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 break-all">{user.uid}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium dark:text-white">帳戶類型</span>
                            <span className={`text-sm font-semibold ${isAnonymous ? 'text-yellow-600' : 'text-green-600'}`}>
                                {isAnonymous ? '匿名模式' : 'Google 驗證'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full mt-8 flex items-center justify-center py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> 登出
                    </button>
                    
                    {isAnonymous && (
                        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                            <p className="text-sm">您目前是匿名登入。請使用 Google 登入以啟用多人協作與資料同步。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// --- 主應用程式 App ---
const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'profile'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // --- Dark Mode 邏輯 ---
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // --- Firebase Auth 處理 ---
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase 初始登入失敗:", error);
            }
        };

        // 設置 Auth 狀態監聽
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null); 
            }
            setAuthReady(true);
        });

        // 如果當前沒有用戶，則執行初始登入
        if (!auth.currentUser) {
            initializeAuth();
        }

        return () => unsubscribe();
    }, []);

    // --- Firestore 數據監聽 ---
    useEffect(() => {
        if (!authReady || !userId) {
            setTrips([]); 
            return;
        }

        // 查詢所有包含當前 userId 的行程（實現協作查詢）
        // 注意：這裡假設所有行程都存在於 'userId' 的私有集合中，並依賴 security rules
        const q = query(
            getTripsCollectionRef(userId), 
            where('members', 'array-contains', userId)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("行程數據監聽失敗:", error);
            setTrips([]);
        });

        return () => unsubscribe();
    }, [userId, authReady]);
    
    // --- 導航處理 ---
    const handleSelectTrip = useCallback((id) => {
        setSelectedTripId(id);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setCurrentView('dashboard');
        setSelectedTripId(null);
    }, []);
    
    const handleProfileClick = useCallback(() => {
        setCurrentView('profile');
    }, []);
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setCurrentView('dashboard');
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };
    
    const handleStartTutorial = useCallback(() => {
        // 由於您要求最少文檔，這裡簡單地跳轉，如果需要完整的 TutorialView，請告知
        alert("教學指南：\n1. Google 登入以保存資料。\n2. 新增行程並輸入日期。\n3. 在詳情頁面分享 User ID 給旅伴進行協作。\n4. 使用提醒事項功能確保不遺漏任何事情。");
    }, []);

    // 獲取當前用戶對象，用於 ProfileView
    const currentUser = auth.currentUser;

    // --- 應用程式渲染 ---
    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} font-sans`}>
            
            {!authReady && (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="ml-3 text-lg dark:text-gray-300">正在準備應用程式...</p>
                </div>
            )}
            
            {authReady && currentView === 'dashboard' && (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onTutorialStart={handleStartTutorial}
                    onProfileClick={handleProfileClick}
                />
            )}
            
            {authReady && currentView === 'tripDetail' && selectedTripId && (
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    authReady={authReady}
                />
            )}

            {authReady && currentView === 'profile' && currentUser && (
                <UserProfileView 
                    user={currentUser}
                    onBack={handleBackToDashboard} 
                    handleSignOut={handleSignOut}
                />
            )}
            
        </div>
    );
};

export default App;
