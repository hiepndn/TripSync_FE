import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProviders } from './app/providers';
import { registerSW } from 'virtual:pwa-register';

// Cố tình register Service Worker thay vì đợi Vite tự inject
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);