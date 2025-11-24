// src/components/AIGuideModal.jsx - 最終版本 (新增智能提示與 VPN 提示)

import React, { useState, useMemo } from 'react';

const AIGuideModal = ({ isOpen, onClose, tripDestination, apiError }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    // ***********************************************
    // 1. 根據目的地生成預設提示語
    const defaultPrompts = useMemo(() => {
        if (!tripDestination) {
            return [
                '推薦一個兩天一夜的國內小旅行。',
                '規劃一個低預算的週末行程。'
            ];
        }

        // 簡化目的地匹配，僅使用第一個詞
        const city = tripDestination.split(',')[0].trim();

        if (city.includes('東京') || city.includes('大阪') || city.includes('京都')) {
            return [
                `給我一份為期三天的${city}美食清單。`,
                `如果遇到下雨，${city}有什麼室內活動推薦？`,
                `比較${city}的交通選項：地鐵、公車、計程車。`,
            ];
        } else if (city.includes('巴黎') || city.includes('羅馬') || city.includes('倫敦')) {
            return [
                `在${city}，如何避開主要觀光景點的人潮？`,
                `推薦三個在${city}的免費博物館或景點。`,
                `從${city}市中心到主要機場的最佳方式是什麼？`,
            ];
        } else {
            return [
                `推薦${city}的五個必去景點。`,
                `在${city}旅行，當地的習俗或禁忌是什麼？`,
            ];
        }
    }, [tripDestination]);
    // ***********************************************
    
    // 模擬 AI 請求處理
    const handleSend = async () => {
        if (!prompt || isLoading || apiError) return;

        setIsLoading(true);
        setResponse('');
        // 模擬 API 呼叫
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            setResponse(`這是 AI 導覽對於「${prompt}」的模擬回覆，內容將根據您的目的地 ${tripDestination} 提供專業建議。`);
        } catch (error) {
            setResponse('AI 服務請求失敗，請稍後再試。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
                
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                        🤖 AI 旅行導覽
                    </h2>
                    
                    {/* 2. 錯誤與 VPN 提示區 */}
                    {apiError && (
                        <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 font-medium">
                            ⚠️ 連線失敗：AI 服務可能無法連線。
                            <p className="mt-1 text-sm font-semibold">
                                **請確認您已開啟 VPN** 或檢查您的網路連線，然後再試一次。
                            </p>
                        </div>
                    )}

                    {/* 預設提示語區 */}
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 建議快速提問：</p>
                        <div className="flex flex-wrap gap-2">
                            {defaultPrompts.map((p, index) => (
                                <button key={index}
                                    onClick={() => setPrompt(p)}
                                    className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* 輸入區 */}
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="輸入您的旅行問題，例如：在當地如何找到素食餐廳？"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                        disabled={isLoading}
                    />
                    
                    {/* 回覆區 */}
                    <div className={`p-4 min-h-[100px] border rounded-lg mb-4 ${response ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'}`}>
                        {isLoading ? (
                            <p className="text-indigo-500 dark:text-indigo-400">AI 正在思考中...</p>
                        ) : response ? (
                            <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{response}</p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">AI 回覆將顯示在這裡。</p>
                        )}
                    </div>
                    
                    {/* 按鈕區 */}
                    <div className="flex justify-end space-x-3">
                        <button onClick={onClose}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                            關閉
                        </button>
                        <button onClick={handleSend}
                            disabled={!prompt || isLoading || apiError}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                !prompt || isLoading || apiError 
                                    ? 'bg-indigo-400 dark:bg-indigo-500 opacity-50 cursor-not-allowed' 
                                    : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 active:scale-95'
                            }`}>
                            {isLoading ? '發送中...' : '發送給 AI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIGuideModal;
