import React from 'react';
import { CloudSun } from 'lucide-react';
import { getLocalizedCityName, getLocalCityTime } from '../../../utils/tripUtils';
import { CITY_COORDS, INFO_DB } from '../../../constants/appData';
import SkeletonLoader from '../../Shared/SkeletonLoader';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents'; // Aurora Import

/**
 * WeatherWidget - 顯示當地天氣與時間 (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Object} weatherData - Weather data object keyed by city
 * @param {boolean} isLoadingWeather - Weather loading state
 * @param {string} currentLang - Current language code
 */
const WeatherWidget = ({ isDarkMode, weatherData, isLoadingWeather, currentLang }) => {
    // 依家顯示所有城市，但 Container 較短，顯示頭 2 個後要 Scroll
    const displayCities = Object.keys(CITY_COORDS);

    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/20 p-6 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <CloudSun className="w-5 h-5 text-indigo-400" /> 天氣預報
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                LIVE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar scroll-smooth">
                    {isLoadingWeather ? (
                        <div className="space-y-4 mt-2">
                            <SkeletonLoader type="list-item" count={4} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        displayCities.map((city) => {
                            const wData = weatherData?.[city];
                            const staticData = INFO_DB.weather.find(w => w.city === city) || {};

                            const rawTemp = wData?.temp || staticData.dayTemp || '--';
                            const hasSlash = typeof rawTemp === 'string' && rawTemp.includes('/');

                            const dayTemp = hasSlash ? rawTemp.split('/')[0].trim() : rawTemp;
                            const apiNightTemp = hasSlash ? rawTemp.split('/')[1].trim() : null;

                            const nightTemp = apiNightTemp || staticData.nightTemp || (wData?.temp ? `${parseInt(wData.temp) - 6}°C` : '--');
                            const dayDesc = wData?.desc || staticData.dayDesc || '晴時多雲';
                            const nightDesc = staticData.nightDesc || '微涼';
                            const dayIcon = wData?.icon || staticData.dayIcon || '☀️';
                            const nightIcon = staticData.nightIcon || '🌙';

                            const timezone = staticData.tz || 'Asia/Tokyo';

                            return (
                                <div key={city} className="group rounded-2xl p-4 transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="block font-black text-sm tracking-tight text-white">{getLocalizedCityName(city, currentLang)}</span>
                                        </div>
                                        <div className="text-[10px] opacity-40 font-mono font-bold mt-0.5 text-white">
                                            {getLocalCityTime(timezone)}
                                        </div>
                                    </div>

                                    {/* Scrollable Day/Night Weather */}
                                    <div className="flex gap-3">
                                        {/* Day Forecast */}
                                        <div className="flex-1 min-w-[100px] p-2.5 rounded-xl border flex flex-col gap-1 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black opacity-60 uppercase tracking-widest text-amber-400">Day</span>
                                                <span className="text-sm filter drop-shadow-lg">{dayIcon}</span>
                                            </div>
                                            <div className="text-lg font-black text-amber-100">{dayTemp}</div>
                                            <div className="text-[10px] font-bold opacity-60 truncate text-amber-200/70">{dayDesc}</div>
                                        </div>

                                        {/* Night Forecast */}
                                        <div className="flex-1 min-w-[100px] p-2.5 rounded-xl border flex flex-col gap-1 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black opacity-60 uppercase tracking-widest text-indigo-400">Night</span>
                                                <span className="text-sm filter drop-shadow-lg">{nightIcon}</span>
                                            </div>
                                            <div className="text-lg font-black text-indigo-100">{nightTemp}</div>
                                            <div className="text-[10px] font-bold opacity-60 truncate text-indigo-200/70">{nightDesc}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </AuroraCard>
        </div>
    );
};

export default WeatherWidget;
