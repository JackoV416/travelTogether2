// src/services/ai.js

/**
 * AI 服務模組
 * 負責生成行程建議、旅遊提示等
 * 目前為高級模擬模式，未來可接入 Gemini / OpenAI API
 */

// 專用購物建議數據庫
const SHOPPING_DB = {
    "Japan": [
        { name: "Tokyo Banana", estPrice: "JPY 1200", type: "food", desc: "必買伴手禮" },
        { name: "白戀人朱古力", estPrice: "JPY 800", type: "food", desc: "北海道名產" },
        { name: "藥妝 (EVE, LuLuLun)", estPrice: "JPY 5000", type: "cosmetic", desc: "囤貨必備" },
        { name: "Bic Camera 電器", estPrice: "JPY 30000", type: "electronics", desc: "免稅更抵" },
        { name: "Uniqlo/GU", estPrice: "JPY 10000", type: "clothing", desc: "日本限定款" }
    ],
    "Korea": [
        { name: "Olive Young 面膜", estPrice: "KRW 30000", type: "cosmetic", desc: "韓妹必備" },
        { name: "Gentle Monster", estPrice: "KRW 250000", type: "fashion", desc: "潮流墨鏡" },
        { name: "HBAF 杏仁", estPrice: "KRW 5000", type: "food", desc: "多種口味" },
        { name: "Line Friends 周邊", estPrice: "KRW 40000", type: "gift", desc: "可愛實用" }
    ],
    "Taiwan": [
        { name: "微熱山丘鳳梨酥", estPrice: "TWD 420", type: "food", desc: "土鳳梨內餡" },
        { name: "佳德蔥軋餅", estPrice: "TWD 300", type: "food", desc: "排隊名店" },
        { name: "Kavalan 威士忌", estPrice: "TWD 2500", type: "alcohol", desc: "台灣之光" },
        { name: "文創商品 (誠品)", estPrice: "TWD 1000", type: "gift", desc: "質感設計" }
    ],
    "Thailand": [
        { name: "NaRaYa 曼谷包", estPrice: "THB 500", type: "fashion", desc: "平價實用" },
        { name: "Pocky (芒果/香蕉)", estPrice: "THB 20", type: "food", desc: "泰國限定" },
        { name: "泰式奶茶手標茶", estPrice: "THB 150", type: "food", desc: "在家沖泡" },
        { name: "香氛精油", estPrice: "THB 800", type: "lifestyle", desc: "SPA 享受" }
    ]
};

const FALLBACK_SHOPPING = [
    { name: "當地特色零食", estPrice: "HKD 100", type: "food", desc: "超市尋寶" },
    { name: "明信片與磁貼", estPrice: "HKD 50", type: "gift", desc: "旅行紀念" },
    { name: "機場免稅品", estPrice: "HKD 1000", type: "shopping", desc: "最後衝刺" }
];

/**
 * 生成 AI 購物建議
 * @param {string} location 國家或城市
 * @returns {Promise<Array>}
 */
export async function generateShoppingSuggestions(location, categories = []) {
    const delay = 800 + Math.random() * 800; // 模擬思考時間
    await new Promise(resolve => setTimeout(resolve, delay));

    // 簡單匹配邏輯 (優先匹配國家)
    let suggestions = FALLBACK_SHOPPING;
    for (const key of Object.keys(SHOPPING_DB)) {
        if (location.includes(key) || (key === 'Japan' && (location.includes('Tokyo') || location.includes('Osaka'))) ||
            (key === 'Korea' && location.includes('Seoul')) || (key === 'Taiwan' && location.includes('Taipei'))) {
            suggestions = SHOPPING_DB[key];

            // Filter by categories if provided
            if (categories && categories.length > 0) {
                suggestions = suggestions.filter(item => categories.includes(item.type));
            }
            break;
        }
    }

    return suggestions;
}

