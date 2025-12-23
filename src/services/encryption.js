
import CryptoJS from 'crypto-js';

// 🔐 Secret Key (In production, this should be in .env)
// For this demo, we use a hardcoded key, but we recommend moving it later.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "travelTogether_Secret_Key_2025";

/**
 * 🔒 Encrypt a message
 * @param {string} text - Plain text message
 * @returns {string} - Encrypted ciphertext (Base64)
 */
export const encryptMessage = (text) => {
    if (!text) return "";
    try {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (e) {
        console.error("Encryption Failed:", e);
        return text; // Fallback to plain text if failed (safety)
    }
};

/**
 * 🔓 Decrypt a message
 * @param {string} cipherText - Encrypted ciphertext
 * @returns {string} - Decrypted plain text
 */
export const decryptMessage = (cipherText) => {
    if (!cipherText) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // Validation: If decryption results in empty string (wrong key/format), return original
        if (!originalText && cipherText.length > 0) return cipherText;

        return originalText;
    } catch (e) {
        // If it's not encrypted (legacy message), return as is
        return cipherText;
    }
};
