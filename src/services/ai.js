// src/services/ai.js

/**
 * AI 服務模組
 * 負責生成行程建議、旅遊提示等
 * 目前為高級模擬模式，未來可接入 Gemini / OpenAI API
 */

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
