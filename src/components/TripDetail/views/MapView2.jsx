import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Info, MapPin, Navigation, Map as MapIcon, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Custom hook to manage map view programmatically
 */
const MapController = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, bounds, map]);
    return null;
};

/**
 * MapView2: Full Interactive Map with Route Animation.
 * Migrated to Leaflet + OpenStreetMap.
 */
const MapView2 = ({ items, trip, isDarkMode, onItemClick }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const animationTimerRef = useRef(null);

    // Filter items with coordinates
    const validItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter(item => item && item.coordinates && item.coordinates.length === 2);
    }, [items]);

    // Calculate bounds
    const bounds = useMemo(() => {
        if (validItems.length === 0) return null;
        return validItems.map(item => item.coordinates);
    }, [validItems]);

    // Initial center (Hong Kong or first valid item)
    const initialCenter = useMemo(() => {
        if (validItems.length > 0) return validItems[0].coordinates;
        return [22.3193, 114.1694]; // HK
    }, [validItems]);

    // Calculate Route Stats (Distance & Stops)
    const routeStats = useMemo(() => {
        if (validItems.length < 2) return null;
        let totalDist = 0;
        const toRad = (v) => v * Math.PI / 180;

        for (let i = 0; i < validItems.length - 1; i++) {
            const p1 = validItems[i].coordinates;
            const p2 = validItems[i + 1].coordinates;
            if (!p1 || !p2) continue;

            const R = 6371; // km
            const dLat = toRad(p2[0] - p1[0]);
            const dLon = toRad(p2[1] - p1[1]);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            totalDist += R * c;
        }
        return {
            distance: totalDist.toFixed(1),
            stops: validItems.length
        };
    }, [validItems]);

    // Custom Marker Icons using SVG for high performance and styling
    const createCustomIcon = (type, index, isActive) => {
        const color = getCategoryColor(type);
        const size = isActive ? 36 : 30;

        return L.divIcon({
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-full h-full rounded-full animate-pulse bg-${color}/20 scale-150 ${isActive ? 'block' : 'hidden'}"></div>
                    <div style="background-color: ${color}; width: ${size}px; height: ${size}px;" 
                         class="rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-[10px] transition-all duration-300">
                        ${index + 1}
                    </div>
                </div>
            `,
            className: 'custom-marker-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    // Animation Logic
    const togglePlayback = () => {
        if (isPlayingRef.current) {
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
            isPlayingRef.current = false;
            setIsPlaying(false);
        } else {
            isPlayingRef.current = true;
            setIsPlaying(true);
            const startIdx = activeIndex < validItems.length - 1 ? activeIndex + 1 : 0;
            playNextStep(startIdx);
        }
    };

    const playNextStep = (index) => {
        if (index >= validItems.length || !isPlayingRef.current) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            return;
        }

        setActiveIndex(index);

        animationTimerRef.current = setTimeout(() => {
            playNextStep(index + 1);
        }, 2500); // 2.5 seconds per spot
    };

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        };
    }, []);

    // Helper functions for styles
    const getCategoryColor = (type) => {
        const colors = {
            flight: '#6366f1',
            hotel: '#f43f5e',
            food: '#f59e0b',
            spot: '#06b6d4',
            transport: '#8b5cf6',
            shopping: '#d946ef'
        };
        return colors[type] || '#6b7280';
    };

    // Mosaic/Dark mode tile variants
    const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    return (
        <div className="relative w-full h-full bg-transparent overflow-hidden rounded-2xl border border-white/10 shadow-2xl group/map leaflet-container-fix">
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container { background: ${isDarkMode ? '#0f172a' : '#f8fafc'} !important; width: 100%; height: 100%; }
                .leaflet-control-zoom { border: none !important; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important; margin-left: 20px !important; margin-bottom: 20px !important; }
                .leaflet-control-zoom-in, .leaflet-control-zoom-out { 
                    background-color: ${isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important; 
                    color: ${isDarkMode ? '#fff' : '#000'} !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                }
                .leaflet-control-zoom-in { border-radius: 12px 12px 0 0 !important; }
                .leaflet-control-zoom-out { border-radius: 0 0 12px 12px !important; }
                .leaflet-bar a:hover { background-color: ${isDarkMode ? '#374151' : '#f3f4f6'} !important; }
                .leaflet-vignette {
                    pointer-events: none;
                    position: absolute;
                    inset: 0;
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.2);
                    z-index: 400;
                }
            `}} />

            <MapContainer
                center={initialCenter}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={false}
                className="w-full h-full"
            >
                <TileLayer
                    url={tileUrl}
                    attribution={attribution}
                />

                <MapController
                    center={(activeIndex !== -1 && validItems[activeIndex]) ? validItems[activeIndex].coordinates : null}
                    zoom={15}
                    bounds={activeIndex === -1 ? bounds : null}
                />

                {validItems.map((item, idx) => (
                    <Marker
                        key={item.id}
                        position={item.coordinates}
                        icon={createCustomIcon(item.type, idx, activeIndex === idx)}
                        eventHandlers={{
                            click: () => {
                                setIsPlaying(false);
                                setActiveIndex(idx);
                                onItemClick && onItemClick(item);
                            }
                        }}
                    >
                        <Popup className="custom-leaflet-popup">
                            <div className="p-1">
                                <p className="font-bold text-sm m-0">{item.name}</p>
                                <p className="text-[10px] opacity-60 m-0 mt-1">{item.details?.location}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {validItems.length > 1 && (
                    <Polyline
                        positions={validItems.map(item => item.coordinates)}
                        pathOptions={{
                            color: '#6366f1',
                            weight: 4,
                            opacity: 0.7,
                            dashArray: '10, 10'
                        }}
                    />
                )}

                <ZoomControl position="bottomleft" />
            </MapContainer>

            <div className="leaflet-vignette"></div>

            {/* Controls Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[1000] pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <button
                        onClick={togglePlayback}
                        className={`px-4 py-3 rounded-2xl backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 transition-all active:scale-95 ${isPlaying
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-800'
                            }`}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        <span className="text-sm font-black uppercase tracking-tighter">
                            {isPlaying ? 'PAUSE ROUTE' : 'PLAY ROUTE'}
                        </span>
                    </button>

                    {activeIndex !== -1 && (
                        <button
                            onClick={() => {
                                setIsPlaying(false);
                                if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
                                setActiveIndex(-1);
                            }}
                            className="p-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/20 shadow-xl text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-95 w-fit"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    )}

                    {/* Route Stats Overlay */}
                    {routeStats && (
                        <div className="mt-4 p-4 rounded-2xl bg-indigo-600/90 text-white backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col gap-1 min-w-[120px] animate-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-2 mb-1">
                                <Navigation className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Route Stats</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black leading-none">{routeStats.distance}</span>
                                <span className="text-[10px] font-bold opacity-60">KM</span>
                            </div>
                            <div className="text-[10px] font-medium opacity-70">
                                Total {routeStats.stops} Stops
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Card Overlay */}
                <div className="flex flex-col gap-2 pointer-events-auto items-end">
                    {activeIndex !== -1 && validItems[activeIndex] && (
                        <div className="w-64 p-4 rounded-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
                            {/* Visual Indicator of current index */}
                            <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: getCategoryColor(validItems[activeIndex].type) }} />

                            <div className="flex items-center justify-between mb-3">
                                <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-inner">
                                    STEP {activeIndex + 1}
                                </span>
                                <span className="text-[10px] font-mono font-bold opacity-40">{validItems[activeIndex].time || '--:--'}</span>
                            </div>

                            <h4 className="font-black text-sm leading-tight mb-2 dark:text-white truncate pr-2">
                                {validItems[activeIndex].name}
                            </h4>

                            <p className="text-[11px] opacity-60 flex items-start gap-1.5 mb-4 line-clamp-2">
                                <MapPin className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                                {validItems[activeIndex].details?.location}
                            </p>

                            <button
                                onClick={() => onItemClick && onItemClick(validItems[activeIndex])}
                                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 active:translate-y-0.5"
                            >
                                VIEW DETAILS <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty State Overlay */}
            {validItems.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-[2000] pointer-events-none">
                    <div className="p-5 rounded-full bg-white/10 border border-white/20 mb-4 animate-pulse">
                        <MapIcon className="w-10 h-10 text-white/60" />
                    </div>
                    <p className="text-white font-black tracking-widest uppercase text-sm">No GPS Coordinates</p>
                    <p className="text-white/40 text-[10px] sm:text-xs text-center px-8">Simulation data has been updated. For your own trips, Jarvis will soon help auto-detect coordinates.</p>
                </div>
            )}
        </div>
    );
};

export default MapView2;
