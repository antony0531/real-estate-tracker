// EditExpenseModal.tsx - Modal for editing existing expenses

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TauriService } from '@/services/tauri'
import ScrollableSelect from '@/components/ui/ScrollableSelect'

interface Expense {
  id: number
  project_id: number
  room_name: string
  category: 'material' | 'labor'
  cost: number
  labor_hours?: number
  room_condition_after?: number
  notes?: string
  date: string
}

interface Project {
  id: number
  name: string
  rooms: Array<{ name: string }>
}

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  expense: Expense | null
  projects: Project[]
}

export default function EditExpenseModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  expense,
  projects 
}: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    room_name: '',
    category: 'material' as 'material' | 'labor',
    cost: '',
    hours: '',
    condition: '3',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // Initialize form with expense data
  useEffect(() => {
    if (expense && projects.length > 0) {
      const project = projects.find(p => p.id === expense.project_id)
      setCurrentProject(project || null)
      
      setFormData({
        room_name: expense.room_name || '',
        category: expense.category || 'material',
        cost: expense.cost?.toString() || '',
        hours: expense.labor_hours?.toString() || '',
        condition: expense.room_condition_after?.toString() || '3',
        notes: expense.notes || ''
      })
    }
  }, [expense, projects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expense) return

    if (!formData.room_name || !formData.cost) {
      toast.error('Please fill in all required fields')
      return
    }

    const cost = parseFloat(formData.cost)
    if (isNaN(cost) || cost < 0) {
      toast.error('Please enter a valid cost amount')
      return
    }

    const hours = formData.hours ? parseFloat(formData.hours) : undefined
    if (hours !== undefined && (isNaN(hours) || hours < 0)) {
      toast.error('Please enter valid hours')
      return
    }

    const condition = parseInt(formData.condition)
    if (isNaN(condition) || condition < 1 || condition > 5) {
      toast.error('Condition must be between 1-5')
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: any = {}
      
      // Only include changed fields
      if (formData.room_name !== expense.room_name) updateData.room_name = formData.room_name
      if (formData.category !== expense.category) updateData.category = formData.category
      if (cost !== expense.cost) updateData.cost = cost
      if (hours !== expense.labor_hours) updateData.hours = hours
      if (condition !== expense.room_condition_after) updateData.condition = condition
      if (formData.notes !== expense.notes) updateData.notes = formData.notes

      // If no changes, just close
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save')
        onClose()
        return
      }

      await TauriService.updateExpense(expense.id, updateData)
      
      toast.success('Expense updated successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error(`Failed to update expense: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }


  if (!isOpen || !expense || !currentProject) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
            Edit Expense
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Project: {currentProject.name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Room *
            </label>
            <ScrollableSelect
              options={currentProject.rooms.map(room => ({ value: room.name, label: room.name }))}
              value={formData.room_name}
              onChange={(value) => setFormData(prev => ({ ...prev, room_name: value }))}
              placeholder="Select a room"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Category *
            </label>
            <ScrollableSelect
              options={[
                { value: 'material', label: 'Material' },
                { value: 'labor', label: 'Labor' },
              ]}
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value as 'material' | 'labor' }))}
              placeholder="Select a category"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Cost *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                className="input w-full pl-8"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Hours (Labor only) */}
          {formData.category === 'labor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Labor Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                className="input w-full"
                placeholder="0.0"
              />
            </div>
          )}

          {/* Condition */}
          <div>
            <ScrollableSelect
              label="Room Condition After Work (1-5)"
              value={formData.condition}
              onChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              options={[
                { value: "1", label: "1 - Poor", description: "Needs major work" },
                { value: "2", label: "2 - Fair", description: "Needs significant improvements" },
                { value: "3", label: "3 - Good", description: "Some improvements needed" },
                { value: "4", label: "4 - Very Good", description: "Minor improvements needed" },
                { value: "5", label: "5 - Excellent", description: "In great condition" }
              ]}
              placeholder="Select condition"
              searchable={false}
              maxHeight="200px"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input w-full resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 btn-secondary min-w-[100px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 btn-primary min-w-[100px]"
            >
              {isSubmitting ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 