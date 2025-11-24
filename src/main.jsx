// src/main.jsx (或 App.jsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // <-- 引入 ThemeProvider
// 引入 ToastProvider
import ToastProvider from './components/ToastProvider'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* <-- 包裹在 ThemeProvider 內 */}
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
// 如果您有 index.css，請檢查它是否存在。
// 錯誤信息中提到了 "src/index.css (非 Tailwind)"，但這通常不是問題所在。
// 關鍵是 JSX 語法錯誤： Expected ';' but found 'src' 
// 請重點檢查第 12 行附近是否有遺漏的分號或多餘的程式碼。
