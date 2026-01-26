import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if needed
import { useTranslation } from 'react-i18next';
import { Shirt, Footprints, ShoppingBag, PieChart, Image as ImageIcon, Map as MapIcon, CalendarRange, Loader, MapPin, Calendar, Users, Share2, Copy, GitFork, ArrowLeft, Globe, BadgeCheck, Eye, Loader2, Moon, Clock, Globe2, Lock } from 'lucide-react';
// You might need to adjust imports depending on your folder link
import { format } from 'date-fns';
import { zhHK, enUS, zhTW } from 'date-fns/locale';
import { getLocalizedCountryName, getLocalizedCityName, getTripSummary, getDaysArray, getWeatherForecast, buildDailyReminder, getTimeDiff, getSafeCountryInfo, getHolidayMap, glassCard } from '../../utils/tripUtils'; // Adjust path
import { getWeather, getWeatherInfo } from '../../services/weather';
import { ItineraryTab, BudgetTab, ShoppingTab, PackingTab, FootprintsTab, GalleryTab } from '../TripDetail/tabs'; // Reuse existing Tabs
import { CITY_IMAGES, COUNTRIES_DATA, DEFAULT_BG_IMAGE, CITY_COORDS } from '../../constants/appData';
import { SEO } from '../Shared/SEO'; // Import SEO Component
// You might need to adjust imports depending on your folder link
// Assuming ItineraryTab is at ../TripDetail/tabs/ItineraryTab

import { forkTrip } from '../../services/forkTrip'; // V1.9.0
import ErrorPage from '../Shared/ErrorPage'; // V1.9.2

