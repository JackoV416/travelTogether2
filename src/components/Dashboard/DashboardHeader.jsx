import { Plus, Upload, Calendar, ArrowRight, Search } from 'lucide-react';
import { glassCard } from '../../utils/tripUtils';
import { DEFAULT_BG_IMAGE } from '../../constants/appData';
import SmartSummaryCard from './SmartSummaryCard';

/**
 * DashboardHeader - The top banner/header of the Dashboard
 * @param {boolean} isDarkMode - Dark mode state
 * @param {string} selectedCountryImg - Background image URL
 * @param {Function} setIsCreateModalOpen - Open create modal
 * @param {Function} setForm - Reset form
 * @param {Function} setSelectedCountryImg - Reset background
 * @param {Function} setIsSmartImportModalOpen - Open import modal
 * @param {Function} setIsSmartExportOpen - Open export modal
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
    const hasTrips = trips.length > 0;
    return (
        <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
            <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{ backgroundImage: `url(${selectedCountryImg})` }}></div>

            <div className="relative z-10 flex flex-col gap-6">

                {/* Top Row: Title & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button
                                onClick={onOpenCommandPalette}
                                className={`p-2.5 rounded-xl border transition-all ${isDarkMode
                                    ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:scale-105'
                                    : 'bg-white border-indigo-100 text-indigo-600 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 shadow-sm'}`}
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <div className="absolute left-0 top-full mt-2 w-max px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10">
                                ⌘ + K 全域搜尋
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {hasTrips ? '🔔 重點行程與提醒' : '👋 開始您的第一次旅程'}
                            </h2>
                            <p className="opacity-80 text-sm max-w-xl mt-1">
                                {hasTrips ? '關注即將開始的旅程動態，以及 Jarvis 智能建議。' : '建立行程，讓 Jarvis 為您規劃完美路線。'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            data-tour="create-trip"
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 btn-hover-glow text-sm shadow-lg shadow-indigo-600/20"
                        >
                            <Plus className="w-4 h-4" /> 新增行程
                        </button>
                        <button
                            onClick={() => setIsSmartImportModalOpen(true)}
                            data-tour="smart-import"
                            className="px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-600"
                        >
                            <Upload className="w-4 h-4" /> 智能匯入
                        </button>
                    </div>
                </div>

                {/* Smart Summary Cards Area (Vertical List Mode) */}
                {hasTrips && (
                    <div className="w-full space-y-3 mt-2">
                        {trips.slice(0, 3).map(trip => (
                            <SmartSummaryCard
                                key={trip.id}
                                trip={trip}
                                isDarkMode={isDarkMode}
                                onClick={() => onSelectTrip(trip)}
                            />
                        ))}

                        {/* Create New Banner (Bottom of list) */}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`w-full py-3 rounded-2xl border border-dashed flex items-center justify-center gap-2 transition-all group ${isDarkMode ? 'border-white/5 hover:border-indigo-500/50 hover:bg-white/5' : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'}`}
                        >
                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
                                <Plus className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity text-slate-900 dark:text-white">新增行程</span>
                        </button>
                    </div>
                )}

                {/* Empty State / Old Actions (Only if no trips) */}
                {!hasTrips && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        <button
                            onClick={() => { setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' }); setSelectedCountryImg(DEFAULT_BG_IMAGE); }}
                            className="px-4 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all text-white/50"
                        >
                            重設預覽
                        </button>
                        <button
                            onClick={() => setIsSmartExportOpen(true)}
                            className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-100 font-bold text-sm hover:bg-purple-500/30 transition-all"
                        >
                            匯出行程
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
