import React from 'react';
import { MapPin, Utensils, ShoppingBag, Hotel, Star, Clock, Pencil, DollarSign } from 'lucide-react';
import { getSmartItemImage, formatDuration } from '../../../utils/tripUtils';

const StandardCard = ({ item, isDarkMode, onEdit }) => {
    const bgImage = getSmartItemImage(item);

    // Type-based colors
    const getColors = () => {
        switch (item.type) {
            case 'hotel': return {
                bg: isDarkMode ? 'bg-rose-900/40' : 'bg-rose-50/80',
                border: 'border-rose-500/20',
                accent: 'text-rose-500',
                iconBg: 'bg-rose-500',
                label: 'Accommodation'
            };
            case 'food': return {
                bg: isDarkMode ? 'bg-orange-900/40' : 'bg-orange-50/80',
                border: 'border-orange-500/20',
                accent: 'text-orange-500',
                iconBg: 'bg-orange-500',
                label: 'Dining'
            };
            case 'shopping': return {
                bg: isDarkMode ? 'bg-pink-900/40' : 'bg-pink-50/80',
                border: 'border-pink-500/20',
                accent: 'text-pink-500',
                iconBg: 'bg-pink-500',
                label: 'Shopping'
            };
            default: return {
                bg: isDarkMode ? 'bg-cyan-900/40' : 'bg-cyan-50/80',
                border: 'border-cyan-500/20',
                accent: 'text-cyan-500',
                iconBg: 'bg-cyan-500',
                label: 'Sightseeing'
            };
        }
    };

    const theme = getColors();
    const iconMap = {
        hotel: <Hotel className="w-4 h-4 text-white" />,
        food: <Utensils className="w-4 h-4 text-white" />,
        shopping: <ShoppingBag className="w-4 h-4 text-white" />,
        spot: <MapPin className="w-4 h-4 text-white" />
    };

    return (
        <div className={`relative w-full rounded-2xl overflow-hidden border ${theme.border} ${theme.bg} backdrop-blur-md transition-all duration-300 hover:shadow-xl group flex flex-col md:flex-row h-auto md:h-[200px]`}>

            {/* Left Section: Image (Top on Mobile, Left on Desktop) */}
            <div className="relative w-full h-32 md:w-1/3 md:h-full overflow-hidden shrink-0">
                <img
                    src={bgImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"; // Fallback generic travel
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent" />

                {/* Type Icon Overlay */}
                <div className={`absolute top-2 left-2 p-1.5 rounded-lg ${theme.iconBg} shadow-lg z-10`}>
                    {iconMap[item.type] || iconMap.spot}
                </div>

                {/* Virtual Badge */}
                {item.isVirtual && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] font-black text-white uppercase tracking-wider border border-white/20">
                        續住 STAY
                    </div>
                )}
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
                    {/* Line 1: Localized Name */}
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`text-sm font-black truncate leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                        </h3>
                        {item.cost > 0 && (
                            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-500 shrink-0">
                                <DollarSign className="w-3 h-3" />
                                {item.cost}
                            </div>
                        )}
                    </div>

                    {/* Line 2: Secondary Name (English/Local) */}
                    <div className="text-[10px] opacity-40 font-bold truncate italic leading-none">
                        {item.details?.nameEn || item.details?.nameLocal || item.details?.secondaryName || "Explore Destination"}
                    </div>

                    {/* Line 3: Duration / Capacity / Smart Info */}
                    <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400/90">
                        <Clock className="w-2.5 h-2.5" />
                        <span>停留約 {formatDuration(item.details?.duration || 60)}</span>
                        {item.details?.rating && (
                            <span className="flex items-center gap-0.5 text-yellow-500 ml-1 border-l border-white/10 pl-2">
                                {item.details.rating} ★
                            </span>
                        )}
                    </div>

                    {/* Line 4: Exit / Location / Platform */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        <MapPin className="w-2.5 h-2.5 opacity-60" />
                        <span className="truncate">{item.details?.location || item.details?.exit || "Nearby Location"}</span>
                    </div>

                    {/* Line 5: Time Range & Total Duration - Matched with TransportCard */}
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-tight uppercase whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} ${theme.accent}`}>
                            {item.details?.time || item.time || "00:00"} — {item.details?.endTime || "..."}
                        </span>
                        <span className="opacity-20">/</span>
                        <span className="text-gray-400/60 font-medium">Est. {formatDuration(item.details?.duration || 60)}</span>
                    </div>

                    {/* Line 6: Other Info / Notes / Insight */}
                    <p className="text-[10px] opacity-60 line-clamp-1 leading-normal italic font-medium tracking-tight">
                        {item.details?.insight || item.details?.desc || item.details?.notes || "No extra data provided."}
                    </p>

                </div>

                {/* Line 7: Tags / Badges - MOVED OUTSIDE space-y-1 */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 overflow-hidden">
                    {item.details?.tags?.length > 0 ? (
                        item.details.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'bg-white/5 text-gray-400 border border-white/5' : 'bg-gray-100 text-gray-500'}`}>
                                #{tag}
                            </span>
                        ))
                    ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-500'}`}>
                            RECOMMENDED
                        </span>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item); }}
                        className="p-2 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-700 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Decorative Background Icon - Matched with TransportCard */}
            <div className={`absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none select-none overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {iconMap[item.type] && React.cloneElement(iconMap[item.type], { className: "w-24 h-24" })}
            </div>

            {/* Selection/Hover Overlay */}
            <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/10 pointer-events-none rounded-2xl transition-colors" />
        </div>
    );
};

export default StandardCard;
