import { Plus, Upload, Calendar, Rocket, Search } from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import { useTranslation } from 'react-i18next';
import { glassCard } from '../../utils/tripUtils';
import { buttonPrimary, buttonSecondary } from '../../constants/styles';
import { DEFAULT_BG_IMAGE, COUNTRIES_DATA } from '../../constants/appData';
import SmartSummaryCard from './SmartSummaryCard';
import Kbd from '../Shared/Kbd';

/**
 * DashboardHeader - The top banner/header of the Dashboard
 * V1.3.6: Compact Refactor for Pinterest Layout
 */
const DashboardHeader = ({
    isDarkMode,
    selectedCountryImg,
    setIsCreateModalOpen,
    setForm,
    setSelectedCountryImg,
    setIsSmartImportModalOpen,
    setIsSmartExportOpen,
    trips = [],
    onSelectTrip,
    onOpenCommandPalette
}) => {
    const { t } = useTranslation();
    const { isActive, currentStepData, nextStep } = useTour();
    const hasTrips = trips.length > 0;

    return (
        <div className="space-y-6" data-tour="dashboard-header">
            {/* Header: Compact Welcome + Actions */}
            <div className={`p-6 rounded-3xl ${glassCard(isDarkMode)} relative flex flex-col md:flex-row justify-between items-center gap-6`}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50 rounded-3xl" />

                <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-2xl">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {t('dashboard.header.welcome_back')}
                        </h2>
                        <p className="opacity-60 text-sm">
                            {hasTrips
                                ? t('dashboard.header.status_count', { count: trips.length })
                                : t('dashboard.header.first_trip_prompt')}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                    {/* Command Search */}
                    <div className="relative group flex-1 md:flex-none">
                        <button
                            onClick={onOpenCommandPalette}
                            className={`w-full md:w-auto px-4 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${isDarkMode
                                ? 'bg-indigo-500/10 border-white/5 text-indigo-400 hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/5'
                                : 'bg-white/50 border-indigo-100 text-indigo-600 hover:bg-white'} backdrop-blur-xl group`}
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs font-black">{t('dashboard.header.tooltips.search') || '搜尋'}</span>
                        </button>
                        <div className="hidden md:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 items-center gap-2">
                            <span className="text-[10px] font-bold">{t('dashboard.header.tooltips.search')}</span>
                            <Kbd keys={['⌘', 'K']} className="border-gray-600 bg-gray-700 text-gray-300" />
                        </div>
                    </div>

                    {/* Create Trip */}
                    <div className="relative group flex-1 md:flex-none">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`${buttonPrimary} !px-4 !py-2.5 !text-sm flex items-center justify-center gap-2`}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline font-black">{t('dashboard.header.new_trip') || '新行程'}</span>
                        </button>
                        <div className="hidden md:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 items-center gap-2">
                            <span className="text-[10px] font-bold">{t('dashboard.header.tooltips.new')}</span>
                            <Kbd keys={['⇧', 'N']} className="border-gray-600 bg-gray-700 text-gray-300" />
                        </div>
                    </div>

                    {/* Smart Import */}
                    <div className="relative group flex-1 md:flex-none">
                        <button
                            onClick={() => setIsSmartImportModalOpen(true)}
                            className={`${buttonSecondary} !px-4 !py-2.5 !text-sm !bg-emerald-600/20 !border-emerald-500/30 !text-emerald-400 hover:!bg-emerald-600/30 !shadow-none flex items-center justify-center gap-2`}
                        >
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline font-black">{t('dashboard.header.smart_import') || '匯入'}</span>
                        </button>
                        <div className="hidden md:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 items-center gap-2">
                            <span className="text-[10px] font-bold">{t('dashboard.header.tooltips.import')}</span>
                            <Kbd keys={['⇧', 'I']} className="border-gray-600 bg-gray-700 text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Reminders: Horizontal Scroll (Miniature) */}
            {hasTrips && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {t('dashboard.header.key_reminders') || '重點行程'}
                        </h3>
                        <button
                            onClick={() => {
                                // V1.3.6: Open My Trips in new tab as requested
                                window.open(window.location.origin + '?view=my_trips', '_blank');
                            }}
                            className="text-xs font-bold text-indigo-500 hover:opacity-80 transition-opacity"
                        >
                            {t('common.view_all') || '查看全部'}
                        </button>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x hide-scrollbar">
                        {trips.slice(0, 5).map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => onSelectTrip(trip)}
                                className={`min-w-[280px] p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95 snap-start ${glassCard(isDarkMode)} flex flex-col gap-3 group`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-xl">
                                            {COUNTRIES_DATA[trip.country]?.flag || '🌍'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm truncate max-w-[140px] group-hover:text-indigo-500 transition-colors">{trip.name}</h4>
                                            <p className="text-xs opacity-60">{trip.startDate || 'No Date'} • {trip.city}</p>
                                        </div>
                                    </div>
                                    {/* Mini Status Badge */}
                                    <span className={`w-2 h-2 rounded-full ${new Date(trip.startDate) <= new Date() ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                                </div>

                                {/* Mini Progress / Stats */}
                                <div className="flex items-center justify-between text-xs opacity-60 mt-1">
                                    {/* Smart Status: Days to Go or Duration */}
                                    <span>
                                        {(() => {
                                            if (!trip.startDate) return (trip.days || '?') + ' ' + t('common.days_short');
                                            const start = new Date(trip.startDate);
                                            const end = trip.endDate ? new Date(trip.endDate) : start;
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);
                                            start.setHours(0, 0, 0, 0);

                                            // If trip is in future, show Countdown
                                            if (start > now) {
                                                const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
                                                return t('trip.status.days_to_go_fmt', { days: diff }) || `${diff} Days Left`;
                                            }
                                            // If trip is active/past, show Duration
                                            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                            return duration + ' ' + t('common.days_short');
                                        })()}
                                    </span>
                                    <span>{Object.keys(trip.itinerary || {}).length} {t('common.items_count')}</span>
                                </div>
                            </div>
                        ))}

                        {/* New Trip Card (Mini) */}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`min-w-[100px] rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all group ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold opacity-60">{t('common.add')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;
