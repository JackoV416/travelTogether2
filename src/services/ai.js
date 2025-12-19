// src/services/ai.js

/**
 * AI 服務模組
 * 負責生成行程建議、旅遊提示等
 * 目前為高級模擬模式，未來可接入 Gemini / OpenAI API
 */

// 模擬導出數據庫以供 UI 使用

const HOTEL_DB = {
    "Tokyo": [
        {
            id: "h-tyo-1",
            name: "Park Hyatt Tokyo",
            budget: "luxury",
            rating: 4.8,
            reviews: "服務頂尖，新宿夜景一絕。甚至可以看到富士山。",
            price: "JPY 85,000+",
            location: "新宿 (Shinjuku)",
            facilities: ["室內泳池", "頂級SPA", "紐約吧 (New York Bar)", "24h 健身房"],
            desc: "位於新宿中心點，完美融合現代奢華與日式細膩。",
            tip: "即便未入住，亦強烈建議去 52 樓的 New York Bar 飲杯嘢。"
        },
        {
            id: "h-tyo-2",
            name: "APA Hotel Shinjuku Gyoen",
            budget: "budget",
            rating: 4.2,
            reviews: "地點無敵，新宿御苑站出口即達。房型較小但非常乾淨。",
            price: "JPY 12,000+",
            location: "新宿 (Shinjuku)",
            facilities: ["大浴場", "自助洗衣", "自動入住機"],
            desc: "性價比之王，緊鄰新宿地鐵站，房間雖小五臟俱全。",
            tip: "酒店對面就有連鎖超市，買晚餐非常方便。"
        },
        {
            id: "h-tyo-3",
            name: "Hoshinoya Tokyo",
            budget: "luxury",
            rating: 4.9,
            reviews: "都市中的頂級溫泉旅館，赤腳進出的文化體驗非常獨特。",
            price: "JPY 120,000+",
            location: "大手町 (Otemachi)",
            facilities: ["頂樓露天溫泉", "茶室", "管事服務"],
            desc: "星野集團旗艦店，全館榻榻米設計，展現現代日本工藝美學。",
            tip: "每晚都有傳統表演，入住後記得查詢時間表。"
        },
        {
            id: "h-tyo-4",
            name: "Shibuya Stream Excel Hotel Tokyu",
            budget: "mid",
            rating: 4.6,
            reviews: "位於澀谷新地標，設計感強，樓下就是購物美食街。",
            price: "JPY 35,000+",
            location: "澀谷 (Shibuya)",
            facilities: ["空中大堂", "直通澀谷站", "時尚酒吧"],
            desc: "工業風設計，落地大玻璃窗，非常適合年輕族群與潮流人士。",
            tip: "步行即可抵達澀谷十字路口，是拍照打卡的最佳據點。"
        },
        {
            id: "h-tyo-5",
            name: "Gracery Shinjuku (哥吉拉飯店)",
            budget: "mid",
            rating: 4.4,
            reviews: "哥吉拉頭像超吸睛！就在歌舞伎町中心，生活機能極佳。",
            price: "JPY 22,000+",
            location: "新宿 (Shinjuku)",
            facilities: ["哥吉拉觀景台", "電影院直通", "景觀餐廳"],
            desc: "位於著名的歌舞伎町，交通便利，是新宿最具代表性的酒店之一。",
            tip: "特定房型可以看到哥吉拉頭的特寫，怪獸迷必住。"
        }
    ],
    "Taipei": [
        {
            id: "h-tpe-1",
            name: "台北晶華酒店 (Regent Taipei)",
            budget: "luxury",
            rating: 4.7,
            reviews: "台北老牌星級酒店，服務非常親切，早餐選擇極多。",
            price: "TWD 8,500+",
            location: "中山區",
            facilities: ["露天泳池", "頂級自助餐 (栢麗廳)", "國際精品街", "SPA"],
            desc: "結合國際時尚與東方文化，地理位置優越，中山站步行 5 分鐘。",
            tip: "推薦嘗試酒店內的紅燒牛肉麵，曾獲多項獎項。"
        },
        {
            id: "h-tpe-2",
            name: "CitizenM Taipei North Gate",
            budget: "mid",
            rating: 4.5,
            reviews: "智能科技感十足，落地窗看北門風景非常美。酒吧 24 小時開放。",
            price: "TWD 3,500+",
            location: "中正區 (西門町旁)",
            facilities: ["24h 酒吧", "全智能客房控制", "多功能公共區"],
            desc: "來自荷蘭的潮牌酒店，專為現代旅行者設計，房間緊湊精緻。",
            tip: "入住時可以自選不同風景的房間，優先選高樓層。"
        },
        {
            id: "h-tpe-3",
            name: "台北文華東方酒店",
            budget: "luxury",
            rating: 4.9,
            reviews: "極致奢華的代表，服務無微不至，像宮殿一樣。",
            price: "TWD 15,000+",
            location: "松山區",
            facilities: ["米芝蓮餐廳", "恆溫泳池", "頂級水療", "下午茶服務"],
            desc: "歐式經典風格，壯麗的建築與細膩的服務，是台北頂級住宿首選。",
            tip: "Mandarin Cake Shop 的甜點非常有名，離去前記得買些伴手禮。"
        },
        {
            id: "h-tpe-4",
            name: "台北路徒行旅 (Roaders Hotel)",
            budget: "budget",
            rating: 4.3,
            reviews: "西門町中心，非常有特色的工業美式風，公共空間很驚艷。",
            price: "TWD 2,200+",
            location: "萬華區 (西門町)",
            facilities: ["免費零食區", "飛鏢/遊戲區", "自助登機流程"],
            desc: "適合年輕遊客的設計型旅館，大廳設有 24 小時免費零食吧。",
            tip: "大廳的爆米花和懷舊零食都是無限開放的，宵夜好去處。"
        },
        {
            id: "h-tpe-5",
            name: "台北和苑三井花園飯店",
            budget: "mid",
            rating: 4.7,
            reviews: "純正日系服務，頂樓大浴場完全像在日本一樣，超級乾淨。",
            price: "TWD 4,800+",
            location: "大安區 (忠孝新生站)",
            facilities: ["日式大浴場", "精緻日式早餐", "直通地鐵站"],
            desc: "日本三井集團直送台北，簡約質感的設計，深受商務與旅遊人士喜愛。",
            tip: "頂樓大浴場可以看到忠孝東路的繁華夜景，必泡！"
        }
    ],
    "Osaka": [
        {
            id: "h-osk-1",
            name: "The Ritz-Carlton Osaka",
            budget: "luxury",
            rating: 4.8,
            reviews: "歐式宮廷風格，服務非常貼心，離梅田站超近。",
            price: "JPY 65,000+",
            location: "梅田 (北區)",
            facilities: ["室內泳池", "高級法餐", "24h 健身房", "SPA"],
            desc: "大阪最具代表性的奢華酒店，經典歐風設計搭配日本頂級服務。",
            tip: "地下直通梅田站，落雨都唔使淋。"
        },
        {
            id: "h-osk-2",
            name: "Cross Hotel Osaka",
            budget: "mid",
            rating: 4.5,
            reviews: "心齋橋正中心，出門右轉就係道頓堀！設計感十足。",
            price: "JPY 18,000+",
            location: "心齋橋 (中央區)",
            facilities: ["設計師大堂", "屋頂露台", "手沖咖啡吧"],
            desc: "潮流設計酒店，年輕族群最愛，位置無可挑剔。",
            tip: "頂樓露台影夜景一流，記得上去打卡。"
        },
        {
            id: "h-osk-3",
            name: "Hotel Granvia Osaka",
            budget: "mid",
            rating: 4.6,
            reviews: "JR大阪站樓上，新幹線、機場特急全部直達。",
            price: "JPY 22,000+",
            location: "JR 大阪站 (梅田)",
            facilities: ["直通JR車站", "多間餐廳", "商務中心"],
            desc: "交通樞紐之王，適合要轉乘多條線路的旅客。",
            tip: "去京都奈良神戶都超方便，強烈推薦。"
        },
        {
            id: "h-osk-4",
            name: "First Cabin Midousuji Namba",
            budget: "budget",
            rating: 4.2,
            reviews: "膠囊酒店進化版，有獨立空間但價格超親民。",
            price: "JPY 5,500+",
            location: "難波 (中央區)",
            facilities: ["大浴場", "免費 WiFi", "自助洗衣"],
            desc: "適合獨遊背包客，乾淨舒適，難波站幾步路。",
            tip: "雖然係膠囊概念但有簾幕同鎖，私隱度OK。"
        }
    ],
    "Seoul": [
        {
            id: "h-sel-1",
            name: "Signiel Seoul",
            budget: "luxury",
            rating: 4.9,
            reviews: "位於樂天世界塔高層，俯瞰整個首爾，裝修極致夢幻。",
            price: "KRW 650,000+",
            location: "松坡區 (蠶室)",
            facilities: ["高空泳池", "米芝蓮韓餐", "專屬直升機坪", "香檳大廳"],
            desc: "韓國最高建築內的顶级奢華，每間房都有壯麗的漢江或市景景觀。",
            tip: "入住客人可以免費進入 79 樓的 Salon de Signiel 享用點心。"
        },
        {
            id: "h-sel-2",
            name: "L7 Hongdae By Lotte",
            budget: "mid",
            rating: 4.6,
            reviews: "就在弘大商圈入口，去夜生活或街頭表演區超級方便。",
            price: "KRW 180,000+",
            location: "麻浦區 (弘大)",
            facilities: ["頂樓室外泳池", "潮流大堂", "黑膠唱片區"],
            desc: "輕奢潮牌飯店，充滿藝術氛圍，正對弘益大學校園。",
            tip: "夏天的頂樓池畔派對非常有質感，入住的話記得帶泳衣。"
        },
        {
            id: "h-sel-3",
            name: "Nine Tree Hotel Myeongdong",
            budget: "budget",
            rating: 4.4,
            reviews: "明洞街頭一下換電梯就到，購物買化妝品完全不累。",
            price: "KRW 95,000+",
            location: "中區 (明洞)",
            facilities: ["明洞直通", "自助行李寄存", "枕頭菜單"],
            desc: "主打功能性與地理位置的精品酒店，是明洞購物的最佳基地。",
            tip: "酒店提供多種枕頭選擇，對睡眠品質要求高的人一定要試試。"
        }
    ],
    "Bangkok": [
        {
            id: "h-bkk-1",
            name: "The Siam Hotel",
            budget: "luxury",
            rating: 4.9,
            reviews: "這不是酒店是博物館，黑白裝飾藝術風格美到不行。",
            price: "THB 18,000+",
            location: "律實縣 (河畔)",
            facilities: ["泰式拳擊場", "私人遊艇對接", "古董圖書館", "私人泳池別墅"],
            desc: "由設計大師 Bill Bensley 操刀，充滿歷史韻味與寧靜感的顶级渡假村。",
            tip: "如果你有預算，一定要預約酒店的私人接駁小船前往市區，非常優雅。"
        },
        {
            id: "h-bkk-2",
            name: "Sindhorn Midtown Bangkok",
            budget: "mid",
            rating: 4.7,
            reviews: "頂樓無邊際泳池絕美，房間很大，就在 Langsuan 高級住宅區。",
            price: "THB 4,500+",
            location: "朗雙區 (Chit Lom)",
            facilities: ["無邊際泳池", "頂級健身房", "威士忌酒吧"],
            desc: "現代簡約風與泰式精緻的完美結合，性價比極高，鄰近購物區。",
            tip: "頂樓泳池是曼谷最熱門的打卡位之一，建議早上前往避開人潮。"
        },
        {
            id: "h-bkk-3",
            name: "Lub d Bangkok Siam Square",
            budget: "budget",
            rating: 4.2,
            reviews: "雖然是青年旅館但非常乾淨，地點無敵，就在 Siam Square 心臟地帶。",
            price: "THB 1,200+",
            location: "暹羅區 (Siam)",
            facilities: ["社交大廳", "共用/獨立空間", "電影區"],
            desc: "曼谷最出名的連鎖青旅，擁有极佳的社群氛圍與便利的地理位置。",
            tip: "即便是一個人旅行，這裡也有提供帶洗手間的單人套房，隱私性很好。"
        }
    ]
};

