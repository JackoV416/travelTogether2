import React from 'react';
import {
    Map as MapIcon, MapPinned, List, Navigation, PlaneTakeoff, Hotel, Utensils,
    Bus, ShoppingBag, Clock, CalendarDays, GripVertical, MapPin, BusFront, Car, Route, TrainFront
} from 'lucide-react';

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
    openSectionModal
}) => {

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
            <div className="flex gap-3 overflow-x-auto pb-2">
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

            {/* Daily Summary Header */}
            <div className="p-4 bg-white/10 border border-white/20 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-lg font-bold">{dailyWeather.icon} {dailyWeather.temp}</div>
                    <div className="text-xs opacity-80">
                        <div>最高: {dailyWeather.temp} / 最低: {parseInt(dailyWeather.temp || "20") - 8}°C</div>
                        <div className="flex items-center gap-2">衣著: {dailyWeather.clothes}{dailyWeather.outfitIcon && <img src={dailyWeather.outfitIcon} alt="outfit" className="w-6 h-6" />}</div>
                    </div>
                </div>
                <div className="text-xs opacity-80 flex items-center gap-2">
                    <Clock className="w-4 h-4" />{dailyReminder}
                </div>
            </div>

            <div className={glassCardClass(isDarkMode) + " p-4 min-h-[400px]"}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div className="font-bold text-lg flex items-center gap-3">{formatDate(currentDisplayDate)}</div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}>{viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}</button>
                        <button onClick={() => openSectionModal('import', 'itinerary')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                        <button onClick={() => openSectionModal('export', 'itinerary')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
                        {canEdit && <button onClick={() => onAddItem(currentDisplayDate, 'spot')} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95">+ 新增</button>}
                    </div>
                </div>
                {viewMode === 'list' ? (
                    <div className="p-4 space-y-3">
                        {itineraryItems.length === 0 ? (
                            <div className="text-center py-12 opacity-60">
                                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <div className="text-sm">今日尚未安排行程</div>
                                {canEdit && <div className="text-xs mt-1">點擊上方「+ 新增」開始規劃</div>}
                            </div>
                        ) : itineraryItems.map((item, i) => {
                            const advice = getTransportAdvice(item, trip.city);
                            const transportMeta = advice ? TRANSPORT_ICONS[advice.mode] : null;
                            const TransportIcon = transportMeta?.icon;

                            const style = typeStyles[item.type] || typeStyles.spot;

                            return (
                                <div
                                    key={item.id || i}
                                    draggable={canEdit}
                                    onDragStart={(e) => onDragStart && onDragStart(e, i)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => onDrop && onDrop(e, i)}
                                    onClick={() => { if (canEdit) onEditItem(item); }}
                                    className={`group relative pl-10 pr-4 py-4 border rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${style.bg} ${style.border} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white'}`}
                                >
                                    {/* 拖拉手柄 */}
                                    {canEdit && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing transition-opacity">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                    )}

                                    {/* 序號標籤 */}
                                    <div className={`absolute left-0 top-0 px-2 py-0.5 text-[10px] font-bold rounded-tl-xl rounded-br-lg ${style.border} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                        {String(i + 1).padStart(2, '0')}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* 類型圖標 */}
                                        <div className={`p-2.5 rounded-xl ${style.bg} ${style.icon}`}>
                                            {item.type === 'flight' ? <PlaneTakeoff className="w-5 h-5" /> :
                                                item.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                                                    item.type === 'food' ? <Utensils className="w-5 h-5" /> :
                                                        item.type === 'transport' ? <Bus className="w-5 h-5" /> :
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
                    <div className="h-[420px] grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10">
                            {/* Note: In App.jsx this was an iframe. Using a placeholder or passing mapSrc prop would be best. 
                                We will assume mapSrc is passed or we construct a generic one. 
                                Since we didn't receive mapSrc in App.jsx scope check, we will use a generic search embed. 
                            */}
                            <iframe title="trip-map" width="100%" height="100%" frameBorder="0" src={`https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(trip.city)}`}></iframe>
                        </div>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar p-2">
                            {allLocations.length === 0 ? <div className="text-sm opacity-60">尚未有地點資訊。</div> : allLocations.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="p-3 rounded-xl border bg-white/5 flex flex-col gap-1">
                                    <div className="text-xs opacity-60 flex items-center gap-2"><MapPinned className="w-4 h-4" />{formatDate(item.date)}</div>
                                    <div className="font-bold">{item.name}</div>
                                    <div className="text-xs opacity-70">{item.details?.location}</div>
                                    <a className="text-indigo-400 text-xs underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details?.location || trip.city)}`}>在地圖開啟</a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ItineraryTab;
