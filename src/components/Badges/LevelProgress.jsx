import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculateLevel } from '../../services/achievementService';
import { LEVEL_THRESHOLDS } from '../../constants/badges';
import { Trophy, Star } from 'lucide-react';

const LevelProgress = ({ user, totalXP = 0 }) => {
    const { t } = useTranslation();
    const { level, nextLevelXP } = calculateLevel(totalXP);

    // Calculate progress percentage
    // To make it smoother, we should calculate XP relative to current level floor
    // But for MVP, simple linear progress between levels is fine or just total/threshold
    // Let's rely on thresholds.

    // Find absolute bounds for current level
    const thresholds = LEVEL_THRESHOLDS.map(t => t.xp);
    const currentBase = thresholds[level - 1] || 0;
    const nextTarget = thresholds[level] || 99999;

    const xpInLevel = Math.max(0, totalXP - currentBase);
    const xpRequiredForNext = nextTarget - currentBase;
    const progressPercent = nextLevelXP === 'MAX' ? 100 : Math.min(100, (xpInLevel / xpRequiredForNext) * 100);

    return (
        <div className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden mb-6">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl translate-x-10 -translate-y-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl -translate-x-5 translate-y-5" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {/* Level Badge Circle */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center shadow-lg border-4 border-white/20">
                        <div className="text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-900 opacity-80">{t('profile.level_caps', 'LEVEL')}</div>
                            <div className="text-4xl font-black text-white leading-none drop-shadow-md">{level}</div>
                        </div>
                    </div>
                    {/* Rank Star Decor */}
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 border-2 border-white shadow-md">
                        <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                </div>

                {/* Progress Info */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
                                {t('badges.adventurer_rank', 'Explorer Rank')}
                                {level >= 10 && <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] border border-yellow-500/30">{t('profile.elite', 'ELITE')}</span>}
                            </h3>
                            <p className="text-xs opacity-60">{t('badges.keep_exploring', 'Keep exploring to unlock more rewards!')}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-indigo-300">{totalXP}</span>
                            <span className="text-sm opacity-50 mx-1">/</span>
                            <span className="text-sm opacity-50">{nextLevelXP === 'MAX' ? 'MAX' : nextTarget} {t('profile.xp', 'XP')}</span>
                        </div>
                    </div>

                    {/* Bar */}
                    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-fast" />
                        </div>
                    </div>

                    <div className="mt-1 text-[10px] flex justify-between opacity-40 font-mono">
                        <span>{t('profile.lvl', 'Lvl')} {level}</span>
                        <span>{nextLevelXP === 'MAX' ? t('profile.max_level', 'Max Level') : `${t('profile.lvl', 'Lvl')} ${level + 1}`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelProgress;
