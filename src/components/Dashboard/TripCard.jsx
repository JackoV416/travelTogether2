import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Users, Layers, ChevronRight, Bookmark } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName, formatDate, getSmartTips, getTripSeasonDisplay } from '../../utils/tripUtils';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE } from '../../constants/appData';
import { AuroraCard } from '../Shared/AuroraComponents';

const TripCard = ({ trip, currentLang, onSelect, setGlobalBg, cardWeather, isDarkMode }) => {
    const { t } = useTranslation();

    const cities = (trip.cities && trip.cities.length > 0) ? trip.cities : (trip.city ? [trip.city] : []);
    const displayCity = cities.slice(0, 2).map(c => getLocalizedCityName(c, currentLang)).join(currentLang === 'en' ? ', ' : '、') + (cities.length > 2 ? '...' : '');
    const countryList = (trip.countries || [trip.country]).slice(0, 2).map(c => getLocalizedCountryName(c, currentLang)).join(currentLang === 'en' ? ', ' : '、');

    // Cover image: trip-specific → country default → fallback
    const coverImg = trip.coverImage || trip.image || COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE;

    // Countdown
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(trip.startDate);
    const end = trip.endDate ? new Date(trip.endDate) : null;
    const daysUntil = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

    let statusLabel, badgeClass;
    if (end && end < today) {
        statusLabel = t('trip.status.ended');
        badgeClass = 'bg-gray-800/70 text-gray-300 border-gray-600/50';
    } else if (daysUntil > 0) {
        statusLabel = currentLang === 'en'
            ? `${daysUntil}d ${t('trip.status.countdown')}`
            : `${t('trip.status.countdown')} ${daysUntil} ${t('trip.header.days_label')}`;
        badgeClass = 'bg-rose-500/30 text-rose-300 border-rose-500/30';
    } else {
        statusLabel = t('trip.status.ongoing');
        badgeClass = 'bg-emerald-500/30 text-emerald-300 border-emerald-500/30';
    }

    // Season badge
    const season = getTripSeasonDisplay(trip.startDate, currentLang);

    // Stats
    const memberCount = trip.members?.length || 1;
    const itemCount = Object.values(trip.itinerary || {}).flat().length || 0;

    // Checklist (smart tips)
    const checklist = getSmartTips(trip, t);
    const allChecked = checklist.length === 0;

    const dateRange = `${formatDate(trip.startDate)} → ${formatDate(trip.endDate)}`;
    const tripName = (currentLang.includes('zh') && trip.name_zh) ? trip.name_zh : trip.name;

    return (
        <AuroraCard
            onClick={() => { setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE); onSelect(trip); }}
            className="break-inside-avoid overflow-hidden cursor-pointer group relative shadow-2xl hover:scale-[1.02] transition-all duration-500 border-none rounded-[1.75rem]"
            noPadding={true}
        >
            {/* Card Media — aspect-[4/5] like ExploreGrid */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={coverImg}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_BG_IMAGE; }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                {/* Aurora hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Badges Row */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                    <div className="flex flex-wrap gap-1.5 max-w-[75%]">
                        {/* City badge */}
                        {displayCity && (
                            <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xl text-white text-[11px] font-bold tracking-normal border border-white/10 shadow-lg leading-snug flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {displayCity}
                            </span>
                        )}
                        {/* Season badge */}
                        {season && (
                            <span className={`px-2.5 py-1 rounded-lg backdrop-blur-xl text-white text-[11px] font-bold tracking-normal border border-white/10 shadow-lg leading-snug ${season.bg}`}>
                                {season.text}
                            </span>
                        )}
                    </div>

                    {/* Status badge top-right */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow-lg ${badgeClass}`}>
                        {statusLabel}
                    </span>
                </div>

                {/* Prep Checklist Indicator (top-right bottom area) */}
                {!allChecked && (
                    <div className="absolute top-16 right-4 z-20">
                        <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl px-2 py-1 flex items-center gap-1">
                            <span className="text-[9px] font-bold text-amber-300">
                                {checklist.length} {t('trip.status.tips') || 'tips'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                    {/* Trip Name */}
                    <h3 className="text-white font-black text-lg leading-tight mb-1 line-clamp-2">
                        {tripName}
                    </h3>

                    {/* Location */}
                    <p className="text-white/70 text-xs font-semibold mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {displayCity}{countryList ? `, ${countryList}` : ''}
                    </p>

                    {/* Date Row */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-white/10">
                            <Calendar className="w-3 h-3 text-indigo-300" />
                            <span className="text-[10px] font-bold text-white/90">{dateRange}</span>
                        </div>
                        {/* Weather temp if available */}
                        {cardWeather?.temp && (
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-lg px-2 py-1.5 border border-white/10">
                                <span className="text-[10px] font-bold text-amber-300">{cardWeather.temp.split('/')[0]?.trim()}</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                                <Users className="w-3 h-3" />
                                {memberCount}
                            </span>
                            <span className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                                <Layers className="w-3 h-3" />
                                {itemCount}
                            </span>
                            {allChecked && (
                                <span className="text-emerald-400 text-[10px] font-bold">✓ {t('trip.status.ready') || '準備就緒'}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-white/40 group-hover:text-indigo-300 transition-colors text-[10px] font-bold">
                            {t('trip.footer.view_details') || '查看詳情'}
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </AuroraCard>
    );
};

export default TripCard;
