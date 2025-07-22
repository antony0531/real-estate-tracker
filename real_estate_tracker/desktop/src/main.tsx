import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

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

// Enable React Query dev tools in development
if (import.meta.env.DEV) {
  import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
    // Add dev tools to the DOM if in development
    const devtools = React.createElement(ReactQueryDevtools, {
      initialIsOpen: false,
      position: 'bottom-right',
    })
    // Note: This is a simplified approach - in production, you'd want to conditionally render this
  })
}

// Main application root
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* Global toast notifications */}
        <Toaster 
          position="top-right" 
          expand={true}
          richColors={true}
          closeButton={true}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
) 