/**
 * 助手函數：解析文字中的時間 (例如 "12:00", "3pm")
 */
const parseArrivalTime = (text) => {
    if (!text) return null;
    const timeMatch = text.match(/(\d{1,2})[:：](\d{1,2})/);
    if (timeMatch) return parseInt(timeMatch[1]) + (parseInt(timeMatch[2]) / 60);

    const simpleHourMatch = text.match(/(\d{1,2})\s*(am|pm|AM|PM)/);
    if (simpleHourMatch) {
        let hour = parseInt(simpleHourMatch[1]);
        if (simpleHourMatch[2].toLowerCase() === 'pm' && hour < 12) hour += 12;
        return hour;
    }
    return null;
};

/**
 * 城市交通數據庫 (Realistic 2024 Data)
 */
const CITY_TRANSPORT_DATA = {
    "Tokyo": {
        metro: { name: "🚇 東京地鐵 (Tokyo Metro)", cost: 210, currency: "JPY", duration: "15-25 min" },
        bus: { name: "🚌 都營巴士 (Toei Bus)", cost: 210, currency: "JPY", duration: "20-35 min" },
        taxi: { name: "🚕 的士 / Uber", cost: 1500, currency: "JPY", duration: "10-20 min" }
    },
    "Taipei": {
        metro: { name: "🚇 台北捷運 (MRT)", cost: 25, currency: "TWD", duration: "10-20 min" },
        bus: { name: "🚌 台北市公車 (Bus)", cost: 15, currency: "TWD", duration: "15-30 min" },
        taxi: { name: "🚕 的士 / LINE TAXI", cost: 150, currency: "TWD", duration: "10-15 min" }
    },
    "Seoul": {
        metro: { name: "🚇 首爾地鐵 (Subway)", cost: 1400, currency: "KRW", duration: "15-30 min" },
        bus: { name: "🚌 首爾巴士 (Bus)", cost: 1300, currency: "KRW", duration: "20-40 min" },
        taxi: { name: "🚕 Kakao T / Taxi", cost: 6800, currency: "KRW", duration: "10-25 min" }
    },
    "Bangkok": {
        metro: { name: "🚇 曼谷 MRT/BTS", cost: 35, currency: "THB", duration: "10-25 min" },
        bus: { name: "🚌 當地巴士 (Local Bus)", cost: 12, currency: "THB", duration: "30-50 min" },
        taxi: { name: "🚕 Grab / Taxi", cost: 120, currency: "THB", duration: "15-30 min" }
    },
    "Default": {
        metro: { name: "🚆 大眾運輸", cost: 300, currency: "JPY", duration: "20 min" },
        bus: { name: "🚌 巴士", cost: 200, currency: "JPY", duration: "30 min" },
        taxi: { name: "🚗 的士", cost: 2000, currency: "JPY", duration: "15 min" }
    }
};

/**
 * 助手函數：獲取交通選項 (真實車費 + 時間)
 */
const getTransportOptions = (from, to, preference = 'public', city = "Tokyo") => {
    // Normalize city
    const cityName = Object.keys(CITY_TRANSPORT_DATA).find(k => city.toLowerCase().includes(k.toLowerCase())) || "Default";
    const data = CITY_TRANSPORT_DATA[cityName];

    const options = {
        metro: {
            ...data.metro,
            mode: "public",
            desc: `從 ${from} 搭乘地鐵前往 ${to}，最準時的選擇`,
            insight: "建議使用當地的智慧交通卡 (如 Suica / 悠遊卡)。"
        },
        bus: {
            ...data.bus,
            mode: "public",
            desc: `搭乘巴士前往 ${to}，沿途欣賞街景`,
            insight: "通常比地鐵便宜，但需注意路面交通狀況。"
        },
        driving: {
            ...data.taxi,
            mode: "driving",
            desc: `叫車或搭乘的士前往 ${to}，省去轉乘麻煩`,
            insight: "多人共乘的話非常划算，且能直達目的地。"
        }
    };

    if (preference === 'driving') return [options.driving, options.metro, options.bus];
    return [options.metro, options.bus, options.driving];
};

