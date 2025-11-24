import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

6. src/index.css (引入 Tailwind)
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 引入字體 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap');

body {
    /* 確保字體在 CSS 載入後生效 */
    font-family: 'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif;
}
