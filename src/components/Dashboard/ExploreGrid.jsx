import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Eye, MapPin, User, Loader2 } from 'lucide-react';
import { glassCard, getLocalizedCityName, getTripSeasonDisplay } from '../../utils/tripUtils';
import { PUBLIC_TRIPS_DATA, generateRandomMockTrips } from '../../constants/publicTripsData';
import FilterMenu from './FilterMenu';

/**
 * ExploreGrid - Pinterest-style masonry grid for static public trips
 * V1.3.11: Infinite Scroll, Localized Filters, and Rating Logic
 */
const ExploreGrid = ({ isDarkMode, onSelectTrip, userTrips }) => {
    const { t, i18n } = useTranslation();
    // Filters State
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCountries, setSelectedCountries] = React.useState([]);
    const [selectedCities, setSelectedCities] = React.useState([]);
    const [selectedBudget, setSelectedBudget] = React.useState('All');
    const [selectedThemes, setSelectedThemes] = React.useState([]);
    const [selectedRating, setSelectedRating] = React.useState('All');

    // Data State
    const [realTrips, setRealTrips] = React.useState([]);
    // V1.5.0: Shuffle Mock Data on init for freshness + Inject Dates for Season Badge
    const [mockTrips, setMockTrips] = React.useState(() => {
        const shuffled = [...PUBLIC_TRIPS_DATA].sort(() => 0.5 - Math.random());
        return shuffled.map(t => {
            const randomMonth = Math.floor(Math.random() * 12);
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + randomMonth);
            return {
                ...t,
                randomFactor: Math.random() * 30,
                startDate: t.startDate || futureDate.toISOString() // Assign random future date if missing
            };
        });
    });
    const [visibleTrips, setVisibleTrips] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Pagination State
    const [visibleCount, setVisibleCount] = React.useState(20);

    // Fetch Real Public Trips from Firestore
    React.useEffect(() => {
        const safetyTimer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        import('../../firebase').then(({ db }) => {
            import('firebase/firestore').then(({ collection, query, where, getDocs, limit }) => {
                const q = query(
                    collection(db, "trips"),
                    where("isPublic", "==", true),
                    limit(50)
                );
                getDocs(q).then((snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        hasRealFlights: !!doc.data().flightInfo, // Heuristic for "Real"
                        isMock: false,
                        randomFactor: Math.random() * 40 // Boost real trips variance
                    }));
                    setRealTrips(fetched);
                    clearTimeout(safetyTimer);
                    setIsLoading(false);
                }).catch(err => {
                    console.error("Failed to fetch public trips:", err);
                    setIsLoading(false);
                });
            });
        }).catch(() => setIsLoading(false));

        return () => clearTimeout(safetyTimer);
    }, []);

    // Derived Lists for Dropdowns (Merge Real + Mock)
    const combinedData = React.useMemo(() => {
        // Deduplicate: If a real trip has the same name as a mock trip, hide the mock one
        const realNames = new Set(realTrips.map(t => t.name));
        const filteredMock = mockTrips.filter(t => !realNames.has(t.name));
        return [...realTrips, ...filteredMock];
    }, [realTrips, mockTrips]);

    // Derived Lists for Dropdowns (Unified with countries.js)
    const countries = React.useMemo(() => {
        // Get all unique country names from combinedData
        const dataCountries = [...new Set(combinedData.map(t => t.country).filter(Boolean))];
        // Ensure 'All' is at the top
        return ['All', ...dataCountries];
    }, [combinedData]);

    const cities = React.useMemo(() => {
        // If countries are selected, show cities from those countries based on MASTER_CITY_DB or current data
        const dataCities = [...new Set(combinedData
            .filter(t => selectedCountries.length === 0 || selectedCountries.includes(t.country))
            .map(t => t.city)
            .filter(Boolean)
        )];
        return ['All', ...dataCities];
    }, [combinedData, selectedCountries]);

    const themes = ['All', 'Foodie', 'Culture', 'Shopping', 'History', 'Nature', 'Urban', 'Romance', 'Relaxing', 'Adventure', 'Family'];

    // Smart Recommendation & Filtering Engine
    React.useEffect(() => {
        let filtered = combinedData.filter(trip => {
            // ... (Filter logic matches exactly logic from 94-119, assumed managed by React ref/deps or kept generic here)
            // 1. Search
            const matchesSearch = !searchQuery || (
                (trip.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trip.name_zh || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trip.city || '').toLowerCase().includes(searchQuery.toLowerCase())
            );

            // 2. Multi-Select Filters
            const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(trip.country);
            const matchesCity = selectedCities.length === 0 || selectedCities.includes(trip.city);
            const matchesTheme = selectedThemes.length === 0 || (trip.tags && trip.tags.some(tag => selectedThemes.includes(tag)));
            const matchesRating = selectedRating === 'All' || (trip.rating || 0) >= selectedRating;

            let matchesBudget = true;
            const cost = trip.estimatedCost || 0;
            if (selectedBudget === 'Cheap') matchesBudget = cost < 5000;
            if (selectedBudget === 'Moderate') matchesBudget = cost >= 5000 && cost <= 15000;
            if (selectedBudget === 'Luxury') matchesBudget = cost > 15000;

            return matchesSearch && matchesCountry && matchesCity && matchesTheme && matchesBudget && matchesRating;
        });

        // 3. Smart Ranking (Randomized)
        const userCountries = new Set(userTrips?.map(t => t.country) || []);

        filtered.sort((a, b) => {
            let scoreA = a.randomFactor || 0; // Start with random noise
            let scoreB = b.randomFactor || 0;

            // Real Data Priority (Reduced slightly to allow mixing)
            if (!a.isMock) scoreA += 15;
            if (!b.isMock) scoreB += 15;

            // Relevance
            if (userCountries.has(a.country)) scoreA += 10;
            if (userCountries.has(b.country)) scoreB += 10;

            // Quality
            scoreA += (a.rating || 0) * 2;
            scoreB += (b.rating || 0) * 2;

            return scoreB - scoreA;
        });

        setVisibleTrips(filtered.slice(0, visibleCount));
    }, [combinedData, searchQuery, selectedCountries, selectedCities, selectedThemes, selectedBudget, selectedRating, userTrips, visibleCount]);

    // Keyboard Shortcut for Search (Cmd+K)
    const searchInputRef = React.useRef(null);
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Infinite Scroll Implementation
    const handleScroll = React.useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
            // Load more items
            setVisibleCount(prev => prev + 12);

            // If we are nearing the end of data, generate more mock
            if (visibleCount >= combinedData.length - 10) {
                const newTrips = generateRandomMockTrips(4, mockTrips.length);
                setMockTrips(prev => [...prev, ...newTrips]);
            }
        }
    }, [visibleCount, combinedData.length]);

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Adapter for FilterMenu
    const filters = {
        country: selectedCountries, // Now Array
        city: selectedCities,       // Now Array
        budget: selectedBudget,
        theme: selectedThemes,      // Now Array
        rating: selectedRating
    };

    const handleFilterChange = (key, value) => {
        if (key === 'country') {
            // Toggle Logic
            if (value === 'All') {
                setSelectedCountries([]);
                setSelectedCities([]);
            } else {
                setSelectedCountries(prev =>
                    prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
                );
                // Reset cities if country list changes significantly? 
                // Maybe keep cities if they still belong to selected countries.
                // For simplicity, let's not auto-clear cities unless 'All' is clicked.
            }
        }
        else if (key === 'city') {
            if (value === 'All') setSelectedCities([]);
            else setSelectedCities(prev => prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]);
        }
        else if (key === 'budget') setSelectedBudget(value); // Keep single for now
        else if (key === 'theme') {
            if (value === 'All') setSelectedThemes([]);
            else setSelectedThemes(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]);
        }
        else if (key === 'rating') setSelectedRating(value);
        else if (key === 'clear') {
            setSelectedCountries([]);
            setSelectedCities([]);
            setSelectedBudget('All');
            setSelectedThemes([]);
            setSelectedRating('All');
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 px-2">
                <span className="text-2xl">🌍</span> {t('dashboard.explore_community') || 'Explore Community'}
            </h3>

            {/* Smart Filter Bar */}
            <div className={`p-4 rounded-2xl border ${glassCard(isDarkMode)} space-y-4 relative z-50`}>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={t('dashboard.search_placeholder') || "Search cities, trips..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-black/5 border border-black/5 dark:border-white/10 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-400/80"
                        />
                        <span className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-400 transition-colors">🔍</span>

                        {/* Shortcut Hint */}
                        <div className="absolute right-3 top-2.5 flex items-center gap-1 pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity">
                            <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-medium text-gray-400 bg-white/10 border border-white/20 rounded">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    {/* Premium Filters */}
                    <FilterMenu
                        isDarkMode={isDarkMode}
                        countries={countries}
                        cities={cities}
                        themes={themes}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {visibleTrips.map((trip) => (
                    <div
                        key={trip.id}
                        onClick={() => onSelectTrip && onSelectTrip(trip)}
                        className={`break-inside-avoid mb-4 rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative ${glassCard(isDarkMode)} animate-fade-in`}
                    >
                        {/* Image Cover */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                            <img
                                src={trip.coverImage}
                                alt={trip.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
                                {/* City Badge */}
                                <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {getLocalizedCityName(trip.city, i18n.language) || trip.city}
                                </span>

                                {/* Season Badge */}
                                {(() => {
                                    const season = getTripSeasonDisplay(trip.startDate, i18n.language);
                                    return season && (
                                        <span className={`px-2 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border border-white/10 flex items-center gap-1 ${season.bg}`}>
                                            {season.text}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h4 className="font-bold text-lg leading-tight mb-2 drop-shadow-md">
                                {((i18n.language?.includes('zh')) && trip.name_zh) ? trip.name_zh : trip.name}
                            </h4>

                            <div className="flex items-center justify-between text-xs opacity-90 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-white/10">
                                        <img src={trip.author.avatar} alt={trip.author.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-medium truncate max-w-[80px]">{trip.author.name}</span>
                                </div>
                                <div className="flex items-center gap-1 font-bold text-yellow-400">
                                    <span>★</span> {Number(trip.rating).toFixed(1)} <span className="text-white/60 font-normal">({trip.reviews})</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-white/70 border-t border-white/10 pt-2">
                                <div className="flex gap-2">
                                    {trip.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="bg-white/10 px-1.5 py-0.5 rounded">{t('themes.' + tag) || tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {trip.views > 1000 ? (trip.views / 1000).toFixed(1) + 'k' : trip.views}</span>
                                    <span className="font-bold text-emerald-400">
                                        {trip.estimatedCost < 5000 ? '$' : trip.estimatedCost > 15000 ? '$$$' : '$$'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-gray-100'}`}>
                        <Loader2 className={`w-6 h-6 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExploreGrid;
