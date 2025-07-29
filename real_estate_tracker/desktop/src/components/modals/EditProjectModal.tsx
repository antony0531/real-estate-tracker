// EditProjectModal.tsx - Modal for editing existing projects

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TauriService } from '@/services/tauri'

interface Project {
  id: number
  name: string
  budget: number
  description?: string
  floors?: number
  sqft?: number
  address?: string
}

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  project: Project | null
}

export default function EditProjectModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  project 
}: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    description: '',
    floors: '',
    sqft: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        budget: project.budget?.toString() || '',
        description: project.description || '',
        floors: project.floors?.toString() || '',
        sqft: project.sqft?.toString() || '',
        address: project.address || ''
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    if (!formData.name || !formData.budget) {
      toast.error('Please fill in all required fields')
      return
    }

    const budget = parseFloat(formData.budget)
    if (isNaN(budget) || budget < 0) {
      toast.error('Please enter a valid budget amount')
      return
    }

    const floors = formData.floors ? parseInt(formData.floors) : undefined
    if (floors !== undefined && (isNaN(floors) || floors < 1)) {
      toast.error('Please enter a valid number of floors')
      return
    }

    const sqft = formData.sqft ? parseFloat(formData.sqft) : undefined
    if (sqft !== undefined && (isNaN(sqft) || sqft < 0)) {
      toast.error('Please enter a valid square footage')
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: any = {}
      
      // Only include changed fields
      if (formData.name !== project.name) updateData.name = formData.name
      if (budget !== project.budget) updateData.budget = budget
      if (formData.description !== project.description) updateData.description = formData.description
      if (floors !== project.floors) updateData.floors = floors
      if (sqft !== project.sqft) updateData.sqft = sqft
      if (formData.address !== project.address) updateData.address = formData.address

      // If no changes, just close
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save')
        onClose()
        return
      }

      await TauriService.updateProject(project.id, updateData)
      
      toast.success('Project updated successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error(`Failed to update project: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
            Edit Project
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Update project information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input w-full"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="input w-full pl-8"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input w-full resize-none"
              rows={3}
              placeholder="Project description..."
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Floors
              </label>
              <input
                type="number"
                min="1"
                value={formData.floors}
                onChange={(e) => setFormData(prev => ({ ...prev, floors: e.target.value }))}
                className="input w-full"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Square Feet
              </label>
              <input
                type="number"
                min="0"
                value={formData.sqft}
                onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                className="input w-full"
                placeholder="0"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="input w-full"
              placeholder="Property address..."
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
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 