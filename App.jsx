import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc,
    query, orderBy, serverTimestamp, where
} from 'firebase/firestore';
import { 
    Briefcase, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Bus, ChevronLeft, CalendarDays, 
    Sun, Moon, Map, Edit, AlignLeft, LogIn, MessageSquareText
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
    // 可選：啟用 Firestore 偵錯日誌
    // import { setLogLevel } from 'firebase/firestore';
    // setLogLevel('debug');
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// Tailwind CSS 輔助類別
const primaryColor = 'indigo-600';
const accentColor = 'teal-500';

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-${primaryColor} outline-none transition duration-150`;
const buttonPrimaryClasses = `w-full px-4 py-3 bg-${primaryColor} text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md flex items-center justify-center space-x-2`;
const buttonSecondaryClasses = `w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 flex items-center justify-center space-x-2`;

// Tab 按鈕樣式
const tabClasses = (isActive) => 
    `flex-1 py-3 px-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
        isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
        : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700'
    }`;

/**
 * 格式化日期為 YYYY-MM-DD
 * @param {Date | {seconds: number, nanoseconds: number}} dateObj 
 * @returns {string}
 */
const formatDate = (dateObj) => {
    if (!dateObj) return '';
    let date;
    if (dateObj.seconds) {
        // 處理 Firestore Timestamp
        date = new Date(dateObj.seconds * 1000);
    } else if (dateObj instanceof Date) {
        date = dateObj;
    } else {
        return '';
    }
    return date.toISOString().split('T')[0];
};

// --- TripDetail 的子元件定義 (保留功能) ---

const NoteEditor = ({ note, onSave, onCancel, tripId, userId }) => {
    const [title, setTitle] = useState(note.title || '');
    const [content, setContent] = useState(note.content || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!title || !content) return alert('標題和內容不能為空！');
        setIsLoading(true);
        const noteData = {
            title,
            content,
            updatedAt: serverTimestamp(),
            tripId,
            userId,
        };

        try {
            if (note.id) {
                // 更新現有筆記
                const noteRef = doc(db, 'artifacts', appId, 'users', userId, 'notes', note.id);
                await updateDoc(noteRef, noteData);
            } else {
                // 新增筆記
                await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'notes'), {
                    ...noteData,
                    createdAt: serverTimestamp(),
                });
            }
            onSave();
        } catch (error) {
            console.error('儲存筆記失敗:', error);
            alert('儲存筆記失敗，請檢查控制台。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="筆記標題"
                className={inputClasses}
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="筆記內容..."
                rows="8"
                className={`${inputClasses} resize-none`}
            ></textarea>
            <div className="flex space-x-4">
                <button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className={buttonPrimaryClasses}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{note.id ? '更新' : '新增'}筆記</span>
                </button>
                <button 
                    onClick={onCancel} 
                    className={buttonSecondaryClasses}
                >
                    <X className="w-5 h-5" />
                    <span>取消</span>
                </button>
            </div>
        </div>
    );
};


const NotesTab = ({ tripId, userId, notes, isDarkMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentNote, setCurrentNote] = useState(null);

    const handleNewNote = () => {
        setCurrentNote({});
        setIsEditing(true);
    };

    const handleEditNote = (note) => {
        setCurrentNote(note);
        setIsEditing(true);
    };

    const handleDeleteNote = async (noteId) => {
        // 使用自定義 modal 替代 window.confirm
        const isConfirmed = window.confirm("確定要刪除這條筆記嗎？"); // 在 Canvas 環境中，我們仍需依賴自帶的確認框
        if (!isConfirmed) return;

        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'notes', noteId));
        } catch (error) {
            console.error('刪除筆記失敗:', error);
            alert('刪除筆記失敗，請檢查控制台。');
        }
    };

    if (isEditing) {
        return (
            <div className={cardClasses}>
                <h3 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">{currentNote.id ? '編輯筆記' : '新增筆記'}</h3>
                <NoteEditor 
                    note={currentNote} 
                    onSave={() => setIsEditing(false)} 
                    onCancel={() => setIsEditing(false)} 
                    tripId={tripId} 
                    userId={userId}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button 
                onClick={handleNewNote} 
                className={`${buttonPrimaryClasses} !w-auto mx-auto`}
            >
                <Plus className="w-5 h-5" />
                <span>新增旅行筆記</span>
            </button>
            
            {notes.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <NotebookPen className="w-8 h-8 mx-auto text-indigo-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">尚未有任何筆記，點擊上方按鈕開始記錄您的點滴。</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notes.map(note => (
                        <div key={note.id} className={`${cardClasses} p-4 flex justify-between items-start`}>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50 truncate">{note.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{note.content}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    更新於: {formatDate(note.updatedAt || note.createdAt)}
                                </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button 
                                    onClick={() => handleEditNote(note)} 
                                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-gray-700 rounded-full transition"
                                    title="編輯"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteNote(note.id)} 
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition"
                                    title="刪除"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [notes, setNotes] = useState([]);
    const [activeTab, setActiveTab] = useState('notes'); // itinerary, budget, notes, location
    const [isLoading, setIsLoading] = useState(true);

    // 1. 監聽行程資料
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        const tripRef = doc(db, 'artifacts', appId, 'users', userId, 'trips', tripId);
        
        const unsubscribeTrip = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.warn("Trip not found!");
                onBack(); // 回到儀表板
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            setIsLoading(false);
        });

        return () => unsubscribeTrip();
    }, [authReady, userId, tripId, onBack]);

    // 2. 監聽筆記資料
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        // 查詢當前行程的所有筆記，並按更新時間排序
        const notesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'notes');
        const q = query(notesCollectionRef, where('tripId', '==', tripId), orderBy('updatedAt', 'desc'));

        const unsubscribeNotes = onSnapshot(q, (snapshot) => {
            const fetchedNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotes(fetchedNotes);
        }, (error) => {
            console.error("Error fetching notes:", error);
        });

        return () => unsubscribeNotes();
    }, [authReady, userId, tripId]);


    // 處理通知計數
    const notificationCounts = useMemo(() => {
        return {
            notes: notes.length > 0 ? notes.length : 0, 
        };
    }, [notes]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'itinerary':
                return <div className={`${cardClasses} min-h-64`}><h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">行程規劃 (尚未實作)</h3><p className="mt-2 text-gray-600 dark:text-gray-400">這裡是詳細的行程安排與活動列表。</p></div>;
            case 'budget':
                return <div className={`${cardClasses} min-h-64`}><h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">預算追蹤 (尚未實作)</h3><p className="mt-2 text-gray-600 dark:text-gray-400">這裡是支出紀錄、預算設定和統計圖表。</p></div>;
            case 'notes':
                return <NotesTab tripId={tripId} userId={userId} notes={notes} isDarkMode={isDarkMode} />;
            case 'location':
                return <div className={`${cardClasses} min-h-64`}><h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">地點資訊 (尚未實作)</h3><p className="mt-2 text-gray-600 dark:text-gray-400">這裡是地圖、POI 點和路線規劃。</p></div>;
            default:
                return null;
        }
    };

    if (isLoading || !trip) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600">載入行程細節中...</span>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {/* 頂部導航 */}
            <header className="flex items-center justify-between mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                >
                    <ChevronLeft className="w-6 h-6 mr-1" />
                    <span className="text-lg font-semibold">返回儀表板</span>
                </button>
            </header>

            {/* 行程標題卡片 */}
            <div className={`${cardClasses} mb-6`}>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">{trip.name}</h1>
                <p className="text-sm text-indigo-500 dark:text-indigo-300 mt-1 font-medium">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-wrap">{trip.description}</p>
            </div>

            {/* 標籤頁導航 */}
            <div className={`flex bg-gray-100 dark:bg-gray-700 p-2 rounded-xl mb-6 shadow-inner overflow-x-auto whitespace-nowrap`}>
                {[
                    // { id: 'itinerary', name: '行程', icon: CalendarDays },
                    // { id: 'budget', name: '預算', icon: PiggyBank },
                    { id: 'notes', name: '筆記', icon: NotebookPen },
                    { id: 'location', name: '地點', icon: MapPin },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'} `} />
                            <span className="ml-1">{tab.name}</span>
                            {notificationCounts[tab.id] > 0 && (
                                <span className={`ml-2 text-xs font-bold rounded-full px-2 py-0.5 ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                                    {notificationCounts[tab.id]}
                                </span>
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


const TripForm = ({ onSave, onCancel, initialTrip = {} }) => {
    const [name, setName] = useState(initialTrip.name || '');
    const [startDate, setStartDate] = useState(formatDate(initialTrip.startDate) || '');
    const [endDate, setEndDate] = useState(formatDate(initialTrip.endDate) || '');
    const [description, setDescription] = useState(initialTrip.description || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate) return alert('行程名稱、開始日期和結束日期不能為空。');
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) return alert('開始日期不能晚於結束日期。');
        
        setIsLoading(true);

        try {
            const tripData = {
                name,
                startDate: start,
                endDate: end,
                description,
                updatedAt: serverTimestamp(),
            };

            const userId = auth.currentUser?.uid;

            if (initialTrip.id) {
                // 更新現有行程
                const tripRef = doc(db, 'artifacts', appId, 'users', userId, 'trips', initialTrip.id);
                await updateDoc(tripRef, tripData);
            } else {
                // 新增行程
                await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'trips'), {
                    ...tripData,
                    createdAt: serverTimestamp(),
                });
            }
            onSave();
        } catch (error) {
            console.error('儲存行程失敗:', error);
            alert('儲存行程失敗，請檢查控制台。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <input
                type="text"
                placeholder="行程名稱 (例如：北海道五日遊)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
            />
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">開始日期</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">結束日期</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClasses}
                    />
                </div>
            </div>
            <textarea
                placeholder="行程描述/目的地概要"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClasses} resize-none`}
            ></textarea>
            <div className="flex space-x-4">
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className={buttonPrimaryClasses}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{initialTrip.id ? '更新行程' : '建立行程'}</span>
                </button>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={buttonSecondaryClasses}
                >
                    <X className="w-5 h-5" />
                    <span>取消</span>
                </button>
            </div>
        </form>
    );
};