export const generateFullItinerary = async (city, days = 3, preferences = [], logistics = {}) => {
    await new Promise(r => setTimeout(r, 800));

    // Normalize city name for DB lookup
    const cityName = Object.keys(MOCK_DB).find(k => city.toLowerCase().includes(k.toLowerCase())) || "Default";
    const dbItems = MOCK_DB[cityName] || FALLBACK_SUGGESTIONS(city);

    const fullPlan = [];
    let poolIndex = 0;

    // Helper: Categorize items by time suitability
    const categorizeByTime = (items) => {
        const morning = items.filter(i => {
            const h = parseInt(i.time?.split(':')[0] || "10");
            return h < 12 || i.name.includes("早") || i.type === "spot";
        });
        const afternoon = items.filter(i => {
            const h = parseInt(i.time?.split(':')[0] || "14");
            return (h >= 12 && h < 18) || i.type === "shopping" || i.type === "spot";
        });
        const evening = items.filter(i => {
            const h = parseInt(i.time?.split(':')[0] || "19");
            return h >= 18 || i.name.includes("夜") || i.name.includes("居酒屋") || i.name.includes("塔") || i.type === "food";
        });
        return { morning, afternoon, evening };
    };

    const timeBuckets = categorizeByTime(dbItems);

    // TRACKER: Prevent duplicates across ALL days
    const globalUsedIds = new Set();

    // Parse Arrival Logistics
    const arrivalHour = parseArrivalTime(logistics.flightInfo) || 9; // Default 9am if not specified
    const transportPref = logistics.transportMode || 'public';

    for (let d = 1; d <= days; d++) {
        // --- Breakfast / Morning Routine (Every Day) ---
        fullPlan.push({
            id: `ai-it-${d}-bf`, day: d, time: "08:00",
            name: d === 1 && arrivalHour > 8 ? "☕️ 抵達前準備" : "🍳 在地式早餐體驗",
            type: "food", cost: 800, currency: "JPY",
            details: {
                location: d === 1 ? "機場/機上" : "酒店附近",
                desc: d === 1 ? "確認文件，整理心情準備出發" : "找一家在地人推薦的早點店，開啟活力的一天",
                insight: "旅行的精髓往往在於清晨的咖啡與在地早餐。"
            }
        });

        // --- DAY 1 SPECIAL LOGIC: Flight & Arrival Optimization ---
        if (d === 1) {
            fullPlan.push({
                id: `ai-it-f1`, day: 1, time: "07:00", name: `✈️ 前往 ${city} 的航班`,
                type: "flight", cost: 4500, currency: "HKD",
                details: {
                    location: `HKG -> ${city}`,
                    desc: logistics.flightInfo || "預留充足時間辦理登機",
                    insight: arrivalHour > 15 ? "由於是晚班機，建議第一天以放鬆和入住為主。" : "早班機雖然辛苦，但能為您的第一天爭取更多探索時間。"
                }
            });

            // Transport to Hotel depends on arrival
            const hotelTransTime = `${Math.floor(arrivalHour + 1).toString().padStart(2, '0')}:30`;
            const hOptions = getTransportOptions("機場", "酒店", transportPref, city);
            fullPlan.push({
                id: `ai-it-1-tr0`, day: 1, time: hotelTransTime,
                name: hOptions[0].name,
                type: "transport", cost: hOptions[0].cost, currency: hOptions[0].currency,
                details: {
                    location: city,
                    desc: hOptions[0].desc,
                    insight: hOptions[0].insight,
                    options: hOptions
                }
            });

            fullPlan.push({
                id: `ai-it-1-h1`, day: 1, time: `${Math.floor(arrivalHour + 2).toString().padStart(2, '0')}:30`,
                name: logistics.hotelStatus === 'booked' ? "🏨 酒店辦理入住/寄存" : "🏨 抵達先行安排行李",
                type: "hotel", cost: 0, currency: "HKD",
                details: {
                    location: `${city} 酒店區`,
                    desc: logistics.selectedHotel ? `預計入住: ${logistics.selectedHotel.name}` : "前往酒店區或儲物櫃放低重物",
                    insight: arrivalHour >= 15 ? "現已到入住時間，建議先回房稍事休息再出發。" : "即便未到入住時間，亦可先將行李寄存在櫃檯。"
                }
            });
        }

        // Fill items for the day
        const timeSlots = ["10:30", "13:00", "15:30", "18:00", "20:30"];
        for (let slotTime of timeSlots) {
            const slotHour = parseInt(slotTime.split(':')[0]);

            // Skip Day 1 slots before arrival + 4 hours (buffer for airport -> hotel -> first spot)
            if (d === 1 && slotHour < arrivalHour + 4) continue;

            // Select bucket based on slotHour
            let targetBucket = [];
            if (slotHour < 12) targetBucket = timeBuckets.morning;
            else if (slotHour < 18) targetBucket = timeBuckets.afternoon;
            else targetBucket = timeBuckets.evening;

            // Find NEXT available item from target bucket
            let item = null;
            // Shuffle bucket for variety
            const shuffledBucket = [...targetBucket].sort(() => 0.5 - Math.random());

            for (const candidate of shuffledBucket) {
                const normName = candidate.name.trim().toLowerCase();
                if (!globalUsedIds.has(normName)) {
                    item = { ...candidate };
                    globalUsedIds.add(normName);
                    break;
                }
            }

            // Fallback to general pool if bucket empty
            if (!item) {
                const fallbackPool = [...dbItems].sort(() => 0.5 - Math.random());
                for (const candidate of fallbackPool) {
                    const normName = candidate.name.trim().toLowerCase();
                    if (!globalUsedIds.has(normName)) {
                        item = { ...candidate };
                        globalUsedIds.add(normName);
                        break;
                    }
                }
            }

            if (item) {
                // Add Transport before each major spot
                const transportTime = slotTime.split(':').map((val, idx) => idx === 0 ? (parseInt(val) - (slotHour > 12 ? 1 : 0)).toString().padStart(2, '0') : "45").join(':');

                // --- WALKING DISTANCE LOGIC ---
                const prevItem = fullPlan[fullPlan.length - 1];
                const cleanLoc = (l) => (l || "").toLowerCase();
                const isSameArea = prevItem && prevItem.details?.location && item.details?.location && (
                    cleanLoc(prevItem.details.location) === cleanLoc(item.details.location) ||
                    (cleanLoc(prevItem.details.location).includes("101") && cleanLoc(item.details.location).includes("信義")) ||
                    (cleanLoc(prevItem.details.location).includes("信義") && cleanLoc(item.details.location).includes("101")) ||
                    (cleanLoc(prevItem.details.location).includes("新宿") && cleanLoc(item.details.location).includes("新宿")) ||
                    (cleanLoc(prevItem.details.location).includes("淺草") && cleanLoc(item.details.location).includes("淺草")) ||
                    (cleanLoc(prevItem.details.location).includes("明洞") && cleanLoc(item.details.location).includes("明洞")) ||
                    (cleanLoc(prevItem.details.location).includes("弘大") && cleanLoc(item.details.location).includes("弘大"))
                );

                if (isSameArea) {
                    fullPlan.push({
                        id: `ai-it-${d}-tr-${slotTime}`, day: d,
                        time: transportTime,
                        name: "🚶 步行前往",
                        type: "transport", cost: 0, currency: item.currency,
                        details: {
                            location: item.details.location,
                            desc: "鄰近區域，只需步行即可抵達",
                            insight: "這兩個地方距離非常近，步行更能感受城市氛圍。",
                            options: [{ name: "🚶 步行", mode: "walking", cost: 0, currency: item.currency, desc: "步行約 5-10 分鐘" }]
                        }
                    });
                } else {
                    const tOptions = getTransportOptions("上一個景點", item.name, transportPref, city);
                    fullPlan.push({
                        id: `ai-it-${d}-tr-${slotTime}`, day: d,
                        time: transportTime,
                        name: tOptions[0].name,
                        type: "transport", cost: tOptions[0].cost, currency: tOptions[0].currency,
                        details: {
                            location: city,
                            desc: tOptions[0].desc,
                            insight: tOptions[0].insight,
                            options: tOptions
                        }
                    });
                }

                fullPlan.push({
                    ...item,
                    id: `ai-it-${d}-${slotTime}`,
                    day: d,
                    time: slotTime
                });
            } else {
                // FALLBACK: Use real-world general spots for the specific city
                const realFallbacks = {
                    "Tokyo": [
                        { name: "🏮 淺草橫町傳統文化美食街", desc: "結合祭典氣氛與日本美食的室內商店街，非常熱鬧。", insight: "晚上來這裡喝一杯更能感受下町風情。" },
                        { name: "🌆 澀谷 SHIBUYA SKY", desc: "俯視整個東京的最佳地點，玻璃窗設計無遮擋。", insight: "日落前半小時上去是最佳時機。" },
                        { name: "🛍️ 銀座無印良品旗艦店", desc: "全球最大的無印良品，包含飯店、餐廳與烘焙坊。", insight: "一樓的麵包非常有名，值得一試。" },
                        { name: "🗼 東京鐵塔 (Tokyo Tower)", desc: "經典地標，夜晚點燈極美。", insight: "推薦去芝公園拍鐵塔全景。" },
                        { name: "🍵 表參道精品咖啡漫步", desc: "時尚與建築之美，匯集頂級品牌與特色 Cafe。", insight: "這裡的建築設計本身就是亮點。" }
                    ],
                    "Taipei": [
                        { name: "🎨 華山 1914 文創園區", desc: "酒廠改建的文創基地，充滿藝文氣息與特色小店。", insight: "隨處可見的紅磚牆是拍照打卡的絕佳背景。" },
                        { name: "🍵 永康街手搖飲與文青店", desc: "台北最具質感的街道之一，匯集美食與設計選物。", insight: "除了芒果冰，這裡的牛肉麵也是台北頂級。" },
                        { name: "🏞️ 象山步道看 101 夜景", desc: "雖然要爬樓梯，但景觀無與倫比。", insight: "傍晚時分上山，可以同時看到日落與城市點燈。" },
                        { name: "🥟 鼎泰豐美食饗宴", desc: "世界知名的黃金 18 摺小籠包。", insight: "建議提早抽號碼牌，排隊時可逛逛周邊商場。" },
                        { name: "🏮 九份老街懷舊遊", desc: "山城美景與古色古香的茶樓。", insight: "晚上燈籠亮起時最有氣氛。" }
                    ],
                    "Osaka": [
                        { name: "🏃 道頓堀固力果跑跑人打卡", desc: "大阪最經典地標，熱鬧非凡的霓虹燈街。", insight: "晚上來這裡拍照最有大阪味。" },
                        { name: "🏯 大阪城公園", desc: "雄偉的天守閣與廣闊的園林。", insight: "適合悠閒散步，了解戰國歷史。" },
                        { name: "🎡 天保山大摩天輪", desc: "坐在透明車廂俯瞰大阪灣。", insight: "日落時分景色最為迷人。" },
                        { name: "🦀 黑門市場吃貨之旅", desc: "大阪人的廚房，各種現烤海鮮應有盡有。", insight: "一定要試試神戶牛跟和牛串燒。" },
                        { name: "🌃 梅田藍天大廈空中庭園", desc: "360度開放式露台，俯瞰大阪夜景。", insight: "地面特殊的螢光石設計非常夢幻。" }
                    ],
                    "Default": [
                        { name: "📍 城市地標深度漫步", desc: "走訪城中最具代表性的歷史建築，細味文化特色。", insight: "建議穿著舒適的走鞋，隨手捕捉街頭文化。" },
                        { name: "☕️ 當地特色精品咖啡館", desc: "尋找隱藏在巷弄中的咖啡香，享受片刻寧靜。", insight: "這是整理照片和旅途筆記的最佳時光。" },
                        { name: "🛒 在地大型超市挖掘驚喜", desc: "去當地人採購的地方，尋找最地道的日常零食。", insight: "超市往往是發掘特色伴手禮的最佳地點。" },
                        { name: "🖼️ 當地藝文空間探索", desc: "感受城市流動的藝術氣息。", insight: "小眾展覽往往能帶來驚喜。" },
                        { name: "👝 特色選物店搜羅", desc: "發掘在地設計師的匠心之作。", insight: "帶回一份有溫度的紀念品。" }
                    ]
                };

                const cityKey = Object.keys(realFallbacks).find(k => city.toLowerCase().includes(k.toLowerCase())) || "Default";
                const fallbackPool = realFallbacks[cityKey].sort(() => 0.5 - Math.random());

                let selected = null;
                for (const candidate of fallbackPool) {
                    if (!globalUsedIds.has(candidate.name.toLowerCase())) {
                        selected = candidate;
                        globalUsedIds.add(candidate.name.toLowerCase());
                        break;
                    }
                }

                if (!selected) selected = fallbackPool[0]; // Absolute last resort

                fullPlan.push({
                    id: `ai-it-real-${d}-${slotTime}`, day: d, time: slotTime,
                    name: selected.name, type: "spot", cost: 0, currency: "HKD",
                    details: { location: city, desc: selected.desc, insight: selected.insight }
                });
            }
        }

        // --- Evening Routine: Return to Hotel (Every Day) ---
        const lastTransportOptions = getTransportOptions("市中心", "酒店", transportPref, city);
        fullPlan.push({
            id: `ai-it-${d}-return`, day: d, time: "22:30",
            name: `🏨 返回酒店 (${lastTransportOptions[0].name})`,
            type: "transport", cost: lastTransportOptions[0].cost, currency: lastTransportOptions[0].currency,
            details: {
                location: "市區 -> 酒店",
                desc: lastTransportOptions[0].desc,
                insight: "早點休息，為明天的旅程保持體力。",
                options: lastTransportOptions
            }
        });
    }

    // Budget Calculation
    const totalCost = fullPlan.reduce((acc, item) => acc + (item.cost || 0), 0);

    return {
        itinerary: fullPlan.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.time.localeCompare(b.time);
        }),
        transport: [
            { id: 'tr-1', name: '地鐵 (Metro)', type: 'metro', price: 'JPY 200', desc: '站點密集，班次極準時，是自由行首選。', recommended: true },
            { id: 'tr-2', name: '巴士/地面電車', type: 'bus', price: 'JPY 210', desc: '可以欣賞沿途風景，適合短途接駁。' },
            { id: 'tr-3', name: '的士 / Uber', type: 'taxi', price: 'JPY 1500+', desc: '四人合乘其實性價比唔低，特別係去啲偏遠景點。' }
        ],
        budget: {
            total: Math.floor(totalCost / days),
            breakdown: [
                { label: '景點門票', percent: 25, amt: Math.floor(totalCost * 0.25) },
                { label: '餐飲美食', percent: 45, amt: Math.floor(totalCost * 0.45) },
                { label: '交通交通', percent: 15, amt: Math.floor(totalCost * 0.15) },
                { label: '雜項預備', percent: 15, amt: Math.floor(totalCost * 0.15) }
            ]
        }
    };
};

