
import React, { useState, useEffect } from 'react';
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

const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, onOpenSettings, setGlobalBg, globalSettings, exchangeRates, weatherData, isLoadingWeather, isBanned }) => {
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

    const handleCreate = async () => {
        if (isBanned) return sendNotification("帳戶已鎖定", "您目前無法建立新行程。", "error");

        // Abuse Check
        const isAbuse = await checkAbuse(user, 'create_trip');
        if (isAbuse) return sendNotification("帳戶已鎖定", "檢測到異常活動，您的帳戶已被系統自動鎖定。", "error");

        if (!form.name || form.countries.length === 0) return alert("請至少選擇一個國家");
        const primaryCountry = form.countries[0];
        const primaryCity = form.cities[0] || COUNTRIES_DATA[primaryCountry]?.cities?.[0] || '';
        try {
            await addDoc(collection(db, "trips"), {
                ...form,
                country: primaryCountry,
                city: primaryCity,
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
                await addDoc(collection(db, "trips"), {
                    ...payload,
                    country: payload.countries[0],
                    city: payload.cities[0],
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
            <DashboardHeader
                isDarkMode={isDarkMode}
                selectedCountryImg={selectedCountryImg}
                setIsCreateModalOpen={setIsCreateModalOpen}
                setForm={setForm}
                setSelectedCountryImg={setSelectedCountryImg}
                setIsSmartImportModalOpen={setIsSmartImportModalOpen}
                setIsSmartExportOpen={setIsSmartExportOpen}
                trips={trips}
                onSelectTrip={onSelectTrip}
            />


            <TripsGrid
                trips={trips}
                loadingTrips={loadingTrips}
                isDarkMode={isDarkMode}
                currentLang={currentLang}
                onSelectTrip={onSelectTrip}
                setGlobalBg={setGlobalBg}
                weatherData={weatherData}
                setIsSmartImportModalOpen={setIsSmartImportModalOpen}
                setIsSmartExportOpen={setIsSmartExportOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
            />


            {/* Travel Information Hub */}
            <div className="pb-10">
                <div className="flex items-center justify-between mb-6 border-l-4 border-indigo-500 pl-3">
                    <h2 className="text-2xl font-bold">旅遊資訊中心</h2>
                    <button
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-all active:scale-95"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 實時連線中 (點擊刷新)
                    </button>
                </div>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

                    <WeatherWidget
                        isDarkMode={isDarkMode}
                        weatherData={weatherData}
                        isLoadingWeather={isLoadingWeather}
                        currentLang={currentLang}
                    />

                    <NewsWidget
                        isDarkMode={isDarkMode}
                        newsData={newsData}
                        loadingNews={loadingNews}
                    />

                    <HotelsWidget
                        isDarkMode={isDarkMode}
                        hotels={hotels}
                        loadingHotels={loadingHotels}
                    />

                    <FlightsWidget
                        isDarkMode={isDarkMode}
                        flights={flights}
                        loadingFlights={loadingFlights}
                    />

                    <TransportWidget
                        isDarkMode={isDarkMode}
                        transports={transports}
                        loadingTransports={loadingTransports}
                    />

                    <ConnectivityWidget
                        isDarkMode={isDarkMode}
                        connectivity={connectivity}
                        loadingConnectivity={loadingConnectivity}
                    />

                    <CurrencyConverter
                        isDarkMode={isDarkMode}
                        convAmount={convAmount}
                        setConvAmount={setConvAmount}
                        convFrom={convFrom}
                        setConvFrom={setConvFrom}
                        convTo={convTo}
                        setConvTo={setConvTo}
                        exchangeRates={exchangeRates}
                        onOpenSettings={onOpenSettings}
                    />

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