// 模擬數據庫：針對不同城市的精選行程
const MOCK_DB = {
    "Tokyo": [
        { time: "09:00", name: "築地場外市場早餐", type: "food", cost: 3000, currency: "JPY", details: { location: "Tsukiji Outer Market", desc: "新鮮壽司與海鮮丼" } },
        { time: "11:00", name: "淺草寺參拜與雷門", type: "spot", cost: 0, currency: "JPY", details: { location: "Senso-ji", desc: "東京最古老寺廟，求籤必去" } },
        { time: "14:00", name: "東京晴空塔展望台", type: "spot", cost: 3500, currency: "JPY", details: { location: "Tokyo Skytree", desc: "俯瞰東京全景" } },
        { time: "17:00", name: "秋葉原電器街購物", type: "shopping", cost: 15000, currency: "JPY", details: { location: "Akihabara", desc: "動漫迷聖地" } },
        { time: "20:00", name: "銀座高級燒肉晚餐", type: "food", cost: 8000, currency: "JPY", details: { location: "Ginza", desc: "A5 和牛體驗" } }
    ],
    "Osaka": [
        { time: "10:00", name: "大阪城公園", type: "spot", cost: 600, currency: "JPY", details: { location: "Osaka Castle", desc: "歷史名勝" } },
        { time: "13:00", name: "黑門市場掃街", type: "food", cost: 4000, currency: "JPY", details: { location: "Kuromon Market", desc: "大阪的廚房" } },
        { time: "16:00", name: "心齋橋瘋狂購物", type: "shopping", cost: 20000, currency: "JPY", details: { location: "Shinsaibashi", desc: "藥妝店一級戰區" } },
        { time: "19:00", name: "道頓堀固力果跑跑人", type: "spot", cost: 0, currency: "JPY", details: { location: "Dotonbori", desc: "必拍打卡位" } }
    ],
    "Taipei": [
        { time: "09:30", name: "故宮博物院", type: "spot", cost: 350, currency: "TWD", details: { location: "National Palace Museum", desc: "中華文化瑰寶" } },
        { time: "12:30", name: "鼎泰豐小籠包", type: "food", cost: 800, currency: "TWD", details: { location: "Taipei 101", desc: "世界級美食" } },
        { time: "15:00", name: "台北 101 觀景台", type: "spot", cost: 600, currency: "TWD", details: { location: "Taipei 101", desc: "市景盡收眼底" } },
        { time: "18:00", name: "士林夜市", type: "food", cost: 500, currency: "TWD", details: { location: "Shilin Night Market", desc: "雞排、珍珠奶茶" } }
    ],
    "London": [
        { time: "10:00", name: "大英博物館", type: "spot", cost: 0, currency: "GBP", details: { location: "British Museum", desc: "世界歷史寶庫" } },
        { time: "13:00", name: "波羅市場午餐", type: "food", cost: 25, currency: "GBP", details: { location: "Borough Market", desc: "當地美食集散地" } },
        { time: "15:30", name: "倫敦塔橋", type: "spot", cost: 12, currency: "GBP", details: { location: "Tower Bridge", desc: "標誌性建築" } },
        { time: "19:00", name: "西區音樂劇", type: "spot", cost: 80, currency: "GBP", details: { location: "West End", desc: "世界級表演" } }
    ]
};

// 通用後備數據
const FALLBACK_SUGGESTIONS = (city) => [
    { time: "09:00", name: `${city} 市中心地標導覽`, type: "spot", cost: 0, details: { location: `${city} City Center`, desc: "探索城市核心區" } },
    { time: "12:30", name: `${city} 人氣餐廳午餐`, type: "food", cost: 20, details: { location: `${city} Popular Restaurant`, desc: "品嚐當地特色料理" } },
    { time: "15:00", name: `${city} 博物館/美術館`, type: "spot", cost: 15, details: { location: `${city} Museum`, desc: "文化藝術之旅" } },
    { time: "18:00", name: `${city} 購物區/夜市`, type: "shopping", cost: 50, details: { location: `${city} Shopping District`, desc: "購買紀念品與特產" } }
];

