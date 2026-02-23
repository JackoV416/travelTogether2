import React, { useState, useEffect, Suspense, lazy } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { getMockTripDetails } from '../../constants/publicTripsData';
import TripDetailSkeleton from '../Loaders/TripDetailSkeleton';
import HttpStatusPage from '../Shared/HttpStatusPage';

// Lazy load the content to keep this wrapper lightweight if needed, 
// though the wrapper itself is now lazy loaded by App.jsx.
// We can keep the existing pattern.
const TripDetailContent = lazy(() => import('../TripDetail/TripDetailContent'));

const TripDetailView = ({
    tripData,
    onBack,
    user,
    isDarkMode,
    setGlobalBg,
    isSimulation,
    isPreview = false,
    globalSettings,
    exchangeRates,
    onOpenSmartImport,
    weatherData,
    requestedTab,
    onTabHandled,
    requestedItemId,
    onItemHandled,
    isBanned,
    isAdmin,
    onOpenChat,
    onUserClick,
    onViewProfile,
    isChatOpen,
    setIsChatOpen,
    setChatInitialTab,
    onOpenCommandPalette
}) => {
    const [realTrip, setRealTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(!isSimulation);
    const [error, setError] = useState(null);

    // Initial Data Fetching Logic
    useEffect(() => {
        if (isSimulation) {
            queueMicrotask(() => setIsLoading(false));
            return;
        }
        if (!tripData?.id) {
            setError("Invalid trip data");
            setIsLoading(false);
            return;
        }
        // Handle Mock Trips (eagerly loaded data is now confined to this chunk)
        if (tripData.isMock || (typeof tripData.id === 'string' && tripData.id.startsWith('mock_'))) {
            // This huge function and its data dependencies are now split from the main bundle!
            const enrichedTrip = getMockTripDetails(tripData.id, globalSettings?.language);
            setRealTrip(enrichedTrip);
            setIsLoading(false);
            return;
        }

        // Handle Real Firebase Trips
        setIsLoading(true);
        const unsub = onSnapshot(doc(db, "trips", tripData.id), (d) => {
            if (d.exists()) setRealTrip({ id: d.id, ...d.data() });
            else setError("Trip not found");
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });
        return () => unsub();
    }, [tripData?.id, isSimulation, globalSettings?.language]);

    const trip = isSimulation ? tripData : realTrip;

    // Currency Logic
    const [convAmount, setConvAmount] = useState(1000);
    const [convTo, setConvTo] = useState('JPY');

    useEffect(() => {
        if (trip?.country) {
            const country = trip.country;
            if (country.includes('Japan') || country.includes('日本')) setConvTo('JPY');
            else if (country.includes('Taiwan') || country.includes('台灣')) setConvTo('TWD');
            else if (country.includes('Korea') || country.includes('韓國')) setConvTo('KRW');
            else if (country.includes('US') || country.includes('美國')) setConvTo('USD');
        }
    }, [trip?.country]);

    if (isLoading) return <TripDetailSkeleton isDarkMode={isDarkMode} />;
    if (error || !trip) return <HttpStatusPage code={404} isDarkMode={isDarkMode} onBackHome={onBack} />;

    return (
        <Suspense fallback={<TripDetailSkeleton isDarkMode={isDarkMode} />}>
            <TripDetailContent
                trip={trip}
                tripData={tripData}
                onBack={onBack}
                user={user}
                isDarkMode={isDarkMode}
                setGlobalBg={setGlobalBg}
                isSimulation={isSimulation}
                globalSettings={globalSettings}
                exchangeRates={exchangeRates}
                convAmount={convAmount}
                setConvAmount={setConvAmount}
                convTo={convTo}
                setConvTo={setConvTo}
                onOpenSmartImport={onOpenSmartImport}
                weatherData={weatherData}
                requestedTab={requestedTab}
                onTabHandled={onTabHandled}
                requestedItemId={requestedItemId}
                onItemHandled={onItemHandled}
                isBanned={isBanned}
                isAdmin={isAdmin}
                onOpenChat={onOpenChat}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                onUserClick={onUserClick}
                onViewProfile={onViewProfile}
                setChatInitialTab={setChatInitialTab}
                onOpenCommandPalette={onOpenCommandPalette}
            />
        </Suspense>
    );
};

export default TripDetailView;
