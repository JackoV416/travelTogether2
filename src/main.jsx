import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './hooks/useToast';
// 導入錯誤邊界組件
import ErrorBoundary from './components/ErrorBoundary.jsx'; 


ReactDOM.createRoot(document.getElementById('root')).render(
  // 在開發模式下，React.StrictMode 有助於捕獲潛在問題
  <React.StrictMode> 
    <ErrorBoundary> {/* 將整個應用程式包裹在錯誤邊界內 */}
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
