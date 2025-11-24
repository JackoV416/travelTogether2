// src/utils/timeZoneMap.js

/**
 * 簡化的城市到 IANA 時區映射表。
 * 由於應用程式只存儲目的地城市名稱，這個映射表用於快速猜測時區。
 *
 * 如果城市不在列表中，預設返回 'Asia/Taipei'（台灣標準時區）。
 */
const timeZoneMap = {
    // 亞洲
    '東京': 'Asia/Tokyo',
    '大阪': 'Asia/Tokyo',
    '首爾': 'Asia/Seoul',
    '曼谷': 'Asia/Bangkok',
    '新加坡': 'Asia/Singapore',
    '香港': 'Asia/Hong_Kong',
    '台北': 'Asia/Taipei', // 台灣
    '上海': 'Asia/Shanghai',
    '北京': 'Asia/Shanghai',
    '吉隆坡': 'Asia/Kuala_Lumpur',
    '杜拜': 'Asia/Dubai',

    // 歐洲
    '巴黎': 'Europe/Paris',
    '倫敦': 'Europe/London',
    '羅馬': 'Europe/Rome',
    '柏林': 'Europe/Berlin',
    '阿姆斯特丹': 'Europe/Amsterdam',
    '巴塞隆納': 'Europe/Madrid',
    '莫斯科': 'Europe/Moscow',

    // 北美
    '紐約': 'America/New_York',
    '洛杉磯': 'America/Los_Angeles',
    '溫哥華': 'America/Vancouver',
    '多倫多': 'America/Toronto',

    // 大洋洲
    '雪梨': 'Australia/Sydney',
    '墨爾本': 'Australia/Melbourne',
    '奧克蘭': 'Pacific/Auckland',

    // 其他
    '里約熱內盧': 'America/Sao_Paulo',
    '開羅': 'Africa/Cairo',
};

/**
 * 根據目的地城市名稱，返回 IANA 時區字串。
 * @param {string} destination - 旅行的目的地城市名稱。
 * @returns {string} IANA 時區字串，如果找不到則返回預設值。
 */
export const getDestinationTimeZone = (destination) => {
    if (!destination) return 'Asia/Taipei';

    // 嘗試精確匹配
    const tz = timeZoneMap[destination];
    if (tz) return tz;

    // 嘗試模糊匹配（忽略大小寫，並匹配關鍵詞）
    const lowerDest = destination.toLowerCase().trim();
    
    // 由於城市名稱可能有多種寫法（e.g., "東京, 日本"），這裡做簡單匹配
    for (const city in timeZoneMap) {
        if (lowerDest.includes(city.toLowerCase())) {
            return timeZoneMap[city];
        }
    }

    // 預設為台北時區
    return 'Asia/Taipei';
};

/**
 * 提取時區的簡短名稱 (e.g., 'Asia/Tokyo' -> 'Tokyo' 或 'JST')
 * 由於瀏覽器處理時區縮寫可能不一致，這裡只提取城市名
 */
export const getShortTimeZoneName = (ianaTimeZone) => {
    if (!ianaTimeZone) return 'Local Time';
    const parts = ianaTimeZone.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
};
