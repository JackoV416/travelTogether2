import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { buttonPrimary } from './constants/styles';
const TripDetailContent = lazy(() => import('./components/TripDetail/TripDetailContent'));
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, googleProvider, storage } from './firebase';
import {
    Plus, Trash2, MapPin, Calendar, Clock, DollarSign, User, Users, Sun, Cloud, CloudRain, Shield, Settings, LogOut, ChevronRight, X, Menu, Share2, Globe, Send, MessageCircle, FileText, CheckCircle, AlertCircle, Search, Filter, Camera, Download, Upload, AlertTriangle, Info, Loader2, Sparkles, LayoutGrid, List as ListIcon, Maximize2, Minimize2, CloudFog, CloudLightning, CloudSnow, MoveRight, ChevronLeft, CalendarDays, Bell, ChevronDown, LogIn, Map as MapIcon, BrainCircuit, Wallet, Plane, Bus, BusFront, TrainFront, Car, ShoppingBag, BedDouble, Receipt, CloudSun, Snowflake, Newspaper, TrendingUp, Siren, List, Star, Shirt, UserCircle, UserPlus, FileUp, Edit3, Lock, Save, RefreshCw, Route, MonitorPlay, CheckSquare, FileCheck, History, PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Phone, Globe2, Link as LinkIcon, Wifi, Utensils, Image, QrCode, Copy, Instagram, MapPinned, NotebookPen, Home, PiggyBank, Moon, Keyboard
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

// --- V0.16.2 Refactored Imports ---
import {
    APP_VERSION, APP_AUTHOR, APP_LAST_UPDATE, ADMIN_EMAILS,
    DEFAULT_BG_IMAGE, CITY_COORDS, COUNTRIES_DATA, INFO_DB,
    SIMULATION_DATA, CURRENCIES, VERSION_HISTORY, TIMEZONES, LANGUAGE_OPTIONS
} from './constants/appData';
import AdminFeedbackModal from './components/Modals/AdminFeedbackModal';
import {
    glassCard, getHolidayMap, getLocalizedCountryName,
    getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getWeekday, getTripSummary, calculateDebts,
    getTimeDiff, getLocalCityTime, getWeatherForecast,
    buildDailyReminder, getUserInitial, inputClasses
} from './utils/tripUtils';

import Dashboard from './components/Dashboard/Dashboard';
import CreateTripModal from './components/Modals/CreateTripModal';
import DashboardSkeleton from './components/Loaders/DashboardSkeleton';



// --- 0. Constants & Data ---
















// --- 0. Constants & Data ---
// (Moved to appData.js)

// --- Components ---

const Footer = ({ isDarkMode, onOpenVersion }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return (
        <footer className={`mt-12 py-6 border-t text-center text-xs md:text-sm flex flex-col items-center justify-center gap-1 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <div className="flex flex-wrap gap-2 items-center justify-center font-bold">
                <span>Travel Together {APP_VERSION}</span>
                <span>•</span>
                <button
                    onClick={onOpenVersion}
                    className="px-2 py-0.5 rounded-full border border-indigo-400 text-indigo-500 text-[10px] md:text-xs hover:bg-indigo-500 hover:text-white transition"
                >
                    版本更新內容
                </button>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Design with ❤️</span>
            </div>
            <div className="font-mono flex items-center gap-2"><Clock className="w-3 h-3" /> 當地時間: {time.toLocaleTimeString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</div>
            <div className="mt-2 text-xs">
                <SyncStatus isDarkMode={isDarkMode} />
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
        <header className={`sticky top-0 z-50 p-4 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/95 border-b border-gray-800' : 'bg-gray-50/95 border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {onBack && <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10" aria-label="返回"><ChevronLeft /></button>}
                    <h1 className="text-lg font-bold truncate cursor-pointer" onClick={() => onViewChange && onViewChange('dashboard')}>{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {onTutorialStart && <button onClick={onTutorialStart} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"><MonitorPlay className="w-4 h-4" /> 教學</button>}

                    {/* Notification */}
                    <div className="relative">
                        <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative" aria-label="通知中心">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        {showNotif && <div className={`absolute top-12 right-0 w-96 p-4 rounded-xl shadow-2xl border z-50 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
                            <div className="flex justify-between items-center border-b border-gray-500/10 pb-2 mb-2">
                                <h4 className="font-bold text-sm">通知中心</h4>
                                <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> 清除全部</button>
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
                        <button className="p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all" aria-label="用戶選單">
                            {user ? (
                                user.photoURL && !photoError ? (
                                    <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="user" onError={() => setPhotoError(true)} />
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
                                    <button onClick={() => { setHoverMenu(false); onTutorialStart(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden`}><MonitorPlay className="w-4 h-4" /> 教學模式</button>
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




const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('general');

    if (!isOpen) return null;

    const AI_INTERESTS = [
        { id: 'history', label: '歷史文化' },
        { id: 'nature', label: '自然風光' },
        { id: 'food', label: '地道美食' },
        { id: 'shopping', label: '購物血拼' },
        { id: 'adventure', label: '冒險體驗' },
        { id: 'art', label: '藝術展覽' },
        { id: 'nightlife', label: '夜生活' },
        { id: 'relax', label: '休閒放鬆' }
    ];

    const toggleInterest = (id) => {
        const current = globalSettings.preferences || [];
        const newPrefs = current.includes(id)
            ? current.filter(i => i !== id)
            : [...current, id];
        setGlobalSettings({ ...globalSettings, preferences: newPrefs });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border transition-all overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gray-500/5">
                    <h3 className="text-xl font-bold tracking-tight">個人設定</h3>
                    <div className="flex bg-gray-500/10 rounded-lg p-1">
                        <button onClick={() => setActiveTab('general')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${activeTab === 'general' ? (isDarkMode ? 'bg-gray-700 text-white shadow' : 'bg-white text-gray-900 shadow') : 'opacity-60'}`}>一般</button>
                        <button onClick={() => setActiveTab('ai')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'ai' ? (isDarkMode ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-500 text-white shadow') : 'opacity-60'}`}><Sparkles className="w-3 h-3" /> AI 偏好</button>
                    </div>
                </div>

                <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                    {activeTab === 'general' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">貨幣</label>
                                <select value={globalSettings.currency} onChange={e => setGlobalSettings({ ...globalSettings, currency: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c} - {CURRENCIES[c].symbol}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">所在地 (用於緊急資訊)</label>
                                <select value={globalSettings.region} onChange={e => setGlobalSettings({ ...globalSettings, region: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.keys(TIMEZONES).map(r => <option key={r} value={r}>{TIMEZONES[r].label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">介面語言</label>
                                <select value={globalSettings.language} onChange={e => setGlobalSettings({ ...globalSettings, language: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                                    {Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => <option key={code} value={code}>{conf.label}</option>)}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border border-indigo-500/20">
                                <h4 className="font-bold flex items-center gap-2 text-indigo-500 mb-1"><BrainCircuit className="w-4 h-4" /> AI 助手設定</h4>
                                <p className="text-xs opacity-60">設定您的旅遊偏好，讓 AI 為您提供更精準的行程建議。</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {AI_INTERESTS.map(item => (
                                    <label key={item.id} className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${globalSettings.preferences?.includes(item.id) ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-gray-500/20 hover:bg-gray-500/5'}`}>
                                        <input type="checkbox" className="hidden" checked={globalSettings.preferences?.includes(item.id)} onChange={() => toggleInterest(item.id)} />
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${globalSettings.preferences?.includes(item.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-400'}`}>
                                            {globalSettings.preferences?.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-500/10">
                    <button onClick={onClose} className="w-full py-3 rounded-xl shadow-lg font-bold tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all">
                        完成設定
                    </button>
                </div>
            </div>
        </div>
    );
};

const VersionModal = ({ isOpen, onClose, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings?.lang || 'zh-TW';
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-bold tracking-tight">
                        {currentLang === 'zh-TW' ? '版本紀錄' : 'Version History'}
                        <span className="ml-2 text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-full font-mono">Beta</span>
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-4 flex-grow">
                    {VERSION_HISTORY.map((v, i) => (
                        <div key={i} className="border-l-2 border-indigo-500/30 pl-6 pb-2 relative group">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 transition-all ${i === 0 ? 'bg-indigo-500 border-indigo-200 dark:border-indigo-900 scale-110' : 'bg-gray-500 border-transparent'}`}></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <span className={`font-bold text-xl ${i === 0 ? 'text-indigo-500' : 'text-gray-500'}`}>{v.ver}</span>
                                <span className="text-xs opacity-50 font-mono bg-gray-500/5 px-2 py-1 rounded">{v.date}</span>
                            </div>
                            <div className="font-bold opacity-90 mb-2 text-base">
                                {typeof v.desc === 'object' ? v.desc[currentLang] || v.desc['zh-TW'] : v.desc}
                            </div>
                            {v.details && (
                                <div className="text-sm opacity-70 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-gray-500/5 border border-gray-500/10 group-hover:bg-gray-500/10 transition-colors">
                                    {typeof v.details === 'object' ? v.details[currentLang] || v.details['zh-TW'] : v.details}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-500/20 text-center text-xs opacity-40 flex justify-between items-center flex-shrink-0">
                    <span className="font-mono">Author: {APP_AUTHOR}</span>
                    <span className="font-mono bg-gray-500/10 px-2 py-0.5 rounded">{APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};



// --- Active Users Presence Component ---





// --- Files & Attachments Tab ---

// --- Trip Detail Wrapper (handles ALL data loading, TripDetailContent only renders when trip is ready) ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates, onOpenSmartImport, weatherData, onUpdateSimulationTrip, requestedTab, onTabHandled, requestedItemId, onItemHandled, isBanned, isAdmin }) => {

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
        preferences: [] // Default preferences
    });
    const [previewTrip, setPreviewTrip] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                            if (tripData.sharePermission === 'edit' && !user.uid) {
                                // Optional: You might want to show a toast or message that they need to login to edit
                                console.log("Can edit if logged in");
                            }
                        } else {
                            alert("此行程目前不公開，請登入後查看");
                            window.history.replaceState({}, '', '/');
                        }
                    } else {
                        alert("找不到此行程");
                        window.history.replaceState({}, '', '/');
                    }
                    setIsLoading(false);
                }).catch(err => {
                    console.error("Error loading shared trip:", err);
                    setIsLoading(false);
                    window.history.replaceState({}, '', '/');
                });
            }
        }
    }, []);

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAdminFeedbackModalOpen, setIsAdminFeedbackModalOpen] = useState(false);
    const [openFeedbackCount, setOpenFeedbackCount] = useState(0);

    const [dynamicAdminEmails, setDynamicAdminEmails] = useState([]);
    const [isBanned, setIsBanned] = useState(false);

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

    // --- Notification System Hook ---
    const { notifications, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

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
                        if (data && data.current) {
                            const info = getWeatherInfo(data.current.weathercode);
                            newWeatherData[city] = {
                                temp: `${Math.round(data.current.temperature_2m)}°C`,
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
        const handleNotificationNavigate = (notif) => {
            if (!notif.context) return;
            const { tripId, view: targetView, tab: targetTab, itemId: targetItemId } = notif.context;

            // 1. Switch View
            if (targetView) setView(targetView);

            // 2. Load Trip if needed - For now, skip this as we don't have allTrips in App scope
            // The notification should have enough context from the current view
            // 3. Tab switching logic is handled via props/state communication
            // We might need to store the target tab globally or pass it to TripDetail
            if (targetTab) {
                setRequestedTab(targetTab);
            }

            if (targetItemId) {
                setRequestedItemId(targetItemId);
            }

            // 4. Mark as read
            removeNotification(notif.id);
        };

    };

    const [requestedTab, setRequestedTab] = useState(null);
    const [requestedItemId, setRequestedItemId] = useState(null);


    if (isLoading) {
        return <DashboardSkeleton isDarkMode={isDarkMode} />;
    }

    if (!user && !isPreviewMode) return <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />;

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500/30 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
            <NotificationSystem notifications={notifications} setNotifications={setNotifications} isDarkMode={isDarkMode} onNotificationClick={handleNotificationNavigate} />
            <OfflineBanner isDarkMode={isDarkMode} />
            <ReloadPrompt />
            {/* Background Image (Global) */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url(${globalBg})`, backgroundSize: 'cover' }}></div>
            <div className="relative z-10 flex-grow">
                {view !== 'tutorial' && <Header title="✈️ Travel Together" user={user} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => signOut(auth)} onBack={view !== 'dashboard' ? () => setView('dashboard') : null} onTutorialStart={() => setView('tutorial')} onViewChange={setView} onOpenUserSettings={() => setIsSettingsOpen(true)} onOpenFeedback={() => setIsFeedbackModalOpen(true)} onOpenAdminFeedback={() => setIsAdminFeedbackModalOpen(true)} isAdmin={isAdmin} adminPendingCount={openFeedbackCount} onOpenVersion={() => setIsVersionOpen(true)} notifications={notifications} onRemoveNotification={removeNotification} onMarkNotificationsRead={markNotificationsRead} onNotificationClick={handleNotificationNavigate} />}
                {view === 'dashboard' && (
                    <ErrorBoundary fallbackMessage="儀表板載入失敗，請重新整理">
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
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            isBanned={isBanned}
                        />
                    </ErrorBoundary>
                )}
                {view === 'detail' && (
                    <ErrorBoundary fallbackMessage="行程詳情載入失敗，請重新整理">
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
                        />
                    </ErrorBoundary>
                )}

                {view === 'tutorial' && <div className="h-screen flex flex-col"><div className="p-4 border-b flex gap-4"><button onClick={() => { setView('dashboard'); setIsPreviewMode(false); }}><ChevronLeft /></button> 模擬模式 (東京範例)</div><div className="flex-grow overflow-y-auto"><TripDetail tripData={SIMULATION_DATA} user={user} isDarkMode={isDarkMode} setGlobalBg={() => { }} isSimulation={true} isPreview={false} globalSettings={globalSettings} exchangeRates={exchangeRates} weatherData={weatherData} onOpenSmartImport={() => setIsSmartImportModalOpen(true)} /></div></div>}
            </div>
            {view !== 'tutorial' && <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} />}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} isDarkMode={isDarkMode} />
            <VersionModal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} isDarkMode={isDarkMode} globalSettings={globalSettings} />
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} isDarkMode={isDarkMode} user={user} isBanned={isBanned} />
            <AdminFeedbackModal
                isOpen={isAdminFeedbackModalOpen}
                onClose={() => setIsAdminFeedbackModalOpen(false)}
                isDarkMode={isDarkMode}
                adminEmails={dynamicAdminEmails}
                onUpdateAdminList={(newList) => setDoc(doc(db, "settings", "admin_config"), { admin_emails: newList }, { merge: true })}
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
                    // Do NOT close modal here - SmartImportModal will show result and close itself
                }}
            />
            <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} isDarkMode={isDarkMode} />
        </div>
    );
};

// --- Other Components (LandingPage) ---
const LandingPage = ({ onLogin }) => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 h-[85vh]">
            <div className="col-span-1 md:col-span-2 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600')] bg-cover bg-center rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                <div className="absolute bottom-10 left-10 text-white">
                    <h1 className="text-6xl font-bold mb-4">Travel Together</h1>
                    <p className="text-2xl opacity-90 mb-8">下一站，與你同行。</p>
                    <button onClick={onLogin} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2"><LogIn className="w-5 h-5" /> Google 登入</div>
                        <span className="text-[10px] opacity-50 font-normal">支援 Google 帳戶註冊並安裝為 PWA 使用</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-rows-3 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <Users className="w-12 h-12 opacity-50" />
                    <div><h3 className="text-2xl font-bold">多人協作</h3><p className="opacity-70">實時同步，共同規劃。</p></div>
                </div>
                <div className="bg-gray-800 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <BrainCircuit className="w-12 h-12 text-pink-500 opacity-80" />
                    <div><h3 className="text-2xl font-bold">AI 領隊</h3><p className="opacity-70">智慧推薦行程與美食。</p></div>
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