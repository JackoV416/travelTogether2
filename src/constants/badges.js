export const BADGES_DATA = [
    // --- Travel Milestones (Trips) ---
    {
        id: 'first_trip',
        icon: '🌍',
        name: { en: 'First Steps', zh_HK: '初次啟程' },
        desc: { en: 'Complete your first trip', zh_HK: '完成你的第一次旅程' },
        xp: 50,
        rarity: 'common',
        category: 'travel',
        condition: { type: 'trips', count: 1 }
    },
    {
        id: 'travel_enthusiast',
        icon: '✈️',
        name: { en: 'Travel Enthusiast', zh_HK: '旅遊愛好者' },
        desc: { en: 'Complete 5 trips', zh_HK: '完成 5 次旅程' },
        xp: 200,
        rarity: 'rare',
        category: 'travel',
        condition: { type: 'trips', count: 5 }
    },
    {
        id: 'globetrotter',
        icon: '🚀',
        name: { en: 'Globetrotter', zh_HK: '環球旅行家' },
        desc: { en: 'Complete 20 trips', zh_HK: '完成 20 次旅程' },
        xp: 1000,
        rarity: 'legendary',
        category: 'travel',
        condition: { type: 'trips', count: 20 }
    },

    // --- Country Collection ---
    {
        id: 'explorer_novice',
        icon: '🏳️',
        name: { en: 'Explorer Novice', zh_HK: '小小探索家' },
        desc: { en: 'Visit 3 different countries', zh_HK: '到訪 3 個不同國家' },
        xp: 150,
        rarity: 'common',
        category: 'exploration',
        condition: { type: 'countries', count: 3 }
    },
    {
        id: 'explorer_pro',
        icon: '🗺️',
        name: { en: 'World Citizen', zh_HK: '世界公民' },
        desc: { en: 'Visit 10 different countries', zh_HK: '到訪 10 個不同國家' },
        xp: 500,
        rarity: 'epic',
        category: 'exploration',
        condition: { type: 'countries', count: 10 }
    },
    {
        id: 'explorer_legend',
        icon: '👑',
        name: { en: 'Atlas Legend', zh_HK: '地圖傳奇' },
        desc: { en: 'Visit 30 different countries', zh_HK: '到訪 30 個不同國家' },
        xp: 2000,
        rarity: 'legendary',
        category: 'exploration',
        condition: { type: 'countries', count: 30 }
    },

    // --- Social / Community ---
    {
        id: 'social_butterfly',
        icon: '🦋',
        name: { en: 'Social Butterfly', zh_HK: '社交蝴蝶' },
        desc: { en: 'Have 5 friends', zh_HK: '擁有 5 位好友' },
        xp: 100,
        rarity: 'common',
        category: 'social',
        condition: { type: 'friends', count: 5 }
    },
    {
        id: 'popular_host',
        icon: '🌟',
        name: { en: 'Popular Host', zh_HK: '人氣搞手' },
        desc: { en: 'Host a trip with 4+ members', zh_HK: '舉辦一個 4 人以上的旅程' },
        xp: 300,
        rarity: 'rare',
        category: 'social',
        condition: { type: 'hosting', count: 1 } // Implement logic later
    },

    // --- Content Creation ---
    {
        id: 'memory_maker',
        icon: '📸',
        name: { en: 'Memory Maker', zh_HK: '回憶製造者' },
        desc: { en: 'Upload 50 photos', zh_HK: '上傳 50 張相片' },
        xp: 150,
        rarity: 'rare',
        category: 'content',
        condition: { type: 'photos', count: 50 }
    },
    {
        id: 'planner_pro',
        icon: '📅',
        name: { en: 'Planner Pro', zh_HK: '規劃達人' },
        desc: { en: 'Create a trip with 10+ itinerary items', zh_HK: '建立一個包含 10 個以上項目的行程' },
        xp: 100,
        rarity: 'common',
        category: 'planning',
        condition: { type: 'items', count: 10 }
    },

    // --- Special / Hidden ---
    {
        id: 'early_adopter',
        icon: '🥚',
        name: { en: 'Early Adopter', zh_HK: '元老級用戶' },
        desc: { en: 'Joined in 2024 or earlier', zh_HK: '在 2024 年或之前加入' },
        xp: 500,
        rarity: 'epic',
        category: 'special',
        condition: { type: 'join_date', year: 2024 }
    },
    {
        id: 'night_owl',
        icon: '🦉',
        name: { en: 'Night Owl', zh_HK: '貓頭鷹' },
        desc: { en: 'Login between 2AM and 5AM', zh_HK: '在凌晨 2 點至 5 點期間登入' },
        xp: 50,
        rarity: 'rare',
        category: 'special',
        condition: { type: 'login_time', start: 2, end: 5 }
    },

    // --- Level Milestones (Every Level) ---
    {
        id: 'level_1',
        icon: '🌱',
        name: { en: 'Novice Traveler', zh_HK: '新手旅者' },
        desc: { en: 'Reach Level 1', zh_HK: '達到等級 1' },
        xp: 0,
        rarity: 'common',
        category: 'milestone',
        condition: { type: 'level', count: 1 }
    },
    {
        id: 'rising_star', // Level 2
        icon: '⭐',
        name: { en: 'Rising Star', zh_HK: '明日之星' },
        desc: { en: 'Reach Level 2', zh_HK: '達到等級 2' },
        xp: 100,
        rarity: 'common',
        category: 'milestone',
        condition: { type: 'level', count: 2 }
    },
    {
        id: 'level_3',
        icon: '🎒',
        name: { en: 'Backpacker', zh_HK: '背包客' },
        desc: { en: 'Reach Level 3', zh_HK: '達到等級 3' },
        xp: 150,
        rarity: 'common',
        category: 'milestone',
        condition: { type: 'level', count: 3 }
    },
    {
        id: 'level_4',
        icon: '🧭',
        name: { en: 'Explorer', zh_HK: '探索者' },
        desc: { en: 'Reach Level 4', zh_HK: '達到等級 4' },
        xp: 200,
        rarity: 'common',
        category: 'milestone',
        condition: { type: 'level', count: 4 }
    },
    {
        id: 'veteran_traveler', // Level 5
        icon: '🏅',
        name: { en: 'Veteran Traveler', zh_HK: '資深旅者' },
        desc: { en: 'Reach Level 5', zh_HK: '達到等級 5' },
        xp: 300,
        rarity: 'rare',
        category: 'milestone',
        condition: { type: 'level', count: 5 }
    },
    {
        id: 'level_6',
        icon: '🦅',
        name: { en: 'Pathfinder', zh_HK: '引路人' },
        desc: { en: 'Reach Level 6', zh_HK: '達到等級 6' },
        xp: 350,
        rarity: 'rare',
        category: 'milestone',
        condition: { type: 'level', count: 6 }
    },
    {
        id: 'level_7',
        icon: '🌏',
        name: { en: 'Voyager', zh_HK: '航海家' },
        desc: { en: 'Reach Level 7', zh_HK: '達到等級 7' },
        xp: 400,
        rarity: 'rare',
        category: 'milestone',
        condition: { type: 'level', count: 7 }
    },
    {
        id: 'level_8',
        icon: '💎',
        name: { en: 'World Connoisseur', zh_HK: '世界鑑賞家' },
        desc: { en: 'Reach Level 8', zh_HK: '達到等級 8' },
        xp: 450,
        rarity: 'epic',
        category: 'milestone',
        condition: { type: 'level', count: 8 }
    },
    {
        id: 'level_9',
        icon: '🧙‍♂️',
        name: { en: 'Grandmaster', zh_HK: '一代宗師' },
        desc: { en: 'Reach Level 9', zh_HK: '達到等級 9' },
        xp: 500,
        rarity: 'epic',
        category: 'milestone',
        condition: { type: 'level', count: 9 }
    },
    {
        id: 'travel_master', // Level 10
        icon: '👑',
        name: { en: 'Travel Master', zh_HK: '旅遊大師' },
        desc: { en: 'Reach Level 10', zh_HK: '達到等級 10' },
        xp: 1000,
        rarity: 'legendary',
        category: 'milestone',
        condition: { type: 'level', count: 10 }
    },
    {
        id: 'legendary_guide', // Level 20
        icon: '🦄',
        name: { en: 'Legendary Guide', zh_HK: '傳說嚮導' },
        desc: { en: 'Reach Level 20', zh_HK: '達到等級 20' },
        xp: 2500,
        rarity: 'legendary',
        category: 'milestone',
        condition: { type: 'level', count: 20 }
    },
    // --- Food & Culture ---
    {
        id: 'foodie',
        icon: '🍜',
        name: { en: 'Foodie', zh_HK: '食貨' },
        desc: { en: 'Add 10 restaurant items', zh_HK: '新增 10 個餐廳行程' },
        xp: 150,
        rarity: 'common',
        category: 'culture',
        condition: { type: 'items_category', category: 'food', count: 10 }
    },
    {
        id: 'culture_vulture',
        icon: '🏛️',
        name: { en: 'Culture Vulture', zh_HK: '文化達人' },
        desc: { en: 'Add 5 museum/history items', zh_HK: '新增 5 個博物館/歷史景點' },
        xp: 200,
        rarity: 'rare',
        category: 'culture',
        condition: { type: 'items_category', category: 'culture', count: 5 }
    },

    // --- Transport ---
    {
        id: 'road_tripper',
        icon: '🚗',
        name: { en: 'Road Tripper', zh_HK: '公路旅行' },
        desc: { en: 'Add 5 car rental/drive items', zh_HK: '新增 5 個租車/自駕行程' },
        xp: 150,
        rarity: 'common',
        category: 'transport',
        condition: { type: 'items_category', category: 'transport', count: 5 }
    },
    {
        id: 'mile_high_club',
        icon: '✈️',
        name: { en: 'Jet Setter', zh_HK: '空中飛人' },
        desc: { en: 'Add 10 flight items', zh_HK: '新增 10 個航班行程' },
        xp: 300,
        rarity: 'epic',
        category: 'transport',
        condition: { type: 'items_category', category: 'flight', count: 10 }
    },

    // --- Planning Styles ---
    {
        id: 'weekend_warrior',
        icon: '🎒',
        name: { en: 'Weekend Warrior', zh_HK: '週末戰士' },
        desc: { en: 'Create 3 trips < 3 days', zh_HK: '建立 3 個少於 3 日的短途旅程' },
        xp: 100,
        rarity: 'common',
        category: 'style',
        condition: { type: 'trip_duration', max_days: 3, count: 3 }
    },
    {
        id: 'long_term_traveler',
        icon: '🧳',
        name: { en: 'Nomad', zh_HK: '遊牧民族' },
        desc: { en: 'Create a trip > 14 days', zh_HK: '建立一個超過 14 日的長途旅程' },
        xp: 500,
        rarity: 'epic',
        category: 'style',
        condition: { type: 'trip_duration', min_days: 14, count: 1 }
    },

    // --- Social Interactions ---
    {
        id: 'inviter',
        icon: '💌',
        name: { en: 'Connector', zh_HK: '聯繫者' },
        desc: { en: 'Send 5 friend requests', zh_HK: '發送 5 個好友邀請' },
        xp: 50,
        rarity: 'common',
        category: 'social',
        condition: { type: 'friend_requests_sent', count: 5 }
    },
    {
        id: 'popular',
        icon: '🔥',
        name: { en: 'Popular', zh_HK: '萬人迷' },
        desc: { en: 'Receive 5 friend requests', zh_HK: '收到 5 個好友邀請' },
        xp: 150,
        rarity: 'rare',
        category: 'social',
        condition: { type: 'friend_requests_received', count: 5 }
    },

    // --- Fun / Random ---
    {
        id: 'photographer',
        icon: '📷',
        name: { en: 'Shutterbug', zh_HK: '攝影發燒友' },
        desc: { en: 'Upload photos in 3 different countries', zh_HK: '在 3 個不同國家上傳相片' },
        xp: 250,
        rarity: 'rare',
        category: 'content',
        condition: { type: 'photo_locations', count: 3 }
    },
    {
        id: 'big_spender',
        icon: '💰',
        name: { en: 'High Roller', zh_HK: '豪客' },
        desc: { en: 'Add a budget item > $1000', zh_HK: '新增一項超過 $1000 的預算' },
        xp: 200,
        rarity: 'rare',
        category: 'style',
        condition: { type: 'budget_item_value', amount: 1000 }
    }
];

export const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 1500 },
    { level: 7, xp: 2200 },
    { level: 8, xp: 3000 },
    { level: 9, xp: 4000 },
    { level: 10, xp: 5500 }, // Max level for now
];

export const RARITY_COLORS = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-indigo-500',
    epic: 'from-purple-400 to-fuchsia-500',
    legendary: 'from-amber-300 to-yellow-500',
};
