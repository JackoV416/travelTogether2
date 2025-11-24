// src/components/ToastProvider.jsx

import React, { useState, useCallback, useMemo } from 'react';
import ToastContext from '../hooks/useToast';

// 提示的基礎樣式映射
const TYPE_CLASSES = {
    success: 'bg-green-500 border-green-700',
    error: 'bg-red-500 border-red-700',
    info: 'bg-blue-500 border-blue-700',
};

const ICON_MAP = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
};

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const DURATION = 3000; // 顯示時間 (3 秒)

    /**
     * 顯示 Toast 提示
     * @param {string} message - 提示文字
     * @param {string} type - 提示類型 ('success', 'error', 'info')
     */
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        const newToast = { id, message, type };

        // 1. 新增 Toast
        setToasts(prev => [...prev, newToast]);

        // 2. 設定計時器移除 Toast
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, DURATION);

    }, []);

    // 將 showToast 包裝成 context value
    const contextValue = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            
            {/* Toast 容器：固定在右上角 */}
            <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} 
                         className={`p-4 text-white rounded-lg shadow-xl border-b-4 transition-all duration-300 ease-out transform translate-x-0 opacity-100 
                                     ${TYPE_CLASSES[toast.type]} min-w-[250px] max-w-sm`}
                         // 這裡使用 inline style 來處理進入動畫，實際應用中可使用 CSS 庫
                         style={{ animation: `toast-in 0.3s forwards` }}>
                        
                        <div className="flex items-center space-x-3">
                            <span className="text-xl">{ICON_MAP[toast.type]}</span>
                            <span className="font-medium">{toast.message}</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* 注意：由於我們在 JSX 中無法定義 CSS keyframes，用戶需要在全局 CSS 中定義 @keyframes toast-in */}
            {/* 為了簡潔，我們假設用戶的環境能夠識別基本的動畫或使用 Tailwind JIT */}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
