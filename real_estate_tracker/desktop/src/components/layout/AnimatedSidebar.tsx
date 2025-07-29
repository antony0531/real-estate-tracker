import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Settings,
  Bug,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { useDebug } from '../../contexts/DebugContext'
import { cn } from '../../utils/cn'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  color?: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/projects', label: 'Projects', icon: Building2 },
  { path: '/rooms', label: 'Rooms', icon: Home },
  { path: '/expenses', label: 'Expenses', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

interface AnimatedSidebarProps {
  defaultCollapsed?: boolean
}

export const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({
  defaultCollapsed = false,
}) => {
  const location = useLocation()
  const { isDebugMode } = useDebug()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  }

  const linkVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  }

  const iconVariants = {
    expanded: { scale: 1 },
    collapsed: { scale: 1.2 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg md:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed md:relative h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40',
          'shadow-xl md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className={cn('overflow-hidden', isCollapsed && 'hidden')}
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent whitespace-nowrap">
              RE Tracker
            </h1>
          </motion.div>
          
          <motion.div
            animate={{ opacity: isCollapsed ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn('absolute left-1/2 -translate-x-1/2', !isCollapsed && 'hidden')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          </motion.div>

          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </motion.div>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    variants={iconVariants}
                    animate={isCollapsed ? 'collapsed' : 'expanded'}
                    className={cn(
                      'flex-shrink-0',
                      isCollapsed && 'mx-auto'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 transition-colors',
                      isActive && 'text-primary-600 dark:text-primary-400'
                    )} />
                  </motion.div>

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        variants={linkVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}

          {/* Debug Mode Item */}
          {isDebugMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
            >
              <Link
                to="/debug"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                  location.pathname === '/debug'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Bug className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">Debug</span>
                )}
                {!isCollapsed && (
                  <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    DEV
                  </span>
                )}
              </Link>
            </motion.div>
          )}
        </div>

        {/* Debug Mode Indicator */}
        {isDebugMode && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-800 dark:text-red-200">
                  Debug Mode Active
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Press Ctrl+Shift+D to toggle
              </p>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  )
}