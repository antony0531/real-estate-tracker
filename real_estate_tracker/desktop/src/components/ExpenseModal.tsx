// ExpenseModal.tsx - Modal for adding/editing expenses with enhanced validation

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import { useValidation, ValidationRules } from '../hooks/useValidation'
import ValidatedField from './ui/ValidatedField'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId?: number
  projectName?: string
  projects?: Array<{id: number, name: string}>
  expense?: ExpenseData | null
}

interface ExpenseData {
  id?: number
  projectId: number
  roomName: string
  category: 'material' | 'labor'
  cost: number
  hours?: number
  condition?: number
  notes?: string
}

interface Room {
  name: string
  floor: number
  size?: string
  condition?: string
}

export default function ExpenseModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId,
  projectName,
  projects = [],
  expense 
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseData>({
    projectId: projectId || (projects.length > 0 ? projects[0].id : 1),
    roomName: expense?.roomName || '',
    category: expense?.category || 'material',
    cost: expense?.cost || 0,
    hours: expense?.hours || 0,
    condition: expense?.condition || 3,
    notes: expense?.notes || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [useCustomRoom, setUseCustomRoom] = useState(false)
  const [projectBudget, setProjectBudget] = useState<number>(0)
  const [projectSpent, setProjectSpent] = useState<number>(0)
  const [budgetWarning, setBudgetWarning] = useState<string>('')
  const [roomSuggestions, setRoomSuggestions] = useState<string[]>([])

  // Common room name suggestions
  const commonRooms = [
    'Living Room', 'Kitchen', 'Master Bedroom', 'Guest Bedroom', 'Master Bathroom', 
    'Guest Bathroom', 'Dining Room', 'Family Room', 'Office', 'Basement', 
    'Attic', 'Garage', 'Laundry Room', 'Pantry', 'Foyer', 'Hallway', 
    'Walk-in Closet', 'Powder Room', 'Mudroom', 'Sunroom', 'Den',
    'Utility Room', 'Workshop', 'Storage Room', 'Entryway', 'Stairway'
  ]

  // Comprehensive validation rules
  const validationRules: ValidationRules = {
    roomName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_.()]+$/,
      custom: (value: string) => {
        if (value && /[<>]/g.test(value)) {
          return 'Room name contains invalid characters'
        }
        // Check if room name is too generic
        if (value && value.trim().toLowerCase() === 'room') {
          return 'Please be more specific (e.g., "Living Room", "Master Bedroom")'
        }
        // Check if room exists in available rooms when not using custom input
        if (!useCustomRoom && availableRooms.length > 0 && value) {
          const roomExists = availableRooms.some(room => 
            room.name.toLowerCase() === value.toLowerCase()
          )
          if (!roomExists) {
            return `Room "${value}" doesn't exist in this project. Choose an existing room or click "Enter new room name" to add it.`
          }
        }
        return null
      }
    },
    cost: {
      required: true,
      min: 0.01,
      max: 1000000
    },
    hours: {
      min: 0,
      max: 50,
      custom: (value: number, formData: ExpenseData) => {
        if (formData?.category === 'labor' && formData?.cost > 0 && value > 0) {
          const hourlyRate = formData.cost / value
          if (hourlyRate > 200) {
            return 'Hourly rate seems high ($200+/hr)'
          }
          if (hourlyRate < 10) {
            return 'Hourly rate seems low ($10-/hr)'
          }
        }
        return null
      }
    },
    notes: {
      maxLength: 500
    }
  }

  const {
    validationState,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    hasErrors,
    clearAllValidation
  } = useValidation({
    rules: validationRules,
    validateOnChange: true,
    validateOnBlur: true
  })

  // Load rooms and budget when project changes or modal opens
  useEffect(() => {
    if (isOpen && formData.projectId) {
      loadRooms(formData.projectId)
      loadProjectBudget(formData.projectId)
    }
  }, [isOpen, formData.projectId])

  const loadProjectBudget = async (currentProjectId: number) => {
    try {
      const selectedProject = projects.find(p => p.id === currentProjectId)
      if (selectedProject) {
        // We'd need to add budget to the project data or fetch it separately
        // For now, we'll use a placeholder
        setProjectBudget(150000) // Placeholder
      }
      
      // Get current spending
      const expensesOutput = await TauriService.getExpenses(currentProjectId)
      const currentSpent = parseExpensesTotal(expensesOutput)
      setProjectSpent(currentSpent)
    } catch (error) {
      console.warn('Could not load project budget:', error)
    }
  }

  const parseExpensesTotal = (output: string): number => {
    let total = 0
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const costMatch = line.match(/\$([0-9,]+\.[0-9]+)/)
        if (costMatch) {
          const costValue = parseFloat(costMatch[1].replace(/,/g, ''))
          if (!isNaN(costValue)) {
            total += costValue
          }
        }
      }
    }
    
    return total
  }

  const loadRooms = async (currentProjectId: number) => {
    try {
      setIsLoadingRooms(true)
      console.log('[ROOMS] Loading rooms for project:', currentProjectId)
      const roomsOutput = await TauriService.getRooms(currentProjectId)
      console.log('[ROOMS] Raw rooms output:', roomsOutput)
      
      const rooms = parseRoomsFromOutput(roomsOutput)
      setAvailableRooms(rooms)
      console.log('[ROOMS] Parsed rooms:', rooms)
      
      // If no rooms exist, automatically enable custom room input
      if (rooms.length === 0) {
        setUseCustomRoom(true)
        toast.info('No rooms found in this project. You can add a room name below.')
      } else {
        setUseCustomRoom(false)
        // If editing an expense, check if the room exists in available rooms
        if (expense?.roomName && !rooms.find(r => r.name === expense.roomName)) {
          setUseCustomRoom(true)
        } else if (!expense && !formData.roomName && rooms.length > 0) {
          // Auto-select first room for new expense if no room is selected
          setFormData(prev => ({ ...prev, roomName: rooms[0].name }))
        }
      }
    } catch (error) {
      console.error('[ROOMS] Failed to load rooms:', error)
      toast.error('Failed to load rooms. You can still enter a room name manually.')
      setAvailableRooms([])
      setUseCustomRoom(true)
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const parseRoomsFromOutput = (output: string): Room[] => {
    const rooms: Room[] = []
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      // Look for room data lines (start with │ and contain room info)
      if (line.startsWith('│') && !line.includes('Name') && !line.includes('━')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 4) {
          const name = columns[0]
          const floor = parseInt(columns[1], 10)
          const size = columns[2]
          const condition = columns[3]
          
          if (name && !isNaN(floor)) {
            rooms.push({
              name: name.trim(),
              floor,
              size: size !== 'Not set' ? size : undefined,
              condition
            })
          }
        }
      }
    }
    
    return rooms
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Final validation before submission
      const isValid = validateForm(formData)
      if (!isValid) {
        toast.error('Please fix the validation errors before submitting')
        return
      }

      // Check if room exists, and offer to create it if it doesn't
      if (useCustomRoom && formData.roomName) {
        const roomExists = availableRooms.some(room => 
          room.name.toLowerCase() === formData.roomName.toLowerCase()
        )
        
        if (!roomExists) {
          const createRoom = confirm(
            `Room "${formData.roomName}" doesn't exist in this project.\n\n` +
            `Would you like to create it automatically?\n\n` +
            `(It will be added to Floor 1 with default settings)`
          )
          
          if (createRoom) {
            try {
              await TauriService.addRoom({
                projectId: formData.projectId,
                name: formData.roomName,
                floor: 1,
                condition: 3
              })
              toast.success(`Created room "${formData.roomName}" on Floor 1`)
              // Reload rooms to include the new one
              await loadRooms(formData.projectId)
            } catch (roomError) {
              toast.error(`Failed to create room: ${TauriService.handleError(roomError)}`)
              return
            }
          } else {
            toast.info('Please select an existing room or create the room first')
            return
          }
        }
      }

      // Check budget warning (but allow submission)
      const remainingBudget = projectBudget - projectSpent
      if (formData.cost > remainingBudget && remainingBudget > 0) {
        setBudgetWarning(`This expense ($${formData.cost.toLocaleString()}) exceeds remaining budget by $${(formData.cost - remainingBudget).toLocaleString()}`)
      } else {
        setBudgetWarning('')
      }

      if (expense) {
        // Update existing expense (not implemented yet)
        toast.info('Expense editing coming soon!')
      } else {
        // Create new expense
        await TauriService.addExpense(formData)
        
        // Show success message with budget warning if applicable
        if (budgetWarning || (formData.cost > remainingBudget && remainingBudget > 0)) {
          toast.success('Expense added successfully!')
          toast.warning(`⚠️ OVER BUDGET: This expense exceeds your remaining budget by $${(formData.cost - remainingBudget).toLocaleString()}`, {
            duration: 6000
          })
        } else {
          toast.success('Expense added successfully!')
        }
        
        onSuccess()
        onClose()
        
        // Reset form and validation
        setFormData({
          projectId: projectId || (projects.length > 0 ? projects[0].id : 1),
          roomName: '',
          category: 'material',
          cost: 0,
          hours: 0,
          condition: 3,
          notes: ''
        })
        clearAllValidation()
        setBudgetWarning('')
      }
    } catch (error) {
      const errorMessage = TauriService.handleError(error)
      
      // Check for specific room not found error
      if (errorMessage.includes("not found in project")) {
        toast.error(
          `Room "${formData.roomName}" doesn't exist in this project.\n\n` +
          `Available rooms: ${availableRooms.map(r => r.name).join(', ')}\n\n` +
          `Click "Enter new room name" above to add a new room, or select an existing one.`,
          { duration: 8000 }
        )
      } else {
        toast.error(`Failed to add expense: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: name === 'cost' || name === 'hours' || name === 'condition' || name === 'projectId'
        ? value === '' ? 0 : Number(value)
        : value
    }
    
    setFormData(newFormData)
    
    // Trigger validation
    handleFieldChange(name, newFormData[name as keyof ExpenseData], newFormData)
    
    // Update room suggestions based on input
    if (name === 'roomName' && typeof value === 'string') {
      const inputLower = value.toLowerCase()
      if (inputLower.length > 0) {
        const suggestions = commonRooms.filter(room => 
          room.toLowerCase().includes(inputLower) && 
          room.toLowerCase() !== inputLower
        ).slice(0, 5)
        setRoomSuggestions(suggestions)
      } else {
        setRoomSuggestions([])
      }
    }

    // Check budget warning in real-time when cost changes
    if (name === 'cost' && typeof newFormData.cost === 'number') {
      const remainingBudget = projectBudget - projectSpent
      if (newFormData.cost > remainingBudget && remainingBudget > 0) {
        setBudgetWarning(`This expense ($${newFormData.cost.toLocaleString()}) exceeds remaining budget by $${(newFormData.cost - remainingBudget).toLocaleString()}`)
      } else {
        setBudgetWarning('')
      }
    }
    
    // If project changed, reload rooms
    if (name === 'projectId' && Number(value) !== formData.projectId) {
      loadRooms(Number(value))
      loadProjectBudget(Number(value))
      // Reset room name when project changes
      setFormData(prev => ({ ...prev, roomName: '' }))
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const processedValue = name === 'cost' || name === 'hours' || name === 'condition' || name === 'projectId'
      ? value === '' ? 0 : Number(value)
      : value
    handleFieldBlur(name, processedValue, formData)
  }

  const selectedProject = projects.find(p => p.id === formData.projectId)
  const showProjectSelection = !projectId && projects.length > 0
  const remainingBudget = projectBudget - projectSpent

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Budget Info */}
        {projectBudget > 0 && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span>Budget: ${projectBudget.toLocaleString()}</span>
                <span>Spent: ${projectSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className={remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Remaining: ${remainingBudget.toLocaleString()}
                </span>
                <span className="text-xs">
                  {((projectSpent / projectBudget) * 100).toFixed(1)}% used
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Selection */}
          {showProjectSelection ? (
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Project *
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                {projects.length === 0 && (
                  <option value="">No projects available</option>
                )}
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    #{project.id} - {project.name}
                  </option>
                ))}
              </select>
              {projects.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please create a project first before adding expenses.
                </p>
              )}
            </div>
          ) : (
            /* Project Info */
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Adding expense to: <span className="font-medium">
                  {projectName || selectedProject?.name || `Project #${formData.projectId}`}
                </span>
              </p>
            </div>
          )}

          {/* Room Name with Enhanced UI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Room Name *
              </label>
              {availableRooms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseCustomRoom(!useCustomRoom)}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {useCustomRoom ? 'Choose from existing rooms' : 'Enter new room name'}
                </button>
              )}
            </div>
            
            {isLoadingRooms ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading rooms...</span>
              </div>
            ) : useCustomRoom ? (
              <div>
                <ValidatedField
                  label=""
                  fieldName="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  validation={validationState.roomName}
                  required
                  placeholder="e.g., Living Room, Kitchen, Bathroom"
                />
                
                {/* Room Name Suggestions */}
                {roomSuggestions.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 mb-1 font-medium">
                      Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {roomSuggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, roomName: suggestion }))
                            setRoomSuggestions([])
                            handleFieldChange('roomName', suggestion, { ...formData, roomName: suggestion })
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Validation Error with Helpful Message */}
                {validationState.roomName?.error && (
                  <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-200">
                      <strong>Can't add expense:</strong> {validationState.roomName.error}
                    </p>
                    {!roomSuggestions.length && formData.roomName.length < 2 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Try typing a room name like "Kitchen", "Living Room", or "Bathroom"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <select
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.map(room => (
                    <option key={room.name} value={room.name}>
                      {room.name} (Floor {room.floor}, Condition: {room.condition || 'N/A'})
                    </option>
                  ))}
                </select>
                
                {/* Validation Error for Dropdown */}
                {validationState.roomName?.error && (
                  <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-200">
                      <strong>Can't add expense:</strong> {validationState.roomName.error}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Please select a room from the dropdown or click "Enter new room name" above.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {availableRooms.length === 0 && !isLoadingRooms && !useCustomRoom && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                No rooms found in this project. Click "Enter new room name" to add an expense to a new room.
              </p>
            )}
          </div>

          {/* Category */}
          <ValidatedField
            label="Category"
            fieldName="category"
            type="select"
            value={formData.category}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            required
          >
            <option value="material">Material</option>
            <option value="labor">Labor</option>
          </ValidatedField>

          {/* Cost */}
          <ValidatedField
            label="Cost"
            fieldName="cost"
            type="number"
            value={formData.cost}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            validation={validationState.cost}
            required
            min={0}
            step={0.01}
            placeholder="0.00"
          />

          {/* Hours (for labor) */}
          {formData.category === 'labor' && (
            <ValidatedField
              label="Hours Worked"
              fieldName="hours"
              type="number"
              value={formData.hours}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              validation={validationState.hours}
              min={0}
              step={0.5}
              placeholder="0.0"
            />
          )}

          {/* Condition */}
          <ValidatedField
            label="Room Condition After Work (1-5 scale)"
            fieldName="condition"
            type="select"
            value={formData.condition}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </ValidatedField>

          {/* Notes */}
          <ValidatedField
            label="Notes"
            fieldName="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            validation={validationState.notes}
            placeholder="Additional notes about this expense..."
            rows={3}
          />

          {/* Budget Warning */}
          {budgetWarning && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  Budget Alert: {budgetWarning}
                </p>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                You can still add this expense, but it will put the project over budget.
              </p>
            </div>
          )}

          {/* Form Summary */}
          {hasErrors && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Please fix the errors above before submitting
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 