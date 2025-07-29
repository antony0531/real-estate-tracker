// Dashboard.tsx - Modern real estate portfolio dashboard
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import { dataCache } from '../services/dataCache'
import ExpenseModal from '../components/ExpenseModal'
import { RefreshCw, Building2, TrendingUp, DollarSign, Wallet } from 'lucide-react'

// Utility function to format large numbers in a readable way
const formatLargeNumber = (amount: number): string => {
  if (amount >= 1000000) {
    const millions = amount / 1000000
    return millions >= 10 ? `$${millions.toFixed(0)}M` : `$${millions.toFixed(1)}M`
  } else if (amount >= 100000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else if (amount >= 10000) {
    return `$${(amount / 1000).toFixed(1)}K`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  } else {
    return `$${amount.toLocaleString()}`
  }
}

// Utility function for smaller display amounts (without dollar sign)
const formatCompactNumber = (amount: number): string => {
  if (amount >= 1000000) {
    const millions = amount / 1000000
    return millions >= 10 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`
  } else if (amount >= 100000) {
    return `${(amount / 1000).toFixed(0)}K`
  } else if (amount >= 10000) {
    return `${(amount / 1000).toFixed(1)}K`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  } else {
    return amount.toLocaleString()
  }
}

// Utility function for percentage formatting
const formatPercentage = (value: number): string => {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1)
}

interface DashboardStats {
  projectCount: number
  totalBudget: number
  totalSpent: number
  isLoading: boolean
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    isLoading: true
  })
  const [projects, setProjects] = useState<{ id: number; name: string; budget: number }[]>([])
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()

    // Refresh data every 30 seconds instead of 5
    const refreshInterval = setInterval(() => {
      // Only refresh if the component is mounted and visible
      if (document.visibilityState === 'visible') {
        loadDashboardData()
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [])

  // Add visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const parseProjectData = (output: string): { count: number; totalBudget: number } => {
    console.log('[PROJECT] Starting to parse project data from output:', output.length)
    
    const lines = output.trim().split('\n')
    let projectCount = 0
    let totalBudget = 0

    for (const line of lines) {
      if (line.startsWith('│') && !line.startsWith('┃')) {
        // This is a data row
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // New format: ID, Name, Status, Priority, Budget, Type, Created
        if (columns.length >= 5) {
          const budgetColumn = columns[4] // 5th column (0-indexed) - Budget is now here
          
          if (budgetColumn && budgetColumn.includes('$')) {
            // Extract numeric value from budget string like "$150,000"
            const budgetValue = parseInt(budgetColumn.replace(/[$,]/g, ''), 10)
            if (!isNaN(budgetValue)) {
              totalBudget += budgetValue
              projectCount++
              console.log(`[PROJECT] Found project with budget: $${budgetValue.toLocaleString()}`)
            }
          }
        }
      }
    }

    console.log(`[PROJECT] Parsed ${projectCount} projects with total budget: $${totalBudget.toLocaleString()}`)
    return { count: projectCount, totalBudget }
  }

  const parseProjectsList = (output: string): { id: number; name: string; budget: number }[] => {
    const lines = output.trim().split('\n')
    const projects: { id: number; name: string; budget: number }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('│') && !line.startsWith('┃')) {
        // This is a data row
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // New format: ID, Name, Status, Priority, Budget, Type, Created
        if (columns.length >= 5) {
          const idColumn = columns[0] // 1st column (0-indexed)
          const nameColumn = columns[1] // 2nd column (0-indexed)
          const budgetColumn = columns[4] // 5th column (0-indexed) - Budget is now here

          if (idColumn && nameColumn && budgetColumn) {
            const id = parseInt(idColumn.trim(), 10)
            const budgetValue = parseInt(budgetColumn.trim().replace(/[$,]/g, ''), 10)

            if (!isNaN(id) && !isNaN(budgetValue)) {
              projects.push({ id, name: nameColumn.trim(), budget: budgetValue })
              console.log(`[SUCCESS] Parsed project: ID=${id}, Name="${nameColumn}", Budget=$${budgetValue.toLocaleString()}`)
            } else {
              console.log(`[WARN] Could not parse ID or Budget from line: ${JSON.stringify(line)}`)
            }
          } else {
            console.log(`[WARN] Could not parse ID, Name, or Budget from line: ${JSON.stringify(line)}`)
          }
        } else {
          console.log(`[WARN] Line has insufficient columns: ${JSON.stringify(line)}`)
        }
      }
    }

    console.log(`[PROJECTS] Parsed ${projects.length} projects for expense modal`)
    return projects
  }

  const parseAllExpensesTotalSpent = (output: string): number => {
    // Parse total expenses from the combined output of all projects
    console.log('[EXPENSE] Parsing total expenses from output length:', output.length)
    
    const lines = output.trim().split('\n')
    let totalExpenses = 0

    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        // Extract expense amount from the line
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // Look for a column that contains a dollar amount
        for (const column of columns) {
          if (column.includes('$')) {
            const expenseMatch = column.match(/\$[\d,]+(?:\.\d{2})?/)
            if (expenseMatch) {
              const expenseAmount = parseFloat(expenseMatch[0].replace(/[$,]/g, ''))
              if (!isNaN(expenseAmount)) {
                totalExpenses += expenseAmount
                console.log(`[EXPENSE] Found expense: $${expenseAmount.toLocaleString()}`)
              }
            }
          }
        }
      }
    }

    console.log(`[EXPENSE] Total expenses calculated: $${totalExpenses.toLocaleString()}`)
    return totalExpenses
  }

  const parseExpensesFromOutput = (output: string): { cost: number }[] => {
    const expenses: { cost: number }[] = []
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      if (line.startsWith('│') && !line.startsWith('┃')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // Look for the amount column (usually the last one before actions)
        if (columns.length >= 4) {
          const amountColumn = columns[columns.length - 2] // Second to last column
          const costMatch = amountColumn.match(/\$([0-9,]+(?:\.[0-9]+)?)/)
          if (costMatch) {
            const cost = parseFloat(costMatch[1].replace(/,/g, ''))
            if (!isNaN(cost)) {
              expenses.push({ cost })
              console.log(`[DASHBOARD] Found expense: $${cost}`)
            }
          }
        }
      }
    }
    
    console.log(`[DASHBOARD] Total expenses found: ${expenses.length}, Total amount: $${expenses.reduce((sum, exp) => sum + exp.cost, 0)}`)
    return expenses
  }

  const loadDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }))

      console.log('[DASHBOARD] Loading portfolio data...')
      
      // Get projects data
      console.log('[DASHBOARD] Fetching projects data...')
      const projectsOutput = await TauriService.getProjects()
      console.log('[DASHBOARD] Raw projects output:', projectsOutput)
      
      // Parse project count and budget from CLI output  
      const { count: projectCount, totalBudget } = parseProjectData(projectsOutput)
      console.log('[DASHBOARD] Parsed project data:', { projectCount, totalBudget })

      // Parse and set projects list for expense modal
      const projectsList = parseProjectsList(projectsOutput)
      console.log('[DASHBOARD] Parsed projects list:', projectsList)
      setProjects(projectsList)

      // Calculate total spent across all projects (optimized)
      console.log('[DASHBOARD] Calculating total expenses...')
      let totalSpent = 0
      const projectSpents: { [key: number]: number } = {}
      
      if (projectCount > 0) {
        // Calculate expenses per project since getAllExpenses requires project iteration
        console.log('[DASHBOARD] Calculating expenses per project...')
        for (const project of projectsList) {
          try {
            const expensesOutput = await TauriService.getExpenses(project.id)
            console.log(`[DASHBOARD] Raw expenses output for project ${project.id}:`, expensesOutput)
            const expenses = parseExpensesFromOutput(expensesOutput)
            const projectSpent = expenses.reduce((sum, exp) => sum + exp.cost, 0)
            projectSpents[project.id] = projectSpent
            totalSpent += projectSpent
            console.log(`[DASHBOARD] Project ${project.id} (${project.name}): $${projectSpent.toLocaleString()}`)
          } catch (err) {
            console.warn(`[DASHBOARD] Could not load expenses for project ${project.id} (${project.name}):`, err)
          }
        }
      }

      console.log(`[DASHBOARD] Total spent across all projects: $${totalSpent.toLocaleString()}`)

      const finalStats = {
        projectCount,
        totalBudget,
        totalSpent,
        isLoading: false
      }

      setStats(finalStats)
      
      // Cache the results
      dataCache.setDashboardStats(finalStats)
      if (projectsList.length > 0) {
        // Convert to proper ProjectData format for cache
        const projectsForCache = projectsList.map(p => ({
          ...p,
          spent: projectSpents[p.id] || 0, // Use the actual spent amount for each project
          status: 'active' // Default status
        }))
        dataCache.setProjects(projectsForCache)
      }
      
      console.log('[DASHBOARD] Portfolio data loaded successfully')
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error(`Failed to load dashboard: ${TauriService.handleError(error)}`)
      setStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1114]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                disabled={stats.isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                {stats.isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {stats.isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Overview of your real estate portfolio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-[#1d2328] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.projectCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-[#1d2328] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatLargeNumber(stats.totalBudget)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-[#1d2328] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatLargeNumber(stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Available Budget */}
          <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-[#1d2328] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Budget</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatLargeNumber(stats.totalBudget - stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Monday.com Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Quick Action
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Add New Project</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Start tracking a new renovation project with budget and details.</p>
              <button 
                onClick={() => navigate('/projects')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Create Project
              </button>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Record
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Log Expense</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Record materials, labor costs, and other project expenses.</p>
              <button 
                onClick={() => setIsExpenseModalOpen(true)}
                disabled={stats.projectCount === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {stats.projectCount === 0 ? 'Create Project First' : 'Add Expense'}
              </button>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  Analytics
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">View Reports</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Analyze project performance, costs, and budget utilization.</p>
              <button 
                onClick={() => navigate('/reports')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity - Timeline Style */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Latest updates from your renovation projects</p>
            </div>
            {stats.projectCount > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Add Expense
                </button>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <button 
                  onClick={() => navigate('/projects')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View Projects →
                </button>
              </div>
            )}
          </div>
          
          {stats.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats.projectCount === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Ready to Start Building!</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Begin your real estate journey by creating your first renovation project. Track expenses, manage budgets, and monitor progress all in one place.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/projects')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Create Your First Project
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Portfolio Initialized
                    </h4>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.projectCount} project{stats.projectCount !== 1 ? 's' : ''} actively monitored with {formatLargeNumber(stats.totalBudget)} total investment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Budget Utilization Tracking
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stats.totalBudget > 0 && stats.totalSpent / stats.totalBudget > 0.8 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : stats.totalBudget > 0 && stats.totalSpent / stats.totalBudget > 0.6
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {stats.totalBudget > 0 ? `${formatPercentage((stats.totalSpent / stats.totalBudget) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatLargeNumber(stats.totalSpent)} spent of {formatLargeNumber(stats.totalBudget)} budget - {stats.totalBudget > 0 && stats.totalSpent / stats.totalBudget > 0.8 ? 'Monitor closely' : 'On track'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Performance Insights
                    </h4>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                      Updated
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Portfolio health: {stats.totalBudget > 0 && stats.totalSpent / stats.totalBudget < 0.8 ? 'Excellent' : 'Needs attention'} • 
                    {stats.projectCount > 0 ? ' Active management' : ' Ready to start'} • 
                    {formatCompactNumber(stats.totalBudget - stats.totalSpent)}K remaining capacity
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quick Actions</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      disabled={stats.projectCount === 0}
                    >
                      Add Expense
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <button 
                      onClick={() => navigate('/projects')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      View Projects →
                    </button>
                  </div>
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
        onSuccess={loadDashboardData}
        projects={projects}
      />
    </div>
  )
} 