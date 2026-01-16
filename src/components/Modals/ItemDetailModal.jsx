import React from 'react';
import { Sparkles, X, MapPin, Clock, Info, Plane, Train, Bus, Car, Ship, Ticket, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { formatDuration, getSmartItemImage, getLocalizedCityName } from '../../utils/tripUtils';
import { useTranslation } from 'react-i18next';

const ItemDetailModal = ({ isOpen, onClose, isDarkMode, item, city, onEdit, onDelete }) => {
    const { t } = useTranslation();
    if (!isOpen || !item) return null;

    // V1.0.3: Helper to calculate end time from start + duration
    const getEndTime = () => {
        if (item.endTime) return item.endTime;
        if (item.details?.endTime) return item.details.endTime;
        if (!item.time || !item.details?.duration) return null;

        const [h, m] = item.time.split(':').map(Number);
        let durationMins = 0;
        const val = item.details.duration;

        if (typeof val === 'number') {
            durationMins = val;
        } else if (typeof val === 'string') {
            const hasHour = val.match(/(\d+)\s*(?:hr|hour|小时|小時|h)/i);
            const hasMin = val.match(/(\d+)\s*(?:min|minute|分|m)/i);
            if (hasHour) durationMins += parseInt(hasHour[1]) * 60;
            if (hasMin) durationMins += parseInt(hasMin[1]);
            if (!hasHour && !hasMin) {
                const digits = val.match(/\d+/);
                if (digits) durationMins = parseInt(digits[0]);
            }
        }

        if (!durationMins) return null;
        const date = new Date();
        date.setHours(h, m + durationMins);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const endTime = getEndTime();

    // V1.0.6: Unified Type Theme (matches TransportCard & StandardCard)
    const getTypeTheme = () => {
        const type = (item.details?.transportType || item.type || '').toLowerCase();
        const name = (item.name || '').toLowerCase();

        // Transport Types
        if (type === 'flight' || name.includes('flight') || name.includes('航空')) {
            return { bg: 'bg-blue-500/80', label: 'Flight' };
        }
        if (type === 'walk' || name.includes('walk') || name.includes('步')) {
            return { bg: 'bg-purple-500/80', label: 'Walking' };
        }
        if (type === 'metro' || type === 'subway' || name.includes('metro') || name.includes('地鐵') || name.includes('都營')) {
            return { bg: 'bg-teal-500/80', label: 'Metro' };
        }
        if (type === 'train' || type === 'shinkansen' || name.includes('jr') || name.includes('鐵') || name.includes('express')) {
            return { bg: 'bg-emerald-500/80', label: 'Rail' };
        }
        if (type === 'immigration' || name.includes('入境') || name.includes('海關')) {
            return { bg: 'bg-amber-500/80', label: 'Immigration' };
        }
        if (type === 'transport') {
            return { bg: 'bg-indigo-500/80', label: 'Transport' };
        }
        // Standard Types
        if (type === 'hotel') {
            return { bg: 'bg-rose-500/80', label: 'Accommodation' };
        }
        if (type === 'food') {
            return { bg: 'bg-orange-500/80', label: 'Dining' };
        }
        if (type === 'shopping') {
            return { bg: 'bg-pink-500/80', label: 'Shopping' };
        }
        if (type === 'spot') {
            return { bg: 'bg-cyan-500/80', label: 'Sightseeing' };
        }
        // Default
        return { bg: 'bg-gray-500/80', label: item.type?.toUpperCase() || 'Activity' };
    };

    const typeTheme = getTypeTheme();

    // Helper to get Header Image
    const headerImage = getSmartItemImage(item) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";

    // Content Rendering Logic
    const renderContent = () => {
        // --- TRANSPORT (All types: flight, train, metro, walk, immigration, etc.) ---
        const transportTypes = ['transport', 'flight', 'train', 'metro', 'walk', 'immigration'];
        if (transportTypes.includes(item.type)) {
            const isFlight = item.type === 'flight';
            return (
                <div className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {t('modal.item_detail.duration')}
                            </div>
                            <div className="font-black text-xl">
                                {item.details?.duration ? formatDuration(item.details.duration) : "--"}
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> {t('modal.item_detail.cost')}
                            </div>
                            <div className="font-black text-xl">
                                {item.cost > 0 ? `$${item.cost}` : t('modal.item_detail.free')}
                            </div>
                        </div>
                    </div>

                    {/* Transport Path Details */}
                    <div className={`p-5 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-indigo-50/50 border-indigo-100'}`}>
                        {/* Vertical Line */}
                        <div className="absolute left-[30px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-indigo-500/50 to-purple-500/50"></div>

                        {/* Start Node */}
                        <div className="flex gap-4 mb-6 relative z-10">
                            <div className="w-10 flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"></div>
                                <div className="mt-1 text-[10px] font-mono opacity-50">{item.time}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-0.5">{t('modal.item_detail.depart')}</div>
                                <div className="font-black text-lg leading-tight">
                                    {(() => {
                                        // V1.4.3: Prioritize details.from first
                                        if (item.details?.from) return item.details.from;

                                        // Try location pattern
                                        const loc = item.details?.location || '';
                                        const locParts = loc.split(/->/i).map(s => s.trim());
                                        if (locParts[0] && locParts[0] !== loc) return locParts[0];

                                        // Fallback to fromCode
                                        return item.details?.fromCode || "Origin";
                                    })()}
                                </div>
                                {/* Gate / Platform / Terminal */}
                                {(item.details?.gate || item.details?.terminal || item.details?.platform) && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {item.details.terminal && (
                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                {item.details.terminal}
                                            </span>
                                        )}
                                        {item.details.gate && (
                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                🚪 Gate {item.details.gate}
                                            </span>
                                        )}
                                        {item.details.platform && (
                                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                🚉 Platform {item.details.platform}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* End Node */}
                        <div className="flex gap-4 relative z-10">
                            <div className="w-10 flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                                <div className="mt-1 text-[10px] font-mono opacity-50">
                                    {endTime || '--:--'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-0.5">{t('modal.item_detail.arrive')}</div>
                                <div className="font-black text-lg leading-tight">
                                    {(() => {
                                        // V1.4.3: Prioritize details.to first
                                        if (item.details?.to) return item.details.to;

                                        // Try location pattern
                                        const loc = item.details?.location || '';
                                        const locParts = loc.split(/->/i).map(s => s.trim());
                                        if (locParts[1]) return locParts[1];

                                        // Try details.arrival
                                        if (item.details?.arrival) return item.details.arrival;

                                        // Fallback to toCode
                                        return item.details?.toCode || "Destination";
                                    })()}
                                </div>
                                {/* Arrival Gate & Baggage Claim */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(item.details?.arrivalGate || item.details?.arrivalTerminal) && (
                                        <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded inline-block">
                                            🚪 {item.details.arrivalGate || item.details.arrivalTerminal}
                                        </span>
                                    )}
                                    {item.details?.baggageClaim && (
                                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded inline-block">
                                            🧳 Belt {item.details.baggageClaim}
                                        </span>
                                    )}
                                    {item.details?.exit && (
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                                            {item.details.exit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insight / Section */}
                    {(item.details?.insight || item.details?.desc) && (
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{t('modal.item_detail.insight')}</span>
                            </div>
                            <div className={`text-sm leading-relaxed space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {(() => {
                                    const text = item.details?.insight || item.details?.desc || '';
                                    const lines = text.split(/(?=【)|(?=\d+\.\s)/).filter(Boolean);
                                    return lines.map((line, i) => {
                                        const isHeader = line.startsWith('【');
                                        const isPoint = /^\d+\./.test(line);
                                        if (isHeader) {
                                            return <div key={i} className="font-bold text-indigo-500 mt-2 first:mt-0">{line}</div>;
                                        }
                                        if (isPoint) {
                                            return <div key={i} className="flex gap-2"><span className="text-indigo-400 font-bold shrink-0">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
                                        }
                                        return <div key={i}>{line}</div>;
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <button className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> {t('modal.item_detail.navigate')}
                    </button>
                </div>
            );
        }

        // --- SPOT / HOTEL / FOOD ---
        return (
            <div className="space-y-6">
                {/* Story/Desc */}
                <div>
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t('modal.item_detail.about')}</span>
                    </div>
                    <p className="leading-relaxed text-sm whitespace-pre-line opacity-90">
                        {item.details?.story || item.details?.desc || t('modal.item_detail.no_desc')}
                    </p>
                </div>

                {/* Info List */}
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 opacity-50" />
                            <div className="text-sm">
                                <span className="opacity-60 block text-[10px] uppercase font-bold">{t('modal.item_detail.time')}</span>
                                <span className="font-bold">{item.time} {item.details?.duration && `(${formatDuration(item.details.duration)})`}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4 opacity-50" />
                            <div className="text-sm">
                                <span className="opacity-60 block text-[10px] uppercase font-bold">{t('modal.item_detail.cost')}</span>
                                <span className="font-bold">{item.cost > 0 ? `$${item.cost}` : t('modal.item_detail.free')}</span>
                            </div>
                        </div>
                        {item.details?.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 opacity-50" />
                                <div className="text-sm">
                                    <span className="opacity-60 block text-[10px] uppercase font-bold">{t('modal.item_detail.address')}</span>
                                    <span className="font-bold">{item.details.address}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History/Insight Section */}
                {(item.details?.insight || item.details?.history) && (
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{t('modal.item_detail.insight')}</span>
                        </div>
                        <div className="text-sm leading-relaxed opacity-90 space-y-2">
                            {(() => {
                                const text = item.details?.insight || item.details?.history || '';
                                const lines = text.split(/(?=【)|(?=\d+\.\s)/).filter(Boolean);
                                return lines.map((line, i) => {
                                    const isHeader = line.startsWith('【');
                                    const isPoint = /^\d+\./.test(line);
                                    if (isHeader) {
                                        return <div key={i} className="font-bold text-indigo-500 mt-2 first:mt-0">{line}</div>;
                                    }
                                    if (isPoint) {
                                        return <div key={i} className="flex gap-2"><span className="text-indigo-400 font-bold shrink-0">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
                                    }
                                    return <div key={i}>{line}</div>;
                                });
                            })()}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    {/* External Buttons */}
                    <button className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${isDarkMode ? 'border-white/5 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <ExternalLink className="w-4 h-4" /> {t('modal.item_detail.official_site')}
                    </button>
                    <button className="flex-1 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> {t('modal.item_detail.navigate')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Sheet */}
            <div className={`w-full sm:w-[500px] max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto pb-[env(safe-area-inset-bottom)] ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${isDarkMode ? 'bg-gray-900 border border-white/5' : 'bg-white'}`}>

                {/* Header Image Area */}
                <div className="h-48 bg-gray-200 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    {/* Dynamic Image */}
                    <img src={headerImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-6 z-20 text-white right-6">
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {/* Type Tag */}
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${typeTheme.bg} backdrop-blur-md px-2 py-1 rounded-lg`}>
                                {typeTheme.label}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black leading-tight shadow-black drop-shadow-lg break-words">{item.name}</h2>
                    </div>
                </div>

                {/* Content Body */}
                <div className={`p-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {renderContent()}

                    {/* EDIT/DELETE ACTIONS */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                        {onEdit && (
                            <button
                                onClick={() => { onClose(); onEdit(item); }}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                {t('modal.item_detail.edit_item')}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => {
                                    onDelete(item);
                                    onClose();
                                }}
                                className="px-4 py-3 rounded-xl font-bold text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailModal;
