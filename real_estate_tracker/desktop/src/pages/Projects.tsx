// Projects.tsx - Professional project management interface inspired by Monday.com/Notion

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import ProjectModal from '../components/ProjectModal'
import EditProjectModal from '@/components/modals/EditProjectModal'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import ScrollableSelect from '@/components/ui/ScrollableSelect'
import QuickEditDropdown, { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/components/QuickEditDropdown'
import { dataCache } from '../services/dataCache'
import { performanceOptimizer, type ProjectDetails } from '../services/performanceOptimizer'
import { Plus, Table2, Grid3x3, Building2, RefreshCw } from 'lucide-react'
import { testProjectLoading } from '../utils/debug'

interface Project {
  id: number
  name: string
  status: string
  budget: number
  spent: number
  type: string
  created: string
  priority: 'high' | 'medium' | 'low' | 'urgent'
  completion: number
  rooms: number
  timeline: string
  description?: string
  floors?: number
  sqft?: number
  address?: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    loadProjects()

    // Refresh data every 30 seconds instead of 5
    const refreshInterval = setInterval(() => {
      // Only refresh if the component is mounted and visible
      if (document.visibilityState === 'visible') {
        loadProjects()
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [])

  // Add visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProjects()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      
      // Check cache first
      const cachedProjects = dataCache.getProjects()
      if (cachedProjects) {
        // Convert cached projects to the correct type
        const convertedProjects = cachedProjects.map(p => ({
          ...p,
          type: p.type || 'unknown',
          created: p.created || new Date().toISOString().split('T')[0],
          priority: p.priority || 'medium',
          completion: p.completion || 0,
          rooms: p.rooms || 0,
          timeline: p.timeline || `Created ${p.created || new Date().toISOString().split('T')[0]}`
        }))
        setProjects(convertedProjects)
        setIsLoading(false)
        return
      }

      // Get projects data
      const output = await TauriService.getProjects()
      const parsedProjects = await parseProjectsFromOutput(output)
      
      // Update state and cache
      setProjects(parsedProjects)
      dataCache.setProjects(parsedProjects)
      
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error(`Failed to load projects: ${TauriService.handleError(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const parseProjectsFromOutput = async (output: string): Promise<Project[]> => {
    const lines = output.trim().split('\n')
    const projects: Project[] = []
    
    for (const line of lines) {
      if (line.startsWith('│') && !line.startsWith('┃')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // Updated column structure: ID, Name, Status, Priority, Budget, Type, Created
        if (columns.length >= 7) {
          const id = parseInt(columns[0], 10)
          const name = columns[1]
          const status = columns[2].toLowerCase().replace(/\s+/g, '_')
          const priority = columns[3].toLowerCase() as 'high' | 'medium' | 'low' | 'urgent'
          const budgetMatch = columns[4].match(/\$([0-9,]+)/)
          const type = columns[5]
          const created = columns[6]
          
          if (!isNaN(id) && budgetMatch) {
            const budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
            
            // Get additional project data
            let spent = 0
            let rooms = 0
            
            try {
              // Get expenses and calculate total spent
              const expensesOutput = await TauriService.getExpenses(id)
              console.log(`[PROJECTS] Raw expenses output for project ${id}:`, expensesOutput)
              const expenses = parseExpensesFromOutput(expensesOutput)
              spent = expenses.reduce((sum, exp) => sum + exp.cost, 0)
              console.log(`[PROJECTS] Project ${id} total spent: $${spent}`)
              
              // Get room count
              const roomsOutput = await TauriService.getRooms(id)
              rooms = parseRoomCount(roomsOutput)
            } catch (e) {
              console.warn(`Could not fetch details for project ${id}:`, e)
            }

            // Calculate completion percentage based on spent vs budget
            const completion = budget > 0 ? Math.round((spent / budget) * 100) : 0
            console.log(`[PROJECTS] Project ${id} completion: ${completion}% (spent: $${spent}, budget: $${budget})`)
            
            // Generate timeline
            const timeline = generateTimeline(status, created)
            
            projects.push({
              id,
              name,
              status,
              budget,
              spent,
              type,
              created,
              priority,
              completion,
              rooms,
              timeline
            })

            console.log(`[PROJECTS] Added project ${id} with spent: $${spent}, budget: $${budget}, completion: ${completion}%`)
          }
        }
      }
    }
    
    return projects
  }

  const parseExpensesFromOutput = (output: string): { cost: number }[] => {
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
            console.log(`[PROJECTS] Found expense: $${cost}`)
          }
        }
      }
    }
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.cost, 0)
    console.log(`[PROJECTS] Total expenses found: ${expenses.length}, Total amount: $${totalAmount}`)
    return expenses
  }

  const calculateSpentFromExpenses = (expensesOutput: string): number => {
    let total = 0
    const lines = expensesOutput.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const costMatch = line.match(/\$([0-9,]+\.[0-9]+)/)
        if (costMatch) {
          total += parseFloat(costMatch[1].replace(/,/g, ''))
        }
      }
    }
    
    return total
  }

  const parseRoomCount = (roomsOutput: string): number => {
    const lines = roomsOutput.split('\n')
    return lines.filter(line => line.startsWith('│') && !line.includes('Name')).length
  }

  const generateTimeline = (status: string, created: string): string => {
    const createdDate = new Date(created)
    const now = new Date()
    const daysSince = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
    
    if (status.toLowerCase().includes('planning')) return `Started ${daysSince} days ago`
    if (status.toLowerCase().includes('progress')) return `In progress (${daysSince} days)`
    if (status.toLowerCase().includes('complete')) return `Completed`
    return `${daysSince} days active`
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('complete')) return 'bg-green-100 text-green-800 border-green-200'
    if (s.includes('progress')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s.includes('planning')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (s.includes('hold')) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low' | 'urgent') => {
    switch (priority) {
      case 'urgent': return 'bg-red-600'
      case 'high': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return 'bg-red-500'
    if (completion >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status.toLowerCase().includes(filterStatus.toLowerCase())
  )

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (!selectedProject) return
    
    try {
      await TauriService.deleteProject(selectedProject.id)
      toast.success('Project deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedProject(null)
      // Invalidate cache and reload
      dataCache.invalidateProjects()
      loadProjects()
    } catch (error) {
      toast.error('Failed to delete project')
      console.error('Error deleting project:', error)
    }
  }

  // Quick edit handlers for status and priority - Direct approach with enhanced logging
  const handleStatusUpdate = async (projectId: number, newStatus: string) => {
    try {
      console.log(`[PROJECT] 🔄 Starting status update for project ${projectId}`)
      console.log(`[PROJECT] 📝 New status value: "${newStatus}"`)
      console.log(`[PROJECT] 🔧 Calling TauriService.updateProjectStatus...`)
      
      // Use direct TauriService call instead of performance optimizer
      const result = await TauriService.updateProjectStatus(projectId, newStatus)
      console.log(`[PROJECT] ✅ Backend response:`, result)
      
      // Update local state immediately for responsive UI
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, status: newStatus }
            : project
        )
      )
      
      console.log(`[PROJECT] 🎯 Successfully updated status for project ${projectId} to "${newStatus}"`)
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      
      // Reload projects to get fresh data after a brief delay
      setTimeout(() => {
        console.log(`[PROJECT] 🔄 Reloading projects data after status update`)
        loadProjects()
      }, 500)
      
    } catch (error) {
      console.error(`[PROJECT] ❌ Failed to update status for project ${projectId}:`, error)
      toast.error(`Failed to update status: ${error}`)
      throw error
    }
  }

  const handlePriorityUpdate = async (projectId: number, newPriority: string) => {
    try {
      console.log(`[PROJECT] Updating priority for project ${projectId} to: "${newPriority}"`)
      
      // Use direct TauriService call
      await TauriService.updateProjectPriority(projectId, newPriority)
      
      // Update local state immediately
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, priority: newPriority as 'high' | 'medium' | 'low' | 'urgent' }
            : project
        )
      )
      
      console.log(`[PROJECT] Successfully updated priority for project ${projectId} to "${newPriority}"`)
      toast.success(`Priority updated to ${newPriority}`)
      
    } catch (error) {
      console.error(`[PROJECT] Failed to update priority for project ${projectId}:`, error)
      toast.error(`Failed to update priority: ${error}`)
      throw error
    }
  }

  const handleEditSuccess = () => {
    loadProjects() // Reload projects after edit
  }

  const statusFilterOptions = [
    { value: "all", label: "All Projects", description: `${projects.length} total projects` },
    { value: "planning", label: "Planning", description: "Projects in planning phase" },
    { value: "progress", label: "In Progress", description: "Active renovation projects" },
    { value: "complete", label: "Completed", description: "Finished projects" },
    { value: "hold", label: "On Hold", description: "Paused projects" }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1114]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header - Dark Theme */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Projects ({projects.length})
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your real estate projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadProjects}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#131619] hover:bg-gray-200 dark:hover:bg-[#1a1f24] text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>

        {/* Controls Bar - Much Darker Theme */}
        <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-black rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-[#0f1114] rounded-md p-1 border border-gray-200 dark:border-black">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#171b1f] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-[#171b1f] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Cards
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{filteredProjects.length}</span> of <span className="font-medium">{projects.length}</span> projects
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>Total Budget:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ${filteredProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Total Spent:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    ${filteredProjects.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-4 pt-4 border-t border-black">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
              <ScrollableSelect
                options={statusFilterOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All Projects"
                className="w-48"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {isLoading ? (
            <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading projects...</span>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filterStatus !== 'all' 
                  ? `No projects match the current filter. Try adjusting your filter settings.`
                  : `Get started by creating your first renovation project.`
                }
              </p>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Your First Project
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0f1114] border-b border-gray-200 dark:border-black">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Budget/Progress
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#131619] divide-y divide-gray-200 dark:divide-black">
                {filteredProjects.map((project, index) => (
                  <tr key={project.id} className={`hover:bg-gray-50 dark:hover:bg-[#171b1f] transition-colors ${
                    index !== filteredProjects.length - 1 ? 'border-b border-gray-200 dark:border-black' : ''
                  }`}>
                    {/* Project Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-2 h-8 rounded-full mr-3 bg-green-500"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {project.id} • {project.rooms} rooms</div>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <QuickEditDropdown
                        currentValue={project.priority}
                        options={PRIORITY_OPTIONS}
                        onSave={(newPriority) => handlePriorityUpdate(project.id, newPriority)}
                        type="priority"
                      />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <QuickEditDropdown
                        currentValue={project.status}
                        options={STATUS_OPTIONS}
                        onSave={(newStatus) => handleStatusUpdate(project.id, newStatus)}
                        type="status"
                      />
                    </td>

                    {/* Budget Progress */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {project.completion.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getCompletionColor(project.completion)}`}
                            style={{ width: `${Math.min(project.completion, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {project.timeline}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {project.type}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-900 dark:text-gray-100">
                          Remaining: ${(project.budget - project.spent).toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Created: {project.created}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 text-sm font-medium transition-colors"
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
      ) : (
        /* Card View - Notion Style */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-6 hover:shadow-lg transition-shadow">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {project.id} • {project.rooms} rooms</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Budget Progress</span>
                    <span>{project.completion.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getCompletionColor(project.completion)}`}
                      style={{ width: `${Math.min(project.completion, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Budget</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${project.budget.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Spent</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${project.spent.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {project.timeline} • {project.rooms} rooms
                </div>
                
                <Link
                  to={`/projects/${project.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>

        {/* Modals */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={loadProjects}
        />

        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadProjects}
          project={selectedProject}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteProject}
          title="Delete Project"
          message={`Are you sure you want to delete "${selectedProject?.name}"? This will permanently remove the project and all associated data.`}
          itemName={selectedProject?.name || ''}
          dangerText="This action will delete all rooms, expenses, and project data. This cannot be undone."
          requireTyping={true}
        />
      </div>
    </div>
  )
} 