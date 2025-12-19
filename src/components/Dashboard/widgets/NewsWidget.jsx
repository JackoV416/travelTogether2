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
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-rose-400">
                        <Newspaper className="w-5 h-5" /> 旅遊快訊
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Google News</span>
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
                                <h5 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-rose-300 transition-colors uppercase tracking-tight">{n.title}</h5>
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
