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
// Lazy Load Heavy Modals
const CreateTripModal = lazy(() => import('./components/Modals/CreateTripModal'));
const TripExportImportModal = lazy(() => import('./components/Modals/TripExportImportModal')); // Check usage
const SmartImportModal = lazy(() => import('./components/Modals/SmartImportModal'));
const AIGeminiModal = lazy(() => import('./components/Modals/AIGeminiModal')); // Check usage
const UniversalOnboarding = lazy(() => import('./components/Modals/UniversalOnboarding'));
const FeedbackModal = lazy(() => import('./components/Modals/FeedbackModal'));
const VersionModal = lazy(() => import('./components/Modals/VersionModal'));
const VersionGuardModal = lazy(() => import('./components/Modals/VersionGuardModal'));
const ReportCenterModal = lazy(() => import('./components/Modals/ReportCenterModal'));
const AdminFeedbackModal = lazy(() => import('./components/Modals/AdminFeedbackModal'));
const SettingsView = lazy(() => import('./components/Views/SettingsView'));

import NotificationSystem from './components/Shared/NotificationSystem';
import OfflineBanner from './components/Shared/OfflineBanner';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import { useNotifications } from './hooks/useNotifications';
import { getMockTripDetails } from './constants/publicTripsData'; // V1.3.6: Mock Data Generator
import { checkAbuse } from './services/security';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import GlobalChatFAB from './components/Shared/GlobalChatFAB'; // V1.2.2 Global FAB
import UniversalChat from './components/Shared/UniversalChat'; // V1.2.1-Globalized
import OnboardingTour from './components/Shared/OnboardingTour'; // V1.2.4 Interactive Tutorial
import { TourProvider, useTour } from './contexts/TourContext'; // V1.3.4 Interactive Product Tour
import TourOverlay from './components/Tour/TourOverlay'; // V1.3.4 Interactive Product Tour

import CommandPalette from './components/Shared/CommandPalette'; // V1.2.7 Global Search
import SocialProfile from './components/Social/Profile/SocialProfile'; // V1.3.0 Profile
import Footer from './components/Shared/Footer'; // V1.3.1 Clean Architecture
import useGlobalShortcuts from './hooks/useGlobalShortcuts'; // V1.3.5 Global Shortcuts
// Duplicate removed
import Kbd from './components/Shared/Kbd'; // V1.3.5 UI Polish
import { SEO } from './components/Shared/SEO'; // V1.6.0 SEO
import TripDetailSkeleton from './components/Loaders/TripDetailSkeleton'; // V1.6.0 Skeleton

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
// CreateTripModal is lazy loaded above
import DashboardSkeleton from './components/Loaders/DashboardSkeleton';
import ImageWithFallback from './components/Shared/ImageWithFallback';
import HttpStatusPage from './components/Shared/HttpStatusPage';
import LandingPage from './components/Landing/LandingPage'; // V1.6.0 Refactor



// --- 0. Constants & Data ---
















// --- 0. Constants & Data ---
// (Moved to appData.js)

// --- Components ---



