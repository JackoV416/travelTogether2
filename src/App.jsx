import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom'; // V1.9.2 Fix
import { buttonPrimary } from './constants/styles';
// Moved to unified lazy imports below
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, googleProvider, storage } from './firebase';
import {
    Plus, Trash2, MapPin, Calendar, Clock, DollarSign, User, Users, Sun, Cloud, CloudRain, Shield, Settings, LogOut, ChevronRight, X, Menu, Share2, Globe, Send, MessageCircle, FileText, CheckCircle, AlertCircle, Search, Filter, Camera, Download, Upload, AlertTriangle, Info, Loader2, Sparkles, LayoutGrid, List as ListIcon, Maximize2, Minimize2, CloudFog, CloudLightning, CloudSnow, MoveRight, ChevronLeft, CalendarDays, Bell, ChevronDown, LogIn, Map as MapIcon, BrainCircuit, Wallet, Plane, Bus, Train, Car, ShoppingBag, BedDouble, Receipt, CloudSun, Snowflake, Newspaper, TrendingUp, Siren, List, Star, Shirt, UserCircle, UserPlus, FileUp, Edit3, Lock, Save, RefreshCw, Route, MonitorPlay, CheckSquare, FileCheck, History, PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Phone, Globe2, Link as LinkIcon, Wifi, Utensils, Image, QrCode, Copy, Instagram, MapPinned, NotebookPen, Home, PiggyBank, Moon, Keyboard
} from 'lucide-react';
import { getExchangeRates, convertCurrency } from './services/exchangeRate';
import { getWeather, getWeatherInfo } from './services/weather.jsx';
import { exportToBeautifulPDF, exportToJSON, exportToImage } from './services/pdfExport';
// Static Imports for Critical Modals & UI
import VersionGuardModal from './components/Modals/VersionGuardModal';
import ReportCenterModal from './components/Modals/ReportCenterModal';
import DashboardSkeleton from './components/Loaders/DashboardSkeleton';

// Lazy Load Heavy Modals
// Moved to unified lazy imports below

import NotificationSystem from './components/Shared/NotificationSystem';
import OfflineBanner from './components/Shared/OfflineBanner';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import { useNotifications } from './hooks/useNotifications';
import useGlobalShortcuts from './hooks/useGlobalShortcuts';

import { checkAbuse } from './services/security';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import GlobalChatFAB from './components/Shared/GlobalChatFAB';
// import UniversalChat from './components/Shared/UniversalChat'; // Replaced by Unified ChatModal
import OnboardingTour from './components/Shared/OnboardingTour';
import { TourProvider, useTour } from './contexts/TourContext';
import TourOverlay from './components/Tour/TourOverlay';

import CommandPalette from './components/Shared/CommandPalette';

import { SEO } from './components/Shared/SEO'; // V1.6.0 SEO
import TripDetailSkeleton from './components/Loaders/TripDetailSkeleton';
// Moved to unified lazy imports below



import {
    APP_VERSION, APP_AUTHOR, APP_LAST_UPDATE, ADMIN_EMAILS,
    DEFAULT_BG_IMAGE, CITY_COORDS, INFO_DB,
    SIMULATION_DATA, CURRENCIES, VERSION_HISTORY, JARVIS_VERSION, TIMEZONES, LANGUAGE_OPTIONS
} from './constants/appData';
import {
    glassCard, getHolidayMap, getLocalizedCountryName,
    getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getWeekday, getTripSummary, calculateDebts,
    getTimeDiff, getLocalCityTime, getWeatherForecast,
    buildDailyReminder, inputClasses
} from './utils/tripUtils';
// Utility for robust lazy loading (3 retries + exponential backoff)
import { lazyLoadWithRetry } from './utils/lazyLoad.jsx';

// === Unified Lazy Imports (all use lazyLoadWithRetry for consistent retry + error handling) ===
// Core Views
const Dashboard = lazyLoadWithRetry(() => import('./components/Dashboard/DashboardWithTour'));
const LandingPage = lazyLoadWithRetry(() => import('./components/Landing/LandingPage'));
const TripDetail = lazyLoadWithRetry(() => import('./components/Views/TripDetailView'));
const SettingsView = lazyLoadWithRetry(() => import('./components/Views/SettingsView'));
const SocialProfile = lazyLoadWithRetry(() => import('./components/Social/Profile/SocialProfile'));
const PublicTripView = lazyLoadWithRetry(() => import('./components/Public/PublicTripView'));
const HttpStatusPage = lazyLoadWithRetry(() => import('./components/Shared/HttpStatusPage'));
const Footer = lazyLoadWithRetry(() => import('./components/Shared/Footer'));
// Modals
const CreateTripModal = lazyLoadWithRetry(() => import('./components/Modals/CreateTripModal'));
const TripExportImportModal = lazyLoadWithRetry(() => import('./components/Modals/TripExportImportModal'));
const SmartImportModal = lazyLoadWithRetry(() => import('./components/Modals/SmartImportModal'));
const AIGeminiModal = lazyLoadWithRetry(() => import('./components/Modals/AIGeminiModal'));
const UniversalOnboarding = lazyLoadWithRetry(() => import('./components/Modals/UniversalOnboarding'));
const FeedbackModal = lazyLoadWithRetry(() => import('./components/Modals/FeedbackModal'));
const VersionModal = lazyLoadWithRetry(() => import('./components/Modals/VersionModal'));
const AdminFeedbackModal = lazyLoadWithRetry(() => import('./components/Modals/AdminFeedbackModal'));
const ChatModal = lazyLoadWithRetry(() => import('./components/Chat/ChatModal'));
import ImageWithFallback from './components/Shared/ImageWithFallback';
import Header from './components/Shared/Header';





