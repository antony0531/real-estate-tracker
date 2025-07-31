import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, DollarSign, User, CheckSquare, Square, MoreHorizontal, Plus, Trash2, Edit } from 'lucide-react';

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

interface TableViewProps {
  projects: Project[];
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void;
  onProjectClick?: (projectId: string) => void;
  onAddProject?: () => void;
  onProjectDelete?: (projectId: string) => void;
}

type SortField = 'name' | 'status' | 'priority' | 'owner' | 'budget' | 'spent' | 'dueDate' | 'progress';
type SortDirection = 'asc' | 'desc';

export function TableView({ projects, onProjectUpdate, onProjectClick, onAddProject, onProjectDelete }: TableViewProps) {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingCell, setEditingCell] = useState<{ projectId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-gray-100 text-gray-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
    { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      // Only call select() on input elements, not select elements
      if (inputRef.current.tagName === 'INPUT') {
        inputRef.current.select();
      }
    }
  }, [editingCell]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuFor(null);
      }
    };

    if (showMenuFor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenuFor]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'owner') {
      aVal = a.owner.name;
      bVal = b.owner.name;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const handleSelectProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const startEditing = (projectId: string, field: string, currentValue: any) => {
    setEditingCell({ projectId, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const { projectId, field } = editingCell;
    let value: any = editValue;
    
    if (field === 'budget' || field === 'spent' || field === 'progress') {
      value = parseFloat(editValue) || 0;
    }
    
    onProjectUpdate(projectId, { [field]: value });
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3 text-primary-500" /> : 
      <ChevronDown className="w-3 h-3 text-primary-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {selectedProjects.size === projects.length && projects.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-primary-500" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Project Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Priority
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('owner')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Owner
                  <SortIcon field="owner" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('progress')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Progress
                  <SortIcon field="progress" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('budget')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Budget
                  <SortIcon field="budget" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('spent')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Spent
                  <SortIcon field="spent" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  Due Date
                  <SortIcon field="dueDate" />
                </button>
              </th>
              <th className="px-4 py-3 text-left w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project, index) => (
              <tr 
                key={project.id}
                className={`
                  border-b border-gray-100 hover:bg-gray-50 transition-colors
                  ${selectedProjects.has(project.id) ? 'bg-primary-50' : ''}
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                `}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSelectProject(project.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {selectedProjects.has(project.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'name' ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <button
                      onClick={() => onProjectClick?.(project.id)}
                      className="text-left font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {project.name}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'status' ? (
                    <select
                      ref={inputRef as any}
                      value={editValue}
                      onChange={(e) => {
                        setEditValue(e.target.value);
                        onProjectUpdate(project.id, { status: e.target.value as Project['status'] });
                        setEditingCell(null);
                      }}
                      onBlur={() => setEditingCell(null)}
                      className="px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => startEditing(project.id, 'status', project.status)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${statusOptions.find(s => s.value === project.status)?.color}
                      `}
                    >
                      {statusOptions.find(s => s.value === project.status)?.label}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'priority' ? (
                    <select
                      ref={inputRef as any}
                      value={editValue}
                      onChange={(e) => {
                        setEditValue(e.target.value);
                        onProjectUpdate(project.id, { priority: e.target.value as Project['priority'] });
                        setEditingCell(null);
                      }}
                      onBlur={() => setEditingCell(null)}
                      className="px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => startEditing(project.id, 'priority', project.priority)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${priorityOptions.find(p => p.value === project.priority)?.color}
                      `}
                    >
                      {priorityOptions.find(p => p.value === project.priority)?.label}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${project.owner.color}`}>
                      {project.owner.initials}
                    </div>
                    <span className="text-sm text-gray-700">{project.owner.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">{project.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'budget' ? (
                    <input
                      ref={inputRef}
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-24 px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(project.id, 'budget', project.budget)}
                      className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {formatCurrency(project.budget)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'spent' ? (
                    <input
                      ref={inputRef}
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-24 px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(project.id, 'spent', project.spent)}
                      className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {formatCurrency(project.spent)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.projectId === project.id && editingCell.field === 'dueDate' ? (
                    <input
                      ref={inputRef}
                      type="date"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(project.id, 'dueDate', project.dueDate)}
                      className="flex items-center gap-1 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.dueDate)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="relative" ref={showMenuFor === project.id ? menuRef : null}>
                    <button
                      onClick={() => setShowMenuFor(showMenuFor === project.id ? null : project.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="More actions"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    {showMenuFor === project.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => {
                            onProjectClick?.(project.id);
                            setShowMenuFor(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            startEditing(project.id, 'name', project.name);
                            setShowMenuFor(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Rename Project
                        </button>
                        {onProjectDelete && (
                          <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                onProjectDelete(project.id);
                                setShowMenuFor(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Project
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {/* Add New Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td colSpan={10} className="px-4 py-3">
                <button
                  onClick={onAddProject}
                  className="w-full text-left text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add new project
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      {selectedProjects.size > 0 && (
        <div className="px-4 py-3 bg-primary-50 border-t border-primary-200 flex items-center justify-between">
          <span className="text-sm text-primary-700">
            {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Bulk Edit
            </button>
            <button className="px-3 py-1 text-sm bg-danger-500 text-white rounded hover:bg-danger-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}