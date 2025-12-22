import React from 'react';
import { Train } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * TransportWidget - 顯示交通票券
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} transports - Transports array
 * @param {boolean} loadingTransports - Loading state
 */
const TransportWidget = ({ isDarkMode, transports, loadingTransports }) => {
    return (
        <div className="break-inside-avoid shadow-xl">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-2xl"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                        <Train className="w-5 h-5" /> 交通票券
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5'}`}>
                            TICKETS
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    {loadingTransports ? (
                        <div className="space-y-2">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        transports.map((t, i) => (
                            <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm group-hover:text-violet-400 transition-colors">{t.name}</div>
                                    <div className="text-[10px] opacity-50">{t.provider} • {t.details}</div>
                                </div>
                                <span className="font-bold text-sm text-violet-400">{t.price}</span>
                            </a>
                        ))
                    )}
                </div>
                <div className="mt-3 text-[9px] opacity-40 text-center">Data: Rome2Rio / Official Sites</div>
            </div>
        </div>
    );
};

export default TransportWidget;
