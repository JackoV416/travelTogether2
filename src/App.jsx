import React, { useState, useEffect, useRef } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, query, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
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
import { useNotifications } from './hooks/useNotifications';

// --- V0.16.2 Refactored Imports ---
import {
    CITY_COORDS, CURRENCIES, COUNTRIES_DATA, INFO_DB,
    HOLIDAYS_BY_REGION, AIRLINE_LOGOS, TRANSPORT_ICONS,
    OUTFIT_IMAGES, SIMULATION_DATA, TRAVEL_ARTICLES,
    AUTHOR_NAME, VERSION_HISTORY,
    TIMEZONES, LANGUAGE_OPTIONS, DEFAULT_BG_IMAGE,
    TAB_LABELS, INSURANCE_SUGGESTIONS, INSURANCE_RESOURCES
} from './constants/appData';
const APP_VERSION = "V0.16.2";
console.log("Travel Together Version Logic Triggered: V0.16.2");

import {
    glassCard, getHolidayMap, getLocalizedCountryName,
    getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getWeekday, getTripSummary, calculateDebts,
    getTimeDiff, getLocalCityTime, getWeatherForecast,
    buildDailyReminder, getUserInitial, inputClasses
} from './utils/tripUtils';

import Dashboard from './components/Dashboard/Dashboard';
import CreateTripModal from './components/Modals/CreateTripModal';
import {
    ItineraryTab, InsuranceTab, VisaTab, EmergencyTab,
    BudgetTab, CurrencyTab, FilesTab, NotesTab, ShoppingTab
} from './components/TripDetail/tabs';
import { generateAISuggestions } from './services/ai';


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
        </footer>
    );
};

