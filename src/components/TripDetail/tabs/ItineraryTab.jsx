import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';
import {
    Map as MapIcon, MapPinned, List, Navigation, PlaneTakeoff, Hotel, Utensils, Plane,
    Bus, ShoppingBag, Clock, CalendarDays, GripVertical, MapPin, Car, Route, Train, Wand2,
    Plus, Sparkles, BrainCircuit, Edit3, Info, AlertTriangle, Quote, CheckSquare, Trash2, ExternalLink, FileText, Loader2, ArrowRight,
    Undo2, Redo2, History, LogOut, LogIn, Sun, Moon, Shirt
} from 'lucide-react';
import { CURRENCIES, COUNTRIES_DATA } from '../../../constants/appData';
import { suggestTransportBetweenSpots } from '../../../services/ai-parsing';
import TransportCard from '../cards/TransportCard';
import StandardCard from '../cards/StandardCard';
import TransportConnector from '../cards/TransportConnector';
import { formatDuration, getSmartItemImage, getLocalizedCityName } from '../../../utils/tripUtils';
import { formatTime, parseTime, detectTimeConflicts } from '../../../utils/timeUtils';
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
    metro: { label: "地鐵", icon: Train, color: "text-indigo-500" },
    bus: { label: "巴士", icon: Bus, color: "text-emerald-500" },
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
    onDragEnd, // V1.1: Integration with TripDetailContent drag handler
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
    pendingItemsCache = {}, // Optimistic Update Cache
    // V1.1 Phase 7: History System
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false
}) => {
    // Local UI State
    const [mapScope, setMapScope] = useState('daily'); // 'daily' or 'full'
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ type: 'all' });
    const [searchValue, setSearchValue] = useState("");
    const [previewLocation, setPreviewLocation] = useState(null); // For map preview

    // V1.1 Phase 2: Auto-Shift Toggle (Smart Ripple)
    const [autoShiftEnabled, setAutoShiftEnabled] = useState(() => {
        const saved = localStorage.getItem('itinerary_autoShift');
        return saved !== null ? JSON.parse(saved) : true; // Default ON
    });

    const toggleAutoShift = () => {
        const newVal = !autoShiftEnabled;
        setAutoShiftEnabled(newVal);
        localStorage.setItem('itinerary_autoShift', JSON.stringify(newVal));
    };

    // V1.1: Native Drag & Drop State Tracking
    const [draggedIndex, setDraggedIndex] = useState(null);

    // V1.1: Native Drag Handler Adapter - Converts native drag events to @hello-pangea/dnd format
    const handleNativeDragStart = (e, index) => {
        setDraggedIndex(index);
        if (onDragStart) onDragStart(e, index);
    };

    const handleNativeDrop = (e, destinationIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === destinationIndex) {
            setDraggedIndex(null);
            return;
        }
        // Call onDragEnd with result format compatible with @hello-pangea/dnd
        if (onDragEnd) {
            onDragEnd({
                source: { index: draggedIndex },
                destination: { index: destinationIndex }
            });
        }
        setDraggedIndex(null);
    };

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

                let mins = h * 60 + m;
                // V1.1 Phase 5: Late Night Sorting (00:00 - 05:00) 
                // If it's early morning, treat it as late night and put at bottom
                if (h < 5) mins += 24 * 60;

                return mins;
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
    // V1.1 Phase 5: Hotel Transport Smart Shortcuts
    const currentHotel = filteredItems.find(i => i.type === 'hotel');

    // V2.15: Persistent Hotel - Search backwards through dates for most recent hotel
    const persistentHotel = useMemo(() => {
        const isRealHotel = (h) => {
            if (!h || h.type !== 'hotel') return false;
            const hName = (h.name || h.details?.nameEn || '').toLowerCase();
            return !hName.includes('checkout');
        };

        if (isRealHotel(currentHotel)) return currentHotel; // Use today's hotel if available and not checkout

        // Sort dates descending and find most recent real hotel on or before current date
        const sortedDates = days.filter(d => d <= currentDisplayDate).sort().reverse();
        for (const date of sortedDates) {
            const dayItems = trip.itinerary?.[date] || [];
            const hotel = dayItems.find(isRealHotel);
            if (hotel) return hotel;
        }
        return null;
    }, [currentHotel, days, currentDisplayDate, trip.itinerary]);

    const hasMorningDeparture = filteredItems.some(i => (i.type === 'transport' || i.type === 'walk') && (i.details?.location === (persistentHotel?.name || persistentHotel?.details?.nameEn) || i.name?.includes('從酒店出發')));
    const hasEveningReturn = filteredItems.some(i => (i.type === 'transport' || i.type === 'walk') && (i.details?.arrival === (persistentHotel?.name || persistentHotel?.details?.nameEn) || i.name?.includes('返回酒店')));

    const handleHotelShortcut = (mode) => {
        if (!persistentHotel) return;
        const hotelName = persistentHotel.name || persistentHotel.details?.nameEn || '酒店';
        const city = trip.locations?.[currentDisplayDate]?.city || trip.city || '市區';

        // V1.1 Phase 5: Countdown/Departure Detection (e.g. Flight today)
        const flightItem = filteredItems.find(i => i.type === 'flight' || (i.type === 'transport' && i.arrival && !i.name?.includes('返回酒店')));

        if (mode === 'departure') {
            const firstActivity = filteredItems.find(i => i.type !== 'hotel' && i.time);
            let departureTime = '09:00';
            let destination = city;

            if (firstActivity) {
                const depMins = parseTime(firstActivity.time) - 30;
                departureTime = formatTime(Math.max(0, depMins));
                destination = firstActivity.name || firstActivity.details?.location || city;
            }

            onAddItem(currentDisplayDate, 'transport', {
                name: `從酒店出發 (${hotelName})`,
                type: 'transport',
                time: departureTime,
                details: {
                    time: departureTime,
                    location: hotelName,
                    arrival: destination,
                    transportType: 'Walk/Transit'
                }
            });
        } else {
            // Return to Hotel
            let returnTime = '22:00';
            let origin = city;

            if (flightItem) {
                // Countdown logic: If there's a flight, suggest return to hotel 4 hours before to pick up bags
                const flightMins = parseTime(flightItem.time) || 1200; // Default 20:00
                const retMins = flightMins - 240; // 4 hours before flight
                returnTime = formatTime(retMins);

                // Find activity before this return time
                const prevActivity = [...filteredItems].reverse().find(i => {
                    if (i.type === 'hotel' || !i.time) return false;
                    const it = parseTime(i.time);
                    const rt = parseTime(returnTime);
                    return it < rt;
                });
                origin = prevActivity?.name || prevActivity?.details?.location || city;
            } else {
                const lastActivity = [...filteredItems].reverse().find(i => i.type !== 'hotel' && i.time);
                if (lastActivity) {
                    const lastMins = parseTime(lastActivity.time);
                    // Add 75 mins for stay + travel back
                    returnTime = formatTime(lastMins + 75);
                    origin = lastActivity.name || lastActivity.details?.location || city;
                }
            }

            onAddItem(currentDisplayDate, 'transport', {
                name: `返回酒店 (${hotelName})`,
                type: 'transport',
                time: returnTime,
                details: {
                    time: returnTime,
                    location: origin,
                    arrival: hotelName,
                    transportType: 'Walk/Transit'
                }
            });
        }
    };


    const glassCardClass = (dark) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dark ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

    return (
        <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
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

            <div className="flex gap-3 overflow-x-auto py-6 px-1 relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

            {/* Daily Summary Card */}
            <div className={`rounded-3xl p-6 min-h-[400px] border relative overflow-hidden backdrop-blur-2xl transition-colors
                ${isDarkMode ? 'bg-gray-900/40 border-white/10' : 'bg-white/60 border-white/20 shadow-xl'}`}>

                {/* Decorative Background Blur */}
                <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-20 -z-10 ${isDarkMode ? 'bg-indigo-500/30' : 'bg-indigo-300/40'}`} />

                <div className="flex justify-between items-center mb-6 flex-wrap gap-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-lg">{formatDate(currentDisplayDate)}</div>
                        {/* 🚀 Dynamic Daily Location: Morning/Afternoon Split */}
                        {(() => {
                            // V2.16: Cross-city detection via trip.locations comparison (same as Day Summary)
                            // Helper: Extract clean city name (handles "Osaka -> Kyoto" format)
                            const extractCityName = (city) => {
                                if (!city) return null;
                                // If city contains "->", extract last part (destination)
                                if (city.includes('->')) {
                                    return city.split('->').pop().trim();
                                }
                                // If city contains " → " (unicode arrow), extract last part
                                if (city.includes(' → ')) {
                                    return city.split(' → ').pop().trim();
                                }
                                return city.trim();
                            };

                            const rawCurrentCity = trip.locations?.[currentDisplayDate]?.city || trip.city;
                            const currentCity = extractCityName(rawCurrentCity);
                            const prevDateIdx = days.indexOf(currentDisplayDate) - 1;
                            const prevDate = prevDateIdx >= 0 ? days[prevDateIdx] : null;
                            const rawPrevCity = prevDate ? trip.locations?.[prevDate]?.city : null;
                            const prevCity = extractCityName(rawPrevCity);

                            // Normalize to same language for comparison (prevents "Kyoto" !== "京都")
                            const normalizedCurrent = getLocalizedCityName(currentCity, 'zh-TW');
                            const normalizedPrev = getLocalizedCityName(prevCity, 'zh-TW');
                            const isCrossCity = normalizedCurrent && normalizedPrev && normalizedCurrent !== normalizedPrev;

                            // Find cross-city transport for time/type display
                            const crossCityTransport = isCrossCity ? filteredItems.find(i =>
                                (i.type === 'train' || i.type === 'transport' || i.type === 'flight') &&
                                (i.details?.duration?.includes('hr') || parseInt(i.details?.duration) > 60 || i.arrival)
                            ) : null;

                            // Get transport type label
                            const getTransportIcon = () => {
                                if (!crossCityTransport) return '🚅';
                                const name = (crossCityTransport.name || '').toLowerCase();
                                if (name.includes('新幹線') || name.includes('shinkansen')) return '🚅';
                                if (name.includes('express') || name.includes('特急')) return '🚄';
                                if (name.includes('bus') || name.includes('巴士')) return '🚌';
                                if (name.includes('flight') || name.includes('航') || crossCityTransport.type === 'flight') return '✈️';
                                return '🚅';
                            };

                            // Scenario A: Cross-City Day (detected via trip.locations)
                            if (isCrossCity) {
                                const hasTransport = !!crossCityTransport;
                                const timeDisplay = hasTransport
                                    ? `${crossCityTransport.time || '??:??'} - ${crossCityTransport.details?.endTime || '??:??'}`
                                    : '';

                                // Normalize city names using localization (default to zh-TW)
                                const prevCityDisplay = getLocalizedCityName(prevCity, 'zh-TW');
                                const currentCityDisplay = getLocalizedCityName(currentCity, 'zh-TW');

                                return (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={handleOpenLocationModal}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all group ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'}`}
                                        >
                                            <span className="opacity-90">{prevCityDisplay}</span>
                                            <span className="opacity-50">→</span>
                                            <span>{hasTransport ? getTransportIcon() : '❓'}</span>
                                            <span className="opacity-50">→</span>
                                            <span className="font-black">{currentCityDisplay}</span>
                                        </button>
                                        {hasTransport && timeDisplay && (
                                            <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                                                {timeDisplay}
                                            </span>
                                        )}
                                        {!hasTransport && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isDarkMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                                ⚠️ 未輸入交通
                                            </span>
                                        )}
                                    </div>
                                );
                            }

                            // Scenario B: Same-day transport with arrival (Legacy fallback)
                            const transportItem = filteredItems.find(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);
                            if (transportItem) {
                                const startCity = transportItem.details?.location?.split(/->/)?.[0]?.trim() || currentCity || 'Origin';
                                const endCity = transportItem.arrival;
                                const time = transportItem.time || '??:??';
                                let timeDisplay = time;
                                if (transportItem.details?.duration) {
                                    const [h, m] = time.split(':').map(Number);
                                    const duration = Number(transportItem.details.duration);
                                    const endMins = h * 60 + m + duration;
                                    const endH = Math.floor(endMins / 60) % 24;
                                    const endM = endMins % 60;
                                    timeDisplay = `${time} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                                }

                                return (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleOpenLocationModal}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold border transition-all group ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-90">{startCity}</span>
                                                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                                                <span className="opacity-90">{endCity}</span>
                                            </div>
                                            <div className="h-3 w-[1px] bg-current opacity-20 mx-1"></div>
                                            <div className="flex items-center gap-1.5 opacity-80 font-mono tracking-tight">
                                                <Clock className="w-3 h-3" />
                                                <span>{timeDisplay}</span>
                                            </div>
                                        </button>
                                        <span className="text-[10px] opacity-40 font-bold hidden md:inline-block px-2 py-1 bg-white/5 rounded-lg border border-white/5">跨城移動</span>
                                    </div>
                                );
                            }

                            // Scenario C: Single City (Standard)
                            const isMissingTransport = isMultiCity && !filteredItems.some(i => (i.type === 'transport' || i.type === 'flight') && i.arrival);

                            return (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleOpenLocationModal}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <MapPin className="w-3 h-3 text-indigo-500" />
                                        {currentCity || "Location"}
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

                {/* V1.1: Edit Mode Indicator Banner */}
                {isEditMode && (
                    <div className="animate-fade-in mb-4">
                        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-2xl border border-indigo-500/30">
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                                        <GripVertical className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">🎛️ 編輯模式已啟用</h4>
                                        <p className="text-xs opacity-70">拖曳卡片以重新排序。變更會自動儲存。</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* V1.1 Phase 7: Undo/Redo Buttons */}
                                    <button
                                        onClick={onUndo}
                                        disabled={!canUndo}
                                        className={`p-2 rounded-lg transition-all ${canUndo ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300' : 'bg-gray-500/10 text-gray-600 cursor-not-allowed'}`}
                                        title="撤銷 (Undo)"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={onRedo}
                                        disabled={!canRedo}
                                        className={`p-2 rounded-lg transition-all ${canRedo ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300' : 'bg-gray-500/10 text-gray-600 cursor-not-allowed'}`}
                                        title="重做 (Redo)"
                                    >
                                        <Redo2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-1"
                                    >
                                        <CheckSquare className="w-3 h-3" /> 完成
                                    </button>
                                </div>
                            </div>
                            {/* V1.1 Phase 2: Auto-Shift Toggle */}
                            <div className={`flex items-center justify-between p-3 rounded-xl border ${autoShiftEnabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-500/20 bg-gray-500/5'}`}>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <div>
                                        <span className="text-xs font-bold">智能時間調整 (Smart Ripple)</span>
                                        <p className="text-[10px] opacity-60">拖拉時自動調整後續行程時間</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleAutoShift}
                                    className={`w-10 h-6 rounded-full transition-colors relative ${autoShiftEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoShiftEnabled ? 'left-5' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'list' ? (
                    <>
                        {/* V1.1 Day Summary Block (Moved outside Droppable) */}
                        {!searchValue && filteredItems.length > 0 && (
                            <div className="mb-4 pr-0">
                                <div className={`p-4 rounded-3xl border border-dashed ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50/50 border-indigo-200/50'}`}>
                                    {/* Summary Header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                                {filteredItems.length}
                                            </div>
                                            <div className="font-bold text-sm opacity-80">📋 本頁總覽</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onOpenAIModal?.('analysis')}
                                                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full border border-white/10 flex items-center gap-1 transition-colors opacity-50 cursor-not-allowed"
                                                disabled
                                                title="功能開發中，敬請期待"
                                            >
                                                <BrainCircuit className="w-3 h-3 text-gray-400" />
                                                <span className="font-bold text-gray-400">AI 分析</span>
                                            </button>
                                            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">SOON</span>
                                        </div>
                                    </div>

                                    {/* Metrics Grid - Responsive: 1 col mobile, 3 cols desktop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        {/* Total Expenses */}
                                        <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-black/20' : 'bg-white'}`}>
                                            <div className="text-[10px] opacity-50 font-bold mb-1">預算 Budget</div>
                                            {(() => {
                                                const localCurrency = trip?.currency || "JPY";
                                                const hkdToLocal = { JPY: 18.5, USD: 0.13, EUR: 0.12, GBP: 0.10, CNY: 0.92, TWD: 4.0, KRW: 166, HKD: 1 };
                                                let totalLocal = 0;
                                                filteredItems.forEach(item => totalLocal += (item.cost || 0));
                                                return (
                                                    <div>
                                                        <div className="text-sm font-black text-indigo-500">{localCurrency} {Math.round(totalLocal).toLocaleString()}</div>
                                                        <div className="text-[10px] opacity-40">≈ HKD {Math.round(totalLocal / (hkdToLocal[localCurrency] || 18.5)).toLocaleString()}</div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Hotel Info (Always show, with optional cross-city badge) */}
                                        {(() => {
                                            // V2.15: Use persistentHotel for continuous display
                                            // Prioritize details.nameEn or details.name to avoid showing action names like "Check-in"
                                            const hotelName = persistentHotel?.details?.nameEn || persistentHotel?.details?.name || persistentHotel?.name || '未預訂';

                                            // V2.15: Cross-city detection via trip.locations comparison
                                            const currentCity = trip.locations?.[currentDisplayDate]?.city;
                                            const prevDateIdx = days.indexOf(currentDisplayDate) - 1;
                                            const prevDate = prevDateIdx >= 0 ? days[prevDateIdx] : null;
                                            const prevCity = prevDate ? trip.locations?.[prevDate]?.city : null;
                                            const isCrossCity = currentCity && prevCity && currentCity !== prevCity;

                                            // Find cross-city transport for time display
                                            const crossCityTransport = isCrossCity ? filteredItems.find(i =>
                                                (i.type === 'train' || i.type === 'transport') &&
                                                (i.details?.duration?.includes('hr') || parseInt(i.details?.duration) > 60)
                                            ) : null;

                                            // Get transport type label
                                            const getTransportLabel = () => {
                                                if (!crossCityTransport) return '🚅';
                                                const name = (crossCityTransport.name || '').toLowerCase();
                                                if (name.includes('新幹線') || name.includes('shinkansen')) return '🚅 新幹線';
                                                if (name.includes('express') || name.includes('特急')) return '🚄 特急';
                                                if (name.includes('bus') || name.includes('巴士')) return '🚌 高速巴士';
                                                if (name.includes('flight') || name.includes('航')) return '✈️ 航班';
                                                return '🚅 鐵道';
                                            };

                                            // Find previous day's hotel for transition display (search backwards)
                                            const getPrevHotel = () => {
                                                if (!prevDate) return null;
                                                // Search backwards for any hotel record
                                                for (let i = prevDateIdx; i >= 0; i--) {
                                                    const checkDate = days[i];
                                                    const items = trip.itinerary?.[checkDate] || [];
                                                    const hotel = items.find(it => it.type === 'hotel');
                                                    if (hotel) {
                                                        // Make sure it's a different hotel (not same as current)
                                                        const prevName = hotel?.details?.nameEn || hotel?.details?.name || hotel?.name;
                                                        if (prevName && prevName !== hotelName) {
                                                            return prevName;
                                                        }
                                                    }
                                                }
                                                // Fallback: If no hotel found, try using previous city name
                                                if (prevCity && prevCity !== currentCity) {
                                                    return `${prevCity} 酒店`;
                                                }
                                                return null;
                                            };
                                            const prevHotelName = isCrossCity ? getPrevHotel() : null;

                                            return (
                                                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-black/20' : 'bg-white'}`}>
                                                    <div className="text-[10px] opacity-50 font-bold mb-1 flex items-center gap-1">
                                                        🏨 住宿
                                                    </div>
                                                    {isCrossCity && prevHotelName ? (
                                                        <>
                                                            <div className="text-[9px] text-gray-400 line-clamp-1 mb-0.5">{prevHotelName}</div>
                                                            <div className="text-[8px] opacity-40 my-0.5">↓</div>
                                                            <div className="text-xs font-bold text-emerald-500 line-clamp-1">{hotelName}</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs font-bold line-clamp-2">{hotelName}</div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Weather Info (Split Day/Night) */}
                                        <div className={`rounded-2xl overflow-hidden flex flex-col justify-between border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                                            {/* Top Row: Temp & Weather */}
                                            <div className={`flex items-center justify-between px-3 py-3 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                                                <div className={`flex items-center gap-2 w-1/2 justify-center border-r pr-2 ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                                                    <Sun className="w-4 h-4 text-amber-500" />
                                                    <span className="text-xl font-black opacity-90">{dailyWeather?.temp ? dailyWeather.temp.split('/')[0]?.trim() || '--' : '--'}</span>
                                                    <div className="scale-75 opacity-50">{dailyWeather?.icon}</div>
                                                </div>
                                                <div className="flex items-center gap-2 w-1/2 justify-center pl-2">
                                                    <Moon className="w-4 h-4 text-indigo-500" />
                                                    <span className="text-xl font-black opacity-90">{dailyWeather?.temp ? (dailyWeather.temp.split('/')[1]?.trim() || dailyWeather.temp) : '--'}</span>
                                                    <div className="scale-75 opacity-50">{dailyWeather?.icon}</div>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Clothing */}
                                            <div className={`flex items-center justify-between px-3 py-2 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                                                <div className={`flex items-center gap-2 w-1/2 justify-center border-r pr-2 overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                                    <Shirt className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-amber-200/50' : 'text-amber-600/50'}`} />
                                                    <span className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-amber-100/80' : 'text-amber-800/80'}`}>
                                                        {dailyWeather?.dayClothes || (dailyWeather?.clothes ? (dailyWeather.clothes.split(/[|/]/)[0]?.replace('日：', '').trim() || dailyWeather.clothes) : "暫無")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 w-1/2 justify-center pl-2 overflow-hidden">
                                                    <Shirt className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-indigo-200/50' : 'text-indigo-600/50'}`} />
                                                    <span className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-indigo-100/80' : 'text-indigo-800/80'}`}>
                                                        {dailyWeather?.nightClothes || (dailyWeather?.clothes ? (dailyWeather.clothes.split(/[|/]/)[1]?.replace('夜：', '').trim() || dailyWeather.clothes.split(/[|/]/)[0]?.replace('日：', '').trim()) : "暫無")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* V1.1 Phase 5: Hotel Transport Shortcuts UI */}
                                    {currentHotel && (!hasMorningDeparture || !hasEveningReturn) && (
                                        <div className="flex gap-2 mb-4">
                                            {!hasMorningDeparture && (
                                                <button
                                                    onClick={() => handleHotelShortcut('departure')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[11px] font-bold border transition-all ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
                                                >
                                                    <LogOut className="w-3.5 h-3.5 rotate-[-90deg]" /> 從酒店出發
                                                </button>
                                            )}
                                            {!hasEveningReturn && (
                                                <button
                                                    onClick={() => handleHotelShortcut('return')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[11px] font-bold border transition-all ${isDarkMode ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'}`}
                                                >
                                                    <LogIn className="w-3.5 h-3.5 rotate-[90deg]" /> 返回酒店
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Pro Tip Banner - Only show in Edit Mode */}
                                    {isEditMode && (
                                        <div className="flex items-start gap-2 text-[10px] opacity-60 bg-indigo-500/5 p-2 rounded-lg">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span className="hidden md:inline"><span className="font-bold">Pro Tip:</span> 拖曳卡片即可排序；點擊進入編輯。所有變更自動儲存。</span>
                                            <span className="md:hidden"><span className="font-bold">Pro Tip:</span> 長按卡片拖曳排序；點擊進入編輯。所有變更自動儲存。</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* V1.1 Phase 4: Time Conflict Warnings */}
                        {(() => {
                            const conflicts = detectTimeConflicts(filteredItems);
                            if (conflicts.length === 0) return null;

                            return (
                                <div className="mb-4 pr-0 animate-fade-in relative z-10">
                                    <div className={`p-4 rounded-3xl border-2 border-dashed ${isDarkMode ? 'bg-amber-500/5 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                                        <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            <span>行程注意 (Schedule Alerts)</span>
                                        </div>
                                        <div className="space-y-2">
                                            {conflicts.map((c, idx) => (
                                                <div key={idx} className={`text-xs p-2 rounded-xl flex items-center gap-2 ${c.type === 'overlap' ? (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600') : (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${c.type === 'overlap' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                    {c.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <DragDropContext onDragEnd={(result) => onDragEnd(result, autoShiftEnabled)}>
                            <Droppable droppableId="itinerary-list" isDropDisabled={!canEdit || !isEditMode}>
                                {(droppableProvided) => (
                                    <div
                                        ref={droppableProvided.innerRef}
                                        {...droppableProvided.droppableProps}
                                        className="relative space-y-6 pt-2 pb-6 pl-0 md:pl-4"
                                    >
                                        <div className="absolute left-[17px] md:left-[31px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500/20 via-indigo-500/10 to-transparent"></div>
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
                                                {/* V1.1 Day Summary Block REMOVED (Moved Up) */}

                                                {filteredItems.map((item, i) => {
                                                    // Unified Transport Card for Flight, Transport, Walk, Immigration, Train (V1.0.6)
                                                    if (item.type === 'flight' || item.type === 'transport' || item.type === 'walk' || item.type === 'immigration' || item.type === 'train') {
                                                        // Find hotel for the day to pass as potential destination
                                                        const dayHotel = filteredItems.find(x => x.type === 'hotel');

                                                        return (
                                                            <Draggable key={String(item.id)} draggableId={String(item.id)} index={i} isDragDisabled={!canEdit || !isEditMode || item.isVirtual}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        onClick={() => {
                                                                            const originalIndex = itineraryItems.indexOf(item);
                                                                            const itemWithIndex = { ...item, _index: originalIndex };
                                                                            // V1.1 Fix: Always show details modal, edit is via button inside
                                                                            setActiveDetailItem(itemWithIndex);
                                                                        }}
                                                                        className={`relative z-10 mb-6 animate-fade-in-up ${isEditMode ? 'cursor-grab' : ''} ${snapshot.isDragging ? 'opacity-90 shadow-2xl scale-[1.02] ring-2 ring-indigo-500 z-50' : ''}`}
                                                                        style={{ animationDelay: `${i * 50}ms`, ...provided.draggableProps.style }}
                                                                    >
                                                                        {/* V1.1: Visible Drag Handle in Edit Mode */}
                                                                        {isEditMode && (
                                                                            <div
                                                                                {...provided.dragHandleProps}
                                                                                className="absolute -left-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500/80 rounded-lg cursor-grab active:cursor-grabbing shadow-lg z-50 hover:bg-indigo-600 transition-colors"
                                                                            >
                                                                                <GripVertical className="w-4 h-4 text-white" />
                                                                            </div>
                                                                        )}
                                                                        {/* Time Bubble & Line Connector (Unified) */}
                                                                        <div className="absolute left-0 top-0 flex flex-col items-center w-[36px] md:w-[60px]">
                                                                            <div className={`mt-0 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight z-20 shadow-sm border
                                                        ${(item.type === 'flight' || (item.name || '').includes('航空')) ? 'bg-blue-600 text-white border-blue-400/30' :
                                                                                    (item.type === 'immigration' || (item.name || '').includes('入境') || (item.name || '').includes('海關')) ? 'bg-amber-600 text-white border-amber-400/30' :
                                                                                        ((item.name || '').includes('metro') || (item.name || '').includes('地鐵') || (item.name || '').includes('都營') || (item.name || '').includes('MTR')) ? 'bg-teal-600 text-white border-teal-400/30' :
                                                                                            (item.type === 'train' || (item.name || '').includes('jr') || (item.name || '').includes('鐵') || (item.name || '').includes('express')) ? 'bg-emerald-600 text-white border-emerald-400/30' :
                                                                                                (item.type === 'walk' || (item.name || '').includes('步')) ? 'bg-purple-600 text-white border-purple-400/30' :
                                                                                                    'bg-indigo-600 text-white border-indigo-400/30'} 
                                                        ${isDarkMode ? 'shadow-lg shadow-black/20' : ''}`}>
                                                                                {item.details?.time || item.time || "--:--"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="ml-[48px] md:ml-[70px] hover:scale-[1.01] transition-transform duration-300 relative z-10">
                                                                            <TransportCard
                                                                                item={item}
                                                                                isDarkMode={isDarkMode}
                                                                                dayHotel={dayHotel}
                                                                                onEdit={(item) => onEditItem(item)}
                                                                            />
                                                                        </div>

                                                                        {/* Connector logic for gaps after transport */}
                                                                        {(() => {
                                                                            const nextItem = filteredItems[i + 1];
                                                                            const isGap = nextItem && !['transport', 'walk', 'flight', 'immigration'].includes(nextItem.type);
                                                                            if (isGap && !isEditMode && !item.isVirtual) return (
                                                                                <TransportConnector
                                                                                    fromItem={item}
                                                                                    toItem={nextItem}
                                                                                    isDarkMode={isDarkMode}
                                                                                    onAdd={(newItem) => onAddItem(newItem)}
                                                                                />
                                                                            );
                                                                            return null;
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    }

                                                    // Standard Card (Spot, Food, Hotel, Shopping) with Image
                                                    return (
                                                        <Draggable key={String(item.id || i)} draggableId={String(item.id || i)} index={i} isDragDisabled={!canEdit || !isEditMode || item.isVirtual}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    id={`item-${item.id}`}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    onClick={() => {
                                                                        const originalIndex = itineraryItems.indexOf(item);
                                                                        const itemWithIndex = { ...item, _index: originalIndex };
                                                                        setActiveDetailItem(itemWithIndex);
                                                                    }}
                                                                    className={`relative z-10 animate-fade-in-up group mb-6 ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${snapshot.isDragging ? 'opacity-90 shadow-2xl scale-[1.02] ring-2 ring-indigo-500 z-50' : ''}`}
                                                                    style={{ animationDelay: `${i * 50}ms`, ...provided.draggableProps.style }}
                                                                >
                                                                    {/* V1.1: Visible Drag Handle in Edit Mode */}
                                                                    {isEditMode && (
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="absolute -left-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500/80 rounded-lg cursor-grab active:cursor-grabbing shadow-lg z-50 hover:bg-indigo-600 transition-colors"
                                                                        >
                                                                            <GripVertical className="w-4 h-4 text-white" />
                                                                        </div>
                                                                    )}

                                                                    {/* Time Bubble & Line Connector */}
                                                                    <div className="absolute left-0 top-0 flex flex-col items-center w-[36px] md:w-[60px]">
                                                                        <div className={`mt-0 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight z-20 shadow-sm border
                                                        ${item.type === 'hotel' ? 'bg-rose-600 text-white border-rose-400/30' :
                                                                                item.type === 'food' ? 'bg-orange-600 text-white border-orange-400/30' :
                                                                                    item.type === 'shopping' ? 'bg-pink-600 text-white border-pink-400/30' :
                                                                                        (item.type === 'activity' || item.type === 'spot') ? 'bg-cyan-600 text-white border-cyan-400/30' :
                                                                                            'bg-gray-600 text-white border-gray-400/30'} 
                                                        ${isDarkMode ? 'shadow-lg shadow-black/20' : ''}`}>
                                                                            {item.details?.time || item.time || "--:--"}
                                                                        </div>
                                                                    </div>

                                                                    <div className="ml-[48px] md:ml-[70px] hover:scale-[1.01] transition-transform duration-300 relative z-10">
                                                                        <StandardCard
                                                                            item={item}
                                                                            isDarkMode={isDarkMode}
                                                                            onEdit={(item) => onEditItem(item)}
                                                                        />
                                                                    </div>

                                                                    {/* Connector logic for gaps after standard spot */}
                                                                    {(() => {
                                                                        const nextItem = filteredItems[i + 1];
                                                                        const isGap = nextItem && !['transport', 'walk', 'flight', 'immigration'].includes(nextItem.type);
                                                                        if (isGap && !isEditMode && !item.isVirtual) return (
                                                                            <TransportConnector
                                                                                fromItem={item}
                                                                                toItem={nextItem}
                                                                                isDarkMode={isDarkMode}
                                                                                onAdd={(newItem) => onAddItem(newItem)}
                                                                            />
                                                                        );
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                            </>
                                        )}
                                        {droppableProvided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
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
                        {/* Location List - Added padding to prevent scale/ring clipping */}
                        <div className="space-y-2.5 overflow-y-auto custom-scrollbar p-1.5 max-h-[450px]">
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
                                        className={`mx-0.5 p-2.5 rounded-xl border flex gap-3 transition-all cursor-pointer relative overflow-hidden group 
                                            ${isPreviewing ? `ring-2 shadow-lg scale-[1.02] z-10 ${{
                                                    flight: 'ring-indigo-500 shadow-indigo-500/20 bg-indigo-500/5 border-indigo-500/30',
                                                    hotel: 'ring-rose-500 shadow-rose-500/20 bg-rose-500/5 border-rose-500/30',
                                                    food: 'ring-orange-500 shadow-orange-500/20 bg-orange-500/5 border-orange-500/30',
                                                    spot: 'ring-cyan-500 shadow-cyan-500/20 bg-cyan-500/5 border-cyan-500/30',
                                                    transport: 'ring-purple-500 shadow-purple-500/20 bg-purple-500/5 border-purple-500/30',
                                                    shopping: 'ring-pink-500 shadow-pink-500/20 bg-pink-500/5 border-pink-500/30'
                                                }[item.type] || 'ring-gray-500'
                                                }` : `hover:shadow-md hover:-translate-y-0.5 z-0 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`} shadow-sm`}
                                    >
                                        {/* Ticket Border Accent - Synced with Tag Palette */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${{
                                                flight: 'bg-indigo-600',
                                                hotel: 'bg-rose-600',
                                                food: 'bg-orange-600',
                                                spot: 'bg-cyan-600',
                                                transport: 'bg-purple-600',
                                                shopping: 'bg-pink-600'
                                            }[item.type] || 'bg-gray-600'
                                            }`} />

                                        {/* Left Side: Number & Icon - Added pl-1 to avoid accent bar overlap */}
                                        <div className="flex flex-col items-center justify-center min-w-[36px] gap-1 opacity-80 border-r border-dashed border-gray-500/10 pr-2 pl-1.5">
                                            <span className={`text-[10px] font-black font-mono ${{
                                                    flight: 'text-indigo-500',
                                                    hotel: 'text-rose-500',
                                                    food: 'text-orange-500',
                                                    spot: 'text-cyan-500',
                                                    transport: 'text-purple-500',
                                                    shopping: 'text-pink-500'
                                                }[item.type] || 'text-gray-500'
                                                }`}>#{idx + 1}</span>
                                            {(() => {
                                                const Icon = {
                                                    flight: Plane,
                                                    hotel: Hotel,
                                                    food: Utensils,
                                                    spot: MapPin,
                                                    transport: Car,
                                                    shopping: ShoppingBag
                                                }[item.type] || MapPin;
                                                return <Icon className={`w-3.5 h-3.5 ${{
                                                        flight: 'text-indigo-500',
                                                        hotel: 'text-rose-500',
                                                        food: 'text-orange-500',
                                                        spot: 'text-cyan-500',
                                                        transport: 'text-purple-500',
                                                        shopping: 'text-pink-500'
                                                    }[item.type] || 'text-gray-500'
                                                    }`} />;
                                            })()}
                                        </div>

                                        {/* Right Side: Content */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className={`text-[10px] font-black font-mono tracking-tight ${{
                                                        flight: 'text-indigo-400',
                                                        hotel: 'text-rose-400',
                                                        food: 'text-orange-400',
                                                        spot: 'text-cyan-400',
                                                        transport: 'text-purple-400',
                                                        shopping: 'text-pink-400'
                                                    }[item.type] || 'text-gray-400'
                                                    }`}>{item.details?.time || item.time || "--:--"}</span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details?.location || trip.city)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1 hover:bg-black/10 rounded transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={`font-bold text-xs leading-tight truncate pr-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name.replace(/^[✈️🏨🚆🍽️⛩️🛍️🎢🛂]+ /, '')}</div>
                                            <div className="text-[9px] opacity-50 truncate flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                                {item.details?.location}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default ItineraryTab;
