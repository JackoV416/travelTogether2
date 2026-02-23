import React from 'react';
import { Plus, Globe, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getWeatherForecast } from '../../utils/tripUtils';
import { buttonPrimary, buttonSecondary } from '../../constants/styles';
import { AuroraCard, AuroraGradientText } from '../Shared/AuroraComponents';
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
    searchFilter,
    isMockMode
}) => {
    const { t } = useTranslation();

    // V1.2.4: Mock Trip for Tutorial
    const displayTrips = React.useMemo(() => {
        if (isMockMode && trips.length === 0) {
            return [{
                id: 'mock-trip',
                name: 'Tokyo Adventure (Tutorial)',
                country: 'Japan',
                city: 'Tokyo',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80',
                isMock: true
            }];
        }
        return trips;
    }, [trips, isMockMode]);

    return (
        <div data-tour="dashboard-overview">
            {/* Header: Aurora Style */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2">
                <AuroraGradientText as="h2" className="text-xl font-black flex items-center gap-2">
                    <span className="text-2xl">✈️</span> {t('dashboard.my_trips') || '我的行程'}
                </AuroraGradientText>

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

            {/* Search Filter Bar: Unified Design */}
            {searchFilter && (
                <AuroraCard className="p-4 mb-6 relative z-30" noPadding={false}>
                    {searchFilter}
                </AuroraCard>
            )}

            {loadingTrips ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonLoader type="card" count={3} isDarkMode={isDarkMode} />
                </div>
            ) : displayTrips.length === 0 ? (
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
                    {displayTrips.map((trip, index) => (
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
                    <AuroraCard
                        className="h-64 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 cursor-pointer border-dashed border-2 border-slate-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-transparent shadow-none hover:shadow-lg hover:shadow-indigo-500/10"
                        onClick={() => setIsCreateModalOpen(true)}
                        noPadding={false}
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <p className="font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{t('dashboard.create_more') || '建立更多行程'}</p>
                    </AuroraCard>
                </div>
            )}
        </div>
    );
};

export default TripsGrid;
