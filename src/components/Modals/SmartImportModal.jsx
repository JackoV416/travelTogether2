import React from 'react';
import { Upload, X } from 'lucide-react';

// Premium UI Classes (matching App.jsx)
const glassCard = (isDarkMode) => isDarkMode ? "bg-gray-900/60 backdrop-blur-md border border-white/10 text-white shadow-xl" : "bg-white/80 backdrop-blur-md border border-white/20 text-gray-900 shadow-xl";

export default function SmartImportModal({ isOpen, onClose, isDarkMode }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-md rounded-2xl overflow-hidden`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Upload className="w-6 h-6 text-indigo-400" /> 智能匯入中心
                        </h2>
                        <p className="text-sm opacity-60 mt-1">一站式處理所有旅遊文件、單據與回憶</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Coming Soon Content */}
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🚧</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-amber-400">功能開發中</h3>
                    <p className="opacity-60 text-sm mb-6 leading-relaxed">
                        匯入功能正在優化中，預計 V0.22 版本開放使用。<br />
                        屆時將支援：行程截圖、單據掃描、JSON/CSV 匯入等功能。
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
}
