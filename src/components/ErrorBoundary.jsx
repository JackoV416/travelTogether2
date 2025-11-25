import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';

/**
 * React 錯誤邊界組件。
 * 捕捉子組件樹中發生的 JavaScript 錯誤，記錄錯誤，並顯示備用 UI。
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    /**
     * 捕捉生命週期方法：用於捕捉錯誤並更新 state。
     * @param {Error} error - 被拋出的錯誤。
     * @returns {{hasError: boolean}} - 用於更新 state 的物件。
     */
    static getDerivedStateFromError(error) {
        // 更新 state 以便下一個渲染會顯示備用 UI
        return { hasError: true };
    }

    /**
     * 錯誤資訊記錄：用於將錯誤資訊記錄到服務端或控制台。
     * @param {Error} error - 被拋出的錯誤物件。
     * @param {{componentStack: string}} errorInfo - 包含組件堆疊資訊的物件。
     */
    componentDidCatch(error, errorInfo) {
        // 在此處將錯誤記錄到錯誤報告服務 (例如 Sentry, Rollbar)
        console.error("捕捉到應用程式錯誤：", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // 當發生錯誤時，渲染自定義的備用 UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4 font-sans">
                    <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 border-t-4 border-red-500">
                        <div className="flex flex-col items-center space-y-4">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">
                                應用程式發生錯誤
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-center">
                                很抱歉，應用程式中發生了無法預期的錯誤。請嘗試重新載入頁面，通常這能解決大多數問題。
                            </p>
                            
                            {/* 僅在開發環境顯示錯誤詳情 */}
                            {/* 請注意：在實際產品中，建議不要向用戶顯示詳細錯誤堆棧 */}
                            {this.state.error && (
                                <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm w-full cursor-pointer">
                                    <summary className="font-semibold text-gray-800 dark:text-gray-200">
                                        錯誤詳情 (僅供開發/除錯使用)
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap break-all text-xs text-red-600 dark:text-red-300">
                                        {this.state.error.toString()}
                                        <br />
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out flex items-center justify-center space-x-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>重新載入應用程式</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // 正常情況下渲染子組件
        return this.props.children;
    }
}

export default ErrorBoundary;
