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

// 針對手機螢幕優化的卡片和按鈕樣式
const cardClasses = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700";
const inputClasses = `w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-${primaryColor}/50 focus:border-${primaryColor}`;
const buttonClasses = (color = primaryColor) => 
    `px-4 py-2 font-semibold text-white bg-${color} rounded-xl hover:bg-${color}/90 transition duration-200 shadow-md flex items-center justify-center whitespace-nowrap`;
const secondaryButtonClasses = (color = primaryColor) => 
    `px-4 py-2 font-semibold text-${color} border border-${color} rounded-xl hover:bg-${color}/10 transition duration-200 flex items-center justify-center whitespace-nowrap dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-700`;


// --- Helper Functions ---

const getPublicDataPath = (collectionName) => `/artifacts/${appId}/public/data/${collectionName}`;
const getPrivateDataPath = (userId, collectionName) => `/artifacts/${appId}/users/${userId}/${collectionName}`;
const getDocPath = (userId, collectionName, docId) => `${getPrivateDataPath(userId, collectionName)}/${docId}`;
const getTripCollectionPath = (userId) => getPrivateDataPath(userId, 'trips');
const getSubCollectionPath = (userId, tripId, collectionName) => 
    `${getDocPath(userId, 'trips', tripId)}/${collectionName}`;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(amount);
};

const formatTimeInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toTimeString().slice(0, 5); // Returns HH:MM
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return '未設定';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
};

// --- Components ---

