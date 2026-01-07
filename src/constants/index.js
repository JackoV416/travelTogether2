// src/constants/index.js
// 集中管理所有常量

export const AUTHOR_NAME = "Jamie Kwok";
export const APP_VERSION = "V1.2.9";
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

export const LANGUAGE_OPTIONS = {
    "zh-TW": { label: "繁體中文" },
    "zh-HK": { label: "廣東話" },
    "en": { label: "English" }
};

export const HOLIDAYS_BY_REGION = {
    "HK": { "01-01": "元旦", "02-10": "農曆新年", "02-11": "農曆新年", "02-12": "農曆新年", "03-29": "耶穌受難節", "03-30": "耶穌受難節翌日", "04-01": "復活節", "04-04": "清明節", "05-01": "勞動節", "05-15": "佛誕", "06-10": "端午節", "07-01": "回歸紀念日", "09-18": "中秋節翌日", "10-01": "國慶日", "10-11": "重陽節", "12-25": "聖誕節", "12-26": "拆禮物日" },
    "TW": { "01-01": "元旦", "02-08": "春節", "02-09": "除夕", "02-10": "春節", "02-11": "春節", "02-12": "春節", "02-28": "和平紀念日", "04-04": "兒童節", "04-05": "清明節", "05-01": "勞動節", "06-10": "端午節", "09-17": "中秋節", "10-10": "國慶日" },
    "JP": { "01-01": "元日", "01-13": "成人之日", "02-11": "建國記念日", "02-23": "天皇誕生日", "03-20": "春分", "04-29": "昭和之日", "05-03": "憲法記念日", "05-04": "綠之日", "05-05": "兒童之日", "07-15": "海之日", "08-11": "山之日", "09-16": "敬老之日", "09-22": "秋分", "10-14": "體育之日", "11-03": "文化之日", "11-23": "勤勞感謝日" },
    "Global": { "01-01": "New Year", "12-25": "Christmas" }
};

export const INSURANCE_SUGGESTIONS = {
    "HK": ["Prudential", "AIG", "Blue Cross"],
    "TW": ["富邦", "國泰", "南山"],
    "Global": ["World Nomads", "Allianz"]
};

export const INSURANCE_RESOURCES = [
    { region: "HK", title: "富邦旅平險 Smart Go", url: "https://www.fubon.com/hk/insurance/" },
    { region: "TW", title: "國泰旅平險 24h 線上投保", url: "https://www.cathaylife.com.tw/" },
    { region: "Global", title: "World Nomads Explorer", url: "https://www.worldnomads.com" },
    { region: "Global", title: "Visit Japan Web 健康聲明", url: "https://vjw-lp.digital.go.jp/en/" }
];