// 專用購物建議數據庫 (REAL DATA)
const SHOPPING_DB = {
    Japan: [
        { name: "一蘭拉麵外帶包", type: "food", estPrice: "¥2,000", desc: "福岡發跡的名店味，在家也能煮出正宗豚骨味。" },
        { name: "SK-II 神仙水", type: "cosmetic", estPrice: "¥18,000", desc: "日本國民專櫃保妝，免稅店價格極具競爭力。" },
        { name: "Porter 吉田包", type: "fashion", estPrice: "¥25,000", desc: "日本在地手工職人精神，耐用且款式經典。" },
        { name: "白色戀人巧克力", type: "food", estPrice: "¥1,500", desc: "北海道必買經典，酥脆貓舌餅配上濃郁白夾心。" },
        { name: "資生堂安耐曬防曬", type: "cosmetic", estPrice: "¥3,000", desc: "藥妝店長年銷售冠軍，最強防曬力的代表。" },
        { name: "大正製藥感冒粉 (黃金包)", type: "medicine", estPrice: "¥1,200", desc: "日本人家中常備，對初期感冒症狀非常有感。" },
        { name: "獺祭 45 純米大吟釀", type: "alcohol", estPrice: "¥5,000", desc: "清酒入門首選，果香濃郁且口感滑順。" },
        { name: "Donki 情熱價格零食", type: "food", estPrice: "¥500", desc: "驚安殿堂自有品牌，性價比極高。" },
        { name: "參天玫瑰眼藥水", type: "medicine", estPrice: "¥1,500", desc: "眼藥水中的愛馬仕，有效緩解眼部疲勞。" },
        { name: "Uniqlo 日本限定款", type: "fashion", estPrice: "¥2,990", desc: "日本定價通常比香港便宜 30-40%。" },
        { name: "Panasonic 奈米水離子吹風機", type: "electronics", estPrice: "¥28,000", desc: "旗艦級護髮神機，日本買價差大。" },
        { name: "EVE 止痛藥 (A錠/Quick)", type: "medicine", estPrice: "¥980", desc: "緩解頭痛、經痛的神物，掃貨必備。" },
        { name: "Kinto 保溫瓶/咖啡器具", type: "electronics", estPrice: "¥3,500", desc: "極簡美學日系品牌，非常有質感。" },
        { name: "LUSH 日本限定版氣泡彈", type: "cosmetic", estPrice: "¥850", desc: "比香港便宜不少，款式也比較豐富。" },
        { name: "無印良品行李箱", type: "fashion", estPrice: "¥19,900", desc: "輪子安靜極了，日本買省不少匯差。" }
    ],
    Taiwan: [
        { name: "佳德鳳梨酥", type: "food", estPrice: "NT$450", desc: "微甜而不膩，皮薄餡多，台北排隊名店。" },
        { name: "微熱山丘鳳梨酥", type: "food", estPrice: "NT$500", desc: "全土鳳梨製作，纖維感十足，適合解膩。" },
        { name: "糖村牛軋糖", type: "food", estPrice: "NT$350", desc: "奶香味極濃，不黏牙，伴手禮首選。" },
        { name: "森田藥妝面膜", type: "cosmetic", estPrice: "NT$299", desc: "台灣本土之光，CP值極高的玻尿酸保濕系列。" },
        { name: "大同電鍋", type: "electronics", estPrice: "NT$2,500", desc: "台灣廚房靈魂，耐操好用。" },
        { name: "快車肉乾", type: "food", estPrice: "NT$250", desc: "超薄脆紙肉乾，口感獨特，追劇必備。" },
        { name: "金門高粱酒 (58度)", type: "alcohol", estPrice: "NT$600", desc: "台灣最具代表性的烈酒，陳香醇厚。" },
        { name: "義美小泡芙", type: "food", estPrice: "NT$35", desc: "從小到大的經典零嘴，牛奶與巧克力口味最受歡迎。" },
        { name: "DR.WU 杏仁酸亮白精華", type: "cosmetic", estPrice: "NT$850", desc: "醫美品牌首選，代謝角質、改善暗沈。" },
        { name: "誠品書店選物 (Esente)", type: "fashion", estPrice: "NT$980", desc: "充滿文青感的高質感文具或配件。" },
        { name: "大同復古小電扇", type: "electronics", estPrice: "NT$699", desc: "經典外觀卻非常耐用，送禮自用兩相宜。" },
        { name: "寵愛之名面膜", type: "cosmetic", estPrice: "NT$1,200", desc: "生物纖維面膜始祖，台灣價格最甜。" }
    ],
    Korea: [
        { name: "雪花秀潤燥精華", type: "cosmetic", estPrice: "₩85,000", desc: "韓國頂級保養，漢方成分有效穩定肌膚。" },
        { name: "Gentle Monster 太陽眼鏡", type: "fashion", estPrice: "₩260,000", desc: "設計感爆棚，韓劇歐爸歐逆必備款式。" },
        { name: "正官庄高麗蔘精", type: "medicine", estPrice: "₩120,000", desc: "純正六年根紅蔘，送長輩最體面的健康禮物。" },
        { name: "HBAF 杏仁果系列", type: "food", estPrice: "₩7,000", desc: "超多口味（蜂蜜奶油、芥末），隨手小食首選。" },
        { name: "Innisfree 火山泥面膜", type: "cosmetic", estPrice: "₩15,000", desc: "韓國藥妝店長青款，深層清潔毛孔好幫手。" },
        { name: "OSULLOC 抹茶抹醬", type: "food", estPrice: "₩8,500", desc: "濟州島直送濃郁抹茶，配多士或餅乾一流。" },
        { name: "Market O 布朗尼", type: "food", estPrice: "₩5,000", desc: "經典韓系手信，口感綿密，獨立包裝方便分享。" },
        { name: "Mediheal 面膜", type: "cosmetic", estPrice: "₩2,000", desc: "專業級保濕敷片，明洞掃貨必買清單。" },
        { name: "Olive Young 排隊護膚貼", type: "cosmetic", estPrice: "₩6,000", desc: "針對痘痘修復力超強，藥妝店必搶項目。" },
        { name: "Mardi Mercredi 衛衣", type: "fashion", estPrice: "₩75,000", desc: "當紅小雞雛菊 Logo，韓國買便宜很多。" },
        { name: "Samyang 辣雞麵 (各種口味)", type: "food", estPrice: "₩5,500", desc: "香港未必有齊的各種辣度與聯名款。" },
        { name: "韓國真露燒酒 (JINRO)", type: "alcohol", estPrice: "₩1,800", desc: "超市買超便宜，體驗韓國飲酒文化必備。" }
    ],
    Thailand: [
        { name: "小浣熊烤海苔", type: "food", estPrice: "฿150", desc: "酥脆辣味十足，看劇必備的大量裝零嘴。" },
        { name: "Mistine 彩妝系列", type: "cosmetic", estPrice: "฿250", desc: "泰國第一彩妝品牌，防水防汗能力極強。" },
        { name: "SRICHAND 蜜粉", type: "cosmetic", estPrice: "฿320", desc: "經典老牌翻新，控油效果驚人。" },
        { name: "臥佛牌青草膏", type: "medicine", estPrice: "฿80", desc: "舒緩蚊蟲叮咬或肌肉痠痛。" },
        { name: "Jim Thompson 絲巾", type: "fashion", estPrice: "฿2,800", desc: "泰國國寶級絲綢，設計充滿南洋風情。" },
        { name: "手標泰式茶 (粉裝)", type: "food", estPrice: "฿130", desc: "在家也能沖出正宗街頭泰奶的味道。" },
        { name: "NaRaYa 曼谷包", type: "fashion", estPrice: "฿450", desc: "泰國代表性手提袋，款式多樣。" },
        { name: "蛇牌爽身粉 (酷涼型)", type: "cosmetic", estPrice: "฿45", desc: "夏日消暑神器，洗澡後塗抹全身清爽透涼。" },
        { name: "泰國 Counterpain 痠痛膏", type: "medicine", estPrice: "฿150", desc: "針對運動損傷非常有效，紅藍包裝效果不同。" },
        { name: "Elephant Pants (大象褲)", type: "fashion", estPrice: "฿100", desc: "泰國旅遊標配，通爽舒服，穿完即棄都唔心痛。" },
        { name: "THANN / HARNN 香氛產品", type: "cosmetic", estPrice: "฿1,200", desc: "頂級泰式香薰，木質香調非常有質感。" }
    ]
};

const FALLBACK_SHOPPING = [
    { name: "當地特色伴手禮", estPrice: "HKD 150", type: "food", desc: "在地老店出品", reason: "每座城市都有自己的味道，建議去超市或傳統市場發掘。" },
    { name: "手作工藝品", estPrice: "HKD 300", type: "gift", desc: "獨一無二紀念", reason: "支持當地創作者，留下獨特的旅行回憶。" }
];

/**
 * 生成 AI 購物建議 (修補為真實數據)
 */
