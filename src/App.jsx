import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom'; // V1.9.2 Fix
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
// Static Imports for Critical Modals & UI
import VersionGuardModal from './components/Modals/VersionGuardModal';
import ReportCenterModal from './components/Modals/ReportCenterModal';
import DashboardSkeleton from './components/Loaders/DashboardSkeleton';

// Lazy Load Heavy Modals
const CreateTripModal = lazy(() => import('./components/Modals/CreateTripModal'));
const TripExportImportModal = lazy(() => import('./components/Modals/TripExportImportModal'));
const SmartImportModal = lazy(() => import('./components/Modals/SmartImportModal'));
const AIGeminiModal = lazy(() => import('./components/Modals/AIGeminiModal'));
const UniversalOnboarding = lazy(() => import('./components/Modals/UniversalOnboarding'));
const FeedbackModal = lazy(() => import('./components/Modals/FeedbackModal'));
const VersionModal = lazy(() => import('./components/Modals/VersionModal'));
const AdminFeedbackModal = lazy(() => import('./components/Modals/AdminFeedbackModal'));
const SettingsView = lazy(() => import('./components/Views/SettingsView'));

import NotificationSystem from './components/Shared/NotificationSystem';
import OfflineBanner from './components/Shared/OfflineBanner';
import ReloadPrompt from './components/Shared/ReloadPrompt';
import { useNotifications } from './hooks/useNotifications';
import useGlobalShortcuts from './hooks/useGlobalShortcuts';
import { getMockTripDetails } from './constants/publicTripsData';
import { checkAbuse } from './services/security';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import GlobalChatFAB from './components/Shared/GlobalChatFAB';
import UniversalChat from './components/Shared/UniversalChat';
import OnboardingTour from './components/Shared/OnboardingTour';
import { TourProvider, useTour } from './contexts/TourContext';
import TourOverlay from './components/Tour/TourOverlay';

import CommandPalette from './components/Shared/CommandPalette';
import Kbd from './components/Shared/Kbd';
import { SEO } from './components/Shared/SEO'; // V1.6.0 SEO
import TripDetailSkeleton from './components/Loaders/TripDetailSkeleton';
const ChatModal = lazy(() => import('./components/Chat/ChatModal')); // V1.9.2 Chat
import NotificationCenter from './components/Notifications/NotificationCenter'; // V1.9.4 Notification Center

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

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const SocialProfile = lazy(() => import('./components/Social/Profile/SocialProfile'));
const PublicTripView = lazy(() => import('./components/Public/PublicTripView'));
const HttpStatusPage = lazy(() => import('./components/Shared/HttpStatusPage'));
const Footer = lazy(() => import('./components/Shared/Footer'));
import ImageWithFallback from './components/Shared/ImageWithFallback';

