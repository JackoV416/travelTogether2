import React, { useState, useEffect, useRef } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { 
    Home, Users, PiggyBank, MapPin, NotebookPen, Loader2, Plus, 
    Sun, Moon, LogOut, ChevronLeft, CalendarDays, Bell, 
    AlertTriangle, ChevronDown, LogIn, Globe, Map as MapIcon, Calendar, 
    Trash2, Sparkles, X, BrainCircuit, Wallet, Plane, 
    Bus, ShoppingBag, BedDouble, Receipt, 
    CloudSun, CloudRain, Snowflake, Newspaper, 
    TrendingUp, Siren, Search, List, Star, 
    UserCircle, Shield, UserPlus, FileUp, Edit3, Lock,
    Clock, Save, RefreshCw, 
    MonitorPlay, Info, CheckSquare, FileCheck, FileText, History,
    PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Share2, Phone, Globe2, Link as LinkIcon, CheckCircle, Landmark
} from 'lucide-react';

// --- 0. Constants & Data ---

const AUTHOR_NAME = "Jamie Kwok";
const APP_VERSION = "v4.0.0";
const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

const VERSION_HISTORY = [
    { ver: "4.0.0", date: "26/11/2025", desc: "真實東京行程教學、新增項目支援稅務/轉機、緊急資訊地區修正、旅遊資訊中心UI優化", details: "1. 教學模式資料替換為真實東京5日遊。\n2. 新增項目可填寫稅金、退稅、航班轉機。\n3. 緊急資訊根據用戶所在地顯示正確辦事處。\n4. 日期格式全面統一為 DD/MM/YYYY。" },
    { ver: "3.9.2", date: "15/11/2025", desc: "修復旅遊資訊中心排版、突發訊息通知" },
    { ver: "3.9.0", date: "01/11/2025", desc: "修復時差顯示錯誤、行程編輯與拖拉功能" },
];

const CURRENCIES = {
    "HKD": { rate: 1, label: "HKD", symbol: "$" },
    "TWD": { rate: 4.15, label: "TWD", symbol: "NT$" },
    "JPY": { rate: 19.8, label: "JPY", symbol: "¥" },
    "KRW": { rate: 178, label: "KRW", symbol: "₩" },
    "USD": { rate: 0.128, label: "USD", symbol: "US$" },
    "EUR": { rate: 0.118, label: "EUR", symbol: "€" },
    "GBP": { rate: 0.101, label: "GBP", symbol: "£" },
    "THB": { rate: 4.65, label: "THB", symbol: "฿" },
};

const TIMEZONES = {
    "HK": { offset: 8, label: "香港" }, "TW": { offset: 8, label: "台北" }, 
    "JP": { offset: 9, label: "東京" }, "KR": { offset: 9, label: "首爾" }, 
    "TH": { offset: 7, label: "曼谷" }, "UK": { offset: 0, label: "倫敦" }, 
    "FR": { offset: 1, label: "巴黎" }, "US_NY": { offset: -5, label: "紐約" }, 
    "AU": { offset: 10, label: "雪梨" }
};

