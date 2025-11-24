// src/hooks/useToast.js

import { createContext, useContext } from 'react';

// 定義 Toast Context 的初始值
const ToastContext = createContext(null);

// 導出 useToast Hook
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === null) {
        throw new Error('useToast 必須在 ToastProvider 內使用');
    }
    return context;
};

// 導出 Context 供 Provider 使用
export default ToastContext;
