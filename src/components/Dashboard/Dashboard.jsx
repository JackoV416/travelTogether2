
import React, { useState, useEffect } from 'react';
import {
    collection, doc, updateDoc,
    addDoc, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { Settings2 } from 'lucide-react';

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

// Hooks
import useDashboardData from '../../hooks/useDashboardData';
import { checkAbuse } from '../../services/security';

// Widget Components
import {
    WeatherWidget,
    NewsWidget,
    HotelsWidget,
    FlightsWidget,
    TransportWidget,
    ConnectivityWidget,
    CurrencyConverter
} from './widgets';
import SearchFilterBar from './SearchFilterBar';

// Default Widget Configuration
const DEFAULT_WIDGETS = [
    { id: 'weather', name: '天氣預報', visible: true },
    { id: 'news', name: '旅遊新聞', visible: true },
    { id: 'hotels', name: '酒店推介', visible: true },
    { id: 'flights', name: '機票優惠', visible: true },
    { id: 'transport', name: '交通資訊', visible: true },
    { id: 'connectivity', name: '網絡方案', visible: true },
    { id: 'currency', name: '匯率計算', visible: true },
];

const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, onOpenSettings, setGlobalBg, globalSettings, exchangeRates, weatherData, isLoadingWeather, isBanned, onOpenCommandPalette }) => {
    const {
        trips, loadingTrips, newsData, loadingNews,
        hotels, loadingHotels, flights, loadingFlights,
        transports, loadingTransports, connectivity, loadingConnectivity,
        refreshTrigger, setRefreshTrigger, sendNotification
    } = useDashboardData(user, globalSettings, exchangeRates);

    const [form, setForm] = useState({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSmartExportOpen, setIsSmartExportOpen] = useState(false);
    const [selectedExportTrip, setSelectedExportTrip] = useState("");
    const [newCityInput, setNewCityInput] = useState('');
    const currentLang = globalSettings?.lang || 'zh-TW';

    const [convAmount, setConvAmount] = useState(100);
    const [convFrom, setConvFrom] = useState(globalSettings?.currency || 'HKD');
    const [convTo, setConvTo] = useState('JPY');

    const [widgets, setWidgets] = useState(() => {
        const saved = localStorage.getItem('dashboardWidgets');
        return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('nearest');
    const [filterOption, setFilterOption] = useState('all');

    useEffect(() => {
        if (globalSettings?.currency) setConvFrom(globalSettings.currency);
    }, [globalSettings]);

    useEffect(() => { setGlobalBg(selectedCountryImg); }, [selectedCountryImg, setGlobalBg]);

    useEffect(() => {
        if (trips.length && !selectedExportTrip) setSelectedExportTrip(trips[0].id);
    }, [trips, selectedExportTrip]);

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

    // --- Search & Filter Logic ---
    const getTripStatus = (t) => {
        const today = new Date().toISOString().split('T')[0];
        if (t.endDate && t.endDate < today) return 'completed';
        if (t.startDate && t.startDate <= today) return 'active';
        return 'upcoming';
    };

    const sortedTrips = React.useMemo(() => {
        let result = [...trips];

        // 1. Filter
        if (filterOption !== 'all') {
            result = result.filter(t => getTripStatus(t) === filterOption);
        }

        // 2. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name?.toLowerCase().includes(q) ||
                t.country?.toLowerCase().includes(q) ||
                t.city?.toLowerCase().includes(q)
            );
        }

        // 3. Sort
        const today = new Date().toISOString().split('T')[0];

        result.sort((a, b) => {
            if (sortOption === 'nearest') {
                const statusA = getTripStatus(a);
                const statusB = getTripStatus(b);

                // Priority: Active > Upcoming > Completed
                const priority = { active: 1, upcoming: 2, completed: 3 };
                if (priority[statusA] !== priority[statusB]) {
                    return priority[statusA] - priority[statusB];
                }

                // If same status:
                // Active: End Date ASC (Ends sooner = top?) or Start Date? Project usually: End Date ASC (closing soon)
                if (statusA === 'active') return a.endDate.localeCompare(b.endDate);
                // Upcoming: Start Date ASC (Soonest first)
                if (statusA === 'upcoming') return a.startDate.localeCompare(b.startDate);
                // Completed: End Date DESC (Most recent past first)
                if (statusA === 'completed') return b.endDate.localeCompare(a.endDate);
            }
            if (sortOption === 'date_asc') return a.startDate.localeCompare(b.startDate);
            if (sortOption === 'date_desc') return b.startDate.localeCompare(a.startDate);
            if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
            return 0;
        });

        return result;
    }, [trips, searchQuery, sortOption, filterOption]);

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
            await addDoc(collection(db, "trips"), {
                ...form,
                country: primaryCountry,
                city: primaryCity,
                currency: countryCurrency, // V1.2.4: Auto-set currency
                members: [{ id: user.uid, name: user.displayName, email: user.email, role: 'owner' }],
                createdAt: serverTimestamp(),
                itinerary: {},
                budget: [],
                shoppingList: [],
                notes: ""
            });
            sendNotification("行程已建立 ✅", `成功建立行程: ${form.name}`, 'success');
            setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
            setIsCreateModalOpen(false);
        } catch (e) {
            console.error(e);
            sendNotification("建立失敗 ❌", "無法建立行程，請檢查網路連線", 'error');
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
                // For itinerary - attach file and prompt manual input
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
                        desc: "已附加原始檔案，點擊編輯填入詳情"
                    },
                    attachment: base64,
                    createdBy: { name: user.displayName, id: user.uid },
                    needsManualInput: true
                };
                await updateDoc(docRef, { [`itinerary.${dateKey}`]: arrayUnion(newItem) });
                sendNotification("已上傳行程截圖 📸", "請點擊編輯填入行程詳情", 'success');
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
                    trips={sortedTrips.slice(0, 2)}
                    onSelectTrip={onSelectTrip}
                    onOpenCommandPalette={onOpenCommandPalette}
                />
            </div>

            <div data-tour="trip-card">
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

            {/* Travel Information Hub */}
            <div className="pb-10" data-tour="widgets-section">
                <div className="flex flex-col mb-8 border-l-4 border-indigo-500 pl-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-2xl font-black tracking-tight">旅遊資訊中心</h2>
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-[11px] font-bold transition-all border border-white/5"
                        >
                            <Settings2 className="w-3.5 h-3.5" /> 自訂排序
                        </button>
                    </div>
                </div>

                {/* Dynamic Widget Rendering based on localStorage config */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {widgets.filter(w => w.visible).map((widget) => {
                        const widgetComponents = {
                            weather: <WeatherWidget isDarkMode={isDarkMode} weatherData={weatherData} isLoadingWeather={isLoadingWeather} currentLang={currentLang} />,
                            news: <NewsWidget isDarkMode={isDarkMode} newsData={newsData} loadingNews={loadingNews} />,
                            hotels: <HotelsWidget isDarkMode={isDarkMode} hotels={hotels} loadingHotels={loadingHotels} />,
                            flights: <FlightsWidget isDarkMode={isDarkMode} flights={flights} loadingFlights={loadingFlights} />,
                            transport: <TransportWidget isDarkMode={isDarkMode} transports={transports} loadingTransports={loadingTransports} />,
                            connectivity: <ConnectivityWidget isDarkMode={isDarkMode} connectivity={connectivity} loadingConnectivity={loadingConnectivity} />,
                            currency: <CurrencyConverter isDarkMode={isDarkMode} convAmount={convAmount} setConvAmount={setConvAmount} convFrom={convFrom} setConvFrom={setConvFrom} convTo={convTo} setConvTo={setConvTo} exchangeRates={exchangeRates} onOpenSettings={onOpenSettings} />,
                        };
                        return <div key={widget.id} className="break-inside-avoid mb-6">{widgetComponents[widget.id]}</div>;
                    })}
                </div>
            </div>

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
        </main>
    );
};

export default Dashboard;
