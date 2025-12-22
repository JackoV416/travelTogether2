import React from 'react';
import { Wifi } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * ConnectivityWidget - 顯示網卡/WiFi
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} connectivity - Connectivity options array
 * @param {boolean} loadingConnectivity - Loading state
 */
const ConnectivityWidget = ({ isDarkMode, connectivity, loadingConnectivity }) => {
    return (
        <div className="break-inside-avoid shadow-xl">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500 rounded-t-2xl"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="font-bold flex items-center gap-2 text-teal-400">
                        <Wifi className="w-5 h-5" /> 網卡 / WiFi
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5'}`}>
                            CONNECTIVITY
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    {loadingConnectivity ? (
                        <div className="space-y-2">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        connectivity.map((c, i) => (
                            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm group-hover:text-teal-400 transition-colors">{c.name}</div>
                                    <div className="text-[10px] opacity-50">{c.type} • {c.regions}</div>
                                </div>
                                <span className="font-bold text-sm text-teal-400">{c.price}</span>
                            </a>
                        ))
                    )}
                </div>
                <div className="mt-3 text-[9px] opacity-40 text-center">Data: Operators / Klook (Simulated)</div>
            </div>
        </div>
    );
};

export default ConnectivityWidget;
