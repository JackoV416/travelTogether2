import {
    TrainFront, BusFront, Car, Route
} from 'lucide-react';

// --- Versioning & Metadata ---
export const APP_AUTHOR = "Jamie Kwok";
export const ADMIN_EMAILS = ["jamiekwok416@gmail.com", "test@test.com"]; // User can add their email here
export const APP_VERSION = 'V0.27.0-PreRelease';
export const APP_VERSION_TAG = 'Pre-Revamp Milestone';
export const APP_LAST_UPDATE = '2025-12-20';

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const VERSION_HISTORY = [
    {
        ver: "V0.27.0-PreRelease",
        tag: "Milestone Consolidation",
        date: "2025-12-20",
        desc: {
            "zh-TW": "2025 年終里程碑：安全性、後台管理與架構重構總結",
            "en": "2025 Year-End Milestone: Security, Admin & Architecture"
        },
        details: {
            "zh-TW": [
                "🚀 架構重構 (Architecture): Dashboard 模組化拆分，提升效能與維護性 (V0.25.1)",
                "🛡️ 安全升級 (Security): 實裝 Autoban 智能封鎖系統與 Rate Limiting (V0.26.1)",
                "👮‍♂️ 管理後台 (Admin Panel): 全新分頁設計 (Users/Admins/Feedback)，支援一鍵封鎖與動態權限管理 (V0.26.0)",
                "💬 回饋系統 (Feedback): 支援圖文/影片回報，即時管理員通知 (V0.25.2)",
                "💾 資料持久化 (Persistence): 用戶資料自動同步 Firestore，防止資料遺失"
            ],
            "en": [
                "🚀 Architecture: Modular Dashboard refactor for performance (V0.25.1)",
                "🛡️ Security: Autoban system w/ Rate Limiting & Abuse detection (V0.26.1)",
                "👮‍♂️ Admin Console: New Tabs (Users/Admins), One-click Ban & Dynamic Permissions (V0.26.0)",
                "💬 Feedback System: Rich media support & Real-time admin alerts (V0.25.2)",
                "💾 Persistence: Auto-sync user data to Firestore"
            ]
        }
    },
    {
        ver: "V0.25.2",
        tag: "Feedback & Stability",
        date: "2025-12-20",
        desc: {
            "zh-TW": "意見回饋系統 & 足跡修復",
            "en": "Feedback System & Footprints Fix"
        },
        details: {
            "zh-TW": [
                "🐛 Bug Fix: 修復足跡 (Journal) 頁面日期解析錯誤導致的崩潰",
                "✨ 新功能：新增意見回饋與 Bug 匯報系統 (Feedback System)",
                "🗺️ 假期檢查：驗證並優化日本及本地假期顯示邏輯",
                "📝 UI 優化：調整 TripDetail 頁籤排序"
            ],
            "en": [
                "🐛 Bug Fix: Resolved crash in Journal tab due to invalid date parsing",
                "✨ New Feature: Added comprehensive Feedback & Bug Reporting System",
                "🗺️ Holiday Check: Verified Japan/Local holiday logic",
                "📝 UI Polish: Reordered TripDetail tabs"
            ]
        }
    },
    {
        ver: "V0.25.1",
        tag: "Optimization & Resilience",
        date: "2025-12-19",
        desc: {
            "zh-TW": "Dashboard 結構深度優化 + AI 高可用架構",
            "en": "Dashboard Modularization & AI Resilience"
        },
        details: {
            "zh-TW": [
                "🏗️ Dashboard 重構：大幅拆分為組件化架構，減少主程序負荷",
                "🔑 AI 多 Key 輪播：支援 5 個 API Key 自動切換，避免 Quota 限制",
                "🛡️ 每日限額：每用戶每日 20 次 AI 限額保護",
                "🐛 Bug Fix: 修復 V0.25 時區設置錯誤及組件引用 BUG",
                "🚀 性能提升：移除 redundant state，數據加載更流暢"
            ],
            "en": [
                "🏗️ Dashboard Refactor: Deep modularization for better performance",
                "🔑 AI Multi-Key Rotation: 5 API Keys auto-scaling",
                "🛡️ Daily Limits: 20 AI calls per user limit",
                "🐛 Bug Fix: Resolved V0.25 Timezone error and import analysis bugs",
                "🚀 Performance: State optimization and faster data fetching"
            ]
        }
    },
    {
        ver: "V0.25.0",
        tag: "Mobile First",
        date: "2025-02-28",
        desc: {
            "zh-TW": "Mobile First - PWA 離線模式與手機介面革新",
            "en": "Mobile First - PWA Offline Mode & Mobile UI Overhaul"
        },
        details: {
            "zh-TW": "• 📱 PWA 支援：可安裝至手機主畫面，支援離線瀏覽行程。\n• 👆 手指友善：全新底部導航欄 (Itinerary/Packing/Budget)，單手操作更順手。\n• 🛡️ Error Boundary：新增防閃退保護網，提升穩定性。\n• 🚀 效能優化：靜態資源快取策略，載入速度提升。",
            "en": "• 📱 PWA Support: Installable App with offline capability.\n• 👆 Mobile UI: New Bottom Navigation for one-handed use.\n• 🛡️ Stability: Added Error Boundaries to prevent crashes.\n• 🚀 Performance: Optimized asset caching."
        },
        changes: [
            "Feat: PWA Manifest & Service Worker",
            "UI: Mobile Bottom Navigation Bar",
            "Feat: Error Boundary Implementation",
            "Meta: Viewport user-scalable=no"
        ]
    },
    {
        ver: "V0.24.1",
        tag: "Osaka Express Hotfix",
        date: "2025-02-28",
        desc: {
            "zh-TW": "修復 AI 摘要閃退及 API 限額問題",
            "en": "Fix AI Summary crash & API Quota handling"
        },
        details: {
            "zh-TW": "• 🐛 修復 `Loader2` 導致的白畫面閃退問題。\n• 🛡️ 新增 Gemini API 限額 (429) 保護，避免系統崩潰。\n• ⚡ 優化錯誤處理流程。",
            "en": "• 🐛 Fixed `Loader2` ReferenceError crash.\n• 🛡️ Added graceful handling for Gemini API 429 Quota errors.\n• ⚡ Optimized error fallback UI."
        },
        changes: [
            "Fix: Loader2 ReferenceError in TripDetailContent",
            "Fix: Graceful handling of Gemini 429/503 errors"
        ]
    },
    {
        ver: "V0.24.0",
        tag: "Osaka Express",
        date: "2025-02-28",
        desc: {
            "zh-TW": "Osaka Express - 智能交通與極致 UI 體驗",
            "en": "Osaka Express - Smart Transport & Premium UI"
        },
        details: {
            "zh-TW": "• 🚅 智能交通格式：長途車程 (>60分) 自動轉為「X小時X分」，一目了然。\n• 🌤️ 天氣 2.0：分時段 (早/午/晚) 天氣預報及洋蔥式穿搭建議，出門更安心。\n• 🎨 頂級 UI：Packing/Shopping/Budget/Files 四大分頁視覺全面升頻，加入動態進度條及 Glassmorphism 效果。\n• 🤖 AI 靈感升級：根據目的地 (如東京/大阪) 生成在地化景點及美食建議。",
            "en": "• 🚅 Smart Transport: Auto-formats durations >60m to 'Xh Ym' for better readability.\n• 🌤️ Weather 2.0: Tiered morning/afternoon/night forecasts with specific clothing advice.\n• 🎨 Premium UI: Complete visual overhaul of Packing, Shopping, Budget, and Files tabs with glassmorphism.\n• 🤖 Contextual AI: 'AI Inspiration' now generates destination-specific suggestions (e.g., Tokyo/Osaka spots)."
        },
        changes: [
            "Transport: Duration format 'X小時X分' for >60min",
            "Weather: Smart summary with morning/afternoon/night tiers",
            "UI: Premium polish for Packing, Shopping, Budget, Files tabs",
            "AI: Smarter destination-aware activity title generation",
            "Consistency: Unified itinerary type color palettes"
        ]
    },
    {
        ver: "V0.23.5",
        tag: "Osaka Grand Update",
        date: "2025-02-27",
        desc: {
            "zh-TW": "Osaka Grand Update - 介面與保安升級",
            "en": "Osaka Grand Update - UI & Security Overhaul"
        },
        details: {
            "zh-TW": "• 💎 介面重塑：行程卡片全面 Glassmorphism 化，提升視覺層次感。\n• 🔐 保安升級：全新高級登入介面，底層 Auth 邏輯優化。\n• ⚙️ 系統準備：為 Osaka Express 的智能功能鋪路。",
            "en": "• 💎 UI Redesign: Full glassmorphism adoption for itinerary cards.\n• 🔐 Security: Revamped login UI and underlying auth logic.\n• ⚙️ System Prep: Groundwork for Osaka Express smart features."
        },
        changes: [
            "UI: Redesigned Itinerary cards with glassmorphism",
            "Auth: Premium login/register interface",
            "System: Pre-bump prep for Osaka Express features"
        ]
    },
    {
        ver: "V0.23.1",
        date: "2025-12-19",
        desc: {
            "zh-TW": "UI 同步化 & 權限強化 & 真實教學資料",
            "en": "UI Parity & Permission Boost & Reality Tutorial"
        },
        details: {
            "zh-TW": "• UI 同步化：行程清單與地圖側欄全面對齊 AI 助手之卡片風格、圖標及間距\n• 權限強化：公開分享連結支援「可編輯」權限控管，登入後即可協助修改行程\n• 真實教學資料：重整東京模擬行程，加入精確地點資料、交通路線與專業旅遊 Tips\n• 基礎修復：修正 SIMULATION_DATA 結構錯誤及權限判定邏輯",
            "en": "• UI Parity: Synced itinerary list and map sidebar with AI Assistant card styles and icons\n• Permission Boost: Share links now support 'Can Edit' permissions for logged-in users\n• Realistic Tutorial: Overhauled Tokyo simulation data with precise locations and pro tips\n• Core Fix: Resolved structural issues in SIMULATION_DATA and permission logic"
        }
    },
    {
        ver: "V0.23.0",
        date: "2025-12-19",
        desc: {
            "zh-TW": "訪客預覽模式 & AI 行程真實化",
            "en": "Guest Preview & AI Reality Update"
        },
        details: {
            "zh-TW": "• 訪客預覽功能：行程分享 link 支援免登入查看公眾行程\n• 權限控管：訪客僅能查看，無法進行編輯、刪除或邀請成員\n• AI 寫實化：移除 Oasis 佔位內容，針對東京/台北加入真實景點推薦\n• 導入中心實裝：JSON/CSV/Memory 回憶庫正式連結資料庫與雲端儲存\n• 進階匯出：PDF 匯出功能改用精美排版服務 (Premium PDF)\n• 修復：修復分享連結在特定情況下崩潰的 Bug",
            "en": "• Guest Preview: Share links now allow non-logged-in viewing of public trips\n• Access Control: View-only mode for guests (no edit/delete/invite access)\n• AI Reality: Replaced generic 'oasis' content with real Tokyo/Taipei spots\n• Smart Import Finalized: Fully connected JSON/CSV/Memory to Firebase\n• Premium PDF: Upgraded PDF export with professional layout service\n• Bug Fix: Resolved share link crash and loading state state issues"
        }
    },
    {
        ver: "V0.22.3",
        date: "2025-12-19",
        desc: {
            "zh-TW": "AI 智能化大升級 + 匯出功能實裝",
            "en": "AI Intelligence Upgrade + Export Features"
        },
        details: {
            "zh-TW": "• AI 助手升級：改為真正 Gemini API，生成專屬行程規劃\n• 智能交通建議：景點之間自動 AI 推薦交通方式、價錢及路線\n• Vision-First OCR：圖片直接識別機票/酒店/收據資訊\n• Smart Import 完善：航班/住宿/景點所有欄位完整支援\n• iCal 匯出功能：一鍵匯出行程到 Google/Apple 日曆\n• 分享到 WhatsApp/Telegram：快速分享行程給朋友",
            "en": "• AI Assistant Upgrade: Real Gemini API for smart itinerary generation\n• Smart Transport: AI-powered suggestions with routes and prices\n• Vision-First OCR: Direct image parsing for tickets/hotels/receipts\n• Smart Import Enhancement: Full support for all flight/hotel/spot fields\n• iCal Export: One-click export to Google/Apple Calendar\n• Share to WhatsApp/Telegram: Quick sharing to messaging apps"
        }
    },
    {
        ver: "V0.22.0",
        date: "2025-12-19",
        desc: {
            "zh-TW": "匯入匯出統一大整合 & 刪除功能",
            "en": "Import/Export Consolidation & Delete Features"
        },
        details: {
            "zh-TW": "• SmartExportModal：統一匯出入口 (JSON/文字/PDF/iCal)\n• 刪除單一行程項目：編輯時可直接刪除\n• 清空當日行程：一鍵清除整日計劃\n• 修復 Import Modal 雙重模糊問題\n• 所有 Tab 匯出按鈕正確觸發",
            "en": "• SmartExportModal: Unified export (JSON/Text/PDF/iCal)\n• Delete individual items: Remove from edit modal\n• Clear daily itinerary: One-click daily reset\n• Fixed Import Modal double-blur issue\n• All tab export buttons now work correctly"
        }
    },
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
            hours: "週一至週五 09:00-11:30, 13:00-17:00"
        },
        hospitals: [
            { name: "聖路加國際醫院 (中/英語對應)", address: "東京都中央區明石町9-1", phone: "+81-3-3541-5151" },
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
    "TW": { "01-01": "元旦", "01-28": "除夕", "01-29": "春節", "01-30": "春節", "01-31": "春節", "02-28": "和平紀念日", "04-04": "兒童節", "04-05": "清明節", "05-31": "端午節", "10-06": "中秋節", "10-10": "國慶日", "12-25": "行憲紀念日" },
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
    name: "🇯🇵 東京冬日全攻略 2025 (Alex & Buddy)",
    city: "Tokyo",
    country: "Japan (日本)",
    startDate: "2025-12-24",
    endDate: "2025-12-29",
    sharePermission: "edit",
    members: [
        { id: "sim-user-1", name: "Alex", role: "owner", avatar: "https://i.pravatar.cc/150?u=alex" },
        { id: "sim-user-2", name: "Travel Buddy", role: "editor", avatar: "https://i.pravatar.cc/150?u=buddy" }
    ],
    itinerary: {
        "2025-12-24": [
            { id: "it-1", time: "09:15", name: "國泰航空 CX520 (HKG -> NRT)", type: "flight", cost: 4500, currency: "HKD", details: { location: "香港國際機場 T1", desc: "預計 14:30 抵達成田", insight: "聖誕旺季記得提早 3 小時到達機場辦理登機。" }, smartTag: "✈️ T1 - Gate 62" },
            { id: "it-1-0", time: "15:30", name: "成田機場 N'EX 前往新宿", type: "transport", cost: 3250, currency: "JPY", details: { location: "成田第2候機樓站", desc: "使用 JR Pass 或 單程票", insight: "直達新宿約 80 分鐘，最平買來回套票比較划算。", transportType: "metro", distance: "78km", duration: "80min" } },
            { id: "it-2", time: "17:30", name: "新宿格拉斯麗酒店 Check-in", type: "hotel", cost: 0, currency: "JPY", details: { location: "東京都新宿区歌舞伎町1-19-1", desc: "哥吉拉大頭地標飯店", insight: "房內可以看到歌舞伎町夜景，飯店 8 樓平台可以近距離拍哥吉拉。" }, smartTag: "🏨 步行 5 分" },
            { id: "tr-2-3", time: "19:00", name: "地鐵前往六本木", type: "transport", cost: 210, currency: "JPY", details: { location: "新宿站 -> 六本木站", desc: "都營大江戶線", distance: "7.5km", duration: "15min" } },
            { id: "it-3", time: "19:30", name: "六本木ヒルズ Keyakizaka Illumination", type: "spot", cost: 0, currency: "JPY", details: { location: "港区六本木6丁目", desc: "聖誕限定藍白燈海", reason: "東京最有誠意的聖誕燈飾，以東京鐵塔為背景是絕佳拍照位。" } },
            { id: "it-4", time: "21:30", name: "回新宿飯店休息", type: "transport", cost: 210, currency: "JPY", details: { location: "新宿格拉斯麗酒店", desc: "大江戶線直達新宿西口", insight: "早點休息為明天築地早市做準備。", distance: "7.5km", duration: "18min" }, smartTag: "🚇 地鐵回程" }
        ],
        "2025-12-25": [
            { id: "it-5", time: "07:30", name: "前往築地市場", type: "transport", cost: 210, currency: "JPY", details: { location: "大江戶線 新宿西口 -> 築地市場", desc: "地鐵約 20 分鐘", transportType: "metro", distance: "8.2km", duration: "20min" } },
            { id: "it-5-1", time: "08:15", name: "築地場外市場 (早鳥吃貨篇)", type: "food", cost: 6500, currency: "JPY", details: { location: "中央区築地4-16-2", desc: "海鮮丼、玉子燒、烤牛排", insight: "推薦「山之內」海鮮丼，或者排隊「壽司大」。" } },
            { id: "tr-5-銀座", time: "11:00", name: "地鐵前往銀座", type: "transport", cost: 180, currency: "JPY", details: { location: "築地 -> 銀座", desc: "日比谷線", distance: "1.2km", duration: "4min" } },
            { id: "it-6", time: "12:00", name: "銀座 Ginza Six 漫步", type: "shopping", cost: 25000, currency: "JPY", details: { location: "中央区銀座6-10-1", desc: "頂級百貨、屋頂花園", insight: "一定要去 TSUTAYA BOOKS 區，頂層花園可免費俯瞰銀座。" } },
            { id: "tr-銀座-淺草", time: "14:30", name: "地鐵前往淺草", type: "transport", cost: 210, currency: "JPY", details: { location: "銀座 -> 淺草", desc: "銀座線", distance: "6.5km", duration: "16min" } },
            { id: "it-7", time: "15:00", name: "淺草寺 / 仲見世通", type: "spot", cost: 0, currency: "JPY", details: { location: "台東区浅草2-3-1", desc: "雷門、求籤、觀光客必訪", insight: "抽到凶籤的話記得綁在架子上。" }, smartTag: "🏮 江戶風情" },
            { id: "tr-淺草-晴空塔", time: "17:30", name: "東武鐵道前往晴空塔", type: "transport", cost: 150, currency: "JPY", details: { location: "淺草站 -> 晴空塔站", desc: "東武晴空塔線", distance: "1.8km", duration: "5min" } },
            { id: "it-8", time: "18:00", name: "晴空塔 Skytree 夜景", type: "spot", cost: 3100, currency: "JPY", details: { location: "墨田区押上1-1-2", desc: "世界第一高電波塔", reason: "聖誕節會有特別點燈色，建議提前官網訂票。" } },
            { id: "it-9", time: "21:00", name: "回新宿飯店休息", type: "transport", cost: 350, currency: "JPY", details: { location: "新宿格拉斯麗酒店", desc: "都營淺草線 -> JR 山手線", insight: "體力消耗大，回程可以買個超商甜點犒賞自己。", distance: "14km", duration: "35min" } }
        ],
        "2025-12-26": [
            { id: "it-10", time: "08:00", name: "富士迴遊特急 (新宿 -> 河口湖)", type: "transport", cost: 4130, currency: "JPY", details: { location: "新宿站 9-10 月台", desc: "直達無需換乘", insight: "記得訂 A, B 側座位看富士山。", transportType: "metro", distance: "110km", duration: "115min" }, smartTag: "🗻 2小時直達" },
            { id: "it-11", time: "11:30", name: "河口湖 ほうとう不動 (河口湖站前店)", type: "food", cost: 1210, currency: "JPY", details: { location: "南都留郡富士河口湖町船津", desc: "傳統味噌粗麵", insight: "份量很大，兩個人可以分食一份。" } },
            { id: "tr-11-12", time: "13:00", name: "河口湖周遊巴士", type: "transport", cost: 200, currency: "JPY", details: { location: "河口湖站 -> 大石公園", desc: "紅線巴士", distance: "5.5km", duration: "15min" } },
            { id: "it-12", time: "13:30", name: "大石公園 - 富士山絕景", type: "spot", cost: 0, currency: "JPY", details: { location: "河口湖北岸", desc: "湖水與山完美對稱", reason: "冬天空氣清澈最容易看清楚逆富士。" } },
            { id: "it-12-1", time: "16:30", name: "搭乘特急返回新宿", type: "transport", cost: 4130, currency: "JPY", details: { location: "河口湖站", desc: "預計 18:30 到達", insight: "可以在車上小睡一下。", distance: "110km", duration: "115min" } },
            { id: "tr-12-13", time: "19:00", name: "步行前往伊勢丹", type: "transport", cost: 0, currency: "JPY", details: { location: "新宿站 -> 伊勢丹", desc: "步行約 5 分鐘", distance: "0.4km", duration: "5min", steps: 520 } },
            { id: "it-13", time: "19:30", name: "新宿 伊勢丹 購買熟食", type: "food", cost: 3500, currency: "JPY", details: { location: "新宿 3 丁目", desc: "B1 的超強熟食區", insight: "晚上 8 點後常有半價優惠，買回飯店吃也是一種享受。" } }
        ],
        "2025-12-27": [
            { id: "tr-26-27", time: "10:00", name: "地鐵前往麻布台", type: "transport", cost: 210, currency: "JPY", details: { location: "新宿站 -> 神谷町站", desc: "日比古線", distance: "6.2km", duration: "18min" } },
            { id: "it-14", time: "10:30", name: "TeamLab Borderless 麻布台之丘", type: "spot", cost: 4200, currency: "JPY", details: { location: "麻布台ヒルズ ガーデンプラザB B1", desc: "最新光影體驗", insight: "穿著白色衣服拍照效果最美。", transportType: "metro" }, smartTag: "📸 2024 新開" },
            { id: "tr-14-15", time: "13:15", name: "步行前往藍瓶咖啡", type: "transport", cost: 0, currency: "JPY", details: { location: "麻布台ヒルズ內", desc: "穿過中央廣場", distance: "0.4km", duration: "5min", steps: 520 } },
            { id: "it-15", time: "13:30", name: "藍瓶咖啡 麻布台之丘", type: "food", cost: 1500, currency: "JPY", details: { location: "麻布台ヒルズ", desc: "極簡精品咖啡", insight: "這裡的拿鐵配上麻布台限定的司康是首選。" } },
            { id: "tr-15-16", time: "15:00", name: "地鐵前往原宿", type: "transport", cost: 180, currency: "JPY", details: { location: "神谷町 -> 明治神宮前", desc: "千代田線", distance: "4.8km", duration: "12min" } },
            { id: "it-16", time: "15:30", name: "原宿竹下通 & 表參道", type: "shopping", cost: 15000, currency: "JPY", details: { location: "渋谷区神宮前", desc: "精品與潮牌集中地", reason: "從可愛風的竹下通走到高奢的表參道。" } },
            { id: "tr-16-17", time: "18:30", name: "步行前往澀谷", type: "transport", cost: 0, currency: "JPY", details: { location: "表參道 -> 澀谷天空", desc: "穿過神宮前交差點", distance: "1.2km", duration: "15min", steps: 1560 } },
            { id: "it-17", time: "19:00", name: "SHIBUYA SKY 展望台", type: "spot", cost: 2500, currency: "JPY", details: { location: "渋谷スクランブルスクエア", desc: "東京最強地標", insight: "一定要預訂「日落前 1 小時」的場次。" }, smartTag: "🌆 提前1個月搶票" }
        ],
        "2025-12-28": [
            { id: "it-18", time: "08:00", name: "地鐵 前往迪士尼", type: "transport", cost: 450, currency: "JPY", details: { location: "新宿 -> 舞濱", desc: "JR 京葉線", distance: "28km", duration: "45min" } },
            { id: "it-18-1", time: "09:00", name: "東京迪士尼海洋 (Fantasy Springs)", type: "spot", cost: 10900, currency: "JPY", details: { location: "千葉県浦安市舞浜1-13", desc: "最新園區：夢幻泉鄉", insight: "一入園先抽 Standby Pass 或買 DPA。" }, smartTag: "🚢 全日行程" },
            { id: "tr-disney-return", time: "21:00", name: "搭地鐵回新宿", type: "transport", cost: 450, currency: "JPY", details: { location: "舞濱 -> 新宿", desc: "今日體力耗盡", distance: "28km", duration: "50min" } }
        ],
        "2025-12-29": [
            { id: "tr-hotel-donki", time: "09:30", name: "步行前往唐吉訶德", type: "transport", cost: 0, currency: "JPY", details: { location: "飯店 -> 新宿東口", desc: "穿過靖國通", distance: "0.6km", duration: "8min", steps: 780 } },
            { id: "it-21", time: "10:00", name: "唐吉訶德 新宿東口本店", type: "shopping", cost: 12000, currency: "JPY", details: { location: "新宿区歌舞伎町1-16-5", desc: "藥妝、零食總採購", insight: "使用折扣券可以滿萬減千。" }, smartTag: "🐧 24H 營業" },
            { id: "tr-donki-lunch", time: "12:15", name: "步行前往燒肉店", type: "transport", cost: 0, currency: "JPY", details: { location: "唐吉訶德 -> 小田急", desc: "穿越新宿車站", distance: "0.5km", duration: "7min", steps: 650 } },
            { id: "it-22", time: "12:30", name: "敘敘苑 燒肉 (午間特餐)", type: "food", cost: 3800, currency: "JPY", details: { location: "新宿小田急商場 12F", desc: "高品質奢華燒肉", insight: "午餐特餐性價比極高。" } },
            { id: "it-23", time: "15:00", name: "前往成田機場 (N'EX)", type: "transport", cost: 3250, currency: "JPY", details: { location: "新宿站", desc: "最後一段鐵道時光", insight: "在車站買幾份鐵路便當上車。", distance: "78km", duration: "80min" } },
            { id: "it-24", time: "18:30", name: "國泰航空 CX505 (NRT -> HKG)", type: "flight", cost: 0, currency: "HKD", details: { location: "成田第2候機樓", desc: "預計 22:45 返抵香港" } }
        ]
    },
    packingList: [
        { id: "pkg-1", name: "護照、身份證、列印機票", category: "documents", checked: true },
        { id: "pkg-2", name: "Visit Japan Web 入境 QR Code (截圖)", category: "documents", checked: true },
        { id: "pkg-3", name: "羽絨大衣 (東京12月均溫 5°C)", category: "clothes", checked: false, aiSuggested: true },
        { id: "pkg-4", name: "Heattech 超極暖系列 *3", category: "clothes", checked: false, aiSuggested: true },
        { id: "pkg-5", name: "萬用轉接頭 & 延長線", category: "electronics", checked: true },
        { id: "pkg-6", name: "行動電源 (迪士尼整天必備)", category: "electronics", checked: true },
        { id: "pkg-8", name: "常用的感冒藥、止痛藥", category: "medicine", checked: true }
    ],
    shoppingList: [
        { id: "shp-1", name: "New York Perfect Cheese", estPrice: "JPY 2400", desc: "新宿/東京站限定", bought: false, aiSuggested: true },
        { id: "shp-2", name: "PORTER 肩背包", estPrice: "JPY 28000", desc: "表參道旗艦店款式最全", bought: false },
        { id: "shp-3", name: "毛穴撫子 大米面膜", estPrice: "JPY 715", desc: "Donki 必買", bought: false, aiSuggested: true }
    ],
    budget: [
        { id: "b-1", name: "機票 (CX 來回含餐)", cost: 9000, currency: "HKD", category: "flight", payer: "Alex", splitType: "group" },
        { id: "b-2", name: "第一晚住宿 (Graceery 歌舞伎町)", cost: 450, currency: "HKD", category: "hotel", payer: "Buddy", splitType: "individual" }
    ],
    notes: "### 💡 東京行前必看\n- **交通：** iPhone 錢包直接加 Suica 最方便，不用排隊買卡。\n- **餐廳：** 敘敘苑 建議出發前一個月上網訂位。\n- **退稅：** 買東西記得帶護照正本。",
    insurance: {
        "sim-user-1": { provider: "富邦旅平險", policyNo: "FB-2025-778899", phone: "+886 2 2771 6699", notes: "已確認涵蓋海外突發疾病" },
        "sim-user-2": { provider: "AIG 國外旅遊保險", policyNo: "AIG-HK-992211", phone: "+852 3666 7017" }
    },
    visa: {
        "sim-user-1": { status: "printed", number: "HKG-JP-VISA-001", expiry: "2030-01-01", needsPrint: false },
        "sim-user-2": { status: "not_needed", number: " 免簽 (BNO)", expiry: "-", needsPrint: false }
    },
    emergency: {
        police: "110",
        fire: "119",
        ambulance: "119",
        consulate: {
            name: "台北駐日經濟文化代表處",
            address: "東京都港区白金台5-20-2",
            phone: "+81-3-3280-7811",
            emergencyHotline: "+81-90-4746-6065",
            hours: "週一至週五 09:00-11:30, 13:00-17:00"
        },
        hospitals: [
            { name: "聖路加國際醫院 (中/英語對應)", address: "東京都中央區明石町9-1", phone: "+81-3-3541-5151" },
            { name: "東京慈惠會醫科大學附屬醫院", address: "東京都港區西新橋3-25-8", phone: "+81-3-3433-1111" }
        ],
        tips: [
            "日本報警要說「Kotsu-jiko」(交通事故) 或「Dorobo」(小偷)",
            "部分小醫院不收刷卡，建議帶足額現金",
            "語言不通可用 Google 翻譯或下載「Safety Tips」App"
        ]
    },
    reminders: [
        { id: "rem-1", title: "預訂成田機場接送", date: "2025-12-22", done: false, priority: "high" },
        { id: "rem-2", title: "兌換日幣", date: "2025-12-23", done: true, priority: "medium" },
        { id: "rem-3", title: "下載離線地圖", date: "2025-12-23", done: false, priority: "low" },
        { id: "rem-4", title: "確認酒店預約", date: "2025-12-24", done: false, priority: "high" }
    ]
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

// --- Smart Visual Assets ---

export const TYPE_DEFAULT_IMAGES = {
    spot: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&h=300&fit=crop',
    food: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    transport: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop',
    flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
    shopping: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop'
};

export const CITY_IMAGES = {
    "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop",
    "Osaka": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&h=600&fit=crop",
    "Kyoto": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=1200&h=600&fit=crop",
    "Seoul": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=600&fit=crop",
    "Taipei": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1200&h=600&fit=crop",
    "Bangkok": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&h=600&fit=crop",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=600&fit=crop",
    "New York": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&h=600&fit=crop",
    "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=600&fit=crop",
    "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop"
};

export const LANDMARK_IMAGES = {
    "晴空塔": "https://images.unsplash.com/photo-1524317820067-175a6c9d0944?w=400&h=300&fit=crop",
    "Skytree": "https://images.unsplash.com/photo-1524317820067-175a6c9d0944?w=400&h=300&fit=crop",
    "東京鐵塔": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop",
    "Tokyo Tower": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop",
    "淺草寺": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "Senso-ji": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "雷門": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "富士山": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
    "Mt. Fuji": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
    "迪士尼": "https://images.unsplash.com/photo-1505308144658-03c69861061a?w=400&h=300&fit=crop",
    "Disney": "https://images.unsplash.com/photo-1505308144658-03c69861061a?w=400&h=300&fit=crop",
    "環球影城": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
    "USJ": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
    "Universal Studios": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
    "清水寺": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    "Kiyomizu-dera": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    "伏見稻荷": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop",
    "Fushimi Inari": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop",
    "101": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    "Taipei 101": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    "九份": "https://images.unsplash.com/photo-1465220183746-d872b8ee34be?w=400&h=300&fit=crop",
    "Jiufen": "https://images.unsplash.com/photo-1465220183746-d872b8ee34be?w=400&h=300&fit=crop"
};
