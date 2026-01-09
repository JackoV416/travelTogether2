import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Wifi, RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            console.log(`Service Worker at: ${swUrl}`);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
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
        <div className="fixed left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4 animate-fade-in-up" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className={`backdrop-blur-md p-4 rounded-2xl shadow-2xl border flex items-center gap-4 ${isStandalone ? 'bg-indigo-600/90 text-white border-white/20' : 'bg-gray-900/90 text-white border-white/10'}`}>
                <div className={`p-2 rounded-xl ${isStandalone ? 'bg-white/20' : 'bg-indigo-500'}`}>
                    {offlineReady ? <Wifi className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin-slow" />}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm mb-0.5">
                        {offlineReady ? "準備好離線使用" : (isStandalone ? "發現應用程式更新" : "發現網頁更新")}
                    </h4>
                    <p className="text-[10px] opacity-80 leading-snug">
                        {offlineReady
                            ? "應用程式已快取，斷網亦可查看行程。"
                            : (isStandalone
                                ? "新版本已就緒，請「退出並重開」App 以套用更新。"
                                : "發現新版本 V1.1.1，點擊更新以體驗最新功能。")}
                    </p>
                </div>
                {needRefresh && !isStandalone && (
                    <button
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95"
                        onClick={() => updateServiceWorker(true)}
                    >
                        立即更新
                    </button>
                )}
                <button
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                    onClick={close}
                >
                    <X className="w-4 h-4 opacity-40" />
                </button>
            </div>
        </div>
    );
}

export default ReloadPrompt;