const App = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [initialAuthCheck, setInitialAuthCheck] = useState(false); // V1.9.6.1 Fix
    const [view, setView] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        if (viewParam) return viewParam;

        // V1.9.6.1 Fix: Check path for trip detail to prevent dashboard flash
        if (window.location.pathname.startsWith('/trip/')) return 'detail';
        return 'dashboard';
    });
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [globalBg, setGlobalBg] = useState(DEFAULT_BG_IMAGE);
    const [globalSettings, setGlobalSettings] = useState({
        notifications: true,
        sound: true,
        currency: 'HKD',
        region: 'HK',
        language: localStorage.getItem('travelTogether_language') || 'zh-TW',
        preferences: [],
        useCustomKeys: false,
        aiKeys: {}
    });
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewTrip, setPreviewTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInitialTab, setChatInitialTab] = useState('trip');
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAdminFeedbackModalOpen, setIsAdminFeedbackModalOpen] = useState(false);
    const [openFeedbackCount, setOpenFeedbackCount] = useState(0);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isVersionGuardOpen, setIsVersionGuardOpen] = useState(false);
    const [latestVersion, setLatestVersion] = useState(APP_VERSION);
    const [weatherData, setWeatherData] = useState({});
    const [exchangeRates, setExchangeRates] = useState(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    // State for Public Trip View
    const [publicTripId, setPublicTripId] = useState(null);

    const [userProfile, setUserProfile] = useState({});
    const [viewingProfileUser, setViewingProfileUser] = useState(null);
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [requestedTab, setRequestedTab] = useState(null);
    const [requestedItemId, setRequestedItemId] = useState(null);
    const [isBanned, setIsBanned] = useState(false);
    const [dynamicAdminEmails, setDynamicAdminEmails] = useState([]);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [shouldStartProductTour, setShouldStartProductTour] = useState(false);
    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState('general');
    const [isReportCenterOpen, setIsReportCenterOpen] = useState(false);

    // Private Chat State (V1.9.2)
    const [isPrivateChatOpen, setIsPrivateChatOpen] = useState(false);
    const [privateChatTarget, setPrivateChatTarget] = useState(null);

    const { notifications, toasts, setToasts, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

    const currentUser = React.useMemo(() => user ? { ...user, ...userProfile } : null, [user, userProfile]);
    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || dynamicAdminEmails.includes(user.email));

    useEffect(() => {
        let mounted = true;

        // 1. Auth Listener
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (!mounted) return;
            try {
                setUser(u);
                // Hide initial loading screen if it exists
                const loader = document.getElementById('initial-loading');
                if (loader) {
                    setTimeout(() => { // V1.9.6.1 Fix: Add a small delay to ensure loader is visible before fading
                        loader.classList.add('fade-out');
                        setTimeout(() => loader.remove(), 500);
                    }, 500);
                }
                setInitialAuthCheck(true); // V1.9.6.1 Fix: Mark auth as checked

                if (u) {
                    const userRef = doc(db, "users", u.uid);
                    await setDoc(userRef, {
                        email: u.email,
                        displayName: u.displayName || 'Traveler',
                        photoURL: u.photoURL,
                        lastLogin: serverTimestamp(),
                        uid: u.uid
                    }, { merge: true });
                    const snap = await getDoc(userRef);
                    if (mounted && snap.exists()) setIsBanned(snap.data().isBanned);
                }
            } catch (error) {
                console.error("Auth Data Sync Error:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }, (error) => {
            console.error("Auth Error:", error);
            if (mounted) setIsLoading(false);
        });

        // 2. Safety Timeout
        const safetyTimer = setTimeout(() => {
            // Check isLoading directly from state scope (might be stale closure but safer than nothing)
            // Ideally we rely on the fact that if auth fired, isLoading is false.
            // If this runs, we assume auth didn't fire.
            if (mounted) {
                // Watchdog triggered - forcing load
                setIsLoading(false);
            }
        }, 4000);

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    // 1.5 Friend Requests Listener
    const [friendRequestCount, setFriendRequestCount] = useState(0);
    useEffect(() => {
        if (!user?.uid) return;

        let unsub;
        // Import dynamically to avoid circular dependencies
        import('./services/friendService').then(({ listenToFriendRequests }) => {
            unsub = listenToFriendRequests(user.uid, (requests) => {
                setFriendRequestCount(requests.length);
            });
        }).catch(err => console.error('Friend listener failed:', err));

        return () => {
            if (unsub) unsub();
        };
    }, [user?.uid]);

    useEffect(() => {
        // V1.9.6: Trips loading with /trip/:id URL handling for Fork feature
        if (!user) return;
        const q = query(collection(db, "trips"));
        return onSnapshot(q, s => {
            const fetched = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.members?.some(m => m.id === user.uid));
            setTrips(fetched);
            setLoadingTrips(false);

            // V1.9.9: Check if we're on a /trip/:id URL and route appropriately (Enhanced)
            const path = window.location.pathname;

            // 1. Check Public View first
            const publicMatch = path.match(/^\/trip\/public\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (publicMatch) {
                setPublicTripId(publicMatch[1]);
                return;
            }

            // 2. Check Edit/View/Private
            const editMatch = path.match(/^\/trip\/(?:edit|view|private)\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (editMatch) {
                const urlTripId = editMatch[1];
                const userTrip = fetched.find(t => t.id === urlTripId);
                if (userTrip) {
                    setSelectedTrip(userTrip);
                    setView('detail');
                    setPublicTripId(null);
                } else {
                    setPublicTripId(urlTripId);
                }
                return;
            }

            // 3. Check Legacy Standard
            const tripMatch = path.match(/^\/trip\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (tripMatch) {
                const urlTripId = tripMatch[1];
                const userTrip = fetched.find(t => t.id === urlTripId);
                const searchParams = new URLSearchParams(window.location.search);
                const forcePublic = searchParams.get('view') === 'public';

                if (forcePublic) {
                    setPublicTripId(urlTripId);
                } else if (userTrip) {
                    setSelectedTrip(userTrip);
                    setView('detail');
                    setPublicTripId(null);
                } else {
                    setPublicTripId(urlTripId);
                }
            }
        }, (err) => {
            console.error("Trips sync error:", err.message);
            setLoadingTrips(false);
        });
    }, [user]);

    // --- Version Modal Logic ---
    useEffect(() => {
        const lastSeen = localStorage.getItem('last_seen_version');
        if (lastSeen !== APP_VERSION) {
            setIsVersionOpen(true);
            localStorage.setItem('last_seen_version', APP_VERSION);
        }
    }, []);

    // --- Deep Link Routing (V1.9.6: Fork Feature) ---
    useEffect(() => {
        const path = location.pathname;

        // V1.9.6: Handle /trip/:id Route - Check membership for Fork feature
        // V1.9.9: Enhanced Routing Scheme - Deep Link Handling

        // 1. Public View: /trip/public/:id
        const publicMatch = path.match(/^\/trip\/public\/([a-zA-Z0-9_-]+)(?:\/)?$/);
        if (publicMatch) {
            setLoadingTrips(false);
            setPublicTripId(publicMatch[1]);
            return;
        }

        // 2. Private/Edit View: /trip/edit/:id
        const editMatch = path.match(/^\/trip\/(?:edit|view|private)\/([a-zA-Z0-9_-]+)(?:\/)?$/);
        if (editMatch) {
            const urlTripId = editMatch[1];
            const userTrip = trips.find(t => t.id === urlTripId);
            if (userTrip) {
                setSelectedTrip(userTrip);
                setView('detail');
                setPublicTripId(null);
            } else if (!loadingTrips) {
                // Not found locally? Check public as fallback
                setPublicTripId(urlTripId);
            }
            return;
        }

        // 3. Legacy Standard: /trip/:id
        // STRICT END MATCHING to prevent catching /trip/public/...
        const tripMatch = path.match(/^\/trip\/([a-zA-Z0-9_-]+)(?:\/)?$/);
        if (tripMatch) {
            const urlTripId = tripMatch[1];
            const userTrip = trips.find(t => t.id === urlTripId);
            const searchParams = new URLSearchParams(window.location.search);
            const forcePublic = searchParams.get('view') === 'public';

            if (forcePublic) {
                setPublicTripId(urlTripId);
            } else if (userTrip) {
                setSelectedTrip(userTrip);
                setView('detail');
                setPublicTripId(null);
            } else if (!loadingTrips && user) {
                setPublicTripId(urlTripId);
            } else if (!user) {
                setPublicTripId(urlTripId);
            }
            return;
        }

        // Handle /profile/:id Route (Social Profile View)
        const profileMatch = path.match(/^\/profile\/([a-zA-Z0-9_-]+)/);
        if (profileMatch) {
            const profileUserId = profileMatch[1];
            import('firebase/firestore').then(({ doc, getDoc }) => {
                getDoc(doc(db, 'users', profileUserId)).then(snap => {
                    if (snap.exists()) {
                        setViewingProfileUser({ uid: profileUserId, ...snap.data() });
                        setView('profile');
                    }
                }).catch(err => console.error('Failed to load profile:', err));
            });
            return;
        }

        // Handle /dashboard, /explore, /my_trips, /tutorial, /settings routes
        const viewRoutes = ['dashboard', 'explore', 'my_trips', 'tutorial', 'settings'];
        const viewMatch = path.match(/^\/([a-zA-Z_]+)/);
        if (viewMatch && viewRoutes.includes(viewMatch[1])) {
            setView(viewMatch[1]);
            setPublicTripId(null); // Clear public trip when navigating to other views
        }
    }, [location.pathname, trips, loadingTrips, user]);

    useEffect(() => {
        // Guard: If we are in "Public Trip Mode" (publicTripId is set), DO NOT SYNC URL based on 'view'.
        // The URL is already controlled by the routing logic for that specific mode.
        if (publicTripId) return;

        // Sync URL with View State (Push State on Navigation)
        const currentPath = window.location.pathname;
        let targetPath = '/';

        // Map view state to URL paths
        if (view === 'dashboard') targetPath = '/dashboard';
        else if (view === 'explore') targetPath = '/explore';
        else if (view === 'my_trips') targetPath = '/my_trips';
        else if (view === 'tutorial') targetPath = '/tutorial';
        else if (view === 'settings') targetPath = '/settings';
        else if (view === 'profile' && viewingProfileUser) {
            targetPath = `/profile/${viewingProfileUser.uid || viewingProfileUser.id}`;
        } else if (view === 'detail' && selectedTrip) {
            targetPath = `/trip/${selectedTrip.id}`;
        }

        // Only push if path changed (avoid infinite loops)
        if (currentPath !== targetPath && targetPath !== '/') {
            window.history.pushState({ view }, '', targetPath);
        }
    }, [view, viewingProfileUser, selectedTrip]);

    // --- Handle Browser Back/Forward Navigation (V1.9.6: Fork Feature) ---
    useEffect(() => {
        const handlePopState = (event) => {
            const path = window.location.pathname;

            // V1.9.9: Enhanced Routing Scheme
            // 1. Public View: /trip/public/:id
            const publicMatch = path.match(/^\/trip\/public\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (publicMatch) {
                setPublicTripId(publicMatch[1]);
                return;
            }

            // 2. Private/Edit View: /trip/edit/:id or /trip/view/:id or /trip/private/:id
            const editMatch = path.match(/^\/trip\/(?:edit|view|private)\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (editMatch) {
                const urlTripId = editMatch[1];
                const userTrip = trips.find(t => t.id === urlTripId);
                if (userTrip) {
                    setSelectedTrip(userTrip);
                    setView('detail');
                    setPublicTripId(null);
                } else {
                    // Fallback
                    setPublicTripId(urlTripId);
                }
                return;
            }

            // 3. Legacy Standard: /trip/:id
            const tripMatch = path.match(/^\/trip\/([a-zA-Z0-9_-]+)(?:\/)?$/);
            if (tripMatch) {
                const urlTripId = tripMatch[1];
                const userTrip = trips.find(t => t.id === urlTripId);
                const searchParams = new URLSearchParams(window.location.search);
                const forcePublic = searchParams.get('view') === 'public';

                if (forcePublic) {
                    setPublicTripId(urlTripId);
                } else if (userTrip) {
                    setSelectedTrip(userTrip);
                    setView('detail');
                    setPublicTripId(null);
                } else {
                    // Not found in local trips, assume public or unauth
                    setPublicTripId(urlTripId);
                }
                return;
            }

            const profileMatch = path.match(/^\/profile\/([a-zA-Z0-9_-]+)/);
            if (profileMatch) {
                // Profile navigation handled by deep link effect
                return;
            }

            // Default views - clear publicTripId
            setPublicTripId(null);
            if (path === '/dashboard' || path === '/') setView('dashboard');
            else if (path === '/explore') setView('explore');
            else if (path === '/my_trips') setView('my_trips');
            else if (path === '/tutorial') setView('tutorial');
            else if (path === '/settings') setView('settings');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [trips]);

    // Fetch Exchange Rates
    useEffect(() => {
        getExchangeRates().then(data => {
            if (data) setExchangeRates(data);
        });
    }, []);

    // V1.9.7: Fix Weather Loading (Global & Detail)
    useEffect(() => {
        const fetchWeather = async () => {
            // 1. Detail View: Fetch for specific trip city
            if (view === 'detail' && selectedTrip?.city) {
                const city = selectedTrip.city;
                if (weatherData[city]) return; // Cache hit

                setIsLoadingWeather(true);
                try {
                    const countryInfo = getSafeCountryInfo(selectedTrip.country);
                    const coords = CITY_COORDS[city] || CITY_COORDS[countryInfo.capital];

                    if (coords) {
                        const lat = coords.lat || coords.latitude;
                        const lng = coords.lng || coords.lon || coords.longitude;
                        if (lat && lng) {
                            const data = await getWeather(lat, lng, city);
                            if (data) {
                                setWeatherData(prev => ({ ...prev, [city]: data }));
                            }
                        }
                    }
                } catch (err) {
                    console.error("Weather fetch failed (Detail):", err);
                } finally {
                    setIsLoadingWeather(false);
                }
            }
            // 2. Dashboard View: Fetch for top cities (Tokyo, Osaka, Taipei, HK)
            else if (view === 'dashboard' || view === 'explore') {
                const targetCities = ["Tokyo", "Osaka", "Taipei", "Hong Kong", "Seoul", "Bangkok"];
                const needed = targetCities.filter(c => !weatherData[c]);
                if (needed.length === 0) return;

                setIsLoadingWeather(true);
                try {
                    await Promise.all(needed.map(async (city) => {
                        const coords = CITY_COORDS[city];
                        if (coords) {
                            const lat = coords.lat;
                            const lng = coords.lon || coords.lng; // Use .lon as primary
                            const data = await getWeather(lat, lng, city);
                            if (data) {
                                setWeatherData(prev => ({ ...prev, [city]: data }));
                            }
                        }
                    }));
                } catch (err) {
                    console.error("Weather fetch failed (Dashboard):", err);
                } finally {
                    setIsLoadingWeather(false);
                }
            }
        };
        fetchWeather();
    }, [view, selectedTrip?.city, selectedTrip?.country]);

    useEffect(() => {
        if (!user) return; // V1.8.4 Fix: Ensure auth before listening to protected metadata
        const unsub = onSnapshot(doc(db, "metadata", "app_info"), (d) => {
            if (d.exists()) {
                const remote = d.data().latest_version;
                setLatestVersion(remote);
                if (remote && remote !== APP_VERSION && d.data().forceUpdate) {
                    setIsVersionGuardOpen(true);
                }
            }
        }, (err) => {
            console.warn("Metadata sync failed (likely permission):", err.message);
        });
        return unsub;
    }, [user]);

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    const handleOpenChat = (targetTrip = null, tab = null) => {
        const isSimulation = (targetTrip?.id?.startsWith('sim-')) || (view === 'tutorial');
        if (!user && !isSimulation) {
            sendNotification("需要登入", "AI 對話功能需要登入後才可使用。", "warning");
            return;
        }
        if (targetTrip) setSelectedTrip(targetTrip);
        setIsChatOpen(true);
        if (tab) setChatInitialTab(tab);
    };

    const handleOpenPrivateChat = (targetUser = null) => {
        if (!user) {
            sendNotification("需要登入", "私訊功能需要登入後才可使用。", "warning");
            return;
        }
        setPrivateChatTarget(targetUser);
        setIsPrivateChatOpen(true);
    };

    const handleNotificationNavigate = (notif) => {
        if (!notif.context) return;
        const { tripId, view: v, tab, itemId } = notif.context;
        if (v) setView(v);
        if (tab) setRequestedTab(tab);
        if (itemId) setRequestedItemId(itemId);
        removeNotification(notif.id);
    };

    const handleTourNavigation = (stepD) => {
        if (typeof stepD === 'string') { setView(stepD); return; }

        // Handle step-specific navigation
        if (stepD.id === 'explore-community') {
            setViewingProfileUser(null); // Clear mock profile
            setView('dashboard'); // Force to explore community view
        } else if (stepD.id === 'my-trips-view' || stepD.id === 'trip-card') {
            setViewingProfileUser(null);
            setView('my_trips'); // Trip card is in my_trips view
        } else if (stepD.page === 'mock-profile') {
            // Show a mock user's profile for add-friend/private-chat demo
            setViewingProfileUser({
                uid: 'mock-tour-user',
                displayName: 'Sarah Chen',
                name: 'Sarah Chen',
                photoURL: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ec4899&color=fff&size=128',
                region: 'Hong Kong',
                bannerURL: null,
                metadata: { creationTime: '2024-06-01T00:00:00Z' },
                totalXP: 350,
                isVirtual: false // Must be false so add-friend button appears
            });
            setView('profile');
        } else if (stepD.page) {
            setView(stepD.page === 'trip-detail' ? 'tutorial' : stepD.page);
        }

        if (stepD.tab) setRequestedTab(stepD.tab);

        // Scroll to target element after navigation completes
        if (stepD.target) {
            setTimeout(() => {
                const el = document.querySelector(stepD.target);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 600);
        }
    };

    const triggerConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#818cf8', '#c7d2fe', '#ffffff'] });
    };

    let appContent;

    if (isLoading || !initialAuthCheck) {
        appContent = <DashboardSkeleton isDarkMode={isDarkMode} />;
    } else if (publicTripId) {
        // V1.9.6: PublicTripView for Fork feature
        appContent = (
            <ErrorBoundary isDarkMode={isDarkMode}>
                <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
                    <NotificationSystem notifications={toasts} setNotifications={setToasts} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
                    <OfflineBanner isDarkMode={isDarkMode} />
                    <ReloadPrompt isDarkMode={isDarkMode} />
                    <ImageWithFallback src={globalBg} className="fixed inset-0 z-0 opacity-20 pointer-events-none object-cover w-full h-full" alt="Background" loading="eager" fetchpriority="high" />

                    <Header
                        title="✈️ Travel Together"
                        user={currentUser}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                        onLogout={async () => {
                            try {
                                await signOut(auth);
                                window.location.reload();
                            } catch (error) {
                                console.error("Logout error:", error);
                            }
                        }}
                        onBack={() => setPublicTripId(null)}
                        onViewChange={setView}
                        onOpenUserSettings={() => setView('settings')}
                        onOpenFeedback={() => setIsReportCenterOpen(true)}
                        onOpenAdminFeedback={() => setIsAdminModalOpen(true)}
                        isAdmin={isAdmin}
                        adminPendingCount={openFeedbackCount}
                        friendRequestCount={friendRequestCount}
                        onOpenVersion={() => setIsVersionOpen(true)}
                        notifications={notifications}
                        onRemoveNotification={removeNotification}
                        onMarkNotificationsRead={markNotificationsRead}
                        onNotificationClick={handleNotificationNavigate}
                        allTrips={trips}
                        activeView={view}
                        onOpenPrivateChat={() => handlePrivateChat()}
                    />

                    <div className="relative z-10 flex-grow pb-safe" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
                        <Suspense fallback={<TripDetailSkeleton isDarkMode={isDarkMode} />}>
                            <PublicTripView
                                tripId={publicTripId}
                                user={user || null}
                                isDarkMode={isDarkMode}
                                setGlobalBg={setGlobalBg}
                            />
                        </Suspense>
                    </div>

                    <Suspense fallback={null}>
                        <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} onLanguageChange={(lang) => setGlobalSettings(prev => ({ ...prev, language: lang }))} />
                    </Suspense>

                    <Suspense fallback={null}>
                        <UniversalOnboarding isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} isDarkMode={isDarkMode} onStartDemo={() => setView('tutorial')} />
                        {isPrivateChatOpen && (
                            <ChatModal
                                isOpen={isPrivateChatOpen}
                                onClose={() => setIsPrivateChatOpen(false)}
                                currentUser={currentUser}
                                initialTargetUser={privateChatTarget}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        <VersionModal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} isDarkMode={isDarkMode} globalSettings={globalSettings} />
                    </Suspense>
                </div>
            </ErrorBoundary>
        );
    } else if (!user && view !== 'tutorial') {
        appContent = (
            <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-950"><Loader2 className="animate-spin w-12 h-12 text-indigo-500" /></div>}>
                <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />
            </Suspense>
        );
    } else {
        appContent = (
            <ErrorBoundary fallbackMessage="Something went wrong while loading the app. Please refresh.">
                {view === 'dashboard' && <SEO title={t('dashboard.title', 'Dashboard')} />}
                <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500 font-sans ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
                    {/* Independent Static Components - Render INSTANTLY */}
                    <NotificationSystem notifications={toasts} setNotifications={setToasts} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
                    <OfflineBanner isDarkMode={isDarkMode} />
                    <ReloadPrompt isDarkMode={isDarkMode} />
                    <ImageWithFallback src={globalBg} className="fixed inset-0 z-0 opacity-20 pointer-events-none object-cover w-full h-full" alt="Background" loading="eager" fetchpriority="high" />

                    {
                        view !== 'tutorial' && (
                            <Header
                                title="✈️ Travel Together"
                                user={currentUser}
                                isDarkMode={isDarkMode}
                                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                                onLogout={async () => {
                                    try {
                                        // Optional: Clear FCM token or other private data BEFORE signing out
                                        // await clearUserTokens(user.uid); 
                                        await signOut(auth);
                                        // Force reload to clear memory states
                                        window.location.reload();
                                    } catch (error) {
                                        console.error("Logout error:", error);
                                    }
                                }}
                                onBack={view !== 'dashboard' ? () => setView('dashboard') : null}
                                onViewChange={setView}
                                onOpenUserSettings={() => setView('settings')}
                                onOpenFeedback={() => setIsReportCenterOpen(true)}
                                onOpenAdminFeedback={() => setIsAdminFeedbackModalOpen(true)}
                                isAdmin={isAdmin}
                                adminPendingCount={openFeedbackCount}
                                friendRequestCount={friendRequestCount}
                                onOpenVersion={() => setIsVersionOpen(true)}
                                notifications={notifications}
                                onRemoveNotification={removeNotification}
                                onMarkNotificationsRead={markNotificationsRead}
                                onNotificationClick={handleNotificationNavigate}
                                allTrips={trips}
                                activeView={view}
                                onOpenPrivateChat={() => handleOpenPrivateChat()}
                            />
                        )
                    }

                    {/* Main Content Suspense Boundary */}
                    <div className="relative z-10 flex-grow pb-safe" style={{ paddingTop: view !== 'tutorial' ? 'calc(72px + env(safe-area-inset-top, 0px))' : '0' }}>
                        <Suspense fallback={<DashboardSkeleton isDarkMode={isDarkMode} />}>
                            {view === 'dashboard' && (
                                <Dashboard
                                    user={user}
                                    onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); }}
                                    isDarkMode={isDarkMode}
                                    setGlobalBg={setGlobalBg}
                                    globalSettings={globalSettings}
                                    exchangeRates={exchangeRates}
                                    weatherData={weatherData}
                                    isLoadingWeather={isLoadingWeather}
                                    onViewChange={setView}
                                    isBanned={isBanned}
                                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                    onOpenChat={handleOpenChat}
                                    setChatInitialTab={setChatInitialTab}
                                    forcedViewMode="explore"
                                    allTrips={trips}
                                    loadingAllTrips={loadingTrips}
                                    friendRequestCount={friendRequestCount}
                                />
                            )}
                            {view === 'my_trips' && (
                                <Dashboard
                                    user={user}
                                    onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); }}
                                    isDarkMode={isDarkMode}
                                    setGlobalBg={setGlobalBg}
                                    globalSettings={globalSettings}
                                    exchangeRates={exchangeRates}
                                    weatherData={weatherData}
                                    isLoadingWeather={isLoadingWeather}
                                    onViewChange={setView}
                                    isBanned={isBanned}
                                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                    onOpenChat={handleOpenChat}
                                    setChatInitialTab={setChatInitialTab}
                                    forcedViewMode="my_trips"
                                    allTrips={trips}
                                    loadingAllTrips={loadingTrips}
                                    friendRequestCount={friendRequestCount}
                                />
                            )}
                            {view === 'profile' && <SocialProfile
                                user={viewingProfileUser || currentUser}
                                currentUser={currentUser}
                                isOwnProfile={!viewingProfileUser || viewingProfileUser.uid === user?.uid}
                                trips={trips}
                                isDarkMode={isDarkMode}
                                onEditProfile={() => { setSettingsInitialTab('account'); setView('settings'); }}
                                onOpenPrivateChat={handleOpenPrivateChat}
                            />}
                            {view === 'detail' && (
                                !selectedTrip ? (
                                    <TripDetailSkeleton isDarkMode={isDarkMode} />
                                ) : (
                                    <TripDetail
                                        tripData={selectedTrip}
                                        user={user}
                                        isDarkMode={isDarkMode}
                                        setGlobalBg={setGlobalBg}
                                        isSimulation={false}
                                        globalSettings={globalSettings}
                                        onBack={() => setView('dashboard')}
                                        exchangeRates={exchangeRates}
                                        weatherData={weatherData}
                                        onOpenSmartImport={() => setIsSmartImportModalOpen(true)}
                                        requestedTab={requestedTab}
                                        onTabHandled={() => setRequestedTab(null)}
                                        requestedItemId={requestedItemId}
                                        onItemHandled={() => setRequestedItemId(null)}
                                        isBanned={isBanned}
                                        isAdmin={isAdmin}
                                        onOpenChat={handleOpenChat}
                                        isChatOpen={isChatOpen}
                                        setIsChatOpen={setIsChatOpen}
                                        onUserClick={setViewingProfileUser}
                                        onViewProfile={setViewingProfileUser}
                                        setChatInitialTab={setChatInitialTab}
                                        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                    />
                                )
                            )}
                            {view === 'settings' && <SettingsView globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} isDarkMode={isDarkMode} onBack={() => setView('dashboard')} initialTab={settingsInitialTab} user={user} isAdmin={isAdmin} exchangeRates={exchangeRates} weatherData={weatherData} />}
                            {['403', '404', '500', '503'].includes(view) && <HttpStatusPage code={parseInt(view)} isDarkMode={isDarkMode} onBackHome={() => setView('dashboard')} onOpenFeedback={() => setIsFeedbackModalOpen(true)} />}
                            {view === 'tutorial' && (
                                <div className="min-h-screen flex flex-col">
                                    <div className={`p-4 border-b flex gap-4 items-center sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
                                        <button onClick={() => setView('dashboard')} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronLeft /></button>
                                        <span className="font-bold">模擬模式</span>
                                    </div>
                                    <TripDetail
                                        tripData={SIMULATION_DATA}
                                        user={user}
                                        isDarkMode={isDarkMode}
                                        setGlobalBg={() => { }}
                                        isSimulation={true}
                                        globalSettings={globalSettings}
                                        exchangeRates={exchangeRates}
                                        weatherData={weatherData}
                                        onOpenSmartImport={() => setIsSmartImportModalOpen(true)}
                                        requestedTab={requestedTab}
                                        onTabHandled={() => setRequestedTab(null)}
                                        onOpenChat={handleOpenChat}
                                        isChatOpen={isChatOpen}
                                        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                                        setIsChatOpen={setIsChatOpen}
                                        setChatInitialTab={setChatInitialTab}
                                        onBack={() => setView('dashboard')}
                                    />
                                </div>
                            )}
                        </Suspense>
                    </div>

                    {
                        view !== 'tutorial' && (
                            <Suspense fallback={null}>
                                <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} onLanguageChange={(lang) => setGlobalSettings(prev => ({ ...prev, language: lang }))} />
                            </Suspense>
                        )
                    }

                    {/* Lazy Modals - Separate Suspense so they don't block UI */}
                    <Suspense fallback={null}>
                        <UniversalOnboarding isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} isDarkMode={isDarkMode} onStartDemo={() => setView('tutorial')} />

                        {/* Private Chat Modal (V1.9.2) */}
                        {isPrivateChatOpen && (
                            <ChatModal
                                isOpen={isPrivateChatOpen}
                                onClose={() => setIsPrivateChatOpen(false)}
                                currentUser={currentUser}
                                initialTargetUser={privateChatTarget}
                                isDarkMode={isDarkMode}
                            />
                        )}

                        {(user || view === 'tutorial') && !isChatOpen && <GlobalChatFAB isDarkMode={isDarkMode} context={view === 'detail' || view === 'tutorial' ? 'trip' : 'default'} onClick={() => handleOpenChat(view === 'tutorial' ? SIMULATION_DATA : null)} />}
                        <VersionModal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} isDarkMode={isDarkMode} globalSettings={globalSettings} />
                        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} isDarkMode={isDarkMode} user={user} isBanned={isBanned} />
                        <SmartImportModal isOpen={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} isDarkMode={isDarkMode} trips={trips} onImport={() => sendNotification("上傳成功", "檔案已接收", "success")} />
                        <ChatModal
                            isOpen={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            currentUser={currentUser}
                            trip={selectedTrip}
                            isDarkMode={isDarkMode}
                            initialTab={chatInitialTab}
                        />
                        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} trips={trips} activeTrip={selectedTrip} isDarkMode={isDarkMode} onAction={(item) => { if (item.type === 'trip') { setSelectedTrip(item.data); setView('detail'); } }} />
                        <OnboardingTour run={showOnboardingTour} onComplete={() => setShowOnboardingTour(false)} isDarkMode={isDarkMode} />
                        <TourOverlay isDarkMode={isDarkMode} />
                        {isAdmin && <AdminFeedbackModal isOpen={isAdminFeedbackModalOpen} onClose={() => setIsAdminFeedbackModalOpen(false)} isDarkMode={isDarkMode} user={user} onPendingCountChange={setOpenFeedbackCount} />}
                    </Suspense>

                    {/* Static Modals - Rendering Instantly */}
                    <ReportCenterModal isOpen={isReportCenterOpen} onClose={() => setIsReportCenterOpen(false)} isDarkMode={isDarkMode} user={user} />
                    <VersionGuardModal isOpen={isVersionGuardOpen} onClose={() => setIsVersionGuardOpen(false)} latestVersion={latestVersion} currentVersion={APP_VERSION} isDarkMode={isDarkMode} />
                </div >
            </ErrorBoundary>
        );
    }




    return (
        <ErrorBoundary fallbackMessage="Critical App Error: TourProvider Crashed">
            <TourProvider onNavigate={publicTripId ? () => { } : handleTourNavigation}>
                <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-50"><Loader2 className="animate-spin w-12 h-12 text-indigo-500" /></div>}>
                    {appContent}
                </Suspense>
            </TourProvider>
        </ErrorBoundary>
    );
};

export default App;