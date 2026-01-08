import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "common": {
                "search": "Search...",
                "cancel": "Cancel",
                "save": "Save",
                "delete": "Delete",
                "edit": "Edit",
                "loading": "Loading...",
                "ask_jarvis": "Ask Jarvis AI"
            },
            "dashboard": {
                "title": "Travel Dashboard",
                "my_trips": "My Trips",
                "new_trip": "Plan New Trip",
                "no_trips": "No trips found. Start by planning one!"
            },
            "trip": {
                "itinerary": "Itinerary",
                "budget": "Budget",
                "members": "Members",
                "settings": "Settings",
                "days": "Days",
                "add_activity": "Add Activity",
                "views": {
                    "list": "List",
                    "board": "Board",
                    "kanban": "Kanban",
                    "timeline": "Timeline",
                    "map": "Map"
                },
                "header": {
                    "overview": "Trip Overview",
                    "public": "Public",
                    "days_label": "DAYS",
                    "days_trip": "Days Trip"
                },
                "actions": {
                    "jarvis_daily": "Jarvis Daily",
                    "smart_import": "Smart Import",
                    "share": "Share",
                    "plan_trip": "Plan Trip",
                    "manual_add": "Manual Add",
                    "jarvis_suggest": "Jarvis Suggest",
                    "jarvis_optimize": "Jarvis Optimize",
                    "manage_members": "Manage Members",
                    "invite_friends": "Invite Friends",
                    "delete_trip": "Delete Trip",
                    "owner_only": "Owner Only",
                    "undo": "Undo",
                    "redo": "Redo",
                    "edit_settings": "Edit Settings",
                    "open_chat": "Open Chat"
                },
                "status": {
                    "ended": "Ended",
                    "ongoing": "Ongoing",
                    "countdown": "Days to go",
                    "ready": "Ready"
                },
                "footer": {
                    "people": "People",
                    "items": "Items",
                    "view_details": "Details"
                },
                "location": {
                    "select_country": "Select Country",
                    "multi_city": "Multi-City"
                },
                "create_modal": {
                    "title": "Create New Trip",
                    "subtitle": "Select destinations or enter custom ones.",
                    "trip_name": "Trip Name",
                    "placeholder_name": "e.g. Europe Cultural Tour",
                    "jarvis_name_tip": "Jarvis Auto Naming (requires destination)",
                    "dest_country": "Destination Country",
                    "placeholder_country": "Search countries...",
                    "main_city": "Main City",
                    "placeholder_city": "Search cities...",
                    "add_custom": "Add",
                    "no_cities": "No cities found, type and click 'Add'",
                    "trip_dates": "Trip Dates",
                    "placeholder_dates": "Select start and end dates",
                    "create_btn": "Create Trip 🚀"
                }
            }
        }
    },
    zh: {
        translation: {
            "common": {
                "search": "搜尋...",
                "cancel": "取消",
                "save": "儲存",
                "delete": "刪除",
                "edit": "編輯",
                "loading": "載入中...",
                "ask_jarvis": "問問 Jarvis AI"
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我的行程",
                "new_trip": "規劃新行程",
                "no_trips": "目前還沒有行程，快來規劃一個吧！"
            },
            "trip": {
                "itinerary": "行程詳細",
                "budget": "預算管理",
                "members": "共乘好友",
                "settings": "行程設定",
                "days": "天數",
                "add_activity": "新增活動",
                "views": {
                    "list": "列表",
                    "board": "看板",
                    "kanban": "進度",
                    "timeline": "時間軸",
                    "map": "地圖"
                },
                "header": {
                    "overview": "行程概覽",
                    "public": "公開",
                    "days_label": "天",
                    "days_trip": "天行程"
                },
                "actions": {
                    "jarvis_daily": "Jarvis 日報",
                    "smart_import": "智能匯入",
                    "share": "分享",
                    "plan_trip": "行程規劃",
                    "manual_add": "手動新增",
                    "jarvis_suggest": "Jarvis 建議行程",
                    "jarvis_optimize": "Jarvis 排程優化",
                    "manage_members": "成員管理",
                    "invite_friends": "邀請朋友",
                    "delete_trip": "刪除行程",
                    "owner_only": "僅擁有者可操作",
                    "undo": "撤銷",
                    "redo": "重做",
                    "edit_settings": "編輯行程設定",
                    "open_chat": "開啟行程對話"
                },
                "status": {
                    "ended": "已結束",
                    "ongoing": "進行中",
                    "countdown": "倒數",
                    "ready": "準備就緒"
                },
                "footer": {
                    "people": "人",
                    "items": "行程",
                    "view_details": "查看詳情"
                },
                "location": {
                    "select_country": "選擇國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "建立新行程",
                    "subtitle": "多選國家與城市，或輸入自訂目的地。",
                    "trip_name": "行程名稱",
                    "placeholder_name": "如：歐洲文化深度遊",
                    "jarvis_name_tip": "Jarvis 自動命名 (需先選擇目的地)",
                    "dest_country": "目的地國家",
                    "placeholder_country": "搜尋國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搜尋城市...",
                    "add_custom": "加入",
                    "no_cities": "無相關城市，請輸入並點擊「加入」",
                    "trip_dates": "行程日期",
                    "placeholder_dates": "選擇開始與結束日期",
                    "create_btn": "建立行程 🚀"
                }
            }
        }
    },
    "zh-HK": {
        translation: {
            "common": {
                "search": "搵嘢...",
                "cancel": "取消",
                "save": "儲存",
                "delete": "刪除",
                "edit": "改",
                "loading": "等陣先...",
                "ask_jarvis": "問吓 Jarvis AI"
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我嘅行程",
                "new_trip": "開個新行程",
                "no_trips": "暫時未有行程，快啲開個新嘅啦！"
            },
            "trip": {
                "itinerary": "行程詳細",
                "budget": "銀包預算",
                "members": "夾錢好友",
                "settings": "行程設定",
                "days": "日數",
                "add_activity": "加返個活動",
                "views": {
                    "list": "列表",
                    "board": "瀑布流",
                    "kanban": "進度板",
                    "timeline": "時間軸",
                    "map": "地圖"
                },
                "header": {
                    "overview": "行程概覽",
                    "public": "公開",
                    "days_label": "日",
                    "days_trip": "日行程"
                },
                "actions": {
                    "jarvis_daily": "Jarvis 日報",
                    "smart_import": "智能匯入",
                    "share": "分享",
                    "plan_trip": "行程規劃",
                    "manual_add": "手動加入",
                    "jarvis_suggest": "Jarvis 建議",
                    "jarvis_optimize": "Jarvis 優化",
                    "manage_members": "管理成員",
                    "invite_friends": "邀請朋友",
                    "delete_trip": "刪除行程",
                    "owner_only": "淨係 Owner 先郁得",
                    "undo": "復原",
                    "redo": "重做",
                    "edit_settings": "改行程設定",
                    "open_chat": "傾兩句"
                },
                "status": {
                    "ended": "完咗喇",
                    "ongoing": "玩緊呀",
                    "countdown": "仲有",
                    "ready": "Ready 喇"
                },
                "footer": {
                    "people": "人",
                    "items": "行程",
                    "view_details": "睇吓細節"
                },
                "location": {
                    "select_country": "揀國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "開個新行程",
                    "subtitle": "揀返目的地或者自己輸入都得。",
                    "trip_name": "行程名",
                    "placeholder_name": "例如：歐遊深度遊",
                    "jarvis_name_tip": "Jarvis 自動改名 (要揀咗目的地先)",
                    "dest_country": "去邊個國家",
                    "placeholder_country": "搵吓國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搵吓城市...",
                    "add_custom": "加埋",
                    "no_cities": "搵唔到城市，自己輸入再撳「加埋」",
                    "trip_dates": "行程日期",
                    "placeholder_dates": "揀返開始同結束日期",
                    "create_btn": "開波 🚀"
                }
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('travelTogether_language') || 'zh-HK',
        fallbackLng: 'zh-HK',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
