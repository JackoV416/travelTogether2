// src/utils/imageUpload.js - 圖片上傳服務與限制

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// 設置圖片大小限制為 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * 處理檔案上傳到 Firebase Storage
 * @param {File} file - 要上傳的檔案 (圖片)
 * @param {string} tripId - 旅程 ID (用於 Storage 路徑)
 * @param {function} onProgress - 進度回調函式 (0-100)
 * @returns {Promise<string>} - 圖片的下載 URL
 */
export const uploadTripPhoto = (file, tripId, onProgress) => {
    return new Promise((resolve, reject) => {
        
        // 1. 檢查檔案大小限制
        if (file.size > MAX_FILE_SIZE_BYTES) {
            reject(new Error(`檔案大小超過限制 (5MB)。當前檔案大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`));
            return;
        }

        // 2. 構造 Storage 路徑
        const fileExtension = file.name.split('.').pop();
        const photoId = uuidv4();
        // 路徑格式: trips/{tripId}/photos/{photoId}.{ext}
        const storageRef = ref(storage, `trips/${tripId}/photos/${photoId}.${fileExtension}`);

        // 3. 執行上傳
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // 處理上傳進度
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                // 處理上傳失敗
                console.error("Firebase Storage Upload Error:", error);
                reject(new Error(`圖片上傳失敗: ${error.message}`));
            },
            async () => {
                // 處理上傳完成
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (urlError) {
                    reject(new Error(`無法獲取圖片 URL: ${urlError.message}`));
                }
            }
        );
    });
};
