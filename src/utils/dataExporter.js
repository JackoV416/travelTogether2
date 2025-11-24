// src/utils/dataExporter.js

/**
 * 將 JavaScript 對象導出為 JSON 文件並觸發瀏覽器下載。
 * @param {object} data - 要導出的數據對象 (例如: trip 物件)。
 * @param {string} filename - 文件的名稱 (不含擴展名)。
 */
export const exportJsonToFile = (data, filename) => {
    try {
        // 1. 將數據轉換為格式化的 JSON 字符串
        const jsonString = JSON.stringify(data, null, 2); // null, 2 用於美化輸出，使其易讀

        // 2. 創建 Blob 對象
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 3. 創建下載連結
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // 4. 設定文件名稱
        const finalFilename = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export_${new Date().toISOString().slice(0, 10)}.json`;
        link.download = finalFilename;
        link.href = url;

        // 5. 模擬點擊觸發下載
        document.body.appendChild(link);
        link.click();

        // 6. 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`數據已成功導出為 ${finalFilename}`);
        return true;
    } catch (error) {
        console.error("導出數據時發生錯誤:", error);
        alert('導出數據失敗。請檢查控制台錯誤信息。');
        return false;
    }
};
