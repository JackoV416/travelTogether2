// src/utils/dataManager.js - 整合導出和匯入功能

/**
 * 將 JavaScript 對象導出為 JSON 文件並觸發瀏覽器下載。
 * @param {object} data - 要導出的數據對象。
 * @param {string} filename - 文件的名稱。
 */
export const exportJsonToFile = (data, filename) => {
    try {
        const jsonString = JSON.stringify(data, null, 2); 
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const finalFilename = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export_${new Date().toISOString().slice(0, 10)}.json`;
        link.download = finalFilename;
        link.href = url;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`數據已成功導出為 ${finalFilename}`);
        return true;
    } catch (error) {
        console.error("導出數據時發生錯誤:", error);
        return false;
    }
};

/**
 * 從 JSON 文件讀取數據。
 * @param {File} file - 檔案對象 (通常來自 input[type="file"].files[0])。
 * @returns {Promise<object>} 包含 JSON 數據的 Promise。
 */
export const importJsonFromFile = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("未選擇檔案。"));
        }
        if (file.type !== 'application/json') {
            return reject(new Error("請上傳有效的 JSON 文件。"));
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                resolve(data);
            } catch (e) {
                reject(new Error("JSON 檔案格式無效。"));
            }
        };

        reader.onerror = (error) => {
            reject(new Error("讀取檔案失敗。"));
        };

        reader.readAsText(file);
    });
};
