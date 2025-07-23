// Projects.tsx - Project list and management page

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'
import ProjectModal from '../components/ProjectModal'

interface Project {
  id: number
  name: string
  status: string
  budget: number
  type: string
  created: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projectsOutput = await TauriService.getProjects()
      
      // Parse projects from CLI output
      const parsedProjects = parseProjectsFromOutput(projectsOutput)
      setProjects(parsedProjects)
      
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error(`Failed to load projects: ${TauriService.handleError(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const parseProjectsFromOutput = (output: string): Project[] => {
    const lines = output.trim().split('\n')
    const projects: Project[] = []
    
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
            created: created || 'Unknown'
          })
        }
      }
    }
    
    return projects
  }

  const handleCreateProject = () => {
    setIsProjectModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'in progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button className="btn-primary" disabled>
            Loading...
          </button>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your house flipping projects
          </p>
        </div>
        <button 
          onClick={handleCreateProject}
          className="btn-primary px-4 py-2"
        >
          Create Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first house flipping project to get started!
          </p>
          <button 
            onClick={handleCreateProject}
            className="btn-primary"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <span>Budget: ${project.budget.toLocaleString()}</span>
                    <span>Type: {project.type}</span>
                    <span>Created: {project.created}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link 
                    to={`/projects/${project.id}`}
                    className="btn-outline px-3 py-1 text-sm"
                  >
                    View Details
                  </Link>
                  <button className="btn-primary px-3 py-1 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {projects.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-50">Total Projects</h4>
            <p className="text-2xl font-bold text-brand-600">{projects.length}</p>
          </div>
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-50">Total Budget</h4>
            <p className="text-2xl font-bold text-green-600">
              ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </p>
          </div>
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-50">Active Projects</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status.toLowerCase() === 'in progress').length}
            </p>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={loadProjects}
      />
    </div>
  )
} 