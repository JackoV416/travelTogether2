import React from 'react';
import { Newspaper } from 'lucide-react';
import SkeletonLoader from '../../Shared/SkeletonLoader';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents';

/**
 * NewsWidget - 顯示旅遊快訊 (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {Array} newsData - News articles array
 * @param {boolean} loadingNews - Loading state
 */
const NewsWidget = ({ isDarkMode, newsData, loadingNews }) => {
    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 p-6 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <Newspaper className="w-5 h-5 text-emerald-400" /> 旅遊快訊
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                GOOGLE NEWS
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    {loadingNews ? (
                        <div className="space-y-3 mt-2">
                            <SkeletonLoader type="list-item" count={3} isDarkMode={isDarkMode} />
                        </div>
                    ) : (
                        newsData.length > 0 ? newsData.map((n, i) => (
                            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:via-emerald-500/5 transition-all duration-500" />
                                <div className="flex justify-between items-start mb-1.5 relative z-10">
                                    <span className="text-[10px] opacity-60 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-emerald-300">{n.source}</span>
                                    <span className="text-[10px] opacity-40 text-white">{n.time}</span>
                                </div>
                                <h5 className="font-bold text-sm mb-1.5 line-clamp-2 text-white group-hover:text-emerald-300 transition-colors tracking-tight relative z-10">{n.title}</h5>
                                <p className="text-[10px] opacity-50 line-clamp-2 leading-relaxed text-slate-300 relative z-10">{n.summary}</p>
                            </a>
                        )) : (
                            <div className="text-center opacity-40 text-xs py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 italic text-white">
                                暫無相關新聞
                            </div>
                        )
                    )}
                </div>
            </AuroraCard>
        </div>
    );
};

export default NewsWidget;
