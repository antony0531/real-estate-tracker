// Reports.tsx - Comprehensive project reports with budget tracking

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'

interface ProjectReport {
  id: number
  name: string
  status: string
  budget: number
  spent: number
  remaining: number
  percentUsed: number
  isOverBudget: boolean
  overBudgetAmount: number
  totalExpenses: number
  materialExpenses: number
  laborExpenses: number
  roomCount: number
  averageCostPerRoom: number
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  overBudgetProjects: number
  underBudgetProjects: number
  onTrackProjects: number
  averageBudgetUsage: number
}

export default function Reports() {
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      console.log('[REPORTS] Loading project reports...')

      // Get all projects
      console.log('[REPORTS] Fetching projects list...')
      const projectsOutput = await TauriService.getProjects()
      console.log('[REPORTS] Raw projects output:', projectsOutput)
      
      const projects = parseProjectsFromOutput(projectsOutput)
      console.log('[REPORTS] Parsed projects:', projects)

      if (projects.length === 0) {
        console.log('[REPORTS] No projects found, setting empty state')
        setProjectReports([])
        setBudgetSummary(null)
        toast.info('No projects found to generate reports')
        return
      }

      // Get expenses for each project and calculate reports
      const reports: ProjectReport[] = []
      let totalBudget = 0
      let totalSpent = 0

      for (const project of projects) {
        try {
          console.log(`[REPORTS] Processing project ${project.id}: ${project.name}`)
          
          // Get project expenses
          console.log(`[REPORTS] Fetching expenses for project ${project.id}`)
          const expensesOutput = await TauriService.getExpenses(project.id)
          console.log(`[REPORTS] Raw expenses output for project ${project.id}:`, expensesOutput)
          
          const expenses = parseExpensesFromOutput(expensesOutput)
          console.log(`[REPORTS] Parsed expenses for project ${project.id}:`, expenses)
          
          // Get project rooms
          console.log(`[REPORTS] Fetching rooms for project ${project.id}`)
          const roomsOutput = await TauriService.getRooms(project.id)
          console.log(`[REPORTS] Raw rooms output for project ${project.id}:`, roomsOutput)
          
          const roomCount = parseRoomCountFromOutput(roomsOutput)
          console.log(`[REPORTS] Room count for project ${project.id}:`, roomCount)

          // Calculate metrics
          const spent = expenses.reduce((sum, exp) => sum + exp.cost, 0)
          const remaining = project.budget - spent
          const percentUsed = project.budget > 0 ? (spent / project.budget) * 100 : 0
          const isOverBudget = spent > project.budget
          const overBudgetAmount = isOverBudget ? spent - project.budget : 0

          const materialExpenses = expenses.filter(e => e.category === 'material').reduce((sum, e) => sum + e.cost, 0)
          const laborExpenses = expenses.filter(e => e.category === 'labor').reduce((sum, e) => sum + e.cost, 0)
          const averageCostPerRoom = roomCount > 0 ? spent / roomCount : 0

          const report: ProjectReport = {
            id: project.id,
            name: project.name,
            status: project.status,
            budget: project.budget,
            spent,
            remaining,
            percentUsed,
            isOverBudget,
            overBudgetAmount,
            totalExpenses: expenses.length,
            materialExpenses,
            laborExpenses,
            roomCount,
            averageCostPerRoom
          }

          reports.push(report)
          totalBudget += project.budget
          totalSpent += spent

          console.log(`[REPORTS] Project ${project.id} analysis complete:`, report)
        } catch (error) {
          console.error(`[REPORTS] Failed to analyze project ${project.id}:`, error)
          toast.error(`Failed to analyze project ${project.id}: ${error}`)
          // Continue with other projects
        }
      }

      console.log('[REPORTS] All reports processed:', reports)
      setProjectReports(reports)

      // Calculate summary
      const overBudgetProjects = reports.filter(r => r.isOverBudget).length
      const underBudgetProjects = reports.filter(r => !r.isOverBudget && r.percentUsed < 90).length
      const onTrackProjects = reports.filter(r => !r.isOverBudget && r.percentUsed >= 90).length
      const averageBudgetUsage = reports.length > 0 ? reports.reduce((sum, r) => sum + r.percentUsed, 0) / reports.length : 0

      const summary: BudgetSummary = {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        overBudgetProjects,
        underBudgetProjects,
        onTrackProjects,
        averageBudgetUsage
      }

      setBudgetSummary(summary)
      console.log('[REPORTS] Budget summary calculated:', summary)

      toast.success(`Reports loaded successfully for ${reports.length} projects`)
    } catch (error) {
      console.error('[REPORTS] Critical error loading reports:', error)
      toast.error(`Failed to load reports: ${TauriService.handleError(error)}`)
      setProjectReports([])
      setBudgetSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const parseProjectsFromOutput = (output: string) => {
    const lines = output.trim().split('\n')
    const projects: Array<{id: number, name: string, status: string, budget: number}> = []

    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$') && !line.includes('ID')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        if (columns.length >= 4) {
          const id = parseInt(columns[0], 10)
          const name = columns[1]
          const status = columns[2]
          const budgetMatch = columns[3].match(/\$([0-9,]+)/)
          
          if (!isNaN(id) && name && budgetMatch) {
            const budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
            projects.push({ id, name, status, budget })
          }
        }
      }
    }

    return projects
  }

  const parseExpensesFromOutput = (output: string) => {
    const expenses: Array<{id: number, category: string, cost: number, room: string}> = []
    const lines = output.trim().split('\n')

    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$') && !line.includes('Room')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        if (columns.length >= 4) {
          const id = parseInt(columns[0], 10)
          const room = columns[1]
          const category = columns[2]
          const costMatch = columns[3].match(/\$([0-9,]+\.[0-9]+)/)
          
          if (!isNaN(id) && costMatch) {
            const cost = parseFloat(costMatch[1].replace(/,/g, ''))
            expenses.push({ id, category, cost, room })
          }
        }
      }
    }

    return expenses
  }

  const parseRoomCountFromOutput = (output: string): number => {
    const lines = output.trim().split('\n')
    let roomCount = 0

    for (const line of lines) {
      if (line.startsWith('│') && !line.includes('Name') && !line.includes('━')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        if (columns.length >= 4 && columns[0]) {
          roomCount++
        }
      }
    }

    return roomCount
  }

  const getBudgetStatusColor = (report: ProjectReport) => {
    if (report.isOverBudget) return 'text-red-600'
    if (report.percentUsed >= 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getBudgetStatusText = (report: ProjectReport) => {
    if (report.isOverBudget) return `OVER by $${report.overBudgetAmount.toLocaleString()}`
    if (report.percentUsed >= 90) return 'Near Budget'
    return 'Under Budget'
  }

  const selectedReport = selectedProject ? projectReports.find(r => r.id === selectedProject) : null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Project Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Comprehensive budget tracking and project analysis
            </p>
          </div>
          <button 
            onClick={loadReports}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh Reports'}
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      {budgetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${budgetSummary.totalBudget.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Across {projectReports.length} projects
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${budgetSummary.totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {budgetSummary.averageBudgetUsage.toFixed(1)}% of budget used
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Budget Status</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Over Budget:</span>
                <span className="font-medium">{budgetSummary.overBudgetProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Near Budget:</span>
                <span className="font-medium">{budgetSummary.onTrackProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Under Budget:</span>
                <span className="font-medium">{budgetSummary.underBudgetProjects}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Remaining Budget</h3>
            <p className={`text-3xl font-bold ${budgetSummary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(budgetSummary.totalRemaining).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {budgetSummary.totalRemaining >= 0 ? 'Available' : 'Over budget'}
            </p>
          </div>
        </div>
      )}

      {/* Project Reports Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Project Budget Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed budget tracking for each project
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading project reports...</p>
          </div>
        ) : projectReports.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create some projects to see budget reports here.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {projectReports.map((report) => (
                  <React.Fragment key={report.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{report.id} • {report.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${report.budget.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${report.spent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {report.totalExpenses} expenses
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${report.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(report.remaining).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getBudgetStatusColor(report)}`}>
                        {getBudgetStatusText(report)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            report.isOverBudget ? 'bg-red-500' : 
                            report.percentUsed >= 90 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(report.percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {report.percentUsed.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedProject(selectedProject === report.id ? null : report.id)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3"
                      >
                        {selectedProject === report.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${report.id}`)}
                        className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                      >
                        Open Project
                      </button>
                    </td>
                  </tr>
                  {selectedProject === report.id && selectedReport && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Expense Breakdown</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Material Costs:</span>
                                <span className="font-medium">${selectedReport.materialExpenses.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Labor Costs:</span>
                                <span className="font-medium">${selectedReport.laborExpenses.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t pt-1">
                                <span>Total Expenses:</span>
                                <span className="font-medium">{selectedReport.totalExpenses}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Project Metrics</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Rooms:</span>
                                <span className="font-medium">{selectedReport.roomCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Cost/Room:</span>
                                <span className="font-medium">${selectedReport.averageCostPerRoom.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Budget Usage:</span>
                                <span className="font-medium">{selectedReport.percentUsed.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {selectedReport.isOverBudget && (
                              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Over Budget Alert</h4>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  This project has exceeded its budget by ${selectedReport.overBudgetAmount.toLocaleString()}.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 