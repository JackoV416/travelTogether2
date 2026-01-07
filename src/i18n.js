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
                "add_activity": "Add Activity"
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
                "add_activity": "新增活動"
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
                "add_activity": "加返個活動"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('app_language') || 'zh',
        fallbackLng: 'zh',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
