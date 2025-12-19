import React from 'react';
import { Plane } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * FlightsWidget - 顯示機票優惠
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} flights - Flights array
 * @param {boolean} loadingFlights - Loading state
 */
const FlightsWidget = ({ isDarkMode, flights, loadingFlights }) => {
    return (
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-sky-400">
                        <Plane className="w-5 h-5" /> 機票優惠
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                        {loadingFlights ? 'Fetching...' : 'Live'}
                    </span>
                </div>
                <div className="space-y-2">
                    {loadingFlights ? (
                        <div className="space-y-2">
                            <SkeletonLoader type="list-item" count={4} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        flights.map((f, i) => (
                            <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                                        {f.route}
                                        {f.isHot && <span className="text-[8px] bg-red-500 text-white px-1 rounded animate-pulse">HOT</span>}
                                    </div>
                                    <div className="text-[10px] opacity-50">{f.airline} • {f.details}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {f.tag && <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">{f.tag}</span>}
                                    <span className="font-bold text-sm text-sky-400">{f.price}</span>
                                </div>
                            </a>
                        ))
                    )}
                </div>
                <div className="mt-3 text-[9px] opacity-40 text-center">Data: Airlines / Skyscanner</div>
            </div>
        </div>
    );
};

export default FlightsWidget;
