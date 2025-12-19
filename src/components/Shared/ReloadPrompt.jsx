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

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4 animate-fade-in-up">
            <div className="bg-gray-900/90 text-white backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10 flex items-center gap-4">
                <div className="p-2 bg-indigo-500 rounded-full">
                    {offlineReady ? <Wifi className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin-slow" />}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">
                        {offlineReady ? "準備好離線使用" : "發現新版本"}
                    </h4>
                    <p className="text-xs opacity-70">
                        {offlineReady
                            ? "應用程式已快取，斷網亦可查看行程。"
                            : "有新的更新可用，點擊重新載入以安裝。"}
                    </p>
                </div>
                {needRefresh && (
                    <button
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-bold transition-colors"
                        onClick={() => updateServiceWorker(true)}
                    >
                        更新
                    </button>
                )}
                <button
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    onClick={close}
                >
                    <X className="w-4 h-4 opacity-60" />
                </button>
            </div>
        </div>
    );
}

export default ReloadPrompt;
