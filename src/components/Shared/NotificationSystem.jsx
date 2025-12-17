import React from 'react';
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const NotificationSystem = ({ notifications, setNotifications }) => {
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
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-indigo-500/10 border-indigo-500/20';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm p-4">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md animate-slide-in transition-all ${getBgColor(notif.type)} bg-white/90 dark:bg-gray-900/90`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{notif.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{notif.body}</p>
                        <span className="text-[10px] opacity-40 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={() => dismiss(notif.id)}
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors -mr-1 -mt-1"
                    >
                        <X className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
