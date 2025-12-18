// src/services/ai.js

/**
 * AI 服務模組
 * 負責生成行程建議、旅遊提示等
 * 目前為高級模擬模式，未來可接入 Gemini / OpenAI API
 */

// 模擬導出數據庫以供 UI 使用
export { SHOPPING_DB, MOCK_DB };

/**
 * 根據城市與天數生成完整行程建議
 * 確保每日景點唔重複（除非用戶手動安排）
 */
export const generateFullItinerary = async (city, days = 3) => {
    await new Promise(r => setTimeout(r, 800));

    const dbItems = MOCK_DB[city] || FALLBACK_SUGGESTIONS(city);

    // 將所有可用項目打亂，並建立一個不重複的池
    const shuffledPool = [...dbItems].sort(() => 0.5 - Math.random());
    let poolIndex = 0;

    const fullPlan = [];

    for (let d = 1; d <= days; d++) {
        // 第一天加入航班
        if (d === 1) {
            fullPlan.push({
                id: `ai-it-f1`, day: 1, time: "08:00", name: `前往 ${city} 的航班`,
                type: "flight", cost: 4500, currency: "HKD",
                details: { location: `HKG -> ${city}`, desc: "預留充足時間辦理登機", insight: "早班機雖然辛苦，但能為您的第一天爭取更多探索時間。" }
            });
        }

        // 從池中順序取出 2-3 個項目（確保唔重複）
        const itemsPerDay = Math.min(3, shuffledPool.length - poolIndex);
        for (let idx = 0; idx < itemsPerDay; idx++) {
            if (poolIndex >= shuffledPool.length) {
                // 如果池用盡，重新打亂（但標記為「進階/隱藏版」）
                poolIndex = 0;
            }
            const item = { ...shuffledPool[poolIndex] };
            poolIndex++;

            fullPlan.push({
                ...item,
                id: `ai-it-${d}-${idx}`,
                day: d,
                time: item.time
            });
        }

        // 每天加入一個交通建議 (第一天除外，因為已有航班)
        if (d > 1 || days === 1) {
            fullPlan.push({
                id: `ai-it-${d}-tr`, day: d, time: "10:30", name: "市內大眾運輸建議",
                type: "transport", cost: 50, currency: "HKD",
                details: { location: city, desc: "推薦使用一日交通券", insight: "這座城市的公共交通網絡極其發達，地鐵或巴士是最高效的選擇。" }
            });
        }
    }

    return fullPlan.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.time.localeCompare(b.time);
    });
};