const Header = ({ title, onBack, user, isDarkMode, toggleDarkMode, onLogout, onTutorialStart, onViewChange, onOpenUserSettings, onOpenVersion, notifications = [], onRemoveNotification, onMarkNotificationsRead, onNotificationClick, onOpenFeedback, onOpenAdminFeedback, isAdmin, adminPendingCount = 0, friendRequestCount = 0, activeView, allTrips = [], onOpenPrivateChat }) => {
    const { t } = useTranslation();
    const { startTour } = useTour();
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

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

    const stats = React.useMemo(() => {
        if (!user || !allTrips.length) return { countries: 0, trips: 0, continents: 0 };
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





    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[50] p-4 pt-[max(1.25rem,env(safe-area-inset-top))] transition-all duration-300 ${isDarkMode ? 'bg-gray-900/80 border-b border-white/5' : 'bg-gray-50/80 border-b border-gray-200/50'} shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60 select-none`}>
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <div className="relative group">
                                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10 btn-press" aria-label="返回"><ChevronLeft /></button>
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

                    <div className="hidden md:flex items-center gap-1 bg-gray-500/5 p-1 rounded-full border border-gray-500/10">
                        <button
                            onClick={() => onViewChange && onViewChange('dashboard')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'dashboard' ? (isDarkMode ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'bg-white shadow-sm text-indigo-600') : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            {t('dashboard.explore_community') || '探索'}
                        </button>
                        <button
                            onClick={() => onViewChange && onViewChange('my_trips')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'my_trips' ? (isDarkMode ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'bg-white shadow-sm text-indigo-600') : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
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
                                <div className="relative group">
                                    <button onClick={startTour} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 btn-press">
                                        <Route className="w-4 h-4" /> {t('app.menu.guide') || '教學'}
                                    </button>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                        <span className="text-[10px] font-bold">Guide</span>
                                        <Kbd keys={['⌘', '/']} className="border-gray-600 bg-gray-700 text-gray-300" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="relative group">
                            <button
                                onClick={() => onOpenPrivateChat && onOpenPrivateChat()}
                                className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press"
                                aria-label="私訊"
                                title="我的訊息"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {/* Optional: Unread Badge logic here later */}
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">Messages</span>
                            </div>
                        </div>

                        <div className="relative group">
                            <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press" aria-label="通知中心">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">Notifs</span>
                                <Kbd keys={['⌘', 'B']} className="border-gray-600 bg-gray-700 text-gray-300" />
                            </div>
                            {showNotif && (
                                <NotificationCenter
                                    isOpen={showNotif}
                                    onClose={() => setShowNotif(false)}
                                    notifications={notifications}
                                    onMarkAllRead={onMarkNotificationsRead}
                                    onClearAll={handleClearAll}
                                    onRemoveNotification={onRemoveNotification}
                                    onNotificationClick={(n) => {
                                        setShowNotif(false);
                                        if (onNotificationClick) onNotificationClick(n);
                                    }}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                        </div>

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
                                        <button onClick={() => { setHoverMenu(false); onViewChange && onViewChange('profile'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <User className="w-4 h-4 text-indigo-500" />
                                                    {friendRequestCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>}
                                                </div>
                                                {t('app.menu.profile')}
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'P']} />
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onViewChange && onViewChange('dashboard'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><Home className="w-4 h-4" /> {t('app.menu.dashboard')}</div>
                                            <Kbd keys={['⇧', '⌘', 'H']} />
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onOpenUserSettings(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><Edit3 className="w-4 h-4" /> {t('app.menu.settings')}</div>
                                            <Kbd keys={['⌘', ',']} />
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onOpenFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4" /> {t('app.menu.feedback')}</div>
                                            <Kbd keys={['⌘', 'F']} />
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => { setHoverMenu(false); onOpenAdminFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Shield className="w-4 h-4 text-indigo-500" />
                                                        {adminPendingCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                                    </div>
                                                    管理員後台
                                                </div>
                                                <Kbd keys={['⇧', '⌘', 'A']} />
                                            </button>
                                        )}
                                        <button onClick={() => { setHoverMenu(false); onOpenVersion(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><History className="w-4 h-4" /> 版本資訊</div>
                                            <Kbd keys={['⌘', 'V']} />
                                        </button>
                                        <div className="h-px bg-gray-500/10 my-1"></div>
                                        <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                切換模式
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'L']} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setHoverMenu(false);
                                                setShowLogoutModal(true);
                                            }}
                                            className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-300 justify-between mt-2 font-bold border-2 ${isDarkMode
                                                ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10'
                                                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-500 hover:border-red-400 hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                登出
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'Q']} className={isDarkMode ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Logout Confirmation Modal */}
            {
                showLogoutModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLogoutModal(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div
                            className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl border animate-scale-up ${isDarkMode
                                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-white/10'
                                : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'
                                }`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                                }`}>
                                <LogOut className="w-8 h-8 text-red-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-center mb-2">確定要登出嗎？</h3>
                            <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                登出後需要重新登入才能使用完整功能
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        onLogout();
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                                >
                                    確定登出
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, isPreview = false, globalSettings, exchangeRates, onOpenSmartImport, weatherData, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin, onOpenChat, onUserClick, onViewProfile, isChatOpen, setIsChatOpen, setChatInitialTab, onOpenCommandPalette }) => {
    const [realTrip, setRealTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(!isSimulation);
    const [error, setError] = useState(null);

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
        if (tripData.isMock || (typeof tripData.id === 'string' && tripData.id.startsWith('mock_'))) {
            const enrichedTrip = getMockTripDetails(tripData.id, globalSettings?.language);
            setRealTrip(enrichedTrip);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const unsub = onSnapshot(doc(db, "trips", tripData.id), (d) => {
            if (d.exists()) setRealTrip({ id: d.id, ...d.data() });
            else setError("Trip not found");
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });
        return () => unsub();
    }, [tripData?.id, isSimulation]);

    const trip = isSimulation ? tripData : realTrip;
    const [convAmount, setConvAmount] = useState(1000);
    const [convTo, setConvTo] = useState('JPY');

    useEffect(() => {
        if (trip?.country) {
            const country = trip.country;
            if (country.includes('Japan') || country.includes('日本')) setConvTo('JPY');
            else if (country.includes('Taiwan') || country.includes('台灣')) setConvTo('TWD');
            else if (country.includes('Korea') || country.includes('韓國')) setConvTo('KRW');
            else if (country.includes('US') || country.includes('美國')) setConvTo('USD');
        }
    }, [trip?.country]);

    if (isLoading) return <TripDetailSkeleton isDarkMode={isDarkMode} />;
    if (error || !trip) return <HttpStatusPage code={404} isDarkMode={isDarkMode} onBackHome={onBack} />;

    return (
        <Suspense fallback={<TripDetailSkeleton isDarkMode={isDarkMode} />}>
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
                setChatInitialTab={setChatInitialTab}
                onOpenCommandPalette={onOpenCommandPalette}
            />
        </Suspense>
    );
};

const App = () => {
    const { t, i18n } = useTranslation();
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
    const [isLoading, setIsLoading] = useState(false);
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

        // Import dynamically to avoid circular dependencies if any, or just standard import
        import('./services/friendService').then(({ listenToFriendRequests }) => {
            const unsub = listenToFriendRequests(user.uid, (requests) => {
                setFriendRequestCount(requests.length);
            });
            return unsub;
        }).then(unsub => {
            // Cleanup handled by returning/effect cleanup if we stored unsub
            // Ideally we need to store the unsub function
        });

        // Better approach: Import at top level if possible.
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
        if (stepD.page) setView(stepD.page === 'trip-detail' ? 'tutorial' : stepD.page);
        if (stepD.tab) setRequestedTab(stepD.tab);
    };

    const triggerConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#818cf8', '#c7d2fe', '#ffffff'] });
    };

    if (isLoading) return <DashboardSkeleton isDarkMode={isDarkMode} />;

    // V1.9.6: PublicTripView for Fork feature - Render for non-members viewing /trip/:id
    if (publicTripId) {
        return (
            <ErrorBoundary isDarkMode={isDarkMode}>
                <TourProvider onNavigate={() => { }}>
                    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
                        {/* Independent Static Components */}
                        <NotificationSystem notifications={toasts} setNotifications={setToasts} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
                        <OfflineBanner isDarkMode={isDarkMode} />
                        <ReloadPrompt isDarkMode={isDarkMode} />
                        <ImageWithFallback src={globalBg} className="fixed inset-0 z-0 opacity-20 pointer-events-none object-cover w-full h-full" alt="Background" />

                        {/* Standard Header */}
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
                            onTutorialStart={() => setView('tutorial')}
                            onBack={() => setPublicTripId(null)} // Clear public state to go back
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

                        {/* Main Content Area */}
                        <div className="relative z-10 flex-grow pb-safe" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
                            <Suspense fallback={<TripDetailSkeleton isDarkMode={isDarkMode} />}>
                                <PublicTripView
                                    tripId={publicTripId}
                                    user={user || null}
                                    isDarkMode={isDarkMode}
                                    setGlobalBg={setGlobalBg} // Pass for dynamic background
                                />
                            </Suspense>
                        </div>

                        {/* Standard Footer */}
                        <Suspense fallback={null}>
                            <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} onLanguageChange={(lang) => setGlobalSettings(prev => ({ ...prev, language: lang }))} />
                        </Suspense>

                        {/* Necessary Modals for Public View (e.g. Login/Version) */}
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
                </TourProvider>
            </ErrorBoundary>
        );
    }

    if (!user && view !== 'tutorial') return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-950"><Loader2 className="animate-spin w-12 h-12 text-indigo-500" /></div>}>
            <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />
        </Suspense>
    );

    return (
        <TourProvider onNavigate={handleTourNavigation}>
            {/* Top-Level Error Boundary for entire app resilience */}
            <ErrorBoundary fallbackMessage="Something went wrong while loading the app. Please refresh.">
                {view === 'dashboard' && <SEO title={t('dashboard.title', 'Dashboard')} />}
                <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500 font-sans ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
                    {/* Independent Static Components - Render INSTANTLY */}
                    <NotificationSystem notifications={toasts} setNotifications={setToasts} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
                    <OfflineBanner isDarkMode={isDarkMode} />
                    <ReloadPrompt isDarkMode={isDarkMode} />
                    <ImageWithFallback src={globalBg} className="fixed inset-0 z-0 opacity-20 pointer-events-none object-cover w-full h-full" alt="Background" />

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
                                onTutorialStart={() => setView('tutorial')}
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
                        <UniversalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} user={user} trip={selectedTrip} isDarkMode={isDarkMode} activeTab={chatInitialTab} onTabChange={setChatInitialTab} />
                        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} trips={trips} activeTrip={selectedTrip} isDarkMode={isDarkMode} onAction={(item) => { if (item.type === 'trip') { setSelectedTrip(item.data); setView('detail'); } }} />
                        <OnboardingTour run={showOnboardingTour} onComplete={() => setShowOnboardingTour(false)} isDarkMode={isDarkMode} />
                        <TourOverlay isDarkMode={isDarkMode} />
                        {isAdmin && <AdminFeedbackModal isOpen={isAdminFeedbackModalOpen} onClose={() => setIsAdminFeedbackModalOpen(false)} isDarkMode={isDarkMode} user={user} onPendingCountChange={setOpenFeedbackCount} />}
                    </Suspense>

                    {/* Static Modals - Rendering Instantly */}
                    <ReportCenterModal isOpen={isReportCenterOpen} onClose={() => setIsReportCenterOpen(false)} isDarkMode={isDarkMode} user={user} />
                    <VersionGuardModal isOpen={isVersionGuardOpen} onClose={() => setIsVersionGuardOpen(false)} latestVersion={latestVersion} currentVersion={APP_VERSION} isDarkMode={isDarkMode} />
                </div >
            </ErrorBoundary >
        </TourProvider >
    );
};

export default App;