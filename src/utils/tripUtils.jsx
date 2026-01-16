import React from 'react';
import { format, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { zhHK } from 'date-fns/locale';
import { Sun, CloudSun, Snowflake, MapPin, Calendar, Shirt, Moon, CheckCircle2, Cloud, FileText, Shield, Backpack, Plane, Hotel, Ticket } from 'lucide-react';
import {
    HOLIDAYS_BY_REGION,
    TIMEZONES,
    OUTFIT_IMAGES,
    CURRENCIES,
    CITY_IMAGES,
    LANDMARK_IMAGES,
    TYPE_DEFAULT_IMAGES
} from '../constants/appData';
import {
    getLocalizedCountryName,
    getLocalizedCityName,
    getSafeCountryInfo,
    COUNTRY_TRANSLATIONS,
    CITY_TRANSLATIONS,
    COUNTRIES_DATA
} from '../constants/countries';
import { convertCurrency } from '../services/exchangeRate';

// Glassmorphism 2.0 - Premium Effect (Uses CSS Variables in index.css)
export const glassCard = () => `glass-card rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 group relative isolate`;

export const getHolidayMap = (region) => HOLIDAYS_BY_REGION[region] || HOLIDAYS_BY_REGION.Global;

// Re-export localization helpers for consistency
export { getLocalizedCountryName, getLocalizedCityName, getSafeCountryInfo };

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

export const getWeekday = (dateStr, t) => {
    const day = new Date(dateStr).getDay();
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return t ? t(`itinerary.weekdays.${keys[day]}`) : ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][day];
};

export const getTripSummary = (trip, t) => {
    if (!trip) return "";
    const now = new Date();
    const start = new Date(trip.startDate);
    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    let summary = diffDays > 0
        ? (t ? t('trip.status.days_to_go_fmt', { days: diffDays }) : `距離出發 ${diffDays} 天`)
        : (t ? t('trip.status.ongoing') : "旅程進行中");
    const nextFlight = trip.itinerary?.[now.toISOString().split('T')[0]]?.find(i => i.type === 'flight');
    if (nextFlight) summary += ` • ✈️ ${nextFlight.details.number} `;
    return summary;
};

