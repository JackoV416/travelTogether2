
import {
    TrainFront, BusFront, Car, Route
} from 'lucide-react';

// --- Versioning & Metadata ---
export const AUTHOR_NAME = "Jamie Kwok";
export const APP_VERSION = "V0.21.2";

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const VERSION_HISTORY = [
    {
        ver: "V0.21.2",
        date: "2025-12-19",
        desc: {
            "zh-TW": "功能穩定化",
            "en": "Feature Stabilization"
        },
        details: {
            "zh-TW": "• 暫時關閉 AI 推薦功能 (V0.22 重新開放)\n• 暫時關閉匯入功能 (V0.22 重新開放)\n• 暫時關閉 Map 檢視功能 (V0.22 重新開放)\n• 確保核心功能穩定運作",
            "en": "• Temporarily disabled AI features (re-enable in V0.22)\n• Temporarily disabled import features (re-enable in V0.22)\n• Temporarily disabled Map view (re-enable in V0.22)\n• Ensuring core functionality stability"
        }
    },
    {
        ver: "V0.21.1",
        date: "2025-12-19",
        desc: {
            "zh-TW": "匯入功能統一 & Bug 修復",
            "en": "Import Consolidation & Bug Fixes"
        },
        details: {
            "zh-TW": "• SmartImportModal 統一入口：整合 5 種匯入方式 (截圖/單據/回憶/JSON/CSV)\n• 酒店數據擴充：新增大阪 4 間酒店\n• 移除 Mock 數據：匯入功能不再顯示假資料\n• 購物類別優化：6 類精準分類\n• 交通選項加入自駕租車",
            "en": "• SmartImportModal: Unified 5 import types (Image/Receipt/Memory/JSON/CSV)\n• Osaka Hotels: Added 4 hotels\n• Removed Mock Data: Import shows real file info only\n• Shopping Categories: 6 refined categories\n• Transport: Added self-driving option"
        }
    },
    {
        ver: "V0.21.0",
        date: "2025-12-19",
        desc: {
            "zh-TW": "AI 實體化解析 & 偏好系統 2.0",
            "en": "AI Vision Parsing & Preferences 2.0"
        },
        details: {
            "zh-TW": "• 實體 Vision 解析：不再是 Mock 數據，支援機票與單據自動識別\n• 互動式 AI 偏好：新增「強度矩陣」，精準控制行程風格\n• 版本同步優化：跨系統版本號自動一致化",
            "en": "• Real Vision Parsing: Real OCR for tickets & bills\n• Interactive AI Preferences: New intensity matrix for style control\n• Version Sync: Automated cross-system version consistency"
        }
    },
    {
        ver: "V0.20.2",
        date: "2025-12-19",
        desc: {
            "zh-TW": "V0.20 全面進化總結 (Phase 3 & 4)",
            "en": "V0.20 Grand Evolution (Phase 3 & 4)"
        },
        details: {
            "zh-TW": "• AI Engine 2.0：實作時間桶 (Time Buckets) 邏輯，徹底解決早午晚行程錯亂問題。\n• 運輸數據校正：區分地鐵與巴士，提供城市專屬真實車費與預計時間。\n• 智能打包擴充：根據行程活動 (行山/沙灘/高級餐飲) 自動推薦 6 大分類裝備。\n• UI 拋光：AddActivityModal 動態 Placeholder、README Premium 重製、彈窗一致性校正。\n• 穩定性：Weather API Circuit Breaker 與 429 退避邏輯，確保極端情況不崩潰。",
            "en": "• AI Engine 2.0: Implemented Time Buckets logic to fix scheduling conflicts.\n• Transport Calibration: Metro/Bus distinction with real-world fares and durations.\n• Smart Packing: Activity-aware items (Hiking/Beach/Dining) across 6 categories.\n• UI Polish: Dynamic Modal Placeholders, Premium README remaster, and consistency fixes.\n• Stability: Weather API Circuit Breaker & 429 backoff logic integration."
        }
    },
    {
        ver: "V0.20.1",
        date: "2025-12-18",
        desc: {
            "zh-TW": "AI 數據大爆發 & 行李清單進化",
            "en": "AI Data Expansion & Smart Packing"
        },
        details: {
            "zh-TW": "• 數據庫擴充：MOCK_DB 新增 60+ 景點美食，長行程不再重覆\n• 購物清單：四大城市類別全面加碼，藥妝時尚齊全\n• 智能行李：根據行山/游水/米芝蓮活動自動推薦裝備\n• 邏輯優化：修正去重與步行檢測，價格對齊在地水平",
            "en": "• Database Expansion: 60+ new spots in MOCK_DB for variety\n• Shopping Boost: More items in Cosmetics/Fashion/Electronics\n• Activity Packing: Smart gear suggestions for Hiking/Pool/Michelin\n• Logic Refinement: Fixed duplication & localized prices"
        }
    },
    {
        ver: "V0.19.0",
        date: "2025-12-18",
        desc: {
            "zh-TW": "AI 經驗豐富的領隊 V19",
            "en": "AI Expert Guide V19"
        },
        details: {
            "zh-TW": "• 豐富 AI 洞察：景點歷史背景、購物必買理由全面加入\n• 雙幣顯示：行程卡片同步顯示當地貨幣與本地貨幣 ($ HKD)\n• 智能合併：AI 建議不再覆蓋用戶手動行程，優先尊重用戶規劃\n• UI 優化：空行程介面 AI 入口搬移，視覺更直觀",
            "en": "• Rich AI Insights: Historical context & shopping rationales\n• Dual Currency: Card display for both local & destination currencies\n• Intelligent Merge: AI suggestions respect user-created plans\n• UI Polish: Entry points moved to empty states for better UX"
        }
    },
    {
        ver: "V0.18.0",
        date: "2025-12-18",
        desc: {
            "zh-TW": "AI Packing & UI 優化",
            "en": "AI Packing & UI Refinement"
        },
        details: {
            "zh-TW": "• 智能行李清單：AI 生成、分類管理與清空功能\n• Add Modal 升級：自動識別行李/行程模式，隱藏無關欄位\n• 搜尋欄優化：深色模式全面適配，文字清晰可見\n• 天氣系統：精確顯示 '--' 佔位符，避免假數據誤導\n• 模擬模式增強：支援行李項目即時互動測試",
            "en": "• Smart Packing: AI generation, categorization & clear all\n• Enhanced Add Modal: Auto-switch modes, tailored fields\n• Search UI: Dark mode polish for better visibility\n• Weather System: Accurate '--' placeholders\n• Simulation Mode: Interactive packing list for tutorials"
        }
    },
    {
        ver: "V0.17.0",
        date: "2025-12-18",
        desc: {
            "zh-TW": "AI 2.0 基礎 & 架構重構",
            "en": "AI 2.0 Foundation & Refactoring"
        },
        details: {
            "zh-TW": "• AI 偏好設定：支援歷史、美食、冒險等多種興趣選擇\n• 雲端同步：用戶設置與偏好自動備份至 Firebase\n• Code Splitting：TripDetailContent 懶加載，提升首屏速度\n• 架構優化：大幅拆分 App.jsx，模組化管理",
            "en": "• AI Preferences: Personalized suggestions based on interests\n• Cloud Sync: Settings & preferences synced to Firebase\n• Code Splitting: Lazy loading for Trip Details\n• Architecture: Modularized App.jsx for better maintainability"
        }
    }
];

