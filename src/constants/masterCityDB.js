export const MASTER_CITY_DB = {
    "Tokyo": {
        country: "Japan",
        currency: "JPY",
        timezone: "GMT+9",
        airports: [
            {
                code: "NRT",
                name: "Narita Int'l Airport",
                name_zh: "成田國際機場",
                transports: [
                    { name: "Skyliner Express", name_zh: "京成 Skyliner", duration: 45, cost: 2570, type: "train", gate: "B1", gate_zh: "地下一樓" },
                    { name: "Narita Express (N'EX)", name_zh: "成田特快 (N'EX)", duration: 60, cost: 3000, type: "train", gate: "B1", gate_zh: "地下一樓" },
                    { name: "Airport Limousine Bus", name_zh: "利木津巴士", duration: 90, cost: 3200, type: "bus", gate: "1F Bus Stop", gate_zh: "一樓巴士站" }
                ]
            },
            {
                code: "HND",
                name: "Haneda Airport",
                name_zh: "羽田機場",
                transports: [
                    { name: "Tokyo Monorail", name_zh: "東京單軌電車", duration: 20, cost: 500, type: "train", gate: "3F", gate_zh: "三樓" },
                    { name: "Keikyu Line", name_zh: "京急線", duration: 30, cost: 400, type: "train", gate: "B1", gate_zh: "地下一樓" }
                ]
            }
        ],
        spots: [
            {
                name: "Senso-ji Temple", name_zh: "淺草寺", type: "culture", bestTime: "morning", duration: 90, cost: 0,
                details: { desc: "Historic temple", desc_zh: "最古老寺廟", tags: ["Culture", "Must-visit"] }
            },
            {
                name: "Shibuya Crossing", name_zh: "澀谷十字路口", type: "shopping", bestTime: "evening", duration: 60, cost: 0,
                details: { desc: "Busiest crossing", desc_zh: "繁忙十字路口", tags: ["City", "Photo"] }
            },
            {
                name: "Tokyo Skytree", name_zh: "晴空塔", type: "view", bestTime: "afternoon", duration: 120, cost: 3000,
                details: { desc: "Panoramic view", desc_zh: "全景一覽無遺", tags: ["View", "Landmark"] }
            },
            {
                name: "Tsukiji Outer Market", name_zh: "築地場外市場", type: "food", bestTime: "morning", duration: 120, cost: 2000,
                details: { desc: "Fresh seafood", desc_zh: "新鮮海鮮", tags: ["Food", "Market"] }
            },
            {
                name: "Meiji Shrine", name_zh: "明治神宮", type: "culture", bestTime: "morning", duration: 90, cost: 0,
                details: { desc: "Forest shrine", desc_zh: "森林中的神社", tags: ["Nature", "Peaceful"] }
            }
        ]
    },
    "London": {
        country: "UK",
        currency: "GBP",
        timezone: "GMT+0",
        airports: [
            {
                code: "LHR",
                name: "Heathrow Airport",
                name_zh: "希斯路機場",
                transports: [
                    { name: "Heathrow Express", name_zh: "希斯路機場快線", duration: 15, cost: 25, type: "train", gate: "Platforms 6-7", gate_zh: "6-7號月台" },
                    { name: "Elizabeth Line", name_zh: "伊利沙伯線", duration: 45, cost: 12, type: "train", gate: "Underground", gate_zh: "地鐵站" },
                    { name: "Piccadilly Line", name_zh: "皮卡迪利線", duration: 60, cost: 6, type: "metro", gate: "Underground", gate_zh: "地鐵站" }
                ]
            }
        ],
        spots: [
            {
                name: "British Museum", name_zh: "大英博物館", type: "culture", bestTime: "afternoon", duration: 180, cost: 0,
                details: { desc: "World history", desc_zh: "世界歷史瑰寶", tags: ["Museum", "History"] }
            },
            {
                name: "London Eye", name_zh: "倫敦眼", type: "view", bestTime: "evening", duration: 60, cost: 35,
                details: { desc: "City views", desc_zh: "飽覽倫敦美景", tags: ["View", "Iconic"] }
            },
            {
                name: "Borough Market", name_zh: "波羅市場", type: "food", bestTime: "morning", duration: 90, cost: 20,
                details: { desc: "Foodie heaven", desc_zh: "美食天堂", tags: ["Food", "Market"] }
            },
            {
                name: "Tower Bridge", name_zh: "倫敦塔橋", type: "view", bestTime: "afternoon", duration: 60, cost: 15,
                details: { desc: "Iconic bridge", desc_zh: "標誌性吊橋", tags: ["Photo", "Landmark"] }
            }
        ]
    },
    "Osaka": {
        country: "Japan",
        currency: "JPY",
        timezone: "GMT+9",
        airports: [
            {
                code: "KIX",
                name: "Kansai Int'l Airport",
                name_zh: "關西國際機場",
                transports: [
                    { name: "Nankai Rapi:t", name_zh: "南海電鐵 Rapi:t", duration: 40, cost: 1450, type: "train", gate: "Nankai Stn", gate_zh: "南海車站" },
                    { name: "JR Haruka", name_zh: "JR Haruka 特急", duration: 50, cost: 2000, type: "train", gate: "JR Stn", gate_zh: "JR 車站" }
                ]
            }
        ],
        spots: [
            {
                name: "Dotonbori", name_zh: "道頓堀", type: "food", bestTime: "evening", duration: 120, cost: 3000,
                details: { desc: "Street food & neon", desc_zh: "街頭美食與霓虹燈", tags: ["Food", "Nightlife"] }
            },
            {
                name: "Universal Studios Japan", name_zh: "日本環球影城", type: "fun", bestTime: "morning", duration: 480, cost: 8400,
                details: { desc: "Theme park fun", desc_zh: "主題樂園", tags: ["Fun", "Mario"] }
            },
            {
                name: "Osaka Castle", name_zh: "大阪城", type: "culture", bestTime: "morning", duration: 90, cost: 600,
                details: { desc: "Historic castle", desc_zh: "歷史名城", tags: ["History", "View"] }
            },
            {
                name: "Kuromon Market", name_zh: "黑門市場", type: "food", bestTime: "morning", duration: 90, cost: 2000,
                details: { desc: "Osaka's kitchen", desc_zh: "大阪的廚房", tags: ["Food", "Market"] }
            }
        ]
    },
    "Taipei": {
        country: "Taiwan",
        currency: "TWD",
        timezone: "GMT+8",
        airports: [
            {
                code: "TPE",
                name: "Taoyuan Int'l Airport",
                name_zh: "桃園國際機場",
                transports: [
                    { name: "Taoyuan Airport MRT", name_zh: "桃園機場捷運", duration: 40, cost: 160, type: "train", gate: "B2", gate_zh: "地下二樓" },
                    { name: "Express Bus 1819", name_zh: "國光客運 1819", duration: 55, cost: 140, type: "bus", gate: "B1 Bus Stn", gate_zh: "地下一樓轉運站" }
                ]
            }
        ],
        spots: [
            {
                name: "Taipei 101", name_zh: "台北 101", type: "view", bestTime: "evening", duration: 90, cost: 600,
                details: { desc: "City landmark", desc_zh: "城市地標", tags: ["View", "Shopping"] }
            },
            {
                name: "Shilin Night Market", name_zh: "士林夜市", type: "food", bestTime: "night", duration: 120, cost: 500,
                details: { desc: "Famous night market", desc_zh: "著名夜市", tags: ["Food", "Nightlife"] }
            },
            {
                name: "Chiang Kai-shek Memorial Hall", name_zh: "中正紀念堂", type: "culture", bestTime: "morning", duration: 60, cost: 0,
                details: { desc: "National monument", desc_zh: "國家紀念碑", tags: ["History", "Photo"] }
            },
            {
                name: "Jiufen Old Street", name_zh: "九份老街", type: "culture", bestTime: "afternoon", duration: 180, cost: 200,
                details: { desc: "Old mountain village", desc_zh: "山城老街", tags: ["Culture", "Tea"] }
            }
        ]
    },
    "Seoul": {
        country: "South Korea",
        currency: "KRW",
        timezone: "GMT+9",
        airports: [
            {
                code: "ICN",
                name: "Incheon Int'l Airport",
                name_zh: "仁川國際機場",
                transports: [
                    { name: "AREX Express", name_zh: "AREX 機場快線", duration: 45, cost: 9500, type: "train", gate: "B1", gate_zh: "地下一樓" },
                    { name: "Airport Limousine Bus", name_zh: "機場豪華巴士", duration: 75, cost: 17000, type: "bus", gate: "1F", gate_zh: "一樓" }
                ]
            }
        ],
        spots: [
            {
                name: "Gyeongbokgung Palace", name_zh: "景福宮", type: "culture", bestTime: "morning", duration: 120, cost: 3000,
                details: { desc: "Royal palace", desc_zh: "朝鮮王朝宮殿", tags: ["History", "Culture"] }
            },
            {
                name: "N Seoul Tower", name_zh: "N 首爾塔", type: "view", bestTime: "evening", duration: 90, cost: 12000,
                details: { desc: "City views", desc_zh: "俯瞰首爾夜景", tags: ["View", "Romantic"] }
            },
            {
                name: "Bukchon Hanok Village", name_zh: "北村韓屋村", type: "culture", bestTime: "afternoon", duration: 90, cost: 0,
                details: { desc: "Traditional village", desc_zh: "傳統韓屋", tags: ["Photo", "Culture"] }
            },
            {
                name: "Myeongdong Shopping Street", name_zh: "明洞購物街", type: "shopping", bestTime: "night", duration: 120, cost: 0,
                details: { desc: "Shopping & Street Food", desc_zh: "購物與街頭小吃", tags: ["Shopping", "Food"] }
            }
        ]
    },
    "Bangkok": {
        country: "Thailand", currency: "THB", timezone: "GMT+7",
        airports: [{ code: "BKK", name: "Suvarnabhumi Airport", name_zh: "蘇凡納布機場", transports: [{ name: "Airport Rail Link", name_zh: "機場快線 ARL", duration: 30, cost: 45, type: "train", gate: "B1", gate_zh: "地下一樓" }, { name: "Public Taxi", name_zh: "的士", duration: 45, cost: 400, type: "taxi", gate: "1F", gate_zh: "一樓" }] }],
        spots: [
            { name: "Grand Palace", name_zh: "大皇宮", type: "culture", bestTime: "morning", duration: 120, cost: 500, details: { desc: "Royal residence", desc_zh: "泰國皇室宮殿", tags: ["Culture", "History"] } },
            { name: "Wat Arun", name_zh: "鄭王廟", type: "culture", bestTime: "afternoon", duration: 90, cost: 100, details: { desc: "Riverside temple", desc_zh: "黎明寺", tags: ["Culture", "Photo"] } },
            { name: "Jodd Fairs", name_zh: "Jodd Fairs 夜市", type: "food", bestTime: "night", duration: 120, cost: 300, details: { desc: "Night market", desc_zh: "人氣夜市", tags: ["Food", "Nightlife"] } }
        ]
    },
    "Paris": {
        country: "France", currency: "EUR", timezone: "GMT+1",
        airports: [{ code: "CDG", name: "Charles de Gaulle", name_zh: "戴高樂機場", transports: [{ name: "RER B", name_zh: "RER B 線", duration: 35, cost: 12, type: "train", gate: "Terminal 2", gate_zh: "二號客運大樓" }, { name: "RoissyBus", name_zh: "Roissy 巴士", duration: 60, cost: 16, type: "bus", gate: "Terminal 1/2", gate_zh: "1/2號客運大樓" }] }],
        spots: [
            { name: "Eiffel Tower", name_zh: "艾菲爾鐵塔", type: "view", bestTime: "evening", duration: 120, cost: 25, details: { desc: "Iconic landmark", desc_zh: "巴黎地標", tags: ["View", "Romantic"] } },
            { name: "Louvre Museum", name_zh: "羅浮宮", type: "culture", bestTime: "morning", duration: 240, cost: 17, details: { desc: "World's largest art museum", desc_zh: "世界最大藝術博物館", tags: ["Art", "History"] } },
            { name: "Montmartre", name_zh: "蒙馬特高地", type: "culture", bestTime: "afternoon", duration: 120, cost: 0, details: { desc: "Artistic district", desc_zh: "藝術家聚集地", tags: ["Walk", "View"] } }
        ]
    },
    "Singapore": {
        country: "Singapore", currency: "SGD", timezone: "GMT+8",
        airports: [{ code: "SIN", name: "Changi Airport", name_zh: "樟宜機場", transports: [{ name: "MRT East-West Line", name_zh: "地鐵東西線", duration: 45, cost: 2, type: "metro", gate: "T2/T3", gate_zh: "T2/T3客運大樓" }, { name: "Grab Car", name_zh: "Grab", duration: 20, cost: 25, type: "taxi", gate: "Arrival L1", gate_zh: "抵達層" }] }],
        spots: [
            { name: "Gardens by the Bay", name_zh: "濱海灣花園", type: "view", bestTime: "evening", duration: 120, cost: 28, details: { desc: "Supertrees & Cloud Forest", desc_zh: "天空樹與雲霧林", tags: ["Nature", "Photo"] } },
            { name: "Sentosa Island", name_zh: "聖淘沙島", type: "fun", bestTime: "afternoon", duration: 180, cost: 0, details: { desc: "Resort island", desc_zh: "度假勝地", tags: ["Fun", "Beach"] } },
            { name: "Chinatown Food Complex", name_zh: "牛車水美食中心", type: "food", bestTime: "morning", duration: 90, cost: 10, details: { desc: "Local hawker food", desc_zh: "地道小販中心", tags: ["Food", "Local"] } }
        ]
    },
    "New York": {
        country: "USA", currency: "USD", timezone: "GMT-5",
        airports: [{ code: "JFK", name: "JFK Airport", name_zh: "甘迺迪機場", transports: [{ name: "AirTrain + Subway", name_zh: "AirTrain + 地鐵", duration: 60, cost: 11, type: "train", gate: "All Terminals", gate_zh: "所有航廈" }, { name: "Taxi (Flat Rate)", name_zh: "的士 (定額)", duration: 45, cost: 70, type: "taxi", gate: "Arrivals", gate_zh: "抵達層" }] }],
        spots: [
            { name: "Times Square", name_zh: "時代廣場", type: "view", bestTime: "night", duration: 60, cost: 0, details: { desc: "Bright lights", desc_zh: "繁華霓虹", tags: ["City", "Photo"] } },
            { name: "Central Park", name_zh: "中央公園", type: "view", bestTime: "morning", duration: 120, cost: 0, details: { desc: "Urban oasis", desc_zh: "城市綠洲", tags: ["Nature", "Walk"] } },
            { name: "Statue of Liberty", name_zh: "自由女神像", type: "culture", bestTime: "afternoon", duration: 180, cost: 25, details: { desc: "National symbol", desc_zh: "自由象徵", tags: ["History", "Ferry"] } }
        ]
    },
    "Sydney": {
        country: "Australia", currency: "AUD", timezone: "GMT+11",
        airports: [{ code: "SYD", name: "Kingsford Smith", name_zh: "京斯福特史密斯", transports: [{ name: "Airport Link Train", name_zh: "機場快線火車", duration: 15, cost: 18, type: "train", gate: "Int'l Terminal", gate_zh: "國際航廈" }] }],
        spots: [
            { name: "Sydney Opera House", name_zh: "雪梨歌劇院", type: "view", bestTime: "afternoon", duration: 60, cost: 0, details: { desc: "Iconic architecture", desc_zh: "地標建築", tags: ["Iconic", "Photo"] } },
            { name: "Bondi Beach", name_zh: "邦代海灘", type: "fun", bestTime: "morning", duration: 120, cost: 0, details: { desc: "Famous beach", desc_zh: "著名海灘", tags: ["Beach", "Sun"] } }
        ]
    },
    "Rome": {
        country: "Italy", currency: "EUR", timezone: "GMT+1",
        airports: [{ code: "FCO", name: "Fiumicino Airport", name_zh: "菲烏米奇諾機場", transports: [{ name: "Leonardo Express", name_zh: "Leonardo 快線", duration: 32, cost: 14, type: "train", gate: "Stazione", gate_zh: "火車站" }] }],
        spots: [
            { name: "Colosseum", name_zh: "羅馬競技場", type: "culture", bestTime: "morning", duration: 120, cost: 18, details: { desc: "Ancient amphitheater", desc_zh: "古羅馬鬥獸場", tags: ["History", "Ancient"] } },
            { name: "Trevi Fountain", name_zh: "許願池", type: "view", bestTime: "evening", duration: 45, cost: 0, details: { desc: "Baroque fountain", desc_zh: "巴洛克噴泉", tags: ["Photo", "Romantic"] } }
        ]
    },
    "Barcelona": {
        country: "Spain", currency: "EUR", timezone: "GMT+1",
        airports: [{ code: "BCN", name: "El Prat Airport", name_zh: "埃爾普拉特機場", transports: [{ name: "Aerobus", name_zh: "機場巴士", duration: 35, cost: 6, type: "bus", gate: "T1/T2", gate_zh: "T1/T2客運大樓" }] }],
        spots: [
            { name: "Sagrada Família", name_zh: "聖家堂", type: "culture", bestTime: "morning", duration: 120, cost: 26, details: { desc: "Gaudí masterpiece", desc_zh: "高迪傑作", tags: ["Art", "Architecture"] } },
            { name: "Park Güell", name_zh: "奎爾公園", type: "view", bestTime: "afternoon", duration: 90, cost: 10, details: { desc: "Colorful park", desc_zh: "彩色公園", tags: ["View", "Gaudí"] } }
        ]
    },
    "Dubai": {
        country: "UAE", currency: "AED", timezone: "GMT+4",
        airports: [{ code: "DXB", name: "Dubai Int'l", name_zh: "杜拜國際機場", transports: [{ name: "Dubai Metro Red Line", name_zh: "杜拜地鐵紅線", duration: 25, cost: 5, type: "metro", gate: "T1/T3", gate_zh: "T1/T3客運大樓" }] }],
        spots: [
            { name: "Burj Khalifa", name_zh: "哈利法塔", type: "view", bestTime: "evening", duration: 90, cost: 150, details: { desc: "Tallest building", desc_zh: "世界最高樓", tags: ["View", "Luxury"] } },
            { name: "Dubai Fountain", name_zh: "杜拜噴泉", type: "show", bestTime: "night", duration: 30, cost: 0, details: { desc: "Water show", desc_zh: "音樂噴泉", tags: ["Show", "Free"] } }
        ]
    },
    "Bali": {
        country: "Indonesia", currency: "IDR", timezone: "GMT+8",
        airports: [{ code: "DPS", name: "Ngurah Rai Int'l", name_zh: "伍拉賴國際機場", transports: [{ name: "Private Driver", name_zh: "包車接送", duration: 45, cost: 150000, type: "car", gate: "Arrivals", gate_zh: "抵達層" }] }],
        spots: [
            { name: "Uluwatu Temple", name_zh: "烏魯瓦圖廟", type: "culture", bestTime: "evening", duration: 60, cost: 50000, details: { desc: "Sunset cliff temple", desc_zh: "斷崖日落", tags: ["Culture", "Sunset"] } },
            { name: "Tegallalang Rice Terrace", name_zh: "德哥拉朗梯田", type: "view", bestTime: "morning", duration: 90, cost: 15000, details: { desc: "Rice fields", desc_zh: "梯田風光", tags: ["Nature", "Photo"] } }
        ]
    },
    "Sapporo": {
        country: "Japan", currency: "JPY", timezone: "GMT+9",
        airports: [{ code: "CTS", name: "New Chitose Airport", name_zh: "新千歲機場", transports: [{ name: "JR Rapid Airport", name_zh: "JR 快速機場線", duration: 37, cost: 1150, type: "train", gate: "B1", gate_zh: "地下一樓" }] }],
        spots: [
            { name: "Odori Park", name_zh: "大通公園", type: "view", bestTime: "afternoon", duration: 60, cost: 0, details: { desc: "City park", desc_zh: "市中心公園", tags: ["Walk", "City"] } },
            { name: "Tanukikoji Shopping Arcade", name_zh: "狸小路商店街", type: "shopping", bestTime: "evening", duration: 90, cost: 0, details: { desc: "Shopping street", desc_zh: "商店街", tags: ["Shopping", "Food"] } }
        ]
    },
    "Fukuoka": {
        country: "Japan", currency: "JPY", timezone: "GMT+9",
        airports: [{ code: "FUK", name: "Fukuoka Airport", name_zh: "福岡機場", transports: [{ name: "Subway Kuko Line", name_zh: "地鐵空港線", duration: 6, cost: 260, type: "metro", gate: "B2", gate_zh: "地下二樓" }] }],
        spots: [
            { name: "Ohori Park", name_zh: "大濠公園", type: "view", bestTime: "morning", duration: 90, cost: 0, details: { desc: "Large lake park", desc_zh: "大池塘公園", tags: ["Nature", "Relax"] } },
            { name: "Canal City Hakata", name_zh: "博多運河城", type: "shopping", bestTime: "afternoon", duration: 120, cost: 0, details: { desc: "Shopping mall", desc_zh: "購物中心", tags: ["Shopping", "Fun"] } }
        ]
    },
    "Taichung": {
        country: "Taiwan", currency: "TWD", timezone: "GMT+8",
        airports: [{ code: "RMQ", name: "Taichung Int'l Airport", name_zh: "台中清泉崗機場", transports: [{ name: "Bus A1", name_zh: "機場巴士 A1", duration: 60, cost: 100, type: "bus", gate: "B1", gate_zh: "地下一樓" }] }],
        spots: [
            { name: "Gaomei Wetlands", name_zh: "高美濕地", type: "view", bestTime: "evening", duration: 90, cost: 0, details: { desc: "Sunset views", desc_zh: "日落美景", tags: ["Nature", "Sunset"] } },
            { name: "Feng Chia Night Market", name_zh: "逢甲夜市", type: "food", bestTime: "night", duration: 120, cost: 400, details: { desc: "Largest night market", desc_zh: "最大夜市", tags: ["Food", "Market"] } }
        ]
    },
    "Kyoto": {
        country: "Japan",
        currency: "JPY",
        timezone: "GMT+9",
        nearestMajorCity: "Osaka",
        airports: [
            {
                code: "KIX",
                name: "Kansai Int'l (via Osaka)",
                name_zh: "關西國際機場 (經大阪轉乘)",
                isHub: true,
                transports: [
                    { name: "JR Haruka Express (Kyoto Line)", name_zh: "JR Haruka 特急 (京都行)", duration: 75, cost: 2900, type: "train", gate: "JR Stn", gate_zh: "JR 車站" },
                    { name: "Kyoto Limousine Bus", name_zh: "京都利木津巴士", duration: 90, cost: 2600, type: "bus", gate: "1F Bus Stop", gate_zh: "一樓巴士站" }
                ]
            }
        ],
        spots: [
            {
                name: "Fushimi Inari-taisha", name_zh: "伏見稻荷大社", type: "culture", bestTime: "morning", duration: 120, cost: 0,
                details: { desc: "Thousand torii gates", desc_zh: "千本鳥居", tags: ["Culture", "Photo"] }
            },
            {
                name: "Kinkaku-ji", name_zh: "金閣寺", type: "culture", bestTime: "afternoon", duration: 90, cost: 500,
                details: { desc: "Golden Pavilion", desc_zh: "鹿苑寺金閣", tags: ["Culture", "Landmark"] }
            },
            {
                name: "Kiyomizu-dera", name_zh: "清水寺", type: "culture", bestTime: "morning", duration: 120, cost: 400,
                details: { desc: "Wooden stage", desc_zh: "清水舞台", tags: ["View", "Culture"] }
            },
            {
                name: "Arashiyama Bamboo Grove", name_zh: "嵐山竹林", type: "nature", bestTime: "morning", duration: 90, cost: 0,
                details: { desc: "Bamboo path", desc_zh: "竹林小徑", tags: ["Nature", "Zen"] }
            }
        ]
    }
};
