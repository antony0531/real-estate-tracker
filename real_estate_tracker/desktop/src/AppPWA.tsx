import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'

import Layout from './components/layout/Layout'
import { DebugProvider } from './contexts/DebugContext'
import { pwaService } from './services/pwaService'

// Import PWA-specific components
import DashboardPWA from './pages/DashboardPWA'

export default function AppPWA() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize PWA database
        console.log('Initializing PWA database...')
        const result = await pwaService.initializeDatabase()
        if (!result.success) {
          throw new Error(result.error || 'Failed to initialize database')
        }
        console.log('PWA database initialized successfully')

      } catch (err) {
        console.error('Failed to initialize PWA:', err)
        setError(`Failed to initialize app: ${err}`)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Starting Real Estate Tracker PWA...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing local database
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Initialization Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DebugProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPWA />} />
          <Route path="/projects" element={<DashboardPWA />} />
          <Route path="/projects/:id" element={<DashboardPWA />} />
          <Route path="/expenses" element={<DashboardPWA />} />
          <Route path="/settings" element={<DashboardPWA />} />
        </Routes>
      </Layout>

      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
          },
        }}
      />
    </DebugProvider>
  )
}