export const calculateDebts = (budget, repayments, members, baseCurrency, exchangeRates) => {
    const balances = {};
    if (!members || !Array.isArray(members)) return { balances: {}, totalSpent: 0 };
    members.forEach(m => {
        if (m && m.name) balances[m.name] = 0;
    });
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

export const getWeatherForecast = (country, currentTempStr, customDesc, customIcon, t) => {
    const region = getSafeCountryInfo(country).region;
    const iconUrl = OUTFIT_IMAGES[region] || OUTFIT_IMAGES.north;

    // Helper: Get clothes based on temperature
    const getClothesForTemp = (temp) => {
        if (temp >= 28) return t ? t('trip.weather.clothes.hot') : "背心、短褲、防曬";
        if (temp >= 23) return t ? t('trip.weather.clothes.warm') : "短袖、透氣帆布鞋";
        if (temp >= 18) return t ? t('trip.weather.clothes.comfortable') : "薄長袖、針織衫";
        if (temp >= 12) return t ? t('trip.weather.clothes.cool') : "夾克、帽T、牛仔褲";
        return t ? t('trip.weather.clothes.cold') : "厚大衣、圍巾、發熱衣";
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
        if (temp >= 28) return t ? t('trip.weather.desc.hot') : "炎熱";
        if (temp >= 23) return t ? t('trip.weather.desc.warm') : "溫暖";
        if (temp >= 18) return t ? t('trip.weather.desc.comfortable') : "舒適";
        if (temp >= 12) return t ? t('trip.weather.desc.cool') : "微涼";
        return t ? t('trip.weather.desc.cold') : "寒冷";
    };

    // If real temp is provided (e.g. "28°C" or "25°C / 18°C")
    if (currentTempStr && currentTempStr !== "-- / --") {
        const parts = currentTempStr.split('/').map(p => {
            const val = parseInt(p.trim());
            return isNaN(val) ? 20 : val;
        });
        const maxTemp = parts[0] || 20;
        const minTemp = parts[1] || maxTemp; // Fallback to maxTemp if no minTemp provided

        const dayClothes = getClothesForTemp(maxTemp);
        const nightClothes = getClothesForTemp(minTemp);
        // Always show Day/Night format for clarity - Use standard pipe for regex compatibility
        const dayLabel = t ? t('trip.weather.day') : "日";
        const nightLabel = t ? t('trip.weather.night') : "夜";
        const clothes = `${dayLabel}：${dayClothes} | ${nightLabel}：${nightClothes} `;

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
        desc: t ? t('trip.weather.loading') : "載入中...",
        outfitIcon: iconUrl
    };
};

export const buildDailyReminder = (date, items = [], t, destHolidays = {}) => {
    if (!items.length) return t ? t('trip.reminders.no_plan') : "今日尚未規劃行程，快去新增吧！";

    const holidayName = destHolidays[date.slice(5)]; // "MM-DD"
    if (holidayName) {
        if (holidayName.includes("元日") || holidayName.includes("New Year")) return `⚠️ ${holidayName}${t ? t('trip.reminders.holidays.new_year') : "：大部分商店可能休息，請確認營業時間。"}`;
        if (holidayName.includes("除夕") || holidayName.includes("大晦日")) return `⚠️ ${holidayName}${t ? t('trip.reminders.holidays.eve') : "：注意交通管制與提早結束營業。"}`;
        if (holidayName.includes("聖誕")) return `🎄 ${holidayName}${t ? t('trip.reminders.holidays.christmas') : "：部分景點可能調整時間，建議預約餐廳。"}`;
        return `⚠️ ${holidayName}${t ? t('trip.reminders.holidays.general') : "：人潮可能較多，建議預留交通時間。"}`;
    }

    const first = items[0];
    const flights = items.filter(i => i.type === 'flight');
    if (flights.length) return t ? t('trip.reminders.flight_confirm', { number: flights.map(f => f.details?.number).join(", ") }) : `請確認 ${flights.map(f => f.details?.number).join(", ")} 航班，提前 2 小時抵達機場。`;
    return t ? t('trip.reminders.start_from', { count: items.length, time: first.details?.time || '早晨' }) : `${items.length} 項安排，從 ${first.details?.time || '早晨'} 開始，記得預留交通時間。`;
};


export const getUserInitial = (nameOrEmail = "") => (nameOrEmail[0] || "T").toUpperCase();

export const getWalkMeta = () => {
    const distance = (0.4 + Math.random() * 0.8).toFixed(1);
    const steps = Math.round(Number(distance) * 1400);
    const minutes = Math.round(Number(distance) * 12);
    return { distance, steps, minutes };
};

export const getTransportAdvice = (item, city = "", t) => {
    const itemName = (item.name || "").toUpperCase();
    const itemLocation = (item.details?.location || "").toUpperCase();
    const airportCodes = ['HKG', 'NRT', 'HND', 'KIX', 'TPE', 'LHR', 'CDG', 'JFK', 'SFO', 'LAX', 'ICN'];
    const isAirport = item.type === 'flight' ||
        airportCodes.some(code => itemName.includes(code) || itemLocation.includes(code)) ||
        itemName.includes('AIRPORT') || itemName.includes('機場');

    const translateApprox = (price) => t ? t('trip.transport.approx', { price }) : `約 ${price}`;

    if (isAirport) return {
        mode: 'metro',
        icon: 'train', // V1.3.8: Added Icon
        label: t ? t('trip.transport.airport_express') : "機場快線 / 地鐵 / 機場巴士",
        cost: translateApprox("$120")
    };

    if (item.type === 'hotel') return {
        mode: 'car',
        icon: 'car', // V1.3.8: Added Icon
        label: t ? t('trip.transport.taxi_mins', { mins: 15 }) : "計程車約 15 分",
        cost: translateApprox("$80")
    };

    if (item.type === 'food') {
        const walk = getWalkMeta();
        return {
            mode: 'walk',
            icon: 'walk', // V1.3.8: Added Icon
            label: t ? t('trip.transport.walking_mins', { mins: walk.minutes }) : `步行 ${walk.minutes} 分`,
            cost: "$0",
            meta: walk
        };
    }

    if (item.type === 'transport') return {
        mode: 'bus',
        icon: 'bus', // V1.3.8: Added Icon
        label: t ? t('trip.transport.bus_express') : "巴士 / 高速巴士",
        cost: item.cost ? `${item.currency} ${item.cost}` : (t ? t('trip.transport.fare') : "依票價")
    };

    return {
        mode: 'metro',
        icon: 'train', // V1.3.8: Added Icon
        label: t ? t('trip.transport.metro_city', { city }) : `${city} 地鐵`,
        cost: translateApprox("$30")
    };
};

/**
 * 💡 Get Nearby Attraction Hint (Mocked context-aware suggestions for V1.3.8)
 */
export const getNearbyAttractionHint = (location, t) => {
    if (!location) return null;
    const loc = location.toUpperCase();
    const isChinese = t && (t('common.search') === '搜尋...');

    if (loc.includes('NRT') || loc.includes('NARITA')) return isChinese ? "成田山新勝寺 (傳統建築)" : "Naritasan Shinshoji (Historic Temple)";
    if (loc.includes('HKG') || loc.includes('AIRPORT')) return isChinese ? "昂坪 360 (纜車景點)" : "Ngong Ping 360 (Cable Car)";
    if (loc.includes('SHINJUKU')) return isChinese ? "東京都廳 (免費展望台)" : "Tokyo Metro Govt Bldg (Free View)";
    if (loc.includes('TSUMAGOI')) return isChinese ? "嬬戀牧場 (自然風光)" : "Tsumagoi Farm (Nature View)";
    if (loc.includes('LONDON')) return isChinese ? "大英博物館 (歷史瑰寶)" : "British Museum (Historic Gem)";

    return null;
};

export const buttonPrimary = `flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.05] active:scale-95 w-full cursor-pointer`;

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
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} `;
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

export const inputClasses = (isDarkMode) => `w-full px-4 py-3.5 rounded-xl border transition-all outline-none font-medium tracking-wide bg-white border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-gray-900 placeholder-gray-400 shadow-sm dark:bg-gray-800/90 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 dark:text-white dark:placeholder-gray-500`;

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
    } catch (e) {
        console.debug("Smart image failed:", e);
    }
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

/**
 * 💡 Google Maps Helpers
 */
export const getGoogleMapsSearchUrl = (query) => {
    if (!query) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const getGoogleMapsDirectionsUrl = (origin, destination, mode = 'transit') => {
    if (!origin || !destination) return null;
    const googleMode = mode === 'walk' ? 'walking' : (mode === 'car' ? 'driving' : mode);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${googleMode}`;
};

