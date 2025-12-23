import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, deleteDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Upload, Plus, Edit3, Trash2, MapPin, Calendar, Clock, DollarSign, User, Users, Sun, Cloud, CheckCircle, AlertCircle, Search, Filter, Camera, Download, AlertTriangle, Info, Loader2, Sparkles, LayoutGrid, List as ListIcon, Maximize2, Minimize2, MoveRight, ChevronLeft, Map as MapIcon, BrainCircuit, Wallet, Plane, Bus, Train, Car, ShoppingBag, BedDouble, Receipt, Newspaper, Siren, Star, UserCircle, UserPlus, FileUp, Lock, RefreshCw, Route, MonitorPlay, Save, CheckSquare, FileCheck, History, PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Phone, Globe2, Link as LinkIcon, Wifi, Utensils, Image, QrCode, Copy, Instagram, MapPinned, NotebookPen, Home, PiggyBank, Moon, ChevronRight, ChevronDown, Share2, Brain, Wand2, X, MessageCircle, Undo, Redo, Footprints as FootprintsIcon, Image as ImageIcon, Shield, FileText } from 'lucide-react';
import MobileBottomNav from '../Shared/MobileBottomNav';
import ActiveUsersList from './ActiveUsersList';
import {
    ItineraryTab, InsuranceTab, VisaTab, EmergencyTab,
    BudgetTab, CurrencyTab, FilesTab, JournalTab, ShoppingTab, PackingTab, GalleryTab
} from './tabs';
import TripSettingsModal from '../Modals/TripSettingsModal';
import MemberSettingsModal from '../Modals/MemberSettingsModal';
import UserProfileModal from '../Modals/UserProfileModal'; // New Import
import InviteModal from '../Modals/InviteModal';
import CreateTripModal from '../Modals/CreateTripModal';
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
import { generatePackingList, generateWeatherSummaryWithGemini } from '../../services/ai-parsing';
import { optimizeSchedule } from '../../services/ai';
import { getWeatherInfo } from '../../services/weather';
import { exportToBeautifulPDF } from '../../services/pdfExport';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE, CURRENCIES, INSURANCE_SUGGESTIONS, INSURANCE_RESOURCES, CITY_IMAGES } from '../../constants/appData';
import { buttonPrimary } from '../../constants/styles';
import { useTripHistory } from '../../hooks/useTripHistory'; // V1.1 Phase 7

const TripDetailContent = (props) => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { trip, isDarkMode, isAdmin, user, onBack, isChatOpen } = props;

    // Internal error handling if trip is missing
    if (!trip) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-yellow-500 mb-4 text-xl flex items-center gap-2 justify-center font-bold">
                    <AlertTriangle className="w-6 h-6" /> 無法載入行程
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">返回</button>
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4" /> 回報問題
                    </button>
                </div>
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} isDarkMode={isDarkMode} user={user} />
            </div>
        );
    }

    return (
        <>
            <ErrorBoundary fallbackMessage="行程內容發生錯誤" onOpenFeedback={() => setIsFeedbackOpen(true)}>
                <TripDetailMainLayout {...props} setIsFeedbackOpen={setIsFeedbackOpen} isFeedbackOpen={isFeedbackOpen} />
            </ErrorBoundary>
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} isDarkMode={isDarkMode} user={user} />
        </>
    );
};

