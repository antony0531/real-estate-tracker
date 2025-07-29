// ModernDashboard.tsx - Enhanced dashboard with interactive charts and modern UI
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import { dataCache } from '../services/dataCache'
import ExpenseModal from '../components/ExpenseModal'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState, NoDataEmptyState } from '../components/ui/EmptyState'
import {
  RefreshCw,
  Building2,
  TrendingUp,
  DollarSign,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Home,
  PieChartIcon,
} from 'lucide-react'
import { cn } from '../utils/cn'

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value}`
}

interface DashboardStats {
  projectCount: number
  totalBudget: number
  totalSpent: number
  isLoading: boolean
}

interface Project {
  id: number
  name: string
  budget: number
  spent?: number
  status?: string
}

interface ChartDataPoint {
  name: string
  budget: number
  spent: number
  available: number
}

// Modern color palette for charts
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
}

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

export default function ModernDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    isLoading: true,
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[DASHBOARD] Initial load')
    loadDashboardData()

    // Refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('[DASHBOARD] Auto-refresh triggered (5 min interval)')
        loadDashboardData()
      }
    }, 300000) // 5 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  // Parse functions (reusing from original Dashboard)
  const parseProjectData = (output: string): { count: number; totalBudget: number } => {
    const lines = output.trim().split('\n')
    let projectCount = 0
    let totalBudget = 0

    for (const line of lines) {
      if (line.startsWith('│') && !line.startsWith('┃')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 5) {
          const budgetColumn = columns[4]
          
          if (budgetColumn && budgetColumn.includes('$')) {
            const budgetValue = parseInt(budgetColumn.replace(/[$,]/g, ''), 10)
            if (!isNaN(budgetValue)) {
              totalBudget += budgetValue
              projectCount++
            }
          }
        }
      }
    }

    return { count: projectCount, totalBudget }
  }

  const parseProjectsList = (output: string): Project[] => {
    const lines = output.trim().split('\n')
    const projects: Project[] = []

    for (const line of lines) {
      if (line.startsWith('│') && !line.startsWith('┃')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 5) {
          const idColumn = columns[0]
          const nameColumn = columns[1]
          const budgetColumn = columns[4]

          if (idColumn && nameColumn && budgetColumn) {
            const id = parseInt(idColumn.trim(), 10)
            const budgetValue = parseInt(budgetColumn.trim().replace(/[$,]/g, ''), 10)

            if (!isNaN(id) && !isNaN(budgetValue)) {
              projects.push({ id, name: nameColumn.trim(), budget: budgetValue })
            }
          }
        }
      }
    }

    return projects
  }

  const parseExpensesFromOutput = (output: string): { cost: number }[] => {
    console.log('[DASHBOARD] Parsing expenses from output:', output)
    const expenses: { cost: number }[] = []
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      // Skip header and separator lines
      if (line.includes('──') || line.includes('Date') || line.includes('Cost')) {
        continue
      }
      
      // Look for lines with expense data (containing $ symbol)
      if (line.includes('$')) {
        // Extract cost from any position in the line
        const costMatch = line.match(/\$([0-9,]+(?:\.[0-9]+)?)/)
        if (costMatch) {
          const cost = parseFloat(costMatch[1].replace(/,/g, ''))
          if (!isNaN(cost) && cost > 0) {
            expenses.push({ cost })
            console.log('[DASHBOARD] Found expense:', cost)
          }
        }
      }
    }
    
    console.log('[DASHBOARD] Total expenses parsed:', expenses.length, 'Total cost:', expenses.reduce((sum, e) => sum + e.cost, 0))
    return expenses
  }

  const loadDashboardData = async () => {
    try {
      console.log('[DASHBOARD] Loading dashboard data...')
      setStats(prev => ({ ...prev, isLoading: true }))

      const projectsOutput = await TauriService.getProjects()
      const { count: projectCount, totalBudget } = parseProjectData(projectsOutput)
      const projectsList = parseProjectsList(projectsOutput)
      setProjects(projectsList)

      let totalSpent = 0
      const projectSpents: { [key: number]: number } = {}
      const chartDataPoints: ChartDataPoint[] = []
      
      if (projectCount > 0) {
        for (const project of projectsList) {
          try {
            console.log(`[DASHBOARD] Loading expenses for project ${project.id} - ${project.name}`)
            const expensesOutput = await TauriService.getExpenses(project.id)
            console.log(`[DASHBOARD] Raw expenses output for project ${project.id}:`, expensesOutput)
            
            const expenses = parseExpensesFromOutput(expensesOutput)
            const projectSpent = expenses.reduce((sum, exp) => sum + exp.cost, 0)
            projectSpents[project.id] = projectSpent
            totalSpent += projectSpent
            
            console.log(`[DASHBOARD] Project ${project.id} spent: $${projectSpent}`)
            
            // Add to chart data
            chartDataPoints.push({
              name: project.name,
              budget: project.budget,
              spent: projectSpent,
              available: project.budget - projectSpent,
            })
          } catch (err) {
            console.error(`[DASHBOARD] ERROR loading expenses for project ${project.id}:`, err)
          }
        }
      }

      setChartData(chartDataPoints)

      const finalStats = {
        projectCount,
        totalBudget,
        totalSpent,
        isLoading: false,
      }

      setStats(finalStats)
      dataCache.setDashboardStats(finalStats)
      
      console.log('[DASHBOARD] Data loaded successfully:', finalStats)
      console.log('[DASHBOARD] Chart data:', chartDataPoints)
      console.log('[DASHBOARD] Last refresh:', new Date().toLocaleTimeString())
      
      setLastRefresh(new Date())
      toast.success('Dashboard refreshed successfully', { duration: 2000 })
      
    } catch (error) {
      console.error('[DASHBOARD] Failed to load dashboard data:', error)
      toast.error(`Failed to load dashboard: ${TauriService.handleError(error)}`)
      setStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  const budgetUtilization = stats.totalBudget > 0 
    ? (stats.totalSpent / stats.totalBudget) * 100 
    : 0

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-amber-600 dark:text-amber-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getUtilizationBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 dark:bg-red-900/20'
    if (percentage >= 75) return 'bg-amber-100 dark:bg-amber-900/20'
    if (percentage >= 50) return 'bg-blue-100 dark:bg-blue-900/20'
    return 'bg-emerald-100 dark:bg-emerald-900/20'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time overview of your real estate portfolio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                console.log('[DASHBOARD] Manual refresh triggered')
                loadDashboardData()
              }}
              disabled={stats.isLoading}
              leftIcon={<RefreshCw className={cn('w-4 h-4', stats.isLoading && 'animate-spin')} />}
            >
              {stats.isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Auto-refresh: 5 min
              </span>
              {lastRefresh && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Projects
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.isLoading ? <Skeleton width={60} height={36} /> : stats.projectCount}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <Building2 className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-gray-500">Active portfolio</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Budget
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.isLoading ? <Skeleton width={100} height={36} /> : formatCompactCurrency(stats.totalBudget)}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">+12.5% vs last month</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Spent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.isLoading ? <Skeleton width={100} height={36} /> : formatCompactCurrency(stats.totalSpent)}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <Activity className="w-4 h-4 mr-1" />
                      <span className={cn(
                        'font-medium',
                        getUtilizationColor(budgetUtilization)
                      )}>
                        {budgetUtilization.toFixed(1)}% utilized
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Budget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Available Budget
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.isLoading ? <Skeleton width={100} height={36} /> : formatCompactCurrency(stats.totalBudget - stats.totalSpent)}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <Wallet className="w-4 h-4 mr-1 text-purple-500" />
                      <span className="text-purple-600 dark:text-purple-400">
                        {((1 - stats.totalSpent / stats.totalBudget) * 100).toFixed(0)}% remaining
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Spent Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Spent by Project</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <Skeleton height={300} />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCompactCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="budget" fill={CHART_COLORS.primary} name="Budget" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="spent" fill={CHART_COLORS.secondary} name="Spent" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataEmptyState entityName="project" onAddNew={() => navigate('/projects')} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Budget Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Budget Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <Skeleton height={300} />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="budget"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataEmptyState entityName="project" onAddNew={() => navigate('/projects')} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Spending Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Skeleton height={300} />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="budget" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorBudget)" />
                    <Area type="monotone" dataKey="spent" stroke={CHART_COLORS.secondary} fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <NoDataEmptyState entityName="project" onAddNew={() => navigate('/projects')} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              variant="gradient" 
              className="cursor-pointer hover:shadow-xl transition-all"
              onClick={() => navigate('/projects')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Add New Project
                </h3>
                <p className="text-white/80 text-sm">
                  Start tracking a new renovation project
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              variant="elevated" 
              className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              onClick={() => setIsExpenseModalOpen(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Log Expense
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Record new project expenses
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              variant="elevated" 
              className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              onClick={() => navigate('/reports')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <PieChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  View Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Analyze project performance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={async () => {
          console.log('[DASHBOARD] Expense added, refreshing dashboard...')
          await loadDashboardData()
          console.log('[DASHBOARD] Dashboard refresh complete after expense')
        }}
        projects={projects}
      />
    </div>
  )
}