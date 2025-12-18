
import React, { useState, useEffect } from 'react';
import {
    Plus, Upload, Globe, MoreHorizontal,
    Trash2, Edit3, MapPin as MapIcon, Calendar, Shirt,
    CloudSun, Newspaper, DollarSign, ArrowUpRight, Loader2,
    Home, MonitorPlay, History, Bell, Sun, Moon, LogOut,
    UserCircle, ChevronLeft, ArrowRight, Hotel, Plane, TrainFront, Wifi, Star
} from 'lucide-react';
import {
    collection, query, onSnapshot, doc, updateDoc,
    addDoc, deleteDoc, arrayUnion, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
    glassCard, getLocalizedCountryName, getLocalizedCityName,
    getTripSummary, formatDate, getWeatherForecast, getLocalCityTime,
    inputClasses
} from '../../utils/tripUtils';
import {
    COUNTRIES_DATA, DEFAULT_BG_IMAGE, INFO_DB,
    CURRENCIES, CITY_COORDS, TIMEZONES, LANGUAGE_OPTIONS
} from '../../constants/appData';
import { useNotifications } from '../../hooks/useNotifications';
import SmartImportModal from '../Modals/SmartImportModal';
import TripExportImportModal from '../Modals/TripExportImportModal';
import CreateTripModal from '../Modals/CreateTripModal';
import TripCard from './TripCard';
import { convertCurrency } from '../../services/exchangeRate';
import { fetchNews } from '../../services/news';

