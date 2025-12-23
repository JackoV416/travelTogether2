import React from 'react';
import { RefreshCw, Smartphone, Monitor } from 'lucide-react';

const VersionGuardModal = ({ isOpen, latestVersion, currentVersion }) => {
    if (!isOpen) return null;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    return (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6 backdrop-blur-xl animate-fade-in">
            <div className="max-w-md w-full bg-gray-900 border border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin-slow" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">
                        發現新版本 {latestVersion}
                    </h2>
                    <p className="text-gray-400 text-sm mb-8">
                        為了確保資料同步與最佳體驗，<br />請即時更新 Travel Together。
                    </p>

                    <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            更新方法 (Update Guide)
                        </h3>

                        {isMobile ? (
                            <div className="flex flex-col gap-4">
                                <div className="text-sm text-gray-300 space-y-2">
                                    <p>1. 向上滑動並暫停，進入多工頁面。</p>
                                    <p>2. 將 Travel Together 向上掃走 (Kill App)。</p>
                                    <p>3. 重新開啟 App。</p>
                                </div>
                                <div className="text-[10px] text-gray-500 text-center mt-2 border-t border-white/5 pt-2">
                                    PWA 需要完全關閉才能清除舊快取
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="space-y-3">
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/10 flex justify-between items-center group">
                                        <span className="text-gray-400 text-xs">Windows / Linux</span>
                                        <kbd className="font-mono text-white font-bold bg-white/10 px-2 py-1 rounded">Ctrl + Shift + R</kbd>
                                    </div>
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/10 flex justify-between items-center group">
                                        <span className="text-gray-400 text-xs">macOS</span>
                                        <kbd className="font-mono text-white font-bold bg-white/10 px-2 py-1 rounded">Cmd + Shift + R</kbd>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500 text-center mt-2">
                                    請執行「強制刷新」以載入新代碼
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-[10px] font-mono opacity-30">
                        Current: {currentVersion} • Latest: {latestVersion}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionGuardModal;
