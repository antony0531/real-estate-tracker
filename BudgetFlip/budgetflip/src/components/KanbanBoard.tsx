import React, { useState } from 'react';
import { MoreVertical, Plus, Calendar, DollarSign, User } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  owner: {
    name: string;
    initials: string;
    color: string;
  };
  budget: number;
  spent: number;
  dueDate: string;
  progress: number;
}

interface KanbanBoardProps {
  projects: Project[];
  onProjectMove?: (projectId: string, newStatus: Project['status']) => void;
  onProjectClick?: (projectId: string) => void;
}

export function KanbanBoard({ projects, onProjectMove, onProjectClick }: KanbanBoardProps) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = [
    { id: 'planning', title: 'Planning', color: 'bg-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-orange-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'completed', title: 'Completed', color: 'bg-success-500' }
  ];

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-purple-100 text-purple-700 border-purple-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Project['status']) => {
    e.preventDefault();
    if (draggedProject && onProjectMove) {
      onProjectMove(draggedProject, newStatus);
    }
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  const getProjectsByStatus = (status: Project['status']) => {
    return projects.filter(project => project.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0">
      {columns.map((column) => {
        const columnProjects = getProjectsByStatus(column.id as Project['status']);
        const isDropTarget = dragOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id as Project['status'])}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {columnProjects.length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Column Content */}
            <div className={`
              min-h-[400px] bg-gray-50 rounded-lg p-2 transition-colors
              ${isDropTarget ? 'bg-primary-50 ring-2 ring-primary-500' : ''}
            `}>
              {columnProjects.map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  onClick={() => onProjectClick?.(project.id)}
                  className={`
                    bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200
                    hover:shadow-md transition-all cursor-pointer
                    ${draggedProject === project.id ? 'opacity-50' : ''}
                  `}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {project.name}
                    </h4>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Priority Badge */}
                  <div className="mb-3">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                      ${priorityColors[project.priority]}
                    `}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${project.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-white text-xs
                        ${project.owner.color}
                      `}>
                        {project.owner.initials}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {columnProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No projects</p>
                  <button className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                    + Add project
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}