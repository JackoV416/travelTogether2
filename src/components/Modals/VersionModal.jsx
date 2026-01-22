import React, { useState } from 'react';
import { X, GitCommit, Calendar, Bot, Monitor } from 'lucide-react';
import { VERSION_HISTORY, JARVIS_VERSION_HISTORY, APP_VERSION, JARVIS_VERSION, APP_AUTHOR } from '../../constants/appData';

import { useTranslation } from 'react-i18next';

const VersionModal = ({ isOpen, onClose, isDarkMode, globalSettings }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('web'); // 'web' or 'jarvis'
    if (!isOpen) return null;

    const currentLang = globalSettings?.language || 'zh-TW';

    const history = activeTab === 'web' ? VERSION_HISTORY : JARVIS_VERSION_HISTORY;
    const currentVer = activeTab === 'web' ? APP_VERSION : JARVIS_VERSION;

    return (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
            <div
                className={`w-full max-w-lg rounded-3xl flex flex-col max-h-[85vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center flex-shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                            <GitCommit className="w-5 h-5 text-indigo-500" />
                            {t('modal.version.title')} (VERSION_LOG)
                        </h2>
                        <div className={`text-[10px] mt-1 font-mono font-bold tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            BUILD_NODE: {currentLang.toUpperCase()} | VERSION: {currentVer}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className={`flex p-1.5 gap-1.5 mx-6 mt-6 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`flex-1 py-3 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'web'
                            ? (isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-lg' : 'bg-white text-indigo-600 shadow-sm border border-slate-200/50')
                            : 'opacity-40 hover:opacity-100'}`}
                    >
                        <Monitor className="w-4 h-4" /> {t('modal.version.system')}
                    </button>
                    <button
                        onClick={() => setActiveTab('jarvis')}
                        className={`flex-1 py-3 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all rounded-xl ${activeTab === 'jarvis'
                            ? (isDarkMode ? 'bg-slate-700 text-purple-400 shadow-lg' : 'bg-white text-purple-600 shadow-sm border border-slate-200/50')
                            : 'opacity-40 hover:opacity-100'}`}
                    >
                        <Bot className="w-4 h-4" /> Jarvis AI
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 pt-8 space-y-10 custom-scrollbar relative">
                    {/* Background Grid Pattern - Better Visibility */}
                    <div className={`absolute inset-0 pointer-events-none opacity-[0.15] ${isDarkMode ? 'text-indigo-500' : 'text-indigo-900/20'}`} style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                    {history.map((ver, i) => {
                        const isLatest = i === 0;
                        const accentColor = activeTab === 'web' ? 'indigo' : 'purple';

                        // Harmonized data access for zh-TW, zh-HK, en
                        const description = (typeof ver.desc === 'object' ? (ver.desc[currentLang] || ver.desc?.['zh-TW'] || ver.desc?.['zh-HK'] || ver.desc?.['en']) : ver.desc) || ver.tag || "Update Details";
                        const logLines = Array.isArray(ver.details?.[currentLang] || ver.details?.['zh-TW'] || ver.details?.['zh-HK'] || ver.details?.['en'])
                            ? (ver.details[currentLang] || ver.details?.['zh-TW'] || ver.details?.['zh-HK'] || ver.details?.['en'])
                            : (ver.changes || []);

                        return (
                            <div key={ver.ver || `ver-${i}`} className="relative pl-10 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                                {/* Timeline Line */}
                                <div className={`absolute left-[7.5px] top-8 bottom-[-40px] w-[2px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} last:hidden`} />

                                {/* Node */}
                                <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 transition-all duration-500 z-10 ${isLatest
                                    ? `bg-${accentColor}-500 border-white shadow-[0_0_20px_rgba(99,102,241,0.6)]`
                                    : 'border-slate-500/30 bg-slate-800/10 opacity-30'}`}>
                                    {isLatest && <div className={`absolute inset-0 rounded-full animate-ping-slow opacity-30 bg-${accentColor}-500`} />}
                                </div>

                                {/* Version Block */}
                                <div className={`group rounded-3xl border p-6 transition-all duration-300 hover:translate-x-1 ${isLatest
                                    ? (isDarkMode ? 'bg-slate-800/60 border-slate-700 shadow-2xl backdrop-blur-xl' : 'bg-white border-slate-200 shadow-lg')
                                    : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`}>

                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`font-mono font-black text-xl tracking-tight leading-none ${isLatest ? (activeTab === 'web' ? 'text-indigo-400' : 'text-purple-400') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                                                {ver.ver}
                                            </span>
                                            {ver.tag && (
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md inline-block w-fit ${isLatest ? (activeTab === 'web' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400') : 'bg-slate-500/10 text-slate-500'}`}>
                                                    {ver.tag}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[10px] font-bold opacity-80 uppercase tracking-widest font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {ver.date}
                                        </div>
                                    </div>

                                    {/* System Log Title - Emoji Style */}
                                    <div className={`font-black text-[15px] mb-6 flex items-start gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        <span className="text-xl flex-shrink-0 mt-[-4px]">
                                            {activeTab === 'web' ? '🌐' : '🤖'}
                                        </span>
                                        <span className="leading-snug">{description}</span>
                                    </div>

                                    {/* Detailed Logs (Terminal Dots Style) - High Contrast & Font Weight */}
                                    <div className={`space-y-4 border-l-2 pl-6 py-1 ml-2.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                        {logLines.length > 0 ? logLines.map((line, idx) => (
                                            <div key={idx} className="flex items-start gap-4 text-[13px] group/line">
                                                <span className={`w-2 h-2 rounded-full mt-1.5 transition-all group-hover/line:scale-125 flex-shrink-0 ${isLatest ? (activeTab === 'web' ? 'bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]') : 'bg-slate-600'}`} />
                                                <p className={`leading-relaxed transition-opacity ${isLatest ? (isDarkMode ? 'text-slate-100 font-semibold' : 'text-slate-800 font-semibold') : (isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium')} group-hover/line:opacity-100`}>
                                                    {line}
                                                </p>
                                            </div>
                                        )) : (
                                            <p className="text-[11px] opacity-50 font-mono italic tracking-tight">## NULL_POINTER_IN_HISTORY_DATA</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer with Dismiss Button */}
                <div className={`p-6 border-t flex-shrink-0 flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900/80 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]' : 'border-slate-100 bg-slate-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'}`}>
                    <span className="text-[10px] opacity-50 font-mono font-black uppercase tracking-[0.2em]">{APP_AUTHOR} // CORE_DEV</span>
                    <button
                        onClick={() => {
                            localStorage.setItem('app_last_seen_version', APP_VERSION);
                            onClose();
                        }}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest transition-all ${isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-lg'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'}`}
                    >
                        {t('modal.version.dismiss')} (DISMISS)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VersionModal;