// --- Core Data Structures ---

export const CITY_COORDS = {
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

export const CURRENCIES = {
    "HKD": { rate: 1, label: "HKD", symbol: "$" },
    "TWD": { rate: 4.15, label: "TWD", symbol: "NT$" },
    "JPY": { rate: 19.8, label: "JPY", symbol: "¥" },
    "KRW": { rate: 178, label: "KRW", symbol: "₩" },
    "USD": { rate: 0.128, label: "USD", symbol: "US$" },
    "EUR": { rate: 0.118, label: "EUR", symbol: "€" },
    "GBP": { rate: 0.101, label: "GBP", symbol: "£" },
    "THB": { rate: 4.65, label: "THB", symbol: "฿" },
};

export const TIMEZONES = {
    "HK": { offset: 8, label: "香港" }, "TW": { offset: 8, label: "台北" },
    "JP": { offset: 9, label: "東京" }, "KR": { offset: 9, label: "首爾" },
    "TH": { offset: 7, label: "曼谷" }, "UK": { offset: 0, label: "倫敦" },
    "FR": { offset: 1, label: "巴黎" }, "US_NY": { offset: -5, label: "紐約" },
    "AU": { offset: 10, label: "雪梨" }
};

export const COUNTRIES_DATA = {
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

// Detailed Emergency Info by Country (for EmergencyTab)
export const EMERGENCY_DETAILS_DB = {
    "Japan (日本)": {
        police: "110",
        fire: "119",
        ambulance: "119",
        consulate: {
            name: "駐日經濟文化代表處（東京）",
            address: "東京都港區白金台5-20-2",
            phone: "+81-3-3280-7811",
            emergencyHotline: "+81-90-4746-6065",
            hours: "週一至週五 09:00-12:00, 14:00-18:00"
        },
        hospitals: [
            { name: "聖路加國際醫院 (中/英語)", address: "東京都中央區明石町9-1", phone: "+81-3-3541-5151" },
            { name: "東京慈惠會醫科大學附屬醫院", address: "東京都港區西新橋3-25-8", phone: "+81-3-3433-1111" }
        ],
        tips: ["報警說「Kotsu-jiko」(交通事故) 或「Dorobo」(小偷)", "醫院不收刷卡，帶現金", "下載「Safety Tips」App"]
    },
    "Korea (韓國)": {
        police: "112",
        fire: "119",
        ambulance: "119",
        consulate: {
            name: "駐韓國代表處（首爾）",
            address: "首爾特別市鐘路區世宗大路149 光化門大廈6樓",
            phone: "+82-2-399-2780",
            emergencyHotline: "+82-10-9080-2761",
            hours: "週一至週五 09:00-12:00, 13:30-18:00"
        },
        hospitals: [
            { name: "新村延世大學附設醫院 (中/英)", address: "首爾市西大門區延世路50-1", phone: "+82-2-2228-5800" },
            { name: "首爾大學醫院", address: "首爾市鐘路區大學路101", phone: "+82-2-2072-2114" }
        ],
        tips: ["外國人急難求助 1345（多語言服務）", "地鐵站有急救箱", "藥局營業至晚上10點"]
    },
    "Thailand (泰國)": {
        police: "191",
        fire: "199",
        ambulance: "1669",
        consulate: {
            name: "駐泰國代表處（曼谷）",
            address: "曼谷市Wireless路40巷20號Empire Tower 1",
            phone: "+66-2-670-0200",
            emergencyHotline: "+66-81-666-4006",
            hours: "週一至週五 09:00-12:00, 13:30-17:30"
        },
        hospitals: [
            { name: "曼谷醫院 Bangkok Hospital (中/英)", address: "2 Soi Soonvijai 7, New Petchburi Road", phone: "+66-2-310-3000" },
            { name: "BNH 醫院", address: "9/1 Convent Road, Silom", phone: "+66-2-686-2700" }
        ],
        tips: ["旅遊警察熱線 1155（24小時）", "機車意外險很重要", "避免買路邊藥品"]
    },
    "Taiwan (台灣)": {
        police: "110",
        fire: "119",
        ambulance: "119",
        consulate: {
            name: "（本地無需代表處）",
            address: "-",
            phone: "1999 市民專線",
            emergencyHotline: "110 / 119",
            hours: "24小時"
        },
        hospitals: [
            { name: "台大醫院", address: "台北市中正區中山南路7號", phone: "+886-2-2312-3456" },
            { name: "台北榮民總醫院", address: "台北市北投區石牌路二段201號", phone: "+886-2-2871-2121" }
        ],
        tips: ["全民健保涵蓋急診", "藥局很常見，可諮詢藥師", "7-11 有 ibon 可叫計程車"]
    },
    "Singapore (新加坡)": {
        police: "999",
        fire: "995",
        ambulance: "995",
        consulate: {
            name: "駐新加坡代表處",
            address: "460 Alexandra Road #23-00 PSA Building",
            phone: "+65-6500-0100",
            emergencyHotline: "+65-9638-9436",
            hours: "週一至週五 09:00-17:00"
        },
        hospitals: [
            { name: "新加坡中央醫院 (SGH)", address: "Outram Road", phone: "+65-6222-3322" },
            { name: "萊佛士醫院 Raffles Hospital", address: "585 North Bridge Road", phone: "+65-6311-1111" }
        ],
        tips: ["公立醫院較便宜", "亂丟垃圾/口香糖會被罰款", "Grab 叫車很方便"]
    },
    "United States (美國)": {
        police: "911",
        fire: "911",
        ambulance: "911",
        consulate: {
            name: "駐美國代表處（華盛頓）",
            address: "4201 Wisconsin Avenue, NW, Washington, DC 20016",
            phone: "+1-202-895-1800",
            emergencyHotline: "+1-202-669-0180",
            hours: "週一至週五 09:00-17:00"
        },
        hospitals: [
            { name: "Mass General Hospital (波士頓)", address: "55 Fruit Street, Boston, MA", phone: "+1-617-726-2000" },
            { name: "UCLA Medical Center (洛杉磯)", address: "757 Westwood Plaza, LA, CA", phone: "+1-310-825-9111" }
        ],
        tips: ["醫療費極高，務必買保險", "緊急室 ER 24小時開放", "Uber/Lyft 可叫車去醫院"]
    }
};

export const LANGUAGE_OPTIONS = {
    "zh-TW": { label: "繁體中文" },
    "en": { label: "English" }
};


export const COUNTRY_TRANSLATIONS = {
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

export const CITY_TRANSLATIONS = {
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

export const HOLIDAYS_BY_REGION = {
    "HK": { "01-01": "元旦", "01-29": "農曆新年", "01-30": "農曆新年", "01-31": "農曆新年", "04-04": "清明節", "04-18": "耶穌受難節", "04-19": "耶穌受難節翌日", "04-21": "復活節", "05-01": "勞動節", "05-05": "佛誕", "05-31": "端午節", "07-01": "回歸紀念日", "10-01": "國慶日", "10-07": "中秋節翌日(預測)", "10-29": "重陽節", "12-25": "聖誕節", "12-26": "拆禮物日" },
    "TW": { "01-01": "元旦", "01-28": "除夕", "01-29": "春節", "01-30": "春節", "01-31": "春節", "02-28": "和平紀念日", "04-04": "兒童節", "04-05": "清明節", "05-31": "端午節", "10-06": "中秋節", "10-10": "國慶日" },
    "JP": { "01-01": "元日", "01-13": "成人之日", "02-11": "建國記念日", "02-23": "天皇誕生日", "02-24": "振替休日", "03-20": "春分", "04-29": "昭和之日", "05-03": "憲法記念日", "05-04": "綠之日", "05-05": "兒童之日", "05-06": "振替休日", "07-21": "海之日", "08-11": "山之日", "09-15": "敬老之日", "09-23": "秋分", "10-13": "體育之日", "11-03": "文化之日", "11-23": "勤勞感謝日" },
    "Global": { "01-01": "New Year", "12-25": "Christmas" }
};

export const INFO_DB = {
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
        { name: "The Fullerton Bay", country: "Singapore", price: "$3200", star: 4.9, img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400", url: "https://www.fullertonhotels.com", details: "濱海灣景 • 早餐" },
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

export const TRAVEL_ARTICLES = [
    { title: "東京交通局官方旅遊建議", provider: "Toei", url: "https://www.kotsu.metro.tokyo.jp/eng/guide/" },
    { title: "JNTO 旅行安全資訊", provider: "JNTO", url: "https://www.japan.travel/en/plan/safety-tips/" },
    { title: "Visit Japan Web 官方教學", provider: "Digital Agency Japan", url: "https://vjw-lp.digital.go.jp/en/" }
];

export const AIRLINE_LOGOS = {
    "EVA Air": "https://www.google.com/s2/favicons?domain=www.evaair.com&sz=64",
    "Cathay": "https://www.google.com/s2/favicons?domain=www.cathaypacific.com&sz=64",
    "ANA": "https://www.google.com/s2/favicons?domain=www.ana.co.jp&sz=64",
    "JAL": "https://www.google.com/s2/favicons?domain=www.jal.com&sz=64",
    "China Airlines": "https://www.google.com/s2/favicons?domain=www.china-airlines.com&sz=64",
    "Swiss": "https://www.google.com/s2/favicons?domain=www.swiss.com&sz=64"
};

export const TRANSPORT_ICONS = {
    metro: { label: "地鐵", icon: TrainFront, color: "text-indigo-500" },
    bus: { label: "巴士", icon: BusFront, color: "text-emerald-500" },
    car: { label: "自駕", icon: Car, color: "text-amber-500" },
    walk: { label: "步行", icon: Route, color: "text-blue-500" }
};

export const OUTFIT_IMAGES = {
    hot: "https://img.icons8.com/color/48/flip-flops.png",
    south: "https://img.icons8.com/color/48/t-shirt.png",
    north: "https://img.icons8.com/color/48/coat.png"
};

export const INSURANCE_RESOURCES = [
    { region: "HK", title: "富邦旅平險 Smart Go", url: "https://www.fubon.com/hk/insurance/" },
    { region: "TW", title: "國泰旅平險 24h 線上投保", url: "https://www.cathaylife.com.tw/" },
    { region: "Global", title: "World Nomads Explorer", url: "https://www.worldnomads.com" },
    { region: "Global", title: "Visit Japan Web 健康聲明", url: "https://vjw-lp.digital.go.jp/en/" }
];

export const INSURANCE_SUGGESTIONS = {
    "HK": ["Prudential", "AIG", "Blue Cross"],
    "TW": ["富邦", "國泰", "南山"],
    "Global": ["World Nomads", "Allianz"]
};

export const SIMULATION_DATA = {
    id: "sim-tokyo-2025",
    name: "🇯🇵 東京冬日爆食之旅 2025",
    city: "Tokyo",
    country: "Japan (日本)",
    startDate: "2025-12-24",
    endDate: "2025-12-29",
    members: [
        { id: "sim-user-1", name: "Alex", role: "owner" },
        { id: "sim-user-2", name: "Travel Buddy", role: "editor" }
    ],
    itinerary: {
        "2025-12-24": [
            { id: "it-1", time: "09:00", name: "前往成田機場 (JL736)", type: "flight", cost: 4200, currency: "HKD", details: { location: "HKG -> NRT", desc: "國泰航空豪華版" }, smartTag: "✈️ 已確認" },
            { id: "it-2", time: "15:00", name: "新宿格拉斯麗酒店 Check-in", type: "hotel", cost: 0, currency: "JPY", details: { location: "新宿", desc: "哥吉拉主題房" }, smartTag: "🏨 必住" },
            { id: "it-1-1", time: "16:30", name: "歌舞伎町一番街散策", type: "spot", cost: 0, currency: "JPY", details: { location: "新宿", desc: "霓虹燈下的繁華街區" } },
            { id: "it-3", time: "18:30", name: "六本木之丘聖誕燈飾", type: "spot", cost: 2000, currency: "JPY", details: { location: "Roppongi Hills", desc: "絕美聖誕燈火" } },
            { id: "it-4", time: "20:30", name: "AFURI 阿夫利拉麵", type: "food", cost: 1200, currency: "JPY", details: { location: "六本木店", desc: "柚子鹽味拉麵首選" }, smartTag: "🍜 必吃" }
        ],
        "2025-12-25": [
            { id: "it-5", time: "10:00", name: "築地場外市場", type: "food", cost: 5000, currency: "JPY", details: { location: "Tsukiji", desc: "海鮮丼大餐" } },
            { id: "it-5-1", time: "12:00", name: "銀座東急廣場 購物", type: "shopping", cost: 10000, currency: "JPY", details: { location: "Ginza", desc: "設計師品牌與咖啡店" } },
            { id: "it-6", time: "14:00", name: "淺草寺 / 雷門", type: "spot", cost: 0, currency: "JPY", details: { location: "Asakusa", desc: "求一支好籤" } },
            { id: "it-6-1", time: "15:30", name: "隅田川遊船", type: "transport", cost: 1600, currency: "JPY", details: { location: "Asakusa Pier", desc: "水上展望東京晴空塔" } },
            { id: "it-7", time: "16:30", name: "秋葉原電器街", type: "shopping", cost: 30000, currency: "JPY", details: { location: "Akihabara", desc: "尋找復古遊戲機" }, smartTag: "🎮 玩家天堂" }
        ],
        "2025-12-26": [
            { id: "it-8", time: "09:00", name: "富士山河口湖一日遊", type: "transport", cost: 8400, currency: "JPY", details: { location: "河口湖", desc: "富士迴遊特急來回" }, smartTag: "🗻 必看" },
            { id: "it-8-1", time: "12:00", name: "不動茶屋 (鳳凰店)", type: "food", cost: 1800, currency: "JPY", details: { location: "河口湖", desc: "當地特色味噌麵" } },
            { id: "it-9", time: "18:00", name: "忍野八海", type: "spot", cost: 0, currency: "JPY", details: { location: "Oshino Hakkai", desc: "清澈見底的池水" } },
            { id: "it-9-1", time: "21:00", name: "新宿居酒屋小路", type: "food", cost: 3500, currency: "JPY", details: { location: "Omoide Yokocho", desc: "體驗在地深夜食堂" } }
        ],
        "2025-12-27": [
            { id: "it-10", time: "10:00", name: "TeamLab Borderless 麻布台之丘", type: "spot", cost: 4200, currency: "JPY", details: { location: "Azabudai Hills", desc: "沉浸式光影藝術" }, smartTag: "📸 必打卡" },
            { id: "it-10-1", time: "12:30", name: "藍瓶咖啡 麻布台之丘店", type: "food", cost: 800, currency: "JPY", details: { location: "Azabudai Hills", desc: "享受寧靜午後" } },
            { id: "it-11", time: "13:30", name: "原宿竹下通漫步", type: "shopping", cost: 5000, currency: "JPY", details: { location: "Harajuku", desc: "體驗日本流行文化" } },
            { id: "it-11-1", time: "16:00", name: "明治神宮參拜", type: "spot", cost: 0, currency: "JPY", details: { location: "Harajuku", desc: "繁華市中心的一抹寧靜" } },
            { id: "it-12", time: "19:00", name: "澀谷 Shibuya Sky", type: "spot", cost: 2500, currency: "JPY", details: { location: "Shibuya", desc: "俯瞰東京最美夜景" }, smartTag: "🌆 浪漫推薦" }
        ],
        "2025-12-28": [
            { id: "it-13", time: "09:00", name: "前往東京迪士尼樂園", type: "transport", cost: 800, currency: "JPY", details: { location: "JR 舞濱站", desc: "全日狂歡開始" } },
            { id: "it-13-1", time: "10:00", name: "東京迪士尼樂園", type: "spot", cost: 10900, currency: "JPY", details: { location: "Maihama", desc: "夢想與魔法的王國" }, smartTag: "🏰 全日行程" },
            { id: "it-14", time: "20:00", name: "伊勢丹百貨 B1 熟食採買", type: "food", cost: 3000, currency: "JPY", details: { location: "Shinjuku", desc: "回飯店享用豪華晚餐" } }
        ],
        "2025-12-29": [
            { id: "it-15", time: "10:00", name: "最後採買：唐吉訶德 新宿店", type: "shopping", cost: 15000, currency: "JPY", details: { location: "Shinjuku", desc: "藥妝、零食最後衝刺" } },
            { id: "it-15-1", time: "12:30", name: "松屋 牛丼 (快速午餐)", type: "food", cost: 650, currency: "JPY", details: { location: "新宿站前", desc: "收拾心情準備回程" } },
            { id: "it-16", time: "14:00", name: "成田快線 N'EX 前往機場", type: "transport", cost: 3200, currency: "JPY", details: { location: "Shinjuku Station", desc: "舒適快速直達機場" } },
            { id: "it-17", time: "18:20", name: "搭機返程 (JL735)", type: "flight", cost: 0, currency: "HKD", details: { location: "NRT -> HKG", desc: "帶著滿滿的回憶回家" }, smartTag: "✈️ 已確認" }
        ]
    },
    packingList: [
        { id: "pkg-1", name: "護照與簽證", category: "documents", checked: true },
        { id: "pkg-2", name: "日幣現金 (10萬JPY)", category: "documents", checked: true },
        { id: "pkg-3", name: "保暖厚大衣", category: "clothes", checked: false, aiSuggested: true },
        { id: "pkg-4", name: "手機充電器 / 行動電源", category: "electronics", checked: true },
        { id: "pkg-5", name: "休閒步行鞋", category: "clothes", checked: true },
        { id: "pkg-6", name: "Heattech 發熱衣", category: "clothes", checked: false, aiSuggested: true },
        { id: "pkg-7", name: "維他命 / 常用藥物", category: "medicine", checked: false }
    ],
    shoppingList: [
        { id: "shp-1", name: "Tokyo Banana 伴手禮", estPrice: "JPY 1500", desc: "限定口味", bought: false, aiSuggested: true },
        { id: "shp-2", name: "Uniqlo 本地版發熱衣", estPrice: "JPY 990", desc: "比香港便宜超多", bought: false },
        { id: "shp-3", name: "EVE 止痛藥", estPrice: "JPY 800", desc: "囤貨必備", bought: false, aiSuggested: true }
    ],
    budget: [
        { id: "b-1", name: "機票總計", cost: 8400, currency: "HKD", category: "flight", payer: "Alex", splitType: "group" },
        { id: "b-2", name: "第一晚燒肉", cost: 12000, currency: "JPY", category: "food", payer: "Alex", splitType: "group" }
    ],
    notes: "### 旅遊備忘錄\n- 聖誕節期間很多餐廳需要提前預約。\n- 記得帶足夠衣服，晚上只有 5 度左右。\n- Visit Japan Web 要預先填好 QR Code。",
    insurance: {
        "sim-user-1": { provider: "AIG 旅安保", policyNo: "AIG-2025-001", phone: "+852 1234 5678", notes: "涵蓋滑雪活動" }
    },
    visa: {
        "sim-user-1": { status: "printed", number: "HKG-PASS-123", expiry: "2029-12-24", needsPrint: false }
    },
    emergency: {
        police: "110",
        fire: "119",
        ambulance: "119",
        consulate: {
            name: "駐日經濟文化代表處（東京）",
            address: "東京都港區白金台5-20-2",
            phone: "+81-3-3280-7811",
            emergencyHotline: "+81-90-4746-6065",
            hours: "週一至週五 09:00-12:00, 14:00-18:00"
        },
        hospitals: [
            { name: "聖路加國際醫院 (中/英語對應)", address: "東京都中央區明石町9-1", phone: "+81-3-3541-5151" },
            { name: "東京慈惠會醫科大學附屬醫院", address: "東京都港區西新橋3-25-8", phone: "+81-3-3433-1111" }
        ],
        tips: [
            "日本報警要說「Kotsu-jiko」(交通事故) 或「Dorobo」(小偷)",
            "醫院不收刷卡，要帶現金",
            "語言不通可用 Google 翻譯或下載「Safety Tips」App"
        ]
    }
};


export const TAB_LABELS = {
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
