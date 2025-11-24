// src/components/ErrorBoundary.jsx - 捕獲子組件的運行時錯誤

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // 定義一個狀態來追蹤是否發生錯誤
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // 靜態方法：在組件發生錯誤時被調用，返回一個新的狀態
  static getDerivedStateFromError(error) {
    // 更新 state 以便下一個渲染可以顯示備用 UI
    return { hasError: true };
  }

  // 捕捉錯誤資訊：在組件樹中的錯誤被捕獲後調用
  componentDidCatch(error, errorInfo) {
    // 您可以在這裡將錯誤發送到日誌服務 (例如 Sentry, LogRocket, 或我們自己的 LogService)
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    // 顯示 Toast 提示用戶，而不是僅僅依賴白屏
    // 這裡無法直接調用 useToast，但我們可以透過 props 傳遞或讓用戶刷新
  }

  render() {
    if (this.state.hasError) {
      // 發生錯誤時顯示的備用 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-3">
              應用程式發生錯誤 🐛
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-5">
              非常抱歉，應用程式運行時發生了一個未預期的錯誤。
              我們已經記錄了這個問題。
            </p>
            <details className="text-sm text-gray-500 dark:text-gray-400 text-left mt-4 border-t pt-3">
                <summary className="font-semibold cursor-pointer">
                    點擊查看錯誤詳情 (僅限開發者)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-auto max-h-40">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
            </details>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 w-full p-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition-colors"
            >
              刷新頁面
            </button>
          </div>
        </div>
      );
    }

    // 正常情況下，渲染子組件
    return this.props.children;
  }
}

export default ErrorBoundary;