// --- Header ---
const Header = ({ title, onBack, user, isDarkMode, toggleDarkMode, onLogout, onTutorialStart, onViewChange, onOpenUserSettings, onOpenVersion, notifications = [], onRemoveNotification, onMarkNotificationsRead, onNotificationClick, onOpenFeedback, onOpenAdminFeedback, isAdmin, adminPendingCount = 0, activeView, allTrips = [] }) => { // Added allTrips prop
    const { t } = useTranslation();
    const { startTour } = useTour(); // V1.3.4: Use Interactive Tour
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // V1.3.5 Global Shortcuts Logic
    useGlobalShortcuts({
        onProfile: () => setHoverMenu(prev => !prev),
        onNotifications: () => {
            setShowNotif(prev => {
                const next = !prev;
                if (!next && onMarkNotificationsRead) onMarkNotificationsRead();
                return next;
            });
        },
        onHelp: startTour
    });

    // Mini Profile Stats Calculation
    const stats = React.useMemo(() => {
        if (!user || !allTrips.length) return { countries: 0, trips: 0, continents: 0 };
        // Filter trips for current user
        const myTrips = allTrips.filter(t => t.members?.some(m => m.id === user.uid));
        const countries = new Set(myTrips.map(t => t.country).filter(Boolean));
        const continents = new Set(Array.from(countries).map(c => COUNTRIES_DATA[c]?.continent).filter(Boolean));
        return {
            countries: countries.size,
            trips: myTrips.length,
            continents: continents.size
        };
    }, [user, allTrips]);
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
                    {onBack && (
                        <div className="relative group">
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10 btn-press" aria-label="返回"><ChevronLeft /></button>
                            {/* Tooltip with Kbd */}
                            <div className="absolute left-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">Back</span>
                                <Kbd keys={['Esc']} className="border-gray-600 bg-gray-700 text-gray-300" />
                            </div>
                        </div>
                    )}
                    <h1 className="text-lg font-bold truncate cursor-pointer flex items-center gap-2" onClick={() => onViewChange && onViewChange('dashboard')}>
                        <span className="text-2xl">✈️</span>
                        <span className="hidden sm:inline">Travel Together</span>
                    </h1>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-gray-500/5 p-1 rounded-full border border-gray-500/10">
                    <button
                        onClick={() => onViewChange && onViewChange('dashboard')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'dashboard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                    >
                        {t('dashboard.explore_community') || '探索'}
                    </button>
                    <button
                        onClick={() => onViewChange && onViewChange('my_trips')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'my_trips' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                    >
                        {t('dashboard.my_trips') || '我的行程'}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {onTutorialStart && (
                        <>
                            <div className="relative group">
                                <button onClick={() => onViewChange && onViewChange('tutorial')} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 btn-press">
                                    <MonitorPlay className="w-4 h-4" /> {t('app.menu.tutorial') || '模擬例子'}
                                </button>
                                <div className="hidden md:flex absolute top-full right-0 mt-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none items-center gap-2 z-50 whitespace-nowrap">
                                    <span className="text-[10px] text-gray-300">Tutorial</span>
                                    <Kbd keys={['⇧', '⌘', 'E']} className="bg-white/10 border-white/20 text-white" />
                                </div>
                            </div>
                            {/* V1.3.4: Trigger Interactive Tour instead of Modal */}
                            <div className="relative group">
                                <button onClick={startTour} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 btn-press">
                                    <Route className="w-4 h-4" /> {t('app.menu.guide') || '教學'}
                                </button>
                                {/* Tooltip with Kbd */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <span className="text-[10px] font-bold">Guide</span>
                                    <Kbd keys={['⌘', '/']} className="border-gray-600 bg-gray-700 text-gray-300" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notification */}
                    <div className="relative group">
                        <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press" aria-label="通知中心">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        {/* Tooltip with Kbd */}
                        <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                            <span className="text-[10px] font-bold">Notifs</span>
                            <Kbd keys={['⌘', 'B']} className="border-gray-600 bg-gray-700 text-gray-300" />
                        </div>
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
                        <button data-tour="profile-menu" onClick={() => setHoverMenu(!hoverMenu)} className="group p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all btn-press" aria-label="用戶選單">
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

                            {/* Tooltip with Kbd (Left aligned) */}
                            <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">Menu</span>
                                <Kbd keys={['⌘', 'M']} className="border-gray-600 bg-gray-700 text-gray-300" />
                            </div>
                        </button>

                        <div className={`absolute top-10 right-0 w-64 pt-4 transition-all duration-300 origin-top-right ${hoverMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                            <div className={`rounded-xl shadow-2xl border overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10 text-white' : 'bg-white/95 border-gray-200 text-gray-800'}`}>
                                <div className="p-4 border-b border-gray-500/10">
                                    <p className="font-bold truncate">{user?.displayName}</p>
                                    <p className="text-xs opacity-50 truncate">{user?.email}</p>
                                </div>
                                {/* Mini Profile Stats */}
                                <div className="flex justify-around py-3 border-b border-gray-500/10 bg-gray-50/50 dark:bg-black/20">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-indigo-500">{stats.countries}</div>
                                        <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.countries')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-purple-500">{stats.trips}</div>
                                        <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.trips')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-emerald-500">{stats.continents}</div>
                                        <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.continents')}</div>
                                    </div>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    <button onClick={() => { setHoverMenu(false); window.open(window.location.origin + '/?view=profile', '_blank'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <div className="flex items-center gap-3"><User className="w-4 h-4 text-indigo-500" /> {t('app.menu.profile')}</div>
                                        <Kbd keys={['⇧', '⌘', 'P']} />
                                    </button>
                                    <button onClick={() => { setHoverMenu(false); window.open(window.location.origin + '/?view=my_trips', '_blank'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <div className="flex items-center gap-3"><Home className="w-4 h-4" /> {t('app.menu.dashboard')}</div>
                                        <Kbd keys={['⇧', '⌘', 'H']} />
                                    </button>
                                    <button onClick={() => { setHoverMenu(false); onViewChange('tutorial'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden`}><MonitorPlay className="w-4 h-4 text-indigo-500" /> {t('app.menu.tutorial')}</button>
                                    <button onClick={() => { setHoverMenu(false); onTutorialStart(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden`}><Route className="w-4 h-4 text-emerald-500" /> {t('app.menu.guide')}</button>
                                    <button onClick={() => { setHoverMenu(false); onOpenUserSettings(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <div className="flex items-center gap-3"><Edit3 className="w-4 h-4" /> {t('app.menu.settings')}</div>
                                        <Kbd keys={['⌘', ',']} />
                                    </button>
                                    <button onClick={() => { setHoverMenu(false); onOpenFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><MessageCircle className="w-4 h-4" /> {t('app.menu.feedback')}</button>
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
                                    <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                            切換模式
                                        </div>
                                        <Kbd keys={['⇧', '⌘', 'L']} />
                                    </button>
                                    <button onClick={onLogout} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-red-500 transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}><LogOut className="w-4 h-4" /> 登出</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- Modals ---




// --- Settings View replaces SettingsModal ---

// --- Version Modal moved to components/Modals/VersionModal.jsx ---



// --- Active Users Presence Component ---





// --- Files & Attachments Tab ---

// --- Trip Detail Wrapper (handles ALL data loading, TripDetailContent only renders when trip is ready) ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, isPreview = false, globalSettings, exchangeRates, onOpenSmartImport, weatherData, onUpdateSimulationTrip, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin, onOpenChat, onUserClick, onViewProfile, isChatOpen, setIsChatOpen }) => {

    // ALL hooks in wrapper - consistent on every render
    const [realTrip, setRealTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(!isSimulation);
    const [error, setError] = useState(null);

    // Data loading effect
    useEffect(() => {
        if (isSimulation) {
            queueMicrotask(() => setIsLoading(false));
            return;
        }
        if (!tripData?.id) {
            setError("Invalid trip data");
            setIsLoading(false);
            return;
        }

        // V1.3.6: Mock Trip Support (Public Data)
        if (tripData.isMock || (typeof tripData.id === 'string' && tripData.id.startsWith('mock_'))) {
            // Enrich mock trip with full details generator (Synchronous)
            const enrichedTrip = getMockTripDetails(tripData.id, globalSettings?.language);
            setRealTrip(enrichedTrip);
            setIsLoading(false);
            setError(null);
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
            if (country.includes('Japan') || country.includes('日本')) queueMicrotask(() => setConvTo('JPY'));
            else if (country.includes('Taiwan') || country.includes('台灣')) queueMicrotask(() => setConvTo('TWD'));
            else if (country.includes('Korea') || country.includes('韓國')) queueMicrotask(() => setConvTo('KRW'));
            else if (country.includes('US') || country.includes('美國')) queueMicrotask(() => setConvTo('USD'));
            else if (country.includes('UK') || country.includes('英國')) queueMicrotask(() => setConvTo('GBP'));
            else if (country.includes('Europe') || country.includes('歐洲')) queueMicrotask(() => setConvTo('EUR'));
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
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                onUserClick={onUserClick}
                onViewProfile={onViewProfile}
            />
        </Suspense>
    );
};



// --- Trip Detail Content (UI only - trip is GUARANTEED to exist) ---
// No data loading here - all hooks will always execute consistently
const App = () => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const [view, setView] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const v = urlParams.get('view');
        // V1.4.2: Direct state initialization to prevent race conditions
        if (v === 'my_trips' || v === 'profile' || v === 'tutorial' || v === 'detail' || v === 'settings') return v;
        return 'dashboard';
    });
    const [selectedTrip, setSelectedTrip] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) return { id }; // Minimal trip object for loading
        return null;
    });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [globalBg, setGlobalBg] = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"); // Default BG
    const [globalSettings, setGlobalSettings] = useState({
        notifications: true,
        sound: true,
        currency: 'HKD',
        region: 'HK', // Default to Hong Kong
        language: localStorage.getItem('travelTogether_language') || 'zh-TW', // Default to LocalStorage or Traditional Chinese
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
    // Version Check moved to unified Update Success Logic (line ~770)

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

        // --- Handle Direct View Params ---
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        const idParam = urlParams.get('id');

        if (viewParam) {
            // Already initialized in useState, but we ensure it's synced if user changed
            if (viewParam === 'detail' && idParam && (!selectedTrip || selectedTrip.id !== idParam)) {
                setSelectedTrip({ id: idParam });
                setView('detail');
            } else {
                setView(viewParam);
            }

            // Clean up URL without reload to keep it clean
            // We delay this slightly to ensure other effects can read it if needed
            setTimeout(() => {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
            }, 1000);
        }
    }, [user]); // Re-run when user state settles to ensure view persistence

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

    // Load User Settings & Profile from Firebase (Real-time)
    useEffect(() => {
        if (user?.uid) {
            const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setUserProfile(data); // Sync profile data (banner, etc.)
                    if (data.settings) {
                        setGlobalSettings(prev => ({ ...prev, ...data.settings }));
                    }
                }
            }, (error) => {
                console.log("Error fetching user profile:", error);
            });
            return () => unsub();
        }
    }, [user]);

    // Save User Settings to Firebase (Debounced)
    useEffect(() => {
        if (user?.uid) {
            const timer = setTimeout(() => {
                // Only update settings part, don't overwrite profile
                setDoc(doc(db, "users", user.uid), { settings: globalSettings }, { merge: true });
            }, 1000); // Debounce 1s
            return () => clearTimeout(timer);
        }
    }, [globalSettings, user]);

    // Sync Language with Global Settings
    useEffect(() => {
        if (globalSettings.language && i18n.language !== globalSettings.language) {
            i18n.changeLanguage(globalSettings.language);
            localStorage.setItem('travelTogether_language', globalSettings.language);
        }
    }, [globalSettings.language, i18n]);

    // Modals State
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

    const [shouldStartProductTour, setShouldStartProductTour] = useState(false);

    // Handle Onboarding close to trigger version modal for new users AND Start Product Tour
    const handleOnboardingComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsOnboardingOpen(false);
        setView('dashboard'); // Ensure we are on dashboard

        // Start product tour on all devices (Mobile & Desktop)
        // Delay slightly to allow dashboard to mount
        setTimeout(() => setShouldStartProductTour(true), 500);

        // After onboarding, check if version modal should show (App or Jarvis)
        const lastSeenVersion = localStorage.getItem('app_last_seen_version');
        const lastSeenJarvisVersion = localStorage.getItem('jarvis_last_seen_version');
        if (lastSeenVersion !== APP_VERSION || lastSeenJarvisVersion !== JARVIS_VERSION) {
            setTimeout(() => {
                setIsVersionOpen(true);
                localStorage.setItem('app_last_seen_version', APP_VERSION);
                localStorage.setItem('jarvis_last_seen_version', JARVIS_VERSION);
            }, 1000); // Delay more to not conflict with tour start? Or maybe don't show version modal if tour starting?
            // Tour might be more important for new user.
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

    // --- PWA: Handle Install Prompt ---
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // console.log('PWA: Install prompt deferred');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA: User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    // Dynamic Admin List from Firestore
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "admin_config"), (doc) => {
            if (doc.exists() && doc.data().admin_emails) {
                setDynamicAdminEmails(doc.data().admin_emails);
            }
        }, (error) => {
            console.log("Error loading admin config:", error);
        });
        return () => unsub();
    }, []);

    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || dynamicAdminEmails.includes(user.email));

    // V1.2.7 Global Search listener & V1.3.5 Global Shortcuts Logic (Centralized)
    useGlobalShortcuts({
        onSearch: () => setIsCommandPaletteOpen(prev => !prev),
        onCreateTrip: () => setIsCreateModalOpen(true),
        onImportTrip: () => setIsSmartImportModalOpen(true),
        onSettings: () => {
            // Open Settings View
            setView('settings');
            // If we have a specific tab logic, we can add it here
        },
        onDashboard: () => window.open(window.location.origin + '/?view=my_trips', '_blank'),
        onToggleTheme: () => setIsDarkMode(prev => !prev),
        onTutorial: () => setView('tutorial'), // Shift+Cmd+E
        // onProfile, onNotifications handled in Header via internal state
    });

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
        }, (error) => {
            console.log("Error listening to feedback:", error);
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
    const { notifications, toasts, setToasts, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

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
        }, (error) => {
            console.log("Error checking version:", error);
        });
        return () => unsub();
    }, []);

    // --- User Profile State (Real-time) ---
    const [userProfile, setUserProfile] = useState({});
    const [viewingProfileUser, setViewingProfileUser] = useState(null); // For viewing other profiles

    // Computed User Object (Auth + Cloud Profile)
    const currentUser = React.useMemo(() => {
        if (!user) return null;
        return { ...user, ...userProfile };
    }, [user, userProfile]);

    // --- Update Success Logic (Local Cache) ---
    // Only shows "update success" NOTIFICATION if user actually got new code
    // Version modal is handled separately by the Auto-show Version Modal useEffect
    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('app_version_cache');

        // Check if version changed
        if (lastSeenVersion !== APP_VERSION) {
            // Immediately update cache to prevent duplicate triggers
            localStorage.setItem('app_version_cache', APP_VERSION);

            // Only celebrate if user has a cached version (returning user)
            // If it's a fresh visit (no cache), just silent update
            if (lastSeenVersion) {
                const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

                setTimeout(() => {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    sendNotification(
                        `已成功更新至 ${APP_VERSION}`,
                        `${isPWA ? 'App' : '網頁'}已升級至最新版本，享受更佳體驗！`,
                        "success",
                        { time: timeStr, persist: false }
                    );

                    triggerConfetti();
                }, 1000);
            }
        }
    }, []); // Run ONCE on mount, ignore prop changes to prevent loops

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


    // V1.2.25: Centralized Chat Handler with Security Check
    const handleOpenChat = (targetTrip = null, tab = null) => {
        // AI features require login, UNLESS it's a simulation
        const isSimulation = (targetTrip?.id?.startsWith('sim-')) || (view === 'tutorial');

        if (!user && !isSimulation) {
            sendNotification(
                "需要登入",
                "AI 對話功能需要登入或註冊後才可使用。請先登入您的 Google 帳戶。",
                "warning"
            );
            return;
        }
        if (targetTrip) setSelectedTrip(targetTrip);
        setIsChatOpen(true);
        if (tab) setChatInitialTab(tab);
    };

    // V1.3.0: Contextual Onboarding - Switch background based on step
    const handleOnboardingStepChange = (index) => {
        // Step 4 (Index 3): Footprints
        if (index === 3) {
            setView('tutorial');
            setRequestedTab('footprints');
        }
        // Step 6 (Index 5): Visual Planning
        else if (index === 5) {
            setView('tutorial');
            setRequestedTab('itinerary');
            // Trigger map view via localstorage event if possible
            localStorage.setItem(`tripViewMode_sim-tokyo-2025`, 'map'); // Corrected ID
            window.dispatchEvent(new CustomEvent('refreshTripView'));
        }
        // Step 7 (Index 6): Smart Card / Packing
        else if (index === 6) {
            setView('tutorial');
            setRequestedTab('packing');
        }
        // Step 8 (Index 7): Budget -> Show Trip Budget
        else if (index === 7) {
            setView('tutorial');
            setRequestedTab('budget');
        }
        // Step 9 (Index 8): Offline Mode
        else if (index === 8) {
            setView('dashboard');
            // Just show dashboard, PWA is integrated
        }
        // Step 10 (Index 9): Travel Database
        else if (index === 9) {
            setView('profile');
            // Default to own profile or simulate
        }
        // Step 11 (Index 10): Weather -> Show Dashboard Weather Widget
        else if (index === 10) {
            setView('dashboard');
            // Ensure weather widget is visible on dashboard?
            // Usually it is by default if dashboardWidgets state is not empty.
        }
        // Step 2-7, 9, 10, 12 could also show relevant views
        // Step 2 (Index 1): Jarvis -> Show Tutorial (Itinerary)
        else if (index >= 1 && index <= 5) {
            setView('tutorial');
            setRequestedTab('itinerary');
        }
        // Default to Dashboard for others
        else {
            setView('dashboard');
        }
    };

    // V1.3.4: Tour Navigation Handler
    const handleTourNavigation = (stepData) => {
        // V1.3.14: Handle string navigation (e.g. 'dashboard' from endTour)
        if (stepData === 'dashboard') {
            setView('dashboard');
            return;
        }

        const { page, tab, action } = stepData;

        if (page === 'dashboard') {
            setView('dashboard');
        } else if (page === 'trip-detail') {
            // V1.3.15: Force 'tutorial' view during tour to show Simulation Data (Tokyo)
            // This ensures the user sees a populated trip instead of an empty one.
            setView('tutorial');

            // Force map view refresh if tab is itinerary (for split view)
            if (tab === 'itinerary') {
                setTimeout(() => window.dispatchEvent(new CustomEvent('refreshTripView')), 100);
            }

            if (tab) {
                setRequestedTab(tab);
            }
        }
    };

    if (isLoading) {
        if (view === 'detail' || view === 'tutorial' || (window.location.search.includes('view=detail'))) {
            return <TripDetailSkeleton isDarkMode={isDarkMode} />;
        }
        return <DashboardSkeleton isDarkMode={isDarkMode} />;
    }

    if (!user && !isPreviewMode && view !== 'tutorial') return <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />;

    return (
        <TourProvider onNavigate={handleTourNavigation}>
            {/* Default Internal SEO (Dashboard) - Overridden by TripDetail */}
            {view === 'dashboard' && <SEO title={t('dashboard.title', 'Dashboard')} />}
            {view === 'my_trips' && <SEO title={t('dashboard.my_trips', 'My Trips')} />}

            <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500 font-sans selection:bg-indigo-500/30 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
                <NotificationSystem notifications={toasts} setNotifications={setToasts} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
                <OfflineBanner isDarkMode={isDarkMode} />
                <ReloadPrompt isDarkMode={isDarkMode} />
                {/* Background Image (Global) */}
                <ImageWithFallback
                    src={globalBg}
                    className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000 object-cover w-full h-full"
                    alt="Background"
                />
                {/* Fixed Header - Outside content wrapper for proper fixed positioning */}
                {view !== 'tutorial' && <Header title="✈️ Travel Together" user={currentUser || user} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => signOut(auth)} onBack={(view !== 'dashboard' && view !== 'settings' && view !== 'my_trips') ? () => setView('dashboard') : null} onTutorialStart={() => { if (localStorage.getItem('hasSeenOnboarding')) { setView('dashboard'); setTimeout(() => setShouldStartProductTour(true), 300); } else { setIsOnboardingOpen(true); } }} onViewChange={setView} onOpenUserSettings={() => setView('settings')} onOpenFeedback={() => setIsReportCenterOpen(true)} onOpenAdminFeedback={() => setIsAdminFeedbackModalOpen(true)} isAdmin={isAdmin} adminPendingCount={openFeedbackCount} onOpenVersion={() => setIsVersionOpen(true)} notifications={notifications} onRemoveNotification={removeNotification} onMarkNotificationsRead={markNotificationsRead} onNotificationClick={handleNotificationNavigate} allTrips={trips} activeView={view} />}

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
                                    deferredPrompt={deferredPrompt}
                                    onInstall={handleInstallClick}
                                    shouldStartProductTour={shouldStartProductTour}
                                    onProductTourStarted={() => setShouldStartProductTour(false)}
                                    // Chat Control
                                    onOpenChat={handleOpenChat}
                                    setChatInitialTab={setChatInitialTab}
                                    forcedViewMode="explore" // Force Explore Mode
                                    allTrips={trips}
                                    loadingAllTrips={loadingTrips}
                                />
                            </ErrorBoundary>
                        </div>
                    )}
                    {view === 'my_trips' && (
                        <div className="animate-fade-in">
                            <ErrorBoundary fallbackMessage="我的行程載入失敗，請重新整理" onOpenFeedback={() => setIsReportCenterOpen(true)}>
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
                                    deferredPrompt={deferredPrompt}
                                    onInstall={handleInstallClick}
                                    shouldStartProductTour={false} // No tour on this page (or separate tour)
                                    onProductTourStarted={() => { }}
                                    onOpenChat={handleOpenChat}
                                    setChatInitialTab={setChatInitialTab}
                                    forcedViewMode="my_trips" // Force My Trips Mode
                                    allTrips={trips}
                                    loadingAllTrips={loadingTrips}
                                />
                            </ErrorBoundary>
                        </div>
                    )}
                    {/* Profile View (V1.3.0) */}
                    {view === 'profile' && (
                        <div className="pt-4 animate-fade-in" data-tour="profile-view">
                            <ErrorBoundary fallbackMessage="個人檔案載入失敗，請重新整理" onOpenFeedback={() => setIsReportCenterOpen(true)}>
                                <SocialProfile
                                    user={viewingProfileUser || currentUser || user} // Use viewing user OR current user (with profile data)
                                    currentUser={currentUser || user}
                                    isOwnProfile={!viewingProfileUser || viewingProfileUser.uid === user?.uid}
                                    trips={trips}
                                    isDarkMode={isDarkMode}
                                    onEditProfile={() => {
                                        setSettingsInitialTab('account');
                                        setView('settings');
                                    }}
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
                                    setIsChatOpen={setIsChatOpen}
                                    isBanned={isBanned}
                                    // Chat Control
                                    onOpenChat={(tab) => {
                                        if (isSimulation) return;
                                        handleOpenChat(isPreviewMode ? previewTrip : selectedTrip, tab);
                                    }}
                                    setChatInitialTab={setChatInitialTab}
                                    isAdmin={isAdmin}
                                    isChatOpen={isChatOpen}
                                    onUserClick={(u) => { setViewingProfileUser(u); setView('profile'); }}
                                    onViewProfile={(u) => { setViewingProfileUser(u); setView('profile'); }}
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
                                exchangeRates={exchangeRates}
                                weatherData={weatherData}
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

                    {view === 'tutorial' && <div className={`min-h-screen flex flex-col animate-fade-in ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}><div className={`p-4 border-b flex gap-4 items-center sticky top-0 z-50 backdrop-blur-lg ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`} style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}><button onClick={() => { setView('dashboard'); setIsPreviewMode(false); }} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronLeft /></button><span className="font-bold">模擬模式 (東京範例)</span></div><div className="flex-grow overflow-y-auto">                <TripDetail
                        tripData={SIMULATION_DATA}
                        user={user}
                        isDarkMode={isDarkMode}
                        setGlobalBg={() => { }}
                        isSimulation={true}
                        isPreview={false}
                        globalSettings={globalSettings}
                        exchangeRates={exchangeRates}
                        weatherData={weatherData}
                        onOpenSmartImport={() => setIsSmartImportModalOpen(true)}
                        onOpenChat={(tab) => handleOpenChat(SIMULATION_DATA, tab)}
                        isChatOpen={isChatOpen}
                        requestedTab={requestedTab}
                        onTabHandled={() => setRequestedTab(null)}
                        requestedItemId={requestedItemId}
                        onItemHandled={() => setRequestedItemId(null)}
                        setIsChatOpen={setIsChatOpen}
                        setChatInitialTab={setChatInitialTab}
                    /></div></div>}
                </div>
                {view !== 'tutorial' && <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} onLanguageChange={(lang) => setGlobalSettings(prev => ({ ...prev, language: lang }))} />}

                <Suspense fallback={null}>

                    <UniversalOnboarding
                        isOpen={isOnboardingOpen}
                        onClose={handleOnboardingComplete}
                        isDarkMode={isDarkMode}
                        onStartDemo={() => setView('tutorial')}
                        onStepChange={handleOnboardingStepChange}
                    />

                    {/* Global Chat / AI FAB */}
                    {(user || view === 'tutorial') && !isChatOpen && (
                        <GlobalChatFAB
                            isDarkMode={isDarkMode}
                            context={view === 'detail' || view === 'tutorial' ? 'trip' : 'default'}
                            onClick={() => {
                                // Priority: Open Trip Chat if in detail view, else Jarvis
                                if (view === 'tutorial') {
                                    handleOpenChat(SIMULATION_DATA);
                                } else {
                                    handleOpenChat();
                                }
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
                        onOpenJarvis={() => { setIsReportCenterOpen(false); handleOpenChat(); }}
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
                </Suspense>

                {/* Universal Chat & Jarvis AI System */}
                <UniversalChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    user={user}
                    trip={selectedTrip}
                    isDarkMode={isDarkMode}
                    activeTab={chatInitialTab}
                    onTabChange={setChatInitialTab}
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
                                handleOpenChat();
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

                {/* V1.3.4: Interactive Product Tour Overlay */}
                <TourOverlay isDarkMode={isDarkMode} />
            </div>
        </TourProvider>
    );
};

// --- Other Components (LandingPage) ---
// --- Other Components (LandingPage) ---
// LandingPage moved to components/Landing/LandingPage.jsx

export default App;