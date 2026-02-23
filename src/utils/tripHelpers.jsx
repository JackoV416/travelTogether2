import React from 'react';
import { Sun, CloudSun, Snowflake } from 'lucide-react';
import {
    COUNTRIES_DATA,
    HOLIDAYS_BY_REGION,
    CURRENCIES,
    TIMEZONES,
    CITY_TRANSLATIONS,
    COUNTRY_TRANSLATIONS,
    OUTFIT_IMAGES
} from '../constants/appData';

export const getHolidayMap = (region) => HOLIDAYS_BY_REGION[region] || HOLIDAYS_BY_REGION.Global;
export const getLocalizedCountryName = (country, lang = 'zh-TW') => COUNTRY_TRANSLATIONS[country]?.[lang] || country;
export const getLocalizedCityName = (city, lang = 'zh-TW') => CITY_TRANSLATIONS[city]?.[lang] || city;
export const getLocalizedContent = (content, lang = 'zh-TW') => {
    if (!content) return "";
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
        const targetLang = lang === 'zh-HK' ? 'zh-TW' : lang; // Fallback HK to TW if needed, or strict match
        return content[targetLang] || content['en'] || content['zh-TW'] || "";
    }
    return "";
};
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
    const end = new Date(trip.endDate);

    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let summary = "";

    if (diffDays > 0) {
        summary = `🚗 距離出發還有 ${diffDays} 天`;
    } else if (now <= end) {
        summary = "✈️ 旅程進行中";
        const todayStr = now.toISOString().split('T')[0];
        const todayItems = trip.itinerary?.[todayStr] || [];
        const nextItem = todayItems.find(i => i.time > now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        if (nextItem) summary += ` • 下一站: ${nextItem.name}`;
    } else {
        summary = "🏁 旅程已結束";
    }

    // Add flight info if any
    const firstDayItinerary = trip.itinerary?.[trip.startDate] || [];
    const flight = firstDayItinerary.find(i => i.type === 'flight');
    if (flight && flight.details?.number) {
        summary += ` • 航班: ${flight.details.number}`;
    }

    return summary;
};

// Helper for calculateDebts
export const convertCurrency = (amount, from, to, rates) => {
    if (from === to) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    // Base is HKD (rate=1). 
    // If rate is "per HKD" (e.g. JPY=19.8), then HKD -> JPY = amount * rate
    // JPY -> HKD = amount / rate
    // Here we assume rates are "Amount of Foreign Currency per 1 HKD" (e.g. 1 HKD = 19.8 JPY)
    // So to convert Foreign to HKD: amount / rate
    // To convert HKD to Foreign: amount * rate
    // General: (Amount / FromRate) * ToRate
    return (amount / fromRate) * toRate;
};

export const calculateDebts = (budget, repayments, members, baseCurrency, exchangeRates) => {
    const balances = {};
    members.forEach(m => balances[m.name] = 0);
    let totalSpent = 0;

    // 準備匯率表：如果沒有實時匯率，則從靜態 CURRENCIES 轉換
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
        if (isNaN(temp)) return { temp: "--", clothes: "--", icon: null, desc: "--", outfitIcon: null };
        if (temp >= 28) return { temp: currentTempStr, clothes: "背心、短褲、防曬", icon: customIcon || <Sun className="text-orange-500" />, desc: customDesc || "炎熱", outfitIcon: iconUrl };
        if (temp >= 23) return { temp: currentTempStr, clothes: "短袖、透氣帆布鞋", icon: customIcon || <Sun className="text-yellow-500" />, desc: customDesc || "溫暖", outfitIcon: iconUrl };
        if (temp >= 18) return { temp: currentTempStr, clothes: "薄長袖、針織衫", icon: customIcon || <CloudSun className="text-emerald-500" />, desc: customDesc || "舒適", outfitIcon: iconUrl };
        if (temp >= 12) return { temp: currentTempStr, clothes: "夾克、帽T、牛仔褲", icon: customIcon || <CloudSun className="text-blue-400" />, desc: customDesc || "微涼", outfitIcon: iconUrl };
        return { temp: currentTempStr, clothes: "厚大衣、圍巾、發熱衣", icon: customIcon || <Snowflake className="text-blue-600" />, desc: customDesc || "寒冷", outfitIcon: iconUrl };
    }

    // No real data - return placeholders instead of fake random info
    return { temp: "--", clothes: "--", icon: null, desc: "--", outfitIcon: null };
};

export const getTransportAdvice = (item, city = "") => {
    if (!item?.details?.location) return null;
    if (item.type === 'flight') return { mode: 'metro', label: "機場快線 / 地鐵", cost: "約 $120" };
    if (item.type === 'hotel') return { mode: 'car', label: "計程車約 15 分", cost: "約 $80" };
    if (item.type === 'food') {
        const walk = getWalkMeta();
        return { mode: 'walk', label: `步行 ${walk.minutes} 分`, cost: "$0", meta: walk };
    }
    if (item.type === 'transport') return { mode: 'bus', label: "巴士/高速巴士", cost: item.cost ? `${item.currency} ${item.cost} ` : "依票價" };
    return { mode: 'metro', label: `${city} 地鐵`, cost: "約 $30" };
};

export const buildDailyReminder = (date, items = [], destHolidays = {}) => {
    if (!items.length) return "今日尚未規劃行程，快去新增吧！";

    const holidayName = destHolidays[date.slice(5)]; // "MM-DD"
    if (holidayName) {
        if (holidayName.includes("元日") || holidayName.includes("New Year")) return `⚠️ ${holidayName}：大部分商店可能休息，請確認營業時間。`;
        if (holidayName.includes("除夕") || holidayName.includes("大晦日")) return `⚠️ ${holidayName}：注意交通管制與提早結束營業。`;
        if (holidayName.includes("聖誕")) return `🎄 ${holidayName}：部分景點可能調整時間，建議預約餐廳。`;
        return `⚠️ ${holidayName}：人潮可能較多，建議預留交通時間。`;
    }

    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};

export const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();

export const getWalkMeta = () => {
    const distance = (0.4 + Math.random() * 0.8).toFixed(1);
    const steps = Math.round(Number(distance) * 1400);
    const minutes = Math.round(Number(distance) * 12);
    return { distance, steps, minutes };
};

export const glassCard = (isDarkMode) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

export const buttonPrimary = `flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.05] active:scale-95 w-full cursor-pointer`;

export const inputClasses = (isDarkMode) => `w-full px-4 py-3.5 rounded-xl border transition-all outline-none font-medium tracking-wide ${isDarkMode ? 'bg-gray-800/90 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500' : 'bg-white border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-gray-900 placeholder-gray-400 shadow-sm'}`;

