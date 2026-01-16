import React, { useState, useEffect } from 'react';
import { Footprints, Train, Bus, Car, Plus, Loader2, Navigation, Clock, Star, ChevronRight, Sparkles } from 'lucide-react';
import { getDirections } from '../../../services/mapsDirections';
import { useTranslation } from 'react-i18next';
import { MASTER_CITY_DB } from '../../../constants/masterCityDB';

// Transport images for card display
const TRANSPORT_IMAGES = {
    transit: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    taxi: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80',
    bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80',
    walking: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80',
    walk: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80'
};

const TransportConnector = ({ fromItem, toItem, isDarkMode, onAdd, trip }) => {
    const { i18n } = useTranslation();
    const isZh = i18n.language !== 'en';
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const formatDuration = (mins) => {
        if (!mins) return "--";
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        if (isZh) {
            if (h > 0) return `${h}小時${m > 0 ? `${m}分鐘` : ''}`;
            return `${m}分鐘`;
        } else {
            if (h > 0) return `${h}h ${m}m`;
            return `${m}m`;
        }
    };

    const getSimpleCost = (mode, baseMins, currency) => {
        // Base cost index relative to HKD (1.0)
        // High cost: GBP (12), USD (7.8), EUR (8.5)
        // Low cost: TWD (0.25), JPY (0.06), KRW (0.006)
        const currencyMap = {
            'GBP': { rate: 10, symbol: '£' },
            'USD': { rate: 7.8, symbol: '$' },
            'EUR': { rate: 8.5, symbol: '€' },
            'AUD': { rate: 5.2, symbol: 'A$' },
            'SGD': { rate: 5.8, symbol: 'S$' },
            'JPY': { rate: 0.055, symbol: '¥' },
            'TWD': { rate: 0.25, symbol: 'NT$' },
            'KRW': { rate: 0.006, symbol: '₩' },
            'THB': { rate: 0.23, symbol: '฿' },
            'CNY': { rate: 1.1, symbol: '¥' },
            'HKD': { rate: 1, symbol: 'HK$' },
        };

        const rate = (currencyMap[currency] || currencyMap['HKD']).rate;

        // Base HKD Estimates:
        // Bus: $4 + $0.5/min
        // Train: $5 + $0.8/min
        // Taxi: $27 (flag) + $8/min (assuming reasonable speed/traffic)

        let hkdCost = 0;
        if (mode === 'walking') return 0;
        if (mode === 'transit') hkdCost = 5 + (baseMins * 0.8);
        if (mode === 'bus') hkdCost = 4 + (baseMins * 0.5);
        if (mode === 'taxi') hkdCost = 27 + (baseMins * 9); // Slightly higher for realism

        // Convert to local currency and round nicely
        let localCost = hkdCost / rate;

        // Rounding logic for clean numbers
        if (localCost > 1000) return Math.round(localCost / 100) * 100;
        if (localCost > 100) return Math.round(localCost / 10) * 10;
        if (localCost > 10) return Math.round(localCost);
        return parseFloat(localCost.toFixed(1));
    };

    const getPriceHKD = (localCost, currency) => {
        const rates = { 'JPY': 0.052, 'TWD': 0.25, 'USD': 7.8, 'EUR': 8.5, 'GBP': 10, 'KRW': 0.0058, 'CNY': 1.1, 'THB': 0.23, 'SGD': 5.8 };
        return Math.round(localCost * (rates[currency] || 1));
    };

    const getIcon = (mode) => {
        switch (mode) {
            case 'walking': case 'walk': return <Footprints className="w-3 h-3" />;
            case 'taxi': return <Car className="w-3 h-3" />;
            case 'bus': return <Bus className="w-3 h-3" />;
            default: return <Train className="w-3 h-3" />;
        }
    };

    useEffect(() => {
        const fromName = fromItem?.details?.location || fromItem?.name || '';
        const toName = toItem?.details?.location || toItem?.name || '';

        // Create unique key based on from/to pair for distinct calculations
        const pairKey = `${fromName}->${toName}`;

        const fetchDirections = async () => {
            if (!fromName || !toName) return;

            setLoading(true);
            try {
                const res = await getDirections(fromName, toName);
                const cityData = MASTER_CITY_DB[trip?.city] || {};
                const currency = cityData.currency || 'JPY';

                // Use actual response data or generate realistic mock based on pair hash
                const hashCode = pairKey.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
                const baseMins = res?.durationValue ? parseInt(res.durationValue) : (Math.abs(hashCode % 30) + 10);
                const distKm = res?.distance ? parseFloat(res.distance.replace(' km', '')) : (Math.abs(hashCode % 5) + 1);

                const v = [];

                // 1. Walking (If < 2km) -> High Suitability
                if (distKm <= 2.0) {
                    v.push({
                        id: 's_walk', type: 'walk', mode: 'walking',
                        name: isZh ? '步行前往' : 'Walk',
                        mins: Math.round(distKm * 15), // Approx 4km/h
                        cost: 0, currency, rating: 4.8,
                        image: 'https://images.unsplash.com/photo-1622312676059-e9354784a3dc?w=400&q=80', // City walking
                        desc: isZh ? '健康方便' : 'Healthy & Easy'
                    });
                }

                // 2. Metro/Train (Always an option for city)
                v.push({
                    id: 's_train', type: 'transport', mode: 'transit',
                    name: isZh ? '地鐵/鐵路' : 'MTR / Rail',
                    mins: baseMins,
                    cost: getSimpleCost('transit', baseMins, currency), currency, rating: 4.6,
                    image: 'https://images.unsplash.com/photo-1554672408-730436b60dde?w=400&q=80', // Modern Metro
                    desc: isZh ? '準時快捷' : 'Fast & Reliable'
                });

                // 3. Bus (Good alternative)
                v.push({
                    id: 's_bus', type: 'transport', mode: 'bus',
                    name: isZh ? '巴士' : 'Bus',
                    mins: Math.round(baseMins * 1.5), // Slower than train
                    cost: getSimpleCost('bus', Math.round(baseMins * 1.5), currency), currency, rating: 4.2,
                    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80', // City Bus
                    desc: isZh ? '欣賞風景' : 'Scenic Route'
                });

                // 4. Taxi/Rideshare (Convenient but expensive)
                v.push({
                    id: 's_taxi', type: 'transport', mode: 'taxi',
                    name: isZh ? '的士/Uber' : 'Taxi / Uber',
                    mins: Math.round(baseMins * 0.6), // Faster
                    cost: getSimpleCost('taxi', Math.round(baseMins * 0.6), currency), currency, rating: 4.7,
                    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80', // Taxi
                    desc: isZh ? '點對點直達' : 'Direct Point-to-Point'
                });

                // Sort by suitability (mock logic: Walking first if short, else Train -> Taxi -> Bus)
                const sorted = v.sort((a, b) => {
                    const scoreA = (a.mode === 'walking' && distKm < 1.5) ? 0 : a.mins;
                    const scoreB = (b.mode === 'walking' && distKm < 1.5) ? 0 : b.mins;
                    return scoreA - scoreB;
                });

                setSuggestions(v);
            } catch (err) {
                console.error("TransportConnector fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirections();
    }, [fromItem?.name, toItem?.name, trip?.city, isZh]);

    return (
        <div className="ml-[48px] md:ml-[70px] mt-2 mb-6 pr-4 relative z-0">
            {/* Visual Flow Connector */}
            <div className={`absolute left-[-31px] top-[-10px] bottom-[-10px] w-0.5 border-l-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} z-0`} />

            <div className={`relative p-4 rounded-3xl border backdrop-blur-xl transition-all duration-500 shadow-sm ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'} z-10`}>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                            {isZh ? '發現行程空檔：建議加入交通' : 'Schedule Gap: Suggested Transport'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold opacity-40">
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isZh ? '向右滑動' : 'Swipe Right'} <ChevronRight className="w-3 h-3" />
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {suggestions.map((item) => (
                        <div
                            key={item.id}
                            className={`flex-shrink-0 w-48 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer group/spot ${isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:border-indigo-500/50' : 'bg-white border-gray-100 hover:border-indigo-300'}`}
                        >
                            <div className="relative h-24 overflow-hidden rounded-t-2xl">
                                <img
                                    src={item.image}
                                    className="w-full h-full object-cover group-hover/spot:scale-110 transition-transform duration-500"
                                    alt={item.name}
                                />
                                <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                                    {getIcon(item.mode)}
                                </div>
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-bold text-white">{item.rating}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-[11px] font-bold truncate mb-1">{item.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 opacity-50">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span className="text-[9px] font-medium">{formatDuration(item.mins)}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd({
                                                type: item.type,
                                                name: isZh ? `${item.name}至 ${toItem?.name}` : `${item.name} to ${toItem?.name}`,
                                                cost: item.cost,
                                                details: { duration: formatDuration(item.mins), transportType: item.mode, desc: isZh ? '由 Jarvis 智能建議' : 'Suggested by Jarvis' }
                                            });
                                        }}
                                        className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-[9px] font-bold mt-1">
                                    {item.cost > 0 ? (
                                        <span className="text-indigo-400">{item.cost} {item.currency} <span className="opacity-40">≈ HKD {getPriceHKD(item.cost, item.currency)}</span></span>
                                    ) : (
                                        <span className="text-orange-400">{isZh ? '免費' : 'Free'}</span>
                                    )}
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

export default TransportConnector;
