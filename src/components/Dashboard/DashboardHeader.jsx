import { Plus, Upload, Calendar, ArrowRight } from 'lucide-react';
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
    onSelectTrip
}) => {
    const hasTrips = trips.length > 0;
    return (
        <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
            <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{ backgroundImage: `url(${selectedCountryImg})` }}></div>

            <div className="relative z-10 flex flex-col gap-6">

                {/* Top Row: Title & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {hasTrips ? '🔔 重點行程與提醒' : '👋 開始您的第一次旅程'}
                        </h2>
                        <p className="opacity-80 text-sm max-w-xl mt-1">
                            {hasTrips ? '關注即將開始的旅程動態，以及 AI 智能建議。' : '建立行程，讓 AI 為您規劃完美路線。'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 btn-hover-glow text-sm shadow-lg shadow-indigo-600/20"
                        >
                            <Plus className="w-4 h-4" /> 新增行程
                        </button>
                        <button
                            onClick={() => setIsSmartImportModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-600"
                        >
                            <Upload className="w-4 h-4" /> 智能匯入
                        </button>
                    </div>
                </div>

                {/* Smart Summary Cards Area */}
                {hasTrips && (
                    <div className="w-full overflow-x-auto pb-4 pt-2 -mx-2 px-2 custom-scrollbar">
                        <div className="flex gap-4">
                            {trips.slice(0, 5).map(trip => (
                                <SmartSummaryCard
                                    key={trip.id}
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                    onClick={() => onSelectTrip(trip)}
                                />
                            ))}

                            {/* Create New Card (Mini) */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className={`min-w-[100px] w-[100px] h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group ${isDarkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800' : 'border-gray-300 hover:border-indigo-500 hover:bg-white/50'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-500">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity">新增</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State / Old Actions (Only if no trips) */}
                {!hasTrips && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        <button
                            onClick={() => { setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' }); setSelectedCountryImg(DEFAULT_BG_IMAGE); }}
                            className="px-4 py-3 rounded-xl border border-white/30 text-sm hover:bg-white/10 transition-all"
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
