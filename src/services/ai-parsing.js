import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUserQuota, incrementUserQuota } from './ai-quota'; // V1.2.3 Centralized Quota

// --- Multi-API Key + Multi-Model Configuration ---
// Add multiple keys in .env: VITE_GEMINI_API_KEY, VITE_GEMINI_API_KEY_2, etc.
// --- Multi-API Key + Multi-Model Configuration ---
// Add multiple keys in .env: VITE_GEMINI_API_KEY, VITE_GEMINI_API_KEY_2, etc.
const getStoredKey = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
        return settings.userGeminiKey;
    } catch { return null; }
};

const getStoredModel = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
        return settings.userGeminiModel;
    } catch { return null; }
};

// ... (ENV_KEYS, API_KEYS setup)
const ENV_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
    import.meta.env.VITE_GEMINI_API_KEY_6,
    import.meta.env.VITE_GEMINI_API_KEY_7,
    import.meta.env.VITE_GEMINI_API_KEY_8,
    import.meta.env.VITE_GEMINI_API_KEY_9,
    import.meta.env.VITE_GEMINI_API_KEY_10,
].filter(Boolean);

const API_KEYS = [...(getStoredKey() ? [getStoredKey()] : []), ...ENV_KEYS].filter(key =>
    key &&
    key.length > 20 && // Real keys are long
    !key.includes("YOUR_API_KEY") &&
    !key.includes("PLACEHOLDER")
);

if (API_KEYS.length === 0) {
    console.warn("[Gemini AI] No valid API keys found. Add VITE_GEMINI_API_KEY to .env");
}

// Model priority chain: Simplified for stability (Updated V1.2.9 - Verified 2.5 Flash)
// Model priority chain: Simplified for stability (Updated V1.2.9 - Verified 2.5 Flash)
// Model priority chain: Simplified for stability (Updated V1.2.9 - Verified 2.5 Flash)
const MODEL_CHAIN = [
    ...(getStoredModel() ? [getStoredModel()] : []), // User's custom model comes first!
    "gemini-2.5-flash",       // NEW: Confirmed working & fast!
    "gemini-2.5-flash-lite",  // PROMOTED: Best availability (1/10 RPM)
    "gemini-flash-latest",    // Backup
    "gemini-2.0-flash-exp",   // High Performance (Often 429 busy, keep as fallback)
];

let currentKeyIndex = 0;
let currentModelIndex = 0;

// V1.5: Avoid hammering exhausted models
const MODEL_COOLDOWNS = new Map(); // `${keyIndex}-${modelIndex}` -> expiry timestamp
const COOLDOWN_MS = 60000; // 1 minute

// Create GenAI instances for each API key
const genAIInstances = API_KEYS.map(key => new GoogleGenerativeAI(key));

/**
 * 🔑 Get current GenAI instance
 */
function getGenAI() {
    return genAIInstances[currentKeyIndex];
}

/**
 * 🔄 Get model with automatic fallback on quota errors
 */
function getModel() {
    return getGenAI().getGenerativeModel({ model: MODEL_CHAIN[currentModelIndex] });
}

/**
 * 🎯 Switch to next model in chain
 * @returns {boolean} True if successfully switched
 */
function rotateToNextModel() {
    // Mark current model as cooling down
    MODEL_COOLDOWNS.set(`${currentKeyIndex}-${currentModelIndex}`, Date.now() + COOLDOWN_MS);

    if (currentModelIndex < MODEL_CHAIN.length - 1) {
        currentModelIndex++;
        console.log(`[Gemini AI] 🔄 Rotating to: ${MODEL_CHAIN[currentModelIndex]}`);
        return true;
    }
    return false;
}

/**
 * 🔑 Switch to next API key (and reset model index)
 * @returns {boolean} True if successfully switched
 */
function rotateToNextKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    currentModelIndex = 0; // Reset to first model for new key
    console.log(`[Gemini AI] 🔑 Switching to API Key #${currentKeyIndex + 1}`);
    return true;
}

/**
 * ⏱️ Delay helper for retry backoff
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 🔁 Smart API call with retry + model rotation + key rotation + usage limit
 * @param {Function} apiFn - Async function that makes the API call
 * @param {Object} options - { maxRetries: 2, importance: 'high'|'low', trackUsage: true }
 */
