/**
 * 🌐 Network Status Utility (V1.2.5)
 * Detects online/offline status and provides hooks
 */

/**
 * Check if user is currently online
 * @returns {boolean}
 */
export function isOnline() {
    return navigator.onLine;
}

/**
 * Subscribe to network status changes
 * @param {Function} onOnline - Callback when connection restored
 * @param {Function} onOffline - Callback when connection lost
 * @returns {Function} Cleanup function
 */
export function subscribeNetworkStatus(onOnline, onOffline) {
    const handleOnline = () => onOnline?.();
    const handleOffline = () => onOffline?.();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

/**
 * Execute action with offline check
 * @param {Function} action - Async action to execute
 * @param {Object} options - { onOffline: Function }
 * @returns {Promise<any>}
 */
export async function withNetworkCheck(action, options = {}) {
    if (!navigator.onLine) {
        options.onOffline?.();
        throw new Error('目前離線中，無法同步設定。請檢查網絡連接。');
    }
    return action();
}
