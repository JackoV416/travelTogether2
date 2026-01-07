import React, { useState, useEffect } from 'react';
import { ArrowLeft, BrainCircuit, Lock, Sparkles, Eye, EyeOff, RotateCcw, GripVertical, Server, ShieldCheck, Activity, User, Trash2, WifiOff, Save, AlertTriangle, Settings, LayoutGrid } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CURRENCIES, TIMEZONES, LANGUAGE_OPTIONS, APP_VERSION, JARVIS_VERSION } from '../../constants/appData';
import { inputClasses } from '../../utils/tripUtils';
import { getUserQuotaStatus, getSystemAnalytics } from '../../services/ai-quota';
import { updateUserProfile, deleteUserAccount, saveUserSettings, loadUserSettings } from '../../services/accountService';
import { isOnline, subscribeNetworkStatus } from '../../utils/networkUtils';
import JarvisLogo from '../Shared/JarvisLogo';

// Default Widget Configuration
const DEFAULT_WIDGETS = [
    { id: 'weather', name: '天氣預報', visible: true },
    { id: 'news', name: '旅遊新聞', visible: true },
    { id: 'hotels', name: '酒店推介', visible: true },
    { id: 'flights', name: '機票優惠', visible: true },
    { id: 'transport', name: '交通資訊', visible: true },
    { id: 'connectivity', name: '網絡方案', visible: true },
    { id: 'currency', name: '匯率計算', visible: true },
];

