import React from 'react';
import { X } from 'lucide-react';
import { inputClasses, buttonPrimary } from '../../utils/tripHelpers';
import { CURRENCIES, TIMEZONES } from '../../constants/tripData';

const LANGUAGE_OPTIONS = {
    "zh-TW": { label: "繁體中文" },
    "en": { label: "English" }
};

const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">個人設定</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">貨幣</label>
                        <select value={globalSettings.currency} onChange={e => setGlobalSettings({ ...globalSettings, currency: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c} - {CURRENCIES[c].symbol}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">所在地 (用於緊急資訊)</label>
                        <select value={globalSettings.region} onChange={e => setGlobalSettings({ ...globalSettings, region: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                            {Object.keys(TIMEZONES).map(r => <option key={r} value={r}>{TIMEZONES[r].label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">介面語言</label>
                        <select value={globalSettings.language} onChange={e => setGlobalSettings({ ...globalSettings, language: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                            {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => <option key={code} value={code}>{conf.label}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={onClose} className={buttonPrimary + " mt-10 w-full py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>
                    完成設定
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