const Header = ({ title, onBack, user, isDarkMode, toggleDarkMode, onLogout, onTutorialStart, onViewChange, onOpenUserSettings, onOpenVersion, notifications = [], onRemoveNotification, onMarkNotificationsRead }) => {
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        const next = !showNotif;
        setShowNotif(next);
        if (!showNotif && onMarkNotificationsRead) onMarkNotificationsRead();
    };

    return (
        <header className={`sticky top-0 z-50 p-4 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/95 border-b border-gray-800' : 'bg-gray-50/95 border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {onBack && <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronLeft /></button>}
                    <h1 className="text-lg font-bold truncate cursor-pointer" onClick={() => onViewChange && onViewChange('dashboard')}>{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {onTutorialStart && <button onClick={onTutorialStart} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"><MonitorPlay className="w-4 h-4" /> 教學</button>}

                    {/* Notification */}
                    <div className="relative">
                        <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        {showNotif && <div className={`absolute top-12 right-0 w-96 p-4 rounded-xl shadow-2xl border z-50 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
                            <h4 className="font-bold px-3 py-2 text-sm border-b border-gray-500/10 mb-2">通知中心</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {notifications.length === 0 ? (
                                    <div className="text-xs opacity-60 text-center py-6">目前沒有新的通知。</div>
                                ) : notifications.map(n => (
                                    <div key={n.id} className="p-3 rounded-lg border border-gray-500/20 text-xs flex flex-col gap-1 bg-white/5">
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="font-semibold">{n.title || '系統通知'}</span>
                                            <button onClick={() => onRemoveNotification && onRemoveNotification(n.id)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                                        </div>
                                        <p className="opacity-80">{n.message}</p>
                                        <div className="flex justify-between text-[10px] opacity-60">
                                            <span>{n.time}</span>
                                            {n.url && <a href={n.url} target="_blank" className="text-indigo-400 flex items-center gap-1">查看<ArrowUpRight className="w-3 h-3" /></a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </div>

                    {/* Hover Menu */}
                    <div className="relative" onMouseEnter={() => setHoverMenu(true)} onMouseLeave={() => setHoverMenu(false)}>
                        <button className="p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all">
                            {user ? (
                                user.photoURL && !photoError ? (
                                    <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="user" onError={() => setPhotoError(true)} />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                        {getUserInitial(user.displayName || user.email)}
                                    </div>
                                )
                            ) : <UserCircle className="w-8 h-8" />}
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
                                    <button onClick={() => { setHoverMenu(false); onOpenVersion(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><History className="w-4 h-4" /> 版本資訊</button>
                                    <div className="h-px bg-gray-500/10 my-1"></div>
                                    <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 切換模式</button>
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

const AIGeminiModal = ({ isOpen, onClose, onApply, isDarkMode, contextCity, existingItems }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, transport, budget

    // Mock "Unlimited API" Logic
    const generateEnhancedAI = async (city) => {
        await new Promise(r => setTimeout(r, 1500)); // Simulate API/Thinking time

        // Dynamic mock data based on city
        const isJapan = city === "Tokyo" || city === "Osaka" || city === "Kyoto";
        const currency = isJapan ? "JPY" : "HKD";
        const rate = isJapan ? 20 : 1;

        return {
            itinerary: [
                { time: "09:00", name: `${city} 必去早市`, desc: "體驗當地早餐文化，推薦海鮮丼", cost: 150 * rate, currency, type: "food" },
                { time: "11:00", name: `${city} 歷史博物館`, desc: "了解城市歷史與文化背景", cost: 80 * rate, currency, type: "spot" },
                { time: "13:00", name: "米其林推薦午餐", desc: "當地排隊名店，建議提早預約", cost: 300 * rate, currency, type: "food" },
                { time: "15:00", name: "特色商店街購物", desc: "購買伴手禮與特色工藝品", cost: 500 * rate, currency, type: "shopping" },
                { time: "18:00", name: "夜景展望台", desc: "俯瞰全城絕美夜景", cost: 100 * rate, currency, type: "spot" },
            ],
            transport: [
                { type: "metro", name: "地鐵一日券", price: `${currency} ${45 * rate}`, desc: "最划算選擇，涵蓋主要景點", recommended: true },
                { type: "taxi", name: "計程車/Uber", price: `約 ${currency} ${200 * rate}/趟`, desc: "適合多人分攤，節省時間" },
                { type: "walk", name: "步行漫遊", price: "免費", desc: "市中心景點集中，適合步行" }
            ],
            budget: {
                total: 2000 * rate,
                breakdown: [
                    { label: "餐飲", amt: 600 * rate, percent: 30 },
                    { label: "購物", amt: 1000 * rate, percent: 50 },
                    { label: "交通", amt: 200 * rate, percent: 10 },
                    { label: "門票", amt: 200 * rate, percent: 10 },
                ]
            }
        };
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setResult(null);
            generateEnhancedAI(contextCity || "Tokyo")
                .then(res => { setResult(res); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [isOpen, contextCity]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden transform scale-100 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            <BrainCircuit className="w-6 h-6 text-indigo-500" /> AI 智能領隊
                        </h3>
                        <p className="text-xs opacity-60 mt-1">針對 {contextCity} 為您生成的深度分析</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-500/10 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                            <div className="text-center">
                                <p className="font-bold">AI 正在思考中...</p>
                                <p className="text-xs opacity-50">正在分析數百萬筆旅遊數據</p>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div className="flex p-1 bg-gray-500/10 rounded-xl">
                                {[{ id: 'itinerary', label: '行程建議', icon: List }, { id: 'transport', label: '交通分析', icon: BusFront }, { id: 'budget', label: '預算預估', icon: Wallet }].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-lg scale-[1.02]' : 'opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                                    >
                                        <t.icon className="w-4 h-4" /> {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Itinerary Tab */}
                            {activeTab === 'itinerary' && (
                                <div className="space-y-3 animate-fade-in">
                                    {result.itinerary.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-gray-500/10 hover:bg-gray-500/5 transition-colors group">
                                            <div className="font-mono text-sm font-bold text-indigo-400 pt-1">{item.time}</div>
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {item.name}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>{item.type === 'food' ? '美食' : '景點'}</span>
                                                </div>
                                                <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm">{item.currency} {item.cost}</div>
                                                <button className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mt-1">加入</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Transport Tab */}
                            {activeTab === 'transport' && (
                                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                                    {result.transport.map((t, i) => (
                                        <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 ${t.recommended ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-500/10'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'metro' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                {t.type === 'metro' ? <TrainFront className="w-5 h-5" /> : t.type === 'taxi' ? <Car className="w-5 h-5" /> : <Route className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {t.name}
                                                    {t.recommended && <span className="text-[10px] bg-indigo-500 text-white px-2 rounded-full">推薦</span>}
                                                </div>
                                                <p className="text-xs opacity-70">{t.desc}</p>
                                            </div>
                                            <div className="font-mono font-bold text-sm">{t.price}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Budget Tab */}
                            {activeTab === 'budget' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20">
                                        <p className="opacity-70 text-sm mb-1">預估單日總花費</p>
                                        <div className="text-4xl font-bold font-mono text-indigo-400">{result.itinerary[0].currency} {result.budget.total}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {result.budget.breakdown.map((b, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-gray-500/10 bg-gray-500/5">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="opacity-70 text-sm">{b.label}</span>
                                                    <span className="font-bold text-lg">{b.percent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${b.percent}%` }}></div>
                                                </div>
                                                <div className="text-right mt-2 text-xs opacity-50 font-mono">${b.amt}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-500/10 bg-gray-50/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100">關閉</button>
                    <button onClick={() => { onApply(result?.itinerary); onClose(); }} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!result}>
                        將行程加入
                    </button>
                </div>
            </div>
        </div>
    );
};

const MemberSettingsModal = ({ isOpen, onClose, members, onUpdateRole, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-lg rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all max-h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-8 flex-shrink-0">
                    <h3 className="text-2xl font-bold tracking-tight">成員權限管理</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    {members.map(m => (
                        <div key={m.id} className={`flex justify-between items-center p-4 border rounded-xl transition-all ${isDarkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {getUserInitial(m.name)}
                                </div>
                                <span className="text-sm font-bold">{m.name}</span>
                            </div>

                            {m.role === 'owner' ? <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg border border-indigo-500/20">Owner</span> : (
                                <select value={m.role} onChange={(e) => onUpdateRole(m.id, e.target.value)} className={`bg-transparent text-xs font-bold opacity-80 border-none outline-none focus:ring-0 cursor-pointer hover:opacity-100 py-1`}>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                    <option value="remove" className="text-red-500">Remove</option>
                                </select>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="w-full mt-6 py-3.5 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-xl font-bold transition-all flex-shrink-0">
                    關閉
                </button>
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">個人設定</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

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

                <button onClick={onClose} className={buttonPrimary + " mt-10 w-full py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>
                    完成設定
                </button>
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
                    <span className="font-mono">Author: {AUTHOR_NAME}</span>
                    <span className="font-mono bg-gray-500/10 px-2 py-0.5 rounded">{APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};

const InviteModal = ({ isOpen, onClose, tripId, onInvite, isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-lg rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">邀請成員</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">Google Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" className={inputClasses(isDarkMode)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">權限設定</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                            <option value="editor">編輯者 (可修改行程)</option>
                            <option value="viewer">檢視者 (僅供檢視)</option>
                        </select>
                    </div>
                    <div className="pt-4 flex flex-col gap-4">
                        <button onClick={() => { onInvite(email, role); onClose(); }} className={buttonPrimary + " w-full py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>發送邀請</button>
                        <button onClick={onClose} className="w-full text-center text-sm opacity-50 hover:opacity-100 transition-opacity font-medium py-2">取消</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode }) => {
    const [form, setForm] = useState(trip);
    useEffect(() => { if (trip) setForm(trip) }, [trip]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-xl p-8 rounded-2xl ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">行程設定</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">行程名稱</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClasses(isDarkMode)} placeholder="名稱" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程日期</label>
                        <div className="flex items-center gap-2 p-1 border rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.startDate}
                                    max={form.endDate}
                                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                />
                            </div>
                            <div className="opacity-30"><MoveRight className="w-4 h-4" /></div>
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.endDate}
                                    min={form.startDate}
                                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">國家</label>
                            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>{Object.keys(COUNTRIES_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">城市</label>
                            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClasses(isDarkMode)} placeholder="城市" />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                        <button onClick={() => { onUpdate(form); onClose(); }} className={buttonPrimary + " flex-1 py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>儲存設定</button>
                    </div>
                </div>
            </div>
        </div>
    );
};



const AddActivityModal = ({ isOpen, onClose, onSave, isDarkMode, date, defaultType = 'spot', editData = null, members = [] }) => {
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [type, setType] = useState('spot');
    const [currency, setCurrency] = useState('HKD');
    const [payer, setPayer] = useState('');
    const [splitType, setSplitType] = useState('group');
    const [details, setDetails] = useState({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
    const [estPrice, setEstPrice] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setName(editData.name || editData.desc || ''); setCost(editData.cost || ''); setType(editData.type || editData.category || 'spot'); setCurrency(editData.currency || 'HKD');
                setPayer(editData.payer || members[0]?.name);
                setSplitType(editData.splitType || 'group');
                setDetails(editData.details || { isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
                setEstPrice(editData.estPrice || '');
            } else {
                // Reset for new item
                setName(''); setCost(''); setType(defaultType); setCurrency('HKD');
                setPayer(members[0]?.name || '');
                setSplitType('group');
                setDetails({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
                setEstPrice('');
            }
        }
    }, [isOpen, editData, defaultType, members]);

    if (!isOpen) return null;

    const categories = [
        { id: 'spot', label: '景點', icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'food', label: '餐廳', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'shopping', label: '購物', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'transport', label: '交通', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'flight', label: '航班', icon: PlaneTakeoff, color: 'text-sky-500', bg: 'bg-sky-500/10' },
        { id: 'hotel', label: '住宿', icon: Hotel, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-xl p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-2xl tracking-tight">{editData ? '編輯行程項目' : '加入行程項目'}</h3>
                        {date && (
                            <div className="text-sm font-medium opacity-60 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {formatDate(date)}（{getWeekday(date)}）
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setType(cat.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${type === cat.id ? `${isDarkMode ? 'bg-gray-800 border-gray-600 ring-2 ring-indigo-500/50' : 'bg-white border-gray-300 ring-2 ring-indigo-500/20'} shadow-lg transform scale-105` : 'border-transparent opacity-60 hover:opacity-100 hover:bg-gray-500/5'} `}
                        >
                            <div className={`p-2 rounded-full mb-2 ${type === cat.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}>
                                <cat.icon className={`w-6 h-6 ${type === cat.id ? 'text-indigo-500' : ''}`} />
                            </div>
                            <span className={`text-[11px] font-bold ${type === cat.id ? 'text-indigo-500' : ''}`}>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">名稱</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="給這個行程一個名字..." className={inputClasses(isDarkMode)} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">時間</label>
                            <input type="time" value={details.time || ''} onChange={e => setDetails({ ...details, time: e.target.value })} className={inputClasses(isDarkMode)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">地點</label>
                            <input value={details.location || ''} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="輸入地點" className={inputClasses(isDarkMode)} />
                        </div>
                    </div>

                    {type === 'flight' && (
                        <div className="p-5 border rounded-2xl bg-gray-500/5 border-gray-500/10 transition-all hover:bg-gray-500/10">
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">航班資訊</label>
                            <div className="flex gap-4 items-center">
                                <input value={details.number || ''} onChange={e => setDetails({ ...details, number: e.target.value })} placeholder="航班編號 (如: BR198)" className={inputClasses(isDarkMode)} />
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap bg-gray-500/10 px-4 py-3.5 rounded-xl border border-transparent hover:border-gray-500/20 transition-all">
                                    <input type="checkbox" checked={details.layover} onChange={e => setDetails({ ...details, layover: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                    需轉機
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Cost Section */}
                    {defaultType !== 'shopping_plan' && (
                        <div className="p-5 border rounded-2xl bg-gray-500/5 border-gray-500/10 space-y-5 transition-all hover:bg-gray-500/10">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">金額</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-mono">$</span>
                                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" className={inputClasses(isDarkMode) + " pl-8"} />
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">貨幣</label>
                                    <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClasses(isDarkMode) + " appearance-none cursor-pointer text-center"}>{Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}</select>
                                </div>
                            </div>

                            {(type === 'shopping' || type === 'hotel' || type === 'flight') && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-500/10">
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預估稅金</label>
                                        <input placeholder="0" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.tax} onChange={e => setDetails({ ...details, tax: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預估退稅</label>
                                        <input placeholder="0" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.refund} onChange={e => setDetails({ ...details, refund: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {cost > 0 && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-500/10">
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">付款人</label>
                                        <select value={payer} onChange={e => setPayer(e.target.value)} className={inputClasses(isDarkMode) + " py-2 text-sm cursor-pointer"}>{members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">分攤方式</label>
                                        <select value={splitType} onChange={e => setSplitType(e.target.value)} className={inputClasses(isDarkMode) + " py-2 text-sm cursor-pointer"}><option value="group">多人均分</option><option value="me">個人支出</option></select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {defaultType === 'shopping_plan' && (
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預計價格</label>
                            <input type="number" value={estPrice} onChange={e => setEstPrice(e.target.value)} placeholder="輸入預計價格" className={inputClasses(isDarkMode)} />
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-500/10">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                    <button onClick={() => { onSave({ id: editData?.id, name, cost: Number(cost), estPrice: Number(estPrice), currency, type, details, payer, splitType }); onClose(); }} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        {editData ? '儲存變更' : '確認加入'}
                    </button>
                </div>
            </div>
        </div>
    );
};



// --- Active Users Presence Component ---




const ActiveUsersList = ({ tripId, user, activeTab, language = "zh-TW" }) => {
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        if (!tripId || !user) return;

        const presenceRef = doc(db, "trips", tripId, "presence", user.uid);

        const updatePresence = () => {
            setDoc(presenceRef, {
                user: {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    photo: user.photoURL || null
                },
                activeTab,
                lastActive: Date.now()
            }, { merge: true });
        };

        updatePresence();
        const interval = setInterval(updatePresence, 10000);

        const presenceColl = collection(db, "trips", tripId, "presence");
        const unsub = onSnapshot(presenceColl, (snapshot) => {
            const now = Date.now();
            const users = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // 顯示所有最近 60 秒活躍的用戶，包括自己
                if (now - data.lastActive < 60000) {
                    users.push(data);
                }
            });
            // 排序：自己排第一個，然後按時間倒序
            users.sort((a, b) => {
                if (a.user.uid === user.uid) return -1;
                if (b.user.uid === user.uid) return 1;
                return b.lastActive - a.lastActive;
            });
            setActiveUsers(users);
        });

        return () => {
            clearInterval(interval);
            unsub();
            // Optional: deleteDoc(presenceRef) - 保留這行如果想離線即刪除，或者註解掉以保留 "Last seen"
            deleteDoc(presenceRef).catch(err => console.error("Presence cleanup failed", err));
        };
    }, [tripId, user.uid, activeTab, language]);

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center -space-x-2 mr-4 animate-fade-in pointer-events-auto">
            {activeUsers.slice(0, 5).map((u, i) => {
                const isMe = u.user.uid === user.uid;
                const timeDiff = Math.floor((Date.now() - u.lastActive) / 1000);
                const statusText = timeDiff < 15 ? (language === 'zh-TW' ? '剛剛' : 'Just now') : `${timeDiff}${language === 'zh-TW' ? '秒前' : 's ago'}`;
                const tabName = TAB_LABELS[u.activeTab]?.[language] || u.activeTab || (language === 'zh-TW' ? '總覽' : 'Overview');

                return (
                    <div key={u.user.uid} className={`relative group cursor-help z-${10 - i}`}>
                        {u.user.photo ? (
                            <img src={u.user.photo} alt={u.user.name}
                                className={`w-8 h-8 rounded-full border-2 object-cover transition-transform hover:scale-110 ${isMe ? 'border-green-400 ring-2 ring-green-400/30' : 'border-white dark:border-gray-800'}`} />
                        ) : (
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold transition-transform hover:scale-110 ${isMe ? 'bg-green-500 border-green-400 ring-2 ring-green-400/30' : 'bg-indigo-500 border-white dark:border-gray-800'}`}>
                                {getUserInitial(u.user.name)}
                            </div>
                        )}
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl border border-white/10">
                            <div className="font-bold flex items-center gap-1">
                                {u.user.name} {isMe && <span className="text-green-400">(Me)</span>}
                            </div>
                            <div className="opacity-70">
                                {language === 'zh-TW' ? '正在查看: ' : 'Viewing: '}{tabName}
                            </div>
                            <div className="opacity-50 text-[9px]">
                                {language === 'zh-TW' ? '活躍於: ' : 'Active: '}{statusText}
                            </div>
                        </div>
                    </div>
                );
            })}
            {activeUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold z-0">
                    +{activeUsers.length - 5}
                </div>
            )}
        </div>
    );
};

// --- Files & Attachments Tab ---

// --- Trip Detail Wrapper (handles ALL data loading, TripDetailContent only renders when trip is ready) ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates, onOpenSmartImport, weatherData }) => {
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
    const [convAmount, setConvAmount] = useState(1000); // Default amount for Trip Detail Tab
    const [convTo, setConvTo] = useState('JPY'); // Default target
    // Try to auto-detect currency from country when realTrip loads
    useEffect(() => {
        if (trip?.country) {
            // Simple mapping for demo. In production, COUNTRIES_DATA should have currency code.
            const country = trip.country;
            if (country.includes('Japan') || country.includes('日本')) setConvTo('JPY');
            else if (country.includes('Taiwan') || country.includes('台灣')) setConvTo('TWD');
            else if (country.includes('Korea') || country.includes('韓國')) setConvTo('KRW');
            else if (country.includes('US') || country.includes('美國')) setConvTo('USD');
            else if (country.includes('UK') || country.includes('英國')) setConvTo('GBP');
            else if (country.includes('Europe') || country.includes('歐洲')) setConvTo('EUR');
        }
    }, [trip?.country]);

    // Loading state
    if (isLoading) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-500" />
                <div className="mt-4 text-lg opacity-70">載入行程中...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4 text-xl">⚠️ {error}</div>
                <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">返回</button>
            </div>
        );
    }

    // No trip data
    if (!trip) {
        return (
            <div className="p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-yellow-500 mb-4 text-xl">⚠️ 無法載入行程</div>
                <button onClick={onBack} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">返回</button>
            </div>
        );
    }

    // ONLY render TripDetailContent when trip is definitely available
    // This ensures TripDetailContent's hooks are ALWAYS called with valid trip data
    return (
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
            // Currency Props
            convAmount={convAmount}
            setConvAmount={setConvAmount}
            convTo={convTo}
            setConvTo={setConvTo}
            onOpenSmartImport={onOpenSmartImport}
            weatherData={weatherData}
        />
    );
};



// --- Trip Detail Content (UI only - trip is GUARANTEED to exist) ---
// No data loading here - all hooks will always execute consistently
const TripDetailContent = ({ trip, tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates, convAmount, setConvAmount, convTo, setConvTo, onOpenSmartImport, weatherData }) => {
    // ============================================
    // UI STATE HOOKS - trip is guaranteed to exist via wrapper!
    // ============================================
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isAddModal, setIsAddModal] = useState(false);
    const [isInviteModal, setIsInviteModal] = useState(false);
    const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
    const [isAIModal, setIsAIModal] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [addType, setAddType] = useState('spot');
    const [viewMode, setViewMode] = useState('list');
    const [noteEdit, setNoteEdit] = useState(false);
    const [tempNote, setTempNote] = useState(trip.notes || '');
    const [myInsurance, setMyInsurance] = useState(trip.insurance?.private?.[isSimulation ? 'sim' : user.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [dataModalConfig, setDataModalConfig] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState({ shopping: null, budget: null });
    const [visaForm, setVisaForm] = useState({ status: '', number: '', expiry: '', needsPrint: false });

    // ============================================
    // SYNC EFFECTS - trip is ALWAYS valid here
    // ============================================

    // Visa form sync
    useEffect(() => {
        const visaStore = trip.visa || {};
        const myVisa = isSimulation ? visaStore.sim : (visaStore[user.uid] || visaStore.default);
        setVisaForm({
            status: myVisa?.status || '',
            number: myVisa?.number || '',
            expiry: myVisa?.expiry || '',
            needsPrint: Boolean(myVisa?.needsPrint)
        });
    }, [trip.visa, user.uid, isSimulation]);

    // Background image sync
    useEffect(() => {
        setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE);
        return () => setGlobalBg(null);
    }, [trip.country, setGlobalBg]);

    // Note and insurance sync when trip updates
    useEffect(() => {
        setTempNote(trip.notes || "");
        setMyInsurance(trip.insurance?.private?.[isSimulation ? 'sim' : user.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    }, [trip.notes, trip.insurance, user.uid, isSimulation]);

    // ============================================
    // DERIVED VALUES (trip is always valid)
    // ============================================

    const myRole = trip.members?.find(m => m.id === user.uid)?.role || 'viewer';
    const isOwner = myRole === 'owner' || isSimulation;
    const canEdit = myRole === 'owner' || myRole === 'editor' || isSimulation;



    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];
    // Weather Logic: Try Real > Mock
    const mockWeather = getWeatherForecast(trip.country);
    const realWeather = weatherData?.[trip.city];
    const dailyWeather = realWeather ? {
        ...mockWeather, // Keep clothes/outfit from mock (based on region)
        temp: realWeather.temp,
        desc: realWeather.desc,
        icon: realWeather.icon
    } : mockWeather;
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.lang || 'zh-TW';
    const displayCountry = getLocalizedCountryName(trip.country, currentLang);
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);
    const itineraryItems = trip.itinerary?.[currentDisplayDate] || [];
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems);

    const homeHolidays = getHolidayMap(globalSettings.region || "HK");
    const destHolidays = getHolidayMap(countryInfo.tz || "Global");

    // Emergency Info Logic
    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

    // Drag & Drop
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
        if (!canEdit) return alert("權限不足");
        if (isSimulation) return alert("模擬模式");
        const newItem = { id: data.id || Date.now().toString(), ...data, createdBy: { name: user.displayName, id: user.uid } };
        if (data.type === 'shopping_plan') await updateDoc(doc(db, "trips", trip.id), { shoppingList: arrayUnion({ ...newItem, bought: false }) });
        else if (data.type === 'shopping') await updateDoc(doc(db, "trips", trip.id), { budget: arrayUnion({ ...newItem, category: 'shopping' }) });
        else {
            await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: arrayUnion(newItem) });
            if (data.cost > 0) await updateDoc(doc(db, "trips", trip.id), { budget: arrayUnion({ ...newItem, category: data.type }) });
        }
        setIsAddModal(false);
    };

    const handleInvite = async (email, role) => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { members: arrayUnion({ id: email, name: email.split('@')[0], role }) });
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

    const handleSaveInsurance = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`insurance.private.${user.uid}`]: myInsurance });
        alert("已儲存");
    };

    const handleSaveVisa = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`visa.${user.uid}`]: visaForm });
        alert("簽證資訊已更新");
    };

    const handleAIApply = async (generatedItems = []) => {
        if (isSimulation) return alert("模擬模式");
        if (!generatedItems.length) return;
        const docRef = doc(db, "trips", trip.id);
        const enriched = generatedItems.map((item, idx) => ({
            id: `${Date.now()}-${idx}`,
            ...item,
            cost: item.cost || 0,
            currency: item.currency || globalSettings.currency,
            details: { time: item.time, location: item.details?.location || `${trip.city} must-see` },
            createdBy: { name: "AI Guide" }
        }));
        await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: arrayUnion(...enriched) });
    };

    const sectionDataMap = {
        itinerary: itineraryItems,
        shopping: trip.shoppingList || [],
        budget: trip.budget || []
    };

    const openSectionModal = (mode, section) => {
        const data = mode === 'export' ? JSON.stringify(sectionDataMap[section] || [], null, 2) : "";
        setDataModalConfig({ mode, section, data });
    };

    const closeSectionModal = () => setDataModalConfig(null);

    const handleDashboardImport = async (inputData, mode, targetTripId) => {
        if (isSimulation) return alert("模擬模式");
        try {
            // setImportError(''); // This variable is not defined in this scope
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

            alert("匯入完成");
        } catch (e) {
            console.error(e);
            sendNotification("匯入失敗 ❌", e.message, 'error');
            // setImportError(e.message);
        }
    };

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
                    createdBy: { name: user.displayName, id: user.uid }
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
                    payer: item.payer || user.displayName,
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

    const handleExportPdf = () => {
        const summaryHtml = `
            <html>
                <head><title>${trip.name} Summary</title></head>
                <body style="font-family: sans-serif; padding:24px;">
                    <h1>${trip.name}</h1>
                    <p>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)} | ${displayCountry} ${displayCity}</p>
                    <h2>Itinerary (${days.length} days)</h2>
                    <pre>${JSON.stringify(trip.itinerary, null, 2)}</pre>
                    <h2>Budget</h2>
                    <pre>${JSON.stringify(trip.budget, null, 2)}</pre>
                    <h2>Shopping</h2>
                    <pre>${JSON.stringify(trip.shoppingList, null, 2)}</pre>
                </body>
            </html>`;
        const win = window.open('', '_blank');
        if (!win) return alert("請允許瀏覽器開啟新視窗以匯出 PDF");
        win.document.write(summaryHtml);
        win.document.close();
        win.focus();
        win.print();
    };

    const handleReceiptUpload = (section, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setReceiptPreview(prev => ({ ...prev, [section]: ev.target.result }));
        reader.readAsDataURL(file);
    };

    return (
        <div id="trip-detail-content" className="max-w-6xl mx-auto p-4 pb-20 animate-fade-in">
            {/* Header (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`${glassCard(isDarkMode)} col-span-1 md:col-span-2 p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${countryInfo.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-bold mb-2">{trip.name}</h2>
                                {isOwner && <button onClick={() => setIsTripSettingsOpen(true)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30"><Edit3 className="w-4 h-4" /></button>}
                            </div>
                            {/* 在線用戶列表 */}
                            <ActiveUsersList tripId={trip.id} user={user} activeTab={activeTab} language={globalSettings.language} />
                        </div>
                        <div className="flex gap-4 text-sm opacity-90">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                            <span className="flex items-center gap-1"><MapIcon className="w-4 h-4" /> {displayCountry} {displayCity}</span>
                        </div>
                    </div>
                </div>
                <div className={`${glassCard(isDarkMode)} p-6 flex flex-col justify-between`}>
                    <div>
                        <div className="text-xs opacity-50 uppercase mb-2 font-bold">智慧摘要</div>
                        <div className="text-2xl font-bold mb-1 flex items-center gap-2">{trip.city} <span className="text-lg font-normal opacity-70">{dailyWeather.temp}</span></div>
                        <div className="text-sm opacity-70 flex flex-col gap-1">
                            {timeDiff !== 0 && <span className="text-red-400">⚠️ 時差: {timeDiff > 0 ? `快${timeDiff}hr` : `慢${Math.abs(timeDiff)}hr`}</span>}
                            <span className="flex items-center gap-2">{dailyWeather.icon} 衣著: {dailyWeather.clothes} {dailyWeather.outfitIcon && <img src={dailyWeather.outfitIcon} alt="outfit" className="w-5 h-5" />}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => setIsAIModal(true)} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:from-indigo-600 hover:to-purple-700 font-bold text-xs transition-all duration-300 hover:shadow-lg transform hover:scale-105 active:scale-95"><BrainCircuit className="w-4 h-4" /> AI 建議</button>

                        <div className="relative group">
                            <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"><List className="w-5 h-5" /></button>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                                {isOwner && (
                                    <>
                                        <button onClick={() => setIsMemberModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10">
                                            <Users className="w-4 h-4 text-blue-400" /> 成員管理
                                        </button>
                                        <button onClick={() => setIsInviteModal(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10">
                                            <UserPlus className="w-4 h-4 text-green-400" /> 邀請朋友
                                        </button>
                                        <button onClick={handleDeleteTrip} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" /> 刪除行程
                                        </button>
                                    </>
                                )}
                                {!isOwner && <div className="px-4 py-3 text-xs opacity-50 text-center">僅擁有者可操作</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {[{ id: 'itinerary', label: '行程', icon: CalendarDays }, { id: 'shopping', label: '購物', icon: ShoppingBag }, { id: 'budget', label: '預算', icon: Wallet }, { id: 'currency', label: '匯率', icon: DollarSign }, { id: 'files', label: '文件', icon: FileText }, { id: 'insurance', label: '保險', icon: Shield }, { id: 'emergency', label: '緊急', icon: Siren }, { id: 'visa', label: '簽證', icon: FileCheck }, { id: 'notes', label: '筆記', icon: NotebookPen }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105' : (isDarkMode ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}><t.icon className="w-4 h-4 mr-2" />{t.label}</button>))}
            </div>

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
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
                    onDrop={onDrop}
                    openSectionModal={openSectionModal}
                />
            )}

            {activeTab === 'insurance' && (
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
            )}

            {activeTab === 'visa' && (
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
            )}


            {
                activeTab === 'emergency' && (
                    <EmergencyTab
                        isDarkMode={isDarkMode}
                        countryInfo={countryInfo}
                        globalSettings={globalSettings}
                        emergencyInfoTitle={emergencyInfoTitle}
                        emergencyInfoContent={emergencyInfoContent}
                        glassCard={glassCard}
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
                activeTab === 'files' && (
                    <FilesTab trip={trip} user={user} isOwner={isOwner} language={globalSettings?.lang} />
                )
            }

            {
                activeTab === 'notes' && (
                    <NotesTab
                        trip={trip}
                        isDarkMode={isDarkMode}
                        isSimulation={isSimulation}
                        noteEdit={noteEdit}
                        setNoteEdit={setNoteEdit}
                        tempNote={tempNote}
                        setTempNote={setTempNote}
                        onSaveNotes={(notes) => updateDoc(doc(db, "trips", trip.id), { notes })}
                        glassCard={glassCard}
                    />
                )
            }

            {
                activeTab === 'shopping' && (
                    <ShoppingTab
                        trip={trip}
                        onOpenSectionModal={openSectionModal}
                        onAddItem={(type) => { setAddType(type); setIsAddModal(true); }}
                        handleReceiptUpload={handleReceiptUpload}
                        receiptPreview={receiptPreview}
                        glassCard={glassCard}
                    />
                )
            }

            <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user.uid, name: user.displayName }]} />
            <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
            <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
            <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />
            <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} />
            <TripExportImportModal
                isOpen={Boolean(dataModalConfig)}
                onClose={closeSectionModal}
                mode={dataModalConfig?.mode}
                sourceType="section"
                section={dataModalConfig?.section}
                data={dataModalConfig?.data}
                onImport={(text) => dataModalConfig?.mode === 'import' && handleSectionImport(dataModalConfig.section, text)}
                isDarkMode={isDarkMode}
                // We pass 'selectedData' as the trip for PDF export inside the modal, 
                // but for section, 'data' is the section content string.
                // The Modal logic expects 'selectedData' to be the Trip Object for PDF.
                // Let's UPDATE the Modal to accept an optional 'trip' prop specifically for context.
                // Wait, I can't update Modal rn without another tool call. 
                // Let's pass 'data' as the whole Trip Object if we want PDF? 
                // No, 'data' is the string content for JSON/Copy.
                // Check TripExportImportModal implementation again.
                // It sets selectedData = data when sourceType === 'section'.
                // And handleExportPDF uses selectedData.
                // So if I pass 'data' as JSON string, PDF export will fail.
                // I need to Pass the Trip object somehow.
                // I will add 'trip={trip}' here and later update the Modal to use it.
                trip={trip}
            />
        </div >
    );
};








// --- App Root ---
const App = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [globalBg, setGlobalBg] = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"); // Default BG
    const [globalSettings, setGlobalSettings] = useState({
        notifications: true,
        sound: true,
        language: 'zh-TW',
        currency: 'HKD'
    });

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

    // --- Notification System Hook ---
    const { notifications, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

    // 新增：匯率與天氣狀態
    const [exchangeRates, setExchangeRates] = useState(null);
    const [weatherData, setWeatherData] = useState({}); // {[CityName]: weatherObj }

    // 新增：獲取匯率數據
    useEffect(() => {
        async function fetchRates() {
            const rates = await getExchangeRates('HKD'); // 預設以 HKD 為基準
            setExchangeRates(rates);
        }
        fetchRates();
    }, []);

    // 新增：獲取天氣數據
    useEffect(() => {
        async function fetchAllWeather() {
            const newWeatherData = {};
            const cities = Object.keys(CITY_COORDS);

            for (const city of cities) {
                const { lat, lon } = CITY_COORDS[city];
                const data = await getWeather(lat, lon);
                if (data && data.current) {
                    const info = getWeatherInfo(data.current.weathercode);
                    newWeatherData[city] = {
                        temp: `${Math.round(data.current.temperature_2m)}°C`,
                        desc: info.desc,
                        icon: info.icon,
                        details: data
                    };
                }
            }
            setWeatherData(newWeatherData);
        }
        fetchAllWeather();
    }, []);

    // --- Smart Alerts (Weather / Currency) ---
    useEffect(() => {
        if (!user || !globalSettings.notifications) return;

        // 1. Welcome Notification (Once per session)
        const hasWelcomed = sessionStorage.getItem('hasWelcomed');
        if (!hasWelcomed) {
            setTimeout(() => {
                sendNotification(
                    globalSettings.language === 'zh-TW' ? "歡迎回來!" : "Welcome Back!",
                    globalSettings.language === 'zh-TW' ? "又是規劃旅程的好日子 ✈️" : "Great day to plan a trip! ✈️",
                    "success"
                );
                sessionStorage.setItem('hasWelcomed', 'true');
            }, 1000);
        }

        // 2. Weather Alerts (Simulated check on data load)
        if (Object.keys(weatherData).length > 0) {
            Object.entries(weatherData).forEach(([city, data]) => {
                if (data.desc.includes('雨') || data.desc.includes('Rain') || data.desc.includes('Snow')) {
                    // Prevent spamming: check if we already notified for this city recently (omitted for simplicity, or use simple simple logic)
                    // For now, just a one-off demo trigger could be annoying if it fires every render.
                    // We'll rely on a simple session flag check or just let it fire once per load for demo.
                    const key = `weather_alert_${city}`;
                    if (!sessionStorage.getItem(key)) {
                        sendNotification(
                            `${city} ${globalSettings.language === 'zh-TW' ? "天氣警報" : "Weather Alert"}`,
                            `${globalSettings.language === 'zh-TW' ? `預測會有${data.desc}，記得帶遮！` : `Forecast suggests ${data.desc}, bring an umbrella!`}`,
                            "warning"
                        );
                        sessionStorage.setItem(key, 'true');
                    }
                }
            });
        }

        // 3. Currency Alerts (Rates < Threshold)
        if (exchangeRates) { // Assuming exchangeRates is {JPY: 0.051, KRW: 0.0058 ... } based on HKD
            // Demo logic: If JPY < 0.052 (Cheap!)
            const jpyRate = exchangeRates['JPY'];
            if (jpyRate && jpyRate < 0.052) {
                const key = 'currency_alert_JPY';
                if (!sessionStorage.getItem(key)) {
                    sendNotification(
                        globalSettings.language === 'zh-TW' ? "日元匯率下跌！" : "JPY Rate Drop!",
                        globalSettings.language === 'zh-TW' ? `現價 ${jpyRate.toFixed(4)}，係時候唱錢啦！ 💴` : `Current rate ${jpyRate.toFixed(4)}, time to buy! 💴`,
                        "success"
                    );
                    sessionStorage.setItem(key, 'true');
                }
            }
        }

    }, [user, weatherData, exchangeRates, globalSettings.notifications, sendNotification, globalSettings.language]); // Added sendNotification and globalSettings.language to dependencies


    useEffect(() => { onAuthStateChanged(auth, setUser); }, []);

    // 新增：獲取匯率數據
    useEffect(() => {
        async function fetchRates() {
            const rates = await getExchangeRates('HKD'); // 預設以 HKD 為基準
            setExchangeRates(rates);
        }
        fetchRates();
    }, []);

    // 新增：獲取天氣數據
    useEffect(() => {
        async function fetchAllWeather() {
            const newWeatherData = {};
            const cities = Object.keys(CITY_COORDS);

            for (const city of cities) {
                const { lat, lon } = CITY_COORDS[city];
                const data = await getWeather(lat, lon);
                if (data && data.current) {
                    const info = getWeatherInfo(data.current.weathercode);
                    newWeatherData[city] = {
                        temp: `${Math.round(data.current.temperature_2m)}°C`,
                        desc: info.desc,
                        icon: info.icon,
                        details: data
                    };
                }
            }
            setWeatherData(newWeatherData);
        }
        fetchAllWeather();
    }, []);



    if (!user) return <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />;


    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500/30 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900'} ${isSmartImportModalOpen ? 'blur-sm scale-[0.99]' : ''}`}>
            <NotificationSystem notifications={notifications} setNotifications={setNotifications} />
            {/* Background Image (Global) */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url(${globalBg})`, backgroundSize: 'cover' }}></div>
            <div className="relative z-10 flex-grow">
                {view !== 'tutorial' && <Header title="✈️ Travel Together" user={user} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => signOut(auth)} onBack={view !== 'dashboard' ? () => setView('dashboard') : null} onTutorialStart={() => setView('tutorial')} onViewChange={setView} onOpenUserSettings={() => setIsSettingsOpen(true)} onOpenVersion={() => setIsVersionOpen(true)} notifications={notifications} onRemoveNotification={removeNotification} onMarkNotificationsRead={markNotificationsRead} />}
                {view === 'dashboard' && (
                    <Dashboard
                        user={user}
                        onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); }}
                        isDarkMode={isDarkMode}
                        setGlobalBg={setGlobalBg}
                        globalSettings={globalSettings}
                        exchangeRates={exchangeRates}
                        weatherData={weatherData}
                        onViewChange={setView}
                    />
                )}
                {view === 'detail' && <TripDetail tripData={selectedTrip} user={user} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg} isSimulation={false} globalSettings={globalSettings} onBack={() => setView('dashboard')} exchangeRates={exchangeRates} />}
                {view === 'tutorial' && <div className="h-screen flex flex-col"><div className="p-4 border-b flex gap-4"><button onClick={() => setView('dashboard')}><ChevronLeft /></button> 模擬模式 (東京範例)</div><div className="flex-grow overflow-y-auto"><TripDetail tripData={SIMULATION_DATA} user={user} isDarkMode={isDarkMode} setGlobalBg={() => { }} isSimulation={true} globalSettings={globalSettings} exchangeRates={exchangeRates} weatherData={weatherData} /></div></div>}
            </div>
            {view !== 'tutorial' && <Footer isDarkMode={isDarkMode} onOpenVersion={() => setIsVersionOpen(true)} />}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} isDarkMode={isDarkMode} />
            <VersionModal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} isDarkMode={isDarkMode} globalSettings={globalSettings} />
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
                    <button onClick={onLogin} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition flex items-center gap-2"><LogIn className="w-5 h-5" /> Google 登入</button>
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