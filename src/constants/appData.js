import {
    Train, Bus, Car, Route
} from 'lucide-react';
import { COUNTRY_TRANSLATIONS, CITY_TRANSLATIONS, COUNTRIES_DATA } from './countries';

// Re-export for components that expect these in appData
export { COUNTRY_TRANSLATIONS, CITY_TRANSLATIONS, COUNTRIES_DATA };

// --- Versioning & Metadata ---
export const APP_AUTHOR = "Jamie Kwok";
export const ADMIN_EMAILS = ["jamiekwok416@gmail.com"];
export const APP_VERSION = "2.0.3";
export const APP_VERSION_TAG = "i18n Fix & UX Polish";
export const APP_LAST_UPDATE = "2026-02-23";
export const JARVIS_VERSION = "V0.0.6-Beta";

export const JARVIS_VERSION_HISTORY = [
    {
        ver: "V0.0.6-Beta",
        date: "2026-02-23",
        tag: "Gemini 3.1 API Upgrade",
        desc: {
            "zh-TW": "升級至 Gemini 3.1 API，三模式智能切換",
            "zh-HK": "升級至 Gemini 3.1 API，三模式智能切換",
            "en": "Gemini 3.1 API Upgrade with Smart Model Switching"
        },
        details: {
            "zh-TW": [
                "🤖 Engine: 升級至 Gemini 3.1 系列模型 (Flash / Flash-Lite / Pro)",
                "⚡ Smart Switch: Flash 模型優先，額度觸頂自動 Fallback 至 Flash-Lite",
                "🧠 Intelligence: Pro 模型處理複雜行程解析任務"
            ],
            "zh-HK": [
                "🤖 Engine: 升級至 Gemini 3.1 系列模型 (Flash / Flash-Lite / Pro)",
                "⚡ Smart Switch: Flash 模型優先，額度觸頂自動 Fallback 至 Flash-Lite",
                "🧠 Intelligence: Pro 模型處理複雜行程解析任務"
            ],
            "en": [
                "🤖 Engine: Upgraded to Gemini 3.1 model series (Flash / Flash-Lite / Pro)",
                "⚡ Smart Switch: Flash-first strategy with auto-fallback to Flash-Lite on quota hit",
                "🧠 Intelligence: Pro model reserved for complex itinerary parsing tasks"
            ]
        }
    },
    {
        ver: "V0.0.5-Beta",
        date: "2026-01-16",
        tag: "Image Audit Awareness",
        desc: {
            "zh-TW": "圖像完整性認知與穩定性提升",
            "zh-HK": "圖像完整性認知同穩定性提升",
            "en": "Image Integrity Awareness & Stability"
        },
        details: {
            "zh-TW": [
                "🤖 AI: 增強對圖像失效問題的感知與處理邏輯",
                "🛡️ Fix: 配合 Global Audit 優化了資料讀取穩定性"
            ],
            "zh-HK": [
                "🤖 AI: 增強對圖像失效問題嘅感知同處理邏輯",
                "🛡️ Fix: 配合 Global Audit 優化咗資料讀取穩定性"
            ],
            "en": [
                "🤖 AI: Enhanced awareness of image integrity issues",
                "🛡️ Fix: Optimized data stability aligned with Global Audit"
            ]
        }
    },
    {
        ver: "V0.0.4.5-Beta",
        date: "2026-01-12",
        tag: "Mock Integration",
        desc: {
            "zh-TW": "模擬數據引擎整合",
            "zh-HK": "模擬數據引擎整合",
            "en": "Mock Engine Integration"
        },
        details: {
            "zh-TW": [
                "🤖 AI: 支援讀取 Mock Trip 數據進行分析",
                "🔄 Sync: 與 mockDataGenerator 同步邏輯"
            ],
            "zh-HK": [
                "🤖 AI: 支援讀取 Mock Trip 數據進行分析",
                "🔄 Sync: 同 mockDataGenerator 同步邏輯"
            ],
            "en": [
                "🤖 AI: Support analyzing Mock Trip data",
                "🔄 Sync: Synchronized logic with mockDataGenerator"
            ]
        }
    },
    {
        ver: "V0.0.1-Beta",
        date: "2025-12-23",
        tag: "Inception",
        desc: {
            "zh-TW": "Jarvis AI 初始版本發布",
            "zh-HK": "Jarvis AI 初始版本發布",
            "en": "Initial Release of Jarvis AI"
        },
        details: {
            "zh-TW": [
                "🤖 AI UI: 實裝專屬 Chat View 與毛玻璃 Avatar",
                "✨ 支援中心: 整合 Smart Hints 快速查問功能",
                "🚀 視覺動態: 新增 pulse-slow 呼吸燈特效"
            ],
            "en": [
                "🤖 AI UI: Implemented dedicated Chat View with Glassmorphism Avatar",
                "✨ Support Center: Integrated Smart Hints",
                "🚀 Visuals: Added pulse-slow animation effects"
            ],
            "zh-HK": [
                "🤖 AI UI: 實裝專屬 Chat View 同埋毛玻璃 Avatar",
                "✨ 支援中心: 整合 Smart Hints 快速查問功能",
                "🚀 視覺動態: 新增 pulse-slow 呼吸燈特效"
            ]
        }
    }
];

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const VERSION_HISTORY = [
    {
        ver: "V2.0.3",
        date: "2026-02-23",
        tag: "i18n Fix & UX Polish",
        desc: {
            "zh-TW": "i18n 結構修復與使用者體驗優化",
            "zh-HK": "i18n 結構修復同使用者體驗優化",
            "en": "i18n Structure Fix & UX Polish"
        },
        details: {
            "zh-TW": [
                "🐛 Fix: 修復 i18n.js 資源物件結構錯誤，zh 與 zh-HK 翻譯重新正常運作",
                "🌐 i18n: 本地化所有 Header 浮動提示（Tutorial、Guide、Messages、Notifs 等）",
                "⌨️ UX: 新增訊息按鈕 ⌘G 快捷鍵，統一所有功能快捷鍵覆蓋"
            ],
            "zh-HK": [
                "🐛 Fix: 修復 i18n.js 資源物件結構錯誤，zh 同 zh-HK 翻譯重新正常運作",
                "🌐 i18n: 本地化晒所有 Header 浮動提示（Tutorial、Guide、Messages、Notifs 等）",
                "⌨️ UX: 新增訊息按鈕 ⌘G 快捷鍵，統一晒所有功能快捷鍵"
            ],
            "en": [
                "🐛 Fix: Repaired broken i18n.js resources object structure; zh & zh-HK translations restored",
                "🌐 i18n: Localized all Header hover tooltips (Tutorial, Guide, Messages, Notifs, Menu etc.)",
                "⌨️ UX: Added ⌘G shortcut for Messages; completed keyboard shortcut coverage across all header actions"
            ]
        }
    },
    {
        ver: "V2.0.2",
        date: "2026-02-23",
        tag: "Security & Performance Audit",
        desc: {
            "zh-TW": "終極資安與效能審計",
            "zh-HK": "終極資安同效能審計",
            "en": "Ultimate Security & Performance Audit"
        },
        details: {
            "zh-TW": [
                "🛡️ Security: 移除 MapView 潛在的 XSS 漏洞，強化 DOM 安全",
                "⚡ Perf: 探索網格首屏載入 (LCP) 改為 Eager Load，極速渲染",
                "🔍 SEO: 優化 index.html OpenGraph 標籤支援"
            ],
            "zh-HK": [
                "🛡️ Security: 移除 MapView 潛在嘅 XSS 漏洞，強化 DOM 安全",
                "⚡ Perf: 探索網格首屏載入 (LCP) 改為 Eager Load，極速渲染",
                "🔍 SEO: 優化 index.html OpenGraph 標籤支援"
            ],
            "en": [
                "🛡️ Security: Patched MapView XSS vulnerabilities for DOM safety",
                "⚡ Perf: Implemented Eager Loading for LCP optimization in Explore Grid",
                "🔍 SEO: Upgraded OpenGraph tags in index.html for better discovery"
            ]
        }
    },
    {
        ver: "V1.9.14",
        date: "2026-02-11",
        tag: "Localization",
        desc: {
            "zh-TW": "全球在地化審計",
            "zh-HK": "全球在地化審計",
            "en": "Global Localization Audit"
        },
        details: {
            "zh-TW": [
                "🌐 i18n: 完成 TripDetail 所有分頁的全面在地化",
                "✨ UI: 優化預算與匯率計算機的多語言顯示"
            ],
            "zh-HK": [
                "🌐 i18n: 完成 TripDetail 所有分頁嘅全面在地化",
                "✨ UI: 優化預算同匯率計算機嘅多語言顯示"
            ],
            "en": [
                "🌐 i18n: Complete localization for all TripDetail tabs",
                "✨ UI: Optimized multilingual display for Calculators"
            ]
        }
    },
    {
        ver: "V1.9.12",
        date: "2026-01-28",
        tag: "Aurora & Visual Integrity",
        desc: {
            "zh-TW": "全站元件 Aurora 極光化重構",
            "zh-HK": "全站元件 Aurora 極光化重構",
            "en": "Visual Integrity & Aurora Refactor"
        },
        details: {
            "zh-TW": [
                "🎨 Social: Profile, FriendList 全面極光化 (AuroraCard)",
                "📊 Dashboard: TripCard, ExploreGrid 視覺統一與效能優化",
                "✨ UI: 引入 AuroraGradientText 提升標題質感"
            ],
            "zh-HK": [
                "🎨 Social: Profile, FriendList 全面極光化 (AuroraCard)",
                "📊 Dashboard: TripCard, ExploreGrid 視覺統一與效能優化",
                "✨ UI: 引入 AuroraGradientText 提升標題質感"
            ],
            "en": [
                "🎨 Social: Refactored Profile & FriendList with Aurora Design",
                "📊 Dashboard: Unified visual language for TripCard & ExploreGrid",
                "✨ UI: Enhanced headers with AuroraGradientText"
            ]
        }
    },
    {
        ver: "V1.9.11",
        date: "2026-01-27",
        tag: "PWA & Localization",
        desc: {
            "zh-TW": "PWA 安裝按鈕與在地化修復",
            "zh-HK": "PWA 安裝按鈕同埋在地化修復",
            "en": "PWA Install Button & Localization Fixes"
        },
        details: {
            "zh-TW": [
                "📱 PWA: 首頁 Navbar 新增安裝應用程式按鈕 (Chrome/Edge/Android)",
                "🌐 i18n: 補完 Level/XP/Elite 等漏譯字串 (zh-HK)"
            ],
            "zh-HK": [
                "📱 PWA: 首頁 Navbar 新增安裝應用程式按鈕 (Chrome/Edge/Android)",
                "🌐 i18n: 補完 Level/XP/Elite 等漏譯字串 (zh-HK)"
            ],
            "en": [
                "📱 PWA: Added 'Install App' button to Landing Page navbar",
                "🌐 i18n: Completed missing Level/XP/Elite translations (zh-HK)"
            ]
        }
    },

    {
        ver: "V1.9.10",
        date: "2026-01-26",
        tag: "Navigation Hotfix",
        desc: {
            "zh-TW": "導航邏輯緊急修復",
            "zh-HK": "導航邏輯緊急修復",
            "en": "Navigation Logic Hotfix"
        },
        details: {
            "zh-TW": [
                "🛡️ Nav: 修復公開行程視圖 (Public View) 的路由循環問題",
                "⚡ Perf: 消除因 URL Sync 導致的重複渲染"
            ],
            "zh-HK": [
                "🛡️ Nav: 修復公開行程視圖 (Public View) 嘅路由循環問題",
                "⚡ Perf: 消除因 URL Sync 導致嘅重複渲染"
            ],
            "en": [
                "🛡️ Nav: Fixed routing loop issue in Public Trip View",
                "⚡ Perf: Eliminated duplicate renders caused by URL Sync"
            ]
        }
    },
    {
        ver: "V1.9.9",
        date: "2026-01-26",
        tag: "PWA Polish & Gold Master",
        desc: {
            "zh-TW": "PWA 體驗打磨與最終版",
            "zh-HK": "PWA 體驗打磨同最終版",
            "en": "PWA Polish & Gold Master"
        },
        details: {
            "zh-TW": [
                "👁️ Preview: 私人行程公開預覽視圖加入醒目 Banner",
                "🛡️ Route: 強化 404/403 錯誤狀態顯示與處理",
                "⚡ Weather: 修復 TripCard 天氣數據導致的崩潰"
            ],
            "zh-HK": [
                "👁️ Preview: 私人行程公開預覽視圖加入醒目 Banner",
                "🛡️ Route: 強化 404/403 錯誤狀態顯示同處理",
                "⚡ Weather: 修復 TripCard 天氣數據導致嘅崩潰"
            ],
            "en": [
                "👁️ Preview: Added distinct banner for Public Preview Mode",
                "🛡️ Route: Enhanced error handling for 404/403 states",
                "⚡ Weather: Fixed TripCard crash due to weather data issues"
            ]
        }
    },
    {
        ver: "V1.9.8",
        date: "2026-01-26",
        tag: "Stability & Public View",
        desc: {
            "zh-TW": "公開頁面按鈕與刷新穩定性修復",
            "zh-HK": "公開頁面按鈕同刷新穩定性修復",
            "en": "Public View Button & Refresh Stability Fix"
        },
        details: {
            "zh-TW": [
                "🔗 Public View: 私人行程新增「查看公開頁面」按鈕 (Globe Icon)",
                "🛡️ Stability: 修復私人頁面刷新後被錯誤重導至首頁的問題",
                "🌐 i18n: 修正行程篩選器 (Filter) 翻譯失效問題"
            ],
            "zh-HK": [
                "🔗 Public View: 私人行程新增「查看公開頁面」按鈕 (Globe Icon)",
                "🛡️ Stability: 修復私人頁面刷新後被錯誤重導至首頁嘅問題",
                "🌐 i18n: 修正行程篩選器 (Filter) 翻譯失效問題"
            ],
            "en": [
                "🔗 Public View: Added 'View Public Page' button to private trips",
                "🛡️ Stability: Fixed redirect loop when refreshing private trip pages",
                "🌐 i18n: Fixed broken translation keys in Itinerary Filters"
            ]
        }
    },
    {
        ver: "V1.9.7",
        date: "2026-01-23",
        tag: "Fork Feature",
        desc: {
            "zh-TW": "Fork 功能正式上線",
            "zh-HK": "Fork 功能正式上線",
            "en": "Fork Feature Official Release"
        },
        details: {
            "zh-TW": [
                "🍴 Fork: 公開行程可一鍵複製到自己帳號",
                "📱 UI: 全新 PublicTripView 公開行程頁面",
                "🔀 Route: 路由智能判斷 - 成員看完整版，訪客看公開版",
                "👁️ Stats: 新增瀏覽次數與 Fork 次數統計"
            ],
            "zh-HK": [
                "🍴 Fork: 公開行程可一鍵複製到自己帳號",
                "📱 UI: 全新 PublicTripView 公開行程頁面",
                "🔀 Route: 路由智能判斷 - 成員睇完整版，訪客睇公開版",
                "👁️ Stats: 新增瀏覽次數同 Fork 次數統計"
            ],
            "en": [
                "🍴 Fork: Clone public trips to your account with one click",
                "📱 UI: Brand new PublicTripView for public trips",
                "🔀 Route: Smart routing - Members see full view, visitors see public view",
                "👁️ Stats: Added view count and fork count tracking"
            ]
        }
    },
    {
        ver: "V1.9.4",
        details: {
            "zh-TW": [
                "🐛 Fix: 修復 /trip 路由問題 - 用戶自己嘅行程會跳轉至完整 TripDetail",
                "🌐 i18n: 完善 zh-HK Badge 翻譯 (20+ 勳章)",
                "🌐 i18n: 新增 Level/XP 相關翻譯鍵",
                "⚡ UI: 公開行程頁面恢復 Header 與 Footer"
            ],
            "zh-HK": [
                "🐛 Fix: 修復 /trip 路由問題 - 用戶自己嘅行程會跳轉至完整 TripDetail",
                "🌐 i18n: 完善 zh-HK Badge 翻譯 (20+ 勳章)",
                "🌐 i18n: 新增 Level/XP 相關翻譯鍵",
                "⚡ UI: 公開行程頁面恢復 Header 同 Footer"
            ],
            "en": [
                "🐛 Fix: Resolved /trip route issue - User's own trips now redirect to full TripDetail",
                "🌐 i18n: Completed zh-HK badge translations (20+ badges)",
                "🌐 i18n: Added Level/XP localization keys",
                "⚡ UI: Restored Header & Footer in Public Trip View"
            ]
        }
    },
    {
        ver: "V1.9.3",
        date: "2026-01-23",
        tag: "Badge System Polish & Fixes",
        desc: {
            "zh-TW": "徽章系統完善與錯誤修復",
            "zh-HK": "徽章系統完善同錯誤修復",
            "en": "Badge System Polish & Bug Fixes"
        },
        details: {
            "zh-TW": [
                "🐛 Fix: 修復 Public Trip View 崩潰問題 (setViewMode error)",
                "🏅 Badge: 實裝徽章多語言顯示 (zh-HK/en)",
                "📊 UI: 修正 XP 進度條顯示邏輯與閾值",
                "⚡ Perf: 優化 Public Trip 資料載入穩定性"
            ],
            "zh-HK": [
                "🐛 Fix: 修復 Public Trip View 崩潰問題 (setViewMode error)",
                "🏅 Badge: 實裝徽章多語言顯示 (zh-HK/en)",
                "📊 UI: 修正 XP 進度條顯示邏輯同閾值",
                "⚡ Perf: 優化 Public Trip 資料載入穩定性"
            ],
            "en": [
                "🐛 Fix: Resolved Public Trip View crash (setViewMode error)",
                "🏅 Badge: Implemented localized badge names (zh-HK/en)",
                "📊 UI: Corrected XP progress bar logic and thresholds",
                "⚡ Perf: Optimized Public Trip data loading stability"
            ]
        }
    },
    {
        ver: "V1.9.0",
        date: "2026-01-23",
        tag: "Social Revolution & UX Evolution",
        desc: {
            "zh-TW": "社交功能革命性升級與介面優化",
            "zh-HK": "社交功能革命性升級同介面優化",
            "en": "Social Revolution & UX Evolution"
        },
        details: {
            "zh-TW": [
                "🎨 Profile: 全新 Grid 佈局個人頁面，完美對齊足跡、相簿與勳章",
                "🔗 Fork: 實裝「複製行程」功能，一鍵 Deep Clone 公開行程",
                "🏅 Level: 動態等級系統上線，根據行程數量自動升級",
                "🌍 i18n: 全面修復 Budget Chart 翻譯，支援中英雙語切換",
                "✨ Footer: 全面重構為 Premium 玻璃感介面，優化資訊佈局",
                "📤 Share: 整合分享連結至行程設定中的「公開行程」開關",
                "🔎 Nav: 修復 PWA 底部導航搜尋按鈕，觸發全域指令集 (Command Palette)",
                "📱 UI: 優化手機版檔案頁面，頭像居中並對齊視覺比例"
            ],
            "zh-HK": [
                "🎨 Profile: 全新 Grid 佈局個人頁面，完美對齊足跡、相簿同勳章",
                "🔗 Fork: 實裝「複製行程」功能，一鍵 Deep Clone 公開行程",
                "🏅 Level: 動態等級系統上線，根據行程數量自動升級",
                "🌍 i18n: 全面修復 Budget Chart 翻譯，支援中英雙語切換",
                "✨ Footer: 全面重構為 Premium 玻璃感介面，優化資訊佈局",
                "📤 Share: 整合分享連結至行程設定入面嘅「公開行程」開關",
                "🔎 Nav: 修復 PWA 底部導航搜尋按鈕，觸發全域指令集 (Command Palette)",
                "📱 UI: 優化手機版檔案頁面，頭像居中並對齊視覺比例"
            ],
            "en": [
                "🎨 Profile: Brand new Grid layout for perfect alignment of footprints & badges",
                "🔗 Fork: Implemented 'Fork Trip' to deep clone public itineraries",
                "🏅 Level: Dynamic leveling system based on trip count",
                "🌍 i18n: Full localization audit for Budget Charts",
                "✨ Footer: Reconstructed premium glassmorphic layout for better info balance",
                "📤 Share: Integrated 'Copy Link' directly into Public/Private toggle",
                "🔎 Nav: Fixed PWA bottom nav search to trigger Command Palette",
                "📱 UI: Centered mobile profile avatar and optimized layout proportions"
            ]
        }
    },


    {
        ver: "V1.8.5",
        date: "2026-01-22",
        tag: "UX Hotfixes",
        desc: {
            "zh-TW": "登入穩定性與介面修復",
            "zh-HK": "登入穩定性同介面修復",
            "en": "Auth Stability & UX Fixes"
        },
        details: {
            "zh-TW": [
                "🛡️ Auth: 修復登出時的權限錯誤 (Permission Denied) 與 Race Condition",
                "🔧 Config: 修正 COOP/COEP Headers 導致 Google Login Popup 無法自動關閉的問題",
                "🖱️ Landing: 修復 Dashboard Mockup Play 按鈕無反應問題"
            ],
            "zh-HK": [
                "🛡️ Auth: 修復登出嗰陣嘅權限錯誤 (Permission Denied) 同 Race Condition",
                "🔧 Config: 修正 COOP/COEP Headers 導致 Google Login Popup 閂唔到嘅問題",
                "🖱️ Landing: 修復 Dashboard Mockup Play 按鈕無反應問題"
            ],
            "en": [
                "🛡️ Auth: Fixed permission errors and race conditions during logout",
                "🔧 Config: Fixed COOP/COEP headers blocking Google Login Popup auto-close",
                "🖱️ Landing: Fixed unresponsive Play button on Dashboard Mockup"
            ]
        }
    },

    {
        ver: "V1.8.0",
        date: "2026-01-21",
        tag: "Performance Legacy",
        desc: {
            "zh-TW": "全面效能審計與懶載入架構",
            "zh-HK": "全面效能審計同懶載入架構",
            "en": "Performance Audit & Lazy Loading"
        },
        details: {
            "zh-TW": ["⚡ Perf: 實施 Global Lazy Loading 優化 LCP", "📦 Build: Vite Chunk Splitting 策略優化"],
            "zh-HK": ["⚡ Perf: 實施 Global Lazy Loading 優化 LCP", "📦 Build: Vite Chunk Splitting 策略優化"],
            "en": ["⚡ Perf: Implemented Global Lazy Loading for LCP", "📦 Build: Optimized Vite Chunk Splitting"]
        }
    },
    {
        ver: "V1.7.0",
        date: "2026-01-21",
        tag: "PDF Editor",
        desc: {
            "zh-TW": "PDF 預覽編輯與功能擴展",
            "zh-HK": "PDF 預覽編輯同功能擴展",
            "en": "PDF Preview Editor & Expansion"
        },
        details: {
            "zh-TW": ["📄 PDF: 新增 5 種樣式預覽與拖拽排序", "✏️ Edit: 支援 Word-like 行內編輯"],
            "zh-HK": ["📄 PDF: 新增 5 種樣式預覽同拖拽排序", "✏️ Edit: 支援 Word-like 行內編輯"],
            "en": ["📄 PDF: Added 5 style previews & drag-drop", "✏️ Edit: Supported Word-like inline editing"]
        }
    },
    {
        ver: "V1.6.0",
        date: "2026-01-16",
        tag: "SEO & Tutorial",
        desc: {
            "zh-TW": "網站效能與 SEO 極致打磨",
            "zh-HK": "網站效能同 SEO 極致打磨",
            "en": "Performance Polish & SEO"
        },
        details: {
            "zh-TW": ["🔍 SEO: 引入 React Helmet 與 Sitemap", "🎓 UX: 完善 Driver.js 新手引導流程"],
            "zh-HK": ["🔍 SEO: 引入 React Helmet 同 Sitemap", "🎓 UX: 完善 Driver.js 新手引導流程"],
            "en": ["🔍 SEO: Integrated React Helmet & Sitemap", "🎓 UX: Polished Driver.js repository"]
        }
    },
    {
        ver: "V1.5.0",
        date: "2026-01-10",
        tag: "AI Awakening",
        desc: {
            "zh-TW": "Gemini AI 核心整合",
            "zh-HK": "Gemini AI 核心整合",
            "en": "Gemini AI Core Integration"
        },
        details: {
            "zh-TW": ["🤖 AI: 接入 Google Gemini 1.5 Flash 視覺模型", "✨ Gen: 實裝 AI 行程生成器"],
            "zh-HK": ["🤖 AI: 接入 Google Gemini 1.5 Flash 視覺模型", "✨ Gen: 實裝 AI 行程生成器"],
            "en": ["🤖 AI: Integrated Google Gemini 1.5 Flash Vision Model", "✨ Gen: Implemented AI Itinerary Generator"]
        }
    },
    {
        ver: "V1.4.0",
        date: "2026-01-05",
        tag: "Realtime Core",
        desc: {
            "zh-TW": "即時協作核心升級",
            "zh-HK": "即時協作核心升級",
            "en": "Realtime Collaboration Core"
        },
        details: {
            "zh-TW": ["🔄 Sync: Firestore 實時監聽與 Optimistic UI", "👥 Collab: 多人協作游標與狀態同步"],
            "zh-HK": ["🔄 Sync: Firestore 實時監聽同 Optimistic UI", "👥 Collab: 多人協作游標同狀態同步"],
            "en": ["🔄 Sync: Firestore Realtime Listeners & Optimistic UI", "👥 Collab: Multi-user cursor & state sync"]
        }
    },
    {
        ver: "V1.2.0",
        date: "2025-12-20",
        tag: "Indigo Glass",
        desc: {
            "zh-TW": "Indigo Glass 設計語言",
            "zh-HK": "Indigo Glass 設計語言",
            "en": "Indigo Glass Design System"
        },
        details: {
            "zh-TW": ["🎨 UI: 全站導入 Indigo Glass 玻璃擬態設計", "🌙 Dark: 完美支援深色模式"],
            "zh-HK": ["🎨 UI: 全站導入 Indigo Glass 玻璃擬態設計", "🌙 Dark: 完美支援深色模式"],
            "en": ["🎨 UI: Introduced Indigo Glass Design System", "🌙 Dark: Full Dark Mode support"]
        }
    }
];
// --- Core Data Structures ---

