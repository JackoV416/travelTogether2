import React from 'react';
import { Wifi, Signal } from 'lucide-react';
import SkeletonLoader from '../../Shared/SkeletonLoader';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents';

/**
 * ConnectivityWidget - 顯示網卡/WiFi (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} connectivity - Connectivity options array
 * @param {boolean} loadingConnectivity - Loading state
 */
const ConnectivityWidget = ({ isDarkMode, connectivity, loadingConnectivity }) => {
    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-teal-600/20 via-emerald-600/20 to-cyan-600/20 p-6 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <Wifi className="w-5 h-5 text-teal-400" /> 網卡 / WiFi
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                DATA
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    {loadingConnectivity ? (
                        <div className="space-y-2 mt-2">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        connectivity.map((c, i) => (
                            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-teal-500/30 transition-all flex items-center justify-between gap-3 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/0 to-teal-500/0 group-hover:via-teal-500/5 transition-all duration-500" />

                                <div className="flex-1 min-w-0 relative z-10">
                                    <div className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">{c.name}</div>
                                    <div className="text-[10px] opacity-60 text-slate-300 flex items-center gap-2 mt-1">
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-slate-200">{c.type}</span>
                                        <span className="truncate">{c.regions}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 relative z-10">
                                    <span className="font-black text-sm text-teal-300 group-hover:text-teal-200 transition-colors">{c.price}</span>
                                    <Signal className="w-3 h-3 text-white/20 group-hover:text-teal-400 transition-colors" />
                                </div>
                            </a>
                        ))
                    )}
                    <div className="mt-3 text-[9px] opacity-30 text-center text-white pb-2">Data: Operators / Klook (Simulated)</div>
                </div>
            </AuroraCard>
        </div>
    );
};

export default ConnectivityWidget;
