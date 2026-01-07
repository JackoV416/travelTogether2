import React, { useMemo, useRef, useEffect } from 'react';
import { MapPin, AlertTriangle, Clock, ArrowRight, CalendarDays, Plane, Hotel, Utensils, Car, ShoppingBag, Sparkles, Brain } from 'lucide-react';

/**
 * TimelineView: Vertical 24-hour grid for itinerary visualization.
 * Supports:
 * - Time-based positioning
 * - Duration-based scaling
 * - Conflict detection (overlapping items)
 * - Premium Glassmorphism styling & Responsive UI
 */
const TimelineView = ({ items, isDarkMode, onItemClick, isEditMode, homeOffset = 8, destOffset = 9 }) => {
    // Hour height: Slightly smaller for mobile to see more hours
    const HOUR_HEIGHT = typeof window !== 'undefined' && window.innerWidth < 640 ? 75 : 90;
    const SHOW_DUAL_TIME = homeOffset !== destOffset;

    // 1. Time Parsing Utilities
    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const [h, m] = timeStr.trim().split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        return h * 60 + m;
    };

    // 2. Prepare Items with positioning logic
    const timelineItems = useMemo(() => {
        const filtered = [...items]
            .filter(i => i.time && !['transport', 'walk'].includes(i.type)) // Only main spots for gap detection
            .sort((a, b) => {
                const timeA = parseTimeToMinutes(a.time);
                const timeB = parseTimeToMinutes(b.time);
                return timeA - timeB;
            });

        const conflicts = new Set();
        const gaps = [];

        for (let i = 0; i < filtered.length - 1; i++) {
            const startA = parseTimeToMinutes(filtered[i].time);
            const durationA = filtered[i].duration || filtered[i].details?.duration || 60;
            const endA = startA + durationA;
            const startB = parseTimeToMinutes(filtered[i + 1].time);

            // Conflict detection
            if (endA > startB) {
                conflicts.add(filtered[i].id);
                conflicts.add(filtered[i + 1].id);
            }

            // Gap detection (> 2 hours)
            if (startB - endA >= 120) {
                gaps.push({
                    isGap: true,
                    id: `gap-${filtered[i].id}`,
                    startMinutes: endA,
                    duration: startB - endA,
                    time: `${String(Math.floor(endA / 60)).padStart(2, '0')}:${String(endA % 60).padStart(2, '0')}`
                });
            }
        }

        const itemsWithGaps = [...filtered, ...gaps].sort((a, b) => {
            const tA = a.isGap ? a.startMinutes : parseTimeToMinutes(a.time);
            const tB = b.isGap ? b.startMinutes : parseTimeToMinutes(b.time);
            return tA - tB;
        });

        return itemsWithGaps.map(item => ({
            ...item,
            startMinutes: item.isGap ? item.startMinutes : parseTimeToMinutes(item.time),
            duration: item.duration || item.details?.duration || 60,
            hasConflict: item.isGap ? false : conflicts.has(item.id)
        }));
    }, [items]);

    // 3. Scroll to first item or current time
    const containerRef = useRef(null);
    useEffect(() => {
        if (timelineItems.length > 0 && containerRef.current) {
            const firstItemTop = (timelineItems[0].startMinutes / 60) * HOUR_HEIGHT;
            const timer = setTimeout(() => {
                containerRef.current.scrollTo({
                    top: Math.max(0, firstItemTop - 20),
                    behavior: 'smooth'
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [timelineItems.length, HOUR_HEIGHT]);

    return (
        <div
            ref={containerRef}
            className={`flex-1 overflow-y-auto relative custom-scrollbar rounded-2xl border ${isDarkMode ? 'border-white/10 bg-gray-900/60' : 'border-gray-200 bg-white/40'
                } backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-500 h-[500px] md:h-[650px] shadow-2xl`}
        >
            <div className="relative min-w-full pb-20">
                {/* 24-Hour Grid Lines */}
                {Array.from({ length: 24 }).map((_, hour) => (
                    <div
                        key={hour}
                        className={`flex items-start border-t group transition-colors relative ${isDarkMode ? 'border-white/[0.05] hover:border-white/10' : 'border-black/[0.05] hover:border-black/10'
                            }`}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                        <div className="w-14 sm:w-20 flex flex-col items-center pt-2 select-none sticky left-0 z-30">
                            <span className={`text-[10px] sm:text-[12px] font-mono font-black border-b border-indigo-500/20 pb-0.5 mb-0.5 transition-all ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                                }`}>
                                {String(hour).padStart(2, '0')}:00
                            </span>
                            {SHOW_DUAL_TIME && (
                                <span className={`text-[8px] sm:text-[9px] font-mono font-medium opacity-40 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                                    }`}>
                                    {(() => {
                                        const hTime = (hour - (destOffset - homeOffset) + 24) % 24;
                                        return `${String(hTime).padStart(2, '0')}:00`;
                                    })()} (家)
                                </span>
                            )}
                        </div>
                        <div className="flex-1 relative h-full">
                            {/* Half-hour dash line */}
                            <div
                                className={`absolute w-full border-t border-dashed top-1/2 left-0 opacity-10 ${isDarkMode ? 'border-white' : 'border-black'
                                    } group-hover:opacity-20`}
                            />
                        </div>
                    </div>
                ))}

                {/* Vertical Indicator Line */}
                <div
                    className={`absolute left-14 sm:left-20 top-0 bottom-0 border-l w-px transition-colors ${isDarkMode ? 'border-white/10' : 'border-black/5'
                        }`}
                />

                {/* Timed Items Overlay */}
                <div className="absolute inset-0 top-0 left-14 sm:left-20 right-0 pointer-events-none p-1 sm:p-2">
                    {timelineItems.map((item) => {
                        const top = (item.startMinutes / 60) * HOUR_HEIGHT;
                        const height = (item.duration / 60) * HOUR_HEIGHT;

                        if (item.isGap) {
                            return (
                                <div
                                    key={item.id}
                                    className="absolute left-[80px] sm:left-[100px] right-4 border border-dashed border-indigo-400/30 bg-indigo-500/[0.02] rounded-2xl flex flex-col items-center justify-center p-4 group/gap transition-all hover:bg-indigo-500/[0.05]"
                                    style={{
                                        top: `${top + 8}px`,
                                        height: `${height - 16}px`,
                                        minHeight: '80px'
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-2 max-w-[200px] text-center">
                                        <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-500 animate-pulse">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-black text-indigo-500/80 uppercase tracking-widest">發現行程空檔</span>
                                        <p className="text-[9px] opacity-40 leading-tight">呢段時間有 {Math.floor(item.duration / 60)} 小時空位，想唔想叫 Jarvis 幫你推薦附近景點？</p>
                                        <button className="mt-2 px-3 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                                            ASK JARVIS AI
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={item.id}
                                onClick={() => onItemClick(item)}
                                className={`absolute left-1 sm:left-4 right-1 sm:right-6 rounded-xl border p-2.5 sm:p-3 flex flex-col gap-1 cursor-pointer shadow-lg transition-all hover:scale-[1.01] hover:z-20 active:scale-95 z-10 overflow-hidden pointer-events-auto group ${item.hasConflict
                                    ? 'border-rose-500/50 bg-rose-500/10 shadow-rose-500/20 ring-1 ring-rose-500/30'
                                    : isEditMode
                                        ? 'border-indigo-500/50 bg-indigo-500/5 ring-2 ring-indigo-500/20'
                                        : isDarkMode
                                            ? 'border-white/10 bg-white/10 hover:bg-white/15 hover:border-white/20'
                                            : 'border-white bg-white/95 shadow-indigo-100/50 hover:bg-white hover:border-indigo-100'
                                    }`}
                                style={{
                                    top: `${top + 8}px`, // Slight offset for padding
                                    height: `${Math.max(HOUR_HEIGHT * 0.6, height - 6)}px`,
                                    minHeight: '60px'
                                }}
                            >
                                {/* Category Accent Glow */}
                                <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity ${{
                                    flight: 'bg-indigo-500',
                                    hotel: 'bg-rose-500',
                                    food: 'bg-amber-500',
                                    spot: 'bg-cyan-500',
                                    transport: 'bg-purple-500',
                                    shopping: 'bg-fuchsia-500'
                                }[item.type] || 'bg-gray-500'}`} />

                                <div className="flex justify-between items-start gap-2 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {item.hasConflict && <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse shrink-0" />}
                                            <h4 className={`font-bold text-[11px] sm:text-xs leading-tight truncate ${isDarkMode ? 'text-gray-100 group-hover:text-indigo-400' : 'text-gray-800 group-hover:text-indigo-600'}`}>
                                                {item.name}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold opacity-60">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                                {item.time}
                                            </span>
                                            <span className="opacity-30">|</span>
                                            <span>{item.duration}m</span>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${{
                                        flight: 'bg-indigo-500/10 text-indigo-500',
                                        hotel: 'bg-rose-500/10 text-rose-500',
                                        food: 'bg-orange-500/10 text-orange-500',
                                        spot: 'bg-cyan-500/10 text-cyan-500',
                                        transport: 'bg-purple-500/10 text-purple-500',
                                        shopping: 'bg-pink-500/10 text-pink-500'
                                    }[item.type] || 'bg-gray-500/10 text-gray-500'}`}>
                                        {(() => {
                                            const Icon = {
                                                flight: Plane,
                                                hotel: Hotel,
                                                food: Utensils,
                                                spot: MapPin,
                                                transport: Car,
                                                shopping: ShoppingBag
                                            }[item.type] || MapPin;
                                            return <Icon className="w-3.5 h-3.5" />;
                                        })()}
                                    </div>
                                </div>

                                {item.type === 'flight' ? (
                                    <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-indigo-500/10 dark:border-white/5 relative z-10 transition-all group-hover:bg-indigo-500/5 -mx-1 px-1 rounded-lg">
                                        <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                                            <div className="flex items-center gap-1 opacity-60">
                                                <Plane className="w-2.5 h-2.5 rotate-45" />
                                                <span>{item.details?.flightNo || '航班'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono font-bold text-indigo-500">
                                                <span>{item.time}</span>
                                                <ArrowRight className="w-2 h-2" />
                                                <span>{item.details?.endTime || '--:--'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] opacity-40 uppercase tracking-tighter">Dep</span>
                                                <span className="text-[9px] sm:text-[10px] truncate font-medium">{item.details?.location?.split('->')[0] || 'Airport'}</span>
                                            </div>
                                            <div className="h-4 w-px bg-indigo-500/10" />
                                            <div className="flex flex-col items-end min-w-0">
                                                <span className="text-[8px] opacity-40 uppercase tracking-tighter text-right">Arr</span>
                                                <span className="text-[9px] sm:text-[10px] truncate font-medium text-right">{item.details?.location?.split('->')[1] || item.details?.arrival || 'Arrival'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : item.details?.location && (
                                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] opacity-50 truncate relative z-10 mt-auto pt-1 sm:pt-2 border-t border-black/5 dark:border-white/5">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{item.details.location}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State Overlay */}
                {timelineItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20 pointer-events-none">
                        <CalendarDays className="w-12 h-12 mb-3 animate-bounce" />
                        <p className="font-bold text-sm">今日行程清空</p>
                        <p className="text-[10px]">切換到列表模式加入定時行程吧</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineView;
