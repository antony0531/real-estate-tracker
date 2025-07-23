import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { toast } from 'sonner'

// Import pages
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ProjectView from '@/pages/ProjectView'
import Expenses from '@/pages/Expenses'
  import Reports from './pages/Reports'
  import Settings from './pages/Settings'
  import Debug from './pages/Debug'

// Import components
import Layout from '@/components/layout/Layout'
import LoadingScreen from '@/components/LoadingScreen'

// Import types
import type { AppInfo } from '@/types'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize app on mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get app information from Tauri backend
      const info = await invoke<AppInfo>('get_app_info')
      setAppInfo(info)

      // Initialize database if needed
      try {
        await invoke('initialize_database')
      } catch (dbError) {
        console.warn('Database already initialized or error:', dbError)
        // Don't treat this as a fatal error - database might already be initialized
      }

      // Show success message
      toast.success('Real Estate Tracker loaded successfully!')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize app'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('App initialization error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="full-screen center flex-col space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Failed to Initialize App
          </h1>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <button 
            onClick={initializeApp}
            className="btn-primary px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout appInfo={appInfo}>
      <Routes>
        {/* Main dashboard route */}
        <Route 
          path="/" 
          element={<Dashboard />} 
        />
        
        {/* Projects routes */}
        <Route 
          path="/projects" 
          element={<Projects />} 
        />
        <Route 
          path="/projects/:projectId" 
          element={<ProjectView />} 
        />
        
        {/* Expenses route */}
        <Route 
          path="/expenses" 
          element={<Expenses />} 
        />
        
        {/* Reports route */}
        <Route 
          path="/reports" 
          element={<Reports />} 
        />
        
        {/* Settings route */}
        <Route 
          path="/settings" 
          element={<Settings />} 
        />

        {/* Debug route */}
        <Route 
          path="/debug" 
          element={<Debug />} 
        />
        
        {/* Catch-all route for 404s */}
        <Route 
          path="*" 
          element={
            <div className="center flex-col space-y-4 h-full">
              <h1 className="text-2xl font-bold">Page Not Found</h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist.
              </p>
            </div>
          } 
        />
      </Routes>
    </Layout>
  )
}

export default App 