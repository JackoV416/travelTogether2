// src/components/AIGuideModal.jsx

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { v4 as uuidv4 } from 'uuid';

// 模擬 Gemini AI 建議行程的函式
const mockGeminiSuggest = async (tripData, duration) => {
    // 這裡模擬 AI 處理時間
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    // 模擬 AI 生成的 JSON 格式回應 (必須是 JSON 以便解析)
    const suggestedItinerary = [
        {
            date: "2025-12-26",
            time: "09:00",
            activity: "抵達新宿，在機器人餐廳享用早餐（需預約）",
            category: "餐飲"
        },
        {
            date: "2025-12-26",
            time: "11:00",
            activity: "東京晴空塔 (Tokyo Skytree) 觀景台",
            category: "門票"
        },
        {
            date: "2025-12-26",
            time: "15:00",
            activity: "淺草寺與雷門參觀，體驗傳統文化",
            category: "觀光"
        },
        {
            date: "2025-12-26",
            time: "18:30",
            activity: "澀谷 Shibuya Sky 觀景台，欣賞日落與夜景",
            category: "觀光"
        },
    ];

    return suggestedItinerary;
};

const AIGuideModal = ({ trip, onAddItems, onClose }) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleGenerate = async () => {
        setLoading(true);
        setSuggestions(null);
        setError(null);
        
        try {
            // 在實際應用中，您會在這裡呼叫您的後端 API，然後後端 API 再呼叫 Gemini API
            // 這裡我們使用模擬函式
            const duration = (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 3600 * 24) + 1;
            const result = await mockGeminiSuggest(trip, duration);
            
            setSuggestions(result);
            setSelectedItems(result.map(item => item.id || uuidv4())); // 預設全部選中
        } catch (e) {
            setError('AI 建議生成失敗，請稍後再試。');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleConfirmAdd = () => {
        if (!suggestions || selectedItems.length === 0) return;

        const itemsToAdd = suggestions
            .filter(item => selectedItems.includes(item.id || uuidv4()))
            .map(item => ({
                ...item,
                id: item.id || uuidv4(), // 確保每個項目都有唯一的 ID
            }));

        onAddItems(itemsToAdd);
    };

    // 格式化日期範圍
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    
    return (
        // Modal 卡片樣式：Threads 風格
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-xl shadow-2xl text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-4 text-pink-600 dark:text-pink-400">✨ AI 行程建議 (Gemini)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                根據您的旅程 **{trip.title}** ({formatDate(trip.startDate)} - {formatDate(trip.endDate)}) 獲取建議。
            </p>

            {/* 產生按鈕 */}
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full p-3 font-bold rounded-lg transition-colors active:scale-95 ${
                    loading ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 text-white'
                }`}
            >
                {loading ? '思考中，請稍候...' : '生成 AI 行程建議'}
            </button>

            {error && <p className="text-red-500 mt-3">{error}</p>}
            
            {/* AI 建議列表 */}
            {suggestions && (
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 max-h-80 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">建議行程 ({suggestions.length} 項)</h3>
                    {suggestions.map((item, index) => {
                        const itemId = item.id || uuidv4();
                        const isSelected = selectedItems.includes(itemId);

                        return (
                            <div key={itemId} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected ? 'bg-pink-50 dark:bg-pink-900/50 border-pink-500' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                                onClick={() => handleToggleSelect(itemId)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:bg-gray-700 dark:border-gray-600 mr-3"
                                />
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.activity}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date)} {item.time} / {item.category}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* 確認/關閉按鈕 */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                {suggestions && (
                    <button 
                        onClick={handleConfirmAdd}
                        disabled={selectedItems.length === 0}
                        className={`px-4 py-2 text-white rounded-full font-bold transition-colors active:scale-95 ${
                            selectedItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                        }`}
                    >
                        確認加入 ({selectedItems.length} 項)
                    </button>
                )}
                <button type="button" onClick={onClose} 
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 font-medium active:scale-95 transition-transform">
                    {suggestions ? '關閉' : '取消'}
                </button>
            </div>
        </div>
    );
};

export default AIGuideModal;