const SettingsView = ({ globalSettings, setGlobalSettings, isDarkMode, onBack, initialTab = 'general', user, isAdmin }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [intelTab, setIntelTab] = useState('usage'); // V1.2.3: Intelligence Sub-tabs

    // Widget Customization State
    const [widgetConfig, setWidgetConfig] = useState(() => {
        const saved = localStorage.getItem('dashboardWidgets');
        return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    });

    // Handle Drag End for Widgets
    const handleWidgetDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(widgetConfig);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setWidgetConfig(items);
        localStorage.setItem('dashboardWidgets', JSON.stringify(items));
    };

    const AI_INTERESTS = [
        { id: 'history', label: '歷史文化' },
        { id: 'nature', label: '自然風光' },
        { id: 'food', label: '地道美食' },
        { id: 'shopping', label: '購物血拼' },
        { id: 'adventure', label: '冒險體驗' },
        { id: 'art', label: '藝術展覽' },
        { id: 'nightlife', label: '夜生活' },
        { id: 'relax', label: '休閒放鬆' }
    ];

    const toggleInterest = (id) => {
        const current = globalSettings.preferences || [];
        const newPrefs = current.includes(id)
            ? current.filter(i => i !== id)
            : [...current, id];
        setGlobalSettings({ ...globalSettings, preferences: newPrefs });
    };

    // V1.4: Track both calls and tokens
    const [aiUsage, setAiUsage] = useState({ used: 0, total: 50, remaining: 50, tokens: 0, breakdown: {} });
    const [timeUntilReset, setTimeUntilReset] = useState("");

    // V1.2.3: Admin Analytics State
    const [adminAnalytics, setAdminAnalytics] = useState(null);

    useEffect(() => {
        const updateStats = async () => {
            if (user?.uid) {
                const status = await getUserQuotaStatus(user.uid);
                setAiUsage({
                    used: status.used,
                    total: status.total,
                    remaining: status.remaining,
                    customUsed: status.customUsed || 0,
                    breakdown: status.features || {}
                });
            }

            // Calculate time until next reset (Midnight)
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diffMs = tomorrow - now;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setTimeUntilReset(`${hours}小時 ${minutes}分鐘`);

            // Admin Analytics (If authorized)
            if (isAdmin) {
                const analytics = await getSystemAnalytics();
                setAdminAnalytics(analytics);
            }
        };

        updateStats();
        // Update every minute for countdown
        const interval = setInterval(updateStats, 60000);

        // Listen for real-time updates (V1.4)
        const handleQuotaUpdate = (e) => {
            const detail = e.detail;
            setAiUsage(prev => ({
                ...prev,
                used: detail.used,
                total: detail.total,
                remaining: detail.remaining,
                breakdown: detail.breakdown || prev.breakdown
            }));
        };

        window.addEventListener('AI_QUOTA_UPDATED', handleQuotaUpdate);
        return () => {
            window.removeEventListener('AI_QUOTA_UPDATED', handleQuotaUpdate);
            clearInterval(interval);
        };
    }, [activeTab, user?.uid, isAdmin]);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-36">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">設定</h1>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        管理您的應用程式偏好、Jarvis 設定與 API 金鑰。
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? (isDarkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow-lg') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        <Settings className="w-4 h-4" /> 一般設定
                    </button>
                    <button
                        onClick={() => setActiveTab('intelligence')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'intelligence' ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        <BrainCircuit className="w-4 h-4" /> Jarvis AI
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'info' ? (isDarkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow-lg') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> 資訊中心設定
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'account' ? (isDarkMode ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-100') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        <User className="w-4 h-4" /> 帳戶管理
                    </button>
                </div>

                {/* Main Content Area */}
                <div className={`md:col-span-3 rounded-3xl p-6 md:p-8 shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>

                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="max-w-lg">
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">貨幣單位</label>
                                <select value={globalSettings.currency} onChange={e => setGlobalSettings({ ...globalSettings, currency: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c} - {CURRENCIES[c].symbol}</option>)}
                                </select>
                                <p className="mt-2 text-xs opacity-50 ml-1">所有行程預算將以此貨幣顯示</p>
                            </div>

                            <div className="max-w-lg">
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預設所在地 (用於緊急資訊)</label>
                                <select value={globalSettings.region} onChange={e => setGlobalSettings({ ...globalSettings, region: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.keys(TIMEZONES).map(r => <option key={r} value={r}>{TIMEZONES[r].label}</option>)}
                                </select>
                            </div>

                            <div className="max-w-lg">
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">介面語言</label>
                                <select value={globalSettings.language} onChange={e => setGlobalSettings({ ...globalSettings, language: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => <option key={code} value={code}>{conf.label}</option>)}
                                </select>
                            </div>

                            <div className="max-w-lg flex items-center justify-between p-4 rounded-xl border border-gray-500/10 bg-gray-500/5">
                                <div>
                                    <div className="font-bold text-sm">省流量模式 (Data Saver)</div>
                                    <div className="text-xs opacity-60 mt-0.5">使用壓縮圖片以節省數據用量，適合漫遊時使用</div>
                                </div>
                                <button
                                    onClick={() => {
                                        const newVal = !globalSettings.dataSaver;
                                        setGlobalSettings({ ...globalSettings, dataSaver: newVal });
                                        const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                        localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, dataSaver: newVal }));
                                    }}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${globalSettings.dataSaver ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${globalSettings.dataSaver ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* V1.2.4: Replay Tutorial */}
                            <div className="max-w-lg p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            <span>🎓</span> 重播新手導覽
                                        </div>
                                        <div className="text-xs opacity-60 mt-0.5">重新體驗 Jarvis 的新手教學流程</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('travelTogether_onboardingComplete');
                                            onBack();
                                            setTimeout(() => {
                                                window.dispatchEvent(new CustomEvent('START_ONBOARDING_TOUR'));
                                            }, 500);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-3 h-3" /> 開始導覽
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'intelligence' && (
                        <div className="animate-fade-in">
                            {/* Intelligence Sub-Tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {['usage', 'api', 'prefs', 'help'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setIntelTab(tab)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${intelTab === tab
                                            ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                                            : (isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
                                            }`}
                                    >
                                        {tab === 'usage' && '📊 使用量'}
                                        {tab === 'api' && '🔑 API Keys'}
                                        {tab === 'prefs' && '⭐ 偏好設定'}
                                        {tab === 'help' && '❓ Help & QA'}
                                    </button>
                                ))}
                            </div>

                            {/* 1. Usage Tab */}
                            {intelTab === 'usage' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Header with Logo */}
                                    <div className="flex items-center gap-5 mb-4">
                                        <JarvisLogo size="lg" showText={false} />
                                        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                                            <div className="flex flex-col justify-center">
                                                <h3 className="font-black tracking-[0.2em] uppercase leading-none text-white font-sans text-sm">
                                                    JARVIS AI
                                                </h3>
                                                <p className="font-bold opacity-40 uppercase tracking-tight text-white text-[10px] mt-1">
                                                    VER {JARVIS_VERSION}
                                                </p>
                                            </div>
                                            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                                            <div>
                                                <h3 className="font-bold text-2xl text-white tracking-tight">Jarvis Intelligence</h3>
                                                <p className="text-sm opacity-50 text-gray-300">你的私人 Jarvis 旅遊助理</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <label className="text-sm font-bold opacity-90 flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-indigo-500" />今日用量統計
                                                </label>
                                                <p className="text-[10px] opacity-40 mt-1">累積消耗: <span className="text-indigo-400 font-mono font-bold">{(aiUsage.tokens || 0).toLocaleString()} Tokens</span></p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-indigo-500 font-mono">{aiUsage.used} <span className="text-sm opacity-50 font-normal text-gray-500">/ {aiUsage.total}</span></div>
                                                <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest">Requests</div>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-gray-500/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${aiUsage.remaining < 5 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-400'}`}
                                                style={{ width: `${Math.min(100, (aiUsage.used / aiUsage.total) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-3">
                                            <p className="text-[10px] opacity-40 uppercase tracking-tighter font-bold">Status: {aiUsage.remaining > 0 ? 'Active' : 'Limit Reached'}</p>
                                            <div className="text-right">
                                                <p className="text-[10px] opacity-50">重置倒數: {timeUntilReset}</p>
                                            </div>
                                        </div>

                                        {/* User Quota Warning */}
                                        {aiUsage.remaining <= 5 && (
                                            <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3 animate-pulse">
                                                <div className="p-1.5 bg-orange-500/20 rounded-full mt-0.5">
                                                    <BrainCircuit className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div>
                                                    <h5 className="text-xs font-bold text-orange-400 mb-1">免費額度即將用盡</h5>
                                                    <p className="text-[10px] opacity-70 leading-relaxed text-orange-300">
                                                        您今日的體驗額度剩餘不多。建議前往 <strong>API Keys</strong> 頁面輸入您的其他 AI API Key，即可解除限制無限使用。
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* V1.2.3: Dynamic Feature Usage List */}
                                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50/50 border-gray-200'}`}>
                                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            功能使用明細 (今日)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { id: 'Chat', label: '💬 全能對話助手', cost: '~100t', desc: '解答天氣、匯率、行程建議等問題 (每次對話算 1 次)' },
                                                { id: 'Itinerary', label: '🧠 Jarvis 行程生成', cost: '~500t', desc: '從文字描述生成結構化行程 (每生成 1 天算 1 次)' },
                                                { id: 'WeatherSummary', label: '🌤️ 智能天氣分析', cost: '~150t', desc: '根據天氣預報提供穿搭與活動建議 (每次分析算 1 次)' },
                                                { id: 'TransportSuggest', label: '🚆 交通路線建議', cost: '~300t', desc: '多城市行程自動計算交通方式 (每次呼叫算 1 次)' },
                                                { id: 'TripName', label: '🤖 智能命名', cost: '~50t', desc: '新行程建立時自動生成創意名稱 (每次生成算 1 次)' },
                                                { id: 'TicketAnalysis', label: '📸 智能截圖匯入', cost: '~1.5kt', desc: 'Jarvis 解析行程截圖或 PDF (每次匯入算 1 次)' },
                                                { id: 'DailyAnalysis', label: '📊 每日行程分析', cost: '~300t', desc: '分析每日行程安排並提供優化建議 (每次日算 1 次)' },
                                                { id: 'ReportSummary', label: '📝 工單摘要', cost: '~200t', desc: '自動生成客服回報摘要 (每次提交算 1 次)' },
                                                { id: 'ShoppingList', label: '🛍️ 智能購物清單', cost: '~100t', desc: '根據行程推薦必買手信及購物點 (每次生成算 1 次)' },
                                                { id: 'PackingList', label: '🎒 智能行李清單', cost: '~100t', desc: '根據天氣及活動建議執拾清單 (每次生成算 1 次)' }
                                            ].map(feature => {
                                                const count = aiUsage.breakdown?.[feature.id] || 0;
                                                return (
                                                    <div key={feature.id} className={`p-3 rounded-xl flex flex-col gap-2 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} ${count > 0 ? 'border border-indigo-500/30 ring-1 ring-indigo-500/20' : 'border border-transparent opacity-70 hover:opacity-100 transition-opacity'}`}>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-bold text-xs flex items-center gap-2">
                                                                    {feature.label}
                                                                    {count > 0 && <span className="flex w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>}
                                                                </div>
                                                                <div className="text-[10px] opacity-50 font-mono mt-0.5">{feature.cost} / request</div>
                                                            </div>
                                                            <div className={`text-xl font-black font-mono ${count > 0 ? 'text-indigo-400' : 'opacity-20'}`}>
                                                                {count} <span className="text-[10px] font-normal opacity-50">次</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] opacity-60 leading-relaxed border-t border-gray-500/10 pt-2">
                                                            {feature.desc}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Admin Monitor Section (Visible only to Admin) */}
                                    {isAdmin && (
                                        <div className="animate-fade-in mt-8 pt-8 border-t border-gray-500/20">
                                            <div className="flex items-center gap-2 text-red-400 font-bold mb-4">
                                                <ShieldCheck className="w-5 h-5" />
                                                Admin Console: API Monitor
                                            </div>
                                            <div className={`p-4 rounded-xl border border-red-500/20 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                                                {adminAnalytics ? (
                                                    <>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-xs font-bold uppercase opacity-70">Global Total (Today)</span>
                                                            <span className="text-xl font-black font-mono text-red-400">{adminAnalytics.total_calls || 0}</span>
                                                        </div>

                                                        <div className="space-y-2 pt-2 border-t border-gray-500/10">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-bold opacity-80 flex items-center gap-1">🏢 System Pool</span>
                                                                <span className="font-mono font-bold text-indigo-400">{adminAnalytics.type_system || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-bold opacity-80 flex items-center gap-1">👤 User Custom (BYOK)</span>
                                                                <span className="font-mono font-bold text-emerald-400">{adminAnalytics.type_custom || 0}</span>
                                                            </div>
                                                        </div>

                                                        {/* V1.2.4: Lowered threshold + Quota exhaustion warning */}
                                                        {(adminAnalytics.type_system > 100 || aiUsage.remaining <= 0) && (
                                                            <div className="mt-3 p-2 rounded bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                                                                <Server className="w-3 h-3 text-red-500 animate-bounce" />
                                                                <span className="text-[10px] font-bold text-red-400">
                                                                    {aiUsage.remaining <= 0 ? '⚠️ API 限額已用盡！請增加 Keys 或等待重置。' : '系統負載警告：全局用量即將爆滿，請立即增加 Keys！'}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <p className="text-[10px] opacity-40 mt-3 text-right">Last Updated: {adminAnalytics.lastUpdated ? new Date(adminAnalytics.lastUpdated.seconds * 1000).toLocaleTimeString('zh-HK') : 'N/A'}</p>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-xs opacity-50">📊 載入中... 或暫無數據</div>
                                                        <p className="text-[10px] opacity-30 mt-2">如持續無數據，請檢查 Firestore system/ai_analytics document</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. API Keys Tab (Beta) */}
                            {intelTab === 'api' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                        <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 text-lg">
                                            <Lock className="w-5 h-5" /> 自訂 Jarvis Keys (BYOK)
                                        </h4>
                                        <p className="text-sm opacity-70 leading-relaxed">您的 API Key 只會儲存在本地瀏覽器 (localStorage)，不會上傳至我們的伺服器，安全無虞。</p>
                                    </div>

                                    {/* Development Notice */}
                                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                                        <span>🚧 多供應商功能 (OpenAI, Claude) 開發中 - Coming V1.2.5</span>
                                    </div>

                                    {/* Custom Key Stats Panel (V1.2.4) */}
                                    {globalSettings.userGeminiKey && (
                                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                        <Sparkles className="w-5 h-5" /> Unlimited Access Active
                                                    </h4>
                                                    <p className="text-xs opacity-60 mt-1">您正在使用自訂 API Key，享受無限制 Jarvis 服務。</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                    Pro Mode
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/20">
                                                <div>
                                                    <div className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Your Usage (Today)</div>
                                                    <div className="text-2xl font-black font-mono text-emerald-500 mt-1">
                                                        {aiUsage.customUsed || 0} <span className="text-sm opacity-50 font-normal text-gray-500">calls</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Est. Cost</div>
                                                    <div className="text-sm font-bold opacity-80 mt-2">
                                                        ~${((aiUsage.customUsed || 0) * 0.0001).toFixed(4)} USD
                                                    </div>
                                                    <p className="text-[9px] opacity-40">Based on Gemini Flash pricing</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">Jarvis API Key (Gemini)</label>
                                            <input
                                                type="password"
                                                placeholder="AIzA..."
                                                value={globalSettings.userGeminiKey || ''}
                                                onChange={e => {
                                                    setGlobalSettings({ ...globalSettings, userGeminiKey: e.target.value });
                                                    const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                                    localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, userGeminiKey: e.target.value }));
                                                }}
                                                className={inputClasses(isDarkMode)}
                                            />
                                            <div className="mt-2 text-xs opacity-60 leading-relaxed flex justify-between items-center">
                                                <span>輸入外部 Provider 的 API Key 以啟用 Jarvis 進階功能。</span>
                                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1">
                                                    👉 免費獲取 Key
                                                </a>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">自訂 Model ID (選填)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. gemini-2.0-flash-exp"
                                                    value={globalSettings.userGeminiModel || ''}
                                                    onChange={e => {
                                                        setGlobalSettings({ ...globalSettings, userGeminiModel: e.target.value });
                                                        const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                                        localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, userGeminiModel: e.target.value }));
                                                    }}
                                                    className={inputClasses(isDarkMode)}
                                                />
                                                <div className="mt-2 text-[10px] opacity-60">
                                                    預設使用 <code className="bg-gray-500/20 px-1 rounded">gemini-2.0-flash-exp</code>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">自訂每日限額 (選填)</label>
                                                <input
                                                    type="number"
                                                    placeholder="Default: 20"
                                                    value={globalSettings.userGeminiLimit || ''}
                                                    onChange={e => {
                                                        setGlobalSettings({ ...globalSettings, userGeminiLimit: e.target.value });
                                                        const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                                        localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, userGeminiLimit: e.target.value }));
                                                    }}
                                                    className={inputClasses(isDarkMode)}
                                                />
                                                <div className="mt-2 text-[10px] opacity-60">
                                                    建議設為 100+ 以獲得最佳體驗
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">Google Maps API Key</label>
                                            <input
                                                type="password"
                                                placeholder="AIzA..."
                                                value={globalSettings.userMapsKey || ''}
                                                onChange={e => {
                                                    setGlobalSettings({ ...globalSettings, userMapsKey: e.target.value });
                                                    const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                                    localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, userMapsKey: e.target.value }));
                                                }}
                                                className={inputClasses(isDarkMode)}
                                            />
                                            <div className="mt-2 text-xs opacity-60 leading-relaxed flex justify-between items-center">
                                                <span>用於地圖顯示及地點搜尋。</span>
                                                <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1">
                                                    👉 Google Cloud Console
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Preferences Tab */}
                            {intelTab === 'prefs' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-2xl border border-indigo-500/20">
                                        <h4 className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 text-lg"><Sparkles className="w-5 h-5" /> Jarvis 偏好</h4>
                                        <p className="text-sm opacity-70">勾選您的興趣，讓 Jarvis 建議更懂你。</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {AI_INTERESTS.map(item => (
                                            <label key={item.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all ${globalSettings.preferences?.includes(item.id) ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-gray-500/20 hover:bg-gray-500/5'}`}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${globalSettings.preferences?.includes(item.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-400'}`}>
                                                    {globalSettings.preferences?.includes(item.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                    <input type="checkbox" className="hidden" checked={globalSettings.preferences?.includes(item.id)} onChange={() => toggleInterest(item.id)} />
                                                </div>
                                                <span className="text-sm font-bold">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* V1.2.3: Global Auto-AI Toggle */}
                                    <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                <BrainCircuit className={`w-4 h-4 ${globalSettings.autoJarvis !== false ? 'text-indigo-500' : 'text-gray-400'}`} />
                                                自動啟用 Jarvis 功能
                                            </div>
                                            <div className="text-xs opacity-60 mt-1 max-w-sm">
                                                {globalSettings.autoJarvis !== false ? '已啟用：Jarvis 將自動為您提供行程建議、命名及分析。' : '已停用：需手動啟用個別功能，節省用量。 (部分核心功能仍可使用)'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newVal = globalSettings.autoJarvis === false ? true : false;
                                                setGlobalSettings({ ...globalSettings, autoJarvis: newVal });
                                                const current = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
                                                localStorage.setItem('travelTogether_settings', JSON.stringify({ ...current, autoJarvis: newVal }));
                                            }}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${globalSettings.autoJarvis !== false ? 'bg-indigo-600' : 'bg-gray-400'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${globalSettings.autoJarvis !== false ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 4. Help & QA Tab */}
                            {intelTab === 'help' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-5 rounded-2xl border border-blue-500/20">
                                        <h4 className="font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 text-lg">💡 Jarvis Q&A 指南</h4>
                                        <p className="text-sm opacity-70">這裡收集了關於 Jarvis 的常見問題與使用技巧。</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <h5 className="font-bold text-sm mb-2 text-indigo-500">Q: Jarvis 是什麼？</h5>
                                            <p className="text-sm opacity-80 leading-relaxed">
                                                Jarvis 是您的智能旅遊私人助理，背後由 Google Gemini 強力驅動。他可以幫您生成行程、建議交通、整理行李清單，甚至分析預算。
                                            </p>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <h5 className="font-bold text-sm mb-2 text-indigo-500">Q: 為什麼會有使用額度 (Quota)？</h5>
                                            <p className="text-sm opacity-80 leading-relaxed">
                                                為了讓服務能免費提供給所有人，我們對每日的 Jarvis 呼叫次數設有上限。如果您是高用量用戶，建議在 API Keys 頁面輸入自己的 Key，即可解除限制。
                                            </p>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <h5 className="font-bold text-sm mb-2 text-indigo-500">Q: 如何獲得無限次使用權？</h5>
                                            <p className="text-sm opacity-80 leading-relaxed">
                                                前往 <strong>API Keys</strong> 分頁，輸入您的 Google Gemini API Key。您的 Key 只會儲存在您的瀏覽器中，不會上傳伺服器，安全且免費。
                                            </p>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <h5 className="font-bold text-sm mb-2 text-indigo-500">Q: 智能匯入 (Smart Import) 支援什麼檔案？</h5>
                                            <p className="text-sm opacity-80 leading-relaxed">
                                                目前支援圖片 (JPG, PNG) 與 PDF。您可以直接上傳機票截圖、酒店 Voucher 或行程表，Jarvis 會自動解析時間與地點並填入行程。
                                            </p>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <h5 className="font-bold text-sm mb-2 text-indigo-500">Q: 重播新手教學？</h5>
                                            <p className="text-sm opacity-80 leading-relaxed mb-3">
                                                如果您想再次回顧 App 的使用方法，可以點擊下方按鈕重啟教學。
                                            </p>
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('travelTogether_onboardingComplete');
                                                    // localStorage.removeItem('hasSeenOnboarding'); // Keep Intro status
                                                    // window.location.reload(); // Don't reload
                                                    onBack();
                                                    setTimeout(() => {
                                                        window.dispatchEvent(new CustomEvent('START_ONBOARDING_TOUR'));
                                                    }, 500);
                                                }}
                                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                                            >
                                                🔄 重啟新手教學
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 text-lg">🎛️ 資訊中心自訂</h4>
                                <p className="text-sm opacity-70">拖曳以重新排序。眼睛圖示控制顯示/隱藏。設定會自動儲存。</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => {
                                        const newWidgets = widgetConfig.map(w => ({ ...w, visible: true }));
                                        setWidgetConfig(newWidgets);
                                        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
                                    }}
                                    className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <Eye className="w-3 h-3" /> 全部顯示
                                </button>
                                <button
                                    onClick={() => {
                                        const newWidgets = widgetConfig.map(w => ({ ...w, visible: false }));
                                        setWidgetConfig(newWidgets);
                                        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
                                    }}
                                    className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <EyeOff className="w-3 h-3" /> 全部隱藏
                                </button>
                                <button
                                    onClick={() => {
                                        setWidgetConfig(DEFAULT_WIDGETS);
                                        localStorage.removeItem('dashboardWidgets');
                                    }}
                                    className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <RotateCcw className="w-3 h-3" /> 重設預設
                                </button>
                            </div>

                            {/* Widget List with Drag & Drop */}
                            <DragDropContext onDragEnd={handleWidgetDragEnd}>
                                <Droppable droppableId="widget-settings">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2"
                                        >
                                            {widgetConfig.map((widget, index) => (
                                                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${snapshot.isDragging ? 'ring-2 ring-indigo-500 shadow-lg' : ''} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-500/10">
                                                                    <GripVertical className="w-5 h-5 opacity-50" />
                                                                </div>
                                                                <span className={`font-bold ${!widget.visible ? 'opacity-40 line-through' : ''}`}>{widget.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const newWidgets = widgetConfig.map(w =>
                                                                        w.id === widget.id ? { ...w, visible: !w.visible } : w
                                                                    );
                                                                    setWidgetConfig(newWidgets);
                                                                    localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
                                                                }}
                                                                className={`p-2 rounded-full transition-all ${widget.visible ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}
                                                            >
                                                                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            <p className="text-xs opacity-50 text-center">設定會自動儲存到瀏覽器，下次開啟即生效。</p>
                        </div>
                    )}

                    {/* V1.2.5: Account Management Tab */}
                    {activeTab === 'account' && (
                        <AccountTab
                            user={user}
                            isDarkMode={isDarkMode}
                            globalSettings={globalSettings}
                            setGlobalSettings={setGlobalSettings}
                        />
                    )}

                    <div className="mt-8 pt-8 border-t border-gray-500/10 flex justify-end">
                        <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-sm font-bold text-gray-600 dark:text-gray-300 transition-all flex items-center gap-2">
                            <span className="text-xs">🔄</span> 儲存設定並重新載入 App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// V1.2.5: Account Management Tab Component
const AccountTab = ({ user, isDarkMode, globalSettings, setGlobalSettings }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [networkStatus, setNetworkStatus] = useState(isOnline());
    const [message, setMessage] = useState(null);

    // Listen to network status
    useEffect(() => {
        const cleanup = subscribeNetworkStatus(
            () => setNetworkStatus(true),
            () => setNetworkStatus(false)
        );
        return cleanup;
    }, []);

    const handleSaveProfile = async () => {
        if (!networkStatus) {
            setMessage({ type: 'error', text: '目前離線中，無法儲存個人資料。' });
            return;
        }

        setIsSaving(true);
        try {
            await updateUserProfile(user, { displayName, photoURL });
            setMessage({ type: 'success', text: '個人資料已更新！' });
        } catch (error) {
            setMessage({ type: 'error', text: '更新失敗：' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncSettings = async () => {
        if (!networkStatus) {
            setMessage({ type: 'error', text: '目前離線中，無法同步設定。' });
            return;
        }

        setIsSyncing(true);
        try {
            await saveUserSettings(user.uid, globalSettings);
            setMessage({ type: 'success', text: '設定已同步至雲端！' });
        } catch (error) {
            setMessage({ type: 'error', text: '同步失敗：' + error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLoadSettings = async () => {
        if (!networkStatus) {
            setMessage({ type: 'error', text: '目前離線中，無法載入設定。' });
            return;
        }

        setIsSyncing(true);
        try {
            const cloudSettings = await loadUserSettings(user.uid);
            if (cloudSettings) {
                setGlobalSettings(prev => ({ ...prev, ...cloudSettings }));
                localStorage.setItem('travelTogether_settings', JSON.stringify({ ...globalSettings, ...cloudSettings }));
                setMessage({ type: 'success', text: '已從雲端載入設定！' });
            } else {
                setMessage({ type: 'info', text: '雲端尚無已儲存的設定。' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '載入失敗：' + error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!networkStatus) {
            setMessage({ type: 'error', text: '目前離線中，無法刪除帳戶。' });
            return;
        }

        if (!deletePassword) {
            setMessage({ type: 'error', text: '請輸入密碼以確認刪除。' });
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUserAccount(user, deletePassword);
            window.location.href = '/';
        } catch (error) {
            setMessage({ type: 'error', text: '刪除失敗：' + error.message });
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Offline Banner */}
            {!networkStatus && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
                    <WifiOff className="w-5 h-5 text-amber-500" />
                    <div>
                        <h5 className="font-bold text-amber-500">離線模式</h5>
                        <p className="text-xs opacity-70">目前無網絡連接，部分功能暫時無法使用。</p>
                    </div>
                </div>
            )}

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {message.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-500" /> 個人資料
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2">顯示名稱</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className={inputClasses(isDarkMode)}
                            placeholder="您的名稱"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2">頭像 URL</label>
                        <input
                            type="text"
                            value={photoURL}
                            onChange={e => setPhotoURL(e.target.value)}
                            className={inputClasses(isDarkMode)}
                            placeholder="https://..."
                        />
                        {photoURL && (
                            <img src={photoURL} alt="Preview" className="w-16 h-16 rounded-full mt-2 border-2 border-indigo-500" />
                        )}
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || !networkStatus}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${networkStatus ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? '儲存中...' : '儲存個人資料'}
                    </button>
                </div>
            </div>

            {/* Settings Sync Section */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" /> 設定同步 (跨裝置)
                </h4>
                <p className="text-sm opacity-70 mb-4">將您的偏好設定同步到雲端，在其他裝置登入時自動載入。</p>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleSyncSettings}
                        disabled={isSyncing || !networkStatus}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${networkStatus ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        {isSyncing ? '同步中...' : '⬆️ 上傳設定到雲端'}
                    </button>
                    <button
                        onClick={handleLoadSettings}
                        disabled={isSyncing || !networkStatus}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${networkStatus ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                        {isSyncing ? '載入中...' : '⬇️ 從雲端載入設定'}
                    </button>
                </div>
            </div>

            {/* Delete Account Section */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
                    <Trash2 className="w-5 h-5" /> 刪除帳戶
                </h4>
                <p className="text-sm opacity-70 mb-4">
                    此操作將永久刪除您的帳戶及所有相關數據。<strong>此操作無法復原！</strong>
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={!networkStatus}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all"
                    >
                        刪除我的帳戶
                    </button>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold">
                            ⚠️ 最後確認：請輸入密碼以永久刪除帳戶
                        </div>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            className={inputClasses(isDarkMode)}
                            placeholder="輸入您的密碼"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                                className="px-4 py-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 font-bold text-sm transition-all"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? '刪除中...' : '確認永久刪除'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsView;
