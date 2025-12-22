/**
 * Google Maps Directions API Service
 * Handles fetching travel durations between itinerary stops.
 */

// Placeholder for Google Maps API Key
// In production, this should be an environment variable.
const GOOGLE_MAPS_API_KEY = "";

// Cache for travel times to minimize API calls
const travelTimeCache = new Map();

/**
 * Core logic to fetch directions data
 * @returns {Promise<object>} - { duration, distance, durationValue, mode }
 */
export const getDirections = async (origin, destination, mode = 'transit') => {
    if (!origin || !destination) return { duration: '0 分鐘', distance: '0 km', durationValue: 0, mode };

    // Normalize mode for Google API
    const googleMode = mode === 'walk' ? 'walking' : (mode === 'car' ? 'driving' : mode);
    const cacheKey = `${origin}-${destination}-${googleMode}`;

    if (travelTimeCache.has(cacheKey)) {
        console.log(`[DirectionsAPI] Cache hit for ${cacheKey}`);
        return travelTimeCache.get(cacheKey);
    }

    console.log(`[DirectionsAPI] Querying ${googleMode} from ${origin} to ${destination}`);

    // If no API Key, return smart mock data base
    if (!GOOGLE_MAPS_API_KEY) {
        let mockTime = 30;
        if (googleMode === 'walking') mockTime = 15;
        if (googleMode === 'driving') mockTime = 20;

        const mockResult = {
            duration: `${mockTime} 分鐘`,
            distance: '模擬距離',
            durationValue: mockTime,
            mode: mode
        };
        travelTimeCache.set(cacheKey, mockResult);
        return mockResult;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${googleMode}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            const leg = data.routes[0].legs[0];
            const mins = Math.ceil(leg.duration.value / 60); // value is in seconds
            const result = {
                duration: leg.duration.text,
                distance: leg.distance.text,
                durationValue: mins,
                mode: mode
            };
            travelTimeCache.set(cacheKey, result);
            return result;
        }

        console.warn(`[DirectionsAPI] Status: ${data.status}`);
    } catch (error) {
        console.error("[DirectionsAPI] Error:", error);
    }

    // Fallback
    const fallbackMins = mode === 'walk' ? 15 : 30;
    return {
        duration: `${fallbackMins} 分鐘`,
        distance: '未知距離',
        durationValue: fallbackMins,
        mode: mode
    };
};

/**
 * Helper for timeUtils or anyone expecting just the number
 */
export const getTransitDuration = async (origin, destination, mode = 'transit') => {
    const res = await getDirections(origin, destination, mode);
    return res.durationValue;
};

/**
 * Heuristic to suggest walking vs transit based on distance
 * @param {string} distanceStr - e.g. "1.2 km" or "800 m"
 */
export const getSmartTransportMode = (distanceStr) => {
    if (!distanceStr) return 'transit';
    const dist = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
    if (distanceStr.toLowerCase().includes('km')) {
        return dist < 0.8 ? 'walking' : 'transit'; // < 800m suggest walk
    } else if (distanceStr.toLowerCase().includes('m')) {
        return dist < 800 ? 'walking' : 'transit';
    }
    return 'transit';
};
