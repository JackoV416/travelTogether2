import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth'; // 增加 signOut
import { 
    getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, where, getDocs, runTransaction, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { 
    Home, Users, Briefcase, ListTodo, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Trash2, Save, X, Utensils, Bus, ShoppingBag, Bell, ChevronLeft, CalendarDays, 
    Calculator, Clock, Check, Sun, Moon, LogOut, Map, Edit, AlignLeft, BookOpenText,
    User, Settings, ClipboardList, GripVertical, AlertTriangle, Bot, Users2, UserPlus, XCircle
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
const inputClasses = `w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-${primaryColor.split('-')[0]}-500 focus:border-transparent transition`;
const buttonClasses = (color, disabled) => 
    `w-full font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md ${disabled ? 'bg-gray-400 cursor-not-allowed' : 
    `bg-${color.split('-')[0]}-600 hover:bg-${color.split('-')[0]}-700 text-white focus:outline-none focus:ring-4 focus:ring-${color.split('-')[0]}-300 active:scale-[0.98]`}`;

// 應用程式主體顏色
const bgClasses = "bg-slate-50 dark:bg-gray-900";
const textClasses = "text-gray-800 dark:text-gray-100";
const subTextClasses = "text-gray-500 dark:text-gray-400";


/**
 * 處理指數退避的 fetch 請求，專門用於 LLM API 呼叫
 * @param {string} url - API 網址
 * @param {object} options - Fetch 選項
 * @param {number} maxRetries - 最大重試次數
 * @returns {Promise<Response>}
 */
const fetchWithExponentialBackoff = async (url, options, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
        }
    }
};

// --- Firebase Hooks 與 Context ---

/**
 * 檢查是否為 Manager (Trip 編輯者列表中的第一個用戶)
 * @param {object} trip - 行程資料
 * @param {string} userId - 當前用戶ID
 * @returns {boolean}
 */
const isTripManager = (trip, userId) => {
    return trip && trip.editors && trip.editors.length > 0 && trip.editors[0] === userId;
};


// --- UI 組件 ---

/**
 * 通用 Header 組件，包含主題切換、用戶資訊和登出
 */
const Header = React.memo(({ title, userId, isDarkMode, toggleDarkMode, onTutorialStart, currentUserInfo, handleLogout }) => {
    const avatarUrl = currentUserInfo?.photoURL;
    const displayName = currentUserInfo?.displayName || '用戶';
    const userInitial = displayName.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <h1 className={`text-xl font-bold ${textClasses}`}>{title}</h1>
                <div className="flex items-center space-x-4">
                    
                    {/* 教學按鈕 */}
                    <button 
                        onClick={onTutorialStart}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${subTextClasses}`}
                        title="應用程式教學"
                    >
                        <BookOpenText className="w-5 h-5" />
                    </button>

                    {/* 主題切換按鈕 */}
                    <button 
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${subTextClasses}`}
                        title={isDarkMode ? '切換為白天模式' : '切換為夜間模式'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* 用戶頭像與登出菜單 */}
                    <div className="relative group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-semibold text-sm shadow-md cursor-pointer ring-2 ring-indigo-300 dark:ring-indigo-500">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                userInitial
                            )}
                        </div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
                            <div className={`p-3 border-b dark:border-gray-600 ${textClasses}`}>
                                <p className="font-semibold truncate">{displayName}</p>
                                <p className={`text-xs break-all ${subTextClasses}`}>ID: {userId}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 rounded-b-lg"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                登出
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});


/**
 * 協作者管理組件 (新的功能)
 */
