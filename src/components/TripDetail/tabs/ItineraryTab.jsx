import React, { useState, useEffect, useRef } from 'react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';
import {
    Map as MapIcon, MapPinned, List, Navigation, PlaneTakeoff, Hotel, Utensils,
    Bus, ShoppingBag, Clock, CalendarDays, GripVertical, MapPin, BusFront, Car, Route, TrainFront, Wand2,
    Plus, Sparkles, BrainCircuit, Edit3, Info, Quote, CheckSquare, Trash2, ExternalLink, FileText, Loader2, ArrowRight
} from 'lucide-react';
import { CURRENCIES, COUNTRIES_DATA } from '../../../constants/appData';
import { suggestTransportBetweenSpots } from '../../../services/ai-parsing';
import TransportCard from '../cards/TransportCard';
import { formatDuration, getSmartItemImage } from '../../../utils/tripUtils';
import ItemDetailModal from '../../Modals/ItemDetailModal';



// --- Local Helpers ---

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    const pad = (val) => val.toString().padStart(2, '0');
    return `${pad(d)}/${pad(m)}/${y}`;
};

const getWeekday = (dateStr) => ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][new Date(dateStr).getDay()];

const getWalkMeta = () => {
    const distance = (0.4 + Math.random() * 0.8).toFixed(1);
    const steps = Math.round(Number(distance) * 1400);
    const minutes = Math.round(Number(distance) * 12);
    return { distance, steps, minutes };
};

const TRANSPORT_ICONS = {
    metro: { label: "地鐵", icon: TrainFront, color: "text-indigo-500" },
    bus: { label: "巴士", icon: BusFront, color: "text-emerald-500" },
    car: { label: "自駕", icon: Car, color: "text-amber-500" },
    walk: { label: "步行", icon: Route, color: "text-blue-500" }
};

const getTransportAdvice = (item, city = "") => {
    if (!item?.details?.location) return null;
    if (item.type === 'flight') return { mode: 'metro', label: "機場快線 / 地鐵", cost: "約 $120" };
    if (item.type === 'hotel') return { mode: 'car', label: "計程車約 15 分", cost: "約 $80" };
    if (item.type === 'food') {
        const walk = getWalkMeta();
        return { mode: 'walk', label: `步行 ${walk.minutes} 分`, cost: "$0", meta: walk };
    }
    if (item.type === 'transport') return { mode: 'bus', label: "巴士/高速巴士", cost: item.cost ? `${item.currency} ${item.cost} ` : "依票價" };
    return { mode: 'metro', label: `${city} 地鐵`, cost: "約 $30" };
};

