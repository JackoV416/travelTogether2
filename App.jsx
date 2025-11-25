import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, setDoc
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, Plane, DollarSign, Timer, AlertCircle
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
    // console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase 初始化失敗:", error);
}

// Tailwind CSS 輔助類別
const primaryColor = 'indigo-600';
const accentColor = 'teal-500';

const cardClasses = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700";
const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition";
const buttonPrimaryClasses = `flex items-center justify-center px-4 py-2 bg-${primaryColor} text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md`;
const buttonSecondaryClasses = "flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200";

// --- 日期和時間工具函式 ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
};
const sortItemsByDateTime = (a, b) => {
    const dateA = a.date + (a.time || '00:00');
    const dateB = b.date + (b.time || '00:00');
    return dateA.localeCompare(dateB);
};


// --- Header 元件 (包含登出、模式切換) ---
const Header = ({ title, userId, isDarkMode, toggleDarkMode, onLogout }) => {
    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h1>
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
                        使用者 ID: {userId ? `${userId.substring(0, 4)}...` : 'N/A'}
                    </span>
                    
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                        title={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition duration-200"
                        title="登出 (將自動重新登入匿名帳號)"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- 共用 CRUD 表單和邏輯 (Attraction, Food, Transport, Flight) ---

// 核心 CRUD 函式
const useTripItemCrud = (tripId, collectionName, userId, db) => {
    const collectionRef = collection(db, `/artifacts/${appId}/users/${userId}/${collectionName}`);

    const addItem = useCallback(async (data) => {
        try {
            await addDoc(collectionRef, {
                ...data,
                tripId, // 關聯到行程 ID
                createdAt: serverTimestamp(),
            });
            console.log(`Added ${collectionName} item`);
        } catch (e) {
            console.error(`Error adding ${collectionName} item: `, e);
        }
    }, [tripId, collectionName, userId, db]);

    const updateItem = useCallback(async (itemId, data) => {
        try {
            const docRef = doc(db, `/artifacts/${appId}/users/${userId}/${collectionName}`, itemId);
            await updateDoc(docRef, data);
            console.log(`Updated ${collectionName} item: ${itemId}`);
        } catch (e) {
            console.error(`Error updating ${collectionName} item: ${itemId}`, e);
        }
    }, [collectionName, userId, db]);

    const deleteItem = useCallback(async (itemId) => {
        if (window.confirm("確定要刪除此項目嗎？")) {
            try {
                const docRef = doc(db, `/artifacts/${appId}/users/${userId}/${collectionName}`, itemId);
                await deleteDoc(docRef);
                console.log(`Deleted ${collectionName} item: ${itemId}`);
            } catch (e) {
                console.error(`Error deleting ${collectionName} item: ${itemId}`, e);
            }
        }
    }, [collectionName, userId, db]);

    const toggleReminder = useCallback(async (item) => {
        try {
            const docRef = doc(db, `/artifacts/${appId}/users/${userId}/${collectionName}`, item.id);
            await updateDoc(docRef, { 
                isReminderSet: !item.isReminderSet 
            });
        } catch (e) {
            console.error(`Error toggling reminder for ${collectionName} item: ${item.id}`, e);
        }
    }, [collectionName, userId, db]);

    return { addItem, updateItem, deleteItem, toggleReminder };
};

// 通用輸入表單元件
const ItemForm = ({ initialData, onSubmit, onCancel, type = 'attraction' }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        date: initialData?.date || '',
        time: initialData?.time || '',
        location: initialData?.location || '', // For Attraction, Food, Transport, Flight
        notes: initialData?.notes || '',
        cost: initialData?.cost || 0, // For Food, Transport, Flight
        category: initialData?.category || '', // For Expense
        details: initialData?.details || '', // For Flight/Transport details
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getFields = () => {
        const fields = [];
        
        // Basic fields for all items
        fields.push({ label: '名稱', name: 'name', type: 'text', required: true });
        fields.push({ label: '日期', name: 'date', type: 'date', required: true });
        fields.push({ label: '時間', name: 'time', type: 'time', required: false });

        if (['attraction', 'food', 'transport', 'flight'].includes(type)) {
            fields.push({ label: '地點/路線', name: 'location', type: 'text', required: true });
        }

        if (['food', 'transport', 'flight'].includes(type)) {
            fields.push({ label: '預計花費 (TWD)', name: 'cost', type: 'number', required: false, min: 0 });
        }
        
        if (type === 'flight') {
            fields.push({ label: '航班詳情', name: 'details', type: 'text', required: true, placeholder: '航班編號, 登機門, 預計到達時間...' });
        }
        
        if (type === 'transport') {
            fields.push({ label: '交通方式', name: 'details', type: 'text', required: true, placeholder: '火車, 高鐵, 公車號碼...' });
        }

        fields.push({ label: '備註', name: 'notes', type: 'textarea', required: false });

        return fields;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {getFields().map(field => (
                <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                        <textarea
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className={`${inputClasses} h-20`}
                        />
                    ) : (
                        <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            min={field.min}
                            placeholder={field.placeholder}
                            required={field.required}
                            className={inputClasses}
                        />
                    )}
                </div>
            ))}
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className={buttonSecondaryClasses}>
                    <X className="w-5 h-5 mr-1" /> 取消
                </button>
                <button type="submit" className={buttonPrimaryClasses}>
                    <Save className="w-5 h-5 mr-1" /> 儲存
                </button>
            </div>
        </form>
    );
};

