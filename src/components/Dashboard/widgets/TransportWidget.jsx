import React from 'react';
import { TrainFront } from 'lucide-react';
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
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-violet-400">
                        <TrainFront className="w-5 h-5" /> 交通票券
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                        {loadingTransports ? 'Fetching...' : 'Live'}
                    </span>
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
