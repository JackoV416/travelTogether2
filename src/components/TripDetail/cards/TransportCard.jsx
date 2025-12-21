import React from 'react';
import { Plane, TrainFront, BusFront, Car, Ship, CheckCircle2, Clock, Footprints, MapPin, ArrowRight, Pencil, Ticket, Undo2 } from 'lucide-react';
import { formatDuration, getSmartItemImage } from '../../../utils/tripUtils';

// Mini-map for airport codes (Could be moved to appData)
const AIRPORT_NAMES = {
    "HKG": { en: "Hong Kong Intl", zh: "香港國際機場" },
    "NRT": { en: "Narita Intl", zh: "成田國際機場" },
    "HND": { en: "Haneda Intl", zh: "羽田機場" },
    "KIX": { en: "Kansai Intl", zh: "關西國際機場" },
    "TPE": { en: "Taoyuan Intl", zh: "桃園機場" },
    "LHR": { en: "Heathrow", zh: "希斯洛機場" }
};

const TransportCard = ({ item, isDarkMode, dayHotel, onEdit }) => {
    // 1. Color & Icon Logic (Auto-detect from Name/Type)
    const getTheme = () => {
        const type = (item.details?.transportType || item.type).toLowerCase();
        const name = (item.name || "").toLowerCase();

        let label = "Transport";
        let icon = <Car className="w-6 h-6 mb-2 opacity-90" />;
        let color = isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500';

        // Flight
        if (type === 'flight' || name.includes('flight') || name.includes('航空') || name.includes('cx') || name.includes('uo') || name.includes('jl') || name.includes('nh')) {
            return { color: isDarkMode ? 'bg-blue-600' : 'bg-blue-500', icon: <Plane className="w-6 h-6 rotate-90 mb-2 opacity-90" />, label: "Flight" };
        }

        // Walk
        if (type === 'walk' || name.includes('walk') || name.includes('步') || name.includes('散策')) {
            return { color: isDarkMode ? 'bg-orange-600' : 'bg-orange-500', icon: <Footprints className="w-6 h-6 mb-2 opacity-90" />, label: "Walking" };
        }

        // Train / Metro / Shinkansen
        if (type === 'train' || type === 'metro' || name.includes('train') || name.includes('鐵') || name.includes('jr') || name.includes('metro') || name.includes('subway') || name.includes('地下鐵') || name.includes('新幹線') || name.includes('快線') || name.includes('express')) {
            const isMetro = type === 'metro' || name.includes('metro') || name.includes('subway') || name.includes('地下鐵') || name.includes('地鐵');
            const isShinkansen = name.includes('新幹線');

            label = isShinkansen ? "Shinkansen" : (isMetro ? "Metro" : "Train");
            return { color: isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500', icon: <TrainFront className="w-6 h-6 mb-2 opacity-90" />, label };
        }

        // Bus
        if (type === 'bus' || name.includes('bus') || name.includes('巴')) {
            return { color: isDarkMode ? 'bg-teal-600' : 'bg-teal-500', icon: <BusFront className="w-6 h-6 mb-2 opacity-90" />, label: "Bus" };
        }

        // Ferry
        if (type === 'ferry' || name.includes('ship') || name.includes('boat') || name.includes('船')) {
            return { color: isDarkMode ? 'bg-cyan-600' : 'bg-cyan-500', icon: <Ship className="w-6 h-6 mb-2 opacity-90" />, label: "Ferry" };
        }

        // Taxi / Car / Other
        if (type === 'taxi' || type === 'car' || name.includes('taxi') || name.includes('的士') || name.includes('車')) {
            return { color: isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500', icon: <Car className="w-6 h-6 mb-2 opacity-90" />, label: "Taxi" };
        }

        // If generic Transport, try to detect anything else, otherwise default
        return { color, icon, label: (type && type !== 'transport' ? (type.charAt(0).toUpperCase() + type.slice(1)) : "Transport") };
    };

    const theme = getTheme();

    // 2. Time Logic with Robust Parsing
    const getEndTime = () => {
        // Priority 1: Explicit arrival time (especially for flights)
        if (item.details?.arrivalTime) return item.details.arrivalTime;

        // Priority 2: Calculate from duration
        if (!item.time || !item.details?.duration) return null;
        const [h, m] = item.time.split(':').map(Number);

        let durationMins = 0;
        const val = item.details.duration;

        if (typeof val === 'number') {
            durationMins = val;
        } else if (typeof val === 'string') {
            const hasHour = val.match(/(\d+)\s*(?:hr|hour|小时|小時|h)/i);
            const hasMin = val.match(/(\d+)\s*(?:min|minute|分|m)/i);

            if (hasHour) durationMins += parseInt(hasHour[1]) * 60;
            if (hasMin) durationMins += parseInt(hasMin[1]);

            if (!hasHour && !hasMin) {
                const digits = val.match(/\d+/);
                if (digits) durationMins = parseInt(digits[0]);
            }
        }

        if (!durationMins) return null;

        const date = new Date();
        date.setHours(h, m + durationMins);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    const endTime = getEndTime();

    // 3. Location / Labels Logic
    const getLabels = () => {
        let fromCode = "Start";
        let toCode = "End";
        let fromName = "";
        let toName = "";

        if (item.type === 'flight') {
            const airportMatch = item.name.match(/\((.*?)\s*->\s*(.*?)\)/);
            fromCode = airportMatch ? airportMatch[1] : (item.details?.fromCode || "DEP");
            toCode = airportMatch ? airportMatch[2] : (item.details?.toCode || "ARR");

            // Base Airport Names
            const fromNameBase = AIRPORT_NAMES[fromCode]?.zh || AIRPORT_NAMES[fromCode]?.en || "";
            const toNameBase = AIRPORT_NAMES[toCode]?.zh || AIRPORT_NAMES[toCode]?.en || "";

            // Build From Label: "Airport (T1 - Gate A)"
            const depInfo = [];
            if (item.details?.terminal) depInfo.push(item.details.terminal);
            if (item.details?.gate) depInfo.push(`Gate ${item.details.gate}`);

            fromName = depInfo.length > 0 ? `${fromNameBase} (${depInfo.join(" · ")})` : fromNameBase;

            // Build To Label: "Airport (T2)"
            // Assuming arrival info might be in "desc" or "arrivalTerminal" if we had it, but standard parsing usually doesn't have it.
            // We'll stick to just Name for To, unless user added specific info.
            toName = toNameBase;

        } else {
            const locString = item.details?.location || "";
            const locParts = locString.includes('->') ? locString.split('->') : [locString];

            const rawFrom = locParts[0]?.trim() || "Start";
            const fromSplit = splitName(rawFrom);

            // For Metro/Train: If code exists (e.g. E27), prioritize displaying it prominently if name is short?
            // Current splitName: "Shinjuku (E27)" -> primary="Shinjuku", secondary="E27"
            // Display: CODE (Big) = Shinjuku, Name (Small) = E27.
            // User requested: "If Metro, display station number info".
            // If primary is English name, secondary is Code.
            // Strategy: Keep BIG English Name, Small Code is fine, BUT user specifically asked for "T1 C" style or Station Number.
            // Let's ensure secondary is displayed.

            fromCode = fromSplit.primary;
            fromName = fromSplit.secondary;

            let rawTo = locParts[1]?.trim();
            if (!rawTo || rawTo === "End") {
                rawTo = item.arrival || (item.name.includes('前往') ? item.name.split('前往')[1] : "End");
            }
            if ((rawTo === "End" || rawTo === "Destination") && dayHotel) {
                rawTo = dayHotel.name.replace('Check-in', '').trim();
            }

            const toSplit = splitName(rawTo, rawTo === dayHotel?.name.replace('Check-in', '').trim());
            toCode = toSplit.primary;
            toName = toSplit.secondary;
        }

        return { fromCode, toCode, fromName, toName };
    };

    const splitName = (text, isHotel = false) => {
        if (!text) return { primary: "End", secondary: "" };
        const match = text.match(/([^(]+)\(([^)]+)\)/);

        if (match) {
            return { primary: match[1].trim(), secondary: match[2].trim() };
        }
        return { primary: text, secondary: isHotel ? "Accommodation" : "" };
    };

    const labels = getLabels();
    const bgImage = getSmartItemImage(item);

    return (
        <div className={`relative w-full rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01] ${theme.color} text-white group`}>

            {/* Background Image Overlay */}
            {bgImage && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-50 mix-blend-overlay pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" style={{ transform: 'scaleX(-1)' }} />
                    <img src={bgImage} alt="Transport View" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Edit Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item); }}
                className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit"
            >
                <Pencil className="w-4 h-4 text-white" />
            </button>


            {/* Ticket Notch Effect */}
            <div className={`absolute top-1/2 -left-3 w-6 h-6 rounded-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}></div>
            <div className={`absolute top-1/2 -right-3 w-6 h-6 rounded-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}></div>

            {/* Content Container */}
            <div className="p-5 pb-8 relative z-20">
                {/* Header: Tag & Time Range */}
                <div className="flex justify-between items-center mb-6 opacity-90">
                    <span className="bg-white/20 px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10 flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {theme.label}
                    </span>
                    <div className="flex items-center gap-2 font-mono font-bold text-xl tracking-tight shadow-sm">
                        <span>{item.details?.time || item.time}</span>
                        {endTime && (
                            <>
                                <span className="opacity-50 text-base">-</span>
                                <span>{endTime}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Journey Flow */}
                <div className="flex justify-between items-start px-1 relative">
                    {/* FROM */}
                    <div className="text-left w-[35%] z-10">
                        <div className="text-[10px] opacity-70 font-bold mb-1 tracking-wider uppercase">FROM</div>
                        <div className={`font-black tracking-tight leading-none mb-1 break-words ${labels.fromCode.length > 8 ? 'text-lg' : 'text-3xl'} drop-shadow-md`}>
                            {labels.fromCode}
                        </div>
                        {labels.fromName && <div className="text-[10px] opacity-90 truncate font-medium mt-1">{labels.fromName}</div>}
                    </div>

                    {/* CENTER ICON & DURATION */}
                    <div className="flex-1 flex flex-col items-center justify-center px-2 mt-1 z-10">
                        {theme.icon}

                        <div className="w-full h-[2px] border-t-2 border-dashed border-white/40 relative my-2">
                            {item.cost > 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] px-2 font-bold whitespace-nowrap bg-black/20 rounded-full backdrop-blur-sm border border-white/10">
                                    ${item.cost}
                                </div>
                            )}
                        </div>

                        <div className="text-[10px] opacity-90 font-mono flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                            <Clock className="w-3 h-3" />
                            {item.details?.duration ? formatDuration(item.details.duration) : (
                                endTime ? formatDuration(Math.round((new Date(`1970-01-01T${endTime}:00`).getTime() - new Date(`1970-01-01T${item.time}:00`).getTime()) / 60000)) : "--"
                            )}
                        </div>

                        {/* Walking Discovery: Steps & Distance */}
                        {item.type === 'walk' && (item.details?.steps || item.details?.distance) && (
                            <div className="mt-3 flex gap-1 items-center">
                                {item.details.distance && (
                                    <span className="bg-orange-500/20 text-orange-200 px-1.5 py-0.5 rounded text-[9px] font-black border border-orange-500/30">
                                        {item.details.distance}
                                    </span>
                                )}
                                {item.details.steps && (
                                    <span className="bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded text-[9px] font-black border border-blue-500/30 whitespace-nowrap">
                                        {item.details.steps} 步
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* TO */}
                    <div className="text-right w-[35%] z-10">
                        <div className="text-[10px] opacity-70 font-bold mb-1 tracking-wider uppercase">TO</div>
                        <div className={`font-black tracking-tight leading-none mb-1 break-words ${labels.toCode.length > 8 ? 'text-lg' : 'text-3xl'} drop-shadow-md`}>
                            {labels.toCode}
                        </div>
                        {labels.toName && <div className="text-[10px] opacity-90 truncate font-medium mt-1">{labels.toName}</div>}
                    </div>
                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className={`px-5 py-3 flex justify-between items-center ${isDarkMode ? 'bg-black/40' : 'bg-white/10'} backdrop-blur-md border-t border-white/10 relative z-20`}>
                <div className="flex flex-col flex-1 mr-4 overflow-hidden">
                    <span className="text-[9px] opacity-60 uppercase font-bold mb-0.5">NOTES</span>
                    <div className="flex items-center gap-2 text-xs font-bold truncate">
                        {item.name.includes('(Return)') && <Undo2 className="w-3 h-3 text-orange-400" />}
                        {item.details?.desc || item.name}
                        {item.details?.exit && (
                            <span className="bg-emerald-500/80 text-white px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ml-1 shadow-sm">
                                {item.details.exit}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {item.type === 'flight' ? (
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[9px] opacity-60 uppercase font-bold">INFO</span>
                            <div className="flex items-center gap-1">
                                {item.smartTag ? <span className="font-bold text-xs">{item.smartTag}</span> : (
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        item.smartTag ? (
                            <div className="text-right pl-4">
                                <span className="text-[9px] opacity-60 uppercase font-bold">INFO</span>
                                <div className="font-bold text-xs">{item.smartTag}</div>
                            </div>
                        ) : (
                            <div className="opacity-50">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransportCard;
