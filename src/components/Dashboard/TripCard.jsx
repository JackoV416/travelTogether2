
import React from 'react';
import { MapPin as MapIcon, Calendar, Shirt } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName, formatDate, getTripSummary, glassCard } from '../../utils/tripUtils';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE } from '../../constants/appData';

const TripCard = ({ trip, isDarkMode, currentLang, onSelect, setGlobalBg, cardWeather }) => {
    const countryList = (trip.countries || [trip.country]).slice(0, 3).map(c => getLocalizedCountryName(c, currentLang)).join(', ');
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);

    return (
        <div
            onClick={() => { setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE); onSelect(trip); }}
            className={`${glassCard(isDarkMode)} h-60 relative overflow-hidden group cursor-pointer hover:scale-[1.02]`}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE})` }}
            ></div>
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="text-xl font-bold">{trip.name}</h3>
                        <div className="text-[11px] uppercase tracking-wide opacity-70 mt-1">
                            {countryList}
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg px-2 py-1 text-right text-xs">
                        <div className="font-bold">{cardWeather.temp}</div>
                        <div className="opacity-80 flex items-center gap-1">
                            {cardWeather.icon} {cardWeather.desc}
                        </div>
                        {cardWeather.outfitIcon && <img src={cardWeather.outfitIcon} alt="outfit" className="w-6 h-6 mx-auto mt-1" />}
                    </div>
                </div>
                <div>
                    <div className="text-xs opacity-90 mt-1 bg-black/30 inline-block px-2 py-1 rounded backdrop-blur-sm">{getTripSummary(trip)}</div>
                    <div className="text-xs mt-2 opacity-80 flex gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {displayCity}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(trip.startDate)}</span>
                        <span className="flex items-center gap-1"><Shirt className="w-3 h-3" /> {cardWeather.clothes}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
