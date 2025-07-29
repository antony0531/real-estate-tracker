// DebugContext.tsx - Global debug mode management
import React, { createContext, useContext, useState, useEffect } from 'react'

interface DebugContextType {
  isDebugMode: boolean
  toggleDebugMode: () => void
  enableDebugMode: () => void
  disableDebugMode: () => void
  debugLog: (message: string, data?: any) => void
}

const DebugContext = createContext<DebugContextType | undefined>(undefined)

interface DebugProviderProps {
  children: React.ReactNode
}

export function DebugProvider({ children }: DebugProviderProps) {
  const [isDebugMode, setIsDebugMode] = useState(false)

  // Load debug mode from localStorage on mount
  useEffect(() => {
    const savedDebugMode = localStorage.getItem('re-tracker-debug-mode')
    if (savedDebugMode === 'true') {
      setIsDebugMode(true)
    }

    // Listen for secret key combination: Ctrl+Shift+D
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        toggleDebugMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Save debug mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('re-tracker-debug-mode', isDebugMode.toString())
  }, [isDebugMode])

  const toggleDebugMode = () => {
    setIsDebugMode(prev => {
      const newMode = !prev
      console.log(`🔧 Debug mode ${newMode ? 'ENABLED' : 'DISABLED'}`)
      if (newMode) {
        console.log('🎯 Debug features are now visible. Press Ctrl+Shift+D to toggle.')
      }
      return newMode
    })
  }

  const enableDebugMode = () => {
    setIsDebugMode(true)
    console.log('🔧 Debug mode ENABLED programmatically')
  }

  const disableDebugMode = () => {
    setIsDebugMode(false)
    console.log('🔧 Debug mode DISABLED programmatically')
  }

  const debugLog = (message: string, data?: any) => {
    if (isDebugMode) {
      if (data) {
        console.log(`🔍 [DEBUG] ${message}`, data)
      } else {
        console.log(`🔍 [DEBUG] ${message}`)
      }
    }
  }

  return (
    <DebugContext.Provider value={{
      isDebugMode,
      toggleDebugMode,
      enableDebugMode,
      disableDebugMode,
      debugLog
    }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider')
  }
  return context
}

// HOC to conditionally render debug components
export function withDebugMode<T extends object>(Component: React.ComponentType<T>) {
  return function DebugModeComponent(props: T) {
    const { isDebugMode } = useDebug()
    
    if (!isDebugMode) {
      return null
    }
    
    return <Component {...props} />
  }
} 