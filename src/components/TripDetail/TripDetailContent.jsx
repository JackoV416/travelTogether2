import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, deleteDoc, collection, addDoc, serverTimestamp, getDoc, increment, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { Upload, Plus, Edit3, Trash2, MapPin, Calendar, Clock, DollarSign, User, Users, Sun, Cloud, CheckCircle, AlertCircle, Search, Filter, Camera, Download, AlertTriangle, Info, Loader2, Sparkles, LayoutGrid, List as ListIcon, Maximize2, Minimize2, MoveRight, ChevronLeft, Map as MapIcon, BrainCircuit, Wallet, Plane, Bus, Train, Car, ShoppingBag, BedDouble, Receipt, Newspaper, Siren, Star, UserCircle, UserPlus, FileUp, Lock, RefreshCw, Route, MonitorPlay, Save, CheckSquare, FileCheck, History, PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Phone, Globe2, Link as LinkIcon, Wifi, Utensils, Image, QrCode, Copy, Instagram, MapPinned, NotebookPen, Home, PiggyBank, Moon, ChevronRight, ChevronDown, Share2, Brain, Wand2, X, MessageCircle, Undo, Redo, Footprints as FootprintsIcon, Image as ImageIcon, Shield, FileText, Columns, KanbanSquare, Heart, GitFork, Eye, Settings, Shirt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MobileBottomNav from '../Shared/MobileBottomNav';
import ActiveUsersList from './ActiveUsersList';
import {
    ItineraryTab, InsuranceTab, VisaTab, EmergencyTab,
    BudgetTab, CurrencyTab, FilesTab, JournalTab, ShoppingTab, PackingTab, GalleryTab
} from './tabs';
import TripSettingsModal from '../Modals/TripSettingsModal';
import MemberSettingsModal from '../Modals/MemberSettingsModal';
import UserProfileModal from '../Modals/UserProfileModal'; // Restored Import
import InviteModal from '../Modals/InviteModal';
import CreateTripModal from '../Modals/CreateTripModal';
import FootprintsTab from './tabs/FootprintsTab'; // New Import
import ExportTripModal from '../Modals/ExportTripModal';
import AddActivityModal from '../Modals/AddActivityModal';
import AIGeminiModal from '../Modals/AIGeminiModal';
import TripExportImportModal from '../Modals/TripExportImportModal';
import SmartExportModal from '../Modals/SmartExportModal';
import ErrorBoundary from '../Shared/ErrorBoundary';
import FeedbackModal from '../Modals/FeedbackModal';
import ImageWithFallback from '../Shared/ImageWithFallback';



import {
    glassCard, getHolidayMap, getLocalizedCountryName, getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getTripSummary, calculateDebts, getTimeDiff, getWeatherForecast, buildDailyReminder,
    inputClasses, recalculateItineraryTimes
} from '../../utils/tripUtils';
import { generatePackingList, suggestTransportBetweenSpots } from '../../services/ai-parsing';
import { useTour } from '../../contexts/TourContext';
import { optimizeSchedule } from '../../services/ai';
import { getWeatherInfo, generateWeatherSummary } from '../../services/weather';
import { notifyTripActivity } from '../../services/activityService'; // V1.9.4 Activity
import { exportToBeautifulPDF } from '../../services/pdfExport';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE, CURRENCIES, INSURANCE_SUGGESTIONS, INSURANCE_RESOURCES, CITY_IMAGES } from '../../constants/appData';
import { buttonPrimary } from '../../constants/styles';
import { useTripHistory } from '../../hooks/useTripHistory'; // V1.1 Phase 7
import Kbd from '../Shared/Kbd';
import useGlobalShortcuts from '../../hooks/useGlobalShortcuts';
import { SEO } from '../Shared/SEO';

const TripDetailContent = (props) => {
    const { t } = useTranslation();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { trip, isDarkMode, isAdmin, user, onBack, isChatOpen, setIsChatOpen, onUserClick, setChatInitialTab, onOpenCommandPalette } = props;

    // Internal error handling if trip is missing
    if (!trip) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-yellow-500 mb-4 text-xl flex items-center gap-2 justify-center font-bold">
                    <AlertTriangle className="w-6 h-6" /> {t('tripDetail.errors.load_failed') || '無法載入行程'}
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">{t('common.back') || '返回'}</button>
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4" /> {t('common.report_issue') || '回報問題'}
                    </button>
                </div>
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} isDarkMode={isDarkMode} user={user} />
            </div>
        );
    }

    return (
        <>
            <ErrorBoundary fallbackMessage={t('tripDetail.errors.content_error') || '行程內容發生錯誤'} onOpenFeedback={() => setIsFeedbackOpen(true)}>
                <TripDetailMainLayout {...props} t={t} setIsFeedbackOpen={setIsFeedbackOpen} isFeedbackOpen={isFeedbackOpen} setChatInitialTab={setChatInitialTab} />
            </ErrorBoundary>
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} isDarkMode={isDarkMode} user={user} />
        </>
    );
};

