
import { TrainFront, BusFront } from 'lucide-react';

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

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

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

export const INSURANCE_SUGGESTIONS = { "HK": ["Prudential", "AIG", "Blue Cross"], "TW": ["富邦", "國泰", "南山"], "Global": ["World Nomads", "Allianz"] };

export const INSURANCE_RESOURCES = [
    { region: "HK", title: "富邦旅平險 Smart Go", url: "https://www.fubon.com/hk/insurance/" },
    { region: "TW", title: "國泰旅平險 24h 線上投保", url: "https://www.cathaylife.com.tw/" },
    { region: "Global", title: "World Nomads Explorer", url: "https://www.worldnomads.com" },
    { region: "Global", title: "Visit Japan Web 健康聲明", url: "https://vjw-lp.digital.go.jp/en/" }
];

export const AUTHOR_NAME = "Jamie Kwok";
export const APP_VERSION = "V0.16.1";


export const VERSION_HISTORY = [
    {
        version: "V0.16.1",
        date: "2025-12-17",
        changes: [
            "⚡️ 效能優化: 重構行程與檔案分頁組件",
            "🔧 ItineraryTab: 獨立組件化",
            "📂 FilesTab: 優化檔案管理介面",
            "📱 PWA: 更新緩存策略"
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
            "zh-TW": "1. TripDetail Tabs 抽取：7 個獨立組件\n2. App.jsx 減少 187 行\n3. Future Features 按版本整理\n4. Build 通過 + Git Push",
            "en": "1. TripDetail Tabs Extraction: 7 components\n2. App.jsx reduced 187 lines\n3. Future Features organized by version\n4. Build passed + Git Push"
        }
    },
    {
        ver: "V0.15.1-Beta",
        date: "2025-12-17",
        desc: {
            "zh-TW": "PWA + 組件重構 + 功能完善",
            "en": "PWA + Component Refactoring + Feature Polish"
        },
        details: {
            "zh-TW": "1. PWA 配置：manifest.json / service worker / 可安裝\n2. Modal 組件拆分：10 個獨立組件\n3. 多語言修復：.language 一致性\n4. Split Bill 驗證：分帳邏輯測試",
            "en": "1. PWA Setup: manifest.json / service worker / installable\n2. Modal Refactoring: 10 independent components\n3. Multi-language Fix: .language consistency\n4. Split Bill Validation: debt logic testing"
        }
    },
    {
        ver: "V0.14.0 - V0.14.2",
        date: "2025-12-16",
        desc: {
            "zh-TW": "AI 助手強化 + 匯出匯入系統",
            "en": "AI Assistant Enhancement + Export/Import System"
        },
        details: {
            "zh-TW": "• 多格式匯出：JSON / PDF / 圖片\n• 智能匯入：檔案自動解析\n• AI 分類百分比功能\n• 日期選擇器統一 DD/MM/YYYY\n• 天氣 API 真實數據替換",
            "en": "• Multi-format Export: JSON / PDF / Image\n• Smart Import: Auto file parsing\n• AI Category Percentage\n• Date Picker unified DD/MM/YYYY\n• Real Weather API integration"
        }
    },
    {
        ver: "V0.13.0",
        date: "2025-12-15",
        desc: {
            "zh-TW": "多語言支援 + 手機 UI 優化",
            "en": "Multi-language Support + Mobile UI"
        },
        details: {
            "zh-TW": "• 繁體中文 / 英文雙語\n• 日期格式本地化\n• 響應式設計優化\n• 觸控操作改進",
            "en": "• Traditional Chinese / English\n• Date format localization\n• Responsive design optimization\n• Touch operation improvements"
        }
    },
    {
        ver: "V0.12.0",
        date: "2025-11-20",
        desc: {
            "zh-TW": "分帳功能 + 分享行程連結",
            "en": "Split Bill + Trip Sharing"
        },
        details: {
            "zh-TW": "• 分享行程連結\n• 多人即時編輯\n• 自動計算分帳\n• 即時匯率轉換",
            "en": "• Share trip links\n• Multi-user real-time editing\n• Auto split bill calculation\n• Real-time exchange rate"
        }
    },
    {
        ver: "V0.11.0",
        date: "2025-10-10",
        desc: {
            "zh-TW": "核心功能完成 + PWA 模式",
            "en": "Core Features + PWA Mode"
        },
        details: {
            "zh-TW": "• 行程規劃 / 地圖導航 / 天氣顯示\n• 行李 / 必買清單 / 記帳本\n• PWA 模式：加到手機桌面",
            "en": "• Trip planning / Maps / Weather\n• Luggage / Shopping list / Expense tracker\n• PWA: Add to home screen"
        }
    },
    {
        ver: "V0.10.0",
        date: "2025-09-01",
        desc: {
            "zh-TW": "Beta 版開放測試",
            "en": "Beta Release"
        },
        details: {
            "zh-TW": "• 智能行程產生\n• Google Maps 整合\n• 每日拖曳調整\n• 登入後開始旅程",
            "en": "• Smart itinerary generation\n• Google Maps integration\n• Daily drag-and-drop\n• Login to start trip"
        }
    },
    {
        ver: "V0.9.1",
        date: "2025-12-15",
        desc: {
            "zh-TW": "版本號更新與小修復",
            "en": "Version Update & Minor Fixes"
        },
        details: {
            "zh-TW": "1. 更新版本號至 V0.9.1\n2. 修復小錯誤與改進穩定性",
            "en": "1. Updated version to V0.9.1\n2. Minor bug fixes and stability improvements"
        }
    },
    {
        ver: "V0.9.0",
        date: "2025-12-11",
        desc: {
            "zh-TW": "AI 智能領隊 & UI 全面重製",
            "en": "AI Smart Guide & UI Remaster"
        },
        details: {
            "zh-TW": "1. 全新 AI 領隊：支援各國行程規劃、交通分析與預算預估，介面更直觀。\n2. UI 升級：所有下拉選單與與彈窗採用玻璃擬態 (Glassmorphism) 設計。\n3. 優化：修復大量介面間距與對齊問題。",
            "en": "1. New AI Guide: Itinerary, transport & budget analysis.\n2. UI Upgrade: Glassmorphism for all menus.\n3. Polish: Fixed UI alignment issues."
        }
    },
    {
        ver: "V0.8.6 - V0.8.0",
        date: "2025-12-11",
        desc: {
            "zh-TW": "多項功能增強與錯誤修復",
            "en": "Multiple Feature Enhancements & Bug Fixes"
        },
        details: {
            "zh-TW": "• 修復多個 UI 錯誤與佈局問題\n• 新增文件中心與通知系統\n• 整合匯率與天氣 API\n• 優化載入畫面與動畫效果\n• 多項安全性更新與依賴套件升級",
            "en": "• Fixed various UI issues and layout problems\n• Added file center and notification system\n• Integrated exchange rate and weather APIs\n• Enhanced loading screens and animations\n• Security updates and dependency upgrades"
        }
    },
    {
        ver: "V0.7.0",
        date: "11/12/2024",
        desc: {
            "zh-TW": "社交分享與相片功能",
            "en": "Social Sharing & Photo Features"
        },
        details: {
            "zh-TW": "• 新增行程分享至社交媒體\n• 實作相片畫廊與多圖上傳\n• 強化安全性設定\n• 新增互動式教學",
            "en": "• Added trip sharing to social media\n• Implemented photo gallery with multi-upload\n• Enhanced security settings\n• Added interactive tutorial"
        }
    },
    {
        ver: "V0.6.x - V0.4.0",
        date: "11/2024 - 11/2025",
        desc: {
            "zh-TW": "早期版本與基礎功能",
            "en": "Early Versions & Core Features"
        },
        details: {
            "zh-TW": "• 初期版本開發與測試\n• 基礎行程規劃功能\n• 地圖與簽證資訊整合\n• 使用者介面優化",
            "en": "• Initial development and testing\n• Basic trip planning features\n• Map and visa information integration\n• User interface improvements"
        }
    },
];

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
};

export const OUTFIT_IMAGES = {
    "north": {
        "Sunny": "https://cdn-icons-png.flaticon.com/512/869/869869.png",
        "Rain": "https://cdn-icons-png.flaticon.com/512/1164/1164945.png"
    },
    "south": {
        "Sunny": "https://cdn-icons-png.flaticon.com/512/3222/3222800.png"
    },
    "hot": {
        "Sunny": "https://cdn-icons-png.flaticon.com/512/2917/2917242.png"
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
