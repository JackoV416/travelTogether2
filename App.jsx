import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, serverTimestamp, where, getDocs, runTransaction
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, ChevronDown, ChevronUp,
    BarChart3
} from 'lucide-react';

// --- 全域變數和 Firebase 設定 ---
// 這些變數由 Canvas 環境提供
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

// --- 輔助函式 ---

// 實時更新的訊息彈出視窗
const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 ${bgColor} transition-opacity duration-300`}>
            {icon}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// 簡單的模態對話框
const Modal = ({ isOpen, title, children, onClose, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// 格式化日期
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
    }
    return new Date(timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
};

// --- 資料存取函式 (Firestore) ---

// 取得使用者特定的集合路徑 (私有資料)
const getUserCollectionRef = (collectionName, currentUserId) => {
    if (!db || !currentUserId) return null;
    return collection(db, 'artifacts', appId, 'users', currentUserId, collectionName);
};

// 取得公開行程集合路徑
const getPublicCollectionRef = (collectionName) => {
    if (!db) return null;
    return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
};

// 取得特定行程文件路徑
const getTripDocRef = (tripId, currentUserId) => {
    if (!db || !currentUserId || !tripId) return null;
    // 假設行程資料統一存在使用者自己的私有空間
    return doc(db, 'artifacts', appId, 'users', currentUserId, 'trips', tripId);
};

// --- React 元件 ---

// 預算視覺化 (已移除 PieChart，改用簡單的進度條)
const BudgetSummary = ({ trip, isDarkMode }) => {
    const totalBudget = trip.budget || 0;
    const spent = useMemo(() => {
        let total = 0;
        // 假設所有 dayPlan 項目都有 budget 屬性
        trip.dayPlan?.forEach(day => {
            day.items?.forEach(item => {
                total += item.budget || 0;
            });
        });
        return total;
    }, [trip.dayPlan]);

    const remaining = totalBudget - spent;
    const percentageSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
    const isOverBudget = remaining < 0;

    const progressBarColor = isOverBudget ? 'bg-red-500' : (percentageSpent > 75 ? 'bg-yellow-500' : `bg-${accentColor}`);

    const cardClass = `p-6 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const labelColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={cardClass}>
            <div className="flex items-center space-x-3 mb-4">
                <PiggyBank className={`w-6 h-6 text-${primaryColor}`} />
                <h2 className={`text-xl font-bold ${textColor}`}>預算總覽</h2>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                    <span className={labelColor}>總預算:</span>
                    <span className={textColor}>NT$ {totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className={labelColor}>已花費:</span>
                    <span className={textColor}>NT$ {spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className={labelColor}>剩餘預算:</span>
                    <span className={isOverBudget ? 'text-red-500 font-bold' : textColor}>NT$ {Math.abs(remaining).toLocaleString()} {isOverBudget && "(超支)"}</span>
                </div>
            </div>

            <div className="mt-6">
                <p className={`text-sm font-medium mb-2 ${labelColor}`}>已花費 ({percentageSpent.toFixed(1)}%)</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${progressBarColor}`} 
                        style={{ width: `${Math.min(100, percentageSpent)}%` }} // 限制最多 100% 視覺寬度
                    ></div>
                </div>
            </div>
        </div>
    );
};

// 單一行程項目 (已移除拖曳句柄，改用上下箭頭進行排序)
const DayPlanItem = ({ item, dayIndex, itemIndex, updateItem, deleteItem, moveItem, isDarkMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(item);

    const Icon = {
        activity: Utensils,
        accommodation: Home,
        transport: Bus,
        shopping: ShoppingBag,
        misc: ListTodo,
    }[item.type] || MapPin;

    const handleSave = () => {
        updateItem(dayIndex, itemIndex, editForm);
        setIsEditing(false);
    };

    const cardClass = `p-4 rounded-lg shadow-md transition-all duration-300 flex items-start space-x-3 
                       ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`;
    const inputClass = "w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100";
    const labelClass = "text-sm font-medium text-gray-600 dark:text-gray-300 mb-1";
    const actionButtonClass = "p-2 rounded-full transition-colors duration-200";

    return (
        <div className={cardClass}>
            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} text-${primaryColor}`}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-grow min-w-0 space-y-2">
                {isEditing ? (
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>名稱</label>
                            <input 
                                type="text" 
                                value={editForm.name} 
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex space-x-3">
                            <div className="w-1/2">
                                <label className={labelClass}>時間</label>
                                <input 
                                    type="time" 
                                    value={editForm.time} 
                                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className={labelClass}>預算 (NT$)</label>
                                <input 
                                    type="number" 
                                    value={editForm.budget || 0} 
                                    onChange={(e) => setEditForm({...editForm, budget: parseFloat(e.target.value) || 0})}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>類型</label>
                            <select 
                                value={editForm.type} 
                                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                className={inputClass}
                            >
                                {['activity', 'accommodation', 'transport', 'shopping', 'misc'].map(type => (
                                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>備註</label>
                            <textarea 
                                value={editForm.details} 
                                onChange={(e) => setEditForm({...editForm, details: e.target.value})}
                                className={inputClass}
                                rows="2"
                            />
                        </div>
                        <div className="flex space-x-2 justify-end">
                            <button onClick={() => setIsEditing(false)} className={`flex items-center ${actionButtonClass} text-gray-500 hover:text-gray-700 dark:hover:text-gray-300`}>
                                <X className="w-5 h-5" /> 取消
                            </button>
                            <button onClick={handleSave} className={`flex items-center ${actionButtonClass} bg-${primaryColor} text-white hover:bg-indigo-700`}>
                                <Save className="w-5 h-5" /> 儲存
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.name}</h4>
                        <div className="flex items-center text-sm space-x-4 text-gray-500 dark:text-gray-400">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {item.time}</span>
                            <span className="flex items-center"><PiggyBank className="w-4 h-4 mr-1" /> NT$ {item.budget?.toLocaleString() || 0}</span>
                        </div>
                        {item.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 pt-1">{item.details}</p>
                        )}
                    </div>
                )}
            </div>
            
            {!isEditing && (
                <div className="flex flex-col space-y-1 ml-4 self-center">
                    <button 
                        onClick={() => moveItem(dayIndex, itemIndex, -1)} 
                        className={`${actionButtonClass} text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600`}
                        title="向上移動"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className={`${actionButtonClass} text-${primaryColor} hover:bg-gray-100 dark:hover:bg-gray-600`}
                        title="編輯"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => deleteItem(dayIndex, itemIndex)} 
                        className={`${actionButtonClass} text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600`}
                        title="刪除"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => moveItem(dayIndex, itemIndex, 1)} 
                        className={`${actionButtonClass} text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600`}
                        title="向下移動"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};


// 每日計畫 (已移除 react-beautiful-dnd 相關邏輯)
const DayPlan = ({ day, dayIndex, updateTrip, tripId, userId, isDarkMode, trip }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ 
        type: 'activity', 
        name: '', 
        time: '10:00', 
        details: '', 
        budget: 0 
    });
    const [showAddModal, setShowAddModal] = useState(false);
    
    // 儲存或更新單一項目
    const handleUpdateItem = useCallback(async (dIndex, iIndex, updatedItem) => {
        try {
            const plan = [...trip.dayPlan];
            plan[dIndex].items[iIndex] = updatedItem;
            
            const tripRef = getTripDocRef(tripId, userId);
            await updateDoc(tripRef, { dayPlan: plan });
        } catch (error) {
            console.error("Error updating trip item:", error);
        }
    }, [tripId, userId, trip.dayPlan]);

    // 刪除單一項目
    const handleDeleteItem = useCallback(async (dIndex, iIndex) => {
        if (!window.confirm("確定要刪除此行程項目嗎？")) return;
        try {
            const plan = [...trip.dayPlan];
            plan[dIndex].items.splice(iIndex, 1);
            
            const tripRef = getTripDocRef(tripId, userId);
            await updateDoc(tripRef, { dayPlan: plan });
        } catch (error) {
            console.error("Error deleting trip item:", error);
        }
    }, [tripId, userId, trip.dayPlan]);

    // 移動單一項目 (取代拖曳排序)
    const handleMoveItem = useCallback(async (dIndex, iIndex, direction) => {
        const plan = [...trip.dayPlan];
        const dayItems = plan[dIndex].items;
        const newIndex = iIndex + direction;

        if (newIndex >= 0 && newIndex < dayItems.length) {
            // 交換位置
            const [movedItem] = dayItems.splice(iIndex, 1);
            dayItems.splice(newIndex, 0, movedItem);

            try {
                const tripRef = getTripDocRef(tripId, userId);
                await updateDoc(tripRef, { dayPlan: plan });
            } catch (error) {
                console.error("Error moving trip item:", error);
            }
        }
    }, [tripId, userId, trip.dayPlan]);

    // 新增項目
    const handleAddItem = async () => {
        if (!newItem.name.trim()) return;

        try {
            const plan = [...trip.dayPlan];
            plan[dayIndex].items = plan[dayIndex].items || [];
            plan[dayIndex].items.push({...newItem, id: Date.now().toString()}); // 加上一個簡單的 id
            
            const tripRef = getTripDocRef(tripId, userId);
            await updateDoc(tripRef, { dayPlan: plan });

            setShowAddModal(false);
            setNewItem({ 
                type: 'activity', 
                name: '', 
                time: '10:00', 
                details: '', 
                budget: 0 
            });
        } catch (error) {
            console.error("Error adding trip item:", error);
        }
    };

    const inputClass = "w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100";
    const labelClass = "text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 block";

    return (
        <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    第 {dayIndex + 1} 天 - {formatDate(day.date)}
                </h3>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className={`p-2 rounded-full text-white bg-${accentColor} hover:bg-teal-600 transition duration-150`}
                    title="新增項目"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {(day.items || []).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">這天還沒有規劃任何行程。</p>
                ) : (
                    (day.items || []).map((item, iIndex) => (
                        <DayPlanItem
                            key={item.id || iIndex} // 使用 ID 作為 key
                            item={item}
                            dayIndex={dayIndex}
                            itemIndex={iIndex}
                            updateItem={handleUpdateItem}
                            deleteItem={handleDeleteItem}
                            moveItem={handleMoveItem}
                            isDarkMode={isDarkMode}
                        />
                    ))
                )}
            </div>
            
            <Modal isOpen={showAddModal} title="新增行程項目" onClose={() => setShowAddModal(false)}
                footer={
                    <button onClick={handleAddItem} className={`px-4 py-2 rounded-lg bg-${primaryColor} text-white font-medium hover:bg-indigo-700`}>
                        <Plus className="w-5 h-5 inline mr-2" /> 新增
                    </button>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>名稱 (必填)</label>
                        <input 
                            type="text" 
                            value={newItem.name} 
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className={inputClass}
                            placeholder="活動名稱或地點"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <div className="w-1/2">
                            <label className={labelClass}>時間</label>
                            <input 
                                type="time" 
                                value={newItem.time} 
                                onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className={labelClass}>預算 (NT$)</label>
                            <input 
                                type="number" 
                                value={newItem.budget} 
                                onChange={(e) => setNewItem({...newItem, budget: parseFloat(e.target.value) || 0})}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>類型</label>
                        <select 
                            value={newItem.type} 
                            onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                            className={inputClass}
                        >
                            <option value="activity">活動/景點</option>
                            <option value="accommodation">住宿</option>
                            <option value="transport">交通</option>
                            <option value="shopping">購物</option>
                            <option value="misc">其他</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>備註</label>
                        <textarea 
                            value={newItem.details} 
                            onChange={(e) => setNewItem({...newItem, details: e.target.value})}
                            className={inputClass}
                            rows="3"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};


