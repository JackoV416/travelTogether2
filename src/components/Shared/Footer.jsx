import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { APP_VERSION, JARVIS_VERSION, LANGUAGE_OPTIONS } from '../../constants/appData';
import SyncStatus from './SyncStatus';

const Footer = ({ isDarkMode, onOpenVersion, onLanguageChange }) => {
    const [time, setTime] = useState(new Date());
    const { t, i18n } = useTranslation();

    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    // Language toggle: cycles zh-HK -> zh-TW -> en -> zh-HK
    // We use the keys from LANGUAGE_OPTIONS constant to be consistent, but keep the cycle logic simple
    // LANGUAGE_OPTIONS = { "zh-TW": {...}, "en": {...}, "zh-HK": {...} }
    const LANG_CYCLE = ['zh-HK', 'zh-TW', 'en'];
    const currentLang = i18n.language || 'zh-HK';

    return (
        <footer className={`mt-12 pt-6 pb-24 md:pb-12 border-t text-center text-xs flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'bg-gray-900/50 border-gray-800/50 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'} pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]`}>
            {/* Version Row - Unified Premium Header */}
            <div className={`flex flex-wrap gap-2 md:gap-4 items-center justify-center py-2 px-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-2">
                    <span data-tour="app-version" className="text-[10px] font-black tracking-widest opacity-80 uppercase">Travel Together <span className="text-indigo-500">{APP_VERSION}</span></span>
                </div>

                <span className="w-1 h-1 rounded-full bg-gray-500/30"></span>

                <div className="flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 font-black text-[10px] tracking-widest uppercase italic">Jarvis {JARVIS_VERSION}</span>
                </div>

                <span className="w-1 h-1 rounded-full bg-gray-500/30"></span>

                <button
                    onClick={onOpenVersion}
                    className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/5 border border-indigo-500/20 uppercase tracking-tighter"
                >
                    {t('footer.version_updates') || '版本更新內容'}
                </button>
            </div>

            {/* Time + Language + Sync Row - Clean & Functional */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4">
                {/* Time Section */}
                <div className="flex items-center gap-2 font-mono font-bold tracking-tighter text-indigo-500/60 transition-colors hover:text-indigo-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] tabular-nums whitespace-nowrap">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                </div>

                <div className="h-4 w-[1px] bg-gray-500/20"></div>

                {/* Language Section */}
                <div className="relative group">
                    <select
                        value={currentLang}
                        onChange={(e) => {
                            if (onLanguageChange) {
                                onLanguageChange(e.target.value);
                            } else {
                                i18n.changeLanguage(e.target.value);
                                localStorage.setItem('travelTogether_language', e.target.value);
                            }
                        }}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl border text-[10px] font-black cursor-pointer outline-none transition-all ${isDarkMode ? 'bg-gray-800/80 border-white/10 text-gray-300 hover:border-emerald-500/50' : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500/50 hover:shadow-md'}`}
                        title={t('footer.select_lang') || "選擇語言"}
                    >
                        {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => (
                            <option key={code} value={code}>🌐 {conf.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="h-4 w-[1px] bg-gray-500/20"></div>

                {/* Status Section */}
                <div data-tour="sync-status" className="flex items-center gap-3">
                    <SyncStatus isDarkMode={isDarkMode} />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
