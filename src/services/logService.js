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
        
        // 為了讓您看到 Log Service 正在工作，我們在 Console 中以特定格式輸出
        console.groupCollapsed(`[APP ERROR] ${timestamp}`);
        console.error("Message:", errorMessage);
        console.error("Context:", context);
        if (stackTrace !== 'N/A') {
            console.error("Stack:", stackTrace);
        }
        console.groupEnd();

        // --- 生產環境整合點 ---
        // 這裡可以呼叫第三方服務，例如 Sentry.captureException(error, { extra: context });
        // ---
    },

    /**
     * 記錄警告訊息。
     */
    warn: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        console.warn(`[APP WARN] ${timestamp} - ${message}`, context);
    },

    /**
     * 記錄一般資訊日誌。
     */
    info: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        console.log(`[APP INFO] ${timestamp} - ${message}`, context);
    },
};

export default LogService;
