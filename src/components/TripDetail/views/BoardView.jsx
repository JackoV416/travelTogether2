import React, { useState } from 'react';
import { MapPin, Clock, MoreHorizontal, Heart, MessageCircle, Share2, Calendar, Info } from 'lucide-react';
import { formatTime } from '../../../utils/tripUtils';

const BoardView = ({ items, days, isDarkMode, onItemClick, isEditMode }) => {
    // Separate items into columns for manual masonry or use CSS columns
    // CSS columns is easier for pure display.
    const [notification, setNotification] = useState(null);

    const showToast = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 px-1 pb-20 animate-fade-in">
            {items.map((item, idx) => {
                const categoryColor = {
                    flight: 'from-indigo-500 to-indigo-600',
                    hotel: 'from-rose-500 to-rose-600',
                    food: 'from-amber-500 to-amber-600',
                    spot: 'from-cyan-500 to-cyan-600',
                    transport: 'from-purple-500 to-purple-600',
                    shopping: 'from-fuchsia-500 to-fuchsia-600'
                }[item.type] || 'from-gray-500 to-gray-600';

                return (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={`break-inside-avoid mb-4 rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] cursor-pointer group shadow-sm hover:shadow-xl ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-100'
                            } ${isEditMode ? 'ring-2 ring-indigo-500/50 border-indigo-500/50' : ''}`}
                    >
                        {/* Edit Mode Badge */}
                        {isEditMode && (
                            <div className="absolute top-2 left-2 z-20 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg animate-pulse uppercase tracking-widest">
                                EDITABLE
                            </div>
                        )}
                        {/* Visual Header (SNS Style) */}
                        <div className={`h-24 bg-gradient-to-br ${categoryColor} relative p-4 flex flex-col justify-end`}>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-white font-bold text-2xl drop-shadow-md truncate">
                                {/* eslint-disable-next-line no-misleading-character-class */}
                                {item.name.replace(/^[\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u2C60-\u2C7F\uA720-\uA7FF\uAB30-\uAB6F\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]+\s*/u, '').replace(/^[✈️🏨🚆🍽️⛩️🛍️🎢🛂]+\s*/u, '')}
                            </div>
                            <div className="text-white/80 text-[10px] font-mono flex items-center gap-1">
                                <span className="bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm">{item.type.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 space-y-3">
                            {/* Meta Row */}
                            <div className="flex items-center justify-between text-xs opacity-60">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>{item.date?.slice(5) || 'TBD'}</span>
                                    {item.startTime && (
                                        <>
                                            <span className="opacity-30">|</span>
                                            <Clock className="w-3 h-3" />
                                            <span>{item.startTime}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            {item.details?.location && (
                                <div className="flex items-start gap-1.5 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                    <span className="opacity-80 leading-relaxed line-clamp-2">{item.details.location}</span>
                                </div>
                            )}

                            {/* Notes Preview (if any) */}
                            {item.details?.notes && (
                                <div className={`text-xs p-2 rounded-lg italic line-clamp-3 ${isDarkMode ? 'bg-black/20 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                                    "{item.details.notes}"
                                </div>
                            )}

                            {/* Social Actions (Mock for SNS 2.0) */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); showToast('❤️ Like 功能將於 2.0 版本推出！'); }} className="hover:text-rose-500 transition-colors"><Heart className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); showToast('💬 Comment 功能將於 2.0 版本推出！'); }} className="hover:text-blue-500 transition-colors"><MessageCircle className="w-4 h-4" /></button>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); showToast('🔗 Share 功能將於 2.0 版本推出！'); }} className="hover:text-indigo-500 transition-colors"><Share2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                );
            })}


            {/* CSS Toast Notification */}
            {notification && (
                <div className="fixed left-1/2 -translate-x-1/2 z-50 animate-fade-in-up" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
                    <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className="bg-indigo-500/20 p-1.5 rounded-full">
                            <Info className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-sm font-bold pr-2">{notification}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardView;
