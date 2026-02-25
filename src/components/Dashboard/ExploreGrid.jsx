import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Eye, MapPin, Loader2, Share2, MessageCircle, Trophy } from 'lucide-react';
import { getLocalizedCityName, getTripSeasonDisplay } from '../../utils/tripUtils';
import { PUBLIC_TRIPS_DATA, generateRandomMockTrips } from '../../constants/publicTripsData';
import { AuroraCard, AuroraGradientText } from '../Shared/AuroraComponents';
import { DEFAULT_BG_IMAGE } from '../../constants/appData';
import FilterMenu from './FilterMenu';
import CommunityHero from './CommunityHero';

/**
 * ExploreGrid - Pinterest-style masonry grid for static public trips
 * V2.1.0: Social-First Community Hub with Hero Section & Enhanced Feed
 */
const ExploreGrid = ({ isDarkMode, onSelectTrip, userTrips }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState('All');
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedSeason, setSelectedSeason] = useState(null);

    // Interaction State
    const [likedTrips, setLikedTrips] = useState(new Set());

    // Data State
    const [realTrips, setRealTrips] = useState([]);
    const [mockTrips, setMockTrips] = useState(() => {
        const shuffled = [...PUBLIC_TRIPS_DATA].sort(() => 0.5 - Math.random());
        return shuffled.map(t => {
            const randomMonth = Math.floor(Math.random() * 12);
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + randomMonth);
            return {
                ...t,
                likes: Math.floor(Math.random() * 500) + 50,
                randomFactor: Math.random() * 30,
                startDate: t.startDate || futureDate.toISOString()
            };
        });
    });
    const [visibleTrips, setVisibleTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);

    // Fetch Real Public Trips from Firestore
    useEffect(() => {
        const safetyTimer = setTimeout(() => setIsLoading(false), 3000);

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
                        likes: doc.data().likes || Math.floor(Math.random() * 100),
                        isMock: false,
                        randomFactor: Math.random() * 40
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

    const combinedData = useMemo(() => {
        const realNames = new Set(realTrips.map(t => t.name));
        const filteredMock = mockTrips.filter(t => !realNames.has(t.name));
        return [...realTrips, ...filteredMock];
    }, [realTrips, mockTrips]);

    const countries = useMemo(() => {
        const dataCountries = [...new Set(combinedData.map(t => t.country).filter(Boolean))];
        return ['All', ...dataCountries];
    }, [combinedData]);

    const citiesList = useMemo(() => {
        const dataCities = [...new Set(combinedData
            .filter(t => selectedCountries.length === 0 || selectedCountries.includes(t.country))
            .map(t => t.city)
            .filter(Boolean)
        )];
        return ['All', ...dataCities];
    }, [combinedData, selectedCountries]);

    const themesList = ['All', 'Foodie', 'Culture', 'Shopping', 'History', 'Nature', 'Urban', 'Romance', 'Relaxing', 'Adventure', 'Family'];

    useEffect(() => {
        let filtered = combinedData.filter(trip => {
            const matchesSearch = !searchQuery || (
                (trip.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trip.name_zh || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trip.city || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
            const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(trip.country);
            const matchesCity = selectedCities.length === 0 || selectedCities.includes(trip.city);
            const matchesTheme = selectedThemes.length === 0 || (trip.tags && trip.tags.some(tag => selectedThemes.includes(tag)));
            const matchesRating = selectedRating === 'All' || (trip.rating || 0) >= selectedRating;
            const matchSeason = !selectedSeason || (() => {
                if (!trip.startDate) return false;
                const month = new Date(trip.startDate).getMonth() + 1;
                if (selectedSeason === 'spring') return month >= 3 && month <= 5;
                if (selectedSeason === 'summer') return month >= 6 && month <= 8;
                if (selectedSeason === 'autumn') return month >= 9 && month <= 11;
                if (selectedSeason === 'winter') return month === 12 || month <= 2;
                return false;
            })();
            let matchesBudget = true;
            const cost = trip.estimatedCost || 0;
            if (selectedBudget === 'Cheap') matchesBudget = cost < 5000;
            if (selectedBudget === 'Moderate') matchesBudget = cost >= 5000 && cost <= 15000;
            if (selectedBudget === 'Luxury') matchesBudget = cost > 15000;

            return matchesSearch && matchesCountry && matchesCity && matchesTheme && matchesBudget && matchesRating && matchSeason;
        });

        const userCountriesSet = new Set(userTrips?.map(t => t.country) || []);
        filtered.sort((a, b) => {
            let scoreA = (a.randomFactor || 0) + (a.rating || 0) * 5 + (userCountriesSet.has(a.country) ? 20 : 0) + (a.isMock ? 0 : 30);
            let scoreB = (b.randomFactor || 0) + (b.rating || 0) * 5 + (userCountriesSet.has(b.country) ? 20 : 0) + (b.isMock ? 0 : 30);
            return scoreB - scoreA;
        });

        setVisibleTrips(filtered.slice(0, visibleCount));
    }, [combinedData, searchQuery, selectedCountries, selectedCities, selectedThemes, selectedBudget, selectedRating, selectedSeason, userTrips, visibleCount]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
            setVisibleCount(prev => prev + 12);
            if (visibleCount >= combinedData.length - 10) {
                const newTrips = generateRandomMockTrips(4, mockTrips.length);
                setMockTrips(prev => [...prev, ...newTrips]);
            }
        }
    }, [visibleCount, combinedData.length, mockTrips.length]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const toggleLike = (e, tripId) => {
        e.stopPropagation();
        setLikedTrips(prev => {
            const next = new Set(prev);
            if (next.has(tripId)) next.delete(tripId);
            else next.add(tripId);
            return next;
        });
    };

    const handleFilterChange = (key, value) => {
        if (key === 'country') {
            if (value === 'All') { setSelectedCountries([]); setSelectedCities([]); }
            else setSelectedCountries(prev => prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]);
        }
        else if (key === 'city') {
            if (value === 'All') setSelectedCities([]);
            else setSelectedCities(prev => prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]);
        }
        else if (key === 'budget') setSelectedBudget(value);
        else if (key === 'theme') {
            if (value === 'All') setSelectedThemes([]);
            else setSelectedThemes(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]);
        }
        else if (key === 'rating') setSelectedRating(value);
        else if (key === 'season') setSelectedSeason(value);
        else if (key === 'clear') {
            setSelectedCountries([]); setSelectedCities([]); setSelectedBudget('All');
            setSelectedThemes([]); setSelectedRating('All'); setSelectedSeason(null);
        }
    };

    const filters = {
        country: selectedCountries, city: selectedCities, budget: selectedBudget,
        theme: selectedThemes, rating: selectedRating, season: selectedSeason
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Community Discovery Hero */}
            <CommunityHero isDarkMode={isDarkMode} />

            {/* Smart Discovery Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <AuroraGradientText as="h3" className="text-xl font-black italic tracking-tight uppercase">
                            {t('community.discovery_feed') || 'Discovery Feed'}
                        </AuroraGradientText>
                        <p className="text-[10px] font-black text-gray-500 tracking-widest leading-none mt-1 uppercase italic">{t('community.personalized_subtitle') || 'Personalized for your journey'}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="w-full md:w-auto flex items-center gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder={t('dashboard.search_placeholder') || "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-black/40 border border-transparent focus:border-indigo-500/50 outline-none transition-all text-sm font-bold"
                        />
                        <span className="absolute left-3.5 top-3 text-gray-500">🔍</span>
                    </div>
                    <FilterMenu
                        isDarkMode={isDarkMode}
                        countries={countries}
                        cities={citiesList}
                        themes={themesList}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Masonry Layout - Redesigned Card */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-2">
                {visibleTrips.map((trip, idx) => {
                    const isLiked = likedTrips.has(trip.id);
                    const season = getTripSeasonDisplay(trip.startDate, currentLang);
                    const tripName = ((currentLang.includes('zh')) && trip.name_zh) ? trip.name_zh : trip.name;

                    return (
                        <AuroraCard
                            key={trip.id}
                            onClick={() => onSelectTrip && onSelectTrip(trip)}
                            className="break-inside-avoid mb-6 overflow-hidden cursor-pointer group relative shadow-2xl hover:scale-[1.02] transition-all duration-500 border-none rounded-[1.75rem]"
                            noPadding={true}
                        >
                            {/* Card Media */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <img
                                    src={trip.coverImage || DEFAULT_BG_IMAGE}
                                    alt={trip.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    loading={idx < 4 ? "eager" : "lazy"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                                {/* Top Overlay Badges — no italic/uppercase/tracking-widest: they clip CJK chars */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                                    <div className="flex flex-wrap gap-2 max-w-[70%]">
                                        <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xl text-white text-[11px] font-bold tracking-normal border border-white/10 shadow-lg leading-snug">
                                            {getLocalizedCityName(trip.city, currentLang) || trip.city}
                                        </span>
                                        {season && (
                                            <span className={`px-2.5 py-1 rounded-lg backdrop-blur-xl text-white text-[11px] font-bold tracking-normal border border-white/10 shadow-lg leading-snug ${season.bg}`}>
                                                {season.text}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => toggleLike(e, trip.id)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110' : 'bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 border border-white/10'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                {/* Rating Badge */}
                                <div className="absolute bottom-4 left-4 z-20">
                                    <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-xl">
                                        ★ {Number(trip.rating).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 text-white bg-slate-950/40 backdrop-blur-2xl border-t border-white/5 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="font-black text-lg leading-tight group-hover:text-indigo-300 transition-colors uppercase tracking-tighter italic">
                                        {tripName}
                                    </h4>
                                    <div className="flex gap-2">
                                        {trip.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-80 decoration-indigo-500/50">#{t('themes.' + tag) || tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/10 p-0.5">
                                                <img src={trip.author.avatar} alt={trip.author.name} className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {idx % 3 === 0 && (
                                                <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5 border border-white/20">
                                                    <Trophy className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black tracking-tight">{trip.author.name}</div>
                                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">{t('community.top_explorer') || 'Top Explorer'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-white/40">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                            <Eye className="w-3.5 h-3.5" />
                                            {trip.views > 1000 ? (trip.views / 1000).toFixed(1) + 'k' : trip.views}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            {trip.reviews || 0}
                                        </div>
                                        <button className="hover:text-white transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </AuroraCard>
                    );
                })}
            </div>

            {/* Pagination / Loading */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            )}

            {visibleTrips.length === 0 && !isLoading && (
                <div className="text-center py-20 opacity-40">
                    <p className="font-black italic uppercase text-lg tracking-widest">{t('community.no_trips_found') || 'No Journeys Found'}</p>
                    <p className="text-xs font-bold uppercase tracking-tighter mt-2">{t('community.try_another_filter') || 'Try adjusting your filters'}</p>
                </div>
            )}
        </div>
    );
};

export default ExploreGrid;
