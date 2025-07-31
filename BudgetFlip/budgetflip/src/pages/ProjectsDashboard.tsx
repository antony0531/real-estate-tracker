import { useState, useEffect } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { TableView } from '../components/TableView';
import { CalendarView } from '../components/CalendarView';
import { AdvancedFilter } from '../components/AdvancedFilter';
import { ViewSwitcher, ViewMode } from '../components/ViewSwitcher';
import { ProjectModal } from '../components/ProjectModal';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, type Project as APIProject } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function ProjectsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiProjects = await projectsAPI.getAll();
      
      // Transform API projects to match our UI format
      const transformedProjects = apiProjects.map((project: APIProject) => ({
        id: project.id,
        displayId: project.display_id,
        name: project.name,
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        owner: { 
          name: user?.name || 'Unknown', 
          initials: user?.initials || 'UK', 
          color: 'bg-blue-500' 
        },
        budget: Number(project.budget) || 0,
        spent: Number(project.total_spent) || 0,
        dueDate: project.target_end_date || new Date().toISOString(),
        progress: calculateProgress(project),
        description: project.description,
        address: project.address,
        startDate: project.start_date,
        members: project.members || []
      }));
      
      setProjects(transformedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (project: APIProject): number => {
    if (project.status === 'completed') return 100;
    if (project.status === 'planning') return 0;
    if (project.budget && project.total_spent) {
      return Math.min(Math.round((Number(project.total_spent) / Number(project.budget)) * 100), 100);
    }
    return project.status === 'in_progress' ? 50 : 75;
  };

  // Example mock data for development fallback
  const mockProjects = [
    {
      id: '123',
      name: 'Jersey City Renovation',
      status: 'in_progress' as const,
      priority: 'low' as const,
      owner: { name: 'Anthony Sandoval', initials: 'AS', color: 'bg-pink-500' },
      budget: 10000,
      spent: 2500,
      dueDate: '2024-07-30',
      progress: 25
    },
    {
      id: '124',
      name: 'Brooklyn Townhouse',
      status: 'completed' as const,
      priority: 'high' as const,
      owner: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
      budget: 25000,
      spent: 23500,
      dueDate: '2024-07-31',
      progress: 100
    },
    {
      id: '125',
      name: 'Queens Duplex',
      status: 'review' as const,
      priority: 'medium' as const,
      owner: { name: 'Sarah Smith', initials: 'SS', color: 'bg-green-500' },
      budget: 15000,
      spent: 8000,
      dueDate: '2024-08-01',
      progress: 75
    },
    {
      id: '126',
      name: 'Manhattan Studio',
      status: 'in_progress' as const,
      priority: 'high' as const,
      owner: { name: 'Mike Johnson', initials: 'MJ', color: 'bg-purple-500' },
      budget: 8000,
      spent: 3200,
      dueDate: '2024-08-15',
      progress: 40
    },
    {
      id: '127',
      name: 'Bronx Apartment',
      status: 'completed' as const,
      priority: 'low' as const,
      owner: { name: 'Emily Davis', initials: 'ED', color: 'bg-yellow-500' },
      budget: 12000,
      spent: 11800,
      dueDate: '2024-07-25',
      progress: 100
    },
    {
      id: '128',
      name: 'Staten Island Condo',
      status: 'planning' as const,
      priority: 'medium' as const,
      owner: { name: 'Robert Chen', initials: 'RC', color: 'bg-indigo-500' },
      budget: 18000,
      spent: 0,
      dueDate: '2024-09-01',
      progress: 0
    }
  ];

  // Get unique owners for filter
  const uniqueOwners = Array.from(new Set(projects.map(p => JSON.stringify(p.owner))))
    .map(str => JSON.parse(str));

  // Apply filters
  let filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (activeFilters) {
    filteredProjects = filteredProjects.filter(project => {
      // Status filter
      if (activeFilters.status.length > 0 && !activeFilters.status.includes(project.status)) {
        return false;
      }
      
      // Priority filter
      if (activeFilters.priority.length > 0 && !activeFilters.priority.includes(project.priority)) {
        return false;
      }
      
      // Owner filter
      if (activeFilters.owners.length > 0 && !activeFilters.owners.includes(project.owner.name)) {
        return false;
      }
      
      // Budget range filter
      if (project.budget < activeFilters.budgetRange.min || project.budget > activeFilters.budgetRange.max) {
        return false;
      }
      
      // Progress range filter
      if (project.progress < activeFilters.progressRange.min || project.progress > activeFilters.progressRange.max) {
        return false;
      }
      
      // Date range filter
      if (activeFilters.dateRange.start && project.dueDate < activeFilters.dateRange.start) {
        return false;
      }
      if (activeFilters.dateRange.end && project.dueDate > activeFilters.dateRange.end) {
        return false;
      }
      
      return true;
    });
  }

  // Calculate summary stats
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const handleProjectMove = async (projectId: string, newStatus: any) => {
    try {
      await projectsAPI.update(projectId, { status: newStatus });
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ));
    } catch (err) {
      console.error('Error updating project status:', err);
      setError('Failed to update project status');
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}/overview`);
  };

  const handleProjectUpdate = async (projectId: string, updates: any) => {
    try {
      // Map UI fields to API fields
      const apiUpdates: any = {};
      if (updates.name !== undefined) apiUpdates.name = updates.name;
      if (updates.budget !== undefined) apiUpdates.budget = updates.budget;
      if (updates.status !== undefined) apiUpdates.status = updates.status;
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) apiUpdates.target_end_date = updates.dueDate;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      
      await projectsAPI.update(projectId, apiUpdates);
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      ));
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    }
  };

  const handleProjectCreated = (newProject: APIProject) => {
    // Transform and add to local state
    const transformedProject = {
      id: newProject.id,
      displayId: newProject.display_id,
      name: newProject.name,
      status: newProject.status || 'planning',
      priority: newProject.priority || 'medium',
      owner: { 
        name: user?.name || 'Unknown', 
        initials: user?.initials || 'UK', 
        color: 'bg-blue-500' 
      },
      budget: Number(newProject.budget) || 0,
      spent: Number(newProject.total_spent) || 0,
      dueDate: newProject.target_end_date || new Date().toISOString(),
      progress: calculateProgress(newProject),
      description: newProject.description,
      address: newProject.address,
      startDate: newProject.start_date,
      members: newProject.members || []
    };
    
    setProjects(prev => [...prev, transformedProject]);
    navigate(`/project/${newProject.id}/overview`);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectsAPI.delete(projectToDelete);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const confirmDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">All Projects</h1>
          <p className="text-sm md:text-base text-text-secondary mt-1">Manage and track all your renovation projects</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-text-secondary mb-1">Total Projects</div>
            <div className="text-xl md:text-2xl font-bold text-text-primary">{projects.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-text-secondary mb-1">Active Projects</div>
            <div className="text-xl md:text-2xl font-bold text-orange-500">{activeProjects}</div>
          </div>
          <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-text-secondary mb-1">Total Budget</div>
            <div className="text-xl md:text-2xl font-bold text-text-primary">${totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-text-secondary mb-1">Total Spent</div>
            <div className="text-xl md:text-2xl font-bold text-primary-500">${totalSpent.toLocaleString()}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <button 
              onClick={() => setShowAdvancedFilter(true)}
              className={`p-2 border rounded-lg transition-colors relative ${
                activeFilters ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 hover:bg-background-tertiary'
              }`}
            >
              <Filter className="w-4 h-4" />
              {activeFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>

            {/* View Mode Switcher - Desktop only */}
            <ViewSwitcher 
              currentView={viewMode}
              onViewChange={setViewMode}
            />
          </div>

          {/* New Project Button */}
          <button 
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Projects Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                {...project} 
                onDelete={confirmDeleteProject}
              />
            ))}
          </div>
        )}

        {viewMode === 'kanban' && (
          <KanbanBoard 
            projects={filteredProjects}
            onProjectMove={handleProjectMove}
            onProjectClick={handleProjectClick}
          />
        )}

        {viewMode === 'table' && (
          <TableView 
            projects={filteredProjects}
            onProjectUpdate={handleProjectUpdate}
            onProjectClick={handleProjectClick}
            onAddProject={() => setShowProjectModal(true)}
            onProjectDelete={confirmDeleteProject}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView 
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
            onAddProject={() => setShowProjectModal(true)}
          />
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No projects found matching "{searchTerm}"</p>
          </div>
        )}
        </>
        )}
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilter 
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApplyFilters={setActiveFilters}
        availableOwners={uniqueOwners}
      />

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This will permanently delete the project and all associated expenses. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProjectToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}