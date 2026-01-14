import React, { useState, useMemo, useEffect } from 'react';
import {
    Image as ImageIcon,
    FileText,
    StickyNote,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    Search,
    Filter,
    LayoutGrid,
    LayoutList,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Sparkles,
    BookOpen,
    PenLine,
    Map as MapIcon,
    MapPinned,
    Globe2
} from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useTranslation } from 'react-i18next';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import FootprintsLeafletMap from '../../Social/Profile/FootprintsLeafletMap'; // New Leaflet Map
import { glassCard as glassCardStyle } from '../../../utils/tripUtils'; // Import directly if prop is missing
import { CITY_COORDS } from '../../../constants/appData';
import { COUNTRIES_DATA } from '../../../constants/countries';

// ISO Mapping for Trip Country
const COUNTRY_ISO_MAP = {
    "Australia (澳洲)": "AU", "Australia": "AU",
    "Canada (加拿大)": "CA", "Canada": "CA",
    "France (法國)": "FR", "France": "FR",
    "Germany (德國)": "DE", "Germany": "DE",
    "Italy (義大利)": "IT", "Italy": "IT",
    "Japan (日本)": "JP", "Japan": "JP",
    "Korea (韓國)": "KR", "Korea": "KR",
    "Malaysia (馬來西亞)": "MY", "Malaysia": "MY",
    "Singapore (新加坡)": "SG", "Singapore": "SG",
    "Spain (西班牙)": "ES", "Spain": "ES",
    "Switzerland (瑞士)": "CH", "Switzerland": "CH",
    "Taiwan (台灣)": "TW", "Taiwan": "TW",
    "Thailand (泰國)": "TH", "Thailand": "TH",
    "United Kingdom (英國)": "GB", "United Kingdom": "GB", "UK": "GB",
    "United States (美國)": "US", "United States": "US", "USA": "US"
};

/**
 * FootprintsTab (足跡) - Unified Travel Footprints
 * Combines Map (Location), Timeline (Time), and Notebook (Thoughts).
 * Replaces the legacy JournalTab.
 */
