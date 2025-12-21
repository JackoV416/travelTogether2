import React, { useState, useEffect } from 'react';
import { ArrowLeft, BrainCircuit, Lock, Sparkles, Eye, EyeOff, RotateCcw, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CURRENCIES, TIMEZONES, LANGUAGE_OPTIONS } from '../../constants/appData';
import { inputClasses } from '../../utils/tripUtils';
import { checkAIUsageLimit } from '../../services/ai-parsing';

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

const SettingsView = ({ globalSettings, setGlobalSettings, isDarkMode, onBack, initialTab = 'general' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

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

    const [aiUsage, setAiUsage] = useState({ used: 0, total: 20, remaining: 20 });

    useEffect(() => {
        if (activeTab === 'intelligence') {
            const usage = checkAIUsageLimit();
            setAiUsage({
                used: usage.used,
                total: usage.total,
                remaining: usage.remaining
            });
        }
    }, [activeTab]);

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
                        管理您的應用程式偏好、AI 設定與 API 金鑰。
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'general' ? (isDarkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow-lg') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        一般設定
                    </button>
                    <button
                        onClick={() => setActiveTab('intelligence')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'intelligence' ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        <BrainCircuit className="w-4 h-4" /> Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'info' ? (isDarkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow-lg') : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                    >
                        資訊中心設定
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
                        </div>
                    )}

                    {activeTab === 'intelligence' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* AI Usage */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-sm font-bold opacity-90 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-500" />今日 AI 使用量</label>
                                    <span className="text-xl font-mono font-black text-indigo-500">{aiUsage.used} <span className="text-sm opacity-50 font-normal text-gray-500">/ {aiUsage.total}</span></span>
                                </div>
                                <div className="h-3 w-full bg-gray-500/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${aiUsage.remaining < 5 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                        style={{ width: `${(aiUsage.used / aiUsage.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs opacity-50 mt-3 text-right">每個帳號每日免費限額 {aiUsage.total} 次</p>
                            </div>

                            {/* V1.0.3: AI Feature Usage Documentation */}
                            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50/50 border-gray-200'}`}>
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    AI 功能使用說明
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">🧠 AI 行程生成</span>
                                            <span className="text-purple-400 font-mono text-[10px]">~500 tokens/次</span>
                                        </div>
                                        <p className="opacity-60 mt-1">從文字描述生成結構化行程 (每次呼叫算 1 次)</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">✨ AI 靈感建議</span>
                                            <span className="text-blue-400 font-mono text-[10px]">~150 tokens/次</span>
                                        </div>
                                        <p className="opacity-60 mt-1">新增行程時的景點/餐廳推薦 (不扣次數)</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">🚆 交通路線建議</span>
                                            <span className="text-emerald-400 font-mono text-[10px]">~300 tokens/次</span>
                                        </div>
                                        <p className="opacity-60 mt-1">多城市行程自動計算交通方式 (每次呼叫算 1 次)</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">📝 智能摘要</span>
                                            <span className="text-amber-400 font-mono text-[10px]">~200 tokens/次</span>
                                        </div>
                                        <p className="opacity-60 mt-1">Dashboard 行程卡片的 AI 摘要生成 (每張算 1 次)</p>
                                    </div>
                                </div>
                                <p className="text-[10px] opacity-40 mt-3 text-center">💡 提示：使用自訂 API Key 可無視每日限額</p>
                            </div>

                            <hr className="border-gray-500/10" />

                            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 text-lg"><Lock className="w-5 h-5" /> 自訂 API Keys (BYOK)</h4>
                                <p className="text-sm opacity-70 leading-relaxed">您的 API Key 只會儲存在本地瀏覽器 (localStorage)，不會上傳至我們的伺服器，安全無虞。</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">Gemini AI API Key</label>
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
                                        <span>用於 AI 行程生成、翻譯及智能建議。</span>
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1">
                                            👉 免費獲取 Key
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">自訂 Model Name (選填)</label>
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

                            <hr className="border-gray-500/10" />

                            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-2xl border border-indigo-500/20">
                                <h4 className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 text-lg"><Sparkles className="w-5 h-5" /> 旅遊偏好</h4>
                                <p className="text-sm opacity-70">勾選您的興趣，讓 AI 建議更懂你。</p>
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

export default SettingsView;