/**
 * 💡 Get Smart Tips for a Trip
 * Uses trip data (dates, itinerary completeness) to generate relevant tips.
 */
export const getSmartTips = (trip, t) => {
    if (!trip) return [];

    const tips = [];
    const today = new Date();
    const start = trip.startDate ? parseISO(trip.startDate) : null;
    const daysUntil = start ? differenceInDays(start, today) : null;
    const items = Object.values(trip.itinerary || {}).flat();

    // 1. Itinerary Planning Status
    if (items.length === 0) {
        tips.push({
            icon: MapPin,
            text: t ? t('trip.tips.plan_itinerary') : "規劃行程",
            subtext: t ? t('trip.tips.no_items') : "尚未有任何安排",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            action: "itinerary"
        });
    } else if (daysUntil !== null && daysUntil > 0 && daysUntil <= 30 && items.length < 5) {
        tips.push({
            icon: MapPin,
            text: t ? t('trip.tips.refine_details') : "完善細節",
            subtext: t ? t('trip.tips.too_free') : "行程比較空閒",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            action: "itinerary"
        });
    }

    // 2. Booking Reminders (Flight/Hotel)
    const hasFlight = items.some(i => i.type === 'flight');
    const hasHotel = items.some(i => i.type === 'hotel');

    if (!hasFlight && daysUntil !== null && daysUntil > 30) {
        tips.push({
            icon: Plane,
            text: t ? t('trip.tips.book_flight') : "預訂機票",
            subtext: t ? t('trip.tips.book_early') : "建議提前預訂",
            color: "text-sky-500",
            bg: "bg-sky-500/10",
            action: "flight" // Could trigger a search or modal
        });
    }

    if (!hasHotel && daysUntil !== null && daysUntil > 14) {
        tips.push({
            icon: Hotel,
            text: t ? t('trip.tips.book_hotel') : "預訂住宿",
            subtext: t ? t('trip.tips.check_hotel') : "查看推薦酒店",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            action: "hotel"
        });
    }

    // 3. Proximity Tips (Insurance, Packing, Weather)
    if (daysUntil !== null) {
        if (daysUntil > 14 && daysUntil <= 60) {
            tips.push({
                icon: Shield,
                text: t ? t('trip.tips.buy_insurance') : "購買保險",
                subtext: t ? t('trip.tips.safety_first') : "保障旅程安全",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
            });
        }

        if (daysUntil > 7 && daysUntil <= 30) {
            tips.push({
                icon: Ticket,
                text: t ? t('trip.tips.check_visa') : "檢查簽證",
                subtext: t ? t('trip.tips.check_passport') : "確認護照有效期",
                color: "text-purple-500",
                bg: "bg-purple-500/10"
            });
        }

        if (daysUntil <= 3 && daysUntil >= 0) {
            tips.push({
                icon: Backpack,
                text: t ? t('trip.tips.pack_luggage') : "收拾行李",
                subtext: t ? t('trip.tips.check_essentials') : "檢查必帶物品",
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                action: "packing"
            });
            tips.push({
                icon: Sun,
                text: t ? t('trip.tips.check_weather') : "查看天氣",
                subtext: t ? t('trip.tips.prepare_clothes') : "準備合適衣物",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                action: "weather"
            });
        }
    }

    // Default Fallback
    if (tips.length === 0) {
        const endDate = trip.endDate ? parseISO(trip.endDate) : null;
        // differenceInDays(dateLeft, dateRight) -> if dateLeft < dateRight, result is negative.
        // If end date is yesterday, diff(yesterday, today) is -1.
        const isEnded = endDate && differenceInDays(endDate, today) < 0;

        if (isEnded) {
            tips.push({
                icon: CheckCircle2,
                text: t ? t('trip.tips.trip_ended') : "旅程結束",
                subtext: t ? t('trip.tips.welcome_back') : "歡迎回家！",
                color: "text-gray-500",
                bg: "bg-gray-500/10"
            });
        } else {
            tips.push({
                icon: MapPin,
                text: t ? t('trip.tips.ready_to_go') : "準備出發",
                subtext: t ? t('trip.tips.enjoy_trip') : "祝你旅途愉快！",
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
            });
        }
    }

    return tips;
};

export const getTripSeasonDisplay = (dateStr, lang = 'zh-TW') => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const month = date.getMonth() + 1; // 1-12

    // Logic for N. Hemisphere (Simple)
    if (month >= 3 && month <= 5) return {
        text: lang.includes('zh') ? '🌸 櫻花季' : '🌸 Spring',
        bg: 'bg-pink-500/80 text-white shadow-pink-500/20'
    };
    if (month >= 6 && month <= 8) return {
        text: lang.includes('zh') ? '☀️ 仲夏' : '☀️ Summer',
        bg: 'bg-orange-500/80 text-white shadow-orange-500/20'
    };
    if (month >= 9 && month <= 11) return {
        text: lang.includes('zh') ? '🍁 紅葉季' : '🍁 Autumn',
        bg: 'bg-red-500/80 text-white shadow-red-500/20'
    };
    return {
        text: lang.includes('zh') ? '❄️ 雪季' : '❄️ Winter',
        bg: 'bg-blue-500/80 text-white shadow-blue-500/20'
    };
};

