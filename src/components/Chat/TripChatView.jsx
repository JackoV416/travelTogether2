import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MessageCircle, Send, Loader2, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../Shared/ImageWithFallback';

const TripChatView = ({ trip, user, isDarkMode }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
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
        <div className="h-full flex flex-col animate-fade-in bg-slate-900/10">
            {/* Header */}
            <div className={`p-5 pr-14 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-slate-950/40' : 'border-gray-100 bg-white/50'} backdrop-blur-md`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm tracking-tight line-clamp-1">{trip?.name?.toUpperCase() || t('chat.trip.default_name', 'GROUP CHAT')}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] opacity-60 uppercase tracking-widest font-black italic">
                                {trip?.members ? t('chat.trip.members_count', { count: trip.members.length, defaultValue: `${trip.members.length} MEMBERS` }) : t('chat.trip.loading', 'CONNECTING...')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        aria-expanded={showSidebar}
                        aria-label={showSidebar ? t('chat.trip.hide_members', 'Hide members list') : t('chat.trip.show_members', 'Show members list')}
                        className={`p-2.5 rounded-xl transition-all border flex items-center gap-2 group ${showSidebar
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        title={t('chat.trip.view_members', 'View Members')}
                    >
                        <Users className={`w-5 h-5 transition-transform duration-500 ${showSidebar ? 'scale-110' : 'group-hover:rotate-12'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                            {showSidebar ? t('chat.trip.hide_members', 'Hide') : t('chat.trip.show_members', 'Members')}
                        </span>
                    </button>
                    <div className="hidden md:block w-px h-8 bg-white/5 mx-2" role="separator"></div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Messages Area */}
                <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${showSidebar ? 'mr-0' : 'mr-0'}`}>
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center select-none p-12">
                            <Loader2 className="w-12 h-12 animate-spin mb-6 text-indigo-500" />
                            <h4 className="text-xl font-black italic tracking-tighter uppercase">ESTABLISHING ENCRYPTED LINK</h4>
                            <p className="text-xs font-bold tracking-[0.2em] mt-2 uppercase opacity-60">{t('chat.trip.connecting', 'Connecting to secure group network...')}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-30">
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 text-indigo-400/50 border border-indigo-500/10 shadow-2xl shadow-indigo-500/5">
                                <MessageCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2">{t('chat.trip.empty_title', 'SILENCE IN THE GROUP')}</h3>
                            <p className="text-xs font-bold tracking-widest uppercase opacity-60">{t('chat.trip.empty_desc', 'THE FIRST MOVE IS YOURS. START THE JOURNEY.')}</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.uid;
                            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3 animate-fade-in group`}>
                                    {!isMe && (
                                        <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 mb-1 border border-white/10 shadow-lg opacity-100`}>
                                            <ImageWithFallback src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`max-w-[92%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && <span className="text-[10px] font-bold opacity-40 ml-1 mb-1 uppercase tracking-widest">{msg.senderName || 'Traveler'}</span>}
                                        <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm relative ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/30' : 'bg-white/5 border border-white/10 text-white rounded-bl-none backdrop-blur-xl'}`}>
                                            {msg.text}
                                        </div>
                                        {showAvatar && (
                                            <span className="text-[10px] opacity-30 mt-1 font-mono uppercase tracking-tighter">
                                                {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Member Sidebar */}
                <div className={`absolute top-0 right-0 bottom-0 z-40 transition-all duration-500 ease-in-out overflow-hidden border-l border-white/5 backdrop-blur-3xl bg-slate-950/60 shadow-2xl
                ${showSidebar ? 'w-full md:w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-12'}`}
                >
                    <div className="w-full md:w-80 h-full flex flex-col p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black italic tracking-tighter uppercase text-white">{t('chat.trip.members', 'JOURNEY MEMBERS')}</h4>
                            <button onClick={() => setShowSidebar(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            {trip?.members?.map((member) => (
                                <div key={member.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                            <ImageWithFallback src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-md ${member.id === user?.uid ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{member.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">
                                            {member.id === user?.uid ? t('chat.trip.role_you', 'CHIEF NAVIGATOR') : t('chat.trip.role_member', 'EXPLORER')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/5 bg-slate-950/60' : 'border-gray-100 bg-white/50'} backdrop-blur-xl`}>
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={t('chat.trip.input_placeholder', "Command Group...")}
                            className={`w-full rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:opacity-40 border shadow-inner ${isDarkMode ? 'bg-slate-900/50 border-white/5 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                        />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none group-focus-within:ring-indigo-500/50 transition-all"></div>
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className={`p-4 rounded-2xl transition-all duration-500 ${inputText.trim() && !isSending ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] scale-100 hover:scale-105 active:scale-95' : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'}`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TripChatView;
