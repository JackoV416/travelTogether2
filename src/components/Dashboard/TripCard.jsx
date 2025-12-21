
import React from 'react';
import { MapPin as MapIcon, Calendar, Shirt } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName, formatDate, getTripSummary, glassCard } from '../../utils/tripUtils';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE } from '../../constants/appData';

const TripCard = ({ trip, isDarkMode, currentLang, onSelect, setGlobalBg, cardWeather }) => {
    const countryList = (trip.countries || [trip.country]).slice(0, 3).map(c => getLocalizedCountryName(c, currentLang)).join(', ');
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);

    // Calculate Status
    const today = new Date().toISOString().split('T')[0];
    let status = 'upcoming';
    let statusLabel = '即將開始';
    let statusColor = 'bg-blue-500';

    if (trip.endDate && trip.endDate < today) {
        status = 'completed';
        statusLabel = '已結束';
        statusColor = 'bg-gray-500';
    } else if (trip.startDate && trip.startDate <= today) {
        status = 'active';
        statusLabel = '進行中';
        statusColor = 'bg-emerald-500 animate-pulse';
    }

    // Stats
    const memberCount = trip.members?.length || 1;
    const itemCount = Object.values(trip.itinerary || {}).flat().length || 0;

    return (
        <div
            onClick={() => { setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE); onSelect(trip); }}
            className={`${glassCard(isDarkMode)} h-64 relative overflow-hidden group cursor-pointer hover:scale-[1.02] flex flex-col justify-end transition-all duration-500`}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE})` }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

            <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">

                {/* Header: Status & Weather */}
                <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor} text-white shadow-lg`}>
                        {statusLabel}
                    </span>

                    <div className="bg-black/40 backdrop-blur-md rounded-lg px-2 py-1 text-right text-xs border border-white/10">
                        <div className="font-bold flex items-center justify-end gap-1">
                            {cardWeather.icon} {cardWeather.temp}
                        </div>
                    </div>
                </div>

                {/* Footer: Details */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold leading-tight mb-1 shadow-sm">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-80 mb-3">
                        <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {displayCity}</span>
                        <span>•</span>
                        <span>{countryList}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs opacity-90 mb-3">
                        <div className="bg-white/10 rounded px-2 py-1.5 backdrop-blur-sm flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                            <span>{formatDate(trip.startDate)}</span>
                        </div>
                        <div className="bg-white/10 rounded px-2 py-1.5 backdrop-blur-sm flex items-center gap-2">
                            <Shirt className="w-3.5 h-3.5 text-pink-300" />
                            <span>{cardWeather.clothes}</span>
                        </div>
                    </div>

                    {/* Review / Stats Row - Only visible on hover or large screens? Keeping visible for richness */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 opacity-60 group-hover:opacity-100 transition-opacity text-[10px] font-mono">
                        <div className="flex gap-3">
                            <span>👥 {memberCount} 人</span>
                            <span>📍 {itemCount} 行程</span>
                        </div>
                        <div className="group-hover:text-indigo-300 transition-colors">
                            查看詳情 →
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