export async function generateShoppingSuggestions(location, categories = []) {
    const delay = 800 + Math.random() * 800;
    await new Promise(resolve => setTimeout(resolve, delay));

    let country = "General";
    const locLower = location.toLowerCase();
    if (locLower.includes("日本") || locLower.includes("tokyo") || locLower.includes("japan") || locLower.includes("osaka")) country = "Japan";
    else if (locLower.includes("台灣") || locLower.includes("taiwan") || locLower.includes("taipei")) country = "Taiwan";
    else if (locLower.includes("韓國") || locLower.includes("korea") || locLower.includes("seoul")) country = "Korea";
    else if (locLower.includes("泰國") || locLower.includes("thailand") || locLower.includes("bangkok")) country = "Thailand";

    let suggestions = (SHOPPING_DB[country] || FALLBACK_SHOPPING).map(s => ({ ...s, country }));

    if (categories && categories.length > 0) {
        suggestions = suggestions.filter(item => {
            return categories.includes(item.type) ||
                (categories.includes('food') && item.type === 'alcohol') ||
                (categories.includes('others') && (item.type === 'gift' || item.type === 'medicine'));
        });
    }

    // Return more results and shuffle
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 15);
}

// 模擬數據庫：針對不同城市的精選行程 (REAL DATA)
const MOCK_DB = {
    "Tokyo": [
        { name: "築地場外市場 (Tsukiji Outer Market)", type: "food", cost: 3000, currency: "JPY", details: { location: "築地", desc: "新鮮壽司與海鮮丼", insight: "即便是批發市場遷走，場外區域依然是遊客品嚐新鮮海鮮的首選。" } },
        { name: "淺草寺 (Senso-ji Temple)", type: "spot", cost: 0, currency: "JPY", details: { location: "淺草", desc: "東京最古老的寺廟", history: "創立於 628 年，雷門上的大紅燈籠是其標誌。" } },
        { name: "東京晴空塔 (Tokyo Skytree)", type: "spot", cost: 3100, currency: "JPY", details: { location: "墨田區", desc: "世界最高自立式電波塔", insight: "高度 634 公尺，天氣晴朗時可遠眺富士山。" } },
        { name: "明治神宮 (Meiji Jingu)", type: "spot", cost: 0, currency: "JPY", details: { location: "原宿", desc: "東京市中心的森林", history: "供奉明治天皇與昭憲皇太后。" } },
        { name: "新宿 Omoide Yokocho", type: "food", cost: 4000, currency: "JPY", details: { location: "新宿", desc: "懷舊居酒屋巷弄", reason: "炭火燒鳥的味道是這裡的靈魂。" } },
        { name: "澀谷 Shibuya Crossing", type: "spot", cost: 0, currency: "JPY", details: { location: "澀谷", desc: "全球最繁忙的交叉路口", insight: "每分鐘有三千人同時過馬路。" } },
        { name: "代代木公園 (Yoyogi Park)", type: "spot", cost: 0, currency: "JPY", details: { location: "原宿", desc: "當地人最愛的休閒勝地", insight: "週末常有街頭藝人表演。" } },
        { name: "阿美橫丁 (Ameyoko)", type: "shopping", cost: 2000, currency: "JPY", details: { location: "上野", desc: "充滿平民氣息的商店街", reason: "買便宜零食與藥妝的好地方。" } },
        { name: "六本木之丘展望台", type: "spot", cost: 2000, currency: "JPY", details: { location: "六本木", desc: "欣賞東京鐵塔最佳觀景點", insight: "戶外 Sky Deck 非常震撼。" } },
        { name: "銀座 (Ginza) 步行者天國", type: "shopping", cost: 0, currency: "JPY", details: { location: "銀座", desc: "頂級購物區的假日特權", insight: "週六日馬路全封，變身行人步行街。" } },
        { name: "上野公園博物館群", type: "spot", cost: 600, currency: "JPY", details: { location: "上野", desc: "文化藝術氣息濃厚", history: "包含國立科學博物館與國立西洋美術館。" } },
        { name: "新宿御苑 (Shinjuku Gyoen)", type: "spot", cost: 500, currency: "JPY", details: { location: "新宿", desc: "以前的皇家園林", insight: "春天賞櫻，秋天看銀杏，四季如畫。" } },
        { name: "秋葉原 (Akihabara)", type: "shopping", cost: 0, currency: "JPY", details: { location: "千代田區", desc: "電子產品與ACG中心", reason: "二次元文化的天堂。" } },
        { name: "中目黑目黑川漫步", type: "spot", cost: 0, currency: "JPY", details: { location: "中目黑", desc: "最Chill的河畔咖啡區", insight: "滿滿的質感小店。" } },
        { name: "台場 TeamLab Borderless", type: "spot", cost: 3800, currency: "JPY", details: { location: "江東區", desc: "光影藝術沈浸式體驗", reason: "全球最紅的數位藝術展覽。" } },
        { name: "三鷹之森吉卜力美術館", type: "spot", cost: 1000, currency: "JPY", details: { location: "三鷹", desc: "宮崎駿的夢幻世界", insight: "必看限定短篇動畫，門票需預約。" } },
        { name: "惠比壽花園廣場 (Yebisu)", type: "spot", cost: 0, currency: "JPY", details: { location: "澀谷", desc: "時尚與懷舊並存的歐風廣場", insight: "惠比壽啤酒發源地。" } },
        { name: "一蘭拉麵 (澀谷店)", type: "food", cost: 1200, currency: "JPY", details: { location: "澀谷", desc: "經典豚骨拉麵", reason: "自選湯頭鹹淡，必試加麵文化。" } },
        { name: "敘敘苑燒肉 (新宿店)", type: "food", cost: 8000, currency: "JPY", details: { location: "新宿", desc: "家庭式高級燒肉", insight: "午餐時段性價比極高。" } },
        { name: "篝 Kagari (雞白湯拉麵)", type: "food", cost: 1500, currency: "JPY", details: { location: "築地/銀座", desc: "米芝蓮推薦拉麵", reason: "濃郁奶香味的雞湯，極致順滑。" } }
    ],
    "Taipei": [
        { name: "國立故宮博物院", type: "spot", cost: 350, currency: "TWD", details: { location: "士林", desc: "中華文化瑰寶", history: "收藏世界首屈一指的中華文物。" } },
        { name: "鼎泰豐 (101店)", type: "food", cost: 800, currency: "TWD", details: { location: "信義區", desc: "全球知名小籠包", reason: "米芝蓮推薦名店。" } },
        { name: "台北 101 觀景台", type: "spot", cost: 600, currency: "TWD", details: { location: "信義區", desc: "曾為世界第一高樓", insight: "擁有全球最大的風阻尼球。" } },
        { name: "大稻埕/迪化街", type: "spot", cost: 0, currency: "TWD", details: { location: "大同區", desc: "歷史悠久的貿易街區", history: "保留了清末到民國初年的紅磚建築。" } },
        { name: "饒河街觀光夜市", type: "food", cost: 400, currency: "TWD", details: { location: "松山區", desc: "排隊小吃集散地", reason: "必食米芝蓮推介的胡椒餅。" } },
        { name: "中正紀念堂", type: "spot", cost: 0, currency: "TWD", details: { location: "中正區", desc: "宏偉的藍白建築", history: "必看整點換崗儀式。" } },
        { name: "淡水老街 & 漁人碼頭", type: "spot", cost: 100, currency: "TWD", details: { location: "淡水", desc: "日落最美的海邊小鎮", insight: "必吃阿給跟鐵蛋。" } },
        { name: "松山文創園區", type: "spot", cost: 0, currency: "TWD", details: { location: "信義區", desc: "菸廠遺產轉型文創空間", insight: "裡面有全台最美的誠品書店。" } },
        { name: "龍山寺", type: "spot", cost: 0, currency: "TWD", details: { location: "萬華", desc: "台北最具歷史的寺廟", history: "建築雕刻精美，香火鼎盛。" } },
        { name: "寧夏夜市", type: "food", cost: 300, currency: "TWD", details: { location: "大同區", desc: "美食密度最高的夜市", insight: "在地台北人最愛去的夜市。" } },
        { name: "華山 1914 文創園區", type: "spot", cost: 0, currency: "TWD", details: { location: "中正區", desc: "酒廠變身藝術天堂", insight: "常有特色展覽與選物店。" } },
        { name: "象山登山步道", type: "spot", cost: 0, currency: "TWD", details: { location: "信義區", desc: "俯瞰 101 最美角度", insight: "爬 20 分鐘即可看到震撼夜景。" } },
        { name: "林東芳牛肉麵", type: "food", cost: 300, currency: "TWD", details: { location: "中山區", desc: "台北牛肉麵代表", reason: "必加特製花椒牛油。" } },
        { name: "阜杭豆漿 (華山市場)", type: "food", cost: 150, currency: "TWD", details: { location: "中正區", desc: "傳統台式早餐天花板", insight: "厚餅夾蛋是靈魂。" } },
        { name: "上引水產 (Addiction Aquatic)", type: "food", cost: 1200, currency: "TWD", details: { location: "中山區", desc: "台版築地市場", reason: "立吞壽司新鮮又划算。" } },
        { name: "永康街牛肉麵 & 芒果冰", type: "food", cost: 500, currency: "TWD", details: { location: "大安區", desc: "觀光客必訪美食街", insight: "思慕昔芒果冰消暑首選。" } },
        { name: "大直 RAW 餐廳", type: "food", cost: 5800, currency: "TWD", details: { location: "中山區", desc: "米芝蓮二星江振誠主廚", reason: "預約困難，體驗精緻台法融合。" } }
    ],
    "Seoul": [
        { name: "景福宮 (Gyeongbokgung)", type: "spot", cost: 3000, currency: "KRW", details: { location: "鐘路區", desc: "朝鮮王朝主要宮殿", history: "必看門將換崗儀式。" } },
        { name: "廣藏市場 (Gwangjang Market)", type: "food", cost: 15000, currency: "KRW", details: { location: "鐘路區", desc: "百年傳統市場", reason: "綠豆餅與生牛肉是必嚐料理。" } },
        { name: "北村韓屋村", type: "spot", cost: 0, currency: "KRW", details: { location: "三清洞", desc: "傳統韓屋建築群", insight: "穿著韓服在此拍照非常有韻味。" } },
        { name: "南山首爾塔 (N Seoul Tower)", type: "spot", cost: 16000, currency: "KRW", details: { location: "南山", desc: "首爾永恆的地標", insight: "情人掛鎖的地點非常有名。" } },
        { name: "明洞步行街 (Myeongdong)", type: "shopping", cost: 0, currency: "KRW", details: { location: "中區", desc: "購物與街頭甜點天堂", reason: "韓國美妝產品最齊全的地方。" } },
        { name: "東大門設計廣場 (DDP)", type: "spot", cost: 0, currency: "KRW", details: { location: "東大門", desc: "紮哈·哈迪德設計的科幻建築", insight: "夜晚的 LED 玫瑰花海很美。" } },
        { name: "弘大商圈 (Hongdae)", type: "spot", cost: 0, currency: "KRW", details: { location: "麻浦區", desc: "充滿青春活力的藝術區", insight: "晚上有很多街頭表演 (Busking)。" } },
        { name: "聖水洞 (Seongsu-dong)", type: "spot", cost: 0, currency: "KRW", details: { location: "城東區", desc: "首爾的布魯克林", insight: "廢棄工廠改建成各式特色 Cafe。" } },
        { name: "漢江公園 (漢江炸雞體驗)", type: "food", cost: 25000, currency: "KRW", details: { location: "各江邊", desc: "在漢江草地上叫外賣炸雞", insight: "這才是真正的首爾庶民浪漫。" } },
        { name: "Starfield COEX 圖書館", type: "spot", cost: 0, currency: "KRW", details: { location: "江南區", desc: "超巨型開放式圖書館", insight: "巨大的書牆是拍照打卡之冠。" } },
        { name: "鷺梁津水產市場", type: "food", cost: 50000, currency: "KRW", details: { location: "鷺梁津", desc: "首爾最大的海鮮市場", reason: "現買現煮，必吃長腳蟹與活章魚。" } },
        { name: "神仙雪濃湯 (明洞店)", type: "food", cost: 12000, currency: "KRW", details: { location: "明洞", desc: "清爽滑順的牛骨湯", insight: "早午晚都適合吃的暖心美食。" } },
        { name: "陳玉華一隻雞 (Dongdaemun)", type: "food", cost: 28000, currency: "KRW", details: { location: "東大門", desc: "蒜味濃郁的嫩煮全雞", reason: "最後加麵疙瘩簡直無敵。" } },
        { name: "土俗村參雞湯", type: "food", cost: 19000, currency: "KRW", details: { location: "景福宮旁", desc: "韓國宮廷式補體名菜", insight: "裡面包著一整顆人蔘。" } },
        { name: "BHC / Kyochon 炸雞", type: "food", cost: 22000, currency: "KRW", details: { location: "Citywide", desc: "韓式脆皮炸雞", reason: "蒜味蜂蜜與辣味是經典首選。" } }
    ],
    "Osaka": [
        { name: "🏃 道頓堀固力果跑跑人打卡", type: "spot", cost: 0, currency: "JPY", details: { location: "道頓堀", desc: "大阪最經典地標", insight: "這裡的霓虹燈是大阪的靈魂。" } },
        { name: "🏯 大阪城天守閣", type: "spot", cost: 600, currency: "JPY", details: { location: "大阪城公園", desc: "戰國名城", insight: "登上頂樓可以俯視整個園區。" } },
        { name: "🎡 天保山大摩天輪", type: "spot", cost: 800, currency: "JPY", details: { location: "大阪灣", desc: "鳥瞰港口美景", insight: "夕陽時分最迷人。" } },
        { name: "⛩️ 四天王寺", type: "spot", cost: 300, currency: "JPY", details: { location: "天王寺", desc: "日本最早的官寺", history: "創立於 593 年。" } },
        { name: "🛍️ 心齋橋筋商店街", type: "shopping", cost: 0, currency: "JPY", details: { location: "心齋橋", desc: "購物者的天堂", insight: "各種藥妝店與服裝店應有盡有。" } },
        { name: "🍣 黑門市場海鮮盛宴", type: "food", cost: 5000, currency: "JPY", details: { location: "黑門市場", desc: "大阪人的廚房", insight: "記得試試河豚跟神戶牛。" } },
        { name: "🥓 大阪燒體驗 (美津の)", type: "food", cost: 1500, currency: "JPY", details: { location: "道頓堀", desc: "道地大阪味道", reason: "排隊名店，但味道絕對值得。" } },
        { name: "🍢 通天閣炸串 (串炸達摩)", type: "food", cost: 2000, currency: "JPY", details: { location: "新世界", desc: "懷舊風情美食", insight: "蘸醬只能沾一次是這裡的規定。" } },
        { name: "🌃 梅田藍天大廈空中庭園", type: "spot", cost: 1500, currency: "JPY", details: { location: "梅田", desc: "360度開放式觀景台", insight: "拍夜景的最佳去處。" } },
        { name: "🦒 天王寺動物園", type: "spot", cost: 500, currency: "JPY", details: { location: "天王寺", desc: "市中心的老牌動物園", insight: "鄰近通天閣，可以排在一起。" } },
        { name: "🎨 中之島公園 & 大阪市中央公會堂", type: "spot", cost: 0, currency: "JPY", details: { location: "中之島", desc: "優雅的河畔建築", insight: "文藝復興風格建築，晚上點燈很美。" } },
        { name: "🧁 難波高島屋尋找甜點", type: "shopping", cost: 2000, currency: "JPY", details: { location: "難波", desc: "百貨美食街探索", insight: "買伴手禮的好地方。" } }
    ],
    "Bangkok": [
        { name: "大皇宮 & 玉佛寺", type: "spot", cost: 500, currency: "THB", details: { location: "拍那空", desc: "泰國王室建築瑰寶", history: "泰國最神聖的寺廟。" } },
        { name: "Jay Fai (痣姐熱炒)", type: "food", cost: 1500, currency: "THB", details: { location: "舊城區", desc: "傳奇米芝蓮一星路邊攤", reason: "招牌黃金螃蟹蛋捲是世界級美味。" } },
        { name: "鄭王廟 (Wat Arun)", type: "spot", cost: 100, currency: "THB", details: { location: "湄南河西岸", desc: "黎明寺", history: "瓷器碎片鑲嵌而成的主塔非常壯觀。" } },
        { name: "鄭王廟伴手禮街", type: "shopping", cost: 0, currency: "THB", details: { location: "各處", desc: "便宜好買的民俗小物", insight: "大象褲跟絲巾應有盡有。" } },
        { name: "唐人街 (Yaowarat Road)", type: "food", cost: 400, currency: "THB", details: { location: "耀華力路", desc: "夜晚的街頭美食天堂", reason: "必吃炭烤吐司跟魚翅撈飯。" } },
        { name: "乍都乍週末市場 (Chatuchak)", type: "shopping", cost: 0, currency: "THB", details: { location: "莫奇", desc: "全球最大規模市集", insight: "超過一萬五千個攤位，逛到腿軟。" } },
        { name: "ICONSIAM 暹羅天地", type: "shopping", cost: 0, currency: "THB", details: { location: "河畔", desc: "最奢華的購物商場", insight: "室內水上市場 SookSiam 很好逛。" } },
        { name: "美功鐵道市場 (Maeklong)", type: "spot", cost: 200, currency: "THB", details: { location: "夜功府", desc: "火車穿過市場的神奇景象", insight: "攤販在火車經過時收合遮雨棚。" } },
        { name: "丹能莎朵水上市場", type: "spot", cost: 500, currency: "THB", details: { location: "叻丕府", desc: "最經典的東方威尼斯", reason: "體驗小船購物與吃船麵。" } },
        { name: "瑪哈泰寺 (樹中佛頭)", type: "spot", cost: 50, currency: "THB", details: { location: "大城 (Ayutthaya)", desc: "世界文化遺產", insight: "佛頭被菩提樹根包覆，奇景必看。" } },
        { name: "王權 Mahanakhon Skywalk", type: "spot", cost: 900, currency: "THB", details: { location: "沙吞", desc: "泰國最高玻璃觀景台", insight: "站在 314 公尺高的透明地板上。" } },
        { name: "建興酒家 (Somboon Seafood)", type: "food", cost: 1000, currency: "THB", details: { location: "Citywide", desc: "曼谷海鮮名店", reason: "招牌咖哩炒螃蟹濃郁下飯。" } },
        { name: "Saneh Jaan (米芝蓮泰餐)", type: "food", cost: 2500, currency: "THB", details: { location: "無線電路", desc: "體驗古代泰國皇室料理", history: "追求極致正宗的傳統泰味。" } },
        { name: "Thip Samai (泰式炒金邊粉)", type: "food", cost: 200, currency: "THB", details: { location: "各分店", desc: "曼谷最強 Pad Thai", reason: "必點蛋包炒麵配鮮榨甜橙汁。" } },
        { name: "After You 甜點店", type: "food", cost: 350, currency: "THB", details: { location: "各商場", desc: "曼谷最強冰品甜點", insight: "泰奶挫冰 (Kakigori) 必吃。" } }
    ],
    "Singapore": [
        { time: "10:00", name: "濱海灣花園 (Gardens by the Bay)", type: "spot", cost: 28, currency: "SGD", details: { location: "Marina Bay", desc: "未來感大花園", insight: "擎天樹叢 (Supertree Grove) 在夜晚的燈光秀非常震撼，花穹內種滿了世界各地的植物。" } },
        { time: "13:00", name: "天天海南雞飯 (麥士威)", type: "food", cost: 8, currency: "SGD", details: { location: "Maxwell Food Centre", desc: "星級國民美食", reason: "雞肉鮮嫩多汁，配上雞油飯，是新加坡最經典的午餐選擇。" } }
    ],
    "London": [
        { time: "15:30", name: "倫敦塔橋", type: "spot", cost: 12, currency: "GBP", details: { location: "Tower Bridge", desc: "標誌性建築", history: "建於 1886-1894 年，為維多利亞時代的工程奇蹟。橋身可開合讓大船通過，是倫敦泰晤士河上的地標。" } },
        { time: "19:00", name: "西區音樂劇", type: "spot", cost: 80, currency: "GBP", details: { location: "West End", desc: "世界級表演", history: "倫敦西區與紐約百老匯齊名，是世界英語戲劇的中心，擁有數百年歷史的劇院群。" } }
    ]
};

