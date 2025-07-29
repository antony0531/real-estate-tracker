// DeleteConfirmationModal.tsx - Modern delete confirmation dialog

import React, { useState } from 'react'
import { toast } from 'sonner'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  itemName: string
  dangerText?: string
  confirmText?: string
  cancelText?: string
  requireTyping?: boolean
  isDestructive?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  dangerText,
  confirmText = "Delete",
  cancelText = "Cancel", 
  requireTyping = false,
  isDestructive = true
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [typedText, setTypedText] = useState('')

  const canConfirm = !requireTyping || typedText === itemName

  const handleConfirm = async () => {
    if (!canConfirm) {
      toast.error(`Please type "${itemName}" to confirm`)
      return
    }

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete operation failed:', error)
      // Don't close modal on error - let the parent handle error display
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setTypedText('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDestructive 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}>
              <svg 
                className={`w-6 h-6 ${
                  isDestructive 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-amber-600 dark:text-amber-400'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-slate-300">
            {message}
          </p>

          {dangerText && (
            <div className={`p-4 rounded-lg border ${
              isDestructive
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
            }`}>
              <p className={`text-sm font-medium ${
                isDestructive
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-amber-800 dark:text-amber-200'
              }`}>
                {dangerText}
              </p>
            </div>
          )}

          {requireTyping && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Type <span className="font-mono text-red-600 dark:text-red-400">{itemName}</span> to confirm:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className={`input w-full ${
                  requireTyping && typedText && typedText !== itemName
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : ''
                }`}
                placeholder={itemName}
                disabled={isDeleting}
              />
              {requireTyping && typedText && typedText !== itemName && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Text doesn't match. Please type "{itemName}" exactly.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 btn-secondary"
              disabled={isDeleting}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isDeleting}
              className={`flex-1 transition-all ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 dark:disabled:bg-red-800'
                  : 'bg-amber-600 hover:bg-amber-700 text-white disabled:bg-amber-300 dark:disabled:bg-amber-800'
              } px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed`}
            >
              {isDeleting ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 