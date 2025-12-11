import React, { useState, useEffect, useRef } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import {
    Home, Users, PiggyBank, MapPin, MapPinned, NotebookPen, Loader2, Plus,
    Sun, Moon, LogOut, ChevronLeft, CalendarDays, Bell,
    AlertTriangle, ChevronDown, LogIn, Globe, Map as MapIcon, Calendar,
    Trash2, Sparkles, X, BrainCircuit, Wallet, Plane,
    Bus, BusFront, TrainFront, Car, ShoppingBag, BedDouble, Receipt,
    CloudSun, CloudRain, Snowflake, Newspaper,
    TrendingUp, Siren, Search, List, Star, Shirt,
    UserCircle, Shield, UserPlus, FileUp, Edit3, Lock,
    Clock, Save, RefreshCw, Route,
    MonitorPlay, Info, CheckSquare, FileCheck, FileText, History,
    PlaneTakeoff, Hotel, GripVertical, Printer, ArrowUpRight, Navigation, Share2, Phone, Globe2, Link as LinkIcon, CheckCircle, Wifi,
    Utensils, Camera, Image, QrCode, Download, Copy, MessageCircle, Instagram
} from 'lucide-react';
import { getExchangeRates, convertCurrency } from './services/exchangeRate';
import { getWeather, getWeatherInfo } from './services/weather';
import { generateAISuggestions } from './services/ai';

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
const APP_VERSION = "V0.8.1 Beta";
const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";


