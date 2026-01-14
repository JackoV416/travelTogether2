import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { getLocalizedCityName } from '../../../utils/tripUtils';
import { Search, X, ChevronUp } from 'lucide-react';

// Fix for default Leaflet icon issues in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle auto-fitting bounds
const AutoFitBounds = ({ markers }) => {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            // markers are already converted to [lat, lon] by the parent component logic
            const bounds = L.latLngBounds(markers.map(m => m.coordinates));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
    }, [map, markers]);

    return null;
};

const FootprintsLeafletMap = ({ isDarkMode, markers = [], initialCenter = [20, 0], initialZoom = 2 }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterType, setFilterType] = React.useState('all'); // 'all' | 'city' | 'attraction'
    const [filterPhoto, setFilterPhoto] = React.useState('all'); // 'all' | 'has' | 'none'

    // Custom Icons
    // Custom SVG Icons (Vector - No broken images)
    const createSvgIcon = (color) => new L.DivIcon({
        className: 'bg-transparent border-none',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full drop-shadow-lg filter"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    const cityIcon = createSvgIcon('#4f46e5'); // Indigo-600
    const attractionIcon = createSvgIcon('#ef4444'); // Red-500

    // Leaflet needs [lat, lon], but our app uses [lon, lat] mostly. 
    // Wait, FootprintsTab now passes [lon, lat] for simple-maps (geoJSON standard).
    // Leaflet needs [lat, lon]. We must swap them here.

    const leafletMarkers = React.useMemo(() => {
        return markers.map(m => ({
            ...m,
            displayName: getLocalizedCityName(m.name, i18n.language), // Localized name
            coordinates: [m.coordinates[1], m.coordinates[0]] // Swap to [lat, lon]
        }));
    }, [markers, i18n.language]);

    // Filter markers by search query AND filter options
    const filteredMarkers = React.useMemo(() => {
        let result = leafletMarkers;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(query) ||
                (m.displayName && m.displayName.toLowerCase().includes(query))
            );
        }

        // Type filter
        if (filterType !== 'all') {
            result = result.filter(m => m.type === filterType);
        }

        // Photo filter
        if (filterPhoto === 'has') {
            result = result.filter(m => m.photos && m.photos.length > 0);
        } else if (filterPhoto === 'none') {
            result = result.filter(m => !m.photos || m.photos.length === 0);
        }

        return result;
    }, [leafletMarkers, searchQuery, filterType, filterPhoto]);

    const hasActiveFilters = filterType !== 'all' || filterPhoto !== 'all' || searchQuery.trim();
    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setFilterPhoto('all');
    };

    return (
        <div className={`rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full isolate z-0`}>
            {/* Search & Filter Bar Overlay - Premium Glass Style */}
            {/* Mobile: Bottom-Right fixed, Desktop: Top-Right absolute */}
            <div className="absolute top-4 right-4 z-[500] hidden sm:flex flex-col items-end gap-3 pointer-events-none">
                {/* Search Input */}
                <div className="relative pointer-events-auto group">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none transition-colors ${isDarkMode ? 'text-indigo-400 group-focus-within:text-indigo-300' : 'text-indigo-500 group-focus-within:text-indigo-600'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋城市..."
                        className={`w-60 pl-10 pr-8 py-2.5 rounded-full text-xs font-bold border shadow-lg backdrop-blur-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all duration-300 ${isDarkMode
                            ? 'bg-black/60 border-white/10 text-white placeholder-gray-400 group-focus-within:bg-black/80'
                            : 'bg-white/80 border-white/40 text-gray-900 placeholder-gray-500 group-focus-within:bg-white/95'
                            }`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-xs font-bold transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns Row */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Results Count Badge - Contextual */}
                    {hasActiveFilters && (
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border animate-scale-in ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                            {filteredMarkers.length} / {leafletMarkers.length}
                        </div>
                    )}

                    {/* Type Filter */}
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-[10px] font-bold border shadow-lg backdrop-blur-xl cursor-pointer transition-all hover:scale-105 active:scale-95 outline-none ${filterType !== 'all'
                                ? 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'
                                : (isDarkMode ? 'bg-black/60 border-white/10 text-gray-300 hover:bg-black/80' : 'bg-white/80 border-white/40 text-gray-700 hover:bg-white/95')
                                }`}
                        >
                            <option value="all">類型: 全部</option>
                            <option value="city">城市</option>
                            <option value="attraction">景點</option>
                        </select>
                        <ChevronUp className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none transition-transform ${filterType !== 'all' ? 'text-white/80' : 'opacity-50'}`} />
                    </div>

                    {/* Photo Filter */}
                    <div className="relative">
                        <select
                            value={filterPhoto}
                            onChange={(e) => setFilterPhoto(e.target.value)}
                            className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-[10px] font-bold border shadow-lg backdrop-blur-xl cursor-pointer transition-all hover:scale-105 active:scale-95 outline-none ${filterPhoto !== 'all'
                                ? 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'
                                : (isDarkMode ? 'bg-black/60 border-white/10 text-gray-300 hover:bg-black/80' : 'bg-white/80 border-white/40 text-gray-700 hover:bg-white/95')
                                }`}
                        >
                            <option value="all">相片: 全部</option>
                            <option value="has">有相片</option>
                            <option value="none">無相片</option>
                        </select>
                        <ChevronUp className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none transition-transform ${filterPhoto !== 'all' ? 'text-white/80' : 'opacity-50'}`} />
                    </div>

                    {/* Clear All Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="w-7 h-7 flex items-center justify-center rounded-full shadow-lg backdrop-blur-xl bg-red-500 text-white hover:bg-red-600 active:scale-90 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Filter Toggle Button (Replaces full bar on mobile) */}
            <div className="absolute bottom-4 right-4 z-[500] sm:hidden flex flex-col gap-2 pointer-events-auto">
                {/* Mobile Search/Filter Logic Trigger (Simplified for now - just show count or simple toggle) */}
                {/* For this request, we keep it simple: Show simplified badges or just hide complex filters on tiny screens, or stack them at bottom */}
                {/* Let's render a scrollable horizontal list at the bottom for mobile */}
            </div>

            {/* Mobile Bottom Filter Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-[500] sm:hidden flex gap-2 overflow-x-auto pb-2 pointer-events-auto scrollbar-hide">
                <div className="relative group shrink-0">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 z-10 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋..."
                        className={`w-32 pl-8 pr-4 py-2 rounded-full text-[10px] font-bold border shadow-lg backdrop-blur-xl focus:ring-2 focus:ring-indigo-500/50 outline-none ${isDarkMode
                            ? 'bg-black/60 border-white/10 text-white'
                            : 'bg-white/80 border-white/40 text-gray-900'
                            }`}
                    />
                </div>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`appearance-none px-4 py-2 rounded-full text-[10px] font-bold border shadow-lg backdrop-blur-xl outline-none ${filterType !== 'all'
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : (isDarkMode ? 'bg-black/60 border-white/10 text-gray-300' : 'bg-white/80 border-white/40 text-gray-700')
                        }`}
                >
                    <option value="all">類型: 全部</option>
                    <option value="city">城市</option>
                    <option value="attraction">景點</option>
                </select>

                <select
                    value={filterPhoto}
                    onChange={(e) => setFilterPhoto(e.target.value)}
                    className={`appearance-none px-4 py-2 rounded-full text-[10px] font-bold border shadow-lg backdrop-blur-xl outline-none ${filterPhoto !== 'all'
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : (isDarkMode ? 'bg-black/60 border-white/10 text-gray-300' : 'bg-white/80 border-white/40 text-gray-700')
                        }`}
                >
                    <option value="all">相片: 全部</option>
                    <option value="has">有相片</option>
                    <option value="none">無相片</option>
                </select>
            </div>

            {/* Header Overlay - Moved left to avoid overlap with search */}
            <div className="absolute top-6 left-14 z-[400] pointer-events-none">
                {/* Leaflet controls are usually top-left, so push title a bit right or bottom */}
                {/* Or just keep it clean */}
            </div>

            <MapContainer
                center={[initialCenter[1], initialCenter[0]]} // Swap to [lat, lon]
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={isDarkMode
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                    }
                />

                {filteredMarkers.map((marker, idx) => {
                    // Photo Icon Logic
                    const hasPhotos = marker.photos && marker.photos.length > 0;
                    let customIcon = marker.type === 'attraction' ? attractionIcon : cityIcon;

                    if (hasPhotos) {
                        const coverPhoto = marker.photos[0].url;
                        const count = marker.photos.length;
                        const borderColor = marker.type === 'attraction' ? '#ef4444' : '#4f46e5';

                        customIcon = new L.DivIcon({
                            className: 'bg-transparent border-none',
                            html: `
                                <div class="relative w-12 h-12 group cursor-pointer transition-transform hover:scale-110 hover:z-50">
                                    <div class="absolute inset-0 rounded-xl border-2 overflow-hidden bg-white shadow-xl" style="border-color: ${borderColor}">
                                        <img src="${coverPhoto}" class="w-full h-full object-cover" />
                                    </div>
                                    ${count > 1 ? `
                                    <div class="absolute -top-2 -right-2 bg-black/80 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
                                        ${count}
                                    </div>` : ''}
                                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b-2 border-r-2" style="border-color: ${borderColor}"></div>
                                </div>
                            `,
                            iconSize: [48, 48],
                            iconAnchor: [24, 52],
                            popupAnchor: [0, -52]
                        });
                    }

                    return (
                        <Marker
                            key={`${marker.name}-${idx}`}
                            position={marker.coordinates}
                            icon={customIcon}
                            zIndexOffset={hasPhotos ? 1000 : 0}
                        >
                            <Popup className="font-sans min-w-[200px] p-0 overflow-hidden rounded-xl" autoPanPadding={[50, 50]}>
                                {hasPhotos ? (
                                    <div className="flex flex-col">
                                        {/* Photo Gallery Header */}
                                        <div className="relative h-32 w-full bg-gray-100">
                                            <img src={marker.photos[0].url} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent text-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold truncate flex-1">{marker.displayName || marker.name}</div>
                                                    {marker.photos[0].uploadedAt && (
                                                        <div className="text-[10px] font-mono opacity-90 bg-black/30 px-1 rounded">
                                                            {marker.photos[0].uploadedAt.split('T')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[10px] opacity-80">{marker.photos.length} Photos</div>
                                            </div>
                                        </div>
                                        {/* Simplified Gallery Grid (first 4) */}
                                        {marker.photos.length > 1 && (
                                            <div className="grid grid-cols-4 gap-0.5 mt-0.5">
                                                {marker.photos.slice(0, 4).map((p, i) => (
                                                    <div key={i} className="aspect-square relative group" title={p.uploadedAt ? p.uploadedAt.split('T')[0] : ''}>
                                                        <img src={p.url} className="w-full h-full object-cover" />
                                                        {i === 3 && marker.photos.length > 4 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                                                                +{marker.photos.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="p-2 text-xs text-gray-500">
                                            Owned by: {marker.photos[0].uploadedBy || 'Unknown'}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm font-bold">{marker.displayName || marker.name}</div>
                                        {marker.type && <div className="text-xs opacity-70 capitalize">{marker.type}</div>}
                                    </>
                                )}
                            </Popup>
                        </Marker>
                    );
                })}

                <AutoFitBounds markers={leafletMarkers} />
            </MapContainer>
        </div>
    );
};

export default FootprintsLeafletMap;
