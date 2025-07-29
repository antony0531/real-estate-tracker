// BulkEditBar.tsx - Bulk edit functionality for multiple projects

import React, { useState } from 'react'
import { toast } from 'sonner'
import { performanceOptimizer } from '../services/performanceOptimizer'

interface BulkEditBarProps {
  selectedProjectIds: number[]
  onComplete: () => void
  onCancel: () => void
}

export default function BulkEditBar({ selectedProjectIds, onComplete, onCancel }: BulkEditBarProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      setIsLoading(true)
      
      // Queue all status updates as batch
      const promises = selectedProjectIds.map(id => 
        performanceOptimizer.queueBatchUpdate(id, 'status', status)
      )
      
      await Promise.all(promises)
      toast.success(`Updated status for ${selectedProjectIds.length} projects`)
      onComplete()
      
    } catch (error) {
      toast.error('Failed to update project statuses')
      console.error('Bulk status update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkPriorityUpdate = async (priority: string) => {
    try {
      setIsLoading(true)
      
      // Queue all priority updates as batch
      const promises = selectedProjectIds.map(id => 
        performanceOptimizer.queueBatchUpdate(id, 'priority', priority)
      )
      
      await Promise.all(promises)
      toast.success(`Updated priority for ${selectedProjectIds.length} projects`)
      onComplete()
      
    } catch (error) {
      toast.error('Failed to update project priorities')
      console.error('Bulk priority update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedProjectIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {selectedProjectIds.length}
              </span>
            </div>
            <span className="text-sm text-gray-700 dark:text-slate-300">
              project{selectedProjectIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600"></div>

          {/* Status updates */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">STATUS:</span>
            <button
              onClick={() => handleBulkStatusUpdate('planning')}
              disabled={isLoading}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors disabled:opacity-50"
            >
              📋 Planning
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('in_progress')}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              🔨 Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('completed')}
              disabled={isLoading}
              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
            >
              ✅ Done
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600"></div>

          {/* Priority updates */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">PRIORITY:</span>
            <button
              onClick={() => handleBulkPriorityUpdate('urgent')}
              disabled={isLoading}
              className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
            >
              🔴 Urgent
            </button>
            <button
              onClick={() => handleBulkPriorityUpdate('high')}
              disabled={isLoading}
              className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50"
            >
              🟠 High
            </button>
            <button
              onClick={() => handleBulkPriorityUpdate('medium')}
              disabled={isLoading}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors disabled:opacity-50"
            >
              🟡 Medium
            </button>
            <button
              onClick={() => handleBulkPriorityUpdate('low')}
              disabled={isLoading}
              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
            >
              🟢 Low
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600"></div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-1 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Cancel selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">Updating...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 