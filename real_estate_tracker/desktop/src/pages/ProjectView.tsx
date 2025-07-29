// ProjectView.tsx - Individual project details page

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TauriService } from '../services/tauri'
import { Project, ExpenseData } from '../types'
import { dataCache } from '../services/dataCache'

export default function ProjectView() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [expenses, setExpenses] = useState<ExpenseData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadProjectData = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      console.log(`[PROJECT_VIEW] Loading data for project ${id}...`)

      // Try to get project from cache first
      const cachedProjects = dataCache.getProjects()
      const projectId = parseInt(id, 10)
      let currentProject = cachedProjects?.find(p => p.id === projectId) as Project | undefined

      if (!currentProject) {
        // If not in cache, fetch from backend
        console.log(`[PROJECT_VIEW] Project ${id} not in cache, fetching from backend...`)
        const projectOutput = await TauriService.getProject(projectId)
        if (projectOutput) {
          const lines = projectOutput.trim().split('\n')
          for (const line of lines) {
            if (line.startsWith('│') && !line.startsWith('┃')) {
              const columns = line.split('│').map(col => col.trim()).filter(col => col)
              if (columns.length >= 7) {
                const budgetMatch = columns[4].match(/\$([0-9,]+)/)
                if (budgetMatch) {
                  const budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
                  currentProject = {
                    id: projectId,
                    name: columns[1],
                    status: columns[2].toLowerCase().replace(/\s+/g, '_'),
                    budget,
                    spent: 0, // Will be updated below
                    type: columns[5],
                    created: columns[6],
                    priority: columns[3].toLowerCase() as 'high' | 'medium' | 'low' | 'urgent',
                    completion: 0, // Will be updated below
                    rooms: 0, // Will be updated below
                    timeline: `Started on ${columns[6]}`
                  } as Project
                }
              }
            }
          }
        }
      }

      if (currentProject) {
        // Get expenses
        console.log(`[PROJECT_VIEW] Fetching expenses for project ${id}...`)
        const expensesOutput = await TauriService.getExpenses(projectId)
        const expensesList: ExpenseData[] = []
        const lines = expensesOutput.trim().split('\n')
        
        let totalSpent = 0
        let isHeader = true
        for (const line of lines) {
          if (line.startsWith('├') || line.startsWith('└')) {
            isHeader = false
            continue
          }
          if (line.startsWith('┌') || isHeader) {
            continue
          }
          if (line.startsWith('│')) {
            const columns = line.split('│').map(col => col.trim()).filter(col => col)
            if (columns.length >= 6) {
              const costMatch = columns[4].match(/\$([0-9,.]+)/)
              if (costMatch) {
                const cost = parseFloat(costMatch[1].replace(/,/g, ''))
                if (!isNaN(cost)) {
                  totalSpent += cost
                  expensesList.push({
                    id: parseInt(columns[0], 10),
                    date: columns[1],
                    roomName: columns[2],
                    category: columns[3],
                    cost,
                    notes: columns[5]
                  })
                }
              }
            }
          }
        }

        // Get room count
        const roomsOutput = await TauriService.getRooms(projectId)
        const roomCount = (roomsOutput.match(/│/g) || []).length - 2 // Subtract header and footer lines

        // Update project with calculated values
        const updatedProject: Project = {
          ...currentProject,
          spent: totalSpent,
          completion: currentProject.budget > 0 ? Math.round((totalSpent / currentProject.budget) * 100) : 0,
          rooms: Math.max(0, roomCount)
        }

        console.log(`[PROJECT_VIEW] Project ${id} loaded:`, updatedProject)
        setProject(updatedProject)
        setExpenses(expensesList)
      } else {
        console.error(`[PROJECT_VIEW] Could not find project ${id}`)
      }
    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjectData()

    // Refresh data every 30 seconds if the tab is visible
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadProjectData()
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [id])

  // Add visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProjectData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [id])

  if (isLoading) {
    return <div className="p-4">Loading project details...</div>
  }

  if (!project) {
    return <div className="p-4">Project not found</div>
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#0f1114] min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{project.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#131619] rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Overview</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p><span className="font-medium text-gray-900 dark:text-white">Status:</span> {project.status.replace(/_/g, ' ')}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Priority:</span> {project.priority}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Type:</span> {project.type}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Created:</span> {project.created}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#131619] rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Budget</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p><span className="font-medium text-gray-900 dark:text-white">Total Budget:</span> ${project.budget.toLocaleString()}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Spent:</span> ${project.spent.toLocaleString()}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Remaining:</span> ${(project.budget - project.spent).toLocaleString()}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Completion:</span> {project.completion}%</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#131619] rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Statistics</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p><span className="font-medium text-gray-900 dark:text-white">Total Rooms:</span> {project.rooms}</p>
            <p><span className="font-medium text-gray-900 dark:text-white">Total Expenses:</span> {expenses.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131619] rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Expenses</h2>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Date</th>
                  <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Room</th>
                  <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Category</th>
                  <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map(expense => (
                  <tr key={expense.id} className="text-gray-600 dark:text-gray-300">
                    <td className="px-4 py-2">{expense.date}</td>
                    <td className="px-4 py-2">{expense.roomName}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2 text-right">${expense.cost.toLocaleString()}</td>
                    <td className="px-4 py-2">{expense.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet</p>
        )}
      </div>
    </div>
  )
} 