// 新增行程表單
const NewTripForm = ({ userId, onClose, onTripCreated, isDarkMode }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate) {
            setError('請填寫所有必填欄位 (名稱、開始日期、結束日期)');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            setError('開始日期不能晚於結束日期');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const tripCollectionRef = getUserCollectionRef('trips', userId);
            if (!tripCollectionRef) throw new Error("Firestore reference is null.");

            // 產生每日計畫
            const days = [];
            let currentDate = new Date(start);
            while (currentDate <= end) {
                days.push({
                    date: currentDate.toISOString().split('T')[0], // 儲存為 YYYY-MM-DD 格式
                    items: [],
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const newTrip = {
                name,
                startDate: startDate,
                endDate: endDate,
                budget: parseFloat(budget) || 0,
                ownerId: userId,
                dayPlan: days,
                createdAt: serverTimestamp(),
                sharedWith: [], // 協作名單
            };

            await addDoc(tripCollectionRef, newTrip);
            onTripCreated('success', '行程新增成功！');
            onClose();

        } catch (err) {
            console.error("Error creating new trip:", err);
            setError(`新增行程失敗: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition duration-150";
    const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="name" className={labelClass}>行程名稱 *</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="例如：日本關西十日遊"
                />
            </div>
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <label htmlFor="startDate" className={labelClass}>開始日期 *</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="endDate" className={labelClass}>結束日期 *</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="budget" className={labelClass}>總預算 (NT$)</label>
                <input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={inputClass}
                    placeholder="輸入總預算金額"
                    min="0"
                />
            </div>
            <button
                type="submit"
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-lg bg-${primaryColor} text-white hover:bg-indigo-700 transition duration-150 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Plus className="w-5 h-5 mr-2" />
                )}
                建立行程
            </button>
        </form>
    );
};

// 儀表板 (Dashboard)
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart }) => {
    const [showNewTripModal, setShowNewTripModal] = useState(false);
    const [toast, setToast] = useState(null);

    const sortedTrips = useMemo(() => {
        if (!trips) return [];
        // 客戶端排序，以開始日期降序
        return [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [trips]);

    const handleTripCreated = (type, message) => {
        setToast({ type, message });
    };

    const handleDeleteTrip = async (tripId, tripName) => {
        if (!window.confirm(`確定要刪除行程 "${tripName}" 嗎？此操作不可逆。`)) return;

        try {
            const tripRef = getTripDocRef(tripId, userId);
            await deleteDoc(tripRef);
            handleTripCreated('success', `行程 "${tripName}" 已成功刪除。`);
        } catch (error) {
            console.error("Error deleting trip:", error);
            handleTripCreated('error', '刪除行程失敗。');
        }
    };

    const Card = ({ children, className = '' }) => (
        <div className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} ${className}`}>
            {children}
        </div>
    );
    
    const TripCard = ({ trip }) => {
        const totalDays = Math.max(1, (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24) + 1);

        return (
            <Card className="hover:shadow-xl cursor-pointer flex flex-col justify-between" onClick={() => onSelectTrip(trip.id)}>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{trip.name}</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                {totalDays} 天
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center space-x-3">
                        <CalendarDays className="w-4 h-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </p>
                    <p className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                        <PiggyBank className="w-4 h-4 mr-2" />
                        預算: NT$ {trip.budget?.toLocaleString() || 0}
                    </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id, trip.name); }}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition"
                        title="刪除行程"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </Card>
        );
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <Header 
                title="旅遊儀表板" 
                userId={userId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                onTutorialStart={onTutorialStart}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>我的行程</h2>
                    <button
                        onClick={() => setShowNewTripModal(true)}
                        className={`w-full sm:w-auto flex items-center justify-center px-4 py-3 rounded-xl font-semibold bg-${primaryColor} text-white hover:bg-indigo-700 transition duration-150 mb-6`}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        新增旅遊行程
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedTrips.length === 0 ? (
                            <div className="md:col-span-2 p-10 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                                <Map className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">尚未建立任何行程。點擊上方按鈕開始規劃！</p>
                            </div>
                        ) : (
                            sortedTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
                        )}
                    </div>
                </Card>
                
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center space-x-3 mb-3">
                            <Briefcase className={`w-6 h-6 text-${primaryColor}`} />
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>行程統計</h2>
                        </div>
                        <p className="text-3xl font-extrabold text-${primaryColor} dark:text-indigo-400">{trips.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">總行程數</p>
                    </Card>
                    
                    <Card>
                        <div className="flex items-center space-x-3 mb-3">
                            <Users className={`w-6 h-6 text-${accentColor}`} />
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>協作狀態</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            此應用程式支援與其他使用者分享行程（尚未實作協作介面）。
                        </p>
                    </Card>
                </div>
            </div>

            <Modal isOpen={showNewTripModal} title="建立新的旅遊行程" onClose={() => setShowNewTripModal(false)}>
                <NewTripForm 
                    userId={userId} 
                    onClose={() => setShowNewTripModal(false)} 
                    onTripCreated={handleTripCreated}
                    isDarkMode={isDarkMode}
                />
            </Modal>
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

// 行程詳情 (TripDetail)
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 實時監聽單一行程文件
    useEffect(() => {
        if (!authReady || !userId || !tripId) return;

        const tripRef = getTripDocRef(tripId, userId);
        if (!tripRef) {
            setError("無效的行程參考。");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
                setError(null);
            } else {
                setError("找不到該行程。");
                setTrip(null);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Firestore snapshot error:", err);
            setError(`載入行程時發生錯誤: ${err.message}`);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [authReady, userId, tripId]);

    // 更新整個行程文件（主要用於規劃編輯）
    const updateTrip = useCallback(async (updates) => {
        if (!tripId) return;
        try {
            const tripRef = getTripDocRef(tripId, userId);
            await updateDoc(tripRef, updates);
            // 由於使用 onSnapshot，這裡不需要手動更新 state
        } catch (err) {
            console.error("Error updating trip:", err);
        }
    }, [tripId, userId]);

    const handleEditBudget = async () => {
        const newBudgetStr = window.prompt("輸入新的總預算金額 (NT$):", trip.budget || 0);
        const newBudget = parseFloat(newBudgetStr);
        if (newBudgetStr !== null && !isNaN(newBudget) && newBudget >= 0) {
            await updateTrip({ budget: newBudget });
        } else if (newBudgetStr !== null) {
            alert("請輸入有效的正數金額。");
        }
    };
    
    // 處理日期的編輯，目前僅支援修改預算
    // 複雜的日期修改會影響 dayPlan 結構，暫時不提供
    const handleEditDates = async () => {
        alert("目前暫不支援直接修改行程日期。如需修改，請重新建立行程。");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className={`w-10 h-10 animate-spin text-${primaryColor}`} />
                <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">載入行程詳情中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
                <p className="text-xl">{error}</p>
                <button onClick={onBack} className={`mt-6 px-4 py-2 rounded-lg bg-${primaryColor} text-white hover:bg-indigo-700 transition`}>
                    <ChevronLeft className="w-5 h-5 inline mr-2" /> 返回儀表板
                </button>
            </div>
        );
    }

    if (!trip) return null;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <button onClick={onBack} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6">
                <ChevronLeft className="w-5 h-5 mr-1" /> 返回儀表板
            </button>
            
            <header className={`rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="mb-4 md:mb-0">
                    <h1 className={`text-3xl font-extrabold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{trip.name}</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)} 
                        <button onClick={handleEditDates} title="編輯日期" className="ml-2 text-${accentColor} hover:text-teal-600">
                            <Edit className="w-4 h-4" />
                        </button>
                    </p>
                    <p className="text-md font-medium text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                        <PiggyBank className="w-4 h-4 mr-2" />
                        總預算: NT$ {trip.budget?.toLocaleString() || 0}
                        <button onClick={handleEditBudget} title="編輯預算" className="ml-2 text-${accentColor} hover:text-teal-600">
                            <Edit className="w-4 h-4" />
                        </button>
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        行程 ID (協作識別碼): <span className="font-mono text-xs p-1 rounded bg-gray-100 dark:bg-gray-700">{tripId}</span>
                    </p>
                </div>
                
                {/* 協作區塊 - 保持精簡 */}
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>協作者: {trip.sharedWith?.length || 0} 人 (僅顯示擁有者)</span>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 預算側邊欄 */}
                <div className="lg:col-span-1 space-y-6">
                    <BudgetSummary trip={trip} isDarkMode={isDarkMode} />
                    
                    {/* 其他資訊卡 */}
                    <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center space-x-3 mb-3">
                            <NotebookPen className={`w-6 h-6 text-${accentColor}`} />
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>行程備註</h2>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">此處為行程規劃的整體備註區。</p>
                        {/* 這裡可以添加備註編輯功能 */}
                    </div>
                </div>

                {/* 每日計畫主區塊 */}
                <div className="lg:col-span-3 space-y-8">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} border-b pb-2 border-gray-200 dark:border-gray-700`}>每日詳細行程</h2>
                    {(trip.dayPlan || []).map((day, index) => (
                        <DayPlan 
                            key={index}
                            day={day}
                            dayIndex={index}
                            tripId={tripId}
                            userId={userId}
                            isDarkMode={isDarkMode}
                            trip={trip} // 傳遞整個 trip 以便更新 dayPlan 陣列
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// 應用程式頂部導航
const Header = ({ title, userId, isDarkMode, toggleDarkMode, onTutorialStart, onBack }) => {
    const defaultTitle = "協作旅遊規劃";
    const userDisplayId = userId ? `${userId.substring(0, 4)}...` : 'Guest'; // 保持全ID顯示的規則，但這裡可能過長，所以只顯示部分

    return (
        <header className={`sticky top-0 z-30 shadow-md ${isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className={`text-2xl font-extrabold text-${primaryColor} dark:text-indigo-400 flex items-center`}>
                        <MapPin className="w-6 h-6 mr-2" />
                        {title || defaultTitle}
                    </h1>
                </div>
                
                <nav className="flex items-center space-x-4">
                    <button 
                        onClick={onTutorialStart} 
                        className={`text-sm font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700'} hover:opacity-80 transition hidden sm:inline-flex`}
                    >
                        <BookOpenText className="w-4 h-4 mr-2" /> 應用程式教學
                    </button>
                    <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
                        <User className="w-4 h-4 mr-1.5 text-${accentColor}" />
                        <span className="hidden sm:inline">User ID: </span>
                        <span className="font-mono text-xs">{userId || 'Loading...'}</span>
                    </div>
                </nav>
            </div>
        </header>
    );
};