const VERSION_HISTORY = [
    {
        ver: "V0.8.2 Beta",
        date: "2025-12-11",
        desc: {
            "zh-TW": "API 服務整合與 AI 領隊升級",
            "en": "API Integration & AI Upgrades"
        },
        details: {
            "zh-TW": "1. 整合免費匯率 API (ExchangeRate-API) 與天氣 API (Open-Meteo)，實現預算實時轉換與首頁天氣顯示。\n2. AI 領隊功能升級：新增智能模擬服務，提供更精確的在地行程建議與成本估算。\n3. 修復航空公司 Logo 無法顯示問題 (403 Forbidden)，改用 Google Favicon 服務。\n4. 系統優化：解決 Vite 構建緩存問題，提升開發穩定性。",
            "en": "1. Integrated free Exchange Rate & Weather APIs for real-time budget conversion and weather display.\n2. Upgraded AI Guide: New service logic with better localized suggestions and cost estimates.\n3. Fixed airline logo display issues (403 Forbidden).\n4. System optimization: Resolved Vite cache issues."
        }
    },
    {
        ver: "V0.8.1",
        date: "11/12/2025",
        desc: {
            "zh-TW": "Loading 介面美化升級",
            "en": "Enhanced Loading Screen Design"
        },
        details: {
            "zh-TW": "1. 多層旋轉環動畫，提升視覺吸引力。\n2. 添加背景粒子動畫效果。\n3. 飛機圖標脈衝動畫。\n4. 進度條與漸變效果。\n5. 優化色彩方案與排版。",
            "en": "1. Multi-layer rotating rings with smooth animations.\n2. Added animated background particles.\n3. Airplane icon with pulse animation.\n4. Progress bar with gradient effect.\n5. Improved color scheme and typography."
        }
    },
    {
        ver: "V0.8.0",
        date: "11/12/2025",
        desc: {
            "zh-TW": "功能升級與安全性更新",
            "en": "Feature Upgrade & Security Update"
        },
        details: {
            "zh-TW": "1. 更新所有依賴套件至最新版本（React 19.2.1, Vite 7.2.7）。\n2. 添加初始 Loading 畫面，改善載入體驗。\n3. 實作緩存破壞機制，確保用戶總是看到最新版本。\n4. 優化 SEO 設定，改善搜尋引擎收錄。\n5. 新增構建時間戳記，便於版本追蹤。",
            "en": "1. Updated all dependencies to latest versions (React 19.2.1, Vite 7.2.7).\n2. Added initial loading screen for better UX.\n3. Implemented cache busting to ensure users always see latest version.\n4. Optimized SEO settings for better search engine indexing.\n5. Added build timestamp for version tracking."
        }
    },
    {
        ver: "V0.7.0",
        date: "11/12/2024",
        desc: {
            "zh-TW": "社交分享、相片庫與安全性強化",
            "en": "Social Sharing, Photo Gallery & Security Enhancement"
        },
        details: {
            "zh-TW": "1. 新增行程分享至社交媒體功能（WhatsApp、Instagram、Threads）。\n2. 新增相片畫廊：支援多張上傳、地點標記、全螢幕檢視。\n3. 強化安全性：完整的 .gitignore 設定保護敏感資訊。\n4. 新增互動式教學模式與多幣別計算器小工具。\n5. 修正 Firebase 認證配置問題（VITE_ 前綴）。",
            "en": "1. Added trip sharing to social media (WhatsApp, Instagram, Threads).\n2. Added photo gallery: multi-upload, location tagging, full-screen view.\n3. Enhanced security: comprehensive .gitignore for sensitive data protection.\n4. Added interactive tutorial mode and multi-currency calculator.\n5. Fixed Firebase authentication config (VITE_ prefix)."
        }
    },
    {
        ver: "V0.6.1",
        date: "10/12/2025",
        desc: {
            "zh-TW": "旅遊資訊中心修正與新功能加入",
            "en": "Travel Info Hub Fixes & New Features"
        },
        details: {
            "zh-TW": "1. 修正旅遊資訊中心的顯示BUG。\n2. 新增建立行程的顯示BUG修正。",
            "en": "1. Fixed travel information center display bugs.\n2. Fixed trip creation display issues."
        }
    },
    {
        ver: "V0.6.0",
        date: "01/12/2025",
        desc: {
            "zh-TW": "Beta 版：首頁、AI、簽證、保險、地圖等全方位升級",
            "en": "Beta: Home, AI, Visa, Insurance, Map Comprehensive Upgrade"
        },
        details: {
            "zh-TW": "1. 所有日期以 DD/MM/YYYY 顯示，建立行程支援多國多城多選。\n2. 首頁卡片新增即時天氣與衣著提示、旅遊資訊中心含更多連結。\n3. 簽證區分公開狀態與個人詳情，教學資料補齊 5 天內容。\n4. AI 領隊提供真實建議，可加入行程與交通推薦。\n5. 機票、交通卡片顯示航空公司 / 交通 Logo，保險提供 AI 建議與 Visit Japan Web 指引。\n6. 每日行程摘要、交通建議、地圖視圖集合全部行程地點。",
            "en": "1. All dates in DD/MM/YYYY format, multi-country/city trip creation.\n2. Homepage cards with real-time weather & clothing tips, enhanced info hub.\n3. Visa section split into public status & private details, tutorial with 5-day content.\n4. AI guide with real suggestions, trip & transport recommendations.\n5. Flight/transport cards show airline/transport logos, insurance with AI tips & Visit Japan Web guide.\n6. Daily itinerary summary, transport advice, map view with all locations."
        }
    },
    {
        ver: "V0.5.0",
        date: "26/11/2025",
        desc: {
            "zh-TW": "版本視窗、簽證資訊與彈窗體驗更新",
            "en": "Version Window, Visa Info & Modal UX Update"
        },
        details: {
            "zh-TW": "1. 新增版本按鈕與詳細紀錄視窗。\n2. 補齊簽證分頁內容與權限顯示。\n3. 優化加入行程等彈窗文案。",
            "en": "1. Added version button with detailed history window.\n2. Completed visa tab content and permission display.\n3. Improved modal text for adding items."
        }
    },
    {
        ver: "V0.4.0",
        date: "26/11/2025",
        desc: {
            "zh-TW": "真實東京行程教學、新增項目支援稅務/轉機",
            "en": "Real Tokyo Tutorial, Tax/Transfer Support"
        },
        details: {
            "zh-TW": "1. 教學模式資料替換為真實東京5日遊。\n2. 新增項目可填寫稅金、退稅、航班轉機。\n3. 緊急資訊根據用戶所在地顯示正確辦事處。",
            "en": "1. Tutorial mode with real Tokyo 5-day trip data.\n2. New items support tax, tax refund, flight transfer fields.\n3. Emergency info shows correct office based on user location."
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
    "HK": { "01-01": "元旦", "02-10": "農曆新年", "07-01": "回歸紀念", "12-25": "聖誕節" },
    "TW": { "01-01": "元旦", "02-28": "和平紀念日", "04-04": "兒童節", "10-10": "雙十節" },
    "JP": { "01-01": "元日", "02-11": "建國記念日", "04-29": "昭和之日", "11-03": "文化の日" },
    "Global": { "01-01": "New Year", "04-01": "Spring Break", "12-25": "Christmas" }
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
    "EVA Air": "https://www.google.com/s2/favicons?domain=evaair.com&sz=64",
    "Cathay": "https://www.google.com/s2/favicons?domain=cathaypacific.com&sz=64",
    "ANA": "https://www.google.com/s2/favicons?domain=ana.co.jp&sz=64",
    "JAL": "https://www.google.com/s2/favicons?domain=jal.com&sz=64",
    "China Airlines": "https://www.google.com/s2/favicons?domain=china-airlines.com&sz=64",
    "Swiss": "https://www.google.com/s2/favicons?domain=swiss.com&sz=64"
};

const TRANSPORT_ICONS = {
    metro: { label: "地鐵", icon: TrainFront, color: "text-indigo-500" },
    bus: { label: "巴士", icon: BusFront, color: "text-emerald-500" },
    car: { label: "自駕", icon: Car, color: "text-amber-500" },
    walk: { label: "步行", icon: Route, color: "text-blue-500" }
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
const inputClasses = (isDarkMode) => `w-full p-3 rounded-xl border transition-all outline-none ${isDarkMode ? 'bg-gray-800/80 border-gray-600 focus:border-indigo-400 text-white placeholder-gray-500' : 'bg-gray-50/80 border-gray-300 focus:border-indigo-600 text-gray-900 placeholder-gray-400'}`;
const buttonPrimary = `flex items - center justify - center px - 6 py - 3 rounded - xl font - bold text - white bg - gradient - to - r from - indigo - 600 via - purple - 600 to - pink - 600 hover: from - indigo - 500 hover: via - purple - 500 hover: to - pink - 500 shadow - lg hover: shadow - xl transition - all duration - 300 transform hover: scale - [1.05] active: scale - 95 w - full cursor - pointer`;
const getHolidayMap = (region) => HOLIDAYS_BY_REGION[region] || HOLIDAYS_BY_REGION.Global;
const getLocalizedCountryName = (country, lang = 'zh-TW') => COUNTRY_TRANSLATIONS[country]?.[lang] || country;
const getLocalizedCityName = (city, lang = 'zh-TW') => CITY_TRANSLATIONS[city]?.[lang] || city;

const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    const pad = (val) => val.toString().padStart(2, '0');
    return `${pad(d)} /${pad(m)}/${y} `;
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

const getTransportAdvice = (item, city = "") => {
    if (!item?.details?.location) return null;
    if (item.type === 'flight') return { mode: 'metro', label: "機場快線 / 地鐵", cost: "約 $120" };
    if (item.type === 'hotel') return { mode: 'car', label: "計程車約 15 分", cost: "約 $80" };
    if (item.type === 'food') {
        const walk = getWalkMeta();
        return { mode: 'walk', label: `步行 ${walk.minutes} 分`, cost: "$0", meta: walk };
    }
    if (item.type === 'transport') return { mode: 'bus', label: "巴士/高速巴士", cost: item.cost ? `${item.currency} ${item.cost} ` : "依票價" };
    return { mode: 'metro', label: `${city} 地鐵`, cost: "約 $30" };
};

const buildDailyReminder = (date, items = []) => {
    if (!items.length) return "今日尚未規劃行程，快去新增吧！";
    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};

const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();



const getWalkMeta = () => {
    const distance = (0.4 + Math.random() * 0.8).toFixed(1);
    const steps = Math.round(Number(distance) * 1400);
    const minutes = Math.round(Number(distance) * 12);
    return { distance, steps, minutes };
};

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
                        {showNotif && <div className={`absolute top-12 right-0 w-96 p-4 rounded-xl shadow-2xl border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <h4 className="font-bold px-3 py-2 text-sm border-b border-gray-500/10 mb-2">通知中心</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {notifications.length === 0 ? (
                                    <div className="text-xs opacity-60 text-center py-6">目前沒有新的通知。</div>
                                ) : notifications.map(n => (
                                    <div key={n.id} className="p-3 rounded-lg border border-gray-500/20 text-xs flex flex-col gap-1">
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
                            <div className={`rounded-xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
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
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            generateAISuggestions(contextCity, existingItems)
                .then(res => {
                    setResult(res);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("AI Error:", err);
                    setLoading(false);
                });
        } else { setResult(null); }
    }, [isOpen, contextCity, existingItems]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 animate-fade-in" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className={`w-full max-w-xl rounded - 2xl p - 6 shadow - 2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transform scale - 100`} style={{ animation: 'scaleIn 0.3s ease-out' }}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-500" /> AI 領隊建議</h3>
                {loading ? <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" /> 依據 {contextCity} 行程分析中...</div> : (
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-sm">
                            <p className="font-bold mb-2 opacity-80">✨ 建議行程：</p>
                            <ul className="space-y-2">
                                {result?.map((item, i) => {
                                    const advice = getTransportAdvice(item, contextCity);
                                    return (
                                        <li key={i} className="border-b border-black/5 pb-2 last:border-0">
                                            <div className="flex gap-3 items-center">
                                                <span className="font-mono text-xs opacity-50">{item.time}</span>
                                                <div className="flex-1">
                                                    <span className="font-bold text-sm block">{item.name}</span>
                                                    {item.details?.desc && <span className="text-xs opacity-70 block">{item.details.desc}</span>}
                                                </div>
                                                {item.cost > 0 && (
                                                    <div className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                                                        {item.currency} {item.cost}
                                                    </div>
                                                )}
                                            </div>
                                            {advice && <div className="text-[11px] opacity-70 ml-10 mt-1 flex items-center gap-1">🚌 交通建議：{advice.label} · {advice.cost}</div>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2 border border-gray-500 rounded-lg opacity-70">取消</button><button onClick={() => { onApply(result); onClose(); }} className={buttonPrimary + " flex-1"}>加入行程</button></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MemberSettingsModal = ({ isOpen, onClose, members, onUpdateRole, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-lg rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} `}>
                <h3 className="text-xl font-bold mb-4">成員權限管理</h3>
                <div className="space-y-2">
                    {members.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm">{m.name}</span>
                            {m.role === 'owner' ? <span className="text-xs opacity-50 px-2">擁有者</span> : (
                                <select value={m.role} onChange={(e) => onUpdateRole(m.id, e.target.value)} className={inputClasses(isDarkMode) + " py-1 text-xs w-24"}>
                                    <option value="editor">編輯者</option>
                                    <option value="viewer">檢視者</option>
                                    <option value="remove">移除</option>
                                </select>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full mt-4 py-2 bg-gray-500 text-white rounded-lg">關閉</button>
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, globalSettings, setGlobalSettings, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xl font-bold mb-4">個人設定</h3>
                <div className="space-y-4">
                    <div><label className="block text-xs opacity-70 mb-1">貨幣</label><select value={globalSettings.currency} onChange={e => setGlobalSettings({ ...globalSettings, currency: e.target.value })} className={inputClasses(isDarkMode)}>{Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-xs opacity-70 mb-1">所在地 (用於緊急資訊)</label><select value={globalSettings.region} onChange={e => setGlobalSettings({ ...globalSettings, region: e.target.value })} className={inputClasses(isDarkMode)}>{Object.keys(TIMEZONES).map(r => <option key={r} value={r}>{TIMEZONES[r].label}</option>)}</select></div>
                    <div><label className="block text-xs opacity-70 mb-1">介面語言</label><select value={globalSettings.lang} onChange={e => setGlobalSettings({ ...globalSettings, lang: e.target.value })} className={inputClasses(isDarkMode)}>{Object.entries(LANGUAGE_OPTIONS).map(([code, conf]) => <option key={code} value={code}>{conf.label}</option>)}</select></div>
                </div>
                <button onClick={onClose} className={buttonPrimary + " mt-6"}>完成</button>
            </div>
        </div>
    );
};

const VersionModal = ({ isOpen, onClose, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings?.lang || 'zh-TW';
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-2xl`}>
                <h3 className="text-xl font-bold mb-4">
                    {currentLang === 'zh-TW' ? '版本紀錄（Beta 測試中）' : 'Version History (Beta)'}
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {VERSION_HISTORY.map((v, i) => (
                        <div key={i} className="border-l-2 border-indigo-500 pl-4 pb-2">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-lg">{v.ver}</span>
                                <span className="text-xs opacity-60">{v.date}</span>
                            </div>
                            <div className="text-sm mt-1 font-semibold opacity-90">
                                {typeof v.desc === 'object' ? v.desc[currentLang] || v.desc['zh-TW'] : v.desc}
                            </div>
                            {v.details && (
                                <div className="mt-1 text-xs opacity-70 whitespace-pre-wrap">
                                    {typeof v.details === 'object' ? v.details[currentLang] || v.details['zh-TW'] : v.details}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-500/20 text-center text-xs opacity-50">
                    Author: {AUTHOR_NAME}
                </div>
                <button onClick={onClose} className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-lg">
                    {currentLang === 'zh-TW' ? '關閉' : 'Close'}
                </button>
            </div>
        </div>
    );
};

const InviteModal = ({ isOpen, onClose, tripId, onInvite, isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-lg rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} `}>
                <h3 className="text-xl font-bold mb-4">邀請成員</h3>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Google Email" className={inputClasses(isDarkMode) + " mb-3"} />
                <select value={role} onChange={e => setRole(e.target.value)} className={inputClasses(isDarkMode) + " mb-4"}>
                    <option value="editor">編輯者 (可修改)</option>
                    <option value="viewer">檢視者 (唯讀)</option>
                </select>
                <button onClick={() => { onInvite(email, role); onClose(); }} className={buttonPrimary}>發送邀請</button>
                <button onClick={onClose} className="w-full text-center mt-3 text-xs opacity-50">取消</button>
            </div>
        </div>
    );
};

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode }) => {
    const [form, setForm] = useState(trip);
    useEffect(() => { if (trip) setForm(trip) }, [trip]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-xl p - 6 rounded - 2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} `}>
                <h3 className="text-xl font-bold mb-4">行程設定</h3>
                <div className="space-y-4">
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClasses(isDarkMode)} placeholder="名稱" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClasses(isDarkMode)} />
                        <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inputClasses(isDarkMode)} />
                    </div>
                    <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputClasses(isDarkMode)}>{Object.keys(COUNTRIES_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClasses(isDarkMode)} placeholder="城市" />
                    <button onClick={() => { onUpdate(form); onClose(); }} className={buttonPrimary}>儲存</button>
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
        { id: 'spot', label: '景點', icon: MapIcon }, { id: 'food', label: '餐廳', icon: Utensils },
        { id: 'shopping', label: '購物', icon: ShoppingBag }, { id: 'transport', label: '交通', icon: Bus },
        { id: 'flight', label: '航班', icon: PlaneTakeoff }, { id: 'hotel', label: '住宿', icon: Hotel }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-xl p - 6 rounded - 2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} max - h - [90vh] overflow - y - auto custom - scrollbar`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{editData ? '編輯行程項目' : '加入行程項目'}</h3>
                        {date && (
                            <div className="text-xs opacity-70 mt-1">
                                針對日期：{formatDate(date)}（{getWeekday(date)}）
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">{categories.map(cat => (<button key={cat.id} onClick={() => setType(cat.id)} className={`flex flex - col items - center p - 2 rounded - lg min - w - [60px] border transition ${type === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'opacity-70'} `}><cat.icon className="w-5 h-5 mb-1" /><span className="text-[10px]">{cat.label}</span></button>))}</div>

                <input value={name} onChange={e => setName(e.target.value)} placeholder="名稱" className={inputClasses(isDarkMode) + " mb-2"} />
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="time" value={details.time || ''} onChange={e => setDetails({ ...details, time: e.target.value })} className={inputClasses(isDarkMode)} />
                    <input value={details.location || ''} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="地點" className={inputClasses(isDarkMode)} />
                </div>

                {type === 'flight' && (
                    <div className="mb-2 p-3 border rounded bg-black/5">
                        <input value={details.number || ''} onChange={e => setDetails({ ...details, number: e.target.value })} placeholder="航班編號 (如: BR198)" className={inputClasses(isDarkMode) + " mb-2"} />
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={details.layover} onChange={e => setDetails({ ...details, layover: e.target.checked })} /> 需轉機</label>
                    </div>
                )}

                {defaultType !== 'shopping_plan' && (
                    <>
                        <div className="flex gap-2 mb-2"><input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="金額" className={inputClasses(isDarkMode)} /><select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClasses(isDarkMode) + " w-1/3 appearance-none"}>{Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        {(type === 'shopping' || type === 'hotel' || type === 'flight') && (
                            <div className="p-3 rounded-lg border mb-2 bg-black/5">
                                <div className="flex gap-2 mb-2"><input placeholder="稅金" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.tax} onChange={e => setDetails({ ...details, tax: e.target.value })} /><input placeholder="退稅額" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.refund} onChange={e => setDetails({ ...details, refund: e.target.value })} /></div>
                            </div>
                        )}
                        {cost > 0 && (
                            <div className="p-3 rounded-lg border mb-3 bg-black/5">
                                <div className="flex gap-2"><div className="flex-1"><label className="text-[10px]">付款人</label><select value={payer} onChange={e => setPayer(e.target.value)} className={inputClasses(isDarkMode) + " py-1 text-sm"}>{members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select></div><div className="flex-1"><label className="text-[10px]">歸屬</label><select value={splitType} onChange={e => setSplitType(e.target.value)} className={inputClasses(isDarkMode) + " py-1 text-sm"}><option value="group">多人均分</option><option value="me">個人支出</option></select></div></div>
                            </div>
                        )}
                    </>
                )}
                {defaultType === 'shopping_plan' && <input type="number" value={estPrice} onChange={e => setEstPrice(e.target.value)} placeholder="預計價格" className={inputClasses(isDarkMode) + " mb-2"} />}
                <button onClick={() => { onSave({ id: editData?.id, name, cost: Number(cost), estPrice: Number(estPrice), currency, type, details, payer, splitType }); onClose(); }} className={buttonPrimary}>確認</button>
                <button onClick={onClose} className="w-full text-center py-2 mt-2 opacity-50">取消</button>
            </div>
        </div>
    );
};

const CreateTripModal = ({ isOpen, onClose, form, onInputChange, onMultiSelect, onAddCity, newCityInput, setNewCityInput, onSubmit, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings.lang; // 新增這一行來解決未定義的錯誤
    if (!isOpen) return null;
    const availableCities = (form.countries.length ? form.countries : Object.keys(COUNTRIES_DATA)).flatMap(country => (COUNTRIES_DATA[country]?.cities || []));
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-3xl rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} `}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold">建立新行程</h3>
                        <p className="text-xs opacity-70 mt-1">多選國家與城市，或輸入自訂目的地。</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs opacity-70">行程名稱</label>
                        <input value={form.name} onChange={e => onInputChange('name', e.target.value)} placeholder="如：歐洲文化深度遊" className={inputClasses(isDarkMode) + " mt-1"} />
                    </div>
                    <div>
                        <label className="text-xs opacity-70">目的地國家（可複選）</label>
                        <select multiple value={form.countries} onChange={(e) => onMultiSelect(e, 'countries')} className={inputClasses(isDarkMode) + " mt-1 h-32"}>
                            {Object.keys(COUNTRIES_DATA).sort().map(c => <option key={c} value={c}>{getLocalizedCountryName(c, currentLang)}</option>)}
                        </select>
                        <p className="text-[11px] opacity-60 mt-1">按住 ⌘/Ctrl 以多選；選擇 Other 可自訂。</p>
                    </div>
                    <div>
                        <label className="text-xs opacity-70">主要城市（可複選）</label>
                        <select multiple value={form.cities} onChange={(e) => onMultiSelect(e, 'cities')} className={inputClasses(isDarkMode) + " mt-1 h-32"}>
                            {availableCities.map(city => <option key={city} value={city}>{getLocalizedCityName(city, currentLang)}</option>)}
                        </select>
                        <div className="flex gap-2 mt-2">
                            <input value={newCityInput} onChange={e => setNewCityInput(e.target.value)} placeholder="輸入自訂城市" className={inputClasses(isDarkMode) + " text-sm"} />
                            <button onClick={() => onAddCity(newCityInput)} className="px-3 rounded-lg bg-indigo-500 text-white text-sm">加入</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs opacity-70">開始日期</label>
                        <input type="date" value={form.startDate} onChange={e => onInputChange('startDate', e.target.value)} className={inputClasses(isDarkMode) + " mt-1"} />
                    </div>
                    <div>
                        <label className="text-xs opacity-70">結束日期</label>
                        <input type="date" value={form.endDate} onChange={e => onInputChange('endDate', e.target.value)} className={inputClasses(isDarkMode) + " mt-1"} />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500/40">取消</button>
                    <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">建立行程</button>
                </div>
            </div>
        </div>
    );
};

const ImportTripModal = ({ isOpen, onClose, mode, setMode, inputValue, setInputValue, onImport, isDarkMode, errorMessage }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-3xl rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} `}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold">匯入行程</h3>
                        <p className="text-xs opacity-70">支援 JSON 或 CSV；請遵循欄位：name,country,city,startDate,endDate。</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-3 mb-3">
                    <button onClick={() => setMode('json')} className={`px - 4 py - 2 rounded - lg text - sm ${mode === 'json' ? 'bg-indigo-500 text-white' : 'bg-gray-500/10'} `}>JSON</button>
                    <button onClick={() => setMode('csv')} className={`px - 4 py - 2 rounded - lg text - sm ${mode === 'csv' ? 'bg-indigo-500 text-white' : 'bg-gray-500/10'} `}>CSV</button>
                </div>
                <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} className={`w - full h - 40 p - 3 rounded - xl border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} `} placeholder={mode === 'json' ? '[{"name":"Tokyo","country":"Japan (日本)","city":"Tokyo","startDate":"2025-04-01","endDate":"2025-04-05"}]' : 'name,country,city,startDate,endDate\n東京行,日本 (日本),Tokyo,2025-04-01,2025-04-05'} />
                {errorMessage && <div className="text-sm text-red-400 mt-2">{errorMessage}</div>}
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500/40">取消</button>
                    <button onClick={onImport} className="px-4 py-2 rounded-lg bg-green-600 text-white">匯入</button>
                </div>
            </div>
        </div>
    );
};

const ExportTripModal = ({ isOpen, onClose, trips, selectedTripId, setSelectedTripId, isDarkMode }) => {
    if (!isOpen) return null;
    const selectedTrip = trips.find(t => t.id === selectedTripId);
    const exportData = selectedTrip ? JSON.stringify(selectedTrip, null, 2) : '';
    const copyData = () => navigator.clipboard.writeText(exportData);
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-3xl rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} `}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">匯出行程</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-4 h-4" /></button>
                </div>
                <select value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)} className={inputClasses(isDarkMode)}>
                    <option value="">選擇行程</option>
                    {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <textarea readOnly value={exportData} className={`w - full h - 48 mt - 4 p - 3 rounded - xl border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} `} />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={copyData} disabled={!exportData} className={`px - 4 py - 2 rounded - lg ${exportData ? 'bg-indigo-600 text-white' : 'bg-gray-500/40 text-gray-300 cursor-not-allowed'} `}>複製內容</button>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500/40">關閉</button>
                </div>
            </div>
        </div>
    );
};

const SectionDataModal = ({ isOpen, onClose, mode, section, data, onConfirm, isDarkMode }) => {
    const [inputValue, setInputValue] = useState(data || "");
    useEffect(() => { if (isOpen) setInputValue(data || ""); }, [isOpen, data]);
    if (!isOpen) return null;
    const titleMap = { itinerary: "行程", shopping: "購物清單", budget: "預算" };
    const actionLabel = mode === 'import' ? '匯入' : '複製';
    const handleConfirm = () => {
        if (mode === 'import') onConfirm(inputValue);
        else { navigator.clipboard.writeText(inputValue); alert("已複製"); }
    };
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-3xl rounded - 2xl p - 6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} `}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{mode === 'import' ? '匯入' : '匯出'} {titleMap[section] || ''}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-4 h-4" /></button>
                </div>
                <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} readOnly={mode === 'export'} className={`w - full h - 48 p - 3 rounded - xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} `} />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500/40">關閉</button>
                    <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">{actionLabel}</button>
                </div>
            </div>
        </div>
    );
};

