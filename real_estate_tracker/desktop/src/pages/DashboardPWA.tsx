import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, FolderOpen, DollarSign, Settings } from 'lucide-react'
import { pwaService } from '../services/pwaService'

export default function DashboardPWA() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const result = await pwaService.listProjects()
      if (result.success && result.data) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No projects yet. Create your first project!
          </p>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Budget: ${project.budget?.toLocaleString()} | Spent: ${project.spent?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}