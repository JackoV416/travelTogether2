import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MessageCircle, Send, Loader2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../Shared/ImageWithFallback';

const TripChatView = ({ trip, user, isDarkMode }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);

    // V1.2.24: Simulation Support serialization
    const chatMessagesStr = JSON.stringify(trip?.chatMessages || []);

    useEffect(() => {
        if (!trip?.id) {
            setMessages([]);
            return;
        }

        const isSimulation = trip.id?.startsWith('sim-');
        if (isSimulation && trip.chatMessages) {
            const simMessages = trip.chatMessages.map(msg => {
                const member = trip.members?.find(m => m.id === msg.senderId);
                return {
                    id: msg.id,
                    text: msg.text,
                    senderId: msg.senderId,
                    senderName: member?.name || 'Unknown',
                    senderPhoto: member?.avatar || '',
                    timestamp: new Date(msg.timestamp),
                    type: 'text'
                };
            });
            setMessages(simMessages);
            setIsLoading(false);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (error) => {
            console.error("Chat listener error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [trip?.id, chatMessagesStr]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isSending || !user) return;

        const isSimulation = trip?.id?.startsWith('sim-');
        if (isSimulation) {
            alert(t('chat.trip.simulation_alert', '📱 呢個係模擬模式！\n\n實際使用時，你可以喺呢度同團友傾計、分享相片、討論行程。'));
            setInputText('');
            return;
        }

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

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white/50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm line-clamp-1">{trip?.name || t('chat.trip.default_name', '行程群組')}</h3>
                        <p className="text-[10px] opacity-50">
                            {trip?.members ? t('chat.trip.members_count', { count: trip.members.length, defaultValue: `${trip.members.length} 位成員` }) : t('chat.trip.loading', '載入中...')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mb-3" />
                        <p className="text-[10px] font-bold tracking-widest">{t('chat.trip.connecting', '正在連線到群組...')}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-8">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400/50">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold opacity-70 mb-1">{t('chat.trip.empty_title', '群組對話')}</h3>
                        <p className="text-xs opacity-40">{t('chat.trip.empty_desc', '這裡是空的，不如打個招呼？')}</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.uid;
                        const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-1 animate-fade-in`}>
                                {!isMe && showAvatar && (
                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-gray-800 flex-shrink-0 mb-0.5 shadow-sm">
                                        <ImageWithFallback src={msg.senderPhoto} alt={msg.senderName} type="avatar" />
                                    </div>
                                )}
                                {!isMe && !showAvatar && <div className="w-8" />}
                                <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && showAvatar && <span className="text-[9px] font-bold opacity-40 ml-1 mb-0.5">{msg.senderName}</span>}
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10' : 'bg-white/5 border border-white/10 text-white rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white/50'}`}>
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('chat.trip.input_placeholder', "輸入訊息...")}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:opacity-30 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className={`p-3 rounded-xl transition-all ${inputText.trim() && !isSending ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TripChatView;