export const CITY_COORDS = {
    "Tokyo": { lat: 35.6762, lon: 139.6503 },
    "東京": { lat: 35.6762, lon: 139.6503 },
    "Taipei": { lat: 25.0330, lon: 121.5654 },
    "台北": { lat: 25.0330, lon: 121.5654 },
    "London": { lat: 51.5074, lon: -0.1278 },
    "倫敦": { lat: 51.5074, lon: -0.1278 },
    "New York": { lat: 40.7128, lon: -74.0060 },
    "紐約": { lat: 40.7128, lon: -74.0060 },
    "Bangkok": { lat: 13.7563, lon: 100.5018 },
    "曼谷": { lat: 13.7563, lon: 100.5018 },
    "Zurich": { lat: 47.3769, lon: 8.5417 },
    "蘇黎世": { lat: 47.3769, lon: 8.5417 },
    "Osaka": { lat: 34.6937, lon: 135.5023 },
    "大阪": { lat: 34.6937, lon: 135.5023 },
    "Seoul": { lat: 37.5665, lon: 126.9780 },
    "首爾": { lat: 37.5665, lon: 126.9780 },
    "Paris": { lat: 48.8566, lon: 2.3522 },
    "巴黎": { lat: 48.8566, lon: 2.3522 },
    "Berlin": { lat: 52.5200, lon: 13.4050 },
    "柏林": { lat: 52.5200, lon: 13.4050 },
    "Rome": { lat: 41.9028, lon: 12.4964 },
    "羅馬": { lat: 41.9028, lon: 12.4964 },
    "Sydney": { lat: -33.8688, lon: 151.2093 },
    "雪梨": { lat: -33.8688, lon: 151.2093 }
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
    "en": { label: "English" },
    "zh-HK": { label: "廣東話" }
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
        { city: "Tokyo", dayTemp: "12°C", nightTemp: "2°C", dayDesc: "晴朗", nightDesc: "寒冷", dayIcon: "☀️", nightIcon: "🌙", tz: "Asia/Tokyo" },
        { city: "Taipei", dayTemp: "22°C", nightTemp: "18°C", dayDesc: "多雲", nightDesc: "涼爽", dayIcon: "⛅", nightIcon: "☁️", tz: "Asia/Taipei" },
        { city: "London", dayTemp: "8°C", nightTemp: "3°C", dayDesc: "微雨", nightDesc: "陰暗", dayIcon: "🌦️", nightIcon: "🌧️", tz: "Europe/London" },
        { city: "New York", dayTemp: "5°C", nightTemp: "-2°C", dayDesc: "晴時多雲", nightDesc: "嚴寒", dayIcon: "🌤️", nightIcon: "❄️", tz: "America/New_York" },
        { city: "Bangkok", dayTemp: "33°C", nightTemp: "26°C", dayDesc: "炎熱", nightDesc: "潮濕", dayIcon: "🌡️", nightIcon: "✨", tz: "Asia/Bangkok" },
        { city: "Zurich", dayTemp: "2°C", nightTemp: "-5°C", dayDesc: "大雪", nightDesc: "結冰", dayIcon: "🌨️", nightIcon: "⛄", tz: "Europe/Zurich" }
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
    metro: { label: "地鐵", icon: Train, color: "text-indigo-500" },
    bus: { label: "巴士", icon: Bus, color: "text-emerald-500" },
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
    name: "🇯🇵 東京冬日豪華之旅 2025 (4人團)",
    city: "Tokyo",
    country: "Japan (日本)",
    currency: "JPY",
    budgetLimit: 80000,
    startDate: "2025-12-24",
    endDate: "2025-12-29",
    sharePermission: "edit",
    locations: {
        "2025-12-24": { city: "Tokyo", country: "Japan (日本)" },
        "2025-12-25": { city: "Tokyo", country: "Japan (日本)" },
        "2025-12-26": { city: "Tokyo", country: "Japan (日本)" },
        "2025-12-27": { city: "Osaka", country: "Japan (日本)" },
        "2025-12-28": { city: "Osaka", country: "Japan (日本)" },
        "2025-12-29": { city: "Osaka", country: "Japan (日本)" }
    },
    members: [
        { id: "sim-user-1", name: "Alex (主揪)", role: "owner", avatar: "https://ui-avatars.com/api/?name=Alex&background=6366f1&color=fff" },
        { id: "sim-user-2", name: "Buddy (導遊)", role: "editor", avatar: "https://ui-avatars.com/api/?name=Buddy&background=10b981&color=fff" },
        { id: "sim-user-3", name: "Sarah (攝影師)", role: "viewer", avatar: "https://ui-avatars.com/api/?name=Sarah&background=f43f5e&color=fff" },
        { id: "sim-user-4", name: "Mike (財務)", role: "editor", avatar: "https://ui-avatars.com/api/?name=Mike&background=f59e0b&color=fff" }
    ],
    itinerary: {
        "2025-12-24": [
            { id: "it-1", time: "09:15", duration: 315, name: "✈️ CX520 (HKG -> NRT)", coordinates: [22.3193, 113.9353], type: "flight", cost: 4500, currency: "HKD", bundleId: "arrival-bundle-d1", details: { flightNo: "CX520", nameEn: "Cathay Pacific Airways", location: "HKG T1 Gate 62", desc: "國泰長途旗艦機 B-KPY (B777-300ER)", startTime: "09:15", endTime: "14:30", duration: "4hr 15min", insight: "【百科】B-KPY 配備最新 4K 影音系統。飛行時長約 4hr 15min。Alex 負責管理全體紙本備份。【試玩提示】長按呢張卡片可以拖曳排序！", tags: ["Cathay", "Flagship", "T1-Departure"] } },
            { id: "it-2", time: "14:30", duration: 90, name: "🛂 成田入境清關 & 交通樞紐", coordinates: [35.7719, 140.3929], type: "immigration", cost: 0, currency: "JPY", bundleId: "arrival-bundle-d1", details: { nameEn: "Narita Immigration", section: "Arrivals", location: "成田 T1 到達大廳", arrival: "B1F 鐵道層 (Rail)", desc: "入境後落 B1F 搵 JR 綠色窗口", startTime: "14:30", endTime: "16:00", duration: "1hr 30min", insight: "【入境百科】1. 入境排隊約 30-90min (視乎航班密度)。2. Visit Japan Web QR 必須準備好。3. 海關申報落 B1F 後轉左。4. 去鐵道層買 N'EX 票。【試玩提示】呢張入境卡同航班係 Bundle，會一齊移動㗎！", tags: ["Immigration", "VJW", "Must-Do"] } },
            { id: "it-3", time: "16:15", duration: 80, name: "🚆 Narita Express (N'EX)", type: "train", cost: 4070, currency: "JPY", details: { trainNo: "N'EX 34", nameEn: "JR-East Airport Express", location: "成田 T1 -> 新宿站 (Shinjuku)", platform: "Platform 1 (B1F)", desc: "月台 5-6 (地底) | 車型 E259 系", transportType: "train", startTime: "16:15", endTime: "17:35", duration: "80min", insight: "【技術百科】130km/h 準時運行。喼架有密碼鎖。", tags: ["JR-East", "Fastest", "Luggage-Space"] } },
            { id: "it-4", time: "18:00", duration: 45, name: "🏨 格拉斯麗新宿酒店 Check-in", coordinates: [35.6954, 139.7029], type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "Hotel Gracery Shinjuku, Tokyo", location: "新宿站東口 -> Hotel Gracery Shinjuku 8F Lobby", desc: "經 Studio Alta 旁哥吉拉街步行", startTime: "18:00", endTime: "18:15", duration: "15min", distance: "450m", steps: 1100, insight: "【導航】見到 Studio Alta 大電視直入哥吉拉街。住呢度就係為咗睇哥吉拉！", tags: ["Godzilla", "Kabukicho", "8F-Lobby"] } },
            { id: "it-5", time: "19:30", duration: 90, name: "🍽️ 敘敘苑燒肉", coordinates: [35.6938, 139.7034], type: "food", cost: 8000, currency: "JPY", details: { nameEn: "Jojoen Yakiniku (Shinjuku)", location: "新宿 Lumine Est 旁大廈 12F", desc: "窗邊景觀燒肉 (Premium 牛舌)", startTime: "19:30", endTime: "21:00", duration: "90min", insight: "【物流】食飯 90min。經歌舞伎町一番街大門影相最靚。", tags: ["Famous", "Sky-View", "A5-Beef"] } },
            { id: "it-end-1", time: "21:00", duration: 30, name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】『返回酒店』標誌一天結束，建議每日行程尾段都加入。", details: { nameEn: "Return to Hotel", location: "敘敘苑 -> Hotel Gracery Shinjuku 8F", desc: "原路返回 8F Lobby", startTime: "21:00", endTime: "21:08", duration: "8min", distance: "300m", steps: 400, insight: "準備聽日嘅熱血行程！", tags: ["Night-Walk", "Security-Check"] } }
        ],
        "2025-12-25": [
            { id: "it-start-2", time: "08:30", duration: 15, name: "🏨 酒店出發 (西武新宿)", type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】『酒店出發』標誌一天開始，包含導航路線同指示。", details: { nameEn: "Pepe Tunnel Shortcut", location: "Hotel Gracery Shinjuku -> 西武新宿駅 (Seibu-Shinjuku)", desc: "經由西武新宿站 Pepe 隧道 (Matrix)", startTime: "08:30", endTime: "08:38", duration: "8min", distance: "450m", steps: 1200, insight: "【導航】直去都營大江戶線。步行 8min 消暑避寒。", tags: ["Shortcut", "Matrix-Path", "Cooling"] } },
            { id: "it-tsuk-1", time: "08:45", duration: 20, name: "🚇 都營大江戶線", type: "train", cost: 230, currency: "JPY", details: { nameEn: "Oedo Line (Toei Subway)", location: "新宿西口 (E01) -> 築地市場 (E18)", desc: "日本最深地鐵線 (42.3m)", startTime: "08:45", endTime: "09:05", duration: "20min", insight: "【導航】車程約 20 分鐘。搵 **A1 出口** 出站。", tags: ["Subway", "Deepest-Line", "Fast-Link"] } },
            { id: "it-tsuk-2", time: "09:15", duration: 120, name: "🍣 築地外市場", coordinates: [35.6655, 139.7704], type: "food", cost: 3500, currency: "JPY", details: { nameEn: "Tsukiji Outer Market", location: "築地 4 Chome 門外市場", desc: "日本廚房 | 山長玉子燒", startTime: "09:15", endTime: "11:15", duration: "120min", insight: "【百科】食完步行 12min (850m) 到銀座。", tags: ["Seafood", "Street-Food", "Historic"] } },
            { id: "it-gin-1", time: "12:00", duration: 120, name: "🛍️ Ginza Six (GSIX)", coordinates: [35.6696, 139.7640], type: "shopping", cost: 5000, currency: "JPY", details: { nameEn: "Ginza Luxury Mall", location: "銀座 A3 出口直結", desc: "谷口吉生設計 | 現代屋台建築", startTime: "12:00", endTime: "14:00", duration: "120min", insight: "【百科】6F 蔦屋書店係必影點。", tags: ["Architecture", "Art", "Luxury"] } },
            { id: "it-asa-1", time: "15:00", duration: 15, name: "🚇 東京地鐵銀座線", type: "train", cost: 180, currency: "JPY", details: { nameEn: "Ginza Line (Tokyo Metro)", location: "銀座站 -> 淺草站", desc: "亞洲最古老地鐵 (1927)", startTime: "15:00", endTime: "15:15", duration: "15min", insight: "【導航】車程 15 分鐘。搵 **A4 出口**。", tags: ["Vintage-Subway", "Classic-Route"] } },
            { id: "it-asa-2", time: "15:30", duration: 30, name: "⛩️ 雷門 & 淺草寺", coordinates: [35.7148, 139.7967], type: "spot", cost: 0, currency: "JPY", details: { nameEn: "Kaminarimon & Senso-ji Temple", location: "淺草 A4 出口 -> 雷門 -> 淺草寺", desc: "創立於 645 年 | 東京最古老寺廟", startTime: "15:30", endTime: "16:00", duration: "30min", insight: "【導航】A4 出口直出見雷門。仲見世通 250m 直行入寺。", tags: ["Shrine", "Iconic", "Photo-Spot"] } },
            { id: "it-asa-3", time: "16:15", duration: 30, name: "🌉 隅田川水上步道", type: "spot", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】呢個時間同前一個活動有 15 分鐘空檔，考慮加入步行交通。", details: { nameEn: "Sumida River Walk", location: "淺草寺 -> 隅田川 -> 墨田區", desc: "2020 年開放 | 直達晴空塔天空步道", startTime: "16:15", endTime: "16:45", duration: "30min", insight: "【導航】呢條橋可以影到晴空塔最正角度！慢慢行 15min。", tags: ["Bridge", "Scenic-Walk", "Skytree-View"] } },
            { id: "it-sky-1", time: "18:00", duration: 120, name: "🗼 東京晴空塔", coordinates: [35.7100, 139.8107], type: "spot", cost: 3100, currency: "JPY", details: { nameEn: "Tokyo Skytree", location: "墨田區押上 (T2P)", desc: "高 634m | 世界第一高電波塔", startTime: "18:00", endTime: "20:00", duration: "120min", insight: "【百科】採用古代五重塔心柱抗震。", tags: ["Sky-View", "Engineering", "Night-Scene"] } },
            { id: "it-end-2", time: "21:00", duration: 15, name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Shinjuku", location: "新宿站 -> Hotel Gracery Shinjuku Tokyo 8F", desc: "經歌舞伎町一番街返酒店", startTime: "21:00", endTime: "21:10", duration: "10min", distance: "450m", steps: 600, insight: "去 1 樓 7-11 買宵夜。", tags: ["Neon-Light", "Convenience-Store"] } }
        ],
        "2025-12-26": [
            { id: "it-start-3", time: "10:00", duration: 15, name: "🏨 酒店出發 (Studio Alta)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Shinjuku East Navigation", location: "酒店 -> JR 新宿站", desc: "經由新宿東口 Studio Alta 旁小路入閘", startTime: "10:00", endTime: "10:10", duration: "10min", distance: "450m", steps: 1100, insight: "14 號月台搭山手線（內環）。", tags: ["Station-Entry", "Yamanote-Line"] } },
            { id: "it-shib-1", time: "10:20", duration: 15, name: "🚇 JR 山手線", type: "train", cost: 160, currency: "JPY", details: { nameEn: "Yamanote Line (JR-East)", location: "新宿 (Plat 14) -> 澀谷", desc: "山手線車程 15min", startTime: "10:20", endTime: "10:35", duration: "15min", insight: "【歷史】1885 年開通嘅歷史性路線。", tags: ["Circular-Line", "Iconic-Tokyo"] } },
            { id: "it-shib-2", time: "10:45", duration: 120, name: "🏙️ Shibuya Sky", coordinates: [35.6585, 139.7013], type: "spot", cost: 2500, currency: "JPY", details: { nameEn: "Scramble Square Observatory", location: "Shibuya Scramble Square 14F/47F", desc: "隈研吾參與設計", startTime: "10:45", endTime: "12:45", duration: "120min", insight: "【物流】風大記得紮起頭髮。", tags: ["Must-Visit", "Heliport-View", "Kengo-Kuma"] } },
            { id: "it-shib-3", time: "13:15", duration: 90, name: "🍽️ 挽肉と米 (澀谷店)", coordinates: [35.6590, 139.6970], type: "food", cost: 1800, currency: "JPY", details: { nameEn: "Hikiniku to Kome", location: "澀谷道玄坂 2-28-1 3F", desc: "炭烤漢堡排 (預約制)", startTime: "13:15", endTime: "14:45", duration: "90min", insight: "【物流】用餐預計 90 分鐘。", tags: ["Trending", "Gourmet", "Charcoal-Grilled"] } },
            { id: "it-har-1", time: "15:30", duration: 60, name: "⛩️ 明治神宮", coordinates: [35.6764, 139.6993], type: "spot", cost: 0, currency: "JPY", details: { nameEn: "Meiji Jingu Shrine", location: "原宿站出口 1分鐘", desc: "1920 年建立。大鳥居用咗台灣阿里山檜木。", startTime: "15:30", endTime: "16:30", duration: "60min", insight: "【歷史】從挽肉と米步行 20 分鐘抵達。", tags: ["Forest-In-City", "Giant-Torii", "Spiritual"] } },
            { id: "it-har-2", time: "16:45", duration: 60, name: "🛍️ 表參道散策", type: "shopping", cost: 5000, currency: "JPY", details: { nameEn: "Omotesando & Cafe Reissue", location: "神宮前 3-25-7 2F", desc: "3D 立體拉花 (Cafe)", startTime: "16:45", endTime: "17:45", duration: "60min", insight: "目標：KURACHIKA 買 Porter Bag。", tags: ["Fashion", "Architecture-Street", "3D-Latte"] } },
            { id: "it-end-3", time: "20:00", duration: 15, name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Gracery Shinjuku", location: "新宿站 -> Hotel Gracery Shinjuku 8F", desc: "經過新宿東口 Studio Alta 返酒店", startTime: "20:00", endTime: "20:10", duration: "10min", distance: "450m", steps: 1100, insight: "聽日要衝新幹線，早啲休息。", tags: ["Night-Route", "Final-Check"] } }
        ],
        "2025-12-27": [
            { id: "it-start-4", time: "08:15", duration: 15, name: "🚅 東京站新幹線導航", coordinates: [35.6812, 139.7671], type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】大站導航建議加入詳細指示，包括月台資訊、行走方向、預留時間等。", details: { nameEn: "Tokyo Station Navigation", location: "新宿站 -> 東京站 14-19 號月台", desc: "跟住藍色「新幹線」指示行 (Matrix)", startTime: "08:15", endTime: "08:30", duration: "15min", distance: "450m", steps: 1100, insight: "預留時間買「牛肉便當」喺車食。", tags: ["Shinkansen", "Station-Flow", "Bento"] } },
            { id: "it-tok-4", time: "09:42", duration: 150, name: "🚅 Nozomi 21 (新幹線)", coordinates: [35.6812, 139.7671], type: "train", cost: 14750, currency: "JPY", details: { trainNo: "Nozomi 21", nameEn: "Tokaido Shinkansen (Supreme)", location: "東京 (Plat 14) -> 新大阪", arrival: "Osaka", desc: "車型 N700S (Supreme) | 車程 150min", transportType: "train", startTime: "09:42", endTime: "12:12", duration: "2hr 30min", insight: "【技術】10:30 右邊 E 位見富士山。", tags: ["High-Speed", "Fuji-View", "N700S"] } },
            { id: "it-osa-2", time: "13:15", duration: 30, name: "🏨 大阪 W 酒店 Check-in", coordinates: [34.6750, 135.5000], type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "W Osaka (Shinsaibashi)", location: "心齋橋站 3 號出口 -> 酒店 1F", desc: "1F 門口寄存即走 (Matrix)", startTime: "13:15", endTime: "13:45", duration: "30min", insight: "【導航】心齋橋站 3 號出口轉左行 2min。", tags: ["Marriott", "Luxury-Design", "Iconic-Black"] } },
            { id: "it-osa-gap1", time: "14:00", duration: 90, name: "🛍️ 心齋橋筋商店街", coordinates: [34.6718, 135.5019], type: "shopping", cost: 3000, currency: "JPY", details: { nameEn: "Shinsaibashi-suji Shopping Street", location: "Osaka Shinsaibashi", desc: "大阪最長商店街 (600m)", startTime: "14:00", endTime: "15:30", duration: "90min", insight: "大阪最有歷史商店街，由 1726 年開始。", tags: ["Fashion", "Local-Vibe", "Historic"] } },
            { id: "it-osa-gap2", time: "16:00", duration: 90, name: "🎨 美國村 (Amerikamura)", coordinates: [34.6725, 135.4980], type: "spot", cost: 0, currency: "JPY", details: { nameEn: "American Village Osaka", location: "西心齋橋 1-6", desc: "大阪潮流文化發源地", startTime: "16:00", endTime: "17:30", duration: "90min", insight: "70 年代開始嘅古著街。三角形公園係地標。", tags: ["Vintage-Clothing", "Youth-Culture", "Street-Art"] } },
            { id: "it-osa-3", time: "19:00", duration: 90, name: "🍽️ 蟹道樂 (道頓堀本店)", coordinates: [34.6687, 135.5013], type: "food", cost: 12000, currency: "JPY", details: { nameEn: "Kani Doraku (Honten)", location: "道頓堀 1-6-18", desc: "大阪地標 | 巨大動感螃蟹看板", startTime: "19:00", endTime: "20:30", duration: "90min", insight: "【物流】食完行去格力高看板影相只需 1min。", tags: ["Signature-Dish", "Crab-Specialist", "Landmark"] } },
            { id: "it-end-4", time: "21:30", duration: 15, name: "🏨 返回 W Osaka (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Shinsaibashi", location: "道頓堀 -> W Osaka 1F", desc: "沿心齋橋筋商店街漫步", startTime: "21:30", endTime: "21:42", duration: "12min", distance: "800m", steps: 1200, insight: "返酒店 Spa 休息吓。", tags: ["Night-Stroll", "Spa-Time"] } }
        ],
        "2025-12-28": [
            { id: "it-usj-matrix", time: "07:30", duration: 45, name: "🚆 USJ 鐵道轉乘", type: "train", cost: 410, currency: "JPY", details: { nameEn: "Universal City Direct Link", location: "心齋橋 -> Universal City (Plat 3)", desc: "西九條站對面月台轉乘 (Matrix)", startTime: "07:30", endTime: "08:15", duration: "45min", insight: "西九條轉 **Plat 3** (夢咲線)。轉乘只需 1min。", tags: ["Train-Matrix", "USJ-Express", "Fast-Link"] } },
            { id: "it-usj-1", time: "09:00", duration: 720, name: "🎢 USJ 超級任天堂世界", coordinates: [34.6654, 135.4323], type: "spot", cost: 18000, currency: "JPY", details: { nameEn: "Super Nintendo World (USJ)", location: "大阪此花區", desc: "宮本茂耗資 600 億監修", startTime: "09:00", endTime: "21:00", duration: "12hr", insight: "入園即衝任天堂。用 Power-Up Band 敲磚。", tags: ["Mario-Kart", "Yoshi-Adventure", "Power-Up"] } },
            { id: "it-end-5", time: "21:30", duration: 45, name: "🏨 返回 W Osaka (Return)", type: "walk", cost: 410, currency: "JPY", details: { nameEn: "Return to Hotel", location: "USJ -> W Osaka", desc: "原路返回 (Matrix)", startTime: "21:30", endTime: "22:15", duration: "45min", distance: "8km", steps: 500, insight: "今日行咗 2 萬步，一定要用休足時間。", tags: ["Tired-But-Happy", "Last-Night"] } }
        ],
        "2025-12-29": [
            { id: "it-check", time: "08:00", duration: 15, name: "🏨 大阪 W 酒店 Checkout & 寄喼", type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "W Osaka Final Checkout", location: "W Osaka Lobby", desc: "最後行李清查 | 24吋 x 4", startTime: "08:00", endTime: "08:15", duration: "15min", insight: "Alex 負責核對全員喼位。Checkout 5min。", tags: ["Check-Out", "Bag-Management", "Final-Day"] } },
            { id: "it-osa-morning", time: "08:30", duration: 90, name: "🍳 道具屋筋 & 黑門", type: "shopping", cost: 2000, currency: "JPY", details: { nameEn: "Sennichimae Doguyasuji", location: "大阪難波千日前", desc: "大阪料理人之街 | 廚具百科", startTime: "08:30", endTime: "10:00", duration: "90min", insight: "【百科】大阪廚具之魂。買日式小餐具。", tags: ["Kitchenware", "Craftmanship", "Culinary"] } },
            { id: "it-kuro-matrix", time: "10:30", duration: 90, name: "🍣 黑門市場食鮮", type: "food", cost: 4000, currency: "JPY", details: { nameEn: "Kuromon Ichiba Market", location: "黑門市場 (Namba)", desc: "沿御堂筋大道直行 15min", startTime: "10:30", endTime: "12:00", duration: "90min", insight: "【導航】食鮮味海膽。13:15 到南海難波站。", tags: ["Raw-Seafood", "Uni", "Market-Vibe"] } },
            { id: "it-rap-1", time: "13:30", duration: 40, name: "🚆 南海 Rapit (藍武士)", type: "train", cost: 1450, currency: "JPY", bundleId: "departure-bundle-d6", details: { trainNo: "Rap:t Beta 42", nameEn: "Nankai Airport Express", location: "南海難波 (Plat 9) -> KIX 2F", desc: "藍色專用月台 (Plat 9)", startTime: "13:30", endTime: "14:10", duration: "40min", insight: "【導航】入閘後過天橋到 T1。Mike 確保清空硬幣。【Bundle 邏輯】呢班機場快綫同回程航班係綁定，拖其中一個就一齊移動！", tags: ["Iron-Man-28", "Blue-Express", "Fast-To-KIX"] } },
            { id: "it-kix-blue", time: "15:30", duration: 210, name: "✈️ 歸航: KIX -> HKG (Return)", type: "flight", cost: 0, currency: "HKD", bundleId: "departure-bundle-d6", details: { flightNo: "CX507", nameEn: "Cathay Pacific (Return)", location: "KIX T1 國泰櫃位 (C 區)", desc: "Blue Sky 免稅店 (硬幣對策)", startTime: "15:30", endTime: "19:00", duration: "3hr 30min", insight: "【微操】去 C 區 Check-in。入閘後可以用晒硬幣。【百科：回程標誌】注意飛機 Icon 變左右下角 (↘️)，寄意「回家」。", tags: ["Going-Home", "Tax-Free", "Final-Duty"] } }
        ],
    },
    packingList: [
        { id: "pkg-1", name: "護照、機票、預約信紙本", category: "documents", checked: true, ownerId: "sim-user-1", details: "【Alex 專屬】日本法律規定外國人必須隨身攜帶護照。Alex 負責管理全體紙本備份，防止手機死機。" },
        { id: "pkg-2", name: "VJW QR Code (全員 Cap 圖)", category: "documents", checked: true, ownerId: "sim-user-4", details: "【Mike 任務】確保全員已截圖入境同海關 QR Code。包含藍色 Top Bar 先算有效。Mike 負責喺機場 Wi-Fi 斷嗰陣分發資訊。" },
        { id: "pkg-jr", name: "JR Pass (BNO/HKSAR 版)", category: "documents", checked: true, ownerId: "sim-user-2", details: "【Buddy 任務】Buddy 負責喺綠色窗口兌換全員 JR Pass。提早劃位（特別係新幹線 D/E 位睇富士山）。2023/10/1 起必須提前劃位。" },
        { id: "pkg-luggage", name: "行李箱 (23kg x 4)", category: "misc", checked: true, ownerId: "sim-user-1", details: "【百科：國泰行李】Economy Lite 每人 23kg 寄艙。超重每 kg 收 HKD 200。手提 7kg 限制。Alex 負責秤重分配。" },
        { id: "pkg-shinkansen", name: "新幹線特大行李預約確認", category: "documents", checked: true, ownerId: "sim-user-2", details: "【百科：特大行李】2020 年起行李超過 160cm 總和需預約。Buddy 已預約 Nozomi 21 最後排行李位。" },
        { id: "pkg-3", name: "防風大衣 & 羽絨", category: "clothes", checked: false, ownerId: "sim-user-3", details: "【Sarah 任務】確保全員採用「洋蔥式穿法」。日本室內暖氣 25°C，入面唔好著太厚。12 月東京平均 5-10°C。" },
        { id: "pkg-extwarm", name: "Heattech 超極暖系列", category: "clothes", checked: true, ownerId: "sim-user-3", details: "【Sarah 專屬】Sarah 準備 5 套 Ultra Warm。USJ 嗰日海邊風力係地獄級 (體感 -3°C)，必須內搭。" },
        { id: "pkg-5", name: "行動電源 (PD 20000mAh *2)", category: "electronics", checked: true, ownerId: "sim-user-4", details: "【Mike 後勤】160Wh 係飛機上限，呢舊 20000mAh 3.7V = 74Wh 合格。Mike 負責全員充電。" },
        { id: "pkg-dji", name: "DJI Pocket 3 + 1吋 Sensor 手柄", category: "electronics", checked: true, ownerId: "sim-user-1", details: "【Alex 紀錄】主打夜景 (1 吋 Sensor 暗位表現好)。負責記錄歌舞伎町同道頓堀夜生活。充滿可影 2 小時。" },
        { id: "pkg-sony", name: "Sony A7CII + 16-35mm GMII", category: "electronics", checked: true, ownerId: "sim-user-3", details: "【Sarah 攝影】超廣角影 Shibuya Sky 同明治神宮鳥居專用。記憶卡 256GB *2 已準備。專業大片保證。" },
        { id: "pkg-6", name: "急救包 (休足時間 & 感冒藥)", category: "medicine", checked: true, ownerId: "sim-user-2", details: "【Buddy 備品】Buddy 負責管理藥物。休足時間 (每日 1 對) 係返酒店後嘅全員救星。感冒藥攞日本認可牌子。" },
        { id: "pkg-7", name: "小管家硬幣盒 (1, 5, 10, 100, 500 JPY)", category: "misc", checked: true, ownerId: "sim-user-4", details: "【Mike 任務】負責管理全員硬幣。日本好多找續硬幣，用專用盒分類可以慳返 10 倍俾錢時間。最尾喺 Blue Sky 用晒。" }
    ],
    shoppingList: [
        { id: "shp-nintendo", name: "Nintendo Tokyo (PARCO 6F)", estPrice: "JPY 15000", desc: "皮克敏餐具組", bought: false, ownerId: "sim-user-1", details: "【Alex 目標】獨家「像素風」餐具。呢度係日本第一間直營店，USJ 冇得賣㗎！" },
        { id: "shp-1", name: "New York Perfect Cheese (新宿)", estPrice: "JPY 20000", desc: "15入裝 x 8 盒", bought: false, ownerId: "sim-user-1", details: "【Alex 任務】東京現時最紅伴手禮。每日 11:00 前會 Sold Out，新宿第一站必衝。京王百貨 B1 有售。" },
        { id: "shp-2", name: "Porter Tanker XS (Harajuku)", estPrice: "JPY 32000", desc: "黑色限量版", bought: false, ownerId: "sim-user-3", details: "【Sarah 目標】原宿 KURACHIKA 店。Tanker 系列靈感嚟自 MA-1 飛行夾克，黑盒裝極致質感。" },
        { id: "shp-davines", name: "Davines MOMO 洗頭水 (500ml)", estPrice: "JPY 5600", desc: "W Osaka 直接買", bought: false, ownerId: "sim-user-3", details: "【Sarah 任務】W Hotel 專用品牌。喺酒店 1F Spa 買最方便，仲可以即場退稅。" },
        { id: "shp-donki", name: "藥妝 (撒隆巴斯/龍角散)", estPrice: "JPY 12000", desc: "全員份 + 同事掃貨", bought: false, ownerId: "sim-user-4", details: "【Mike 任務】Mike 負責掃貨。記得用 Donki 5% Coupon + Tax Free。2024 年起滿 ¥5000 可退稅 (消耗品)。" },
        { id: "shp-royce", name: "ROYCE 生朱古力 (原味)", estPrice: "JPY 3000", desc: "關西機場限定", bought: false, ownerId: "sim-user-2", details: "【Buddy 任務】必須冷藏。KIX Blue Sky 有售。Buddy 負責最後一站買返香港送禮。" },
        { id: "shp-uniqlo", name: "UNIQLO UT 聯名款", estPrice: "JPY 5000", desc: "日本限定設計", bought: false, ownerId: "sim-user-4", details: "【百科：退稅】2024 年起滿 ¥5000 可退稅 (一般物品)。Mike 負責銀座旗艦店掃貨。" }
    ],
    notes: [
        { id: "note-1", title: "Day 1 落地：哥吉拉震撼", content: "終於到咗東京！Alex 管理嘅紙本機票好有用，入境機仔壞咗我哋直接出示紙本。敘敘苑牛舌聖誕氣氛拉滿！Alex 仲影咗哥吉拉條尾。", date: "2025-12-24", author: "Alex", authorId: "sim-user-1" },
        { id: "note-2", title: "Day 2 文化：淺草寺求籤", content: "淺草寺抽到「凶」，即刻綁喺架上面。晴空塔 634m 真係好高，Sarah 用超廣角影到成個東京景。", date: "2025-12-25", author: "Sarah", authorId: "sim-user-3" },
        { id: "note-3", title: "Day 3 避風指南：澀谷天空", content: "Sarah 頂帽差啲吹咗落山。Mike 嘅尿袋今日救咗我哋全組命，DJI 影成 3 小時都仲有電。挽肉與米真係要預約！", date: "2025-12-26", author: "Buddy", authorId: "sim-user-2" },
        { id: "note-4", title: "Day 4 跨城：新幹線富士山", content: "東京站買咗「牛肉便當」喺車食。成功喺 E 位見到富士山，Alex 仲用 Pocket 3 縮時影咗成段。W Osaka 全黑建築好型。", date: "2025-12-27", author: "Mike", authorId: "sim-user-4" },
        { id: "note-5", title: "Day 5 激戰：USJ 任天堂", content: "Mike 負責全體水份供應。Power-Up Band 敲磚真係好治癒。夜晚哈利波特燈光騷必睇！", date: "2025-12-28", author: "Buddy", authorId: "sim-user-2" }
    ],
    files: [
        { id: "file-1", name: "機票行程單_Alex.pdf", type: "application/pdf", uploadedAt: "2025-12-20", url: "https://www.google.com" },
        { id: "file-3", name: "USJ_Express_Pass.pdf", type: "application/pdf", uploadedAt: "2025-12-22", url: "https://www.google.com" },
        { id: "file-img1", name: "新宿哥吉拉大戰.jpg", type: "image/jpeg", uploadedAt: "2025-12-24", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800" },
        { id: "file-img2", name: "銀座夜景全景.png", type: "image/png", uploadedAt: "2025-12-25", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
        { id: "file-img3", name: "USJ任天堂世界全員合照.jpg", type: "image/jpeg", uploadedAt: "2025-12-28", url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800" }
    ],
    reminders: [
        { id: "rem-1", title: "⚡ 數據備份", content: "VJW QR Code 一定要 Cap 圖！機場 Wi-Fi 有時慢到喊，離線 Cap 圖保平安。包含入境同海關兩個 Code。", category: "tech", priority: "high" },
        { id: "rem-2", title: "❄️ 天氣對策", content: "12 月東京風大，USJ 體感會低多 3 度。Sarah 記得帶多幾對暖包。室內暖氣好勁，洋蔥穿法係重點。", category: "logistics", priority: "medium" },
        { id: "rem-3", title: "🛂 出境準備", content: "最後一日出發前 3 小時到 KIX。預留 1 小時買手信同清空 Suica/硬幣。Alex 負責最後申報。", category: "logistics", priority: "high" }
    ],
    visa: {
        "sim-user-1": { status: "HKSAR 免簽", number: "90日免簽 (短期滯在)", expiry: "2030-01-01", needsPrint: true },
        "sim-user-2": { status: "BNO 免簽", number: "90日免簽 (Short-term)", expiry: "2029-05-20", needsPrint: true },
        "sim-user-3": { status: "HKSAR 免簽", number: "90日免簽 (短期滯在)", expiry: "2031-10-15", needsPrint: false },
        "sim-user-4": { status: "HKSAR 免簽", number: "90日免簽 (短期滯在)", expiry: "2028-03-01", needsPrint: false }
    },
    insurance: {
        "sim-user-1": { provider: "AIG 太平", policyNo: "AIG-998877", phone: "+852 3666 7000", insight: "【Alex 專屬】包含 100萬醫療、住院現金及緊急送返。在日本 24 小時熱線：+81 3-1234-5678。" },
        "sim-user-2": { provider: "Chubb 安達", policyNo: "CHB-112233", phone: "+852 2861 0018", insight: "【Buddy 專屬】包含行李延誤同旅程取消。BNO 護照特別保障。" },
        "sim-user-3": { provider: "Zurich", policyNo: "ZUR-554433", phone: "+852 2968 2222", insight: "【Sarah 專屬】包含攝影器材損毀保障，Sarah 兩部相機都保咗。" },
        "sim-user-4": { provider: "MSIG", policyNo: "MSIG-778899", phone: "+852 2862 9888", insight: "【Mike 專屬】包含現金遺失同個人責任。重傷/事故 200萬醫療。" }
    },
    memories: [
        { id: "mem-1", date: "2025-12-24", memo: "抵達成田，旺季入境搞咗 75 分鐘，好彩提早填咗 VJW。Alex 紙本機票大派用場！" },
        { id: "mem-2", date: "2025-12-25", memo: "銀座六號頂樓睇夜景，全免費，睇住和光鐘樓好靚。Sarah 影咗一百幾張。" },
        { id: "mem-3", date: "2025-12-26", memo: "Shibuya Sky 大風吹到癲，Sarah 頂帽差啲吹咗落山。明治神宮大鳥居勁震撼。" },
        { id: "mem-4", date: "2025-12-27", memo: "新幹線 D/E 位成功捕捉到富士山，全車人都喺度影相。Alex 記錄 300km/h 瞬間！" },
        { id: "mem-5", date: "2025-12-28", memo: "USJ 走咗十二個鐘，任天堂世界金幣全取。Mike 尿袋救咗全或命！" },
        { id: "mem-6", date: "2025-12-29", memo: "黑門市場海膽鮮甘到喊。Rapit 鐵人 28 型列車賣相勁高，完美歸航！" }
    ],
    chatMessages: [
        { id: "chat-1", text: "各位～我哋機票 confirm 咗啦！CX520 聖誕早機，記得 12:30 前到 T1 呀！🛫", senderId: "sim-user-1", timestamp: "2025-12-20T18:30:00Z" },
        { id: "chat-2", text: "收到！我負責帶尿袋同藥包，全員裝備話俾我知有冇遺漏 👍", senderId: "sim-user-4", timestamp: "2025-12-20T18:32:00Z" },
        { id: "chat-3", text: "Alex 我啲相機好重，可唔可以借你個箱放 lens bag？🙏", senderId: "sim-user-3", timestamp: "2025-12-20T19:15:00Z" },
        { id: "chat-4", text: "冇問題！記住 VJW 填晒未？入境要用㗎！", senderId: "sim-user-1", timestamp: "2025-12-20T19:20:00Z" },
        { id: "chat-5", text: "我已經填好晒同 cap 咗圖！記住要 cap 埋藍色 top bar 先係有效㗎！", senderId: "sim-user-2", timestamp: "2025-12-20T19:25:00Z" },
        { id: "chat-6", text: "聽日喺新宿酒店集合！哥吉拉街嗰間，8F lobby！🦖", senderId: "sim-user-1", timestamp: "2025-12-24T17:00:00Z" },
        { id: "chat-7", text: "嘩！個酒店望出去真係見到哥吉拉個頭！癲咗 🤯", senderId: "sim-user-3", timestamp: "2025-12-24T18:15:00Z" },
        { id: "chat-8", text: "敘敘苑訂咗 7:30！行過去 5 分鐘。記住帶定胃藥 😂", senderId: "sim-user-4", timestamp: "2025-12-24T18:20:00Z" },
        { id: "chat-9", text: "今日築地外市場好多人！但係玉子燒真係好食到喊 🥚✨", senderId: "sim-user-2", timestamp: "2025-12-25T10:30:00Z" },
        { id: "chat-10", text: "淺草寺求籤我抽到凶！即刻綁咗喺棵樹度 😅", senderId: "sim-user-3", timestamp: "2025-12-25T16:00:00Z" },
        { id: "chat-11", text: "Shibuya Sky 風大到癲！@Sarah 你頂帽飛咗未？😂", senderId: "sim-user-4", timestamp: "2025-12-26T11:30:00Z" },
        { id: "chat-12", text: "差啲飛咗落山！好彩 Alex 幫我捉住 🫣", senderId: "sim-user-3", timestamp: "2025-12-26T11:32:00Z" },
        { id: "chat-13", text: "聽日新幹線！記住 8:15 喺東京站月台集合，遲到唔等㗎！🚅", senderId: "sim-user-1", timestamp: "2025-12-26T21:00:00Z" },
        { id: "chat-14", text: "富士山！右手邊！快啲影！📸", senderId: "sim-user-2", timestamp: "2025-12-27T10:30:00Z" },
        { id: "chat-15", text: "影到喇！300km/h 縮時完成！", senderId: "sim-user-1", timestamp: "2025-12-27T10:32:00Z" },
        { id: "chat-16", text: "W Osaka 間房全黑色好型！個 view 望到心齋橋夜景 🌃", senderId: "sim-user-3", timestamp: "2025-12-27T14:00:00Z" },
        { id: "chat-17", text: "USJ 開門喇！任天堂世界衝呀！🍄", senderId: "sim-user-2", timestamp: "2025-12-28T09:00:00Z" },
        { id: "chat-18", text: "Power-Up Band 敲磚好治癒！已經儲咗 200 金幣！", senderId: "sim-user-4", timestamp: "2025-12-28T11:00:00Z" },
        { id: "chat-19", text: "全日行咗 2 萬步，隻腳廢咗 😵 返酒店貼休足時間！", senderId: "sim-user-3", timestamp: "2025-12-28T21:30:00Z" },
        { id: "chat-20", text: "最後一日喇！機場前去黑門食海膽 🦐", senderId: "sim-user-1", timestamp: "2025-12-29T08:00:00Z" },
        { id: "chat-21", text: "Rapit 藍武士好靚！鐵人 28 造型！最後衝刺買手信！", senderId: "sim-user-4", timestamp: "2025-12-29T13:00:00Z" },
        { id: "chat-22", text: "Safe flight everyone！下次再約！🙌🇯🇵", senderId: "sim-user-2", timestamp: "2025-12-29T15:00:00Z" },
        { id: "chat-23", text: "多謝大家！呢個 trip 真係好難忘 🥹 有你哋真好！", senderId: "sim-user-1", timestamp: "2025-12-29T15:05:00Z" }
    ],
    budget: [
        { id: "b-1", name: "機票 (CX520 來回 4人)", cost: 18000, currency: "HKD", category: "flight", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含 Economy Lite 行李額 23kg *4。國泰旗艦長途機。已預選位置。" },
        { id: "b-2", name: "N'EX 來回套票 (4人)", cost: 16280, currency: "JPY", category: "transport", payerId: "sim-user-4", splitType: "group", details: "【Mike 支付】成田機場店購買。只限外國護照。包含成田到新宿來回。" },
        { id: "b-3", name: "USJ 門票 + Express 4 (4人)", cost: 78000, currency: "JPY", category: "spot", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含 Super Nintendo World 入場。Mike 負責掃描 QR Code。" },
        { id: "b-4", name: "敘敘苑晚餐 (聖誕 Premium)", cost: 48000, currency: "JPY", category: "food", payerId: "sim-user-4", splitType: "group", details: "【Mike 支付】包含 Premium 牛舌特餐。全員聖誕慶功宴。窗邊景觀位。" },
        { id: "b-5", name: "Suica 加值 (全員一次)", cost: 20000, currency: "JPY", category: "transport", payerId: "sim-user-4", splitType: "group", details: "【Mike 任務】每人 ¥5000。Mike 負責 Apple Pay 統一充值。最後喺機場清空。" },
        { id: "b-shinkansen", name: "新幹線 Nozomi (東京-新大阪)", cost: 59000, currency: "JPY", category: "transport", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含特大行李預約位 (最後排)。Nozomi 21 號次。" },
        { id: "b-hotel1", name: "Hotel Gracery Shinjuku (3晚)", cost: 95000, currency: "JPY", category: "hotel", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】兩間 Twin Room。聖誕旺季價錢。" },
        { id: "b-hotel2", name: "W Osaka (2晚)", cost: 120000, currency: "JPY", category: "hotel", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】Wonderful Room。包含 1F 行李寄存服務。" },
        { id: "b-porter", name: "Porter Tanker XS (Sarah)", cost: 32000, currency: "JPY", category: "shopping", payerId: "sim-user-3", splitType: "individual", details: "【Sarah 自付】原宿限定版。已扣 10% 消費稅。" },
        { id: "b-donki", name: "藥妝掃貨 (Don Quijote)", cost: 25000, currency: "JPY", category: "shopping", payerId: "sim-user-4", splitType: "group", details: "【Mike 支付】全員藥妝統一採購。撒隆巴斯、龍角散、休足時間、EVE 止痛藥。已用 5% Coupon + Tax Free。" },
        { id: "b-kani", name: "蟹道樂晚餐 (道頓堀)", cost: 52000, currency: "JPY", category: "food", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】蟹懷石料理套餐。包含刺身、炭燒、火鍋。大阪地標打卡。" }
    ]
};


export const TAB_LABELS = {
    itinerary: { "zh-TW": "行程", "zh-HK": "行程", "en": "Itinerary" },
    shopping: { "zh-TW": "購物", "zh-HK": "買嘢", "en": "Shopping" },
    budget: { "zh-TW": "預算", "zh-HK": "銀包", "en": "Budget" },
    files: { "zh-TW": "文件", "zh-HK": "檔案", "en": "Files" },
    insurance: { "zh-TW": "保險", "zh-HK": "保險", "en": "Insurance" },
    emergency: { "zh-TW": "緊急", "zh-HK": "緊急", "en": "Emergency" },
    visa: { "zh-TW": "簽證", "zh-HK": "簽證", "en": "Visa" },
    notes: { "zh-TW": "筆記", "zh-HK": "筆記", "en": "Notes" },
    currency: { "zh-TW": "匯率", "zh-HK": "匯率", "en": "Currency" },
    settings: { "zh-TW": "設定", "zh-HK": "設定", "en": "Settings" }
};

// --- Modal Labels (i18n) ---
export const MODAL_LABELS = {
    // AddActivityModal
    addItem: { "zh-TW": "加入行程項目", "zh-HK": "加入行程", "en": "Add Activity" },
    editItem: { "zh-TW": "編輯行程項目", "zh-HK": "改行程", "en": "Edit Activity" },
    addPacking: { "zh-TW": "加入行李項目", "zh-HK": "加入行李", "en": "Add Packing Item" },
    editPacking: { "zh-TW": "編輯行李項目", "zh-HK": "改行李", "en": "Edit Packing Item" },
    name: { "zh-TW": "名稱", "zh-HK": "名", "en": "Name" },
    startTime: { "zh-TW": "開始時間", "zh-HK": "開始時間", "en": "Start Time" },
    endTime: { "zh-TW": "結束時間", "zh-HK": "結束時間", "en": "End Time" },
    optional: { "zh-TW": "選填", "zh-HK": "可唔填", "en": "Optional" },
    duration: { "zh-TW": "時長", "zh-HK": "時長", "en": "Duration" },
    durationMinutes: { "zh-TW": "預計時長 (分鐘)", "zh-HK": "預計幾耐 (分鐘)", "en": "Duration (mins)" },
    durationPlaceholder: { "zh-TW": "例如: 60", "zh-HK": "例如: 60", "en": "e.g. 60" },
    location: { "zh-TW": "地點", "zh-HK": "地點", "en": "Location" },
    locationPlaceholder: { "zh-TW": "輸入地點", "zh-HK": "入地點", "en": "Enter location" },
    origin: { "zh-TW": "出發地", "zh-HK": "起點", "en": "Origin" },
    destination: { "zh-TW": "目的地", "zh-HK": "終點", "en": "Destination" },
    amount: { "zh-TW": "金額", "zh-HK": "幾錢", "en": "Amount" },
    currency: { "zh-TW": "貨幣", "zh-HK": "貨幣", "en": "Currency" },
    payer: { "zh-TW": "付款人", "zh-HK": "邊個俾", "en": "Payer" },
    splitType: { "zh-TW": "分攤方式", "zh-HK": "點分", "en": "Split Type" },
    splitGroup: { "zh-TW": "多人均分", "zh-HK": "大家夾", "en": "Split Equally" },
    splitMe: { "zh-TW": "個人支出", "zh-HK": "自己俾", "en": "Personal" },
    estimatedTax: { "zh-TW": "預估稅金", "zh-HK": "預計稅", "en": "Est. Tax" },
    estimatedRefund: { "zh-TW": "預估退稅", "zh-HK": "退稅", "en": "Est. Refund" },
    flightInfo: { "zh-TW": "航班資訊", "zh-HK": "航班資料", "en": "Flight Info" },
    flightNumber: { "zh-TW": "航班編號", "zh-HK": "航班號碼", "en": "Flight No." },
    layover: { "zh-TW": "需轉機", "zh-HK": "要轉機", "en": "Layover" },
    nights: { "zh-TW": "晚", "zh-HK": "晚", "en": "Nights" },
    hotelNights: { "zh-TW": "住宿晚數", "zh-HK": "住幾晚", "en": "Hotel Nights" },
    cancel: { "zh-TW": "取消", "zh-HK": "取消", "en": "Cancel" },
    confirm: { "zh-TW": "確認加入", "zh-HK": "加入", "en": "Add Item" },
    save: { "zh-TW": "儲存變更", "zh-HK": "儲存", "en": "Save Changes" },
    aiInspiration: { "zh-TW": "AI 靈感", "zh-HK": "AI 靈感", "en": "AI Inspire" },
    minutes: { "zh-TW": "分鐘", "zh-HK": "分鐘", "en": "mins" },
    // Category labels
    spot: { "zh-TW": "景點", "zh-HK": "景點", "en": "Attraction" },
    food: { "zh-TW": "餐廳", "zh-HK": "食嘢", "en": "Restaurant" },
    shopping: { "zh-TW": "購物", "zh-HK": "買嘢", "en": "Shopping" },
    transport: { "zh-TW": "交通", "zh-HK": "交通", "en": "Transport" },
    flight: { "zh-TW": "航班", "zh-HK": "飛機", "en": "Flight" },
    hotel: { "zh-TW": "住宿", "zh-HK": "酒店", "en": "Hotel" },
    // Packing categories
    clothes: { "zh-TW": "衣物鞋履", "zh-HK": "衫褲鞋", "en": "Clothing" },
    toiletries: { "zh-TW": "個人護理", "zh-HK": "洗漱用品", "en": "Toiletries" },
    electronics: { "zh-TW": "電子產品", "zh-HK": "電子嘢", "en": "Electronics" },
    documents: { "zh-TW": "證件/文件", "zh-HK": "證件", "en": "Documents" },
    medicine: { "zh-TW": "藥品/急救", "zh-HK": "藥物", "en": "Medicine" },
    misc: { "zh-TW": "其他雜項", "zh-HK": "其他", "en": "Misc" }
};

// --- Smart Visual Assets ---

export const TYPE_DEFAULT_IMAGES = {
    spot: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&h=300&fit=crop',
    food: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    transport: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop',
    flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
    shopping: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
    // V1.2.4: Added missing types for tutorial images
    walk: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop',
    train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop',
    immigration: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop'
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
    // Tokyo
    "晴空塔": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
    "Skytree": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
    "東京鐵塔": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop",
    "Tokyo Tower": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop",
    "淺草寺": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "Senso-ji": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "雷門": "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=300&fit=crop",
    "隅田川": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop",
    "富士山": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
    "Mt. Fuji": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
    "迪士尼": "https://images.unsplash.com/photo-1505308144658-03c69861061a?w=400&h=300&fit=crop",
    "Disney": "https://images.unsplash.com/photo-1505308144658-03c69861061a?w=400&h=300&fit=crop",
    // Stations
    "新宿": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    "Shinjuku": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    "渋谷": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=300&fit=crop",
    "Shibuya": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=300&fit=crop",
    "東京站": "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop",
    "Tokyo Station": "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop",
    // Osaka
    "環球影城": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "USJ": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "Universal Studios": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "道頓堀": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "Dotonbori": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "心齋橋": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "Shinsaibashi": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
    "黑門市場": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    "Kuromon": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    "大阪城": "https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=400&h=300&fit=crop",
    "Osaka Castle": "https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=400&h=300&fit=crop",
    // Kyoto
    "清水寺": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    "Kiyomizu-dera": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    "伏見稻荷": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop",
    "Fushimi Inari": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop",
    "金閣寺": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    "Kinkaku-ji": "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400&h=300&fit=crop",
    // Taiwan
    "101": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    "Taipei 101": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    "九份": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    "Jiufen": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&h=300&fit=crop",
    // Transport
    "新幹線": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop",
    "Shinkansen": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop"
};