// 教學視圖 (TutorialView)
const TutorialView = ({ onBack, isDarkMode }) => {
    const sections = [
        {
            title: "1. 儀表板總覽",
            content: "這是您的起始頁面。您可以在這裡看到所有已建立的行程列表，以及新增行程的按鈕。",
            icon: Home,
        },
        {
            title: "2. 建立新行程",
            content: "點擊『新增旅遊行程』按鈕，填寫行程名稱、開始/結束日期及總預算即可建立。系統會自動為您生成每日計畫表。",
            icon: Plus,
        },
        {
            title: "3. 行程詳情與規劃",
            content: "點擊任一行程卡片進入詳情頁。左側是預算總覽和資訊卡；右側是每日的詳細行程表 (Day Plan)。",
            icon: Map,
        },
        {
            title: "4. 編輯每日項目",
            content: "在每日行程中，點擊 <Plus className='w-4 h-4 inline-block mx-1' /> 按鈕新增項目。已有的項目可以點擊 <Edit className='w-4 h-4 inline-block mx-1' /> 編輯，並使用 <ChevronUp className='w-4 h-4 inline-block mx-1' /> 和 <ChevronDown className='w-4 h-4 inline-block mx-1' /> 調整順序。",
            icon: ClipboardList,
        },
        {
            title: "5. 資料持久化與協作",
            content: "所有資料都儲存在您的專屬 Firebase Firestore 資料庫中。雖然目前協作介面尚未完成，但應用程式結構已為未來的協作功能（例如共享行程 ID）預留空間。",
            icon: Users,
        },
    ];

    const cardClass = `p-6 rounded-xl shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6">
                <ChevronLeft className="w-5 h-5 mr-1" /> 返回儀表板
            </button>
            
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>應用程式快速入門指南</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, index) => (
                    <div key={index} className={cardClass}>
                        <div className="flex items-center space-x-3 mb-3">
                            <section.icon className={`w-6 h-6 text-${primaryColor}`} />
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{section.title}</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{section.content}</p>
                    </div>
                ))}
            </div>

            <div className={`mt-8 p-6 ${cardClass}`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-3`}>關於此應用程式</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    此應用程式旨在提供一個單一頁面的 React 解決方案，用於協同規劃旅遊行程。所有資料使用 Firebase Firestore 實時儲存與更新。
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    **注意：** 由於環境限制，複雜的外部函式庫（如拖曳排序或進階圖表）已使用原生 React/JS 邏輯代替。
                </p>
            </div>
        </div>
    );
};

