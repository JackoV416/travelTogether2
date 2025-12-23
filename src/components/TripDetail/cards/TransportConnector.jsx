import React, { useState } from 'react';
import { Footprints, Train, ArrowDown, Plus, Loader2, Sparkles, MapPin, Clock, Navigation } from 'lucide-react';
import { getDirections, getSmartTransportMode } from '../../../services/mapsDirections';
import { getSmartItemImage } from '../../../utils/tripUtils';

const TransportConnector = ({ fromItem, toItem, isDarkMode, onAdd, trip }) => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    // V1.2.4: Pass trip context for proper image fallback (fixes dead images in tutorial)
    const destinationImage = getSmartItemImage(toItem, trip) || "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400";

    const handleFetchAI = async () => {
        const origin = fromItem.details?.location || fromItem.name;
        const dest = toItem.details?.location || toItem.name;
        if (!origin || !dest) return;

        setLoading(true);
        try {
            const res = await getDirections(origin, dest);
            if (res) {
                setInfo(res);
            }
        } catch (err) {
            console.error("TransportConnector fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const isWalking = info?.mode === 'walking' || getSmartTransportMode(info?.distance) === 'walking';

    return (
        <div className="ml-[48px] md:ml-[70px] mt-2 mb-6 pr-4 relative z-0">
            {/* Visual Flow Connector (The line behind everything) */}
            <div className={`absolute left-[-31px] top-[-10px] bottom-[-10px] w-0.5 border-l-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} z-0`} />

            <div className={`group relative flex h-[90px] w-full rounded-2xl overflow-hidden border backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-0.5 z-10
                ${isDarkMode ? 'bg-indigo-900/10 border-indigo-500/10' : 'bg-white/40 border-indigo-500/20 shadow-sm'}`}>

                {/* Left Section: Visual Thumbnail (Destination-focused) - Hidden on Mobile */}
                <div className="hidden md:block relative w-1/4 h-full overflow-hidden shrink-0 border-r border-dashed border-gray-400/20">
                    <img
                        src={destinationImage}
                        alt={toItem.name}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                            {info ? (
                                isWalking ? <Footprints className="w-4 h-4 text-orange-400" /> : <Train className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Navigation className="w-4 h-4 text-white/70" />
                            )}
                        </div>
                    </div>

                    {/* Ticket Notches */}
                    <div className={`absolute -right-2 top-0 w-4 h-4 rounded-full -mt-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b border-gray-400/20`} />
                    <div className={`absolute -right-2 bottom-0 w-4 h-4 rounded-full -mb-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t border-gray-400/20`} />
                </div>

                {/* Right Section: Info & Action */}
                <div className="flex-1 flex items-center justify-between px-4 py-2">
                    <div className="min-w-0">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Jarvis Processing...</span>
                            </div>
                        ) : info ? (
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Suggested Link</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-sm font-black tracking-tight">
                                        <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <span>{info.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold opacity-50">
                                        <MapPin className="w-3 h-3" />
                                        <span>{info.distance}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleFetchAI}
                                className={`flex flex-col items-start transition-all duration-300 group/btn`}
                            >
                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 group-hover/btn:text-indigo-500 group-hover/btn:opacity-100 transition-all">下一站</span>
                                <div className="flex items-center gap-2 text-[11px] font-bold opacity-60 group-hover/btn:opacity-100 transition-all">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                                    顯示路線詳情
                                </div>
                            </button>
                        )}
                    </div>

                    {info && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdd({
                                    type: isWalking ? 'walk' : 'transport',
                                    name: isWalking ? `步行至 ${toItem.name}` : `搭乘交通至 ${toItem.name}`,
                                    details: {
                                        duration: info.durationValue
                                        // location: `${fromItem.name} -> ${toItem.name}`, // REMOVED: User requested no pre-fill
                                        // transportType: isWalking ? 'walk' : 'train'     // REMOVED: User requested no pre-fill
                                    }
                                });
                            }}
                            className={`flex flex-col items-center gap-1 p-2 px-3 rounded-xl transition-all duration-300 active:scale-95 shadow-lg group/add
                                ${isDarkMode ? 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600'}`}
                        >
                            <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform duration-300" />
                            <span className="text-[9px] font-black uppercase">Add Trip</span>
                        </button>
                    )}
                </div>

                {/* Vertical Decorative Arrow */}
                <div className="absolute left-[12.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <ArrowDown className="w-5 h-5 text-white animate-bounce" />
                </div>
            </div>
        </div>
    );
};

export default TransportConnector;
