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
import { generateAISuggestions } from './services/ai';
import { exportToBeautifulPDF, exportToJSON, exportToImage } from './services/pdfExport';
import TripExportImportModal from './components/Modals/TripExportImportModal';
import SmartImportModal from './components/Modals/SmartImportModal';
import { useNotifications } from './hooks/useNotifications';
import NotificationSystem from './components/Shared/NotificationSystem';
import { ItineraryTab, NotesTab, EmergencyTab, InsuranceTab, BudgetTab, CurrencyTab, ShoppingTab, VisaTab, FilesTab } from './components/TripDetail/tabs';

// 主要城市坐標 (用於天氣功能)
const CITY_COORDS = {
    "Tokyo": { lat: 35.6762, lon: 139.6503 },
    "Taipei": { lat: 25.0330, lon: 121.5654 },
    "London": { lat: 51.5074, lon: -0.1278 },
    "New York": { lat: 40.7128, lon: -74.0060 },
    "Bangkok": { lat: 13.7563, lon: 100.5018 },
    "Zurich": { lat: 47.3769, lon: 8.5417 },
    "Osaka": { lat: 34.6937, lon: 135.5023 },
    "Seoul": { lat: 37.5665, lon: 126.9780 },
    "Paris": { lat: 48.8566, lon: 2.3522 },
    "Berlin": { lat: 52.5200, lon: 13.4050 },
    "Rome": { lat: 41.9028, lon: 12.4964 },
    "Sydney": { lat: -33.8688, lon: 151.2093 }
};

// --- 0. Constants & Data ---

const AUTHOR_NAME = "Jamie Kwok";
const APP_VERSION = "V0.16.1";
const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";


