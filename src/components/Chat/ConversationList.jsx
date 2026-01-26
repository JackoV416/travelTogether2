
import React from 'react';
import { format } from 'date-fns';
import { User } from 'lucide-react';

const ConversationList = ({ conversations, currentUser, activeId, onSelect, loading, isDarkMode }) => {
    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center text-sm">
                <p>No messages yet.</p>
            </div>
        );
    }

    const getOtherParticipant = (conv) => {
        const otherId = conv.participants.find(id => id !== currentUser.uid);
        return conv.participantDetails?.[otherId] || { displayName: 'User', photoURL: null };
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                const isActive = activeId === conv.id;
                const unreadCount = conv.unreadCounts?.[currentUser.uid] || 0;

                return (
                    <div
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all
                        ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/30'
                                : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50 border border-transparent'}
                        `}
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}&background=random`}
                                alt={otherUser.displayName}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            {/* Online Placeholder */}
                            {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></span> */}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-sm truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                                    {otherUser.displayName}
                                </h4>
                                {conv.updatedAt && (
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {format(conv.updatedAt.toDate(), 'HH:mm')}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <p className={`text-xs truncate max-w-[140px] ${unreadCount > 0 ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {conv.lastMessage?.text || 'Sent an attachment'}
                                </p>
                                {unreadCount > 0 && (
                                    <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