// Helper: Smart Retry Wrapper with Rotation, Progress & Delay
const callWithSmartRetry = async (fnName, makeCall, importance = 'low', onProgress, signal, userId = null) => {
    let lastError = null;

    // V1.2.3: Check "Auto Jarvis" Setting (Skip if importance is 'critical' e.g. manual request)
    // If importance is 'low' (background tasks) and setting is OFF, block it.
    try {
        const settings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
        if (settings.autoJarvis === false && importance === 'low') {
            console.log(`[Jarvis] ${fnName} skipped due to Auto-Jarvis disabled.`);
            throw new Error("AUTO_JARVIS_DISABLED");
        }
    } catch (e) {
        if (e.message === "AUTO_JARVIS_DISABLED") throw e;
    }

    // V1.2.3: Centralized Quota Check (Skipped if Custom Key is active)
    const hasCustomKey = !!getStoredKey();
    if (userId && !hasCustomKey) {
        const quotaStatus = await checkUserQuota(userId);
        if (!quotaStatus.allowed) {
            throw new Error(AI_ERRORS.QUOTA + ": " + quotaStatus.message);
        }
    }

    // V1.2.7: Reduced rounds to prevent "Infinite Loop" feeling
    const MAX_KEY_ROUNDS = 2;
    const maxAttempts = Math.min(API_KEYS.length * MAX_KEY_ROUNDS, 12); // Hard cap at 12 attempts total

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // 0. Abort Check
        if (signal?.aborted) {
            console.log("[Gemini AI] 🚫 Operation aborted by user.");
            throw new Error("Operation aborted");
        }

        // 1. Report Progress
        if (onProgress) {
            // Percent calculation: 10% start, then increment based on attempt, cap at 90%
            const percent = Math.min(10 + Math.floor((attempt / maxAttempts) * 80), 95);
            // V1.2.7: Better status messages
            let msg = attempt === 0 ? "正在分析..." : `切換線路 (Attempt ${attempt + 1}/${maxAttempts})...`;
            if (attempt > 3) msg = "網絡繁忙，正在尋找可用線路...";

            onProgress(msg, percent);
        }

        // 2. Check Cooldown
        const cooldownKey = `${currentKeyIndex}-${currentModelIndex}`;
        const cooldownExpiry = MODEL_COOLDOWNS.get(cooldownKey);

        if (cooldownExpiry && Date.now() < cooldownExpiry) {
            console.log(`[Gemini AI] ❄️ Skipping cooled down model: ${MODEL_CHAIN[currentModelIndex]} (Key #${currentKeyIndex})`);

            // If we are at the end of the chain on this key, switch key
            if (!rotateToNextModel()) {
                rotateToNextKey();
            }

            await new Promise(r => setTimeout(r, 100)); // Fast yield
            continue;
        }

        try {
            const modelName = MODEL_CHAIN[currentModelIndex];
            const model = getModel(); // Uses currentKeyIndex

            console.log(`[Gemini AI] 🚀 Attempt ${attempt + 1}/${maxAttempts}: ${fnName} using ${modelName} (Key #${currentKeyIndex})`);

            // 3. Make the Call
            const result = await makeCall(model);

            // Success!
            if (onProgress) onProgress("完成！", 100);

            // V1.2.3: Increment Quota (Centralized)
            if (userId) {
                // Determine if Custom Key
                const isCustomKey = (currentKeyIndex === 0 && getStoredKey());
                // Pass feature name, key index, and type for analytics
                await incrementUserQuota(userId, fnName, currentKeyIndex, isCustomKey);
            }

            return result;

        } catch (error) {
            lastError = error;
            const errorMsg = error.message || '';
            const isRateLimit = errorMsg.includes('429') || error.status === 429 || errorMsg.includes('quota') || errorMsg.includes('check your plan');
            const isNotFound = errorMsg.includes('404') || error.status === 404 || errorMsg.includes('not found');

            // Log Error
            console.warn(`[Gemini AI] ⚠️ Failed on ${MODEL_CHAIN[currentModelIndex]} (Key #${currentKeyIndex}):`, errorMsg);

            if (isRateLimit) {
                // Mark this specific model combo as "cooled down" for 1 minute
                MODEL_COOLDOWNS.set(cooldownKey, Date.now() + COOLDOWN_MS);
            } else if (isNotFound) {
                // Mark as "cooled down" for much longer if it's 404 (maybe forever for this session)
                MODEL_COOLDOWNS.set(cooldownKey, Date.now() + 3600000); // 1 hour
            }

            // 4. Smart Rotation Strategy

            // Priority 1: Try next model on SAME key
            const switchedModel = rotateToNextModel();

            if (!switchedModel) {
                // Priority 2: If all models on this key failed, switch to NEXT key
                rotateToNextKey();
            }

            // IMPORTANT: Yield to Main Thread to prevent UI Freeze
            // If we hit rate limits (429), ensure we wait a bit longer to be polite
            const waitTime = isRateLimit ? 1500 : 500; // V1.2.7: Tuned delays

            if (onProgress && attempt < maxAttempts - 1) {
                onProgress(isRateLimit ? "API 限額已滿，切換備用線路..." : "連線錯誤，重試中...", Math.min(90, 10 + attempt * 5));
            }

            await new Promise(r => setTimeout(r, waitTime));
        }
    }

    if (onProgress) onProgress("所有嘗試失敗", 0, true);
    console.error(`[Gemini AI] ❌ All ${maxAttempts} attempts failed.`);
    throw lastError || new Error("All API attempts failed.");
};

// Error codes that the UI should recognize
export const AI_ERRORS = {
    BUSY: "API_BUSY",
    QUOTA: "QUOTA_EXCEEDED",
    VISION_FAILED: "VISION_FAILED",
    PARSE_FAILED: "PARSE_FAILED",
    ABORTED: "Operation aborted"
};

// ============================================
// 🔒 PER-USER DAILY AI USAGE LIMITER
// ============================================

const AI_USAGE_KEY = "travelTogether_aiUsage";
const DEFAULT_DAILY_LIMIT = 300; // Configurable: Max AI calls per user per day (V1.3.0: Synced with Server)

/**
 * 📊 Get today's date string (YYYY-MM-DD)
 */
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

/**
 * 📊 Get usage data with real-time tokens (V1.4)
 */
export function getUsageData() {
    const today = getTodayKey();
    try {
        const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
        if (data.date !== today) {
            return { date: today, count: 0, tokens: 0 };
        }
        return {
            date: data.date,
            count: data.count || 0,
            tokens: data.tokens || 0
        };
    } catch {
        return { date: today, count: 0, tokens: 0 };
    }
}

/**
 * ➕ Increment AI usage count and tokens (V1.4)
 */
function incrementUsage(tokens = 0) {
    const usage = getUsageData();
    usage.count++;
    usage.tokens = (usage.tokens || 0) + tokens;
    localStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));

    // Broadcast update for real-time UI
    window.dispatchEvent(new CustomEvent('AI_USAGE_UPDATED', { detail: usage }));

    console.log(`[AI Limiter] Usage: ${usage.count} calls, ${usage.tokens} tokens today`);
    return usage;
}

export function checkAIUsageLimit() {
    const usage = getUsageData();
    let limit = DEFAULT_DAILY_LIMIT;
    try {
        const settings = JSON.parse(localStorage.getItem("travelTogether_settings") || "{}");
        if (settings.userGeminiLimit) {
            const parsed = parseInt(settings.userGeminiLimit);
            if (!isNaN(parsed) && parsed > 0) limit = parsed;
        }
    } catch (e) { }

    return {
        used: usage.count,
        total: limit,
        tokens: usage.tokens,
        remaining: Math.max(0, limit - usage.count),
        allowed: usage.count < limit
    };
};

