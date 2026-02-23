import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Loader2, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { askTravelAI } from '../../services/ai-parsing';
import { checkInstantAnswer } from '../../services/jarvis-instant';
import { LOCAL_FAQ, INITIAL_SUGGESTIONS } from '../../constants/cannedResponses';
import { JARVIS_VERSION } from '../../constants/appData';

const JarvisChatView = ({ user, trip, isDarkMode }) => {
    const { t } = useTranslation();
    const [jarvisMessages, setJarvisMessages] = useState([]);
    const [jarvisInput, setJarvisInput] = useState('');
    const [isJarvisThinking, setIsJarvisThinking] = useState(false);
    const [jarvisProgress, setJarvisProgress] = useState({ message: '', percent: 0 });
    const jarvisScrollRef = useRef(null);
    const jarvisAbortRef = useRef(null);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    const LOADING_MESSAGES = [
        t('chat.jarvis.loading', "Jarvis 正在思考..."),
        t('chat.jarvis.analyzing', "正在分析您的行程..."),
        t('chat.jarvis.searching', "正在搜尋最佳建議..."),
        t('chat.jarvis.organizing', "正在整理旅遊資訊..."),
        t('chat.jarvis.budgeting', "正在計算預算..."),
        t('chat.jarvis.gemini', "Jarvis 正在運用 Google Gemini 2.0...")
    ];

    useEffect(() => {
        let interval;
        if (isJarvisThinking) {
            setLoadingMsgIndex(0);
            interval = setInterval(() => {
                setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isJarvisThinking]);

    const handleJarvisSend = async (presetQuestion = null) => {
        const question = presetQuestion || jarvisInput.trim();
        if (!question || isJarvisThinking) return;

        const userMsg = { id: Date.now(), role: 'user', text: question, time: new Date().toISOString() };
        setJarvisMessages(prev => [...prev, userMsg]);
        setJarvisInput('');
        setIsJarvisThinking(true);

        setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        const abortController = new AbortController();
        const signal = abortController.signal;
        jarvisAbortRef.current = abortController;

        try {
            // Local Match
            const findLocalMatch = (text) => {
                const lower = text.toLowerCase();
                if (LOCAL_FAQ[lower]) return LOCAL_FAQ[lower];
                for (const key in LOCAL_FAQ) {
                    if (LOCAL_FAQ[key].keywords.some(k => lower.includes(k.toLowerCase()))) {
                        return LOCAL_FAQ[key];
                    }
                }
                return null;
            };

            const localMatch = findLocalMatch(question);
            if (localMatch) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'jarvis',
                    text: localMatch.answer,
                    time: new Date().toISOString(),
                    isLocal: true
                };
                setJarvisMessages(prev => [...prev, aiMsg]);
                setIsJarvisThinking(false);
                setJarvisProgress({ message: '', percent: 0 });
                setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                return;
            }

            // Instant Answers
            const instantAnswer = checkInstantAnswer(question, {
                city: trip?.city || trip?.cities?.[0]
            });

            if (instantAnswer) {
                await new Promise(resolve => setTimeout(resolve, 600));
                const aiMsg = { id: Date.now() + 1, role: 'jarvis', text: instantAnswer, time: new Date().toISOString() };
                setJarvisMessages(prev => [...prev, aiMsg]);
                setIsJarvisThinking(false);
                setJarvisProgress({ message: '', percent: 0 });
                setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                return;
            }

            // Real API Call
            const onProgress = (msg, percent) => {
                setJarvisProgress({ message: msg, percent });
            };

            const response = await askTravelAI(question, {
                city: trip?.city || trip?.cities?.[0] || 'Unknown',
                startDate: trip?.startDate,
                endDate: trip?.endDate,
                budget: 'Mid-range'
            }, user?.uid, signal, onProgress);

            const aiMsg = { id: Date.now() + 1, role: 'jarvis', text: response, time: new Date().toISOString() };
            setJarvisMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Jarvis AI error:", error);

            if (error.message === 'Operation aborted') {
                const abortedMsg = {
                    id: Date.now() + 1,
                    role: 'jarvis',
                    text: '已取消操作。',
                    isError: true,
                    time: new Date().toISOString()
                };
                setJarvisMessages(prev => [...prev, abortedMsg]);
                return;
            }

            let errorText = '抱歉，我暫時無法回應。請稍後再試，或聯繫客服支援。';
            let isQuotaError = false;
            const errorMsg = error.message || '';

            if (errorMsg.includes('QUOTA_EXCEEDED') || errorMsg.includes('quota')) {
                errorText = '⚠️ 今日 Jarvis 服務限額已用完。\n\n請等待明天重置，或聯繫真人客服處理緊急問題。';
                isQuotaError = true;
            } else if (errorMsg.includes('429') || errorMsg.includes('API_BUSY')) {
                errorText = `⏳ Jarvis 服務繁忙中 (429)。\n\nGoogle AI 暫時無法回應，請一分鐘後再試，或點擊「聯繫真人客服」。`;
            }

            const errMsg = {
                id: Date.now() + 1,
                role: 'jarvis',
                text: errorText,
                isError: true,
                isQuotaError,
                time: new Date().toISOString()
            };
            setJarvisMessages(prev => [...prev, errMsg]);
        } finally {
            setIsJarvisThinking(false);
            setJarvisProgress({ message: '', percent: 0 });
            jarvisAbortRef.current = null;
            setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    const textMain = isDarkMode ? 'text-slate-200' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-white/5' : 'bg-gray-50';

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white/50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{t('chat.jarvis.header_title', 'Jarvis AI 智能助手')}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] opacity-50 uppercase tracking-wider font-bold">{t('chat.jarvis.status_online', { version: JARVIS_VERSION })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                {jarvisMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="relative mb-4 group scale-90">
                            <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full scale-125 animate-pulse-slow -z-10" />
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative z-10 overflow-hidden border-2 border-white/30">
                                <Bot className="w-10 h-10 text-white relative z-20" />
                            </div>
                        </div>
                        <h3 className={`text-sm font-black italic tracking-tighter mb-1 ${textMain}`}>{t('chat.jarvis.welcome_title', "HELLO, I'M JARVIS")}</h3>
                        <p className="text-[10px] opacity-50 leading-relaxed mb-6 max-w-xs">
                            {t('chat.jarvis.welcome_desc', '我是您的行程管家 Jarvis。問我任何關於旅遊或 App 操作的問題！')}
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-sm px-2">
                            {INITIAL_SUGGESTIONS.map(suggestion => {
                                let label = suggestion.label;
                                if (suggestion.value === 'quota') label = `💰 ${t('auth.login_to_fork', '查詢配額')}`; // Fallback mapping key reuse or new one
                                else if (suggestion.value === 'food') label = `🍜 ${t('chat.jarvis.suggestions.food', '必吃美食')}`;
                                else if (suggestion.value === 'souvenir') label = `📸 ${t('chat.jarvis.suggestions.souvenirs', '手信推薦')}`;
                                else if (suggestion.value === 'safety') label = `🆘 ${t('trip.emergency', '緊急求助')}`;
                                else if (suggestion.value === 'budget') label = `📊 ${t('chat.jarvis.suggestions.attractions', '預算分析')}`; // Using close match or create new key
                                else if (suggestion.value === 'weather') label = `🌦️ ${t('weather.desc.comfortable', '點睇天氣？')}`; // Temp fallback, really should be t('chat.jarvis.suggestions.weather')

                                // Better approach: Map directly if keys exist, otherwise use fallback
                                // Since keys are limited, I'll use direct text fallback for now, but wrapped in t() for future
                                if (suggestion.value === 'quota') label = `💰 ${t('chat.jarvis.suggestions.quota', '查詢配額')}`;
                                if (suggestion.value === 'food') label = `🍜 ${t('chat.jarvis.suggestions.food', '附近好西')}`;
                                if (suggestion.value === 'souvenir') label = `📸 ${t('chat.jarvis.suggestions.souvenirs', '必買手信')}`;
                                if (suggestion.value === 'safety') label = `🆘 ${t('chat.jarvis.suggestions.safety', '緊急求助')}`;
                                if (suggestion.value === 'budget') label = `📊 ${t('chat.jarvis.suggestions.budget', '預算分析')}`;
                                if (suggestion.value === 'weather') label = `🌦️ ${t('chat.jarvis.suggestions.weather', '點睇天氣？')}`;

                                return (
                                    <button
                                        key={suggestion.value}
                                        onClick={() => handleJarvisSend(suggestion.value)}
                                        className={`p-3 rounded-xl border text-[10px] font-bold text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group ${cardBg} border-white/5`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-40 group-hover:opacity-100" />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    jarvisMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 animate-fade-in`}>
                            {msg.role === 'jarvis' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-lg shadow-indigo-500/20">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10'
                                    : msg.isError
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-none'
                                        : 'bg-white/5 border border-white/10 text-white rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isJarvisThinking && (
                    <div className="flex justify-start items-end gap-2 animate-fade-in w-full pr-10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-lg shadow-indigo-500/20">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-3 space-y-2 max-w-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                    <span className="text-xs opacity-70 font-bold">
                                        {jarvisProgress.message || LOADING_MESSAGES[loadingMsgIndex]}
                                    </span>
                                </div>
                                <span className="text-[10px] opacity-40 font-mono">{jarvisProgress.percent}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                    style={{ width: `${Math.max(5, jarvisProgress.percent)}%` }}
                                />
                            </div>
                            <button
                                onClick={() => jarvisAbortRef.current?.abort()}
                                className="w-full py-1.5 mt-1 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <X className="w-3 h-3" /> {t('chat.jarvis.cancel_generation', '取消生成')}
                            </button>
                        </div>
                    </div>
                )}
                <div ref={jarvisScrollRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white/50'}`}>
                <form onSubmit={(e) => { e.preventDefault(); handleJarvisSend(); }} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={jarvisInput}
                        onChange={(e) => setJarvisInput(e.target.value)}
                        placeholder={t('chat.jarvis.input_placeholder', "向 Jarvis 發問...")}
                        disabled={isJarvisThinking}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:opacity-30 disabled:opacity-50 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                    />
                    <button
                        type="submit"
                        disabled={!jarvisInput.trim() || isJarvisThinking}
                        className={`p-3 rounded-xl transition-all ${jarvisInput.trim() && !isJarvisThinking ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JarvisChatView;
