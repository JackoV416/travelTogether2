import React, { memo, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    Clock, Trash2, Plane, Train, Car, Navigation, ArrowRight, MapPin,
    Star, DollarSign, Utensils, ShoppingBag, Hotel, Ticket, Footprints,
    Stamp, Sparkles
} from 'lucide-react';
import TripDocsEditor from '../Shared/TripDocsEditor';
import { formatDuration } from '../../utils/tripUtils';

// V1.9.0: Final Unified "Website Card" Design tokens
const CARD_STYLES = {
    modern: {
        card: 'bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow',
        text: 'text-gray-900',
        accent: 'text-indigo-600',
        accentBg: 'bg-indigo-600',
        inputBg: 'bg-gray-50 hover:bg-white border-transparent hover:border-gray-200 focus:border-indigo-300 focus:bg-white transition-all',
        divider: 'bg-gray-100',
        font: 'font-sans',
        costText: 'text-emerald-600',
        notchColor: 'bg-white',
    },
    classic: {
        card: 'bg-[#fdfbf7] border border-[#e2d9c0] rounded-xl shadow-[4px_4px_0px_0px_#e2d9c0] hover:shadow-[2px_2px_0px_0px_#e2d9c0] transition-all',
        text: 'text-slate-900',
        accent: 'text-amber-700',
        accentBg: 'bg-amber-700',
        inputBg: 'bg-white border-[#e2d9c0] focus:border-amber-500',
        divider: 'bg-[#e2d9c0]',
        font: 'font-serif',
        costText: 'text-emerald-700',
        notchColor: 'bg-[#fdfbf7]',
    },
    glass: {
        card: 'bg-slate-900/80 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl hover:bg-white/20 transition-all text-shadow-sm',
        text: 'text-white',
        accent: 'text-cyan-300',
        accentBg: 'bg-cyan-400',
        inputBg: 'bg-black/20 border-white/10 focus:bg-black/30 placeholder-white/40 text-white',
        divider: 'bg-white/10',
        font: 'font-sans',
        costText: 'text-emerald-300',
        notchColor: 'bg-[#0f172a]', // slate-900 matching fallback
    },
    compact: {
        card: 'bg-white border border-stone-200 rounded-lg shadow-sm hover:border-stone-300',
        text: 'text-stone-800',
        accent: 'text-stone-600',
        accentBg: 'bg-stone-600',
        inputBg: 'bg-stone-50 border-transparent focus:bg-white focus:border-stone-300',
        divider: 'bg-stone-200',
        font: 'font-mono tracking-tight',
        costText: 'text-emerald-700',
        notchColor: 'bg-white',
    },
    retro: {
        card: 'bg-[#fff4e6] border-2 border-[#4a3b32] rounded-xl shadow-[4px_4px_0_0_#4a3b32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#4a3b32] transition-all',
        text: 'text-[#4a3b32]',
        accent: 'text-[#d35400]',
        accentBg: 'bg-[#d35400]',
        inputBg: 'bg-[#ffe0b2] border-[#4a3b32] focus:bg-[#fff]',
        divider: 'bg-[#4a3b32]',
        font: 'font-mono',
        costText: 'text-[#2e7d32]',
        notchColor: 'bg-[#fff4e6]',
    },
    vibrant: {
        card: 'bg-violet-900 bg-gradient-to-br from-violet-600/90 to-indigo-600/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg text-white',
        text: 'text-white',
        accent: 'text-yellow-300',
        accentBg: 'bg-yellow-400',
        inputBg: 'bg-white/20 border-white/20 focus:bg-white/30 placeholder-white/50 text-white',
        divider: 'bg-white/20',
        font: 'font-sans',
        costText: 'text-emerald-300',
        notchColor: 'bg-[#2e1065]',
    },
};

const DENSITY_SIZES = {
    2: { p: 'p-6', imgSize: 'w-24 h-24', textSize: 'text-xl', gap: 'gap-6', mb: 'mb-4' },
    3: { p: 'p-5', imgSize: 'w-22 h-22', textSize: 'text-lg', gap: 'gap-5', mb: 'mb-3' },
    4: { p: 'p-4', imgSize: 'w-20 h-20', textSize: 'text-lg', gap: 'gap-4', mb: 'mb-2' },
    5: { p: 'p-3', imgSize: 'w-18 h-18', textSize: 'text-base', gap: 'gap-3', mb: 'mb-1.5' },
    6: { p: 'p-2', imgSize: 'w-16 h-16', textSize: 'text-base', gap: 'gap-2', mb: 'mb-1' },
};

