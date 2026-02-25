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
        t('chat.jarvis.loading', "Jarvis Thinking..."),
        t('chat.jarvis.analyzing', "Analyzing your journey..."),
        t('chat.jarvis.searching', "Finding hidden gems..."),
        t('chat.jarvis.organizing', "Organizing details..."),
        t('chat.jarvis.budgeting', "Calculating costs..."),
        t('chat.jarvis.gemini', "Jarvis × Gemini 2.0")
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
                const lower = text.trim().toLowerCase();
                // 1. Priority: Exact match
                if (LOCAL_FAQ[lower]) return LOCAL_FAQ[lower];

                // 2. Priority: Only match keyword if it's the WHOLE intent or paired with limited words
                // To prevent "Help me plan" matching "Help" (Emergency)
                for (const key in LOCAL_FAQ) {
                    const keywords = LOCAL_FAQ[key].keywords;
                    if (keywords.some(k => {
                        const kw = k.toLowerCase();
                        // Only match if the keyword is a dominant part of a short query
                        // or if it matches as a whole word in a short sentence
                        const regex = new RegExp(`\\b${kw}\\b`, 'i');
                        return lower.length < 20 && regex.test(lower);
                    })) {
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
        <div className="h-full flex flex-col animate-fade-in bg-slate-900/10">
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-slate-950/40' : 'border-gray-100 bg-white/50'} backdrop-blur-md`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(79,70,229,0.5)] relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Bot className="w-6 h-6 text-white relative z-10" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm tracking-tight">{t('chat.jarvis.header_title', 'JARVIS AI ASSISTANT')}</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] opacity-60 uppercase tracking-widest font-black italic">{t('chat.jarvis.status_online', { version: JARVIS_VERSION })}</span>
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
                        <h3 className={`text-5xl font-black italic tracking-tight mb-4 ${textMain} uppercase`}>{t('chat.jarvis.welcome_title', "GREETINGS, I'M JARVIS")}</h3>
                        <p className="text-xl opacity-60 leading-relaxed mb-12 max-w-full font-semibold px-12 text-center">
                            {t('chat.jarvis.welcome_desc', 'Your elite travels logistics partner. Ready to craft your perfect journey.')}
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6">
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
                                        className={`p-4 rounded-2xl border text-[11px] font-black tracking-tight text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 group ${cardBg} border-white/5 shadow-sm relative overflow-hidden`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <Sparkles className="w-4 h-4 text-indigo-400 opacity-40 group-hover:opacity-100 transition-all" />
                                        <span className="relative z-10">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    jarvisMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3 animate-fade-in`}>
                            {msg.role === 'jarvis' && (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-1 shadow-lg shadow-indigo-500/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[92%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/30'
                                    : msg.isError
                                        ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-bl-none backdrop-blur-sm'
                                        : 'bg-white/5 border border-white/10 text-white rounded-bl-none backdrop-blur-xl'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] opacity-30 mt-1 font-mono uppercase tracking-tighter">
                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {isJarvisThinking && (
                    <div className="flex justify-start items-end gap-3 animate-fade-in w-full pr-12">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-1 shadow-lg shadow-indigo-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl rounded-bl-none p-5 space-y-4 max-w-[92%] backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-50"></div>
                            <div className="flex items-center justify-between gap-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                        <div className="absolute inset-0 blur-sm bg-indigo-500/20 animate-pulse"></div>
                                    </div>
                                    <span className="text-xs text-white/80 font-black italic tracking-tight">
                                        {jarvisProgress.message || LOADING_MESSAGES[loadingMsgIndex]}
                                    </span>
                                </div>
                                <span className="text-[10px] opacity-40 font-mono tracking-tighter">{jarvisProgress.percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${Math.max(8, jarvisProgress.percent)}%` }}
                                />
                            </div>
                            <button
                                onClick={() => jarvisAbortRef.current?.abort()}
                                className="w-full py-2.5 mt-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn relative z-10"
                            >
                                <X className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" /> {t('chat.jarvis.cancel_generation', 'TERMINATE SEQUENCE')}
                            </button>
                        </div>
                    </div>
                )}
                <div ref={jarvisScrollRef} />
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/5 bg-slate-950/60' : 'border-gray-100 bg-white/50'} backdrop-blur-xl`}>
                <form onSubmit={(e) => { e.preventDefault(); handleJarvisSend(); }} className="relative flex items-center gap-3">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={jarvisInput}
                            onChange={(e) => setJarvisInput(e.target.value)}
                            placeholder={t('chat.jarvis.input_placeholder', "Command Jarvis...")}
                            disabled={isJarvisThinking}
                            className={`w-full rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:opacity-40 disabled:opacity-50 border shadow-inner ${isDarkMode ? 'bg-slate-900/50 border-white/5 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                        />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none group-focus-within:ring-indigo-500/50 transition-all"></div>
                    </div>
                    <button
                        type="submit"
                        disabled={!jarvisInput.trim() || isJarvisThinking}
                        className={`p-4 rounded-2xl transition-all duration-500 ${jarvisInput.trim() && !isJarvisThinking ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] scale-100 hover:scale-105 active:scale-95' : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'}`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JarvisChatView;
