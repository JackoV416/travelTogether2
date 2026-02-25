import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, ArrowLeft, MoreVertical, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listenToMessages, sendMessage, clearChatHistory, blockUser, unblockUser } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import OnlineStatusDot from './OnlineStatusDot';
import UserProfileModal from '../Modals/UserProfileModal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const DirectMessageView = ({ conversation, currentUser, isDarkMode, onBack }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);

    // Get Other User Details
    const otherUserId = conversation?.participants?.find(id => id !== currentUser?.uid);
    const otherUser = conversation?.participantDetails?.[otherUserId] || { displayName: 'User' };

    // Check if other user is blocked (from currentUser's profile)
    useEffect(() => {
        if (!currentUser || !otherUserId) return;
        const userRef = doc(db, 'users', currentUser.uid);
        const unsub = onSnapshot(userRef, (doc) => {
            const blockedUsers = doc.data()?.blockedUsers || [];
            setIsBlocked(blockedUsers.includes(otherUserId));
        });
        return () => unsub();
    }, [currentUser?.uid, otherUserId]);

    useEffect(() => {
        if (!conversation?.id) return;
        const unsubscribe = listenToMessages(conversation.id, (data) => {
            setMessages(data);
            scrollToBottom();
        });
        return () => unsubscribe();
    }, [conversation.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage(conversation.id, currentUser.uid, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error("Send failed", error);
        } finally {
            setSending(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm(t('chat.confirm_clear', 'Are you sure you want to clear chat history?'))) return;
        setIsClearing(true);
        try {
            await clearChatHistory(conversation.id, currentUser.uid);
            setShowMenu(false);
        } catch (error) {
            console.error("Clear failed", error);
        } finally {
            setIsClearing(false);
        }
    };

    const handleBlockUser = async () => {
        if (!window.confirm(t('chat.confirm_block', 'Are you sure you want to block this user?'))) return;
        setIsBlocking(true);
        try {
            await blockUser(currentUser.uid, otherUserId);
            setShowMenu(false);
        } catch (error) {
            console.error("Block failed", error);
        } finally {
            setIsBlocking(false);
        }
    };

    const handleUnblockUser = async () => {
        setIsBlocking(true);
        try {
            await unblockUser(currentUser.uid, otherUserId);
        } catch (error) {
            console.error("Unblock failed", error);
        } finally {
            setIsBlocking(false);
        }
    };

    if (!currentUser) return <div className="p-4 text-center opacity-50">Please login...</div>;
    if (!conversation?.participants) return <div className="p-4 text-center opacity-50">Loading chat...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-900/10">
            {/* Header */}
            <div className={`p-5 pr-14 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-slate-950/40' : 'border-gray-100 bg-white/50'} backdrop-blur-md`}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-xl border border-white/5 hover:bg-white/10 text-gray-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                        <img
                            src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}`}
                            className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300"
                            alt=""
                        />
                        <div className="absolute -bottom-1 -right-1">
                            <OnlineStatusDot isOnline={otherUser.isOnline || otherUser.status === 'online'} size="md" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm tracking-tight">{otherUser.displayName?.toUpperCase()}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black tracking-widest uppercase italic ${otherUser.isOnline || otherUser.status === 'online' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {otherUser.isOnline || otherUser.status === 'online' ? t('chat.status_online', 'ACTIVE NOW') : t('chat.status_offline', 'OFFLINE')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2.5 rounded-full transition-all duration-300 ${showMenu ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                        aria-label={t('chat.menu.open', 'Open menu')}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Menu Dropdown */}
                    {showMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => { setShowProfileModal(true); setShowMenu(false); }}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                {t('chat.menu.view_profile', 'VIEW PROFILE')}
                            </button>
                            <button
                                onClick={handleClearHistory}
                                disabled={isClearing}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 disabled:opacity-50"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                {isClearing ? t('common.loading', 'Loading...') : t('chat.menu.clear_chat', 'CLEAR HISTORY')}
                            </button>
                            <div className="h-px bg-white/5 my-1 mx-2"></div>
                            <button
                                onClick={handleBlockUser}
                                disabled={isBlocking}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                {isBlocking ? t('common.loading', 'Loading...') : t('chat.menu.block_user', 'BLOCK USER')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={{ ...otherUser, id: otherUserId }}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-900/5">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-30">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 text-indigo-400/50 border border-indigo-500/10 shadow-2xl shadow-indigo-500/5">
                            <MessageCircle className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2">ESTABLISHING CONNECTION</h3>
                        <p className="text-xs font-bold tracking-widest uppercase opacity-60">SAY HELLO TO START THE SHARED JOURNEY</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser.uid;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                    const senderPhoto = otherUser.photoURL;
                    const senderName = otherUser.displayName;

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3 animate-fade-in group`}>
                            {!isMe && (
                                <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 mb-1 border border-white/10 shadow-lg ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                    <img src={senderPhoto || `https://ui-avatars.com/api/?name=${senderName || 'User'}`} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                            <div className={`max-w-[92%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/30'
                                    : 'bg-white/5 border border-white/10 text-white rounded-bl-none backdrop-blur-xl'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] opacity-30 mt-1 font-mono uppercase tracking-tighter">
                                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/5 bg-slate-950/60' : 'border-gray-100 bg-white/50'} backdrop-blur-xl relative`}>
                {isBlocked && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in px-8">
                        <div className="text-center">
                            <p className="text-sm font-bold text-rose-400 mb-2 uppercase tracking-widest">{t('chat.user_blocked_notice', 'YOU HAVE BLOCKED THIS USER')}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mb-4">{t('chat.user_blocked_desc', 'UNBLOCK TO CONTINUE THE CONVERSATION')}</p>
                            <button
                                onClick={handleUnblockUser}
                                disabled={isBlocking}
                                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isBlocking ? t('common.loading', 'Loading...') : t('chat.menu.unblock_user', 'UNBLOCK USER')}
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-4 items-end">
                    <button type="button" aria-label={t('chat.attach_image', 'Attach image')} className="p-4 text-white/50 hover:text-indigo-400 rounded-2xl border border-white/5 hover:bg-white/10 transition-all active:scale-90">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative group">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className={`w-full bg-transparent border-none focus:ring-0 outline-none text-sm max-h-32 resize-none py-4 px-1 placeholder:opacity-40 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            rows={1}
                        />
                        <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-500/0 group-focus-within:bg-indigo-500/50 transition-all rounded-full"></div>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`p-4 rounded-2xl transition-all duration-500 shadow-lg ${!newMessage.trim()
                            ? 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95 shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)]'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DirectMessageView;