const FALLBACK_SUGGESTIONS = (city) => [
    {
        time: "15:00", name: `${city} 國立博物館`, type: "spot", cost: 15,
        details: {
            location: `${city} National Museum`,
            desc: "文化藝術之旅",
            insight: "館藏豐富，是了解該國歷史文化的最佳窗口。",
            history: "成立於 19 世紀，建築本身就是一項藝術品，經歷多次擴建以容納不斷增加的藏品。"
        }
    },
    { time: "18:00", name: `${city} 購物大道`, type: "shopping", cost: 50, details: { location: `${city} Main Street`, desc: "購買紀念品與特產", insight: "匯集國際品牌與當地設計師小店，是購物狂的天堂。" } }
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

// ... (parseTripImage, suggestMissingInfo, generateAiTripName, generatePackingList remain similar)
// But I need to preserve them. The tool `replace_file_content` replaces a chunk. 
// I am replacing from line 134 to end, which is where MOCK_DB and optimiseSchedule were.
// Wait, generatePackingList and others were IN BETWEEN MOCK_DB and optimizeSchedule in original file?
// No, MOCK_DB was line 134-158. FALLBACK was 161. generateAISuggestions 174.
// parseTripImage 203. suggestMissingInfo 250. generateAiTripName 279. generatePackingList 296.
// optimizeSchedule 361.

// I must be careful not to delete the middle functions.
// I will use `replace_file_content` for MOCK_DB first, then a separate one for `optimizeSchedule`.

// Let's replace MOCK_DB and FALLBACK_SUGGESTIONS and generateAISuggestions first.
import { createWorker } from 'tesseract.js';

// ... existing imports ...

// Range: Line 134 to 197.

// Then I will replace optimizeSchedule at the end.

/**
 * AI 視覺識別 (V0.22 - Real OCR with Tesseract.js)
 * 使用 Tesseract.js 進行真正的 OCR 文字識別
 * @param {File} file 上傳的圖片或 PDF
 * @param {string} importType 'screenshot' | 'receipt' | 'memory'
 * @returns {Promise<Object>} 解析結果
 */
export const parseTripImage = async (file, importType = 'screenshot') => {
    // Static import used instead of dynamic await import('tesseract.js')

    console.log(`[OCR] Starting OCR for: ${file.name}, Type: ${importType}`);

    try {
        // Tesseract Worker with Timeout
        const ocrPromise = (async () => {
            const worker = await createWorker('chi_tra+eng');
            const imageUrl = URL.createObjectURL(file);
            try {
                const { data } = await worker.recognize(imageUrl);
                await worker.terminate();
                return data.text;
            } finally {
                URL.revokeObjectURL(imageUrl);
            }
        })();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("OCR timed out (20s). Check network.")), 20000)
        );

        const rawText = await Promise.race([ocrPromise, timeoutPromise]);
        const confidence = 80; // Mock confidence for now as we simplified return

        console.log(`[OCR] Recognized text:`, rawText.substring(0, 200));

        // Parse based on import type (Proceed with rawText)


        // Parse based on import type
        let items = [];
        let parsedData = {};

        if (importType === 'receipt') {
            parsedData = parseReceiptText(rawText);
            items = parsedData.items || [];
        } else if (importType === 'screenshot') {
            parsedData = parseItineraryText(rawText);
            items = parsedData.items || [];
        }

        return {
            success: true,
            message: items.length > 0
                ? `成功識別 ${items.length} 個項目 (準確度: ${confidence.toFixed(0)}%)`
                : `已完成 OCR 識別 (準確度: ${confidence.toFixed(0)}%)，請確認內容`,
            rawText,
            confidence,
            items,
            parsedData,
            fileInfo: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadTime: new Date().toISOString()
            },
            manualInputRequired: items.length === 0
        };

    } catch (error) {
        console.error('[OCR] Error:', error);
        await worker.terminate().catch(() => { });

        return {
            success: false,
            message: `OCR 識別失敗: ${error.message}`,
            rawText: '',
            items: [],
            fileInfo: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadTime: new Date().toISOString()
            },
            manualInputRequired: true
        };
    }
};