const CollaboratorManager = React.memo(({ trip, userId, authReady }) => {
    const [newUserId, setNewUserId] = useState('');
    const [message, setMessage] = useState('');
    const [isManaging, setIsManaging] = useState(false);
    
    // 檢查當前用戶是否為行程管理者 (editors 列表中的第一個)
    const isManager = isTripManager(trip, userId);

    if (!authReady || !trip) return <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />;

    const tripRef = doc(db, `/artifacts/${appId}/public/data/trips`, trip.id);

    const handleAddCollaborator = async () => {
        if (!newUserId || newUserId === userId) {
            setMessage('請輸入有效的用戶ID，且不能是您自己。');
            return;
        }

        try {
            await updateDoc(tripRef, {
                editors: arrayUnion(newUserId.trim())
            });
            setMessage(`用戶 ${newUserId.trim()} 已成功加入協作。`);
            setNewUserId('');
        } catch (error) {
            console.error("Error adding collaborator:", error);
            setMessage(`新增協作者失敗: ${error.message}`);
        }
    };

    const handleRemoveCollaborator = async (targetId) => {
        if (targetId === userId) {
            setMessage('您不能將自己從編輯者列表中移除。');
            return;
        }
        if (targetId === trip.editors[0]) {
            setMessage('您不能移除行程管理者。請先轉移管理權限。');
            return;
        }

        try {
            await updateDoc(tripRef, {
                editors: arrayRemove(targetId)
            });
            setMessage(`用戶 ${targetId} 已被移除。`);
        } catch (error) {
            console.error("Error removing collaborator:", error);
            setMessage(`移除協作者失敗: ${error.message}`);
        }
    };

    return (
        <div className={`mt-4 ${cardClasses}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClasses}`}>
                <Users2 className="w-5 h-5 mr-2 text-indigo-500" />
                協作者管理
            </h3>

            {isManager ? (
                <div>
                    <div className="flex space-x-2 mb-4">
                        <input
                            type="text"
                            value={newUserId}
                            onChange={(e) => setNewUserId(e.target.value.trim())}
                            placeholder="輸入協作者的用戶ID (UID)"
                            className={`${inputClasses} flex-grow`}
                        />
                        <button 
                            onClick={handleAddCollaborator}
                            disabled={!newUserId}
                            className={buttonClasses('teal', !newUserId || newUserId === userId)}
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                    {message && <p className={`text-sm mb-4 p-2 rounded-lg ${message.includes('失敗') ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'}`}>{message}</p>}
                </div>
            ) : (
                <p className="text-orange-500 dark:text-orange-400 mb-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    您不是此行程的管理者，無法新增或移除協作者。
                </p>
            )}

            <h4 className={`font-medium mb-3 ${textClasses}`}>當前協作者 ({trip.editors.length})</h4>
            <ul className="space-y-2">
                {trip.editors.map((editorId) => (
                    <li key={editorId} className={`flex items-center justify-between p-3 rounded-xl ${editorId === userId ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-indigo-500" />
                            <span className="break-all text-sm font-mono">{editorId}</span>
                            {editorId === userId && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100">您</span>}
                            {editorId === trip.managerId && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100">管理員</span>}
                        </div>
                        {isManager && editorId !== trip.managerId && (
                            <button
                                onClick={() => handleRemoveCollaborator(editorId)}
                                className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition"
                                title="移除協作者"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
});


/**
 * AI 建議行程組件 (新的功能)
 */
const AIAssistant = React.memo(({ trip, userId, onPlanGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPlan, setAiPlan] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerateAIPlan = async () => {
        setIsGenerating(true);
        setAiPlan(null);
        setError(null);

        const tripInfo = `
            行程名稱: ${trip.name}
            目的地: ${trip.destination}
            開始日期: ${trip.startDate}
            結束日期: ${trip.endDate}
            總天數: ${calculateDuration(trip.startDate, trip.endDate) + 1} 天
            目前的待辦事項: ${trip.todos?.map(t => t.name).join(', ') || '無'}
            目前的筆記: ${trip.notes || '無'}
        `;
        
        const systemPrompt = "您是一位世界級的旅遊規劃專家。請根據用戶提供的旅遊資訊，設計一份為期完整的、充滿吸引力的旅遊建議行程，用 Markdown 格式清晰呈現。行程需包含每日安排（例如：上午、下午、晚上），涵蓋景點、美食和可能的交通方式。請用繁體中文回覆，並確保內容實用且易於閱讀。";
        const userQuery = `請為以下行程資訊生成一份詳細的旅遊建議行程。請務必包含每一天的行程規劃，且不要添加任何引言或結語，只需提供完整的 Markdown 格式行程表。行程資訊：\n${tripInfo}`;
        const apiKey = ""; // Canvas runtime will inject the key if needed
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetchWithExponentialBackoff(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '未能生成有效的行程建議，請重試或更換提示。';
            setAiPlan(text);
        } catch (err) {
            console.error("AI generation failed:", err);
            setError("生成 AI 行程建議失敗，請檢查網絡或稍後重試。");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`mt-4 ${cardClasses}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClasses}`}>
                <Bot className="w-5 h-5 mr-2 text-teal-500" />
                AI 旅遊助理
            </h3>

            <button
                onClick={handleGenerateAIPlan}
                disabled={isGenerating}
                className={buttonClasses('teal', isGenerating)}
            >
                {isGenerating ? (
                    <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        生成中... 請稍候
                    </span>
                ) : (
                    '💡 點擊生成 AI 建議行程'
                )}
            </button>
            
            {(aiPlan || error) && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {error ? (
                        <p className="text-red-500 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> {error}</p>
                    ) : (
                        <div>
                            <h4 className="font-semibold mb-2 text-indigo-500">AI 行程建議</h4>
                            <pre className={`whitespace-pre-wrap font-sans text-sm p-3 rounded-lg border dark:border-gray-600 max-h-96 overflow-y-auto ${subTextClasses}`}>
                                {aiPlan}
                            </pre>
                            <button
                                onClick={() => onPlanGenerated(aiPlan)}
                                className={`${buttonClasses('indigo', false)} mt-3 py-2 text-sm`}
                            >
                                <Plus className="w-4 h-4 mr-1 inline-block" /> 儲存至筆記
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});


// ... (原有的 calculateDuration 和 formatDate 函數)

const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    // 增加 1 天處理，因為行程天數是包含開始和結束日期的
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};

const formatDate = (dateString) => {
    if (!dateString) return '未定';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
};


/**
 * Todo List 組件 (新增提醒功能)
 */
const TodoList = React.memo(({ tripId, todos, userId, isDarkMode }) => {
    const [newItem, setNewItem] = useState('');
    const [newDueDate, setNewDueDate] = useState(''); // 新增日期欄位
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    if (!tripId) return <div className={subTextClasses}>請先選擇一個行程。</div>;

    const todoCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips/${tripId}/todos`);

    const handleAddTodo = async () => {
        if (newItem.trim() === '') return;
        
        try {
            await addDoc(todoCollectionRef, {
                name: newItem.trim(),
                completed: false,
                createdAt: serverTimestamp(),
                dueDate: newDueDate || null, // 儲存日期
                reminderSet: !!newDueDate, // 如果有日期，則預設設定提醒
                creatorId: userId,
            });
            setNewItem('');
            setNewDueDate('');
            setShowDueDatePicker(false);
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const handleToggleCompleted = useCallback(async (todo) => {
        const todoRef = doc(db, `/artifacts/${appId}/public/data/trips/${tripId}/todos`, todo.id);
        await updateDoc(todoRef, { completed: !todo.completed });
    }, [tripId]);
    
    // 新增提醒切換
    const handleToggleReminder = useCallback(async (todo) => {
        const todoRef = doc(db, `/artifacts/${appId}/public/data/trips/${tripId}/todos`, todo.id);
        const newReminderState = !todo.reminderSet;
        if (newReminderState && !todo.dueDate) {
            alert("請先設定截止日期才能設定提醒。"); // 簡易提示，實際應用應使用 Modal
            return;
        }
        await updateDoc(todoRef, { reminderSet: newReminderState });
    }, [tripId]);

    const handleDeleteTodo = useCallback(async (id) => {
        const todoRef = doc(db, `/artifacts/${appId}/public/data/trips/${tripId}/todos`, id);
        await deleteDoc(todoRef);
    }, [tripId]);

    // 提醒分類
    const now = new Date();
    const isOverdue = (dateString) => dateString && new Date(dateString) < now;

    const pendingTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    const ReminderSection = ({ title, items, isOverdueList = false }) => (
        <div className="mt-6">
            <h4 className={`font-semibold text-base mb-2 flex items-center ${isOverdueList ? 'text-red-500' : 'text-indigo-500'}`}>
                {isOverdueList ? <AlertTriangle className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                {title} ({items.length})
            </h4>
            <ul className="space-y-3">
                {items.map(todo => (
                    <li key={todo.id} className={`flex items-start p-3 rounded-xl transition duration-150 ${todo.completed ? 'bg-gray-100 dark:bg-gray-700 opacity-60' : 'bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700'}`}>
                        <div className="flex-grow flex items-center min-w-0">
                            <button
                                onClick={() => handleToggleCompleted(todo)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 transition duration-200 ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-500 text-transparent hover:bg-indigo-100 dark:hover:bg-gray-600'}`}
                                title={todo.completed ? '標記為未完成' : '標記為已完成'}
                            >
                                {todo.completed && <Check className="w-4 h-4 mx-auto" />}
                            </button>
                            <div className="flex-grow min-w-0">
                                <span className={`block font-medium truncate ${todo.completed ? 'line-through' : textClasses}`}>{todo.name}</span>
                                {todo.dueDate && (
                                    <div className={`flex items-center space-x-2 text-xs mt-1 ${isOverdue(todo.dueDate) && !todo.completed ? 'text-red-500 dark:text-red-400 font-semibold' : subTextClasses}`}>
                                        <CalendarDays className="w-3 h-3" />
                                        <span>截止日: {formatDate(todo.dueDate)}</span>
                                        {isOverdue(todo.dueDate) && !todo.completed && <span className="text-red-600 dark:text-red-400">(已逾期)</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* 提醒切換按鈕 */}
                        <div className="flex-shrink-0 flex items-center space-x-2 ml-4">
                            <button
                                onClick={() => handleToggleReminder(todo)}
                                disabled={!todo.dueDate}
                                className={`p-1 rounded-full transition ${todo.reminderSet ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                title={todo.reminderSet ? '已設定提醒' : '設定提醒 (需有截止日)'}
                            >
                                <Bell className="w-4 h-4 fill-current" />
                            </button>

                            <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition"
                                title="刪除待辦事項"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );


    // 根據提醒狀態和逾期時間分類待辦事項
    const reminderItems = pendingTodos.filter(t => t.reminderSet);
    const overdueReminders = reminderItems.filter(t => isOverdue(t.dueDate));
    const upcomingReminders = reminderItems.filter(t => !isOverdue(t.dueDate));
    const generalTodos = pendingTodos.filter(t => !t.reminderSet);


    return (
        <div className={`p-4 ${bgClasses}`}>
            <div className={`max-w-xl mx-auto ${textClasses}`}>
                {/* 新增待辦事項 */}
                <div className={`mb-6 p-4 rounded-xl shadow-lg border-t-4 border-indigo-500 ${cardClasses}`}>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="新增一個待辦事項..."
                            className={`${inputClasses} flex-grow`}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                        />
                        <button
                            onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                            className={`p-3 rounded-xl transition ${showDueDatePicker ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600'}`}
                            title="設定截止日期"
                        >
                            <CalendarDays className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleAddTodo}
                            disabled={newItem.trim() === ''}
                            className={buttonClasses('indigo', newItem.trim() === '') + ' w-auto px-4'}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    {showDueDatePicker && (
                        <div className="mt-3">
                            <input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                    )}
                </div>

                {/* 提醒和待辦分類顯示 */}
                <div className="space-y-8">
                    {/* 逾期提醒 (最高優先級) */}
                    {overdueReminders.length > 0 && (
                        <ReminderSection 
                            title="🚨 逾期提醒" 
                            items={overdueReminders} 
                            isOverdueList={true} 
                        />
                    )}

                    {/* 即將到來提醒 */}
                    {upcomingReminders.length > 0 && (
                        <ReminderSection 
                            title="🔔 即將到來提醒" 
                            items={upcomingReminders} 
                            isOverdueList={false} 
                        />
                    )}

                    {/* 一般待辦事項 */}
                    {generalTodos.length > 0 && (
                        <ReminderSection 
                            title="📋 一般待辦事項" 
                            items={generalTodos} 
                            isOverdueList={false} 
                        />
                    )}

                    {/* 已完成事項 */}
                    {completedTodos.length > 0 && (
                        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                            <h4 className={`font-semibold text-base mb-2 text-green-500`}>
                                <Check className="w-4 h-4 mr-2 inline-block" />
                                已完成 ({completedTodos.length})
                            </h4>
                            <ul className="space-y-3">
                                {completedTodos.map(todo => (
                                     <li key={todo.id} className="flex items-start p-3 rounded-xl bg-gray-100 dark:bg-gray-700 opacity-60 transition duration-150">
                                         <div className="flex-grow flex items-center min-w-0">
                                             <button
                                                onClick={() => handleToggleCompleted(todo)}
                                                className="flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 bg-green-500 border-green-500 text-white"
                                            >
                                                <Check className="w-4 h-4 mx-auto" />
                                            </button>
                                            <span className={`block font-medium truncate line-through ${subTextClasses}`}>{todo.name}</span>
                                        </div>
                                         <button
                                            onClick={() => handleDeleteTodo(todo.id)}
                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition ml-4"
                                            title="刪除待辦事項"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {todos.length === 0 && <p className={`text-center py-8 ${subTextClasses}`}>此行程尚未有任何待辦事項。盡情規劃吧！</p>}
                </div>
            </div>
        </div>
    );
});


/**
 * 行程詳情主組件
 */
const TripDetail = ({ tripId, onBack, userId, authReady, isDarkMode }) => {
    const [trip, setTrip] = useState(null);
    const [todos, setTodos] = useState([]);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [tempNotes, setTempNotes] = useState('');
    const notesTimeoutRef = useRef(null);

    // 獲取行程數據 (Public Path + editors 驗證)
    useEffect(() => {
        if (!authReady || !tripId) return;

        const tripRef = doc(db, `/artifacts/${appId}/public/data/trips`, tripId);
        const unsubscribeTrip = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                const tripData = { id: docSnap.id, ...docSnap.data() };
                // 檢查用戶是否為編輯者
                if (tripData.editors && tripData.editors.includes(userId)) {
                    setTrip(tripData);
                    setTempNotes(tripData.notes || '');
                } else {
                    console.error("Access Denied: User is not an editor of this trip.");
                    alert("您沒有權限編輯此行程，已自動跳轉回儀表板。");
                    onBack();
                }
            } else {
                console.log("Trip document not found.");
                onBack(); // 回到儀表板
            }
        }, (error) => {
            console.error("Error fetching trip document:", error);
            alert(`載入行程失敗: ${error.message}`);
            onBack();
        });

        const todoCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips/${tripId}/todos`);
        // 注意：這裡不使用 orderBy，避免Firestore索引問題，改為客戶端排序
        const q = query(todoCollectionRef); 
        const unsubscribeTodos = onSnapshot(q, (snapshot) => {
            const todosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // 在客戶端排序，未完成在前，已完成在後
            todosData.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1; // 未完成在前
                }
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); // 否則按創建時間倒序
            });
            setTodos(todosData);
        }, (error) => {
            console.error("Error fetching todos:", error);
        });

        return () => {
            unsubscribeTrip();
            unsubscribeTodos();
        };
    }, [tripId, userId, authReady, onBack]);

    // 處理筆記自動儲存
    const handleNotesChange = (e) => {
        const newNotes = e.target.value;
        setTempNotes(newNotes);
        
        if (notesTimeoutRef.current) {
            clearTimeout(notesTimeoutRef.current);
        }

        notesTimeoutRef.current = setTimeout(async () => {
            if (trip) {
                const tripRef = doc(db, `/artifacts/${appId}/public/data/trips`, trip.id);
                try {
                    await updateDoc(tripRef, { notes: newNotes });
                    console.log("Notes autosaved.");
                } catch (error) {
                    console.error("Error saving notes:", error);
                }
            }
        }, 1500); // 1.5秒後自動儲存
    };
    
    // 將 AI 生成的內容加入筆記
    const handleAICopyToNotes = useCallback(async (aiPlan) => {
        const newNotes = (trip?.notes || '') + '\n\n---\n\n## AI 建議行程\n\n' + aiPlan;
        setTempNotes(newNotes);
        const tripRef = doc(db, `/artifacts/${appId}/public/data/trips`, trip.id);
        try {
            await updateDoc(tripRef, { notes: newNotes });
            alert("AI 行程已成功儲存到筆記中。");
            setActiveTab('notes'); // 切換到筆記頁面
        } catch (error) {
            console.error("Error saving AI plan to notes:", error);
            alert("儲存 AI 行程到筆記失敗。");
        }
    }, [trip]);


    const tabClasses = (isActive) => 
        `flex-1 py-3 px-1 text-center font-medium rounded-t-xl transition duration-150 flex items-center justify-center ${
            isActive 
            ? `bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-4 border-indigo-600 dark:border-indigo-400`
            : `bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`
        }`;

    const renderContent = () => {
        if (!trip) return null;

        switch (activeTab) {
            case 'itinerary':
                return (
                    <div className="space-y-6">
                        <AIAssistant trip={trip} userId={userId} onPlanGenerated={handleAICopyToNotes} />
                        <div className={`mt-4 ${cardClasses}`}>
                            <h3 className={`text-lg font-semibold mb-3 ${textClasses}`}>基本資訊</h3>
                            <p className={subTextClasses}>目的地: <span className="font-medium text-indigo-500">{trip.destination}</span></p>
                            <p className={subTextClasses}>日期: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                            <p className={subTextClasses}>總天數: <span className="font-medium text-indigo-500">{calculateDuration(trip.startDate, trip.endDate) + 1}</span> 天</p>
                        </div>
                        {/* 這裡可以擴展為日曆/日程規劃功能 */}
                        <div className={`mt-4 ${cardClasses}`}>
                            <h3 className={`text-lg font-semibold mb-3 ${textClasses}`}>詳細日程 (功能尚未完善)</h3>
                            <p className={subTextClasses}>您可以透過新增筆記來規劃每日的詳細行程。</p>
                        </div>
                    </div>
                );
            case 'todos':
                return <TodoList tripId={tripId} todos={todos} userId={userId} isDarkMode={isDarkMode} />;
            case 'notes':
                return (
                    <div className={`mt-4 ${cardClasses}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${textClasses}`}>筆記與規劃</h3>
                            <button
                                onClick={() => setIsEditingNotes(!isEditingNotes)}
                                className={`p-2 rounded-full transition ${isEditingNotes ? 'bg-red-100 text-red-500 dark:bg-red-900/50 dark:text-red-400' : 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-400'} hover:opacity-80`}
                                title={isEditingNotes ? '取消編輯' : '編輯筆記'}
                            >
                                {isEditingNotes ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                            </button>
                        </div>
                        <textarea
                            value={tempNotes}
                            onChange={handleNotesChange}
                            rows={15}
                            placeholder="在這裡寫下您的旅行筆記、想法和詳細規劃..."
                            disabled={!isEditingNotes}
                            className={`${inputClasses} resize-none ${isEditingNotes ? 'opacity-100' : 'opacity-75 cursor-default'}`}
                        />
                        {!isEditingNotes && <p className={`mt-3 text-sm ${subTextClasses}`}>點擊右上角的編輯按鈕開始編輯。</p>}
                    </div>
                );
            case 'collaborators':
                return <CollaboratorManager trip={trip} userId={userId} authReady={authReady} />;
            default:
                return null;
        }
    };

    if (!trip) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen ${bgClasses}`}>
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className={`mt-4 text-lg ${textClasses}`}>載入行程詳情中...</p>
            </div>
        );
    }
    
    // 計算提醒數量 (未完成 & 設定提醒 & 逾期)
    const now = new Date();
    const isOverdue = (dateString) => dateString && new Date(dateString) < now;
    const pendingReminders = todos.filter(t => !t.completed && t.reminderSet && isOverdue(t.dueDate)).length;


    return (
        <div className={`min-h-screen ${bgClasses}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
                {/* 行程標題與返回按鈕 */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onBack} className={`flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition`}>
                        <ChevronLeft className="w-6 h-6 mr-1" />
                        <span className="text-lg font-medium">返回儀表板</span>
                    </button>
                    <h2 className={`text-2xl font-bold truncate max-w-[70%] ${textClasses}`}>{trip.name}</h2>
                </div>

                {/* 導航標籤 */}
                <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                    {[
                        { id: 'itinerary', name: '行程總覽', icon: CalendarDays },
                        { id: 'todos', name: '待辦與提醒', icon: ListTodo },
                        { id: 'notes', name: '筆記', icon: NotebookPen },
                        { id: 'collaborators', name: '協作者', icon: Users2 },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={tabClasses(activeTab === tab.id)}
                        >
                            <div className="flex items-center justify-center whitespace-nowrap">
                                <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'} `} />
                                <span className="ml-1">{tab.name}</span>
                                {tab.id === 'todos' && pendingReminders > 0 && (
                                    <span className="ml-2 w-5 h-5 text-xs font-bold rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">{pendingReminders}</span>
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


/**
 * 儀表板組件
 */
const Dashboard = ({ onSelectTrip, trips, userId, authReady, isDarkMode, toggleDarkMode, onTutorialStart, currentUserInfo, handleLogout }) => {
    const [newTripName, setNewTripName] = useState('');
    const [newTripDestination, setNewTripDestination] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState('');
    const [newTripEndDate, setNewTripEndDate] = useState('');
    const [showNewTripModal, setShowNewTripModal] = useState(false);
    
    // 計算總的逾期提醒數量
    const totalOverdueReminders = useMemo(() => {
        let count = 0;
        const now = new Date();
        const isOverdue = (dateString) => dateString && new Date(dateString) < now;
        
        trips.forEach(trip => {
            if (trip.todos) {
                trip.todos.forEach(todo => {
                    if (!todo.completed && todo.reminderSet && isOverdue(todo.dueDate)) {
                        count++;
                    }
                });
            }
        });
        return count;
    }, [trips]);


    const handleCreateTrip = async () => {
        if (!newTripName.trim() || !newTripDestination.trim() || !newTripStartDate || !newTripEndDate) {
            alert('請填寫所有行程資訊。');
            return;
        }

        try {
            const tripsCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips`);
            
            // 使用 runTransaction 確保資料一致性，但這裡我們只是新增，簡單的 addDoc 即可
            const newTripRef = await addDoc(tripsCollectionRef, {
                name: newTripName.trim(),
                destination: newTripDestination.trim(),
                startDate: new Date(newTripStartDate).toISOString().split('T')[0], // 確保格式一致
                endDate: new Date(newTripEndDate).toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                // 協作資訊
                editors: [userId], // 創建者自動成為第一個編輯者
                managerId: userId, // 創建者為管理員
                // 額外欄位
                notes: '',
            });

            console.log("New trip added with ID:", newTripRef.id);
            // 清空表單並關閉 Modal
            setNewTripName('');
            setNewTripDestination('');
            setNewTripStartDate('');
            setNewTripEndDate('');
            setShowNewTripModal(false);
            onSelectTrip(newTripRef.id); // 立即跳轉到新行程詳情
        } catch (error) {
            console.error("Error creating new trip:", error);
            alert(`創建行程失敗: ${error.message}`);
        }
    };

    const handleDeleteTrip = async (id, tripName) => {
        if (window.confirm(`確定要刪除行程「${tripName}」及其所有資料嗎？此操作不可逆轉。`)) {
            try {
                // 刪除行程文件
                const tripRef = doc(db, `/artifacts/${appId}/public/data/trips`, id);
                await deleteDoc(tripRef);

                // 實際應用中還需要刪除子集合 (todos, budgets, etc.)，但為保持單一檔案的簡潔性，這裡僅刪除主文件。
                // 在 Firestore 安全規則的保護下，子集合通常不會被未經授權的用戶訪問。
                console.log(`Trip ${id} deleted.`);
            } catch (error) {
                console.error("Error deleting trip:", error);
                alert(`刪除行程失敗: ${error.message}`);
            }
        }
    };

    const TripCard = ({ trip }) => (
        <div className={`p-4 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-2xl transition duration-300 ${cardClasses}`}>
            <div 
                onClick={() => onSelectTrip(trip.id)} 
                className="cursor-pointer"
            >
                <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold truncate ${textClasses}`}>{trip.name}</h3>
                    {trip.editors.length > 1 && (
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <Users className="w-4 h-4 mr-1" />
                            {trip.editors.length} 人協作
                        </div>
                    )}
                </div>
                <p className={`mt-2 flex items-center ${subTextClasses}`}>
                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                    目的地: <span className="font-medium ml-1 text-indigo-500 dark:text-indigo-400">{trip.destination}</span>
                </p>
                <p className={`flex items-center ${subTextClasses}`}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    日期: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className={`text-sm ${subTextClasses}`}>
                    管理者: <span className="font-mono text-xs break-all">{trip.managerId === userId ? '您' : trip.managerId.substring(0, 8) + '...'}</span>
                </p>
                <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id, trip.name); }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition"
                    title="刪除行程"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const Modal = ({ show, onClose, title, children }) => {
        if (!show) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className={`w-full max-w-md ${cardClasses}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                        <h3 className={`text-xl font-bold ${textClasses}`}>{title}</h3>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${bgClasses}`}>
            {/* 這裡不再包含 Header，因為 Header 被移到 App 主體以提供全局登出 */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className={`text-3xl font-extrabold mb-6 ${textClasses} flex items-center`}>
                    <Home className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
                    我的旅遊儀表板
                </h2>

                {/* 提醒總覽 */}
                {totalOverdueReminders > 0 && (
                    <div className="mb-6 p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center shadow-lg">
                        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">
                            您有 <span className="text-xl font-extrabold">{totalOverdueReminders}</span> 項已逾期的重要提醒，請進入行程查看！
                        </p>
                    </div>
                )}


                <div className="mb-8 flex justify-end">
                    <button
                        onClick={() => setShowNewTripModal(true)}
                        className={buttonClasses('indigo', false) + ' w-auto px-6 py-3 flex items-center'}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        創建新行程
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.length > 0 ? (
                        trips.map(trip => <TripCard key={trip.id} trip={trip} />)
                    ) : (
                        <p className={`md:col-span-2 text-center py-12 text-lg ${subTextClasses}`}>
                            尚未有任何行程，點擊上方按鈕創建您的第一次旅程吧！
                        </p>
                    )}
                </div>

                {/* 創建新行程 Modal */}
                <Modal 
                    show={showNewTripModal} 
                    onClose={() => setShowNewTripModal(false)} 
                    title="創建新行程"
                >
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={newTripName}
                            onChange={(e) => setNewTripName(e.target.value)}
                            placeholder="行程名稱 (例如: 2025 日本關西之旅)"
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            value={newTripDestination}
                            onChange={(e) => setNewTripDestination(e.target.value)}
                            placeholder="目的地 (例如: 大阪、京都)"
                            className={inputClasses}
                        />
                        <p className={subTextClasses}>開始日期:</p>
                        <input
                            type="date"
                            value={newTripStartDate}
                            onChange={(e) => setNewTripStartDate(e.target.value)}
                            className={inputClasses}
                        />
                        <p className={subTextClasses}>結束日期:</p>
                        <input
                            type="date"
                            value={newTripEndDate}
                            onChange={(e) => setNewTripEndDate(e.target.value)}
                            className={inputClasses}
                        />
                        <button
                            onClick={handleCreateTrip}
                            className={buttonClasses('indigo', !newTripName || !newTripDestination || !newTripStartDate || !newTripEndDate)}
                            disabled={!newTripName || !newTripDestination || !newTripStartDate || !newTripEndDate}
                        >
                            <Save className="w-5 h-5 mr-2 inline-block" />
                            確認創建
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};


/**
 * 教學視圖組件
 */
const TutorialView = React.memo(({ onBack, isDarkMode }) => {
    const tutorialContent = [
        { title: "總覽", icon: Home, content: "這是您的旅遊儀表板，所有行程一目瞭然。" },
        { title: "多用戶協作", icon: Users2, content: "進入行程詳情頁面後，點擊「協作者」標籤，您可以使用其他用戶的 UID (ID: 後的長字串) 來邀請他們一同編輯您的行程。只有行程的管理者（創建者）能新增和移除協作者。" },
        { title: "AI 建議行程", icon: Bot, content: "在「行程總覽」頁籤下，您可以點擊按鈕呼叫 AI 旅遊助理，根據您的日期和目的地生成一個詳細的建議行程。生成的內容可直接儲存到筆記中。" },
        { title: "提醒功能", icon: Bell, content: "在「待辦與提醒」頁籤下，您可以為待辦事項設定截止日期，並將其標記為「提醒」。系統會追蹤已逾期的提醒並在儀表板和標籤上顯示數量，確保您不會錯過重要事項。" },
        { title: "用戶與登出", icon: LogOut, content: "右上角是您的頭像和用戶 ID。您可以隨時點擊登出按鈕來退出當前登入狀態。" },
        { title: "主題切換", icon: Sun, content: "您可以隨時切換白天或夜間模式，以獲得更舒適的視覺體驗。" },
    ];

    return (
        <div className={`min-h-screen ${bgClasses}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button onClick={onBack} className={`mb-6 flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition`}>
                    <ChevronLeft className="w-6 h-6 mr-1" />
                    <span className="text-lg font-medium">返回</span>
                </button>
                <h2 className={`text-3xl font-extrabold mb-8 text-center ${textClasses}`}>
                    <BookOpenText className="w-8 h-8 mr-3 inline-block text-indigo-600 dark:text-indigo-400" />
                    應用程式使用教學
                </h2>
                
                <div className="space-y-6">
                    {tutorialContent.map((item, index) => (
                        <div key={index} className={cardClasses}>
                            <h3 className={`text-xl font-semibold mb-2 flex items-center text-indigo-600 dark:text-indigo-400`}>
                                <item.icon className="w-6 h-6 mr-3" />
                                {item.title}
                            </h3>
                            <p className={subTextClasses}>{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});


/**
 * 主應用程式組件
 */
const App = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'tripDetail' | 'tutorial'
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null); // 用於頭像和登出
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Firebase 認證和初始化
    useEffect(() => {
        const initAuth = async () => {
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

        // 監聽認證狀態變化
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setCurrentUserInfo({
                    displayName: user.displayName || `用戶 ${user.uid.substring(0, 4)}`,
                    photoURL: user.photoURL,
                });
            } else {
                setUserId(null);
                setCurrentUserInfo(null);
            }
            setAuthReady(true);
        });

        initAuth();
        return () => unsubscribe();
    }, []);

    // 獲取所有行程數據 (使用 where('editors', 'array-contains', userId) 實現協作訪問)
    useEffect(() => {
        if (!authReady || !userId) {
            setTrips([]);
            return;
        }

        const tripsCollectionRef = collection(db, `/artifacts/${appId}/public/data/trips`);
        // 查詢當前用戶 ID 存在於 editors 數組中的行程
        const q = query(
            tripsCollectionRef,
            where('editors', 'array-contains', userId)
            // 這裡不再使用 orderBy('createdAt', 'desc') 以避免潛在的索引問題
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 為了獲取每個行程的 Todos 數量，需要額外查詢，這會增加讀取次數。
            // 這裡採用優化做法: 在 TripDetail 頁面監聽 Todos，在 Dashboard 僅顯示主要資訊。
            // 但為了實現總提醒數，我們必須在 Dashboard 層次獲取 todos
            
            // 由於複雜的嵌套 onSnapshot 會導致大量的 Firestore 讀取和潛在的性能問題，
            // 這裡將「總提醒數」的計算依賴於一個預先在 trip 結構中同步的欄位 (例如 trip.overdueRemindersCount) 
            // 或是從 TripDetail 返回時更新數據。
            
            // 為了保持單一文件和簡單性，我們會在 Dashboard 組件中對 trips 數組進行處理。
            // 這裡先設定主要行程數據，待 Dashboard 處理 todos 數據。

            // 獲取 todos 子集合的資料 (一個較昂貴的操作)
            const tripsWithTodos = await Promise.all(tripsData.map(async (trip) => {
                const todosRef = collection(db, `/artifacts/${appId}/public/data/trips/${trip.id}/todos`);
                const todosSnapshot = await getDocs(todosRef); // 使用 getDocs 而非 onSnapshot
                const todos = todosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return { ...trip, todos };
            }));

            setTrips(tripsWithTodos);

        }, (error) => {
            console.error("Error fetching trips:", error);
            alert(`載入行程列表失敗: ${error.message}`);
        });

        return () => unsubscribe();
    }, [authReady, userId]);

    // 主題切換
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

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
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            // 登出後，onAuthStateChanged 會將 userId 設為 null，並觸發重新登入匿名用戶
            setCurrentView('dashboard');
            setSelectedTripId(null);
        } catch (error) {
            console.error("Logout failed:", error);
            alert("登出失敗，請檢查網絡。");
        }
    }, []);


    if (!authReady) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className={`ml-4 text-lg ${textClasses}`}>載入應用程式與認證中...</span>
            </div>
        );
    }
    
    // 渲染 Header
    const renderHeader = () => (
        <Header 
            title={currentView === 'dashboard' ? '旅遊協作儀表板' : (currentView === 'tutorial' ? '應用程式教學' : '行程規劃')}
            userId={userId} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
            onTutorialStart={handleStartTutorial}
            currentUserInfo={currentUserInfo}
            handleLogout={handleLogout}
        />
    );


    return (
        <div className={`font-sans antialiased min-h-screen ${isDarkMode ? 'dark' : ''} ${bgClasses} ${textClasses}`}>
            
            {renderHeader()}
            
            <main>
                {currentView === 'dashboard' && (
                    <Dashboard 
                        onSelectTrip={handleSelectTrip} 
                        trips={trips} 
                        userId={userId} 
                        authReady={authReady}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        onTutorialStart={handleStartTutorial}
                        currentUserInfo={currentUserInfo}
                        handleLogout={handleLogout}
                    />
                )}
                
                {currentView === 'tripDetail' && (
                    <TripDetail 
                        tripId={selectedTripId} 
                        onBack={handleBackToDashboard} 
                        userId={userId} 
                        authReady={authReady}
                        isDarkMode={isDarkMode}
                    />
                )}

                {currentView === 'tutorial' && (
                    <TutorialView 
                        onBack={handleBackToDashboard} 
                        isDarkMode={isDarkMode}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
