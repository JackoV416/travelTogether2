import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, deleteDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Calendar, Map as MapIcon, Edit3, CalendarDays, ShoppingBag, Wallet, DollarSign, FileText, Shield, Siren, FileCheck, NotebookPen, BrainCircuit, List, Users, UserPlus, Trash2, Plus, ChevronDown, Sparkles, PackageCheck, Share2, Globe, Clock, AlertTriangle, Upload, FileIcon, ArrowLeft, MoreVertical, X, Loader2, Menu, Footprints as FootprintsIcon, Image as ImageIcon, MapPin
} from 'lucide-react';
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

import {
    glassCard, getHolidayMap, getLocalizedCountryName, getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getTripSummary, calculateDebts, getTimeDiff, getWeatherForecast, buildDailyReminder,
    inputClasses
} from '../../utils/tripUtils';
import { generatePackingList, generateWeatherSummaryWithGemini } from '../../services/ai-parsing';
import { optimizeSchedule } from '../../services/ai';
import { getWeatherInfo } from '../../services/weather';
import { exportToBeautifulPDF } from '../../services/pdfExport';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE, CURRENCIES, INSURANCE_SUGGESTIONS, INSURANCE_RESOURCES, CITY_IMAGES } from '../../constants/appData';
import { buttonPrimary } from '../../constants/styles';

