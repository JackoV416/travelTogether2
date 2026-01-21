import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx'
import './index.css'
import './i18n';
import 'leaflet/dist/leaflet.css'; // Leaflet Map CSS


const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [Main] Root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>,
    );
  } catch (e) {
    console.error('🔥 [Main] React Mount Failed:', e);
  }
}