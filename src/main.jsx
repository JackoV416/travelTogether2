// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 假設您的主要應用程式元件在 App.jsx 中

// 使用 ReactDOM 的 createRoot API 渲染應用程式
// 將 <App /> 元件渲染到 index.html 中 ID 為 'root' 的 DOM 元素
ReactDOM.createRoot(document.getElementById('root')).render(
    // React.StrictMode 用於在開發模式下進行額外的檢查和警告
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