const FootprintsTab = ({ trip, user, isOwner, isDarkMode, currentLang, onViewProfile, viewingMember }) => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState('map'); // 'map' | 'timeline' | 'editor'
    const [searchValue, setSearchValue] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Map Data Preparation
    const visitedCountries = useMemo(() => {
        const codes = [];
        const tripCountry = trip.country;
        if (tripCountry) {
            // Try direct map
            if (COUNTRY_ISO_MAP[tripCountry]) codes.push(COUNTRY_ISO_MAP[tripCountry]);
            else {
                // Try fuzzy match
                const key = Object.keys(COUNTRY_ISO_MAP).find(k => tripCountry.includes(k));
                if (key) codes.push(COUNTRY_ISO_MAP[key]);
            }
        }
        // If multi-city, we might parse trip.locations in future
        return codes;
    }, [trip.country]);

    // Calculate Continent Stats (Scoped to Trip)
    const continentStats = useMemo(() => {
        const stats = { Asia: 0, Europe: 0, Americas: 0, Africa: 0, Oceania: 0 };
        const tripCountry = trip.country;
        let countryData = null;

        // 1. Try Trip Country
        if (tripCountry) {
            // Direct
            countryData = COUNTRIES_DATA[tripCountry];

            // Fuzzy
            if (!countryData) {
                const key = Object.keys(COUNTRIES_DATA).find(k =>
                    tripCountry.includes(k) || k.includes(tripCountry)
                );
                if (key) countryData = COUNTRIES_DATA[key];
            }
        }

        // 2. Fallback: Try Trip Cities (if no country found)
        if (!countryData && trip.city) {
            const cities = trip.city.includes('->') ? trip.city.split('->').map(c => c.trim()) : [trip.city];

            // Find which country has these cities
            const foundCountryKey = Object.keys(COUNTRIES_DATA).find(countryKey => {
                const cData = COUNTRIES_DATA[countryKey];
                return cData.cities && cData.cities.some(knownCity =>
                    cities.some(tripCity => tripCity.includes(knownCity) || knownCity.includes(tripCity))
                );
            });

            if (foundCountryKey) countryData = COUNTRIES_DATA[foundCountryKey];
        }

        // 3. Last fallback: ISO code
        if (!countryData && visitedCountries.length > 0) {
            const code = visitedCountries[0];
            countryData = Object.values(COUNTRIES_DATA).find(c => c.tz === code || c.currency.startsWith(code));
        }

        if (countryData?.continent) {
            let key = countryData.continent;
            if (key.includes('America')) key = 'Americas';
            if (stats[key] !== undefined) stats[key] = Math.max(stats[key], 1); // Ensure at least 1
        }

        // DEBUG: Force values to check if HMR is working
        // return { Asia: 1, Europe: 2, Americas: 3, Africa: 4, Oceania: 5 };
        return stats;
    }, [trip.country, trip.city, visitedCountries]);

    // Calculate Markers (City + Attractions)
    const mapMarkers = useMemo(() => {
        const markers = [];

        // 1. City Markers
        const cityPhotos = {}; // Map CityName -> [Photos]

        // Pre-process Photos
        if (trip.files) {
            const imageFiles = trip.files.filter(f => {
                // 1. Must be Image
                // 2. Not a receipt (simple check: usually strict PDFs, but can check name too)
                // 3. Permission: If viewingMember is set, must match owner
                const isImg = f.type && f.type.startsWith('image/');
                const isNotReceipt = !f.name.includes('單') && !f.name.toLowerCase().includes('receipt'); // Heuristic
                const hasPermission = !viewingMember || (f.ownerId === viewingMember.id) || (f.uploadedBy === viewingMember.name); // Fallback to name if id missing
                return isImg && isNotReceipt && hasPermission;
            });

            imageFiles.forEach(file => {
                // Find Location by Date
                const date = file.uploadedAt?.split ? file.uploadedAt.split('T')[0] : file.uploadedAt; // Handle generic date string
                // Check trip.locations map (Date -> { city: "Tokyo" })
                const locInfo = trip.locations && trip.locations[date];
                const city = locInfo?.city || trip.city; // Fallback to main trip city

                // Handle multi-city strings "Tokyo -> Osaka"
                const targetCity = city.split('->').pop().trim(); // Use destination

                if (!cityPhotos[targetCity]) cityPhotos[targetCity] = [];
                cityPhotos[targetCity].push(file);
            });
        }

        // Consolidate List of Cities to Render
        const explicitCities = trip.city
            ? (trip.city.includes('->') ? trip.city.split('->').map(c => c.trim()) : [trip.city])
            : [];

        // Add any cities that have photos but aren't in the explicit list
        const photoCities = Object.keys(cityPhotos);
        const allCities = [...new Set([...explicitCities, ...photoCities])];

        allCities.forEach(cityName => {
            let coords = CITY_COORDS[cityName];
            if (!coords) {
                const enName = cityName.match(/^([a-zA-Z\s]+)/)?.[1]?.trim();
                if (enName && CITY_COORDS[enName]) coords = CITY_COORDS[enName];
            }

            // Attach photos if any
            const photos = cityPhotos[cityName] || [];

            if (coords) {
                markers.push({
                    name: cityName,
                    coordinates: [coords.lon, coords.lat],
                    type: 'city',
                    photos: photos
                });
            }
        });

        // 2. Attraction Markers from Itinerary
        // Iterate through all days and activities
        Object.values(trip.itinerary || {}).forEach(dayActivities => {
            dayActivities.forEach(activity => {
                // Use coordinates directly from activity data if available
                // SIMULATION_DATA usually stores as [lat, lon], Map needs [lon, lat]
                if (activity.coordinates && Array.isArray(activity.coordinates) && activity.coordinates.length === 2) {
                    markers.push({
                        name: activity.name || activity.content || "Spot",
                        coordinates: [activity.coordinates[1], activity.coordinates[0]], // Swap Lat/Lon to Lon/Lat
                        type: 'attraction'
                    });
                }
            });
        });

        return markers.filter(m => {
            // Filter by viewingMember if selected
            if (!viewingMember) return true;
            // City markers are always shown (context) or filtered? User asked to see "different people's footprints".
            // Ideally, city markers are global context. Attraction markers are specific.
            // If the activity has a 'createdBy' or 'attendees', we filter.
            // Currently activity doesn't clearly store 'attendees' in this view, but usually 'createdBy'.
            // Let's assume for now we show ALL if no member selected, or filter by creator if member selected?
            // Actually, for a shared trip, activities are usually "for everyone" unless assigned.
            // But the user said "Trip入面個足跡要睇到所有人 同 唔同人嘅足跡" implying distinction.
            // If the data structure doesn't support assignment, we can't filter attractions accurately yet.
            // However, NOTES and PHOTOS usually have an author.
            // Let's filter MEMORIES (Notes/Photos) strictly.
            // For MAP markers (itinerary items), we show them all to provide context OR filter if they have 'createdBy'.

            if (m.type === 'city') return true; // Always show cities for context

            // For attractions, check if we can filter
            // Ideally check m.createdBy.id === viewingMember.id (if available in activity)
            return true; // Keep all map markers for now as attractions are usually shared
        });
    }, [trip.city, trip.itinerary, trip.files, trip.locations, viewingMember]);

    // Calculate Map Center & Zoom suitable for the markers
    const mapViewSettings = useMemo(() => {
        if (mapMarkers.length === 0) return { center: [10, 20], zoom: 1 };

        const avgLon = mapMarkers.reduce((sum, m) => sum + m.coordinates[0], 0) / mapMarkers.length;
        const avgLat = mapMarkers.reduce((sum, m) => sum + m.coordinates[1], 0) / mapMarkers.length;

        // If we have detailed attraction markers, zoom in more
        const hasAttractions = mapMarkers.some(m => m.type === 'attraction');
        return { center: [avgLon, avgLat], zoom: hasAttractions ? 10 : 4 };
    }, [mapMarkers]);

    // Editor States
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    const [editNote, setEditNote] = useState({ title: '', content: '', date: '' });

    // Merge notes and files into a single timeline array for Timeline View
    const mergedMemories = useMemo(() => {
        const getSafeDate = (d) => {
            if (!d) return new Date(0); // Fallback to epoch if missing
            if (d?.seconds) return new Date(d.seconds * 1000); // Firestore Timestamp
            return new Date(d); // ISO String or Date object
        };

        const fileMemories = (trip.files || []).map(f => ({
            ...f,
            memoryType: 'file',
            parsedDate: getSafeDate(f.uploadedAt || trip.startDate),
            isImage: f.type?.startsWith('image/')
        }));

        const noteMemories = (Array.isArray(trip.notes) ? trip.notes : []).map(n => ({
            ...n,
            memoryType: 'note',
            parsedDate: getSafeDate(n.date || n.createdAt)
        }));

        const memoryLogs = (trip.memories || []).map(m => ({
            ...m,
            memoryType: 'log',
            parsedDate: getSafeDate(m.date)
        }));

        return [...fileMemories, ...noteMemories, ...memoryLogs].sort((a, b) =>
            b.parsedDate - a.parsedDate
        );
    }, [trip.files, trip.notes, trip.memories, trip.startDate]);

    const filteredMemories = mergedMemories.filter(m => {
        // 1. Filter by Member (if selected)
        if (viewingMember) {
            const authorId = m.authorId || m.createdBy?.id || m.userId; // Check various author fields
            const authorName = m.author || m.createdBy?.name || m.userName;

            // Match by ID preferred, fallback to Name
            const isMatch = (authorId && (authorId === viewingMember.id || authorId === viewingMember.uid)) ||
                (!authorId && authorName === viewingMember.name);

            if (!isMatch) return false;
        }

        const matchesSearch =
            (m.name?.toLowerCase() || m.title?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
            (m.content?.toLowerCase() || '').includes(searchValue.toLowerCase());

        const matchesCategory =
            activeCategory === 'all' ||
            (activeCategory === 'photos' && m.isImage) ||
            (activeCategory === 'notes' && m.memoryType === 'note') ||
            (activeCategory === 'files' && m.memoryType === 'file' && !m.isImage);

        return matchesSearch && matchesCategory;
    });

    // Note Handlers
    const handleAddNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;
        try {
            const noteToAdd = {
                id: crypto.randomUUID(),
                ...newNote,
                createdAt: new Date().toISOString(),
                author: user?.displayName || 'Traveler',
                authorId: user?.uid
            };
            await updateDoc(doc(db, "trips", trip.id), { notes: arrayUnion(noteToAdd) });
            setNewNote({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
            setIsAddingNote(false);
        } catch (error) { console.error("Add note failed", error); }
    };

    const handleDeleteNote = async (note) => {
        if (!confirm("確定要刪除這條筆記嗎？")) return;
        try {
            await updateDoc(doc(db, "trips", trip.id), { notes: arrayRemove(note) });
        } catch (error) { console.error("Delete note failed", error); }
    };

    const handleSaveNoteEdit = async (oldNote) => {
        try {
            const currentNotes = Array.isArray(trip.notes) ? trip.notes : [];
            const updatedNotes = currentNotes.map(n =>
                n.id === oldNote.id ? { ...n, ...editNote, updatedAt: new Date().toISOString() } : n
            );
            await updateDoc(doc(db, "trips", trip.id), { notes: updatedNotes });
            setEditingNoteId(null);
        } catch (error) { console.error("Update note failed", error); }
    };

    const categories = [
        { id: 'all', label: '全部' },
        { id: 'photos', label: '相片' },
        { id: 'notes', label: '筆記' },
        { id: 'files', label: '文件' }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* View Switcher */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map'
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Globe2 className="w-4 h-4" />
                        {t('footprints.map')}
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'timeline'
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        {t('footprints.timeline')}
                    </button>
                    <button
                        onClick={() => setViewMode('editor')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'editor'
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <PenLine className="w-4 h-4" />
                        {t('footprints.notebook')}
                    </button>
                </div>

                {viewMode === 'editor' && (
                    <button
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAddingNote ? "取消" : "新增筆記"}
                    </button>
                )}
            </div>

            {/* Content Area */}

            {/* MAP VIEW */}
            {viewMode === 'map' && (
                <div className="animate-fade-in space-y-4" key="map-view-container">
                    <div className={`rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl isolate`} data-tour="map-content">
                        {/* Header Overlay (Stats Dynamic Island) */}
                        <div
                            className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-[9999] pointer-events-none drop-shadow-2xl"
                        >
                            <div className={`
                                flex items-center gap-2 sm:gap-4 px-3 py-2 sm:px-5 sm:py-3 rounded-full border backdrop-blur-xl transition-all duration-300 max-w-[95vw]
                                ${isDarkMode
                                    ? 'bg-black/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                                    : 'bg-white/80 border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)]'
                                }
                            `}>
                                {/* Icon / Avatar - Smaller on mobile */}
                                <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                                    <MapPinned className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                </div>

                                {/* Texts */}
                                <div className="flex flex-col">
                                    <h3 className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {viewingMember ? `${viewingMember.name} 的足跡` : t('footprints.map')}
                                    </h3>
                                    <p className={`text-xs sm:text-sm font-black tabular-nums whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {viewingMember
                                            ? `已分享 ${mapMarkers.length} 個地點`
                                            : `已探索 ${visitedCountries.length} 國 • ${mapMarkers.length} 打卡點`
                                        }
                                    </p>
                                </div>

                                {/* Divider - Hide on very small screens */}
                                <div className={`hidden xs:block w-px h-6 sm:h-8 mx-0.5 sm:mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

                                {/* Mini Chart / Extra Info - Hide on mobile if tight */}
                                <div className="hidden xs:flex items-center gap-1 sm:gap-2">
                                    <Globe2 className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                    <span className={`text-[10px] sm:text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {Math.round((visitedCountries.length / 195) * 100)}% 世界
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Header Overlay (Simplified) */}
                        {/* Hidden on mobile because the main island above is now centered/adaptive */}

                        {/* Map Container - Ensure local z-context */}
                        <div className="h-[500px] w-full bg-indigo-50/50 dark:bg-gray-900/50 relative z-[0]">
                            <FootprintsLeafletMap
                                isDarkMode={isDarkMode}
                                markers={mapMarkers}
                                initialCenter={mapViewSettings.center}
                                initialZoom={mapViewSettings.zoom}
                            />
                        </div>

                        {/* Stats Footer */}
                        <div className="grid grid-cols-5 divide-x divide-gray-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 relative z-[10]">
                            {['Asia', 'Europe', 'Americas', 'Africa', 'Oceania'].map(cont => (
                                <div key={cont} className="p-4 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className={`text-xl font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} group-hover:scale-110 transition-transform`}>
                                        {continentStats[cont] !== undefined ? continentStats[cont] : '-'}
                                    </div>
                                    <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{t(`profile.map.continents.${cont.toLowerCase()}`)}</div>
                                </div>
                            ))}
                        </div>
                        {/* DEBUG: Removed after verification */}
                    </div>
                </div>
            )}

            {/* TIMELINE VIEW */}
            {viewMode === 'timeline' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <SearchFilterBar
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                placeholder="搜尋往事足跡..."
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/5 hover:bg-white/10 opacity-60'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {filteredMemories.length === 0 ? (
                        <EmptyState
                            icon={Sparkles}
                            title="尚未留下足跡"
                            description="開始上傳相片、保存機票，或在筆記本中記錄點滴。"
                            isDarkMode={isDarkMode}
                            action={{
                                label: "切換到筆記本",
                                onClick: () => setViewMode('editor'),
                                icon: BookOpen
                            }}
                        />
                    ) : (
                        <div className="relative pl-8 border-l border-indigo-500/30 ml-4 space-y-10 py-4">
                            {filteredMemories.map((m) => (
                                <div key={m.id} className="relative group/item">
                                    <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-slate-950 z-10 transition-transform group-hover/item:scale-125"></div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="w-24 shrink-0 text-[10px] font-black opacity-40 uppercase tracking-tighter pt-2">
                                            {m.parsedDate.toISOString().split('T')[0]}
                                        </div>
                                        <div className={`${glassCardStyle(isDarkMode)} flex-1 p-6 hover:shadow-2xl transition-all duration-500`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {m.memoryType === 'file' && m.isImage && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                                                        {m.memoryType === 'file' && !m.isImage && <FileText className="w-4 h-4 text-sky-400" />}
                                                        {m.memoryType === 'note' && <StickyNote className="w-4 h-4 text-indigo-400" />}
                                                        <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                                                            {m.isImage ? 'Photo' : m.memoryType}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-2">{m.name || m.title || m.memo}</h4>
                                                    {m.content && <p className="text-sm opacity-70 mb-4 leading-relaxed line-clamp-3 group-hover/item:line-clamp-none transition-all">{m.content}</p>}
                                                    {m.memoryType === 'file' && m.isImage && (
                                                        <div className="max-w-md rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                                            <img src={m.url} alt={m.name} className="w-full hover:scale-105 transition-transform duration-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {m.url && (
                                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 shadow-sm">
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* NOTEBOOK EDITOR VIEW */}
            {viewMode === 'editor' && (
                <div className="space-y-6 animate-fade-in">
                    {isAddingNote && (
                        <div className={`${glassCardStyle(isDarkMode)} p-6 border-2 border-indigo-500/30 animate-scale-in`}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="筆記標題 (如：第一天心情、必買清單...)"
                                    className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-bold outline-none focus:border-indigo-500 transition-colors"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                                <div className="flex items-center gap-2 text-xs opacity-50">
                                    <Calendar className="w-3 h-3" />
                                    <input
                                        type="date"
                                        className="bg-transparent outline-none"
                                        value={newNote.date}
                                        onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    placeholder="開始寫作..."
                                    className="w-full h-40 bg-white/5 rounded-xl p-4 outline-none focus:ring-2 ring-indigo-500/50 resize-none"
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleAddNote}
                                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Check className="w-4 h-4" /> 儲存筆記
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {(Array.isArray(trip.notes) ? trip.notes : []).length === 0 ? (
                            <EmptyState
                                icon={PenLine}
                                title="筆記本是空的"
                                description="在這裡寫下您的旅遊日記，它們會自動同步到足跡時光流中。"
                                isDarkMode={isDarkMode}
                                action={{
                                    label: "開始寫作",
                                    onClick: () => setIsAddingNote(true),
                                    icon: Plus
                                }}
                            />
                        ) : (
                            (Array.isArray(trip.notes) ? trip.notes : []).map(note => (
                                <div key={note.id} className={`${glassCardStyle(isDarkMode)} transition-all duration-300 hover:shadow-xl group`}>
                                    {editingNoteId === note.id ? (
                                        <div className="p-6 space-y-4">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-b border-white/20 py-1 text-lg font-bold outline-none"
                                                value={editNote.title}
                                                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full h-40 bg-white/5 rounded-xl p-4 outline-none resize-none"
                                                value={editNote.content}
                                                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                                            ></textarea>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 opacity-50 hover:opacity-100">取消</button>
                                                <button
                                                    onClick={() => handleSaveNoteEdit(note)}
                                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                                                >
                                                    儲存修改
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        <StickyNote className="w-5 h-5 text-indigo-400" />
                                                        {note.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 opacity-50 text-[10px] font-mono">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {note.date}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Try to find member object
                                                                const member = trip.members?.find(m => m.name === note.author || m.id === note.authorId);
                                                                if (member && onViewProfile) onViewProfile(member);
                                                            }}
                                                            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-indigo-500 overflow-hidden">
                                                                <img
                                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(note.author || 'U')}&background=random`}
                                                                    alt={note.author}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span className="hover:underline">By {note.author}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingNoteId(note.id); setEditNote(note); }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleDeleteNote(note)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed opacity-80">
                                                {note.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FootprintsTab;
