
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { listenToMessages, sendMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';

const DirectMessageView = ({ conversation, currentUser, isDarkMode, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Get Other User Details
    const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
    const otherUser = conversation.participantDetails?.[otherUserId] || { displayName: 'User' };

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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900/50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        <img
                            src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}`}
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                            alt=""
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm md:text-base">{otherUser.displayName}</h3>
                        <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                        <p>Say hello to start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser.uid;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                    return (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={isMe}
                            showAvatar={showAvatar}
                            senderPhoto={otherUser.photoURL}
                            senderName={otherUser.displayName}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <button type="button" className="p-3 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 px-4 focus-within:ring-2 ring-indigo-500/20 transition-all">
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
                            className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm max-h-32 resize-none py-2"
                            rows={1}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`p-3 rounded-full transition-all duration-300 shadow-lg ${!newMessage.trim()
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-500/30'
                            }`}
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DirectMessageView;
