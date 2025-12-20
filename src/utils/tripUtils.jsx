
import React from 'react';
import { Sun, CloudSun, Snowflake } from 'lucide-react';
import {
    HOLIDAYS_BY_REGION,
    COUNTRY_TRANSLATIONS,
    CITY_TRANSLATIONS,
    COUNTRIES_DATA,
    TIMEZONES,
    OUTFIT_IMAGES,
    CURRENCIES,
    CITY_IMAGES,
    LANDMARK_IMAGES,
    TYPE_DEFAULT_IMAGES
} from '../constants/appData';
import { convertCurrency } from '../services/exchangeRate';

// Glassmorphism 2.0 - Premium Effect (Uses CSS Variables in index.css)
export const glassCard = (isDarkMode) => `glass-card rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDarkMode ? 'hover:border-gray-600' : 'hover:border-gray-300'}`;

export const getHolidayMap = (region) => HOLIDAYS_BY_REGION[region] || HOLIDAYS_BY_REGION.Global;

export const getLocalizedCountryName = (country, lang = 'zh-TW') => COUNTRY_TRANSLATIONS[country]?.[lang] || country;

export const getLocalizedCityName = (city, lang = 'zh-TW') => CITY_TRANSLATIONS[city]?.[lang] || city;

export const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];

export const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    const pad = (val) => val.toString().padStart(2, '0');
    return `${pad(d)}/${pad(m)}/${y}`;
};

export const getDaysArray = (start, end) => {
    if (!start || !end) return [];
    const arr = [];
    const dt = new Date(start);
    const endDt = new Date(end);
    while (dt <= endDt) {
        arr.push(new Date(dt).toISOString().split('T')[0]);
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

export const getWeekday = (dateStr) => ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][new Date(dateStr).getDay()];

export const getTripSummary = (trip) => {
    if (!trip) return "";
    const now = new Date();
    const start = new Date(trip.startDate);
    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    let summary = diffDays > 0 ? `距離出發 ${diffDays} 天` : "旅程進行中";
    const nextFlight = trip.itinerary?.[now.toISOString().split('T')[0]]?.find(i => i.type === 'flight');
    if (nextFlight) summary += ` • ✈️ ${nextFlight.details.number} `;
    return summary;
};

export const calculateDebts = (budget, repayments, members, baseCurrency, exchangeRates) => {
    const balances = {};
    members.forEach(m => balances[m.name] = 0);
    let totalSpent = 0;

    const rates = exchangeRates || Object.keys(CURRENCIES).reduce((acc, key) => ({ ...acc, [key]: CURRENCIES[key].rate }), {});

    budget.forEach(item => {
        const tax = item.details?.tax ? Number(item.details.tax) : 0;
        const refund = item.details?.refund ? Number(item.details.refund) : 0;
        const baseCost = Number(item.cost) + tax - refund;

        const cost = convertCurrency(baseCost, item.currency || 'HKD', baseCurrency || 'HKD', rates);
        totalSpent += cost;

        const payer = item.payer || members[0].name;
        balances[payer] = (balances[payer] || 0) + cost;

        if (item.splitType === 'group' || !item.splitType) {
            const split = cost / members.length;
            members.forEach(m => balances[m.name] = (balances[m.name] || 0) - split);
        } else if (item.splitType === 'me') {
            balances[payer] = (balances[payer] || 0) - cost;
        }
    });
    return { balances, totalSpent };
};

export const getTimeDiff = (userRegion, destCountry) => {
    const userTz = TIMEZONES[userRegion]?.offset || 8;
    const destData = getSafeCountryInfo(destCountry);
    const destTzCode = destData.tz || "UK";
    const destTz = TIMEZONES[destTzCode]?.offset || 0;
    return destTz - userTz;
};

export const getLocalCityTime = (tz) => new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });

export const getWeatherForecast = (country, currentTempStr, customDesc, customIcon) => {
    const region = getSafeCountryInfo(country).region;
    const iconUrl = OUTFIT_IMAGES[region] || OUTFIT_IMAGES.north;

    // If real temp is provided (e.g. "28°C"), use distinct logic
    if (currentTempStr) {
        const temp = parseInt(currentTempStr);
        if (temp >= 28) return { temp: currentTempStr, clothes: "背心、短褲、防曬", icon: customIcon || <Sun className="text-orange-500" />, desc: customDesc || "炎熱", outfitIcon: iconUrl };
        if (temp >= 23) return { temp: currentTempStr, clothes: "短袖、透氣帆布鞋", icon: customIcon || <Sun className="text-yellow-500" />, desc: customDesc || "溫暖", outfitIcon: iconUrl };
        if (temp >= 18) return { temp: currentTempStr, clothes: "薄長袖、針織衫", icon: customIcon || <CloudSun className="text-emerald-500" />, desc: customDesc || "舒適", outfitIcon: iconUrl };
        if (temp >= 12) return { temp: currentTempStr, clothes: "夾克、帽T、牛仔褲", icon: customIcon || <CloudSun className="text-blue-400" />, desc: customDesc || "微涼", outfitIcon: iconUrl };
        return { temp: currentTempStr, clothes: "厚大衣、圍巾、發熱衣", icon: customIcon || <Snowflake className="text-blue-600" />, desc: customDesc || "寒冷", outfitIcon: iconUrl };
    }

    // Variations for mockup / off-season
    const rand = Math.floor(Math.random() * 3);
    if (region === "hot") return { temp: (28 + rand) + "°C", clothes: "短袖、墨鏡、人字拖", icon: <Sun className="text-orange-500" />, desc: "炎熱", outfitIcon: iconUrl };
    if (region === "south") return { temp: (20 + rand) + "°C", clothes: rand === 1 ? "薄襯衫、休閒褲" : "輕便 T-shirt、薄外套", icon: <CloudSun className="text-yellow-500" />, desc: "舒適", outfitIcon: iconUrl };
    return { temp: (5 + rand) + "°C", clothes: "羽絨、手套、毛帽", icon: <Snowflake className="text-blue-300" />, desc: "寒冷", outfitIcon: iconUrl };
};

export const buildDailyReminder = (date, items = []) => {
    if (!items.length) return "今日尚未規劃行程，快去新增吧！";
    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};


export const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();

export const inputClasses = (isDarkMode) => `w-full px-4 py-3.5 rounded-xl border transition-all outline-none font-medium tracking-wide ${isDarkMode ? 'bg-gray-800/90 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500' : 'bg-white border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-gray-900 placeholder-gray-400 shadow-sm'}`;

export const formatDuration = (durationStr) => {
    if (!durationStr) return "";
    // If it's already localized, or not a simple minute string, return as is
    if (durationStr.includes('小時') || durationStr.includes('時')) return durationStr;

    const minsMatch = durationStr.match(/(\d+)\s*(?:min|m|分鐘|分)?/i);
    if (!minsMatch) return durationStr;

    const totalMins = parseInt(minsMatch[1]);
    if (totalMins < 60) return durationStr;

    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    if (m === 0) return `${h} 小時`;
    return `${h} 小時 ${m} 分`;
};


export const getSmartItemImage = (item, tripOrCity) => {
    // 1. User/Uploaded Image (Priority 1)
    if (item.image) return item.image;
    if (item.details?.image) return item.details.image;

    const itemName = (item.name || "").toLowerCase();
    const city = (typeof tripOrCity === 'string' ? tripOrCity : tripOrCity?.city) || "";
    // const country = (typeof tripOrCity === 'string' ? '' : tripOrCity?.country) || "";

    // 2. Journal File Match (Priority 2) - Search fuzzy match in trip.files (Journal)
    // "User means images in Journal"
    const tripFiles = typeof tripOrCity === 'object' ? (tripOrCity.files || []) : [];
    const matchedFile = tripFiles.find(f =>
        f.type?.startsWith('image/') && f.name?.toLowerCase().includes(itemName)
    );
    if (matchedFile) return matchedFile.url;

    // 3. Exact Landmark Name Match (Smart Match)
    for (const [key, url] of Object.entries(LANDMARK_IMAGES)) {
        if (itemName.includes(key.toLowerCase())) return url;
    }

    // 4. City-specific default fallback if no better image
    if (CITY_IMAGES[city] && (item.type === 'spot' || item.type === 'hotel')) {
        return CITY_IMAGES[city];
    }

    // 5. Type Default
    return TYPE_DEFAULT_IMAGES[item.type] || TYPE_DEFAULT_IMAGES.spot;
};

export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const isImageFile = (type) => type?.startsWith('image/');