// --- Trip Detail ---
const TripDetail = ({ tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates }) => {
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isAddModal, setIsAddModal] = useState(false);
    const [isInviteModal, setIsInviteModal] = useState(false);
    const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
    const [isAIModal, setIsAIModal] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [addType, setAddType] = useState('spot');
    const [viewMode, setViewMode] = useState('list');
    const [realTrip, setRealTrip] = useState(null);
    const [noteEdit, setNoteEdit] = useState(false);
    const [tempNote, setTempNote] = useState("");
    const [myInsurance, setMyInsurance] = useState({ provider: '', policyNo: '', phone: '', notes: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [dataModalConfig, setDataModalConfig] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState({ shopping: null, budget: null });
    const [visaForm, setVisaForm] = useState({ status: '', number: '', expiry: '', needsPrint: false });

    const trip = isSimulation ? tripData : realTrip;
    const myRole = trip?.members?.find(m => m.id === user.uid)?.role || 'viewer';
    const isOwner = myRole === 'owner' || isSimulation;
    const canEdit = myRole === 'owner' || myRole === 'editor' || isSimulation;

    useEffect(() => {
        if (isSimulation) {
            setTempNote(tripData.notes);
            setMyInsurance(tripData.insurance?.private?.sim || {});
            return;
        }
        if (!tripData?.id) return;
        const unsub = onSnapshot(doc(db, "trips", tripData.id), d => {
            if (d.exists()) {
                const data = d.data();
                setRealTrip({ id: d.id, ...data });
                setTempNote(data.notes);
                setMyInsurance(data.insurance?.private?.[user.uid] || {});
            }
        });
        return () => unsub();
    }, [tripData, isSimulation]);

    useEffect(() => {
        if (!trip) return;
        const visaStore = trip.visa || {};
        const myVisa = isSimulation ? visaStore.sim : (visaStore[user.uid] || visaStore.default);
        setVisaForm({
            status: myVisa?.status || '',
            number: myVisa?.number || '',
            expiry: myVisa?.expiry || '',
            needsPrint: Boolean(myVisa?.needsPrint)
        });
    }, [trip, user.uid, isSimulation]);

    useEffect(() => { if (trip) setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE); return () => setGlobalBg(null); }, [trip, setGlobalBg]);

    if (!trip) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];
    const dailyWeather = getWeatherForecast(trip.country, currentDisplayDate);
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.lang || 'zh-TW';
    const displayCountry = getLocalizedCountryName(trip.country, currentLang);
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);
    const itineraryItems = trip.itinerary?.[currentDisplayDate] || [];
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems);
    const allLocations = days.flatMap(d => (trip.itinerary?.[d] || []).map(item => ({ date: d, ...item }))).filter(item => item.details?.location);
    const mapQuery = allLocations.length ? allLocations.map(item => item.details.location).join(' via ') : `${trip.city} ${trip.country} `;
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
    const holidays = getHolidayMap(globalSettings.region);

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
        <div className="max-w-6xl mx-auto p-4 pb-20 animate-fade-in">
            {/* Header (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`${glassCard(isDarkMode)} col-span-1 md:col-span-2 p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${countryInfo.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex justify-between items-start">
                            <h2 className="text-3xl font-bold mb-2">{trip.name}</h2>
                            {isOwner && <button onClick={() => setIsTripSettingsOpen(true)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30"><Edit3 className="w-4 h-4" /></button>}
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
                        {isOwner && <button onClick={() => setIsMemberModalOpen(true)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded flex justify-center"><Users className="w-4 h-4" /></button>}
                        {isOwner && <button onClick={() => setIsInviteModal(true)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded flex justify-center"><UserPlus className="w-4 h-4" /></button>}
                        {isOwner && <button onClick={handleDeleteTrip} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded flex justify-center"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {[{ id: 'itinerary', label: '行程', icon: CalendarDays }, { id: 'shopping', label: '購物', icon: ShoppingBag }, { id: 'budget', label: '預算', icon: Wallet }, { id: 'insurance', label: '保險', icon: Shield }, { id: 'emergency', label: '緊急', icon: Siren }, { id: 'visa', label: '簽證', icon: FileCheck }, { id: 'notes', label: '筆記', icon: NotebookPen }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105' : (isDarkMode ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}><t.icon className="w-4 h-4 mr-2" />{t.label}</button>))}
            </div>

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {days.map((d) => (
                            <button key={d} onClick={() => setSelectDate(d)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition text-center min-w-[130px] relative overflow-hidden ${currentDisplayDate === d ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105' : (isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-100/80 border-gray-200')}`}>
                                <div className="text-xs opacity-70 uppercase mb-1">{getWeekday(d)}</div>
                                <div className="font-bold text-sm">{formatDate(d)}</div>
                                {holidays[d.slice(5)] && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-1 rounded-bl">{holidays[d.slice(5)]}</div>}
                            </button>
                        ))}
                    </div>

                    {/* Daily Summary Header */}
                    <div className="p-4 bg-white/10 border border-white/20 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-lg font-bold">{dailyWeather.icon} {dailyWeather.temp}</div>
                            <div className="text-xs opacity-80">
                                <div>最高: {dailyWeather.temp} / 最低: {parseInt(dailyWeather.temp) - 8}°C</div>
                                <div className="flex items-center gap-2">衣著: {dailyWeather.clothes}{dailyWeather.outfitIcon && <img src={dailyWeather.outfitIcon} alt="outfit" className="w-6 h-6" />}</div>
                            </div>
                        </div>
                        <div className="text-xs opacity-80 flex items-center gap-2">
                            <Clock className="w-4 h-4" />{dailyReminder}
                        </div>
                    </div>

                    <div className={glassCard(isDarkMode) + " p-4 min-h-[400px]"}>
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <div className="font-bold text-lg flex items-center gap-3">{formatDate(currentDisplayDate)}</div>
                            <div className="flex gap-2 flex-wrap justify-end">
                                <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:opacity-80">{viewMode === 'list' ? <MapIcon className="w-4 h-4" /> : <List className="w-4 h-4" />}</button>
                                <button onClick={() => openSectionModal('import', 'itinerary')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                                <button onClick={() => openSectionModal('export', 'itinerary')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
                                {canEdit && <button onClick={() => { setSelectDate(currentDisplayDate); setAddType('spot'); setEditingItem(null); setIsAddModal(true); }} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">+ 新增</button>}
                            </div>
                        </div>
                        {viewMode === 'list' ? (
                            <div className="p-4 space-y-2">
                                {itineraryItems.map((item, i) => {
                                    const advice = getTransportAdvice(item, trip.city);
                                    const transportMeta = advice ? TRANSPORT_ICONS[advice.mode] : null;
                                    const TransportIcon = transportMeta?.icon;
                                    return (
                                        <div key={i} draggable={canEdit} onDragStart={(e) => onDragStart(e, i)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, i)} onClick={() => { if (canEdit) { setAddType(item.type); setEditingItem(item); setIsAddModal(true); } }} className={`group p-3 border rounded-xl mb-2 flex flex-col gap-2 hover:shadow-md transition cursor-pointer ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/80 border-gray-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full flex-shrink-0 ${item.type === 'flight' ? 'bg-blue-100 text-blue-600' : (item.type === 'hotel' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600')}`}>
                                                    {item.type === 'flight' ? <PlaneTakeoff className="w-4 h-4" /> : (item.type === 'hotel' ? <Hotel className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />)}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="font-bold truncate">{item.name}</div>
                                                    <div className="text-xs opacity-50 flex gap-2 flex-wrap"><span>{item.details?.time}</span> <span>{item.details?.location}</span></div>
                                                </div>
                                                {item.cost > 0 && (
                                                    <div className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded flex flex-col leading-tight">
                                                        <span className="font-mono">{item.currency} {item.cost}</span>
                                                        <span className="text-[10px] text-green-700">付款: {item.payer || '未指定'} • {item.splitType === 'group' ? '多人' : '個人'}</span>
                                                    </div>
                                                )}
                                                {item.details?.location && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details.location)}`} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"><Navigation className="w-4 h-4" /></a>}
                                            </div>
                                            {advice && (
                                                <div className="text-[11px] opacity-80 flex items-center gap-2 pl-1 flex-wrap">
                                                    {TransportIcon && <TransportIcon className={`w-4 h-4 ${transportMeta.color}`} />}
                                                    <span>交通建議：{advice.label} • {advice.cost}</span>
                                                    {advice.mode === 'walk' && advice.meta && <span className="opacity-70">（約 {advice.meta.steps} 步 / {advice.meta.distance} km）</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-[420px] grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10">
                                    <iframe title="trip-map" width="100%" height="100%" frameBorder="0" src={mapSrc}></iframe>
                                </div>
                                <div className="space-y-3 overflow-y-auto custom-scrollbar p-2">
                                    {allLocations.length === 0 ? <div className="text-sm opacity-60">尚未有地點資訊。</div> : allLocations.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="p-3 rounded-xl border bg-white/5 flex flex-col gap-1">
                                            <div className="text-xs opacity-60 flex items-center gap-2"><MapPinned className="w-4 h-4" />{formatDate(item.date)}</div>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-xs opacity-70">{item.details?.location}</div>
                                            <a className="text-indigo-400 text-xs underline" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details?.location || trip.city)}`}>在地圖開啟</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'insurance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><Lock className="w-5 h-5" /> 私人保險 (僅自己可見)</h3>
                        <div className="space-y-4">
                            <input value={myInsurance.provider || ''} onChange={e => setMyInsurance({ ...myInsurance, provider: e.target.value })} placeholder="保險公司" className={inputClasses(isDarkMode)} />
                            <input value={myInsurance.policyNo || ''} onChange={e => setMyInsurance({ ...myInsurance, policyNo: e.target.value })} placeholder="保單號碼" className={inputClasses(isDarkMode)} />
                            <input value={myInsurance.phone || ''} onChange={e => setMyInsurance({ ...myInsurance, phone: e.target.value })} placeholder="緊急聯絡電話" className={inputClasses(isDarkMode)} />
                            <button onClick={handleSaveInsurance} className={buttonPrimary}>儲存資料</button>
                        </div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><Shield className="w-5 h-5" /> 建議與狀態</h3>
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm mb-4">{countryInfo.insuranceInfo}</div>
                        <div className="flex gap-2 flex-wrap mb-4">{INSURANCE_SUGGESTIONS[globalSettings.region]?.map(s => <span key={s} className="px-3 py-1 bg-white/10 border rounded-full text-sm">{s}</span>)}</div>
                        <div className="space-y-2">
                            {INSURANCE_RESOURCES.filter(item => item.region === globalSettings.region || item.region === 'Global').map(item => (
                                <a key={item.title} href={item.url} target="_blank" className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition">
                                    <span>{item.title}</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-60" />
                                </a>
                            ))}
                        </div>
                        <div className="text-[11px] opacity-60 mt-3">AI 建議：依所在地先完成 Visit Japan Web 等官方登錄，再補上涵蓋醫療與航班延誤的保單。</div>
                    </div>
                </div>
            )}

            {activeTab === 'visa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2">
                            <FileCheck className="w-5 h-5" /> 目的地入境與簽證資訊
                        </h3>
                        <div className="text-sm mb-3">
                            <div className="font-semibold mb-1">{displayCountry} {displayCity}</div>
                            <div className="opacity-80">
                                {countryInfo.entryInfo || '請依照官方網站最新規定辦理入境／簽證。'}
                            </div>
                        </div>
                        <div className="mt-3 text-xs opacity-70">
                            提醒：實際入境規定可能隨時間變動，請於出發前再次確認航空公司與官方網站資訊。
                        </div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6 space-y-5"}>
                        <div>
                            <h3 className="font-bold mb-2 flex gap-2">
                                <FileText className="w-5 h-5" /> 成員簽證狀態（所有人可見）
                            </h3>
                            {(() => {
                                const visaStore = trip.visa || {};
                                const entries = Object.entries(visaStore).filter(([key]) => !['default'].includes(key));
                                if (entries.length === 0) return <div className="text-sm opacity-60">尚未有人更新簽證狀態。</div>;
                                return (
                                    <div className="space-y-3">
                                        {entries.map(([memberId, info]) => {
                                            const member = trip.members?.find(m => m.id === memberId) || { name: memberId };
                                            return (
                                                <div key={memberId} className="p-3 rounded-xl border border-white/10 bg-white/5">
                                                    <div className="flex justify-between text-sm font-bold">
                                                        <span>{member.name}</span>
                                                        <span className="text-indigo-400">{info.status || '未填寫'}</span>
                                                    </div>
                                                    <div className="text-[11px] opacity-70 mt-1">有效期限：{info.expiry || '-'}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <h4 className="font-bold mb-2 text-sm">我的簽證詳細（僅自己可見）</h4>
                            {(() => {
                                const visaStore = trip.visa || {};
                                const myVisa = isSimulation ? visaStore.sim : (visaStore[user.uid] || visaStore.default);
                                if (!myVisa) {
                                    return (
                                        <div className="text-sm opacity-70">
                                            尚未填寫簽證資訊，可在未來版本中由自己或管理者補上。
                                        </div>
                                    );
                                }
                                return (
                                    <div className="space-y-2 text-sm">
                                        {myVisa.status && (
                                            <div className="flex justify-between">
                                                <span className="opacity-70">狀態</span>
                                                <span className="font-semibold">{myVisa.status}</span>
                                            </div>
                                        )}
                                        {myVisa.number && (
                                            <div className="flex justify-between">
                                                <span className="opacity-70">簽證類型／備註</span>
                                                <span className="font-semibold">{myVisa.number}</span>
                                            </div>
                                        )}
                                        {myVisa.expiry && (
                                            <div className="flex justify-between">
                                                <span className="opacity-70">有效期限</span>
                                                <span className="font-mono">{myVisa.expiry}</span>
                                            </div>
                                        )}
                                        {typeof myVisa.needsPrint === 'boolean' && (
                                            <div className="flex items-center gap-2 mt-2 text-xs">
                                                <CheckCircle className={`w-4 h-4 ${myVisa.needsPrint ? 'text-amber-400' : 'text-emerald-400'}`} />
                                                <span>{myVisa.needsPrint ? '建議列印簽證文件隨身攜帶。' : '此行程不需額外列印簽證文件。'}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            <div className="mt-4 space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={visaForm.status} onChange={e => setVisaForm({ ...visaForm, status: e.target.value })} placeholder="簽證狀態 (如：免簽)" className={inputClasses(isDarkMode) + " text-xs"} />
                                    <input value={visaForm.number} onChange={e => setVisaForm({ ...visaForm, number: e.target.value })} placeholder="簽證號碼 / 備註" className={inputClasses(isDarkMode) + " text-xs"} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 items-center">
                                    <input value={visaForm.expiry} onChange={e => setVisaForm({ ...visaForm, expiry: e.target.value })} placeholder="有效期 (DD/MM/YYYY)" className={inputClasses(isDarkMode) + " text-xs"} />
                                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={visaForm.needsPrint} onChange={e => setVisaForm({ ...visaForm, needsPrint: e.target.checked })} /> 需列印簽證文件</label>
                                </div>
                                <button onClick={handleSaveVisa} className={buttonPrimary + " text-xs"}>儲存我的簽證資訊</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'emergency' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className={glassCard(isDarkMode) + " p-6 border-l-4 border-red-500"}>
                        <h3 className="font-bold text-red-500 mb-4 flex gap-2"><Siren className="w-5 h-5" /> 當地緊急電話</h3>
                        <div className="text-3xl font-bold mb-2">{countryInfo.emergency}</div>
                        <p className="opacity-70 text-sm">遇緊急狀況請優先撥打。</p>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><Globe2 className="w-5 h-5" /> 駐當地辦事處 ({globalSettings.region})</h3>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                            <div className="font-bold">{emergencyInfoTitle}</div>
                            <div className="text-2xl font-mono my-2">{emergencyInfoContent}</div>
                            <div className="text-sm opacity-70 mt-1">地址與電話請查閱外交部網站。</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openSectionModal('import', 'budget')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                        <button onClick={() => openSectionModal('export', 'budget')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
                        <button onClick={() => handleExportPdf()} className="px-3 py-1 rounded-lg border border-indigo-400 text-xs text-indigo-200">匯出 PDF</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={glassCard(isDarkMode) + " p-6 text-center"}>
                            <div className="text-sm opacity-60 uppercase mb-1">總支出</div>
                            <div className="text-3xl font-bold font-mono text-indigo-500">${Math.round(debtInfo.totalSpent).toLocaleString()}</div>
                        </div>
                        <div className={glassCard(isDarkMode) + " p-6"}>
                            <h3 className="font-bold mb-2 flex gap-2"><RefreshCw className="w-4 h-4" /> 債務結算</h3>
                            <div className="space-y-2 text-sm">{Object.entries(debtInfo.balances).map(([name, bal]) => (<div key={name} className="flex justify-between border-b pb-1"><span>{name}</span><span className={bal > 0 ? 'text-green-500' : 'text-red-500'}>{bal > 0 ? `應收 $${Math.round(bal)}` : `應付 $${Math.round(Math.abs(bal))}`}</span></div>))}</div>
                        </div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-6"}>
                        <h3 className="font-bold mb-4 flex gap-2"><List className="w-4 h-4" /> 支出明細</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">{(trip.budget || []).map((b, i) => (<div key={i} className="flex justify-between p-2 hover:bg-white/5 rounded text-sm"><span>{b.name || b.desc} ({b.payer})</span><span className="font-mono opacity-70">{b.currency} {b.cost}</span></div>))}</div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-4 flex flex-col gap-3"}>
                        <h3 className="font-bold flex gap-2"><FileUp className="w-5 h-5" /> 收據 / 單據上傳</h3>
                        <input type="file" accept="image/*,application/pdf" onChange={e => handleReceiptUpload('budget', e.target.files?.[0])} className="text-xs" />
                        <p className="text-xs opacity-70">支援圖片或 PDF，檔案不會上傳，只供本機紀錄與 PDF 匯出。</p>
                        {receiptPreview.budget && (
                            <div className="border border-white/10 rounded-lg p-2 text-xs space-y-2">
                                <p className="opacity-70">預覽/下載：</p>
                                <a href={receiptPreview.budget} target="_blank" className="text-indigo-300 underline">點我開啟檔案</a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className={glassCard(isDarkMode) + " p-6 min-h-[500px] flex flex-col animate-fade-in"}>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2"><NotebookPen className="w-5 h-5" /> 備忘錄</h3><button onClick={() => { if (noteEdit && !isSimulation) updateDoc(doc(db, "trips", trip.id), { notes: tempNote }); setNoteEdit(!noteEdit); }} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm">{noteEdit ? '儲存' : '編輯'}</button></div>
                    {noteEdit ? <textarea className={`w-full flex-grow p-4 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={tempNote} onChange={e => setTempNote(e.target.value)} /> : <div className="w-full flex-grow p-4 rounded-xl border overflow-y-auto whitespace-pre-wrap opacity-80">{tempNote || "暫無筆記"}</div>}
                </div>
            )}

            {activeTab === 'shopping' && (
                <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openSectionModal('import', 'shopping')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                        <button onClick={() => openSectionModal('export', 'shopping')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={glassCard(isDarkMode) + " p-6"}>
                            <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><List className="w-5 h-5" /> 預計購買</h3><button onClick={() => { setAddType('shopping_plan'); setIsAddModal(true) }} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">+ 新增</button></div>
                            {(trip.shoppingList || []).filter(i => !i.bought).map((item, i) => (<div key={i} className="p-2 border rounded mb-2 flex justify-between"><span>{item.name}</span><span className="opacity-50 text-xs">預估: {item.estPrice}</span></div>))}
                        </div>
                        <div className={glassCard(isDarkMode) + " p-6"}>
                            <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><CheckSquare className="w-5 h-5" /> 已購入</h3><button onClick={() => { setAddType('shopping'); setIsAddModal(true) }} className="text-xs bg-green-500 text-white px-2 py-1 rounded">+ 記帳</button></div>
                            {(trip.budget || []).filter(i => i.category === 'shopping').map((item, i) => (<div key={i} className="p-2 border rounded mb-2 flex justify-between bg-green-500/10"><span>{item.name || item.desc}</span><span className="font-mono">{item.currency} {item.cost}</span></div>))}
                        </div>
                    </div>
                    <div className={glassCard(isDarkMode) + " p-4 flex flex-col gap-3"}>
                        <h3 className="font-bold flex gap-2"><FileUp className="w-5 h-5" /> 單據掃描 / 上傳</h3>
                        <input type="file" accept="image/*" onChange={e => handleReceiptUpload('shopping', e.target.files?.[0])} className="text-xs" />
                        <p className="text-xs opacity-70">限制：JPG/PNG，建議 2MB 內。檔案僅暫存於本機，可搭配 PDF 匯出。</p>
                        {receiptPreview.shopping && <img src={receiptPreview.shopping} alt="receipt" className="max-h-48 rounded-lg border border-white/10 object-contain" />}
                    </div>
                </div>
            )}

            <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user.uid, name: user.displayName }]} />
            <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
            <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
            <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />
            <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} />
            <SectionDataModal
                isOpen={Boolean(dataModalConfig)}
                onClose={closeSectionModal}
                mode={dataModalConfig?.mode}
                section={dataModalConfig?.section}
                data={dataModalConfig?.data}
                onConfirm={(text) => dataModalConfig?.mode === 'import' && handleSectionImport(dataModalConfig.section, text)}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

// --- Dashboard ---
const Dashboard = ({ onSelectTrip, user, isDarkMode, onViewChange, setGlobalBg, globalSettings, exchangeRates, weatherData }) => {
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
    const [selectedCountryImg, setSelectedCountryImg] = useState(DEFAULT_BG_IMAGE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [importMode, setImportMode] = useState('json');
    const [importInput, setImportInput] = useState('');
    const [importError, setImportError] = useState('');
    const [newCityInput, setNewCityInput] = useState('');
    const [selectedExportTrip, setSelectedExportTrip] = useState('');
    const currentLang = globalSettings?.lang || 'zh-TW';

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

    const handleAddCity = (cityName) => {
        const trimmed = (cityName || '').trim();
        if (!trimmed) return;
        setForm(prev => ({ ...prev, cities: Array.from(new Set([...prev.cities, trimmed])) }));
        setNewCityInput('');
    };

    const handleCreate = async () => {
        if (!form.name || form.countries.length === 0) return alert("請至少選擇一個國家");
        const primaryCountry = form.countries[0];
        const primaryCity = form.cities[0] || COUNTRIES_DATA[primaryCountry]?.cities?.[0] || '';
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
        setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' });
        setIsCreateModalOpen(false);
    };

    const handleImportSubmit = async () => {
        try {
            setImportError('');
            let payloads = [];
            if (importMode === 'json') {
                const parsed = JSON.parse(importInput);
                payloads = Array.isArray(parsed) ? parsed : [parsed];
            } else {
                const lines = importInput.trim().split(/\r?\n/).filter(Boolean);
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
            setImportInput('');
            setIsImportModalOpen(false);
            alert("匯入完成");
        } catch (err) {
            setImportError(err.message || "匯入失敗");
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
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 rounded-xl border border-indigo-500/40 text-sm">匯入</button>
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

            {/* Travel Hub (Fixed Grid Layout) */}
            <div>
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-3 mb-6">旅遊資訊中心</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridTemplateRows: 'repeat(3, minmax(230px, auto))' }}>
                    <div className="h-full min-h-0">
                        {/* Weather */}
                        <div className={`${glassCard(isDarkMode)} p-6 row-span-1 md:row-span-2 flex flex-col bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-white/5 h-full min-h-0`}>
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
                    <div className={`${glassCard(isDarkMode)} p-6 col-span-1 md:col-span-2 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Newspaper className="w-5 h-5" /> 旅遊快訊</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.news.map((n, i) => (<a key={i} href={n.url} target="_blank" className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition flex flex-col gap-1 group">
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-semibold">{n.title}</span>
                                <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-90" />
                            </div>
                            <div className="text-[11px] opacity-70">由 {n.provider} 提供 • {n.country}</div>
                        </a>))}</div>
                    </div>

                    {/* Hotels */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
                        <h4 className="font-bold flex items-center gap-2 mb-4"><Hotel className="w-5 h-5" /> 精選飯店</h4>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">{INFO_DB.hotels.map((h, i) => (<a key={i} href={h.url} target="_blank" className="flex gap-3 rounded-xl border border-white/10 p-3 hover:bg-white/5 transition">
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
                        </a>))}</div>
                    </div>

                    {/* Flights */}
                    <div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
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
                </div>
            </div>
            <CreateTripModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} form={form} onInputChange={handleInputChange} onMultiSelect={handleMultiSelect} onAddCity={handleAddCity} newCityInput={newCityInput} setNewCityInput={setNewCityInput} onSubmit={handleCreate} isDarkMode={isDarkMode} globalSettings={globalSettings} />
            <ImportTripModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} mode={importMode} setMode={setImportMode} inputValue={importInput} setInputValue={setImportInput} onImport={handleImportSubmit} isDarkMode={isDarkMode} errorMessage={importError} />
            <ExportTripModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} trips={trips} selectedTripId={selectedExportTrip} setSelectedTripId={setSelectedExportTrip} isDarkMode={isDarkMode} />
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
    const [notifications, setNotifications] = useState([
        { id: 'n1', title: "行程更新", message: "小明 新增了『東京迪士尼樂園』", time: "2025/12/01 09:05", url: "#", read: false },
        { id: 'n2', title: "匯入完成", message: "已匯入 3 個新行程，請檢查細節。", time: "2025/12/01 08:40", read: true }
    ]);

    // 新增：匯率與天氣狀態
    const [exchangeRates, setExchangeRates] = useState(null);
    const [weatherData, setWeatherData] = useState({}); // { [CityName]: weatherObj }

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

    const markNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

    if (!user) return <LandingPage onLogin={() => signInWithPopup(auth, googleProvider)} />;


    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-900'} font-sans flex flex-col`}>
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url(${globalBg})`, backgroundSize: 'cover' }}></div>
            <div className="relative z-10 flex-grow">
                {view !== 'tutorial' && <Header title="✈️ Travel Together" user={user} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => signOut(auth)} onBack={view !== 'dashboard' ? () => setView('dashboard') : null} onTutorialStart={() => setView('tutorial')} onViewChange={setView} onOpenUserSettings={() => setIsSettingsOpen(true)} onOpenVersion={() => setIsVersionOpen(true)} notifications={notifications} onRemoveNotification={removeNotification} onMarkNotificationsRead={markNotificationsRead} />}
                {view === 'dashboard' && <Dashboard user={user} onSelectTrip={(t) => { setSelectedTrip(t); setView('detail'); }} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg} globalSettings={globalSettings} exchangeRates={exchangeRates} weatherData={weatherData} />}
                {view === 'detail' && <TripDetail tripData={selectedTrip} user={user} isDarkMode={isDarkMode} setGlobalBg={setGlobalBg} isSimulation={false} globalSettings={globalSettings} onBack={() => setView('dashboard')} exchangeRates={exchangeRates} />}
                {view === 'tutorial' && <div className="h-screen flex flex-col"><div className="p-4 border-b flex gap-4"><button onClick={() => setView('dashboard')}><ChevronLeft /></button> 模擬模式 (東京範例)</div><div className="flex-grow overflow-y-auto"><TripDetail tripData={SIMULATION_DATA} user={user} isDarkMode={isDarkMode} setGlobalBg={() => { }} isSimulation={true} globalSettings={globalSettings} exchangeRates={exchangeRates} /></div></div>}
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