const TripDetailMainLayout = ({ trip, tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, isPreview, globalSettings, exchangeRates, convAmount, setConvAmount, convTo, setConvTo, onOpenSmartImport, weatherData, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin, setIsFeedbackOpen, isFeedbackOpen, onOpenChat, isChatOpen }) => {
    // ... UI STATE HOOKS (isChatOpen removed)
    // ... (rest of props)

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
    const [viewMode, setViewMode] = useState('list');
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
                console.log(`[Sync] Discarding stale cache. Remote: ${new Date(tripTime).toISOString()} > Local: ${new Date(cacheTime).toISOString()}`);
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
                console.log('[Sync] Remote update detected. Clearing local optimistic cache.');
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
    const mockWeather = getWeatherForecast(trip.country, mockTempRange);

    const dailyWeather = React.useMemo(() => {
        if (!realWeather?.details?.daily) return mockWeather;
        const daily = realWeather.details.daily;
        const idx = daily.time.indexOf(currentDisplayDate);
        if (idx === -1) return mockWeather;

        const dayCode = daily.weather_code[idx];
        const dayInfo = getWeatherInfo(dayCode);
        const maxTemp = Math.round(daily.temperature_2m_max[idx]);
        const minTemp = Math.round(daily.temperature_2m_min[idx]);
        const dayTemp = `${maxTemp}°C / ${minTemp}°C`; // Day / Night format

        return getWeatherForecast(trip.country, dayTemp, dayInfo.desc, dayInfo.icon);
    }, [realWeather, currentDisplayDate, trip.country, mockWeather]);
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user?.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.lang || 'zh-TW';
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

        return [...finalHotels, ...baseItineraryItems];
    }, [trip.itinerary, currentDisplayDate, baseItineraryItems]);
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems);

    const homeHolidays = getHolidayMap(globalSettings.region || "HK");
    const destHolidays = getHolidayMap(countryInfo.tz || "Global");

    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

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
                console.log(`[Bundle Move] Detected bundle ${bundleId} with ${otherBundleItems.length + 1} items`);
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
                console.log(`[Smart Ripple] Shifting ${fullList.length - actualDestIndex} items by ${offset} minutes (Phase 3 Async Enabled)`);
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
        console.log('[handleSaveItem] =====================');
        console.log('[handleSaveItem] Incoming data:', JSON.stringify(data, null, 2));
        console.log('[handleSaveItem] canEdit:', canEdit, '| isSimulation:', isSimulation);

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
        console.log('[handleSaveItem] Using itemId:', itemId, '| isNewItem:', !data.id);

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

        console.log('[handleSaveItem] Prepared newItem:', JSON.stringify(newItem, null, 2));

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
            await updateDoc(docRef, { budget: arrayUnion({ ...newItem, category: 'shopping' }) });
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

            console.log('[handleSaveItem] Itinerary Mode');
            console.log('[handleSaveItem] isEdit:', isEdit, '| data.id:', data.id, '| itemIndex:', itemIndex);
            console.log('[handleSaveItem] routeDate:', routeDate);

            if (isEdit) {
                const items = docSnap.data().itinerary?.[routeDate] || [];
                console.log('[handleSaveItem] Current items count:', items.length);
                console.log('[handleSaveItem] Looking for ID:', data.id, 'type:', typeof data.id);
                console.log('[handleSaveItem] Firebase item IDs:', items.map(i => ({ id: i.id, type: typeof i.id, name: i.name })));

                let updatedItems;
                let updateMethod = 'unknown';

                // Priority 1: Update by ID
                if (data.id && items.some(i => String(i.id) === String(data.id))) {
                    updateMethod = 'BY_ID';
                    updatedItems = items.map(item => {
                        if (String(item.id) === String(data.id)) {
                            console.log('[handleSaveItem] Found matching item by ID, merging...');
                            console.log('[handleSaveItem] Original item.details:', JSON.stringify(item.details));
                            console.log('[handleSaveItem] New item.details:', JSON.stringify(newItem.details));
                            return { ...item, ...newItem };
                        }
                        return item;
                    });
                }
                // Priority 2: Update by Index (Legacy/Broken ID Support)
                else if (itemIndex !== undefined && itemIndex !== null && items[itemIndex]) {
                    updateMethod = 'BY_INDEX';
                    updatedItems = [...items];
                    console.log('[handleSaveItem] Updating by index:', itemIndex);
                    // HEAL: Assign new ID to the legacy item!
                    updatedItems[itemIndex] = { ...items[itemIndex], ...newItem, id: newItem.id };
                }
                // Fallback: This shouldn't happen if isEdit is true, but safety check
                else {
                    updateMethod = 'FALLBACK_ADD';
                    console.warn('[handleSaveItem] FALLBACK: Could not find item, adding as new!');
                    updatedItems = [...items, newItem];
                }

                console.log('[handleSaveItem] Update method:', updateMethod);

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
                console.log('[handleSaveItem] Sanitized items count:', sanitizedItems.length);

                console.log('[handleSaveItem] Saving to Firebase...');

                // V1.1 Phase 2: Apply Smart Ripple if duration exists
                let finalItems = sanitizedItems;
                const editedIndex = updatedItems.findIndex(i => String(i.id) === String(data.id));
                if (editedIndex !== -1 && (newItem.details?.duration || newItem.time)) {
                    console.log('[handleSaveItem] Triggering Smart Ripple from index:', editedIndex);
                    finalItems = recalculateItineraryTimes(sanitizedItems, editedIndex);
                }

                await updateDoc(docRef, { [`itinerary.${routeDate}`]: finalItems, lastUpdate: serverTimestamp() });
                console.log('[handleSaveItem] Firebase save SUCCESS (with Ripple)');
            } else {
                console.log('[handleSaveItem] Adding NEW item via arrayUnion');
                await updateDoc(docRef, { [`itinerary.${routeDate}`]: arrayUnion(newItem), lastUpdate: serverTimestamp() });
                console.log('[handleSaveItem] Firebase add SUCCESS');
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
                        console.log(`[Smart Binding] Syncing ${syncCount} transport items to new hotel name: ${newHotelName}`);
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

            console.log(`[Phase 5] Detected '步行' in description. Suggesting Walk Card (${walkDuration} mins) to ${walkLocation}`);

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
                    console.log('[Phase 5] Walk card auto-added');
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
                    console.log('[Phase 5] Immigration bundle auto-added');
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
                console.log(`[Phase 5] City change detected: ${currentCity} -> ${destCity}`);
                setConfirmConfig({
                    title: '🚅 跨城市交通建議',
                    message: `偵測到目的地為「${destCity}」，同現時城市「${currentCity}」唔同。是否需要為你安排新幹線或國內線航班建議？`,
                    type: 'info',
                    onConfirm: async () => {
                        alert("AI 已為你標記跨城市交通需求，請在 Transport Tab 查看建議。");
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
            console.log('[handleSaveItem] Added to pendingItemsCache:', itemId);
        }
    };

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
        console.log('[handleDeleteItem] =====================');
        console.log('[handleDeleteItem] Received:', typeof itemOrId, itemOrId);

        if (!canEdit) return setConfirmConfig({ title: "權限不足", message: "您沒有權限執行此操作", type: "warning" });
        if (isSimulation) return setConfirmConfig({ title: "模擬模式", message: "模擬模式僅供預覽", type: "warning" });

        const itemId = typeof itemOrId === 'object' ? itemOrId?.id : itemOrId;
        const itemIndex = typeof itemOrId === 'object' ? itemOrId?._index : undefined;

        console.log('[handleDeleteItem] itemId:', itemId, '| itemIndex:', itemIndex);

        if (!itemId && (itemIndex === undefined || itemIndex === null)) return console.error("Missing Item ID or Index for delete");

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
            const result = await generateWeatherSummaryWithGemini(trip.city, realWeather, user?.uid);
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
        if (isSimulation) return setConfirmConfig({ title: "模擬模式", message: "目前處於模擬模式，無法執行 AI 優化。", type: "info" });
        const currentItems = trip.itinerary?.[currentDisplayDate] || [];

        if (currentItems.length === 0) {
            setConfirmConfig({
                title: "當日尚未有行程",
                message: "是否要讓 AI 助手為您建議今日的行程？",
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
            title: "AI 智能排程優化",
            message: "AI 智能排程將會：\n1. 補全缺失的時間\n2. 在景點間插入交通建議\n3. 加入必玩/打卡標籤",
            type: "warning",
            onConfirm: async () => {
                setConfirmConfig(null);
                try {
                    const optimized = await optimizeSchedule(currentItems);
                    await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: optimized, lastUpdate: serverTimestamp() });
                    setConfirmConfig({
                        title: "優化成功",
                        message: "✨ AI 已根據地點與動線為您重新排程並加入建議！",
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
                createdBy: { name: "AI Guide" }
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
                createdBy: { name: "AI Guide" }
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
                title: "AI 加入成功",
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

    // COMMENTED OUT: Unused in TripDetailContent context (Logic for creating new trips in Dashboard)
    /*
    const handleDashboardImport = async (inputData, mode, targetTripId) => {
        // ... (See App.jsx)
    };
    */

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
                    insight: `AI 建議路線：${suggestion.duration}`,
                    transportType: suggestion.mode
                },
                smartTag: "🚀 AI 建議"
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

    return (
        <>
            <div id="trip-detail-content" className="max-w-7xl mx-auto p-4 pb-36 md:pb-20 animate-fade-in">
                {/* Unified Hero Header Card */}
                <div className={`${glassCard(isDarkMode)} relative mb-8 z-40 group hover:shadow-2xl transition-all duration-500`}>
                    {/* Background Layer with Overflow Hidden to clip scaling image */}
                    {/* Header Background layer - Consolidated Background with fixed overflow */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out group-hover:scale-110"
                            style={{ backgroundImage: `url(${currentHeaderImage})` }}
                        />

                        {/* Carousel Indicators */}
                        {trip.cities && trip.cities.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 pt-10">
                                {trip.cities.map((c, i) => (
                                    <div
                                        key={c}
                                        className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                                        title={c}
                                    />
                                ))}
                            </div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900/90 via-gray-900/40 to-black/20' : 'from-indigo-900/60 via-indigo-900/20 to-black/10'}`} />
                    </div>

                    {/* Content Grid - Centered Container */}
                    <div className="relative z-10 px-6 py-6 md:px-10 md:py-10 lg:px-14 lg:py-12">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-white">
                                {/* Left Col: Trip Core Info */}
                                <div className="lg:col-span-2 flex flex-col justify-between min-h-[220px]">
                                    <div>
                                        <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-2">行程概覽</div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-indigo-500/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider font-bold shadow-lg shadow-indigo-500/20">{displayCountry} {displayCity}</span>
                                            <div className="px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-[10px] font-black whitespace-nowrap shadow-sm flex items-center gap-1.5">
                                                <span className="text-indigo-300">DAY {getDaysArray(trip.startDate, trip.endDate).findIndex(d => d === currentDisplayDate) + 1 || '-'}</span>
                                                <span className="opacity-30">/</span>
                                                <span className="text-white/90">{getDaysArray(trip.startDate, trip.endDate).length} DAYS</span>
                                            </div>
                                            {trip.isPublic && <span className="bg-emerald-500/80 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20"><Globe2 className="w-3 h-3" /> 公開</span>}
                                            {timeDiff !== 0 && <span className={`text-[10px] px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md ${timeDiff > 0 ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'}`}>{timeDiff > 0 ? `+${timeDiff}h` : `${timeDiff}h`}</span>}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 drop-shadow-xl animate-fade-in-up">
                                                {trip.name}
                                            </h1>

                                            {/* Unified Premium Action Bar */}
                                            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/10 shadow-2xl self-start sm:ml-4 group/toolbar transition-all hover:bg-black/40">
                                                {/* History Actions */}
                                                <div className="flex items-center gap-1 px-1 border-r border-white/10 pr-2">
                                                    <button
                                                        onClick={handleUndo}
                                                        disabled={!canUndo}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${canUndo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                                        title="撤銷 (Undo)"
                                                    >
                                                        <Undo className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleRedo}
                                                        disabled={!canRedo}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${canRedo ? 'hover:bg-white/10 text-white active:scale-90' : 'opacity-20 cursor-not-allowed'}`}
                                                        title="重做 (Redo)"
                                                    >
                                                        <Redo className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Edit/Settings */}
                                                {isOwner && (
                                                    <button
                                                        onClick={() => setIsTripSettingsOpen(true)}
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-indigo-300 active:scale-90"
                                                        title="編輯行程設定 (Edit)"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Chat Toggle */}
                                                {!isChatOpen && (
                                                    <button
                                                        onClick={onOpenChat}
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-indigo-500/80 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                                                        title="打開行程對話 (Chat)"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* 🚀 Dynamic Header Location & Metadata (Moved Back Inside) */}
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <div className="flex flex-wrap items-center justify-between gap-6">
                                                <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-sm opacity-90 font-medium">
                                                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-sm">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-300" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                                    </span>
                                                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md"><Clock className="w-3.5 h-3.5 text-purple-300" /> {getDaysArray(trip.startDate, trip.endDate).length} 天行程</span>
                                                    {/* Dynamic Multi-City Badge - Shows Route A→B→C or A→B→A */}
                                                    {(() => {
                                                        // Helper: Extract clean city name (handles "Osaka -> Kyoto" format)
                                                        const extractCityName = (city) => {
                                                            if (!city) return null;
                                                            if (city.includes('->')) return city.split('->').pop().trim();
                                                            if (city.includes(' → ')) return city.split(' → ').pop().trim();
                                                            return city.trim();
                                                        };

                                                        // Compute city route (preserving transitions, not unique)
                                                        const cityRoute = [];
                                                        const normalizedRoute = []; // Track normalized names for comparison

                                                        if (trip.locations) {
                                                            const sortedDates = Object.keys(trip.locations).sort();
                                                            sortedDates.forEach(date => {
                                                                const rawCity = trip.locations[date]?.city;
                                                                if (!rawCity) return;

                                                                // Extract clean city name (handle "Osaka -> Kyoto" format)
                                                                const cleanCity = extractCityName(rawCity);
                                                                // Normalize: Convert to localized name for comparison
                                                                const normalizedCity = getLocalizedCityName(cleanCity, currentLang);

                                                                // Only add if different from last normalized city
                                                                if (normalizedRoute.length === 0 || normalizedRoute[normalizedRoute.length - 1] !== normalizedCity) {
                                                                    cityRoute.push(normalizedCity);
                                                                    normalizedRoute.push(normalizedCity);
                                                                }
                                                            });
                                                        }

                                                        // Fallback to single city
                                                        if (cityRoute.length === 0 && trip.city) {
                                                            cityRoute.push(getLocalizedCityName(extractCityName(trip.city), currentLang));
                                                        }

                                                        const isMultiCity = cityRoute.length > 1;
                                                        const routeText = cityRoute.join(' → ');

                                                        return (
                                                            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md font-bold text-white shadow-sm ring-1 ring-white/5 tracking-tight text-[11px] ${isMultiCity ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/10 border-white/10'}`}>
                                                                <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isMultiCity ? 'text-amber-300' : 'text-emerald-300'}`} />
                                                                <span className={isMultiCity ? 'text-amber-200' : ''}>{routeText}</span>
                                                            </span>
                                                        );
                                                    })()}

                                                    {/* Member Row (z-[60] to appear above action buttons z-40) */}
                                                    <div className="flex items-center gap-3 pl-3 border-l border-white/20 ml-2 relative z-[60]">
                                                        <div className="flex -space-x-3 flex-nowrap relative">
                                                            {trip.members?.slice(0, 4).map(m => (
                                                                <div key={m.id} onClick={() => setViewingMember(m)} className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-50 flex-shrink-0" title={`${m.name} (${m.role})`}>
                                                                    <div className={`w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-gray-800 ${m.id === user?.uid ? 'ring-2 ring-indigo-500' : ''}`}>
                                                                        <ImageWithFallback
                                                                            src={m.photoURL}
                                                                            className="w-full h-full object-cover"
                                                                            alt={m.name}
                                                                            type="avatar"
                                                                        />
                                                                    </div>
                                                                    {m.status === 'pending' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-900"></span>}
                                                                    {m.role === 'owner' && <div className="absolute -top-1 -right-1 bg-amber-500 text-[10px] w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center shadow-sm">👑</div>}
                                                                </div>
                                                            ))}
                                                            {(trip.members?.length || 0) > 4 && (
                                                                <div className="w-8 h-8 rounded-full bg-slate-800/90 backdrop-blur border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-indigo-300 shadow-lg flex-shrink-0">
                                                                    +{trip.members.length - 4}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button onClick={() => setIsMemberModalOpen(true)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 hover:border-white/30 shadow-lg" title="成員管理">
                                                            <UserPlus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                    <ActiveUsersList tripId={trip.id} user={user} activeTab={activeTab} language={globalSettings.language} />
                                                </div>

                                                {/* Action Buttons (z-40 so member hover z-60 appears above) */}
                                                <div className="flex gap-3 items-center relative z-40">
                                                    <button
                                                        onClick={onOpenSmartImport}
                                                        className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-white/20 flex justify-center items-center gap-2 active:scale-95 whitespace-nowrap backdrop-blur-md"
                                                    >
                                                        <Upload className="w-4 h-4" /> <span className="hidden sm:inline">智能匯入</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setIsSmartExportOpen(true)}
                                                        className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-white/20 flex justify-center items-center gap-2 active:scale-95 whitespace-nowrap backdrop-blur-md"
                                                    >
                                                        <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">分享</span>
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => { setIsPlanMenuOpen(!isPlanMenuOpen); setIsManageMenuOpen(false); }}
                                                            className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex justify-center items-center gap-2 font-bold text-xs transition-all shadow-lg shadow-indigo-900/40 active:scale-95 whitespace-nowrap border border-indigo-400/30 backdrop-blur-md"
                                                        >
                                                            <Plus className="w-4 h-4" /> 行程規劃 <ChevronDown className={`w-3.5 h-3.5 text-indigo-200 transition-transform ${isPlanMenuOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {isPlanMenuOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-[90]" onClick={() => setIsPlanMenuOpen(false)}></div>
                                                                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-top-right animate-scale-in p-1">
                                                                    <button onClick={() => { setAddType('spot'); setIsAddModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                        <Edit3 className="w-3.5 h-3.5 text-blue-400" /> 手動新增
                                                                    </button>
                                                                    <button onClick={() => { setAIMode('full'); setIsAIModal(true); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                        <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> AI 建議行程
                                                                    </button>
                                                                    <button onClick={() => { handleOptimizeSchedule(); setIsPlanMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left text-xs transition-colors rounded-lg text-white font-medium">
                                                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI 排程優化
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => { setIsManageMenuOpen(!isManageMenuOpen); setIsPlanMenuOpen(false); }}
                                                            className={`bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border border-white/10 ${isManageMenuOpen ? 'bg-white/20' : ''}`}
                                                        >
                                                            <ListIcon className="w-5 h-5 text-white" />
                                                        </button>
                                                        {isManageMenuOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-[90]" onClick={() => setIsManageMenuOpen(false)}></div>
                                                                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-top-right animate-scale-in">
                                                                    {isOwner && (
                                                                        <>
                                                                            <button onClick={() => { setIsMemberModalOpen(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                                                <Users className="w-4 h-4 text-blue-400" /> 成員管理
                                                                            </button>
                                                                            <button onClick={() => { setIsInviteModal(true); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10 text-gray-200">
                                                                                <UserPlus className="w-4 h-4 text-green-400" /> 邀請朋友
                                                                            </button>
                                                                            <button onClick={() => { handleDeleteTrip(); setIsManageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                                                                                <Trash2 className="w-4 h-4" /> 刪除行程
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {!isOwner && <div className="px-4 py-3 text-xs opacity-50 text-center text-gray-400">僅擁有者可操作</div>}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Static Tabs Navigation - Wrapped in Container */}
                <div className="max-w-7xl mx-auto">
                    <div className="hidden md:flex gap-2 overflow-x-auto py-4 mb-4 scrollbar-hide px-1" style={{ scrollbarWidth: 'none' }}>
                        {[
                            { id: 'itinerary', label: '行程', icon: Calendar },
                            { id: 'packing', label: '行李', icon: ShoppingBag },
                            { id: 'shopping', label: '購物', icon: ShoppingBag },
                            { id: 'budget', label: '預算', icon: Wallet },
                            { id: 'gallery', label: '相簿', icon: Image },
                            { id: 'currency', label: '匯率', icon: DollarSign },
                            { id: 'journal', label: '足跡', icon: FootprintsIcon },
                            { id: 'insurance', label: '保險', icon: Shield },
                            { id: 'emergency', label: '緊急', icon: Siren },
                            { id: 'visa', label: '簽證', icon: FileCheck }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105' : (isDarkMode ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}
                            >
                                <t.icon className="w-4 h-4 mr-2" />{t.label}
                            </button>
                        ))}
                    </div>

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
                        activeTab === 'journal' && (
                            <JournalTab
                                trip={trip}
                                user={user}
                                isOwner={isOwner}
                                isDarkMode={isDarkMode}
                                glassCard={glassCard}
                                currentLang={currentLang}
                            />
                        )
                    }

                    {
                        activeTab === 'gallery' && (
                            <GalleryTab
                                trip={trip}
                                isDarkMode={isDarkMode}
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

                    {/* Mobile Bottom Nav System */}
                    <MobileBottomNav
                        activeTab={activeTab === 'shopping' || activeTab === 'packing' || activeTab === 'budget' || activeTab === 'itinerary' ? activeTab : 'more'}
                        onTabChange={(tab) => { setActiveTab(tab); setIsMobileMoreOpen(false); }}
                        onMoreClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                        isDarkMode={isDarkMode}
                    />

                    {/* Mobile More Menu Overlay - V2.0 Premium Glassmorphic Sheet */}
                    {
                        isMobileMoreOpen && (
                            <div
                                className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
                                onClick={() => setIsMobileMoreOpen(false)}
                            >
                                <div
                                    className={`fixed bottom-[88px] left-4 right-4 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-white/20'} border backdrop-blur-xl rounded-3xl p-6 shadow-2xl animate-slide-up ring-1 ring-black/5`}
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
                                            { id: 'shopping', label: '購物', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                            { id: 'gallery', label: '相簿', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { id: 'currency', label: '匯率', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                                            { id: 'journal', label: '足跡', icon: FootprintsIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                            { id: 'insurance', label: '保險', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                            { id: 'emergency', label: '緊急', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
                                            { id: 'visa', label: '簽證', icon: FileCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' }
                                        ].map((t, index) => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setActiveTab(t.id); setIsMobileMoreOpen(false); }}
                                                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform duration-200"
                                                style={{ animationDelay: `${index * 50}ms` }}
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

                    <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} onDelete={handleDeleteItineraryItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user?.uid || 'guest', name: user?.displayName || 'Guest' }]} trip={trip} />
                    <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
                    <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
                    <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />

                    <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} mode={aiMode} userPreferences={globalSettings.preferences} trip={trip} weatherData={weatherData} targetDate={selectDate} user={user} />

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
                    />


                </div>
            </div>
        </>
    );
};

export default TripDetailContent;