// Compact style override for specific themes
const getCompactStyle = (base) => ({
    ...base,
    card: base.card + ' overflow-hidden',
});

const EditorDocItem = memo(({
    item,
    selectedItemId,
    setSelectedItemId,
    handleUpdateItem,
    handleRemoveItem,
    resolveImageUrl,
    setActiveEditor,
    pdfTemplate = 'modern',
    itemsPerPage = 4
}) => {
    // Apply style refinement
    const styles = pdfTemplate === 'compact' ? getCompactStyle(CARD_STYLES.compact) : (CARD_STYLES[pdfTemplate] || CARD_STYLES.modern);
    const density = DENSITY_SIZES[itemsPerPage] || DENSITY_SIZES[4];

    const isTransport = ['flight', 'train', 'transport', 'immigration', 'walk'].includes(item.type);
    const hasAttemptedExtraction = useRef(false);

    // Helpers for localization and details extraction
    const getDetail = useCallback((key) => {
        return item.details?.[key] || '';
    }, [item.details]);

    const handleDetailChange = useCallback((key, value) => {
        handleUpdateItem(item._sortId, {
            ...item,
            details: { ...item.details, [key]: value }
        });
    }, [item, handleUpdateItem]);

    const handleCostChange = useCallback((e) => {
        handleUpdateItem(item._sortId, { ...item, cost: Number(e.target.value) || 0 });
    }, [item, handleUpdateItem]);

    const handleRatingChange = useCallback((e) => {
        handleDetailChange('rating', e.target.value);
    }, [handleDetailChange]);

    const handleLocationChange = useCallback((e) => {
        handleDetailChange('location', e.target.value);
    }, [handleDetailChange]);

    const handleSecondaryNameChange = useCallback((e) => {
        handleDetailChange('nameEn', e.target.value);
    }, [handleDetailChange]);

    // V1.9.0: Enhanced auto-extraction logic with better parsing and fallback
    useEffect(() => {
        if (!isTransport || hasAttemptedExtraction.current) return;

        let updates = {};
        let needsUpdate = false;

        // 1. If arrival is missing, try to parse from name
        if (!item.arrival && item.name) {
            // Priority 1: Arrow patterns "HKG -> NRT"
            const arrowMatch = item.name.match(/(?:->|➔|往|前往|飛往)\s*([^)]+)/);
            // Priority 2: "To" pattern
            const toMatch = item.name.match(/[Tt]o\s+([^)]+)/);
            // Priority 3: Parentheses at the end "(NRT)"
            const parenMatch = item.name.match(/\(([^)]+)\)$/);

            if (arrowMatch) {
                updates.arrival = arrowMatch[1].trim();
                needsUpdate = true;
            } else if (toMatch) {
                updates.arrival = toMatch[1].trim();
                needsUpdate = true;
            } else if (parenMatch && parenMatch[1].length < 10) { // Safety check for airport codes
                updates.arrival = parenMatch[1].trim();
                needsUpdate = true;
            }
        }

        // 2. Arrival Time - Check arrivalTime, fallback to details.endTime
        if (!item.arrivalTime && item.details?.endTime) {
            updates.arrivalTime = item.details.endTime;
            needsUpdate = true;
        }

        // 3. Search description for time if still missing
        if (!item.arrivalTime && !updates.arrivalTime && item.details?.desc) {
            const timeMatch = item.details.desc.match(/(\d{1,2}:\d{2})\s*(?:[Aa]rrival|抵達|到達|步|到)/);
            if (timeMatch) {
                updates.arrivalTime = timeMatch[1];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            handleUpdateItem(item._sortId, { ...item, ...updates });
        }
        hasAttemptedExtraction.current = true;
    }, [isTransport, item, handleUpdateItem]);

    const handleDescriptionChange = useCallback((newContent) => {
        handleUpdateItem(item._sortId, { ...item, details: { ...item.details, desc: newContent } });
    }, [item, handleUpdateItem]);

    const handleTimeChange = useCallback((e) => {
        handleUpdateItem(item._sortId, { ...item, time: e.target.value });
    }, [item, handleUpdateItem]);

    const handleArrivalTimeChange = useCallback((e) => {
        handleUpdateItem(item._sortId, { ...item, arrivalTime: e.target.value });
    }, [item, handleUpdateItem]);

    const handleNameChange = useCallback((e) => {
        handleUpdateItem(item._sortId, { ...item, name: e.target.value });
    }, [item, handleUpdateItem]);

    const handleArrivalChange = useCallback((e) => {
        handleUpdateItem(item._sortId, { ...item, arrival: e.target.value });
    }, [item, handleUpdateItem]);

    const handleSelect = useCallback(() => {
        setSelectedItemId(item._sortId);
    }, [item._sortId, setSelectedItemId]);

    const handleRemove = useCallback((e) => {
        e.stopPropagation();
        handleRemoveItem(item._sortId);
    }, [item._sortId, handleRemoveItem]);

    const isDarkTemplate = pdfTemplate === 'glass' || pdfTemplate === 'vibrant';

    const getTransportIcon = (sizeCls = "w-5 h-5") => {
        const type = (item.details?.transportType || item.type || '').toLowerCase();
        const name = (item.name || "").toLowerCase();

        if (type === 'flight' || name.includes('flight') || name.includes('航空')) {
            return <Plane className={`${sizeCls} ${name.includes('return') || name.includes('回程') ? '-rotate-90' : 'rotate-45'}`} />;
        }
        if (type === 'walk' || name.includes('walk') || name.includes('步')) {
            return <Footprints className={sizeCls} />;
        }
        if (type === 'train' || name.includes('rail') || name.includes('地鐵') || name.includes('MTR')) {
            return <Train className={sizeCls} />;
        }
        if (type === 'immigration' || name.includes('入境')) {
            return <Stamp className={sizeCls} />;
        }
        return <Car className={sizeCls} />;
    };

    const iconMap = {
        hotel: <Hotel className="w-4 h-4" />,
        food: <Utensils className="w-4 h-4" />,
        shopping: <ShoppingBag className="w-4 h-4" />,
        spot: <MapPin className="w-4 h-4" />,
        flight: <Plane className="w-4 h-4 rotate-45" />,
        transport: <Car className="w-4 h-4" />,
        train: <Train className="w-4 h-4" />,
        walk: <Footprints className="w-4 h-4" />,
        immigration: <Stamp className="w-4 h-4" />
    };

    const duration = useMemo(() => {
        if (!item.time || !item.arrivalTime) return null;
        const [h1, m1] = item.time.split(':').map(Number);
        const [h2, m2] = item.arrivalTime.split(':').map(Number);
        if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60; // Overnight

        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }, [item.time, item.arrivalTime]);

    return (
        <div className="py-2 w-full" onClick={handleSelect}>
            <div
                id={`doc-item-${item._sortId}`}
                className={`relative flex flex-row overflow-hidden ${styles.card} ${styles.font} transition-all duration-300 group ${selectedItemId === item._sortId ? 'ring-2 ring-indigo-500/50 scale-[1.01]' : ''
                    } min-h-[120px] h-auto block`} // Changed to flex and overflow-hidden for image sidebar
            >
                {/* Left Sidebar Image (Website Style) */}
                {(resolveImageUrl(item)) && (
                    <div className="relative w-[25%] shrink-0 md:block hidden">
                        <img
                            src={resolveImageUrl(item)}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        {/* Type Icon Overlay */}
                        <div className={`absolute top-2 left-2 p-1.5 rounded-lg ${styles.accentBg} shadow-lg z-10 text-white scale-75 origin-top-left`}>
                            {React.cloneElement(iconMap[item.type] || iconMap.spot, { className: "w-3 h-3" })}
                        </div>
                        {/* Ticket Notches - Centered on Image Edge */}
                        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 translate-x-1/2 z-20 pointer-events-none">
                            <div className={`w-4 h-4 rounded-full -mt-4 ${styles.notchColor} border border-black/5`} />
                            <div className={`flex-1 border-r border-dashed mx-[7px] my-1 ${isDarkTemplate ? 'border-white/20' : 'border-gray-400/30'}`} />
                            <div className={`w-4 h-4 rounded-full -mb-4 ${styles.notchColor} border border-black/5`} />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col ${density.p} pl-4 pr-2 min-w-0 relative`}>
                    {/* Absolute Controls: Type & Delete */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                        {/* Delete - Ignored in PDF */}
                        <button
                            onClick={handleRemove}
                            data-html2canvas-ignore="true"
                            className={`p-1.5 ${isDarkTemplate ? 'bg-black/40 text-white hover:text-red-400 hover:bg-black/60' : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'} rounded-full shadow-sm backdrop-blur-sm transition-all opacity-40 hover:opacity-100`}
                            title="Remove Item"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Non-Transport Time - Now part of content flow if needed, or overlay? 
                        Let's put it just above title if strictly needed, or inline. 
                        For now, putting it top-left if not transport. */}
                    {!isTransport && (
                        <div className="mb-1">
                            <div className="relative group/time inline-flex items-center">
                                <Clock className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${isDarkTemplate ? 'text-white/40' : 'text-gray-400'}`} />
                                <input
                                    type="time"
                                    value={item.time || ''}
                                    onChange={handleTimeChange}
                                    className={`pl-6 pr-1 py-0.5 bg-transparent rounded-lg text-[10px] font-mono font-black ${styles.text} 
                                    outline-none hover:bg-black/5 transition-all w-[80px] cursor-pointer`}
                                />
                            </div>
                        </div>
                    )}


                    {/* Status Indicator Sidebar */}
                    {/* Status Indicator Sidebar (Only show if no image, or narrow version) */}
                    {(!resolveImageUrl(item)) && (
                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-300 ${selectedItemId === item._sortId ? styles.accentBg : 'bg-transparent group-hover:bg-current/10'
                            }`} />
                    )}

                    {/* Card Header: Start Time & Arrival Time - Hide for Transport (moved to body) */}


                    {/* Decorative Background Icon */}
                    <div className={`absolute -bottom-6 -right-6 opacity-[0.05] pointer-events-none select-none transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 ${isDarkTemplate ? 'text-white' : 'text-black'}`}>
                        {React.cloneElement(iconMap[item.type] || iconMap.spot, { className: "w-32 h-32" })}
                    </div>



                    {/* Unified Card Body */}
                    {/* Unified Card Body */}
                    <div className={`flex ${density.gap} items-start`}>
                        {/* Mobile/No-Sidebar Small Image Fallback */}
                        {(resolveImageUrl(item)) && (
                            <div className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-sm border md:hidden ${isDarkTemplate ? 'border-white/10' : 'border-gray-100'}`}>
                                <img src={resolveImageUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {isTransport ? (
                                <div className="flex flex-col">
                                    {/* Transport Header: Title Row (Full Width) */}
                                    <div className="mb-1 pr-6">
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={handleNameChange}
                                            className={`w-full bg-transparent ${density.textSize} font-black ${styles.text} outline-none placeholder-current/10 transition-colors ${styles.font} truncate`}
                                            placeholder="航班 / 車次名稱 (e.g. CX520)"
                                        />
                                    </div>

                                    {/* Transport Header: Route Row (Origin -> Time -> Icon -> Time -> Arrival) */}
                                    <div className="flex items-center gap-2 py-2 px-1">
                                        {/* Origin Column */}
                                        <div className="flex flex-col min-w-[60px]">
                                            <input
                                                type="text"
                                                value={getDetail('origin') || ''}
                                                onChange={(e) => handleDetailChange('origin', e.target.value)}
                                                className={`text-[13px] font-black tracking-tight leading-none ${styles.text} bg-transparent outline-none w-full border-b border-transparent focus:border-current/30 rounded px-1 -ml-1`}
                                                placeholder="Origin"
                                            />
                                            <input
                                                type="time"
                                                value={item.time || ''}
                                                onChange={handleTimeChange}
                                                className={`text-[9px] opacity-50 font-bold mt-0.5 bg-transparent outline-none w-full`}
                                            />
                                        </div>

                                        {/* Ticket-Style Route Line */}
                                        <div className="flex-1 flex items-center justify-center relative mx-2">
                                            <div className="w-full border-t-2 border-dashed border-current opacity-20"></div>
                                            <div className="absolute flex flex-col items-center gap-0.5">
                                                <div className={`w-6 h-6 rounded-full border border-current/10 ${styles.card} ${styles.text} shadow-sm flex items-center justify-center`}>
                                                    {getTransportIcon("w-3 h-3")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Destination Column */}
                                        <div className="flex flex-col items-end min-w-[60px]">
                                            <input
                                                type="text"
                                                value={item.arrival || ''}
                                                onChange={handleArrivalChange}
                                                className={`text-[13px] font-black tracking-tight leading-none ${styles.text} bg-transparent outline-none w-full border-b border-transparent focus:border-current/30 rounded px-1 text-right`}
                                                placeholder="Dest"
                                            />
                                            <input
                                                type="time"
                                                value={item.arrivalTime || ''}
                                                onChange={handleArrivalTimeChange}
                                                className={`text-[9px] opacity-50 font-bold mt-0.5 bg-transparent outline-none w-full text-right`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 mb-2">
                                    <div className="flex items-center gap-2 pr-6">
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={handleNameChange}
                                            className={`flex-1 bg-transparent ${density.textSize} font-black ${styles.text} outline-none placeholder-current/10 transition-colors ${styles.font} focus:placeholder-transparent`}
                                            placeholder="項目名稱..."
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={getDetail('nameEn') || ''}
                                        onChange={handleSecondaryNameChange}
                                        className={`text-[11px] opacity-40 font-bold italic bg-transparent outline-none w-full`}
                                        placeholder="Add English/Secondary Name..."
                                    />
                                </div>
                            )}

                            {/* Info Row: Rating, Duration, Smart Advice */}
                            <div className="flex items-center gap-3 mb-2 text-[10px] font-black">
                                {/* Rating Input */}
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={getDetail('rating') || ''}
                                        onChange={handleRatingChange}
                                        className="bg-transparent w-8 outline-none text-yellow-600 font-black"
                                        placeholder="0.0"
                                    />
                                </div>

                                {/* Duration Display */}
                                <div className="flex items-center gap-1 text-indigo-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{isTransport ? (duration || 'Pending') : `Stay ${formatDuration(item.details?.duration || 60)}`}</span>
                                </div>

                                {/* Cost in Info Row (New Position) */}
                                <div className="flex items-center gap-0.5 ml-2">
                                    <DollarSign className={`w-3 h-3 ${styles.costText}`} />
                                    <input
                                        type="number"
                                        value={item.cost || ''}
                                        onChange={handleCostChange}
                                        placeholder="0"
                                        className={`bg-transparent w-12 text-[10px] font-black font-mono outline-none ${styles.costText} placeholder-current/30`}
                                    />
                                </div>

                                {/* Transport Specific: Gate/Terminal */}
                                {isTransport && (
                                    <div className="flex items-center gap-1.5 ml-auto text-current/60">
                                        <Ticket className="w-3 h-3 opacity-40" />
                                        <input
                                            type="text"
                                            value={getDetail('gate') || getDetail('platform') || ''}
                                            onChange={(e) => handleDetailChange(item.type === 'flight' ? 'gate' : 'platform', e.target.value)}
                                            className="bg-transparent w-20 text-[9px] font-black outline-none placeholder-current/20 border-b border-transparent focus:border-current text-right"
                                            placeholder="Gate/Platform"
                                        />
                                    </div>
                                )}
                            </div>


                            <div className={`prose prose-sm max-w-none ${isDarkTemplate ? 'prose-invert' : pdfTemplate === 'retro' ? 'prose-stone' : 'prose-slate'} ${styles.font} text-[10px] opacity-80 -mt-1`}>
                                <div className="-my-2">
                                    <TripDocsEditor
                                        content={item.details?.desc || ''}
                                        onChange={handleDescriptionChange}
                                        onEditorReady={setActiveEditor}
                                        placeholder={isTransport ? "航班資訊..." : "添加細節..."}
                                        editable={true}
                                        hideToolbar={true}
                                    />
                                </div>
                            </div>


                            {/* Tags Row - Editable */}
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[9px] font-black opacity-30 select-none ${styles.text}`}>#</span>
                                <input
                                    type="text"
                                    value={(item.details?.tags || []).join(', ')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        handleDetailChange('tags', val ? val.split(',').map(t => t.trim()) : []);
                                    }}
                                    className={`w-full bg-transparent text-[9px] font-bold ${styles.accent} outline-none placeholder-current/30 transition-colors bg-current/5 rounded px-1.5 py-0.5`}
                                    placeholder="Add tags (separated by comma)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
});

export default EditorDocItem;
