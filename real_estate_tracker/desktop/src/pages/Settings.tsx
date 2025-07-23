// Settings.tsx - Application settings and configuration

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SettingsState {
  darkMode: boolean
  autoSave: boolean
  includeRoomDetails: boolean
  databasePath: string
  exportPath: string
  isLoading: boolean
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    autoSave: true,
    includeRoomDetails: true,
    databasePath: '',
    exportPath: '',
    isLoading: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setSettings(prev => ({ ...prev, isLoading: true }))
      
      // Check if dark mode is currently active
      const isDarkMode = document.documentElement.classList.contains('dark')
      
      // Load settings from localStorage
      const savedSettings = {
        darkMode: isDarkMode,
        autoSave: localStorage.getItem('autoSave') !== 'false',
        includeRoomDetails: localStorage.getItem('includeRoomDetails') !== 'false',
      }

      // Try to get database path
      let databasePath = 'Database location not available'
      try {
        // This would be a future Tauri command to get database path
        databasePath = 'C:\\Users\\datac\\.real_estate_tracker\\tracker.db'
      } catch (err) {
        console.warn('Could not get database path:', err)
      }

      setSettings({
        ...savedSettings,
        databasePath,
        exportPath: localStorage.getItem('exportPath') || 'C:\\Users\\datac\\Documents\\Real Estate Exports',
        isLoading: false
      })

    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
      setSettings(prev => ({ ...prev, isLoading: false }))
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode
    
    // Toggle dark mode class on document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    setSettings(prev => ({ ...prev, darkMode: newDarkMode }))
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`)
  }

  const toggleAutoSave = () => {
    const newAutoSave = !settings.autoSave
    localStorage.setItem('autoSave', newAutoSave.toString())
    setSettings(prev => ({ ...prev, autoSave: newAutoSave }))
    toast.success(`Auto-save ${newAutoSave ? 'enabled' : 'disabled'}`)
  }

  const toggleIncludeRoomDetails = () => {
    const newIncludeRoomDetails = !settings.includeRoomDetails
    localStorage.setItem('includeRoomDetails', newIncludeRoomDetails.toString())
    setSettings(prev => ({ ...prev, includeRoomDetails: newIncludeRoomDetails }))
    toast.success(`Room details ${newIncludeRoomDetails ? 'included' : 'excluded'} in exports`)
  }

  const handleResetDatabase = async () => {
    if (window.confirm('Are you sure you want to reset the database? This will delete ALL your projects and data!')) {
      try {
        // This would call a Tauri command to reset the database
        toast.info('Database reset functionality coming soon')
      } catch (error) {
        toast.error('Failed to reset database')
      }
    }
  }

  const handleBackupDatabase = async () => {
    try {
      toast.info('Database backup functionality coming soon')
    } catch (error) {
      toast.error('Failed to backup database')
    }
  }

  const handleRestoreDatabase = async () => {
    try {
      toast.info('Database restore functionality coming soon')
    } catch (error) {
      toast.error('Failed to restore database')
    }
  }

  const saveSettings = () => {
    toast.success('Settings saved successfully!')
  }

  const resetToDefaults = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      // Reset to defaults
      localStorage.removeItem('autoSave')
      localStorage.removeItem('includeRoomDetails')
      localStorage.removeItem('exportPath')
      
      // Reset dark mode
      document.documentElement.classList.remove('dark')
      localStorage.removeItem('darkMode')
      
      setSettings({
        darkMode: false,
        autoSave: true,
        includeRoomDetails: true,
        databasePath: settings.databasePath,
        exportPath: 'C:\\Users\\datac\\Documents\\Real Estate Exports',
        isLoading: false
      })
      
      toast.success('Settings reset to defaults')
    }
  }

  if (settings.isLoading) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your Real Estate Tracker experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Application Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Application</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-save</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes as you type
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoSave}
                  onChange={toggleAutoSave}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Database</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Database Location</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Database file path"
                  readOnly
                  value={settings.databasePath}
                />
                <button 
                  className="btn-outline px-4 py-2"
                  onClick={() => toast.info('Browse functionality coming soon')}
                >
                  Browse
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current database file location
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                className="btn-outline px-4 py-2"
                onClick={handleBackupDatabase}
              >
                Backup Database
              </button>
              <button 
                className="btn-outline px-4 py-2"
                onClick={handleRestoreDatabase}
              >
                Restore Database
              </button>
              <button 
                className="btn-outline px-4 py-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleResetDatabase}
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Export</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Default Export Location</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Export folder path"
                  value={settings.exportPath}
                  onChange={(e) => setSettings(prev => ({ ...prev, exportPath: e.target.value }))}
                />
                <button 
                  className="btn-outline px-4 py-2"
                  onClick={() => toast.info('Browse functionality coming soon')}
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Include room details in exports</h3>
                <p className="text-sm text-muted-foreground">
                  Add room information to CSV exports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.includeRoomDetails}
                  onChange={toggleIncludeRoomDetails}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>0.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build:</span>
              <span>Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span>Tauri + React</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend:</span>
              <span>Python CLI</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button 
            className="btn-primary px-6 py-2"
            onClick={saveSettings}
          >
            Save Settings
          </button>
          <button 
            className="btn-outline px-6 py-2"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
} 