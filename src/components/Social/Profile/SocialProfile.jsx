import React, { useState } from 'react';
import { Map, Image, Award, Share2, Grid, UserPlus, Settings } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import FootprintsLeafletMap from './FootprintsLeafletMap';
import PhotoGallery from './PhotoGallery';
import BadgesDisplay from './BadgesDisplay';
import { COUNTRIES_DATA, CITY_COORDS } from '../../../constants/appData';
import { useTranslation } from 'react-i18next';

const SocialProfile = ({ user, currentUser, isOwnProfile, trips = [], isDarkMode, onEditProfile }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('footprints');
    const [enrichedTrips, setEnrichedTrips] = useState(trips);

    // Sync props to local state
    React.useEffect(() => {
        setEnrichedTrips(trips);
    }, [trips]);

    // Fetch full details (files) for trips if missing
    React.useEffect(() => {
        const fetchMissingDetails = async () => {
            const updates = [];
            for (const trip of trips) {
                // If files property is completely missing (undefined), likely incomplete data
                if (trip.files === undefined) {
                    try {
                        const snap = await getDoc(doc(db, "trips", trip.id));
                        if (snap.exists()) {
                            updates.push({ id: trip.id, ...snap.data() });
                        }
                    } catch (e) {
                        console.error("Failed to enrich trip", trip.id, e);
                    }
                }
            }

            if (updates.length > 0) {
                setEnrichedTrips(prev => prev.map(t => {
                    const update = updates.find(u => u.id === t.id);
                    return update ? { ...t, ...update } : t;
                }));
            }
        };

        if (trips.length > 0) {
            fetchMissingDetails();
        }
    }, [trips]);

    // Safe access to user properties
    const targetUid = user.uid || user.id;
    const targetName = user.displayName || user.name || t('profile.default_name');

    // Calculate Stats
    const { stats, visitedCountries, continentStats, markers } = React.useMemo(() => {
        // Use enrichedTrips instead of trips
        const sourceTrips = enrichedTrips;

        if (!sourceTrips.length) return {
            stats: { countries: 0, trips: 0, continents: 0 },
            visitedCountries: [],
            continentStats: { Asia: 0, Europe: 0, Americas: 0, Africa: 0, Oceania: 0 },
            markers: [] // Ensure markers exists
        };

        const userTrips = sourceTrips.filter(t => t.members?.some(m => (m.id === targetUid || m.uid === targetUid)));
        const uniqueCountryCodes = new Set(userTrips.map(t => t.country).filter(Boolean));

        // Calculate Continents
        const continents = new Set();
        const cStats = { Asia: 0, Europe: 0, Americas: 0, Africa: 0, Oceania: 0 };

        uniqueCountryCodes.forEach(code => {
            const countryData = COUNTRIES_DATA[code];
            if (countryData?.continent) {
                continents.add(countryData.continent);
                // Map to simpler keys for UI
                let key = countryData.continent;
                if (key.includes('America')) key = 'Americas'; // Group North/South
                if (cStats[key] !== undefined) cStats[key]++;
            }
        });

        return {
            stats: {
                countries: uniqueCountryCodes.size,
                trips: userTrips.length,
                continents: continents.size
            },
            visitedCountries: Array.from(uniqueCountryCodes),
            continentStats: cStats,
            markers: (() => {
                const cityPhotos = {}; // Map CityName -> [Photos]
                const explicitCitiesMap = {}; // CityName -> Coords

                userTrips.forEach(t => {
                    // 1. Process Explicit Cities
                    if (t.city) {
                        const cities = t.city.includes('->')
                            ? t.city.split('->').map(c => c.trim())
                            : [t.city];

                        cities.forEach(cityName => {
                            let coords = CITY_COORDS[cityName];
                            if (!coords) {
                                const enName = cityName.match(/^([a-zA-Z\s]+)/)?.[1]?.trim();
                                if (enName && CITY_COORDS[enName]) coords = CITY_COORDS[enName];
                            }
                            if (coords) explicitCitiesMap[cityName] = [coords.lon, coords.lat];
                        });
                    }

                    // 2. Process Photos
                    if (t.files) {
                        const imageFiles = t.files.filter(f => {
                            const isImg = f.type && f.type.startsWith('image/');
                            const isNotReceipt = !f.name.includes('單') && !f.name.toLowerCase().includes('receipt');
                            // Only show photos owned by the profile user we are viewing
                            const isOwner = (f.ownerId === targetUid) || (f.uploadedBy === targetName);
                            return isImg && isNotReceipt && isOwner;
                        });

                        imageFiles.forEach(file => {
                            const date = file.uploadedAt?.split ? file.uploadedAt.split('T')[0] : file.uploadedAt;
                            const locInfo = t.locations && t.locations[date];
                            const city = locInfo?.city || t.city;
                            if (!city) return;

                            const targetCity = city.split('->').pop().trim();
                            if (!cityPhotos[targetCity]) cityPhotos[targetCity] = [];
                            cityPhotos[targetCity].push(file);
                        });
                    }
                });

                // 3. Combine Cities and Photos
                const allCities = [...new Set([...Object.keys(explicitCitiesMap), ...Object.keys(cityPhotos)])];

                return allCities.map(cityName => {
                    let coords = explicitCitiesMap[cityName];
                    // If city only exists in photos, try to find coords
                    if (!coords) {
                        let c = CITY_COORDS[cityName];
                        if (!c) {
                            const enName = cityName.match(/^([a-zA-Z\s]+)/)?.[1]?.trim();
                            if (enName && CITY_COORDS[enName]) c = CITY_COORDS[enName];
                        }
                        if (c) coords = [c.lon, c.lat];
                    }

                    if (!coords) return null;

                    return {
                        name: cityName,
                        coordinates: coords,
                        type: 'city',
                        photos: cityPhotos[cityName] || []
                    };
                }).filter(Boolean);
            })()
        };
    }, [user, trips, targetUid, enrichedTrips]);

    if (!user) return <div className="p-8 text-center opacity-50">{t('profile.login_prompt')}</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in pb-24">
            {/* Profile Header Card */}
            <div className={`relative overflow-hidden rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                {/* Cover Image - Use user.bannerURL if available */}
                <div className="h-48 sm:h-64 bg-gray-200 relative overflow-hidden group">
                    {user.bannerURL ? (
                        <img src={user.bannerURL} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        {isOwnProfile && onEditProfile && (
                            <button
                                onClick={onEditProfile}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-end -mt-12 sm:-mt-16 gap-6 mb-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${isDarkMode ? 'border-gray-800' : 'border-white'} shadow-2xl overflow-hidden bg-white`}>
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName)}&background=6366f1&color=fff`}
                                    alt={targetName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Level Badge (Mock for now) */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-white font-bold" title={t('profile.level') + " 5"}>
                                5
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">{targetName}</h1>
                            <p className="text-sm opacity-60 flex items-center justify-center sm:justify-start gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs">{user.region || "Hong Kong"}</span>
                                <span>{t('profile.joined')} {user.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : '2024'}</span>
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 sm:gap-8 justify-center sm:justify-end py-4 sm:py-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="text-center">
                                <div className="text-xl font-black">{stats.countries}</div>
                                <div className="text-xs opacity-50 font-bold uppercase tracking-wider">{t('profile.stats.countries')}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black">{stats.trips}</div>
                                <div className="text-xs opacity-50 font-bold uppercase tracking-wider">{t('profile.stats.trips')}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black">{stats.continents}</div>
                                <div className="text-xs opacity-50 font-bold uppercase tracking-wider">{t('profile.stats.continents')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-2 overflow-x-auto">
                        <TabButton
                            id="footprints"
                            label={t('profile.tabs.footprints')}
                            icon={Map}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                        <TabButton
                            id="gallery"
                            label={t('profile.tabs.gallery')}
                            icon={Image}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                        <TabButton
                            id="badges"
                            label={t('profile.tabs.badges')}
                            icon={Award}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-up">
                {activeTab === 'footprints' && (
                    <div className={`rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                        {/* Header Overlay */}
                        <div className="absolute top-6 left-6 z-10 pointer-events-none">
                            <h3 className="text-xl font-black mb-1 drop-shadow-md">{t('profile.map.title')}</h3>
                            <p className="text-sm opacity-80 font-medium drop-shadow-sm">
                                {t('profile.map.stats_desc', { count: stats.countries, percent: Math.round((stats.countries / 195) * 100) + 30 })}
                            </p>
                        </div>

                        {/* Leaflet Map */}
                        <FootprintsLeafletMap
                            isDarkMode={isDarkMode}
                            markers={markers || []}
                        />

                        {/* Stats Footer */}
                        <div className="grid grid-cols-5 divide-x divide-gray-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
                            <StatItem label={t('profile.map.continents.asia')} value={continentStats?.Asia || 0} />
                            <StatItem label={t('profile.map.continents.europe')} value={continentStats?.Europe || 0} />
                            <StatItem label={t('profile.map.continents.americas')} value={continentStats?.Americas || 0} />
                            <StatItem label={t('profile.map.continents.africa')} value={continentStats?.Africa || 0} />
                            <StatItem label={t('profile.map.continents.oceania')} value={continentStats?.Oceania || 0} />
                        </div>
                    </div>
                )}
                {activeTab === 'gallery' && <PhotoGallery isDarkMode={isDarkMode} trips={trips.filter(t => t.members?.some(m => (m.id === targetUid || m.uid === targetUid)))} />}
                {activeTab === 'badges' && <BadgesDisplay isDarkMode={isDarkMode} trips={trips.filter(t => t.members?.some(m => (m.id === targetUid || m.uid === targetUid)))} user={user} />}
            </div>

        </div>
    );
};

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, isDarkMode }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === id
            ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20')
            : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const StatItem = ({ label, value }) => (
    <div className="p-4 text-center hover:bg-black/5 transition-colors cursor-pointer">
        <div className="text-xl font-black text-indigo-500">{value}</div>
        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</div>
    </div>
);

export default SocialProfile;

