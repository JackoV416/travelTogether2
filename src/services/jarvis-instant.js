/**
 * jarvis-instant.js
 * Service to handle instant, pre-defined responses for Jarvis AI
 * Bypasses the LLM API for common keywords (Performance + Cost saving)
 */

import { APP_VERSION } from '../constants/appData';

/**
 * Checks if the user's query matches any instant answer triggers.
 * @param {string} text - The user's input text
 * @param {object} context - Trip context (optional)
 * @returns {string|null} - The instant answer text, or null if no match
 */
export const checkInstantAnswer = (text, context = {}) => {
    if (!text) return null;
    const lowerText = text.toLowerCase().trim();

    // 1. WiFi & Connectivity
    if (lowerText.match(/^(wifi|sim|internet|data|網卡|上網|network)$/i) || lowerText.includes('wifi') || lowerText.includes('sim card')) {
        return `📶 **網絡連接建議**\n\n推薦使用 eSIM (如 Airalo / 3HK) 或當地 SIM 卡。\n\n• **日本**: Docomo / Softbank 網速最快\n• **韓國**: SK Telecom / KT\n• **歐洲**: Orange / Vodafone\n\n💡 提示：可以在機場或便利店購買，或出發前網上預訂。`;
    }

    // 2. Emergency / SOS
    if (lowerText.match(/^(sos|help|emergency|999|911|110|119|police|ambulance|救命|緊急|報警)$/i)) {
        const city = context.city || '當地';
        return `🚨 **緊急求助 (${city})**\n\n請保持冷靜。以下是通用緊急號碼：\n\n• 📞 **報警**: 110 (日本/中國), 112 (歐洲), 911 (美國)\n• 🚑 **救護**: 119 (日本/台灣), 112 (歐洲)\n• 🆘 **外交部急助**: +852 1868 (香港居民專用)\n\n⚠️ 如果情況危急，請立即尋求附近當地人協助！`;
    }

    // 3. Weather Widget Pointer
    if (lowerText.match(/^(weather|rain|temp|forecast|天氣|氣溫|落雨|temperature)$/i)) {
        return `🌦️ **天氣資訊**\n\n請查看畫面左上角的 **天氣小工具 (Weather Widget)**，那裡有 ${context.city || '目的地'} 的即時氣溫和未來預報。\n\n💡 點擊小工具可以看更詳細資訊！`;
    }

    // 4. Exchange Rate Widget Pointer
    if (lowerText.match(/^(rate|exchange|currency|money|cash|匯率|兌換|yen|won|euro)$/i)) {
        return `💱 **匯率資訊**\n\n請查看畫面左上角的 **匯率小工具 (Exchange Widget)**。\n\n• 支援即時計算\n• 自動更新最新匯率\n• 點擊可切換不同貨幣`;
    }

    // 5. Support / Bug Report
    if (lowerText.match(/^(support|bug|error|issue|help me|客服|支援|錯誤|壞左)$/i)) {
        return `🛠️ **客戶支援**\n\n如遇到 App 問題，你可以：\n\n1. 點擊右上角頭像 -> **「意見回饋」**\n2. 發送電郵至 support@traveltogether.com\n3. 嘗試 **重新整理 (Refersh)** 或重開 App\n\n我們會盡快協助你！ (Ver: ${APP_VERSION})`;
    }

    // 6. Navigation / Transport
    if (lowerText.match(/^(subway|metro|bus|train|transport|地鐵|巴士|交通|點去)$/i) && !lowerText.includes('plan')) {
        return `🚇 **交通導航**\n\n建議使用 **Google Maps** 或城市專用 App (如日本的 Yahoo!乘換案內, 韓國 Naver Map)。\n\nJarvis 亦可以幫你規劃路線，試試問：「${context.city || '東京'}塔去淺草點搭車？」`;
    }

    return null; // No instant match, proceed to LLM
};
