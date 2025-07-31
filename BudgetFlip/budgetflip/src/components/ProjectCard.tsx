import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ProjectCardProps {
  id: string;
  displayId?: string;
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
  progress?: number;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ id, displayId, name, status, priority, owner, budget, spent, dueDate, progress, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);
  const statusConfig = {
    planning: { label: 'Planning', color: 'bg-gray-500', textColor: 'text-white' },
    in_progress: { label: 'In Progress', color: 'bg-orange-500', textColor: 'text-white' },
    review: { label: 'Review', color: 'bg-purple-500', textColor: 'text-white' },
    completed: { label: 'Completed', color: 'bg-success-500', textColor: 'text-white' }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-blue-500', textColor: 'text-white' },
    medium: { label: 'Medium', color: 'bg-purple-500', textColor: 'text-white' },
    high: { label: 'High', color: 'bg-indigo-600', textColor: 'text-white' }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getProjectColor = (name: string) => {
    // Generate a color based on project name
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-4 md:p-6 hover:shadow-monday-hover transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <Link to={`/project/${id}/overview`} className="flex items-center gap-2 md:gap-3 flex-1">
          <div className={`w-10 h-10 md:w-12 md:h-12 ${getProjectColor(name)} rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg`}>
            {name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-text-primary line-clamp-1 hover:text-primary-600">{name}</h3>
            <p className="text-xs md:text-sm text-text-secondary">{displayId || `ID: #${id.substring(0, 8)}`}</p>
          </div>
        </Link>
        {/* Actions menu */}
        <div className="relative flex items-center gap-2" ref={menuRef}>
          {/* Mobile: Show status badge */}
          <div className="md:hidden">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].color} ${statusConfig[status].textColor}`}>
              {statusConfig[status].label}
            </span>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          )}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

        <div className="space-y-2 md:space-y-3">
          {/* Status - Hidden on mobile (shown above) */}
          <div className="hidden md:flex items-center justify-between">
            <span className="text-sm text-text-secondary">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color} ${statusConfig[status].textColor}`}>
              {statusConfig[status].label}
            </span>
          </div>

          {/* Priority - Show on desktop only */}
          <div className="hidden md:flex items-center justify-between">
            <span className="text-sm text-text-secondary">Priority</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[priority].color} ${priorityConfig[priority].textColor}`}>
              {priorityConfig[priority].label}
            </span>
          </div>

          {/* Budget - Always show */}
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-text-secondary flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">Budget</span>
            </span>
            <div className="text-xs md:text-sm">
              <span className="font-semibold text-text-primary">${spent.toLocaleString()}</span>
              <span className="text-text-secondary"> / ${budget.toLocaleString()}</span>
            </div>
          </div>

          {/* Due Date - Always show */}
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">Due date</span>
            </span>
            <span className="text-xs md:text-sm font-medium text-text-primary">{formatDate(dueDate)}</span>
          </div>

          {/* Owner - Show on desktop, simplified on mobile */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs md:text-sm text-text-secondary hidden sm:inline">Owner</span>
            <div className="flex items-center gap-2 ml-auto">
              <div className={`w-6 h-6 md:w-8 md:h-8 ${owner.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                {owner.initials}
              </div>
              <span className="text-xs md:text-sm text-text-primary hidden sm:inline">{owner.name}</span>
            </div>
          </div>
        </div>
      </div>
  );
}