// --- 主要應用程式元件 ---
const App = () => {
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tripDetail', 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);

    // 黑暗模式切換
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);
    
    // 初始化 Firebase 認證和資料監聽
    useEffect(() => {
        // 1. 認證初始化
        const initializeAuth = async () => {
            try {
                // 優先使用自訂 token 登入 (Canvas 環境)
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    // 如果沒有 token，則匿名登入
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Authentication failed:", error);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Should not happen if signInAnonymously is successful, but for safety
                setUserId(null); 
            }
            setAuthReady(true);
        });

        // 檢查並執行認證
        if (!auth.currentUser) {
            initializeAuth();
        } else {
            setAuthReady(true);
            setUserId(auth.currentUser.uid);
        }

        return () => unsubscribeAuth();
    }, []);

    // 2. 資料監聽 (僅在認證完成後執行)
    useEffect(() => {
        if (!authReady || !userId) return;

        const collectionRef = getUserCollectionRef('trips', userId);
        if (!collectionRef) return;
        
        // 移除 orderBy，在客戶端排序
        const q = query(collectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 視圖切換
    const handleSelectTrip = useCallback((tripId) => {
        setSelectedTripId(tripId);
        setCurrentView('tripDetail');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setCurrentView('dashboard');
        setSelectedTripId(null);
    }, []);
    
    const handleStartTutorial = useCallback(() => {
        setCurrentView('tutorial');
        setSelectedTripId(null);
    }, []);

    if (!authReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className={`w-10 h-10 animate-spin text-${primaryColor}`} />
                <span className={`ml-4 text-lg text-gray-600 dark:text-gray-300`}>載入應用程式與認證中...</span>
            </div>
        );
    }

    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'dark' : ''} text-gray-800 dark:text-gray-100`}>
            {currentView === 'dashboard' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
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
                // TripDetail 已經在內部處理自己的 Header
                <TripDetail 
                    tripId={selectedTripId} 
                    onBack={handleBackToDashboard} 
                    userId={userId} 
                    authReady={authReady}
                    isDarkMode={isDarkMode}
                />
            )}

            {currentView === 'tutorial' && (
                <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
                    {/* 教學頁面的 Header 包含返回功能 */}
                    <Header 
                        title="應用程式教學" 
                        onBack={handleBackToDashboard} // 返回儀表板
                        userId={userId} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode}
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
