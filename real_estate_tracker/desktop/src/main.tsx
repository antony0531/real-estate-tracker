import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import './index.css'

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable refetch on window focus for desktop app
      refetchOnWindowFocus: false,
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// React Query dev tools will be conditionally imported in the App component
// This avoids TypeScript issues during build process

// Initialize dark mode on app startup
const initializeDarkMode = () => {
  // Always enable dark mode by default for this app
  document.documentElement.classList.add('dark')
  
  // Set localStorage to remember dark mode preference
  localStorage.setItem('darkMode', 'true')
  
  console.log('🌙 Dark mode enabled by default')
}

// Initialize dark mode before rendering
initializeDarkMode()

// Main application root
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
) 