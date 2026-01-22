import React from 'react';
import { Plus, Globe, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { glassCard, getWeatherForecast } from '../../utils/tripUtils';
import { buttonPrimary, buttonSecondary } from '../../constants/styles';
import TripCard from './TripCard';
import SkeletonLoader from '../Shared/SkeletonLoader';
import EmptyState from '../Shared/EmptyState';

/**
 * TripsGrid - Rendering the list of trips or an empty state
 * @param {Array} trips - List of trips
 * @param {boolean} loadingTrips - Loading state for trips
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
    loadingTrips,
    isDarkMode,
    currentLang,
    onSelectTrip,
    setGlobalBg,
    weatherData,
    setIsSmartImportModalOpen,
    setIsSmartExportOpen,
    setIsCreateModalOpen,
    searchFilter
}) => {
    const { t } = useTranslation();
    return (
        <div data-tour="dashboard-overview">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3">{t('dashboard.my_trips') || '我的行程'}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSmartImportModalOpen(true)}
                        className={`${buttonSecondary} !px-4 !py-2 text-sm text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10`}
                    >
                        <Upload className="w-4 h-4" /> {t('dashboard.import') || '匯入'}
                    </button>
                    <button
                        onClick={() => setIsSmartExportOpen(true)}
                        className={`${buttonSecondary} !px-4 !py-2 text-sm border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10`}
                    >
                        {t('dashboard.export') || '匯出'}
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className={`${buttonPrimary} !px-4 !py-2 text-sm`}
                    >
                        <Plus className="w-4 h-4" /> {t('dashboard.create') || '建立'}
                    </button>
                </div>
            </div>

            {/* Search Filter Bar */}
            {searchFilter && <div className="mb-2">{searchFilter}</div>}

            {loadingTrips ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonLoader type="card" count={3} isDarkMode={isDarkMode} />
                </div>
            ) : trips.length === 0 ? (
                <EmptyState
                    icon={Globe}
                    title={t('empty.title', '尚無行程')}
                    description={t('empty.desc', '立即開始規劃您的下一趟旅程！您可以手動建立或從截圖匯入。')}
                    isDarkMode={isDarkMode}
                    actionLabel={t('empty.action', '立即建立行程')}
                    onAction={() => setIsCreateModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip, index) => (
                        <div
                            key={trip.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                            data-tour={index === 0 ? "trip-card" : undefined}
                        >
                            <TripCard
                                trip={trip}
                                isDarkMode={isDarkMode}
                                currentLang={currentLang}
                                onSelect={onSelectTrip}
                                setGlobalBg={setGlobalBg}
                                cardWeather={(() => {
                                    const wData = weatherData?.[trip.city];
                                    return getWeatherForecast(trip.country, wData?.temp, wData?.desc, wData?.icon, t);
                                })()}
                            />
                        </div>
                    ))}
                    <div
                        className={`${glassCard(isDarkMode)} h-64 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 cursor-pointer border-dashed border-white/20 hover:border-indigo-500/50 transition-all`}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-indigo-400" />
                        </div>
                        <p className="font-bold text-slate-400 group-hover:text-white transition-colors">{t('dashboard.create_more') || '建立更多行程'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripsGrid;
