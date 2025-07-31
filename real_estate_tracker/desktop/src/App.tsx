import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'

import Layout from './components/layout/Layout'
import ModernDashboard from './pages/ModernDashboard'
import Projects from './pages/Projects'
import ProjectView from './pages/ProjectView'
import Expenses from './pages/Expenses'
import ModernSettings from './pages/ModernSettings'
import Debug from './pages/Debug'
import Rooms from './pages/Rooms'
import Reports from './pages/Reports'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import NetworkStatus from './components/NetworkStatus'

import { DataService } from './services/dataService'
import { DebugProvider } from './contexts/DebugContext'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize the database  
        console.log('Initializing database...')
        await DataService.initializeDatabase()
        console.log('Database initialized successfully')

        // Get app info
        const info = await DataService.getAppInfo()
        console.log('App initialized successfully:', info)

      } catch (err) {
        console.error('Failed to initialize app:', err)
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
            Starting Real Estate Tracker...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing database and loading components
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
          {/* Main dashboard route */}
          <Route 
            path="/" 
            element={<ModernDashboard />} 
          />
          
          {/* Projects routes */}
          <Route 
            path="/projects" 
            element={<Projects />} 
          />
          <Route 
            path="/projects/:id" 
            element={<ProjectView />} 
          />
          
          {/* Expenses route */}
          <Route 
            path="/expenses" 
            element={<Expenses />} 
          />

          {/* Rooms route */}
          <Route 
            path="/rooms" 
            element={<Rooms />} 
          />

          {/* Reports route */}
          <Route 
            path="/reports" 
            element={<Reports />} 
          />
          
          {/* Settings route */}
          <Route 
            path="/settings" 
            element={<ModernSettings />} 
          />
          
          {/* Debug route */}
          <Route 
            path="/debug" 
            element={<Debug />} 
          />
        </Routes>
      </Layout>

      {/* Global toast notifications */}
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
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Network Status Indicator */}
      <NetworkStatus />
    </DebugProvider>
  )
} 