/**
 * 🔄 Reset AI usage (for testing/admin)
 */
export function resetAIUsage() {
    localStorage.removeItem(AI_USAGE_KEY);
    console.log("[AI Limiter] Usage reset");
}


// 🌍 Real-world Grounding Data (based on recent 2025 search results/Reddit)
const REAL_WORLD_GROUNDING = {
    "Osaka": {
        tips: [
            "Expo 2025 is happening; book popular restaurants (Matsusakagyu Yakiniku) 1 month early.",
            "Stay near Kuromon Market or Midosuji Line for best access.",
            "Shinsekai Kushikatsu Ittoku is a local favorite in Dotonbori."
        ],
        hiddenGems: [
            "Nakazakicho: Vintage shops and quiet cafes near Umeda.",
            "Kitahama: Elegant riverside cafes and evening bars.",
            "Senkoji Heaven and Hell Temple: Unique, non-touristy temple experience."
        ],
        food: ["Mugito Mensuke (Ramen - queue early!)", "Sakae Zushi (Umeda 150-yen sushi)", "Tsuruhashi Fugetsu (Mochi/Cheese Okonomiyaki)"]
    },
    "Tokyo": {
        tips: ["Azabudai Hills is the new 2024-2025 hotspot with amazing free views.", "Use Suica on iPhone for easiest transport."],
        hiddenGems: ["Shimokitazawa: Thrift shopping capital.", "Yanaka Ginza: Old Tokyo 'Shitamachi' vibes."],
        food: ["Gyukatsu Motomura (still viral, go to less popular branches)", "Tsujihan (Seafood bowl)"]
    }
};

/**
 * 🚀 Vision-First Approach: Send image directly to Jarvis (Gemini)
 * Skips Tesseract OCR for better accuracy
 * @param {File} file - Image file to parse
 * @param {Object} context - Trip context (city, date, currency)
 * @returns {Promise<Array>} Parsed itinerary items
 */
export async function parseImageDirectly(file, context = {}, userId = null) {
    if (!file) return [];

    try {
        // Convert file to base64 once
        const base64Data = await fileToBase64(file);

        // Define the API call task
        const apiTask = async (model) => {
            const prompt = `You are Jarvis, an Advanced Travel Document Parser using Vision capabilities. Analyze this image and extract travel information with extreme precision.

=== YOUR TASK ===
Extract ALL confirmed travel details. This could be:
- Flight tickets / Boarding passes
- Hotel booking confirmations
- Restaurant reservations
- Train/Bus tickets
- Attraction entry tickets

=== CONTEXT ===
Destination: ${context.city || "Unknown"}
Travel Date: ${context.date || "Unknown"} (Use this year if year is missing)

=== CRITICAL PARSING RULES ===
1. **Dates**: Format strictly as YYYY-MM-DD. If year is missing, infer from context or use current/next year logic.
2. **Times**: Format strictly as HH:MM (24-hour).
3. **Filtering**: IGNORE all UI buttons ("Back", "Share"), ads, map captions, and random page numbers.
4. **Flights**: Capture Departure AND Arrival times, Terminals, and Flight Number (e.g., CX123).
5. **Hotels**: Capture Check-in AND Check-out dates. Name should be the Hotel Name only (e.g., "APA Hotel Shinjuku" NOT "APA Hotel Shinjuku 1 Night").

=== OUTPUT FORMAT (JSON ONLY) ===
Return a valid JSON object. Do not include markdown fencing (\`\`\`json).
{
  "itinerary": [
    {
      "name": "Clear Name (e.g. flight number or place name)",
      "time": "HH:MM",
      "endTime": "HH:MM (optional)",
      "type": "flight|transport|food|spot",
      "details": {
        "location": "Address/Airport/Terminal",
        "flightNumber": "CX100",
        "seat": "12A",
        "price": "Currency + Amount",
        "desc": "Any useful notes (booking ref, etc.)"
      },
      "confidence": 0.8  (0.0-1.0)
    }
  ],
  "accommodation": [
    {
      "name": "Hotel Name",
      "checkIn": "YYYY-MM-DD",
      "checkOut": "YYYY-MM-DD",
      "details": {
        "address": "Full Address",
        "bookingRef": "XYZ123",
        "roomType": "Double Room"
      },
      "confidence": 0.8
    }
  ]
}

If no travel info is visible, return { "itinerary": [], "accommodation": [] }.`;

            // Send to Gemini
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: file.type || "image/jpeg",
                        data: base64Data,
                    },
                },
                { text: prompt }
            ]);

            const response = await result.response;
            const text = response.text();

            // Clean and Parse
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        };

        // Execute with Smart Retry
        const parsed = await callWithSmartRetry("TicketAnalysis", apiTask, 'high', null, null, userId);

        // Transform to unified format
        const items = [];

        if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
            parsed.itinerary.forEach(item => {
                items.push({
                    ...item,
                    id: `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    currency: context.currency || 'HKD',
                    category: 'itinerary',
                    visionParsed: true
                });
            });
        }

        if (parsed.accommodation && Array.isArray(parsed.accommodation)) {
            parsed.accommodation.forEach(item => {
                items.push({
                    ...item,
                    id: `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'hotel',
                    currency: context.currency || 'HKD',
                    category: 'accommodation',
                    visionParsed: true
                });
            });
        }

        console.log("[Gemini Vision] Parsed items:", items);
        return items;

    } catch (error) {
        console.error("[Gemini Vision] Error:", error);

        // If it's one of our specific error codes, propagate it directly
        if (Object.values(AI_ERRORS).includes(error.message)) {
            throw error;
        }

        throw new Error(AI_ERRORS.VISION_FAILED + ": " + (error.message || "Unknown error"));
    }
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/**
 * 使用 Jarvis (Gemini) 解析 OCR 原始文字並結構化
 * @param {string} rawText OCR 識別出的原始文字
 * @returns {Promise<Array>} 解析後的行程項目列表
 */
