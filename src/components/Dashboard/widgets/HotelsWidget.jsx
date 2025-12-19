import React from 'react';
import { Hotel, Star, ArrowUpRight } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';

/**
 * HotelsWidget - 顯示酒店推薦
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} hotels - Hotels array
 * @param {boolean} loadingHotels - Loading state
 */
const HotelsWidget = ({ isDarkMode, hotels, loadingHotels }) => {
    return (
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-pink-400">
                        <Hotel className="w-5 h-5" /> 酒店推薦
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                        {loadingHotels ? 'Loading...' : 'Live'}
                    </span>
                </div>
                <div className="space-y-3">
                    {loadingHotels ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3 animate-pulse">
                                <div className="w-14 h-14 bg-white/10 rounded-lg"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        hotels.map((h, i) => (
                            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group">
                                <img src={h.img} alt={h.name} className="w-14 h-14 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate group-hover:text-pink-400 transition-colors">{h.name}</div>
                                    <div className="text-[10px] opacity-50 flex items-center gap-2">
                                        <span>{h.country}</span>
                                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{h.star}</span>
                                    </div>
                                    <div className="text-xs text-pink-400 font-bold mt-0.5">
                                        {h.price} {h.remaining && <span className="ml-1 text-[9px] text-red-400 border border-red-500/30 px-1 rounded">最後 {h.remaining} 間</span>}
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:text-pink-400 transition-all" />
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
