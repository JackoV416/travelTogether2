// src/constants/countries.js
// 國家數據

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const COUNTRIES_DATA = {
    "Australia (澳洲)": { currency: "AUD", cities: ["Sydney", "Melbourne", "Brisbane", "Gold Coast"], image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600", region: "south", emergency: "000", taxRefund: "滿 AUD 300", entryInfo: "需申請 ETA", insuranceInfo: "建議購買涵蓋戶外活動之保險", consulate: "澳洲辦事處", tz: "AU", continent: "Oceania" },
    "Canada (加拿大)": { currency: "CAD", cities: ["Vancouver", "Toronto", "Montreal", "Banff"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600", region: "north", emergency: "911", taxRefund: "無退稅", entryInfo: "eTA / Visitor Visa", insuranceInfo: "溫差大，建議含雪地救援", consulate: "駐加拿大代表處", tz: "US_NY", continent: "North America" },
    "France (法國)": { currency: "EUR", cities: ["Paris", "Nice", "Lyon", "Marseille", "Strasbourg"], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600", region: "north", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根區建議投保3萬歐元以上醫療險", consulate: "駐法國代表處", tz: "FR", continent: "Europe" },
    "Germany (德國)": { currency: "EUR", cities: ["Berlin", "Munich", "Frankfurt", "Hamburg"], image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1600", region: "north", emergency: "112", taxRefund: "滿 25 EUR", entryInfo: "申根免簽", insuranceInfo: "申根標準醫療保險", consulate: "駐德國代表處", tz: "FR", continent: "Europe" },
    "Italy (義大利)": { currency: "EUR", cities: ["Rome", "Milan", "Florence", "Venice"], image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600", region: "north", emergency: "112", taxRefund: "滿 155 EUR", entryInfo: "申根免簽", insuranceInfo: "建議附加租車責任險", consulate: "駐義大利代表處", tz: "FR", continent: "Europe" },
    "Japan (日本)": { currency: "JPY", cities: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa"], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 5000 JPY", entryInfo: "Visit Japan Web", insuranceInfo: "醫療費極高，強烈建議投保", consulate: "台北駐日經濟文化代表處", tz: "JP", continent: "Asia" },
    "Korea (韓國)": { currency: "KRW", cities: ["Seoul", "Busan", "Jeju"], image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600", region: "north", emergency: "112 / 119", taxRefund: "滿 30,000 KRW", entryInfo: "K-ETA", insuranceInfo: "建議涵蓋滑雪運動", consulate: "駐韓國代表處", tz: "KR", continent: "Asia" },
    "Malaysia (馬來西亞)": { currency: "MYR", cities: ["Kuala Lumpur", "Penang", "Outline: Kota Kinabalu", "Johor Bahru"], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600", region: "hot", emergency: "999 / 994（消防）", taxRefund: "滿 300 MYR", entryInfo: "免簽", insuranceInfo: "建議包含戶外及海島活動", consulate: "駐馬國代表處", tz: "TH", continent: "Asia" },
    "Singapore (新加坡)": { currency: "SGD", cities: ["Singapore"], image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600", region: "south", emergency: "999 / 995", taxRefund: "滿 100 SGD", entryInfo: "免簽", insuranceInfo: "高醫療費，建議醫療與航班延誤", consulate: "駐新加坡代表處", tz: "TH", continent: "Asia" },
    "Spain (西班牙)": { currency: "EUR", cities: ["Barcelona", "Madrid", "Seville", "Valencia"], image: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=1600", region: "south", emergency: "112", taxRefund: "滿 90 EUR", entryInfo: "申根免簽", insuranceInfo: "炎熱季節注意防曬", consulate: "駐西班牙代表處", tz: "FR", continent: "Europe" },
    "Switzerland (瑞士)": { currency: "CHF", cities: ["Zurich", "Geneva", "Lucerne", "Interlaken"], image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600", region: "north", emergency: "112 / 117", taxRefund: "滿 300 CHF", entryInfo: "申根免簽", insuranceInfo: "登山戶外必備高額醫療", consulate: "駐瑞士代表處", tz: "FR", continent: "Europe" },
    "Taiwan (台灣)": { currency: "TWD", cities: ["Taipei", "Kaohsiung", "Tainan", "Taichung"], image: "https://images.unsplash.com/photo-1508233620467-f79f1e317a05?w=1600", region: "north", emergency: "110 (警) / 119 (火)", taxRefund: "滿 2000 TWD", entryInfo: "入台證/網簽", insuranceInfo: "健保完善，旅客仍需旅平險", consulate: "-", tz: "TW", continent: "Asia" },
    "Thailand (泰國)": { currency: "THB", cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"], image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600", region: "hot", emergency: "191", taxRefund: "滿 2000 THB", entryInfo: "免簽", insuranceInfo: "建議涵蓋機車騎乘意外險", consulate: "駐泰國代表處", tz: "TH", continent: "Asia" },
    "United Kingdom (英國)": { currency: "GBP", cities: ["London", "Edinburgh", "Manchester", "Bath"], image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600", region: "north", emergency: "999", taxRefund: "無退稅", entryInfo: "免簽", insuranceInfo: "NHS 對遊客不免費，需醫療險", consulate: "駐英國代表處", tz: "UK", continent: "Europe" },
    "United States (美國)": { currency: "USD", cities: ["New York", "Los Angeles", "San Francisco", "Las Vegas", "Seattle"], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600", region: "north", emergency: "911", taxRefund: "部分州", entryInfo: "ESTA", insuranceInfo: "醫療費用極高，強烈建議高額保險", consulate: "駐美代表處", tz: "US_NY", continent: "North America" },
    "Other": { currency: "USD", cities: [], image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", region: "north", emergency: "112 (國際通用)", taxRefund: "Check Local", entryInfo: "Check Visa", insuranceInfo: "請查詢當地外交部建議", consulate: "當地領事館", tz: "UK", continent: "Global" }
};

export const COUNTRY_TRANSLATIONS = {
    "Australia (澳洲)": { "zh-TW": "澳洲", "zh-HK": "澳洲", "en": "Australia" },
    "Canada (加拿大)": { "zh-TW": "加拿大", "zh-HK": "加拿大", "en": "Canada" },
    "France (法國)": { "zh-TW": "法國", "zh-HK": "法國", "en": "France" },
    "Germany (德國)": { "zh-TW": "德國", "zh-HK": "德國", "en": "Germany" },
    "Italy (義大利)": { "zh-TW": "義大利", "zh-HK": "義大利", "en": "Italy" },
    "Japan (日本)": { "zh-TW": "日本", "zh-HK": "日本", "en": "Japan" },
    "Korea (韓國)": { "zh-TW": "韓國", "zh-HK": "韓國", "en": "Korea" },
    "Malaysia (馬來西亞)": { "zh-TW": "馬來西亞", "zh-HK": "馬來西亞", "en": "Malaysia" },
    "Singapore (新加坡)": { "zh-TW": "新加坡", "zh-HK": "新加坡", "en": "Singapore" },
    "Spain (西班牙)": { "zh-TW": "西班牙", "zh-HK": "西班牙", "en": "Spain" },
    "Switzerland (瑞士)": { "zh-TW": "瑞士", "zh-HK": "瑞士", "en": "Switzerland" },
    "Taiwan (台灣)": { "zh-TW": "台灣", "zh-HK": "台灣", "en": "Taiwan" },
    "Thailand (泰國)": { "zh-TW": "泰國", "zh-HK": "泰國", "en": "Thailand" },
    "United Kingdom (英國)": { "zh-TW": "英國", "zh-HK": "英國", "en": "United Kingdom" },
    "United States (美國)": { "zh-TW": "美國", "zh-HK": "美國", "en": "United States" },
    "Other": { "zh-TW": "其他", "zh-HK": "其他", "en": "Other" }
};

export const CITY_TRANSLATIONS = {
    "Sydney": { "zh-TW": "雪梨", "zh-HK": "悉尼", "en": "Sydney" },
    "Melbourne": { "zh-TW": "墨爾本", "zh-HK": "墨爾本", "en": "Melbourne" },
    "Tokyo": { "zh-TW": "東京", "zh-HK": "東京", "en": "Tokyo" },
    "Osaka": { "zh-TW": "大阪", "zh-HK": "大阪", "en": "Osaka" },
    "Kyoto": { "zh-TW": "京都", "zh-HK": "京都", "en": "Kyoto" },
    "Seoul": { "zh-TW": "首爾", "zh-HK": "首爾", "en": "Seoul" },
    "Taipei": { "zh-TW": "台北", "zh-HK": "台北", "en": "Taipei" },
    "Bangkok": { "zh-TW": "曼谷", "zh-HK": "曼谷", "en": "Bangkok" },
    "Singapore": { "zh-TW": "新加坡", "zh-HK": "新加坡", "en": "Singapore" },
    "London": { "zh-TW": "倫敦", "zh-HK": "倫敦", "en": "London" },
    "Paris": { "zh-TW": "巴黎", "zh-HK": "巴黎", "en": "Paris" },
    "New York": { "zh-TW": "紐約", "zh-HK": "紐約", "en": "New York" },
    "San Francisco": { "zh-TW": "舊金山", "zh-HK": "三藩市", "en": "San Francisco" },
    "Los Angeles": { "zh-TW": "洛杉磯", "zh-HK": "洛杉磯", "en": "Los Angeles" },
    "Las Vegas": { "zh-TW": "拉斯維加斯", "zh-HK": "拉斯維加斯", "en": "Las Vegas" },
    "Seattle": { "zh-TW": "西雅圖", "zh-HK": "西雅圖", "en": "Seattle" },
    "Vancouver": { "zh-TW": "溫哥華", "zh-HK": "溫哥華", "en": "Vancouver" },
    "Toronto": { "zh-TW": "多倫多", "zh-HK": "多倫多", "en": "Toronto" },
    "Montreal": { "zh-TW": "蒙特婁", "zh-HK": "滿地可", "en": "Montreal" },
    "Banff": { "zh-TW": "班芙", "zh-HK": "班芙", "en": "Banff" },
    "Nice": { "zh-TW": "尼斯", "zh-HK": "尼斯", "en": "Nice" },
    "Lyon": { "zh-TW": "里昂", "zh-HK": "里昂", "en": "Lyon" },
    "Marseille": { "zh-TW": "馬賽", "zh-HK": "馬賽", "en": "Marseille" },
    "Berlin": { "zh-TW": "柏林", "zh-HK": "柏林", "en": "Berlin" },
    "Munich": { "zh-TW": "慕尼黑", "zh-HK": "慕尼黑", "en": "Munich" },
    "Frankfurt": { "zh-TW": "法蘭克福", "zh-HK": "法蘭克福", "en": "Frankfurt" },
    "Rome": { "zh-TW": "羅馬", "zh-HK": "羅馬", "en": "Rome" },
    "Milan": { "zh-TW": "米蘭", "zh-HK": "米蘭", "en": "Milan" },
    "Venice": { "zh-TW": "威尼斯", "zh-HK": "威尼斯", "en": "Venice" },
    "Barcelona": { "zh-TW": "巴塞隆納", "zh-HK": "巴塞隆拿", "en": "Barcelona" },
    "Madrid": { "zh-TW": "馬德里", "zh-HK": "馬德里", "en": "Madrid" },
    "Kaohsiung": { "zh-TW": "高雄", "zh-HK": "高雄", "en": "Kaohsiung" },
    "Taichung": { "zh-TW": "台中", "zh-HK": "台中", "en": "Taichung" },
    "Tainan": { "zh-TW": "台南", "zh-HK": "台南", "en": "Tainan" },
    "Phuket": { "zh-TW": "普吉島", "zh-HK": "布吉", "en": "Phuket" },
    "Chiang Mai": { "zh-TW": "清邁", "zh-HK": "清邁", "en": "Chiang Mai" },
    "Busan": { "zh-TW": "釜山", "zh-HK": "釜山", "en": "Busan" },
    "Kuala Lumpur": { "zh-TW": "吉隆坡", "zh-HK": "吉隆坡", "en": "Kuala Lumpur" },
    "Hokkaido": { "zh-TW": "北海道", "zh-HK": "北海道", "en": "Hokkaido" },
    "Fukuoka": { "zh-TW": "福岡", "zh-HK": "福岡", "en": "Fukuoka" },
    "Okinawa": { "zh-TW": "沖繩", "zh-HK": "沖繩", "en": "Okinawa" },
    "Sapporo": { "zh-TW": "札幌", "zh-HK": "札幌", "en": "Sapporo" }
};

// Helper functions
export const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];

export const getLocalizedCountryName = (country, lang = 'zh-TW') => {
    if (!country) return country;
    if (COUNTRY_TRANSLATIONS[country]?.[lang]) return COUNTRY_TRANSLATIONS[country][lang];
    // Handle "Country (譯名)" format
    const englishPart = country.match(/^([^(]+)/)?.[1]?.trim();
    if (englishPart && COUNTRY_TRANSLATIONS[englishPart]?.[lang]) return COUNTRY_TRANSLATIONS[englishPart][lang];
    return country;
};

export const getLocalizedCityName = (city, lang = 'zh-TW') => {
    if (!city) return city;
    // 1. Try exact match
    if (CITY_TRANSLATIONS[city]?.[lang]) return CITY_TRANSLATIONS[city][lang];

    // 2. Try to handle "City1 -> City2" (Multi-city)
    if (city.includes('->')) {
        return city.split('->').map(c => getLocalizedCityName(c.trim(), lang)).join(' → ');
    }

    // 3. Try to extract English from "譯名 (English)" format
    const englishMatch = city.match(/\(([^)]+)\)/);
    if (englishMatch) {
        const en = englishMatch[1].trim();
        if (CITY_TRANSLATIONS[en]?.[lang]) return CITY_TRANSLATIONS[en][lang];
    }

    // 4. Try to strip leading/trailing Chinese if it's "譯名 English"
    const simpleEnglish = city.replace(/[^\u0020-\u007E]/g, "").trim();
    if (simpleEnglish && CITY_TRANSLATIONS[simpleEnglish]?.[lang]) return CITY_TRANSLATIONS[simpleEnglish][lang];

    return city;
};