const COUNTRIES_DATA = {
    "Australia (澳洲)": { cities: ["Sydney", "Melbourne", "Brisbane", "Gold Coast"], image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600", region: "south", emergency: "000", taxRefund: "滿 AUD 300", entryInfo: "需申請 ETA", insuranceInfo: "建議購買涵蓋戶外活動之保險", consulate: "澳洲辦事處", tz: "AU" },
    "France (法國)": { cities: ["Paris", "Nice", "Lyon", "Marseille"], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600", region: "north", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根區建議投保3萬歐元以上醫療險", consulate: "駐法國代表處", tz: "FR" },
    "Japan (日本)": { cities: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa"], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 5000 JPY", entryInfo: "Visit Japan Web", insuranceInfo: "醫療費極高，強烈建議投保", consulate: "台北駐日經濟文化代表處", tz: "JP" },
    "Taiwan (台灣)": { cities: ["Taipei", "Kaohsiung", "Tainan", "Taichung"], image: "https://images.unsplash.com/photo-1508233620467-f79f1e317a05?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 2000 TWD", entryInfo: "入台證/網簽", insuranceInfo: "健保完善，旅客仍需旅平險", consulate: "-", tz: "TW" },
    "Thailand (泰國)": { cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"], image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600", region: "hot", emergency: "191", taxRefund: "滿 2000 THB", entryInfo: "免簽", insuranceInfo: "建議涵蓋機車騎乘意外險", consulate: "駐泰國代表處", tz: "TH" },
    "United Kingdom (英國)": { cities: ["London", "Edinburgh", "Manchester"], image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600", region: "north", emergency: "999", taxRefund: "無退稅", entryInfo: "免簽", insuranceInfo: "NHS 對遊客不免費，需醫療險", consulate: "駐英國代表處", tz: "UK" },
    "United States (美國)": { cities: ["New York", "Los Angeles", "San Francisco", "Las Vegas"], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600", region: "north", emergency: "911", taxRefund: "部分州", entryInfo: "ESTA", insuranceInfo: "醫療費用極高，強烈建議高額保險", consulate: "駐美代表處", tz: "US_NY" },
    "Other": { cities: [], image: DEFAULT_BG_IMAGE, region: "north", emergency: "112 (國際通用)", taxRefund: "Check Local", entryInfo: "Check Visa", insuranceInfo: "請查詢當地外交部建議", consulate: "當地領事館", tz: "UK" }
};

const HOLIDAYS = {
    "01-01": "元旦", "04-04": "兒童節", "12-25": "聖誕節", "04-01": "櫻花季(預測)"
};

const INFO_DB = {
    news: [
        { title: "日本櫻花季預測提早：東京3/20開花", country: "Japan", url: "https://www.japan-guide.com" },
        { title: "泰國潑水節擴大舉辦", country: "Thailand", url: "https://www.tourismthailand.org" },
        { title: "星宇航空新增西雅圖航線", country: "USA", url: "#" }
    ],
    weather: [
        { city: "Tokyo", temp: "12°C", desc: "多雲", tz: "Asia/Tokyo" }, 
        { city: "Taipei", temp: "22°C", desc: "晴朗", tz: "Asia/Taipei" },
        { city: "London", temp: "8°C", desc: "陰雨", tz: "Europe/London" }, 
        { city: "New York", temp: "5°C", desc: "寒冷", tz: "America/New_York" }
    ],
    hotels: [
        { name: "APA Shinjuku", country: "Japan", price: "$800", star: 4.2, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", url: "https://www.agoda.com", details: "雙人房 • 01/04/2025 • Agoda" },
        { name: "W Taipei", country: "Taiwan", price: "$2500", star: 4.8, img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400", url: "https://www.marriott.com", details: "景觀房 • 20/05/2025 • 官網" }
    ],
    flights: [
        { route: "HKG - TPE", airline: "EVA Air", price: "$1,800", tag: "熱門", url: "https://www.evaair.com", details: "BR856 • 17:00 起飛" },
        { route: "HKG - NRT", airline: "Cathay", price: "$3,500", tag: "早鳥", url: "https://www.cathaypacific.com", details: "CX500 • 09:00 起飛" }
    ]
};

// 📚 真實度 100% 東京 5 天 4 夜 教學資料
const SIMULATION_DATA = { 
    id: 'sim', name: "範例：東京 5 天 4 夜自由行", country: "Japan (日本)", city: "Tokyo", startDate: "2025-04-01", endDate: "2025-04-05", 
    members: [
        {id: 'me', name:"我 (Owner)", role: "owner"}, 
        {id: 'friend1', name:"小明 (Editor)", role: "editor"},
        {id: 'friend2', name:"小華 (Viewer)", role: "viewer"}
    ], 
    itinerary: { 
        "2025-04-01": [ 
            { id: "f1", name: "TPE -> NRT (BR198)", type: "flight", cost: 16000, currency: "TWD", details: { provider: "EVA Air", number: "BR198", time: "08:50", location: "Taoyuan Airport T2" }, createdBy: {name:"我"} },
            { id: "t1", name: "領取 JR Pass & Suica 儲值", type: "transport", cost: 5000, currency: "JPY", details: { time: "13:30", location: "Narita Airport JR Office" }, createdBy: {name:"小明"} },
            { id: "t2", name: "成田特快 N'EX 前往新宿", type: "transport", cost: 0, currency: "JPY", details: { time: "14:20", location: "Narita Airport Station" }, createdBy: {name:"我"} },
            { id: "h1", name: "新宿格拉斯麗飯店 Check-in", type: "hotel", cost: 60000, currency: "JPY", details: { time: "16:00", location: "Shinjuku Gracery Hotel" }, createdBy: {name:"我"} },
            { id: "d1", name: "晚餐：AFURI 拉麵", type: "food", cost: 1200, currency: "JPY", details: { time: "19:00", location: "Lumine Shinjuku" }, createdBy: {name:"小明"} }
        ],
        "2025-04-02": [
             { id: "s1", name: "東京迪士尼樂園", type: "spot", cost: 9800, currency: "JPY", details: { time: "08:30", location: "Tokyo Disneyland" }, createdBy: {name:"我"} },
             { id: "f2", name: "午餐：紅心女王宴會大廳", type: "food", cost: 2500, currency: "JPY", details: { time: "11:30", location: "Fantasyland" }, createdBy: {name:"小華"} },
             { id: "s2", name: "日間遊行：Harmony in Color", type: "spot", cost: 0, currency: "JPY", details: { time: "14:00", location: "Parade Route" }, createdBy: {name:"我"} },
             { id: "s3", name: "夜間遊行與煙火", type: "spot", cost: 0, currency: "JPY", details: { time: "19:30", location: "Cinderella Castle" }, createdBy: {name:"我"} }
        ],
        "2025-04-03": [
             { id: "s4", name: "明治神宮參拜", type: "spot", cost: 0, currency: "JPY", details: { time: "10:00", location: "Meiji Jingu" }, createdBy: {name:"我"} },
             { id: "s5", name: "原宿竹下通逛街", type: "shopping", cost: 15000, currency: "JPY", details: { time: "11:30", location: "Takeshita Street" }, createdBy: {name:"小明"} },
             { id: "s6", name: "澀谷 SKY 觀景台 (日落)", type: "spot", cost: 2200, currency: "JPY", details: { time: "17:30", location: "Shibuya Scramble Square" }, createdBy: {name:"我"} },
             { id: "d2", name: "晚餐：敘敘苑燒肉 (已訂位)", type: "food", cost: 15000, currency: "JPY", details: { time: "20:00", location: "Shibuya Branch" }, createdBy: {name:"小明"} }
        ]
    }, 
    budget: [
        { id: "b1", name: "機票 (我代墊)", cost: 32000, currency: "TWD", category: "flight", payer: "我", splitType: 'group' },
        { id: "b2", name: "住宿 3 晚", cost: 60000, currency: "JPY", category: "hotel", payer: "小明", splitType: 'group' },
        { id: "b3", name: "迪士尼門票", cost: 9800, currency: "JPY", category: "spot", payer: "我", splitType: 'group' }
    ],
    shoppingList: [
        { id: "s1", name: "Dyson 吹風機", estPrice: 45000, bought: false },
        { id: "s2", name: "合利他命 EX Plus", estPrice: 5500, bought: true, realCost: 5200 },
        { id: "s3", name: "Tokyo Banana 伴手禮", estPrice: 3000, bought: false }
    ],
    notes: "### 行前準備\n- [x] 護照影本備份\n- [x] Visit Japan Web 註冊 (截圖 QR Code)\n- [x] 網卡 (esim) 設定\n\n### 交通備忘\n- 記得在機場儲值 Suica 3000 日圓\n- 回程 N'EX 車票要提早劃位",
    insurance: { 
        "sim": { provider: "富邦產險", policyNo: "T55667788", status: "insured" }, 
        "local": { name: "Visit Japan Web", status: "done" } 
    },
    visa: { "sim": { status: "printed", number: "免簽入境", expiry: "2025-07-01", needsPrint: false } }
};

const INSURANCE_SUGGESTIONS = { "HK": ["Prudential", "AIG", "Blue Cross"], "TW": ["富邦", "國泰", "南山"], "Global": ["World Nomads", "Allianz"] };

// --- Helpers ---
const glassCard = (isDarkMode) => `backdrop-blur-xl border shadow-xl rounded-2xl transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-gray-900/90 border-gray-700 text-gray-100' : 'bg-white/90 border-white/60 text-gray-900'}`;
const inputClasses = (isDarkMode) => `w-full p-3 rounded-xl border transition-all outline-none ${isDarkMode ? 'bg-gray-800/80 border-gray-600 focus:border-indigo-400 text-white placeholder-gray-500' : 'bg-white/80 border-gray-300 focus:border-indigo-600 text-gray-900 placeholder-gray-400'}`;
const buttonPrimary = `flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 w-full cursor-pointer`;

const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];
const formatDate = (dateStr) => { if(!dateStr) return ""; const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; };
const getDaysArray = (start, end) => { if(!start || !end) return []; const arr = []; const dt = new Date(start); const endDt = new Date(end); while (dt <= endDt) { arr.push(new Date(dt).toISOString().split('T')[0]); dt.setDate(dt.getDate() + 1); } return arr; };
const getWeekday = (dateStr) => ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][new Date(dateStr).getDay()];

const getWeatherForecast = (country, date) => {
    const region = getSafeCountryInfo(country).region;
    const dayWeather = {
        "hot": { temp: "32°C", clothes: "短袖、墨鏡", icon: <Sun className="text-orange-500"/>, desc: "炎熱" },
        "south": { temp: "24°C", clothes: "薄襯衫", icon: <CloudSun className="text-yellow-500"/>, desc: "舒適" },
        "north": { temp: "12°C", clothes: "大衣、圍巾", icon: <Snowflake className="text-blue-300"/>, desc: "寒冷" }
    };
    const base = dayWeather[region] || dayWeather["north"];
    return { ...base, summary: `${base.desc}，適合戶外活動` };
};

const getTripSummary = (trip) => {
    if(!trip) return "";
    const now = new Date(); const start = new Date(trip.startDate); const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24)); 
    let summary = diffDays > 0 ? `距離出發 ${diffDays} 天` : "旅程進行中";
    const nextFlight = trip.itinerary?.[now.toISOString().split('T')[0]]?.find(i => i.type === 'flight');
    if (nextFlight) summary += ` • ✈️ ${nextFlight.details.number}`;
    return summary;
};

// Complex Budget Calculation (Fix: Calculate total then split)
const calculateDebts = (budget, repayments, members, baseCurrency) => {
    const balances = {}; members.forEach(m => balances[m.name] = 0); let totalSpent = 0;
    budget.forEach(item => {
        // Calculate final cost considering tax and refund
        const tax = item.details?.tax ? Number(item.details.tax) : 0;
        const refund = item.details?.refund ? Number(item.details.refund) : 0;
        const baseCost = Number(item.cost) + tax - refund;
        
        const cost = baseCost / (CURRENCIES[item.currency]?.rate || 1) * (CURRENCIES[baseCurrency]?.rate || 1);
        totalSpent += cost;
        
        const payer = item.payer || members[0].name;
        balances[payer] = (balances[payer] || 0) + cost; // Payer paid full amount first

        if (item.splitType === 'group' || !item.splitType) { 
            const split = cost / members.length; 
            members.forEach(m => balances[m.name] = (balances[m.name] || 0) - split); 
        } else if (item.splitType === 'me') { 
            balances[payer] = (balances[payer] || 0) - cost; // Payer consumes it, so net change is 0 for others
        }
    });
    return { balances, totalSpent };
};
const getTimeDiff = (userRegion, destCountry) => {
    const userTz = TIMEZONES[userRegion]?.offset || 8; 
    const destData = getSafeCountryInfo(destCountry);
    const destTzCode = destData.tz || "UK";
    const destTz = TIMEZONES[destTzCode]?.offset || 0;
    return destTz - userTz;
};
const getLocalCityTime = (tz) => new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });

