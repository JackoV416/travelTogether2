import React from 'react';
import { Plus, Globe, Upload } from 'lucide-react';
import { glassCard, getWeatherForecast } from '../../utils/tripUtils';
import TripCard from './TripCard';

/**
 * TripsGrid - Rendering the list of trips or an empty state
 * @param {Array} trips - List of trips
 * @param {boolean} isDarkMode - Dark mode
 * @param {string} currentLang - Language code
 * @param {Function} onSelectTrip - Callback when trip selected
 * @param {Function} setGlobalBg - Update shared background
 * @param {Object} weatherData - Current weather data
 * @param {Function} setIsSmartImportModalOpen - Open import modal
 * @param {Function} setIsSmartExportOpen - Open export modal
 * @param {Function} setIsCreateModalOpen - Open create modal
 */
const TripsGrid = ({
    trips,
    isDarkMode,
    currentLang,
    onSelectTrip,
    setGlobalBg,
    weatherData,
    setIsSmartImportModalOpen,
    setIsSmartExportOpen,
    setIsCreateModalOpen
}) => {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3">我的行程</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSmartImportModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Upload className="w-4 h-4" /> 匯入
                    </button>
                    <button
                        onClick={() => setIsSmartExportOpen(true)}
                        className="px-4 py-2 rounded-xl border border-purple-500/40 text-sm hover:bg-purple-500/5 transition-colors"
                    >
                        匯出
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> 建立
                    </button>
                </div>
            </div>

            {trips.length === 0 ? (
                <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-indigo-400 opacity-40" />
                    <p className="opacity-50 mb-4 text-lg">尚無行程，立即開始規劃您的下一趟旅程！</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="text-indigo-400 underline font-bold text-lg">立即建立</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(t => (
                        <TripCard
                            key={t.id}
                            trip={t}
                            isDarkMode={isDarkMode}
                            currentLang={currentLang}
                            onSelect={onSelectTrip}
                            setGlobalBg={setGlobalBg}
                            cardWeather={(() => {
                                const wData = weatherData?.[t.city];
                                return getWeatherForecast(t.country, wData?.temp, wData?.desc, wData?.icon);
                            })()}
                        />
                    ))}
                    <div
                        className={`${glassCard(isDarkMode)} h-60 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 cursor-pointer border-dashed hover:border-indigo-500 transition-all`}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-10 h-10 mb-2 text-indigo-400" />
                        <p className="font-bold">建立更多行程</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripsGrid;
