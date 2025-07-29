// Layout.tsx - Ultra-Modern application layout with enhanced dark theme

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Settings } from 'lucide-react'
import { AnimatedSidebar } from './AnimatedSidebar'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import type { AppInfo } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  appInfo?: AppInfo
}

export default function Layout({ children }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-1 overflow-hidden">
        {/* Animated Sidebar */}
        <AnimatedSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Modern Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30"
          >
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, expenses..."
                  className={cn(
                    "pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all",
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  )}
                />
              </form>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </motion.header>

          {/* Page Content with Animation */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
} 