
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Rocket } from 'lucide-react';
import {
    collection, doc, updateDoc,
    addDoc, serverTimestamp, arrayUnion
} from 'firebase/firestore';


import { db } from '../../firebase';
import {
    glassCard
} from '../../utils/tripUtils';
import {
    COUNTRIES_DATA, DEFAULT_BG_IMAGE
} from '../../constants/appData';

import SmartImportModal from '../Modals/SmartImportModal';
import TripExportImportModal from '../Modals/TripExportImportModal';
import SmartExportModal from '../Modals/SmartExportModal';
import CreateTripModal from '../Modals/CreateTripModal';
import DashboardHeader from './DashboardHeader';
import TripsGrid from './TripsGrid';
import ExploreGrid from './ExploreGrid'; // V1.3.6 Pinterest Layout
import UniversalChat from '../Shared/UniversalChat'; // V1.3.0
import GlobalChatFAB from '../Shared/GlobalChatFAB';
import MobileBottomNav from '../Shared/MobileBottomNav'; // V1.9.0 PWA Nav

// Hooks
import useDashboardData from '../../hooks/useDashboardData';
import { checkAbuse } from '../../services/security';
import { useTour } from '../../contexts/TourContext';
import { parseImageDirectly, generateItineraryWithGemini } from '../../services/ai-parsing';


import SearchFilterBar from './SearchFilterBar';



