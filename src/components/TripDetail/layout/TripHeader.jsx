import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Calendar, Clock, MapPin, Globe2, Undo, Redo, Edit3, MessageCircle,
    UserPlus, Newspaper, Upload, Share2, Plus, BrainCircuit, Sparkles,
    List as ListIcon, Users, Trash2, ChevronDown, MonitorPlay, Columns,
    Map as MapIcon, KanbanSquare
} from 'lucide-react';
import ImageWithFallback from '../../Shared/ImageWithFallback';
import ActiveUsersList from '../ActiveUsersList';
import { getDaysArray, getLocalizedCityName, formatDate } from '../../../utils/tripUtils';
import { glassCard } from '../../../utils/tripUtils'; // Assuming glassCard is exported or I need to check where it imports from.
// It was imported from utils/tripUtils in TripDetailContent.

const TripHeader = ({
    trip,
    isDarkMode,
    currentHeaderImage,
    carouselIndex,
    displayCountry,
    displayCity,
    currentDisplayDate,
    timeDiff,
    handleUndo,
    canUndo,
    handleRedo,
    canRedo,
    isOwner,
    setIsTripSettingsOpen,
    isChatOpen,
    onOpenChat,
    currentLang,
    user,
    activeTab,
    setViewingMember,
    setIsMemberModalOpen,
    setAIMode,
    setIsAIModal,
    onOpenSmartImport,
    setIsSmartExportOpen,
    setIsInviteModal,
    onDeleteTrip,
    onOptimize,
    setAddType,
    setIsAddModal,
    setAddType,
    setIsAddModal,
    globalSettings,
    viewMode,
    setViewMode
}) => {
    // Local menu states derived from original component
    const { t } = useTranslation();
    const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
    const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);

    return (
        <div className={`${glassCard(isDarkMode)} relative mb-8 z-40 group hover:shadow-2xl transition-all duration-500`}>
            {/* Background Layer with Overflow Hidden to clip scaling image */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${currentHeaderImage})` }}
                />

                {/* Carousel Indicators */}
                {trip.cities && trip.cities.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 pt-10">
                        {trip.cities.map((c, i) => (
                            <div
                                key={c}
                                className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                                title={c}
                            />
                        ))}
                    </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900/90 via-gray-900/40 to-black/20' : 'from-indigo-900/60 via-indigo-900/20 to-black/10'}`} />
            </div>

            {/* Content Grid - Centered Container */}
            <div className="relative z-10 px-6 py-6 md:px-10 md:py-10 lg:px-14 lg:py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-white">
                        {/* Left Col: Trip Core Info */}
                        <div className="lg:col-span-2 flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-2">{t('trip.header.overview')}</div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-indigo-500/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider font-bold shadow-lg shadow-indigo-500/20">{displayCountry} {displayCity}</span>
                                    <div className="px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-[10px] font-black whitespace-nowrap shadow-sm flex items-center gap-1.5">
                                        <span className="text-indigo-300">DAY {getDaysArray(trip.startDate, trip.endDate).findIndex(d => d === currentDisplayDate) + 1 || '-'}</span>
                                        <span className="opacity-30">/</span>
                                        <span className="text-white/90">{getDaysArray(trip.startDate, trip.endDate).length} {t('trip.header.days_label')}</span>
                                    </div>
                                    {trip.isPublic && <span className="bg-emerald-500/80 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20"><Globe2 className="w-3 h-3" /> {t('trip.header.public')}</span>}
                                    {timeDiff !== 0 && <span className={`text-[10px] px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md ${timeDiff > 0 ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'}`}>{timeDiff > 0 ? `+${timeDiff}h` : `${timeDiff}h`}</span>}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 drop-shadow-xl animate-fade-in-up">
                                        {trip.name}
                                    </h1>

                                    {/* Unified Premium Action Bar */}
                                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/10 shadow-2xl self-start sm:ml-4 group/toolbar transition-all hover:bg-black/40">
                                        {/* History Actions */}
                                        <div className="flex items-center gap-1 px-1 border-r border-white/10 pr-2">
                                            <button
                                                onClick={handleUndo}
                                                disabled={!canUndo}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${canUndo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                                title={t('trip.actions.undo')}
                                            >
                                                <Undo className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleRedo}
                                                disabled={!canRedo}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${canRedo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                                title={t('trip.actions.redo')}
                                            >
                                                <Redo className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Edit/Settings */}
                                        {isOwner && (
                                            <button
                                                onClick={() => setIsTripSettingsOpen(true)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-indigo-300 active:scale-90"
                                                title={t('trip.actions.edit_settings')}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Chat Toggle */}
                                        {!isChatOpen && (
                                            <button
                                                onClick={onOpenChat}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-indigo-500/80 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                                                title={t('trip.actions.open_chat')}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 🚀 Dynamic Header Location & Metadata (Moved Back Inside) */}
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-sm opacity-90 font-medium">
                                            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-sm">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-300" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                            </span>
                                            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md"><Clock className="w-3.5 h-3.5 text-purple-300" /> {getDaysArray(trip.startDate, trip.endDate).length} {t('trip.header.days_trip')}</span>
                                            {/* Dynamic Multi-City Badge - Shows Route A→B→C or A→B→A */}
                                            {(() => {
                                                // Helper: Extract clean city name (handles "Osaka -> Kyoto" format)
                                                const extractCityName = (city) => {
                                                    if (!city) return null;
                                                    if (city.includes('->')) return city.split('->').pop().trim();
                                                    if (city.includes(' → ')) return city.split(' → ').pop().trim();
                                                    return city.trim();
                                                };

                                                // Compute city route (preserving transitions, not unique)
                                                const cityRoute = [];
                                                const normalizedRoute = []; // Track normalized names for comparison

                                                if (trip.locations) {
                                                    const sortedDates = Object.keys(trip.locations).sort();
                                                    sortedDates.forEach(date => {
                                                        const rawCity = trip.locations[date]?.city;
                                                        if (!rawCity) return;

                                                        // Extract clean city name (handle "Osaka -> Kyoto" format)
                                                        const cleanCity = extractCityName(rawCity);
                                                        // Normalize: Convert to localized name for comparison
                                                        const normalizedCity = getLocalizedCityName(cleanCity, currentLang);

                                                        // Only add if different from last normalized city
                                                        if (normalizedRoute.length === 0 || normalizedRoute[normalizedRoute.length - 1] !== normalizedCity) {
                                                            cityRoute.push(normalizedCity);
                                                            normalizedRoute.push(normalizedCity);
                                                        }
                                                    });
                                                }

                                                // Fallback to single city
                                                if (cityRoute.length === 0 && trip.city) {
                                                    cityRoute.push(getLocalizedCityName(extractCityName(trip.city), currentLang));
                                                }

                                                const isMultiCity = cityRoute.length > 1;
                                                const routeText = cityRoute.join(' → ');

                                                return (
                                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md font-bold text-white shadow-sm ring-1 ring-white/5 tracking-tight text-[11px] ${isMultiCity ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/10 border-white/10'}`}>
                                                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isMultiCity ? 'text-amber-300' : 'text-emerald-300'}`} />
                                                        <span className={isMultiCity ? 'text-amber-200' : ''}>{routeText}</span>
                                                    </span>
                                                );
                                            })()}

                                            {/* Member Row (z-[60] to appear above action buttons z-40) */}
                                            <div className="flex items-center gap-3 pl-3 border-l border-white/20 ml-2 relative z-[60]">
                                                <div className="flex -space-x-3 flex-nowrap relative">
                                                    {trip.members?.slice(0, 4).map(m => (
                                                        <div key={m.id} onClick={() => setViewingMember(m)} className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-50 flex-shrink-0" title={`${m.name} (${m.role})`}>
                                                            <div className={`w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-gray-800 ${m.id === user?.uid ? 'ring-2 ring-indigo-500' : ''}`}>
                                                                <ImageWithFallback
                                                                    src={m.photoURL}
                                                                    className="w-full h-full object-cover"
                                                                    alt={m.name}
                                                                    type="avatar"
                                                                />
                                                            </div>
                                                            {m.status === 'pending' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-900"></span>}
                                                            {m.role === 'owner' && <div className="absolute -top-1 -right-1 bg-amber-500 text-[10px] w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center shadow-sm">👑</div>}
                                                        </div>
                                                    ))}
                                                    {(trip.members?.length || 0) > 4 && (
                                                        <div className="w-8 h-8 rounded-full bg-slate-800/90 backdrop-blur border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-indigo-300 shadow-lg flex-shrink-0">
                                                            +{trip.members.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => setIsMemberModalOpen(true)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 hover:border-white/30 shadow-lg" title={t('trip.actions.manage_members')}>
                                                    <UserPlus className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                            <ActiveUsersList tripId={trip.id} user={user} activeTab={activeTab} language={globalSettings.language} />
                                        </div>

                                        {/* Action Buttons (z-40 so member hover z-60 appears above) */}
                                        <div className="flex gap-3 items-center relative z-40">
                                            <button
                                                onClick={() => { setAIMode('daily-summary'); setIsAIModal(true); }}
                                                className="px-3 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-white/20 flex justify-center items-center gap-2 active:scale-95 whitespace-nowrap backdrop-blur-md"
                                            >
                                                <Newspaper className="w-4 h-4" /> <span className="hidden sm:inline">{t('trip.actions.jarvis_daily')}</span>
                                            </button>
                                            <button
                                                onClick={onOpenSmartImport}
                                                className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-white/20 flex justify-center items-center gap-2 active:scale-95 whitespace-nowrap backdrop-blur-md"
                                            >
                                                <Upload className="w-4 h-4" /> <span className="hidden sm:inline">{t('trip.actions.smart_import')}</span>
                                            </button>
                                            <button
                                                onClick={() => setIsSmartExportOpen(true)}
                                                className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-white/20 flex justify-center items-center gap-2 active:scale-95 whitespace-nowrap backdrop-blur-md"
                                            >
                                                <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">{t('trip.actions.share')}</span>
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={() => { setIsPlanMenuOpen(!isPlanMenuOpen); setIsManageMenuOpen(false); }}
                                                    className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex justify-center items-center gap-2 font-bold text-xs transition-all shadow-lg shadow-indigo-900/40 active:scale-95 whitespace-nowrap border border-indigo-400/30 backdrop-blur-md"
                                                >
                                                    <Plus className="w-4 h-4" /> {t('trip.actions.plan_trip')} <ChevronDown className={`w-3.5 h-3.5 text-indigo-200 transition-transform ${isPlanMenuOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isPlanMenuOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsPlanMenuOpen(false)}></div>
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-top-right animate-scale-in p-1">
                                                            <button onClick={() => { setAddType('spot'); setIsAddModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                <Edit3 className="w-3.5 h-3.5 text-blue-400" /> {t('trip.actions.manual_add')}
                                                            </button>
                                                            <button onClick={() => { setAIMode('full'); setIsAIModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> {t('trip.actions.jarvis_suggest')}
                                                            </button>
                                                            <button onClick={() => { onOptimize(); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('trip.actions.jarvis_optimize')}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <button
                                                    onClick={() => { setIsManageMenuOpen(!isManageMenuOpen); setIsPlanMenuOpen(false); }}
                                                    className={`bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border border-white/10 ${isManageMenuOpen ? 'bg-white/20' : ''}`}
                                                >
                                                    <ListIcon className="w-5 h-5 text-white" />
                                                </button>
                                                {isManageMenuOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsManageMenuOpen(false)}></div>
                                                        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-top-right animate-scale-in">
                                                            {isOwner && (
                                                                <>
                                                                    <button onClick={() => { setIsMemberModalOpen(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                                        <Users className="w-4 h-4 text-blue-400" /> {t('trip.actions.manage_members')}
                                                                    </button>
                                                                    <button onClick={() => { setIsInviteModal(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                                        <UserPlus className="w-4 h-4 text-green-400" /> {t('trip.actions.invite_friends')}
                                                                    </button>
                                                                    <button onClick={() => { onDeleteTrip(); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                                                                        <Trash2 className="w-4 h-4" /> {t('trip.actions.delete_trip')}
                                                                    </button>
                                                                </>
                                                            )}
                                                            {!isOwner && <div className="px-4 py-3 text-xs opacity-50 text-center text-gray-400">{t('trip.actions.owner_only')}</div>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TripHeader;
