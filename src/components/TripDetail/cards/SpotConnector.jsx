import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, MapPin, Star, Clock, ChevronRight } from 'lucide-react';
import { getSmartItemImage } from '../../../utils/tripUtils';
import { useTranslation } from 'react-i18next';

const SpotConnector = ({ city, onAdd, isDarkMode, context }) => {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language !== 'en';

    const [loading, setLoading] = useState(false);
    const [contextType, setContextType] = useState(null);

    // Mock Suggestions based on general popularity
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const base = [
            { id: 's1', name: isZh ? '必去人氣景點' : 'Top Spot', type: 'spot', rating: 4.8, cost: 0 },
            { id: 's2', name: isZh ? '地道美食體驗' : 'Food Experience', type: 'food', rating: 4.9, cost: 150 },
            { id: 's3', name: isZh ? '特色購物區' : 'Shopping District', type: 'shopping', rating: 4.7, cost: 0 },
            { id: 's4', name: isZh ? '隱世打卡位' : 'Hidden Gem', type: 'spot', rating: 4.6, cost: 0 },
            { id: 'a1', name: isZh ? '機場觀景台' : 'Airport Observation Deck', type: 'spot', rating: 4.5, cost: 0, isAirport: true },
            { id: 'a2', name: isZh ? '環亞機場貴賓室' : 'Plaza Premium Lounge', type: 'food', rating: 4.6, cost: 400, isAirport: true },
            { id: 'a3', name: isZh ? '機場免稅店' : 'Duty Free Shopping', type: 'shopping', rating: 4.4, cost: 0, isAirport: true },
        ];

        let filtered = base;
        if (city?.toLowerCase()?.includes('airport') || context === 'arrivals') {
            filtered = base.filter(s => s.isAirport);
        } else {
            filtered = base.filter(s => !s.isAirport);
        }

        setSuggestions(filtered.sort((a, b) => b.rating - a.rating));
    }, [city, context, isZh]);

    return (
        <div className="ml-[48px] md:ml-[70px] mt-2 mb-6 pr-4 relative z-0">
            {/* Visual Flow Connector */}
            <div className={`absolute left-[-31px] top-[-10px] bottom-[-10px] w-0.5 border-l-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} z-0`} />

            <div className={`relative p-4 rounded-3xl border backdrop-blur-xl transition-all duration-500 shadow-sm ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'} z-10`}>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                            {isZh ? '發現行程空檔：建議加入景點' : 'Schedule Gap: Suggested Spots'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold opacity-40">
                        {isZh ? '向右滑動' : 'Swipe Right'} <ChevronRight className="w-3 h-3" />
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {suggestions.map((spot) => (
                        <div
                            key={spot.id}
                            className={`flex-shrink-0 w-48 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer group/spot ${isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:border-indigo-500/50' : 'bg-white border-gray-100 hover:border-indigo-300'}`}
                        >
                            <div className="relative h-24 overflow-hidden rounded-t-2xl">
                                <img
                                    src={getSmartItemImage({ name: spot.name, type: spot.type })}
                                    className="w-full h-full object-cover group-hover/spot:scale-110 transition-transform duration-500"
                                    alt={spot.name}
                                />
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-bold text-white">{spot.rating}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-[11px] font-bold truncate mb-1">{spot.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 opacity-50">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span className="text-[9px] font-medium">1-2h</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd({
                                                type: spot.type,
                                                name: spot.name,
                                                cost: spot.cost,
                                                details: { desc: isZh ? '由 Jarvis 智能建議' : 'Suggested by Jarvis' }
                                            });
                                        }}
                                        className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Ask Jarvis Button */}
                    <button className={`flex-shrink-0 w-48 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all p-4 ${isDarkMode ? 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400' : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}>
                        <Sparkles className="w-6 h-6 animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none text-center">
                            {isZh ? '叫 Jarvis 推薦更多' : 'Ask Jarvis For More'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpotConnector;
