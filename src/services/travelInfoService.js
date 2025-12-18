/**
 * TravelInfoService.js
 * 
 * 負責處理 Dashboard 旅遊資訊中心的數據獲取。
 * 目前採用 "Hybrid Mock" 策略：
 * 1. 使用靜態數據作為基礎 (Base Data)
 * 2. 加入隨機波動邏輯 (Random Fluctuation) 模擬實時價格變化
 * 3. 預留 fetchRealAPI 接口，未來可直接替換為 Booking.com / Skyscanner API
 */

import { INFO_DB } from '../constants/appData';

import { convertCurrency } from './exchangeRate';

// 模擬延遲，增加真實感
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 隨機整數
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 格式化貨幣
const formatPrice = (price, currency = 'HKD') => {
    return new Intl.NumberFormat('en-HK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
};

class TravelInfoService {
    constructor() {
        this.useRealAPI = false; // 未來可以切換為 true
    }

    /**
     * 獲取酒店推薦
     * @param {string} region - 地區 filter (optional)
     * @param {string} userCurrency - 用戶貨幣
     * @param {object} rates - 匯率數據
     */
    async getHotels(region = 'all', userCurrency = 'HKD', rates = {}) {
        await delay(randomInt(500, 1500)); // 模擬 API Latency

        let hotels = [...INFO_DB.hotels];

        // 模擬價格波動 (±15%) 並轉換匯率
        hotels = hotels.map(h => {
            const fluctuation = randomInt(-15, 15) / 100;
            const basePrice = h.priceVal || parseInt(h.price.replace(/[^0-9]/g, '')) || 1000; // Extract numeric price

            // 計算波動後價格 (HKD Base)
            const fluctuatingPriceHKD = basePrice * (1 + fluctuation);

            // 轉換至用戶貨幣
            const finalPrice = convertCurrency(fluctuatingPriceHKD, 'HKD', userCurrency, rates);

            return {
                ...h,
                price: formatPrice(finalPrice, userCurrency),
                priceRaw: finalPrice, // For sorting if needed
                // 模擬剩餘房間
                remaining: randomInt(1, 5) < 3 ? randomInt(2, 8) : null
            };
        });

        // 排序：評分高 -> 低
        hotels.sort((a, b) => b.rating - a.rating);

        return hotels;
    }

    /**
     * 獲取機票優惠
     */
    async getFlights(userCurrency = 'HKD', rates = {}) {
        await delay(randomInt(800, 2000));

        let flights = [...INFO_DB.flights];

        // 模擬實時狀態
        flights = flights.map(f => {
            const fluctuation = randomInt(-10, 10) / 100;
            const basePrice = f.priceVal || parseInt(f.price.replace(/[^0-9]/g, '')) || 2000;

            const fluctuatingPriceHKD = basePrice * (1 + fluctuation);
            const finalPrice = convertCurrency(fluctuatingPriceHKD, 'HKD', userCurrency, rates);

            return {
                ...f,
                price: formatPrice(finalPrice, userCurrency),
                isHot: randomInt(1, 10) > 7
            };
        });

        return flights;
    }

    /**
     * 獲取交通票券
     */
    async getTransports(userCurrency = 'HKD', rates = {}) {
        await delay(randomInt(300, 1000));

        let transports = [...INFO_DB.transports];

        transports = transports.map(t => {
            const basePrice = t.priceVal || parseInt(t.price.replace(/[^0-9]/g, '')) || 100;
            const finalPrice = convertCurrency(basePrice, 'HKD', userCurrency, rates);

            return {
                ...t,
                price: formatPrice(finalPrice, userCurrency)
            };
        });

        return transports;
    }
    /**
     * 獲取網卡/WiFi 方案
     */
    async getConnectivity(userCurrency = 'HKD', rates = {}) {
        await delay(randomInt(200, 800)); // 模擬較快的回應

        let items = [...INFO_DB.connectivity];

        items = items.map(c => {
            const basePrice = c.priceVal || parseInt(c.price.replace(/[^0-9]/g, '')) || 50;
            const finalPrice = convertCurrency(basePrice, 'HKD', userCurrency, rates);

            return {
                ...c,
                price: formatPrice(finalPrice, userCurrency)
            };
        });

        return items;
    }
}

export const travelInfoService = new TravelInfoService();
