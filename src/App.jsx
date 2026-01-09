import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonPrimary } from './constants/styles';
const TripDetailContent = lazy(() => import('./components/TripDetail/TripDetailContent'));
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, googleProvider, storage } from './firebase';
import {
    Plus, Trash2, MapPin, Calendar, Clock, DollarSign, User, Users, Sun, Cloud, CloudRain, Shield, Settings, LogOut, ChevronRight, X, Menu, Share2, Globe, Send, MessageCircle, FileText, CheckCircle, AlertCircle, Search, Filter, Camera, Download, Upload, AlertTriangle, Info, Loader2, Sparkles, LayoutGrid, List as ListIcon, Maximize2, Minimize2, CloudFog, CloudLightning, CloudSnow, MoveRight, ChevronLeft, CalendarDays, Bell, ChevronDown, LogIn, Map as MapIcon, BrainCircuit, Wallet, Plane, Bus, Train, Car, ShoppingBag, BedDouble, Receipt, CloudSun, Snowflake, Newspaper, TrendingUp, Siren, List, Star, Shirt, UserCircle, UserPlus, FileUp, Edit3, Lock, Save, RefreshCw, Route, MonitorPlay, CheckSquare, FileCheck, History, PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Phone, Globe2, Link as LinkIcon, Wifi, Utensils, Image, QrCode, Copy, Instagram, MapPinned, NotebookPen, Home, PiggyBank, Moon, Keyboard
} from 'lucide-react';
import { getExchangeRates, convertCurrency } from './services/exchangeRate';
import { getWeather, getWeatherInfo } from './services/weather';
import { exportToBeautifulPDF, exportToJSON, exportToImage } from './services/pdfExport';
import TripExportImportModal from './components/Modals/TripExportImportModal';
import SmartImportModal from './components/Modals/SmartImportModal';
import NotificationSystem from './components/Shared/NotificationSystem';
import OfflineBanner from './components/Shared/OfflineBanner';
import SyncStatus from './components/Shared/SyncStatus';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import { useNotifications } from './hooks/useNotifications';
import { checkAbuse } from './services/security';
import AIGeminiModal from './components/Modals/AIGeminiModal';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import OnboardingModal from './components/Modals/OnboardingModal';
import FeedbackModal from './components/Modals/FeedbackModal';
import VersionModal from './components/Modals/VersionModal'; // Imported
import VersionGuardModal from './components/Modals/VersionGuardModal'; // V1.1.8
import ReportCenterModal from './components/Modals/ReportCenterModal'; // V1.1.8
import AdminFeedbackModal from './components/Modals/AdminFeedbackModal';
import SettingsView from './components/Views/SettingsView'; // New View
import GlobalChatFAB from './components/Shared/GlobalChatFAB'; // V1.2.2 Global FAB
import UniversalChat from './components/Shared/UniversalChat'; // V1.2.1-Globalized
import OnboardingTour from './components/Shared/OnboardingTour'; // V1.2.4 Interactive Tutorial
import CommandPalette from './components/Shared/CommandPalette'; // V1.2.7 Global Search

// --- V0.16.2 Refactored Imports ---
import {
    APP_VERSION, APP_AUTHOR, APP_LAST_UPDATE, ADMIN_EMAILS,
    DEFAULT_BG_IMAGE, CITY_COORDS, COUNTRIES_DATA, INFO_DB,
    SIMULATION_DATA, CURRENCIES, VERSION_HISTORY, JARVIS_VERSION, TIMEZONES, LANGUAGE_OPTIONS
} from './constants/appData';
import {
    glassCard, getHolidayMap, getLocalizedCountryName,
    getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getWeekday, getTripSummary, calculateDebts,
    getTimeDiff, getLocalCityTime, getWeatherForecast,
    buildDailyReminder, getUserInitial, inputClasses
} from './utils/tripUtils';
import { suggestTransportBetweenSpots, checkAIUsageLimit } from './services/ai-parsing';

import Dashboard from './components/Dashboard/Dashboard';
import CreateTripModal from './components/Modals/CreateTripModal';
import DashboardSkeleton from './components/Loaders/DashboardSkeleton';
import ImageWithFallback from './components/Shared/ImageWithFallback';
import HttpStatusPage from './components/Shared/HttpStatusPage';



// --- 0. Constants & Data ---
















// --- 0. Constants & Data ---
// (Moved to appData.js)

// --- Components ---