const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, onOpenSettings, setGlobalBg, globalSettings, exchangeRates, weatherData, isLoadingWeather, isBanned, onOpenCommandPalette, deferredPrompt, onInstall, shouldStartProductTour, onProductTourStarted, onOpenChat, setChatInitialTab, forcedViewMode, allTrips, loadingAllTrips }) => {
    const {
        trips, loadingTrips, newsData, loadingNews,
        hotels, loadingHotels, flights, loadingFlights,
        transports, loadingTransports, connectivity, loadingConnectivity,
        refreshTrigger, setRefreshTrigger, sendNotification
    } = useDashboardData(user, globalSettings, exchangeRates, allTrips, loadingAllTrips);

    const [form, setForm] = useState({ name: '', countries: [], cities: [], startDate: '', endDate: '', isAI: false });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSmartExportOpen, setIsSmartExportOpen] = useState(false);
    const [selectedExportTrip, setSelectedExportTrip] = useState("");
    const [newCityInput, setNewCityInput] = useState('');
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('nearest');
    const [filterOption, setFilterOption] = useState('all');

    // V1.3.0 Dashboard Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatTab, setActiveChatTab] = useState('jarvis');

    // V1.3.6: View Mode ('explore' | 'my_trips')
    // If forcedViewMode is provided, we use it and disable internal switching
    const [viewMode, setViewMode] = useState(() => {
        if (forcedViewMode) return forcedViewMode;
        const initial = sessionStorage.getItem('initialDashboardView');
        if (initial === 'my_trips') {
            sessionStorage.removeItem('initialDashboardView');
            return 'my_trips';
        }
        return 'explore';
    });

    // Update viewMode if prop changes
    useEffect(() => {
        if (forcedViewMode) setViewMode(forcedViewMode);
    }, [forcedViewMode]);





    useEffect(() => { setGlobalBg(selectedCountryImg); }, [selectedCountryImg, setGlobalBg]);

    useEffect(() => {
        if (trips.length && !selectedExportTrip) setSelectedExportTrip(trips[0].id);
    }, [trips, selectedExportTrip]);

    // Tour Integration: Force Modal to stay open during specific steps, and close when done
    const { currentStepData, isActive, startTour } = useTour();
    useEffect(() => {
        if (shouldStartProductTour) {
            startTour();
            onProductTourStarted?.();
        }
    }, [shouldStartProductTour, startTour, onProductTourStarted]);

    useEffect(() => {
        if (!isActive) return;

        if (currentStepData?.id === 'create-trip-country' || currentStepData?.id === 'create-trip-dates') {
            setIsCreateModalOpen(true);
        } else if (currentStepData?.id === 'trip-card') {
            setIsCreateModalOpen(false);
        }

        // Global Keyboard Shortcuts
        const handleKeyDown = (e) => {
            // New Trip: Shift + N
            if (e.shiftKey && (e.key === 'N' || e.key === 'n') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                setIsCreateModalOpen(true);
            }
            // Smart Import: Shift + I
            if (e.shiftKey && (e.key === 'I' || e.key === 'i') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                setIsSmartImportModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, currentStepData?.id]);

    const handleMultiSelect = (field, values) => {

        setForm(prev => ({ ...prev, [field]: values }));
        if (field === 'countries' && values.length) {
            const first = values[0];
            if (COUNTRIES_DATA[first]) setSelectedCountryImg(COUNTRIES_DATA[first].image);
        } else if (field === 'countries' && values.length === 0) {
            setSelectedCountryImg(DEFAULT_BG_IMAGE);
        }
    };


    const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleAddCity = (cityName) => {
        if (!cityName) return;
        const currentCities = form.cities || [];
        if (!currentCities.includes(cityName)) {
            setForm(prev => ({ ...prev, cities: [...currentCities, cityName] }));
        }
    };



    const handleCreate = async () => {
        if (isBanned) return sendNotification("帳戶已鎖定", "您目前無法建立新行程。", "error");

        // Abuse Check
        const isAbuse = await checkAbuse(user, 'create_trip');
        if (isAbuse) return sendNotification("帳戶已鎖定", "檢測到異常活動，您的帳戶已被系統自動鎖定。", "error");

        if (!form.name || form.countries.length === 0) return alert("請至少選擇一個國家");
        const primaryCountry = form.countries[0];
        const primaryCity = form.cities[0] || COUNTRIES_DATA[primaryCountry]?.cities?.[0] || '';
        const countryCurrency = COUNTRIES_DATA[primaryCountry]?.currency || 'HKD';

        try {
            let generatedItinerary = {};
            let generatedBudget = [];

            // V1.3.1: AI Trip Generation
            if (form.isAI) {
                // Determine duration
                const start = new Date(form.startDate);
                const end = new Date(form.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                sendNotification("Jarvis 正在規劃行程 🤖", `正在為您生成 ${diffDays} 日的 ${primaryCity} 之旅...`, 'info', 5000);

                const aiResult = await generateItineraryWithGemini({
                    city: primaryCity,
                    days: diffDays,
                    budget: 'mid', // Default
                    userId: user.uid
                });

                if (aiResult && aiResult.itinerary) {
                    // Convert AI format to Firestore Format
                    // AI returns { itinerary: [ { day: 1, items: [...] } ] }
                    // Firestore expects { itinerary: { "2024-01-01": [items], "2024-01-02": [items] } }

                    aiResult.itinerary.forEach((dayPlan, idx) => {
                        const dateObj = new Date(start);
                        dateObj.setDate(dateObj.getDate() + (dayPlan.day - 1));
                        const dateKey = dateObj.toISOString().split('T')[0];

                        generatedItinerary[dateKey] = (dayPlan.items || []).map(item => ({
                            ...item,
                            id: item.id || `ai-${Date.now()}-${Math.random()}`,
                            currency: countryCurrency, // Force consistency
                            createdBy: { name: 'Jarvis', id: 'ai' }
                        }));
                    });

                    // Add Transports to budget or itinerary? 
                    // Usually we put transport in 'budget' or as itinerary items.
                    // For now, let's just stick to itinerary items.
                }
            }

            await addDoc(collection(db, "trips"), {
                ...form,
                country: primaryCountry,
                city: primaryCity,
                currency: countryCurrency, // V1.2.4: Auto-set currency
                members: [{ id: user.uid, name: user.displayName, email: user.email, role: 'owner' }],
                createdAt: serverTimestamp(),
                itinerary: generatedItinerary,
                budget: generatedBudget,
                shoppingList: [],
                notes: "",
                // Duplicates removed
                isAI: !!form.isAI,
                isLocal: primaryCountry === (globalSettings?.countryCode || 'HK') // V1.5.2: Detect Staycation
            });
            sendNotification("行程已建立 ✅", `成功建立行程: ${form.name}`, 'success');
            setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '', isAI: false });
            setIsCreateModalOpen(false);
        } catch (e) {
            console.error(e);
            sendNotification("建立失敗 ❌", "無法建立行程 (" + e.message + ")", 'error');
        }
    };

    const handleDashboardImport = async (inputData, mode) => {
        try {
            let payloads = [];
            if (mode === 'json') {
                const parsed = JSON.parse(inputData);
                payloads = Array.isArray(parsed) ? parsed : [parsed];
            } else {
                const lines = inputData.trim().split(/\r?\n/).filter(Boolean);
                if (lines.length < 2) throw new Error("CSV 至少需要一列資料");
                const headers = lines.shift().split(',').map(h => h.trim());
                payloads = lines.map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const obj = {};
                    headers.forEach((h, idx) => obj[h] = values[idx]);
                    return obj;
                });
            }
            const normalized = payloads.filter(Boolean).map(item => ({
                name: item.name,
                countries: [item.country || item.countries?.[0] || 'Other'],
                cities: [item.city || item.cities?.[0] || ''],
                startDate: item.startDate,
                endDate: item.endDate
            })).filter(p => p.name && p.countries[0]);

            if (normalized.length === 0) throw new Error("無效的行程資料");

            await Promise.all(normalized.map(async payload => {
                const pCountry = payload.countries[0];
                const pCurrency = COUNTRIES_DATA[pCountry]?.currency || 'HKD';
                await addDoc(collection(db, "trips"), {
                    ...payload,
                    country: pCountry,
                    city: payload.cities[0],
                    currency: payload.currency || pCurrency, // V1.2.4: Auto-set currency if missing
                    members: [{ id: user.uid, name: user.displayName, email: user.email, role: 'owner' }],
                    createdAt: serverTimestamp(),
                    itinerary: {},
                    budget: [],
                    shoppingList: [],
                    notes: ""
                });
            }));

            setIsImportModalOpen(false);
            sendNotification("匯入成功 📥", `成功匯入 ${normalized.length} 個行程`, 'success');
        } catch (err) {
            sendNotification("匯入失敗 ❌", "匯入失敗: " + (err.message || "未知錯誤"), 'error');
        }
    };

    const handleSmartImport = async (file, type, targetTripId) => {
        if (!file || !type || !targetTripId) return;
        const targetTrip = trips.find(t => t.id === targetTripId);
        if (!targetTrip) return alert("找不到目標行程");

        const docRef = doc(db, "trips", targetTripId);

        try {
            // --- V0.21.1: Call AI Parsing Service ---
            sendNotification("處理中 🔍", "正在處理文件...", 'info');

            // Read file as base64 for attachment
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            if (type === 'itinerary') {
                try {
                    // V1.3.1: Restore AI Parsing
                    const aiItems = await parseImageDirectly(file, {
                        city: targetTrip.city || targetTrip.cities?.[0],
                        date: targetTrip.startDate,
                        currency: targetTrip.currency || globalSettings.currency
                    }, user.uid);

                    if (aiItems && aiItems.length > 0) {
                        const batchPromises = aiItems.map(item => {
                            // Determine date key (use item date if valid, else trip start)
                            // Parsing logic might return specific check-in dates for hotels
                            let itemDateKey = targetTrip.startDate || new Date().toISOString().split('T')[0];

                            // If item has a specific date (e.g. checkIn), try to use it if within range?
                            // For simplicity, we default to trip start or use logic in addDoc if strict
                            // But here we set to `itinerary.${date}`. 
                            // Let's assume parsed items might not have 'date' property compatible with top-level keys yet
                            // The service returns items with 'details'.

                            // Transform to Firestore Itinerary Item
                            const newItem = {
                                id: Date.now().toString() + Math.random().toString().slice(2, 5),
                                name: item.name || "AI Imported Item",
                                type: item.type || 'spot',
                                time: item.time || '10:00',
                                cost: parseFloat(item.details?.price?.replace(/[^0-9.]/g, '')) || 0,
                                currency: targetTrip.currency || 'HKD',
                                details: {
                                    location: item.details?.location || "",
                                    desc: item.details?.desc || "Imported by Jarvis AI",
                                    ...item.details
                                },
                                attachment: base64, // Keep original image
                                createdBy: { name: user.displayName, id: user.uid },
                                aiGenerated: true
                            };
                            return updateDoc(docRef, { [`itinerary.${itemDateKey}`]: arrayUnion(newItem) });
                        });

                        await Promise.all(batchPromises);
                        sendNotification("AI 識別成功 ✨", `成功匯入 ${aiItems.length} 個項目`, 'success');
                    } else {
                        // Fallback to manual if AI found nothing
                        throw new Error("AI_NO_RESULT");
                    }
                } catch (aiErr) {
                    console.warn("AI Import Failed, falling back to manual:", aiErr);
                    // Fallback to manual input placeholder
                    const dateKey = targetTrip.startDate || new Date().toISOString().split('T')[0];
                    const newItem = {
                        id: Date.now().toString(),
                        name: `📎 已上傳: ${file.name}`,
                        type: 'spot',
                        time: '10:00',
                        cost: 0,
                        currency: globalSettings.currency,
                        details: {
                            location: "請手動編輯",
                            desc: "Jarvis 未能識別詳情，請手動填入 (已附加原始檔案)"
                        },
                        attachment: base64,
                        createdBy: { name: user.displayName, id: user.uid },
                        needsManualInput: true
                    };
                    await updateDoc(docRef, { [`itinerary.${dateKey}`]: arrayUnion(newItem) });
                    sendNotification("已上傳 (需手動編輯) 📸", "AI 未能識別，請手動編輯", 'warning');
                }
            }
            else if (type === 'budget') {
                // For budget - attach file and prompt manual input
                const newItem = {
                    id: Date.now().toString(),
                    name: `📎 單據: ${file.name}`,
                    cost: 0,
                    currency: globalSettings.currency,
                    category: 'misc',
                    payer: user.displayName,
                    attachment: base64,
                    date: new Date().toISOString(),
                    needsManualInput: true
                };
                await updateDoc(docRef, { budget: arrayUnion(newItem) });
                sendNotification("已上傳單據 🧾", "請點擊編輯填入金額", 'success');
            }
            else if (type === 'memory') {
                // For memory/files - just store the file
                const newFile = {
                    id: Date.now().toString(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    uploadedBy: user.displayName,
                    uploadedAt: new Date().toISOString()
                };
                await updateDoc(docRef, { files: arrayUnion(newFile) });
                sendNotification("回憶已儲存 📷", "檔案已加入至文件庫", 'success');
            }
            else if (type === 'json') {
                // JSON full trip import
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    // Merge imported data into trip
                    const updates = {};
                    if (data.itinerary) updates.itinerary = data.itinerary;
                    if (data.budget) updates.budget = data.budget;
                    if (data.shopping) updates.shopping = data.shopping;
                    if (data.packing) updates.packing = data.packing;
                    if (data.notes) updates.notes = data.notes;

                    if (Object.keys(updates).length > 0) {
                        await updateDoc(docRef, updates);
                        sendNotification("JSON 匯入成功 📥", `已匯入 ${Object.keys(updates).length} 個分類`, 'success');
                    } else {
                        sendNotification("無可匯入數據 ⚠️", "JSON 格式不符", 'warning');
                    }
                } catch (parseErr) {
                    sendNotification("JSON 解析失敗 ❌", "請確認 JSON 格式正確", 'error');
                    return;
                }
            }
            else if (type === 'csv') {
                // CSV import - parse and add to itinerary
                try {
                    const text = await file.text();
                    const lines = text.split('\n').filter(l => l.trim());
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                    const dateKey = targetTrip.startDate || new Date().toISOString().split('T')[0];
                    const itemsToAdd = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',');
                        const item = {
                            id: `csv-${Date.now()}-${i}`,
                            name: values[headers.indexOf('name')] || values[0] || `項目 ${i}`,
                            type: values[headers.indexOf('type')] || 'spot',
                            time: values[headers.indexOf('time')] || '10:00',
                            cost: parseFloat(values[headers.indexOf('cost')]) || 0,
                            currency: values[headers.indexOf('currency')] || globalSettings.currency,
                            details: { location: values[headers.indexOf('location')] || '' },
                            createdBy: { name: user.displayName, id: user.uid },
                            csvImported: true
                        };
                        itemsToAdd.push(item);
                    }

                    await Promise.all(itemsToAdd.map(newItem =>
                        updateDoc(docRef, { [`itinerary.${dateKey}`]: arrayUnion(newItem) })
                    ));
                    sendNotification("CSV 匯入成功 📊", `已匯入 ${itemsToAdd.length} 個項目`, 'success');
                } catch (parseErr) {
                    sendNotification("CSV 解析失敗 ❌", "請確認 CSV 格式正確", 'error');
                    return;
                }
            }

            setIsSmartImportModalOpen(false);
        } catch (err) {
            console.error(err);
            sendNotification("上傳失敗 ❌", err.message, 'error');
        }
    };

    // Filter & Sort Logic
    const sortedTrips = React.useMemo(() => {
        if (!trips) return [];
        let result = [...trips];

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name?.toLowerCase().includes(q) ||
                t.city?.toLowerCase().includes(q) ||
                t.country?.toLowerCase().includes(q)
            );
        }

        // 2. Filter (Time)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Compare based on day start for consistency

        if (filterOption === 'upcoming') {
            result = result.filter(t => new Date(t.startDate) > now);
        } else if (filterOption === 'active' || filterOption === 'ongoing') {
            result = result.filter(t => {
                const start = new Date(t.startDate);
                const end = new Date(t.endDate);
                // Ensure dates are compared at midnight
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                return start <= now && end >= now;
            });
        } else if (filterOption === 'completed' || filterOption === 'past') {
            result = result.filter(t => new Date(t.endDate) < now);
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortOption === 'nearest') return new Date(a.startDate) - new Date(b.startDate);
            if (sortOption === 'furthest') return new Date(b.startDate) - new Date(a.startDate);
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        return result;
    }, [trips, searchQuery, filterOption, sortOption]);

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-12 animate-fade-in">
            <div data-tour="dashboard-header">
                <DashboardHeader
                    isDarkMode={isDarkMode}
                    selectedCountryImg={selectedCountryImg}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    setForm={setForm}
                    setSelectedCountryImg={setSelectedCountryImg}
                    setIsSmartImportModalOpen={setIsSmartImportModalOpen}
                    setIsSmartExportOpen={setIsSmartExportOpen}
                    trips={sortedTrips.filter(t => new Date(t.endDate) >= new Date().setHours(0, 0, 0, 0)).slice(0, 5)} // Show top 5 upcoming/active
                    onSelectTrip={onSelectTrip}
                    onOpenCommandPalette={onOpenCommandPalette}
                />
            </div>

            {/* PWA Install Invite */}
            {deferredPrompt && (
                <div className="animate-fade-in px-2">
                    <div className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-indigo-900/20 border-indigo-400/20 text-indigo-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-white/70 border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.05)]'} backdrop-blur-xl`}>
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/40">
                                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-black tracking-tight mb-1">{t('pwa.install_title') || '將 Travel Together 安裝到手機'}</h3>
                                <p className="text-sm font-medium opacity-70 leading-relaxed max-w-2xl">{t('pwa.install_desc') || '獲得更流暢嘅全螢幕體驗、支援離線查看行程，仲可以收到實時旅遊資訊同系統更新添！'}</p>
                            </div>

                            <button
                                onClick={onInstall}
                                className="group px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95 whitespace-nowrap flex items-center gap-2"
                            >
                                {t('pwa.install_btn') || '立即安裝 App'}
                                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Tabs & Content */}
            <div className="animate-fade-in relative z-0 space-y-6">

                {/* Tab Navigation */}
                {!forcedViewMode && (
                    <div className="flex items-center justify-center gap-2 mb-10">
                        <button
                            onClick={() => setViewMode('explore')}
                            className={`px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-500 transform ${viewMode === 'explore'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105 border border-indigo-400/20'
                                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 hover:text-white border border-white/5 backdrop-blur-md'
                                }`}
                        >
                            🌍 {t('dashboard.explore_community') || 'Explore Community'}
                        </button>
                        <button
                            onClick={() => setViewMode('my_trips')}
                            className={`px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-500 transform ${viewMode === 'my_trips'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105 border border-indigo-400/20'
                                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 hover:text-white border border-white/5 backdrop-blur-md'
                                }`}
                        >
                            ✈️ {t('dashboard.my_trips') || 'My Trips'}
                        </button>
                    </div>
                )}

                {viewMode === 'explore' ? (
                    <div className="animate-fade-in">
                        <ExploreGrid
                            isDarkMode={isDarkMode}
                            onSelectTrip={(trip) => onSelectTrip(trip)}
                            userTrips={trips}
                        />
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6" data-tour="trip-card">
                        <TripsGrid
                            trips={sortedTrips}
                            loadingTrips={loadingTrips}
                            isDarkMode={isDarkMode}
                            currentLang={currentLang}
                            onSelectTrip={onSelectTrip}
                            setGlobalBg={setGlobalBg}
                            weatherData={weatherData}
                            setIsSmartImportModalOpen={setIsSmartImportModalOpen}
                            setIsSmartExportOpen={setIsSmartExportOpen}
                            setIsCreateModalOpen={setIsCreateModalOpen}
                            searchFilter={
                                <SearchFilterBar
                                    onSearch={setSearchQuery}
                                    onSort={setSortOption}
                                    onFilter={setFilterOption}
                                    currentSort={sortOption}
                                    currentFilter={filterOption}
                                />
                            }
                        />
                    </div>
                )}
            </div>



            {/* V1.3.0 Universal Chat */}
            <UniversalChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                trip={null} // No specific trip in dashboard
                user={user}
                isDarkMode={isDarkMode}
                activeTab={activeChatTab}
                onTabChange={setActiveChatTab}
                mode="dashboard" // Explicit mode
            />
            {/* Modals */}
            <CreateTripModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                form={form}
                onInputChange={handleInputChange}
                onMultiSelect={handleMultiSelect}
                onAddCity={handleAddCity}
                onSubmit={handleCreate}
                isDarkMode={isDarkMode}
                globalSettings={globalSettings}
                user={user}
            />

            <SmartImportModal
                isOpen={isSmartImportModalOpen}
                onClose={() => setIsSmartImportModalOpen(false)}
                onImport={handleSmartImport}
                isDarkMode={isDarkMode}
                trips={trips}
            />

            <TripExportImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                mode="import"
                sourceType="trip"
                trips={trips}
                selectedTripId={selectedExportTrip}
                setSelectedTripId={setSelectedExportTrip}
                onImport={handleDashboardImport}
                isDarkMode={isDarkMode}
            />

            <TripExportImportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                mode="export"
                sourceType="trip"
                trips={trips}
                selectedTripId={selectedExportTrip}
                setSelectedTripId={setSelectedExportTrip}
                isDarkMode={isDarkMode}
            />

            <SmartExportModal
                isOpen={isSmartExportOpen}
                onClose={() => setIsSmartExportOpen(false)}
                trip={trips.find(t => t.id === selectedExportTrip) || trips[0]}
                trips={trips}
                isDarkMode={isDarkMode}
            />

            {/* V1.3.1: Global Chat Entry Point */}
            <GlobalChatFAB
                isDarkMode={isDarkMode}
                onClick={() => {
                    if (onOpenChat) onOpenChat('jarvis');
                    if (setChatInitialTab) setChatInitialTab('jarvis');
                }}
            />

            {/* V1.9.0: Mobile Bottom Nav with Explore/My Trips Toggle */}
            <MobileBottomNav
                isDarkMode={isDarkMode}
                currentView={forcedViewMode || 'dashboard'}
                onViewChange={onViewChange}
                onChatClick={() => {
                    if (onOpenChat) onOpenChat('jarvis');
                    if (setChatInitialTab) setChatInitialTab('jarvis');
                }}
                onCreateTrip={() => setIsCreateModalOpen(true)}
                onSearch={onOpenCommandPalette}
            />
        </main>
    );
};

export default Dashboard;
