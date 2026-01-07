import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Send, ImageIcon, Smile, Hash, MessageCircle, Loader2, Bot, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { JARVIS_VERSION, APP_VERSION } from '../../constants/appData';
import { askTravelAI } from '../../services/ai-parsing';
import { checkUserQuota, incrementUserQuota, getUserQuotaStatus } from '../../services/ai-quota';
import { checkInstantAnswer } from '../../services/jarvis-instant'; // V1.2.5 Instant Answers
import ImageWithFallback from './ImageWithFallback';

const UniversalChat = ({ isOpen, onClose, trip, user, isDarkMode, initialTab = 'trip' }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // 'trip' or 'jarvis'
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    // Jarvis AI specific state
    const [jarvisMessages, setJarvisMessages] = useState([]);
    const [jarvisInput, setJarvisInput] = useState('');
    const [isJarvisThinking, setIsJarvisThinking] = useState(false);
    const [jarvisProgress, setJarvisProgress] = useState({ message: '', percent: 0 }); // V1.2.6 Progress
    const jarvisScrollRef = useRef(null);
    const jarvisAbortRef = useRef(null); // V1.2.6 Abort Controller

    // Responsive Detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync activeTab and reset minimize when opened
    useEffect(() => {
        if (isOpen) {
            setActiveTab(trip ? initialTab : 'jarvis');
            setIsMinimized(false);
        }
    }, [isOpen, initialTab, trip]);

    // V1.2.2: Real-time Message Listener for Trip Chat
    useEffect(() => {
        if (!isOpen || activeTab !== 'trip' || !trip?.id) {
            setMessages([]);
            return;
        }

        setIsLoading(true);
        const messagesRef = collection(db, "trips", trip.id, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setIsLoading(false);

            // Scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, (error) => {
            console.error("Chat listener error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen, activeTab, trip?.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isSending || !user || activeTab !== 'trip') return;

        setIsSending(true);
        const text = inputText.trim();
        setInputText('');

        try {
            const messagesRef = collection(db, "trips", trip.id, "messages");
            await addDoc(messagesRef, {
                text: text,
                senderId: user.uid,
                senderName: user.displayName || 'Anonymous',
                senderPhoto: user.photoURL || '',
                timestamp: serverTimestamp(),
                type: 'text'
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // V1.2.3: Jarvis AI Message Handler with Per-User Quota
    const handleJarvisSend = async (presetQuestion = null) => {
        const question = presetQuestion || jarvisInput.trim();
        if (!question || isJarvisThinking) return;

        // Add user message immediately
        const userMsg = { id: Date.now(), role: 'user', text: question, time: new Date().toISOString() };
        setJarvisMessages(prev => [...prev, userMsg]);
        setJarvisInput('');
        setIsJarvisThinking(true);

        // Scroll to bottom
        setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        // V1.2.6: AbortController for Cancellation
        const abortController = new AbortController();
        const signal = abortController.signal;

        // Store controller in ref to access it for cancellation
        jarvisAbortRef.current = abortController;

        try {
            // --- V1.2.5: Jarvis Instant Answers (Client-side) ---
            const instantAnswer = checkInstantAnswer(question, {
                city: trip?.city || trip?.cities?.[0]
            });

            if (instantAnswer) {
                // Simulate "thinking" for natural feel (0.6s)
                await new Promise(resolve => setTimeout(resolve, 600));

                const aiMsg = { id: Date.now() + 1, role: 'jarvis', text: instantAnswer, time: new Date().toISOString() };
                setJarvisMessages(prev => [...prev, aiMsg]);
                setIsJarvisThinking(false);
                setJarvisProgress({ message: '', percent: 0 }); // Reset
                setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                return; // SKIP API CALL
            }
            // ----------------------------------------------------

            // Define progress callback
            const onProgress = (msg, percent) => {
                setJarvisProgress({ message: msg, percent });
            };

            // Make the AI call with Signal & Progress
            const response = await askTravelAI(question, {
                city: trip?.city || trip?.cities?.[0] || 'Unknown',
                startDate: trip?.startDate,
                endDate: trip?.endDate,
                budget: 'Mid-range'
            }, user?.uid, signal, onProgress); // Pass userId, signal, onProgress

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

            // Parse error for user-friendly message
            let errorText = '抱歉，我暫時無法回應。請稍後再試，或聯繫客服支援。';
            let isQuotaError = false;

            const errorMsg = error.message || '';

            if (errorMsg.includes('QUOTA_EXCEEDED') || errorMsg.includes('quota')) {
                // Daily quota exceeded (API-level)
                errorText = '⚠️ 今日 Jarvis 服務限額已用完。\n\n請等待明天重置，或聯繫真人客服處理緊急問題。';
                isQuotaError = true;
            } else if (errorMsg.includes('429') || errorMsg.includes('API_BUSY')) {
                errorText = `⏳ Jarvis 服務繁忙中 (429)。\n\nGoogle AI 暫時無法回應，請一分鐘後再試，或點擊「聯繫真人客服」。`;
            } else if (errorMsg.includes('All API attempts failed')) {
                errorText = `❌ 所有線路嘗試失敗 (404/429)。\n\n請檢查網絡設定或稍後再試。`;
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
            setJarvisProgress({ message: '', percent: 0 }); // Reset
            jarvisAbortRef.current = null;
            setTimeout(() => jarvisScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    // V1.2.9: Rotating Loading Messages
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
    const LOADING_MESSAGES = [
        "Jarvis 正在思考...",
        "正在分析您的行程...",
        "正在搜尋最佳建議...",
        "正在整理旅遊資訊...",
        "正在計算預算...",
        "Jarvis 正在運用 Google Gemini 2.0..."
    ];

    useEffect(() => {
        let interval;
        if (isJarvisThinking) {
            setLoadingMsgIndex(0);
            interval = setInterval(() => {
                setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 3000); // Change every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isJarvisThinking]);

    if (!isOpen) return null;

    const textMain = isDarkMode ? 'text-slate-200' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-white/5' : 'bg-gray-50';

    // Layout Classes
    const containerClasses = isMobile
        ? `fixed inset-y-0 right-0 w-full z-[300] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        : `fixed bottom-0 right-8 w-[380px] z-[300] transition-all duration-500 ease-in-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${isMinimized ? 'h-[60px]' : 'h-[550px]'} rounded-t-2xl shadow-[-10px_-10px_50px_rgba(0,0,0,0.3)]`;

    return (
        <div className={`${containerClasses} flex flex-col overflow-hidden`}>
            {/* Backdrop Layer */}
            <div className={`absolute inset-0 backdrop-blur-3xl transition-opacity duration-500 ${isDarkMode ? 'bg-slate-950/90' : 'bg-white/95'} ${isMinimized ? 'opacity-0' : 'opacity-100'}`} />

            {/* Main Content Area */}
            <div className={`relative flex flex-col h-full ${!isMobile && 'border border-white/10 rounded-t-2xl'}`}>
                {/* Unified Header with Tabs */}
                <div
                    className={`flex flex-col px-5 pt-5 pb-2 border-b border-white/5 gap-3 cursor-pointer ${!isMobile && 'hover:bg-white/5 transition-colors'}`}
                    onClick={() => !isMobile && setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'jarvis' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    {activeTab === 'jarvis' ? <Bot className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                </div>
                                {!isMinimized && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-xs tracking-widest uppercase leading-none">{activeTab === 'jarvis' ? 'Jarvis AI' : '群聊客棧'}</h3>
                                <p className={`text-[9px] font-bold tracking-tight mt-1 ${activeTab === 'jarvis' ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400' : 'opacity-40'}`}>
                                    {activeTab === 'jarvis' ? `VER ${JARVIS_VERSION}` : trip?.name || 'UNIVERSAL HUB'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            {!isMobile && (
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                                    {isMinimized ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                                </button>
                            )}
                            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                                <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Switcher - Only visible when not minimized */}
                    {!isMinimized && (
                        <div className="flex bg-black/20 p-1 rounded-xl mb-1">
                            {trip && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('trip'); }}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'trip' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    <MessageCircle className="w-3 h-3" /> 行程群聊
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveTab('jarvis'); }}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'jarvis' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/60'}`}
                            >
                                <Bot className="w-3 h-3" /> JARVIS AI
                            </button>
                        </div>
                    )}
                </div>

                {/* Body Content - Hidden when minimized */}
                {!isMinimized && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === 'trip' ? (
                            /* TRIP CHAT VIEW */
                            <div className="h-full flex flex-col">
                                <div className="flex-1 p-5 space-y-4">
                                    {isLoading ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mb-3" />
                                            <p className="text-[10px] font-bold tracking-widest">正在連線到加密通道...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center px-8">
                                            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-3 text-indigo-400/50">
                                                <MessageCircle className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-bold opacity-40">這裡是空的，不如打個招呼？</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = msg.senderId === user?.uid;
                                            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-1 animate-fade-in`}>
                                                    {!isMe && showAvatar && (
                                                        <div className="w-6 h-6 rounded-full border border-white/10 overflow-hidden bg-gray-800 flex-shrink-0 mb-0.5">
                                                            <ImageWithFallback src={msg.senderPhoto} alt={msg.senderName} type="avatar" />
                                                        </div>
                                                    )}
                                                    {!isMe && !showAvatar && <div className="w-6" />}
                                                    <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        {!isMe && showAvatar && <span className="text-[8px] font-black opacity-30 ml-1 mb-0.5 uppercase tracking-widest">{msg.senderName}</span>}
                                                        <div className={`px-3 py-2 rounded-xl text-xs ${isMe ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/10' : 'bg-white/5 border border-white/10 text-white rounded-bl-none'}`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Trip Input Area */}
                                <div className="p-4 bg-black/20 border-t border-white/5 mt-auto">
                                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="輸入訊息..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:opacity-30"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim() || isSending}
                                            className={`p-2.5 rounded-xl transition-all ${inputText.trim() && !isSending ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            /* JARVIS AI VIEW - Full Chat Interface */
                            <div className="h-full flex flex-col animate-fade-in">
                                {/* Messages Area */}
                                <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                                    {jarvisMessages.length === 0 ? (
                                        /* Welcome Screen when no messages */
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="relative mb-4 group scale-75">
                                                <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full scale-125 animate-pulse-slow -z-10" />
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative z-10 overflow-hidden border-2 border-white/30">
                                                    <Bot className="w-8 h-8 text-white relative z-20" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 px-1 py-0.5 rounded-full text-[6px] font-black text-white border-2 border-[#020617] uppercase tracking-widest z-30">Online</div>
                                            </div>
                                            <h3 className={`text-sm font-black italic tracking-tighter mb-1 ${textMain}`}>HELLO, I'M JARVIS</h3>
                                            <p className="text-[10px] opacity-50 leading-relaxed mb-4 max-w-xs">
                                                我是您的行程管家 Jarvis。問我任何關於旅遊或 App 操作的問題！
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 w-full px-2">
                                                {['如何優化行程？', 'PWA 安裝教學', '匯出 PDF 方法', '行程建議'].map(hint => (
                                                    <button
                                                        key={hint}
                                                        onClick={() => handleJarvisSend(hint)}
                                                        className={`p-2.5 rounded-xl border text-[9px] font-bold text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group ${cardBg} border-white/5`}
                                                    >
                                                        <Sparkles className="w-3 h-3 text-indigo-400 opacity-40 group-hover:opacity-100" />
                                                        {hint}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Chat Messages */
                                        jarvisMessages.map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 animate-fade-in`}>
                                                {msg.role === 'jarvis' && (
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-0.5">
                                                        <Bot className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-3 py-2 rounded-xl text-xs whitespace-pre-wrap ${msg.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/10'
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
                                    {/* Thinking Indicator v2 with Progress & Cancel */}
                                    {isJarvisThinking && (
                                        <div className="flex justify-start items-end gap-2 animate-fade-in w-full pr-10">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 mb-0.5">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl rounded-bl-none p-3 space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                                        <span className="text-[10px] opacity-70 font-bold">
                                                            {jarvisProgress.message || LOADING_MESSAGES[loadingMsgIndex]}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] opacity-40 font-mono">{jarvisProgress.percent}%</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                                    style={{ width: `${Math.max(5, jarvisProgress.percent)}%` }}
                                                />
                                            </div>

                                            {/* Cancel Button */}
                                            <button
                                                onClick={() => jarvisAbortRef.current?.abort()}
                                                className="w-full py-1.5 mt-1 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[9px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                            >
                                                <X className="w-3 h-3" /> 取消生成
                                            </button>
                                        </div>
                                    )}
                                    <div ref={jarvisScrollRef} />
                                </div>

                                {/* Jarvis Input Area */}
                                <div className="p-4 bg-black/20 border-t border-white/5 mt-auto">
                                    <form onSubmit={(e) => { e.preventDefault(); handleJarvisSend(); }} className="relative flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={jarvisInput}
                                            onChange={(e) => setJarvisInput(e.target.value)}
                                            placeholder="向 Jarvis 發問..."
                                            disabled={isJarvisThinking}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:opacity-30 disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!jarvisInput.trim() || isJarvisThinking}
                                            className={`p-2.5 rounded-xl transition-all ${jarvisInput.trim() && !isJarvisThinking ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Global Bottom Banner - Only visible when not minimized */}
                {!isMinimized && (
                    <div className="px-5 py-3 bg-black/40 backdrop-blur-md flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-1.5 opacity-30">
                            <Hash className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest italic">SafeChat™ Encrypted</span>
                        </div>
                        <p className="text-[8px] font-black opacity-20 uppercase tracking-widest">
                            {activeTab === 'jarvis' ? `Jarvis ${JARVIS_VERSION}` : `TravelTogether ${APP_VERSION}`}
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default UniversalChat;
