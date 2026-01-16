import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Wifi, RefreshCw, X } from 'lucide-react';

function ReloadPrompt({ isDarkMode }) {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            // console.log(`Service Worker at: ${swUrl}`);
        },
        onRegisterError(error) {
            // console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    // Detect if running as PWA (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4 animate-fade-in-up" style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className={`backdrop-blur-2xl p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-gray-950/80 border-white/10 text-white' : 'bg-white/90 border-gray-100 text-gray-900'}`}>
                <div className={`relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40`}>
                    {offlineReady ? <Wifi className="w-6 h-6 text-white" /> : <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />}
                    {needRefresh && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-950 rounded-full animate-pulse" />}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm tracking-tight mb-0.5">
                        {offlineReady ? "準備就緒" : (isStandalone ? "系統升級" : "發現更新")}
                    </h4>
                    <p className={`text-[10px] font-medium leading-relaxed opacity-60`}>
                        {offlineReady
                            ? "應用程式已完成離線快取"
                            : (isStandalone
                                ? "新版本已就緒，請重啟 App 以完裝更新"
                                : "發現新版本 V1.3.4，點擊立即體驗")}
                    </p>
                </div>

                {needRefresh && !isStandalone && (
                    <button
                        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black transition-all shadow-lg shadow-indigo-500/30 active:scale-95 whitespace-nowrap"
                        onClick={() => updateServiceWorker(true)}
                    >
                        立即更新
                    </button>
                )}

                <button
                    className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    onClick={close}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ReloadPrompt;
