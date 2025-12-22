import React from 'react';
import { Newspaper } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import SkeletonLoader from '../../Shared/SkeletonLoader';

/**
 * NewsWidget - 顯示旅遊快訊
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} newsData - News articles array
 * @param {boolean} loadingNews - Loading state
 */
const NewsWidget = ({ isDarkMode, newsData, loadingNews }) => {
    return (
        <div className="break-inside-avoid shadow-xl">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-2xl"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="font-bold flex items-center gap-2 text-emerald-400">
                        <Newspaper className="w-5 h-5" /> 旅遊快訊
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5'}`}>
                            GOOGLE NEWS
                        </span>
                    </div>
                </div>
                <div className="rounded-2xl space-y-3">
                    {loadingNews ? (
                        <div className="space-y-3">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        newsData.length > 0 ? newsData.map((n, i) => (
                            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] opacity-40 font-mono bg-white/5 px-1.5 py-0.5 rounded">{n.source}</span>
                                    <span className="text-[10px] opacity-30">{n.time}</span>
                                </div>
                                <h5 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-emerald-300 transition-colors uppercase tracking-tight">{n.title}</h5>
                                <p className="text-[10px] opacity-50 line-clamp-2 leading-relaxed">{n.summary}</p>
                            </a>
                        )) : (
                            <div className="text-center opacity-40 text-xs py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 italic">
                                暫無相關新聞
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsWidget;
