// ProjectView.tsx - Individual project details page

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import ExpenseModal from '../components/ExpenseModal'

interface ProjectData {
  id: number
  name: string
  status: string
  budget: number
  type: string
  created: string
  description?: string
  address?: string
  sqft?: number
  floors?: number
}

interface ExpenseData {
  id: number
  date: string
  roomName: string
  category: string
  cost: number
  hours?: number
  notes?: string
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [expenses, setExpenses] = useState<ExpenseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId)
    }
  }, [projectId])

  const loadProjectData = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get all projects and find the specific one
      const projectsOutput = await TauriService.getProjects()
      const projects = parseProjectsFromOutput(projectsOutput)
      const foundProject = projects.find(p => p.id.toString() === id)
      
      if (foundProject) {
        setProject(foundProject)
        // Load expenses for this project
        await loadProjectExpenses(foundProject.id)
      } else {
        setError(`Project #${id} not found`)
        toast.error(`Project #${id} not found`)
      }
      
    } catch (err) {
      const errorMsg = `Failed to load project: ${TauriService.handleError(err)}`
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjectExpenses = async (projectId: number) => {
    try {
      setIsLoadingExpenses(true)
      const expensesOutput = await TauriService.getExpenses(projectId)
      const parsedExpenses = parseExpensesFromOutput(expensesOutput)
      setExpenses(parsedExpenses)
    } catch (err) {
      console.warn('Could not load expenses:', err)
      // Don't show error for expenses - project might not have any yet
      setExpenses([])
    } finally {
      setIsLoadingExpenses(false)
    }
  }

  const parseProjectsFromOutput = (output: string): ProjectData[] => {
    const lines = output.trim().split('\n')
    const projects: ProjectData[] = []
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 6) {
          const [id, name, status, budget, type, created] = columns
          
          const budgetMatch = budget.match(/\$([0-9,]+)/)
          const budgetValue = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : 0
          
          projects.push({
            id: parseInt(id) || 0,
            name: name || 'Unnamed Project',
            status: status || 'Unknown',
            budget: budgetValue,
            type: type || 'Unknown',
            created: created || 'Unknown',
            // Mock additional data since CLI doesn't provide it yet
            description: 'Project details will be available when integrated with full CLI',
            address: 'Address information coming soon',
            sqft: budgetValue > 1000000 ? 3500 : budgetValue > 500000 ? 2200 : 1800,
            floors: budgetValue > 1000000 ? 3 : 2
          })
        }
      }
    }
    
    return projects
  }

  const parseExpensesFromOutput = (output: string): ExpenseData[] => {
    const lines = output.trim().split('\n')
    const expenses: ExpenseData[] = []
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 5) {
          const [date, roomName, category, cost, hours, notes] = columns
          
          const costMatch = cost.match(/\$([0-9,]+\.[0-9]+)/)
          const costValue = costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0
          
          const hoursValue = hours && hours !== '-' ? parseFloat(hours) : undefined
          
          expenses.push({
            id: expenses.length + 1, // Temporary ID
            date: date || 'Unknown',
            roomName: roomName || 'Unknown Room',
            category: category || 'Unknown',
            cost: costValue,
            hours: hoursValue,
            notes: notes || ''
          })
        }
      }
    }
    
    return expenses
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'in progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'on hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const calculateTotalSpent = () => {
    return expenses.reduce((total, expense) => total + expense.cost, 0)
  }

  const calculateRemaining = () => {
    if (!project) return 0
    return project.budget - calculateTotalSpent()
  }

  const calculateProgress = () => {
    if (!project) return 0
    const spent = calculateTotalSpent()
    return Math.floor((spent / project.budget) * 100)
  }

  const handleAddExpense = () => {
    setIsExpenseModalOpen(true)
  }

  const handleExpenseSuccess = () => {
    if (project) {
      loadProjectExpenses(project.id)
      toast.success('Expense added successfully!')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/projects" className="text-blue-600 hover:text-blue-800">
              ← Back to Projects
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link to="/projects" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || `Project #${projectId} could not be loaded`}
          </p>
          <Link to="/projects" className="btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/projects" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
        
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Project #{project.id} • Created {project.created}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              className="btn-outline px-4 py-2 opacity-50 cursor-not-allowed"
              disabled
              title="Edit functionality coming soon"
            >
              Edit Project
            </button>
            <button 
              className="btn-primary px-4 py-2"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Project Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Property Type:</span>
              <span className="font-medium">{project.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Square Footage:</span>
              <span className="font-medium">{project.sqft?.toLocaleString() || 'N/A'} sq ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Floors:</span>
              <span className="font-medium">{project.floors || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Address:</span>
              <span className="font-medium text-xs">{project.address}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
              <span className="font-semibold text-green-600">${project.budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
              <span className="font-semibold text-red-600">${calculateTotalSpent().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
              <span className="font-semibold text-blue-600">${calculateRemaining().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Budget Used:</span>
              <span className="font-medium">{calculateProgress()}%</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Progress</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Budget utilization
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {calculateProgress()}% of budget utilized
            </div>
          </div>
        </div>
      </div>

      {/* Rooms and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Rooms</h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🏠</div>
            <p className="mb-4">No rooms added yet</p>
            <button 
              className="btn-outline px-4 py-2 opacity-50 cursor-not-allowed"
              disabled
              title="Room management coming soon"
            >
              Add First Room
            </button>
            <p className="text-xs mt-2 text-gray-400">
              💡 Room management integration coming soon
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <button 
              className="btn-primary px-3 py-1 text-sm"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
          </div>
          
          {isLoadingExpenses ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">💰</div>
              <p className="mb-4">No expenses recorded yet</p>
              <button 
                className="btn-primary"
                onClick={handleAddExpense}
              >
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{expense.roomName}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      ${expense.cost.toFixed(2)}
                    </span>
                  </div>
                  {expense.hours && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {expense.hours} hours
                    </p>
                  )}
                  {expense.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {expense.notes}
                    </p>
                  )}
                </div>
              ))}
              
              {/* Total */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="font-bold text-red-600">
                    ${calculateTotalSpent().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={handleExpenseSuccess}
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  )
} 