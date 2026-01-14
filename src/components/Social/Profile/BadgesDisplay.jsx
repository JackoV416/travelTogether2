import React from 'react';
import { Award, Lock, Star, Zap, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BadgesDisplay = ({ isDarkMode, trips = [], user }) => {
    const { t } = useTranslation();

    // Calculate Progress
    const userTrips = trips.filter(t => t.members?.some(m => m.id === user.uid));
    const uniqueCountries = new Set(userTrips.map(t => t.country).filter(Boolean));
    const tripCount = userTrips.length;
    const countryCount = uniqueCountries.size;
    const joinYear = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : 2024;
    const isEarlyAdopter = joinYear <= 2024;

    // Define Badges with Logic
    const badges = [
        { id: 1, key: "early_adopter", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", unlocked: isEarlyAdopter, data: { year: joinYear } },
        { id: 2, key: "jetsetter", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-500/10", unlocked: tripCount >= 5 },
        { id: 3, key: "explorer", icon: Map, color: "text-emerald-500", bg: "bg-emerald-500/10", unlocked: countryCount >= 10 },
        { id: 4, key: "contributor", icon: Award, color: "text-rose-500", bg: "bg-rose-500/10", unlocked: false },
        { id: 5, key: "influencer", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", unlocked: false },
        { id: 6, key: "globetrotter", icon: Map, color: "text-blue-500", bg: "bg-blue-500/10", unlocked: false },
    ];

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalBadges = badges.length;

    // XP Calculation (Mock formula)
    const currentXP = (tripCount * 100) + (countryCount * 200) + (unlockedCount * 500);
    const nextLevelXP = 5000;
    const level = Math.floor(currentXP / 1000) + 1;

    return (
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        {t('profile.badges_title')}
                    </h3>
                    <p className="text-sm opacity-60">
                        {t('profile.badges_unlocked', { count: unlockedCount, total: totalBadges })}
                    </p>
                </div>

                {/* Level Progress */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold opacity-60 uppercase tracking-widest">{t('profile.level')} {level}</div>
                        <div className="text-xs font-bold text-indigo-500">{currentXP} / {nextLevelXP} {t('profile.xp')}</div>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={(1 - (currentXP % 1000) / 1000) * 125.6} className="text-indigo-500" />
                        </svg>
                        <span className="absolute font-black text-sm">{level}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`relative group p-4 rounded-2xl border transition-all hover:-translate-y-1 ${badge.unlocked
                            ? (isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500/50' : 'bg-gray-50 border-gray-200 hover:border-indigo-200')
                            : 'opacity-50 grayscale bg-gray-100 dark:bg-gray-900 border-transparent'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-lg ${badge.unlocked ? badge.bg : 'bg-gray-200 dark:bg-gray-800'}`}>
                            {badge.unlocked ? <badge.icon className={`w-6 h-6 ${badge.color}`} /> : <Lock className="w-5 h-5 text-gray-400" />}
                        </div>
                        <h4 className="font-bold text-sm mb-1">{t(`profile.badges_list.${badge.key}.name`)}</h4>
                        <p className="text-[10px] opacity-60 leading-tight">{t(`profile.badges_list.${badge.key}.desc`, badge.data || {})}</p>

                        {!badge.unlocked && (
                            <div className="absolute inset-0 bg-gray-50/50 dark:bg-black/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Lock className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgesDisplay;