/**
 * 解析單據文字 (收據、機票、酒店確認等)
 */
const parseReceiptText = (text) => {
    const items = [];
    const lines = text.split('\n').filter(l => l.trim());

    // Extract amounts (numbers with currency symbols or patterns)
    const amountPatterns = [
        /(?:HKD?|USD?|JPY?|NT\$?|TWD?|CNY?|¥|\$)\s*([\d,]+\.?\d*)/gi,
        /([\d,]+\.?\d*)\s*(?:HKD?|USD?|JPY?|NT\$?|TWD?|CNY?|元|円)/gi,
        /(?:Total|合計|總計|Subtotal|小計)[:\s]*([\d,]+\.?\d*)/gi
    ];

    let totalAmount = 0;
    let currency = 'HKD';

    for (const pattern of amountPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const amount = parseFloat(match[1]?.replace(/,/g, '') || match[2]?.replace(/,/g, '') || 0);
            if (amount > totalAmount) {
                totalAmount = amount;
                // Detect currency from match
                if (match[0].includes('JPY') || match[0].includes('円') || match[0].includes('¥')) currency = 'JPY';
                else if (match[0].includes('NT') || match[0].includes('TWD')) currency = 'TWD';
                else if (match[0].includes('USD')) currency = 'USD';
                else if (match[0].includes('CNY') || match[0].includes('元')) currency = 'CNY';
            }
        }
    }

    // Try to extract date
    const datePatterns = [
        /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
        /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
        /(\d{4}年\d{1,2}月\d{1,2}日)/
    ];
    let date = null;
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            date = match[1];
            break;
        }
    }

    // Try to extract merchant name (usually first non-empty line)
    let merchantName = lines[0]?.substring(0, 50) || '購物單據';

    if (totalAmount > 0) {
        items.push({
            id: `ocr-${Date.now()}`,
            name: merchantName,
            cost: totalAmount,
            currency,
            date: date || new Date().toISOString().split('T')[0],
            category: 'shopping',
            ocrExtracted: true
        });
    }

    return { items, totalAmount, currency, date, merchantName, rawLines: lines };
};

/**
 * 解析行程截圖文字
 */