export async function parseItineraryWithAI(rawText, context = {}, userId = null) {
    if (!rawText || rawText.length < 10) return [];

    const apiTask = async (model) => {
        const prompt = `
You are a STRICT Travel Itinerary Parser API.
Your task is to extract ONLY meaningful travel items from messy OCR text.

OCR TEXT:
"""
${rawText}
"""

CONTEXT:
City: ${context.city || "Unknown"}
Date: ${context.date || "Unknown"}

=== CRITICAL FILTERING RULES ===
YOU MUST AGGRESSIVELY FILTER OUT:
1. Date fragments like "112月31日週三", "2024-12-31", standalone dates
2. Room type descriptions like "無煙經濟型雙人房", "1間", "地圖"
3. Booking reference numbers, confirmation codes
4. Page info like "第1頁", "Page 2/5"
5. Random numbers, coordinates, garbled text
6. Platform UI text like "查看地圖", "更多詳情", buttons
7. Fragments less than 3 meaningful Chinese characters
8. Repeated/similar entries - keep only ONE unique item

=== ITEM CATEGORIZATION ===
Return items in TWO categories:
1. "itinerary" - Actual places to visit: restaurants, attractions, stations, airports
2. "accommodation" - Hotels, hostels, BnBs (with check-in/out info if available)

For hotels/accomodation, extract:
- Hotel name (clean, without room type)
- Check-in/Check-out dates if visible
- Location/area

=== OUTPUT FORMAT ===
Return a PURE JSON object (no markdown):
{
  "itinerary": [
    {
      "name": "Clean Place Name",
      "time": "HH:MM or null",
      "type": "spot|food|transport|flight",
      "details": { "desc": "Brief description", "location": "Area" },
      "confidence": 0.0-1.0
    }
  ],
  "accommodation": [
    {
      "name": "Hotel Clean Name",
      "checkIn": "YYYY-MM-DD or null",
      "checkOut": "YYYY-MM-DD or null",
      "details": { "location": "區域", "roomType": "房型 if found" },
      "confidence": 0.0-1.0
    }
  ]
}

If NO valid items found, return: { "itinerary": [], "accommodation": [] }
DO NOT invent items. Only return what you can confidently extract.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup Markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    };

    try {
        const parsed = await callWithSmartRetry("TicketAnalysis", apiTask, 'high', null, null, userId);

        // Transform to unified format with category tags
        const items = [];

        // Add itinerary items
        if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
            parsed.itinerary.forEach(item => {
                items.push({
                    ...item,
                    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    currency: context.currency || 'HKD',
                    category: 'itinerary',
                    aiParsed: true
                });
            });
        }

        // Add accommodation items
        if (parsed.accommodation && Array.isArray(parsed.accommodation)) {
            parsed.accommodation.forEach(item => {
                items.push({
                    ...item,
                    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'hotel',
                    currency: context.currency || 'HKD',
                    category: 'accommodation',
                    aiParsed: true
                });
            });
        }

        return items;

    } catch (error) {
        console.error("Gemini Parsing Error:", error);

        // If it's one of our specific error codes, propagate it directly
        if (Object.values(AI_ERRORS).includes(error.message)) {
            throw error;
        }

        throw new Error(AI_ERRORS.PARSE_FAILED + ": " + (error.message || "Unknown error"));
    }
}

/**
 * 清理 OCR 常見格式錯誤 + 垃圾過濾 (本地快速修復)
 * @param {string} text 
 */
export function cleanupOCRText(text) {
    if (!text) return "";

    // Junk patterns to remove completely
    const junkPatterns = [
        /第?\d+頁/g,                              // 第1頁, 1頁
        /page\s*\d+/gi,                           // Page 1
        /\d+\/\d+/g,                              // 1/5
        /查看地圖/g,                              // Platform UI
        /更多詳情/g,
        /顯示更多/g,
        /收起/g,
        /^\d{1,2}間$/gm,                          // 1間, 12間
        /^地圖$/gm,                               // 地圖
        /^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/gm,     // Standalone dates
        /^\d{1,2}月\d{1,2}日.*?週[一二三四五六日]$/gm, // 12月31日 週三
        /無煙經濟型[雙單]人房/g,                  // Room types
        /標準[雙單]人房/g,
        /豪華[雙單]人房/g,
        /^\s*[oO0]\s*\[/gm,                       // o [... OCR garbage
        /之\s*\d+\s*[一上了必]/g,                 // Random OCR fragments
    ];

    let cleaned = text;
    junkPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    return cleaned
        .replace(/(\d)\s+(\d)/g, "$1$2")                         // "20 24" -> "2024"
        .replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, "$1$2") // "無 煙" -> "無煙"
        .replace(/\s*[:：]\s*/g, ":")                            // "12 : 00" -> "12:00"
        .split('\n')
        .filter(line => line.trim().length > 3)                  // Remove short lines
        .join('\n')
        .trim();
}

/**
 * 本地驗證過濾 - 確保 AI 返回結果中無垃圾
 * @param {Array} items 
 */
export function filterJunkItems(items) {
    if (!Array.isArray(items)) return [];

    // Normalize function: remove all spaces for matching
    const normalize = (str) => str?.replace(/\s+/g, '').toLowerCase() || '';

    // Junk keywords (will match even with spaces in original text)
    const junkKeywords = [
        // Room types
        '經濟型', '標準型', '豪華型', '雙人房', '單人房', '無煙', '禁煙', '三人房', '家庭房',
        // UI elements
        '地圖', '更多', '收起', '查看', '確認', '取消', '詳情', '顯示',
        '訂房', '付款', '登入', '註冊', '頁', '返回', '下一步',
        // Date fragments
        '月日週', '週一', '週二', '週三', '週四', '週五', '週六', '週日',
        // Garbage fragments
        '間地圖', '人房', '之74', '品0', '鳥丸品'
    ];

    // Regex patterns for junk (will be tested on normalized text)
    const junkPatterns = [
        /^o?\[?\d{1,3}月\d{1,2}日/,      // o[112月31日, 12月31日
        /^\d{4}年?\d{1,2}月/,            // 2024年12月, 202412月
        /^之\d+/,                         // 之74... (any prefix starting with 之 + number)
        /^[oO0]\s*\[/,                    // o [
        /^\d+間/,                          // 1間...
        /^page\d+$/i,                      // page1
        /^第\d+頁$/,                       // 第1頁
        /^\d+\/\d+$/,                      // 1/5
        /^[，,。.、:：]+$/,                 // Pure punctuation
        /^\d+人$/,                         // 2人, 4人
        /品\d+$/,                          // ends with 品0, 品1
        /^[\d\u4e00-\u9fa5]{1,2}\d[\u4e00-\u9fa5]/, // Pattern like 之74一 (char + number + char mix)
    ];

    // Check if name looks like random OCR garbage
    const looksLikeGarbage = (name) => {
        const normalized = normalize(name);
        // Has random number in middle of Chinese text
        if (/[\u4e00-\u9fa5]\d+[\u4e00-\u9fa5]/.test(normalized)) {
            // Exception: valid patterns like "Day1" or "第1天"
            if (!/day\d|第\d天|第\d日/i.test(normalized)) {
                return true;
            }
        }
        // Very short with mixed number/char
        if (normalized.length < 5 && /\d/.test(normalized) && /[\u4e00-\u9fa5]/.test(normalized)) {
            return true;
        }
        // Has suspicious OCR error patterns
        if (/[一上了必]/.test(normalized) && /\d/.test(normalized)) {
            return true;
        }
        return false;
    };

    return items.filter(item => {
        if (!item.name) return false;

        // Normalize the name (remove all spaces)
        const normalizedName = normalize(item.name);

        // Too short after normalization
        if (normalizedName.length < 3) return false;

        // Filter if name is mostly numbers/punctuation
        if (/^[\d\s.,:：/\-\[\]（）()]+$/.test(item.name)) return false;

        // Check junk keywords on normalized text
        if (junkKeywords.some(kw => normalizedName.includes(normalize(kw)))) return false;

        // Check junk patterns on normalized text
        if (junkPatterns.some(pattern => pattern.test(normalizedName))) return false;

        // Heuristic: looks like OCR garbage
        if (looksLikeGarbage(normalizedName)) return false;

        // Filter if confidence too low
        if (item.confidence && item.confidence < 0.5) return false;

        return true;
    });
}

// ===========================================
// 🤖 REAL JARVIS (GEMINI) AI FUNCTIONS
// ===========================================

/**
 * 🚀 Generate itinerary suggestions using real Gemini API
 * @param {Object} params - Parameters for itinerary generation
 * @returns {Promise<Object>} Generated itinerary data
 */
export async function generateItineraryWithGemini({
    city,
    days = 3,
    preferences = [],
    existingItinerary = {},
    visitedPlaces = [],
    budget = 'mid',
    travelStyle = 'balanced',
    userId = null
}) {
    const prompt = `你係一個專業嘅香港旅遊領隊 Jarvis。請為 ${city} 生成一個詳細嘅 ${days} 日行程。
        
=== 用戶偏好 ===
預算: ${budget} (budget/mid/luxury)
行程節奏: ${travelStyle} (relaxed/balanced/packed)
興趣: ${preferences.join(', ') || '一般觀光'}
去過嘅地方 (唔好再去): ${visitedPlaces.join(', ') || '冇'}

=== 🌍 REAL-WORLD SEARCH INSIGHTS (Grounding) ===
${JSON.stringify(REAL_WORLD_GROUNDING[Object.keys(REAL_WORLD_GROUNDING).find(k => city.includes(k))] || 'Use latest 2025 travel trends and traveler reddit opinions')}

=== EXISTING ITINERARY ===
${Object.keys(existingItinerary).length > 0
            ? JSON.stringify(existingItinerary, null, 2)
            : 'No existing plans - start fresh'}

=== 核心要求 ===
1. 語言: 必須使用繁體中文 (香港粵語風格，例如講「去邊度」、「食乜嘢」)。
2. 生成完整行程: 必須包含足夠 ${days} 日嘅活動。
3. 絕不重覆: 成個行程嘅景點、餐廳、商店必須 UNIQUE。絕對唔好去返「去過嘅地方」。
4. 智能交通: 每兩個景點/餐廳之間必須提供一個 type: "transport" 嘅 item。
5. 交通數據: 每個 transport item 必須喺 details 填寫: 
   - distance: 距離 ( e.g. "1.2km" )
   - duration: 車程/步程時間 ( e.g. "15min" )
   - steps: 如果係行路，請提供大概步數 ( e.g. 1500，1km 約 1300 步 )
6. 交通邏輯: 根據 ${travelStyle} 偏好。如果距離 <1km，優先建議行路。
7. 真實數據: 優先使用 2025 最新數據，避開太多遊客嘅地點。
8. 預算預估: budget 必須係成個 trip 嘅「總花費預估」(Total Trip Budget)，唔好只係單日。
9. 航班與酒店: 如果用戶有提供 Flight/Hotel Info，請將佢哋放入行程對應時間。
10. 互動交通選項: 每項 transport item 必須包含 options (唔同嘅交通方式供選擇)。

=== OUTPUT FORMAT (JSON ONLY) ===
{
    "itinerary": [
        {
            "day": 1,
            "date": "YYYY-MM-DD",
            "items": [
                {
                    "id": "unique-id",
                    "time": "09:00",
                    "endTime": "10:30",
                    "name": "Activity Name",
                    "type": "spot|food|transport|hotel",
                    "cost": 500,
                    "currency": "JPY",
                    "details": {
                        "location": "Area name",
                        "address": "Full address",
                        "desc": "Description",
                        "insight": "Pro tip",
                        "duration": "1.5h",
                        "openingHours": "09:00-18:00"
                    }
                }
            ]
        }
    ],
    "transport": [
        { "type": "metro", "name": "Metro Day Pass", "price": "JPY 600", "recommended": true, "desc": "Best value for tourists" }
    ],
    "budget": {
        "total": 15000,
        "currency": "JPY",
        "breakdown": [
            { "label": "Food", "percent": 35, "amt": 5250 },
            { "label": "Transport", "percent": 15, "amt": 2250 },
            { "label": "Attractions", "percent": 25, "amt": 3750 },
            { "label": "Shopping", "percent": 25, "amt": 3750 }
        ]
    },
    "tips": ["Tip 1", "Tip 2"]
}`;

    try {
        // Use smart retry with model rotation
        return await callWithSmartRetry("Itinerary", async (model) => {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Invalid response format");
        });
    } catch (error) {
        console.error("[Gemini AI] Itinerary generation error:", error);

        // Graceful fallback for Quota/Service errors
        if (error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('quota')) {
            console.warn("[Gemini AI] All models exhausted. Returning fallback itinerary.");
            return {
                itinerary: [],
                budget: { total: 0, spending_breakdown: [] },
                tips: ["Jarvis 限額已用完，請稍後再試。"]
            };
        }
        throw error;
    }
}

/**
 * 🚇 Suggest transport between two spots using Gemini
 * @param {Object} params - From/To locations and city context
 * @returns {Promise<Object>} Transport suggestions
 */
export async function suggestTransportBetweenSpots({
    fromLocation,
    toLocation,
    city,
    time = null,
    preference = 'public',
    userId = null
}) {
    const apiTask = async (model) => {
        const prompt = `You are a local transport expert for ${city}. Suggest the best way to travel between two locations.

=== JOURNEY ===
From: ${fromLocation}
To: ${toLocation}
Time: ${time || 'Flexible'}
Preference: ${preference} (public/taxi/walking)

=== REQUIREMENTS ===
1. Provide 2-3 transport options
2. Include realistic prices in local currency
3. Estimate travel duration (e.g. "15min")
4. Consider traffic/rush hour if time specified
5. Include walking option if distance <1km

=== OUTPUT FORMAT (JSON ONLY) ===
{
    "recommended": {
        "mode": "metro|bus|taxi|walking|train",
        "name": "Line/Route Name (e.g. JR Yamanote Line)",
        "cost": 200,
        "currency": "JPY",
        "duration": "15min",
        "steps": ["Walk to Station A", "Take Line B to Station C", "Walk 5min to destination"],
        "tip": "Use IC card for convenience"
    },
    "alternatives": [
        {
            "mode": "taxi",
            "name": "Taxi/Uber",
            "cost": 1500,
            "currency": "JPY",
            "duration": "10min",
            "note": "Good option if sharing with group"
        }
    ],
    "walkable": true,
    "walkingTime": "25min",
    "distance": "1.8km"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid response format");
    };

    return await callWithSmartRetry("TransportSuggest", apiTask, 'low', null, null, userId);
}

/**
 * 🗺️ Get location details and coordinates using Gemini
 * @param {string} placeName - Name of the place
 * @param {string} city - City context
 * @returns {Promise<Object>} Location details with coordinates
 */
export async function getLocationDetails(placeName, city, userId = null) {
    const apiTask = async (model) => {
        const prompt = `Provide location details for "${placeName}" in ${city}.

=== OUTPUT FORMAT (JSON ONLY) ===
{
    "name": "Official Name",
    "address": "Full address in local language",
    "addressEn": "Full address in English",
    "area": "District/Area name",
    "coordinates": {
        "lat": 35.6762,
        "lng": 139.6503
    },
    "googleMapsUrl": "https://maps.google.com/?q=...",
    "nearestStation": "Station Name (5min walk)",
    "openingHours": "09:00-17:00 (Closed Mondays)",
    "phone": "+81-XXX-XXX",
    "website": "https://...",
    "tips": ["Tip 1", "Tip 2"]
}

If the place doesn't exist or you're unsure, set coordinates to null.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid response format");
    };

    try {
        return await callWithSmartRetry("Itinerary", apiTask, 'high', null, null, userId);
    } catch (error) {
        console.error("[Gemini AI] Location details error:", error);
        return {
            name: placeName,
            address: null,
            coordinates: null,
            error: error.message
        };
    }
}

/**
 * 🧠 General purpose Jarvis chat for travel questions
 * @param {string} question - User's question
 * @param {Object} context - Trip context
 * @returns {Promise<string>} AI response
 */
export async function askTravelAI(question, context = {}, userId = null, signal = null, onProgress = null) {
    const apiTask = async (model) => {
        const prompt = `You are a helpful travel assistant. Answer the following travel question.

=== TRIP CONTEXT ===
Destination: ${context.city || 'Unknown'}
Dates: ${context.startDate || 'Unknown'} to ${context.endDate || 'Unknown'}
Budget: ${context.budget || 'Mid-range'}

=== USER QUESTION ===
${question}

=== INSTRUCTIONS ===
1. Be concise but helpful
2. Provide practical, actionable advice
3. Include specific recommendations when relevant
4. Use local currency for prices
5. Respond in the same language as the question (Chinese/English)`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    };

    try {
        // Pass signal and onProgress correctly
        return await callWithSmartRetry("Chat", apiTask, 'high', onProgress, signal, userId);
    } catch (error) {
        console.error("[Gemini AI] Chat error:", error);
        throw error;
    }
}

/**
 * 🛍️ Generate shopping suggestions using Gemini (Destination-Aware)
 * @param {string} city - Destination city
 * @param {Array} categories - Shopping categories (food, cosmetic, fashion, etc.)
 * @param {Object} tripContext - Optional trip context (country, dates)
 * @returns {Promise<Array>} Shopping suggestions
 */
export async function generateShoppingWithGemini(city, categories = [], tripContext = {}, userId = null) {
    // Get grounding data if available
    const grounding = REAL_WORLD_GROUNDING[city] || {};
    const country = tripContext.country || "";

    const prompt = `You are a local shopping expert for ${city}${country ? `, ${country}` : ''}. Generate practical shopping recommendations.

=== LOCAL KNOWLEDGE ===
${grounding.tips ? `Tips: ${grounding.tips.join('; ')}` : ''}
${grounding.food ? `Local Food: ${grounding.food.join(', ')}` : ''}

=== PREFERENCES ===
Categories: ${categories.length > 0 ? categories.join(', ') : 'All categories'}

=== REQUIREMENTS ===
1. Provide 10-15 specific product recommendations
2. Include actual shop/brand names locals would know (e.g., Don Quijote, Matsumoto Kiyoshi, Bic Camera)
3. Give realistic prices in local currency
4. Focus on items unique to ${city} or significantly cheaper there
5. Include where to buy (department store, drugstore, etc.)
6. Prioritize items tourists typically want: snacks, cosmetics, electronics, souvenirs

=== OUTPUT FORMAT (JSON ONLY) ===
[
    {
        "name": "Product Name (e.g. 白色戀人巧克力)",
        "type": "food|cosmetic|fashion|electronics|medicine|souvenir",
        "estPrice": "JPY 1,500",
        "desc": "Brief description of why this is worth buying",
        "whereToBuy": "Don Quijote, Airport, Department stores",
        "reason": "Why tourists should buy this",
        "aiSuggested": true
    }
]`;

    try {
        return await callWithSmartRetry("ShoppingList", async (model) => {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Invalid response format");
        }, 'low', null, null, userId);
    } catch (error) {
        console.error("[Gemini AI] Shopping generation error:", error);

        // Graceful fallback for Quota/Service errors
        if (error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('quota')) {
            console.warn("[Gemini AI] All models exhausted. Returning fallback shopping list.");
            return [
                { name: "API 限額已用完", type: "souvenir", estPrice: "--", desc: "暂時無法生成建議，請稍後再試", whereToBuy: "--", reason: "Jarvis 超出使用量", aiSuggested: false }
            ];
        }
        throw error;
    }
}

/**
 * 🧳 Generate packing list using Gemini
 * @param {Object} trip - Trip details (city, dates, activities)
 * @param {Object} weather - Weather data
 * @returns {Promise<Array>} Packing suggestions
 */
export async function generatePackingList(trip, weather = {}, userId = null) {
    // Extract activities from itinerary
    const activities = [];
    if (trip.itinerary) {
        Object.values(trip.itinerary).forEach(dayItems => {
            if (Array.isArray(dayItems)) {
                dayItems.forEach(item => {
                    if (item.type) activities.push(item.type);
                    if (item.name) activities.push(item.name);
                });
            }
        });
    }

    const prompt = `You are a travel packing expert. Generate a smart packing list for a trip to ${trip.city || 'Unknown'}.

=== TRIP DETAILS ===
Destination: ${trip.city}, ${trip.country}
Dates: ${trip.startDate} to ${trip.endDate}
Weather: ${weather.temp || '--'}, ${weather.desc || 'Unknown'}
Activities: ${activities.slice(0, 10).join(', ') || 'General sightseeing'}

=== REQUIREMENTS ===
1. Organize by category (documents, clothes, electronics, toiletries, medicine, accessories)
2. Consider weather and planned activities
3. Flag essential items
4. Include practical items often forgotten
5. Consider local customs/culture

=== OUTPUT FORMAT (JSON ONLY) ===
[
    {
        "name": "Item name (e.g. 護照)",
        "category": "documents|clothes|electronics|toiletries|medicine|accessories",
        "essential": true,
        "reason": "Why needed for this trip",
        "aiSuggested": true
    }
]`;

    try {
        return await callWithSmartRetry("PackingList", async (model) => {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return Array.from(new Set(activities));
        }, 'low', null, null, userId);
    } catch (error) {
        console.error("[Gemini AI] Packing generation error:", error);

        // Graceful fallback for Quota/Service errors
        if (error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('quota')) {
            console.warn("[Gemini AI] All models exhausted. Returning fallback packing list.");
            return [
                { name: "API 暂時無法使用", category: "documents", essential: false, reason: "Jarvis 限額已用完，請稍後再試", aiSuggested: false }
            ];
        }
        throw error;
    }
}

/**
 * 🌦️ Generate a smart weather summary with clothing advice
 * @param {string} city - Destination city
 * @param {Object} rawWeatherData - Raw data from Open-Meteo or similar
 * @returns {Promise<Object>} Detailed weather summary
 */
export async function generateWeatherSummaryWithGemini(city, rawWeatherData = {}, userId = null) {
    try {
        const prompt = `你係一個旅遊天氣專家。請根據提供嘅原始數據，為 ${city} 生成一個詳細嘅天氣與穿著建議。

=== 原始數據 ===
${JSON.stringify(rawWeatherData, null, 2)}

=== 要求 ===
1. 語言: 繁體中文 (香港粵語風格)。
2. 提供今日嘅最高、最低氣溫。
3. 提供「早晨」、「下晝」、「夜晚」三個時段嘅具體微氣候感受。
4. 提供每個時段嘅「穿著建議」(例如：早晚大溫差要洋蔥式穿法)。
5. 提供一個「智能貼士」(例如：洗唔洗帶遮、乾唔乾燥)。

=== OUTPUT FORMAT (JSON ONLY) ===
{
    "city": "${city}",
    "tempRange": { "max": 15, "min": 5, "unit": "°C" },
    "periods": {
        "morning": { "desc": "微涼有太陽", "temp": "8°C", "outfit": "長袖加上薄外套" },
        "afternoon": { "desc": "溫暖舒適", "temp": "15°C", "outfit": "可以除咗外套，單穿長袖" },
        "night": { "desc": "寒冷乾燥", "temp": "5°C", "outfit": "必須著返厚羽絨同圍巾" }
    },
    "summary": "今日溫差大，記得帶件易著易除嘅外套，下晝會好曬注意防曬。",
    "overallOutfit": "洋蔥式穿法 (Onion Layering)"
}`;

        const response = await callWithSmartRetry("WeatherSummary", async (model) => {
            const res = await model.generateContent(prompt);
            return res.response.text();
        }, 'high', null, null, userId);
        const text = response;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Invalid response format");
    } catch (error) {
        console.error("[Gemini AI] Weather summary error:", error);

        // Graceful fallback for Quota/Service errors
        if (error.message.includes('429') || error.message.includes('503')) {
            console.warn("[Gemini AI] Quota exceeded or service busy. Returning fallback.");
            return {
                city: city,
                tempRange: { max: "--", min: "--", unit: "°C" },
                periods: {
                    morning: { desc: "系統繁忙", temp: "--", outfit: "Jarvis 暫時休息中，請稍後再試" },
                    afternoon: { desc: "系統繁忙", temp: "--", outfit: "Jarvis 暫時休息中，請稍後再試" },
                    night: { desc: "系統繁忙", temp: "--", outfit: "Jarvis 暫時休息中，請稍後再試" }
                },
                summary: "由於使用人數眾多，Jarvis 天氣預報暫時無法使用 (Quota Exceeded)。請過一陣再試。",
                overallOutfit: "暫無建議"
            };
        }
        throw error;
    }
}

/**
 * 🏷️ AI Trip Naming: Generate a catchy trip name based on destination and dates
 * @param {Object} trip - Trip object with destination, startDate, cities
 * @returns {Promise<string>} A creative trip name
 */
export async function generateTripName(trip, userId = null) {
    try {
        const destination = trip.city || trip.cities?.[0] || trip.country || "Unknown";
        const country = trip.country || "";
        const startDate = trip.startDate || "";

        // Determine season from startDate
        let season = "";
        if (startDate) {
            const month = new Date(startDate).getMonth() + 1;
            if (month >= 3 && month <= 5) season = "Spring";
            else if (month >= 6 && month <= 8) season = "Summer";
            else if (month >= 9 && month <= 11) season = "Autumn";
            else season = "Winter";
        }

        const prompt = `You are a creative travel naming expert. Generate ONE short, catchy trip name.

=== TRIP INFO ===
Destination: ${destination}, ${country}
Season: ${season}
Start Date: ${startDate}

=== REQUIREMENTS ===
1. Be creative but concise (2-5 words max)
2. Capture the essence of the destination or season
3. Use local cultural references when possible
4. Examples: "Tokyo Sakura Escape", "Osaka Foodie Run", "Winter Hokkaido Bliss"

=== OUTPUT ===
Return ONLY the trip name, nothing else. No quotes, no explanation.`;

        const text = await callWithSmartRetry("TripName", async (model) => {
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        }, 'low', null, null, userId);

        // Clean up any quotes or extra formatting
        return text.replace(/['"]/g, '').trim();
    } catch (error) {
        console.error("[Gemini AI] Trip naming error:", error);
        // Fallback to simple name
        const city = trip.city || trip.cities?.[0] || "Adventure";
        return `${city} Trip`;
    }
}


/**
 * 🚀 Analyze a specific day's itinerary for feasibility, tips, and transport.
 * @param {Object} params
 * @returns {Promise<Object>} Analysis result
 */
export async function generateDailyAnalysis({
    city,
    date,
    items = [],
    weather = null,
    userId = null
}) {
    const prompt = `你係一個專業嘅香港旅遊領隊 AI。請分析以下這一天嘅行程，並提供實用建議。

=== 背景資料 ===
城市: ${city}
日期: ${date}
天氣: ${weather ? `${weather.temp}, ${weather.desc}` : '未知'}

=== 當日行程 ===
${items.map((i, idx) => `${idx + 1}. [${i.time || '??:??'}] ${i.name} (${i.details?.location || '未知地點'})`).join('\n')}

=== 分析要求 (必須使用繁體中文/廣東話) ===
1. **行程合理性檢查**:
   - 景點之間係咪太趕？
   - 有冇漏咗食飯時間？
   - 景點開放時間有冇問題？
2. **交通建議**:
   - 根據景點分佈，推薦最抵嘅交通券 (Day Pass)。
   - 跨區移動係咪需要搭特急/新幹線？
3. **貼心提示 (Tips)**:
   - 針對具體景點嘅參觀貼士 (例如：清水寺最好朝早去避人潮)。
   - 天氣相關嘅衣著或帶遮建議。

=== OUTPUT FORMAT (JSON ONLY) ===
{
    "tips": [
        "建議 1 (e.g. 清水寺建議 08:00 前到達)",
        "建議 2 (e.g. 中午未安排午餐，建議在 X 區用餐)",
        "建議 3 (e.g. 今日落雨，記得帶遮)"
    ],
    "transport": [
        {
            "id": "trans-1",
            "type": "metro|bus|pass",
            "name": "推薦交通券名稱 (e.g. 大阪周遊卡)",
            "price": "預估價格 (e.g. JPY 2800)",
            "desc": "推薦原因",
            "recommended": true
        }
    ],
    "warnings": [
        "警告 1 (e.g. 景點 A 與 B 距離太遠，交通需時 1 小時)"
    ]
}`;

    const apiTask = async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    };

    try {
        return await callWithSmartRetry("DailyAnalysis", apiTask, 'high', null, null, userId);
    } catch (error) {
        console.error("Daily Analysis Error:", error);
        // Fallback mock check
        return {
            tips: ["AI 分析暫時無法使用，請稍後再試。", "建議檢查景點開放時間。"],
            transport: [],
            warnings: []
        };
    }
}

// --- 4. Generate Ticket Summary (One-Line Title) ---
export const generateTicketSummary = async (conversationText, onProgress, signal, userId = null) => {
    return callWithSmartRetry(
        "ReportSummary",
        async (model) => {
            const prompt = `
            Task: Summarize the following customer support conversation into a single, concise Ticket Subject (Title).
            Rules:
            1. Output MUST be in TRADITIONAL CHINESE (繁體中文) matching Hong Kong style.
            2. Maximum 15 characters. No quotes.
            3. Ignore polite greetings. Focus on the core issue (e.g. "無法登入", "退款申請", "App閃退").
            4. If the input is just "hi" or greeting, output "新工單".
            
            Conversation:
            ${conversationText.slice(0, 500)}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/['"《》]/g, '');
            incrementUsage(result);
            return text;
        },
        'high',
        onProgress,
        signal,
        userId
    );
};
