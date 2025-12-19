import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

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
 * 🚀 Vision-First Approach: Send image directly to Gemini
 * Skips Tesseract OCR for better accuracy
 * @param {File} file - Image file to parse
 * @param {Object} context - Trip context (city, date, currency)
 * @returns {Promise<Array>} Parsed itinerary items
 */
export async function parseImageDirectly(file, context = {}) {
    if (!file) return [];

    try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);

        // Use Gemini 3 Flash Preview (user's current API model)
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a Travel Document Parser AI. Analyze this image and extract travel information.

=== YOUR TASK ===
Extract ALL useful travel details from this image. This could be:
- A hotel booking confirmation
- A flight/train ticket
- A restaurant reservation
- An itinerary screenshot

=== CONTEXT (if relevant) ===
Destination: ${context.city || "Unknown"}
Travel Date: ${context.date || "Unknown"}

=== CRITICAL RULES ===
1. Extract ONLY actual places, hotels, flights, restaurants
2. IGNORE: UI elements, buttons, page numbers, random fragments
3. Clean up messy text - remove extra spaces in Chinese characters
4. EXTRACT ALL supplementary info visible (price, address, phone, confirmation number, etc.)
5. For flights/transport: extract ALL available details (times, terminals, flight number, airline)
6. Categorize correctly: hotel → accommodation, restaurant → itinerary

=== REQUIRED OUTPUT FORMAT ===
Return ONLY valid JSON (no markdown):
{
  "itinerary": [
    {
      "name": "Place Name (清晰名稱)",
      "time": "HH:MM (departure/start time)",
      "endTime": "HH:MM (arrival/end time, null for spots)",
      "duration": "2h or 30min (estimated duration for spots/activities)",
      "type": "spot|food|transport|flight",
      "details": { 
        "location": "區域/地址",
        "desc": "Brief note or remarks",
        
        "flightNumber": "JX822 (if flight)",
        "airline": "Starlux 星宇航空",
        "departure": "TPE Terminal 1",
        "arrival": "KIX Terminal 2",
        "gate": "B12 (boarding gate if visible)",
        "seat": "12A (seat number)",
        "cabinClass": "Economy/Business/First",
        "baggage": "20kg checked + 7kg cabin (baggage allowance)",
        "passengerName": "CHAN TAI MAN (passport name)",
        "pnr": "ABC123 (6-char booking code)",
        "frequentFlyer": "BR12345678 (miles number)",
        
        "date": "YYYY-MM-DD",
        "price": "HKD 2,000 or null",
        "confirmationNumber": "Booking ref",
        "phone": "+81-XXX",
        
        "openingHours": "09:00-18:00 (for spots)",
        "admissionFee": "JPY 500 adult (entry fee)",
        "reservationNumber": "R12345 (restaurant booking)",
        
        "notes": "Any other visible notes"
      },
      "confidence": 0.0-1.0
    }
  ],
  "accommodation": [
    {
      "name": "Hotel Name Only (no room type)",
      "checkIn": "YYYY-MM-DD or null",
      "checkOut": "YYYY-MM-DD or null", 
      "details": { 
        "location": "區域",
        "address": "Full address if visible",
        "phone": "+81-XXX or null",
        "price": "JPY 15,000/晚 or null",
        "roomType": "雙人房 (if visible)",
        "roomNumber": "1205 (room number if visible)",
        "confirmationNumber": "Booking ref if visible",
        "checkOutTime": "11:00 (checkout time)",
        "guests": "2 adults, 1 child (guest count)",
        "breakfast": "Included 7F restaurant / Not included",
        "wifi": "Password: hotel1234",
        "notes": "Any special notes like early check-in"
      },
      "confidence": 0.0-1.0
    }
  ]
}

