import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { fetchNews } from '../services/news';
import { travelInfoService } from '../services/travelInfoService';
import { useNotifications } from './useNotifications';

/**
 * useDashboardData - Hook to handle all data fetching and business logic for the Dashboard
 * @param {Object} user - Current user object
 * @param {Object} globalSettings - User settings
 * @param {Object} exchangeRates - Current exchange rates
 */
const useDashboardData = (user, globalSettings, exchangeRates) => {
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [newsData, setNewsData] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);

    // Travel Info States
    const [hotels, setHotels] = useState([]);
    const [loadingHotels, setLoadingHotels] = useState(true);
    const [flights, setFlights] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(true);
    const [transports, setTransports] = useState([]);
    const [loadingTransports, setLoadingTransports] = useState(true);
    const [connectivity, setConnectivity] = useState([]);
    const [loadingConnectivity, setLoadingConnectivity] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { sendNotification } = useNotifications(user);

    // 1. Fetch Trips from Firestore
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "trips"));
        const unsub = onSnapshot(q, s => {
            // Filter trips where user is a member
            const userTrips = s.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(t => t.members?.some(m => m.id === user.uid));
            setTrips(userTrips);
            setLoadingTrips(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setLoadingTrips(false);
        });
        return () => unsub();
    }, [user]);

    // 2. Fetch News & Travel Info (Hotels, Flights, etc.)
    useEffect(() => {
        if (!user) return;

        const loadNews = async () => {
            setLoadingNews(true);
            const targetTrip = trips[0];
            const location = targetTrip?.city || targetTrip?.countries?.[0] || 'Hong Kong';
            const data = await fetchNews(location, globalSettings?.lang || 'zh-TW');
            setTimeout(() => {
                setNewsData(data);
                setLoadingNews(false);
            }, 1500);
        };

        const loadTravelInfo = async () => {
            const userCurrency = globalSettings?.currency || 'HKD';
            const rates = exchangeRates || {};

            setLoadingHotels(true); setLoadingFlights(true); setLoadingTransports(true); setLoadingConnectivity(true);

            // Fetch all data
            try {
                const [hData, fData, tData, cData] = await Promise.all([
                    travelInfoService.getHotels('all', userCurrency, rates),
                    travelInfoService.getFlights(userCurrency, rates),
                    travelInfoService.getTransports(userCurrency, rates),
                    travelInfoService.getConnectivity(userCurrency, rates)
                ]);

                // Delay the dismissal of loading states
                setTimeout(() => {
                    setHotels(hData.slice(0, 3));
                    setFlights(fData.slice(0, 4));
                    setTransports(tData);
                    setConnectivity(cData);
                    setLoadingHotels(false);
                    setLoadingFlights(false);
                    setLoadingTransports(false);
                    setLoadingConnectivity(false);
                }, 1500);
            } catch (e) {
                console.error("Travel Info Error:", e);
                setLoadingHotels(false); setLoadingFlights(false); setLoadingTransports(false); setLoadingConnectivity(false);
            }
        };

        loadNews();
        loadTravelInfo();

    }, [trips, globalSettings?.lang, globalSettings?.currency, exchangeRates, refreshTrigger, user]);

    // 3. Itinerary Reminders (Background Check)
    useEffect(() => {
        if (!trips.length || !sendNotification) return;

        const checkReminders = () => {
            const now = new Date();
            const nowKey = now.toISOString().split('T')[0];

            trips.forEach(trip => {
                const todayItinerary = trip.itinerary?.[nowKey] || [];
                todayItinerary.forEach(item => {
                    if (item.details?.time) {
                        const [h, m] = item.details.time.split(':');
                        const itemTime = new Date();
                        itemTime.setHours(parseInt(h), parseInt(m), 0, 0);
                        const diff = (itemTime - now) / 60000;
                        // Alert if 30 mins before (29-31 window)
                        if (diff > 29 && diff < 31) {
                            sendNotification(
                                "行程提醒 ⏰",
                                `即將開始: ${item.name} (${item.details.time})`,
                                'info'
                            );
                        }
                    }
                });
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check
        return () => clearInterval(interval);
    }, [trips, sendNotification]);

    return {
        trips,
        loadingTrips,
        newsData,
        loadingNews,
        hotels,
        loadingHotels,
        flights,
        loadingFlights,
        transports,
        loadingTransports,
        connectivity,
        loadingConnectivity,
        refreshTrigger,
        setRefreshTrigger,
        sendNotification
    };
};

export default useDashboardData;