const TripDetailContent = ({ trip, tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, isPreview, globalSettings, exchangeRates, convAmount, setConvAmount, convTo, setConvTo, onOpenSmartImport, weatherData, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin }) => {
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
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to load pending items cache:", e);
            return {};
        }
    });

    // Sync Cache to LocalStorage whenever it changes
    useEffect(() => {
        try {
            if (Object.keys(pendingItemsCache).length > 0) {
                localStorage.setItem(`pendingItemsCache_${trip.id}`, JSON.stringify(pendingItemsCache));
            } else {
                localStorage.removeItem(`pendingItemsCache_${trip.id}`);
            }
        } catch (e) {
            console.error("Failed to save pending items cache:", e);
        }
    }, [pendingItemsCache, trip.id]);

    // ============================================
    // SYNC EFFECTS
    // ============================================

    // 🚀 Critical State Logic (Hoisted for dependencies)
    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];

    // 🚀 Restored Permission Logic (Enhanced for Email Invites)
    const myMemberEntry = trip.members?.find(m => m.id === user?.uid || m.id === user?.email);
    const myRole = isPreview ? (trip.sharePermission === 'edit' && user?.uid ? 'editor' : 'viewer') : (myMemberEntry?.role || 'viewer');
    const isOwner = !isPreview && (myRole === 'owner' || isSimulation);
    const canEdit = (myRole === 'owner' || myRole === 'editor' || isSimulation);

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
    // If no daily set, use trip.city (Header uses carousel for aesthetics, Weather should be accurate)
    const weatherCity = dailyLocation?.city || trip.city;
    const realWeather = weatherData?.[weatherCity];
    const mockWeather = getWeatherForecast(trip.country, realWeather?.temp);

    const dailyWeather = React.useMemo(() => {
        if (!realWeather?.details?.daily) return mockWeather;
        const daily = realWeather.details.daily;
        const idx = daily.time.indexOf(currentDisplayDate);
        if (idx === -1) return mockWeather;

        const dayCode = daily.weather_code[idx];
        const dayInfo = getWeatherInfo(dayCode);
        const dayTemp = `${Math.round(daily.temperature_2m_max[idx])}°C`;

        return getWeatherForecast(trip.country, dayTemp, dayInfo.desc, dayInfo.icon);
    }, [realWeather, currentDisplayDate, trip.country, mockWeather]);
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user?.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.lang || 'zh-TW';
    const displayCountry = getLocalizedCountryName(trip.country, currentLang);
    const displayCity = getLocalizedCityName(headerCity || '', currentLang);
    const itineraryItems = trip.itinerary?.[currentDisplayDate] || [];
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems);

    const homeHolidays = getHolidayMap(globalSettings.region || "HK");
    const destHolidays = getHolidayMap(countryInfo.tz || "Global");

    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

    // ============================================
    // HANDLERS
    // ============================================

    const onDragStart = (e, index) => { e.dataTransfer.setData("idx", index); };
    const onDrop = async (e, dropIndex) => {
        if (!canEdit) return;
        const dragIndex = Number(e.dataTransfer.getData("idx"));
        const list = [...(trip.itinerary?.[currentDisplayDate] || [])];
        const [reorderedItem] = list.splice(dragIndex, 1);
        list.splice(dropIndex, 0, reorderedItem);
        if (!isSimulation) await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: list });
    };

    const handleSaveItem = async (data) => {
        console.log('[handleSaveItem] =====================');
        console.log('[handleSaveItem] Incoming data:', JSON.stringify(data, null, 2));
        console.log('[handleSaveItem] canEdit:', canEdit, '| isSimulation:', isSimulation);

        if (!canEdit) return alert("權限不足");
        if (isSimulation) return alert("模擬模式");

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
                await updateDoc(docRef, { shoppingList: updatedList });
            } else {
                await updateDoc(docRef, { shoppingList: arrayUnion({ ...newItem, bought: false }) });
            }
        } else if (data.type === 'shopping' && !data.details?.startLine) { // Budget item (legacy check)
            // Budget logic usually uses arrayUnion but for editing we might need full array rewrite if we support budget editing
            // For now, assume this follows standard budget flow
            await updateDoc(docRef, { budget: arrayUnion({ ...newItem, category: 'shopping' }) });
        } else if (data.type === 'packing') {
            const currentList = docSnap.data().packingList || [];
            const exists = currentList.some(i => String(i.id) === String(itemId));

            if (exists) {
                const updatedList = currentList.map(i => String(i.id) === String(itemId) ? newItem : i);
                await updateDoc(docRef, { packingList: updatedList });
            } else {
                await updateDoc(docRef, { packingList: arrayUnion({ ...newItem, category: data.category || 'misc', checked: false }) });
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
                await updateDoc(docRef, { [`itinerary.${routeDate}`]: sanitizedItems });
                console.log('[handleSaveItem] Firebase save SUCCESS');
            } else {
                console.log('[handleSaveItem] Adding NEW item via arrayUnion');
                await updateDoc(docRef, { [`itinerary.${routeDate}`]: arrayUnion(newItem) });
                console.log('[handleSaveItem] Firebase add SUCCESS');
            }

            // Budget auto-add (only for new items or explicit logic, keeping simple here)
            if (!isEdit && data.cost > 0) await updateDoc(docRef, { budget: arrayUnion({ ...newItem, category: data.type }) });

            // Auto City Detection (only for new transport items)
            if (!isEdit && (data.type === 'transport' || data.type === 'flight') && (data.arrival || data.details?.arrival)) {
                const arrivalCity = data.arrival || data.details?.arrival;
                const days = getDaysArray(trip.startDate, trip.endDate);
                const currentIdx = days.indexOf(routeDate);
                if (currentIdx >= 0 && currentIdx < days.length - 1) {
                    const nextDate = days[currentIdx + 1];
                    if (!trip.locations?.[nextDate]) {
                        await updateDoc(docRef, { [`locations.${nextDate}`]: { city: arrivalCity, country: trip.country } });
                    }
                }
            }
        }
        setIsAddModal(false);

        // 🚀 Optimistic Update: Cache the saved item with its ID
        // This allows immediate edit access before Firebase real-time sync completes
        if (data.type !== 'shopping_plan' && data.type !== 'shopping' && data.type !== 'packing') {
            const routeDate = currentDisplayDate;
            setPendingItemsCache(prev => ({
                ...prev,
                [routeDate]: [
                    ...(prev[routeDate] || []).filter(i => i.id !== itemId), // Remove old entry if exists
                    { ...newItem, id: itemId } // Add/update with correct ID
                ]
            }));
            console.log('[handleSaveItem] Added to pendingItemsCache:', itemId);
        }

        // Trigger auto-open for this item ID (except budget/packing which don't have detail modal yet)
        // USER REQUEST: Disable Auto-Open
        // if (data.type !== 'shopping_plan' && data.type !== 'shopping' && data.type !== 'packing') {
        //    setAutoOpenItemId(itemId);
        // }
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
            })
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
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers });
        } else {
            const newMembers = trip.members.map(m => m.id === memberId ? { ...m, role: newRole } : m);
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers });
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
                            await updateDoc(docRef, { [`itinerary.${routeDate}`]: newItems });
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
            const result = await generateWeatherSummaryWithGemini(trip.city, realWeather);
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
                    await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: [] });
                } catch (err) {
                    console.error("Clear daily error:", err);
                    alert("清空失敗：" + err.message);
                }
            }
        });
    };


    const handleSaveInsurance = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`insurance.private.${user?.uid}`]: myInsurance });
        alert("已儲存");
    };

    const handleSaveVisa = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`visa.${user?.uid}`]: visaForm });
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
                await updateDoc(doc(db, "trips", trip.id), { packingList: [] });
                setConfirmConfig(null);
            }
        });
    };

    const handlePackingToggle = async (itemId) => {
        if (isSimulation) return;
        const newList = (trip.packingList || []).map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
        await updateDoc(doc(db, "trips", trip.id), { packingList: newList });
    };

    const handlePackingDelete = async (itemId) => {
        if (isSimulation) return;
        const newList = (trip.packingList || []).filter(i => i.id !== itemId);
        await updateDoc(doc(db, "trips", trip.id), { packingList: newList });
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
                    await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: optimized });
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
            await updateDoc(docRef, updates);
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
                await Promise.all(normalized.map(val => updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: arrayUnion(val) })));
            } else if (section === 'shopping') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Item ${idx + 1}`,
                    estPrice: Number(item.estPrice) || 0,
                    bought: Boolean(item.bought),
                    note: item.note || ''
                }));
                await updateDoc(docRef, { shoppingList: arrayUnion(...normalized) });
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
                await updateDoc(docRef, { budget: arrayUnion(...normalized) });
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

            await updateDoc(docRef, { [`itinerary.${date}`]: newItems });
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
        <div id="trip-detail-content" className="max-w-6xl mx-auto p-4 pb-36 md:pb-20 animate-fade-in">
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

                {/* Content Grid */}
                <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">

                    {/* Left Col: Trip Core Info */}
                    <div className="lg:col-span-2 flex flex-col justify-between min-h-[220px]">
                        <div>
                            <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-2">行程概覽</div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-indigo-500/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider font-bold shadow-lg shadow-indigo-500/20">{displayCountry} {displayCity}</span>
                                {trip.isPublic && <span className="bg-emerald-500/80 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20"><Globe className="w-3 h-3" /> 公開</span>}
                                {timeDiff !== 0 && <span className={`text-[10px] px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md ${timeDiff > 0 ? 'bg-orange-500/20 text-orange-200' : 'bg-blue-500/20 text-blue-200'}`}>{timeDiff > 0 ? `+${timeDiff}h` : `${timeDiff}h`}</span>}
                            </div>

                            <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">{trip.name}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold whitespace-nowrap">
                                        <span className="text-indigo-300">第 {getDaysArray(trip.startDate, trip.endDate).findIndex(d => d === currentDisplayDate) + 1 || '-'} 天</span>
                                        <span className="mx-2 opacity-30">/</span>
                                        <span>共 {getDaysArray(trip.startDate, trip.endDate).length} 天</span>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => setIsTripSettingsOpen(true)}
                                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 border border-white/20"
                                            title="編輯行程設定"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-white/80" />
                                            <span className="text-[10px] font-bold text-white/80">編輯</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-sm opacity-80 font-medium mb-8">
                                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><Clock className="w-3.5 h-3.5 text-purple-400" /> {getDaysArray(trip.startDate, trip.endDate).length} 天行程</span>
                                {/* 🚀 Dynamic Header Location */}
                                <span className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 font-bold text-white"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {displayCity}</span>

                                {/* 🚀 Member Avatars (Persistent) */}
                                <div className="flex items-center gap-1 pl-2 border-l border-white/10 ml-2">
                                    <div className="flex -space-x-2">
                                        {trip.members?.slice(0, 5).map(m => (
                                            <div key={m.id} onClick={() => setViewingMember(m)} className="relative group cursor-pointer" title={`${m.name} (${m.role})`}>
                                                {m.photoURL ? (
                                                    <img src={m.photoURL} alt={m.name} className={`w-8 h-8 rounded-full object-cover border-2 border-black/20 ${m.id === user?.uid ? 'ring-2 ring-indigo-500' : ''}`} />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-black/20 text-white ${m.id === user?.uid ? 'bg-indigo-500' : 'bg-gray-600'}`}>
                                                        {m.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                {/* Pending Badge */}
                                                {m.status === 'pending' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-gray-900"></span>}
                                                {m.role === 'owner' && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-gray-900 flex items-center justify-center"><span className="text-[6px]">👑</span></span>}
                                            </div>
                                        ))}
                                        {(trip.members?.length || 0) > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-700/80 backdrop-blur border-2 border-black/20 flex items-center justify-center text-[10px] font-bold text-white">
                                                +{trip.members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setIsMemberModalOpen(true)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-1" title="管理成員">
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                <ActiveUsersList tripId={trip.id} user={user} activeTab={activeTab} language={globalSettings.language} />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 pt-6">
                            <button
                                onClick={onOpenSmartImport}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] md:text-sm font-bold transition-all shadow-lg border border-white/20 flex items-center gap-2 transform active:scale-95"
                            >
                                <Upload className="w-4 h-4" /> 智能匯入
                            </button>
                            <button
                                onClick={() => setIsSmartExportOpen(true)}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-[11px] md:text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 transform active:scale-95"
                            >
                                <Share2 className="w-4 h-4" /> 分享與匯出
                            </button>
                        </div>
                    </div>

                    {/* Right Col: Smart Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:bg-white/10 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-1">DAILY INTELLIGENCE</div>
                                    <div className="text-xs font-bold opacity-60">{currentDisplayDate}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold flex items-center justify-end gap-2 text-white">
                                        {dailyWeather.temp}
                                    </div>
                                    <div className="text-xs opacity-60 flex items-center justify-end gap-1 font-medium">{dailyWeather.icon} {dailyWeather.desc}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Outfit */}
                                <div className="p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/30 transition-all group/weather">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                            {dailyWeather.outfitIcon ? <img src={dailyWeather.outfitIcon} className="w-6 h-6 object-contain" alt="outfit" /> : <Sparkles className="w-6 h-6 text-indigo-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-bold text-indigo-300 mb-0.5 uppercase tracking-tighter">OUTFIT ADVICE</div>
                                                <button
                                                    onClick={handleGenerateWeatherSummary}
                                                    disabled={isGeneratingWeather}
                                                    className="text-[9px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded transition-all flex items-center gap-1"
                                                >
                                                    {isGeneratingWeather ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <BrainCircuit className="w-2.5 h-2.5" />}
                                                    智慧摘要
                                                </button>
                                            </div>
                                            <div className="text-[11px] leading-relaxed opacity-90">{dailyWeather.clothes || "暫無穿搭建議"}</div>
                                        </div>
                                    </div>

                                    {smartWeather && (
                                        <div className="mt-3 pt-3 border-t border-white/5 animate-fade-in space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Osaka Express 摘要</span>
                                                <span className="text-[10px] opacity-60">今日溫差: {smartWeather.tempRange?.min}°C - {smartWeather.tempRange?.max}°C</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['morning', 'afternoon', 'night'].map(p => (
                                                    <div key={p} className="bg-white/5 p-1.5 rounded-lg">
                                                        <div className="text-[8px] opacity-40 uppercase font-black">{p === 'morning' ? '早晨' : p === 'afternoon' ? '下晝' : '夜晚'}</div>
                                                        <div className="text-[10px] font-bold text-indigo-300">{smartWeather.periods[p].temp}</div>
                                                        <div className="text-[9px] opacity-80 leading-tight truncate" title={smartWeather.periods[p].outfit}>{smartWeather.periods[p].outfit}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] italic opacity-60 leading-relaxed text-indigo-200/80">「{smartWeather.summary}」</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            {/* Plan Menu Button */}
                            <div className="relative flex-1">
                                <button
                                    onClick={() => { setIsPlanMenuOpen(!isPlanMenuOpen); setIsManageMenuOpen(false); }}
                                    className="w-full bg-white text-gray-900 py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-100 font-bold text-xs transition-all shadow-lg active:scale-95"
                                >
                                    <Plus className="w-4 h-4 text-indigo-600" /> 規劃行程 <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isPlanMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isPlanMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsPlanMenuOpen(false)}></div>
                                        <div className="absolute left-0 right-0 bottom-full mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-bottom animate-fade-in p-1 w-full min-w-[160px]">
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

                            {/* List Menu Button (Manage) */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsManageMenuOpen(!isManageMenuOpen); setIsPlanMenuOpen(false); }}
                                    className={`bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors border border-white/10 ${isManageMenuOpen ? 'bg-white/20' : ''}`}
                                >
                                    <List className="w-5 h-5 text-white" />
                                </button>
                                {isManageMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsManageMenuOpen(false)}></div>
                                        <div className="absolute right-0 bottom-full mb-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] transform origin-bottom-right animate-fade-in">
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

            {/* Tabs (Desktop / Mobile Hidden) */}
            <div className={`hidden md:flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar`}>
                {[
                    { id: 'itinerary', label: '行程', icon: CalendarDays },
                    { id: 'packing', label: '行李', icon: ShoppingBag },
                    { id: 'shopping', label: '購物', icon: ShoppingBag },
                    { id: 'budget', label: '預算', icon: Wallet },
                    { id: 'gallery', label: '相簿', icon: ImageIcon },
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
                        onAddItem={(date, type) => {
                            if (date) setSelectDate(date);
                            setAddType(type);
                            setEditingItem(null);
                            setIsAddModal(true);
                        }}
                        onEditItem={(item) => {
                            setAddType(item.type);
                            setEditingItem(item);
                            setIsAddModal(true);
                        }}
                        onDragStart={onDragStart}
                        requestedItemId={requestedItemId} // Deep Link Item ID
                        autoOpenItemId={autoOpenItemId} // Auto Open New/Edited Item
                        onAutoOpenHandled={() => setAutoOpenItemId(null)}
                        onItemHandled={onItemHandled}
                        pendingItemsCache={pendingItemsCache} // Optimistic Update Cache
                        onDrop={onDrop}
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

            {/* Mobile More Menu Overlay - V1.0.3 Fixed Bottom Sheet */}
            {isMobileMoreOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={() => setIsMobileMoreOpen(false)}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t rounded-t-3xl p-6 pb-10 shadow-2xl animate-slide-up`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold opacity-70">更多功能</span>
                            <button
                                onClick={() => setIsMobileMoreOpen(false)}
                                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Grid Layout for Touch Targets */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: 'shopping', label: '購物', icon: ShoppingBag },
                                { id: 'gallery', label: '相簿', icon: ImageIcon },
                                { id: 'currency', label: '匯率', icon: DollarSign },
                                { id: 'journal', label: '足跡', icon: FootprintsIcon },
                                { id: 'insurance', label: '保險', icon: Shield },
                                { id: 'emergency', label: '緊急', icon: Siren },
                                { id: 'visa', label: '簽證', icon: FileCheck },
                                { id: 'files', label: '檔案', icon: FileText }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setActiveTab(t.id); setIsMobileMoreOpen(false); }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${activeTab === t.id ? 'bg-indigo-500 text-white shadow-lg' : (isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')}`}
                                >
                                    <div className={`p-3 rounded-full ${activeTab === t.id ? 'bg-white/20' : (isDarkMode ? 'bg-gray-700' : 'bg-white')}`}>
                                        <t.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-bold ${activeTab === t.id ? 'text-white' : 'opacity-70'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} onDelete={handleDeleteItineraryItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user?.uid || 'guest', name: user?.displayName || 'Guest' }]} trip={trip} />
            <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
            <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
            <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />

            <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} mode={aiMode} userPreferences={globalSettings.preferences} trip={trip} weatherData={weatherData} />

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
                        onExportPdf={handleExportPdf}
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
                )
            }
            <UserProfileModal
                isOpen={!!viewingMember}
                onClose={() => setViewingMember(null)}
                user={viewingMember}
                isAdmin={isAdmin}
                isDarkMode={isDarkMode}
            />
        </div >
    );
};

export default TripDetailContent;