// 1. Header (頂部導航列)
const Header = React.memo(({ title, userId, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    return (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm dark:shadow-md border-b dark:border-gray-700">
            <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={onTutorialStart}
                        title="教學與範例"
                        className={`p-2 rounded-full text-${accentColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                    >
                         <BookOpenText className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={toggleDarkMode}
                        title={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                        className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        使用者ID: <span className="font-mono text-xs">{userId ? userId.substring(0, 8) + '...' : '未登入'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
});


// 2. Dashboard (儀表板)
const Dashboard = React.memo(({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [newTripName, setNewTripName] = useState('');
    const [newTripDates, setNewTripDates] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleCreateTrip = useCallback(async (e) => {
        e.preventDefault();
        if (!newTripName.trim() || !userId || !authReady) return;
        
        try {
            const tripData = {
                name: newTripName.trim(),
                dates: newTripDates.trim() || '未定',
                createdAt: serverTimestamp(),
                ownerId: userId,
                // 初始化一個空的 schedule 陣列，確保後續操作
                schedule: [], 
            };
            const colRef = collection(db, getTripCollectionPath(userId));
            await addDoc(colRef, tripData);
            setNewTripName('');
            setNewTripDates('');
            setIsAdding(false);
        } catch (error) {
            console.error("Error creating trip:", error);
        }
    }, [newTripName, newTripDates, userId, authReady]);

    const handleDeleteTrip = useCallback(async (tripId, e) => {
        e.stopPropagation();
        if (!window.confirm("確定要刪除這個行程嗎？")) return;
        
        try {
            const docRef = doc(db, getDocPath(userId, 'trips', tripId));
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting trip:", error);
        }
    }, [userId]);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-3 border-indigo-200 dark:border-indigo-800">
                我的旅程儀表板
            </h2>
            
            <button
                onClick={() => setIsAdding(true)}
                className={buttonClasses('indigo-600') + " w-full sm:w-auto"}
            >
                <Plus className="w-5 h-5 mr-2" /> 建立新行程
            </button>
            
            <button
                onClick={onTutorialStart}
                className={secondaryButtonClasses('teal-600') + " w-full sm:w-auto ml-0 sm:ml-4 mt-4 sm:mt-0"}
            >
                <BookOpenText className="w-5 h-5 mr-2" /> 教學與範例
            </button>

            {isAdding && (
                <div className={cardClasses}>
                    <h3 className="text-xl font-bold mb-4 dark:text-white">新增行程</h3>
                    <form onSubmit={handleCreateTrip} className="space-y-4">
                        <input
                            type="text"
                            placeholder="行程名稱 (例如: 東京五日遊)"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            className={inputClasses}
                            required
                        />
                         <input
                            type="text"
                            placeholder="日期範圍 (例如: 2024/10/01 - 2024/10/05)"
                            value={newTripDates}
                            onChange={(e) => setNewTripDates(e.target.value)}
                            className={inputClasses}
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className={secondaryButtonClasses('gray-500')}
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className={buttonClasses('indigo-600')}
                            >
                                <Save className="w-5 h-5 mr-2" /> 儲存
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <h3 className="text-2xl font-semibold mt-8 text-gray-700 dark:text-gray-200">所有行程 ({trips.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.length > 0 ? (
                    trips.map(trip => (
                        <div 
                            key={trip.id} 
                            onClick={() => onSelectTrip(trip.id)}
                            className={`${cardClasses} hover:shadow-2xl cursor-pointer relative group`}
                        >
                            <h4 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 truncate mb-1">{trip.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                <CalendarDays className="w-4 h-4 mr-1"/> {trip.dates || '未定'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                建立於: {trip.createdAt ? formatDateTime(trip.createdAt) : 'N/A'}
                            </p>
                            <button
                                onClick={(e) => handleDeleteTrip(trip.id, e)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition duration-200"
                                title="刪除行程"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="col-span-3 text-center py-10 text-gray-500 dark:text-gray-400">
                        目前沒有行程。請點擊「建立新行程」開始規劃！
                    </p>
                )}
            </div>
        </div>
    );
});


// 3. Modals and Forms (通用表單)

const ScheduleItemEditForm = React.memo(({ item, tripId, userId, onClose, isDarkMode }) => {
    const [name, setName] = useState(item.name || '');
    const [time, setTime] = useState(formatTimeInput(item.time || new Date()));
    const [type, setType] = useState(item.type || 'Activity');
    const [note, setNote] = useState(item.note || '');
    const [reminder, setReminder] = useState(item.reminder || ''); // 新增提醒時間

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            const timeParts = time.split(':');
            const now = new Date();
            // 嘗試解析時間。如果 item.time 是 serverTimestamp，則使用其日期部分
            let itemDate = item.time?.toDate ? item.time.toDate() : now;
            
            // 由於 ScheduleTab 是按天分組的，我們需要一個日期來設定時間
            // 這裡假設我們只修改當天的時間，保持日期不變 (這在實際應用中需要更複雜的日期選擇器)
            const scheduleDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate(), 
                                          parseInt(timeParts[0] || 0), parseInt(timeParts[1] || 0));

            const updatedItem = {
                ...item,
                name: name.trim(),
                time: scheduleDate, // 儲存為 Date 物件，Firestore 會轉為 Timestamp
                type,
                note,
                reminder: reminder ? new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate(), 
                                               parseInt(reminder.split(':')[0] || 0), parseInt(reminder.split(':')[1] || 0)) : null,
            };

            const docRef = doc(db, getDocPath(userId, 'trips', tripId));
            
            // 使用 runTransaction 安全地更新 schedule 陣列中的單個元素
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(docRef);
                if (!tripDoc.exists()) {
                    throw "Trip document does not exist!";
                }

                let schedule = tripDoc.data().schedule || [];
                const itemIndex = schedule.findIndex(i => i.id === item.id);

                if (itemIndex > -1) {
                    // 找到了，替換掉該項目
                    schedule[itemIndex] = updatedItem;
                } else {
                    // 沒找到，可能是新增項目，但這裡只處理編輯
                    console.error("Item not found for update.");
                    throw "Item not found for update.";
                }

                transaction.update(docRef, { schedule: schedule });
            });

            onClose();

        } catch (error) {
            console.error("Error updating schedule item:", error);
        }
    }, [name, time, type, note, reminder, item, tripId, userId, onClose]);

    const typeOptions = [
        { value: 'Activity', label: '活動', icon: ClipboardList },
        { value: 'Food', label: '餐飲', icon: Utensils },
        { value: 'Transport', label: '交通', icon: Bus },
        { value: 'Shopping', label: '購物', icon: ShoppingBag },
        { value: 'Note', label: '筆記', icon: NotebookPen },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className={`${cardClasses} w-full max-w-lg animate-in fade-in zoom-in dark:bg-gray-900`}>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">編輯行程項目</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">名稱</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">預計時間 (HH:MM)</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">提醒時間 (HH:MM, 可選)</label>
                            <input 
                                type="time" 
                                value={reminder} 
                                onChange={(e) => setReminder(e.target.value)} 
                                className={inputClasses} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">類型</label>
                        <div className="flex flex-wrap gap-2">
                            {typeOptions.map(option => {
                                const Icon = option.icon;
                                const isSelected = type === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setType(option.value)}
                                        className={`px-3 py-1 text-sm rounded-full transition ${
                                            isSelected 
                                            ? `bg-${primaryColor} text-white` 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                        } flex items-center`}
                                    >
                                        <Icon className="w-4 h-4 mr-1"/> {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">備註/地點</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} className={inputClasses} rows="3" />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className={secondaryButtonClasses('gray-500')}>
                            <X className="w-5 h-5 mr-1" /> 取消
                        </button>
                        <button type="submit" className={buttonClasses('indigo-600')}>
                            <Save className="w-5 h-5 mr-1" /> 儲存變更
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});


// 4. Tab Content: Schedule (行程表)
const ScheduleTab = React.memo(({ tripId, schedule, userId, isDarkMode }) => {
    const [newItemName, setNewItemName] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const typeIcons = {
        Activity: ClipboardList, Food: Utensils, Transport: Bus, Shopping: ShoppingBag, Note: NotebookPen
    };

    const handleAddItem = useCallback(async (e) => {
        e.preventDefault();
        if (!newItemName.trim() || !userId) return;

        try {
            const newItem = {
                id: crypto.randomUUID(), // 用 UUID 確保唯一性
                name: newItemName.trim(),
                time: new Date(), // 預設當前時間
                type: 'Activity',
                note: '',
                reminder: null,
            };

            const docRef = doc(db, getDocPath(userId, 'trips', tripId));
            
            // 使用 runTransaction 確保原子性地新增到 schedule 陣列的末尾
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(docRef);
                if (!tripDoc.exists()) {
                    throw "Trip document does not exist!";
                }

                const currentSchedule = tripDoc.data().schedule || [];
                // 排序鍵 (order key) 預設為當前長度
                newItem.order = currentSchedule.length;
                
                transaction.update(docRef, { 
                    schedule: [...currentSchedule, newItem] 
                });
            });

            setNewItemName('');
        } catch (error) {
            console.error("Error adding schedule item:", error);
        }
    }, [newItemName, tripId, userId]);

    const handleDeleteItem = useCallback(async (itemId) => {
        if (!window.confirm("確定刪除此行程項目嗎？")) return;

        try {
            const docRef = doc(db, getDocPath(userId, 'trips', tripId));
            
            await runTransaction(db, async (transaction) => {
                const tripDoc = await transaction.get(docRef);
                if (!tripDoc.exists()) {
                    throw "Trip document does not exist!";
                }

                let currentSchedule = tripDoc.data().schedule || [];
                const updatedSchedule = currentSchedule.filter(item => item.id !== itemId);

                // 刪除後不需要重新排序，因為 order key 只是相對的
                transaction.update(docRef, { schedule: updatedSchedule });
            });

        } catch (error) {
            console.error("Error deleting schedule item:", error);
        }
    }, [tripId, userId]);

    // 拖拉排序處理
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        // 視覺回饋: 可以添加 CSS 類別來顯示拖曳目標
    };

    const handleDrop = useCallback(async (e, dropIndex) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

        // 進行陣列重新排序
        const newSchedule = [...schedule];
        const [reorderedItem] = newSchedule.splice(draggedItemIndex, 1);
        newSchedule.splice(dropIndex, 0, reorderedItem);

        // 更新 Firebase
        try {
            const docRef = doc(db, getDocPath(userId, 'trips', tripId));
            
            // 更新後的 schedule 陣列不需要更新 order key，因為 Firebase 的 onSnapshot 會處理
            // 我們只是替換了整個 schedule 陣列
            await updateDoc(docRef, { schedule: newSchedule });
            
        } catch (error) {
            console.error("Error reordering schedule:", error);
        }

        setDraggedItemIndex(null);
    }, [schedule, draggedItemIndex, tripId, userId]);

    const scheduleByDate = useMemo(() => {
        // 確保 schedule 項目有一個有效且可比較的 'time' 字段
        const validSchedule = schedule
            .map(item => ({
                ...item,
                time: item.time?.toDate ? item.time.toDate() : new Date(item.time || new Date()),
                reminder: item.reminder?.toDate ? item.reminder.toDate() : (item.reminder ? new Date(item.reminder) : null),
            }))
            .sort((a, b) => a.time.getTime() - b.time.getTime());

        return validSchedule.reduce((acc, item) => {
            const dateStr = item.time.toLocaleDateString('zh-TW');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(item);
            return acc;
        }, {});
    }, [schedule]);

    const today = new Date().toLocaleDateString('zh-TW');

    return (
        <div className="space-y-6">
            <div className={cardClasses}>
                <h3 className="text-xl font-bold mb-4 dark:text-white">新增行程項目</h3>
                <form onSubmit={handleAddItem} className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="輸入新的行程項目名稱..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className={inputClasses + " flex-grow"}
                        required
                    />
                    <button type="submit" className={buttonClasses('indigo-600') + " flex-shrink-0"}>
                        <Plus className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {Object.keys(scheduleByDate).length > 0 ? (
                Object.entries(scheduleByDate).map(([dateStr, items]) => (
                    <div key={dateStr} className={cardClasses}>
                        <h3 className="text-xl font-bold mb-4 flex items-center dark:text-gray-100">
                            <CalendarDays className="w-5 h-5 mr-2 text-indigo-500" />
                            {dateStr} {dateStr === today && <span className="ml-2 text-sm px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">今天</span>}
                        </h3>
                        
                        <div className="space-y-2">
                            {items.map((item, index) => {
                                const Icon = typeIcons[item.type] || ClipboardList;
                                const isDragged = draggedItemIndex === index;
                                const isReminderActive = item.reminder && item.reminder.getTime() > new Date().getTime();
                                
                                return (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnter={(e) => handleDragOver(e, index)} // 拖曳進入
                                        onDragEnd={() => setDraggedItemIndex(null)} // 拖曳結束
                                        onDrop={(e) => handleDrop(e, index)} // 放置
                                        onDragOver={(e) => e.preventDefault()} // 允許放置
                                        className={`flex items-center p-3 rounded-xl border transition-all duration-200 ${
                                            isDragged 
                                            ? 'bg-indigo-100 dark:bg-indigo-900/70 shadow-lg border-indigo-500 opacity-70 scale-[1.02]' 
                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <GripVertical className="w-5 h-5 mr-3 text-gray-400 cursor-move flex-shrink-0" />
                                        
                                        <div className="flex flex-col flex-grow">
                                            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-300 mb-0.5">
                                                <Clock className="w-4 h-4 mr-1"/> {item.time.toTimeString().slice(0, 5)}
                                                {isReminderActive && (
                                                    <Bell className="w-4 h-4 ml-2 text-yellow-500 animate-pulse fill-yellow-500" title={`提醒已設定於 ${item.reminder.toTimeString().slice(0, 5)}`} />
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                <Icon className={`w-5 h-5 mr-2 text-${accentColor}`} />
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</span>
                                            </div>
                                            {item.note && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7">{item.note}</p>
                                            )}
                                        </div>

                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <button 
                                                onClick={() => setEditingItem(item)}
                                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700 transition"
                                                title="編輯"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 transition"
                                                title="刪除"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2 rounded-xl">
                    此行程目前沒有項目。請新增一個！
                </p>
            )}

            {editingItem && (
                <ScheduleItemEditForm 
                    item={editingItem} 
                    tripId={tripId} 
                    userId={userId} 
                    onClose={() => setEditingItem(null)} 
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
});


// 5. Tab Content: Budget (預算)
const BudgetTab = React.memo(({ tripId, userId, isDarkMode }) => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Food' });
    const [isAdding, setIsAdding] = useState(false);
    
    // Firestore 監聽
    useEffect(() => {
        if (!userId || !tripId) return;
        const expensesColRef = collection(db, getSubCollectionPath(userId, tripId, 'expenses'));
        const q = query(expensesColRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedExpenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            }));
            setExpenses(fetchedExpenses);
        }, (error) => {
            console.error("Error fetching expenses:", error);
        });

        return () => unsubscribe();
    }, [userId, tripId]);

    const handleAddExpense = useCallback(async (e) => {
        e.preventDefault();
        if (!newExpense.name.trim() || !newExpense.amount || isNaN(Number(newExpense.amount))) return;

        try {
            const expenseData = {
                name: newExpense.name.trim(),
                amount: Number(newExpense.amount),
                category: newExpense.category,
                createdAt: serverTimestamp(),
            };
            const colRef = collection(db, getSubCollectionPath(userId, tripId, 'expenses'));
            await addDoc(colRef, expenseData);
            setNewExpense({ name: '', amount: '', category: 'Food' });
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    }, [newExpense, userId, tripId]);

    const handleDeleteExpense = useCallback(async (expenseId) => {
        if (!window.confirm("確定刪除這筆支出嗎？")) return;
        try {
            const docRef = doc(db, getSubCollectionPath(userId, tripId, 'expenses'), expenseId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    }, [userId, tripId]);

    const { totalExpense, expenseByCategory } = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const byCategory = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});
        return { totalExpense: total, expenseByCategory: byCategory };
    }, [expenses]);

    const categoryIcons = {
        Food: Utensils, Transport: Bus, Shopping: ShoppingBag, Activity: ClipboardList, Other: PiggyBank
    };

    return (
        <div className="space-y-6">
            <div className={`${cardClasses} flex justify-between items-center bg-indigo-50 dark:bg-indigo-900`}>
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">總支出</h3>
                <span className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100">
                    {formatCurrency(totalExpense)}
                </span>
            </div>

            <button
                onClick={() => setIsAdding(true)}
                className={buttonClasses('teal-500') + " w-full"}
            >
                <Plus className="w-5 h-5 mr-2" /> 記錄新支出
            </button>

            {isAdding && (
                <div className={cardClasses}>
                    <h3 className="text-xl font-bold mb-4 dark:text-white">新增支出</h3>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <input
                            type="text"
                            placeholder="支出項目名稱"
                            value={newExpense.name}
                            onChange={(e) => setNewExpense(e.target.value)}
                            className={inputClasses}
                            required
                        />
                        <div className="flex space-x-4">
                            <input
                                type="number"
                                placeholder="金額 (TWD)"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                className={inputClasses + " w-1/2"}
                                required
                            />
                            <select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                                className={inputClasses + " w-1/2 appearance-none"}
                            >
                                {Object.keys(categoryIcons).map(cat => (
                                    <option key={cat} value={cat}>{cat === 'Food' ? '餐飲' : cat === 'Transport' ? '交通' : cat === 'Shopping' ? '購物' : cat === 'Activity' ? '活動' : '其他'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsAdding(false)} className={secondaryButtonClasses('gray-500')}>
                                取消
                            </button>
                            <button type="submit" className={buttonClasses('teal-500')}>
                                <Save className="w-5 h-5 mr-2" /> 儲存
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <h3 className="text-2xl font-semibold mt-8 text-gray-700 dark:text-gray-200">支出明細</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(expenseByCategory).map(([category, amount]) => {
                    const Icon = categoryIcons[category] || PiggyBank;
                    return (
                        <div key={category} className={`${cardClasses} p-4 flex items-center justify-between`}>
                            <div className="flex items-center">
                                <Icon className={`w-6 h-6 mr-3 text-indigo-500`} />
                                <span className="font-semibold dark:text-gray-200">{category === 'Food' ? '餐飲' : category === 'Transport' ? '交通' : category === 'Shopping' ? '購物' : category === 'Activity' ? '活動' : '其他'}</span>
                            </div>
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{formatCurrency(amount)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-3">
                {expenses.length > 0 ? (
                    expenses.map((expense) => {
                        const Icon = categoryIcons[expense.category] || PiggyBank;
                        return (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-sm transition">
                                <div className="flex items-center">
                                    <Icon className="w-5 h-5 mr-3 text-teal-500" />
                                    <div>
                                        <p className="font-medium dark:text-gray-100">{expense.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.createdAt.toLocaleDateString('zh-TW')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</span>
                                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center py-5 text-gray-500 dark:text-gray-400">目前沒有任何支出記錄。</p>
                )}
            </div>
        </div>
    );
});


// 6. TripDetail (行程詳情頁)
const TripDetail = React.memo(({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [activeTab, setActiveTab] = useState('schedule');
    const [notificationCounts, setNotificationCounts] = useState({ schedule: 0, budget: 0, notes: 0, location: 0 });

    // Firestore 監聽行程詳情
    useEffect(() => {
        if (!userId || !tripId) return;
        const docRef = doc(db, getDocPath(userId, 'trips', tripId));

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTrip({
                    id: docSnap.id,
                    ...data,
                    // 確保 schedule 是一個陣列，並且包含一個排序鍵 (order)
                    schedule: data.schedule ? data.schedule.sort((a, b) => a.order - b.order) : []
                });

                // 計算提醒數量
                const now = new Date();
                const reminders = (data.schedule || []).filter(item => {
                    const reminderTime = item.reminder?.toDate ? item.reminder.toDate() : (item.reminder ? new Date(item.reminder) : null);
                    // 提醒時間已設定且尚未過期
                    return reminderTime && reminderTime.getTime() > now.getTime();
                }).length;

                setNotificationCounts(prev => ({
                    ...prev,
                    schedule: reminders
                }));

            } else {
                console.error("No such trip document!");
                setTrip(null);
            }
        }, (error) => {
            console.error("Error fetching trip detail:", error);
        });

        return () => unsubscribe();
    }, [userId, tripId]);


    const renderContent = useCallback(() => {
        if (!trip) return <div className="text-center py-10 dark:text-gray-400">載入中...</div>;

        switch (activeTab) {
            case 'schedule':
                return <ScheduleTab tripId={tripId} schedule={trip.schedule} userId={userId} isDarkMode={isDarkMode} />;
            case 'budget':
                return <BudgetTab tripId={tripId} userId={userId} isDarkMode={isDarkMode} />;
            case 'notes':
                return <div className={cardClasses}>筆記功能區塊 (待實作)</div>;
            case 'location':
                return <div className={cardClasses}>地點/地圖功能區塊 (待實作)</div>;
            default:
                return <ScheduleTab tripId={tripId} schedule={trip.schedule} userId={userId} isDarkMode={isDarkMode} />;
        }
    }, [activeTab, trip, tripId, userId, isDarkMode]);

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400 mt-4">載入行程詳情...</span>
            </div>
        );
    }

    const tabs = [
        { id: 'schedule', name: '行程', icon: CalendarDays },
        { id: 'budget', name: '預算', icon: PiggyBank },
        { id: 'notes', name: '筆記', icon: NotebookPen },
        { id: 'location', name: '地點', icon: MapPin },
    ];

    const tabClasses = (isActive) => `
        px-4 py-2 text-sm font-medium rounded-xl transition duration-200 flex-1
        ${isActive 
            ? `bg-${primaryColor} text-white shadow-lg` 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
    `;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className={secondaryButtonClasses('gray-500')}>
                    <ChevronLeft className="w-5 h-5 mr-1" /> 回到儀表板
                </button>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 truncate flex-grow">
                    {trip.name}
                </h2>
            </div>
            <p className="text-md font-medium text-gray-600 dark:text-gray-300 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-indigo-500" /> {trip.dates}
            </p>

            {/* 標籤導航 */}
            <div className="flex bg-gray-200/50 dark:bg-gray-700/50 rounded-xl p-1 shadow-inner">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'} `} />
                            <span className="ml-1">{tab.name}</span>
                            {notificationCounts[tab.id] > 0 && (
                                <Bell className="w-4 h-4 ml-1 text-yellow-300 animate-pulse fill-yellow-300" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            {renderContent()}
        </div>
    );
});


// 7. TutorialView (教學頁面)
const SAMPLE_TRIP_DATA = {
    name: "東京五日經典遊 (範例)",
    dates: "2024/12/10 - 2024/12/14",
    totalBudget: 45000,
    schedule: [
        { id: 's1', name: '抵達東京成田機場，前往飯店', time: new Date(2024, 11, 10, 15, 0), type: 'Transport', note: '搭乘 Skyland Express', reminder: new Date(2024, 11, 10, 12, 0) },
        { id: 's2', name: '晚餐：一蘭拉麵', time: new Date(2024, 11, 10, 19, 0), type: 'Food', note: '新宿本店', reminder: null },
        { id: 's3', name: '淺草寺參拜', time: new Date(2024, 11, 11, 9, 30), type: 'Activity', note: '購買御守', reminder: null },
        { id: 's4', name: '秋葉原電器街自由活動', time: new Date(2024, 11, 12, 14, 0), type: 'Shopping', note: '購買動漫周邊', reminder: null },
        { id: 's5', name: '回程：前往機場', time: new Date(2024, 11, 14, 10, 0), type: 'Transport', note: '預留 3 小時 Check-in', reminder: new Date(2024, 11, 14, 7, 30) },
    ],
    expenses: [
        { id: 'e1', name: '機票與住宿', amount: 28000, category: 'Other' },
        { id: 'e2', name: '拉麵晚餐', amount: 350, category: 'Food' },
        { id: 'e3', name: '地鐵三日券', amount: 1500, category: 'Transport' },
        { id: 'e4', name: '御守紀念品', amount: 800, category: 'Shopping' },
    ]
};

const TutorialView = React.memo(({ onBack, isDarkMode }) => {
    const totalExpense = SAMPLE_TRIP_DATA.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = SAMPLE_TRIP_DATA.totalBudget - totalExpense;

    const scheduleByDate = SAMPLE_TRIP_DATA.schedule.reduce((acc, item) => {
        const dateStr = item.time.toLocaleDateString('zh-TW');
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(item);
        return acc;
    }, {});

    const typeIcons = {
        Activity: ClipboardList, Food: Utensils, Transport: Bus, Shopping: ShoppingBag, Note: NotebookPen, Other: PiggyBank
    };
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className={secondaryButtonClasses('gray-500')}>
                    <ChevronLeft className="w-5 h-5 mr-1" /> 回到儀表板
                </button>
                <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    應用程式功能教學與範例
                </h2>
            </div>

            <div className={cardClasses + " bg-indigo-50 dark:bg-gray-800 border-l-4 border-indigo-500"}>
                <h3 className="text-2xl font-bold mb-3 dark:text-white flex items-center">
                    <BookOpenText className="w-6 h-6 mr-2 text-indigo-500" />
                    功能介紹
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>**行程規劃**：在「行程」分頁中，點擊行程項目**即可拖曳**改變順序。</li>
                    <li>**提醒設定**：在編輯行程項目時，可以設定一個提醒時間 (HH:MM)，方便您準時出發。</li>
                    <li>**預算追蹤**：在「預算」分頁中記錄支出，即時查看剩餘預算和分類統計。</li>
                    <li>**行程詳情**：包含行程名稱、日期範圍、排程、預算等資訊。</li>
                </ul>
            </div>

            <div className={cardClasses}>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    範例行程：{SAMPLE_TRIP_DATA.name}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-indigo-500" /> 
                    日期：{SAMPLE_TRIP_DATA.dates}
                </p>

                {/* 預算範例 */}
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                    <div className="p-4 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
                        <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">總預算</p>
                        <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">{formatCurrency(SAMPLE_TRIP_DATA.totalBudget)}</p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-xl">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">總支出</p>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">剩餘預算</p>
                        <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{formatCurrency(remainingBudget)}</p>
                    </div>
                </div>

                {/* 行程範例 */}
                <h4 className="text-xl font-bold mb-4 border-b pb-2 dark:text-gray-200">
                    行程範例 (注意拖拉功能與提醒鈴鐺)
                </h4>
                <div className="space-y-4">
                    {Object.entries(scheduleByDate).map(([dateStr, items]) => (
                        <div key={dateStr} className="p-4 border rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3">{dateStr}</h5>
                            <div className="space-y-2">
                                {items.map(item => {
                                    const Icon = typeIcons[item.type];
                                    return (
                                        <div key={item.id} className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <GripVertical className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <div className="flex flex-col flex-grow">
                                                <div className="flex items-center">
                                                    <Icon className={`w-4 h-4 mr-1 text-${accentColor}`} />
                                                    <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">{item.note}</p>
                                            </div>
                                            <div className="flex items-center flex-shrink-0 ml-4">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {item.time.toTimeString().slice(0, 5)}
                                                </span>
                                                {item.reminder && (
                                                    <Bell className="w-4 h-4 ml-2 text-yellow-500 fill-yellow-500" title={`提醒: ${item.reminder.toTimeString().slice(0, 5)}`} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});


// 8. Main App Component
const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
    }, []);
    
    // 1. Firebase Initialization and Authentication
    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    // 登入訪客或使用自訂 token
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        const anonUser = await signInAnonymously(auth);
                        setUserId(anonUser.user.uid);
                    }
                } catch (error) {
                    console.error("Authentication failed:", error);
                    // 即使失敗也設定為 ready，以避免無限 loading
                    setUserId(crypto.randomUUID()); 
                }
            }
            setAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // 2. Fetch Trips Data
    useEffect(() => {
        if (!authReady || !userId) return;

        const tripsColRef = collection(db, getTripCollectionPath(userId));
        // 注意：這裡移除了 orderBy，因為 schedule 內嵌在 document 中
        const q = query(tripsColRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
            })).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); // 在前端排序

            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

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
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="ml-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-slate-50'} text-gray-800 dark:text-gray-100`}>
            {currentView === 'dashboard' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
                    <Header 
                        title="行程儀表板" 
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial}
                    />
                    <Dashboard 
                        onSelectTrip={handleSelectTrip} 
                        trips={trips} 
                        userId={userId} 
                        authReady={authReady}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial} // 新增教學入口
                    />
                </div>
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
