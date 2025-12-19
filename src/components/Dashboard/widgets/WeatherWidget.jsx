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
    return (
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-white/5 min-h-[300px]`}>
                <h4 className="font-bold flex items-center gap-2 mb-4 text-indigo-400">
                    <CloudSun className="w-5 h-5" /> 當地天氣 & 時間
                </h4>
                <div className="space-y-4 custom-scrollbar overflow-y-auto pr-1 flex-1">
                    {isLoadingWeather ? (
                        <div className="space-y-4">
                            <SkeletonLoader type="list-item" count={4} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        Object.keys(CITY_COORDS).map((city) => {
                            const wData = weatherData?.[city];
                            const staticData = INFO_DB.weather.find(w => w.city === city) || {};
                            const displayTemp = wData?.temp || staticData.temp || '--';
                            const displayDesc = wData?.desc || staticData.desc || '載入中...';
                            const displayIcon = wData?.icon || staticData.icon || '⌛';
                            const timezone = staticData.tz || 'UTC';

                            return (
                                <div key={city} className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div>
                                        <span className="block font-bold text-sm">{getLocalizedCityName(city, currentLang)}</span>
                                        <span className="text-[10px] opacity-50 font-mono tracking-tighter">{getLocalCityTime(timezone)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold">{displayTemp}</span>
                                        <div className="text-[10px] opacity-70 flex items-center justify-end gap-1">
                                            <span>{displayIcon}</span> <span>{displayDesc}</span>
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
