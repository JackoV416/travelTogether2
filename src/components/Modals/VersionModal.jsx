import React from 'react';
import { X } from 'lucide-react';
import { VERSION_HISTORY, AUTHOR_NAME, APP_VERSION } from '../../constants/tripData';

const VersionModal = ({ isOpen, onClose, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings?.lang || 'zh-TW';
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-bold tracking-tight">
                        {currentLang === 'zh-TW' ? '版本紀錄' : 'Version History'}
                        <span className="ml-2 text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-full font-mono">Beta</span>
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-4 flex-grow">
                    {VERSION_HISTORY.map((v, i) => (
                        <div key={i} className="border-l-2 border-indigo-500/30 pl-6 pb-2 relative group">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 transition-all ${i === 0 ? 'bg-indigo-500 border-indigo-200 dark:border-indigo-900 scale-110' : 'bg-gray-500 border-transparent'}`}></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <span className={`font-bold text-xl ${i === 0 ? 'text-indigo-500' : 'text-gray-500'}`}>{v.ver}</span>
                                <span className="text-xs opacity-50 font-mono bg-gray-500/5 px-2 py-1 rounded">{v.date}</span>
                            </div>
                            <div className="font-bold opacity-90 mb-2 text-base">
                                {typeof v.desc === 'object' ? v.desc[currentLang] || v.desc['zh-TW'] : v.desc}
                            </div>
                            {v.details && (
                                <div className="text-sm opacity-70 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-gray-500/5 border border-gray-500/10 group-hover:bg-gray-500/10 transition-colors">
                                    {typeof v.details === 'object' ? v.details[currentLang] || v.details['zh-TW'] : v.details}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-500/20 text-center text-xs opacity-40 flex justify-between items-center flex-shrink-0">
                    <span className="font-mono">Author: {AUTHOR_NAME}</span>
                    <span className="font-mono bg-gray-500/10 px-2 py-0.5 rounded">{APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};

export default VersionModal;