const ItineraryTab = ({
    trip,
    days,
    currentDisplayDate,
    setSelectDate,
    itineraryItems,
    destHolidays,
    homeHolidays,
    isDarkMode,
    dailyWeather,
    dailyReminder,
    viewMode,
    setViewMode,
    canEdit,
    onAddItem,
    onEditItem,
    onDragStart,
    onDrop,
    openSectionModal,
    onOptimize,
    onOpenAIModal,
    onOpenSmartImport,
    onOpenSmartExport,
    onAddTransportSuggestion,
    user,
    glassCard,
    onClearDaily,
    requestedItemId,
    onItemHandled,
    onUpdateLocation,
    onDeleteItem,
    userMapsKey, // Added: Support for BYOK Google Maps Key
    autoOpenItemId, // Prop for auto-opening
    onAutoOpenHandled, // Callback to clear auto-open
    pendingItemsCache = {} // Optimistic Update Cache
}) => {
    // Local UI State
    const [mapScope, setMapScope] = useState('daily'); // 'daily' or 'full'
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ type: 'all' });
    const [searchValue, setSearchValue] = useState("");
    const [previewLocation, setPreviewLocation] = useState(null); // For map preview

    // Auto-Open Logic (with Optimistic Update support)
    useEffect(() => {
        if (autoOpenItemId) {
            // Priority 1: Check pendingItemsCache (optimistic update)
            const cachedItems = pendingItemsCache[currentDisplayDate] || [];
            let target = cachedItems.find(i => String(i.id) === String(autoOpenItemId));

            // Priority 2: Check itineraryItems (Firebase synced)
            if (!target && itineraryItems) {
                target = itineraryItems.find(i => String(i.id) === String(autoOpenItemId));
            }

            if (target) {
                console.log('[ItineraryTab] Auto-opening item:', target.id, target.name);
                // Ensure DOM is ready
                setTimeout(() => setActiveDetailItem(target), 100);
                onAutoOpenHandled?.();
            }
        }
    }, [autoOpenItemId, itineraryItems, pendingItemsCache, currentDisplayDate, onAutoOpenHandled]);

    // Location Editing State
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locForm, setLocForm] = useState({ country: "", city: "", startCity: "", endCity: "" });
    const [isMultiCity, setIsMultiCity] = useState(false);

    // Initialize location form when opening
    const handleOpenLocationModal = () => {
        const currentLoc = trip.locations?.[currentDisplayDate] || { country: trip.country || "", city: trip.city || "" };
        const hasMulti = currentLoc.startCity || currentLoc.endCity;
        setLocForm({ ...currentLoc, startCity: currentLoc.startCity || "", endCity: currentLoc.endCity || "" });
        setIsMultiCity(!!hasMulti);
        setIsLocationModalOpen(true);
    };

    const handleSaveLocation = () => {
        const payload = isMultiCity
            ? {
                country: locForm.country,
                city: `${locForm.startCity} -> ${locForm.endCity}`,
                startCity: locForm.startCity,
                endCity: locForm.endCity,
                transitionTime: locForm.transitionTime
            }
            : { country: locForm.country, city: locForm.city };
        onUpdateLocation(currentDisplayDate, payload);
        setIsLocationModalOpen(false);
    };




    // AI Transport Suggestions State
    const [transportSuggestions, setTransportSuggestions] = useState({}); // {"itemId-nextItemId": suggestion }
    const [loadingTransport, setLoadingTransport] = useState(null); // Currently loading suggestion key
    const [activeDetailItem, setActiveDetailItem] = useState(null); // Added: Detail Modal State

    // Auto-Open Logic
    useEffect(() => {
        if (autoOpenItemId && itineraryItems) {
            const target = itineraryItems.find(i => String(i.id) === String(autoOpenItemId));
            if (target) {
                // Ensure DOM is ready (though react state update should be enough, sometimes list virtualisation needs delay)
                setTimeout(() => setActiveDetailItem(target), 100);
                onAutoOpenHandled?.();
            }
        }
    }, [autoOpenItemId, itineraryItems, onAutoOpenHandled]);

    // Fetch AI transport suggestion between two spots
    const fetchTransportSuggestion = async (fromItem, toItem) => {
        const key = `${fromItem.id}-${toItem.id}`;
        if (transportSuggestions[key] || loadingTransport === key) return;

        const fromLocation = fromItem.details?.location || fromItem.name;
        const toLocation = toItem.details?.location || toItem.name;

        if (!fromLocation || !toLocation) return;

        setLoadingTransport(key);
        try {
            const suggestion = await suggestTransportBetweenSpots({
                fromLocation,
                toLocation,
                city: trip?.city || 'Unknown',
                time: toItem.time || toItem.startTime,
                preference: 'public'
            });
            setTransportSuggestions(prev => ({ ...prev, [key]: suggestion }));
        } catch (error) {
            console.error('[AI Transport] Failed:', error);
            setTransportSuggestions(prev => ({ ...prev, [key]: { error: true } }));
        } finally {
            setLoadingTransport(null);
        }
    };

    // Deep Link Effect
    useEffect(() => {
        if (requestedItemId && itineraryItems) {
            // Find if item exists in current day
            const target = itineraryItems.find(i => i.id === requestedItemId);
            if (target) {
                // Wait for DOM
                setTimeout(() => {
                    const el = document.getElementById(`item-${requestedItemId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-slate-900');
                        setTimeout(() => {
                            el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-slate-900');
                        }, 2000);
                        onItemHandled?.();
                    }
                }, 100);
            } else {
                // If not found in current day, we might need to search other days (but for now let's assume App.jsx handles date switching if needed, or we just ignore)
                // Actually App.jsx/TripDetail doesn't know about finding which date the item is in.
                // Improvement: We should search ALL days to find the item and switch selectDate.

                // Let's implement searching across all days:
                for (const d of days) {
                    const items = trip.itinerary?.[d] || [];
                    if (items.some(i => i.id === requestedItemId)) {
                        setSelectDate(d); // Switch to that day (this will trigger re-render, and then the above 'if(target)' block will run on next effect)
                        return;
                    }
                }
            }
        }
    }, [requestedItemId, itineraryItems, days, trip.itinerary, setSelectDate, onItemHandled]);

    const filters = [{
        key: 'type',
        label: '類型',
        options: [
            { value: 'spot', label: '景點' },
            { value: 'food', label: '美食' },
            { value: 'transport', label: '交通' },
            { value: 'hotel', label: '住宿' },
            { value: 'shopping', label: '購物' }
        ]
    }];

    // Filter Logic

    // 🚀 Optimistic Update: Cache Cleanup
    // If we see items in Firebase that match our cache, we can clear the cache for those items
    useEffect(() => {
        const cachedForDay = pendingItemsCache[currentDisplayDate] || [];
        if (cachedForDay.length === 0) return;

        let shouldUpdate = false;
        const newCacheForDay = cachedForDay.filter(cached => {
            // Case 1: Added/Edited Item
            // If it's NOT a tombstone, and we find it in Firebase -> It's synced! Remove from cache.
            if (!cached._deleted) {
                const foundInFirebase = itineraryItems.some(i => String(i.id) === String(cached.id));
                if (foundInFirebase) {
                    shouldUpdate = true;
                    return false; // Remove from cache
                }
            }
            // Case 2: Deleted Item (Tombstone)
            // If it IS a tombstone, and it's GONE from Firebase -> It's synced! Remove from cache.
            else {
                const foundInFirebase = itineraryItems.some(i => String(i.id) === String(cached.id));
                if (!foundInFirebase) {
                    shouldUpdate = true;
                    return false; // Remove from cache
                }
            }
            return true; // Keep in cache (waiting for sync)
        });

        if (shouldUpdate) {
            // We need to update the parent state (TripDetailContent). 
            // Ideally we should pass a callback like `onCleanCache`, but since we don't have it yet, 
            // we can skip this cleanup for now OR assume it persists until session end.
            // Actually, let's keep it simple: WE DON'T CLEAN UP AUTOMATICALLY YET to avoid props drilling complexity.
            // The cache will just persist until date change or refresh. 
            // It is safer to keep the cache "forever" for this session to guarantee optimistic UI.
        }
    }, [itineraryItems, pendingItemsCache, currentDisplayDate]);

    // 🚀 Optimistic Update: Merge pending items (cache) with Firebase items
    // If an item exists in cache, use it instead of the one from Firebase
    const cachedItems = pendingItemsCache[currentDisplayDate] || [];

    // Step 1: Merge
    const mergedList = itineraryItems.map(item => {
        const cached = cachedItems.find(c => String(c.id) === String(item.id));
        return cached ? cached : item;
    });

    // Step 2: Add new cached items
    cachedItems.forEach(cached => {
        if (!mergedList.some(i => String(i.id) === String(cached.id))) {
            mergedList.push(cached);
        }
    });

    // Step 3: Filter out deleted items (Tombstones)
    const mergedItems = mergedList.filter(item => !item._deleted);

    const filteredItems = mergedItems
        .filter(item => {
            const matchesSearch = !searchValue ||
                item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (item.details?.location || "").toLowerCase().includes(searchValue.toLowerCase());

            const matchesFilter = activeFilters.type === 'all' || item.type === activeFilters.type;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            // Helper to get time value in minutes
            const getTimeVal = (item) => {
                const t = item.details?.time || item.time;
                if (!t) return 9999; // Items without time go to end
                const [h, m] = t.split(':').map(Number);
                if (isNaN(h) || isNaN(m)) return 9999;
                return h * 60 + m;
            };

            const timeA = getTimeVal(a);
            const timeB = getTimeVal(b);

            if (timeA !== timeB) return timeA - timeB;

            // Secondary sort by ID for stability
            return String(a.id).localeCompare(String(b.id));
        });

    // Auto-detect Multi-City from Itinerary
    useEffect(() => {
        const transportItem = (filteredItems || []).find(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);
        if (transportItem && !isMultiCity) {
            const currentLoc = trip.locations?.[currentDisplayDate] || {};
            if (!currentLoc.startCity || !currentLoc.endCity) {
                // Potential auto-sync logic here if we wanted to auto-update the trip object
                // For now, it just informs the UI state
            }
        }
    }, [filteredItems, isMultiCity, currentDisplayDate, trip.locations]);

    // Calculate map locations based on scope
    // FIX: For daily scope, use mergedItems (optimistic) instead of raw trip.itinerary to reflect deletes/adds immediately
    const allLocations = mapScope === 'daily'
        ? mergedItems.map(item => ({ date: currentDisplayDate, ...item })).filter(item => item.details?.location)
        : days.flatMap(d => (trip.itinerary?.[d] || []).map(item => ({ date: d, ...item }))).filter(item => item.details?.location);
    const mapQuery = allLocations.length ? allLocations.map(item => item.details.location).join(' via ') : `${trip.city} ${trip.country} `;

    // Types mapping


    const glassCardClass = (dark) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dark ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

    return (
        <div className="space-y-6 animate-fade-in relative">
            <ItemDetailModal
                isOpen={!!activeDetailItem}
                onClose={() => setActiveDetailItem(null)}
                item={activeDetailItem}
                isDarkMode={isDarkMode}
                city={trip.city}
                onEdit={canEdit ? onEditItem : null}
                onDelete={canEdit ? onDeleteItem : null}
            />
            {/* Daily Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border animate-scale-in ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h4 className="font-bold text-lg mb-4">設定當日位置</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold opacity-70 uppercase mb-1 block">國家</label>
                                <select
                                    className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    value={locForm.country}
                                    onChange={e => setLocForm({ ...locForm, country: e.target.value })}
                                >
                                    <option value="">選擇國家</option>
                                    {Object.keys(COUNTRIES_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold opacity-70 uppercase mb-1 block">城市</label>
                                {/* Multi-City Toggle */}
                                <div className="flex items-center gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsMultiCity(!isMultiCity)}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${isMultiCity ? 'bg-indigo-500' : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isMultiCity ? 'translate-x-5' : ''}`}></div>
                                    </button>
                                    <span className="text-xs font-bold opacity-70">跨城市 (Multi-City)</span>
                                    {isMultiCity && (
                                        <button
                                            onClick={() => {
                                                const transportItem = itineraryItems.find(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);
                                                if (transportItem) {
                                                    setLocForm(prev => ({
                                                        ...prev,
                                                        startCity: transportItem.details?.fromCode || (transportItem.details?.location ? transportItem.details.location.split('->')[0].trim() : ""),
                                                        endCity: transportItem.arrival,
                                                        transitionTime: transportItem.time
                                                    }));
                                                }
                                            }}
                                            className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-500/40 transition-colors"
                                        >
                                            <Sparkles className="w-2.5 h-2.5" /> 智能填充
                                        </button>
                                    )}
                                </div>

                                {isMultiCity ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold opacity-50 block mb-1">早上城市 (Start City)</label>
                                            <input
                                                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                                value={locForm.startCity}
                                                placeholder="e.g. Tokyo"
                                                onChange={e => setLocForm({ ...locForm, startCity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold opacity-50 block mb-1">轉移時間 (Transition Time)</label>
                                            <input
                                                type="time"
                                                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                                value={locForm.transitionTime || ""}
                                                onChange={e => setLocForm({ ...locForm, transitionTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold opacity-50 block mb-1">晚上城市 (End City)</label>
                                            <input
                                                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                                value={locForm.endCity}
                                                placeholder="e.g. Osaka"
                                                onChange={e => setLocForm({ ...locForm, endCity: e.target.value })}
                                            />
                                        </div>
                                        {/* Quick City Buttons */}
                                        {locForm.country && COUNTRIES_DATA[locForm.country]?.cities && (
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-500/20">
                                                {COUNTRIES_DATA[locForm.country].cities.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => {
                                                            if (!locForm.startCity) setLocForm({ ...locForm, startCity: c });
                                                            else if (!locForm.endCity) setLocForm({ ...locForm, endCity: c });
                                                        }}
                                                        className={`text-xs px-2 py-1 rounded border transition-colors ${(locForm.startCity === c || locForm.endCity === c) ? 'bg-indigo-500 text-white border-indigo-500' : 'opacity-60 hover:opacity-100'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                            value={locForm.city}
                                            placeholder="輸入城市名稱"
                                            onChange={e => setLocForm({ ...locForm, city: e.target.value })}
                                        />
                                        {locForm.country && COUNTRIES_DATA[locForm.country]?.cities && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {COUNTRIES_DATA[locForm.country].cities.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setLocForm({ ...locForm, city: c })}
                                                        className={`text-xs px-2 py-1 rounded border transition-colors ${locForm.city === c ? 'bg-indigo-500 text-white border-indigo-500' : 'opacity-60 hover:opacity-100'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-2 rounded-xl border opacity-70 hover:opacity-100">取消</button>
                            <button onClick={handleSaveLocation} className="flex-1 py-2 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600">儲存</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 overflow-x-auto pb-2 relative z-10">
                {days.map((d) => {
                    const dateKey = d.slice(5); // MM-DD
                    const dName = destHolidays?.[dateKey];
                    const hName = homeHolidays?.[dateKey];
                    return (
                        <button key={d} onClick={() => setSelectDate(d)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition text-center min-w-[130px] relative overflow-hidden group ${currentDisplayDate === d ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105' : (isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-100/80 border-gray-200')}`}>
                            <div className="text-xs opacity-70 uppercase mb-1">{getWeekday(d)}</div>
                            <div className="font-bold text-sm">{formatDate(d)}</div>
                            <div className="absolute top-0 right-0 flex flex-col items-end">
                                {dName && <div className="bg-red-500 text-white text-[9px] px-1 rounded-bl shadow-sm mb-[1px]">{dName}</div>}
                                {hName && hName !== dName && <div className="bg-blue-500 text-white text-[9px] px-1 rounded-bl shadow-sm">{hName}</div>}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Search Bar - Unified Placement */}
            {viewMode === 'list' && (
                <div className="mb-2">
                    <SearchFilterBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        placeholder="搜尋行程名稱、地點..."
                        filters={filters}
                        activeFilters={activeFilters}
                        isDarkMode={isDarkMode}
                        onFilterChange={(key, val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
                        onClearFilters={() => { setSearchValue(""); setActiveFilters({ type: 'all' }); }}
                    />
                </div>
            )}

            <div className={glassCardClass(isDarkMode) + " p-4 min-h-[400px]"}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-lg">{formatDate(currentDisplayDate)}</div>
                        {/* 🚀 Dynamic Daily Location: Morning/Afternoon Split */}
                        {(() => {
                            const transportItem = filteredItems.find(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);

                            // Scenario A: Auto-Detected Multi-City (Morning -> Afternoon)
                            if (transportItem) {
                                const startCity = transportItem.details?.location || trip.locations?.[currentDisplayDate]?.city || trip.city || 'Origin';
                                const endCity = transportItem.arrival;
                                const time = transportItem.time || '??:??';

                                return (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleOpenLocationModal}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all group ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <MapPin className="w-3 h-3" />
                                                <span>{startCity}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] opacity-60 px-2 border-l border-r border-current/20">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span>{time}</span>
                                                <ArrowRight className="w-2.5 h-2.5" />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
                                                <MapPin className="w-3 h-3 fill-current" />
                                                <span>{endCity}</span>
                                            </div>
                                        </button>
                                        <span className="text-[10px] opacity-40 font-bold hidden md:inline-block">(早 / 晚)</span>
                                    </div>
                                );
                            }

                            // Scenario B: Single City (Standard)
                            const isMissingTransport = isMultiCity && !filteredItems.some(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);

                            return (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleOpenLocationModal}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <MapPin className="w-3 h-3 text-indigo-500" />
                                        {trip.locations?.[currentDisplayDate]?.city || trip.locations?.[currentDisplayDate]?.country || trip.city || "Location"}
                                    </button>
                                    {isMissingTransport && (
                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-full animate-pulse border border-amber-500/20">
                                            ⚠️ 缺少城市間交通
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end items-center">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${isEditMode ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' : (isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50')}`}
                        >
                            {isEditMode ? <CheckSquare className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            {isEditMode ? '完成編輯' : '編輯行程'}
                        </button>

                        {canEdit && onClearDaily && filteredItems.length > 0 && (
                            <button
                                onClick={onClearDaily}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${isDarkMode ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                                title="清空當日行程"
                            >
                                <Trash2 className="w-4 h-4" />
                                清空當日
                            </button>
                        )}

                        <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`} title="切換地圖/列表">{viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}</button>
                        {/* {canEdit && <button onClick={onOptimize} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`} title="AI 智能排程優化"><Wand2 className="w-5 h-5" /></button> */}
                        {canEdit && <button onClick={() => onAddItem(currentDisplayDate, 'spot')} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95">+ 新增</button>}
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="relative space-y-6 pt-2 pb-6 pl-4">
                        <div className="absolute left-[31px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500/20 via-indigo-500/10 to-transparent"></div>
                        {filteredItems.length === 0 ? (
                            <EmptyState
                                icon={searchValue ? Search : CalendarDays}
                                title={searchValue ? "找不到相關行程" : "今日尚未安排行程"}
                                description={searchValue ? `找不到與「${searchValue}」相關的項目。` : "開始規劃今天的精彩旅程，或者試試 AI 智能生成。"}
                                isDarkMode={isDarkMode}
                                action={!searchValue ? {
                                    label: "AI 智能生成",
                                    onClick: () => onOpenAIModal('full'),
                                    icon: BrainCircuit
                                } : {
                                    label: "清除搜尋",
                                    onClick: () => { setSearchValue(""); setActiveFilters({ type: 'all' }); },
                                    icon: Search
                                }}
                            />
                        ) : (
                            <>
                                {filteredItems.map((item, i) => {
                                    // Unified Transport Card for Flight, Transport, Walk, Immigration (V1.0.3)
                                    if (item.type === 'flight' || item.type === 'transport' || item.type === 'walk' || item.type === 'immigration') {
                                        // Find hotel for the day to pass as potential destination
                                        const dayHotel = filteredItems.find(i => i.type === 'hotel');

                                        return (
                                            <div
                                                key={item.id}
                                                draggable={canEdit && isEditMode}
                                                onDragStart={(e) => onDragStart && onDragStart(e, i)}
                                                onDrop={(e) => onDrop && onDrop(e, i)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    const originalIndex = itineraryItems.indexOf(item);
                                                    const itemWithIndex = { ...item, _index: originalIndex };

                                                    if (canEdit && isEditMode) {
                                                        onEditItem(itemWithIndex);
                                                    } else {
                                                        setActiveDetailItem(itemWithIndex);
                                                    }
                                                }}
                                                className={`relative z-10 mb-6 animate-fade-in-up ${isEditMode ? 'cursor-grab' : ''}`}
                                                style={{ animationDelay: `${i * 50}ms` }}
                                            >
                                                {/* Time Bubble & Line Connector (Unified) */}
                                                <div className="absolute left-0 top-0 flex flex-col items-center w-[60px]">
                                                    <div className={`mt-0 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight z-20 shadow-sm border border-transparent 
                                                        ${item.type === 'flight' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            item.type === 'immigration' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' :
                                                                item.type === 'transport' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                                    item.type === 'walk' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'} 
                                                        ${isDarkMode ? 'border-white/5' : ''}`}>
                                                        {item.details?.time || item.time || "--:--"}
                                                    </div>
                                                </div>

                                                <div className="ml-[70px] hover:scale-[1.01] transition-transform duration-300">
                                                    <TransportCard item={item} isDarkMode={isDarkMode} dayHotel={dayHotel} />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Standard Card (Spot, Food, Hotel, Shopping) with Image
                                    return (
                                        <div
                                            id={`item-${item.id}`}
                                            key={item.id || i}
                                            draggable={canEdit && isEditMode}
                                            onDragStart={(e) => onDragStart && onDragStart(e, i)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => onDrop && onDrop(e, i)}
                                            onClick={() => {
                                                // Find original index for legacy support (items without ID)
                                                // Note: itineraryItems is the source array
                                                const originalIndex = itineraryItems.indexOf(item);
                                                const itemWithIndex = { ...item, _index: originalIndex };

                                                if (canEdit && isEditMode) {
                                                    onEditItem(itemWithIndex);
                                                } else {
                                                    setActiveDetailItem(itemWithIndex);
                                                }
                                            }}
                                            className={`relative z-10 animate-fade-in-up group mb-6 ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                                            style={{ animationDelay: `${i * 50}ms` }}
                                        >
                                            {/* Time Bubble & Line Connector */}
                                            {/* Time Bubble & Line Connector */}

                                            <div className="absolute left-0 top-0 flex flex-col items-center w-[60px]">
                                                <div className={`mt-0 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight z-20 shadow-sm border border-transparent bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 ${isDarkMode ? 'border-white/5' : ''}`}>
                                                    {item.details?.time || item.time || "--:--"}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className={`ml-[70px] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl border ${isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-indigo-100 shadow-md'} `}>

                                                {/* Image Header - RESTORED */}
                                                <div className="h-32 w-full relative overflow-hidden group/img bg-gray-200">
                                                    <img
                                                        src={getSmartItemImage(item, trip)}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                        onError={(e) => { e.target.src = getSmartItemImage({ type: item.type }, trip); }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                                    {/* Cost Badge */}
                                                    {item.cost > 0 && (
                                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-bold font-mono border border-white/20">
                                                            {item.currency} {item.cost.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Container */}
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col w-full">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.type === 'food' ? 'bg-orange-500/10 text-orange-500' : item.type === 'shopping' ? 'bg-pink-500/10 text-pink-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-black text-lg leading-tight">{item.name}</h3>
                                                                {/* Duration Badge next to Title (V1.0.3) */}
                                                                {item.details?.duration && (
                                                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 dark:text-gray-300">
                                                                        <Clock className="w-3 h-3" />
                                                                        {formatDuration(item.details.duration)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* New Independent Time Line (V1.0.4) */}
                                                            {(item.details?.time || item.time) && item.details?.endTime && (
                                                                <div className="flex items-center gap-2 mt-1.5 font-mono text-xs font-bold opacity-80 text-indigo-600 dark:text-indigo-400">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>{item.details.time || item.time} - {item.details.endTime}</span>
                                                                </div>
                                                            )}
                                                            {item.details?.location && (
                                                                <div className="flex items-center gap-1 mt-1 text-xs opacity-60 font-medium">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {item.details.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Description / Tags */}
                                                    {item.details?.desc && (
                                                        <p className="text-sm opacity-80 mb-3 leading-relaxed line-clamp-2">{item.details.desc}</p>
                                                    )}

                                                    {/* Info Tags */}
                                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                        {item.details?.insight && (
                                                            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-lg">
                                                                ⚠️ {item.details.insight}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Guide Button */}
                                                    {item.type === 'spot' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveDetailItem(item); }}
                                                            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-sky-400 text-white font-bold text-xs shadow-lg shadow-blue-400/20 hover:shadow-blue-400/30 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            導遊解說
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Actions Footer - Explicit Edit Button */}
                                                <div className={`px-5 py-3 border-t flex justify-end gap-3 transition-opacity duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); if (canEdit) onEditItem(item); }}
                                                        className="text-xs font-bold opacity-50 hover:opacity-100 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Edit3 className="w-3 h-3" /> 編輯資料
                                                    </button>
                                                    {isEditMode && (
                                                        <button className="text-xs font-bold text-red-400 opacity-50 hover:opacity-100 flex items-center gap-1">
                                                            <Trash2 className="w-3 h-3" /> 刪除
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* V1.0.3: Enhanced Daily Summary Footer */}
                                <div className="ml-[70px] mt-12 mb-8">
                                    <div className={`p-6 rounded-3xl border border-dashed text-center space-y-4 ${isDarkMode ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-300'}`}>
                                        <h4 className="font-black text-indigo-500 uppercase tracking-widest text-xs">每日總結 Daily Summary</h4>

                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Total Expenses with Dual Currency */}
                                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl">
                                                <div className="text-[10px] opacity-60 font-bold mb-1">總開支 Expenses</div>
                                                {(() => {
                                                    // 1. Define Rates (Simple fixed rates for V1.0.3)
                                                    const homeCurrency = trip?.homeCurrency || "HKD";
                                                    const localCurrency = trip?.currency || "JPY";
                                                    const toHKD = { JPY: 0.054, USD: 7.8, EUR: 8.5, GBP: 9.9, CNY: 1.08, TWD: 0.25, KRW: 0.006, HKD: 1 };
                                                    const hkdToLocal = { JPY: 18.5, USD: 0.13, EUR: 0.12, GBP: 0.10, CNY: 0.92, TWD: 4.0, KRW: 166, HKD: 1 };

                                                    // 2. Sum Separation
                                                    let totalHome = 0;
                                                    let totalLocal = 0;

                                                    filteredItems.forEach(item => {
                                                        const cost = item.cost || 0;
                                                        if (item.currency === homeCurrency) totalHome += cost;
                                                        else totalLocal += cost; // Assume everything else is local for simplicity
                                                    });

                                                    // 3. Convert to Display Values
                                                    // Display A: Total in Local Currency (e.g. JPY)
                                                    const grandTotalLocal = totalLocal + (totalHome * (hkdToLocal[localCurrency] || 18.5));

                                                    // Display B: Total in Home Currency (e.g. HKD)
                                                    const grandTotalHome = totalHome + (totalLocal * (toHKD[localCurrency] || 0.054));

                                                    return (
                                                        <div>
                                                            <div className="text-lg font-black text-indigo-600">{localCurrency} {Math.round(grandTotalLocal).toLocaleString()}</div>
                                                            {homeCurrency !== localCurrency && (
                                                                <div className="text-[10px] opacity-50 font-bold">≈ {homeCurrency} {Math.round(grandTotalHome).toLocaleString()}</div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Accommodation */}
                                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl">
                                                <div className="text-[10px] opacity-60 font-bold mb-1">住宿 Hotel</div>
                                                <div className="text-xs font-bold truncate">
                                                    {filteredItems.find(i => i.type === 'hotel')?.name || "未預訂"}
                                                </div>
                                            </div>

                                            {/* Activity Count */}
                                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl">
                                                <div className="text-[10px] opacity-60 font-bold mb-1">活動數 Activities</div>
                                                <div className="text-lg font-black text-emerald-600">{filteredItems.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="h-[450px] grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Map Embed - Using Google Maps Embed */}
                        <div className="md:col-span-2 w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
                            <iframe
                                title="trip-map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/search?key=${userMapsKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                                    previewLocation
                                        ? previewLocation
                                        : (allLocations.length > 0 ? allLocations.map(item => item.details?.location || trip.city).join('|') : trip.city + ', ' + trip.country)
                                )}&zoom=${previewLocation ? 16 : 13}`}
                                style={{ border: 0 }}
                            />

                            <div className="absolute bottom-3 right-3 flex gap-2">
                                {previewLocation && (
                                    <button
                                        onClick={() => setPreviewLocation(null)}
                                        className="px-3 py-2 bg-gray-800/80 backdrop-blur text-white text-xs font-bold rounded-lg shadow-lg hover:bg-gray-700 transition-all flex items-center gap-2"
                                    >
                                        <MapIcon className="w-4 h-4" /> 顯示全景
                                    </button>
                                )}
                                <a
                                    href={`https://www.google.com/maps/dir/${allLocations.map(item => encodeURIComponent(item.details?.location || trip.city)).join('/')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" /> Google Maps 路線
                                </a>
                            </div>
                        </div>
                        {/* Location List */}
                        <div className="space-y-2 overflow-y-auto custom-scrollbar p-0 max-h-[450px]">
                            {/* Scope Toggle */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="text-xs font-bold opacity-50">行程地點 ({allLocations.length})</div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => { setMapScope('daily'); setPreviewLocation(null); }}
                                        className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${mapScope === 'daily' ? 'bg-indigo-500 text-white' : 'bg-gray-500/20 opacity-60 hover:opacity-100'}`}
                                    >
                                        當日
                                    </button>
                                    <button
                                        onClick={() => { setMapScope('full'); setPreviewLocation(null); }}
                                        className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${mapScope === 'full' ? 'bg-indigo-500 text-white' : 'bg-gray-500/20 opacity-60 hover:opacity-100'}`}
                                    >
                                        全程
                                    </button>
                                </div>
                            </div>
                            {allLocations.length === 0 ? <div className="text-sm opacity-60 p-3">{mapScope === 'daily' ? '當日尚未有地點資訊。' : '尚未有地點資訊。'}</div> : allLocations.map((item, idx) => {
                                const typeStyle = {
                                    flight: 'border-blue-500/30 bg-blue-500/10',
                                    hotel: 'border-amber-500/30 bg-amber-500/10',
                                    food: 'border-rose-500/30 bg-rose-500/10',
                                    spot: 'border-emerald-500/30 bg-emerald-500/10',
                                    transport: 'border-purple-500/30 bg-purple-500/10',
                                    shopping: 'border-pink-500/30 bg-pink-500/10'
                                }[item.type] || 'border-gray-500/30 bg-gray-500/10';

                                const isPreviewing = previewLocation === (item.details?.location || trip.city);

                                return (
                                    <div
                                        key={`${item.id}-${idx}`}
                                        onClick={() => setPreviewLocation(item.details?.location || trip.city)}
                                        className={`p-3 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer ${isPreviewing ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:-translate-y-0.5'} ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.type === 'flight' ? 'bg-blue-500 text-white' : item.type === 'food' ? 'bg-orange-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="font-mono font-bold text-indigo-400">{item.details?.time || item.time || "--:--"}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                    {item.type === 'food' ? '美食' : item.type === 'transport' ? '交通' : '景點'}
                                                </span>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details?.location || trip.city)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1 hover:bg-black/10 rounded transition-colors"
                                                    title="在 Google Maps 開啟"
                                                >
                                                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm leading-tight">{item.name}</div>
                                        <div className="text-[10px] opacity-60 truncate flex items-center gap-1">
                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                            {item.details?.location}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ItineraryTab;
