import React from 'react';
import { Wifi } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';

/**
 * ConnectivityWidget - 顯示網卡/WiFi
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} connectivity - Connectivity options array
 * @param {boolean} loadingConnectivity - Loading state
 */
const ConnectivityWidget = ({ isDarkMode, connectivity, loadingConnectivity }) => {
    return (
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-teal-400">
                        <Wifi className="w-5 h-5" /> 網卡 / WiFi
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                        {loadingConnectivity ? 'Loading...' : 'Live'}
                    </span>
                </div>
                <div className="space-y-2">
                    {loadingConnectivity ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-1/3"></div>
                                <div className="h-4 bg-white/10 rounded w-1/4"></div>
                            </div>
                        ))
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
