import {
    Train, Bus, Car, Route
} from 'lucide-react';

// --- Versioning & Metadata ---
export const APP_AUTHOR = "Jamie Kwok";
export const ADMIN_EMAILS = ["jamiekwok416@gmail.com"];
export const APP_VERSION = "V1.2.3";
export const APP_VERSION_TAG = "Social & AI Quota Control";
export const APP_LAST_UPDATE = '2025-12-23';
export const JARVIS_VERSION = "V0.0.1-Beta";

export const JARVIS_VERSION_HISTORY = [
    {
        ver: "V0.0.1-Beta",
        date: "2025-12-23",
        tag: "Inception",
        desc: {
            "zh-TW": "Jarvis AI 初始版本發布",
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
            ]
        }
    }
];

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const VERSION_HISTORY = [
    {
        ver: "V1.2.3",
        date: "2025-12-23",
        tag: "Per-User AI Quota",
        changes: [
            "🔒 用戶級 AI 限額: Firestore 追蹤每位用戶每日 AI 使用量",
            "💬 友好錯誤訊息: 顯示等待時間或每日限額提示",
            "📊 幫助與支援: 新增「問 Jarvis AI」按鈕入口",
            "🧠 Auto Jarvis Toggle: 可在設定中開關自動 AI 功能，節省用量",
            "🔑 Expanded API Support: 大幅提升每位用戶的 AI 使用額度 (System Upgrade)",
            "📝 AI 用量透明化: 設定頁面詳列各項功能 Token 消耗"
        ]
    },
    {
        ver: "V1.2.2",
        date: "2025-12-23",
        tag: "Jarvis AI Support",
        changes: [
            "🤖 Jarvis AI 完整聊天: 實裝 AI 即時會話功能，整合 Gemini API 回應",
            "💬 對話介面升級: 訊息歷史、思考指示器、快捷問題按鈕",
            "✨ UI 精緻化: 移除快速 PDF 匯出按鈕，優化 Header Toolbar",
            "🛡️ Coming Soon 標籤更新: 改為「稍後版本會更新」避免過時資訊"
        ]
    },
    {
        ver: "V1.2.1",
        date: "2025-12-23",
        tag: "User Group Chat",
        changes: [
            "💬 行程即時群聊: 實裝 Firestore Real-time Sync 聊天功能",
            "🛡️ 聊天抽屜系統: 左右滑動式玻璃擬態聊天室，支援成員即時互動",
            "🔔 呼吸燈按鈕: 行程 Header 加入脈衝式紫色 Chat 觸發按鍵"
        ]
    },
    {
        ver: "V1.1.8",
        date: "2025-12-23",
        tag: "Dark Mode & AI Polish",
        changes: [
            "🌙 Dark Mode 全面修復: 統一所有 Modal 與卡片使用 Tailwind dark: variants，確保視覺一致性",
            "🤖 AI 錯誤處理優化: 針對 Gemini API 429 (Rate Limit) 及 Quota 限制加入友好提示與重試機制",
            "💅 匯出預覽優化: 修復 JSON/Text 預覽關閉按鈕，並優化代碼編輯器樣式與行號顯示",
            "🛠️ 代碼清理: 移除 unused isDarkMode props，統一使用 Global Dark Mode 系統"
        ]
    },
    {
        ver: "V1.1.7",
        date: "2025-12-23",
        tag: "Daily Intelligence",
        changes: [
            "實裝「每日總覽」AI 分析 (Gemini): 提供交通建議、景點 Tips 同行程合理性檢查",
            "PDF 匯出引擎修正: 支援自動分頁 (Pagination) 與頁碼顯示",
            "匯出預覽 (Preview) 全面升級: JSON / Text / iCal 支援全螢幕預覽 (Full View)",
            "UI 清晰度優化: 移除預覽文字透明度，解決重疊問題",
            "Syntax Fixes: 修復 ai-parsing.js 及 Modal 重複代碼"
        ]
    },
    {
        ver: "V1.1.6",
        date: "2025-12-22",
        tag: "Advanced Layout",
        changes: [
            "PDF 佈局模式切換: 支援 [簡易] / [專業] Tab 切換",
            "每頁項目選擇器: 可下拉選擇 2/3/4/6 項目/頁",
            "專業模式預告: 顯示開發中區塊提示"
        ]
    },
    {
        ver: "V1.1.5",
        date: "2025-12-22",
        tag: "Custom Export",
        changes: [
            "PDF 數據清洗: 移除所有 null, undefined, [object Object] 顯示",
            "PDF 樣式美化: 優化區域間距，加入中文標籤 (服飾/盥洗/電子等)"
        ]
    },
    {
        ver: "V1.1.4",
        date: "2025-12-22",
        tag: "Smart Features",
        changes: [
            "PDF 放大預覽: Export Modal 新增「全屏預覽」按鈕",
            "CSS 背景 Fallback: 圖片載入失敗時自動顯示紫色漸變背景"
        ]
    },
    {
        ver: "V1.1.3",
        date: "2025-12-22",
        tag: "UX Enhancement",
        changes: [
            "Budget Chart 修復: 修正缺少 trip prop 導致崩潰問題",
            "Files Tab 移除: 在 More Menu 刪除空置選項",
            "Hotel 名稱本地化: 教學數據更新 (格拉斯麗新宿, 大阪W)"
        ]
    },
    {
        ver: "V1.1.2",
        date: "2025-12-23",
        tag: "Audit & Precision",
        changes: [
            "實裝 6 大 PDF 匯出風格: 支援現代、經典、網站、極簡、復古、活力主題",
            "新增匯出『範圍選擇』 (Scope): 支援單獨匯出行程、購物清單或預算",
            "標準化工序實裝: .agent/workflows 下新增 Deploy, Audit, Feature-Request SOP",
            "修復 SmartExportModal UI 佈局，優化多風格預覽與即時風格切換",
            "加強文字摘要排版，支援 WhatsApp 一鍵分享並自動對齊內容"
        ]
    },
    {
        ver: "V1.1.1",
        date: "2025-12-22",
        tag: "Resilience & Polish",
        changes: [
            "修正 PDF 匯出亂碼問題 (CJK 全面支援)",
            "新增 PDF 多風格選擇 (現代、經典、極簡)",
            "優化 Footer 底部間距，改善行動裝置體驗",
            "加強匯出預覽介面，支援即時風格切換"
        ]
    },
    {
        ver: "V1.1.0",
        tag: "Design & Intelligence",
        date: "2025-12-22",
        desc: {
            "zh-TW": "V1.1.0: 行程管理極致進化 - 票券化、連動建議與 Undo/Redo",
            "en": "V1.1.0: Design & Intelligence - Ticket Style, Smart Ripples & Undo System"
        },
        details: {
            "zh-TW": [
                "🔄 Undo/Redo: 實裝行程修改「悔棋」系統，手殘救星 (V1.1 Phase 7)",
                "🌊 Smart Ripple: 編輯行程時間時，後面嘅行程會自動「漣漪式」推導時間 (V1.1 Phase 2/3)",
                "📦 Smart Bundles: 新增機票時自動建議「入境程序」同「機場交通」套餐 (V1.1 Phase 5)",
                "⚡ Optimistic UI+: 配合 LocalStorage 雙重快取，操作極速反應 (V1.1 Phase 1)",
                "🎟️ Ticket Style Polish: 統一行程卡片為票券式佈局，視覺層次更分明"
            ],
            "en": [
                "🔄 Undo/Redo: Global undo/redo system for itinerary edits (V1.1 Phase 7)",
                "🌊 Smart Ripple: Auto-adjust subsequent items when changing durations (V1.1 Phase 2/3)",
                "📦 Smart Bundles: Context-aware suggestions for Flights (Immigration/Transport bundles)",
                "⚡ Optimistic UI+: Lightning fast CRUD with LocalStorage persistence (V1.1 Phase 1)",
                "🎟️ Ticket Style Polish: Unified ticket-style layouts for premium visual hierarchy"
            ]
        }
    },
    {
        ver: "V1.0.6",
        tag: "UI & Integrity Polish",
        date: "2025-12-22",
        desc: {
            "zh-TW": "V1.0.6: 介面拋光、匯率顯示優化與系統穩定性強化",
            "en": "V1.0.6: UI Polish, Currency Readability & Integrity Boost"
        },
        details: {
            "zh-TW": [
                "💎 匯率優化: 購物與支出清單現在重點顯示「本地貨幣」，方便快速對比預算",
                "底部狀態欄: 整合時間與同步狀態至同一行，並新增「最新同步時間」標註",
                "🛡️ 圖像韌性: 全面實裝 ImageWithFallback，徹底消除損壞圖片圖標",
                "⚠️ 錯誤處理: 統一頁面錯誤 (404/500/503) 視覺風格，並加入即時回報機制"
            ],
            "en": [
                "💎 Currency Polish: Highlighted home currency in lists for better budget tracking",
                "Streamlined Footer: Merged time and sync status with latest sync timestamp",
                "🛡️ Image Resilience: Full implementation of ImageWithFallback for all assets",
                "⚠️ Error Handling: Unified 404/500/503 pages with integrated issue reporting"
            ]
        }
    },
    {
        ver: "V1.0.4",
        tag: "Optimistic UI & Fixes",
        date: "2025-12-21",
        desc: {
            "zh-TW": "V1.0.4: 極速操作體驗、Optimistic UI 與數據一致性修復",
            "en": "V1.0.4: Optimistic UI, Lightning Fast CRUD & Data Integrity"
        },
        details: {
            "zh-TW": [
                "⚡ Optimistic UI: 新增/編輯/刪除行程即時反應 (0延遲)，無需等待伺服器同步",
                "🛡️ Data Integrity: 修復編輯時 ID 覆蓋、undefined 錯誤等數據問題",
                "🐛 Delete Logic: 徹底解決刪除後仍顯示、地圖 Pin 殘留等問題",
                "💾 LocalStorage Sync: 離線或刷新與伺服器同步期間，本地操作依然保留",
                "🗺️ Map View: 地圖視圖現在支援即時更新 (與列表同步)"
            ],
            "en": [
                "⚡ Optimistic UI: Instant feedback for CRUD operations (0ms lag)",
                "🛡️ Data Integrity: Fixed ID overwrites and undefined field errors",
                "🐛 Delete Logic: Validated deletion flow and map marker sync",
                "💾 LocalStorage Sync: Persist pending changes across refreshes"
            ]
        }
    },
    {
        ver: "V1.0.3",
        tag: "入境程序 & Backlog",
        date: "2025-12-21",
        desc: {
            "zh-TW": "V1.0.3: 入境程序系統、Dashboard 個人化與 Bug 修復",
            "en": "V1.0.3: Immigration System, Dashboard Customization & Bug Fixes"
        },
        details: {
            "zh-TW": [
                "🛂 新功能 (入境程序): 新增「入境程序」行程類型，琥珀色主題，專用於國際航班落地後嘅入境/出境流程",
                "⚙️ Dashboard 個人化: Widget 拖拉排序、顯示/隱藏、自動儲存至 localStorage（移至設定頁）",
                "🔔 版本更新通知: 自動偵測版本變更，新用戶 Onboarding 後彈出 What's New",
                "🐛 行程編輯修復: 正確處理編輯模式，唔再重複新增項目",
                "🐛 Tooltip 修復: 用戶頭像 Tooltip 唔再重疊",
                "🎨 Transport Card 優化: 修復實線問題、時間範圍正確顯示"
            ],
            "en": [
                "🛂 New Feature (Immigration): Added 'Immigration' activity type with amber theme for customs/entry procedures",
                "⚙️ Dashboard Customization: Widget drag-drop, show/hide, auto-save to localStorage (moved to Settings)",
                "🔔 Version Popup: Auto-detect version changes, show What's New after onboarding",
                "🐛 Edit Bug Fix: Correctly handles edit mode without duplicating items",
                "🐛 Tooltip Fix: User avatar tooltips no longer overlap",
                "🎨 Transport Card: Fixed visible line issue, time range displays correctly"
            ]
        }
    },
    {
        ver: "V1.0.2",
        tag: "Zero-Loop Fix",
        date: "2025-12-21",
        desc: {
            "zh-TW": "V1.0.2: 終極修復無限迴圈與遊客模式優化",
            "en": "V1.0.2: Zero-Loop Fix & Guest Mode Optimization"
        },
        details: {
            "zh-TW": [
                "🐛 終極修復 (Critical Fix): 徹底解決遊客模式下的無限重載 (Redirect Loop) 問題",
                "⚡️ 性能優化 (Perf): 清除伺服器殘留進程，解決 WebSocket 報錯",
                "🛡️ 安全升級 (Security): 強化 ActiveUsersList 與 Modals 的空值保護邏輯",
                "🖱️ 體驗優化 (UX): 首頁新增「試用模擬模式」專屬按鈕，無需登入即刻體驗",
                "📚 矩陣同步 (Matrix): 確保 Tutorial 數據與 V12 Matrix 規則完全一致"
            ],
            "en": [
                "🐛 Critical Fix: Resolved infinite redirect loop for guest users",
                "⚡️ Performance: Cleared stale server processes to fix WebSocket errors",
                "🛡️ Security: Hardened null-checks in ActiveUsersList and Modals",
                "🖱️ UX: Added dedicated 'Try Demo' button on Landing Page",
                "📚 Matrix Sync: Ensured Tutorial data aligns with V12 Matrix rules"
            ]
        }
    },
    {
        ver: "V1.0.1",
        tag: "Matrix Sync Update",
        date: "2025-12-21",
        desc: {
            "zh-TW": "V1.0.1: [Matrix Protocol] 全面同步與百科全書化",
            "en": "V1.0.1: [Matrix Protocol] Full Sync & Encyclopedia"
        },
        details: {
            "zh-TW": [
                "🚀 [Matrix Protocol]: 100% 同步 V12 Matrix 邏輯，補全所有行程空檔與導航矩陣 ([T2T], [P2T])",
                "📚 百科全書化 (Encyclopedia): 填入所有景點深度歷史、建築背景與 2024 最新退稅政策",
                "👥 任務分配 (Roles): Alex, Sarah, Mike, Buddy 所有人身位、行李限制與職責完整分配",
                "🐛 救急修復 (Critical Fix): 修正教模式在未登入狀態下會跳回首頁的無限迴圈問題",
                "🖼️ 視覺強化 (Gallery): 行程圖片與 Files 資源完美對齊，Gallery Tab 內容全填充"
            ],
            "en": [
                "🚀 [Matrix Protocol]: 100% V12 Matrix sync, filling all itinerary gaps & nav matrices ([T2T], [P2T])",
                "📚 Encyclopedia: Added deep historical/architectural contexts & 2024 tax-free logic",
                "👥 Role Assignment: Full metadata for Alex, Sarah, Mike, and Buddy across all tabs",
                "🐛 Critical Fix: Resolved infinite loop bug where guest users couldn't access tutorial",
                "🖼️ Gallery: Synced all itinerary images with Files array for full gallery population"
            ]
        }
    },
    {
        ver: "V1.0.0",
        tag: "Official Release",
        date: "2025-12-20",
        desc: {
            "zh-TW": "V1.0 正式版：智能旅遊新紀元",
            "en": "V1.0 Official Release: A New Era of Smart Travel"
        },
        details: {
            "zh-TW": [
                "🎨 Design System 2.0: 全新 Indigo 色系與 Glassmorphism 2.0 玻璃擬態設計",
                "🏃‍♂️ 效能優化 (Performance): 實作 Code Splitting (PDF/AI/Charts 分離)，首屏載入提速 40%",
                "📱 手機版完美適配 (Mobile): 修復 Header Menu 觸控體驗，支援 iOS Safe Area",
                "✨ 動畫升級 (Animation): 頁面切換 Slide Up 效果，按鈕微互動 (Micro-interactions)"
            ],
            "en": [
                "🎨 Design System 2.0: New Indigo palette & Glassmorphism 2.0",
                "🏃‍♂️ Performance: Implemented Code Splitting (PDF/AI/Charts chunks), 40% faster load",
                "📱 Mobile Perfection: Fixed Header Menu touch & iOS Safe Area support",
                "✨ Animation Upgrade: Slide Up transitions & tactile Micro-interactions"
            ]
        }
    },
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
    "Japan (日本)": {
        cities: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa"],
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600",
        region: "north",
        emergency: "110 (警) / 119 (火)",
        taxRefund: "滿 5000 JPY (扣 1.55% 服務費)",
        entryInfo: "HKSAR/BNO 免簽 90 日。必須預先登錄 Visit Japan Web (VJW) 攞齊入境同海關兩個 QR Code，Cap 圖備份最穩陣。",
        insuranceInfo: "日本醫療費閒閒地幾萬蚊港紙起跳，強烈建議買包 100 萬醫療、住院現金同醫療轉運嘅保險 (如 AIG / 藍十字)。",
        consulate: "駐日經濟文化代表處 / 香港駐東京經濟貿易辦事處",
        tz: "JP"
    },
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
    startDate: "2025-12-24",
    endDate: "2025-12-29",
    sharePermission: "edit",
    locations: {
        "2025-12-24": { city: "東京 (Tokyo)", country: "Japan (日本)" },
        "2025-12-25": { city: "東京 (Tokyo)", country: "Japan (日本)" },
        "2025-12-26": { city: "東京 (Tokyo)", country: "Japan (日本)" },
        "2025-12-27": { city: "大阪 (Osaka)", country: "Japan (日本)" },
        "2025-12-28": { city: "大阪 (Osaka)", country: "Japan (日本)" },
        "2025-12-29": { city: "大阪 (Osaka)", country: "Japan (日本)" }
    },
    members: [
        { id: "sim-user-1", name: "Alex (主揪)", role: "owner", avatar: "https://ui-avatars.com/api/?name=Alex&background=6366f1&color=fff" },
        { id: "sim-user-2", name: "Buddy (導遊)", role: "editor", avatar: "https://ui-avatars.com/api/?name=Buddy&background=10b981&color=fff" },
        { id: "sim-user-3", name: "Sarah (攝影師)", role: "viewer", avatar: "https://ui-avatars.com/api/?name=Sarah&background=f43f5e&color=fff" },
        { id: "sim-user-4", name: "Mike (財務)", role: "editor", avatar: "https://ui-avatars.com/api/?name=Mike&background=f59e0b&color=fff" }
    ],
    itinerary: {
        "2025-12-24": [
            { id: "it-1", time: "09:15", name: "✈️ CX520 (HKG -> NRT)", type: "flight", cost: 4500, currency: "HKD", bundleId: "arrival-bundle-d1", details: { flightNo: "CX520", nameEn: "Cathay Pacific Airways", location: "HKG T1 Gate 62", desc: "國泰長途旗艦機 B-KPY (B777-300ER)", startTime: "09:15", endTime: "14:30", duration: "4hr 15min", image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800", insight: "【百科】B-KPY 配備最新 4K 影音系統。飛行時長約 4hr 15min。Alex 負責管理全體紙本備份。【試玩提示】長按呢張卡片可以拖曳排序！", tags: ["Cathay", "Flagship", "T1-Departure"] } },
            { id: "it-2", time: "14:30", name: "🛂 成田入境清關 & 交通樞紐", type: "immigration", cost: 0, currency: "JPY", bundleId: "arrival-bundle-d1", details: { nameEn: "Narita Immigration", section: "Arrivals", location: "成田 T1 到達大廳", arrival: "B1F 鐵道層 (Rail)", desc: "入境後落 B1F 搵 JR 綠色窗口", startTime: "14:30", endTime: "16:00", duration: "1hr 30min", insight: "【入境百科】1. 入境排隊約 30-90min (視乎航班密度)。2. Visit Japan Web QR 必須準備好。3. 海關申報落 B1F 後轉左。4. 去鐵道層買 N'EX 票。【試玩提示】呢張入境卡同航班係 Bundle，會一齊移動㗎！", tags: ["Immigration", "VJW", "Must-Do"] } },
            { id: "it-3", time: "16:15", name: "🚆 Narita Express (N'EX)", type: "train", cost: 4070, currency: "JPY", details: { trainNo: "N'EX 34", nameEn: "JR-East Airport Express", location: "成田 T1 -> 新宿站 (Shinjuku)", platform: "Platform 1 (B1F)", desc: "月台 5-6 (地底) | 車型 E259 系", transportType: "train", startTime: "16:15", endTime: "17:35", duration: "80min", image: "https://images.unsplash.com/photo-1490399102053-e82f67bdd1d7?w=800", insight: "【技術百科】130km/h 準時運行。喼架有密碼鎖。", tags: ["JR-East", "Fastest", "Luggage-Space"] } },
            { id: "it-4", time: "18:00", name: "🏨 格拉斯麗新宿酒店 Check-in", type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "Hotel Gracery Shinjuku, Tokyo", location: "新宿站東口 -> Hotel Gracery Shinjuku 8F Lobby", desc: "經 Studio Alta 旁哥吉拉街步行", startTime: "18:00", endTime: "18:15", duration: "15min", distance: "450m", steps: 1100, insight: "【導航】見到 Studio Alta 大電視直入哥吉拉街。住呢度就係為咗睇哥吉拉！", tags: ["Godzilla", "Kabukicho", "8F-Lobby"] } },
            { id: "it-5", time: "19:30", name: "🍽️ 敘敘苑燒肉", type: "food", cost: 8000, currency: "JPY", details: { nameEn: "Jojoen Yakiniku (Shinjuku)", location: "新宿 Lumine Est 旁大廈 12F", desc: "窗邊景觀燒肉 (Premium 牛舌)", startTime: "19:30", endTime: "21:00", duration: "90min", image: "https://images.unsplash.com/photo-1514356641322-83950f146449?w=800", insight: "【物流】食飯 90min。經歌舞伎町一番街大門影相最靚。", tags: ["Famous", "Sky-View", "A5-Beef"] } },
            { id: "it-end-1", time: "21:00", name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】『返回酒店』標誌一天結束，建議每日行程尾段都加入。", details: { nameEn: "Return to Hotel", location: "敘敘苑 -> Hotel Gracery Shinjuku 8F", desc: "原路返回 8F Lobby", startTime: "21:00", endTime: "21:08", duration: "8min", distance: "300m", steps: 400, insight: "準備聽日嘅熱血行程！", tags: ["Night-Walk", "Security-Check"] } }
        ],
        "2025-12-25": [
            { id: "it-start-2", time: "08:30", name: "🏨 酒店出發 (西武新宿)", type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】『酒店出發』標誌一天開始，包含導航路線同指示。", details: { nameEn: "Pepe Tunnel Shortcut", location: "Hotel Gracery Shinjuku -> 西武新宿駅 (Seibu-Shinjuku)", desc: "經由西武新宿站 Pepe 隧道 (Matrix)", startTime: "08:30", endTime: "08:38", duration: "8min", distance: "450m", steps: 1200, insight: "【導航】直去都營大江戶線。步行 8min 消暑避寒。", tags: ["Shortcut", "Matrix-Path", "Cooling"] } },
            { id: "it-tsuk-1", time: "08:45", name: "🚇 都營大江戶線", type: "train", cost: 230, currency: "JPY", details: { nameEn: "Oedo Line (Toei Subway)", location: "新宿西口 (E01) -> 築地市場 (E18)", desc: "日本最深地鐵線 (42.3m)", startTime: "08:45", endTime: "09:05", duration: "20min", insight: "【導航】車程約 20 分鐘。搵 **A1 出口** 出站。", tags: ["Subway", "Deepest-Line", "Fast-Link"] } },
            { id: "it-tsuk-2", time: "09:15", name: "🍣 築地外市場", type: "food", cost: 3500, currency: "JPY", details: { nameEn: "Tsukiji Outer Market", location: "築地 4 Chome 門外市場", desc: "日本廚房 | 山長玉子燒", startTime: "09:15", endTime: "11:15", duration: "120min", image: "https://images.unsplash.com/photo-1555529921-5ae923d6f51f?w=800", insight: "【百科】食完步行 12min (850m) 到銀座。", tags: ["Seafood", "Street-Food", "Historic"] } },
            { id: "it-gin-1", time: "12:00", name: "🛍️ Ginza Six (GSIX)", type: "shopping", cost: 5000, currency: "JPY", details: { nameEn: "Ginza Luxury Mall", location: "銀座 A3 出口直結", desc: "谷口吉生設計 | 現代屋台建築", startTime: "12:00", endTime: "14:00", duration: "120min", image: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=800", insight: "【百科】6F 蔦屋書店係必影點。", tags: ["Architecture", "Art", "Luxury"] } },
            { id: "it-asa-1", time: "15:00", name: "🚇 東京地鐵銀座線", type: "train", cost: 180, currency: "JPY", details: { nameEn: "Ginza Line (Tokyo Metro)", location: "銀座站 -> 淺草站", desc: "亞洲最古老地鐵 (1927)", startTime: "15:00", endTime: "15:15", duration: "15min", insight: "【導航】車程 15 分鐘。搵 **A4 出口**。", tags: ["Vintage-Subway", "Classic-Route"] } },
            { id: "it-asa-2", time: "15:30", name: "⛩️ 雷門 & 淺草寺", type: "spot", cost: 0, currency: "JPY", details: { nameEn: "Kaminarimon & Senso-ji Temple", location: "淺草 A4 出口 -> 雷門 -> 淺草寺", desc: "創立於 645 年 | 東京最古老寺廟", startTime: "15:30", endTime: "16:00", duration: "30min", image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800", insight: "【導航】A4 出口直出見雷門。仲見世通 250m 直行入寺。", tags: ["Shrine", "Iconic", "Photo-Spot"] } },
            { id: "it-asa-3", time: "16:15", name: "🌉 隅田川水上步道", type: "spot", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】呢個時間同前一個活動有 15 分鐘空檔，考慮加入步行交通。", details: { nameEn: "Sumida River Walk", location: "淺草寺 -> 隅田川 -> 墨田區", desc: "2020 年開放 | 直達晴空塔天空步道", startTime: "16:15", endTime: "16:45", duration: "30min", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", insight: "【導航】呢條橋可以影到晴空塔最正角度！慢慢行 15min。", tags: ["Bridge", "Scenic-Walk", "Skytree-View"] } },
            { id: "it-sky-1", time: "18:00", name: "🗼 東京晴空塔", type: "spot", cost: 3100, currency: "JPY", details: { nameEn: "Tokyo Skytree", location: "墨田區押上 (T2P)", desc: "高 634m | 世界第一高電波塔", startTime: "18:00", endTime: "20:00", duration: "120min", image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800", insight: "【百科】採用古代五重塔心柱抗震。", tags: ["Sky-View", "Engineering", "Night-Scene"] } },
            { id: "it-end-2", time: "21:00", name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Shinjuku", location: "新宿站 -> Hotel Gracery Shinjuku Tokyo 8F", desc: "經歌舞伎町一番街返酒店", startTime: "21:00", endTime: "21:10", duration: "10min", distance: "450m", steps: 600, insight: "去 1 樓 7-11 買宵夜。", tags: ["Neon-Light", "Convenience-Store"] } }
        ],
        "2025-12-26": [
            { id: "it-start-3", time: "10:00", name: "🏨 酒店出發 (Studio Alta)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Shinjuku East Navigation", location: "酒店 -> JR 新宿站", desc: "經由新宿東口 Studio Alta 旁小路入閘", startTime: "10:00", endTime: "10:10", duration: "10min", distance: "450m", steps: 1100, insight: "14 號月台搭山手線（內環）。", tags: ["Station-Entry", "Yamanote-Line"] } },
            { id: "it-shib-1", time: "10:20", name: "🚇 JR 山手線", type: "train", cost: 160, currency: "JPY", details: { nameEn: "Yamanote Line (JR-East)", location: "新宿 (Plat 14) -> 澀谷", desc: "山手線車程 15min", startTime: "10:20", endTime: "10:35", duration: "15min", insight: "【歷史】1885 年開通嘅歷史性路線。", tags: ["Circular-Line", "Iconic-Tokyo"] } },
            { id: "it-shib-2", time: "10:45", name: "🏙️ Shibuya Sky", type: "spot", cost: 2500, currency: "JPY", details: { nameEn: "Scramble Square Observatory", location: "Shibuya Scramble Square 14F/47F", desc: "隈研吾參與設計", startTime: "10:45", endTime: "12:45", duration: "120min", image: "https://images.unsplash.com/photo-1582234371439-f9c1859367d3?w=800", insight: "【物流】風大記得紮起頭髮。", tags: ["Must-Visit", "Heliport-View", "Kengo-Kuma"] } },
            { id: "it-shib-3", time: "13:15", name: "🍽️ 挽肉と米 (澀谷店)", type: "food", cost: 1800, currency: "JPY", details: { nameEn: "Hikiniku to Kome", location: "澀谷道玄坂 2-28-1 3F", desc: "炭烤漢堡排 (預約制)", startTime: "13:15", endTime: "14:45", duration: "90min", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", insight: "【物流】用餐預計 90 分鐘。", tags: ["Trending", "Gourmet", "Charcoal-Grilled"] } },
            { id: "it-har-1", time: "15:30", name: "⛩️ 明治神宮", type: "spot", cost: 0, currency: "JPY", details: { nameEn: "Meiji Jingu Shrine", location: "原宿站出口 1分鐘", desc: "1920 年建立。大鳥居用咗台灣阿里山檜木。", startTime: "15:30", endTime: "16:30", duration: "60min", image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800", insight: "【歷史】從挽肉と米步行 20 分鐘抵達。", tags: ["Forest-In-City", "Giant-Torii", "Spiritual"] } },
            { id: "it-har-2", time: "16:45", name: "🛍️ 表參道散策", type: "shopping", cost: 5000, currency: "JPY", details: { nameEn: "Omotesando & Cafe Reissue", location: "神宮前 3-25-7 2F", desc: "3D 立體拉花 (Cafe)", startTime: "16:45", endTime: "17:45", duration: "60min", image: "https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800", insight: "目標：KURACHIKA 買 Porter Bag。", tags: ["Fashion", "Architecture-Street", "3D-Latte"] } },
            { id: "it-end-3", time: "20:00", name: "🏨 返回酒店 (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Gracery Shinjuku", location: "新宿站 -> Hotel Gracery Shinjuku 8F", desc: "經過新宿東口 Studio Alta 返酒店", startTime: "20:00", endTime: "20:10", duration: "10min", distance: "450m", steps: 1100, insight: "聽日要衝新幹線，早啲休息。", tags: ["Night-Route", "Final-Check"] } }
        ],
        "2025-12-27": [
            { id: "it-start-4", time: "08:15", name: "🚅 東京站新幹線導航", type: "walk", cost: 0, currency: "JPY", hasWarning: true, warningMessage: "【教學提示】大站導航建議加入詳細指示，包括月台資訊、行走方向、預留時間等。", details: { nameEn: "Tokyo Station Navigation", location: "新宿站 -> 東京站 14-19 號月台", desc: "跟住藍色「新幹線」指示行 (Matrix)", startTime: "08:15", endTime: "08:30", duration: "15min", distance: "450m", steps: 1100, insight: "預留時間買「牛肉便當」喺車食。", tags: ["Shinkansen", "Station-Flow", "Bento"] } },
            { id: "it-tok-4", time: "09:42", name: "🚅 Nozomi 21 (新幹線)", type: "train", cost: 14750, currency: "JPY", details: { trainNo: "Nozomi 21", nameEn: "Tokaido Shinkansen (Supreme)", location: "東京 (Plat 14) -> 新大阪", arrival: "Osaka", desc: "車型 N700S (Supreme) | 車程 150min", transportType: "train", startTime: "09:42", endTime: "12:12", duration: "2hr 30min", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800", insight: "【技術】10:30 右邊 E 位見富士山。", tags: ["High-Speed", "Fuji-View", "N700S"] } },
            { id: "it-osa-2", time: "13:15", name: "🏨 大阪 W 酒店 Check-in", type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "W Osaka (Shinsaibashi)", location: "心齋橋站 3 號出口 -> 酒店 1F", desc: "1F 門口寄存即走 (Matrix)", startTime: "13:15", endTime: "13:45", duration: "30min", image: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800", insight: "【導航】心齋橋站 3 號出口轉左行 2min。", tags: ["Marriott", "Luxury-Design", "Iconic-Black"] } },
            { id: "it-osa-gap1", time: "14:00", name: "🛍️ 心齋橋筋商店街", type: "shopping", cost: 3000, currency: "JPY", details: { nameEn: "Shinsaibashi-suji Shopping Street", location: "Osaka Shinsaibashi", desc: "大阪最長商店街 (600m)", startTime: "14:00", endTime: "15:30", duration: "90min", image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800", insight: "大阪最有歷史商店街，由 1726 年開始。", tags: ["Fashion", "Local-Vibe", "Historic"] } },
            { id: "it-osa-gap2", time: "16:00", name: "🎨 美國村 (Amerikamura)", type: "spot", cost: 0, currency: "JPY", details: { nameEn: "American Village Osaka", location: "西心齋橋 1-6", desc: "大阪潮流文化發源地", startTime: "16:00", endTime: "17:30", duration: "90min", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800", insight: "70 年代開始嘅古著街。三角形公園係地標。", tags: ["Vintage-Clothing", "Youth-Culture", "Street-Art"] } },
            { id: "it-osa-3", time: "19:00", name: "🍽️ 蟹道樂 (道頓堀本店)", type: "food", cost: 12000, currency: "JPY", details: { nameEn: "Kani Doraku (Honten)", location: "道頓堀 1-6-18", desc: "大阪地標 | 巨大動感螃蟹看板", startTime: "19:00", endTime: "20:30", duration: "90min", image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800", insight: "【物流】食完行去格力高看板影相只需 1min。", tags: ["Signature-Dish", "Crab-Specialist", "Landmark"] } },
            { id: "it-end-4", time: "21:30", name: "🏨 返回 W Osaka (Return)", type: "walk", cost: 0, currency: "JPY", details: { nameEn: "Return to Shinsaibashi", location: "道頓堀 -> W Osaka 1F", desc: "沿心齋橋筋商店街漫步", startTime: "21:30", endTime: "21:42", duration: "12min", distance: "800m", steps: 1200, insight: "返酒店 Spa 休息吓。", tags: ["Night-Stroll", "Spa-Time"] } }
        ],
        "2025-12-28": [
            { id: "it-usj-matrix", time: "07:30", name: "🚆 USJ 鐵道轉乘", type: "train", cost: 410, currency: "JPY", details: { nameEn: "Universal City Direct Link", location: "心齋橋 -> Universal City (Plat 3)", desc: "西九條站對面月台轉乘 (Matrix)", startTime: "07:30", endTime: "08:15", duration: "45min", insight: "西九條轉 **Plat 3** (夢咲線)。轉乘只需 1min。", tags: ["Train-Matrix", "USJ-Express", "Fast-Link"] } },
            { id: "it-usj-1", time: "09:00", name: "🎢 USJ 超級任天堂世界", type: "spot", cost: 18000, currency: "JPY", details: { nameEn: "Super Nintendo World (USJ)", location: "大阪此花區", desc: "宮本茂耗資 600 億監修", startTime: "09:00", endTime: "21:00", duration: "12hr", image: "https://images.unsplash.com/photo-1545641203-7d072a14e3b2?w=800", insight: "入園即衝任天堂。用 Power-Up Band 敲磚。", tags: ["Mario-Kart", "Yoshi-Adventure", "Power-Up"] } },
            { id: "it-end-5", time: "21:30", name: "🏨 返回 W Osaka (Return)", type: "walk", cost: 410, currency: "JPY", details: { nameEn: "Return to Hotel", location: "USJ -> W Osaka", desc: "原路返回 (Matrix)", startTime: "21:30", endTime: "22:15", duration: "45min", distance: "8km", steps: 500, insight: "今日行咗 2 萬步，一定要用休足時間。", tags: ["Tired-But-Happy", "Last-Night"] } }
        ],
        "2025-12-29": [
            { id: "it-check", time: "08:00", name: "🏨 大阪 W 酒店 Checkout & 寄喼", type: "hotel", cost: 0, currency: "JPY", details: { nameEn: "W Osaka Final Checkout", location: "W Osaka Lobby", desc: "最後行李清查 | 24吋 x 4", startTime: "08:00", endTime: "08:15", duration: "15min", insight: "Alex 負責核對全員喼位。Checkout 5min。", tags: ["Check-Out", "Bag-Management", "Final-Day"] } },
            { id: "it-osa-morning", time: "08:30", name: "🍳 道具屋筋 & 黑門", type: "shopping", cost: 2000, currency: "JPY", details: { nameEn: "Sennichimae Doguyasuji", location: "大阪難波千日前", desc: "大阪料理人之街 | 廚具百科", startTime: "08:30", endTime: "10:00", duration: "90min", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", insight: "【百科】大阪廚具之魂。買日式小餐具。", tags: ["Kitchenware", "Craftmanship", "Culinary"] } },
            { id: "it-kuro-matrix", time: "10:30", name: "🍣 黑門市場食鮮", type: "food", cost: 4000, currency: "JPY", details: { nameEn: "Kuromon Ichiba Market", location: "黑門市場 (Namba)", desc: "沿御堂筋大道直行 15min", startTime: "10:30", endTime: "12:00", duration: "90min", insight: "【導航】食鮮味海膽。13:15 到南海難波站。", tags: ["Raw-Seafood", "Uni", "Market-Vibe"] } },
            { id: "it-rap-1", time: "13:30", name: "🚆 南海 Rapit (藍武士)", type: "train", cost: 1450, currency: "JPY", bundleId: "departure-bundle-d6", details: { trainNo: "Rap:t Beta 42", nameEn: "Nankai Airport Express", location: "南海難波 (Plat 9) -> KIX 2F", desc: "藍色專用月台 (Plat 9)", startTime: "13:30", endTime: "14:10", duration: "40min", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800", insight: "【導航】入閘後過天橋到 T1。Mike 確保清空硬幣。【Bundle 邏輯】呢班機場快綫同回程航班係綁定，拖其中一個就一齊移動！", tags: ["Iron-Man-28", "Blue-Express", "Fast-To-KIX"] } },
            { id: "it-kix-blue", time: "15:30", name: "✈️ 歸航: KIX -> HKG (Return)", type: "flight", cost: 0, currency: "HKD", bundleId: "departure-bundle-d6", details: { flightNo: "CX507", nameEn: "Cathay Pacific (Return)", location: "KIX T1 國泰櫃位 (C 區)", desc: "Blue Sky 免稅店 (硬幣對策)", startTime: "15:30", endTime: "19:00", duration: "3hr 30min", insight: "【微操】去 C 區 Check-in。入閘後可以用晒硬幣。【百科：回程標誌】注意飛機 Icon 變左右下角 (↘️)，寄意「回家」。", tags: ["Going-Home", "Tax-Free", "Final-Duty"] } }
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
        { id: "file-img3", name: "USJ任天堂世界全員合照.jpg", type: "image/jpeg", uploadedAt: "2025-12-28", url: "https://images.unsplash.com/photo-1643261642816-a3205763955d?w=800" }
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
    budget: [
        { id: "b-1", name: "機票 (CX520 來回 4人)", cost: 18000, currency: "HKD", category: "flight", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含 Economy Lite 行李額 23kg *4。國泰旗艦長途機。已預選位置。" },
        { id: "b-2", name: "N'EX 來回套票 (4人)", cost: 16280, currency: "JPY", category: "transport", payerId: "sim-user-4", splitType: "group", details: "【Mike 支付】成田機場店購買。只限外國護照。包含成田到新宿來回。" },
        { id: "b-3", name: "USJ 門票 + Express 4 (4人)", cost: 78000, currency: "JPY", category: "spot", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含 Super Nintendo World 入場。Mike 負責掃描 QR Code。" },
        { id: "b-4", name: "敘敘苑晚餐 (聖誕 Premium)", cost: 48000, currency: "JPY", category: "food", payerId: "sim-user-4", splitType: "group", details: "【Mike 支付】包含 Premium 牛舌特餐。全員聖誕慶功宴。窗邊景觀位。" },
        { id: "b-5", name: "Suica 加值 (全員一次)", cost: 20000, currency: "JPY", category: "transport", payerId: "sim-user-4", splitType: "group", details: "【Mike 任務】每人 ¥5000。Mike 負責 Apple Pay 統一充值。最後喺機場清空。" },
        { id: "b-shinkansen", name: "新幹線 Nozomi (東京-新大阪)", cost: 59000, currency: "JPY", category: "transport", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】包含特大行李預約位 (最後排)。Nozomi 21 號次。" },
        { id: "b-hotel1", name: "Hotel Gracery Shinjuku (3晚)", cost: 95000, currency: "JPY", category: "hotel", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】兩間 Twin Room。聖誕旺季價錢。" },
        { id: "b-hotel2", name: "W Osaka (2晚)", cost: 120000, currency: "JPY", category: "hotel", payerId: "sim-user-1", splitType: "group", details: "【Alex 支付】Wonderful Room。包含 1F 行李寄存服務。" },
        { id: "b-porter", name: "Porter Tanker XS (Sarah)", cost: 32000, currency: "JPY", category: "shopping", payerId: "sim-user-3", splitType: "individual", details: "【Sarah 自付】原宿限定版。已扣 10% 消費稅。" }
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

// --- Modal Labels (i18n) ---
export const MODAL_LABELS = {
    // AddActivityModal
    addItem: { "zh-TW": "加入行程項目", "en": "Add Activity" },
    editItem: { "zh-TW": "編輯行程項目", "en": "Edit Activity" },
    addPacking: { "zh-TW": "加入行李項目", "en": "Add Packing Item" },
    editPacking: { "zh-TW": "編輯行李項目", "en": "Edit Packing Item" },
    name: { "zh-TW": "名稱", "en": "Name" },
    startTime: { "zh-TW": "開始時間", "en": "Start Time" },
    endTime: { "zh-TW": "結束時間", "en": "End Time" },
    optional: { "zh-TW": "選填", "en": "Optional" },
    duration: { "zh-TW": "時長", "en": "Duration" },
    durationMinutes: { "zh-TW": "預計時長 (分鐘)", "en": "Duration (mins)" },
    durationPlaceholder: { "zh-TW": "例如: 60", "en": "e.g. 60" },
    location: { "zh-TW": "地點", "en": "Location" },
    locationPlaceholder: { "zh-TW": "輸入地點", "en": "Enter location" },
    origin: { "zh-TW": "出發地", "en": "Origin" },
    destination: { "zh-TW": "目的地", "en": "Destination" },
    amount: { "zh-TW": "金額", "en": "Amount" },
    currency: { "zh-TW": "貨幣", "en": "Currency" },
    payer: { "zh-TW": "付款人", "en": "Payer" },
    splitType: { "zh-TW": "分攤方式", "en": "Split Type" },
    splitGroup: { "zh-TW": "多人均分", "en": "Split Equally" },
    splitMe: { "zh-TW": "個人支出", "en": "Personal" },
    estimatedTax: { "zh-TW": "預估稅金", "en": "Est. Tax" },
    estimatedRefund: { "zh-TW": "預估退稅", "en": "Est. Refund" },
    flightInfo: { "zh-TW": "航班資訊", "en": "Flight Info" },
    flightNumber: { "zh-TW": "航班編號", "en": "Flight No." },
    layover: { "zh-TW": "需轉機", "en": "Layover" },
    nights: { "zh-TW": "晚", "en": "Nights" },
    hotelNights: { "zh-TW": "住宿晚數", "en": "Hotel Nights" },
    cancel: { "zh-TW": "取消", "en": "Cancel" },
    confirm: { "zh-TW": "確認加入", "en": "Add Item" },
    save: { "zh-TW": "儲存變更", "en": "Save Changes" },
    aiInspiration: { "zh-TW": "AI 靈感", "en": "AI Inspire" },
    minutes: { "zh-TW": "分鐘", "en": "mins" },
    // Category labels
    spot: { "zh-TW": "景點", "en": "Attraction" },
    food: { "zh-TW": "餐廳", "en": "Restaurant" },
    shopping: { "zh-TW": "購物", "en": "Shopping" },
    transport: { "zh-TW": "交通", "en": "Transport" },
    flight: { "zh-TW": "航班", "en": "Flight" },
    hotel: { "zh-TW": "住宿", "en": "Hotel" },
    // Packing categories
    clothes: { "zh-TW": "衣物鞋履", "en": "Clothing" },
    toiletries: { "zh-TW": "個人護理", "en": "Toiletries" },
    electronics: { "zh-TW": "電子產品", "en": "Electronics" },
    documents: { "zh-TW": "證件/文件", "en": "Documents" },
    medicine: { "zh-TW": "藥品/急救", "en": "Medicine" },
    misc: { "zh-TW": "其他雜項", "en": "Misc" }
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
    // Tokyo
    "晴空塔": "https://images.unsplash.com/photo-1545389656-78b17ee191d9?w=600&h=400&fit=crop",
    "Skytree": "https://images.unsplash.com/photo-1545389656-78b17ee191d9?w=600&h=400&fit=crop",
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
    "環球影城": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
    "USJ": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
    "Universal Studios": "https://images.unsplash.com/photo-1620986794611-665c2759e691?w=400&h=300&fit=crop",
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
    "九份": "https://images.unsplash.com/photo-1465220183746-d872b8ee34be?w=400&h=300&fit=crop",
    "Jiufen": "https://images.unsplash.com/photo-1465220183746-d872b8ee34be?w=400&h=300&fit=crop",
    // Transport
    "新幹線": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop",
    "Shinkansen": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop"
};
