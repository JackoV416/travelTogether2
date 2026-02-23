import React from 'react';
import { Plane, ArrowRight } from 'lucide-react';
import SkeletonLoader from '../../Shared/SkeletonLoader';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents';

/**
 * FlightsWidget - 顯示機票優惠 (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} flights - Flights array
 * @param {boolean} loadingFlights - Loading state
 */
const FlightsWidget = ({ isDarkMode, flights, loadingFlights }) => {
    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-sky-600/20 via-blue-600/20 to-indigo-600/20 p-6 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <Plane className="w-5 h-5 text-sky-400" /> 機票優惠
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                HOT OFFERS
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    {loadingFlights ? (
                        <div className="space-y-2 mt-2">
                            <SkeletonLoader type="list-item" count={4} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        flights.map((f, i) => (
                            <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-sky-500/30 transition-all flex flex-col gap-2 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/0 to-sky-500/0 group-hover:via-sky-500/5 transition-all duration-500" />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-sm group-hover:text-sky-300 transition-colors flex items-center gap-1.5 text-white">
                                            {f.route && f.route.includes('→') ? (
                                                <>
                                                    {f.route.split('→')[0].trim()}
                                                    <ArrowRight className="w-3 h-3 opacity-50 text-slate-400" />
                                                    {f.route.split('→')[1].trim()}
                                                </>
                                            ) : (
                                                f.route || 'Unknown Route'
                                            )}
                                        </div>
                                        {f.isHot && <span className="text-[8px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">HOT</span>}
                                    </div>
                                    <span className="font-black text-sm text-sky-300 group-hover:text-sky-200 transition-colors">{f.price}</span>
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="text-[10px] opacity-60 text-slate-300 flex items-center gap-2">
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-slate-200">{f.airline}</span>
                                        <span>{f.details}</span>
                                    </div>
                                    {f.tag && <span className="text-[9px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/20">{f.tag}</span>}
                                </div>
                            </a>
                        ))
                    )}
                    <div className="mt-3 text-[9px] opacity-30 text-center text-white pb-2">Data: Airlines / Skyscanner</div>
                </div>
            </AuroraCard>
        </div>
    );
};

export default FlightsWidget;
