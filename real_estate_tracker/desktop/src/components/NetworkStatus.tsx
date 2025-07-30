import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">You're offline</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}