const PublicTripView = ({ user, isDarkMode, tripId: propTripId, setGlobalBg }) => {
    const { tripId: paramTripId } = useParams();
    const navigate = useNavigate();
    const tripId = propTripId || paramTripId; // Prefer prop if passed from App wrapper
    const { t, i18n } = useTranslation();
    const [trip, setTrip] = useState(null);
    const [profiles, setProfiles] = useState({}); // Store user profiles
    const [loading, setLoading] = useState(true);
    const [isForking, setIsForking] = useState(false); // Forking state
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

    // Default Public Modules (if undefined, usually only Itinerary is public, others are private/experimental)
    // We default all to FALSE for safety, Itinerary is always TRUE (base view)
    const publicModules = trip?.publicModules || {};
    const [viewMode, setViewMode] = useState('list'); // Fix: Add viewMode state
    const [selectDate, setSelectDate] = useState(null); // Fix: Add selectDate state
    const [weatherData, setWeatherData] = useState({}); // Intelligent Summary Data

    // Calculate days for ItineraryTab
    const days = useMemo(() => {
        if (!trip?.startDate || !trip?.endDate) return [];
        return getDaysArray(trip.startDate, trip.endDate);
    }, [trip?.startDate, trip?.endDate]);

    const handleFork = async () => {
        if (!user) return navigate('/login?redirect=/trip/' + tripId);
        if (isForking) return;

        setIsForking(true);
        try {
            const newTripId = await forkTrip(tripId, user);
            // Redirect to the new trip (which is now OWNED by the user, so standard view)
            navigate(`/trip/${newTripId}`);
        } catch (err) {
            console.error("Fork failed:", err);
            alert(t('trip.fork_failed', 'Failed to fork trip. Please try again.'));
            setIsForking(false);
        }
    };

    // Fetch trip data
    useEffect(() => {
        const fetchTrip = async () => {
            setError(null);
            try {
                const docRef = doc(db, 'trips', tripId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Check permissions: Public OR Owner OR Member
                    const isOwner = user?.uid === data.ownerId;
                    const isMember = data.members?.some(m => (typeof m === 'string' ? m === user?.uid : m.uid === user?.uid || m.id === user?.uid));

                    if (!data.isPublic && !isOwner && !isMember) {
                        setError('private'); // Specific error for private trips
                        setDebugError("Access Denied: Private Trip");
                    } else {
                        setTrip({ id: docSnap.id, ...data });
                        // Increment view count
                        try {
                            // Simple view counting - unique views would be better but this is a start
                            // Only increment if not the owner/member
                            if (user?.uid && !isOwner && !isMember) {
                                await updateDoc(docRef, { viewCount: increment(1) });
                            }
                        } catch (e) {
                            console.warn("Failed to increment view count", e);
                        }
                    }
                } else {
                    setError('not_found');
                    setDebugError(`Document ID not found: ${tripId}`);
                }
            } catch (err) {
                console.error("Error fetching public trip:", err.code, err.message);
                setDebugError(`Fetch Error: ${err.message} (${err.code})`);
                const isPermissionError = err.code === 'permission-denied' ||
                    err.message?.toLowerCase().includes('permission') ||
                    err.message?.toLowerCase().includes('access');

                if (isPermissionError) {
                    setError('private'); // 403
                } else {
                    setError('error'); // 404 or Generic
                }
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTrip();
        }
    }, [tripId, user]);

    // Fetch Profiles (Owner & Members)
    useEffect(() => {
        if (!trip) return;

        const fetchProfiles = async () => {
            const newProfiles = {};
            const uniqueIds = new Set();

            if (trip.ownerId) uniqueIds.add(trip.ownerId);
            if (trip.members) {
                trip.members.forEach(m => {
                    if (typeof m === 'string') uniqueIds.add(m);
                    else if (m.uid) uniqueIds.add(m.uid);
                    else if (m.id) uniqueIds.add(m.id);
                });
            }

            await Promise.all(Array.from(uniqueIds).map(async (uid) => {
                if (profiles[uid]) return; // Skip if already loaded
                try {
                    const snap = await getDoc(doc(db, 'users', uid));
                    if (snap.exists()) {
                        newProfiles[uid] = snap.data();
                    }
                } catch (e) {
                    console.warn(`Failed to load profile for ${uid}`, e);
                }
            }));

            if (Object.keys(newProfiles).length > 0) {
                setProfiles(prev => ({ ...prev, ...newProfiles }));
            }
        };

        fetchProfiles();
    }, [trip]);

    // Derived Data
    const dateLocale = i18n.language === 'zh-HK' ? zhHK : i18n.language === 'en' ? enUS : zhTW;
    const currentDisplayDate = selectDate || (trip?.startDate ? getDaysArray(trip.startDate, trip.endDate)[0] : null);

    // V1.9.7: Fix missing data - Derive itineraryItems for the current date
    const itineraryItems = useMemo(() => {
        if (!trip?.itinerary || !currentDisplayDate) return [];
        return trip.itinerary[currentDisplayDate] || [];
    }, [trip?.itinerary, currentDisplayDate]);

    // INTELLIGENT SUMMARY LOGIC
    // 1. Fetch Weather
    useEffect(() => {
        const fetchWeather = async () => {
            if (!trip?.city) return;
            // Use city coordinates if available, otherwise fallback to country capital or generic
            const coords = CITY_COORDS[trip.city] || CITY_COORDS[getSafeCountryInfo(trip.country).capital] || { lat: 35.6762, lon: 139.6503 }; // Default Tokyo
            const data = await getWeather(coords.lat, coords.lon || coords.lng, trip.city);
            if (data) setWeatherData(prev => ({ ...prev, [trip.city]: data }));
        };
        fetchWeather();
    }, [trip?.city, trip?.country]);

    // 2. Weather Derivation
    const dailyWeather = useMemo(() => {
        const rawDailyCity = trip?.city; // Simplify for public view
        const realWeather = weatherData?.[rawDailyCity];

        // Mock fallback logic
        const mockTempRange = (() => {
            if (realWeather?.temp) return `${realWeather.temp} / ${parseInt(realWeather.rawTemp) - 5}°C`; // Use normalized data
            if (!realWeather?.current_weather?.temperature && !realWeather?.current?.temperature_2m) return null;

            const val = realWeather.rawTemp || realWeather.current?.temperature_2m || realWeather.current_weather?.temperature;
            const currentTemp = Math.round(val);
            return `${currentTemp}°C / ${Math.max(currentTemp - 5, -10)}°C`;
        })();
        const mockWeather = getWeatherForecast(trip?.country, mockTempRange, realWeather?.desc, realWeather?.icon, t);

        if (!realWeather?.daily) return mockWeather;

        const idx = realWeather.daily.time.indexOf(currentDisplayDate);
        if (idx === -1) return mockWeather;

        const dayCode = realWeather.daily.weather_code[idx];
        const dayInfo = getWeatherInfo(dayCode);
        const maxTemp = Math.round(realWeather.daily.temperature_2m_max[idx]);
        const minTemp = Math.round(realWeather.daily.temperature_2m_min[idx]);
        const dayTemp = `${maxTemp}°C / ${minTemp}°C`;

        return getWeatherForecast(trip?.country, dayTemp, dayInfo.desc, dayInfo.icon, t);
    }, [weatherData, currentDisplayDate, trip?.city, trip?.country, t]);

    // 3. Reminders & Time Diff
    const destHolidays = useMemo(() => {
        const countryInfo = getSafeCountryInfo(trip?.country);
        return getHolidayMap(countryInfo.tz || "Global");
    }, [trip?.country]);

    const homeHolidays = useMemo(() => {
        // Assume default HK for public view or derive from user setting if available
        // Since public viewers might be anywhere, HK is a safe default for this app's target audience
        return getHolidayMap("HK");
    }, []);

    const dailyReminder = useMemo(() => {
        if (!currentDisplayDate) return "";
        return buildDailyReminder(currentDisplayDate, itineraryItems, t, destHolidays);
    }, [currentDisplayDate, itineraryItems, t, trip?.country, destHolidays]);

    const timeDiff = useMemo(() => {
        // Assume user viewing is in "HK" or "Global" timezone for now, or infer from browser?
        // Let's standardise to HK/TW as per target audience
        return getTimeDiff("HK", trip?.country);
    }, [trip?.country]);

    const dailyLocation = trip?.locations?.[currentDisplayDate];
    const headerCity = dailyLocation?.city || trip?.city;

    // Image Logic - Synced with Private View
    const coverImage = trip?.coverImage || CITY_IMAGES?.[headerCity] || COUNTRIES_DATA?.[trip?.country]?.image || DEFAULT_BG_IMAGE;

    // Set Global Background
    useEffect(() => {
        if (setGlobalBg) {
            setGlobalBg(coverImage);
            return () => setGlobalBg(null);
        }
    }, [coverImage, setGlobalBg]);
    const handleNoOp = () => { };

    const [debugError, setDebugError] = useState(null);

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <Loader className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="animate-pulse opacity-60">{t('common.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorPage
                type={error === 'private' ? '403' : '404'}
                isDarkMode={isDarkMode}
                errorDetail={debugError}
            />
        );
    }


    // Image logic moved to top to fix Hook Order


    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} pb-20`}>
            {/* SEO & Meta Tags */}
            <SEO
                title={trip.name}
                description={t('trip.public.meta_desc', {
                    name: trip.name,
                    days: trip.days || 1,
                    countries: trip.countries?.join(', ') || trip.country
                })}
                image={coverImage}
                type="article"
            />

            {/* Hero Header */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src={coverImage}
                    alt={trip.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'; }}
                />

                {/* Back Button */}
                <div className="absolute top-4 left-4 z-20 md:top-8 md:left-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-300 font-bold tracking-wider text-xs uppercase mb-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>{t('trip.public_view', 'PUBLIC ITINERARY')}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-sm">
                                    {trip.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm md:text-base font-medium">
                                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <Calendar className="w-4 h-4" />
                                        {trip.startDate && format(new Date(trip.startDate), 'MMM d, yyyy', { locale: dateLocale })}
                                        {trip.endDate && ` - ${format(new Date(trip.endDate), 'MMM d, yyyy', { locale: dateLocale })}`}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {trip.countries?.map(c => getLocalizedCountryName(c, i18n.language)).join(', ')}
                                    </span>
                                </div>
                            </div>

                            {/* V1.9.7: Intelligent Summary Bar (Public View) */}
                            <div className="flex flex-col lg:flex-row items-center lg:gap-4 gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-2xl w-full lg:w-auto mt-4 lg:mt-0">
                                <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start gap-4">
                                    {/* Weather - Day/Night Split */}
                                    <div className="flex items-center gap-3 min-w-fit">
                                        <div className="text-3xl filter drop-shadow opacity-90">{dailyWeather?.icon || "🌤️"}</div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">Day</span>
                                                <span className="text-xs font-bold text-white leading-none">{dailyWeather?.maxTemp ? `${dailyWeather.maxTemp}°C` : '--'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">Night</span>
                                                <span className="text-xs font-bold text-white/80 leading-none">{dailyWeather?.minTemp ? `${dailyWeather.minTemp}°C` : '--'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clothes */}
                                    <div className="hidden lg:block h-8 w-px bg-white/10" />
                                    <div className="flex flex-col justify-center min-w-fit items-end lg:items-start space-y-1">
                                        <div className="flex items-center gap-1.5 text-white/90" title={dailyWeather?.dayClothes}>
                                            <Shirt className="w-3 h-3 text-amber-300" />
                                            <span className="text-[10px] font-bold max-w-[90px] truncate">{dailyWeather?.dayClothes || "--"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/80" title={dailyWeather?.nightClothes}>
                                            <Moon className="w-3 h-3 text-indigo-300" />
                                            <span className="text-[10px] font-bold max-w-[90px] truncate">{dailyWeather?.nightClothes || "--"}</span>
                                        </div>
                                    </div>

                                    {/* Time Diff */}
                                    {timeDiff !== undefined && timeDiff !== 0 && (
                                        <>
                                            <div className="hidden lg:block h-8 w-px bg-white/10" />
                                            <div className="flex flex-col justify-center min-w-fit items-end lg:items-start">
                                                <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-0.5">TIME</span>
                                                <div className="flex items-center gap-1.5 text-white/90">
                                                    <Clock className="w-3.5 h-3.5 opacity-80" />
                                                    <span className="text-xs font-bold whitespace-nowrap">當地 {timeDiff > 0 ? `+${timeDiff}` : timeDiff}h</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <button
                                        onClick={handleFork}
                                        disabled={isForking}
                                        className={`flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95 ${isForking ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isForking ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitFork className="w-5 h-5" />}
                                        <span>{isForking ? t('trip.forking', '複製中...') : t('trip.fork_trip', '複製此行程')}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login?redirect=/trip/' + tripId)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        <span>{t('auth.login_to_fork', 'Login to Fork')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Author & Stats Bar */}
            <div className={`border-b ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} sticky top-0 z-30 backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Owner Profile */}
                        {/* Owner Profile Logic */}
                        {(() => {
                            const ownerId = trip.ownerId;

                            // 1. Try Live Profile (fetched)
                            const liveProfile = profiles[ownerId];

                            // 2. Try Member Snapshot (Role-based OR ID-based)
                            const memberSnapshot = trip.members?.find(m =>
                                (typeof m !== 'string' && m.role === 'owner') ||
                                (m.uid === ownerId || m.id === ownerId)
                            );

                            // 3. Fallback to top-level fields
                            const displayName = liveProfile?.displayName || memberSnapshot?.name || trip.ownerName || 'Unknown Traveler';
                            const photoURL = liveProfile?.photoURL || memberSnapshot?.photoURL;
                            const handle = liveProfile?.email?.split('@')[0] || memberSnapshot?.email?.split('@')[0] || trip.ownerHandle || 'traveler';

                            return (
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {photoURL ? (
                                            <img
                                                src={photoURL}
                                                alt={displayName}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white/10 shadow-md"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {displayName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-white dark:border-gray-800">
                                            OWNER
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold flex items-center gap-1.5">
                                            {displayName}
                                            {trip.ownerVerified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-current/10" />}
                                        </div>
                                        <div className="text-xs opacity-60">@{handle}</div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Editors / Members Stack */}
                        {trip.members?.length > 1 && (
                            <div className="hidden sm:flex items-center pl-6 border-l border-gray-500/10">
                                <div className="flex -space-x-2">
                                    {trip.members
                                        .filter(m => {
                                            const id = typeof m === 'string' ? m : (m.uid || m.id);
                                            // Robust filter: Exclude actual owner (by role OR id) so they don't appear in small stack
                                            const isOwner = (typeof m !== 'string' && m.role === 'owner') || id === trip.ownerId;
                                            return !isOwner;
                                        })
                                        .slice(0, 5) // URL limit
                                        .map((m, i) => {
                                            const id = typeof m === 'string' ? m : (m.uid || m.id);
                                            const p = profiles[id];
                                            return (
                                                <div key={id} className="relative group/member">
                                                    {p?.photoURL ? (
                                                        <img
                                                            src={p.photoURL}
                                                            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800"
                                                            alt={p.displayName}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold">
                                                            {p?.displayName?.[0] || '?'}
                                                        </div>
                                                    )}
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover/member:opacity-100 transition pointer-events-none whitespace-nowrap">
                                                        {p?.displayName || 'Member'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {trip.members.length > 6 && (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            +{trip.members.length - 6}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium opacity-70">
                        <div className="flex items-center gap-1.5" title="Views">
                            <Eye className="w-4 h-4" />
                            <span>{trip.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Forks">
                            <GitFork className="w-4 h-4" />
                            <span>{trip.forkCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Only showing Itinerary for now - can expand later */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border overflow-hidden min-h-[500px]`}>
                    <div className="p-1">
                        <ItineraryTab
                            t={t}
                            trip={trip}
                            isDarkMode={isDarkMode}
                            readOnly={true} // IMPORTANT: New prop we need to support in ItineraryTab
                            days={(() => {
                                // Direct calculation since we have the function
                                if (!trip?.startDate || !trip?.endDate) return [];
                                return getDaysArray(trip.startDate, trip.endDate);
                            })()}
                            selectDate={selectDate}
                            setSelectDate={setSelectDate}
                            currentDisplayDate={currentDisplayDate} // Use the derived constant
                            itineraryItems={itineraryItems} // V1.9.7: Pass the derived items!
                            // Intelligent Summary Props
                            dailyWeather={dailyWeather}
                            dailyReminder={dailyReminder}
                            timeDiff={timeDiff}
                            headerCity={headerCity}
                            // Holiday Props (V1.9.7: Public View Parity)
                            destHolidays={destHolidays}
                            homeHolidays={homeHolidays}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            currentLang={i18n.language}
                            // Pass no-op functions for required props to prevent crashes
                            onSaveItem={handleNoOp}
                            onDeleteItem={handleNoOp}
                            onMoveItem={handleNoOp}
                            onAddItem={handleNoOp}
                            onEditItem={handleNoOp}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};



export default PublicTripView;