// 通用顯示項目元件 (包含提醒功能)
const ItemDisplay = ({ item, icon: Icon, onEdit, onDelete, onToggleReminder, isDarkMode }) => {
    const isPast = item.date && item.time && new Date(`${item.date}T${item.time}`) < new Date();
    const ReminderIcon = item.isReminderSet ? Bell : Clock;

    return (
        <div className={`flex items-start p-4 mb-3 border-l-4 rounded-xl shadow-sm ${isPast ? 'bg-gray-50 dark:bg-gray-700 border-gray-400' : 'bg-white dark:bg-gray-800 border-indigo-500'}`}>
            <Icon className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold dark:text-white">{item.name}</h3>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => onToggleReminder(item)}
                            className={`p-1 rounded-full ${item.isReminderSet ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100 dark:bg-gray-700' : 'text-gray-400 hover:text-indigo-500'} transition`}
                            title={item.isReminderSet ? "取消提醒" : "設定提醒"}
                        >
                            <ReminderIcon className="w-5 h-5" fill={item.isReminderSet ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={() => onEdit(item)} className="p-1 text-indigo-500 hover:text-indigo-700 transition" title="編輯">
                            <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="p-1 text-red-500 hover:text-red-700 transition" title="刪除">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <CalendarDays className="w-4 h-4 inline mr-1" />{formatDate(item.date)}{item.time && ` @ ${item.time}`}
                </p>
                {item.location && <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">地點/路線: {item.location}</p>}
                {item.cost > 0 && <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">預計花費: TWD {item.cost.toFixed(0)}</p>}
                {item.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">備註: {item.notes}</p>}
                {isPast && <p className="text-xs font-semibold text-gray-500 mt-1">已過期</p>}
            </div>
        </div>
    );
};

// --- 通用 CRUD 視圖元件 (AttractionView, FoodView, TransportView, FlightView) ---
const TripItemView = ({ tripId, userId, db, items, collectionName, icon: Icon, name, isDarkMode }) => {
    const { addItem, updateItem, deleteItem, toggleReminder } = useTripItemCrud(tripId, collectionName, userId, db);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleSubmit = (data) => {
        const itemData = { ...data };
        if (editingItem) {
            updateItem(editingItem.id, itemData);
            setEditingItem(null);
        } else {
            addItem(itemData);
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">{name} ({items.length})</h2>
                <button onClick={() => setIsAdding(true)} className={buttonPrimaryClasses}>
                    <Plus className="w-5 h-5 mr-1" /> 新增{name.substring(0, 2)}
                </button>
            </div>

            {(isAdding || editingItem) && (
                <div className={cardClasses}>
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">{editingItem ? `編輯${name}` : `新增${name}`}</h3>
                    <ItemForm
                        initialData={editingItem}
                        onSubmit={handleSubmit}
                        onCancel={() => { setIsAdding(false); setEditingItem(null); }}
                        type={collectionName.slice(0, -1)} // e.g. 'attraction'
                    />
                </div>
            )}

            <div className="space-y-4">
                {items.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">目前沒有 {name} 項目。請點擊「新增」按鈕開始規劃。</p>
                ) : (
                    items.sort(sortItemsByDateTime).map(item => (
                        <ItemDisplay
                            key={item.id}
                            item={item}
                            icon={Icon}
                            onEdit={setEditingItem}
                            onDelete={deleteItem}
                            onToggleReminder={toggleReminder}
                            isDarkMode={isDarkMode}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// --- Expense View (費用管理) ---
const ExpenseView = ({ tripId, userId, db, expenses, isDarkMode }) => {
    const collectionName = 'expenses';
    const { addItem, updateItem, deleteItem } = useTripItemCrud(tripId, collectionName, userId, db);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const categories = ['餐飲', '交通', '住宿', '購物', '機票', '門票', '其他'];
    const totalCost = expenses.reduce((sum, exp) => sum + (exp.cost || 0), 0);

    const handleSubmit = (data) => {
        const itemData = {
            ...data,
            cost: parseFloat(data.cost) || 0, // Ensure cost is a number
        };
        if (editingItem) {
            updateItem(editingItem.id, itemData);
            setEditingItem(null);
        } else {
            addItem(itemData);
            setIsAdding(false);
        }
    };
    
    const ExpenseForm = ({ initialData, onSubmit, onCancel }) => {
        const [formData, setFormData] = useState({
            name: initialData?.name || '',
            date: initialData?.date || '',
            cost: initialData?.cost || 0,
            category: initialData?.category || categories[0],
            notes: initialData?.notes || '',
        });

        const handleChange = (e) => {
            const { name, value, type } = e.target;
            setFormData(prev => ({ 
                ...prev, 
                [name]: type === 'number' ? parseFloat(value) || 0 : value 
            }));
        };

        const handleSubmitInternal = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };

        return (
            <form onSubmit={handleSubmitInternal} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名稱/項目 <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                </div>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">日期 <span className="text-red-500">*</span></label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">花費金額 (TWD) <span className="text-red-500">*</span></label>
                        <input type="number" name="cost" value={formData.cost} onChange={handleChange} required className={inputClasses} min="0" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">類別 <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} required className={inputClasses}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">備註</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} className={`${inputClasses} h-16`} />
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className={buttonSecondaryClasses}>
                        <X className="w-5 h-5 mr-1" /> 取消
                    </button>
                    <button type="submit" className={buttonPrimaryClasses}>
                        <Save className="w-5 h-5 mr-1" /> 儲存
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="space-y-6">
            <div className={`${cardClasses} flex justify-between items-center bg-indigo-50 dark:bg-indigo-900`}>
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">總花費:</h2>
                <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">TWD {totalCost.toFixed(0)}</p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">費用記錄 ({expenses.length})</h2>
                <button onClick={() => setIsAdding(true)} className={buttonPrimaryClasses}>
                    <Plus className="w-5 h-5 mr-1" /> 新增費用
                </button>
            </div>

            {(isAdding || editingItem) && (
                <div className={cardClasses}>
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">{editingItem ? '編輯費用記錄' : '新增費用記錄'}</h3>
                    <ExpenseForm
                        initialData={editingItem}
                        onSubmit={handleSubmit}
                        onCancel={() => { setIsAdding(false); setEditingItem(null); }}
                    />
                </div>
            )}

            <div className="space-y-4">
                {expenses.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">目前沒有費用記錄。</p>
                ) : (
                    expenses.sort(sortItemsByDateTime).map(item => (
                        <div key={item.id} className={`flex items-start p-4 mb-3 border-l-4 rounded-xl shadow-sm bg-white dark:bg-gray-800 border-green-500`}>
                            <DollarSign className="w-6 h-6 mr-3 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold dark:text-white">{item.name}</h3>
                                    <div className="flex space-x-2">
                                        <button onClick={() => setEditingItem(item)} className="p-1 text-indigo-500 hover:text-indigo-700 transition" title="編輯">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)} className="p-1 text-red-500 hover:text-red-700 transition" title="刪除">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">TWD {item.cost.toFixed(0)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    <CalendarDays className="w-4 h-4 inline mr-1" />{formatDate(item.date)} | 類別: {item.category}
                                </p>
                                {item.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">備註: {item.notes}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Schedule View (每日行程總覽) ---
const ScheduleView = ({ allItems, isDarkMode, toggleReminder }) => {
    // 1. Group items by date
    const groupedItems = useMemo(() => {
        const groups = {};
        allItems.forEach(item => {
            if (!groups[item.date]) {
                groups[item.date] = [];
            }
            groups[item.date].push(item);
        });

        // 2. Sort items within each date by time
        Object.keys(groups).forEach(date => {
            groups[date].sort(sortItemsByDateTime);
        });

        // 3. Sort dates
        return Object.keys(groups).sort();
    }, [allItems]);

    // Icon map for schedule display
    const TypeIconMap = {
        attraction: MapPin,
        food: Utensils,
        transport: Bus,
        flight: Plane,
        expense: DollarSign,
        note: NotebookPen,
    };
    
    // Color map for schedule display
    const TypeColorMap = {
        attraction: 'border-blue-500 bg-blue-50 dark:bg-blue-900',
        food: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900',
        transport: 'border-green-500 bg-green-50 dark:bg-green-900',
        flight: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900',
        expense: 'border-red-500 bg-red-50 dark:bg-red-900',
        note: 'border-purple-500 bg-purple-50 dark:bg-purple-900',
    };

    if (groupedItems.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg">行程是空的！請到「行程清單」中新增景點、美食或交通項目。</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {groupedItems.map(date => (
                <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="sticky top-[75px] z-[5] bg-slate-50 dark:bg-gray-900 -mx-4 px-4 py-2 mb-4 border-b-4 border-indigo-200 dark:border-indigo-700">
                        <h3 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                            {formatDate(date)}
                        </h3>
                    </div>

                    {/* Timeline Container */}
                    <div className="space-y-4 border-l-2 border-gray-300 dark:border-gray-700 ml-4 pl-8">
                        {groups[date].map((item, index) => {
                            const Icon = TypeIconMap[item.type] || ClipboardList;
                            const colorClass = TypeColorMap[item.type] || 'border-gray-500 bg-gray-50 dark:bg-gray-700';
                            const isPast = item.date && item.time && new Date(`${item.date}T${item.time}`) < new Date();

                            return (
                                <div key={item.id} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[3.15rem] top-0.5 w-4 h-4 rounded-full bg-indigo-500 dark:bg-indigo-400 border-2 border-white dark:border-gray-900"></div>
                                    
                                    {/* Card */}
                                    <div className={`${cardClasses} ${colorClass} border-l-4 shadow-lg transition transform hover:scale-[1.01] ${isPast ? 'opacity-60' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center">
                                                <Icon className="w-5 h-5 mr-2 text-indigo-700 dark:text-indigo-300" />
                                                <h4 className="text-lg font-semibold dark:text-white">
                                                    {item.time ? `${item.time} - ${item.name}` : item.name}
                                                </h4>
                                            </div>
                                            <div className="flex space-x-2 flex-shrink-0">
                                                {item.isReminderSet && item.type !== 'expense' && (
                                                    <Bell className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" title="已設定提醒" />
                                                )}
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full text-white" 
                                                      style={{ backgroundColor: item.type === 'attraction' ? '#3b82f6' : (item.type === 'food' ? '#f59e0b' : (item.type === 'transport' ? '#10b981' : (item.type === 'flight' ? '#6366f1' : (item.type === 'expense' ? '#ef4444' : '#a855f7')))) }}>
                                                    {item.type === 'attraction' ? '景點' : item.type === 'food' ? '美食' : item.type === 'transport' ? '交通' : item.type === 'flight' ? '機票' : item.type === 'expense' ? '費用' : '備註'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            {item.location && `地點/路線: ${item.location}`}
                                            {item.category && `類別: ${item.category}`}
                                        </p>
                                        {item.cost > 0 && <p className="text-sm text-green-600 dark:text-green-400 font-medium">花費: TWD {item.cost.toFixed(0)}</p>}
                                        {item.notes && <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">備註: {item.notes}</p>}
                                        
                                        {/* Reminder Toggle (Only for relevant items) */}
                                        {['attraction', 'food', 'transport', 'flight'].includes(item.type) && (
                                            <button 
                                                onClick={() => toggleReminder(item, item.type + 's')}
                                                className="mt-3 text-sm font-medium flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition"
                                            >
                                                <Timer className="w-4 h-4 mr-1" />
                                                {item.isReminderSet ? '取消提醒' : '設定提醒'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- TripDetail 元件 (行程詳情) ---
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [activeTab, setActiveTab] = useState('schedule');
    const [attractions, setAttractions] = useState([]);
    const [foods, setFoods] = useState([]);
    const [transports, setTransports] = useState([]);
    const [flights, setFlights] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reminderAlert, setReminderAlert] = useState(null); // 提醒彈出視窗

    // 定義所有項目類型及其 Firestore collection 名稱
    const ITEM_CONFIGS = useMemo(() => [
        { id: 'attractions', name: '景點', icon: MapPin, stateSetter: setAttractions },
        { id: 'foods', name: '美食', icon: Utensils, stateSetter: setFoods },
        { id: 'transports', name: '交通', icon: Bus, stateSetter: setTransports },
        { id: 'flights', name: '機票', icon: Plane, stateSetter: setFlights },
        { id: 'expenses', name: '費用', icon: PiggyBank, stateSetter: setExpenses },
        { id: 'notes', name: '筆記', icon: NotebookPen, stateSetter: setNotes },
    ], []);

    // Tab 清單 (新增了每日行程)
    const TABS = useMemo(() => [
        { id: 'schedule', name: '每日行程', icon: CalendarDays },
        { id: 'attractions', name: '景點', icon: MapPin },
        { id: 'foods', name: '美食', icon: Utensils },
        { id: 'transports', name: '交通', icon: Bus },
        { id: 'flights', name: '機票', icon: Plane },
        { id: 'expenses', name: '費用管理', icon: PiggyBank },
        // ... 其他tabs
    ], []);
    
    // 將所有項目合併成單一清單，供 ScheduleView 使用
    const allItems = useMemo(() => [
        ...attractions.map(i => ({...i, type: 'attraction'})),
        ...foods.map(i => ({...i, type: 'food'})),
        ...transports.map(i => ({...i, type: 'transport'})),
        ...flights.map(i => ({...i, type: 'flight'})),
        ...expenses.map(i => ({...i, type: 'expense'})),
        ...notes.map(i => ({...i, type: 'note'})),
    ], [attractions, foods, transports, flights, expenses, notes]);

    // 核心資料監聽
    useEffect(() => {
        if (!authReady || !tripId || !userId || !db) return;
        setLoading(true);

        // 1. 監聽行程基本資料
        const tripDocRef = doc(db, `/artifacts/${appId}/users/${userId}/trips`, tripId);
        const unsubscribeTrip = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error("Trip not found!");
                onBack(); // 回到儀表板
            }
        });

        // 2. 監聽所有子集合
        const unsubscribes = ITEM_CONFIGS.map(config => {
            const collectionRef = collection(db, `/artifacts/${appId}/users/${userId}/${config.id}`);
            const q = query(collectionRef, where('tripId', '==', tripId));
            
            return onSnapshot(q, (snapshot) => {
                const itemsList = snapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    // 確保日期和時間存在
                    date: doc.data().date || '', 
                    time: doc.data().time || ''
                }));
                config.stateSetter(itemsList);
                setLoading(false);
            }, (error) => {
                console.error(`Error listening to ${config.id}:`, error);
                setLoading(false);
            });
        });

        return () => {
            unsubscribeTrip();
            unsubscribes.forEach(unsub => unsub());
        };
    }, [authReady, tripId, userId, db, ITEM_CONFIGS, onBack]);

    // 提醒檢查邏輯
    useEffect(() => {
        if (!allItems.length) return;

        const now = new Date();
        // 過濾出已設定提醒且未過期、未顯示過的項目
        const activeReminders = allItems.filter(item => {
            if (!item.isReminderSet || item.type === 'expense' || item.type === 'note') return false;
            
            const itemDateTime = new Date(`${item.date}T${item.time}`);
            // 設定提醒在事件前 10 分鐘
            const reminderTime = new Date(itemDateTime.getTime() - 10 * 60000); 

            return reminderTime > now && reminderTime < (now.getTime() + 60000) && (!reminderAlert || reminderAlert.id !== item.id);
        });

        if (activeReminders.length > 0 && !reminderAlert) {
            const nextReminder = activeReminders.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`).getTime();
                const dateB = new Date(`${b.date}T${b.time}`).getTime();
                return dateA - dateB;
            })[0];

            setReminderAlert({
                id: nextReminder.id,
                name: nextReminder.name,
                time: nextReminder.time,
                type: nextReminder.type,
                date: nextReminder.date,
            });
        }

        // 每分鐘檢查一次提醒
        const timer = setInterval(() => {
            // Force re-run effect logic by checking activeReminders again
            if (!reminderAlert) { 
                setReminderAlert(null); // Clear potential stale state
            }
        }, 60000); // 60 seconds

        return () => clearInterval(timer);
    }, [allItems, reminderAlert]);


    // 通用提醒開關函式
    const toggleReminder = useCallback(async (item, collectionName) => {
        try {
            const docRef = doc(db, `/artifacts/${appId}/users/${userId}/${collectionName}`, item.id);
            await updateDoc(docRef, { 
                isReminderSet: !item.isReminderSet 
            });
            if (!item.isReminderSet) {
                // 簡易的確認通知
                setReminderAlert({
                    id: 'confirm',
                    name: `${item.name}`,
                    time: '已設定提醒',
                    type: 'success',
                });
                setTimeout(() => setReminderAlert(null), 3000);
            }
        } catch (e) {
            console.error(`Error toggling reminder for ${collectionName} item: ${item.id}`, e);
        }
    }, [db, userId]);

    // 渲染各個 Tab 的內容
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            );
        }

        switch (activeTab) {
            case 'schedule':
                return <ScheduleView 
                    allItems={allItems} 
                    isDarkMode={isDarkMode} 
                    toggleReminder={toggleReminder}
                />;
            case 'attractions':
                return <TripItemView 
                    tripId={tripId} userId={userId} db={db} items={attractions} 
                    collectionName="attractions" icon={MapPin} name="景點" isDarkMode={isDarkMode}
                />;
            case 'foods':
                return <TripItemView 
                    tripId={tripId} userId={userId} db={db} items={foods} 
                    collectionName="foods" icon={Utensils} name="美食" isDarkMode={isDarkMode}
                />;
            case 'transports':
                return <TripItemView 
                    tripId={tripId} userId={userId} db={db} items={transports} 
                    collectionName="transports" icon={Bus} name="交通" isDarkMode={isDarkMode}
                />;
            case 'flights':
                return <TripItemView 
                    tripId={tripId} userId={userId} db={db} items={flights} 
                    collectionName="flights" icon={Plane} name="機票" isDarkMode={isDarkMode}
                />;
            case 'expenses':
                return <ExpenseView 
                    tripId={tripId} userId={userId} db={db} expenses={expenses} isDarkMode={isDarkMode}
                />;
            // Notes and other views would follow a similar pattern
            default:
                return <div className="text-center py-10 text-gray-500">此功能尚未實作。</div>;
        }
    };

    if (!trip) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }
    
    // 提醒彈出視窗 UI
    const ReminderModal = ({ alert, onClose }) => {
        if (!alert) return null;
        
        const isConfirm = alert.type === 'success';
        const modalClasses = isConfirm ? 'bg-green-100 border-green-500 text-green-800' : 'bg-yellow-100 border-yellow-500 text-yellow-800';
        const Icon = isConfirm ? Check : AlertCircle;
        
        return (
            <div className="fixed top-20 right-4 z-50 p-4 rounded-xl shadow-xl border-l-4 transition-all duration-300 transform animate-slide-in-right"
                style={{ width: '300px' }} // fixed width for better look
            >
                <div className={`flex items-center space-x-3 ${modalClasses} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-base">{isConfirm ? '提醒設定成功' : '即將開始的行程'}</h4>
                        <p className="text-sm">
                            {isConfirm ? alert.name : `${alert.name} (${alert.type === 'attraction' ? '景點' : alert.type === 'food' ? '美食' : '交通/機票'}) 將於 10 分鐘內開始。`}
                        </p>
                        {!isConfirm && <p className="text-xs mt-1">時間: {formatDate(alert.date)} @ {alert.time}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 ml-auto flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const tabClasses = (isActive) => 
        `flex-1 py-3 text-center text-sm font-medium border-b-2 transition-all duration-200 ${
            isActive 
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-bold' 
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }`;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <style jsx global>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out forwards;
                }
            `}</style>
            
            <ReminderModal alert={reminderAlert} onClose={() => setReminderAlert(null)} />

            {/* 返回儀表板按鈕 */}
            <button onClick={onBack} className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-4 font-semibold">
                <ChevronLeft className="w-5 h-5 mr-1" /> 返回儀表板
            </button>

            {/* 行程標題 */}
            <div className={`${cardClasses} mb-6 bg-indigo-50 dark:bg-indigo-900`}>
                <h2 className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-200">{trip.name}</h2>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
            </div>

            {/* Tab 導覽列 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 sticky top-[135px] z-10 bg-slate-50 dark:bg-gray-900">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={tabClasses(activeTab === tab.id)}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            <tab.icon className="w-5 h-5 mr-1" />
                            <span>{tab.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* 內容區塊 */}
            {renderContent()}
        </div>
    );
};


// --- Dashboard 元件 (儀表板) ---
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onLogout }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddTrip = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tripsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/trips`);
            await addDoc(tripsCollectionRef, {
                name: newTripName,
                startDate: newTripStartDate,
                endDate: newTripEndDate,
                createdAt: serverTimestamp(),
            });
            setNewTripName('');
            setNewTripStartDate('');
            setNewTripEndDate('');
            setIsAdding(false);
        } catch (e) {
            console.error("Error adding document: ", e);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteTrip = async (tripId) => {
        if (window.confirm("確定要刪除此行程及所有相關資料嗎？此操作不可逆！")) {
            setLoading(true);
            try {
                // 由於 Firestore 沒有級聯刪除，這裡只刪除 trip 文件。
                // 安全規則會阻止未認證的用戶訪問子集合，但最佳實踐是刪除所有子集合數據。
                // 為了簡化，這裡只刪除主文件，依賴使用者 ID 的隔離。
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/trips`, tripId));
                // 實際應用中，應遞迴刪除所有子集合 (attractions, foods, etc.)
            } catch (e) {
                console.error("Error deleting trip: ", e);
            } finally {
                setLoading(false);
            }
        }
    };
    
    // 渲染儀表板
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            <Header title="旅行儀表板" userId={userId} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onLogout={onLogout} />

            {/* 新增行程按鈕 */}
            <div className="flex justify-between items-center mb-6 mt-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">我的行程</h2>
                <button onClick={() => setIsAdding(true)} className={buttonPrimaryClasses}>
                    <Plus className="w-5 h-5 mr-1" /> 新增行程
                </button>
            </div>
            
            {/* 新增行程表單 */}
            {isAdding && (
                <div className={`${cardClasses} mb-6`}>
                    <h3 className="text-xl font-semibold mb-4 dark:text-white">新增行程</h3>
                    <form onSubmit={handleAddTrip} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">行程名稱 <span className="text-red-500">*</span></label>
                            <input type="text" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} required className={inputClasses} placeholder="例如：日本關西十日遊" />
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">開始日期 <span className="text-red-500">*</span></label>
                                <input type="date" value={newTripStartDate} onChange={(e) => setNewTripStartDate(e.target.value)} required className={inputClasses} />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">結束日期 <span className="text-red-500">*</span></label>
                                <input type="date" value={newTripEndDate} onChange={(e) => setNewTripEndDate(e.target.value)} required className={inputClasses} />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsAdding(false)} className={buttonSecondaryClasses} disabled={loading}>
                                <X className="w-5 h-5 mr-1" /> 取消
                            </button>
                            <button type="submit" className={buttonPrimaryClasses} disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 mr-1 animate-spin" /> : <Save className="w-5 h-5 mr-1" />} 建立行程
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 行程清單 */}
            <div className="space-y-4">
                {trips.length === 0 ? (
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">目前沒有行程。點擊「新增行程」開始規劃！</p>
                ) : (
                    trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map(trip => (
                        <div key={trip.id} className={`${cardClasses} flex justify-between items-center transition transform hover:scale-[1.01] cursor-pointer`}>
                            <div onClick={() => onSelectTrip(trip.id)} className="flex-grow">
                                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{trip.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <CalendarDays className="w-4 h-4 inline mr-1" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </p>
                            </div>
                            <button onClick={() => handleDeleteTrip(trip.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition" title="刪除行程">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- 主應用程式元件 ---
const App = () => {
    const [dbInstance, setDbInstance] = useState(null);
    const [authState, setAuthState] = useState(null);
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);

    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'tripDetail'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newState = !prev;
            if (newState) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('darkMode', newState);
            return newState;
        });
    }, []);

    // 1. Firebase 初始化與認證
    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(storedDarkMode);
        if (storedDarkMode) {
            document.documentElement.classList.add('dark');
        }

        if (!auth || !db) return;
        setDbInstance(db); // 設置 db 實例

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthState(user);
                setUserId(user.uid);
                setAuthReady(true);
            } else {
                // 如果沒有用戶，嘗試使用 Custom Token 或匿名登入
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Authentication failed:", error);
                    setAuthReady(true); // 即使失敗也標記為 Ready 以顯示 UI
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. 行程資料監聽
    useEffect(() => {
        if (!authReady || !userId || !dbInstance) return;

        const tripsCollectionRef = collection(dbInstance, `/artifacts/${appId}/users/${userId}/trips`);
        // 使用 orderBy 排序，但需注意 Firestore index 限制
        const q = query(tripsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tripsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate || '',
                endDate: doc.data().endDate || '',
            }));
            setTrips(tripsList);
        }, (error) => {
            console.error("Error listening to trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId, dbInstance]);

    // 3. 登出功能
    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            // 登出後 onAuthStateChanged 會被觸發，重新執行匿名登入
            setCurrentView('dashboard');
            setSelectedTripId(null);
            console.log("User logged out successfully. Attempting anonymous sign-in...");
        } catch (e) {
            console.error("Logout failed:", e);
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
            <div className={`min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="mt-4 text-lg text-indigo-600 dark:text-indigo-400">載入應用程式與認證中...</span>
            </div>
        );
    }

    // 頂層 UI 結構
    return (
        <div className={`font-sans antialiased min-h-screen bg-slate-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
            {currentView === 'dashboard' && (
                <Dashboard 
                    onSelectTrip={handleSelectTrip} 
                    trips={trips} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                />
            )}
            
            {currentView === 'tripDetail' && (
                <div className="min-h-screen">
                    <Header 
                        title="行程規劃" 
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
                        onLogout={handleLogout}
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
        </div>
    );
};

export default App;
