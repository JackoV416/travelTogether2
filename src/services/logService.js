// src/services/logService.js

/**
 * 集中化的日誌服務模組。
 * 在真實的生產環境中，這裡會集成 Sentry, LogRocket 或您自己的後端日誌服務。
 * 為了演示，我們使用 console.error/warn/log 來模擬記錄。
 */
const LogService = {
    /**
     * 記錄應用程式中的錯誤。
     * @param {Error | string} error - 錯誤物件或錯誤訊息。
     * @param {object} [context={}] - 發生錯誤時的額外上下文數據（例如：用戶ID, 操作名稱）。
     */
    error: (error, context = {}) => {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stackTrace = error instanceof Error ? error.stack : 'N/A';
        
        console.error(`[ERROR] ${timestamp} - ${errorMessage}`, {
            ...context,
            stack: stackTrace,
        });

        // --- 生產環境整合點 ---
        // 這裡可以呼叫第三方服務，例如：
        // Sentry.captureException(error, { extra: context });
        // LogRocket.log('Error occurred', context);
        // fetch('/api/log', { method: 'POST', body: JSON.stringify({ level: 'error', message: errorMessage, context, stack: stackTrace }) });
        // ---
    },

    /**
     * 記錄警告訊息。
     * @param {string} message - 警告訊息。
     * @param {object} [context={}] - 額外上下文數據。
     */
    warn: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        console.warn(`[WARN] ${timestamp} - ${message}`, context);
    },

    /**
     * 記錄一般資訊日誌。
     * @param {string} message - 一般訊息。
     * @param {object} [context={}] - 額外上下文數據。
     */
    info: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        console.log(`[INFO] ${timestamp} - ${message}`, context);
    },
};

export default LogService;
