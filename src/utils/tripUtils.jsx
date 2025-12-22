
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
export const glassCard = (isDarkMode) => `glass-card rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 group relative isolate`;

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

    // Helper: Get clothes based on temperature
    const getClothesForTemp = (temp) => {
        if (temp >= 28) return "背心、短褲、防曬";
        if (temp >= 23) return "短袖、透氣帆布鞋";
        if (temp >= 18) return "薄長袖、針織衫";
        if (temp >= 12) return "夾克、帽T、牛仔褲";
        return "厚大衣、圍巾、發熱衣";
    };

    // Helper: Get icon based on temperature
    const getIconForTemp = (temp) => {
        if (temp >= 28) return <Sun className="text-orange-500" />;
        if (temp >= 23) return <Sun className="text-yellow-500" />;
        if (temp >= 18) return <CloudSun className="text-emerald-500" />;
        if (temp >= 12) return <CloudSun className="text-blue-400" />;
        return <Snowflake className="text-blue-600" />;
    };

    // Helper: Get desc based on temperature
    const getDescForTemp = (temp) => {
        if (temp >= 28) return "炎熱";
        if (temp >= 23) return "溫暖";
        if (temp >= 18) return "舒適";
        if (temp >= 12) return "微涼";
        return "寒冷";
    };

    // If real temp is provided (e.g. "28°C" or "25°C / 18°C")
    if (currentTempStr) {
        const parts = currentTempStr.split('/').map(p => parseInt(p.trim()));
        const maxTemp = parts[0] || 20;
        const minTemp = parts[1] || maxTemp; // Fallback to maxTemp if no minTemp provided

        const dayClothes = getClothesForTemp(maxTemp);
        const nightClothes = getClothesForTemp(minTemp);
        // Always show Day/Night format for clarity - Use standard pipe for regex compatibility
        const clothes = `日：${dayClothes} | 夜：${nightClothes}`;

        return {
            temp: currentTempStr,
            maxTemp,
            minTemp,
            dayClothes,
            nightClothes,
            clothes, // Combined for backward compat
            icon: customIcon || getIconForTemp(maxTemp),
            desc: customDesc || getDescForTemp(maxTemp),
            outfitIcon: iconUrl
        };
    }

    // Variations for mockup / off-season
    // User Request: "If not loaded real API, default --"
    // Return structured placeholder to maintain Split UI layout
    return {
        temp: "-- / --",
        clothes: "-- | --",
        dayClothes: "--",
        nightClothes: "--",
        icon: <Sun className="text-gray-400" />,
        desc: "載入中...",
        outfitIcon: iconUrl
    };
};

export const buildDailyReminder = (date, items = []) => {
    if (!items.length) return "今日尚未規劃行程，快去新增吧！";
    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};


export const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();

// ============================================
// TIME CALCULATIONS (V1.1 Smart Scheduler)
// ============================================

/**
 * Converts "HH:mm" to minutes from start of day
 */
export const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
};

/**
 * Converts minutes from start of day to "HH:mm"
 */
