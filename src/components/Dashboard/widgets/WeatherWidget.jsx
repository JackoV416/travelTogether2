import React from 'react';
import { CloudSun } from 'lucide-react';
import { glassCard, getLocalizedCityName, getLocalCityTime } from '../../../utils/tripUtils';
import { CITY_COORDS, INFO_DB } from '../../../constants/appData';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * WeatherWidget - 顯示當地天氣與時間
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Object} weatherData - Weather data object keyed by city
 * @param {boolean} isLoadingWeather - Weather loading state
 * @param {string} currentLang - Current language code
 */
const WeatherWidget = ({ isDarkMode, weatherData, isLoadingWeather, currentLang }) => {
    // 依家顯示所有城市，但 Container 較短，顯示頭 2 個後要 Scroll
    const displayCities = Object.keys(CITY_COORDS);

    return (
        <div className="break-inside-avoid shadow-xl">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-white/5 max-h-[500px] overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/90 rounded-t-2xl"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                        <CloudSun className="w-5 h-5" /> 天氣預報
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5'}`}>
                            LIVE
                        </span>
                    </div>
                </div>

                <div className="space-y-5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth">
                    {isLoadingWeather ? (
                        <div className="space-y-4">
                            <SkeletonLoader type="list-item" count={4} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        displayCities.map((city) => {
                            const wData = weatherData?.[city];
                            const staticData = INFO_DB.weather.find(w => w.city === city) || {};

                            // 智慧解析溫室：如果 API 返返 "10°C / 4°C"，就將佢哋拆開擺落 Day 同 Night
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
                                <div key={city} className={`group rounded-2xl p-4 transition-all duration-300 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-gray-100/50 hover:bg-white border-transparent shadow-sm hover:shadow-md'} border relative`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className={`block font-black text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getLocalizedCityName(city, currentLang)}</span>
                                        </div>
                                        <div className="text-[10px] opacity-40 font-mono font-bold mt-0.5">
                                            {getLocalCityTime(timezone)}
                                        </div>
                                    </div>

                                    {/* Scrollable Day/Night Weather */}
                                    <div className="flex gap-3 overflow-x-auto custom-scrollbar-hide pb-1">
                                        {/* Day Forecast */}
                                        <div className={`flex-1 min-w-[120px] p-2.5 rounded-xl border flex flex-col gap-1 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest text-orange-400">Daytime</span>
                                                <span className="text-sm">{dayIcon}</span>
                                            </div>
                                            <div className="text-xl font-black">{dayTemp}</div>
                                            <div className="text-[10px] font-bold opacity-60 truncate">{dayDesc}</div>
                                        </div>

                                        {/* Night Forecast */}
                                        <div className={`flex-1 min-w-[120px] p-2.5 rounded-xl border flex flex-col gap-1 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-400/20' : 'bg-indigo-50 border-indigo-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest text-indigo-400">Night</span>
                                                <span className="text-sm">{nightIcon}</span>
                                            </div>
                                            <div className={`text-xl font-black ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{nightTemp}</div>
                                            <div className="text-[10px] font-bold opacity-60 truncate">{nightDesc}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
