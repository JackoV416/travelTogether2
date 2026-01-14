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
        <footer className={`mt-12 pt-6 pb-12 border-t text-center text-xs md:text-sm flex flex-col items-center justify-center gap-1 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'} pb-[calc(1.5rem+env(safe-area-inset-bottom))]`}>
            <div className="flex flex-wrap gap-2 items-center justify-center font-bold">
                <span data-tour="app-version">Travel Together {APP_VERSION}</span>
                <span className="opacity-30">|</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 font-bold">Jarvis {JARVIS_VERSION}</span>
                <span>•</span>
                <button
                    onClick={onOpenVersion}
                    className="px-2 py-0.5 rounded-full border border-indigo-400 text-indigo-500 text-[10px] md:text-xs hover:bg-indigo-500 hover:text-white transition"
                >
                    {t('footer.version_updates') || '版本更新內容'}
                </button>
                <span>•</span>
                {/* Language Switcher Dropdown */}
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
                    className={`px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-black cursor-pointer outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-emerald-500/50 text-emerald-400 hover:border-emerald-400' : 'bg-white border-emerald-500 text-emerald-600 hover:border-emerald-400'}`}
                    title={t('footer.select_lang') || "選擇語言"}
                >
                    {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => (
                        <option key={code} value={code}>🌐 {conf.label}</option>
                    ))}
                </select>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{t('footer.design_by') || 'Designed with ❤️'}</span>
            </div>
            <div className="font-mono flex flex-col md:flex-row items-center gap-1 md:gap-3 opacity-60 mt-1">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="opacity-50 text-[10px] hidden sm:inline">({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                </div>
                <span className="hidden md:inline">|</span>
                <div data-tour="sync-status">
                    <SyncStatus isDarkMode={isDarkMode} />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