export const formatTime = (totalMins) => {
    const hours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Phase 2: Smart Ripple - Recalculates all items based on a change at a specific index
 * @param {Array} items - The itinerary array for the day
 * @param {Number} changedIndex - The index that was updated/moved
 * @returns {Array} - New array with adjusted times
 */
export const recalculateItineraryTimes = (items = [], changedIndex = 0) => {
    if (!items.length) return [];

    const newItems = [...items];

    // Iterate from the changed item onwards
    for (let i = changedIndex + 1; i < newItems.length; i++) {
        const prev = newItems[i - 1];
        const current = newItems[i];

        // Skip recalculation if the current item is a "Bundle" that handles its own time (managed by parent)
        // Or if it's a fixed-time item (like a flight with a hard departure)
        if (current.isFixedTime || current.type === 'flight') continue;

        const prevStartMins = parseTime(prev.details?.time || prev.time || "00:00");
        const prevDuration = parseInt(prev.details?.duration || 0); // Default 0 if not set

        // The new start time is prev end time
        const newStartMins = prevStartMins + prevDuration;
        const newTimeStr = formatTime(newStartMins);

        newItems[i] = {
            ...current,
            time: newTimeStr,
            details: {
                ...(current.details || {}),
                time: newTimeStr,
                endTime: formatTime(newStartMins + parseInt(current.details?.duration || 0))
            }
        };
    }

    return newItems;
};

export const inputClasses = (isDarkMode) => `w-full px-4 py-3.5 rounded-xl border transition-all outline-none font-medium tracking-wide ${isDarkMode ? 'bg-gray-800/90 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500' : 'bg-white border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-gray-900 placeholder-gray-400 shadow-sm'}`;

export const formatDuration = (duration) => {
    if (!duration) return "";

    // Handle number input (minutes)
    if (typeof duration === 'number') {
        const totalMins = duration;
        if (totalMins < 60) return `${totalMins} min`;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        if (m === 0) return `${h} hr`;
        return `${h} hr ${m} min`;
    }

    const durationStr = String(duration);
    // If it's already localized, or not a simple minute string, return as is
    if (durationStr.includes('小時') || durationStr.includes('時') || durationStr.includes('hr')) return durationStr;

    const minsMatch = durationStr.match(/(\d+)\s*(?:min|m|分鐘|分)?/i);
    if (!minsMatch) return durationStr;

    const totalMins = parseInt(minsMatch[1]);
    if (totalMins < 60) return durationStr;

    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
};


// Helper to optimize image URL for Data Saver
const optimizeImage = (url) => {
    if (!url || typeof url !== 'string') return url;
    try {
        const settings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
        if (settings.dataSaver) {
            // Unsplash specific optimization
            if (url.includes('images.unsplash.com')) {
                // Replace existing quality/width params or append low quality ones
                // Simple regex replacement for typical Unsplash params
                let newUrl = url.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=60');
                if (!newUrl.includes('w=')) newUrl += '&w=400';
                if (!newUrl.includes('q=')) newUrl += '&q=60';
                return newUrl;
            }
        }
    } catch (e) { }
    return url;
};


export const getSmartItemImage = (item, tripOrCity) => {
    // 1. User/Uploaded Image (Priority 1 - 用戶上傳嘅圖片)
    if (item.image) return optimizeImage(item.image);
    if (item.details?.image) return optimizeImage(item.details.image);

    const itemName = (item.name || "").toLowerCase();
    const itemNameEn = (item.details?.nameEn || "").toLowerCase();
    const itemLocation = (item.details?.location || "").toLowerCase();
    const city = (typeof tripOrCity === 'string' ? tripOrCity : tripOrCity?.city) || "";

    // 2. Journal File Match (Priority 2) - Search fuzzy match in trip.files (Journal)
    const files = (typeof tripOrCity === 'object' ? tripOrCity?.files : []) || [];
    const matchedFile = files.find(f =>
        f.type?.startsWith('image/') && (
            f.name?.toLowerCase().includes(itemName) ||
            (itemNameEn && f.name?.toLowerCase().includes(itemNameEn))
        )
    );
    if (matchedFile) return optimizeImage(matchedFile.url);

    // 3. Landmark Name Match (Priority 3 - 景點/車站/目的地/地名)
    // Check: item.name, details.nameEn, details.location for any landmark keywords
    const searchTexts = [itemName, itemNameEn, itemLocation].filter(Boolean);
    for (const [key, url] of Object.entries(LANDMARK_IMAGES)) {
        const keyLower = key.toLowerCase();
        for (const text of searchTexts) {
            if (text.includes(keyLower) || keyLower.includes(text.split(' ')[0])) {
                return optimizeImage(url);
            }
        }
    }

    // 4. City-specific default for spots/hotels (Priority 4)
    if (CITY_IMAGES[city] && (item.type === 'spot' || item.type === 'hotel')) {
        return optimizeImage(CITY_IMAGES[city]);
    }

    // 5. Type Default (Priority 5 - 每個類型嘅 default 圖片)
    return optimizeImage(TYPE_DEFAULT_IMAGES[item.type] || TYPE_DEFAULT_IMAGES.spot);
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