const VERSION_HISTORY = [
    {
        version: "V0.16.1",
        date: "2025-12-17",
        changes: [
            "⚡️ 效能優化: 重構行程與檔案分頁組件",
            "🔧 ItineraryTab: 獨立組件化，提升維護性",
            "📂 FilesTab: 優化檔案管理介面與整合",
            "📱 PWA: 更新緩存策略，提升離線體驗"
        ]
    },
    {
        ver: "V0.16.0-Beta",
        date: "2025-12-17",
        desc: {
            "zh-TW": "組件重構 + 版本規劃",
            "en": "Component Refactoring + Version Roadmap"
        },
        details: {
            "zh-TW": "1. TripDetail Tabs 抽取：7 個獨立組件\n2. App.jsx 減少 187 行\n3. Future Features 按版本整理",
            "en": "1. TripDetail Tabs Extraction: 7 components\n2. App.jsx reduced 187 lines\n3. Future Features organized by version"
        }
    },
    {
        ver: "V0.14.0 - V0.15.1",
        date: "2025-12-16~17",
        desc: {
            "zh-TW": "PWA + AI 強化 + 匯出系統",
            "en": "PWA + AI Enhancement + Export System"
        },
        details: {
            "zh-TW": "• PWA 配置：可安裝、離線支援\n• Modal 組件拆分\n• 多格式匯出：JSON / PDF / 圖片\n• AI 分類百分比功能",
            "en": "• PWA setup: installable, offline support\n• Modal component extraction\n• Multi-format export: JSON / PDF / Image\n• AI category percentage"
        }
    },
    {
        ver: "V0.12.0 - V0.13.0",
        date: "2025-11~12",
        desc: {
            "zh-TW": "多語言 + 分帳 + 分享",
            "en": "Multi-language + Split Bill + Sharing"
        },
        details: {
            "zh-TW": "• 繁中 / 英文雙語\n• 分享行程連結\n• 自動計算分帳\n• 響應式設計優化",
            "en": "• Chinese / English dual language\n• Share trip links\n• Auto split bill\n• Responsive design"
        }
    },
    {
        ver: "V0.10.0 - V0.11.0",
        date: "2025-09~10",
        desc: {
            "zh-TW": "Beta 版 + 核心功能",
            "en": "Beta + Core Features"
        },
        details: {
            "zh-TW": "• 智能行程產生\n• Google Maps 整合\n• PWA 模式\n• 行李 / 記帳本功能",
            "en": "• Smart itinerary\n• Google Maps integration\n• PWA mode\n• Luggage / Expense tracker"
        }
    },
    {
        ver: "V0.9.0",
        date: "2025-12-11",
        desc: {
            "zh-TW": "AI 智能領隊 & UI 重製",
            "en": "AI Smart Guide & UI Remaster"
        },
        details: {
            "zh-TW": "• AI 行程規劃、交通分析\n• 玻璃擬態 (Glassmorphism) UI",
            "en": "• AI itinerary, transport analysis\n• Glassmorphism UI design"
        }
    },
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
    "Canada (加拿大)": { cities: ["Vancouver", "Toronto", "Montreal", "Banff"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600", region: "north", emergency: "911", taxRefund: "無退稅", entryInfo: "eTA / Visitor Visa", insuranceInfo: "溫差大，建議含雪地救援", consulate: "駐加拿大代表處", tz: "US_NY" },
    "France (法國)": { cities: ["Paris", "Nice", "Lyon", "Marseille", "Strasbourg"], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600", region: "north", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根區建議投保3萬歐元以上醫療險", consulate: "駐法國代表處", tz: "FR" },
    "Germany (德國)": { cities: ["Berlin", "Munich", "Frankfurt", "Hamburg"], image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1600", region: "north", emergency: "112", taxRefund: "滿 25 EUR", entryInfo: "申根免簽", insuranceInfo: "申根標準醫療保險", consulate: "駐德國代表處", tz: "FR" },
    "Italy (義大利)": { cities: ["Rome", "Milan", "Florence", "Venice"], image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600", region: "north", emergency: "112", taxRefund: "滿 155 EUR", entryInfo: "申根免簽", insuranceInfo: "建議附加租車責任險", consulate: "駐義大利代表處", tz: "FR" },
    "Japan (日本)": { cities: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa"], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 5000 JPY", entryInfo: "Visit Japan Web", insuranceInfo: "醫療費極高，強烈建議投保", consulate: "台北駐日經濟文化代表處", tz: "JP" },
    "Korea (韓國)": { cities: ["Seoul", "Busan", "Jeju"], image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600", region: "north", emergency: "112 / 119", taxRefund: "滿 30,000 KRW", entryInfo: "K-ETA", insuranceInfo: "建議涵蓋滑雪運動", consulate: "駐韓國代表處", tz: "KR" },
    "Malaysia (馬來西亞)": { cities: ["Kuala Lumpur", "Penang", "Kota Kinabalu", "Johor Bahru"], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600", region: "hot", emergency: "999 / 994（消防）", taxRefund: "滿 300 MYR", entryInfo: "免簽", insuranceInfo: "建議包含戶外及海島活動", consulate: "駐馬國代表處", tz: "TH" },
    "Singapore (新加坡)": { cities: ["Singapore"], image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600", region: "south", emergency: "999 / 995", taxRefund: "滿 100 SGD", entryInfo: "免簽", insuranceInfo: "高醫療費，建議醫療與航班延誤", consulate: "駐新加坡代表處", tz: "TH" },
    "Spain (西班牙)": { cities: ["Barcelona", "Madrid", "Seville", "Valencia"], image: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=1600", region: "south", emergency: "112", taxRefund: "滿 90 EUR", entryInfo: "申根免簽", insuranceInfo: "炎熱季節注意防曬", consulate: "駐西班牙代表處", tz: "FR" },
    "Switzerland (瑞士)": { cities: ["Zurich", "Geneva", "Lucerne", "Interlaken"], image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600", region: "north", emergency: "112 / 117", taxRefund: "滿 300 CHF", entryInfo: "申根免簽", insuranceInfo: "登山戶外必備高額醫療", consulate: "駐瑞士代表處", tz: "FR" },
    "Taiwan (台灣)": { cities: ["Taipei", "Kaohsiung", "Tainan", "Taichung"], image: "https://images.unsplash.com/photo-1508233620467-f79f1e317a05?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 2000 TWD", entryInfo: "入台證/網簽", insuranceInfo: "健保完善，旅客仍需旅平險", consulate: "-", tz: "TW" },
    "Thailand (泰國)": { cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"], image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600", region: "hot", emergency: "191", taxRefund: "滿 2000 THB", entryInfo: "免簽", insuranceInfo: "建議涵蓋機車騎乘意外險", consulate: "駐泰國代表處", tz: "TH" },
    "United Kingdom (英國)": { cities: ["London", "Edinburgh", "Manchester", "Bath"], image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600", region: "north", emergency: "999", taxRefund: "無退稅", entryInfo: "免簽", insuranceInfo: "NHS 對遊客不免費，需醫療險", consulate: "駐英國代表處", tz: "UK" },
    "United States (美國)": { cities: ["New York", "Los Angeles", "San Francisco", "Las Vegas", "Seattle"], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600", region: "north", emergency: "911", taxRefund: "部分州", entryInfo: "ESTA", insuranceInfo: "醫療費用極高，強烈建議高額保險", consulate: "駐美代表處", tz: "US_NY" },
    "Other": { cities: [], image: DEFAULT_BG_IMAGE, region: "north", emergency: "112 (國際通用)", taxRefund: "Check Local", entryInfo: "Check Visa", insuranceInfo: "請查詢當地外交部建議", consulate: "當地領事館", tz: "UK" }
};

const LANGUAGE_OPTIONS = {
    "zh-TW": { label: "繁體中文" },
    "en": { label: "English" }
};

const COUNTRY_TRANSLATIONS = {
    "Australia (澳洲)": { "zh-TW": "澳洲", "en": "Australia" },
    "Canada (加拿大)": { "zh-TW": "加拿大", "en": "Canada" },
    "France (法國)": { "zh-TW": "法國", "en": "France" },
    "Germany (德國)": { "zh-TW": "德國", "en": "Germany" },
    "Italy (義大利)": { "zh-TW": "義大利", "en": "Italy" },
    "Japan (日本)": { "zh-TW": "日本", "en": "Japan" },
    "Korea (韓國)": { "zh-TW": "韓國", "en": "Korea" },
    "Malaysia (馬來西亞)": { "zh-TW": "馬來西亞", "en": "Malaysia" },
    "Singapore (新加坡)": { "zh-TW": "新加坡", "en": "Singapore" },
    "Spain (西班牙)": { "zh-TW": "西班牙", "en": "Spain" },
    "Switzerland (瑞士)": { "zh-TW": "瑞士", "en": "Switzerland" },
    "Taiwan (台灣)": { "zh-TW": "台灣", "en": "Taiwan" },
    "Thailand (泰國)": { "zh-TW": "泰國", "en": "Thailand" },
    "United Kingdom (英國)": { "zh-TW": "英國", "en": "United Kingdom" },
    "United States (美國)": { "zh-TW": "美國", "en": "United States" },
    "Other": { "zh-TW": "其他", "en": "Other" }
};

const CITY_TRANSLATIONS = {
    "Sydney": { "zh-TW": "雪梨", "en": "Sydney" },
    "Melbourne": { "zh-TW": "墨爾本", "en": "Melbourne" },
    "Brisbane": { "zh-TW": "布里斯本", "en": "Brisbane" },
    "Gold Coast": { "zh-TW": "黃金海岸", "en": "Gold Coast" },
    "Vancouver": { "zh-TW": "溫哥華", "en": "Vancouver" },
    "Toronto": { "zh-TW": "多倫多", "en": "Toronto" },
    "Montreal": { "zh-TW": "蒙特婁", "en": "Montreal" },
    "Banff": { "zh-TW": "班夫", "en": "Banff" },
    "Paris": { "zh-TW": "巴黎", "en": "Paris" },
    "Nice": { "zh-TW": "尼斯", "en": "Nice" },
    "Lyon": { "zh-TW": "里昂", "en": "Lyon" },
    "Marseille": { "zh-TW": "馬賽", "en": "Marseille" },
    "Strasbourg": { "zh-TW": "史特拉斯堡", "en": "Strasbourg" },
    "Berlin": { "zh-TW": "柏林", "en": "Berlin" },
    "Munich": { "zh-TW": "慕尼黑", "en": "Munich" },
    "Frankfurt": { "zh-TW": "法蘭克福", "en": "Frankfurt" },
    "Hamburg": { "zh-TW": "漢堡", "en": "Hamburg" },
    "Rome": { "zh-TW": "羅馬", "en": "Rome" },
    "Milan": { "zh-TW": "米蘭", "en": "Milan" },
    "Florence": { "zh-TW": "佛羅倫斯", "en": "Florence" },
    "Venice": { "zh-TW": "威尼斯", "en": "Venice" },
    "Tokyo": { "zh-TW": "東京", "en": "Tokyo" },
    "Osaka": { "zh-TW": "大阪", "en": "Osaka" },
    "Kyoto": { "zh-TW": "京都", "en": "Kyoto" },
    "Hokkaido": { "zh-TW": "北海道", "en": "Hokkaido" },
    "Fukuoka": { "zh-TW": "福岡", "en": "Fukuoka" },
    "Okinawa": { "zh-TW": "沖繩", "en": "Okinawa" },
    "Seoul": { "zh-TW": "首爾", "en": "Seoul" },
    "Busan": { "zh-TW": "釜山", "en": "Busan" },
    "Jeju": { "zh-TW": "濟州", "en": "Jeju" },
    "Kuala Lumpur": { "zh-TW": "吉隆坡", "en": "Kuala Lumpur" },
    "Penang": { "zh-TW": "檳城", "en": "Penang" },
    "Kota Kinabalu": { "zh-TW": "亞庇", "en": "Kota Kinabalu" },
    "Johor Bahru": { "zh-TW": "新山", "en": "Johor Bahru" },
    "Singapore": { "zh-TW": "新加坡", "en": "Singapore" },
    "Barcelona": { "zh-TW": "巴塞隆納", "en": "Barcelona" },
    "Madrid": { "zh-TW": "馬德里", "en": "Madrid" },
    "Seville": { "zh-TW": "塞維亞", "en": "Seville" },
    "Valencia": { "zh-TW": "巴倫西亞", "en": "Valencia" },
    "Zurich": { "zh-TW": "蘇黎世", "en": "Zurich" },
    "Geneva": { "zh-TW": "日內瓦", "en": "Geneva" },
    "Lucerne": { "zh-TW": "盧森", "en": "Lucerne" },
    "Interlaken": { "zh-TW": "因特拉肯", "en": "Interlaken" },
    "Taipei": { "zh-TW": "台北", "en": "Taipei" },
    "Kaohsiung": { "zh-TW": "高雄", "en": "Kaohsiung" },
    "Tainan": { "zh-TW": "台南", "en": "Tainan" },
    "Taichung": { "zh-TW": "台中", "en": "Taichung" },
    "Bangkok": { "zh-TW": "曼谷", "en": "Bangkok" },
    "Phuket": { "zh-TW": "普吉", "en": "Phuket" },
    "Chiang Mai": { "zh-TW": "清邁", "en": "Chiang Mai" },
    "Pattaya": { "zh-TW": "芭達雅", "en": "Pattaya" },
    "London": { "zh-TW": "倫敦", "en": "London" },
    "Edinburgh": { "zh-TW": "愛丁堡", "en": "Edinburgh" },
    "Manchester": { "zh-TW": "曼徹斯特", "en": "Manchester" },
    "Bath": { "zh-TW": "巴斯", "en": "Bath" },
    "New York": { "zh-TW": "紐約", "en": "New York" },
    "Los Angeles": { "zh-TW": "洛杉磯", "en": "Los Angeles" },
    "San Francisco": { "zh-TW": "舊金山", "en": "San Francisco" },
    "Las Vegas": { "zh-TW": "拉斯維加斯", "en": "Las Vegas" },
    "Seattle": { "zh-TW": "西雅圖", "en": "Seattle" }
};

const HOLIDAYS_BY_REGION = {
    "HK": { "01-01": "元旦", "01-29": "農曆新年", "01-30": "農曆新年", "01-31": "農曆新年", "04-04": "清明節", "04-18": "耶穌受難節", "04-19": "耶穌受難節翌日", "04-21": "復活節", "05-01": "勞動節", "05-05": "佛誕", "05-31": "端午節", "07-01": "回歸紀念日", "10-01": "國慶日", "10-07": "中秋節翌日(預測)", "10-29": "重陽節", "12-25": "聖誕節", "12-26": "拆禮物日" },
    "TW": { "01-01": "元旦", "01-28": "除夕", "01-29": "春節", "01-30": "春節", "01-31": "春節", "02-28": "和平紀念日", "04-04": "兒童節", "04-05": "清明節", "05-31": "端午節", "10-06": "中秋節", "10-10": "國慶日" },
    "JP": { "01-01": "元日", "01-13": "成人之日", "02-11": "建國記念日", "02-23": "天皇誕生日", "02-24": "振替休日", "03-20": "春分", "04-29": "昭和之日", "05-03": "憲法記念日", "05-04": "綠之日", "05-05": "兒童之日", "05-06": "振替休日", "07-21": "海之日", "08-11": "山之日", "09-15": "敬老之日", "09-23": "秋分", "10-13": "體育之日", "11-03": "文化之日", "11-23": "勤勞感謝日" },
    "Global": { "01-01": "New Year", "12-25": "Christmas" }
};

const INFO_DB = {
    news: [
        { title: "日本櫻花季預測提早：東京3/20開花", country: "Japan", url: "https://www.japan-guide.com", provider: "Japan Guide" },
        { title: "泰國潑水節擴大舉辦", country: "Thailand", url: "https://www.tourismthailand.org", provider: "Tourism Authority of Thailand" },
        { title: "星宇航空新增西雅圖航線", country: "USA", url: "https://www.starlux-airlines.com", provider: "STARLUX Airlines" },
        { title: "Klook 推出多國 eSIM 85 折優惠", country: "Multi", url: "https://www.klook.com", provider: "Klook" },
        { title: "JR Pass 東日本官方 App 上線", country: "Japan", url: "https://www.jreast.co.jp", provider: "JR East" },
        { title: "義大利威尼斯實施旅遊人流費", country: "Italy", url: "https://www.veneziaunica.it", provider: "Venice Unica" },
        { title: "加拿大 ETA 新版審核提醒", country: "Canada", url: "https://www.canada.ca", provider: "Government of Canada" },
        { title: "新加坡星耀樟宜夜間活動回歸", country: "Singapore", url: "https://www.changiairport.com", provider: "Changi Airport Group" },
        { title: "韓國滑雪季安全指引", country: "Korea", url: "https://english.visitkorea.or.kr", provider: "Visit Korea" },
        { title: "IATA 預測 2025 國際旅客量創新高", country: "Global", url: "https://www.iata.org", provider: "IATA" }
    ],
    weather: [
        { city: "Tokyo", temp: "12°C", desc: "多雲", tz: "Asia/Tokyo" },
        { city: "Taipei", temp: "22°C", desc: "晴朗", tz: "Asia/Taipei" },
        { city: "London", temp: "8°C", desc: "陰雨", tz: "Europe/London" },
        { city: "New York", temp: "5°C", desc: "寒冷", tz: "America/New_York" },
        { city: "Bangkok", temp: "33°C", desc: "炎熱", tz: "Asia/Bangkok" },
        { city: "Zurich", temp: "2°C", desc: "飄雪", tz: "Europe/Zurich" }
    ],
    hotels: [
        { name: "APA Shinjuku", country: "Japan", price: "$800", star: 4.2, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", url: "https://www.agoda.com", details: "雙人房 • 01/04/2025 • Agoda" },
        { name: "W Taipei", country: "Taiwan", price: "$2500", star: 4.8, img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400", url: "https://www.marriott.com", details: "景觀房 • 20/05/2025 • 官網" },
        { name: "The Fullerton Bay", country: "Singapore", price: "$3200", star: 4.9, img: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210cc?w=400", url: "https://www.fullertonhotels.com", details: "濱海灣景 • 早餐" },
        { name: "Park Hyatt Seoul", country: "Korea", price: "$2100", star: 4.7, img: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400", url: "https://www.hyatt.com", details: "江南夜景 • 泳池" }
    ],
    flights: [
        { route: "HKG - TPE", airline: "EVA Air", price: "$1,800", tag: "熱門", url: "https://www.evaair.com", details: "BR856 • 17:00 起飛" },
        { route: "HKG - NRT", airline: "Cathay", price: "$3,500", tag: "早鳥", url: "https://www.cathaypacific.com", details: "CX500 • 09:00 起飛" },
        { route: "TPE - CDG", airline: "China Airlines", price: "$14,200", tag: "新航線", url: "https://www.china-airlines.com", details: "CI923 • 23:55 直飛" },
        { route: "SIN - ZRH", airline: "Swiss", price: "$9,800", tag: "商務艙", url: "https://www.swiss.com", details: "LX179 • 01:30 起飛" },
        { route: "LAX - HND", airline: "ANA", price: "$11,500", tag: "特價", url: "https://www.ana.co.jp", details: "NH105 • 10:45 起飛" }
    ],
    transports: [
        { name: "JR Pass 東日本 5日券", provider: "JR EAST", price: "¥29,650", url: "https://www.jreast.co.jp", icon: "metro", details: "不限次乘搭新幹線", source: "JR東日本" },
        { name: "Tokyo Subway Ticket 72hr", provider: "Tokyo Metro", price: "¥1,500", url: "https://www.tokyometro.jp", icon: "metro", details: "地鐵吃到飽", source: "Tokyo Metro" },
        { name: "Limousine Bus", provider: "Airport Limousine", price: "¥3,400", url: "https://www.limousinebus.co.jp", icon: "bus", details: "成田/羽田直達飯店", source: "Airport Bus" },
        { name: "Swiss Travel Pass", provider: "SBB", price: "CHF 232", url: "https://www.sbb.ch", icon: "metro", details: "全瑞士火車/湖船", source: "SBB" }
    ],
    connectivity: [
        { name: "Klook eSIM 多國方案", type: "eSIM", price: "$120 起 / 5GB", provider: "Klook", url: "https://www.klook.com", regions: "Asia / Europe" },
        { name: "Horizon WiFi 蛋", type: "WiFi", price: "$50 起 / 日", provider: "Horizon WiFi", url: "https://www.horizon-wifi.com", regions: "Japan / Korea" },
        { name: "Airalo eSIM", type: "eSIM", price: "$4.5 起 / 1GB", provider: "Airalo", url: "https://www.airalo.com", regions: "Global" }
    ]
};

const TRAVEL_ARTICLES = [
    { title: "東京交通局官方旅遊建議", provider: "Toei", url: "https://www.kotsu.metro.tokyo.jp/eng/guide/" },
    { title: "JNTO 旅行安全資訊", provider: "JNTO", url: "https://www.japan.travel/en/plan/safety-tips/" },
    { title: "Visit Japan Web 官方教學", provider: "Digital Agency Japan", url: "https://vjw-lp.digital.go.jp/en/" }
];

const AIRLINE_LOGOS = {
    "EVA Air": "https://www.google.com/s2/favicons?domain=www.evaair.com&sz=64",
    "Cathay": "https://www.google.com/s2/favicons?domain=www.cathaypacific.com&sz=64",
    "ANA": "https://www.google.com/s2/favicons?domain=www.ana.co.jp&sz=64",
    "JAL": "https://www.google.com/s2/favicons?domain=www.jal.com&sz=64",
    "China Airlines": "https://www.google.com/s2/favicons?domain=www.china-airlines.com&sz=64",
    "Swiss": "https://www.google.com/s2/favicons?domain=www.swiss.com&sz=64"
};



const OUTFIT_IMAGES = {
    hot: "https://img.icons8.com/color/48/flip-flops.png",
    south: "https://img.icons8.com/color/48/t-shirt.png",
    north: "https://img.icons8.com/color/48/coat.png"
};

const INSURANCE_RESOURCES = [
    { region: "HK", title: "富邦旅平險 Smart Go", url: "https://www.fubon.com/hk/insurance/" },
    { region: "TW", title: "國泰旅平險 24h 線上投保", url: "https://www.cathaylife.com.tw/" },
    { region: "Global", title: "World Nomads Explorer", url: "https://www.worldnomads.com" },
    { region: "Global", title: "Visit Japan Web 健康聲明", url: "https://vjw-lp.digital.go.jp/en/" }
];

// 📚 真實度 100% 東京 5 天 4 夜 教學資料

const TRANSPORT_ICONS = {
    metro: { label: "地鐵", icon: TrainFront, color: "text-indigo-500" },
    bus: { label: "巴士", icon: BusFront, color: "text-emerald-500" },
    car: { label: "自駕", icon: Car, color: "text-amber-500" },
    walk: { label: "步行", icon: Route, color: "text-blue-500" }
};

const SIMULATION_DATA = {
    id: 'sim', name: "教學：東京 5 天 4 夜自由行", country: "Japan (日本)", city: "Tokyo", startDate: "2025-04-01", endDate: "2025-04-05",
    members: [
        { id: 'me', name: "我 (Owner)", role: "owner" },
        { id: 'friend1', name: "小明 (Editor)", role: "editor" },
        { id: 'friend2', name: "小華 (Viewer)", role: "viewer" }
    ],
    itinerary: {
        "2025-04-01": [
            { id: "f1", name: "TPE -> NRT (BR198)", type: "flight", cost: 16000, currency: "TWD", details: { provider: "EVA Air", number: "BR198", time: "08:50", location: "Taoyuan Airport T2", layover: false }, createdBy: { name: "我" } },
            { id: "t1", name: "領取 JR Pass & Suica 儲值", type: "transport", cost: 5000, currency: "JPY", details: { time: "13:30", location: "Narita Airport JR Office" }, createdBy: { name: "小明" } },
            { id: "t2", name: "Skyliner 前往上野", type: "transport", cost: 2570, currency: "JPY", details: { time: "14:20", location: "Narita Airport Station" }, createdBy: { name: "我" } },
            { id: "h1", name: "新宿格拉斯麗飯店 Check-in", type: "hotel", cost: 60000, currency: "JPY", details: { time: "16:30", location: "Shinjuku Gracery Hotel", tax: 5000 }, createdBy: { name: "我" } },
            { id: "d1", name: "晚餐：AFURI 拉麵", type: "food", cost: 1200, currency: "JPY", details: { time: "19:00", location: "Lumine Shinjuku" }, createdBy: { name: "小明" } }
        ],
        "2025-04-02": [
            { id: "s1", name: "東京迪士尼樂園", type: "spot", cost: 9800, currency: "JPY", details: { time: "08:30", location: "Tokyo Disneyland" }, createdBy: { name: "我" } },
            { id: "f2", name: "午餐：紅心女王宴會大廳", type: "food", cost: 2500, currency: "JPY", details: { time: "11:30", location: "Fantasyland" }, createdBy: { name: "小華" } },
            { id: "s2", name: "日間遊行：Harmony in Color", type: "spot", cost: 0, currency: "JPY", details: { time: "14:00", location: "Parade Route" }, createdBy: { name: "我" } },
            { id: "s3", name: "夜間遊行與煙火", type: "spot", cost: 0, currency: "JPY", details: { time: "19:30", location: "Cinderella Castle" }, createdBy: { name: "我" } }
        ],
        "2025-04-03": [
            { id: "s4", name: "明治神宮參拜", type: "spot", cost: 0, currency: "JPY", details: { time: "10:00", location: "Meiji Jingu" }, createdBy: { name: "我" } },
            { id: "s5", name: "原宿竹下通逛街", type: "shopping", cost: 15000, currency: "JPY", details: { time: "11:30", location: "Takeshita Street", refund: 1000 }, createdBy: { name: "小明" } },
            { id: "s6", name: "澀谷 SKY 觀景台 (日落)", type: "spot", cost: 2200, currency: "JPY", details: { time: "17:30", location: "Shibuya Scramble Square" }, createdBy: { name: "我" } },
            { id: "d2", name: "晚餐：敘敘苑燒肉 (已訂位)", type: "food", cost: 15000, currency: "JPY", details: { time: "20:00", location: "Shibuya Branch" }, createdBy: { name: "小明" } }
        ],
        "2025-04-04": [
            { id: "s7", name: "富士山一日遊 (巴士)", type: "transport", cost: 9000, currency: "JPY", details: { time: "07:30", location: "Shinjuku Station", provider: "Highland Express" }, createdBy: { name: "我" } },
            { id: "s8", name: "河口湖散步＋午餐", type: "food", cost: 3500, currency: "JPY", details: { time: "12:30", location: "Lake Kawaguchi" }, createdBy: { name: "小華" } },
            { id: "s9", name: "忍野八海集章", type: "spot", cost: 1000, currency: "JPY", details: { time: "15:00", location: "Oshino Hakkai" }, createdBy: { name: "我" } }
        ],
        "2025-04-05": [
            { id: "s10", name: "築地市場早餐", type: "food", cost: 2500, currency: "JPY", details: { time: "08:30", location: "Tsukiji Outer Market" }, createdBy: { name: "我" } },
            { id: "s11", name: "TeamLab Planets", type: "spot", cost: 3800, currency: "JPY", details: { time: "11:00", location: "Toyosu" }, createdBy: { name: "小明" } },
            { id: "f3", name: "NRT -> TPE (CI107)", type: "flight", cost: 15000, currency: "TWD", details: { time: "16:20", location: "Narita T2", number: "CI107", layover: false }, createdBy: { name: "我" } }
        ]
    },
    budget: [
        { id: "b1", name: "機票 (我代墊)", cost: 32000, currency: "TWD", category: "flight", payer: "我", splitType: 'group' },
        { id: "b2", name: "住宿 3 晚", cost: 60000, currency: "JPY", category: "hotel", payer: "小明", splitType: 'group', details: { tax: 5000 } },
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
        "local": { name: "Visit Japan Web", status: "done", user: "我" }
    },
    visa: { "sim": { status: "printed", number: "免簽入境", expiry: "2025-07-01", needsPrint: false } }
};

const INSURANCE_SUGGESTIONS = { "HK": ["Prudential", "AIG", "Blue Cross"], "TW": ["富邦", "國泰", "南山"], "Global": ["World Nomads", "Allianz"] };

// --- 1. Helper Functions ---
const glassCard = (isDarkMode) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;
// inputClasses moved to line 927
const buttonPrimary = `flex items - center justify - center px - 6 py - 3 rounded - xl font - bold text - white bg - gradient - to - r from - indigo - 600 via - purple - 600 to - pink - 600 hover: from - indigo - 500 hover: via - purple - 500 hover: to - pink - 500 shadow - lg hover: shadow - xl transition - all duration - 300 transform hover: scale - [1.05] active: scale - 95 w - full cursor - pointer`;
const getHolidayMap = (region) => HOLIDAYS_BY_REGION[region] || HOLIDAYS_BY_REGION.Global;
const getLocalizedCountryName = (country, lang = 'zh-TW') => COUNTRY_TRANSLATIONS[country]?.[lang] || country;
const getLocalizedCityName = (city, lang = 'zh-TW') => CITY_TRANSLATIONS[city]?.[lang] || city;

const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    const pad = (val) => val.toString().padStart(2, '0');
    return `${pad(d)}/${pad(m)}/${y}`;
};
const getDaysArray = (start, end) => { if (!start || !end) return []; const arr = []; const dt = new Date(start); const endDt = new Date(end); while (dt <= endDt) { arr.push(new Date(dt).toISOString().split('T')[0]); dt.setDate(dt.getDate() + 1); } return arr; };
const getWeekday = (dateStr) => ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][new Date(dateStr).getDay()];

const getTripSummary = (trip) => {
    if (!trip) return "";
    const now = new Date(); const start = new Date(trip.startDate); const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    let summary = diffDays > 0 ? `距離出發 ${diffDays} 天` : "旅程進行中";
    const nextFlight = trip.itinerary?.[now.toISOString().split('T')[0]]?.find(i => i.type === 'flight');
    if (nextFlight) summary += ` • ✈️ ${nextFlight.details.number} `;
    return summary;
};

const calculateDebts = (budget, repayments, members, baseCurrency, exchangeRates) => {
    const balances = {}; members.forEach(m => balances[m.name] = 0); let totalSpent = 0;

    // 準備匯率表：如果沒有實時匯率，則從靜態 CURRENCIES 轉換
    const rates = exchangeRates || Object.keys(CURRENCIES).reduce((acc, key) => ({ ...acc, [key]: CURRENCIES[key].rate }), {});

    budget.forEach(item => {
        const tax = item.details?.tax ? Number(item.details.tax) : 0;
        const refund = item.details?.refund ? Number(item.details.refund) : 0;
        const baseCost = Number(item.cost) + tax - refund;

        const cost = convertCurrency(baseCost, item.currency || 'HKD', baseCurrency || 'HKD', rates);
        totalSpent += cost;

        const payer = item.payer || members[0].name;
        balances[payer] = (balances[payer] || 0) + cost;

        if (item.splitType === 'group' || !item.splitType) {
            const split = cost / members.length;
            members.forEach(m => balances[m.name] = (balances[m.name] || 0) - split);
        } else if (item.splitType === 'me') {
            balances[payer] = (balances[payer] || 0) - cost;
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
const getWeatherForecast = (country) => {
    const region = getSafeCountryInfo(country).region;
    const iconUrl = OUTFIT_IMAGES[region] || OUTFIT_IMAGES.north;
    if (region === "hot") return { temp: "30°C", clothes: "短袖、墨鏡、防曬", icon: <Sun className="text-orange-500" />, desc: "炎熱", outfitIcon: iconUrl };
    if (region === "south") return { temp: "24°C", clothes: "薄襯衫、輕薄外套", icon: <CloudSun className="text-yellow-500" />, desc: "舒適", outfitIcon: iconUrl };
    return { temp: "10°C", clothes: "大衣、圍巾、暖包", icon: <Snowflake className="text-blue-300" />, desc: "寒冷", outfitIcon: iconUrl };
};



const buildDailyReminder = (date, items = []) => {
    if (!items.length) return "今日尚未規劃行程，快去新增吧！";
    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};

const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();

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

const inputClasses = (isDarkMode) => `w-full px-4 py-3.5 rounded-xl border transition-all outline-none font-medium tracking-wide ${isDarkMode ? 'bg-gray-800/90 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500' : 'bg-white border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-gray-900 placeholder-gray-400 shadow-sm'}`;

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

const CreateTripModal = ({ isOpen, onClose, form, onInputChange, onMultiSelect, onAddCity, newCityInput, setNewCityInput, onSubmit, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings.language;
    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    if (!isOpen) return null;

    const availableCities = (form.countries.length ? form.countries : Object.keys(COUNTRIES_DATA)).flatMap(country => (COUNTRIES_DATA[country]?.cities || []));

    // Handle Toggle Selection (Add/Remove)
    const toggleSelection = (field, item) => {
        const currentList = form[field] || [];
        const isSelected = currentList.includes(item);
        const newList = isSelected
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        onMultiSelect(field, newList);
    };

    // Filter Options
    const filteredCountries = Object.keys(COUNTRIES_DATA)
        .filter(c => getLocalizedCountryName(c, currentLang).toLowerCase().includes(countrySearch.toLowerCase()) || c.toLowerCase().includes(countrySearch.toLowerCase()))
        .sort();

    const filteredCities = availableCities
        .filter(c => getLocalizedCityName(c, currentLang).toLowerCase().includes(citySearch.toLowerCase()) || c.toLowerCase().includes(citySearch.toLowerCase()))
        .sort();

    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
            <div className={`w-full max-w-3xl rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all transform scale-100`}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">建立新行程</h3>
                        <p className="text-sm opacity-60 mt-1 font-medium">多選國家與城市，或輸入自訂目的地。</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程名稱</label>
                        <input value={form.name} onChange={e => onInputChange('name', e.target.value)} placeholder="如：歐洲文化深度遊" className={inputClasses(isDarkMode)} />
                    </div>

                    {/* Country Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">目的地國家</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder="搜尋國家..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                        </div>

                        {/* Selected Countries Chips */}
                        {form.countries.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.countries.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCountryName(c, currentLang)}
                                        <button onClick={() => toggleSelection('countries', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Dropdown Options (Scrollable) */}
                        <div className={`h-32 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCountries.map(c => {
                                const isSelected = form.countries.includes(c);
                                return (
                                    <div
                                        key={c}
                                        onClick={() => toggleSelection('countries', c)}
                                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-indigo-500 text-white shadow-sm' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span>{getLocalizedCountryName(c, currentLang)}</span>
                                        {isSelected && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* City Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">主要城市</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                placeholder="搜尋城市..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                            {/* Add Custom City Button (Inline) */}
                            {citySearch && !filteredCities.includes(citySearch) && (
                                <button
                                    onClick={() => { onAddCity(citySearch); setCitySearch(""); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-indigo-500 text-white text-xs rounded-md shadow-sm hover:bg-indigo-600 transition-all"
                                >
                                    + 加入 "{citySearch}"
                                </button>
                            )}
                        </div>

                        {/* Selected Cities Chips */}
                        {form.cities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.cities.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCityName(c, currentLang)}
                                        <button onClick={() => toggleSelection('cities', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Dropdown Options (Scrollable) */}
                        <div className={`h-32 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCities.length > 0 ? filteredCities.map(c => {
                                const isSelected = form.cities.includes(c);
                                return (
                                    <div
                                        key={c}
                                        onClick={() => toggleSelection('cities', c)}
                                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-purple-500 text-white shadow-sm' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span>{getLocalizedCityName(c, currentLang)}</span>
                                        {isSelected && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                );
                            }) : (
                                <div className="p-4 text-center text-xs opacity-40">無相關城市，請輸入並點擊「加入」</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程日期</label>
                        <div className="flex items-center gap-2 p-1 border rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.startDate}
                                    max={form.endDate}
                                    onChange={e => onInputChange('startDate', e.target.value)}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                    placeholder="開始日期"
                                />
                            </div>
                            <div className="opacity-30"><MoveRight className="w-4 h-4" /></div>
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.endDate}
                                    min={form.startDate}
                                    onChange={e => onInputChange('endDate', e.target.value)}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                    placeholder="結束日期"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10">
                    <button onClick={onClose} className="flex-1 px-4 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                    <button onClick={onSubmit} className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-95">建立行程 🚀</button>
                </div>
            </div>
        </div>
    );
};

// --- Active Users Presence Component ---


const TAB_LABELS = {
    itinerary: { "zh-TW": "行程", "en": "Itinerary" },
    shopping: { "zh-TW": "購物", "en": "Shopping" },
    budget: { "zh-TW": "預算", "en": "Budget" },
    files: { "zh-TW": "文件", "en": "Files" },
    insurance: { "zh-TW": "保險", "en": "Insurance" },
    emergency: { "zh-TW": "緊急", "en": "Emergency" },
    visa: { "zh-TW": "簽證", "en": "Visa" },
    notes: { "zh-TW": "筆記", "en": "Notes" },
    currency: { "zh-TW": "匯率", "en": "Currency" },
    settings: { "zh-TW": "設定", "en": "Settings" }
};

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
                        isDarkMode={isDarkMode}
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

// --- Dashboard ---
const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, setGlobalBg, globalSettings, exchangeRates, weatherData }) => {
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedExportTrip, setSelectedExportTrip] = useState("");
    const [selectedImportTrip, setSelectedImportTrip] = useState(""); // Default empty or 'new'? Let's keep empty to force choice or default in logic
    const [newCityInput, setNewCityInput] = useState('');
    const currentLang = globalSettings?.lang || 'zh-TW';

    // Currency Converter State
    const [convAmount, setConvAmount] = useState(100);
    const [convFrom, setConvFrom] = useState(globalSettings?.currency || 'HKD');
    const [convTo, setConvTo] = useState('JPY');

    // Sync Converter From currency with Global Settings
    useEffect(() => {
        if (globalSettings?.currency) setConvFrom(globalSettings.currency);
    }, [globalSettings]); // Watch the whole object or just currency if safe

    // useNotifications(user); // This hook should be in App component, not Dashboard
    const { notifications, sendNotification, setNotifications, markNotificationsRead, removeNotification } = useNotifications(user);

    useEffect(() => { if (!user) return; const q = query(collection(db, "trips")); const unsub = onSnapshot(q, s => { setTrips(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.members?.some(m => m.id === user.uid))); }); return () => unsub(); }, [user]);
    useEffect(() => { setGlobalBg(selectedCountryImg); }, [selectedCountryImg, setGlobalBg]);
    useEffect(() => { if (trips.length && !selectedExportTrip) setSelectedExportTrip(trips[0].id); }, [trips, selectedExportTrip]);

    const handleMultiSelect = (event, key) => {
        const values = Array.from(event.target.selectedOptions).map(o => o.value);
        setForm(prev => ({ ...prev, [key]: values }));
        if (key === 'countries' && values.length) {
            const first = values[0];
            if (COUNTRIES_DATA[first]) setSelectedCountryImg(COUNTRIES_DATA[first].image);
        } else if (key === 'countries' && values.length === 0) {
            setSelectedCountryImg(DEFAULT_BG_IMAGE);
        }
    };

    const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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
                    // Call AI to parse
                    // Mocking AI response for now or calling actual function if valid
                    // For demo: Add a dummy item
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
                        cost: 0, // Placeholder
                        currency: globalSettings.currency,
                        category: 'misc',
                        payer: user.displayName,
                        attachment: base64, // Attach image
                        date: new Date().toISOString()
                    };
                    // Assuming 'files' array exists, if not, create it
                    await updateDoc(docRef, { budget: arrayUnion(newItem) });
                    sendNotification("匯入成功 ✅", `已將單據加入至 ${targetTrip.name} 預算`, 'success');
                }
                else if (type === 'memory') {
                    const newItem = {
                        id: Date.now().toString(),
                        name: file.name,
                        url: base64,
                        type: file.type,
                        size: file.size,
                        uploadedBy: user.displayName,
                        uploadedAt: Date.now()
                    };
                    // Assuming 'files' array exists, if not, create it
                    await updateDoc(docRef, { files: arrayUnion(newItem) });
                    sendNotification("匯入成功 ✅", `已將檔案儲存至 ${targetTrip.name}`, 'success');
                }
                setIsSmartImportModalOpen(false);
            } catch (err) {
                console.error(err);
                sendNotification("智能匯入失敗 ❌", "智能匯入失敗: " + err.message, 'error');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddCity = (cityName) => {
        const trimmed = (cityName || '').trim();
        if (!trimmed) return;
        setForm(prev => ({ ...prev, cities: Array.from(new Set([...prev.cities, trimmed])) }));
        setNewCityInput('');
    };

    const [lastReminderCheck, setLastReminderCheck] = useState(Date.now());

    // --- Real Reminders: Check Itinerary every 60s ---
    useEffect(() => {
        if (!trips.length) return;
        const checkReminders = () => {
            const now = Date.now();
            trips.forEach(trip => {
                const today = new Date().toISOString().split('T')[0];
                const items = trip.itinerary?.[today] || [];
                items.forEach(item => {
                    if (item.details?.time) {
                        const [h, m] = item.details.time.split(':').map(Number);
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

            // alert("匯入完成"); // Replaced by sendNotification
        } catch (err) {
            sendNotification("匯入失敗 ❌", "匯入失敗: " + (err.message || "未知錯誤"), 'error');
        }
    };

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-12 animate-fade-in">
            <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
                <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{ backgroundImage: `url(${selectedCountryImg})` }}></div>
                <div className="relative z-10 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Plus className="w-6 h-6 text-indigo-500" /> 建立新行程</h2>
                    <p className="opacity-80 text-sm max-w-xl">使用彈窗快速建立，支援多國多城與自訂城市。背景會依選擇自動切換。</p>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> 打開建立視窗</button>
                        <button onClick={() => { setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' }); setSelectedCountryImg(DEFAULT_BG_IMAGE); }} className="px-4 py-3 rounded-xl border border-white/30 text-sm">重設預覽</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-3 rounded-xl bg-green-500/20 text-green-200 font-bold text-sm">匯入行程</button>
                        <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-100 font-bold text-sm">匯出行程</button>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3">我的行程</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsSmartImportModalOpen(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"><Upload className="w-4 h-4" /> 智能匯入</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 rounded-xl border border-indigo-500/40 text-sm">全行程匯入</button>
                        <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 rounded-xl border border-purple-500/40 text-sm">匯出</button>
                        <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> 建立</button>
                    </div>
                </div>
                {trips.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                        <p className="opacity-50 mb-4">尚無行程，立即開始規劃您的下一趟旅程！</p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-indigo-400 underline">建立新行程</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trips.map(t => {
                            const cardWeather = getWeatherForecast(t.country);
                            const countryList = (t.countries || [t.country]).slice(0, 3).map(c => getLocalizedCountryName(c, currentLang)).join(', ');
                            const displayCity = getLocalizedCityName(t.city || (t.cities?.[0]) || '', currentLang);
                            return (
                                <div key={t.id} onClick={() => { setGlobalBg(COUNTRIES_DATA[t.country]?.image || DEFAULT_BG_IMAGE); onSelectTrip(t); }} className={`${glassCard(isDarkMode)} h-60 relative overflow-hidden group cursor-pointer hover:scale-[1.02]`}>
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${COUNTRIES_DATA[t.country]?.image || DEFAULT_BG_IMAGE})` }}></div>
                                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-4 text-white">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h3 className="text-xl font-bold">{t.name}</h3>
                                                <div className="text-[11px] uppercase tracking-wide opacity-70 mt-1">
                                                    {countryList}
                                                </div>
                                            </div>
                                            <div className="bg-white/10 rounded-lg px-2 py-1 text-right text-xs">
                                                <div className="font-bold">{cardWeather.temp}</div>
                                                <div className="opacity-80 flex items-center gap-1">
                                                    {cardWeather.icon} {cardWeather.desc}
                                                </div>
                                                {cardWeather.outfitIcon && <img src={cardWeather.outfitIcon} alt="outfit" className="w-6 h-6 mx-auto mt-1" />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-90 mt-1 bg-black/30 inline-block px-2 py-1 rounded backdrop-blur-sm">{getTripSummary(t)}</div>
                                            <div className="text-xs mt-2 opacity-80 flex gap-3 flex-wrap">
                                                <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> {displayCity}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(t.startDate)}</span>
                                                <span className="flex items-center gap-1"><Shirt className="w-3 h-3" /> {cardWeather.clothes}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className={`${glassCard(isDarkMode)} h-60 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 cursor-pointer border-dashed hover:border-indigo-500 transition-all`} onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-10 h-10 mb-2 text-indigo-400" />
                            <p className="font-bold">建立更多行程</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Travel Hub (Masonry / Waterfall Layout) */}
            <div className="pb-10">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3 mb-6">旅遊資訊中心</h2>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

                    {/* Weather Widget */}
                    <div className="break-inside-avoid mb-6">

                        {/* Weather */}
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-white/5 min-h-[300px]`}>

                            <h4 className="font-bold flex items-center gap-2 mb-4"><CloudSun className="w-5 h-5" /> 當地天氣 & 當地時間</h4>
                            <div className="space-y-3 custom-scrollbar overflow-y-auto pr-1 flex-1">
                                {Object.keys(CITY_COORDS).map((city, i) => {
                                    const wData = weatherData?.[city];
                                    const staticData = INFO_DB.weather.find(w => w.city === city) || {};
                                    // 優先使用動態數據，否則使用靜態數據 (僅作為最後備援，實際應該都有動態數據)
                                    const displayTemp = wData?.temp || staticData.temp || '--';
                                    const displayDesc = wData?.desc || staticData.desc || '載入中...';
                                    const displayIcon = wData?.icon || staticData.icon || '⌛';
                                    const timezone = staticData.tz || 'UTC';

                                    return (
                                        <div key={city} className="flex items-center justify-between border-b border-white/10 pb-2">
                                            <div>
                                                <span className="block font-bold text-sm">{getLocalizedCityName(city, currentLang)}</span>
                                                <span className="text-[11px] opacity-60">{getLocalCityTime(timezone)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-semibold">{displayTemp}</span>
                                                <div className="text-xs opacity-70 flex items-center justify-end gap-1">
                                                    <span>{displayIcon}</span> <span>{displayDesc}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* News */}
                    <div className="break-inside-avoid mb-6">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col h-auto`}>
                            <h4 className="font-bold flex items-center gap-2 mb-4"><Newspaper className="w-5 h-5" /> 旅遊快訊</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.news.map((n, i) => (<a key={i} href={n.url} target="_blank" className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition flex flex-col gap-1 group">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-semibold">{n.title}</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-90" />
                                </div>
                                <div className="text-[11px] opacity-70">由 {n.provider} 提供 • {n.country}</div>
                            </a>))}</div>
                        </div>
                    </div>

                    {/* Currency Widget (Inserted) */}
                    <div className="break-inside-avoid mb-6">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col h-auto`}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold flex items-center gap-2"><DollarSign className="w-5 h-5" /> 匯率計算機</h4>
                                <span className="text-[10px] opacity-50 bg-white/10 px-2 py-0.5 rounded">Live</span>
                            </div>

                            {/* Converter UI */}
                            <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-3 border border-white/10">
                                <div>
                                    <label className="text-[10px] opacity-60 uppercase tracking-wider font-bold mb-1 block">持有金額</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={convAmount}
                                            onChange={e => setConvAmount(Number(e.target.value))}
                                            className={`w-full bg-transparent border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} py-1 text-lg font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors`}
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

                                <div className="flex justify-center -my-2 opacity-50"><ArrowUpRight className="w-4 h-4 rotate-45" /></div>

                                <div>
                                    <label className="text-[10px] opacity-60 uppercase tracking-wider font-bold mb-1 block">兌換結果</label>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-2xl font-mono font-bold text-emerald-400">
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
                                    <div className="text-[10px] opacity-50 text-right mt-1">
                                        1 {convFrom} ≈ {convertCurrency(1, convFrom, convTo, exchangeRates).toFixed(4)} {convTo}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                <div className="text-xs font-bold opacity-60 mb-2">熱門匯率 (1 {convFrom})</div>
                                {Object.keys(CURRENCIES).filter(c => c !== convFrom && c !== convTo).map(code => {
                                    const rate = convertCurrency(1, convFrom, code, exchangeRates);
                                    return (
                                        <div key={code} className="flex justify-between items-center p-2 rounded-lg border border-white/5 hover:bg-white/5 transition cursor-pointer" onClick={() => setConvTo(code)}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold w-6">{code}</span>
                                                <span className="text-xs opacity-50">{CURRENCIES[code]?.symbol}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono font-bold">{rate.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Hotels */}
                    <div className="break-inside-avoid mb-6">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                            <h4 className="font-bold flex items-center gap-2 mb-4"><Hotel className="w-5 h-5" /> 精選飯店</h4>
                            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                {INFO_DB.hotels.map((h, i) => (
                                    <a key={i} href={h.url} target="_blank" className="flex gap-3 rounded-xl border border-white/10 p-3 hover:bg-white/5 transition">
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-xs font-semibold">
                                            {h.country.split(' ')[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between text-sm font-bold"><span className="truncate">{h.name}</span><span className="text-green-400">{h.price}</span></div>
                                            <div className="text-[11px] opacity-70 mt-1">{h.details}</div>
                                            <div className="flex items-center gap-1 text-[11px] mt-1 text-amber-400">
                                                {Array.from({ length: 5 }).map((_, idx) => (<Star key={idx} className={`w-3 h-3 ${idx < Math.round(h.star) ? 'fill-current' : ''}`} />))}
                                                <span className="text-xs text-amber-200">{h.star}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Flights */}
                    <div className="break-inside-avoid mb-6">
                        <div className={`${glassCard(isDarkMode)} p-6 flex flex-col h-auto`}>
                            <h4 className="font-bold flex items-center gap-2 mb-4"><PlaneTakeoff className="w-5 h-5" /> 機票優惠</h4>
                            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.flights.map((f, i) => (<a key={i} href={f.url} target="_blank" className="block p-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
                                <div className="flex items-center justify-between font-bold text-sm gap-2">
                                    <div className="flex items-center gap-2">
                                        {AIRLINE_LOGOS[f.airline] ? <img src={AIRLINE_LOGOS[f.airline]} alt={f.airline} className="w-10 h-4 object-contain bg-white/80 rounded" /> : <Plane className="w-5 h-5 text-indigo-400" />}
                                        <span>{f.route}</span>
                                    </div>
                                    <span className="text-indigo-400">{f.price}</span>
                                </div>
                                <div className="text-xs opacity-70 mt-1 flex items-center gap-2 flex-wrap">
                                    {f.tag && <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">{f.tag}</span>}
                                    <span>{f.airline}</span>
                                    <span>{f.details}</span>
                                </div>
                            </a>))}</div>
                        </div>
                    </div>

                    {/* Transport Pass */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Route className="w-5 h-5" /> 交通票券 / Pass</h4>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.transports.map((t, i) => {
                            const meta = TRANSPORT_ICONS[t.icon] || TRANSPORT_ICONS.metro;
                            const IconComp = meta.icon;
                            return (
                                <a key={i} href={t.url} target="_blank" className="block p-3 rounded-lg border border-white/10 hover:bg-white/5 transition">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="flex items-center gap-2">{IconComp && <IconComp className={`w-4 h-4 ${meta.color}`} />} {t.name}</span>
                                        <span className="text-emerald-400">{t.price}</span>
                                    </div>
                                    <div className="text-[11px] opacity-70 mt-1">{t.details} · 來源 {t.source}</div>
                                </a>
                            );
                        })}</div>
                    </div>

                    {/* Connectivity */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Wifi className="w-5 h-5" /> Wi-Fi 蛋 & eSIM</h4>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.connectivity.map((item, i) => (
                            <a key={i} href={item.url} target="_blank" className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition flex flex-col gap-1">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>{item.name}</span>
                                    <span className="text-indigo-400">{item.price}</span>
                                </div>
                                <div className="text-[11px] opacity-70">{item.type} • {item.provider} • {item.regions}</div>
                            </a>
                        ))}</div>
                    </div>

                    {/* Deep Dive */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col col-span-1 md:col-span-2`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Globe className="w-5 h-5" /> 旅遊攻略 & 官方資訊</h4>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">{TRAVEL_ARTICLES.map((article, i) => (
                            <a key={i} href={article.url} target="_blank" className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition flex justify-between items-center gap-3">
                                <div>
                                    <div className="text-sm font-semibold">{article.title}</div>
                                    <div className="text-[11px] opacity-70">由 {article.provider} 提供</div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 opacity-60" />
                            </a>
                        ))}</div>
                    </div>
                </div >
            </div >
            <CreateTripModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} form={form} onInputChange={handleInputChange} onMultiSelect={handleMultiSelect} onAddCity={handleAddCity} newCityInput={newCityInput} setNewCityInput={setNewCityInput} onSubmit={handleCreate} isDarkMode={isDarkMode} globalSettings={globalSettings} />
            {/* Import Modal */}
            {/* Smart Import Modal */}
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
                onImport={handleDashboardImport}
                isDarkMode={isDarkMode}
                trips={trips}
                selectedTripId={selectedImportTrip}
                setSelectedTripId={setSelectedImportTrip}
            />
            {/* Export Modal */}
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
        </main >
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
                {view === 'dashboard' && <Dashboard user={user} onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); }} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg} globalSettings={globalSettings} exchangeRates={exchangeRates} weatherData={weatherData} />}
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