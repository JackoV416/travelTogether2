import React, { useState, useEffect, useRef } from 'react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';
import {
    Map as MapIcon, MapPinned, List, Navigation, PlaneTakeoff, Hotel, Utensils,
    Bus, ShoppingBag, Clock, CalendarDays, GripVertical, MapPin, BusFront, Car, Route, TrainFront, Wand2,
    Plus, Sparkles, BrainCircuit, Edit3, Info, Quote, CheckSquare, Trash2, ExternalLink, FileText, Loader2
} from 'lucide-react';
import { CURRENCIES } from '../../../constants/appData';
import { suggestTransportBetweenSpots } from '../../../services/ai-parsing';
import { formatDuration, getSmartItemImage } from '../../../utils/tripUtils';

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
    onUpdateLocation
}) => {
    // Local UI State
    const [mapScope, setMapScope] = useState('daily'); // 'daily' or 'full'
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ type: 'all' });
    const [searchValue, setSearchValue] = useState("");
    const [previewLocation, setPreviewLocation] = useState(null); // For map preview

    // Location Editing State
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locForm, setLocForm] = useState({ country: "", city: "" });

    // Initialize location form when opening
    const handleOpenLocationModal = () => {
        const currentLoc = trip.locations?.[currentDisplayDate] || { country: trip.country || "", city: trip.city || "" };
        setLocForm(currentLoc);
        setIsLocationModalOpen(true);
    };

    const handleSaveLocation = () => {
        onUpdateLocation(currentDisplayDate, locForm);
        setIsLocationModalOpen(false);
    };

    // AI Transport Suggestions State
    const [transportSuggestions, setTransportSuggestions] = useState({}); // { "itemId-nextItemId": suggestion }
    const [loadingTransport, setLoadingTransport] = useState(null); // Currently loading suggestion key

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
    const filteredItems = itineraryItems.filter(item => {
        const matchesSearch = !searchValue ||
            item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            (item.details?.location || "").toLowerCase().includes(searchValue.toLowerCase());

        const matchesFilter = activeFilters.type === 'all' || item.type === activeFilters.type;

        return matchesSearch && matchesFilter;
    });

    // Calculate map locations based on scope
    const allLocations = mapScope === 'daily'
        ? (trip.itinerary?.[currentDisplayDate] || []).map(item => ({ date: currentDisplayDate, ...item })).filter(item => item.details?.location)
        : days.flatMap(d => (trip.itinerary?.[d] || []).map(item => ({ date: d, ...item }))).filter(item => item.details?.location);
    const mapQuery = allLocations.length ? allLocations.map(item => item.details.location).join(' via ') : `${trip.city} ${trip.country} `;

    // Types mapping
    const typeStyles = {
        flight: { bg: 'bg-sky-500/15', border: 'border-sky-500/30', icon: 'text-sky-500' },
        hotel: { bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', icon: 'text-indigo-500' },
        spot: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: 'text-emerald-500' },
        food: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: 'text-orange-500' },
        shopping: { bg: 'bg-pink-500/15', border: 'border-pink-500/30', icon: 'text-pink-500' },
        transport: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', icon: 'text-blue-500' }
    };

    const glassCardClass = (dark) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dark ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

    return (
        <div className="space-y-6 animate-fade-in relative">
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
                        {/* Daily Location Badge */}
                        <button
                            onClick={handleOpenLocationModal}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            {trip.locations?.[currentDisplayDate]?.city || trip.locations?.[currentDisplayDate]?.country || (trip.city ? `${trip.city} (預設)` : "設定位置")}
                        </button>
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
                        {/* {canEdit && <button onClick={onOptimize} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`} title="AI 智能排程優化"><Wand2 className="w-5 h-5" /></button>} */}
                        {canEdit && <button onClick={() => onAddItem(currentDisplayDate, 'spot')} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95">+ 新增</button>}
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="p-0 space-y-0 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/50 before:via-purple-500/30 before:to-transparent">
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
                        ) : filteredItems.map((item, i) => {
                            const advice = getTransportAdvice(item, trip.city);
                            const transportMeta = advice ? TRANSPORT_ICONS[advice.mode] : null;
                            const TransportIcon = transportMeta?.icon;

                            const style = typeStyles[item.type] || typeStyles.spot;

                            return (
                                <div
                                    id={`item-${item.id}`}
                                    key={item.id || i}
                                    draggable={canEdit && isEditMode}
                                    onDragStart={(e) => onDragStart && onDragStart(e, i)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => onDrop && onDrop(e, i)}
                                    onClick={() => { if (canEdit) onEditItem(item); }}
                                    className={`flex gap-4 items-start p-4 mb-4 rounded-xl border transition-all cursor-pointer group shadow-sm ${isDarkMode ? 'border-gray-500/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {/* Edit Mode Grip */}
                                    {isEditMode && (
                                        <div className="mt-1 opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                    )}

                                    {/* Time Block */}
                                    <div className="font-mono text-sm font-bold text-indigo-400 pt-1 w-12 flex-shrink-0">
                                        {item.details?.time || item.time || "--:--"}
                                    </div>

                                    {/* Image Thumbnail */}
                                    <div className="w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden flex-shrink-0 relative group/img">
                                        <img
                                            src={getSmartItemImage(item, trip)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                            onError={(e) => { e.target.src = getSmartItemImage({ type: item.type }, trip); }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    </div>

                                    {/* Icon & Content Wrapper */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-start gap-3">
                                            {/* Style-based Icon */}
                                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${style.bg} ${style.icon}`}>
                                                {item.type === 'flight' ? <PlaneTakeoff className="w-5 h-5" /> :
                                                    item.type === 'hotel' ? <Hotel className="w-4 h-4" /> :
                                                        item.type === 'food' ? <Utensils className="w-4 h-4" /> :
                                                            item.type === 'transport' ? (TRANSPORT_ICONS[item.details?.transportType]?.icon ? React.createElement(TRANSPORT_ICONS[item.details.transportType].icon, { className: 'w-4 h-4' }) : <Bus className="w-4 h-4" />) :
                                                                item.type === 'shopping' ? <ShoppingBag className="w-4 h-4" /> :
                                                                    <MapPin className="w-4 h-4" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base flex items-center gap-2 flex-wrap">
                                                    {item.name}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-500/10 text-orange-400' :
                                                        item.type === 'transport' ? 'bg-indigo-500/10 text-indigo-400' :
                                                            item.type === 'hotel' ? 'bg-amber-500/10 text-amber-400' :
                                                                'bg-blue-500/10 text-blue-400'
                                                        }`}>{
                                                            item.type === 'food' ? '美食' :
                                                                item.type === 'transport' ? '交通' :
                                                                    item.type === 'hotel' ? '住宿' :
                                                                        '景點'
                                                        }</span>
                                                    {item.smartTag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">{item.smartTag}</span>}
                                                </div>

                                                <div className="text-xs opacity-60 flex items-center gap-2 mt-1">
                                                    {item.details?.location && <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors"><MapPin className="w-3 h-3" />{item.details.location}</span>}
                                                    {item.type === 'transport' && (item.details?.distance || item.details?.duration) && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-500/10 rounded text-[10px] text-indigo-400 font-mono">
                                                            <Route className="w-2.5 h-2.5" />
                                                            {item.details.distance}{item.details.duration && ` · ${formatDuration(item.details.duration)}`}
                                                            {item.details.steps && ` · ${item.details.steps} 步`}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* AI Insights and Transport Suggestions as expanded details */}
                                                {(item.details?.insight || item.details?.reason) && (
                                                    <div className={`mt-3 p-3 rounded-xl border flex items-start gap-3 animate-fade-in ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
                                                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white shadow-sm'}`}>
                                                            {item.type === 'shopping' ? <Quote className="w-3 h-3 text-purple-400" /> : <Info className="w-3 h-3 text-indigo-400" />}
                                                        </div>
                                                        <div className="text-[11px] leading-relaxed opacity-80 italic">
                                                            「{item.details.insight || item.details.reason}」
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI Smart Transport Button */}
                                                {i < filteredItems.length - 1 && item.type !== 'transport' && filteredItems[i + 1]?.type !== 'transport' && (
                                                    (() => {
                                                        const nextItem = filteredItems[i + 1];
                                                        const suggestionKey = `${item.id}-${nextItem.id}`;
                                                        const aiSuggestion = transportSuggestions[suggestionKey];
                                                        const isLoading = loadingTransport === suggestionKey;

                                                        return (
                                                            <div className={`mt-3 p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/30 border-indigo-100'}`}>
                                                                {!aiSuggestion ? (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            fetchTransportSuggestion(item, nextItem);
                                                                        }}
                                                                        disabled={isLoading}
                                                                        className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                                                                    >
                                                                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                                        <span>🚀 AI 建議交通 → {nextItem.name}</span>
                                                                    </button>
                                                                ) : aiSuggestion.error ? (
                                                                    <div className="text-[9px] opacity-40 italic">暫無 AI 交通建議</div>
                                                                ) : (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center justify-between gap-2 text-[10px]">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-indigo-400 font-bold">🎯 AI 推薦:</span>
                                                                                <span className="font-bold flex items-center gap-1">
                                                                                    {aiSuggestion.recommended?.mode === 'taxi' ? '🚕' : aiSuggestion.recommended?.mode === 'bus' ? '🚌' : '🚇'}
                                                                                    {aiSuggestion.recommended?.name}
                                                                                </span>
                                                                                <span className="opacity-60">• {formatDuration(aiSuggestion.recommended?.duration)}</span>
                                                                            </div>
                                                                            {canEdit && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onAddTransportSuggestion(currentDisplayDate, aiSuggestion.recommended, i);
                                                                                    }}
                                                                                    className="px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[9px] font-bold hover:bg-indigo-600 transition-colors flex items-center gap-1"
                                                                                >
                                                                                    <Plus className="w-3 h-3" /> 加入行程
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[9px] opacity-50 pl-4 border-l border-indigo-500/20">
                                                                            {aiSuggestion.recommended?.steps?.slice(0, 2).join(' → ')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost/Action Block */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        {item.cost > 0 && (
                                            <div className="text-right">
                                                <div className="font-mono font-black text-sm text-indigo-500">{item.currency} {item.cost.toLocaleString()}</div>
                                                {item.currency !== 'HKD' && CURRENCIES[item.currency] && (
                                                    <div className="text-[9px] opacity-40 font-mono">
                                                        ≈ HKD {Math.round(item.cost / CURRENCIES[item.currency].rate).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {item.details?.location && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details.location)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                            >
                                                <Navigation className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[450px] grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Map Embed - Using Google Maps Embed */}
                        {/* Map Embed - Using Google Maps Embed */}
                        <div className="md:col-span-2 w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
                            <iframe
                                title="trip-map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
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