// --- Components ---

const Footer = ({ isDarkMode }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return (
        <footer className={`mt-12 py-6 border-t text-center text-xs md:text-sm flex flex-col items-center gap-1 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-gray-200 text-gray-500'}`}>
            <div className="flex gap-2 font-bold"><span>Travel Together {APP_VERSION}</span><span>•</span><span>Design with ❤️</span></div>
            <div className="font-mono flex items-center gap-2"><Clock className="w-3 h-3"/> 當地時間: {time.toLocaleTimeString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</div>
        </footer>
    );
};

const Header = ({ title, onBack, user, isDarkMode, toggleDarkMode, onLogout, onTutorialStart, onViewChange, onOpenUserSettings, onOpenVersion }) => {
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [unread, setUnread] = useState(true);

    const handleBellClick = () => {
        setShowNotif(!showNotif);
        setUnread(false);
    };

    return (
        <header className={`sticky top-0 z-50 p-4 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/95 border-b border-gray-800' : 'bg-white/90 border-b border-white/20'} backdrop-blur-md shadow-sm`}>
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
                            <Bell className="w-5 h-5"/>
                            {unread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        {showNotif && <div className={`absolute top-12 right-0 w-72 p-4 rounded-xl shadow-2xl border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h4 className="font-bold px-3 py-2 text-sm border-b border-gray-500/10 mb-2">通知中心</h4>
                            {/* Removed fake delay message, only showing system status */}
                            <div className="p-4 text-center opacity-50 text-xs">暫無新通知</div>
                        </div>}
                    </div>

                    {/* Hover Menu */}
                    <div className="relative" onMouseEnter={()=>setHoverMenu(true)} onMouseLeave={()=>setHoverMenu(false)}>
                        <button className="p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all">
                            {user ? <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="user"/> : <UserCircle className="w-8 h-8"/>}
                        </button>
                        <div className={`absolute top-10 right-0 w-64 pt-4 transition-all duration-300 origin-top-right ${hoverMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                             <div className={`rounded-xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
                                <div className="p-4 border-b border-gray-500/10">
                                    <p className="font-bold truncate">{user?.displayName}</p>
                                    <p className="text-xs opacity-50 truncate">{user?.email}</p>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    <button onClick={() => { setHoverMenu(false); onViewChange('dashboard'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-gray-100'}`}><Home className="w-4 h-4"/> 我的行程</button>
                                    <button onClick={() => { setHoverMenu(false); onTutorialStart(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-gray-100'} md:hidden`}><MonitorPlay className="w-4 h-4"/> 教學模式</button>
                                    <button onClick={() => { setHoverMenu(false); onOpenUserSettings(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-gray-100'}`}><Edit3 className="w-4 h-4"/> 個人設定</button>
                                    <button onClick={() => { setHoverMenu(false); onOpenVersion(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-gray-100'}`}><History className="w-4 h-4"/> 版本資訊</button>
                                    <div className="h-px bg-gray-500/10 my-1"></div>
                                    <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-gray-100'}`}>{isDarkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>} 切換模式</button>
                                    <button onClick={onLogout} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-red-500 transition ${isDarkMode?'hover:bg-gray-700':'hover:bg-red-50'}`}><LogOut className="w-4 h-4"/> 登出</button>
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

const AIGeminiModal = ({ isOpen, onClose, onApply, isDarkMode }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    useEffect(() => {
        if(isOpen) {
            setLoading(true);
            setTimeout(() => {
                setResult([
                    { time: "09:00", name: "參觀國立博物館", type: "spot" },
                    { time: "12:30", name: "米其林推薦午餐", type: "food" },
                    { time: "15:00", name: "海濱公園散步", type: "spot" }
                ]);
                setLoading(false);
            }, 1500);
        } else { setResult(null); }
    }, [isOpen]);
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-500"/> AI 領隊建議</h3>
                {loading ? <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500"/> 分析中...</div> : (
                    <div className="space-y-4">
                         <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-sm"><p className="font-bold mb-2 opacity-80">✨ 建議行程：</p><ul className="space-y-2">{result?.map((item, i) => (<li key={i} className="flex gap-3 items-center border-b border-black/5 pb-1 last:border-0"><span className="font-mono text-xs opacity-50">{item.time}</span><span>{item.name}</span></li>))}</ul></div>
                        <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2 border border-gray-500 rounded-lg opacity-70">取消</button><button onClick={()=>{onApply(result); onClose();}} className={buttonPrimary + " flex-1"}>加入行程</button></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4">個人設定</h3>
                <div className="space-y-4">
                    <div><label className="block text-xs opacity-70 mb-1">貨幣</label><select value={globalSettings.currency} onChange={e=>setGlobalSettings({...globalSettings, currency:e.target.value})} className={inputClasses(isDarkMode)}>{Object.keys(CURRENCIES).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-xs opacity-70 mb-1">所在地 (用於緊急資訊)</label><select value={globalSettings.region} onChange={e=>setGlobalSettings({...globalSettings, region:e.target.value})} className={inputClasses(isDarkMode)}>{Object.keys(TIMEZONES).map(r=><option key={r} value={r}>{TIMEZONES[r].label}</option>)}</select></div>
                </div>
                <button onClick={onClose} className={buttonPrimary + " mt-6"}>完成</button>
            </div>
        </div>
    );
};

const VersionModal = ({ isOpen, onClose, isDarkMode }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-2xl`}>
                <h3 className="text-xl font-bold mb-4">版本紀錄</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {VERSION_HISTORY.map((v,i)=>(<div key={i} className="border-l-2 border-indigo-500 pl-4 pb-2"><div className="font-bold">{v.ver} <span className="text-xs opacity-50">{v.date}</span></div><p className="text-sm opacity-80 whitespace-pre-wrap">{v.desc}</p></div>))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-500/20 text-center text-xs opacity-50">Author: {AUTHOR_NAME}</div>
                <button onClick={onClose} className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-lg">關閉</button>
            </div>
        </div>
    );
};

const InviteModal = ({ isOpen, onClose, tripId, onInvite, isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4">邀請成員</h3>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Google Email" className={inputClasses(isDarkMode)+" mb-3"}/>
                <select value={role} onChange={e=>setRole(e.target.value)} className={inputClasses(isDarkMode)+" mb-4"}>
                    <option value="editor">編輯者 (可修改)</option>
                    <option value="viewer">檢視者 (唯讀)</option>
                </select>
                <button onClick={()=>{onInvite(email, role); onClose();}} className={buttonPrimary}>發送邀請</button>
                <button onClick={onClose} className="w-full text-center mt-3 text-xs opacity-50">取消</button>
            </div>
        </div>
    );
};

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode }) => {
    const [form, setForm] = useState(trip);
    useEffect(()=>{if(trip)setForm(trip)},[trip]);
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-2xl ${isDarkMode?'bg-gray-800':'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4">行程設定</h3>
                <div className="space-y-4">
                    <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className={inputClasses(isDarkMode)} placeholder="名稱"/>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} className={inputClasses(isDarkMode)}/>
                        <input type="date" value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} className={inputClasses(isDarkMode)}/>
                    </div>
                    <select value={form.country} onChange={e=>setForm({...form, country:e.target.value})} className={inputClasses(isDarkMode)}>{Object.keys(COUNTRIES_DATA).sort().map(c=><option key={c} value={c}>{c}</option>)}</select>
                    <input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className={inputClasses(isDarkMode)} placeholder="城市"/>
                    <button onClick={()=>{onUpdate(form); onClose();}} className={buttonPrimary}>儲存</button>
                    <button onClick={onClose} className="w-full text-center text-sm opacity-50">取消</button>
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
        if(isOpen && editData) { 
            setName(editData.name||editData.desc||''); setCost(editData.cost||''); setType(editData.type||editData.category||'spot'); setCurrency(editData.currency||'HKD'); 
            setPayer(editData.payer || members[0]?.name);
            setSplitType(editData.splitType || 'group');
            setDetails(editData.details || { isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
            setEstPrice(editData.estPrice || '');
        } else if(isOpen) { 
            setName(''); setCost(''); setType(defaultType); setCurrency('HKD'); 
            setPayer(members[0]?.name || '');
            setSplitType('group');
            setDetails({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
            setEstPrice('');
        } 
    }, [isOpen, editData, defaultType, members]);

    if(!isOpen) return null;

    const categories = [
        { id: 'spot', label: '景點', icon: MapIcon }, { id: 'food', label: '餐廳', icon: Utensils },
        { id: 'shopping', label: '購物', icon: ShoppingBag }, { id: 'transport', label: '交通', icon: Bus },
        { id: 'flight', label: '航班', icon: PlaneTakeoff }, { id: 'hotel', label: '住宿', icon: Hotel }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-2xl ${isDarkMode?'bg-gray-800':'bg-white'} max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <h3 className="font-bold mb-4">{editData?'編輯':'新增'}</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">{categories.map(cat=>(<button key={cat.id} onClick={()=>setType(cat.id)} className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] border transition ${type===cat.id?'bg-indigo-600 text-white border-indigo-600':'opacity-70'}`}><cat.icon className="w-5 h-5 mb-1"/><span className="text-[10px]">{cat.label}</span></button>))}</div>

                <input value={name} onChange={e=>setName(e.target.value)} placeholder="名稱" className={inputClasses(isDarkMode)+" mb-2"}/>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="time" value={details.time || ''} onChange={e=>setDetails({...details, time:e.target.value})} className={inputClasses(isDarkMode)}/>
                    <input value={details.location || ''} onChange={e=>setDetails({...details, location:e.target.value})} placeholder="地點" className={inputClasses(isDarkMode)}/>
                </div>
                
                {type === 'flight' && (
                     <div className="mb-2 p-3 border rounded bg-black/5">
                         <input value={details.number || ''} onChange={e=>setDetails({...details, number:e.target.value})} placeholder="航班編號 (如: BR198)" className={inputClasses(isDarkMode)+" mb-2"}/>
                         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={details.layover} onChange={e=>setDetails({...details, layover:e.target.checked})}/> 需轉機</label>
                     </div>
                )}

                {defaultType !== 'shopping_plan' && (
                    <>
                        <div className="flex gap-2 mb-2"><input type="number" value={cost} onChange={e=>setCost(e.target.value)} placeholder="金額" className={inputClasses(isDarkMode)}/><select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClasses(isDarkMode)+" w-1/3 appearance-none"}>{Object.keys(CURRENCIES).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        {(type === 'shopping' || type === 'hotel' || type === 'flight') && (
                             <div className="p-3 rounded-lg border mb-2 bg-black/5">
                                <div className="flex gap-2 mb-2"><input placeholder="稅金" type="number" className={inputClasses(isDarkMode)+" text-sm"} value={details.tax} onChange={e=>setDetails({...details, tax:e.target.value})} /><input placeholder="退稅額" type="number" className={inputClasses(isDarkMode)+" text-sm"} value={details.refund} onChange={e=>setDetails({...details, refund:e.target.value})} /></div>
                             </div>
                        )}
                        {cost > 0 && (
                            <div className="p-3 rounded-lg border mb-3 bg-black/5">
                                <div className="flex gap-2"><div className="flex-1"><label className="text-[10px]">付款人</label><select value={payer} onChange={e=>setPayer(e.target.value)} className={inputClasses(isDarkMode)+" py-1 text-sm"}>{members.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}</select></div><div className="flex-1"><label className="text-[10px]">歸屬</label><select value={splitType} onChange={e=>setSplitType(e.target.value)} className={inputClasses(isDarkMode)+" py-1 text-sm"}><option value="group">多人均分</option><option value="me">個人支出</option></select></div></div>
                            </div>
                        )}
                    </>
                )}
                {defaultType === 'shopping_plan' && <input type="number" value={estPrice} onChange={e=>setEstPrice(e.target.value)} placeholder="預計價格" className={inputClasses(isDarkMode)+" mb-2"}/>}
                <button onClick={()=>{onSave({id:editData?.id, name, cost:Number(cost), estPrice: Number(estPrice), currency, type, details, payer, splitType}); onClose();}} className={buttonPrimary}>確認</button>
                <button onClick={onClose} className="w-full text-center py-2 mt-2 opacity-50">取消</button>
            </div>
        </div>
    );
};

// --- Trip Detail ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings }) => {
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isAddModal, setIsAddModal] = useState(false);
    const [isInviteModal, setIsInviteModal] = useState(false);
    const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
    const [isAIModal, setIsAIModal] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [addType, setAddType] = useState('spot');
    const [viewMode, setViewMode] = useState('list');
    const [realTrip, setRealTrip] = useState(null);
    const [noteEdit, setNoteEdit] = useState(false);
    const [tempNote, setTempNote] = useState("");
    const [myInsurance, setMyInsurance] = useState({provider:'', policyNo:'', phone:'', notes:''});
    const [editingItem, setEditingItem] = useState(null);

    const trip = isSimulation ? tripData : realTrip;
    const myRole = trip?.members?.find(m => m.id === user.uid)?.role || 'viewer';
    const isOwner = myRole === 'owner' || isSimulation;
    const canEdit = myRole === 'owner' || myRole === 'editor' || isSimulation;

    useEffect(() => {
        if(isSimulation) { setTempNote(tripData.notes); setMyInsurance(tripData.insurance?.private?.sim || {}); return; }
        if(!tripData?.id) return;
        const unsub = onSnapshot(doc(db, "trips", tripData.id), d=>{ 
            if(d.exists()) {
                const data = d.data();
                setRealTrip({id:d.id, ...data});
                setTempNote(data.notes);
                setMyInsurance(data.insurance?.private?.[user.uid] || {});
            }
        });
        return () => unsub();
    }, [tripData, isSimulation]);

    useEffect(() => { if(trip) setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE); return ()=>setGlobalBg(null); }, [trip, setGlobalBg]);

    if (!trip) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/></div>;

    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];
    const dailyWeather = getWeatherForecast(trip.country, currentDisplayDate);
    const debtInfo = calculateDebts(trip.budget||[], trip.repayments||[], trip.members||[], globalSettings.currency);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    
    // Emergency Info Logic
    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

    const onDragStart = (e, index) => { e.dataTransfer.setData("idx", index); };
    const onDrop = async (e, dropIndex) => {
        if(!canEdit) return;
        const dragIndex = Number(e.dataTransfer.getData("idx"));
        const list = [...(trip.itinerary?.[currentDisplayDate] || [])];
        const [reorderedItem] = list.splice(dragIndex, 1);
        list.splice(dropIndex, 0, reorderedItem);
        if(!isSimulation) await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: list });
    };

    const handleSaveItem = async (data) => {
        if(!canEdit) return alert("權限不足");
        if(isSimulation) return alert("模擬模式");
        const newItem = { id: data.id || Date.now().toString(), ...data, createdBy: { name: user.displayName, id: user.uid } };
        if(data.type === 'shopping_plan') await updateDoc(doc(db,"trips",trip.id), { shoppingList: arrayUnion({...newItem, bought:false}) });
        else if(data.type === 'shopping') await updateDoc(doc(db,"trips",trip.id), { budget: arrayUnion({...newItem, category:'shopping'}) });
        else {
            await updateDoc(doc(db,"trips",trip.id), { [`itinerary.${currentDisplayDate}`]: arrayUnion(newItem) });
            if(data.cost > 0) await updateDoc(doc(db,"trips",trip.id), { budget: arrayUnion({...newItem, category: data.type}) });
        }
        setIsAddModal(false);
    };

    const handleInvite = async (email, role) => {
        if(isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { members: arrayUnion({id: email, name: email.split('@')[0], role}) });
    };

    const handleDeleteTrip = async () => {
        if(!isOwner) return alert("只有擁有者可以刪除");
        if(confirm("確定刪除？")) { await deleteDoc(doc(db, "trips", trip.id)); onBack(); }
    };

    const handleSaveInsurance = async () => {
        if(isSimulation) return alert("模擬模式");
        await updateDoc(doc(db,"trips",trip.id), { [`insurance.private.${user.uid}`]: myInsurance });
        alert("已儲存");
    };

    const handleAIApply = async (generatedItems) => {
        if(isSimulation) return alert("模擬模式");
        const newItem = { id: Date.now().toString(), name: "✨ AI 推薦行程", type: 'spot', cost: 0, currency: 'HKD', details: { time: "10:00", location: "Local Gem" }, createdBy: {name: "AI"} };
        await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: arrayUnion(newItem) });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 pb-20 animate-fade-in">
            {/* Header (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`${glassCard(isDarkMode)} col-span-1 md:col-span-2 p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${countryInfo.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex justify-between items-start">
                            <h2 className="text-3xl font-bold mb-2">{trip.name}</h2>
                            {canEdit && <button onClick={()=>setIsTripSettingsOpen(true)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30"><Edit3 className="w-4 h-4"/></button>}
                        </div>
                        <div className="flex gap-4 text-sm opacity-90">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                            <span className="flex items-center gap-1"><MapIcon className="w-4 h-4"/> {trip.country} {trip.city}</span>
                        </div>
                    </div>
                </div>
                <div className={`${glassCard(isDarkMode)} p-6 flex flex-col justify-between`}>
                    <div>
                        <div className="text-xs opacity-50 uppercase mb-2 font-bold">智慧摘要</div>
                        <div className="text-2xl font-bold mb-1 flex items-center gap-2">{trip.city} <span className="text-lg font-normal opacity-70">{dailyWeather.temp}</span></div>
                        <div className="text-sm opacity-70 flex flex-col gap-1">
                            {timeDiff !== 0 && <span className="text-red-400">⚠️ 時差: {timeDiff > 0 ? `快${timeDiff}hr` : `慢${Math.abs(timeDiff)}hr`}</span>}
                            <span className="flex items-center gap-2">{dailyWeather.icon} 衣著: {dailyWeather.clothes}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={()=>setIsAIModal(true)} className="flex-1 bg-indigo-500 text-white py-2 rounded flex justify-center items-center gap-2 hover:bg-indigo-600 font-bold text-xs"><BrainCircuit className="w-4 h-4"/> AI 建議</button>
                        {isOwner && <button onClick={()=>setIsInviteModal(true)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded flex justify-center"><UserPlus className="w-4 h-4"/></button>}
                        {isOwner && <button onClick={handleDeleteTrip} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded flex justify-center"><Trash2 className="w-4 h-4"/></button>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {[{id:'itinerary',label:'行程',icon:CalendarDays},{id:'shopping',label:'購物',icon:ShoppingBag},{id:'budget',label:'預算',icon:Wallet},{id:'insurance',label:'保險',icon:Shield},{id:'emergency',label:'緊急',icon:Siren},{id:'visa',label:'簽證',icon:FileCheck},{id:'notes',label:'筆記',icon:NotebookPen}].map(t=>(<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center px-4 py-2 rounded-full font-bold transition backdrop-blur-md whitespace-nowrap ${activeTab===t.id?'bg-indigo-600 text-white shadow-lg':(isDarkMode?'bg-gray-800/60 text-gray-300 hover:bg-gray-700':'bg-white/60 text-gray-600 hover:bg-white')}`}><t.icon className="w-4 h-4 mr-2"/>{t.label}</button>))}
            </div>

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {days.map((d)=>(
                            <button key={d} onClick={()=>setSelectDate(d)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition text-center min-w-[100px] relative overflow-hidden ${currentDisplayDate===d ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105' : (isDarkMode?'bg-gray-800/60 border-gray-700':'bg-white/60 border-gray-200')}`}>
                                <div className="text-xs opacity-70 uppercase mb-1">{getWeekday(d)}</div>
                                <div className="font-bold text-lg">{d.slice(8)}</div>
                                {HOLIDAYS[d.slice(5)] && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-1 rounded-bl">{HOLIDAYS[d.slice(5)]}</div>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="p-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">{dailyWeather.icon} <span>{dailyWeather.desc}</span></div>
                        <div className="flex items-center gap-2"><Info className="w-4 h-4"/> <span>衣著: {dailyWeather.clothes}</span></div>
                    </div>

                    <div className={glassCard(isDarkMode) + " p-4 min-h-[400px]"}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="font-bold text-lg flex items-center gap-3">{formatDate(currentDisplayDate)}</div>
                            <div className="flex gap-2">
                                <button onClick={()=>setViewMode(viewMode==='list'?'map':'list')} className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:opacity-80">{viewMode==='list'?<MapIcon className="w-4 h-4"/>:<List className="w-4 h-4"/>}</button>
                                {canEdit && <button onClick={()=>{setSelectDate(currentDisplayDate); setAddType('spot'); setEditingItem(null); setIsAddModal(true);}} className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded font-bold hover:bg-indigo-600 transition">+ 新增</button>}
                            </div>
                        </div>
                        {viewMode === 'list' ? (
                            <div className="p-4 space-y-2">
                                {(trip.itinerary?.[currentDisplayDate]||[]).map((item, i)=>(
                                    <div key={i} draggable={canEdit} onDragStart={(e)=>onDragStart(e, i)} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDrop(e, i)} onClick={()=>{if(canEdit){setAddType(item.type); setEditingItem(item); setIsAddModal(true);}}} className={`group p-3 border rounded-xl mb-2 flex items-center gap-3 hover:shadow-md transition cursor-pointer ${isDarkMode?'bg-gray-800/50 border-gray-700':'bg-white/60 border-gray-200'}`}>
                                        <div className={`p-2 rounded-full flex-shrink-0 ${item.type==='flight'?'bg-blue-100 text-blue-600':(item.type==='hotel'?'bg-orange-100 text-orange-600':'bg-gray-100 text-gray-600')}`}>
                                            {item.type==='flight'?<PlaneTakeoff className="w-4 h-4"/>:(item.type==='hotel'?<Hotel className="w-4 h-4"/>:<MapIcon className="w-4 h-4"/>)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="font-bold truncate">{item.name}</div>
                                            <div className="text-xs opacity-50 flex gap-2"><span>{item.details?.time}</span> <span>{item.details?.location}</span></div>
                                        </div>
                                        {item.details?.location && <a href={`https://www.google.com/maps/search/?api=1&query=${item.details.location}`} target="_blank" onClick={(e)=>e.stopPropagation()} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"><Navigation className="w-4 h-4"/></a>}
                                        {item.cost > 0 && <div className="text-xs font-mono bg-green-500/10 text-green-600 px-2 py-1 rounded">{item.currency} {item.cost}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800"><iframe width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.city + " " + trip.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}></iframe></div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'insurance' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                     <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><Lock className="w-5 h-5"/> 私人保險 (僅自己可見)</h3>
                        <div className="space-y-4">
                            <input value={myInsurance.provider||''} onChange={e=>setMyInsurance({...myInsurance, provider:e.target.value})} placeholder="保險公司" className={inputClasses(isDarkMode)}/>
                            <input value={myInsurance.policyNo||''} onChange={e=>setMyInsurance({...myInsurance, policyNo:e.target.value})} placeholder="保單號碼" className={inputClasses(isDarkMode)}/>
                            <input value={myInsurance.phone||''} onChange={e=>setMyInsurance({...myInsurance, phone:e.target.value})} placeholder="緊急聯絡電話" className={inputClasses(isDarkMode)}/>
                            <button onClick={handleSaveInsurance} className={buttonPrimary}>儲存資料</button>
                        </div>
                     </div>
                     <div className={glassCard(isDarkMode) + " p-6"}>
                         <h3 className="font-bold mb-4 flex gap-2"><Shield className="w-5 h-5"/> 建議與狀態</h3>
                         <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm mb-4">{countryInfo.insuranceInfo}</div>
                         <div className="flex gap-2">{INSURANCE_SUGGESTIONS[globalSettings.region]?.map(s=><span key={s} className="px-3 py-1 bg-white/10 border rounded-full text-sm">{s}</span>)}</div>
                     </div>
                 </div>
            )}

            {activeTab === 'emergency' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className={glassCard(isDarkMode) + " p-6 border-l-4 border-red-500"}>
                        <h3 className="font-bold text-red-500 mb-4 flex gap-2"><Siren className="w-5 h-5"/> 當地緊急電話</h3>
                        <div className="text-3xl font-bold mb-2">{countryInfo.emergency}</div>
                        <p className="opacity-70 text-sm">遇緊急狀況請優先撥打。</p>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><Globe2 className="w-5 h-5"/> {emergencyInfoTitle}</h3>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                            <div className="font-bold">{emergencyInfoContent}</div>
                            <div className="text-sm opacity-70 mt-1">地址與電話請查閱外交部網站。</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={glassCard(isDarkMode) + " p-6 text-center"}>
                            <div className="text-sm opacity-60 uppercase mb-1">總支出</div>
                            <div className="text-3xl font-bold font-mono text-indigo-500">${Math.round(debtInfo.totalSpent).toLocaleString()}</div>
                        </div>
                        <div className={glassCard(isDarkMode) + " p-6"}>
                            <h3 className="font-bold mb-2 flex gap-2"><RefreshCw className="w-4 h-4"/> 債務結算</h3>
                            <div className="space-y-2 text-sm">{Object.entries(debtInfo.balances).map(([name, bal])=>(<div key={name} className="flex justify-between border-b pb-1"><span>{name}</span><span className={bal>0?'text-green-500':'text-red-500'}>{bal>0?`應收 $${Math.round(bal)}`:`應付 $${Math.round(Math.abs(bal))}`}</span></div>))}</div>
                        </div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><List className="w-4 h-4"/> 支出明細</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">{(trip.budget||[]).map((b,i)=>(<div key={i} className="flex justify-between p-2 hover:bg-white/5 rounded text-sm"><span>{b.name||b.desc} ({b.payer})</span><span className="font-mono opacity-70">{b.currency} {b.cost}</span></div>))}</div>
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className={glassCard(isDarkMode) + " p-6 min-h-[500px] flex flex-col animate-fade-in"}>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2"><NotebookPen className="w-5 h-5"/> 備忘錄</h3><button onClick={()=>{if(noteEdit && !isSimulation) updateDoc(doc(db,"trips",trip.id),{notes:tempNote}); setNoteEdit(!noteEdit);}} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm">{noteEdit?'儲存':'編輯'}</button></div>
                    {noteEdit ? <textarea className={`w-full flex-grow p-4 rounded-xl border outline-none ${isDarkMode?'bg-gray-800 border-gray-700':'bg-white border-gray-200'}`} value={tempNote} onChange={e=>setTempNote(e.target.value)}/> : <div className="w-full flex-grow p-4 rounded-xl border overflow-y-auto whitespace-pre-wrap opacity-80">{tempNote || "暫無筆記"}</div>}
                </div>
            )}

            {activeTab === 'shopping' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><List className="w-5 h-5"/> 預計購買</h3><button onClick={()=>{setAddType('shopping_plan'); setIsAddModal(true)}} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">+ 新增</button></div>
                        {(trip.shoppingList||[]).filter(i=>!i.bought).map((item,i)=>(<div key={i} className="p-2 border rounded mb-2 flex justify-between"><span>{item.name}</span><span className="opacity-50 text-xs">預估: {item.estPrice}</span></div>))}
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><CheckSquare className="w-5 h-5"/> 已購入</h3><button onClick={()=>{setAddType('shopping'); setIsAddModal(true)}} className="text-xs bg-green-500 text-white px-2 py-1 rounded">+ 記帳</button></div>
                        {(trip.budget||[]).filter(i=>i.category==='shopping').map((item,i)=>(<div key={i} className="p-2 border rounded mb-2 flex justify-between bg-green-500/10"><span>{item.name||item.desc}</span><span className="font-mono">{item.currency} {item.cost}</span></div>))}
                    </div>
                </div>
            )}

            <AddActivityModal isOpen={isAddModal} onClose={()=>setIsAddModal(false)} onSave={handleSaveItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{id:user.uid, name:user.displayName}]}/>
            <TripSettingsModal isOpen={isTripSettingsOpen} onClose={()=>setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d)=>!isSimulation && updateDoc(doc(db,"trips",trip.id),d)} isDarkMode={isDarkMode}/>
            <InviteModal isOpen={isInviteModal} onClose={()=>setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode}/>
            <AIGeminiModal isOpen={isAIModal} onClose={()=>setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode}/>
        </div>
    );
};

// --- Dashboard ---
const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, setGlobalBg }) => {
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({ name: '', country: '', city: '', startDate: '', endDate: '' });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);

    useEffect(() => { if (!user) return; const q = query(collection(db, "trips")); const unsub = onSnapshot(q, s => { setTrips(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.members?.some(m => m.id === user.uid))); }); return () => unsub(); }, [user]);

    const handleCountryChange = (e) => {
        const c = e.target.value;
        setForm({...form, country: c});
        if (COUNTRIES_DATA[c]) setSelectedCountryImg(COUNTRIES_DATA[c].image);
    };

    const handleCreate = async () => { if (!form.name || !form.country) return alert("請填寫資訊"); await addDoc(collection(db, "trips"), { ...form, members: [{ id: user.uid, name: user.displayName, email: user.email, role: 'owner' }], createdAt: serverTimestamp(), itinerary: {}, budget: [], shoppingList: [], notes: "" }); setForm({ name: '', country: '', city: '', startDate: '', endDate: '' }); };

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-12 animate-fade-in">
            <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
                 <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{backgroundImage: `url(${selectedCountryImg})`}}></div>
                 <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plus className="w-6 h-6 text-indigo-500"/> 建立新行程</h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-12"><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="行程名稱 (如: 東京五日遊)" className={inputClasses(isDarkMode)}/></div>
                        <div className="md:col-span-6 relative"><select value={form.country} onChange={handleCountryChange} className={inputClasses(isDarkMode)}><option value="" disabled>選擇國家 (A-Z)</option>{Object.keys(COUNTRIES_DATA).sort().map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="md:col-span-6"><input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="城市" className={inputClasses(isDarkMode)}/></div>
                        <div className="md:col-span-6"><input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} className={inputClasses(isDarkMode)}/></div>
                        <div className="md:col-span-6"><input type="date" value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} className={inputClasses(isDarkMode)}/></div>
                        <div className="md:col-span-12"><button onClick={handleCreate} className={buttonPrimary}>建立行程</button></div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3 mb-6">我的行程</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trips.map(t => (
                        <div key={t.id} onClick={() => onSelectTrip(t)} className={`${glassCard(isDarkMode)} h-48 relative overflow-hidden group cursor-pointer hover:scale-[1.02]`}>
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${COUNTRIES_DATA[t.country]?.image || DEFAULT_BG_IMAGE})` }}></div>
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-white">
                                <h3 className="text-xl font-bold">{t.name}</h3>
                                <div className="text-xs opacity-90 mt-1 bg-black/30 inline-block px-2 py-1 rounded backdrop-blur-sm">{getTripSummary(t)}</div>
                                <div className="text-xs mt-1 opacity-70 flex gap-2"><MapIcon className="w-3 h-3"/> {t.country} <Calendar className="w-3 h-3"/> {formatDate(t.startDate)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Travel Hub (Fixed Grid Layout) */}
            <div>
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3 mb-6">旅遊資訊中心</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{gridTemplateRows: 'repeat(2, 300px)'}}>
                    {/* Weather */}
                    <div className={`${glassCard(isDarkMode)} p-6 row-span-2 flex flex-col justify-between bg-gradient-to-br from-blue-500/20 to-cyan-500/20`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><CloudSun className="w-5 h-5"/> 當地天氣 & 時間</h4>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">{INFO_DB.weather.map((w,i)=>(<div key={i} className="flex justify-between border-b border-white/10 pb-2"><div><span className="block font-bold">{w.city}</span><span className="text-xs opacity-50">{getLocalCityTime(w.tz)}</span></div><div className="text-right"><span className="text-lg">{w.temp}</span><div className="text-xs opacity-70">{w.desc}</div></div></div>))}</div>
                    </div>
                    
                    {/* News */}
                    <div className={`${glassCard(isDarkMode)} p-6 col-span-1 md:col-span-2 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Newspaper className="w-5 h-5"/> 旅遊快訊</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">{INFO_DB.news.map((n,i)=>(<a key={i} href={n.url} target="_blank" className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition flex justify-between items-center group h-20"><div className="truncate pr-2 text-sm">{n.title}</div><ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100"/></a>))}</div>
                    </div>

                    {/* Hotels */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Hotel className="w-5 h-5"/> 精選飯店</h4>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-grow">{INFO_DB.hotels.map((h,i)=>(<a key={i} href={h.url} target="_blank" className="block p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition"><div className="flex justify-between font-bold text-sm"><span>{h.name}</span><span className="text-green-400">{h.price}</span></div><div className="text-xs opacity-50 mt-1">{h.details}</div></a>))}</div>
                    </div>

                    {/* Flights */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><PlaneTakeoff className="w-5 h-5"/> 機票優惠</h4>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-grow">{INFO_DB.flights.map((f,i)=>(<a key={i} href={f.url} target="_blank" className="block p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition"><div className="flex justify-between font-bold text-sm"><span>{f.route}</span><span className="text-indigo-400">{f.price}</span></div><div className="text-xs opacity-50 mt-1">{f.details}</div></a>))}</div>
                    </div>
                </div>
            </div>
        </main>
    );
};

// --- App Root ---
const App = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [globalSettings, setGlobalSettings] = useState({ currency: 'HKD', region: 'HK', lang: 'zh-TW' });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [globalBg, setGlobalBg] = useState(DEFAULT_BG_IMAGE);

    useEffect(() => { onAuthStateChanged(auth, setUser); }, []);

    if (!user) return <LandingPage onLogin={()=>signInWithPopup(auth, googleProvider)}/>;

    return (
        <div className={`min-h-screen ${isDarkMode?'bg-gray-900 text-gray-100':'bg-slate-50 text-gray-900'} font-sans flex flex-col`}>
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000" style={{backgroundImage: `url(${DEFAULT_BG_IMAGE})`, backgroundSize: 'cover'}}></div>
            <div className="relative z-10 flex-grow">
                {view !== 'tutorial' && <Header title="✈️ Travel Together" user={user} isDarkMode={isDarkMode} toggleDarkMode={()=>setIsDarkMode(!isDarkMode)} onLogout={()=>signOut(auth)} onBack={view!=='dashboard'?()=>setView('dashboard'):null} onTutorialStart={()=>setView('tutorial')} onViewChange={setView} onOpenUserSettings={()=>setIsSettingsOpen(true)} onOpenVersion={()=>setIsVersionOpen(true)}/>}
                {view === 'dashboard' && <Dashboard user={user} onSelectTrip={(t)=>{setSelectedTrip(t); setView('detail');}} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg}/>}
                {view === 'detail' && <TripDetail tripData={selectedTrip} user={user} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg} isSimulation={false} globalSettings={globalSettings} onBack={()=>setView('dashboard')}/>}
                {view === 'tutorial' && <div className="h-screen flex flex-col"><div className="p-4 border-b flex gap-4"><button onClick={()=>setView('dashboard')}><ChevronLeft/></button> 模擬模式</div><div className="flex-grow overflow-y-auto"><TripDetail tripData={SIMULATION_DATA} user={user} isDarkMode={isDarkMode} setGlobalBg={()=>{}} isSimulation={true} globalSettings={globalSettings}/></div></div>}
            </div>
            {view !== 'tutorial' && <Footer isDarkMode={isDarkMode}/>}
            <SettingsModal isOpen={isSettingsOpen} onClose={()=>setIsSettingsOpen(false)} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} isDarkMode={isDarkMode}/>
            <VersionModal isOpen={isVersionOpen} onClose={()=>setIsVersionOpen(false)} isDarkMode={isDarkMode}/>
        </div>
    );
};

// --- Other Components (LandingPage) ---
const LandingPage = ({ onLogin }) => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 h-[85vh]">
            <div className="col-span-1 md:col-span-2 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600')] bg-cover bg-center rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all"/>
                <div className="absolute bottom-10 left-10 text-white">
                    <h1 className="text-6xl font-bold mb-4">Travel Together</h1>
                    <p className="text-2xl opacity-90 mb-8">下一站，與你同行。</p>
                    <button onClick={onLogin} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition flex items-center gap-2"><LogIn className="w-5 h-5"/> Google 登入</button>
                </div>
            </div>
            <div className="grid grid-rows-3 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <Users className="w-12 h-12 opacity-50"/>
                    <div><h3 className="text-2xl font-bold">多人協作</h3><p className="opacity-70">實時同步，共同規劃。</p></div>
                </div>
                <div className="bg-gray-800 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <BrainCircuit className="w-12 h-12 text-pink-500 opacity-80"/>
                    <div><h3 className="text-2xl font-bold">AI 領隊</h3><p className="opacity-70">智慧推薦行程與美食。</p></div>
                </div>
                <div className="bg-gray-800 rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition">
                    <Wallet className="w-12 h-12 text-green-500 opacity-80"/>
                    <div><h3 className="text-2xl font-bold">智慧分帳</h3><p className="opacity-70">自動計算債務，輕鬆結算。</p></div>
                </div>
            </div>
        </div>
    </div>
);

export default App;