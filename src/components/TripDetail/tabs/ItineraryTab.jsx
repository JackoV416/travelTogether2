import React, { useState } from 'react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import {
    Map as MapIcon, MapPinned, List, Navigation, PlaneTakeoff, Hotel, Utensils,
    Bus, ShoppingBag, Clock, CalendarDays, GripVertical, MapPin, BusFront, Car, Route, TrainFront, Wand2,
    Plus, Sparkles, BrainCircuit, Edit3, Info, Quote, CheckSquare
} from 'lucide-react';
import { CURRENCIES } from '../../../constants/appData';

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
    onOpenSmartImport
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [activeFilters, setActiveFilters] = useState({ type: 'all' });
    const [isEditMode, setIsEditMode] = useState(false);

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

    // Calculate map locations
    const allLocations = days.flatMap(d => (trip.itinerary?.[d] || []).map(item => ({ date: d, ...item }))).filter(item => item.details?.location);
    const mapQuery = allLocations.length ? allLocations.map(item => item.details.location).join(' via ') : `${trip.city} ${trip.country} `;
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`;

    // Types mapping
    const typeStyles = {
        flight: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', icon: 'text-blue-500' },
        hotel: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: 'text-amber-500' },
        food: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', icon: 'text-rose-500' },
        spot: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: 'text-emerald-500' },
        transport: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: 'text-purple-500' },
        shopping: { bg: 'bg-pink-500/15', border: 'border-pink-500/30', icon: 'text-pink-500' }
    };

    const glassCardClass = (dark) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dark ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

    return (
        <div className="space-y-6 animate-fade-in">
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
                    <div className="font-bold text-lg flex items-center gap-3">{formatDate(currentDisplayDate)}</div>
                    <div className="flex gap-2 flex-wrap justify-end items-center">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${isEditMode ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' : (isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50')}`}
                        >
                            {isEditMode ? <CheckSquare className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            {isEditMode ? '完成編輯' : '編輯行程'}
                        </button>

                        <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}>{viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}</button>
                        {canEdit && <button onClick={onOptimize} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`} title="AI 智能排程優化"><Wand2 className="w-5 h-5" /></button>}
                        <button onClick={() => onOpenSmartImport ? onOpenSmartImport() : openSectionModal('import', 'itinerary')} className={`px-3 py-1 rounded-lg border text-xs ${isDarkMode ? 'border-white/20 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}>匯入</button>
                        <button onClick={() => openSectionModal('export', 'itinerary')} className={`px-3 py-1 rounded-lg border text-xs ${isDarkMode ? 'border-white/20 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}>匯出</button>
                        {canEdit && <button onClick={() => onAddItem(currentDisplayDate, 'spot')} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95">+ 新增</button>}
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="p-0 space-y-0 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/50 before:via-purple-500/30 before:to-transparent">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-12 opacity-60">
                                {searchValue || activeFilters.type !== 'all' ? (
                                    <>
                                        <div className="text-sm">找不到符合的結果</div>
                                        <button onClick={() => { setSearchValue(""); setActiveFilters({ type: 'all' }); }} className="text-xs text-indigo-500 hover:underline mt-1">清除搜尋</button>
                                    </>
                                ) : (
                                    <>
                                        <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                        <h3 className="text-xl font-bold mb-8">今日尚未安排行程</h3>

                                        {canEdit && (
                                            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                                                <button
                                                    onClick={() => onAddItem(currentDisplayDate, 'spot')}
                                                    className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} border border-white/5 backdrop-blur-xl shadow-lg`}
                                                >
                                                    <div className="p-2.5 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                                                        <Edit3 className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm">手動新增行程</div>
                                                        <div className="text-[10px] opacity-50 text-gray-400">景點、餐廳或交通</div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => onOpenAIModal('full')}
                                                    className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-95 ${isDarkMode ? 'bg-purple-500/20 hover:bg-purple-500/30' : 'bg-purple-50 hover:bg-purple-100'} border border-purple-500/20 shadow-lg`}
                                                >
                                                    <div className="p-2.5 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                                                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm text-purple-400">AI 智能領隊</div>
                                                        <div className="text-[10px] opacity-60 text-purple-400/70">一鍵生成完整旅遊計畫</div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={onOptimize}
                                                    className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-95 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/20 border border-white/10`}
                                                >
                                                    <div className="p-2.5 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm">AI 快速排程</div>
                                                        <div className="text-[10px] opacity-80">優化當前動線與路線</div>
                                                    </div>
                                                </button>

                                                <div className="mt-2 text-center">
                                                    <button
                                                        onClick={() => onOpenSmartImport ? onOpenSmartImport() : openSectionModal('import', 'itinerary')}
                                                        className={`flex items-center justify-center gap-2 py-2 px-4 mx-auto rounded-xl transition-all text-[10px] opacity-40 hover:opacity-100 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <List className="w-3.5 h-3.5" /> 從其他行程匯入數據
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : filteredItems.map((item, i) => {
                            const advice = getTransportAdvice(item, trip.city);
                            const transportMeta = advice ? TRANSPORT_ICONS[advice.mode] : null;
                            const TransportIcon = transportMeta?.icon;

                            const style = typeStyles[item.type] || typeStyles.spot;

                            return (
                                <div
                                    key={item.id || i}
                                    draggable={canEdit && isEditMode}
                                    onDragStart={(e) => onDragStart && onDragStart(e, i)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => onDrop && onDrop(e, i)}
                                    onClick={() => { if (canEdit) onEditItem(item); }}
                                    className={`group relative pl-12 pr-4 py-6 border-b border-transparent transition-all duration-300 cursor-pointer ${isEditMode ? 'hover:bg-indigo-500/5' : ''}`}
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-[13px] top-8 w-[10px] h-[10px] rounded-full border-2 z-10 transition-all duration-500 group-hover:scale-150 ${style.icon.replace('text-', 'bg-').replace('text-', 'border-')} ${isDarkMode ? 'border-gray-900' : 'border-white'}`}></div>

                                    {/* 序號標籤 (Only in Edit Mode) */}
                                    {isEditMode && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 p-1 opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing transition-opacity">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className={`absolute left-9 top-6 px-1.5 py-0.5 text-[9px] font-mono opacity-40`}>
                                        {String(i + 1).padStart(2, '0')}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* 類型圖標 */}
                                        <div className={`p-3 rounded-2xl shadow-sm transition-all duration-500 group-hover:shadow-md ${item.type === 'flight' ? 'bg-indigo-600 text-white' : `${style.bg} ${style.icon}`}`}>
                                            {item.type === 'flight' ? <PlaneTakeoff className="w-6 h-6 animate-pulse" /> :
                                                item.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                                                    item.type === 'food' ? <Utensils className="w-5 h-5" /> :
                                                        item.type === 'transport' ? (TRANSPORT_ICONS[item.details?.transportType]?.icon ? React.createElement(TRANSPORT_ICONS[item.details.transportType].icon, { className: 'w-5 h-5' }) : <Bus className="w-5 h-5" />) :
                                                            item.type === 'shopping' ? <ShoppingBag className="w-5 h-5" /> :
                                                                <MapIcon className="w-5 h-5" />}
                                        </div>

                                        {/* 內容 */}
                                        <div className="flex-grow min-w-0">
                                            <div className="font-bold text-base truncate">{item.name}</div>
                                            <div className="text-xs opacity-60 flex items-center gap-3 mt-1 flex-wrap">
                                                {item.details?.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.details.time}</span>}
                                                {item.details?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.details.location}</span>}
                                            </div>
                                        </div>

                                        {/* 費用 */}
                                        {item.cost > 0 && (
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-sm">{item.currency} {item.cost.toLocaleString()}</div>
                                                {item.currency !== 'HKD' && CURRENCIES[item.currency] && (
                                                    <div className="text-[9px] opacity-40 font-mono">
                                                        ≈ HKD {Math.round(item.cost / CURRENCIES[item.currency].rate).toLocaleString()}
                                                    </div>
                                                )}
                                                <div className="text-[10px] opacity-50">{item.payer || '未指定'} • {item.splitType === 'group' ? '多人' : '個人'}</div>
                                            </div>
                                        )}

                                        {/* 導航按鈕 */}
                                        {item.details?.location && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details.location)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-indigo-500 hover:bg-indigo-500/20 rounded-xl transition-colors"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>

                                    {/* AI 洞察 / 歷史 / 理由 */}
                                    {(item.details?.insight || item.details?.reason) && (
                                        <div className={`mt-3 p-3 rounded-xl border flex items-start gap-3 animate-fade-in ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
                                            <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white shadow-sm'}`}>
                                                {item.type === 'shopping' ? <Quote className="w-3.5 h-3.5 text-purple-400" /> : <Info className="w-3.5 h-3.5 text-indigo-400" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold opacity-60 mb-0.5">{item.type === 'shopping' ? 'AI 必買理由' : 'AI 景點小教室'}</div>
                                                <div className="text-[11px] leading-relaxed opacity-80 italic">
                                                    「{item.details.insight || item.details.reason}」
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                    {/* 交通建議 */}
                                    {advice && (
                                        <div className="mt-3 pt-3 border-t border-dashed border-white/20 text-[11px] opacity-70 flex items-center gap-2 flex-wrap">
                                            {TransportIcon && <TransportIcon className={`w-4 h-4 ${transportMeta.color}`} />}
                                            <span>交通建議：{advice.label} • {advice.cost}</span>
                                            {advice.mode === 'walk' && advice.meta && (
                                                <span className="opacity-70">（約 {advice.meta.steps.toLocaleString()} 步 / {advice.meta.distance} km）</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[450px] grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Map Embed - Using OpenStreetMap (no API key needed) */}
                        <div className="md:col-span-2 w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
                            <iframe
                                title="trip-map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${trip.city}`)}&layer=mapnik&marker=${encodeURIComponent(trip.city)}`}
                                style={{ border: 0 }}
                            />
                            <a
                                href={`https://www.google.com/maps/dir/${allLocations.map(item => encodeURIComponent(item.details?.location || trip.city)).join('/')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-3 right-3 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <Navigation className="w-4 h-4" /> 開啟完整路線
                            </a>
                        </div>
                        {/* Location List */}
                        <div className="space-y-2 overflow-y-auto custom-scrollbar p-0 max-h-[450px]">
                            <div className="text-xs font-bold opacity-50 mb-2 px-1">行程地點 ({allLocations.length})</div>
                            {allLocations.length === 0 ? <div className="text-sm opacity-60 p-3">尚未有地點資訊。</div> : allLocations.map((item, idx) => {
                                const typeStyle = {
                                    flight: 'border-blue-500/30 bg-blue-500/10',
                                    hotel: 'border-amber-500/30 bg-amber-500/10',
                                    food: 'border-rose-500/30 bg-rose-500/10',
                                    spot: 'border-emerald-500/30 bg-emerald-500/10',
                                    transport: 'border-purple-500/30 bg-purple-500/10',
                                    shopping: 'border-pink-500/30 bg-pink-500/10'
                                }[item.type] || 'border-gray-500/30 bg-gray-500/10';

                                return (
                                    <a
                                        key={`${item.id}-${idx}`}
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details?.location || trip.city)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`p-3 rounded-xl border flex flex-col gap-1 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${typeStyle} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] opacity-50 flex items-center gap-1">
                                                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold">{idx + 1}</span>
                                                {formatDate(item.date)}
                                            </div>
                                            <Navigation className="w-3 h-3 text-indigo-400" />
                                        </div>
                                        <div className="font-bold text-sm">{item.name}</div>
                                        <div className="text-[10px] opacity-60 truncate">{item.details?.location}</div>
                                    </a>
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
