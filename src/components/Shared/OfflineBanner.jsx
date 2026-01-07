import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

/**
 * OfflineBanner - 離線提示 Banner
 * 當用戶冇網絡時顯示友善提示
 */
const OfflineBanner = ({ isDarkMode }) => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => {
            setIsOffline(true);
            setDismissed(false); // Reset dismissal when going offline
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline || dismissed) return null;

    return (
        <div
            className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[200] animate-slide-in-right ${isDarkMode ? 'bg-amber-900/80' : 'bg-amber-500/90'} backdrop-blur-md text-white rounded-xl shadow-2xl p-4 flex items-center gap-3`}
            role="alert"
            aria-live="polite"
        >
            <div className="p-2 bg-white/20 rounded-full">
                <WifiOff className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
                <div className="font-bold text-sm">離線模式</div>
                <div className="text-xs opacity-80">部分功能可能無法使用</div>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="關閉離線提示"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default OfflineBanner;
