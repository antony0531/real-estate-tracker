import React from 'react';
import { LayoutGrid, Columns3, Calendar, Table } from 'lucide-react';

export type ViewMode = 'grid' | 'kanban' | 'table' | 'calendar';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: 'grid' as ViewMode, label: 'Grid', icon: LayoutGrid },
    { id: 'kanban' as ViewMode, label: 'Kanban', icon: Columns3 },
    { id: 'table' as ViewMode, label: 'Table', icon: Table },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar }
  ];

  return (
    <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200
              ${isActive 
                ? 'bg-primary-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            aria-label={`Switch to ${view.label} view`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}