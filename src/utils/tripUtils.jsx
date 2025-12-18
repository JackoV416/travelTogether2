
import React from 'react';
import { Sun, CloudSun, Snowflake } from 'lucide-react';
import {
    HOLIDAYS_BY_REGION,
    COUNTRY_TRANSLATIONS,
    CITY_TRANSLATIONS,
    COUNTRIES_DATA,
    TIMEZONES,
    OUTFIT_IMAGES,
    CURRENCIES
} from '../constants/appData';
import { convertCurrency } from '../services/exchangeRate';

export const glassCard = (isDarkMode) => `backdrop-blur-sm border shadow-xl rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border-gray-700 text-gray-100 hover:border-gray-600' : 'bg-slate-50/95 border-gray-200 text-gray-900 hover:border-gray-300'}`;

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

export const getWeatherForecast = (country) => {
    const region = getSafeCountryInfo(country).region;
    const iconUrl = OUTFIT_IMAGES[region] || OUTFIT_IMAGES.north;
    if (region === "hot") return { temp: "30°C", clothes: "短袖、墨鏡、防曬", icon: <Sun className="text-orange-500" />, desc: "炎熱", outfitIcon: iconUrl };
    if (region === "south") return { temp: "24°C", clothes: "薄襯衫、輕薄外套", icon: <CloudSun className="text-yellow-500" />, desc: "舒適", outfitIcon: iconUrl };
    return { temp: "10°C", clothes: "大衣、圍巾、暖包", icon: <Snowflake className="text-blue-300" />, desc: "寒冷", outfitIcon: iconUrl };
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

