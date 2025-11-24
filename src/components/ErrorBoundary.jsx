// src/components/ErrorBoundary.jsx
// React 錯誤邊界元件 (Class Component)
// 用於捕獲子樹中的 JavaScript 錯誤，並顯示備用 UI。

import React, { Component } from 'react';
// 導入我們集中的日誌服務，明確指定副檔名
import LogService from '../services/logService.js';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    /**
     * 靜態方法，用於在子組件拋出錯誤時更新 state，
     * 讓下一次渲染能夠顯示備用 UI。
     */
    static getDerivedStateFromError(error) {
        // 更新 state 以便下一個 render 會顯示 fallback UI。
        return { hasError: true, error: error };
    }

    /**
     * 這個生命週期方法用於記錄錯誤訊息。
     * 在這裡，我們會將錯誤發送到我們的 LogService。
     */
    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo: errorInfo
        });
        
        // *** 呼叫 LogService 進行錯誤記錄 ***
        // LogService 負責將錯誤發送到 Sentry/後端
        LogService.error(error, { 
            componentStack: errorInfo.componentStack,
            operation: 'REACT_RENDER_CRASH'
        });

        console.error("ErrorBoundary Caught an Error:", error, errorInfo);
    }

    /**
     * 渲染備用 UI 或正常子組件。
     */
    render() {
        if (this.state.hasError) {
            // 備用 UI：使用 Tailwind 確保響應式和美觀
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4">
                    <div className="max-w-xl w-full bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl text-center border-t-4 border-red-500">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        
                        <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
                            發生了一個錯誤
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            很抱歉，我們的應用程式發生了一些意料之外的問題。
                            請您稍後再試，或嘗試重新整理頁面。
                        </p>

                        {/* 顯示給開發者看的錯誤詳情 (在生產環境中可隱藏) */}
                        {this.state.error && (
                            <details className="text-left mt-4 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <summary className="font-semibold text-red-600 dark:text-red-300 cursor-pointer">
                                    錯誤詳情 (點擊展開)
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap break-all text-red-800 dark:text-red-100">
                                    {this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            重新整理頁面
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
