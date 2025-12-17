// src/constants/countries.js
// 國家數據

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

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
    "Other": { cities: [], image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", region: "north", emergency: "112 (國際通用)", taxRefund: "Check Local", entryInfo: "Check Visa", insuranceInfo: "請查詢當地外交部建議", consulate: "當地領事館", tz: "UK" }
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
    "Tokyo": { "zh-TW": "東京", "en": "Tokyo" },
    "Osaka": { "zh-TW": "大阪", "en": "Osaka" },
    "Kyoto": { "zh-TW": "京都", "en": "Kyoto" },
    "Seoul": { "zh-TW": "首爾", "en": "Seoul" },
    "Taipei": { "zh-TW": "台北", "en": "Taipei" },
    "Bangkok": { "zh-TW": "曼谷", "en": "Bangkok" },
    "Singapore": { "zh-TW": "新加坡", "en": "Singapore" },
    "London": { "zh-TW": "倫敦", "en": "London" },
    "Paris": { "zh-TW": "巴黎", "en": "Paris" },
    "New York": { "zh-TW": "紐約", "en": "New York" },
    // ... 其他城市翻譯
};

// Helper functions
export const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];
export const getLocalizedCountryName = (country, lang = 'zh-TW') => COUNTRY_TRANSLATIONS[country]?.[lang] || country;
export const getLocalizedCityName = (city, lang = 'zh-TW') => CITY_TRANSLATIONS[city]?.[lang] || city;