// --- 簡化後的用戶資訊顯示元件 (符合 Google 帳號顯示要求) ---
const SimpleUserHeader = ({ user, toggleDarkMode, isDarkMode }) => {
    // 獲取用戶名、頭像和電子郵件 (優先使用 Google 提供的，若無則使用模擬/匿名資訊)
    const displayName = user.displayName || `用戶 ${user.uid?.substring(0, 4) || '匿名'}`;
    const email = user.email || '未提供電子郵件';
    const photoURL = user.photoURL;
    const fallbackInitial = displayName.charAt(0);

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                {photoURL ? (
                    <img 
                        src={photoURL} 
                        alt="User Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/4F46E5/FFFFFF?text=${fallbackInitial}`; }}
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {fallbackInitial}
                    </div>
                )}
                <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
                </div>
            </div>

            <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={isDarkMode ? '切換至淺色模式' : '切換至深色模式'}
            >
                {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
            </button>
        </div>
    );
};

const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, user }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);

    const handleEdit = (trip) => {
        setEditingTrip(trip);
        setIsAdding(true);
    };

    const handleDelete = async (tripId) => {
        // 使用自定義 modal 替代 window.confirm
        const isConfirmed = window.confirm("確定要刪除此行程嗎？此操作無法恢復。");
        if (!isConfirmed) return;

        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'trips', tripId));
        } catch (error) {
            console.error('刪除行程失敗:', error);
            alert('刪除行程失敗，請檢查控制台。');
        }
    };
    
    // 計算統計數據 (假設今天為 2025-11-25)
    const now = new Date('2025-11-25'); 
    
    const stats = useMemo(() => {
        let active = 0;
        let future = 0;
        
        trips.forEach(trip => {
            const start = trip.startDate?.seconds ? new Date(trip.startDate.seconds * 1000) : new Date(trip.startDate);
            const end = trip.endDate?.seconds ? new Date(trip.endDate.seconds * 1000) : new Date(trip.endDate);

            if (start <= now && end >= now) {
                active++;
            } else if (start > now) {
                future++;
            }
        });

        return { total: trips.length, active, future };
    }, [trips]);

    // 儀表板卡片
    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className={`p-4 ${cardClasses} flex items-center space-x-4`}>
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/50`}>
                <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
            </div>
        </div>
    );
    

    if (isAdding) {
        return (
            <div className="p-4 sm:p-6 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">{editingTrip ? '編輯行程' : '新增行程'}</h1>
                <div className={cardClasses}>
                    <TripForm 
                        onSave={() => { setIsAdding(false); setEditingTrip(null); }} 
                        onCancel={() => { setIsAdding(false); setEditingTrip(null); }} 
                        initialTrip={editingTrip}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            {/* 簡潔的用戶資訊顯示 (頭像和名稱) */}
            <SimpleUserHeader user={user} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
            
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">我的旅行儀表板</h1>
                <button 
                    onClick={() => { setIsAdding(true); setEditingTrip(null); }} 
                    className={`${buttonPrimaryClasses} !w-auto px-4 py-2 text-sm`}
                >
                    <Plus className="w-5 h-5" />
                    <span>新增行程</span>
                </button>
            </header>

            {/* 統計概覽 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="總行程數" value={stats.total} icon={Briefcase} color="indigo" />
                <StatCard title="進行中的行程" value={stats.active} icon={Bus} color="teal" />
                <StatCard title="未來行程" value={stats.future} icon={CalendarDays} color="pink" />
            </div>

            {/* 行程列表 */}
            <div className={cardClasses}>
                <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">所有行程</h2>
                {trips.length === 0 ? (
                    <div className="text-center p-10 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Map className="w-10 h-10 mx-auto text-indigo-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">點擊「新增行程」開始您的第一次旅行規劃！</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trips.map(trip => (
                            <div 
                                key={trip.id} 
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600"
                                onClick={() => onSelectTrip(trip.id)}
                            >
                                <div className="flex-1 min-w-0 pr-4 mb-2 sm:mb-0">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 truncate">{trip.name}</h3>
                                    <p className="text-sm text-indigo-500 dark:text-indigo-300 font-medium">
                                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{trip.description || '無描述'}</p>
                                </div>
                                <div className="flex space-x-2 items-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onSelectTrip(trip.id); }}
                                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-gray-800 rounded-full transition"
                                        title="查看詳情"
                                    >
                                        <AlignLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(trip); }}
                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-full transition"
                                        title="編輯"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-800 rounded-full transition"
                                        title="刪除"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 新增：非用戶登入查看的參考例子介面 ---
const ExampleView = ({ isDarkMode, toggleDarkMode }) => {
    // 範例行程資料
    const mockTrips = [
        { id: '1', name: '日本東京經典之旅', startDate: new Date('2025-04-10'), endDate: new Date('2025-04-17'), description: '探索淺草寺、澀谷和新宿的文化與現代融合。' },
        { id: '2', name: '阿爾卑斯山徒步與賞景', startDate: new Date('2025-08-01'), endDate: new Date('2025-08-14'), description: '挑戰馬特宏峰周邊步道，享受壯麗山景。' },
        { id: '3', name: '台南美食與歷史巡禮', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-23'), description: '品嚐道地小吃，參觀赤崁樓和安平古堡。' },
    ];
    
    // 計算統計數據 (使用今天的日期作為參考)
    const now = new Date(); 
    
    const stats = useMemo(() => {
        let active = 0;
        let future = 0;
        
        mockTrips.forEach(trip => {
            if (trip.startDate <= now && trip.endDate >= now) {
                active++;
            } else if (trip.startDate > now) {
                future++;
            }
        });

        return { total: mockTrips.length, active, future };
    }, []);

    // 儀表板卡片
    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className={`p-4 ${cardClasses} flex items-center space-x-4`}>
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/50`}>
                <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <LogIn className="w-10 h-10 p-2 rounded-full bg-red-600 text-white" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-50">訪客模式</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">請登入以存取您的私人行程。</p>
                    </div>
                </div>

                <button 
                    onClick={toggleDarkMode} 
                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title={isDarkMode ? '切換至淺色模式' : '切換至深色模式'}
                >
                    {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
                </button>
            </div>
            
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">參考範例行程</h1>
                <button 
                    onClick={() => alert("請先登入才能新增行程！")} 
                    className={`${buttonPrimaryClasses} !w-auto px-4 py-2 text-sm opacity-50 cursor-not-allowed`}
                    disabled
                >
                    <Plus className="w-5 h-5" />
                    <span>新增行程 (登入後可用)</span>
                </button>
            </header>

            {/* 統計概覽 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="總範例行程數" value={stats.total} icon={Briefcase} color="indigo" />
                <StatCard title="進行中的範例" value={stats.active} icon={Bus} color="teal" />
                <StatCard title="未來範例" value={stats.future} icon={CalendarDays} color="pink" />
            </div>

            {/* 行程列表 */}
            <div className={cardClasses}>
                <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">範例行程列表</h2>
                <div className="space-y-4">
                    {mockTrips.map(trip => (
                        <div 
                            key={trip.id} 
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-200 cursor-default border border-gray-200 dark:border-gray-600 opacity-80"
                        >
                            <div className="flex-1 min-w-0 pr-4 mb-2 sm:mb-0">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 truncate">{trip.name}</h3>
                                <p className="text-sm text-indigo-500 dark:text-indigo-300 font-medium">
                                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{trip.description || '無描述'}</p>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <MessageSquareText className="w-5 h-5 text-gray-400" title="點擊無法查看詳情，請登入" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center text-gray-600 dark:text-gray-400 p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                    <p>這是非登入用戶的參考介面，功能已被禁用。</p>
                </div>
            </div>
        </div>
    );
};

// --- 主應用程式元件 ---
const App = () => {
    const [dbInstance, setDbInstance] = useState(null);
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'tripDetail'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // Firebase 初始化和認證邏輯
    useEffect(() => {
        if (!auth) {
            setAuthReady(true);
            return;
        }

        setDbInstance(db);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 登入用戶 (Google 帳號資訊將在 user 物件上)
                setUserId(user.uid);
            } else {
                // 匿名/未登入用戶
                setUserId(null);
            }
            setAuthReady(true);
        });

        // 登入邏輯：如果沒有初始 Token，則匿名登入。如果有，則使用 Custom Token 登入。
        const signIn = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Authentication failed:", error);
            }
        };
        signIn();

        return () => unsubscribe();
    }, []);

    // 監聽行程列表 (僅限登入用戶)
    useEffect(() => {
        if (!authReady || !userId || !dbInstance) {
            setTrips([]);
            return;
        }

        // 私有資料路徑: artifacts/{appId}/users/{userId}/trips
        const tripsRef = collection(dbInstance, 'artifacts', appId, 'users', userId, 'trips');
        const q = query(tripsRef, orderBy('startDate', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId, dbInstance]);

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
    
    // 非登入用戶的參考介面
    if (!userId && authReady) {
        return <ExampleView isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    }

    // 登入用戶的正式介面
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
                    user={auth.currentUser || {}} // 傳遞當前用戶物件，包含 Google 資訊
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
            
            {/* 隱藏的樣式，用於 Tailwind JIT 編譯 */}
            <div className={`text-${primaryColor} bg-${primaryColor} hover:bg-indigo-700 bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400 hidden`}></div>
        </div>
    );
};

export default App;
