// Dashboard.tsx - Main dashboard page for Real Estate Tracker

import React, { useEffect, useState } from 'react'
import { TauriService, type AppInfo, type PythonInfo } from '../services/tauri'
import { toast } from 'sonner'

interface DashboardStats {
  projectCount: number
  totalBudget: number
  totalSpent: number
  isLoading: boolean
}

export default function Dashboard() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    isLoading: true
  })
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')

  // Test connection and load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setConnectionStatus('testing')
      setStats(prev => ({ ...prev, isLoading: true }))

      // Test connection first
      console.log('Testing Tauri IPC connection...')
      
      // Get app info
      const appData = await TauriService.getAppInfo()
      setAppInfo(appData)
      console.log('App info loaded:', appData)

      // Check Python installation  
      const pythonData = await TauriService.checkPythonInstallation()
      setPythonInfo(pythonData)
      console.log('Python info loaded:', pythonData)

      // Initialize database if needed
      try {
        await TauriService.initializeDatabase()
        console.log('Database initialized')
      } catch (dbError) {
        console.warn('Database already initialized or error:', dbError)
        // Don't treat as fatal error
      }

      // Get projects data
      const projectsOutput = await TauriService.getProjects()
      console.log('Projects output:', projectsOutput)
      
      // Parse project count from CLI output  
      const projectCount = parseProjectCount(projectsOutput)

      setStats({
        projectCount,
        totalBudget: 0, // TODO: Calculate from projects
        totalSpent: 0,  // TODO: Calculate from expenses
        isLoading: false
      })

      setConnectionStatus('connected')
      toast.success('Successfully connected to Real Estate Tracker backend!')

    } catch (error) {
      console.error('Dashboard data loading failed:', error)
      setConnectionStatus('error')
      setStats(prev => ({ ...prev, isLoading: false }))
      toast.error(`Connection failed: ${TauriService.handleError(error)}`)
    }
  }

  const parseProjectCount = (output: string): number => {
    // Parse CLI output to extract project count
    // Our CLI outputs project list, so we can count the lines
    const lines = output.trim().split('\n').filter(line => 
      line.trim() && 
      !line.includes('Project List') && 
      !line.includes('====') &&
      !line.includes('No projects found')
    )
    return Math.max(0, lines.length)
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'  
      case 'testing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'error': return 'Connection Failed'
      case 'testing': return 'Connecting...'
      default: return 'Unknown'
    }
  }

  const handleCreateProject = async () => {
    try {
      // Demo project creation
      const demoProject = {
        name: 'Demo House Flip',
        budget: 150000,
        property_type: 'single_family',
        property_class: 'sf_class_c',
        description: 'Demo project created from dashboard',
        sqft: 2000,
        address: '123 Demo Street'
      }

      const result = await TauriService.createProject(demoProject)
      console.log('Project created:', result)
      toast.success('Demo project created successfully!')
      
      // Reload dashboard data
      loadDashboardData()
      
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error(`Failed to create project: ${TauriService.handleError(error)}`)
    }
  }

  return (
    <div className="p-6">
      {/* Header with Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Welcome to Real Estate Tracker - Manage your renovation projects
            </p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </div>
            {appInfo && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {appInfo.name} v{appInfo.version}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      {pythonInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">System Status</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>Python: {pythonInfo.version}</div>
            <div>Backend: {pythonInfo.has_backend ? '✅ Available' : '❌ Not Found'}</div>
            <div>Executable: {pythonInfo.executable}</div>
          </div>
        </div>
      )}

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-brand-600">{stats.projectCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.projectCount === 0 ? 'No projects yet' : 'Projects in progress'}
              </p>
            </>
          )}
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalBudget.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Across all projects</p>
            </>
          )}
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-orange-600">
                ${stats.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total expenses</p>
            </>
          )}
                  </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={handleCreateProject}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-medium">Create Demo Project</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Add a sample house flip project</div>
              </div>
            </button>
            
            <button 
              onClick={loadDashboardData}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-medium">Refresh Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Reload dashboard information</div>
              </div>
            </button>

            <button 
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium">Add Expense</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Coming soon...</div>
              </div>
            </button>

            <button 
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Coming soon...</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity / Projects */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="card p-6">
            {stats.isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : stats.projectCount === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first house flipping project to get started!
                </p>
                <button 
                  onClick={handleCreateProject}
                  className="btn-primary"
                >
                  Create Demo Project
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  You have {stats.projectCount} active project{stats.projectCount !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Project details will be displayed here once the UI is fully integrated.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Development/Debug Information */}
        {connectionStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Connection Error</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Failed to connect to the backend. This could be due to:
            </p>
            <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1 mb-3">
              <li>Python not installed or not in PATH</li>
              <li>Backend dependencies missing</li>
              <li>Database initialization failed</li>
              <li>File permissions issues</li>
            </ul>
            <div className="flex gap-2">
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Integration Test Status */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🧪 Integration Test Status
            </h3>
            <div className="text-sm space-y-1">
              <div className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                ✓ React Frontend: Working
              </div>
              <div className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                {connectionStatus === 'connected' ? '✓' : '✗'} Tauri IPC: {getConnectionStatusText()}
              </div>
              <div className={pythonInfo?.has_backend ? 'text-green-600' : 'text-red-600'}>
                {pythonInfo?.has_backend ? '✓' : '✗'} Python CLI Backend: {pythonInfo?.has_backend ? 'Available' : 'Not Found'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                📊 Projects Loaded: {stats.projectCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This debug panel is only visible in development mode.
              </div>
            </div>
          </div>
        )}
      </div>
    )
  } 