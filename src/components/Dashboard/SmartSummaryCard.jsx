import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight, FileText, Shield, Backpack } from 'lucide-react';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { getSmartTips } from '../../utils/tripUtils';

/**
 * SmartSummaryCard - Displays a smart summary for a trip (Mobile Optimized Glass Bar)
 * Mobile Priority: Show Reminders using minimal space.
 */
const SmartSummaryCard = ({ trip, onClick, isDarkMode }) => {
    const { t } = useTranslation();
    const today = startOfDay(new Date());
    const startDate = trip.startDate ? parseISO(trip.startDate) : null;
    const daysLeft = startDate ? differenceInDays(startDate, today) : null;

    // Determine status & Countdown Label
    let countdownLabel = "";
    let badgeClass = "";

    // Status Logic
    if (!startDate) {
        countdownLabel = t('trip.status.pending') || "未定";
        badgeClass = "text-gray-400";
    } else if (daysLeft < 0) {
        countdownLabel = t('trip.status.ended');
        badgeClass = "text-gray-400";
    } else if (daysLeft === 0) {
        countdownLabel = t('trip.status.today') || "今天!";
        badgeClass = "text-rose-400 font-bold animate-pulse";
    } else if (daysLeft <= 7) {
        countdownLabel = t('trip.status.days_to_go_fmt', { days: daysLeft });
        badgeClass = "text-rose-400 font-bold";
    } else {
        countdownLabel = t('trip.status.upcoming_fmt', { days: daysLeft });
        badgeClass = "text-indigo-400";
    }

    // Dynamic Smart Tips
    const reminders = getSmartTips(trip, t);

    // Mobile Strategy: Show max 2 reminders with Icon Only if space is tight, or Icon + Text if fits.
    // We will use Icon + Text but allow scrolling or wrapping? 
    // User wants "Minimal Space".
    const MAX_VISIBLE = 3;
    const itemsToShow = reminders.length > MAX_VISIBLE ? reminders.slice(0, MAX_VISIBLE - 1) : reminders.slice(0, MAX_VISIBLE);
    const overflowCount = reminders.length > MAX_VISIBLE ? reminders.length - (MAX_VISIBLE - 1) : 0;

    const location = trip.country || (trip.countries && trip.countries[0]) || 'Unknown';
    const city = trip.city || (trip.cities && trip.cities[0]) || '';
    const locationStr = city ? `${location} (${city})` : location;

    return (
        <div
            onClick={onClick}
            className="group relative w-full rounded-2xl p-3 sm:p-4 bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 shadow-xl dark:shadow-2xl cursor-pointer hover:bg-white/80 dark:hover:bg-black/70 hover:border-indigo-500/30 dark:hover:border-white/10 transition-all duration-300 overflow-hidden"
        >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Layout Wrapper: Flex Col on Mobile, Row on Desktop */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

                {/* 1. Top/Left: Name & Location & Date */}
                <div className="flex items-start sm:items-center justify-between sm:justify-start w-full sm:w-auto gap-2 sm:gap-4 min-w-0">
                    {/* Trip Name & Date */}
                    <div className="min-w-0 flex-1 sm:flex-initial sm:max-w-[200px]">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight mb-0.5">{trip.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span>{trip.startDate}</span>
                            <span className="hidden sm:inline">- {trip.endDate}</span>
                            <span className="sm:hidden text-indigo-500 dark:text-indigo-400 font-bold ml-1">{countdownLabel}</span>
                        </div>
                    </div>

                    {/* Arrow Button (Mobile Position: Top Right) */}
                    <div className="sm:hidden w-8 h-8 rounded-full bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* 2. Bottom/Right: Reminders & Location & Desktop Countdown */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">

                    {/* Reminder Pills */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial overflow-x-auto scrollbar-hide">
                        {itemsToShow.map((item, idx) => (
                            <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/10 text-[10px] font-medium whitespace-nowrap ${item.color || 'text-slate-700 dark:text-slate-200'}`}>
                                <item.icon className="w-3 h-3" />
                                <span>{item.text}</span>
                            </div>
                        ))}
                        {overflowCount > 0 && (
                            <div className="flex items-center justify-center px-2 py-1.5 rounded-full bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                                +{overflowCount}
                            </div>
                        )}
                        {/* Fallback if no reminders: Show Location */}
                        {itemsToShow.length === 0 && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 text-[10px]">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{locationStr}</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop: Countdown & Arrow */}
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                        <div className="h-6 w-px bg-slate-500/10 dark:bg-white/10"></div>
                        <div className={`text-xs whitespace-nowrap ${badgeClass}`}>
                            {countdownLabel}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-500/5 dark:bg-white/5 border border-slate-500/5 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white transition-all duration-300 shadow-sm group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartSummaryCard;