// 專用購物建議數據庫
const SHOPPING_DB = {
    "Japan": [
        { name: "Tokyo Banana", estPrice: "JPY 1200", type: "food", desc: "必買伴手禮", reason: "東京最有代表性的伴手禮，口感綿密且包裝精美，不論送禮或自用都非常合適。" },
        { name: "白色戀人巧克力", estPrice: "JPY 800", type: "food", desc: "北海道名產", reason: "雖然是北海道產，但全日本機場都能買到。夾心巧克力餅乾的經典之作，長輩最愛。" },
        { name: "藥妝 (EVE, LuLuLun)", estPrice: "JPY 5000", type: "cosmetic", desc: "囤貨必備", reason: "日本藥妝品質保證，價格通常是香港的 6-7 折。推薦買止痛藥與保濕面膜。" },
        { name: "Bic Camera 電器", estPrice: "JPY 30000", type: "electronics", desc: "免稅更抵", reason: "日本電器設計先進且耐用。搭配免稅與優惠券，購入相機或吹風機非常划算。" },
        { name: "Uniqlo/GU", estPrice: "JPY 10000", type: "clothing", desc: "日本限定款", reason: "價格比海外便宜不少，且常有日本限定的設計師聯名款，值得多入手幾件。" }
    ],
    "Korea": [
        { name: "Olive Young 面膜", estPrice: "KRW 30000", type: "cosmetic", desc: "韓妹必備", reason: "韓國美妝店龍頭，面膜種類繁多，是送禮自用兩相宜的選擇。" },
        { name: "Gentle Monster", estPrice: "KRW 250000", type: "fashion", desc: "潮流墨鏡", reason: "韓國設計師品牌，以獨特前衛的設計聞名，深受時尚潮人喜愛。" },
        { name: "HBAF 杏仁", estPrice: "KRW 5000", type: "food", desc: "多種口味", reason: "韓國超人氣零食，多種創新口味，是追劇、下酒的好夥伴。" },
        { name: "Line Friends 周邊", estPrice: "KRW 40000", type: "gift", desc: "可愛實用", reason: "Line Friends 角色在全球擁有高人氣，周邊商品從文具到生活用品應有盡有，可愛又實用。" }
    ],
    "Taiwan": [
        { name: "微熱山丘鳳梨酥", estPrice: "TWD 420", type: "food", desc: "土鳳梨內餡", reason: "台灣鳳梨酥的代表品牌，以純天然土鳳梨內餡聞名，酸甜適中，口感紮實。" },
        { name: "佳德蔥軋餅", estPrice: "TWD 300", type: "food", desc: "排隊名店", reason: "將香蔥蘇打餅乾與牛軋糖結合，鹹甜交織，口感豐富，是台灣獨特的伴手禮。" },
        { name: "Kavalan 威士忌", estPrice: "TWD 2500", type: "alcohol", desc: "台灣之光", reason: "台灣金車集團旗下的威士忌品牌，多次獲得國際大獎，是台灣精品威士忌的代表。" },
        { name: "文創商品 (誠品)", estPrice: "TWD 1000", type: "gift", desc: "質感設計", reason: "誠品書店不僅是書店，更是文創商品的集散地，能找到許多獨具台灣特色的設計品。" }
    ],
    "Thailand": [
        { name: "NaRaYa 曼谷包", estPrice: "THB 500", type: "fashion", desc: "平價實用", reason: "泰國國民品牌，以緞面材質和蝴蝶結設計聞名，款式多樣，價格親民，是送禮自用皆宜的選擇。" },
        { name: "Pocky (芒果/香蕉)", estPrice: "THB 20", type: "food", desc: "泰國限定", reason: "泰國限定的芒果和香蕉口味 Pocky，是其他地方買不到的特色零食，口感香甜。" },
        { name: "泰式奶茶手標茶", estPrice: "THB 150", type: "food", desc: "在家沖泡", reason: "泰國經典手標泰奶茶葉，在家也能輕鬆沖泡出地道的泰式奶茶風味。" },
        { name: "香氛精油", estPrice: "THB 800", type: "lifestyle", desc: "SPA 享受", reason: "泰國是香氛產品的天堂，各種天然精油和香氛產品，能帶來身心放鬆的 SPA 體驗。" }
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
        { time: "09:00", name: "築地場外市場早餐", type: "food", cost: 3000, currency: "JPY", details: { location: "Tsukiji Outer Market", desc: "新鮮壽司與海鮮丼", insight: "築地市場曾是世界最大的魚市場。場外市場依然保留著江戶時代的活力，是品嚐正宗壽司的首選地。" } },
        { time: "11:00", name: "淺草寺參拜與雷門", type: "spot", cost: 0, currency: "JPY", details: { location: "Senso-ji", desc: "東京最古老寺廟", insight: "創建於 628 年，是東京都內最古老的寺院。巨大的紅色燈籠和仲見世通商店街是必拍景點。" } },
        { time: "14:00", name: "東京晴空塔展望台", type: "spot", cost: 3500, currency: "JPY", details: { location: "Tokyo Skytree", desc: "俯瞰東京全景", insight: "高度達 634 公尺，是世界最高塔。在展望塔上可以 360 度俯瞰關東平原，天氣好時還能見到富士山。" } },
        { time: "17:00", name: "秋葉原電器街購物", type: "shopping", cost: 15000, currency: "JPY", details: { location: "Akihabara", desc: "動漫迷聖地", insight: "戰後作為電器零件轉運站起家，現已演變為全球動漫與電子遊戲文化的中心，充滿無限創意。" } },
        { time: "20:00", name: "銀座高級燒肉晚餐", type: "food", cost: 8000, currency: "JPY", details: { location: "Ginza", desc: "A5 和牛體驗", insight: "銀座是日本最昂貴的地段。在這裡品嚐頂級和牛，不僅是味覺享受，更是一種極致的文化體驗。" } }
    ],
    "Osaka": [
        { time: "10:00", name: "大阪城公園", type: "spot", cost: 600, currency: "JPY", details: { location: "Osaka Castle", desc: "歷史名勝", insight: "大阪的象徵，由豐臣秀吉於 16 世紀建造。天守閣內有博物館，可了解其歷史，周圍的公園也是賞櫻勝地。" } },
        { time: "13:00", name: "黑門市場掃街", type: "food", cost: 4000, currency: "JPY", details: { location: "Kuromon Market", desc: "大阪的廚房", insight: "擁有 190 年歷史的市場，被譽為「大阪的廚房」。新鮮海產、水果、小吃應有盡有，是品嚐當地美食的好去處。" } },
        { time: "16:00", name: "心齋橋瘋狂購物", type: "shopping", cost: 20000, currency: "JPY", details: { location: "Shinsaibashi", desc: "藥妝店一級戰區", insight: "大阪最繁華的購物區之一，從百貨公司到藥妝店、潮流服飾店，滿足各種購物需求。" } },
        { time: "19:00", name: "道頓堀固力果跑跑人", type: "spot", cost: 0, currency: "JPY", details: { location: "Dotonbori", desc: "必拍打卡位", insight: "大阪的代表性觀光地，霓虹燈招牌林立，其中固力果跑跑人招牌是必拍地標。沿河道有許多美食餐廳。" } }
    ],
    "Taipei": [
        { time: "09:30", name: "故宮博物院", type: "spot", cost: 350, currency: "TWD", details: { location: "National Palace Museum", desc: "中華文化瑰寶", insight: "世界五大博物館之一，典藏近 70 萬件中華文物，其中翠玉白菜、肉形石等是鎮館之寶。" } },
        { time: "12:30", name: "鼎泰豐小籠包", type: "food", cost: 800, currency: "TWD", details: { location: "Taipei 101", desc: "世界級美食", insight: "享譽國際的台灣小籠包名店，以皮薄餡多、湯汁鮮美聞名，是許多觀光客來台必訪的餐廳。" } },
        { time: "15:00", name: "台北 101 觀景台", type: "spot", cost: 600, currency: "TWD", details: { location: "Taipei 101", desc: "市景盡收眼底", insight: "曾是世界第一高樓，登上觀景台可 360 度俯瞰台北市景，感受城市脈動。" } },
        { time: "18:00", name: "士林夜市", type: "food", cost: 500, currency: "TWD", details: { location: "Shilin Night Market", desc: "雞排、珍珠奶茶", insight: "台北最具規模的夜市之一，匯集各式台灣小吃，如豪大大雞排、大腸包小腸、珍珠奶茶等，是體驗台灣夜市文化的好地方。" } }
    ],
    "London": [
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

/**
 * AI 自動生成行程名稱
 * @param {string} city 
 * @param {string} dateRange (e.g. "2024-12-01 to 2024-12-05")
 * @returns {Promise<string>}
 */
export async function generateAiTripName(city, startDate, endDate) {
    await new Promise(r => setTimeout(r, 800));

    // Mock Logic
    const adjectives = ["Relaxing", "Adventure", "Foodie", "Romantic", "Cultural", "Epic"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const year = startDate ? startDate.split('-')[0] : new Date().getFullYear();

    // Chinese Names
    const twAdjectives = ["都", "放鬆", "爆食", "深度", "快閃", "浪漫"];
    const twAdj = twAdjectives[Math.floor(Math.random() * twAdjectives.length)];

    if (city === 'Taipei' || city.includes('台北')) return `🇹🇼 台北${twAdj}遊 ${year}`;
    return `✈️ ${city} ${twAdj} Trip ${year}`;
}

// Mock AI Smart Packing List Generator
export const generatePackingList = async (trip, weatherData) => {
    // Simulate AI Delay
    await new Promise(r => setTimeout(r, 1500));

    const items = [];
    const pushItem = (name, cat) => items.push({ id: Date.now() + Math.random(), name, category: cat, checked: false, aiSuggested: true });

    // 1. Basics (Documents & Electronics)
    pushItem("護照 / 簽證", "documents");
    pushItem("身份證 / 駕照", "documents");
    pushItem("機票 / 酒店確認單", "documents");
    pushItem("手機 / 充電線", "electronics");
    pushItem("外遊萬能插座", "electronics");
    pushItem("外幣現金 / 信用卡", "documents");
    pushItem("個人藥物 / 暈浪丸", "medicine");

    // 2. Weather Based
    const temp = parseInt(weatherData?.temp || "20");
    const desc = (weatherData?.desc || "").toLowerCase();

    if (temp < 15) {
        pushItem("保暖大衣 / 羽絨", "clothes");
        pushItem("頸巾 / 手套", "clothes");
        pushItem("發熱衣 (Heattech)", "clothes");
    } else if (temp > 25) {
        pushItem("短袖 T-Shirt", "clothes");
        pushItem("短褲 / 短裙", "clothes");
        pushItem("太陽眼鏡", "misc");
        pushItem("防曬乳", "toiletries");
    } else {
        pushItem("薄外套 / 針織衫", "clothes");
        pushItem("長褲 / 牛仔褲", "clothes");
    }

    if (desc.includes("雨") || desc.includes("rain")) {
        pushItem("雨傘 / 雨衣", "misc");
        pushItem("防水鞋", "clothes");
    }

    // 3. Activity Based (Scan Itinerary)
    // Flatten itinerary
    const allItems = Object.values(trip.itinerary || {}).flat();
    const allText = allItems.map(i => (i.name + (i.desc || "")).toLowerCase()).join(" ");

    if (allText.includes("游水") || allText.includes("swim") || allText.includes("beach") || allText.includes("海灘")) {
        pushItem("泳衣 / 泳褲", "clothes");
        pushItem("拖鞋", "clothes");
        pushItem("防水袋", "misc");
    }

    if (allText.includes("行山") || allText.includes("hike") || allText.includes("山")) {
        pushItem("行山鞋", "clothes");
        pushItem("運動裝", "clothes");
        pushItem("蚊怕水", "medicine");
    }

    return items;
};

/**
 * 智能排程優化 (Smart Scheduler V1.0)
 * 補全時間、交通、建議滯留時間
 * @param {Array} items 
 * @returns {Promise<Array>}
 */
export async function optimizeSchedule(items) {
    await new Promise(r => setTimeout(r, 1200));

    // Deep copy to avoid mutation
    let newItems = JSON.parse(JSON.stringify(items));
    let currentTime = "09:00";

    newItems = newItems.map((item, index) => {
        // Assign Time if missing
        if (!item.time) {
            item.time = currentTime;
        } else {
            currentTime = item.time;
        }

        // Advance time for next item (Mock Duration 2 hours)
        const [h, m] = currentTime.split(':').map(Number);
        let newH = h + 2;
        currentTime = `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        // Add Transport Advice if not present and next item exists
        if (!item.transport && index < newItems.length - 1) {
            const nextItem = newItems[index + 1];
            // Mock Transport Logic based on random
            const modes = [
                { type: 'Walk', duration: '15min', icon: 'footprints' },
                { type: 'Metro', duration: '20min', price: 'JPY 200', icon: 'train' },
                { type: 'Taxi', duration: '10min', price: 'JPY 1500', icon: 'car' }
            ];
            const mode = modes[Math.floor(Math.random() * modes.length)];
            item.transport = {
                mode: mode.type,
                duration: mode.duration,
                price: mode.price,
                desc: `${mode.type} to ${nextItem.name}`
            };
        }

        // Add "Smart Tag"
        if (!item.smartTag) {
            const tags = ["🔥 熱門", "📸 打卡", "🍜 必吃", "📅 需預約"];
            if (Math.random() > 0.7) item.smartTag = tags[Math.floor(Math.random() * tags.length)];
        }

        return item;
    });

    return newItems;
}
