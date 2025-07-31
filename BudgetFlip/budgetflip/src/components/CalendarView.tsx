import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

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

interface CalendarViewProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
  onAddProject?: (date: string) => void;
}

export function CalendarView({ projects, onProjectClick, onAddProject }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const statusColors = {
    planning: 'bg-gray-500',
    in_progress: 'bg-orange-500',
    review: 'bg-purple-500',
    completed: 'bg-green-500'
  };

  const priorityDots = {
    low: 'bg-blue-400',
    medium: 'bg-yellow-400',
    high: 'bg-red-400'
  };

  // Get calendar data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Adjust to start on Sunday
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    // Adjust to end on Saturday
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projects.filter(project => project.dueDate === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center py-2">
              <span className="text-sm font-medium text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
          {calendarDays.map((date, index) => {
            const dayProjects = getProjectsForDate(date);
            const dateStr = date.toISOString().split('T')[0];
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer
                  hover:bg-gray-50 transition-colors relative
                  ${!isCurrentMonth(date) ? 'bg-gray-50' : 'bg-white'}
                  ${isToday(date) ? 'ring-2 ring-primary-500 ring-inset' : ''}
                  ${isSelected(date) ? 'bg-primary-50' : ''}
                `}
              >
                {/* Date number */}
                <div className="flex items-start justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-700'}
                    ${isToday(date) ? 'text-primary-600 font-bold' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {isCurrentMonth(date) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddProject?.(dateStr);
                      }}
                      className="opacity-0 hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                    >
                      <Plus className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Projects for this day */}
                <div className="space-y-1">
                  {dayProjects.slice(0, 3).map((project, projectIndex) => (
                    <div
                      key={project.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectClick?.(project.id);
                      }}
                      className={`
                        text-xs px-2 py-1 rounded cursor-pointer
                        ${statusColors[project.status]} text-white
                        hover:opacity-90 transition-opacity
                        flex items-center gap-1
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[project.priority]}`} />
                      <span className="truncate flex-1">{project.name}</span>
                    </div>
                  ))}
                  {dayProjects.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{dayProjects.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">
            Projects due on {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getProjectsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-gray-500">No projects due on this date</p>
            ) : (
              getProjectsForDate(selectedDate).map(project => (
                <div
                  key={project.id}
                  onClick={() => onProjectClick?.(project.id)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[project.status]}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <div className={`w-6 h-6 rounded-full ${project.owner.color} text-white flex items-center justify-center text-xs`}>
                            {project.owner.initials}
                          </div>
                          {project.owner.name}
                        </span>
                        <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                        <span>{project.progress}% complete</span>
                      </div>
                    </div>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${project.priority === 'high' ? 'bg-red-100 text-red-700' : 
                      project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'}
                  `}>
                    {project.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}