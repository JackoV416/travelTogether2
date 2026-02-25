/**
 * localOcr.js - V2.1.0 Local OCR Service
 * Uses Tesseract.js for offline-capable text extraction from images.
 * Acts as a fallback when Gemini AI is unavailable or quota is exceeded.
 *
 * Usage:
 *   import { extractTextFromImage, parseOcrTextToItems } from './localOcr';
 *   const text = await extractTextFromImage(file);
 *   const items = parseOcrTextToItems(text, tripContext);
 */

/**
 * Extract raw text from an image file using Tesseract.js (local, no API key needed).
 * @param {File} imageFile - The image file to process.
 * @param {Function} [onProgress] - Optional progress callback (0-100).
 * @returns {Promise<string>} - Extracted text.
 */
export const extractTextFromImage = async (imageFile, onProgress = null) => {
    // Lazy-load Tesseract to avoid bloating initial bundle
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('eng+chi_tra', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(Math.round(m.progress * 100));
            }
        }
    });

    try {
        const { data: { text } } = await worker.recognize(imageFile);
        return text.trim();
    } finally {
        await worker.terminate();
    }
};

/**
 * Parse raw OCR text into structured itinerary items.
 * Best-effort heuristic parser — handles common receipt/itinerary formats.
 * @param {string} rawText - Text extracted by OCR.
 * @param {Object} tripContext - { city, currency, date }
 * @returns {Array} - Array of itinerary item-like objects.
 */
export const parseOcrTextToItems = (rawText, tripContext = {}) => {
    const { city = '', currency = 'HKD', date = new Date().toISOString().split('T')[0] } = tripContext;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];

    // Patterns to detect cost (e.g. HKD 120, $88, ¥500, NT$300, 120.00)
    const costRegex = /(?:HKD|USD|TWD|NT\$|JPY|EUR|GBP|MOP|CNY|SGD|\$|¥|€|£)?\s*(\d{1,6}(?:[.,]\d{1,2})?)/i;
    // Patterns to detect time (e.g. 10:30, 2pm, 14:00)
    const timeRegex = /\b(\d{1,2}[:：]\d{2}|\d{1,2}\s*(?:am|pm))\b/i;

    let currentItem = null;

    for (const line of lines) {
        // Skip very short / noisy lines
        if (line.length < 3) continue;

        const costMatch = line.match(costRegex);
        const timeMatch = line.match(timeRegex);

        // New item heuristic: line without cost, length > 5 chars, starts with upper
        const looksLikeName = !costMatch && line.length > 5 && /^[A-Z\u4e00-\u9fff]/.test(line);

        if (looksLikeName) {
            if (currentItem) items.push(currentItem);
            currentItem = {
                id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: line.slice(0, 60),
                type: detectItemType(line),
                time: timeMatch ? timeMatch[1] : '10:00',
                cost: 0,
                currency,
                details: {
                    location: city || '',
                    desc: `Extracted by Local OCR · ${line}`,
                },
                ocrSource: true,
            };
        } else if (costMatch && currentItem) {
            // Attach cost to the current item
            const rawCost = costMatch[1].replace(',', '');
            currentItem.cost = parseFloat(rawCost) || 0;
        } else if (timeMatch && currentItem) {
            currentItem.time = timeMatch[1];
        }
    }

    if (currentItem) items.push(currentItem);

    // If nothing parsed, return a catch-all item
    if (items.length === 0 && rawText.length > 5) {
        items.push({
            id: `ocr-fallback-${Date.now()}`,
            name: `📎 OCR Scan (${new Date().toLocaleDateString()})`,
            type: 'spot',
            time: '10:00',
            cost: 0,
            currency,
            details: { location: city, desc: rawText.slice(0, 500) },
            ocrSource: true,
            needsManualInput: true,
        });
    }

    return items;
};

/** Heuristic: detect item type from name keywords */
function detectItemType(name) {
    const n = name.toLowerCase();
    if (/hotel|hostel|stay|inn|airbnb|resort|accommodation/i.test(n)) return 'hotel';
    if (/flight|airline|airport|air|機票|航班/i.test(n)) return 'flight';
    if (/restaurant|cafe|coffee|food|eat|din|lunch|宵夜|食|餐/i.test(n)) return 'food';
    if (/museum|temple|park|attraction|tour|sightseeing|景點|博物/i.test(n)) return 'spot';
    if (/train|bus|metro|taxi|transport|mrt|subway|交通|地鐵/i.test(n)) return 'transport';
    if (/shop|mall|market|買|購/i.test(n)) return 'shopping';
    return 'spot';
}