If image is unclear or no travel info found, return: { "itinerary": [], "accommodation": [] }`;

        // Send image + prompt to Gemini Vision
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

        // Parse JSON response
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

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
        throw new Error("Vision Parsing Failed: " + error.message);
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
 * 使用 Gemini AI 解析 OCR 原始文字並結構化
 * @param {string} rawText OCR 識別出的原始文字
 * @returns {Promise<Array>} 解析後的行程項目列表
 */
export async function parseItineraryWithAI(rawText, context = {}) {
    if (!rawText || rawText.length < 10) return [];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const parsed = JSON.parse(jsonStr);

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
        throw new Error("AI Parsing Failed: " + error.message);
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
// 🤖 REAL GEMINI AI FUNCTIONS
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
    travelStyle = 'balanced'
}) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `你係一個專業嘅香港旅遊領隊 AI。請為 ${city} 生成一個詳細嘅 ${days} 日行程。
        
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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Invalid response format");
    } catch (error) {
        console.error("[Gemini AI] Itinerary generation error:", error);
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
    preference = 'public'
}) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a local transport expert for ${city}. Suggest the best way to travel between two locations.

=== JOURNEY ===
From: ${fromLocation}
To: ${toLocation}
Time: ${time || 'Flexible'}
Preference: ${preference} (public/taxi/walking)

=== REQUIREMENTS ===
1. Provide 2-3 transport options
2. Include realistic prices in local currency
3. Estimate travel duration
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
    } catch (error) {
        console.error("[Gemini AI] Transport suggestion error:", error);
        // Fallback to generic suggestion
        return {
            recommended: {
                mode: "metro",
                name: "Public Transport",
                cost: 300,
                currency: "JPY",
                duration: "20min",
                steps: ["Take public transport"],
                tip: "Check local transit app for real-time info"
            },
            alternatives: [],
            walkable: false
        };
    }
}

/**
 * 🗺️ Get location details and coordinates using Gemini
 * @param {string} placeName - Name of the place
 * @param {string} city - City context
 * @returns {Promise<Object>} Location details with coordinates
 */
export async function getLocationDetails(placeName, city) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
 * 🧠 General purpose AI chat for travel questions
 * @param {string} question - User's question
 * @param {Object} context - Trip context
 * @returns {Promise<string>} AI response
 */
export async function askTravelAI(question, context = {}) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    } catch (error) {
        console.error("[Gemini AI] Chat error:", error);
        throw error;
    }
}

/**
 * 🛍️ Generate shopping suggestions using Gemini
 * @param {string} city - Destination city
 * @param {Array} categories - Shopping categories (food, cosmetic, fashion, etc.)
 * @returns {Promise<Array>} Shopping suggestions
 */
export async function generateShoppingWithGemini(city, categories = []) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a local shopping expert for ${city}. Generate practical shopping recommendations.

=== PREFERENCES ===
Categories: ${categories.length > 0 ? categories.join(', ') : 'All categories'}

=== REQUIREMENTS ===
1. Provide 10-15 specific product recommendations
2. Include actual shop/brand names locals would know
3. Give realistic prices in local currency
4. Focus on items unique to ${city} or significantly cheaper there
5. Include where to buy (department store, drugstore, etc.)

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Invalid response format");
    } catch (error) {
        console.error("[Gemini AI] Shopping generation error:", error);
        throw error;
    }
}

/**
 * 🧳 Generate packing list using Gemini
 * @param {Object} trip - Trip details (city, dates, activities)
 * @param {Object} weather - Weather data
 * @returns {Promise<Array>} Packing suggestions
 */
export async function generatePackingList(trip, weather = {}) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return Array.from(new Set(activities));
    } catch (error) {
        console.error("[Gemini AI] Packing generation error:", error);
        throw error;
    }
}

/**
 * 🌦️ Generate a smart weather summary with clothing advice
 * @param {string} city - Destination city
 * @param {Object} rawWeatherData - Raw data from Open-Meteo or similar
 * @returns {Promise<Object>} Detailed weather summary
 */
export async function generateWeatherSummaryWithGemini(city, rawWeatherData = {}) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

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
                    morning: { desc: "系統繁忙", temp: "--", outfit: "AI 暫時休息中，請稍後再試" },
                    afternoon: { desc: "系統繁忙", temp: "--", outfit: "AI 暫時休息中，請稍後再試" },
                    night: { desc: "系統繁忙", temp: "--", outfit: "AI 暫時休息中，請稍後再試" }
                },
                summary: "由於使用人數眾多，AI 天氣預報暫時無法使用 (Quota Exceeded)。請過一陣再試。",
                overallOutfit: "暫無建議"
            };
        }
        throw error;
    }
}