const TripDetailMainLayout = ({ t, trip, tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, isPreview, globalSettings, exchangeRates, convAmount, setConvAmount, convTo, setConvTo, onOpenSmartImport, weatherData, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin, setIsFeedbackOpen, isFeedbackOpen, onOpenChat, isChatOpen, setIsChatOpen, onUserClick, onViewProfile, setChatInitialTab, onOpenCommandPalette }) => {
    const { i18n } = useTranslation();


    // ============================================
    // UI STATE HOOKS
    // ============================================
    const [activeTab, setActiveTab] = useState('itinerary');
    const [viewingMember, setViewingMember] = useState(null); // New State
    const [isAddModal, setIsAddModal] = useState(false);
    const [isInviteModal, setIsInviteModal] = useState(false);
    const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
    const [isAIModal, setIsAIModal] = useState(false);
    const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
    const [aiMode, setAIMode] = useState('full');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [addType, setAddType] = useState('spot');
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem(`tripViewMode_${trip.id}`) || 'list';
    });

    useEffect(() => {
        localStorage.setItem(`tripViewMode_${trip.id}`, viewMode);
    }, [viewMode, trip.id]);

    useEffect(() => {
        const handleRefresh = () => {
            const saved = localStorage.getItem(`tripViewMode_${trip.id}`);
            if (saved && saved !== viewMode) setViewMode(saved);
        };
        window.addEventListener('refreshTripView', handleRefresh);
        return () => window.removeEventListener('refreshTripView', handleRefresh);
    }, [viewMode, trip.id]);
    const [noteEdit, setNoteEdit] = useState(false);
    const [tempNote, setTempNote] = useState(trip.notes || '');
    const [myInsurance, setMyInsurance] = useState(trip.insurance?.private?.[isSimulation ? 'sim' : user?.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [sectionModalConfig, setSectionModalConfig] = useState(null); // { mode: 'import'|'export', section: 'shopping'|... }
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSmartExportOpen, setIsSmartExportOpen] = useState(false);
    const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
    const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState({ shopping: null, budget: null });
    const [confirmConfig, setConfirmConfig] = useState(null); // { title: '', message: '', onConfirm: fn, type: 'info'|'warning' }
    const [visaForm, setVisaForm] = useState({ status: '', number: '', expiry: '', needsPrint: false });
    const [smartWeather, setSmartWeather] = useState(null);
    const [isGeneratingWeather, setIsGeneratingWeather] = useState(false);

    const [autoOpenItemId, setAutoOpenItemId] = useState(null); // Auto-open new/edited item
    // 🚀 Optimistic Update Cache (Persisted in LocalStorage)
    const [pendingItemsCache, setPendingItemsCache] = useState(() => {
        try {
            const saved = localStorage.getItem(`pendingItemsCache_${trip.id}`);
            if (!saved) return {};

            const parsed = JSON.parse(saved);

            // Check legacy format (direct object vs wrapped)
            const cacheData = parsed.timestamp ? parsed.items : parsed;
            const cacheTime = parsed.timestamp || 0;

            // Validation: If Firestore data is NEWER than cache, discard cache
            const tripTime = trip.lastUpdate?.seconds ? trip.lastUpdate.seconds * 1000 : 0;

            if (tripTime > cacheTime + 5000) { // 5s buffer for clock skew

                return {};
            }

            return cacheData || {};
        } catch (e) {
            console.error("Failed to load pending items cache:", e);
            return {};
        }
    });

    // Sync Cache to LocalStorage whenever it changes
    useEffect(() => {
        try {
            if (Object.keys(pendingItemsCache).length > 0) {
                const payload = {
                    items: pendingItemsCache,
                    timestamp: Date.now()
                };
                localStorage.setItem(`pendingItemsCache_${trip.id}`, JSON.stringify(payload));
            } else {
                localStorage.removeItem(`pendingItemsCache_${trip.id}`);
            }
        } catch (e) {
            console.error("Failed to save pending items cache:", e);
        }
    }, [pendingItemsCache, trip.id]);

    // V1.1 Phase 8: Auto-Clear Cache on Remote Update (Cross-Device Sync)
    useEffect(() => {
        if (!trip.lastUpdate?.seconds) return;

        const lastSync = localStorage.getItem(`pendingItemsCache_${trip.id}`);
        if (lastSync) {
            const parsed = JSON.parse(lastSync);
            const cacheTime = parsed.timestamp || 0;
            const tripTime = trip.lastUpdate.seconds * 1000;

            // If we receive a remote update that is significantly newer than our local work
            // AND we are not currently dragging/editing (hard to track, but cacheTime implies last edit)
            if (tripTime > cacheTime + 10000) { // 10s margin

                setPendingItemsCache({});
            }
        }
    }, [trip.lastUpdate?.seconds]);

    // ============================================
    // SYNC EFFECTS
    // ============================================

    // 🚀 Critical State Logic (Hoisted for dependencies)
    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];

    // V1.1 Phase 7: History System Hook (Must be after currentDisplayDate is defined)
    const initialHistoryData = pendingItemsCache[currentDisplayDate] || trip.itinerary?.[currentDisplayDate] || [];
    const {
        record: recordHistory,
        undo: undoHistory,
        redo: redoHistory,
        canUndo,
        canRedo,
        reset: resetHistory
    } = useTripHistory(initialHistoryData, currentDisplayDate);

    // 🚀 Restored Permission Logic (Enhanced for Email Invites)
    const myMemberEntry = trip.members?.find(m => m.id === user?.uid || m.id === user?.email);
    const myRole = isPreview ? (trip.sharePermission === 'edit' && user?.uid ? 'editor' : 'viewer') : (myMemberEntry?.role || 'viewer');
    const isOwner = !isPreview && (myRole === 'owner' || isSimulation);
    const canEdit = (myRole === 'owner' || myRole === 'editor' || isSimulation);

    // V1.1 Phase 7: Reset history when date changes
    useEffect(() => {
        resetHistory(trip.itinerary?.[currentDisplayDate] || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDisplayDate]);

    // 🚀 Auto-Claim Invite Logic
    useEffect(() => {
        if (!user?.uid || !user?.email || isSimulation || isPreview) return;

        // Check if I'm invited by Email but haven't claimed key (still pending/email id)
        const pendingInvite = trip.members?.find(m => m.id === user?.email && m.status === 'pending');

        if (pendingInvite) {
            // Auto-claim the spot: Update ID to UID, remove pending status
            const claimInvite = async () => {
                const newMembers = trip.members.map(m =>
                    m.id === user?.email ? { ...m, id: user?.uid, status: 'active', claimedAt: Date.now() } : m
                );
                await updateDoc(doc(db, "trips", trip.id), { members: newMembers });
            };
            claimInvite();
        }
    }, [trip.members, user?.uid, user?.email, trip.id, isSimulation, isPreview]);

    // 🚀 Auto-Sync User Profile (Avatar & Name)
    useEffect(() => {
        if (!user?.uid || isSimulation || isPreview) return;

        const myEntry = trip.members?.find(m => m.id === user?.uid);
        if (myEntry) {
            // Check if profile needs update (Avatar, Name, or Email changed)
            if (myEntry.photoURL !== user?.photoURL || (user?.displayName && myEntry.name !== user?.displayName) || myEntry.email !== user?.email) {
                const syncProfile = async () => {
                    // 1. Update Trip Member List
                    const newMembers = trip.members.map(m =>
                        m.id === user?.uid ? { ...m, photoURL: user?.photoURL, name: user?.displayName || m.name, email: user?.email } : m
                    );
                    await updateDoc(doc(db, "trips", trip.id), { members: newMembers });

                    // 2. Ensure Global User Record Exists (Fix for Admin Panel "Unknown User")
                    await import('firebase/firestore').then(m => {
                        m.setDoc(m.doc(db, "users", user?.uid), {
                            email: user?.email,
                            displayName: user?.displayName,
                            photoURL: user?.photoURL,
                            lastLogin: m.serverTimestamp(),
                            uid: user?.uid
                        }, { merge: true });
                    });
                };
                // Debounce slightly to avoid rapid updates on load
                const timer = setTimeout(syncProfile, 2000);
                return () => clearTimeout(timer);
            } else {
                // Even if trip member list is fine, ensure global user record exists periodically (lazy check)
                // This covers the case where the user exists in trip but doc is missing in 'users'
                // We'll do this once per session/mount effectively via a separate check or just assume typical usage covers it.
                // Actually, let's just force a check if we suspect they might be missing. 
                // For now, attaching to the discrepancy check is good, but let's add a "Force Sync" via this side-effect if the user doc is missing.
            }
        }
    }, [trip.members, user?.uid, user?.photoURL, user?.displayName, trip.id, isSimulation, isPreview]);

    useEffect(() => {
        const visaStore = trip.visa || {};
        const myVisa = isSimulation ? visaStore.sim : (visaStore[user?.uid] || visaStore.default);
        setVisaForm({
            status: myVisa?.status || '',
            number: myVisa?.number || '',
            expiry: myVisa?.expiry || '',
            needsPrint: Boolean(myVisa?.needsPrint)
        });
    }, [trip.visa, user?.uid, isSimulation]);

    useEffect(() => {
        // Carousel effect for multi-city trips
        if (trip.cities && trip.cities.length > 1) {
            const interval = setInterval(() => {
                setSelectDate(prev => {
                    // This creates a re-render loop if we misuse setSelectDate, wait, I need a separate state for carousel index
                    // Let's use a local state for the carousel index
                    return prev;
                });
                setCarouselIndex(prev => (prev + 1) % trip.cities.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [trip.cities]);

    // Local Carousel State
    // Local Carousel State
    const [carouselIndex, setCarouselIndex] = useState(0);

    // 🚀 Dynamic Daily City Logic (Top Priority)
    // 1. Daily Override (Auto-Detected or Manual)
    // 2. Carousel (if multi-city)
    // 3. Trip Main City
    const dailyLocation = trip.locations?.[currentDisplayDate];
    const headerCity = dailyLocation?.city || ((trip.cities && trip.cities.length > 0) ? trip.cities[carouselIndex] : trip.city);

    // Determine the background image source
    const currentHeaderImage = CITY_IMAGES[headerCity] || COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE;

    useEffect(() => {
        setGlobalBg(currentHeaderImage);
        return () => setGlobalBg(null);
    }, [currentHeaderImage, setGlobalBg]);

    useEffect(() => {
        setTempNote(trip.notes || "");
        setMyInsurance(trip.insurance?.private?.[isSimulation ? 'sim' : user?.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    }, [trip.notes, trip.insurance, user?.uid, isSimulation]);

    // Handle Notification Deep Link Tab Switch
    useEffect(() => {
        if (requestedTab) {
            setActiveTab(requestedTab);
            onTabHandled?.();
        }
    }, [requestedTab, onTabHandled]);

    // ============================================
    // DERIVED VALUES
    // ============================================
    // Weather uses the same headerCity logic (Daily -> Carousel/Main)
    // Actually for Weather it should strictly follow the Daily plan, not carousel if no daily set.
    // Weather uses raw city name for API lookup (not localized)
    // dailyLocation?.city may be localized (e.g., "東京 (Tokyo)"), extract raw if needed
    const rawDailyCity = dailyLocation?.city?.match(/\(([^)]+)\)/)?.[1] || dailyLocation?.city;
    const weatherCity = rawDailyCity || trip.city;
    const realWeather = weatherData?.[weatherCity];

    // Generate mock temp range if only single temp available
    const mockTempRange = (() => {
        if (!realWeather?.temp) return null;
        const currentTemp = parseInt(realWeather.temp);
        if (isNaN(currentTemp)) return null;
        // Estimate: Night is ~5°C colder than day for simulation
        const mockNightTemp = Math.max(currentTemp - 5, -10);
        return `${currentTemp}°C / ${mockNightTemp}°C`;
    })();
    const mockWeather = getWeatherForecast(trip.country, mockTempRange, null, null, t);

    const dailyWeather = React.useMemo(() => {
        if (!realWeather?.daily) return mockWeather;
        const daily = realWeather.daily;
        const idx = daily.time.indexOf(currentDisplayDate);
        if (idx === -1) return mockWeather;

        const dayCode = daily.weather_code[idx];
        const dayInfo = getWeatherInfo(dayCode);
        const maxTemp = Math.round(daily.temperature_2m_max[idx]);
        const minTemp = Math.round(daily.temperature_2m_min[idx]);
        const dayTemp = `${maxTemp}°C / ${minTemp}°C`; // Day / Night format

        return getWeatherForecast(trip.country, dayTemp, dayInfo.desc, dayInfo.icon, t);
    }, [realWeather, currentDisplayDate, trip.country, mockWeather]);
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, t);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.language || 'zh-HK';
    const displayCountry = getLocalizedCountryName(trip.country, currentLang);
    const displayCity = getLocalizedCityName(headerCity || '', currentLang);
    // V1.1 Fix: Use pendingItemsCache for optimistic UI (drag & drop updates)
    const baseItineraryItems = pendingItemsCache[currentDisplayDate] || trip.itinerary?.[currentDisplayDate] || [];

    // V1.1 Phase 5: Hotel Intelligence - Auto-populate hotel for multi-day stays
    const itineraryItems = useMemo(() => {
        if (!trip.itinerary) return baseItineraryItems;

        const allActiveHotels = [];
        Object.entries(trip.itinerary).forEach(([date, items]) => {
            if (!Array.isArray(items)) return;
            items.forEach(item => {
                // If it's a hotel and has a duration > 1
                if (item.type === 'hotel' && item.details?.duration > 1) {
                    allActiveHotels.push({ ...item, checkInDate: date });
                }
            });
        });

        // Current date object for comparison
        const current = new Date(currentDisplayDate);
        current.setHours(0, 0, 0, 0);

        const injectedHotels = allActiveHotels.filter(hotel => {
            // If it's the check-in date, it's already in baseItineraryItems
            if (hotel.checkInDate === currentDisplayDate) return false;

            const checkIn = new Date(hotel.checkInDate);
            checkIn.setHours(0, 0, 0, 0);
            const nights = parseInt(hotel.details.duration, 10);

            const diffDays = Math.round((current - checkIn) / (1000 * 60 * 60 * 24));

            // It's an active stay if we are after check-in and before check-out
            // e.g. check-in Day 1, duration 3 nights -> Day 2 and Day 3 should show it.
            return diffDays > 0 && diffDays < nights;
        }).map(hotel => ({
            ...hotel,
            id: `virtual-hotel-${hotel.id}-${currentDisplayDate}`,
            isVirtual: true,
            // Visual label to show it's a continuing stay
            name: `${hotel.name || hotel.details?.name} (續住)`,
            time: '00:00', // Auto-pin to top
            _originalId: hotel.id
        }));

        // Check if a virtual hotel already exists in base (unlikely but safe)
        const finalHotels = injectedHotels.filter(vh => !baseItineraryItems.some(bi => bi.name === vh.name || bi.id === vh._originalId));

        return [...finalHotels, ...baseItineraryItems].sort((a, b) => {
            const timeA = a.time || "00:00";
            const timeB = b.time || "00:00";
            return timeA.localeCompare(timeB);
        });
    }, [trip.itinerary, currentDisplayDate, baseItineraryItems]);
    const homeHolidays = getHolidayMap(globalSettings.region || "HK");
    const destHolidays = getHolidayMap(countryInfo.tz || "Global");
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems, t, destHolidays);

    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    useGlobalShortcuts({
        onBack: () => onBack?.(),
        onShare: () => setIsSmartExportOpen(true),
        // Duplicate removed
        onTabChange: (index) => {
            const tabs = ['itinerary', 'packing', 'shopping', 'budget', 'gallery', 'currency', 'footprints', 'insurance', 'emergency', 'visa'];
            if (index === 0) {
                // Cmd + 0 -> Last Tab (Visa)
                setActiveTab(tabs[tabs.length - 1]);
            } else if (tabs[index - 1]) {
                // Cmd + 1..9
                setActiveTab(tabs[index - 1]);
            }
        }
    });

    // ============================================
    // HANDLERS
    // ============================================

    const onDragEnd = async (result, autoShiftEnabled = true) => {
        if (!result.destination || !canEdit) return;

        const { source, destination, draggableId } = result;
        if (source.index === destination.index) return;

        // Get the full source list (unfiltered)
        let fullList = [...(trip.itinerary?.[currentDisplayDate] || [])];

        // Find the item that was dragged by its ID
        const draggedItem = fullList.find(item => String(item.id) === String(draggableId));
        if (!draggedItem) {
            console.warn('[onDragEnd] Could not find dragged item with ID:', draggableId);
            return;
        }

        // Get the actual index in the full list
        const actualSourceIndex = fullList.findIndex(item => String(item.id) === String(draggableId));
        if (actualSourceIndex === -1) return;

        // V1.1 Phase 4: Bundle Movement - Dragging one part moves the whole set
        const bundleId = draggedItem.details?.bundleId || draggedItem.bundleId;
        let itemsToMove = [draggedItem];
        let originalIndices = [actualSourceIndex];

        if (bundleId) {
            // Find all items in this bundle
            const otherBundleItems = fullList.filter((item, idx) =>
                ((item.details?.bundleId || item.bundleId) === bundleId) && idx !== actualSourceIndex
            );

            if (otherBundleItems.length > 0) {

                // Collect all bundle items and their current indices
                itemsToMove = fullList.filter(item => (item.details?.bundleId || item.bundleId) === bundleId);
                originalIndices = itemsToMove.map(item => fullList.findIndex(i => i.id === item.id)).sort((a, b) => a - b);

                // Remove all bundle items from current list
                // To avoid index shifting issues, we remove from highest index to lowest
                [...originalIndices].reverse().forEach(idx => fullList.splice(idx, 1));
            } else {
                fullList.splice(actualSourceIndex, 1);
            }
        } else {
            fullList.splice(actualSourceIndex, 1);
        }

        // Calculate the new position
        let actualDestIndex = destination.index;
        // If sorting was done by time, destination.index might be different from actual list index
        // But here we use result.destination.index which is usually correct for the Droppable

        // Insert bundle at new position
        fullList.splice(actualDestIndex, 0, ...itemsToMove);

        // V1.1 Phase 2/3: Smart Ripple - Auto-adjust times if enabled
        if (autoShiftEnabled && actualDestIndex > 0) {
            // Dynamic import to avoid circular dependencies
            const { calculateSmartRipple } = await import('../../utils/timeUtils');
            const { adjustedItems, changesNeeded, offset } = await calculateSmartRipple(fullList, actualDestIndex);

            if (changesNeeded) {

                fullList = adjustedItems;
            }
        }

        // V1.1 Phase 7: Record to history before updating
        recordHistory(fullList, 'drag', `移動「${draggedItem.details?.name || draggedItem.name || '項目'}」`);

        // Optimistic Update
        setPendingItemsCache(prev => ({
            ...prev,
            [currentDisplayDate]: fullList
        }));

        if (!isSimulation) {
            await updateDoc(doc(db, "trips", trip.id), {
                [`itinerary.${currentDisplayDate}`]: fullList,
                lastUpdate: serverTimestamp()
            });
        }
    };

    /**
     * V1.2.6: Handle Cross-Day Item Movement (Kanban)
     * Moves an item from one date to another.
     */
    const handleMoveItem = async (itemId, sourceDate, targetDate, newIndex = -1) => {
        if (!itemId || !sourceDate || !targetDate || !canEdit) return;

        const sourceList = [...(trip.itinerary?.[sourceDate] || [])];
        const targetList = sourceDate === targetDate ? sourceList : [...(trip.itinerary?.[targetDate] || [])];

        const itemIndex = sourceList.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        if (sourceDate === targetDate) {
            // Reordering
            if (newIndex !== -1 && newIndex !== itemIndex) {
                const [movedItem] = sourceList.splice(itemIndex, 1);
                sourceList.splice(newIndex, 0, movedItem);
            }
        } else {
            // Moving Dates
            const [item] = sourceList.splice(itemIndex, 1);
            item.date = targetDate;

            if (newIndex !== -1) {
                targetList.splice(newIndex, 0, item);
            } else {
                targetList.push(item);
            }
        }

        // Optimistic Update
        setPendingItemsCache(prev => ({
            ...prev,
            [sourceDate]: sourceList,
            [targetDate]: targetList
        }));

        if (!isSimulation) {
            try {
                await updateDoc(doc(db, "trips", trip.id), {
                    [`itinerary.${sourceDate}`]: sourceList,
                    [`itinerary.${targetDate}`]: targetList,
                    lastUpdate: serverTimestamp()
                });
            } catch (error) {
                console.error("Error moving item:", error);
            }
        }
    };

    // V1.1 Phase 7: Undo Handler
    const handleUndo = async () => {
        const previousState = undoHistory();
        if (previousState) {
            setPendingItemsCache(prev => ({
                ...prev,
                [currentDisplayDate]: previousState
            }));
            if (!isSimulation) {
                await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: previousState });
            }
        }
    };

    // V1.1 Phase 7: Redo Handler
    const handleRedo = async () => {
        const nextState = redoHistory();
        if (nextState) {
            setPendingItemsCache(prev => ({
                ...prev,
                [currentDisplayDate]: nextState
            }));
            if (!isSimulation) {
                await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: nextState });
            }
        }
    };

    const handleSaveItem = async (data) => {


        if (!canEdit) return alert("權限不足");
        if (isSimulation) return alert("模擬模式");

        const isEdit = !!data.id;
        const routeDate = data.date || data.details?.date || currentDisplayDate; // Changed selectedDate to currentDisplayDate
        const calculateEndTime = (startTime, durationMins) => {
            const [h, m] = startTime.split(':').map(Number);
            const total = h * 60 + m + durationMins;
            const nh = Math.floor(total / 60) % 24;
            const nm = total % 60;
            return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
        };

        // Prepare new item object
        const itemId = data.id || Date.now().toString();


        // CRITICAL: Spread data FIRST, then set id AFTER to prevent undefined overwrite
        let newItem = {
            ...data,
            id: itemId, // Must be AFTER ...data to ensure it's not overwritten by undefined
            // Preserve existing creator or set current user
            createdBy: data.createdBy || { name: user?.displayName || 'Unknown', id: user?.uid }
        };

        // Sanitize (remove _index before saving to Firebase)
        delete newItem._index;
        newItem = JSON.parse(JSON.stringify(newItem));



        const docRef = doc(db, "trips", trip.id);
        const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef));

        if (!docSnap.exists()) return;

        if (data.type === 'shopping_plan') {
            // Check if exists in shoppingList to update, else union
            const currentList = docSnap.data().shoppingList || [];
            const exists = currentList.some(i => String(i.id) === String(itemId));

            if (exists) {
                const updatedList = currentList.map(i => String(i.id) === String(itemId) ? newItem : i);
                await updateDoc(docRef, { shoppingList: updatedList, lastUpdate: serverTimestamp() });
            } else {
                await updateDoc(docRef, { shoppingList: arrayUnion({ ...newItem, bought: false }), lastUpdate: serverTimestamp() });
            }
        } else if (data.type === 'flight' && !data.id && data.details?.arrival) {
            // V1.1 Phase 5: Flight + Immigration Bundle Auto-Generation
            // Triggered only for NEW flights (not edits) to avoid duplicates

            const arrivalTime = data.details?.time || "12:00";
            const arrivalPort = data.details?.arrival || "機場";

            const { parseTime, formatTime } = await import('../../utils/timeUtils');
            const arrivalMins = parseTime(arrivalTime) || 720; // Default to 12:00 if invalid

            const immigrationItem = {
                id: `bundle-imm-${Date.now()}`,
                name: `入境程序 (${arrivalPort})`,
                type: 'immigration',
                time: formatTime(arrivalMins + 45),
                details: { time: formatTime(arrivalMins + 45), location: arrivalPort },
                createdBy: { name: user?.displayName || 'System', id: user?.uid }
            };

            const airportTransport = {
                id: `bundle-trans-${Date.now() + 1}`,
                name: `機場交通 (${arrivalPort} → 市區)`,
                type: 'transport',
                time: formatTime(arrivalMins + 60),
                details: { time: formatTime(arrivalMins + 60), location: arrivalPort, arrival: '飯店/第一個景點' },
                createdBy: { name: user?.displayName || 'System', id: user?.uid }
            };

            // Capture current itinerary for the date
            const currentDayItinerary = docSnap.data().itinerary?.[currentDisplayDate] || [];
            const newItinerary = [...currentDayItinerary, newItem, immigrationItem, airportTransport];

            // Sort by time
            newItinerary.sort((a, b) => {
                const timeA = parseTime(a.details?.time || a.time || "00:00") || 0;
                const timeB = parseTime(b.details?.time || b.time || "00:00") || 0;
                return timeA - timeB;
            });

            await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: newItinerary });

            // Record to history
            recordHistory(newItinerary, 'bundle', `已自動生成入境套餐 (${arrivalPort})`);

            // Update cache
            setPendingItemsCache(prev => ({ ...prev, [currentDisplayDate]: newItinerary }));
        } else if (data.type === 'shopping' && !data.details?.startLine) { // Budget item (legacy check)
            // Budget logic usually uses arrayUnion but for editing we might need full array rewrite if we support budget editing
            // For now, assume this follows standard budget flow
            await updateDoc(docRef, { budget: arrayUnion({ ...newItem, category: 'shopping' }), lastUpdate: serverTimestamp() });
            notifyTripActivity(trip, user, 'add_expense', { name: newItem.name, id: itemId }); // V1.9.4
        } else if (data.type === 'packing') {
            const currentList = docSnap.data().packingList || [];
            const exists = currentList.some(i => String(i.id) === String(itemId));

            if (exists) {
                const updatedList = currentList.map(i => String(i.id) === String(itemId) ? newItem : i);
                await updateDoc(docRef, { packingList: updatedList, lastUpdate: serverTimestamp() });
            } else {
                await updateDoc(docRef, { packingList: arrayUnion({ ...newItem, category: data.category || 'misc', checked: false }), lastUpdate: serverTimestamp() });
            }
        } else {
            // Itinerary Items
            // Determine if edit based on ID presence OR explicit index provided (legacy fix)
            const itemIndex = data._index;
            const isEdit = !!data.id || (itemIndex !== undefined && itemIndex !== null);
            const routeDate = currentDisplayDate; // Capture current date for safety



            if (isEdit) {
                const items = docSnap.data().itinerary?.[routeDate] || [];


                let updatedItems;
                let updateMethod = 'unknown';

                // Priority 1: Update by ID
                if (data.id && items.some(i => String(i.id) === String(data.id))) {
                    updateMethod = 'BY_ID';
                    updatedItems = items.map(item => {
                        if (String(item.id) === String(data.id)) {

                            return { ...item, ...newItem };
                        }
                        return item;
                    });
                }
                // Priority 2: Update by Index (Legacy/Broken ID Support)
                else if (itemIndex !== undefined && itemIndex !== null && items[itemIndex]) {
                    updateMethod = 'BY_INDEX';
                    updatedItems = [...items];

                    // HEAL: Assign new ID to the legacy item!
                    updatedItems[itemIndex] = { ...items[itemIndex], ...newItem, id: newItem.id };
                }
                // Fallback: This shouldn't happen if isEdit is true, but safety check
                else {
                    updateMethod = 'FALLBACK_ADD';
                    console.warn('[handleSaveItem] FALLBACK: Could not find item, adding as new!');
                    updatedItems = [...items, newItem];
                }



                // CRITICAL: Sanitize to remove undefined values (Firebase doesn't accept them)
                const sanitizeForFirebase = (obj) => {
                    if (obj === null || obj === undefined) return null;
                    if (Array.isArray(obj)) return obj.map(sanitizeForFirebase);
                    if (typeof obj === 'object') {
                        const result = {};
                        for (const [key, value] of Object.entries(obj)) {
                            if (value !== undefined) {
                                result[key] = sanitizeForFirebase(value);
                            }
                        }
                        return result;
                    }
                    return obj;
                };

                // Sanitize each item in the array
                const sanitizedItems = updatedItems.map(item => sanitizeForFirebase(item));




                // V1.1 Phase 2: Apply Smart Ripple if duration exists
                let finalItems = sanitizedItems;
                const editedIndex = updatedItems.findIndex(i => String(i.id) === String(data.id));
                if (editedIndex !== -1 && (newItem.details?.duration || newItem.time)) {

                    finalItems = recalculateItineraryTimes(sanitizedItems, editedIndex);
                }

                // Edit mode
                await updateDoc(docRef, { [`itinerary.${routeDate}`]: finalItems, lastUpdate: serverTimestamp() });
                notifyTripActivity(trip, user, 'edit_item', { name: newItem.name, id: itemId }); // V1.9.4

            } else {
                // Add mode
                await updateDoc(docRef, { [`itinerary.${routeDate}`]: arrayUnion(newItem), lastUpdate: serverTimestamp() });

                // V1.9.4: Notify Update
                notifyTripActivity(trip, user, 'add_item', { name: newItem.name, id: itemId });
            }

            // V1.1 Phase 5: Hotel-Transport Smart Binding
            if (data.type === 'hotel' && isEdit && editingItem && editingItem.name !== data.name) {
                const oldHotelName = editingItem.name || editingItem.details?.name;
                const newHotelName = data.name;

                if (oldHotelName && newHotelName) {
                    const fullItinerary = { ...(trip.itinerary || {}) };
                    let syncCount = 0;

                    Object.keys(fullItinerary).forEach(date => {
                        fullItinerary[date] = fullItinerary[date].map(item => {
                            if (item.type === 'transport' || item.type === 'flight' || item.type === 'walk') {
                                const d = { ...(item.details || {}) };
                                let changed = false;
                                if (d.location === oldHotelName) { d.location = newHotelName; changed = true; }
                                if (d.arrival === oldHotelName) { d.arrival = newHotelName; changed = true; }
                                if (changed) { syncCount++; return { ...item, details: d }; }
                            }
                            return item;
                        });
                    });

                    if (syncCount > 0) {

                        await updateDoc(docRef, { itinerary: fullItinerary });
                        setPendingItemsCache(prev => ({ ...prev, ...fullItinerary }));
                    }
                }
            }

        }

        // V1.1 Phase 5: Walk Card Auto-Generation
        const desc = (data.name + (data.details?.notes || "")).toLowerCase();
        if (desc.includes('步行') && !isEdit) {
            const walkMatch = desc.match(/步行\s*(\d+)\s*分/);
            const walkDuration = walkMatch ? parseInt(walkMatch[1]) : 15;
            const walkLocation = data.details?.location || data.name;



            const walkItem = {
                id: `walk_${Date.now()}`,
                type: 'walk',
                name: `步行至 ${walkLocation}`,
                time: data.time || "00:00",
                details: {
                    duration: walkDuration,
                    location: walkLocation,
                    time: data.time || "00:00"
                }
            };

            setConfirmConfig({
                title: '🚶 智能步行建議',
                message: `偵測到「${data.name}」包含步行行程，是否自動加入一個 ${walkDuration} 分鐘的步行卡片？`,
                type: 'info',
                onConfirm: async () => {
                    await updateDoc(docRef, { [`itinerary.${routeDate}`]: arrayUnion(walkItem) });

                    setConfirmConfig(null);
                }
            });
        }

        // V1.1 Phase 5: Immigration Bundle Suggestion (For Flights)
        if (data.type === 'flight' && !isEdit) {
            const arrTime = data.details?.endTime || calculateEndTime(data.time, 120); // Fallback 2h flight
            const immigrationItem = {
                id: `bundle_imm_${Date.now()}`,
                type: 'walk',
                name: '🛃 入境手續 & 提取行李',
                time: arrTime,
                details: { duration: 45, location: data.arrival || '機場', time: arrTime }
            };
            const transportItem = {
                id: `bundle_tra_${Date.now() + 1}`,
                type: 'transport',
                name: '🚆 機場接駁 / 前往市區',
                time: calculateEndTime(arrTime, 45),
                details: { duration: 60, location: data.arrival || '機場', arrival: '行程首站', transportType: 'Transit' }
            };

            setConfirmConfig({
                title: '✈️ 智能機票套餐建議',
                message: `偵測到新機票行程，是否自動加入「入境手續」及「機場交通」建議卡片？`,
                type: 'info',
                onConfirm: async () => {
                    await updateDoc(docRef, { [`itinerary.${routeDate}`]: arrayUnion(immigrationItem, transportItem), lastUpdate: serverTimestamp() });

                    setConfirmConfig(null);
                }
            });
        }

        // Auto City Detection (only for new transport items)
        if (!isEdit && (data.type === 'transport' || data.type === 'flight') && (data.arrival || data.details?.arrival)) {
            const arrivalCity = data.arrival || data.details?.arrival;
            const daysArr = getDaysArray(trip.startDate, trip.endDate);
            const currentIdx = daysArr.indexOf(routeDate);
            if (currentIdx >= 0 && currentIdx < daysArr.length - 1) {
                const nextDate = daysArr[currentIdx + 1];
                if (!trip.locations?.[nextDate]) {
                    const dRef = doc(db, "trips", trip.id);
                    await updateDoc(dRef, { [`locations.${nextDate}`]: { city: arrivalCity, country: trip.country }, lastUpdate: serverTimestamp() });
                }
            }
        }

        // V1.1 Phase 5: Multi-City Transport Suggestion
        if (!isEdit && (data.type === 'transport' || data.type === 'flight' || data.type === 'walk')) {
            const destCity = data.details?.arrival || data.arrival || data.details?.location || data.name;
            const currentCity = trip.locations?.[routeDate]?.city;

            if (destCity && currentCity && destCity !== currentCity && !destCity.includes(currentCity)) {

                setConfirmConfig({
                    title: '🚅 跨城市交通建議',
                    message: `偵測到目的地為「${destCity}」，同現時城市「${currentCity}」唔同。是否需要為你安排新幹線或國內線航班建議？`,
                    type: 'info',
                    onConfirm: async () => {
                        alert("Jarvis 已為你標記跨城市交通需求，請在 Transport Tab 查看建議。");
                        setConfirmConfig(null);
                    }
                });
            }
        }

        setIsAddModal(false);

        // Optimistic Update: Cache the saved item with its ID
        if (data.type !== 'shopping_plan' && data.type !== 'shopping' && data.type !== 'packing') {
            setPendingItemsCache(prev => ({
                ...prev,
                [routeDate]: [
                    ...(prev[routeDate] || []).filter(i => i.id !== itemId),
                    { ...newItem, id: itemId }
                ]
            }));

        }
    };

    // V1.3.0 Social: Fork Handler (Updated V1.9.7 for Duplicate)
    const handleFork = async () => {
        if (!user) return alert("請先登入才可 Fork 行程");
        // Update V1.9.7: Allow owner to Duplicate
        const isOwner = trip.ownerId === user.uid;

        if (isSimulation) return alert("模擬模式無法執行 Fork");

        const actionName = isOwner ? (t('trip.actions.duplicate') || '複製') : 'Fork';
        const confirmMsg = isOwner
            ? `確定要${actionName}這個行程「${trip.name}」？\n\n這將會建立一個全新的複本，讓你自由修改。`
            : `確定要 Fork 這個行程「${trip.name}」？\n\n這將會：\n1. 複製一份完整的行程到你的帳戶\n2. 讓你自由修改而不影響原作\n3. 保留原作的 credits`;

        if (!confirm(confirmMsg)) return;

        try {
            // Dynamic import to ensure we have the necessary functions
            const { collection, addDoc, increment, getDoc } = await import('firebase/firestore');

            // 1. Prepare new trip data (Clean slate)
            const newTrip = {
                ...trip,
                name: isOwner ? `${trip.name} (Copy)` : `${trip.name} (Forked)`,
                ownerId: user.uid, // Transfer ownership to current user
                members: [{
                    id: user.email || user.uid,
                    name: user.displayName || 'Me',
                    role: 'owner',
                    status: 'accepted',
                    joinedAt: Date.now(),
                    invitedAt: Date.now()
                }],
                isPublic: false, // Default to private for the new fork
                forkedFrom: trip.id,
                forkedFromName: trip.name, // Snapshot of original name
                forks: 0,
                likes: 0,
                views: 0,
                likedBy: [],
                createdAt: Date.now(),
                lastUpdate: serverTimestamp(),
                // Clear any specific user data valid only for original owner
                insurance: {},
                visa: {}
            };

            // Remove ID to let Firestore generate a new one
            delete newTrip.id;

            // 2. Create new trip document
            const docRef = await addDoc(collection(db, "trips"), newTrip);

            // 3. Update stats on original trip (Atomic increment)
            await updateDoc(doc(db, "trips", trip.id), {
                forks: increment(1)
            });

            // 4. Success feedback & Navigation
            if (confirm("Fork 成功！是否立即跳轉到新行程？")) {
                // Force reload/navigation to the new trip to ensure clean state
                window.location.href = `/?tripId=${docRef.id}`;
            } else {
                alert("已加到你的行程列表！");
            }

        } catch (error) {
            console.error("Fork error:", error);
            alert("Fork 失敗： " + error.message);
        }
    };

    // V1.3.0 Social: Like Handler
    const handleLike = async (e) => {
        e?.stopPropagation();
        if (!user) return alert("請先登入");
        if (isSimulation) return;

        // Optimistic UI Update (Local state)
        const currentLiked = trip.likedBy?.includes(user.uid);
        const cleanLikedBy = trip.likedBy || [];

        // Temporarily update local cache for instant feedback
        const projectedLikes = (trip.likes || 0) + (currentLiked ? -1 : 1);
        const projectedLikedBy = currentLiked
            ? cleanLikedBy.filter(id => id !== user.uid)
            : [...cleanLikedBy, user.uid];

        setPendingItemsCache(prev => ({
            ...prev,
            _social: {
                likes: projectedLikes,
                likedBy: projectedLikedBy
            }
        }));

        try {
            const { increment, arrayUnion, arrayRemove } = await import('firebase/firestore');
            await updateDoc(doc(db, "trips", trip.id), {
                likes: increment(currentLiked ? -1 : 1),
                likedBy: currentLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Like error:", error);
            // Revert on error would go here, but omitted for brevity
        }
    };

    // V1.3.0 Social: View Counter (Auto-increment on detailed view)
    useEffect(() => {
        const incrementView = async () => {
            if (!trip?.id || !trip?.isPublic || isSimulation || !user) return;
            // V1.3.6: Prevent updates for mock trips
            if (trip.isMock || (typeof trip.id === 'string' && trip.id.startsWith('mock_'))) return;

            if (trip.ownerId === user.uid) return; // Don't count owner views

            const viewedKey = `viewed_${trip.id}`;
            if (sessionStorage.getItem(viewedKey)) return; // Already viewed in this session

            try {
                const { increment } = await import('firebase/firestore');
                await updateDoc(doc(db, "trips", trip.id), {
                    views: increment(1)
                });
                sessionStorage.setItem(viewedKey, 'true');
            } catch (err) {
                console.error("Failed to increment view:", err);
            }
        };
        incrementView();
    }, [trip?.id]);

    const handleInvite = async (email, role) => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), {
            members: arrayUnion({
                id: email,
                name: email.split('@')[0],
                role,
                status: 'pending',
                invitedAt: Date.now()
            }),
            lastUpdate: serverTimestamp()
        });
    };

    const handleOpenAIModal = (mode = 'full') => {
        setAIMode(mode);
        setIsAIModal(true);
    };

    // Fix: Pass setIsChatOpen to effect (assuming it's available in scope, if not, need to check props)
    // Actually, onOpenChat is passed as prop, but setIsChatOpen might not be.
    // Let's check props. setIsChatOpen is likely passed or onOpenChat toggles it.
    // If setIsChatOpen is not available, we need to ask App.jsx or rely on onUserClick/etc.
    // Wait, onOpenChat is a prop. Let's assume onCloseChat is available or we need to expose it.
    // Checking props in TripDetail... onOpenChat is there.
    // If setIsChatOpen is not available, I should add it to props in App.jsx and here.
    // If setIsChatOpen is not available, I should add it to props in App.jsx and here.
    const { currentStep, isActive: isTourActive, currentStepData, startTourAt } = useTour();

    // Tour Integration: Auto-open various modals/windows based on tour steps
    useEffect(() => {
        if (!isTourActive) return;

        const stepId = currentStepData?.id;

        // Open/close Plan Menu dropdown
        if (stepId === 'add-activity-menu') {
            setIsPlanMenuOpen(true);
            setIsAddModal(false);
        } else if (stepId === 'add-activity-types' || stepId === 'add-activity-form') {
            // Close dropdown, open modal for both modal sub-steps
            setIsPlanMenuOpen(false);
            setIsAddModal(true);
        } else if (stepId === 'activity-card') {
            // Close modal when showing activity cards
            setIsPlanMenuOpen(false);
            setIsAddModal(false);
        } else if (stepId === 'jarvis-smart-guide') {
            // Open AI Modal for Jarvis smart guide step (Bento Menu)
            setIsPlanMenuOpen(false);
            setIsAddModal(false);
            handleOpenAIModal && handleOpenAIModal('full');
        } else if (stepId === 'jarvis-chat') {
            // Open Chat Window and switch to Jarvis tab
            setIsPlanMenuOpen(false);
            setIsAddModal(false);
            setIsAIModal && setIsAIModal(false); // Close AI Modal (Bento)
            onOpenChat && onOpenChat('jarvis');
        } else if (stepId === 'group-chat') {
            // Open Chat window and switch to Group tab
            setIsPlanMenuOpen(false);
            setIsAddModal(false);
            setIsAIModal && setIsAIModal(false);
            onOpenChat && onOpenChat('trip');
        } else if (stepId === 'budget-content') {
            // Close chat when moving to budget
            setIsChatOpen && setIsChatOpen(false);
        } else {
            setIsPlanMenuOpen(false);
        }
    }, [isTourActive, currentStepData?.id]);




    const handleUpdateRole = async (memberId, newRole) => {
        if (isSimulation) return alert("模擬模式");
        if (newRole === 'remove') {
            const newMembers = trip.members.filter(m => m.id !== memberId);
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers, lastUpdate: serverTimestamp() });
        } else {
            const newMembers = trip.members.map(m => m.id === memberId ? { ...m, role: newRole } : m);
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers, lastUpdate: serverTimestamp() });
        }
    };

    const handleDeleteTrip = async () => {
        if (!isOwner) return alert("只有擁有者可以刪除");
        if (confirm("確定刪除？")) { await deleteDoc(doc(db, "trips", trip.id)); onBack(); }
    };


    const handleDeleteItineraryItem = (itemOrId) => {
        if (!canEdit) return setConfirmConfig({ title: "權限不足", message: "您沒有權限執行此操作", type: "warning" });
        if (isSimulation) return setConfirmConfig({ title: "模擬模式", message: "模擬模式僅供預覽", type: "warning" });

        const itemId = typeof itemOrId === 'object' ? itemOrId?.id : itemOrId;
        const itemIndex = typeof itemOrId === 'object' ? itemOrId?._index : undefined;



        if (!itemId && (itemIndex === undefined || itemIndex === null)) return;

        setConfirmConfig({
            title: "刪除確認",
            message: "確定要刪除這個行程項目嗎？",
            type: "warning",
            onConfirm: async () => {

                // 🚀 Optimistic Delete: Immediately hide from UI via cache
                if (itemId) {
                    const routeDate = currentDisplayDate;
                    setPendingItemsCache(prev => ({
                        ...prev,
                        [routeDate]: [
                            ...(prev[routeDate] || []).filter(i => String(i.id) !== String(itemId)), // Remove existing cache entry if any
                            { id: itemId, _deleted: true } // Add tombstone to hide original item
                        ]
                    }));
                }

                setConfirmConfig(null);
                try {
                    const docRef = doc(db, "trips", trip.id);
                    // FIX: Use direct getDoc instead of dynamic import which might be hanging
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const routeDate = currentDisplayDate;
                        const items = data.itinerary?.[routeDate] || [];

                        let newItems;

                        // Priority 1: Delete by ID
                        if (itemId && items.some(i => String(i.id) === String(itemId))) {
                            newItems = items.filter(i => String(i.id) !== String(itemId));
                        }
                        // Priority 2: Delete by Index (Legacy Support)
                        else if (itemIndex !== undefined && itemIndex !== null && items[itemIndex]) {
                            newItems = [...items];
                            newItems.splice(itemIndex, 1);
                        }
                        // Fallback: If nothing matched, change nothing
                        else {
                            newItems = items;
                            console.warn("Delete failed: Item not found by ID or Index");
                        }

                        if (newItems.length !== items.length) {
                            await updateDoc(docRef, { [`itinerary.${routeDate}`]: newItems, lastUpdate: serverTimestamp() });
                            notifyTripActivity(trip, user, 'delete_item', { name: itemToDelete?.name || 'Item', id: itemId }); // V1.9.4
                        }
                    }
                    setIsAddModal(false);
                } catch (err) {
                    console.error("Delete itinerary item error:", err);
                }
            }
        });
    };

    const handleGenerateWeatherSummary = async () => {
        if (!realWeather) {
            alert("正在獲取天氣資訊，請稍候...");
            return;
        }
        setIsGeneratingWeather(true);
        try {
            const result = await generateWeatherSummary(realWeather, i18n.language);
            if (result) {
                setSmartWeather(result);
            }
        } catch (err) {
            console.error("Weather summary generation error:", err);
            alert("天氣分析失敗，請檢查網絡或稍後再試。");
        } finally {
            setIsGeneratingWeather(false);
        }
    };

    const handleClearDailyItinerary = () => {
        if (!canEdit) return setConfirmConfig({ title: "權限不足", message: "您沒有權限執行此操作", type: "warning" });
        if (isSimulation) return setConfirmConfig({ title: "模擬模式", message: "模擬模式僅供預覽", type: "warning" });

        setConfirmConfig({
            title: "清空確認",
            message: "確定要清空當日所有行程項目？\n此操作無法撤銷！",
            type: "error",
            onConfirm: async () => {
                setConfirmConfig(null);
                try {
                    const docRef = doc(db, "trips", trip.id);
                    await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: [], lastUpdate: serverTimestamp() });
                } catch (err) {
                    console.error("Clear daily error:", err);
                    alert("清空失敗：" + err.message);
                }
            }
        });
    };


    const handleSaveInsurance = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`insurance.private.${user?.uid}`]: myInsurance, lastUpdate: serverTimestamp() });
        alert("已儲存");
    };

    const handleSaveVisa = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`visa.${user?.uid}`]: visaForm, lastUpdate: serverTimestamp() });
        alert("簽證資訊已更新");
    };

    const handleGeneratePackingList = async () => {
        setAIMode('packing');
        setIsAIModal(true);
    };

    const handleClearPackingList = async () => {
        if (isSimulation) return;
        setConfirmConfig({
            title: "清空行李清單",
            message: "確定要清空所有行李清單項目嗎？此操作無法撤銷。",
            type: "warning",
            onConfirm: async () => {
                await updateDoc(doc(db, "trips", trip.id), { packingList: [], lastUpdate: serverTimestamp() });
                setConfirmConfig(null);
            }
        });
    };

    const handlePackingToggle = async (itemId) => {
        if (isSimulation) return;
        const newList = (trip.packingList || []).map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
        await updateDoc(doc(db, "trips", trip.id), { packingList: newList, lastUpdate: serverTimestamp() });
    };

    const handlePackingDelete = async (itemId) => {
        if (isSimulation) return;
        const newList = (trip.packingList || []).filter(i => i.id !== itemId);
        await updateDoc(doc(db, "trips", trip.id), { packingList: newList, lastUpdate: serverTimestamp() });
    };

    const handleOptimizeSchedule = async () => {
        if (isSimulation) return setConfirmConfig({ title: "模擬模式", message: "目前處於模擬模式，無法執行 Jarvis 優化。", type: "info" });
        const currentItems = trip.itinerary?.[currentDisplayDate] || [];

        if (currentItems.length === 0) {
            setConfirmConfig({
                title: "當日尚未有行程",
                message: "是否要讓 Jarvis 為您建議今日的行程？",
                type: "info",
                onConfirm: () => {
                    setAIMode('itinerary');
                    setIsAIModal(true);
                    setConfirmConfig(null);
                }
            });
            return;
        }

        setConfirmConfig({
            title: "Jarvis 智能排程優化",
            message: "Jarvis 將會：\n1. 補全缺失的時間\n2. 在景點間插入交通建議\n3. 加入必玩/打卡標籤",
            type: "warning",
            onConfirm: async () => {
                setConfirmConfig(null);
                try {
                    const optimized = await optimizeSchedule(currentItems);
                    await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: optimized, lastUpdate: serverTimestamp() });
                    setConfirmConfig({
                        title: "優化成功",
                        message: "✨ Jarvis 已根據地點與動線為您重新排程並加入建議！",
                        type: "info"
                    });
                } catch (e) {
                    console.error(e);
                    setConfirmConfig({ title: "優化失敗", message: "請稍後再試", type: "error" });
                }
            }
        });
    };

    const handleAIApply = async (arg = []) => {
        if (isSimulation) return alert("模擬模式");
        if (!arg) return;

        // Determine if arg is the new structured object or old flat array
        const isStructured = !Array.isArray(arg) && (arg.itinerary || arg.shopping || arg.packing);
        const data = isStructured ? arg : { [aiMode === 'full' ? 'itinerary' : aiMode]: arg };

        const updates = {};
        const docRef = doc(db, "trips", trip.id);

        // 1. Handle Itinerary
        if (data.itinerary && data.itinerary.length > 0) {
            const currentDayItems = trip.itinerary?.[currentDisplayDate] || [];
            const enriched = data.itinerary.map((item, idx) => ({
                id: `${Date.now()}-${idx}`,
                ...item,
                cost: item.cost || 0,
                currency: item.currency || globalSettings.currency,
                details: {
                    ...item.details,
                    time: item.time || "09:00",
                    location: item.details?.location || `${trip.city}景點`,
                },
                createdBy: { name: "Jarvis Guide" }
            }));

            // Intelligent Merge: Combine and sort by time
            const combined = [...currentDayItems, ...enriched];
            combined.sort((a, b) => {
                const timeA = a.details?.time || a.time || "00:00";
                const timeB = b.details?.time || b.time || "00:00";
                return timeA.localeCompare(timeB);
            });

            updates[`itinerary.${currentDisplayDate}`] = combined;
        }

        // 2. Handle Shopping
        if (data.shopping && data.shopping.length > 0) {
            const newShopItems = data.shopping.map(item => ({
                name: item.name,
                estPrice: item.estPrice,
                desc: item.desc || '',
                bought: false,
                aiSuggested: true,
                createdAt: Date.now(),
                createdBy: { name: user?.displayName, id: user?.uid },
                category: 'shopping'
            }));
            updates.shoppingList = arrayUnion(...newShopItems);
        }

        // 3. Handle Packing
        if (data.packing && data.packing.length > 0) {
            const newPackItems = data.packing.map(item => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name,
                category: item.category || 'misc',
                checked: false,
                aiSuggested: true,
                createdAt: Date.now(),
                createdBy: { name: user?.displayName, id: user?.uid }
            }));
            updates.packingList = arrayUnion(...newPackItems);
        }

        // 4. Handle Transport
        if (data.transport && data.transport.length > 0) {
            const newTransportItems = data.transport.map((t, idx) => ({
                id: `ai-tr-${Date.now()}-${idx}`,
                name: t.name,
                type: 'transport',
                cost: parseFloat(t.price?.replace(/[^0-9.]/g, '') || 0),
                currency: t.price?.match(/[A-Z]{3}/)?.[0] || globalSettings.currency,
                details: {
                    time: "09:00",
                    location: t.name,
                    notes: t.desc
                },
                createdBy: { name: "Jarvis Guide" }
            }));

            // Add to current day's itinerary
            const currentDayItems = trip.itinerary?.[currentDisplayDate] || [];
            updates[`itinerary.${currentDisplayDate}`] = [...currentDayItems, ...newTransportItems];

            // Also add to budget
            const newBudgetItems = newTransportItems.map(item => ({
                id: `b-${item.id}`,
                name: item.name,
                cost: item.cost,
                currency: item.currency,
                category: 'transport',
                payer: user?.displayName,
                splitType: 'group'
            }));
            updates.budget = arrayUnion(...newBudgetItems);
        }

        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, { ...updates, lastUpdate: serverTimestamp() });
            setConfirmConfig({
                title: "Jarvis 加入成功",
                message: `已成功加入 ${Object.values(updates).length} 個類別的項目！`,
                type: "info"
            });
        }
    };

    const sectionDataMap = {
        itinerary: itineraryItems,
        shopping: trip.shoppingList || [],
        budget: trip.budget || []
    };

    const openSectionModal = (mode, section) => {
        const data = mode === 'export' ? JSON.stringify(sectionDataMap[section] || [], null, 2) : "";
        setSectionModalConfig({ mode, section, data });
    };

    const closeSectionModal = () => setSectionModalConfig(null);



    const handleSectionImport = async (section, raw) => {
        if (isSimulation) return alert("模擬模式");
        try {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            if (!items.length) return alert("資料為空");
            const docRef = doc(db, "trips", trip.id);
            if (section === 'itinerary') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Imported ${idx + 1}`,
                    type: item.type || 'spot',
                    cost: Number(item.cost) || 0,
                    currency: item.currency || globalSettings.currency,
                    details: item.details || {},
                    createdBy: { name: user?.displayName, id: user?.uid }
                }));
                await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: arrayUnion(...normalized), lastUpdate: serverTimestamp() });
            } else if (section === 'shopping') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Item ${idx + 1}`,
                    estPrice: Number(item.estPrice) || 0,
                    bought: Boolean(item.bought),
                    note: item.note || ''
                }));
                await updateDoc(docRef, { shoppingList: arrayUnion(...normalized), lastUpdate: serverTimestamp() });
            } else if (section === 'budget') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Budget ${idx + 1}`,
                    cost: Number(item.cost) || 0,
                    currency: item.currency || globalSettings.currency,
                    category: item.category || 'misc',
                    payer: item.payer || user?.displayName,
                    splitType: item.splitType || 'group'
                }));
                await updateDoc(docRef, { budget: arrayUnion(...normalized), lastUpdate: serverTimestamp() });
            }
            alert("匯入成功");
        } catch (err) {
            alert("匯入失敗：請確認 JSON 格式");
        } finally {
            closeSectionModal();
        }
    };

    const handleAddTransportSuggestion = async (date, suggestion, indexAfter) => {
        if (!canEdit) return;
        if (isSimulation) return alert("模擬模式僅供預覽");

        try {
            const docRef = doc(db, "trips", trip.id);
            const items = trip.itinerary?.[date] || [];

            const newItem = {
                id: `it-trans-${Date.now()}`,
                name: suggestion.name,
                type: 'transport',
                time: suggestion.time || "",
                cost: 0,
                currency: 'JPY',
                details: {
                    location: suggestion.name,
                    desc: suggestion.steps?.join(' → ') || suggestion.duration,
                    insight: `Jarvis 建議路線：${suggestion.duration}`,
                    transportType: suggestion.mode
                },
                smartTag: "🚀 Jarvis 建議"
            };

            const newItems = [...items];
            newItems.splice(indexAfter + 1, 0, newItem);

            await updateDoc(docRef, { [`itinerary.${date}`]: newItems, lastUpdate: serverTimestamp() });
        } catch (err) {
            console.error("Add transport suggestion error:", err);
            alert("加入失敗：" + err.message);
        }
    };

    const handleExportPdf = async () => {
        try {
            await exportToBeautifulPDF(trip);
        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("匯出 PDF 失敗，請重試");
        }
    };



    const handleReceiptUpload = (section, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setReceiptPreview(prev => ({ ...prev, [section]: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // V1.9.8: Handle File Update (e.g. Toggle Public)
    const handleUpdateFile = async (originalFile, updates) => {
        try {
            const currentFiles = trip.files || [];
            // Find file by ID if possible, otherwise by URL (older files might not have ID)
            const fileIndex = currentFiles.findIndex(f => (f.id && f.id === originalFile.id) || f.url === originalFile.url);

            if (fileIndex === -1) return;

            const updatedFiles = [...currentFiles];
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], ...updates };

            await updateDoc(doc(db, "trips", trip.id), { files: updatedFiles });
        } catch (error) {
            console.error("Update file failed:", error);
            alert("更新檔案失敗");
        }
    };

    return (
        <>
            <SEO
                title={trip.name}
                description={`Trip to ${trip.city || trip.country} - ${trip.startDate ? formatDate(trip.startDate) : ''}`}
                image={currentHeaderImage}
            />
            <div id="trip-detail-content" className="pb-36 md:pb-20">
                {/* Unified Hero Header (V1.9.7 New Design) */}
                <div className="relative h-[50vh] w-full group overflow-hidden bg-gray-900 border-b border-white/10">
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                        style={{ backgroundImage: `url(${currentHeaderImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-20" />

                    {/* Top Bar Actions */}
                    <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start z-50">
                        {/* Back Button */}
                        <div className="flex gap-2">
                            <button onClick={onBack} className="p-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all border border-white/10 hover:border-white/30 active:scale-95 group/back">
                                <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        {/* Right Actions: Undo/Redo, Settings */}
                        <div className="flex items-center gap-2">
                            {/* Undo/Redo (Only if owner) */}
                            {/* Undo/Redo (Only if owner) */}
                            {isOwner && (
                                <div className="hidden sm:flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10 mr-2 shadow-lg">
                                    <button
                                        onClick={undoHistory}
                                        disabled={!canUndo}
                                        className={`p-2 rounded-full transition-colors ${!canUndo ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20 active:scale-95'}`}
                                        title="Undo (Ctrl+Z)"
                                    >
                                        <Undo className="w-4 h-4" />
                                    </button>
                                    <div className="w-[1px] h-4 bg-white/10"></div>
                                    <button
                                        onClick={redoHistory}
                                        disabled={!canRedo}
                                        className={`p-2 rounded-full transition-colors ${!canRedo ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20 active:scale-95'}`}
                                        title="Redo (Ctrl+Y)"
                                    >
                                        <Redo className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Settings Menu */}
                            <div className="relative">
                                {isOwner && (
                                    <button
                                        onClick={() => window.open(`/trip/public/${trip.id}?view=preview`, '_blank')}
                                        className="group relative p-2.5 rounded-full backdrop-blur-md bg-white/10 border border-white/10 hover:bg-white/20 text-white transition-all shadow-lg hidden sm:flex items-center justify-center"
                                    >
                                        <Globe2 className="w-5 h-5 group-hover:scale-110 transition-transform" />

                                        {/* CSS Mini-Menu Reminder / Tooltip */}
                                        <div className="absolute top-full right-0 mt-2 w-32 px-3 py-2 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl skew-x-0 origin-top-right transform scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-0.5">Preview</div>
                                            <div className="text-xs text-white text-center font-medium">預覽公開頁面</div>
                                        </div>
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsManageMenuOpen(!isManageMenuOpen); setIsPlanMenuOpen(false); }}
                                    className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all border shadow-lg ${isManageMenuOpen ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/20 border-white/10 hover:bg-black/40'}`}
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                                {/* Dropdown Reused Logic */}
                                {isManageMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsManageMenuOpen(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-top-right animate-scale-in">
                                            {isOwner && (
                                                <>
                                                    <button onClick={() => { setIsMemberModalOpen(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                        <Users className="w-4 h-4 text-blue-400" /> {t('trip.actions.manage_members', '成員管理')}
                                                    </button>
                                                    <button onClick={() => { setIsInviteModal(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                        <UserPlus className="w-4 h-4 text-green-400" /> {t('trip.actions.invite_friends', '邀請朋友')}
                                                    </button>

                                                    <button onClick={() => { setIsTripSettingsOpen(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                        <Settings className="w-4 h-4 text-gray-400" /> {t('trip.settings.title', '行程設定')}
                                                    </button>
                                                    <button onClick={() => { handleDeleteTrip(); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                                                        <Trash2 className="w-4 h-4" /> {t('trip.actions.delete_trip', '刪除行程')}
                                                    </button>
                                                </>
                                            )}
                                            {!isOwner && <div className="px-4 py-3 text-xs opacity-50 text-center text-gray-400">{t('trip.actions.owner_only') || '僅擁有者可操作'}</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 z-40 flex flex-col md:flex-row justify-between items-end gap-6 animate-slide-up-fade">
                        {/* Left: Title & Info */}
                        <div className="space-y-3 max-w-2xl w-full">
                            <div className="flex items-center gap-2 mb-1">
                                {trip.isPublic && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-sm">Public</span>}
                                {!trip.isPublic && <span className="bg-white/10 text-gray-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-sm">Private</span>}

                                {/* Views Count */}
                                {(trip.views > 0 || trip.forks > 0) && (
                                    <div className="flex items-center gap-3 text-xs font-medium text-white/60 ml-2">
                                        {trip.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {trip.views}</span>}
                                        {trip.forks > 0 && <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {trip.forks}</span>}
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl leading-tight line-clamp-2">
                                {trip.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5"><MapPin className="w-4 h-4 text-indigo-400" /> {getLocalizedCityName(trip.city, trip.country, globalSettings.language) || trip.city}</div>
                                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5"><Calendar className="w-4 h-4 text-indigo-400" /> {trip.startDate ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` : 'Dates not set'}</div>

                                {/* Active Users Avatars */}
                                <div className="flex items-center gap-2 pl-2 border-l border-white/20" onClick={() => setIsMemberModalOpen(true)}>
                                    <div className="flex -space-x-3 cursor-pointer hover:scale-105 transition-transform">
                                        {trip.members?.slice(0, 4).map(m => (
                                            <div key={m.id} className="w-7 h-7 rounded-full border border-white/30 overflow-hidden ring-1 ring-black/20">
                                                <ImageWithFallback src={m.photoURL} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {(trip.members?.length || 0) > 4 && (
                                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/30 flex items-center justify-center text-[9px] text-white">+{trip.members.length - 4}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* V1.9.7: Intelligent Summary Bar (Header Integration - Responsive) */}
                            <div className="flex flex-col lg:flex-row items-center lg:gap-4 gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl ml-0 lg:ml-4 max-w-2xl w-full lg:w-auto mt-4 lg:mt-0">
                                {/* Mobile: Top Row (Weather + Time + Clothes all in one line) */}
                                <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start gap-4">
                                    {/* Weather */}
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

                                    {/* Clothes - Day/Night Split */}
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
                                            <div className="hidden sm:flex flex-col justify-center min-w-fit items-end lg:items-start">
                                                <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-0.5">TIME</span>
                                                <div className="flex items-center gap-1.5 text-white/90">
                                                    <Clock className="w-3.5 h-3.5 opacity-80" />
                                                    <span className="text-xs font-bold whitespace-nowrap">當地 {timeDiff > 0 ? `+${timeDiff}` : timeDiff}h</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Reminder (Right Side - Full width on mobile) */}
                                {dailyReminder && (
                                    <>
                                        <div className="hidden lg:block h-8 w-px bg-white/10 mx-1" />
                                        <div className="w-full lg:w-auto lg:flex-1 min-w-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                                            <div className="flex items-center justify-between lg:justify-start gap-2 mb-1 lg:mb-0.5">
                                                <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-black">DAILY INSIGHT</span>
                                            </div>
                                            <div className="flex items-start gap-2 bg-indigo-500/10 lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none">
                                                <Info className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-white/90 leading-tight line-clamp-2 font-medium text-left" title={dailyReminder}>{dailyReminder}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>

                        {/* Right: Primary Actions */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end mt-4 md:mt-0">

                            {/* Undo/Redo Group */}
                            <div className="flex items-center gap-1 px-1 bg-black/20 rounded-xl border border-white/10 backdrop-blur-md mr-2">
                                <button
                                    onClick={handleUndo}
                                    disabled={!canUndo}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${canUndo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                >
                                    <Undo className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleRedo}
                                    disabled={!canRedo}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${canRedo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                >
                                    <Redo className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Share & Export */}
                            <button
                                onClick={() => setIsSmartExportOpen(true)}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                                title={t('trip.actions.share')}
                            >
                                <Share2 className="w-4 h-4" />
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => setIsTripSettingsOpen(true)}
                                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                                    title={t('trip.actions.edit_settings')}
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}

                            {/* Daily Summary Button */}
                            <button
                                onClick={() => { setAIMode('daily-summary'); setIsAIModal(true); }}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                                title={t('trip.actions.jarvis_daily') || 'Daily Summary'}
                            >
                                <Newspaper className="w-4 h-4" />
                            </button>

                            {/* Smart Import */}
                            <button
                                onClick={onOpenSmartImport}
                                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                                title={t('trip.actions.smart_import') || 'Import'}
                            >
                                <Upload className="w-5 h-5" />
                            </button>

                            {/* Duplicate/Fork Button */}
                            <button
                                onClick={handleFork}
                                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold backdrop-blur-md border border-white/10 transition-all active:scale-95 group/fork"
                            >
                                <GitFork className="w-4 h-4 group-hover/fork:rotate-12 transition-transform" />
                                <span className="hidden sm:inline">{isOwner ? t('trip.actions.duplicate', '複製') : t('trip.actions.fork', 'Fork')}</span>
                            </button>

                            {/* Plan Trip Button (Primary) */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsPlanMenuOpen(!isPlanMenuOpen)}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black shadow-lg shadow-indigo-900/30 transition-all active:scale-95 border border-indigo-400/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="inline">{t('trip.actions.plan_trip') || '行程規劃'}</span>
                                </button>
                                {isPlanMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsPlanMenuOpen(false)}></div>
                                        <div className="absolute right-0 bottom-full mb-3 w-56 bg-white dark:bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] transform origin-bottom-right animate-scale-in p-1.5 text-left">
                                            <button onClick={() => { setAddType('spot'); setIsAddModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-xl font-medium dark:text-white text-gray-700">
                                                <Edit3 className="w-4 h-4 text-blue-500" /> {t('trip.actions.manual_add') || '手動新增'}
                                            </button>
                                            <button onClick={() => { setAIMode('full'); setIsAIModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-xl font-medium dark:text-white text-gray-700">
                                                <BrainCircuit className="w-4 h-4 text-purple-500" /> Jarvis 建議行程
                                            </button>
                                            <button onClick={() => { handleOptimizeSchedule(); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-xl font-medium dark:text-white text-gray-700">
                                                <Sparkles className="w-4 h-4 text-amber-500" /> {t('trip.actions.jarvis_optimize') || 'Jarvis 排程優化'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content (Tabs) - Wrapped manually since we removed the top wrapper */}
                <div className="max-w-7xl mx-auto px-4">
                    {/* Static Tabs Navigation - Wrapped in Container */}
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            {/* Functional Tabs (Scrollable) */}
                            <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-2 py-1 px-1" style={{ scrollbarWidth: 'none' }} data-tour="tab-nav">
                                {[
                                    { id: 'itinerary', label: t('trip.tabs.itinerary'), icon: Calendar },
                                    { id: 'packing', label: t('trip.tabs.packing'), icon: ShoppingBag },
                                    { id: 'shopping', label: t('trip.tabs.shopping'), icon: ShoppingBag },
                                    { id: 'budget', label: t('trip.tabs.budget'), icon: Wallet },
                                    { id: 'gallery', label: t('trip.tabs.gallery'), icon: Image },
                                    { id: 'currency', label: t('trip.tabs.currency'), icon: DollarSign },
                                    { id: 'footprints', label: t('trip.tabs.footprints'), icon: FootprintsIcon },
                                    { id: 'insurance', label: t('trip.tabs.insurance'), icon: Shield },
                                    { id: 'emergency', label: t('trip.tabs.emergency'), icon: Siren },
                                    { id: 'visa', label: t('trip.tabs.visa'), icon: FileCheck }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        data-tour={`${t.id}-tab`}
                                        className={`flex items-center px-4 py-2 rounded-full font-black tracking-tighter text-xs transition-all duration-300 whitespace-nowrap transform hover:scale-105 active:scale-95 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-105' : (isDarkMode ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 border border-white/5' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}
                                    >
                                        <t.icon className="w-4 h-4 mr-2" />{t.label}
                                    </button>
                                ))}

                            </div>

                        </div>
                        {/* Footprints Tab (Replaces Journal) */}
                        {
                            activeTab === 'footprints' && (
                                <FootprintsTab
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                    user={user}
                                    isOwner={isOwner}
                                    currentLang={globalSettings.language}
                                    onViewProfile={onViewProfile}
                                    viewingMember={viewingMember}
                                />
                            )
                        }

                        {/* Itinerary Tab */}
                        {
                            activeTab === 'itinerary' && (
                                <ItineraryTab
                                    trip={trip}
                                    days={days}
                                    currentDisplayDate={currentDisplayDate}
                                    setSelectDate={setSelectDate}
                                    itineraryItems={itineraryItems}
                                    destHolidays={destHolidays}
                                    homeHolidays={homeHolidays}
                                    isDarkMode={isDarkMode}
                                    dailyWeather={dailyWeather}
                                    dailyReminder={dailyReminder}
                                    timeDiff={timeDiff} // Intelligent Summary: Time badge
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    canEdit={canEdit}
                                    onAddItem={(date, type, prefillData = null) => {
                                        if (date) setSelectDate(date);
                                        setAddType(type);
                                        setEditingItem(prefillData); // Use editingItem slot for pre-fill
                                        setIsAddModal(true);
                                    }}
                                    onEditItem={(item) => {
                                        let itemToEdit = item;
                                        if (item.isVirtual && item._originalId) {
                                            // If editing a virtual item (e.g. multi-day hotel stay), find the original
                                            Object.entries(trip.itinerary || {}).some(([date, items]) => {
                                                const match = items.find(it => it.id === item._originalId);
                                                if (match) {
                                                    itemToEdit = { ...match, _index: items.indexOf(match), _currentDate: date };
                                                    return true;
                                                }
                                                return false;
                                            });
                                        }
                                        setAddType(itemToEdit.type);
                                        setEditingItem(itemToEdit);
                                        setIsAddModal(true);
                                    }}
                                    // onDragStart removed
                                    requestedItemId={requestedItemId} // Deep Link Item ID
                                    autoOpenItemId={autoOpenItemId} // Auto Open New/Edited Item
                                    onAutoOpenHandled={() => setAutoOpenItemId(null)}
                                    onItemHandled={onItemHandled}
                                    pendingItemsCache={pendingItemsCache} // Optimistic Update Cache
                                    onDragEnd={onDragEnd}
                                    onMoveItem={handleMoveItem} // V1.2.6: Kanban Cross-Day Drag
                                    openSectionModal={openSectionModal}
                                    userMapsKey={globalSettings?.userMapsKey}
                                    onOptimize={handleOptimizeSchedule}
                                    onOpenAIModal={handleOpenAIModal}
                                    onOpenSmartImport={onOpenSmartImport}
                                    onOpenSmartExport={() => setIsSmartExportOpen(true)}
                                    onClearDaily={handleClearDailyItinerary}
                                    onAddTransportSuggestion={handleAddTransportSuggestion}
                                    onUpdateLocation={async (date, locData) => {
                                        if (!canEdit) return;
                                        if (isSimulation) return alert("模擬模式");
                                        await updateDoc(doc(db, "trips", trip.id), { [`locations.${date}`]: locData });
                                    }}
                                    currentLang={currentLang}
                                    onDeleteItem={handleDeleteItineraryItem}
                                    // V1.1 Phase 7: History System
                                    onUndo={handleUndo}
                                    onRedo={handleRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            )
                        }

                        {
                            activeTab === 'insurance' && (
                                <InsuranceTab
                                    isDarkMode={isDarkMode}
                                    countryInfo={countryInfo}
                                    globalSettings={globalSettings}
                                    myInsurance={myInsurance}
                                    setMyInsurance={setMyInsurance}
                                    onSaveInsurance={handleSaveInsurance}
                                    insuranceSuggestions={INSURANCE_SUGGESTIONS}
                                    insuranceResources={INSURANCE_RESOURCES}
                                    inputClasses={inputClasses}
                                    buttonPrimary={buttonPrimary}
                                    glassCard={glassCard}
                                    isSimulation={isSimulation}
                                />
                            )
                        }

                        {
                            activeTab === 'visa' && (
                                <VisaTab
                                    trip={trip}
                                    user={user}
                                    isDarkMode={isDarkMode}
                                    isSimulation={isSimulation}
                                    countryInfo={countryInfo}
                                    displayCountry={displayCountry}
                                    displayCity={displayCity}
                                    visaForm={visaForm}
                                    setVisaForm={setVisaForm}
                                    onSaveVisa={handleSaveVisa}
                                    inputClasses={inputClasses}
                                    glassCard={glassCard}
                                />
                            )
                        }

                        {
                            activeTab === 'emergency' && (
                                <EmergencyTab
                                    isDarkMode={isDarkMode}
                                    countryInfo={countryInfo}
                                    globalSettings={globalSettings}
                                    emergencyInfoTitle={emergencyInfoTitle}
                                    emergencyInfoContent={emergencyInfoContent}
                                    glassCard={glassCard}
                                    trip={trip}
                                />
                            )
                        }

                        {
                            activeTab === 'budget' && (
                                <BudgetTab
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                    debtInfo={debtInfo}
                                    onOpenSectionModal={openSectionModal}
                                    onExportPdf={handleExportPdf}
                                    handleReceiptUpload={handleReceiptUpload}
                                    glassCard={glassCard}
                                    onOpenSmartImport={onOpenSmartImport}
                                    onOpenSmartExport={() => setIsSmartExportOpen(true)}
                                    onAddItem={() => { setAddType('expense'); setIsAddModal(true); }}
                                />
                            )
                        }

                        {
                            activeTab === 'currency' && (
                                <CurrencyTab
                                    isDarkMode={isDarkMode}
                                    globalSettings={globalSettings}
                                    exchangeRates={exchangeRates}
                                    convAmount={convAmount}
                                    setConvAmount={setConvAmount}
                                    convTo={convTo}
                                    setConvTo={setConvTo}
                                    currencies={CURRENCIES}
                                    glassCard={glassCard}
                                    budget={trip.budget || []}
                                    shoppingList={trip.shoppingList || []}
                                />
                            )
                        }



                        {
                            activeTab === 'gallery' && (
                                <GalleryTab
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                    user={user}
                                    isOwner={isOwner}
                                    onUpdateFile={handleUpdateFile} // Make sure this function exists or is created
                                />
                            )
                        }

                        {
                            activeTab === 'packing' && (
                                <PackingTab
                                    trip={trip}
                                    user={user}
                                    isDarkMode={isDarkMode}
                                    onAddItem={() => { setAddType('packing'); setIsAddModal(true); }}
                                    onToggleItem={handlePackingToggle}
                                    onDeleteItem={handlePackingDelete}
                                    onGenerateList={handleGeneratePackingList}
                                    onClearList={handleClearPackingList}
                                    glassCard={glassCard}
                                />
                            )
                        }

                        {
                            activeTab === 'shopping' && (
                                <ShoppingTab
                                    trip={trip}
                                    user={user}
                                    isDarkMode={isDarkMode}
                                    onOpenSectionModal={openSectionModal}
                                    onOpenAIModal={(mode) => { setAIMode(mode); setIsAIModal(true); }}
                                    onAddItem={(type) => { setAddType(type); setIsAddModal(true); }}
                                    handleReceiptUpload={handleReceiptUpload}
                                    receiptPreview={receiptPreview}
                                    glassCard={glassCard}
                                    onOpenSmartImport={onOpenSmartImport}
                                    onOpenSmartExport={() => setIsSmartExportOpen(true)}
                                />
                            )
                        }


                        <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} onDelete={handleDeleteItineraryItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user?.uid || 'guest', name: user?.displayName || 'Guest' }]} trip={trip} homeCountry={globalSettings?.countryCode || 'HK'} />
                        <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
                        <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
                        <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />

                        <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} mode={aiMode} userPreferences={globalSettings.preferences} trip={trip} weatherData={weatherData} targetDate={selectDate} user={user} homeCountry={globalSettings?.countryCode || 'HK'} />

                        <TripExportImportModal
                            isOpen={Boolean(sectionModalConfig)}
                            onClose={closeSectionModal}
                            mode={sectionModalConfig?.mode}
                            sourceType="section"
                            section={sectionModalConfig?.section}
                            data={sectionModalConfig?.data}
                            onImport={(text) => sectionModalConfig?.mode === 'import' && handleSectionImport(sectionModalConfig.section, text)}
                            isDarkMode={isDarkMode}
                            trip={trip}
                        />
                        {
                            isSmartExportOpen && (
                                <SmartExportModal
                                    isOpen={isSmartExportOpen}
                                    onClose={() => setIsSmartExportOpen(false)}
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                />
                            )
                        }
                        {
                            confirmConfig && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in bg-black/40">
                                    <div className={`w-full max-w-sm rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} p-6 overflow-hidden relative`}>
                                        <div className={`absolute top-0 left-0 w-full h-1 ${confirmConfig.type === 'warning' ? 'bg-amber-500' : (confirmConfig.type === 'error' ? 'bg-red-500' : 'bg-indigo-500')}`}></div>
                                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            {confirmConfig.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                            {confirmConfig.type === 'error' && <X className="w-5 h-5 text-red-500" />}
                                            {confirmConfig.title}
                                        </h4>
                                        <p className="text-sm opacity-70 mb-6 whitespace-pre-wrap leading-relaxed">{confirmConfig.message}</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmConfig(null)}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                取消
                                            </button>
                                            {confirmConfig.onConfirm && (
                                                <button
                                                    onClick={confirmConfig.onConfirm}
                                                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg ${confirmConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20'}`}
                                                >
                                                    確定
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        <UserProfileModal
                            isOpen={!!viewingMember}
                            onClose={() => setViewingMember(null)}
                            user={viewingMember}
                            isAdmin={isAdmin}
                            isDarkMode={isDarkMode}
                            currentUser={user}
                            trips={trip ? [trip] : []} // Pass current trip as context
                        />


                    </div>
                </div>
            </div>
            {/* Mobile Bottom Nav System (Moved Outside Main Content for Fixed Positioning Reliability) */}
            <MobileBottomNav
                activeTab={activeTab === 'shopping' || activeTab === 'packing' || activeTab === 'budget' || activeTab === 'itinerary' ? activeTab : 'more'}
                onTabChange={(tab) => { setActiveTab(tab); setIsMobileMoreOpen(false); }}
                onMoreClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                onChatClick={() => onOpenChat && onOpenChat()}
                isDarkMode={isDarkMode}
                currentView="detail"
                onSearch={onOpenCommandPalette}
            />

            {/* Mobile More Menu Overlay - V2.0 Premium Glassmorphic Sheet */}
            {
                isMobileMoreOpen && (
                    <div
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
                        onClick={() => setIsMobileMoreOpen(false)}
                    >
                        <div
                            className={`fixed bottom-[88px] left-4 right-4 ${isDarkMode ? 'bg-slate-900/90 border-white/5' : 'bg-white/90 border-white/20'} border backdrop-blur-3xl rounded-[32px] p-6 shadow-2xl animate-slide-up ring-1 ring-black/20 shadow-black/60`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pl-2">
                                <span className="text-sm font-black tracking-wide opacity-80 uppercase">More Features</span>
                                <div className="w-10 h-1 bg-gray-300/30 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                            </div>

                            {/* Premium Grid Layout */}
                            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                                {[
                                    { id: 'itinerary', label: t('trip.tabs.itinerary'), icon: Calendar, bg: 'bg-indigo-500/20', color: 'text-indigo-400' },
                                    { id: 'budget', label: t('trip.tabs.budget'), icon: Wallet, bg: 'bg-emerald-500/20', color: 'text-emerald-400' },
                                    { id: 'gallery', label: t('trip.tabs.gallery'), icon: Image, bg: 'bg-purple-500/20', color: 'text-purple-400' },
                                    { id: 'shopping', label: t('trip.tabs.shopping'), icon: ShoppingBag, bg: 'bg-pink-500/20', color: 'text-pink-400' },
                                    { id: 'currency', label: t('trip.tabs.currency'), icon: DollarSign, bg: 'bg-amber-500/20', color: 'text-amber-400' },
                                    { id: 'footprints', label: t('trip.tabs.footprints'), icon: FootprintsIcon, bg: 'bg-orange-500/20', color: 'text-orange-400' },
                                    { id: 'packing', label: t('trip.tabs.packing'), icon: ShoppingBag, bg: 'bg-blue-500/20', color: 'text-blue-400' },
                                    { id: 'insurance', label: t('trip.tabs.insurance'), icon: Shield, bg: 'bg-teal-500/20', color: 'text-teal-400' },
                                    { id: 'emergency', label: t('trip.tabs.emergency'), icon: Siren, bg: 'bg-red-500/20', color: 'text-red-400' },
                                    { id: 'visa', label: t('trip.tabs.visa'), icon: FileCheck, bg: 'bg-cyan-500/20', color: 'text-cyan-400' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setActiveTab(t.id); setIsMobileMoreOpen(false); }}
                                        className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
                                    >
                                        <div className={`p-3.5 rounded-2xl ${t.bg} ${t.color} shadow-sm group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                                            <t.icon className="w-6 h-6 stroke-[2px]" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} group-hover:text-indigo-500 transition-colors`}>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default TripDetailContent;
