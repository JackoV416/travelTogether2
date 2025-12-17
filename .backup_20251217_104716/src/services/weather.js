// src/services/weather.js

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// WMO 天氣代碼對應表
export const weatherCodes = {
    0: { icon: '☀️', desc: '晴天', descEn: 'Clear sky' },
    1: { icon: '🌤️', desc: '大致晴朗', descEn: 'Mainly clear' },
    2: { icon: '⛅', desc: '部分多雲', descEn: 'Partly cloudy' },
    3: { icon: '☁️', desc: '陰天', descEn: 'Overcast' },
    45: { icon: '🌫️', desc: '有霧', descEn: 'Fog' },
    48: { icon: '🌫️', desc: '霧凇', descEn: 'Depositing rime fog' },
    51: { icon: '🌦️', desc: '毛毛雨', descEn: 'Light drizzle' },
    53: { icon: '🌦️', desc: '小雨', descEn: 'Moderate drizzle' },
    55: { icon: '🌧️', desc: '大雨', descEn: 'Dense drizzle' },
    56: { icon: '🌨️', desc: '凍雨', descEn: 'Light freezing drizzle' },
    57: { icon: '🌨️', desc: '大凍雨', descEn: 'Dense freezing drizzle' },
    61: { icon: '🌧️', desc: '小雨', descEn: 'Slight rain' },
    63: { icon: '🌧️', desc: '中雨', descEn: 'Moderate rain' },
    65: { icon: '🌧️', desc: '大雨', descEn: 'Heavy rain' },
    66: { icon: '🌨️', desc: '小凍雨', descEn: 'Light freezing rain' },
    67: { icon: '🌨️', desc: '大凍雨', descEn: 'Heavy freezing rain' },
    71: { icon: '🌨️', desc: '小雪', descEn: 'Slight snow fall' },
    73: { icon: '🌨️', desc: '中雪', descEn: 'Moderate snow fall' },
    75: { icon: '❄️', desc: '大雪', descEn: 'Heavy snow fall' },
    77: { icon: '❄️', desc: '雪粒', descEn: 'Snow grains' },
    80: { icon: '🌧️', desc: '陣雨', descEn: 'Slight rain showers' },
    81: { icon: '🌧️', desc: '中陣雨', descEn: 'Moderate rain showers' },
    82: { icon: '⛈️', desc: '暴雨', descEn: 'Violent rain showers' },
    85: { icon: '❄️', desc: '陣雪', descEn: 'Slight snow showers' },
    86: { icon: '❄️', desc: '大陣雪', descEn: 'Heavy snow showers' },
    95: { icon: '⛈️', desc: '雷暴', descEn: 'Thunderstorm' },
    96: { icon: '⛈️', desc: '雷暴伴隨冰雹', descEn: 'Thunderstorm with slight hail' },
    99: { icon: '⛈️', desc: '大雷暴伴隨冰雹', descEn: 'Thunderstorm with heavy hail' }
};

/**
 * 獲取天氣數據 (Open-Meteo 免費 API)
 * @param {number} latitude 緯度
 * @param {number} longitude 經度
 * @returns {Promise<Object>} 天氣數據
 */
export async function getWeather(latitude, longitude) {
    try {
        const params = new URLSearchParams({
            latitude,
            longitude,
            current: 'temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m',
            daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset', // 用於日夜判斷等
            timezone: 'auto' // 自動偵測時區
        });

        const response = await fetch(`${WEATHER_API}?${params}`);
        if (!response.ok) {
            throw new Error('Weather API response not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        return null;
    }
}

/**
 * 根據天氣代碼獲取圖標和描述
 * @param {number} code WMO code
 * @returns {Object} { icon, desc, descEn }
 */
export function getWeatherInfo(code) {
    return weatherCodes[code] || { icon: '❓', desc: '未知', descEn: 'Unknown' };
}
