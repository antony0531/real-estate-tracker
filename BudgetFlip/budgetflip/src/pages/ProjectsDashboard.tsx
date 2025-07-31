import { useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { TableView } from '../components/TableView';
import { CalendarView } from '../components/CalendarView';
import { AdvancedFilter } from '../components/AdvancedFilter';
import { ViewSwitcher, ViewMode } from '../components/ViewSwitcher';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProjectsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const navigate = useNavigate();

  // Mock data for projects
  const [projects, setProjects] = useState([
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
  ]);

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

  const handleProjectMove = (projectId: string, newStatus: any) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}/overview`);
  };

  const handleProjectUpdate = (projectId: string, updates: any) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ));
  };

  const handleAddProject = () => {
    const newProject = {
      id: `new-${Date.now()}`,
      name: 'New Project',
      status: 'planning' as const,
      priority: 'medium' as const,
      owner: { name: 'Unassigned', initials: 'UN', color: 'bg-gray-500' },
      budget: 0,
      spent: 0,
      dueDate: new Date().toISOString().split('T')[0],
      progress: 0
    };
    setProjects(prev => [...prev, newProject]);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">All Projects</h1>
          <p className="text-sm md:text-base text-text-secondary mt-1">Manage and track all your renovation projects</p>
        </div>

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
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm md:text-base w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Projects Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} {...project} />
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
            onAddProject={handleAddProject}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView 
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
            onAddProject={(date) => {
              const newProject = {
                id: `new-${Date.now()}`,
                name: 'New Project',
                status: 'planning' as const,
                priority: 'medium' as const,
                owner: { name: 'Unassigned', initials: 'UN', color: 'bg-gray-500' },
                budget: 0,
                spent: 0,
                dueDate: date,
                progress: 0
              };
              setProjects(prev => [...prev, newProject]);
            }}
          />
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No projects found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilter 
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApplyFilters={setActiveFilters}
        availableOwners={uniqueOwners}
      />
    </div>
  );
}