const Footer = ({ isDarkMode, onOpenVersion }) => {
    const [time, setTime] = useState(new Date());
    const { i18n } = useTranslation();

    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    // Language toggle: cycles zh-HK -> zh-TW -> en -> zh-HK
    const LANG_CYCLE = ['zh-HK', 'zh-TW', 'en'];
    const LANG_LABELS = { 'zh-HK': '粵', 'zh-TW': '繁', 'en': 'EN' };
    const currentLang = i18n.language || 'zh-HK';

    const handleLangToggle = () => {
        const currentIdx = LANG_CYCLE.indexOf(currentLang);
        const nextIdx = (currentIdx + 1) % LANG_CYCLE.length;
        const nextLang = LANG_CYCLE[nextIdx];
        i18n.changeLanguage(nextLang);
        localStorage.setItem('travelTogether_language', nextLang);
    };

    return (
        <footer className={`mt-12 pt-6 pb-12 border-t text-center text-xs md:text-sm flex flex-col items-center justify-center gap-1 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'} pb-[calc(1.5rem+env(safe-area-inset-bottom))]`}>
            <div className="flex flex-wrap gap-2 items-center justify-center font-bold">
                <span data-tour="app-version">Travel Together {APP_VERSION}</span>
                <span className="opacity-30">|</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 font-bold">Jarvis {JARVIS_VERSION}</span>
                <span>•</span>
                <button
                    onClick={onOpenVersion}
                    className="px-2 py-0.5 rounded-full border border-indigo-400 text-indigo-500 text-[10px] md:text-xs hover:bg-indigo-500 hover:text-white transition"
                >
                    版本更新內容
                </button>
                <span>•</span>
                {/* Language Switcher Dropdown */}
                <select
                    value={currentLang}
                    onChange={(e) => {
                        i18n.changeLanguage(e.target.value);
                        localStorage.setItem('travelTogether_language', e.target.value);
                    }}
                    className={`px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-black cursor-pointer outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-emerald-500/50 text-emerald-400 hover:border-emerald-400' : 'bg-white border-emerald-500 text-emerald-600 hover:border-emerald-400'}`}
                    title="選擇語言"
                >
                    <option value="zh-HK">🌐 粵語</option>
                    <option value="zh-TW">🌐 繁體</option>
                    <option value="en">🌐 English</option>
                </select>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Design with ❤️</span>
            </div>
            <div className="font-mono flex flex-col md:flex-row items-center gap-1 md:gap-3 opacity-60 mt-1">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="opacity-50 text-[10px] hidden sm:inline">({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                </div>
                <span className="hidden md:inline">|</span>
                <span data-tour="sync-status">
                    <SyncStatus isDarkMode={isDarkMode} />
                </span>
            </div>
        </footer>
    );
};

// --- Header ---
const Header = ({ title, onBack, user, isDarkMode, toggleDarkMode, onLogout, onTutorialStart, onViewChange, onOpenUserSettings, onOpenVersion, notifications = [], onRemoveNotification, onMarkNotificationsRead, onNotificationClick, onOpenFeedback, onOpenAdminFeedback, isAdmin, adminPendingCount = 0 }) => { // Added Admin props
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        const next = !showNotif;
        setShowNotif(next);
        if (!showNotif && onMarkNotificationsRead) onMarkNotificationsRead();
    };

    const handleClearAll = () => {
        if (confirm("確定清除所有通知？")) {
            if (onRemoveNotification) {
                notifications.forEach(n => onRemoveNotification(n.id));
            }
        }
    };

    const [notifTab, setNotifTab] = useState('all');
    const filteredNotifs = notifications.filter(n => {
        if (notifTab === 'all') return true;
        if (notifTab === 'alert') return n.type === 'warning' || n.type === 'error';
        if (notifTab === 'system') return n.type === 'success' || n.type === 'info';
        return true;
    });

    return (
        <header className={`fixed top-0 left-0 right-0 z-[50] p-4 pt-[max(1rem,env(safe-area-inset-top))] transition-all duration-300 ${isDarkMode ? 'bg-gray-900/80 border-b border-white/5' : 'bg-gray-50/80 border-b border-gray-200/50'} shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {onBack && <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10 btn-press" aria-label="返回"><ChevronLeft /></button>}
                    <h1 className="text-lg font-bold truncate cursor-pointer" onClick={() => onViewChange && onViewChange('dashboard')}>{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {onTutorialStart && (
                        <>
                            <button onClick={() => onViewChange && onViewChange('tutorial')} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 btn-press">
                                <MonitorPlay className="w-4 h-4" /> 模擬例子
                            </button>
                            <button onClick={onTutorialStart} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 btn-press">
                                <Route className="w-4 h-4" /> 教學
                            </button>
                        </>
                    )}

                    {/* Notification */}
                    <div className="relative">
                        <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press" aria-label="通知中心">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        {showNotif && <div className={`absolute top-12 right-0 w-96 p-4 rounded-xl shadow-2xl border z-50 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
                            <div className="flex justify-between items-center border-b border-gray-500/10 pb-2 mb-2">
                                <h4 className="font-bold text-sm">通知中心</h4>
                                <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 btn-press"><Trash2 className="w-3 h-3" /> 清除全部</button>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-1 mb-2">
                                {[{ id: 'all', label: '全部' }, { id: 'alert', label: '警報' }, { id: 'system', label: '系統' }].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setNotifTab(t.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${notifTab === t.id ? 'bg-indigo-500 text-white' : 'hover:bg-gray-500/10 opacity-60'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {filteredNotifs.length === 0 ? (
                                    <div className="text-xs opacity-60 text-center py-6">目前沒有相關通知。</div>
                                ) : filteredNotifs.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => n.context && onNotificationClick?.(n)}
                                        className={`p-3 rounded-lg border border-gray-500/20 text-xs flex flex-col gap-1 bg-white/5 transition-colors ${n.context ? 'cursor-pointer hover:bg-white/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <span className={`font-semibold ${n.type === 'warning' || n.type === 'error' ? 'text-orange-400' : ''}`}>{n.title || '系統通知'}</span>
                                            <button onClick={(e) => { e.stopPropagation(); onRemoveNotification && onRemoveNotification(n.id); }} className="text-red-400 hover:text-red-600" aria-label="移除通知"><X className="w-3 h-3" /></button>
                                        </div>
                                        <p className="opacity-80 leading-relaxed">{n.message}</p>
                                        <div className="flex justify-between text-[10px] opacity-60 mt-1">
                                            <span>{n.time}</span>
                                            {n.url ? (
                                                <a href={n.url} target="_blank" onClick={(e) => e.stopPropagation()} className="text-indigo-400 flex items-center gap-1">查看專頁<ArrowUpRight className="w-3 h-3" /></a>
                                            ) : n.context && (
                                                <span className="text-indigo-400 flex items-center gap-1">立即跳轉<ChevronRight className="w-3 h-3" /></span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </div>

                    {/* Hover Menu */}
                    <div className="relative" onMouseEnter={() => setHoverMenu(true)} onMouseLeave={() => setHoverMenu(false)}>
                        <button onClick={() => setHoverMenu(!hoverMenu)} className="p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all btn-press" aria-label="用戶選單">
                            {user ? (
                                user.photoURL && !photoError ? (
                                    <ImageWithFallback
                                        src={user.photoURL}
                                        className="w-8 h-8 rounded-full object-cover"
                                        alt="user"
                                        type="avatar"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                        {getUserInitial(user.displayName || user.email)}
                                    </div>
                                )
                            ) : <UserCircle className="w-8 h-8" />}
                            {isAdmin && adminPendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
                        </button>
                        <div className={`absolute top-10 right-0 w-64 pt-4 transition-all duration-300 origin-top-right ${hoverMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                            <div className={`rounded-xl shadow-2xl border overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10 text-white' : 'bg-white/95 border-gray-200 text-gray-800'}`}>
                                <div className="p-4 border-b border-gray-500/10">
                                    <p className="font-bold truncate">{user?.displayName}</p>
                                    <p className="text-xs opacity-50 truncate">{user?.email}</p>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    <button onClick={() => { setHoverMenu(false); onViewChange('dashboard'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Home className="w-4 h-4" /> 我的行程</button>
                                    <button onClick={() => { setHoverMenu(false); onViewChange('tutorial'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden`}><MonitorPlay className="w-4 h-4 text-indigo-500" /> 模擬例子</button>
                                    <button onClick={() => { setHoverMenu(false); onTutorialStart(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden`}><Route className="w-4 h-4 text-emerald-500" /> 引導教學</button>
                                    <button onClick={() => { setHoverMenu(false); onOpenUserSettings(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit3 className="w-4 h-4" /> 個人設定</button>
                                    <button onClick={() => { setHoverMenu(false); onOpenFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><MessageCircle className="w-4 h-4" /> 意見回饋</button>
                                    {isAdmin && (
                                        <button onClick={() => { setHoverMenu(false); onOpenAdminFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="relative">
                                                <Shield className="w-4 h-4 text-indigo-500" />
                                                {adminPendingCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                            </div>
                                            管理員後台
                                            {adminPendingCount > 0 && <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{adminPendingCount}</span>}
                                        </button>
                                    )}
                                    <button onClick={() => { setHoverMenu(false); onOpenVersion(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><History className="w-4 h-4" /> 版本資訊</button>
                                    <div className="h-px bg-gray-500/10 my-1"></div>
                                    <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        切換模式
                                    </button>
                                    <button onClick={onLogout} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-red-500 transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}><LogOut className="w-4 h-4" /> 登出</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </header >
    );
};

// --- Modals ---




// --- Settings View replaces SettingsModal ---

// --- Version Modal moved to components/Modals/VersionModal.jsx ---



// --- Active Users Presence Component ---





// --- Files & Attachments Tab ---

// --- Trip Detail Wrapper (handles ALL data loading, TripDetailContent only renders when trip is ready) ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates, onOpenSmartImport, weatherData, onUpdateSimulationTrip, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin, onOpenChat }) => {

    // ALL hooks in wrapper - consistent on every render
    const [realTrip, setRealTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(!isSimulation);
    const [error, setError] = useState(null);

    // Data loading effect
    useEffect(() => {
        if (isSimulation) {
            setIsLoading(false);
            return;
        }
        if (!tripData?.id) {
            setError("Invalid trip data");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        const unsub = onSnapshot(doc(db, "trips", tripData.id),
            (d) => {
                if (d.exists()) {
                    setRealTrip({ id: d.id, ...d.data() });
                } else {
                    setError("Trip not found");
                }
                setIsLoading(false);
            },
            (err) => {
                console.error("Error loading trip:", err);
                setError(err.message);
                setIsLoading(false);
            }
        );
        return () => unsub();
    }, [tripData?.id, isSimulation]);

    // Compute final trip
    const trip = isSimulation ? tripData : realTrip;

    // State for Currency Tab
    const [convAmount, setConvAmount] = useState(1000);
    const [convTo, setConvTo] = useState('JPY');

    useEffect(() => {
        if (trip?.country) {
            const country = trip.country;
            if (country.includes('Japan') || country.includes('日本')) setConvTo('JPY');
            else if (country.includes('Taiwan') || country.includes('台灣')) setConvTo('TWD');
            else if (country.includes('Korea') || country.includes('韓國')) setConvTo('KRW');
            else if (country.includes('US') || country.includes('美國')) setConvTo('USD');
            else if (country.includes('UK') || country.includes('英國')) setConvTo('GBP');
            else if (country.includes('Europe') || country.includes('歐洲')) setConvTo('EUR');
        }
    }, [trip?.country]);

    if (isLoading) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-500" />
                <div className="mt-4 text-lg opacity-70">載入行程中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4 text-xl">⚠️ {error}</div>
                <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">返回</button>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-yellow-500 mb-4 text-xl">⚠️ 無法載入行程</div>
                <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">返回</button>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-indigo-500" /></div>}>
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
            />
        </Suspense>
    );
};



// --- Trip Detail Content (UI only - trip is GUARANTEED to exist) ---
// No data loading here - all hooks will always execute consistently
const App = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [globalBg, setGlobalBg] = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"); // Default BG
    const [globalSettings, setGlobalSettings] = useState({
        notifications: true,
        sound: true,
        currency: 'HKD',
        region: 'HK', // Default to Hong Kong
        language: 'zh-TW', // Default to Traditional Chinese
        preferences: [], // Default preferences
        useCustomKeys: false, // V1.2.8
        aiKeys: {} // V1.2.8
    });
    const [previewTrip, setPreviewTrip] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState('general'); // V1.0.3: Support direct navigation to specific settings tab
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    // Version Check
    useEffect(() => {
        const storedVersion = localStorage.getItem('app_version');
        if (storedVersion !== APP_VERSION) {
            setIsVersionOpen(true);
            localStorage.setItem('app_version', APP_VERSION);
        }
    }, [setIsVersionOpen]);

    // --- URL Routing for Sharing ---
    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/share/')) {
            const tripId = path.split('/')[2];
            if (tripId) {
                setIsLoading(true);
                getDoc(doc(db, "trips", tripId)).then(snap => {
                    if (snap.exists()) {
                        const tripData = snap.data();
                        if (tripData.isPublic) {
                            setPreviewTrip({ id: tripId, ...tripData });
                            setIsPreviewMode(true);
                            setView('detail');
                            if (tripData.sharePermission === 'edit' && !user?.uid) {
                                // Optional: You might want to show a toast or message that they need to login to edit
                                // Can edit if logged in
                            }
                        } else {
                            setView('404');
                        }
                    } else {
                        setView('404');
                    }
                    setIsLoading(false);
                }).catch(err => {
                    console.error("Error loading shared trip:", err);
                    setIsLoading(false);
                    setView('404');
                });
            } else {
                setView('404');
            }
        }

        // --- Handle Direct View Params (?view=tutorial) ---
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        if (viewParam === 'tutorial') {
            setView('tutorial');
            // Clean up URL without reload
            window.history.replaceState({}, '', '/');
        }
    }, []);

    // Fetch Global Trips for Search (V1.2.7)
    useEffect(() => {
        if (!user) {
            setTrips([]);
            setLoadingTrips(false);
            return;
        }
        const q = query(collection(db, "trips"));
        const unsub = onSnapshot(q, s => {
            const userTrips = s.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(t => t.members?.some(m => m.id === user.uid || m.id === user.email));
            setTrips(userTrips);
            setLoadingTrips(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setLoadingTrips(false);
        });
        return () => unsub();
    }, [user]);

    // Load User Settings from Firebase
    useEffect(() => {
        if (user?.uid) {
            getDoc(doc(db, "users", user.uid)).then(snap => {
                if (snap.exists() && snap.data().settings) {
                    setGlobalSettings(prev => ({ ...prev, ...snap.data().settings }));
                }
            });
        }
    }, [user]);

    // Save User Settings to Firebase (Debounced roughly by effect behavior)
    useEffect(() => {
        if (user?.uid) {
            const timer = setTimeout(() => {
                setDoc(doc(db, "users", user.uid), { settings: globalSettings }, { merge: true });
            }, 1000); // Debounce 1s
            return () => clearTimeout(timer);
        }
    }, [globalSettings, user]);

    // Modals State
    // isSettingsOpen state removed
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isReportCenterOpen, setIsReportCenterOpen] = useState(false); // V1.1.8 Report Center

    // Import/Export Modals State
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedImportTrip, setSelectedImportTrip] = useState(null); // For targeting import
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedExportTrip, setSelectedExportTrip] = useState(null); // For targeting export
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Check for onboarding on login
    useEffect(() => {
        if (user && !localStorage.getItem('hasSeenOnboarding')) {
            // Delay slightly for better transition
            const timer = setTimeout(() => setIsOnboardingOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Cleanup Logic for Tutorial
    const cleanupTutorialData = async () => {
        // Cleaning up tutorial data...
        // 1. Mark as complete
        localStorage.setItem('hasSeenOnboarding', 'true');

        // 2. Remove tutorial-specific params from URL if present
        if (view === 'tutorial') {
            setView('dashboard');
            window.history.replaceState({}, '', '/');
        }

        // 3. Clear any tutorial-specific session data if exists
        // (Currently OnboardingTour doesn't create persistent bad data, mainly UI overlay)
        // Future proofing: If we add temp trips, delete them here.
    };

    // V1.0.3: Auto-show Version Modal when version changes (App or Jarvis)
    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('app_last_seen_version');
        const lastSeenJarvisVersion = localStorage.getItem('jarvis_last_seen_version');
        const isNewAppVersion = lastSeenVersion !== APP_VERSION;
        const isNewJarvisVersion = lastSeenJarvisVersion !== JARVIS_VERSION;

        if ((isNewAppVersion || isNewJarvisVersion) && user) {
            // Delay to ensure onboarding closes first if applicable
            const timer = setTimeout(() => {
                // Only show if onboarding is already done (or returning users)
                if (localStorage.getItem('hasSeenOnboarding')) {
                    setIsVersionOpen(true);
                    localStorage.setItem('app_last_seen_version', APP_VERSION);
                    localStorage.setItem('jarvis_last_seen_version', JARVIS_VERSION);
                }
            }, 2500); // Slightly longer delay to accommodate onboarding
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Handle Onboarding close to trigger version modal for new users
    const handleOnboardingComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsOnboardingOpen(false);
        // After onboarding, check if version modal should show (App or Jarvis)
        const lastSeenVersion = localStorage.getItem('app_last_seen_version');
        const lastSeenJarvisVersion = localStorage.getItem('jarvis_last_seen_version');
        if (lastSeenVersion !== APP_VERSION || lastSeenJarvisVersion !== JARVIS_VERSION) {
            setTimeout(() => {
                setIsVersionOpen(true);
                localStorage.setItem('app_last_seen_version', APP_VERSION);
                localStorage.setItem('jarvis_last_seen_version', JARVIS_VERSION);
            }, 500);
        }
    };

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInitialTab, setChatInitialTab] = useState('trip'); // 'trip' or 'jarvis' // Global Chat State
    const [showOnboardingTour, setShowOnboardingTour] = useState(false); // V1.2.4 Interactive Tutorial

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAdminFeedbackModalOpen, setIsAdminFeedbackModalOpen] = useState(false);
    const [openFeedbackCount, setOpenFeedbackCount] = useState(0);

    const [dynamicAdminEmails, setDynamicAdminEmails] = useState([]);
    const [isBanned, setIsBanned] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Dynamic Admin List from Firestore
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "admin_config"), (doc) => {
            if (doc.exists() && doc.data().admin_emails) {
                setDynamicAdminEmails(doc.data().admin_emails);
            }
        });
        return () => unsub();
    }, []);

    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || dynamicAdminEmails.includes(user.email));

    // V1.2.7 Global Search listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Admin: Listen for open feedbacks
    useEffect(() => {
        if (!isAdmin) return;
        const q = query(collection(db, "feedback"), where("status", "==", "open"));

        let isFirstLoad = true;
        const unsub = onSnapshot(q, (snapshot) => {
            setOpenFeedbackCount(snapshot.size);

            if (!isFirstLoad) {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data();
                        // Real-time notification
                        sendNotification(
                            "收到新意見回饋",
                            `${data.userName || '用戶'}提交了${data.type === 'bug' ? '錯誤回報' : '建議'}`,
                            "info",
                            () => setIsAdminFeedbackModalOpen(true) // Click to open admin panel
                        );
                    }
                });
            }
            isFirstLoad = false;
        });
        return () => unsub();
    }, [isAdmin]);

    // Create Trip Form State
    const [newCityInput, setNewCityInput] = useState("");
    const [form, setForm] = useState({
        name: "",
        startDate: "",
        endDate: "",
        budget: "",
        travelers: 1,
        countries: [],
        cities: []
    });

    // Dark Mode Effect
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    // V1.2.4: Listen for onboarding tour trigger from Settings
    useEffect(() => {
        const handleStartTour = () => setShowOnboardingTour(true);
        window.addEventListener('START_ONBOARDING_TOUR', handleStartTour);
        return () => window.removeEventListener('START_ONBOARDING_TOUR', handleStartTour);
    }, []);

    // --- Notification System Hook ---
    const { notifications, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

    // --- Version Guard & Confetti State ---
    const [latestVersion, setLatestVersion] = useState(APP_VERSION);
    const [isVersionGuardOpen, setIsVersionGuardOpen] = useState(false);

    // Import Confetti dynamically to avoid heavy bundle
    const triggerConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#818cf8', '#c7d2fe', '#ffffff'] // Indigo theme
        });
    };

    // --- Version Check (Firestore) ---
    useEffect(() => {
        // Listen to global settings for latest version
        const unsub = onSnapshot(doc(db, "settings", "system"), (doc) => {
            if (doc.exists() && doc.data().latestVersion) {
                const remoteVer = doc.data().latestVersion;
                setLatestVersion(remoteVer);

                // Compare versions (Simple string comparison sufficient for V1.x.x format)
                // In production, use semver-compare if versioning gets complex
                if (remoteVer > APP_VERSION) {
                    setIsVersionGuardOpen(true);
                } else {
                    setIsVersionGuardOpen(false);
                }
            }
        });
        return () => unsub();
    }, []);

    // --- Update Success Logic (Local Cache) ---
    // Only shows "update success" if the RUNNING code version (APP_VERSION) is NEWER than what user last saw
    // This prevents showing "success" on old cached PWA before user actually refreshes
    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('app_version_cache');

        // Only celebrate if:
        // 1. User has a cached version (returning user)
        // 2. The running code version is different from cached (means they actually got new code)
        if (lastSeenVersion && lastSeenVersion !== APP_VERSION) {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

            setTimeout(() => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                sendNotification(
                    `已成功更新至 ${APP_VERSION}`,
                    `${isPWA ? 'App' : '網頁'}已升級至最新版本，享受更佳體驗！`,
                    "success",
                    { time: timeStr }
                );

                triggerConfetti();
                setIsVersionOpen(true);

            }, 1000);
        }

        // Always save current running version to cache
        localStorage.setItem('app_version_cache', APP_VERSION);
    }, [sendNotification]);

    // BYOK State
    const [userGeminiKey, setUserGeminiKey] = useState("");
    const [userMapsKey, setUserMapsKey] = useState("");
    const [userGeminiModel, setUserGeminiModel] = useState("");
    const [userGeminiLimit, setUserGeminiLimit] = useState("");

    // Load Settings from LocalStorage
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
        if (savedSettings.preference) {
            setGlobalSettings(prev => ({ ...prev, preferences: savedSettings.preference }));
        }
        if (savedSettings.userGeminiKey) setUserGeminiKey(savedSettings.userGeminiKey);
        if (savedSettings.userMapsKey) {
            setUserMapsKey(savedSettings.userMapsKey);
            setGlobalSettings(prev => ({ ...prev, userMapsKey: savedSettings.userMapsKey }));
        }
        if (savedSettings.userGeminiModel) setUserGeminiModel(savedSettings.userGeminiModel);
        if (savedSettings.userGeminiLimit) setUserGeminiLimit(savedSettings.userGeminiLimit);
        if (savedSettings.dataSaver) setGlobalSettings(prev => ({ ...prev, dataSaver: savedSettings.dataSaver }));

        // Check Ban Status
        const checkBanStatus = async () => {
            // ... logic if needed, or leave empty if handled elsewhere
        };
        if (user) checkBanStatus();
    }, [user?.uid]);

    // 新增：匯率與天氣狀態
    const [exchangeRates, setExchangeRates] = useState(null);
    const [weatherData, setWeatherData] = useState({}); // {[CityName]: weatherObj }
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    // --- External Data Fetching (Weather & Rates) ---
    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            // 1. Fetch Rates
            const rates = await getExchangeRates('HKD');
            setExchangeRates(rates);

            // 2. Fetch Weather (Targeted & Staggered)
            setIsLoadingWeather(true);
            const newWeatherData = {};

            // Get cities from active selection or fallback to defaults
            const activeCities = new Set();
            if (view === 'detail' && selectedTrip?.city) {
                activeCities.add(selectedTrip.city);
            }

            // Note: Since 'trips' list is currently local to Dashboard.jsx, we prioritize current trip + defaults.
            const targetCities = activeCities.size > 0
                ? Array.from(activeCities)
                : ["Tokyo", "Taipei", "London", "Osaka", "Seoul", "Bangkok"];

            for (let i = 0; i < targetCities.length; i++) {
                const city = targetCities[i];
                // Case-insensitive lookup for coordinates
                const cityKey = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === city.toLowerCase());
                const coords = CITY_COORDS[cityKey || city];

                if (coords) {
                    // Check backoff BEFORE calling service to avoid noise
                    const backoff = localStorage.getItem('weather_api_backoff');
                    if (backoff && (Date.now() - parseInt(backoff) < 1800000)) { // 30 mins
                        // Try to use cache silently
                        const cached = localStorage.getItem(`weather_cache_${city}`);
                        if (cached) {
                            const { data: cachedData } = JSON.parse(cached);
                            if (cachedData?.current) {
                                const info = getWeatherInfo(cachedData.current.weathercode);
                                newWeatherData[city] = {
                                    temp: `${Math.round(cachedData.current.temperature_2m)}°C`,
                                    desc: info.desc,
                                    icon: info.icon,
                                    details: cachedData
                                };
                            }
                        }
                        continue;
                    }

                    const { lat, lon } = coords;
                    try {
                        const data = await getWeather(lat, lon, city);
                        if (data) {
                            const currentTemp = data.current?.temperature_2m;
                            const maxTemp = data.daily?.temperature_2m_max?.[0]; // Get today's max
                            const minTemp = data.daily?.temperature_2m_min?.[0]; // Get today's min

                            // Use Max/Min format to trigger split clothing logic
                            // Fallback to current temp if daily is missing (unlikely with this API call)
                            const tempDisplay = (maxTemp !== undefined && minTemp !== undefined)
                                ? `${Math.round(maxTemp)}°C / ${Math.round(minTemp)}°C`
                                : `${Math.round(currentTemp)}°C`;

                            const weatherCode = data.current?.weathercode;
                            const info = getWeatherInfo(weatherCode);

                            newWeatherData[city] = {
                                temp: tempDisplay,
                                desc: info.desc,
                                icon: info.icon,
                                details: data
                            };
                        }
                    } catch (err) {
                        console.warn(`[App] Weather fetch failed for ${city}:`, err.message);
                    }

                    // Stagger intentional delay to respect API
                    if (i < targetCities.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            setTimeout(() => {
                setWeatherData(newWeatherData);
                setIsLoadingWeather(false);
            }, 1500);
        }

        fetchData();
    }, [user]);

    // --- Smart Notification Engine (Context-Aware) ---
    useEffect(() => {
        if (!user || !globalSettings.notifications) return;

        const checkContextualNotifications = async () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // 1. Weather Logic: Only notify when user is at trip destination
            if (selectedTrip && view === 'detail') {
                const isOngoing = todayStr >= selectedTrip.startDate && todayStr <= selectedTrip.endDate;
                if (isOngoing && selectedTrip.city && weatherData[selectedTrip.city]) {
                    const cityWeather = weatherData[selectedTrip.city];
                    const hasRain = cityWeather.desc && (cityWeather.desc.includes('雨') || cityWeather.desc.includes('Rain'));

                    if (hasRain) {
                        const key = `weather_contextual_${selectedTrip.id}_${todayStr}`;
                        if (!sessionStorage.getItem(key)) {
                            sendNotification(
                                `🌧️ 當地天氣預警: ${selectedTrip.city}`,
                                `你目前身處 ${selectedTrip.city}，預計今日有${cityWeather.desc}，記得帶傘或調整室內行程！`,
                                "warning",
                                { tripId: selectedTrip.id, view: 'detail', tab: 'itinerary' }
                            );
                            sessionStorage.setItem(key, 'true');
                        }
                    }
                }
            }


            // 2. Flight / Transport Reminders
            if (selectedTrip && view === 'detail') {
                const todayItems = selectedTrip.itinerary?.[todayStr] || [];
                todayItems.forEach(item => {
                    if (item.type === 'flight' || item.type === 'transport') {
                        const itemTime = item.details?.time || item.time;
                        if (itemTime) {
                            const [h, m] = itemTime.split(':').map(Number);
                            const itemDate = new Date();
                            itemDate.setHours(h, m, 0);

                            const diffMs = itemDate - now;
                            const diffMins = Math.floor(diffMs / 60000);

                            // Notify 3 hours before flight, 30 mins before transport
                            const threshold = item.type === 'flight' ? 180 : 30;
                            if (diffMins > 0 && diffMins <= threshold) {
                                const key = `trip_item_reminder_${item.id}`;
                                if (!sessionStorage.getItem(key)) {
                                    sendNotification(
                                        `🕒 ${item.type === 'flight' ? '航班' : '交通'}提醒`,
                                        `${item.name} 將於 ${itemTime} 開始，請預留時間出發。`,
                                        "info",
                                        { tripId: selectedTrip.id, view: 'detail', tab: 'itinerary' }
                                    );
                                    sessionStorage.setItem(key, 'true');
                                }
                            }
                        }
                    }
                });
            }

            // 3. User-defined Reminders
            if (selectedTrip?.reminders) {
                selectedTrip.reminders.forEach(reminder => {
                    if (!reminder.done && reminder.date === todayStr) {
                        const key = `reminder_trigger_${reminder.id}`;
                        if (!sessionStorage.getItem(key)) {
                            sendNotification(
                                `📌 行程提醒`,
                                reminder.title,
                                "info",
                                { tripId: selectedTrip.id, view: 'detail', tab: 'itinerary' }
                            );
                            sessionStorage.setItem(key, 'true');
                        }
                    }
                });
            }
        };

        const interval = setInterval(checkContextualNotifications, 300000); // Check every 5 mins
        checkContextualNotifications(); // Initial check
        return () => clearInterval(interval);

    }, [user, selectedTrip, view, weatherData, globalSettings.notifications, sendNotification]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // 1. Persistence & Update
                const userRef = doc(db, "users", currentUser.uid);
                await setDoc(userRef, {
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    lastLogin: serverTimestamp(),
                    uid: currentUser.uid
                }, { merge: true });

                // 2. Check Ban Status
                const snap = await getDoc(userRef);
                if (snap.exists() && snap.data().isBanned) {
                    setIsBanned(true);
                    sendNotification("帳戶警示", "您的帳戶已被鎖定，部分功能受限。", "error");
                } else {
                    setIsBanned(false);
                }
            } else {
                setIsBanned(false);
            }
        });
        return () => unsubscribe();
    }, [sendNotification]);



    const handleNotificationNavigate = (notif) => {
        if (!notif.context) return;
        const { tripId, view: targetView, tab: targetTab, itemId: targetItemId } = notif.context;

        // 1. Switch View
        if (targetView) setView(targetView);

        // 2. Tab switching logic is handled via props/state communication
        if (targetTab) {
            setRequestedTab(targetTab);
        }

        if (targetItemId) {
            setRequestedItemId(targetItemId);
        }

        // 3. Mark as read
        removeNotification(notif.id);
    };

    const [requestedTab, setRequestedTab] = useState(null);
    const [requestedItemId, setRequestedItemId] = useState(null);


    if (isLoading) {
        return <DashboardSkeleton isDarkMode={isDarkMode} />;
    }

    if (!user && !isPreviewMode && view !== 'tutorial') return <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />;

    return (
        <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500 font-sans selection:bg-indigo-500/30 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
            <NotificationSystem notifications={notifications} setNotifications={setNotifications} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
            <OfflineBanner isDarkMode={isDarkMode} />
            <ReloadPrompt />
            {/* Background Image (Global) */}
            <ImageWithFallback
                src={globalBg}
                className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000 object-cover w-full h-full"
                alt="Background"
            />
            {/* Fixed Header - Outside content wrapper for proper fixed positioning */}
            {view !== 'tutorial' && <Header title="✈️ Travel Together" user={user} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => signOut(auth)} onBack={(view !== 'dashboard' && view !== 'settings') ? () => setView('dashboard') : null} onTutorialStart={() => setShowOnboardingTour(true)} onViewChange={setView} onOpenUserSettings={() => setView('settings')} onOpenFeedback={() => setIsReportCenterOpen(true)} onOpenAdminFeedback={() => setIsAdminFeedbackModalOpen(true)} isAdmin={isAdmin} adminPendingCount={openFeedbackCount} onOpenVersion={() => setIsVersionOpen(true)} notifications={notifications} onRemoveNotification={removeNotification} onMarkNotificationsRead={markNotificationsRead} onNotificationClick={handleNotificationNavigate} />}
            <div className={`relative z-10 flex-grow pb-safe`} style={{ paddingTop: view !== 'tutorial' ? 'calc(72px + env(safe-area-inset-top, 0px))' : '0px' }}>
                {view === 'dashboard' && (
                    <div className="animate-fade-in">
                        <ErrorBoundary fallbackMessage="儀表板載入失敗，請重新整理" onOpenFeedback={() => setIsReportCenterOpen(true)}>
                            <Dashboard
                                user={user}
                                onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); setIsPreviewMode(false); }}
                                isDarkMode={isDarkMode}
                                setGlobalBg={setGlobalBg}
                                globalSettings={globalSettings}
                                exchangeRates={exchangeRates}
                                weatherData={weatherData}
                                isLoadingWeather={isLoadingWeather}
                                onViewChange={setView}
                                onOpenSettings={(tab) => { setSettingsInitialTab(tab || 'general'); setView('settings'); }}
                                isBanned={isBanned}
                                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                            />
                        </ErrorBoundary>
                    </div>
                )}
                {view === 'detail' && (
                    <div className="animate-slide-up">
                        <ErrorBoundary fallbackMessage="行程詳情載入失敗，請重新整理" onOpenFeedback={() => setIsReportCenterOpen(true)}>
                            <TripDetail
                                tripData={isPreviewMode ? previewTrip : selectedTrip}
                                user={user}
                                isDarkMode={isDarkMode}
                                setGlobalBg={setGlobalBg}
                                isSimulation={false}
                                isPreview={isPreviewMode}
                                globalSettings={globalSettings}
                                onBack={() => { setView('dashboard'); window.history.replaceState({}, '', '/'); }}
                                exchangeRates={exchangeRates}
                                weatherData={weatherData}
                                onOpenSmartImport={async () => {
                                    if (isBanned) return sendNotification("帳戶已鎖定", "您目前無法使用上傳功能。", "error");

                                    const isAbuse = await checkAbuse(user, 'upload_file');
                                    if (isAbuse) return sendNotification("帳戶已鎖定", "檢測到異常上傳活動。", "error");

                                    setSelectedImportTrip(isPreviewMode ? previewTrip : selectedTrip);
                                    setIsSmartImportModalOpen(true);
                                }}
                                onUpdateSimulationTrip={null}
                                requestedTab={requestedTab}
                                onTabHandled={() => setRequestedTab(null)}
                                requestedItemId={requestedItemId}
                                onItemHandled={() => setRequestedItemId(null)}
                                isBanned={isBanned}
                                isAdmin={isAdmin}
                                onOpenChat={() => setIsChatOpen(true)}
                            />
                        </ErrorBoundary>
                    </div>
                )}
                {view === 'settings' && (
                    <div className="animate-fade-in">
                        <SettingsView
                            globalSettings={globalSettings}
                            setGlobalSettings={setGlobalSettings}
                            isDarkMode={isDarkMode}
                            onBack={() => setView('dashboard')}
                            initialTab={settingsInitialTab}
                            user={user}
                            isAdmin={isAdmin}
                        />
                    </div>
                )}

                {['403', '404', '500', '503'].includes(view) && (
                    <HttpStatusPage
                        code={parseInt(view)}
                        isDarkMode={isDarkMode}
                        onBackHome={() => setView('dashboard')}
                        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                    />
                )}

                {view === 'tutorial' && <div className={`min-h-screen flex flex-col animate-fade-in ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}><div className={`p-4 border-b flex gap-4 items-center sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`} style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}><button onClick={() => { setView('dashboard'); setIsPreviewMode(false); }} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronLeft /></button><span className="font-bold">模擬模式 (東京範例)</span></div><div className="flex-grow overflow-y-auto"><TripDetail tripData={SIMULATION_DATA} user={user} isDarkMode={isDarkMode} setGlobalBg={() => { }} isSimulation={true} isPreview={false} globalSettings={globalSettings} exchangeRates={exchangeRates} weatherData={weatherData} onOpenSmartImport={() => setIsSmartImportModalOpen(true)} /></div></div>}
            </div>
            {view !== 'tutorial' && <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} />}
            {/* SettingsModal removed */}
            <OnboardingModal isOpen={isOnboardingOpen} onClose={handleOnboardingComplete} isDarkMode={isDarkMode} />

            {/* Global Chat / AI FAB */}
            {user && view !== 'tutorial' && !isChatOpen && (
                <GlobalChatFAB
                    isDarkMode={isDarkMode}
                    context={view === 'detail' ? 'trip' : 'default'}
                    onClick={() => {
                        // Priority: Open Trip Chat if in detail view, else Jarvis
                        setIsChatOpen(true);
                    }}
                />
            )}
            <VersionModal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} isDarkMode={isDarkMode} globalSettings={globalSettings} />
            <VersionGuardModal isOpen={isVersionGuardOpen} latestVersion={latestVersion} currentVersion={APP_VERSION} />
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} isDarkMode={isDarkMode} user={user} isBanned={isBanned} />
            <AdminFeedbackModal
                isOpen={isAdminFeedbackModalOpen}
                onClose={() => setIsAdminFeedbackModalOpen(false)}
                isDarkMode={isDarkMode}
                adminEmails={dynamicAdminEmails}
                onUpdateAdminList={(newList) => setDoc(doc(db, "settings", "admin_config"), { admin_emails: newList }, { merge: true })}
            />
            {/* Report Center (Replaces generic feedback for logged in users eventually, but side-by-side for now) */}
            <ReportCenterModal
                isOpen={isReportCenterOpen}
                onClose={() => setIsReportCenterOpen(false)}
                isDarkMode={isDarkMode}
                user={user}
                onOpenJarvis={() => { setIsReportCenterOpen(false); setIsChatOpen(true); }}
            />
            <SmartImportModal
                isOpen={isSmartImportModalOpen}
                onClose={() => setIsSmartImportModalOpen(false)}
                isDarkMode={isDarkMode}
                trips={[selectedTrip].filter(Boolean)}
                trip={selectedTrip}
                onImport={async ({ type, files, data }) => {
                    // Just show notification - modal will handle its own closing after showing result
                    const typeLabels = {
                        screenshot: '行程截圖',
                        receipt: '消費單據',
                        memory: '回憶相片',
                        json: 'JSON',
                        csv: 'CSV'
                    };
                    sendNotification(
                        `${typeLabels[type] || '檔案'}已接收 ✅`,
                        `${files?.[0]?.name || '檔案'} 已上傳`,
                        'success'
                    );
                }}
            />

            {/* Universal Chat & Jarvis AI System */}
            <UniversalChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                user={user}
                trip={selectedTrip}
                isDarkMode={isDarkMode}
                initialTab={view === 'detail' ? 'trip' : 'jarvis'}
            />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                trips={trips}
                activeTrip={selectedTrip}
                isDarkMode={isDarkMode}
                onAction={(item) => {
                    if (item.type === 'trip') {
                        setSelectedTrip(item.data);
                        setView('detail');
                    } else if (item.type === 'action') {
                        if (item.action === 'view-map') {
                            // If in trip, trigger view change
                            localStorage.setItem(`tripViewMode_${selectedTrip?.id || 'global'}`, 'map');
                            window.dispatchEvent(new CustomEvent('refreshTripView'));
                        } else if (item.action === 'ask-jarvis') {
                            setIsChatOpen(true);
                        } else if (item.action === 'view-kanban') {
                            localStorage.setItem(`tripViewMode_${selectedTrip?.id || 'global'}`, 'kanban');
                            window.dispatchEvent(new CustomEvent('refreshTripView'));
                        }
                    } else if (item.type === 'itinerary' || item.type === 'budget') {
                        // For itinerary/budget items, we stay in detail and maybe scroll
                        // For now just ensure we are in detail
                        if (view !== 'detail') setView('detail');
                    }
                }}
            />

            {/* V1.2.4: Interactive Onboarding Tour */}
            <OnboardingTour
                run={showOnboardingTour}
                onComplete={() => {
                    setShowOnboardingTour(false);
                    cleanupTutorialData(); // Ensure cleanup runs
                }}
                isDarkMode={isDarkMode}
            />

        </div>
    );
};

// --- Other Components (LandingPage) ---
const LandingPage = ({ onLogin }) => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[85vh]">
            <div className="col-span-1 md:col-span-2 relative rounded-3xl overflow-hidden group min-h-[500px] md:min-h-0">
                <ImageWithFallback
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Travel Together Destination"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white z-10 pr-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2 md:mb-4">Travel Together</h1>
                    <p className="text-lg md:text-2xl opacity-90 mb-6 md:mb-8">下一站，與你同行。</p>
                    <div className="flex flex-col gap-3 max-w-sm">
                        <button onClick={onLogin} className="bg-white text-black px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 transition flex flex-col items-center gap-1 w-full shadow-lg">
                            <div className="flex items-center gap-2"><LogIn className="w-5 h-5" /> Google 登入</div>
                            <span className="text-[10px] opacity-50 font-normal hidden sm:inline">支援 Google 帳戶註冊並安裝為 PWA 使用</span>
                        </button>
                        <button onClick={() => window.location.href = '/?view=tutorial'} className="bg-white/10 text-white px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-white/20 transition flex items-center justify-center gap-2 w-full border border-white/10 group/demo backdrop-blur-sm">
                            <MonitorPlay className="w-5 h-5 text-indigo-400 group-hover/demo:animate-pulse" />
                            試用模擬模式 (免登入)
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-rows-3 gap-4 md:gap-6">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <Users className="w-12 h-12 opacity-50" />
                    <div><h3 className="text-2xl font-bold">多人協作</h3><p className="opacity-70">實時同步，共同規劃。</p></div>
                </div>
                <div className="bg-gray-800 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <BrainCircuit className="w-12 h-12 text-pink-500 opacity-80" />
                    <div><h3 className="text-2xl font-bold">Jarvis 領隊</h3><p className="opacity-70">智慧推薦行程與美食。</p></div>
                </div>
                <div className="bg-gray-800 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <Wallet className="w-12 h-12 text-green-500 opacity-80" />
                    <div><h3 className="text-2xl font-bold">智慧分帳</h3><p className="opacity-70">自動計算債務，輕鬆結算。</p></div>
                </div>
            </div>
        </div>
    </div>
);

export default App;