import React from 'react';
import { Sparkles, X, MapPin, Clock, Info, Plane, TrainFront, BusFront, Car, Ship, Ticket, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { formatDuration, getSmartItemImage, getLocalizedCityName } from '../../utils/tripUtils';

const ItemDetailModal = ({ isOpen, onClose, isDarkMode, item, city, onEdit, onDelete }) => {
    if (!isOpen || !item) return null;

    // Helper to get Header Image
    const headerImage = getSmartItemImage(item) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";

    // Content Rendering Logic
    const renderContent = () => {
        // --- TRANSPORT ---
        if (item.type === 'transport' || item.type === 'flight') {
            const isFlight = item.type === 'flight';
            return (
                <div className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Duration
                            </div>
                            <div className="font-black text-xl">
                                {item.details?.duration ? formatDuration(item.details.duration) : "--"}
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Cost
                            </div>
                            <div className="font-black text-xl">
                                {item.cost > 0 ? `$${item.cost}` : "Free"}
                            </div>
                        </div>
                    </div>

                    {/* Transport Path Details */}
                    <div className={`p-5 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
                        {/* Vertical Line */}
                        <div className="absolute left-[30px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-indigo-500/50 to-purple-500/50"></div>

                        {/* Start Node */}
                        <div className="flex gap-4 mb-6 relative z-10">
                            <div className="w-10 flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"></div>
                                <div className="mt-1 text-[10px] font-mono opacity-50">{item.time}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-0.5">DEPARTURE</div>
                                <div className="font-black text-lg leading-tight">
                                    {isFlight ? (item.details?.fromCode || "Origin") : (item.details?.location?.split('->')[0] || "Start")}
                                </div>
                                {isFlight && item.details?.terminal && (
                                    <div className="text-xs font-bold text-indigo-500 mt-0.5">
                                        {item.details.terminal} {item.details.gate && `• Gate ${item.details.gate}`}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* End Node */}
                        <div className="flex gap-4 relative z-10">
                            <div className="w-10 flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                                <div className="mt-1 text-[10px] font-mono opacity-50">
                                    {/* Simple logic to add duration to time would go here if needed */}
                                    --:--
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-0.5">ARRIVAL</div>
                                <div className="font-black text-lg leading-tight">
                                    {isFlight ? (item.details?.toCode || "Dest") : (item.arrival || item.details?.location?.split('->')[1] || "Destination")}
                                </div>
                                {item.details?.exit && (
                                    <div className="text-xs font-bold text-emerald-500 mt-0.5 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                                        {item.details.exit}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> 查看路線 (View Route)
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
                        <span className="text-xs font-bold uppercase tracking-wider">關於此地 (About)</span>
                    </div>
                    <p className="leading-relaxed text-sm whitespace-pre-line opacity-90">
                        {item.details?.story || item.details?.desc || "暫無詳細介紹。"}
                    </p>
                </div>

                {/* Info List */}
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 opacity-50" />
                            <div className="text-sm">
                                <span className="opacity-60 block text-[10px] uppercase font-bold">預計時間 (Time)</span>
                                <span className="font-bold">{item.time} {item.details?.duration && `(${formatDuration(item.details.duration)})`}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4 opacity-50" />
                            <div className="text-sm">
                                <span className="opacity-60 block text-[10px] uppercase font-bold">預算 (Cost)</span>
                                <span className="font-bold">{item.cost > 0 ? `$${item.cost}` : "免費 Free"}</span>
                            </div>
                        </div>
                        {item.details?.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 opacity-50" />
                                <div className="text-sm">
                                    <span className="opacity-60 block text-[10px] uppercase font-bold">地址 (Address)</span>
                                    <span className="font-bold">{item.details.address}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {/* External Buttons */}
                    <button className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <ExternalLink className="w-4 h-4" /> 官方網站
                    </button>
                    <button className="flex-1 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> 導航
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
            <div className={`w-full sm:w-[500px] max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>

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
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                {item.type?.toUpperCase()}
                            </span>
                            {/* Detailed Tags */}
                            {item.details?.transportType && (
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/80 backdrop-blur-md px-2 py-1 rounded-lg">
                                    {item.details.transportType}
                                </span>
                            )}
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
                                編輯行程
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => {
                                    if (window.confirm("確定要刪除此行程嗎？\nAre you sure you want to delete this item?")) {
                                        onDelete(item.id);
                                        onClose();
                                    }
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
