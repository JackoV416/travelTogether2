import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 確保導入是單獨一行，並且路徑是正確的
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
