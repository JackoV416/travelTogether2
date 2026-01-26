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

const CACHE_KEY_PREFIX = 'weather_cache_v2_';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const ERROR_BACKOFF = 30 * 60 * 1000; // 30 mins backoff on 429

/**
 * 獲取天氣數據 (Open-Meteo 免費 API)
 * @param {number} latitude 緯度
 * @param {number} longitude 經度
 * @param {string} cityName 城市名稱 (用於緩存鍵)
 * @returns {Promise<Object>} 天氣數據
 */
export async function getWeather(latitude, longitude, cityName = 'default') {
    const cacheKey = `${CACHE_KEY_PREFIX}${cityName}`;
    const backoffKey = 'weather_api_backoff';

    try {
        // 0. 檢查全域 Circuit Breaker
        const lastError = localStorage.getItem(backoffKey);
        if (lastError && (Date.now() - parseInt(lastError) < ERROR_BACKOFF)) {
            const cachedStr = localStorage.getItem(cacheKey);
            if (cachedStr) {
                return JSON.parse(cachedStr).data;
            }
            return null;
        }

        // 1. 檢查緩存
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
            const cachedData = JSON.parse(cachedStr);
            const now = Date.now();
            if (now - cachedData.timestamp < CACHE_DURATION) {
                return cachedData.data;
            }
        }

        const params = new URLSearchParams({
            latitude,
            longitude,
            current: 'temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
            timezone: 'auto'
        });

        const response = await fetch(`${WEATHER_API}?${params}`);
        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`[Weather] 429 Limit Hit. Activating 30-min backoff.`);
                localStorage.setItem(backoffKey, Date.now().toString());
                // Silently return cache or null instead of throwing to avoid console noise/crash
                const fallback = localStorage.getItem(cacheKey);
                return fallback ? JSON.parse(fallback).data : null;
            }
            throw new Error(`Weather API response not ok: ${response.status}`);
        }

        const data = await response.json();

        // 3. 數據標準化 (Normalization)
        // Ensure we handle both legacy current_weather and new current object
        const current = data.current || data.current_weather || {};
        const daily = data.daily || {};
        const wCode = current.weathercode !== undefined ? current.weathercode : (current.weather_code || 0); // OpenMeteo names vary

        const tempVal = current.temperature_2m !== undefined ? current.temperature_2m : current.temperature;
        const wInfo = getWeatherInfo(wCode);

        const normalizedData = {
            ...data, // Keep raw data for advanced users
            temp: tempVal !== undefined ? `${Math.round(tempVal)}°C` : undefined,
            rawTemp: tempVal,
            icon: wInfo.icon,
            desc: wInfo.desc,
            descEn: wInfo.descEn,
            timestamp: Date.now() // specific fetch time
        };

        // 2. 儲存緩存
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: normalizedData
        }));

        return normalizedData;
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        // 如果有舊緩存，即使過期也先用著
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) return JSON.parse(cachedStr).data;
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

/**
 * AI 天氣摘要生成 (Placeholder / Re-impl)
 * @param {Object} weatherData - Normalized weather data
 * @param {string} lang - Language code
 */
export async function generateWeatherSummary(weatherData, lang = 'zh-HK') {
    // This looks like it was intended to use Gemini to summarize the week's weather.
    // To avoid circular dependencies or complex imports right now, we return a simple summary.
    // In a real implementation, we would import the AI service here.

    if (!weatherData || !weatherData.daily) return "";

    try {
        const { daily } = weatherData;
        const maxTemp = Math.max(...(daily.temperature_2m_max || []));
        const minTemp = Math.min(...(daily.temperature_2m_min || []));

        // Simple heuristic summary
        return lang === 'en'
            ? `Forecast for the week: Highs of ${Math.round(maxTemp)}°C, Lows of ${Math.round(minTemp)}°C.`
            : `本週天氣預測：最高 ${Math.round(maxTemp)}°C，最低 ${Math.round(minTemp)}°C，請留意溫差。`;
    } catch (e) {
        console.error("Weather summary generation failed:", e);
        return "";
    }
}
