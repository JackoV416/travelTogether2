import React from 'react';
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const NotificationSystem = ({ notifications, setNotifications, isDarkMode, onNotificationClick }) => {
    if (!notifications || notifications.length === 0) return null;

    const dismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-indigo-500" />;
        }
    };

    const getBgColor = (type) => {
        const base = isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200';
        switch (type) {
            case 'success': return `${base} ${isDarkMode ? 'shadow-green-900/30' : 'shadow-green-500/20'}`;
            case 'warning': return `${base} ${isDarkMode ? 'shadow-yellow-900/30' : 'shadow-yellow-500/20'}`;
            case 'error': return `${base} ${isDarkMode ? 'shadow-red-900/30' : 'shadow-red-500/20'}`;
            default: return `${base} ${isDarkMode ? 'shadow-indigo-900/30' : 'shadow-indigo-500/20'}`;
        }
    };

    const getAccentBar = (type) => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'warning': return 'bg-yellow-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-indigo-500';
        }
    };

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm p-4">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    onClick={() => notif.context && onNotificationClick?.(notif)}
                    className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-xl animate-slide-in transition-all overflow-hidden relative ${getBgColor(notif.type)} ${notif.context ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                >
                    {/* Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getAccentBar(notif.type)}`}></div>

                    <div className="flex-shrink-0 mt-0.5 ml-2">
                        {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notif.title}</h4>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notif.body}</p>
                        <span className="text-[10px] opacity-40 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={() => dismiss(notif.id)}
                        className={`p-1 rounded-full transition-colors -mr-1 -mt-1 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                    >
                        <X className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
