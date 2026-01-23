import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if needed
import { useTranslation } from 'react-i18next';
import { Loader, MapPin, Calendar, Users, Share2, Copy, GitFork, ArrowLeft, Globe, BadgeCheck, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhHK, enUS, zhTW } from 'date-fns/locale';
import { getLocalizedCountryName, getLocalizedCityName, getTripSummary } from '../../utils/tripUtils'; // Adjust path
import { ItineraryTab } from '../TripDetail/tabs'; // Reuse existing ItineraryTab!
import { SEO } from '../Shared/SEO'; // Import SEO Component
// You might need to adjust imports depending on your folder link
// Assuming ItineraryTab is at ../TripDetail/tabs/ItineraryTab

import { forkTrip } from '../../services/forkTrip'; // V1.9.0

const PublicTripView = ({ user, isDarkMode }) => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isForking, setIsForking] = useState(false); // Forking state
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

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
            try {
                const docRef = doc(db, 'trips', tripId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (!data.isPublic && user?.uid !== data.ownerId) {
                        setError('private'); // Specific error for private trips
                    } else {
                        setTrip({ id: docSnap.id, ...data });
                        // Increment view count
                        try {
                            // Simple view counting - unique views would be better but this is a start
                            // Only increment if not the owner
                            if (user?.uid !== data.ownerId) {
                                await updateDoc(docRef, { viewCount: increment(1) });
                            }
                        } catch (e) {
                            console.warn("Failed to increment view count", e);
                        }
                    }
                } else {
                    setError('not_found');
                }
            } catch (err) {
                console.error("Error fetching public trip:", err);
                setError('error');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTrip();
        }
    }, [tripId, user]);

    // Derived Data
    const dateLocale = i18n.language === 'zh-HK' ? zhHK : i18n.language === 'en' ? enUS : zhTW;

    // Mock handlers for read-only view
    const handleNoOp = () => { };

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
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="w-24 h-24 bg-gray-500/10 rounded-full flex items-center justify-center mb-6">
                    {error === 'private' ? <Lock className="w-10 h-10 opacity-40" /> : <MapPin className="w-10 h-10 opacity-40" />}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                    {error === 'private' ? t('trip.errors.private_title', 'This trip is private') : t('trip.errors.not_found_title', 'Trip not found')}
                </h2>
                <p className="opacity-60 max-w-md mb-8">
                    {error === 'private'
                        ? t('trip.errors.private_desc', 'The owner has kept this itinerary private. Ask them for an invite link instead.')
                        : t('trip.errors.not_found_desc', 'The trip you are looking for does not exist or has been deleted.')}
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    {t('common.back_home', 'Back to Home')}
                </button>
            </div>
        );
    }

    // Cover Image (Reused logic from TripCard)
    const coverImage = trip.coverImage || (trip.city ? `/images/cities/${trip.city}.jpg` : '/images/default-trip.jpg');

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

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <button
                                        onClick={handleFork}
                                        disabled={isForking}
                                        className={`flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95 ${isForking ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isForking ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitFork className="w-5 h-5" />}
                                        <span>{isForking ? t('trip.forking', 'Forking...') : t('trip.fork_trip', 'Fork Trip')}</span>
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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {trip.ownerName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="text-sm font-bold flex items-center gap-1.5">
                                {trip.ownerName || 'Unknown Traveler'}
                                {trip.ownerVerified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-current/10" />}
                            </div>
                            <div className="text-xs opacity-60">@{trip.ownerHandle || 'traveler'}</div>
                        </div>
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
                            days={[]} // Pass empty or calculated days
                            // Pass no-op functions for required props to prevent crashes
                            onSaveItem={handleNoOp}
                            onDeleteItem={handleNoOp}
                            onMoveItem={handleNoOp}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Lock Icon component for the error state
const Lock = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export default PublicTripView;
