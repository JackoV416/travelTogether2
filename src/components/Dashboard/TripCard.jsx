import React from 'react';
import { MapPin as MapIcon, Calendar, Shirt, Sun, Moon, CheckCircle2, Cloud, FileText } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName, formatDate, getTripSummary, glassCard } from '../../utils/tripUtils';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE } from '../../constants/appData';

const TripCard = ({ trip, isDarkMode, currentLang, onSelect, setGlobalBg, cardWeather }) => {
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);
    const countryList = (trip.countries || [trip.country]).slice(0, 3).map(c => getLocalizedCountryName(c, currentLang)).join(', ');

    // Countdown Calculation
    const start = new Date(trip.startDate);
    const now = new Date();
    const diffTime = start - now;
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let countdownLabel = "";
    let badgeClass = "";

    if (trip.endDate && new Date(trip.endDate) < now) {
        countdownLabel = "已結束";
        badgeClass = "bg-gray-700/50 text-gray-400 border-gray-600";
    } else if (daysUntil > 0) {
        countdownLabel = `倒數 ${daysUntil} 天`;
        badgeClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";
    } else {
        countdownLabel = "進行中";
        badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }

    // Calculate Status (Legacy but kept for label logic if needed, though replaced by countdown mostly)
    let statusLabel = countdownLabel; // Use countdown/status label

    // Stats
    const memberCount = trip.members?.length || 1;
    const itemCount = Object.values(trip.itinerary || {}).flat().length || 0;

    // V1.1 Phase 3: Smart Reminders (Static for now)
    const checklist = [
        { id: 'visa', label: '檢查簽證', done: false },
        { id: 'insurance', label: '購買保險', done: false },
        { id: 'packing', label: '收拾行李', done: false },
    ];
    const nextReminder = checklist.find(i => !i.done) || { label: '準備就緒', done: true };
    const remainingReminders = checklist.filter(i => !i.done).length - 1;
    const allChecked = checklist.every(i => i.done);

    const dateRange = `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`;

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

                {/* Header: Tag & Reminders & Date */}
                <div className="flex justify-between items-start mb-auto relative z-10 w-full">
                    {/* Left: Status Tag */}
                    <div className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm backdrop-blur-md">
                        {statusLabel}
                    </div>

                    {/* Right: Reminders & Date Stack */}
                    <div className="flex flex-col items-end gap-1.5">
                        {/* Prep Reminders */}
                        <div className="flex items-center gap-1">
                            <div className="bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1.5 border border-white/10 shadow-sm transition-all hover:bg-black/60 cursor-pointer group/check">
                                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${allChecked ? 'bg-emerald-500 border-emerald-500' : 'border-white/40 group-hover/check:border-emerald-400'}`}>
                                    {allChecked && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                </span>
                                <span className={`text-[10px] font-bold ${allChecked ? 'text-emerald-400 decoration-emerald-500/50' : 'text-white'}`}>
                                    {nextReminder.label}
                                </span>
                            </div>
                            {remainingReminders > 0 && (
                                <div className="bg-black/40 backdrop-blur-md rounded-full w-6 h-6 flex items-center justify-center border border-white/10 text-[10px] font-bold shadow-sm">
                                    +{remainingReminders}
                                </div>
                            )}
                        </div>

                        {/* Moved Date Badge */}
                        <div className="bg-black/40 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 border border-white/10 shadow-sm">
                            <Calendar className="w-3 h-3 text-indigo-300" />
                            <span className="text-[10px] font-bold text-white/90">{dateRange}</span>
                        </div>
                    </div>
                </div>
                {/* Footer: Details */}
                <div>
                    <h3 className="text-2xl font-bold leading-tight mb-1 shadow-sm">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-80 mb-2">
                        <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {displayCity}, {countryList}</span>
                    </div>

                    {/* Clothing Row Only (Date Moved Up) */}
                    <div className="flex flex-col gap-2 mb-2">

                        {/* Weather & Clothing (Horizontal Split) */}
                        {cardWeather.clothes && (cardWeather.clothes.includes('|') || cardWeather.clothes.includes('/')) ? (
                            <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col mt-2">
                                {/* Top Row: Temp & Weather */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                                    <div className="flex items-center gap-2 w-1/2 justify-center border-r border-white/10 pr-2">
                                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-sm font-bold">{cardWeather.temp.split('/')[0].trim()}</span>
                                        <span className="opacity-50 text-[10px] scale-90">{cardWeather.icon}</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-1/2 justify-center pl-2">
                                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-sm font-bold">{cardWeather.temp.split('/')[1].trim()}</span>
                                        <span className="opacity-50 text-[10px] scale-90">{cardWeather.icon}</span>
                                    </div>
                                </div>

                                {/* Bottom Row: Clothing */}
                                <div className="flex items-center justify-between px-3 py-1.5 bg-black/20">
                                    <div className="flex items-center gap-1.5 w-1/2 justify-center border-r border-white/10 pr-2 overflow-hidden">
                                        <Shirt className="w-3 h-3 text-amber-200/50 flex-shrink-0" />
                                        <span className="text-[9px] text-amber-100/80 truncate">
                                            {cardWeather.dayClothes || cardWeather.clothes.split(/[|/]/)[0].replace('日：', '').trim()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 w-1/2 justify-center pl-2 overflow-hidden">
                                        <Shirt className="w-3 h-3 text-indigo-200/50 flex-shrink-0" />
                                        <span className="text-[9px] text-indigo-100/80 truncate">
                                            {cardWeather.nightClothes || cardWeather.clothes.split(/[|/]/)[1].replace('夜：', '').trim()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/10 rounded-lg px-2 py-1.5 backdrop-blur-sm flex items-center gap-2 text-xs opacity-90 border border-white/5">
                                <Shirt className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
                                <span className="truncate">{cardWeather.clothes}</span>
                            </div>
                        )}
                    </div>

                    {/* Review / Stats Row */}
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
