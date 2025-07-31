import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, setupIOSInstallPrompt } from './utils/registerSW'

// Register service worker for offline support
registerServiceWorker();

// Setup iOS install prompt
setupIOSInstallPrompt();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