const parseItineraryText = (text) => {
    const items = [];
    const lines = text.split('\n').filter(l => l.trim().length > 3);
    let extractedDate = null;

    // Date Pattern: 12月29日, 2024-12-29, 12/29
    const datePattern = /(\d{4})?[-./\s年]*(\d{1,2})\s*[月/-]\s*(\d{1,2})\s*[日]?/;
    const timeLocationPattern = /(\d{1,2}[:：]\d{2})\s*[-–]?\s*(.+)/;
    const locationTypes = ['restaurant', 'hotel', 'airport', 'station', 'temple', 'museum', 'park', '餐廳', '酒店', '機場', '車站', '寺', '博物館', '公園', '夜市', 'market'];

    for (const line of lines) {
        // Check for Date
        if (!extractedDate) {
            const dateMatch = line.match(datePattern);
            if (dateMatch) {
                const year = dateMatch[1] || "";
                const month = dateMatch[2].padStart(2, '0');
                const day = dateMatch[3].padStart(2, '0');
                extractedDate = year ? `${year}-${month}-${day}` : `${month}-${day}`;
            }
        }

        const match = line.match(timeLocationPattern);
        if (match) {
            const time = match[1].replace('：', ':');
            let name = match[2].trim();

            // Filter out junk names (e.g. "2小時30分", "12:50")
            const isDuration = /^(\d+\s*(小時|hr|min|分|小\s*時))/.test(name) || /^\d{1,2}:\d{2}$/.test(name);

            if (isDuration) {
                const nextLineIndex = lines.indexOf(line) + 1;
                if (nextLineIndex < lines.length) {
                    const nextLine = lines[nextLineIndex].trim();
                    if (nextLine.length > 2 && !/^\d{1,2}[:：]\d{2}/.test(nextLine)) {
                        name = nextLine;
                        // Mark next line as used potentially? 
                        // For simplicity, we just use it. Duplicates handled by check below.
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            if (name.length < 2) continue;

            // Guess type
            let type = 'spot';
            const lowerName = name.toLowerCase();

            if (locationTypes.some(t => lowerName.includes(t)) || /站|機場|airport|station/.test(lowerName)) type = 'transport';
            if (/hotel|inn|bnb|酒店|民宿|旅/.test(lowerName)) type = 'hotel';
            if (/restaurant|cafe|coffee|food|餐廳|咖啡|食/.test(lowerName)) type = 'food';

            if (!items.some(i => i.name === name)) {
                items.push({
                    id: `ocr-${Date.now()}-${items.length}`,
                    name: name,
                    time: time,
                    type: type,
                    cost: 0,
                    currency: 'HKD',
                    details: { location: name, desc: '由 OCR 識別' },
                    ocrExtracted: true
                });
            }
        } else {
            // Fallback: Check for Key Locations
            // Normalize for Blacklist Check: Remove ALL whitespace to catch "無 煙" as "無煙"
            const compactLine = line.replace(/\s+/g, '').toLowerCase();
            const lowerLine = line.toLowerCase(); // Keep original for english keywords

            // 1. Skip strictly numeric/symbolic junk (e.g. "o [", "0", "---")
            if (/^[^a-z\u4e00-\u9fa5]*$/.test(compactLine)) continue;
            if (compactLine.length < 2) continue;

            // 2. Blacklist (keywords without spaces)
            const blacklistPattern = /確認|confirm|contact|聯繫|電話|phone|map|地圖|guide|房|room|bed|床|無煙|non-smoking|訂單|reservation|booking|入住|check-in|check-out|晚|night|月|日|年|間|地址|address|座位|seat|class|經濟|economy|business|商務|艙|票|ticket|號|no\.|code/i;

            if (blacklistPattern.test(compactLine)) continue;

            // 3. Skip lines that look like Dates (but missed the parser above)
            // e.g. "12月31日" that appeared as an item
            if (/\d+(月|日|年|-|\/)\d+/.test(compactLine)) continue;

            const isKeyword = locationTypes.some(t => lowerLine.includes(t)) || /hotel|inn|bnb|酒店|民宿|旅|restaurant|cafe|coffee|food|餐廳|咖啡|食|站|機場|airport|station|park|博物館|temple|寺/i.test(lowerLine);

            // Only accept if keyword found OR very likely a name (CJK > 2 chars, or Capitalized English)
            // For safety, require Keyword for now to reduce noise significantly as per user request.
            if (isKeyword && line.length > 3 && line.length < 50) {
                if (!items.some(i => i.name === line.trim())) {
                    // Guess type
                    let type = 'spot';
                    if (/站|機場|airport|station|航空|flight|airline/i.test(lowerLine)) type = 'transport';
                    else if (/hotel|inn|bnb|酒店|民宿|旅/i.test(lowerLine)) type = 'hotel';
                    else if (/restaurant|cafe|coffee|food|餐廳|咖啡|食/i.test(lowerLine)) type = 'food';

                    // Specific check for Flight format "Origin -> Dest"
                    if (lowerLine.includes('->') || lowerLine.includes('✈') || (type === 'transport' && items.length > 0 && items[items.length - 1].type === 'transport')) {
                        type = 'flight';
                    }

                    items.push({
                        id: `ocr-${Date.now()}-${items.length}`,
                        name: line.trim(),
                        time: "10:00", // Default time
                        type: type, // 'flight', 'transport', 'hotel', 'food', 'spot'
                        cost: 0,
                        currency: 'HKD',
                        details: { location: cleanName, desc: '由 OCR 識別 (無時間)' },
                        ocrExtracted: true
                    });
                }
            }
        }
    }

    // Final Pass: Clean up names
    items.forEach(item => {
        if (item.type === 'transport' || item.type === 'flight') {
            // "Taiwan Airport T1 Kansai Airport T" -> "Taiwan Airport ✈️ Kansai Airport"
            if ((item.name.match(/機場|Airport/g) || []).length >= 2) {
                item.type = 'flight'; // Force flight
                // Simple heuristic: Finds the middle point? 
                // No, just insert an arrow if possible?
                // "T1" is a good delimiter?
                item.name = item.name.replace(/(T[123])/g, '$1 ✈️ ');
            }
        }
    });

    // If no time-based items found, try to extract location names
    if (items.length === 0) {
        for (const line of lines.slice(0, 10)) { // Check first 10 lines
            if (line.length > 5 && line.length < 60 && !(/^\d+$/.test(line))) {
                items.push({
                    id: `ocr-${Date.now()}-${items.length}`,
                    name: line.trim(),
                    time: '10:00',
                    type: 'spot',
                    cost: 0,
                    currency: 'HKD',
                    details: { location: line.trim(), desc: '由 OCR 識別' },
                    ocrExtracted: true
                });
            }
        }
    }

    return { items, rawLines: lines, date: extractedDate };
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
    const pushItem = (name, catLabel) => items.push({ id: Date.now() + Math.random(), name, category: catLabel, checked: false, aiSuggested: true });

    // 1. 📋 必要文件 (Always Required)
    pushItem("護照 / 簽證 / 身份證", "📋 必要文件");
    pushItem("機票行程單 / 酒店預訂確認信", "📋 必要文件");
    pushItem("外幣現金 / 信用卡 / 提款卡", "📋 必要文件");
    pushItem("旅遊保險單副本", "📋 必要文件");

    // 2. 🔌 電子設備
    pushItem("手機 / 充電線 / 充電頭", "🔌 電子設備");
    pushItem("大容量行動電源 (火牛)", "🔌 電子設備");
    pushItem("外遊萬能插座 (萬國頭)", "🔌 電子設備");
    pushItem("eSIM / SIM 卡 / WiFi 蛋", "🔌 電子設備");
    pushItem("耳機 (降噪效果佳者佳)", "🔌 電子設備");

    // 3. 💊 醫藥與個人衛生
    pushItem("個人長期藥物 / 止痛藥", "💊 醫藥盒");
    pushItem("感冒成藥 / 腸胃藥 / 暈浪丸", "💊 醫藥盒");
    pushItem("酒精抹紙 / 口罩 / 濕紙巾", "🩹 衛生防護");
    pushItem("牙刷 / 牙膏 / 牙線", "🧴 洗護保養");
    pushItem("洗面奶 / 保濕乳液", "🧴 洗護保養");
    pushItem("小型摺疊衣架", "🎒 隨身裝備");

    // 4. 👕 衣物鞋履 (Weather & Activity Based)
    const temp = parseInt(weatherData?.temp || "20");
    const desc = (weatherData?.desc || "").toLowerCase();

    if (temp < 15) {
        pushItem("保暖大衣 / 羽絨", "👕 衣物鞋履");
        pushItem("發熱內衣 (Heattech)", "👕 衣物鞋履");
        pushItem("保暖圍巾 / 手套 / 毛帽", "👕 衣物鞋履");
        pushItem("潤唇膏 / 強力護手霜", "🧴 洗護保養");
    } else if (temp > 28) {
        pushItem("通爽排汗短袖 T-Shirt", "👕 衣物鞋履");
        pushItem("遮陽帽 / 太陽眼鏡", "🕶️ 時尚配件");
        pushItem("止汗噴霧 / 涼感濕紙巾", "🧴 洗護保養");
        pushItem("防曬乳액 (高系數)", "🧴 洗護保養");
    } else {
        pushItem("薄外套 (早晚防風)", "👕 衣物鞋履");
        pushItem("長褲 / 牛仔褲", "👕 衣物鞋履");
    }

    if (desc.includes('rain') || desc.includes('shower') || desc.includes('雨')) {
        pushItem("摺疊傘 / 輕便雨衣", "🌂 雨具/雜務");
        pushItem("鞋子防水防污噴霧", "🌂 雨具/雜務");
    }

    // 5. 🎒 隨身裝備 (Smart Detection)
    const allActivities = trip?.days?.flatMap(d => d.items) || (trip?.itinerary ? Object.values(trip.itinerary).flat() : []);
    const names = allActivities.map(i => ((i.name || "") + (i.details?.desc || "")).toLowerCase());

    if (names.some(n => n.includes('行山') || n.includes('步道') || n.includes('hiking') || n.includes('山'))) {
        pushItem("專業行山鞋 / 抓地運動鞋", "👕 衣物鞋履");
        pushItem("輕便排汗背包", "🎒 隨身裝備");
        pushItem("水樽 / 折疊水袋", "🎒 隨身裝備");
        pushItem("防蚊噴霧", "💊 醫藥盒");
    }

    if (names.some(n => n.includes('泳') || n.includes('沙灘') || n.includes('beach') || n.includes('pool') || n.includes('水上'))) {
        pushItem("泳衣 / 泳褲 / 泳鏡", "👕 衣物鞋履");
        pushItem("超輕量速乾浴巾", "👕 衣物鞋履");
        pushItem("手機專用防水袋", "🎒 隨身裝備");
    }

    if (names.some(n => n.includes('高級') || n.includes('米芝蓮') || n.includes('fine dining') || n.includes('正裝'))) {
        pushItem("一套體面西裝 / 優雅連衣裙", "👕 衣物鞋履");
        pushItem("休閒皮鞋 / 平底鞋", "👕 衣物鞋履");
    }

    if (names.some(n => n.includes('shopping') || n.includes('市場') || n.includes('夜市') || n.includes('購物'))) {
        pushItem("大容量可摺疊購物袋", "🎒 隨身裝備");
        pushItem("舒適耐穿的步行鞋", "👕 衣物鞋履");
        pushItem("退稅所需現金小筆、夾子", "📋 必要文件");
    }

    // 6. 🏠 居家與舒適
    pushItem("旅行裝洗髮精 / 沐浴露", "🧴 洗護保養");
    pushItem("內衣褲 (建議多帶兩套)", "👕 衣物鞋履");
    pushItem("襪子 (厚薄適中)", "👕 衣物鞋履");
    pushItem("舒適睡衣 / 居家服", "👕 衣物鞋履");
    pushItem("眼罩 / 耳塞 (睡眠保障)", "💤 舒適小物");

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

            // Smart Logic:
            // 1. If item has explicit transport_tip, use it as a hint
            // 2. If short distance (mocked by same type or ID proximity), Walk
            // 3. Else Metro/Taxi

            const isShortDist = Math.random() > 0.6; // Mock distance logic

            if (item.details?.transport_tip) {
                item.transport = {
                    mode: 'Tips',
                    duration: 'See Info',
                    price: 'Free',
                    desc: `💡 ${item.details.transport_tip}`
                };
            } else if (isShortDist) {
                item.transport = {
                    mode: 'Walk',
                    duration: '15min',
                    price: 'Free',
                    desc: `步行前往 ${nextItem.name}，沿途欣賞街景`
                };
            } else {
                item.transport = {
                    mode: 'Metro',
                    duration: '20min',
                    price: 'JPY 200', // Should be dynamic based on city currency but keeping simple mock
                    desc: `搭乘地鐵至 ${nextItem.name} (最快路線)`
                };
            }
        }

        // Add "Smart Tag"
        if (!item.smartTag) {
            if (item.details?.accolades) {
                item.smartTag = `🏅 ${item.details.accolades[0]}`;
            } else if (item.details?.history) {
                item.smartTag = "📜 歷史悠久";
            } else {
                const tags = ["🔥 熱門", "📸 打卡", "📅 需預約"];
                if (Math.random() > 0.7) item.smartTag = tags[Math.floor(Math.random() * tags.length)];
            }
        }

        return item;
    });

    return newItems;
};

export { SHOPPING_DB, MOCK_DB, HOTEL_DB };
