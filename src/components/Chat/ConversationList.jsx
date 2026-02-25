
import React from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OnlineStatusDot from './OnlineStatusDot';

const ConversationList = ({ conversations, currentUser, activeId, onSelect, loading, isDarkMode }) => {
    const { t } = useTranslation();

    // Format time in Facebook-style
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();

        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return t('time.yesterday', 'Yesterday');
        } else if (isThisWeek(date)) {
            return format(date, 'EEE'); // Mon, Tue, etc.
        } else {
            return format(date, 'MMM d'); // Jan 1, etc.
        }
    };

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800" />
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
                <p>{t('chat.no_conversations', 'No messages yet.')}</p>
            </div>
        );
    }

    const getOtherParticipant = (conv) => {
        const otherId = conv.participants.find(id => id !== currentUser.uid);
        return conv.participantDetails?.[otherId] || { displayName: 'User', photoURL: null };
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1">
            {conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                const isActive = activeId === conv.id;
                const unreadCount = conv.unreadCounts?.[currentUser.uid] || 0;
                const hasUnread = unreadCount > 0;

                return (
                    <div
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`p-2.5 mx-1 mb-1 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group
                        ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/10'
                                : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50'}
                        `}
                    >
                        {/* Avatar with Online Status - 56px */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.displayName)}&background=random`}
                                alt={otherUser.displayName}
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                            {/* Online Status Dot */}
                            <div className="absolute bottom-0 right-0">
                                <OnlineStatusDot isOnline={otherUser.isOnline || otherUser.status === 'online'} size="md" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Name and Time Row */}
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className={`font-semibold text-sm truncate ${isActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : hasUnread
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                    {otherUser.displayName}
                                </h4>
                                {conv.updatedAt && (
                                    <span className={`text-xs whitespace-nowrap ml-2 ${hasUnread
                                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {formatTime(conv.updatedAt)}
                                    </span>
                                )}
                            </div>

                            {/* Message Preview and Unread Badge Row */}
                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate max-w-[160px] ${hasUnread
                                    ? 'font-bold text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {conv.lastMessage?.text || t('chat.no_messages_yet', 'Say hello to start chat...')}
                                </p>
                                {hasUnread && (
                                    <span className="min-w-[20px] h-5 flex items-center justify-center bg-indigo-600 text-white text-[11px] font-bold rounded-full px-1.5 ml-2">
                                        {unreadCount > 99 ? '99+' : unreadCount}
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
