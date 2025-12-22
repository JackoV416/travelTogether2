import React from 'react';
import { Hotel, Star, ArrowUpRight } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * HotelsWidget - 顯示酒店推薦
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} hotels - Hotels array
 * @param {boolean} loadingHotels - Loading state
 */
const HotelsWidget = ({ isDarkMode, hotels, loadingHotels }) => {
    return (
        <div className="break-inside-avoid shadow-xl">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 rounded-t-2xl"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="font-bold flex items-center gap-2 text-rose-400">
                        <Hotel className="w-5 h-5" /> 酒店推薦
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5'}`}>
                            HOTEL DEALS
                        </span>
                    </div>
                </div>
                <div className="space-y-3">
                    {loadingHotels ? (
                        <div className="space-y-3">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        hotels.map((h, i) => (
                            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group">
                                <img src={h.img} alt={h.name} className="w-14 h-14 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate group-hover:text-rose-400 transition-colors">{h.name}</div>
                                    <div className="text-[10px] opacity-50 flex items-center gap-2">
                                        <span>{h.country}</span>
                                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{h.star}</span>
                                    </div>
                                    <div className="text-xs text-rose-400 font-bold mt-0.5">
                                        {h.price} {h.remaining && <span className="ml-1 text-[9px] text-red-400 border border-red-500/30 px-1 rounded">最後 {h.remaining} 間</span>}
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:text-rose-400 transition-all" />
                            </a>
                        ))
                    )}
                </div>
                <div className="mt-3 text-[9px] opacity-40 text-center">Data: Agoda / Booking.com</div>
            </div>
        </div>
    );
};

export default HotelsWidget;
