// Expenses.tsx - Expense management page

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import ExpenseModal from '../components/ExpenseModal'

interface Expense {
  id: number
  date: string
  projectName: string
  projectId: number
  roomName: string
  description: string
  category: string
  cost: number
  hours?: number
  notes?: string
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Array<{id: number, name: string}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setIsLoading(true)
      
      // Get all projects first
      const projectsOutput = await TauriService.getProjects()
      const projectsData = parseProjectsFromOutput(projectsOutput)
      setProjects(projectsData)
      
      // Get all expenses
      const allExpensesOutput = await TauriService.getAllExpenses()
      const expensesData = parseAllExpensesFromOutput(allExpensesOutput, projectsData)
      setExpenses(expensesData)
      
    } catch (error) {
      console.error('Failed to load expenses:', error)
      toast.error(`Failed to load expenses: ${TauriService.handleError(error)}`)
      setExpenses([])
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const parseProjectsFromOutput = (output: string) => {
    const lines = output.trim().split('\n')
    const projects: Array<{id: number, name: string}> = []
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        if (columns.length >= 2) {
          const id = parseInt(columns[0])
          const name = columns[1]
          if (!isNaN(id) && name) {
            projects.push({ id, name })
          }
        }
      }
    }
    
    return projects
  }

  const parseAllExpensesFromOutput = (output: string, projectsData: Array<{id: number, name: string}>): Expense[] => {
    const expenses: Expense[] = []
    const projectSections = output.split('\n---PROJECT_SEPARATOR---\n')
    
    projectSections.forEach((section, projectIndex) => {
      const lines = section.trim().split('\n')
      
      // Find project name from section header or use project index
      let projectName = 'Unknown Project'
      let projectId = projectIndex + 1
      
      for (const line of lines) {
        if (line.includes('Expenses for Project:')) {
          const match = line.match(/Expenses for Project: (.+)/)
          if (match) {
            projectName = match[1].trim()
            // Try to find project ID from projectsData
            const foundProject = projectsData.find(p => p.name === projectName)
            if (foundProject) {
              projectId = foundProject.id
            }
          }
          break
        }
      }
      
      // Parse expense table rows
      for (const line of lines) {
        if (line.startsWith('│') && line.includes('$')) {
          const columns = line.split('│').map(col => col.trim()).filter(col => col)
          
          if (columns.length >= 5) {
            const [date, roomName, category, cost, hours, notes] = columns
            
            const costMatch = cost.match(/\$([0-9,]+\.[0-9]+)/)
            const costValue = costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0
            
            const hoursValue = hours && hours !== '-' ? parseFloat(hours) : undefined
            
            expenses.push({
              id: expenses.length + 1,
              date: date || 'Unknown',
              projectName,
              projectId,
              roomName: roomName || 'Unknown Room',
              description: notes || `${category} expense in ${roomName}`,
              category: category || 'Unknown',
              cost: costValue,
              hours: hoursValue,
              notes: notes || ''
            })
          }
        }
      }
    })
    
    return expenses
  }

  const filteredExpenses = expenses.filter(expense => {
    const projectMatch = selectedProject === 'all' || expense.projectId.toString() === selectedProject
    const categoryMatch = selectedCategory === 'all' || expense.category.toLowerCase() === selectedCategory.toLowerCase()
    return projectMatch && categoryMatch
  })

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.cost, 0)
  const materialExpenses = filteredExpenses.filter(e => e.category.toLowerCase() === 'material').reduce((sum, e) => sum + e.cost, 0)
  const laborExpenses = filteredExpenses.filter(e => e.category.toLowerCase() === 'labor').reduce((sum, e) => sum + e.cost, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthExpenses = filteredExpenses.filter(e => {
    const expenseDate = new Date(e.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  }).reduce((sum, e) => sum + e.cost, 0)

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'material': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'labor': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const handleAddExpense = () => {
    if (projects.length === 0) {
      toast.error('Please create a project first before adding expenses')
      return
    }
    setIsExpenseModalOpen(true)
  }

  const handleExpenseSuccess = () => {
    loadExpenses()
    toast.success('Expense added successfully!')
  }

  const handleEditExpense = (expense: Expense) => {
    toast.info('Expense editing functionality coming soon!')
    console.log('Edit expense:', expense)
  }

  const handleDeleteExpense = (expense: Expense) => {
    if (confirm(`Are you sure you want to delete this ${expense.category} expense of $${expense.cost.toLocaleString()}?`)) {
      toast.info('Expense deletion functionality coming soon!')
      console.log('Delete expense:', expense)
      // TODO: Implement actual deletion via TauriService.deleteExpense(expense.id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track expenses across your projects
          </p>
        </div>
        <button 
          className="btn-primary px-4 py-2"
          onClick={handleAddExpense}
        >
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Project</label>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="form-select"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id.toString()}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="all">All Categories</option>
            <option value="material">Material</option>
            <option value="labor">Labor</option>
          </select>
        </div>
      </div>

      {/* Expense Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Across all projects</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">This Month</h3>
          <p className="text-2xl font-bold text-orange-600">${thisMonthExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Current month spending</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Materials</h3>
          <p className="text-2xl font-bold text-blue-600">${materialExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Material expenses</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Labor</h3>
          <p className="text-2xl font-bold text-green-600">${laborExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Labor expenses</p>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No Expenses Recorded</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start tracking your project expenses to get insights into your spending patterns.
          </p>
          <div className="space-y-4">
            <button 
              className="btn-primary"
              onClick={handleAddExpense}
            >
              Add First Expense
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Choose from your available projects and start tracking expenses</p>
              <p>This feature includes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Add expenses by category (Materials, Labor, etc.)</li>
                <li>Track expenses per project and room</li>
                <li>View expense summaries and budget analysis</li>
                <li>Filter expenses by project and category</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {expense.date}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {expense.projectName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {expense.description}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${expense.cost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={handleExpenseSuccess}
        projects={projects}
        projectId={undefined}
        projectName={undefined}
      />
    </div>
  )
} 