const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, onOpenSettings, setGlobalBg, globalSettings, exchangeRates, weatherData }) => {
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedExportTrip, setSelectedExportTrip] = useState("");
    const [newCityInput, setNewCityInput] = useState('');
    const currentLang = globalSettings?.lang || 'zh-TW';

    const [convAmount, setConvAmount] = useState(100);
    const [convFrom, setConvFrom] = useState(globalSettings?.currency || 'HKD');
    const [convTo, setConvTo] = useState('JPY');
    const [lastReminderCheck, setLastReminderCheck] = useState(null);
    const [newsData, setNewsData] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);

    const { sendNotification } = useNotifications(user);

    useEffect(() => {
        if (globalSettings?.currency) setConvFrom(globalSettings.currency);
    }, [globalSettings]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "trips"));
        const unsub = onSnapshot(q, s => {
            setTrips(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.members?.some(m => m.id === user.uid)));
        });
        return () => unsub();
    }, [user]);

    useEffect(() => { setGlobalBg(selectedCountryImg); }, [selectedCountryImg, setGlobalBg]);

    useEffect(() => {
        if (trips.length && !selectedExportTrip) setSelectedExportTrip(trips[0].id);

        // Fetch News based on nearest trip
        const loadNews = async () => {
            setLoadingNews(true);
            const targetTrip = trips[0]; // Simple logic for now
            const location = targetTrip?.city || targetTrip?.countries?.[0] || 'Hong Kong';
            const data = await fetchNews(location, globalSettings?.lang || 'zh-TW');
            setNewsData(data);
            setLoadingNews(false);
        };
        loadNews();
    }, [trips, selectedExportTrip, globalSettings?.lang]);

    // Reminder Checker Logic
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
                        itemTime.setHours(h, m, 0, 0);
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
            setLastReminderCheck(Date.now());
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check
        return () => clearInterval(interval);
    }, [trips, sendNotification]);

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

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            const docRef = doc(db, "trips", targetTripId);

            try {
                if (type === 'itinerary') {
                    const dateKey = targetTrip.startDate || new Date().toISOString().split('T')[0];
                    const newItem = {
                        id: Date.now().toString(),
                        name: "AI 識別行程: " + file.name,
                        type: 'spot',
                        time: '10:00',
                        cost: 0,
                        currency: globalSettings.currency,
                        details: { location: "Parsed from Image" },
                        attachment: base64,
                        createdBy: { name: user.displayName, id: user.uid }
                    };
                    await updateDoc(docRef, { [`itinerary.${dateKey}`]: arrayUnion(newItem) });
                    sendNotification("匯入成功 ✅", `已將行程加入至 ${targetTrip.name}`, 'success');
                }
                else if (type === 'budget') {
                    const newItem = {
                        id: Date.now().toString(),
                        name: "單據導入: " + file.name,
                        cost: 0,
                        currency: globalSettings.currency,
                        category: 'misc',
                        payer: user.displayName,
                        attachment: base64,
                        date: new Date().toISOString()
                    };
                    await updateDoc(docRef, { budget: arrayUnion(newItem) });
                    sendNotification("預算上傳成功 💰", "已加入單據至預算表", 'success');
                }
                setIsSmartImportModalOpen(false);
            } catch (err) {
                console.error(err);
                sendNotification("匯入失敗 ❌", "資料處理出錯", 'error');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-12 animate-fade-in">
            {/* Header / Banner */}
            <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
                <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{ backgroundImage: `url(${selectedCountryImg})` }}></div>
                <div className="relative z-10 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Plus className="w-6 h-6 text-indigo-500" /> 建立新行程</h2>
                    <p className="opacity-80 text-sm max-w-xl">使用彈窗快速建立，支援多國多城與自訂城市。背景會依選擇自動切換。</p>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 transition-all hover:scale-105"><Plus className="w-4 h-4" /> 打開建立視窗</button>
                        <button onClick={() => { setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' }); setSelectedCountryImg(DEFAULT_BG_IMAGE); }} className="px-4 py-3 rounded-xl border border-white/30 text-sm hover:bg-white/10 transition-all">重設預覽</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-3 rounded-xl bg-green-500/20 text-green-200 font-bold text-sm hover:bg-green-500/30 transition-all">匯入行程</button>
                        <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-100 font-bold text-sm hover:bg-purple-500/30 transition-all">匯出行程</button>
                    </div>
                </div>
            </div>

            {/* Trips Grid */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3">我的行程</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsSmartImportModalOpen(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"><Upload className="w-4 h-4" /> 智能匯入</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 rounded-xl border border-indigo-500/40 text-sm hover:bg-indigo-500/5 transition-colors">全行程匯入</button>
                        <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 rounded-xl border border-purple-500/40 text-sm hover:bg-purple-500/5 transition-colors">匯出</button>
                        <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors"><Plus className="w-4 h-4" /> 建立</button>
                    </div>
                </div>

                {trips.length === 0 ? (
                    <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                        <Globe className="w-16 h-16 mx-auto mb-4 text-indigo-400 opacity-40" />
                        <p className="opacity-50 mb-4 text-lg">尚無行程，立即開始規劃您的下一趟旅程！</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="text-indigo-400 underline font-bold text-lg">立即建立</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(t => (
                            <TripCard
                                key={t.id}
                                trip={t}
                                isDarkMode={isDarkMode}
                                currentLang={currentLang}
                                onSelect={onSelectTrip}
                                setGlobalBg={setGlobalBg}
                                cardWeather={getWeatherForecast(t.country)}
                            />
                        ))}
                        <div className={`${glassCard(isDarkMode)} h-60 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 cursor-pointer border-dashed hover:border-indigo-500 transition-all`} onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-10 h-10 mb-2 text-indigo-400" />
                            <p className="font-bold">建立更多行程</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Travel Information Hub */}
            <div className="pb-10">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3 mb-6">旅遊資訊中心</h2>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

                    {/* Weather & Time Widget */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-white/5 min-h-[300px]`}>
                            <h4 className="font-bold flex items-center gap-2 mb-4 text-indigo-400"><CloudSun className="w-5 h-5" /> 當地天氣 & 時間</h4>
                            <div className="space-y-4 custom-scrollbar overflow-y-auto pr-1 flex-1">
                                {Object.keys(CITY_COORDS).map((city) => {
                                    const wData = weatherData?.[city];
                                    const staticData = INFO_DB.weather.find(w => w.city === city) || {};
                                    const displayTemp = wData?.temp || staticData.temp || '--';
                                    const displayDesc = wData?.desc || staticData.desc || '載入中...';
                                    const displayIcon = wData?.icon || staticData.icon || '⌛';
                                    const timezone = staticData.tz || 'UTC';

                                    return (
                                        <div key={city} className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div>
                                                <span className="block font-bold text-sm">{getLocalizedCityName(city, currentLang)}</span>
                                                <span className="text-[10px] opacity-50 font-mono tracking-tighter">{getLocalCityTime(timezone)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold">{displayTemp}</span>
                                                <div className="text-[10px] opacity-70 flex items-center justify-end gap-1">
                                                    <span>{displayIcon}</span> <span>{displayDesc}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* News / Travel Alerts */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-rose-400"><Newspaper className="w-5 h-5" /> 旅遊快訊</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Google News</span>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5 shadow-inner min-h-[100px]">
                                {loadingNews ? (
                                    <div className="flex justify-center items-center py-8 opacity-50"><Loader2 className="animate-spin w-5 h-5" /></div>
                                ) : (
                                    newsData.length > 0 ? newsData.map((n, i) => (
                                        <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-white/5 rounded-xl transition-all group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] opacity-40 font-mono bg-white/5 px-1.5 py-0.5 rounded">{n.source}</span>
                                                <span className="text-[10px] opacity-30">{n.time}</span>
                                            </div>
                                            <h5 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-rose-300 transition-colors">{n.title}</h5>
                                            <p className="text-[10px] opacity-50 line-clamp-2">{n.summary}</p>
                                        </a>
                                    )) : (
                                        <div className="text-center opacity-40 text-xs py-4">暫無相關新聞</div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hotels Widget */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-pink-400"><Hotel className="w-5 h-5" /> 酒店推薦</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Static</span>
                            </div>
                            <div className="space-y-3">
                                {INFO_DB.hotels?.slice(0, 3).map((h, i) => (
                                    <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group">
                                        <img src={h.img} alt={h.name} className="w-14 h-14 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate group-hover:text-pink-400 transition-colors">{h.name}</div>
                                            <div className="text-[10px] opacity-50 flex items-center gap-2">
                                                <span>{h.country}</span>
                                                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{h.star}</span>
                                            </div>
                                            <div className="text-xs text-pink-400 font-bold mt-0.5">{h.price}</div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:text-pink-400 transition-all" />
                                    </a>
                                ))}
                            </div>
                            <div className="mt-3 text-[9px] opacity-40 text-center">Data: Agoda / Booking.com</div>
                        </div>
                    </div>

                    {/* Flights Widget */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-sky-400"><Plane className="w-5 h-5" /> 機票優惠</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Static</span>
                            </div>
                            <div className="space-y-2">
                                {INFO_DB.flights?.slice(0, 4).map((f, i) => (
                                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm group-hover:text-sky-400 transition-colors">{f.route}</div>
                                            <div className="text-[10px] opacity-50">{f.airline} • {f.details}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {f.tag && <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">{f.tag}</span>}
                                            <span className="font-bold text-sm text-sky-400">{f.price}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-3 text-[9px] opacity-40 text-center">Data: Airlines / Skyscanner</div>
                        </div>
                    </div>

                    {/* Transport Widget */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-violet-400"><TrainFront className="w-5 h-5" /> 交通票券</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Static</span>
                            </div>
                            <div className="space-y-2">
                                {INFO_DB.transports?.map((t, i) => (
                                    <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm group-hover:text-violet-400 transition-colors">{t.name}</div>
                                            <div className="text-[10px] opacity-50">{t.provider} • {t.details}</div>
                                        </div>
                                        <span className="font-bold text-sm text-violet-400">{t.price}</span>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-3 text-[9px] opacity-40 text-center">Data: {INFO_DB.transports?.map(t => t.source).filter((v, i, a) => a.indexOf(v) === i).join(' / ')}</div>
                        </div>
                    </div>

                    {/* Connectivity Widget */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-teal-400"><Wifi className="w-5 h-5" /> 網卡 / WiFi</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Static</span>
                            </div>
                            <div className="space-y-2">
                                {INFO_DB.connectivity?.map((c, i) => (
                                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-2 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm group-hover:text-teal-400 transition-colors">{c.name}</div>
                                            <div className="text-[10px] opacity-50">{c.type} • {c.regions}</div>
                                        </div>
                                        <span className="font-bold text-sm text-teal-400">{c.price}</span>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-3 text-[9px] opacity-40 text-center">Data: {INFO_DB.connectivity?.map(c => c.provider).join(' / ')}</div>
                        </div>
                    </div>

                    {/* Currency Converter */}
                    <div className="break-inside-avoid">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col relative overflow-hidden`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2 text-emerald-400"><DollarSign className="w-5 h-5" /> 匯率計算機</h4>
                                <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Real-time</span>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 space-y-4 border border-white/10 shadow-inner">
                                {/* From Currency */}
                                <div className="space-y-2">
                                    <label className="text-[9px] opacity-50 uppercase tracking-widest font-bold block ml-1">您持有 ({convFrom})</label>
                                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                                            {CURRENCIES[convFrom]?.symbol || '$'}
                                        </div>
                                        <input
                                            type="number"
                                            value={convAmount}
                                            onChange={e => setConvAmount(Number(e.target.value))}
                                            className="w-full bg-transparent text-2xl font-mono font-bold outline-none placeholder-white/20"
                                            placeholder="1000"
                                        />
                                        <select
                                            value={convFrom}
                                            onChange={e => setConvFrom(e.target.value)}
                                            className={`bg-transparent font-bold text-sm outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        >
                                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Swap Button */}
                                <div className="flex justify-center -my-1 relative z-10">
                                    <div
                                        className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg transform hover:rotate-180 transition-transform duration-500 cursor-pointer border border-emerald-500 hover:shadow-emerald-500/30"
                                        onClick={() => { const f = convFrom; setConvFrom(convTo); setConvTo(f); }}
                                    >
                                        <ArrowUpRight className="w-4 h-4 rotate-45" />
                                    </div>
                                </div>

                                {/* To Currency */}
                                <div className="space-y-2">
                                    <label className="text-[9px] opacity-50 uppercase tracking-widest font-bold block ml-1">換算目標 ({convTo})</label>
                                    <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0">
                                            {CURRENCIES[convTo]?.symbol || '$'}
                                        </div>
                                        <div className="w-full text-2xl font-mono font-bold text-emerald-400">
                                            {convertCurrency(convAmount, convFrom, convTo, exchangeRates).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                        </div>
                                        <select
                                            value={convTo}
                                            onChange={e => setConvTo(e.target.value)}
                                            className={`bg-transparent font-bold text-sm outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        >
                                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Rate Info */}
                                <div className="pt-2 text-[10px] text-center opacity-50 font-mono">
                                    1 {convFrom} ≈ <span className="text-emerald-400 font-bold">{convertCurrency(1, convFrom, convTo, exchangeRates).toFixed(4)}</span> {convTo}
                                </div>
                            </div>
                            <button onClick={() => onOpenSettings && onOpenSettings()} className="mt-3 text-[10px] text-center w-full opacity-60 hover:opacity-100 hover:text-emerald-400 transition-all">變更預設貨幣 ⚙️</button>
                        </div>
                    </div>
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
        </main>
    );
};

export default Dashboard;
