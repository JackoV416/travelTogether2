// src/services/exchangeRate.js

const CACHE_KEY = 'travel_together_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小時緩存

// 預設匯率 (作為備份)
const FALLBACK_RATES = {
    HKD: 1,
    TWD: 4.1,
    JPY: 19.8,
    KRW: 170,
    USD: 0.128,
    EUR: 0.118,
    GBP: 0.101,
    THB: 4.6
};

/**
 * 獲取最新匯率
 * @param {string} baseCurrency 基礎貨幣，預設 HKD
 * @returns {Promise<Object>} 匯率數據
 */
export async function getExchangeRates(baseCurrency = 'HKD') {
    try {
        // 1. 檢查緩存
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp, base } = JSON.parse(cached);
            // 如果緩存有效且基礎貨幣相同，直接返回
            if (Date.now() - timestamp < CACHE_DURATION && base === baseCurrency) {
                // Using cached exchange rates
                return data;
            }
        }

        // 2. 調用 API (ExchangeRate-API 免費版)
        // 註：免費版支援標準 HTTP 請求，無須 API Key (v4版)
        // Fetching new exchange rates...
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // 3. 更新緩存
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: data.rates,
            timestamp: Date.now(),
            base: baseCurrency
        }));

        return data.rates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // 發生錯誤時使用備份數據或舊緩存
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached).data;
        }
        return FALLBACK_RATES;
    }
}

/**
 * 轉換貨幣
 * @param {number} amount金額
 * @param {string} fromCurrency 來源貨幣代碼
 * @param {string} toCurrency 目標貨幣代碼
 * @param {Object} rates 匯率表 (以基礎貨幣為基準)
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (!rates) return 0;

    // 假設 rates 是以 HKD 為基準 (或當前 baseCurrency)
    // 如果 rates[fromCurrency] 存在，則 1 base = rates[fromCurrency] formCurrency
    // 所以 base amount = amount / rates[fromCurrency]
    // 目標 amount = base amount * rates[toCurrency]

    const baseAmount = amount / (rates[fromCurrency] || 1);
    const targetAmount = baseAmount * (rates[toCurrency] || 1);

    return parseFloat(targetAmount.toFixed(2));
}
