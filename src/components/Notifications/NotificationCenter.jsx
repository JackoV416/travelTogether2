import React, { useState, useMemo } from 'react';
import {
    X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info,
    Trash2, Check, Clock, Calendar, User, ArrowRight,
    Plane, ShoppingBag, DollarSign, MapPin, Hotel, MessageCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next'; // Assuming i18n is available, if not remove or add hook

import { createPortal } from 'react-dom';

const NotificationCenter = ({
    isOpen,
    onClose,
    notifications = [],
    onMarkAllRead,
    onClearAll,
    onRemoveNotification,
    onNotificationClick,
    isDarkMode
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all'); // all, activity, system, alert

    if (!isOpen) return null;

    // --- Statistics ---
    const unreadCount = notifications.filter(n => !n.read).length;

    // --- Filtering ---
    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (activeTab === 'all') return true;
            if (activeTab === 'activity') return n.type === 'activity';
            if (activeTab === 'system') return n.type === 'info' || n.type === 'success';
            if (activeTab === 'alert') return n.type === 'warning' || n.type === 'error';
            return true;
        });
    }, [notifications, activeTab]);

    // --- Grouping by Date ---
    const groupedNotifications = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            older: []
        };

        filteredNotifications.forEach(n => {
            const date = n.timestamp?.toDate ? n.timestamp.toDate() : new Date(n.timestamp || Date.now());
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

            if (isToday) groups.today.push(n);
            else if (isYesterday) groups.yesterday.push(n);
            else groups.older.push(n);
        });
        return groups;
    }, [filteredNotifications]);

    // --- Helpers ---
    const getIcon = (n) => {
        // 1. Check for Sender Avatar (Activity)
        if (n.sender?.photoURL) {
            return (
                <img
                    src={n.sender.photoURL}
                    alt={n.sender.name}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
            );
        }

        // 2. Check for Specific Activity Icons
        if (n.type === 'activity') {
            switch (n.activityType) {
                case 'add_item': return <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>;
                case 'delete_item': return <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></div>;
                case 'add_expense': return <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>;
                case 'edit_item': return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><FileText className="w-4 h-4" /></div>;
            }
        }

        // 3. Fallback System Icons
        switch (n.type) {
            case 'success': return <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>;
            case 'warning': return <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>;
            case 'error': return <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><AlertCircle className="w-4 h-4" /></div>;
            default: return <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Info className="w-4 h-4" /></div>;
        }
    };

    const NotificationItem = ({ note }) => (
        <div
            onClick={() => onNotificationClick && onNotificationClick(note)}
            className={`group flex gap-3 p-3 rounded-xl transition-all relative overflow-hidden ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${!note.read ? (isDarkMode ? 'bg-indigo-900/10' : 'bg-indigo-50/50') : ''} cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0`}
        >
            {/* Unread Indicator Bar */}
            {!note.read && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-indigo-500 rounded-r-full"></div>
            )}

            {/* Icon / Avatar */}
            <div className="flex-shrink-0 mt-1">
                {getIcon(note)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} ${!note.read ? 'font-bold' : ''}`}>
                        {note.title}
                    </h4>
                    <span className="text-[10px] opacity-40 whitespace-nowrap ml-2 flex-shrink-0">
                        {note.time || format(new Date(note.timestamp?.toDate ? note.timestamp.toDate() : Date.now()), 'HH:mm')}
                    </span>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {note.message}
                </p>

                {/* Context Hints */}
                {note.context && (
                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                        <span className="text-[10px] flex items-center gap-1 bg-gray-500/10 px-1.5 py-0.5 rounded">
                            {note.context.tripId ? 'Trip Update' : 'System'}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover Actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-900 shadow-sm rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button
                    onClick={(e) => { e.stopPropagation(); onRemoveNotification(note.id); }}
                    className="p-1.5 hover:bg-red-50 text-red-400 rounded-md transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Main Panel */}
            <div className={`fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-[110] shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 ${isDarkMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white border-l border-gray-100'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Bell className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h2 className="font-bold text-lg">{t('notifications.title') || '通知中心'}</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                                {unreadCount} {t('notifications.new') || '新'}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onMarkAllRead}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'}`}
                            title={t('notifications.mark_all_read') || '全部已讀'}
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                            <X className="w-5 h-5 opacity-60" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-gray-800">
                    {[
                        { id: 'all', label: t('notifications.tabs.all') || '全部', icon: null },
                        { id: 'activity', label: t('notifications.tabs.activity') || '動態', icon: User },
                        { id: 'alert', label: t('notifications.tabs.alerts') || '警報', icon: AlertTriangle },
                        { id: 'system', label: t('notifications.tabs.system') || '系統', icon: Info },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5
                                ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : (isDarkMode ? 'border-gray-700 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white')
                                }`}
                        >
                            {tab.icon && <tab.icon className="w-3 h-3" />}
                            {tab.label}
                        </button>
                    ))}
                    <div className="flex-1"></div>
                    {notifications.length > 0 && (
                        <button
                            onClick={onClearAll}
                            className="text-[10px] opacity-40 hover:opacity-100 hover:text-red-500 transition-all whitespace-nowrap"
                        >
                            {t('notifications.clear_all') || '清除全部'}
                        </button>
                    )}
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {filteredNotifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                            <Bell className="w-12 h-12 mb-4 text-gray-400 stroke-1" />
                            <p className="text-sm font-medium">{t('notifications.empty_title') || '暫無通知'}</p>
                            <p className="text-xs">{t('notifications.empty_desc') || '如果有新動態，會即刻通知你。'}</p>
                        </div>
                    ) : (
                        <div className="pb-20"> {/* Padding for bottom safe area */}
                            {/* Today Group */}
                            {groupedNotifications.today.length > 0 && (
                                <div>
                                    <div className={`sticky top-0 z-10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${isDarkMode ? 'bg-gray-900/80 text-gray-500' : 'bg-white/80 text-gray-400'}`}>
                                        {t('notifications.groups.today') || '今天'}
                                    </div>
                                    <div className="px-2">
                                        {groupedNotifications.today.map(n => <NotificationItem key={n.id} note={n} />)}
                                    </div>
                                </div>
                            )}

                            {/* Yesterday Group */}
                            {groupedNotifications.yesterday.length > 0 && (
                                <div>
                                    <div className={`sticky top-0 z-10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mt-4 ${isDarkMode ? 'bg-gray-900/80 text-gray-500' : 'bg-white/80 text-gray-400'}`}>
                                        {t('notifications.groups.yesterday') || '昨天'}
                                    </div>
                                    <div className="px-2">
                                        {groupedNotifications.yesterday.map(n => <NotificationItem key={n.id} note={n} />)}
                                    </div>
                                </div>
                            )}

                            {/* Older Group */}
                            {groupedNotifications.older.length > 0 && (
                                <div>
                                    <div className={`sticky top-0 z-10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mt-4 ${isDarkMode ? 'bg-gray-900/80 text-gray-500' : 'bg-white/80 text-gray-400'}`}>
                                        {t('notifications.groups.older') || '較早前'}
                                    </div>
                                    <div className="px-2">
                                        {groupedNotifications.older.map(n => <NotificationItem key={n.id} note={n} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
};

export default NotificationCenter;
