// src/constants/index.js

// 費用類別常數
export const EXPENSE_CATEGORIES = [
    '餐飲', '交通', '住宿', '購物', '門票/活動', '醫療', '雜項'
];

// 行程類別常數
export const ITINERARY_CATEGORIES = [
    '住宿', '景點', '餐飲', '交通', '購物', '活動', '其他'
];

// 費用類別顏色映射 (用於圖表和列表)
// 確保類別與 EXPENSE_CATEGORIES 匹配
export const EXPENSE_CATEGORY_COLORS = {
    '餐飲': 'text-red-500', 
    '交通': 'text-blue-500', 
    '住宿': 'text-purple-500', 
    '購物': 'text-green-500', 
    '門票/活動': 'text-yellow-500',
    '醫療': 'text-pink-500',
    '雜項': 'text-gray-500',
};

// 行程類別邊框顏色映射 (用於行程列表的左側邊框)
// 確保類別與 ITINERARY_CATEGORIES 匹配
export const ITINERARY_CATEGORY_COLORS = {
    '住宿': 'border-purple-500',
    '景點': 'border-yellow-500',
    '餐飲': 'border-red-500',
    '交通': 'border-blue-500',
    '購物': 'border-green-500',
    '活動': 'border-pink-500',
    '其他': 'border-gray-400',
};

// 批量貼上所需的最小欄位
export const ITINERARY_REQUIRED_COLUMNS = ['date', 'activity'];

// 批量貼上教學的 LocalStorage Key
export const ITINERARY_BATCH_GUIDE_STORAGE_KEY = 'itineraryBatchGuideShown';
