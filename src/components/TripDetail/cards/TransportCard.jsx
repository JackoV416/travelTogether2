import React from 'react';
import { Plane, Train, Bus, Car, Ship, CheckCircle2, Clock, Footprints, MapPin, ArrowRight, Pencil, Ticket, Undo2, Stamp, DollarSign, Navigation, Sparkles } from 'lucide-react';
import { formatDuration, getSmartItemImage, getGoogleMapsDirectionsUrl, getTransportAdvice, getNearbyAttractionHint } from '../../../utils/tripUtils';
import { useTranslation } from 'react-i18next';

// Mini-map for airport codes (Could be moved to appData)
const AIRPORT_NAMES = {
    "HKG": { en: "Hong Kong Intl", zh: "香港國際機場" },
    "NRT": { en: "Narita Intl", zh: "成田國際機場" },
    "HND": { en: "Haneda Intl", zh: "羽田機場" },
    "KIX": { en: "Kansai Intl", zh: "關西國際機場" },
    "TPE": { en: "Taoyuan Intl", zh: "桃園機場" },
    "LHR": { en: "Heathrow", zh: "希斯洛機場" }
};

const TransportCard = ({ item, isDarkMode, dayHotel, onEdit, language = 'zh-TW' }) => {
    const { t } = useTranslation();
    // 1. Color & Icon Logic
    const getTheme = () => {
        const type = (item.details?.transportType || item.type).toLowerCase();
        const name = (item.name || "").toLowerCase();

        if (type === 'flight' || name.includes('flight') || name.includes('航空')) {
            return {
                bg: isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-50/80',
                border: 'border-indigo-500/20',
                accent: 'text-indigo-500',
                iconBg: 'bg-indigo-500',
                label: 'Flight',
                // Dynamic Rotation: Check if it's a Return flight (回程/歸航) -> -135deg (Leftward/Home), else 45deg (Top-Right/Departure)
                icon: <Plane className={`w-4 h-4 text-white ${name.includes('return') || name.includes('回程') || name.includes('歸航') ? '-rotate-[135deg]' : 'rotate-45'}`} />
            };
        }
        if (type === 'walk' || name.includes('walk') || name.includes('步')) {
            return {
                bg: isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50/80',
                border: 'border-purple-500/20',
                accent: 'text-purple-500',
                iconBg: 'bg-purple-500',
                label: 'Walking',
                icon: <Footprints className="w-4 h-4 text-white" />
            };
        }
        if (type === 'metro' || type === 'subway' || name.includes('metro') || name.includes('subway') || name.includes('地鐵') || name.includes('捷運') || name.includes('都營') || name.includes('MTR')) {
            return {
                bg: isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50/80',
                border: 'border-purple-500/20',
                accent: 'text-purple-500',
                iconBg: 'bg-purple-500',
                label: 'Metro',
                icon: <Train className="w-4 h-4 text-white" />
            };
        }
        if (type === 'train' || type === 'shinkansen' || name.includes('jr') || name.includes('鐵') || name.includes('rail') || name.includes('express')) {
            return {
                bg: isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50/80',
                border: 'border-purple-500/20',
                accent: 'text-purple-500',
                iconBg: 'bg-purple-500',
                label: 'Rail',
                icon: <Train className="w-4 h-4 text-white" />
            };
        }
        if (type === 'immigration' || name.includes('入境') || name.includes('海關') || name.includes('immigration') || name.includes('customs')) {
            return {
                bg: isDarkMode ? 'bg-amber-900/40' : 'bg-amber-50/80',
                border: 'border-amber-500/20',
                accent: 'text-amber-500',
                iconBg: 'bg-amber-500',
                label: 'Immigration',
                icon: <Stamp className="w-4 h-4 text-white" />
            };
        }
        return {
            bg: isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50/80',
            border: 'border-purple-500/20',
            accent: 'text-purple-500',
            iconBg: 'bg-purple-500',
            label: 'Transport',
            icon: <Car className="w-4 h-4 text-white" />
        };
    };

    const theme = getTheme();
    const bgImage = getSmartItemImage(item);

    // 2. Time Logic
    const getEndTime = () => {
        // V1.4.0: Prioritize arrivalTime from data (timezone-corrected)
        if (item.details?.arrivalTime) return item.details.arrivalTime;
        if (item.endTime) return item.endTime;
        if (item.details?.endTime) return item.details.endTime;

        // Parse duration (handle both number and string like "2h 30m")
        const rawDuration = item.duration || item.details?.duration;
        let durationMins = 0;

        if (typeof rawDuration === 'number') {
            durationMins = rawDuration;
        } else if (typeof rawDuration === 'string') {
            const hMatch = rawDuration.match(/(\d+)h/);
            const mMatch = rawDuration.match(/(\d+)m/);
            const h = hMatch ? parseInt(hMatch[1], 10) : 0;
            const m = mMatch ? parseInt(mMatch[1], 10) : 0;
            // Fallback for simple "90" string
            if (!h && !m && !isNaN(parseInt(rawDuration))) {
                durationMins = parseInt(rawDuration, 10);
            } else {
                durationMins = h * 60 + m;
            }
        }

        if (!item.time || !durationMins) return null;

        const [h, m] = item.time.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + durationMins);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    const endTime = getEndTime();

    const isZh = language.includes('zh');

    // V1.4.0: Day Diff Badges
    const dayOffset = item.details?.arrivalDayOffset || 0;
    const dayBadge = dayOffset > 0 ? (isZh ? ` (+${dayOffset})` : ` (+${dayOffset})`) : '';
    const endTimeDisplay = endTime ? `${endTime}${dayBadge}` : null;

    // 3. Journey Details
    const getJourneyData = () => {
        let fromCode = null;
        let toCode = null;

        // V1.4.3: ALWAYS prioritize details.from/to first for ALL transport types
        // This is more reliable than name parsing and mock data is now consistent
        fromCode = item.details?.from || item.details?.fromCode;
        toCode = item.details?.to || item.details?.toCode;

        // Only if BOTH are still missing, try name parsing as fallback
        if (!fromCode && !toCode) {
            const name = (item.name || "").toUpperCase();
            const locString = (item.details?.location || "").toUpperCase();

            // Try 3-letter airport code patterns
            const codesInName = name.match(/\b[A-Z]{3}\b/g);
            const codesInLoc = locString.match(/\b[A-Z]{3}\b/g);

            if (codesInLoc && codesInLoc.length >= 2) {
                fromCode = codesInLoc[0];
                toCode = codesInLoc[1];
            } else if (codesInName && codesInName.length >= 2) {
                fromCode = codesInName[0];
                toCode = codesInName[1];
            }
        }

        // Final Fallbacks
        return {
            fromCode: fromCode || (isZh ? "起點" : "Origin"),
            toCode: toCode || (item.details?.arrival) || (isZh ? "終點" : "Dest")
        };
    };
    const journey = getJourneyData();

    // Localization Helper for details properties
    const getDetail = (key) => {
        if (language === 'zh-TW' || language === 'zh-HK' || language.includes('zh')) {
            return item.details?.[`${key}_zh`] || item.details?.[key];
        }
        return item.details?.[key];
    };


    return (
        <div className={`relative w-full rounded-2xl overflow-hidden border ${theme.border} ${theme.bg} backdrop-blur-md transition-all duration-300 hover:shadow-xl group flex flex-col md:flex-row h-auto md:min-h-[200px]`}>

            {/* Left Section: Image (Top on Mobile, Left on Desktop) */}
            <div className="relative w-full h-32 md:w-1/3 md:h-full overflow-hidden shrink-0">
                <img
                    src={bgImage}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"; // Fallback generic transport
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 to-transparent" />
                <div className={`absolute top-2 left-2 p-1.5 rounded-lg ${theme.iconBg} shadow-lg z-10`}>
                    {theme.icon}
                </div>
            </div>

            {/* Ticket Notches (Hidden on Mobile) */}
            <div className="hidden md:flex absolute left-[33.33%] top-0 bottom-0 flex-col justify-between py-2 -translate-x-1/2 z-20">
                <div className={`w-4 h-4 rounded-full -mt-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${theme.border}`} />
                <div className="flex-1 border-r border-dashed border-gray-400/30 mx-[7px] my-1" />
                <div className={`w-4 h-4 rounded-full -mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t ${theme.border}`} />
            </div>

            {/* Right Section: Content */}
            <div className="flex-1 p-3 md:p-5 flex flex-col min-w-0">
                <div className="space-y-1">
                    {/* Line 1: Localized Name / Airline */}
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`text-sm font-black truncate leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {getDetail('name') || item.name}
                        </h3>
                        {item.cost > 0 && (
                            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-500 shrink-0">
                                <DollarSign className="w-3 h-3" />
                                {item.cost}
                            </div>
                        )}
                    </div>

                    {/* Line 2: Route / Flight No / Subtitle */}
                    <div className="text-[10px] opacity-40 font-bold truncate italic leading-none">
                        {getDetail('flightNo') || getDetail('trainNo') || getDetail('nameEn') || getDetail('route') || getDetail('desc') || (isZh ? "當地交通" : "Local Journey")}
                    </div>

                    {/* Line 3: Journey Flow (Visual Row) - Hide for customs/static items */}
                    {(item.type === 'flight' || item.type === 'transport' || item.type === 'train' || item.type === 'walk') && (
                        <div className="flex items-center gap-2 py-2">
                            {/* Origin */}
                            <div className="flex flex-col min-w-[60px]">
                                <span className={`text-sm font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {journey.fromCode === "Origin" ? (isZh ? "起點" : "Origin") : journey.fromCode}
                                </span>
                                <span className="text-[9px] opacity-50 font-bold uppercase mt-0.5">{item.time}</span>
                            </div>
                            {/* Ticket-Style Route Line */}
                            <div className="flex-1 flex items-center justify-center relative mx-2">
                                <div className="w-full border-t-2 border-dashed border-gray-400/40"></div>
                                {/* V1.4.0: Plane icon with timezone offset BELOW */}
                                <div className="absolute flex flex-col items-center gap-0.5">
                                    <div className={`px-2 py-1 rounded-full ${theme.iconBg} shadow-md`}>
                                        {React.cloneElement(theme.icon, { className: "w-3 h-3 text-white" })}
                                    </div>
                                    {/* Timezone offset below */}
                                    {item.details?.timezoneOffsetLabel && (
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${theme.iconBg} text-white/90 shadow-sm`}>{item.details.timezoneOffsetLabel}</span>
                                    )}
                                </div>
                            </div>
                            {/* Destination */}
                            <div className="flex flex-col items-end min-w-[60px]">
                                <span className={`text-sm font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {journey.toCode === "Dest" ? (isZh ? "終點" : "Dest") : journey.toCode}
                                </span>
                                <span className="text-[9px] opacity-50 font-bold uppercase mt-0.5">{endTimeDisplay || '--:--'}</span>
                            </div>
                        </div>
                    )}

                    {/* Line 4: Departure & Arrival Details (Gate, Baggage) */}
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {/* Departure Info */}
                        <div className="flex items-center gap-1.5">
                            <Ticket className="w-2.5 h-2.5 opacity-60" />
                            <span className="truncate opacity-70">{isZh ? '出發' : 'Dep'}</span>
                            <span className="truncate">{getDetail('gate') || getDetail('platform') || (Object.values(item.details || {}).find(v => typeof v === 'string' && (v.includes('Gate') || v.includes('Platform')))) || ''}</span>
                        </div>
                        {/* Arrival Info - Always show for flight, show for others if has arrival data */}
                        <div className="flex items-center gap-1.5 text-right">
                            <span className="truncate opacity-70">{isZh ? '抵達' : 'Arr'}</span>
                            <span className="truncate">
                                {getDetail('arrivalGate') || getDetail('arrivalTerminal') || (item.type === 'flight' ? journey.toCode : '')}
                                {item.details?.baggageClaim && (
                                    <span className="ml-1 text-amber-500">🧳{item.details.baggageClaim}</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Line 5: Timing Details (Matrix Style) - Theme Color Matched */}
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-tight uppercase whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} ${theme.accent}`}>
                            {item.time} — {endTimeDisplay || (isZh ? '待定' : 'TBD')}
                        </span>
                        <span className="opacity-20">/</span>
                        <span className="text-gray-400/60 font-medium">{item.details?.duration ? formatDuration(item.details.duration) : (isZh ? '無時長' : 'No Duration')}</span>
                        {/* Smart Transport Suggestion Badge */}
                        {(() => {
                            if (item.type === 'flight') return null;
                            const advice = getTransportAdvice(item, "", t);
                            if (!advice) return null;
                            return (
                                <span className={`flex items-center gap-1 ml-1 border-l border-white/10 pl-2 px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Navigation className="w-2.5 h-2.5" />
                                    {advice.label}
                                </span>
                            );
                        })()}

                        {/* V1.3.8: Nearby Attraction Hint */}
                        {(() => {
                            const hint = getNearbyAttractionHint(journey.toCode, t);
                            if (!hint) return null;
                            return (
                                <span className={`flex items-center gap-1 ml-1 border-l border-white/10 pl-2 px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {hint}
                                </span>
                            );
                        })()}
                    </div>

                    {/* Line 6: Notes / Insight - Improved preview */}
                    {(item.details?.insight || item.details?.desc) && (
                        <div className={`text-[10px] opacity-70 leading-relaxed line-clamp-2 italic font-medium tracking-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(() => {
                                const text = getDetail('insight') || getDetail('desc') || '';
                                // Extract first meaningful section, clean up brackets
                                const cleaned = text.replace(/【/g, '').replace(/】/g, ': ').replace(/\s+/g, ' ').trim();
                                return cleaned.length > 100 ? cleaned.substring(0, 100) + '...' : cleaned;
                            })()}
                        </div>
                    )}

                </div>

                {/* Line 7: Tags - MOVED OUTSIDE space-y-1 to correctly respect mt-auto */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 overflow-hidden">
                    {(() => {
                        const tags = isZh ? (item.details?.tags_zh || item.details?.tags) : item.details?.tags;
                        const displayTags = (tags?.length > 0 ? tags : [theme.label]);
                        return displayTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${theme.accent} ${theme.bg} border ${theme.border}`}>
                                #{tag}
                            </span>
                        ));
                    })()}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const { fromCode, toCode } = journey;
                            const url = getGoogleMapsDirectionsUrl(fromCode, toCode, item.type === 'walk' ? 'walk' : 'transit');
                            if (url) window.open(url, '_blank');
                        }}
                        className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-500/40 hover:bg-emerald-700 transition-colors"
                        title={t('itinerary.actions.check_route')}
                    >
                        <Navigation className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item); }}
                        className="p-2 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-700 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Decorative Background Icon - Adjusted to avoid text cut-off */}
            <div className={`absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none select-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {React.cloneElement(theme.icon, {
                    className: `w-24 h-24 ${theme.icon.props.className.includes('rotate') ? theme.icon.props.className.match(/-?rotate-\[\d+deg\]|-?rotate-\d+/)?.[0] || '' : ''}`
                })}
            </div>

            {/* Selection Overlay */}
            <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/10 pointer-events-none rounded-2xl transition-colors" />
        </div >
    );
};

export default TransportCard;
