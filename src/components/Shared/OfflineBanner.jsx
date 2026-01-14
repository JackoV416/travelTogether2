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
            className={`fixed top-[calc(80px+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none animate-slide-down`}
            role="alert"
            aria-live="polite"
        >
            <div className={`backdrop-blur-2xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto flex items-center gap-4 ${isDarkMode ? 'bg-amber-900/40 border-amber-500/20 text-amber-100' : 'bg-amber-50/70 border-amber-200 text-amber-900'}`}>
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500 text-white'} shadow-lg shadow-amber-500/20`}>
                    <WifiOff className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-sm tracking-tight">網絡已斷開</div>
                    <div className={`text-[10px] font-medium opacity-70 truncate`}>部分功能受限，但你可以繼續查看已快取行程</div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-amber-500/20 text-amber-500' : 'hover:bg-amber-200 text-amber-600'}`}
                    aria-label="關閉提示"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <style jsx>{`
                @keyframes slide-down {
                    from { transform: translate(-50%, -20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default OfflineBanner;
