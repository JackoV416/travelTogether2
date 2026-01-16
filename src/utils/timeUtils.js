/**
 * Time Utilities for Smart Scheduler
 * V1.1 Phase 2: Smart Ripple (Time Cascade)
 */

/**
 * Parse "HH:mm" string to total minutes since midnight
 * @param {string} timeStr - Time in "HH:mm" format
 * @returns {number|null} - Total minutes or null if invalid
 */
export const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
};

/**
 * Format total minutes back to "HH:mm" string
 * @param {number} totalMinutes - Total minutes since midnight
 * @returns {string} - Time in "HH:mm" format
 */
export const formatTime = (totalMinutes) => {
    if (typeof totalMinutes !== 'number' || isNaN(totalMinutes)) return '--:--';
    // Handle negative and overflow (next day)
    let mins = totalMinutes % (24 * 60);
    if (mins < 0) mins += 24 * 60;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in "HH:mm" format
 * @param {number} durationMins - Duration in minutes
 * @returns {string|null} - End time in "HH:mm" format or null
 */
export const calculateEndTime = (startTime, durationMins) => {
    const startMins = parseTime(startTime);
    if (startMins === null || typeof durationMins !== 'number') return null;
    return formatTime(startMins + durationMins);
};

/**
 * Get duration between two times in minutes
 * @param {string} startTime - Start time "HH:mm"
 * @param {string} endTime - End time "HH:mm"
 * @returns {number|null} - Duration in minutes
 */
export const getDuration = (startTime, endTime) => {
    const startMins = parseTime(startTime);
    const endMins = parseTime(endTime);
    if (startMins === null || endMins === null) return null;
    let duration = endMins - startMins;
    // Handle overnight (e.g., 23:00 to 01:00)
    if (duration < 0) duration += 24 * 60;
    return duration;
};

/**
 * Get the time string from an item (checks multiple possible fields)
 * @param {object} item - Itinerary item
 * @returns {string|null} - Time string or null
 */
export const getItemTime = (item) => {
    if (!item) return null;
    return item.details?.startTime || item.details?.time || item.time || null;
};

/**
 * Get item's end time (calculates if not present)
 * @param {object} item - Itinerary item
 * @returns {string|null} - End time or null
 */
export const getItemEndTime = (item) => {
    if (!item) return null;
    // Check explicit end time first
    if (item.details?.endTime) return item.details.endTime;
    // Calculate from duration
    const startTime = getItemTime(item);
    const duration = item.details?.duration || item.duration;
    if (startTime && duration) {
        return calculateEndTime(startTime, parseInt(duration, 10));
    }
    return null;
};

/**
 * Shift an item's times by offset minutes
 * @param {object} item - Itinerary item
 * @param {number} offsetMins - Minutes to shift (positive = later, negative = earlier)
 * @returns {object} - New item with shifted times
 */
export const shiftItemTime = (item, offsetMins) => {
    if (!item || offsetMins === 0) return item;

    const newItem = { ...item, details: { ...item.details } };

    // Shift main time field
    if (newItem.details?.time) {
        const timeMins = parseTime(newItem.details.time);
        if (timeMins !== null) {
            newItem.details.time = formatTime(timeMins + offsetMins);
        }
    }

    // Shift startTime
    if (newItem.details?.startTime) {
        const startMins = parseTime(newItem.details.startTime);
        if (startMins !== null) {
            newItem.details.startTime = formatTime(startMins + offsetMins);
        }
    }

    // Shift endTime
    if (newItem.details?.endTime) {
        const endMins = parseTime(newItem.details.endTime);
        if (endMins !== null) {
            newItem.details.endTime = formatTime(endMins + offsetMins);
        }
    }

    // Also shift top-level time if present
    if (newItem.time) {
        const topTimeMins = parseTime(newItem.time);
        if (topTimeMins !== null) {
            newItem.time = formatTime(topTimeMins + offsetMins);
        }
    }

    return newItem;
};

/**
 * Cascade time shift for all items from a given index
 * @param {array} items - Array of itinerary items
 * @param {number} fromIndex - Start shifting from this index (inclusive)
 * @param {number} offsetMins - Minutes to shift
 * @returns {array} - New array with shifted items
 */
export const cascadeTimeShift = (items, fromIndex, offsetMins) => {
    if (!Array.isArray(items) || offsetMins === 0) return items;

    return items.map((item, idx) => {
        if (idx >= fromIndex) {
            return shiftItemTime(item, offsetMins);
        }
        return item;
    });
};

/**
 * Calculate smart ripple effect after reordering
 * Given a reordered list, calculate what times should be adjusted
 * V1.1 Phase 3: Now supports async travel time lookup
 * @param {array} items - Reordered itinerary items
 * @param {number} movedIndex - Index where item was moved TO
 * @param {number} bufferMins - Min buffer time between items (default 10)
 * @returns {Promise<object>} - { adjustedItems, changesNeeded: boolean, offset }
 */
export const calculateSmartRipple = async (items, movedIndex, bufferMins = 10) => {
    if (!Array.isArray(items) || movedIndex < 0 || movedIndex >= items.length) {
        return { adjustedItems: items, changesNeeded: false, offset: 0 };
    }

    const movedItem = items[movedIndex];
    const prevItem = movedIndex > 0 ? items[movedIndex - 1] : null;

    // Get the expected start time based on previous item + travel time
    let expectedStartMins = null;

    if (prevItem) {
        const prevEndTime = getItemEndTime(prevItem);
        const prevEndMins = parseTime(prevEndTime);

        if (prevEndMins !== null) {
            // V1.1 Phase 3: Get real travel time if possible
            const origin = prevItem.details?.location || prevItem.name;
            const destination = movedItem.details?.location || movedItem.name;

            let travelTime = bufferMins; // Default to buffer

            if (origin && destination && origin !== destination) {
                try {
                    // Lazy import to avoid circular dependency and optimize bundle
                    const { getTransitDuration } = await import('../services/mapsDirections');
                    const mode = movedItem.details?.transportType || 'transit';
                    const duration = await getTransitDuration(origin, destination, mode);
                    travelTime = Math.max(duration, bufferMins);
                    // Smart Ripple calculated time
                } catch (e) {
                    console.warn('[Smart Ripple] Directions API failed, using buffer:', e);
                }
            }

            expectedStartMins = prevEndMins + travelTime;
        } else {
            // If no end time, use start time + default duration (60 min) + buffer
            const prevStartMins = parseTime(getItemTime(prevItem));
            expectedStartMins = prevStartMins !== null ? prevStartMins + 60 + bufferMins : null;
        }
    } else {
        // First item - keep its time
        return { adjustedItems: items, changesNeeded: false, offset: 0 };
    }

    if (expectedStartMins === null) {
        return { adjustedItems: items, changesNeeded: false, offset: 0 };
    }

    // Get current start time of moved item
    const currentStartMins = parseTime(getItemTime(movedItem));
    if (currentStartMins === null) {
        return { adjustedItems: items, changesNeeded: false, offset: 0 };
    }

    // Calculate offset needed
    const offset = expectedStartMins - currentStartMins;

    if (Math.abs(offset) < 2) { // Ignore tiny drifts
        return { adjustedItems: items, changesNeeded: false, offset: 0 };
    }

    // Apply cascade shift from movedIndex onwards
    const adjustedItems = cascadeTimeShift(items, movedIndex, offset);

    return {
        adjustedItems,
        changesNeeded: true,
        offset
    };
};

/**
 * Detect time conflicts and human logic errors in a list of items
 * @param {array} items - Array of itinerary items
 * @param {object} tripContext - Optional trip context (members, country, etc.)
 * @returns {array} - Array of conflict objects { index, type, message }
 */
export const detectTimeConflicts = (items, tripContext = {}) => {
    if (!Array.isArray(items) || items.length === 0) return [];

    // Skip all conflict checks for mock trips
    if (tripContext?.isMock) return [];

    const conflicts = [];
    const groupSize = tripContext?.members?.length || 1;

    let consecutiveTransports = 0;
    let consecutiveSpots = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const prevItem = i > 0 ? items[i - 1] : null;

        // 1. Basic Overlap/Gap Check (compared to previous)
        if (prevItem) {
            const prevEndTime = getItemEndTime(prevItem) || getItemTime(prevItem);
            const currStartTime = getItemTime(item);
            const prevEndMins = parseTime(prevEndTime);
            const currStartMins = parseTime(currStartTime);

            if (prevEndMins !== null && currStartMins !== null) {
                if (currStartMins < prevEndMins) {
                    conflicts.push({
                        index: i,
                        type: 'overlap',
                        message: `時間重疊: ${item.details?.name || item.name || '項目'} 與前一項目時間衝突。`
                    });
                } else if (currStartMins - prevEndMins > 180) {
                    conflicts.push({
                        index: i,
                        type: 'gap',
                        message: `空檔過大: 發現 ${Math.floor((currStartMins - prevEndMins) / 60)} 小時空檔。`
                    });
                }
            }
        }

        // 2. Human Logic: Consecutive Items
        const isTransport = ['transport', 'flight', 'walk', 'train', 'immigration'].includes(item.type);
        const isSpot = ['spot', 'activity', 'food', 'shopping'].includes(item.type);

        if (isTransport) {
            consecutiveTransports++;
            consecutiveSpots = 0;
        } else if (isSpot) {
            consecutiveSpots++;
            consecutiveTransports = 0;
        } else {
            consecutiveTransports = 0;
            consecutiveSpots = 0;
        }

        if (consecutiveTransports >= 3) {
            conflicts.push({
                index: i,
                type: 'logic',
                message: `行程過密: 連續 ${consecutiveTransports} 個交通項目，體力消耗可能較大。`
            });
        }
        if (consecutiveSpots >= 3) {
            conflicts.push({
                index: i,
                type: 'logic',
                message: `漏排交通: 連續 ${consecutiveSpots} 個景點，建議中間加入交通接駁。`
            });
        }

        // 3. Human Logic: Operating Hours (Mocked)
        const startTime = getItemTime(item);
        const startMins = parseTime(startTime);
        if (startMins !== null) {
            const hour = Math.floor(startMins / 60);

            // Graveyard hour check
            if (hour >= 1 && hour < 6) {
                conflicts.push({
                    index: i,
                    type: 'logic',
                    message: `深夜提示: ${item.name} 排在凌晨 ${hour} 點，請確認是否合適。`
                });
            }

            // Type-specific hours check
            if (item.type === 'spot' || item.type === 'activity') {
                if (hour < 9 || hour > 21) {
                    conflicts.push({
                        index: i,
                        type: 'logic',
                        message: `營業時間注意: 景點通常在 09:00 - 21:00 營業。`
                    });
                }
            } else if (item.type === 'shopping') {
                if (hour < 10 || hour > 22) {
                    conflicts.push({
                        index: i,
                        type: 'logic',
                        message: `營業時間注意: 商場通常在 10:00 - 22:00 營業。`
                    });
                }
            }
        }

        // 4. Human Logic: Group Size Check
        if (groupSize > 8 && (item.type === 'food' || (item.name || '').toLowerCase().includes('cafe'))) {
            conflicts.push({
                index: i,
                type: 'logic',
                message: `人數注意: ${groupSize} 人較多，餐廳/Cafe 可能需要提前預約。`
            });
        }
    }

    return conflicts;
};

export default {
    parseTime,
    formatTime,
    calculateEndTime,
    getDuration,
    getItemTime,
    getItemEndTime,
    shiftItemTime,
    cascadeTimeShift,
    calculateSmartRipple,
    detectTimeConflicts
};
