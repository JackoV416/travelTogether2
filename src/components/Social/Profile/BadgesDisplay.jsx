import React from 'react';
import { Award, Lock, Star, Zap, Map, Globe, Users, DollarSign, ShoppingBag, Brain, Image, MapPin, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BadgesDisplay = ({ isDarkMode, trips = [], user }) => {
    const { t } = useTranslation();

    // 1. Calculate Statistics
    const userTrips = trips.filter(t => t.members?.some(m => m.id === user.uid));
    const uniqueCountries = new Set(userTrips.map(t => t.country).filter(Boolean));
    const tripCount = userTrips.length;
    const countryCount = uniqueCountries.size;
    const joinYear = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : 2024;

    // 2. Simple Badges (Back to 6 as requested)
    const badges = [
        { id: 'early_adopter', key: "early_adopter", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", unlocked: joinYear <= 2024 },
        { id: 'jetsetter', key: "jetsetter", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-500/10", unlocked: tripCount >= 5 },
        { id: 'explorer', key: "explorer", icon: Map, color: "text-emerald-500", bg: "bg-emerald-500/10", unlocked: countryCount >= 3 },
        { id: 'social_butterfly', key: "social_butterfly", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10", unlocked: false },
        { id: 'foodie', key: "foodie", icon: Utensils, color: "text-purple-500", bg: "bg-purple-500/10", unlocked: false },
        { id: 'globetrotter', key: "globetrotter", icon: Map, color: "text-blue-500", bg: "bg-blue-500/10", unlocked: false },
    ];

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalBadges = badges.length;

    // 3. Simple XP Logic (Teaser Version)
    const currentXP = (tripCount * 100) + (countryCount * 200) + (unlockedCount * 500);
    const xpForNextLevel = 1000;
    const level = Math.floor(currentXP / 1000) + 1;
    const progressPercent = Math.min(100, (currentXP % 1000) / 10);

    return (
        <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200/60 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        {t('profile.badges_title')}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 uppercase tracking-tighter">V1.0</span>
                    </h3>
                    <p className="text-xs opacity-40 font-bold uppercase tracking-widest">
                        {t('profile.badges_unlocked', { count: unlockedCount, total: totalBadges })}
                    </p>
                </div>

                {/* Level Progress */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">{t('profile.level')} {level}</div>
                        <div className="text-xs font-black text-indigo-500">{currentXP} <span className="opacity-20">/</span> {xpForNextLevel} {t('profile.xp')}</div>
                    </div>
                    <div className="w-14 h-14 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="150.8" strokeDashoffset={(1 - progressPercent / 100) * 150.8} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000 ease-out" />
                        </svg>
                        <div className={`absolute inset-0 flex items-center justify-center font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {level}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`relative group p-4 rounded-2xl border transition-all duration-300 ${badge.unlocked
                            ? (isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200 shadow-sm')
                            : 'opacity-20 grayscale bg-transparent border-transparent'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${badge.unlocked ? badge.bg : 'bg-gray-200 dark:bg-gray-800'}`}>
                            {badge.unlocked ? <badge.icon className={`w-6 h-6 ${badge.color}`} /> : <Lock className="w-5 h-5 text-gray-400" />}
                        </div>

                        <h4 className="font-black text-[13px] mb-1 leading-tight">{t(`profile.badges_list.${badge.key}.name`)}</h4>
                        <p className="text-[10px] opacity-50 leading-tight line-clamp-2">{t(`profile.badges_list.${badge.key}.desc`, badge.data || {})}</p>

                        {!badge.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Lock className="w-4 h-4 opacity-10" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Teaser Footer */}
            <div className={`mt-8 pt-4 border-t border-dashed flex justify-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.3em] active:scale-95 cursor-help transition-all transform hover:text-indigo-500">
                    Badge System 2.0 Coming Soon in V1.9.3
                </p>
            </div>
        </div>
    );
};

export default BadgesDisplay;