/**
 * 生成 AI 行程建議
 * @param {string} city 城市名稱
 * @param {Array} existingItems 現有行程項目
 * @returns {Promise<Array>} 建議行程列表
 */
export async function generateAISuggestions(city, existingItems = []) {
    // 模擬 API 延遲 (1-2秒)
    const delay = 1000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 簡單的關鍵字匹配，處理 "Tokyo (東京)" 這種格式
    const cityName = Object.keys(MOCK_DB).find(k => city.includes(k)) || city;

    // 獲取基礎建議
    let suggestions = MOCK_DB[cityName] ? [...MOCK_DB[cityName]] : FALLBACK_SUGGESTIONS(city);

    // 如果行程已滿，提供替代方案 (簡單邏輯：隨機洗牌或過濾)
    if (existingItems.length > 5) {
        // 假設這是一個 "隱藏版" 或 "放鬆版" 行程
        return suggestions.slice(0, 3).map(item => ({
            ...item,
            name: `(放鬆版) ${item.name}`,
            details: { ...item.details, desc: `${item.details.desc} - 慢活體驗` }
        }));
    }

    // 隨機選擇 3-4 個建議
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}
/**
 * 模擬 AI 視覺識別 (取代真實 API)
 * @param {File} file 上傳的圖片或 PDF
 * @returns {Promise<Array>} 解析出的行程項目
 */
export const parseTripImage = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模擬隨機解析結果
            const isFlight = file.name.toLowerCase().includes('flight') || Math.random() > 0.7;
            const isHotel = file.name.toLowerCase().includes('hotel') || Math.random() > 0.7;

            let result = [];

            if (isFlight) {
                result = [{
                    name: "前往東京成田機場 (JL736)",
                    type: "flight",
                    cost: 4500,
                    currency: "HKD",
                    // 刻意留空時間以觸發 AI 建議
                    details: { location: "HKG -> NRT", desc: "國泰航空 / 日本航空" }
                }];
            } else if (isHotel) {
                result = [{
                    name: "新宿格拉斯麗酒店 (Godzilla Hotel)",
                    type: "hotel",
                    cost: 120000,
                    currency: "JPY",
                    details: { location: "Shinjuku", desc: "4 晚住宿" }
                }];
            } else {
                // 預設雜項收據
                result = [
                    { name: "便利店宵夜", type: "food", cost: 1200, currency: "JPY", details: { location: "FamilyMart", desc: "炸雞、啤酒" } },
                    { name: "藥妝店購物", type: "shopping", cost: 5500, currency: "JPY", details: { location: "Matsumotokiyoshi", desc: "免稅品" } }
                ];
            }

            // 模擬 AI 建議補全 (Smart Suggestions)
            result = result.map(item => suggestMissingInfo(item));

            resolve(result);
        }, 1500); // 模擬處理時間
    });
};

/**
 * AI 智能補全缺失資料
 * @param {Object} item 
 * @param {Object} context (可選) 上下文如城市、日期
 */
export const suggestMissingInfo = (item, context = {}) => {
    const newItem = { ...item, aiSuggested: [] };

    // 如果沒有時間，AI 自動建議
    if (!newItem.time && !newItem.details?.time) {
        if (newItem.type === 'flight') {
            newItem.details = { ...newItem.details, time: "10:00" };
            newItem.aiSuggested.push('time');
        } else if (newItem.type === 'food') {
            newItem.details = { ...newItem.details, time: "12:30" };
            newItem.aiSuggested.push('time');
        } else if (newItem.type === 'hotel') {
            newItem.details = { ...newItem.details, time: "15:00" }; // Check-in time
            newItem.aiSuggested.push('time');
        } else {
            newItem.details = { ...newItem.details, time: "09:00" };
            newItem.aiSuggested.push('time');
        }
    }

    return newItem;
};
