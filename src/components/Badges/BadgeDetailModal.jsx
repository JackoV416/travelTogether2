import React from 'react';
import { X, Trophy, Lock } from 'lucide-react';
import { RARITY_COLORS } from '../../constants/badges';
import { useTranslation } from 'react-i18next';

const BadgeDetailModal = ({ isOpen, onClose, badge, isDarkMode }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'zh-HK' || i18n.language === 'zh-TW' ? 'zh_HK' : 'en';

    if (!isOpen || !badge) return null;

    const { name, desc, icon, rarity, xp, unlocked, unlockedAt, condition } = badge;
    const gradient = RARITY_COLORS[rarity] || 'from-gray-500 to-gray-600';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-sm rounded-[2rem] p-6 shadow-2xl transform transition-all scale-100 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-500/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 opacity-60" />
                </button>

                {/* Header / Icon Area */}
                <div className={`relative h-32 rounded-3xl mb-12 flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg overflow-visible`}>
                    <div className="text-7xl drop-shadow-2xl filter transform hover:scale-110 transition-transform duration-300 cursor-default">
                        {icon}
                    </div>
                    {/* XP Badge */}
                    <div className="absolute -bottom-4 bg-black/80 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full font-black text-sm shadow-xl flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        {xp} XP
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black tracking-tight">
                        {typeof name === 'object' ? (name[lang] || name['en']) : name}
                    </h3>

                    <div className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border opacity-60">
                        {t(`badges.rarity.${rarity}`, rarity)}
                    </div>

                    <p className="text-sm opacity-70 leading-relaxed px-4">
                        {typeof desc === 'object' ? (desc[lang] || desc['en']) : desc}
                    </p>

                    {/* Status Bar */}
                    <div className={`mt-6 p-4 rounded-xl border ${unlocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-gray-500/5 border-gray-500/10 text-gray-500'}`}>
                        {unlocked ? (
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-sm">{t('badges.unlocked', 'Unlocked!')}</span>
                                {unlockedAt && <span className="text-[10px] opacity-70">{new Date(unlockedAt).toLocaleDateString()}</span>}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Lock className="w-3 h-3" />
                                    <span className="font-bold text-xs uppercase">{t('badges.locked', 'Locked')}</span>
                                </div>
                                <span className="text-[10px] opacity-50">
                                    {t('badges.target', { count: condition?.count, type: condition?.type })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeDetailModal;
