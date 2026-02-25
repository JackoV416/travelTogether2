import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, Users, Map } from 'lucide-react';
import { AuroraGradientText } from '../Shared/AuroraComponents';
import { getLocalizedCityName } from '../../utils/tripUtils.jsx';

const CommunityHero = ({ isDarkMode }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // cityKey must match keys in getLocalizedCityName / CITY_NAMES map
    const trendingDestinations = [
        { cityKey: 'Tokyo', count: '1.2k', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=200' },
        { cityKey: 'Seoul', count: '850', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=200' },
        { cityKey: 'Osaka', count: '640', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&q=80&w=200' }
    ];

    return (
        <div className="relative mb-8 p-6 sm:p-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-fade-in group">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${isDarkMode ? 'from-indigo-950 via-slate-950 to-purple-950' : 'from-indigo-50 via-white to-purple-50'}`} />
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                {/* Text Content */}
                <div className="flex-1 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">
                            {t('community.badge') || 'Discovery Hub'}
                        </span>
                    </div>

                    {/* overflow-visible + pb-2 prevents italic '程' from clipping inside overflow-hidden parent */}
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight pb-2 pr-1">
                        <AuroraGradientText>
                            {t('community.hero_title') || 'EXPLORE THE SHARED JOURNEY'}
                        </AuroraGradientText>
                    </h1>

                    <p className={`text-sm sm:text-lg font-medium max-w-xl mx-auto lg:mx-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('community.hero_desc') || 'Discover itineraries shared by fellow travelers, find hidden gems, and start your next adventure with the community.'}
                    </p>

                    {/* Stats Ticker */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="text-lg font-black leading-none">12,402</div>
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('community.active_explorers') || 'Active Explorers'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Map className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="text-lg font-black leading-none">8,150</div>
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('community.public_trips') || 'Public Trips'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trending Dest Side Panel */}
                <div className="w-full lg:w-72 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-rose-400" /> {t('community.trending_now') || 'Trending Now'}
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>

                    <div className="space-y-3">
                        {trendingDestinations.map((dest, i) => (
                            <div
                                key={dest.cityKey}
                                className={`group/item flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60' : 'bg-white/50 border-gray-100 hover:bg-white shadow-sm'}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <img src={dest.image} alt={dest.name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                                <div className="flex-1">
                                    <div className="text-sm font-black tracking-tight">
                                        {getLocalizedCityName(dest.cityKey, currentLang) || dest.cityKey}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 italic uppercase">{dest.count} {t('community.planners') || 'PLANNERS'}</div>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHero;
