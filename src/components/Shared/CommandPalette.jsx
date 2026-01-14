import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calculator, Calendar, ShoppingBag, Terminal, Sparkles, X, Command, Globe, Plane, Hotel, Utensils, MoveRight, ChevronRight, Brain, BrainCircuit } from 'lucide-react';

/**
 * CommandPalette: Smart Global Search & Action Center (CMD+K)
 * Scope: 
 * - Search Trips (Dashboard)
 * - Search current trip content (Itinerary, Budget, Shopping)
 * - Quick Actions (Change View, Ask Jarvis, Settings)
 */
const CommandPalette = ({
    isOpen,
    onClose,
    trips = [],
    activeTrip = null,
    isDarkMode,
    onAction
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const getIconForType = (type) => {
        switch (type) {
            case 'flight': return <Plane className="w-4 h-4" />;
            case 'hotel': return <Hotel className="w-4 h-4" />;
            case 'food': return <Utensils className="w-4 h-4" />;
            case 'shopping': return <ShoppingBag className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    // 1. Indexing & Searching
    useEffect(() => {
        if (!isOpen) {
            queueMicrotask(() => setQuery(''));
            return;
        }
        inputRef.current?.focus();

        let searchableItems = [];

        // Add Active Trip Content (Higher Priority)
        if (activeTrip) {
            // Itinerary
            Object.values(activeTrip.itinerary || {}).forEach(dayItems => {
                dayItems.forEach(item => {
                    searchableItems.push({
                        id: item.id,
                        title: item.name,
                        subtitle: `Itinerary • ${item.type}`,
                        type: 'itinerary',
                        icon: getIconForType(item.type),
                        data: item
                    });
                });
            });
            // Budget
            (activeTrip.budget || []).forEach(item => {
                searchableItems.push({
                    id: item.id,
                    title: item.name,
                    subtitle: `Budget • ${item.category}`,
                    type: 'budget',
                    icon: <Calculator className="w-4 h-4" />,
                    data: item
                });
            });
        }

        // Add Global Trips
        trips.forEach(t => {
            searchableItems.push({
                id: t.id,
                title: t.name,
                subtitle: `Trip • ${t.country}`,
                type: 'trip',
                icon: <Globe className="w-4 h-4" />,
                data: t
            });
        });

        // Add Quick Actions
        searchableItems.push({ id: 'action-map', title: '切換到地圖模式', subtitle: 'Quick Action', type: 'action', icon: <MapPin className="w-4 h-4" />, action: 'view-map' });
        searchableItems.push({ id: 'action-kanban', title: '切換到拼貼/Kanban', subtitle: 'Quick Action', type: 'action', icon: <Calendar className="w-4 h-4" />, action: 'view-kanban' });
        searchableItems.push({ id: 'action-jarvis', title: '問問 Jarvis AI', subtitle: 'Quick Action', type: 'action', icon: <Sparkles className="w-4 h-4" />, action: 'ask-jarvis' });

        if (!query) {
            queueMicrotask(() => setResults(searchableItems.slice(0, 10))); // Show recents/actions
        } else {
            const q = query.toLowerCase();
            const filtered = searchableItems.filter(item =>
                item.title?.toLowerCase().includes(q) ||
                item.subtitle?.toLowerCase().includes(q)
            );
            queueMicrotask(() => setResults(filtered));
        }
    }, [query, isOpen, trips, activeTrip]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
        } else if (e.key === 'Enter') {
            if (results[selectedIndex]) handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item) => {
        onAction && onAction(item);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[10vh] px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div
                className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-300 ${isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'
                    }`}
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                    <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="搜尋行程、預算、或是落指令 (e.g. 切換地圖)..."
                        className={`flex-1 bg-transparent border-none outline-none text-base font-medium ${isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                            }`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                        <span className="text-[10px] font-black opacity-40">ESC to close</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {results.length > 0 ? (
                        <div className="grid gap-1">
                            {results.map((item, index) => (
                                <button
                                    key={item.id + (item.action || '')}
                                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${index === selectedIndex
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-xl ${index === selectedIndex ? 'bg-white/20' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <div className="font-black text-sm truncate">{item.title}</div>
                                            <div className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${index === selectedIndex ? 'text-white' : ''
                                                }`}>{item.subtitle}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 shrink-0">
                                        <ChevronRight className="w-4 h-4 opacity-40" />
                                    </div>
                                    {index === selectedIndex && (
                                        <div className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-tighter">
                                            Enter
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <Brain className="w-12 h-12 mb-4" />
                            <p className="font-bold">找不到相關結果</p>
                            <p className="text-xs">試吓搜尋其他關鍵字或「問 Jarvis」</p>
                        </div>
                    )}
                </div>

                {/* Footer Tips */}
                <div className={`px-4 py-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="px-1 py-0.5 rounded border border-current">↑↓</span> 選擇
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-1 py-0.5 rounded border border-current">ENTER</span> 前往
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-500 opacity-100">
                        <BrainCircuit className="w-3.5 h-3.5" /> Travel Planner Global Search
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
