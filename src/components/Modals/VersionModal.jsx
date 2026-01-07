import React from 'react';
import { X, GitCommit, Calendar, Tag, Bot, Monitor } from 'lucide-react';
import { VERSION_HISTORY, JARVIS_VERSION_HISTORY, APP_VERSION, JARVIS_VERSION, APP_AUTHOR } from '../../constants/appData';
import { useState } from 'react';

const VersionModal = ({ isOpen, onClose, isDarkMode, globalSettings }) => {
    const [activeTab, setActiveTab] = useState('web'); // 'web' or 'jarvis'
    if (!isOpen) return null;

    const currentLang = globalSettings?.language || 'zh-TW'; // Use globalSettings.language which matches App.jsx state

    // Helper to format body text (handle \n string or array)
    const renderDetails = (detailsRaw) => {
        if (!detailsRaw) return null;
        const text = detailsRaw[currentLang] || detailsRaw['en'];

        if (Array.isArray(text)) {
            return (
                <ul className="space-y-1.5 mt-2">
                    {text.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs opacity-80 leading-relaxed">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        // Handle legacy string with \n
        return (
            <div className="space-y-1.5 mt-2">
                {text.split('\n').map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs opacity-80 leading-relaxed">
                        {line.trim().startsWith('•') ? (
                            <>
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0"></span>
                                <span>{line.replace('•', '').trim()}</span>
                            </>
                        ) : (
                            <span>{line}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div
                className={`w-full max-w-lg rounded-2xl flex flex-col max-h-[85vh] shadow-2xl transition-all ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-5 border-b flex justify-between items-center flex-shrink-0 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <GitCommit className="w-5 h-5 text-indigo-500" />
                            版本紀錄
                        </h2>
                        <div className="text-xs opacity-50 mt-1 font-mono">
                            Current: {activeTab === 'web' ? APP_VERSION : JARVIS_VERSION}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`flex-1 py-3 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'web'
                            ? 'border-indigo-500 text-indigo-500 bg-indigo-500/5'
                            : 'border-transparent opacity-40 hover:opacity-60'}`}
                    >
                        <Monitor className="w-3.5 h-3.5" /> 網站系統
                    </button>
                    <button
                        onClick={() => setActiveTab('jarvis')}
                        className={`flex-1 py-3 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'jarvis'
                            ? 'border-purple-500 text-purple-500 bg-purple-500/5'
                            : 'border-transparent opacity-40 hover:opacity-60'}`}
                    >
                        <Bot className="w-3.5 h-3.5" /> Jarvis AI
                    </button>
                </div>

                {/* Sub-Header info */}
                <div className={`px-5 py-2 text-[10px] font-bold uppercase tracking-tighter border-b ${isDarkMode ? 'border-gray-800 bg-black/20' : 'border-gray-50 bg-gray-50/50'}`}>
                    {activeTab === 'web' ? (
                        <span className="opacity-30">Travel Together Stable Build - {APP_VERSION}</span>
                    ) : (
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 font-black">Assistant Engine Beta - {JARVIS_VERSION}</span>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    {(activeTab === 'web' ? VERSION_HISTORY : JARVIS_VERSION_HISTORY).map((ver, i) => {
                        const isLatest = i === 0;
                        const accentColor = activeTab === 'web' ? 'indigo' : 'purple';
                        const accentClass = activeTab === 'web' ? 'text-indigo-500' : 'text-purple-500';
                        const borderClass = activeTab === 'web' ? 'border-indigo-500' : 'border-purple-500';
                        const bgClass = activeTab === 'web'
                            ? (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200')
                            : (isDarkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200');

                        return (
                            <div key={ver.ver} className="relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-[-32px] before:w-[2px] before:bg-gray-500/10 last:before:hidden">
                                {/* Timeline Dot */}
                                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-[3px] z-10 ${isLatest ? `${borderClass} bg-white dark:bg-gray-900` : 'border-gray-400/30 bg-gray-200 dark:bg-gray-700'}`}></div>

                                {/* Version Card */}
                                <div className={`p-4 rounded-xl border transition-all ${isLatest ? bgClass : (isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-100')}`}>

                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold font-mono text-sm ${isLatest ? accentClass : 'opacity-90'}`}>
                                                    {ver.ver}
                                                </h3>
                                                {ver.tag && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isLatest ? (activeTab === 'web' ? 'bg-indigo-500 text-white' : 'bg-purple-500 text-white') : 'bg-gray-500/10 opacity-70'}`}>
                                                        {ver.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs opacity-50 mt-0.5 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {ver.date}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description (Title) */}
                                    <div className="font-bold text-sm mb-1">
                                        {ver.desc?.[currentLang] || ver.desc?.['en']}
                                    </div>

                                    {/* Details (Body) */}
                                    {renderDetails(ver.details)}

                                    {/* Changes (Technical) - Optional */}
                                    {ver.changes && (
                                        <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                                            <div className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider flex items-center gap-1">
                                                <Tag className="w-3 h-3" /> Tech Specs
                                            </div>
                                            <ul className="space-y-1">
                                                {ver.changes.map((c, idx) => (
                                                    <li key={idx} className="text-[10px] font-mono opacity-50 truncate">
                                                        - {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer with Dismiss Button */}
                <div className={`p-4 border-t text-center flex-shrink-0 ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'} rounded-b-2xl`}>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] opacity-40 font-mono">Developed by {APP_AUTHOR}</span>
                        <button
                            onClick={() => {
                                localStorage.setItem('app_last_seen_version', APP_VERSION);
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        >
                            唔再顯示 (Don't Show Again)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to parse existing version string if needed (optional utility)
const parseAppVersion = (verStr) => {
    // e.g. "V0.27.0-PreRelease"
    return { build: 'Stable' };
};

export default VersionModal;
