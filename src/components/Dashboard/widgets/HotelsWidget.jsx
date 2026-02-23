import React from 'react';
import { Hotel, Star, ArrowUpRight } from 'lucide-react';
import SkeletonLoader from '../../Shared/SkeletonLoader';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents';

/**
 * HotelsWidget - 顯示酒店推薦 (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} hotels - Hotels array
 * @param {boolean} loadingHotels - Loading state
 */
const HotelsWidget = ({ isDarkMode, hotels, loadingHotels }) => {
    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-rose-600/20 via-pink-600/20 to-orange-600/20 p-6 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <Hotel className="w-5 h-5 text-rose-400" /> 酒店推薦
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                DEALS
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    {loadingHotels ? (
                        <div className="space-y-3 mt-2">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        hotels.map((h, i) => (
                            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all flex items-center gap-3 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/0 group-hover:via-rose-500/5 transition-all duration-500" />
                                <img src={h.img} alt={h.name} className="w-16 h-16 rounded-xl object-cover shadow-lg relative z-10" />
                                <div className="flex-1 min-w-0 relative z-10">
                                    <div className="font-bold text-sm truncate text-white group-hover:text-rose-300 transition-colors">{h.name}</div>
                                    <div className="text-[10px] opacity-60 flex items-center gap-2 text-slate-300">
                                        <span>{h.country}</span>
                                        <span className="flex items-center gap-0.5 text-amber-300"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{h.star}</span>
                                    </div>
                                    <div className="text-xs text-rose-300 font-bold mt-1 flex items-center gap-2">
                                        {h.price}
                                        {h.remaining && <span className="text-[8px] bg-red-500/20 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">最後 {h.remaining} 間</span>}
                                    </div>
                                </div>
                                <div className="relative z-10 p-2 rounded-full bg-white/5 group-hover:bg-rose-500/20 transition-colors">
                                    <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-rose-400 transition-all" />
                                </div>
                            </a>
                        ))
                    )}
                    <div className="mt-3 text-[9px] opacity-30 text-center text-white pb-2">Powered by Agoda / Booking.com</div>
                </div>
            </AuroraCard>
        </div>
    );
};

export default HotelsWidget;
