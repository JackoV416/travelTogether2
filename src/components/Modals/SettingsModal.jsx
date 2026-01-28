import React from 'react';
import { AuroraModal, AuroraButton } from '../Shared/AuroraComponents';
import { CURRENCIES, TIMEZONES } from '../../constants/tripData';

const LANGUAGE_OPTIONS = {
    "zh-TW": { label: "繁體中文" },
    "en": { label: "English" },
    "zh-HK": { label: "廣東話 (HK)" }
};

const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    return (
        <AuroraModal
            isOpen={isOpen}
            onClose={onClose}
            title="個人設定"
            size="md"
            footer={
                <AuroraButton
                    onClick={onClose}
                    fullWidth
                    variant="primary"
                    size="lg"
                >
                    完成設定
                </AuroraButton>
            }
        >
            <div className="space-y-8">
                <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 ml-1">貨幣單位</label>
                    <div className="relative">
                        <select
                            value={globalSettings.currency}
                            onChange={e => setGlobalSettings({ ...globalSettings, currency: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:bg-slate-800/80"
                        >
                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c} - {CURRENCIES[c].symbol}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 ml-1">所在地 (用於緊急資訊)</label>
                    <div className="relative">
                        <select
                            value={globalSettings.region}
                            onChange={e => setGlobalSettings({ ...globalSettings, region: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:bg-slate-800/80"
                        >
                            {Object.keys(TIMEZONES).map(r => <option key={r} value={r}>{TIMEZONES[r].label}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 ml-1">介面語言</label>
                    <div className="relative">
                        <select
                            value={globalSettings.language}
                            onChange={e => setGlobalSettings({ ...globalSettings, language: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:bg-slate-800/80"
                        >
                            {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => <option key={code} value={code}>{conf.label}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </AuroraModal>
    );
};

export default SettingsModal;
