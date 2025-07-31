import React, { useState } from 'react';
import { X, Filter, ChevronDown, Calendar, DollarSign, User, Tag, TrendingUp } from 'lucide-react';

interface FilterCriteria {
  status: string[];
  priority: string[];
  owners: string[];
  budgetRange: { min: number; max: number };
  progressRange: { min: number; max: number };
  dateRange: { start: string; end: string };
}

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  availableOwners: { name: string; initials: string; color: string }[];
}

export function AdvancedFilter({ isOpen, onClose, onApplyFilters, availableOwners }: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    status: [],
    priority: [],
    owners: [],
    budgetRange: { min: 0, max: 100000 },
    progressRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' }
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status', 'priority']));

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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleFilter = (category: 'status' | 'priority' | 'owners', value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: [],
      priority: [],
      owners: [],
      budgetRange: { min: 0, max: 100000 },
      progressRange: { min: 0, max: 100 },
      dateRange: { start: '', end: '' }
    });
  };

  const activeFilterCount = 
    filters.status.length + 
    filters.priority.length + 
    filters.owners.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.budgetRange.min > 0 || filters.budgetRange.max < 100000 ? 1 : 0) +
    (filters.progressRange.min > 0 || filters.progressRange.max < 100 ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Filter */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('status')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Status</span>
                {filters.status.length > 0 && (
                  <span className="text-sm text-gray-500">({filters.status.length} selected)</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has('status') ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.has('status') && (
              <div className="px-6 pb-4 space-y-2">
                {statusOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => toggleFilter('status', option.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('priority')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Priority</span>
                {filters.priority.length > 0 && (
                  <span className="text-sm text-gray-500">({filters.priority.length} selected)</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has('priority') ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.has('priority') && (
              <div className="px-6 pb-4 space-y-2">
                {priorityOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(option.value)}
                      onChange={() => toggleFilter('priority', option.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Owner Filter */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('owners')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Owner</span>
                {filters.owners.length > 0 && (
                  <span className="text-sm text-gray-500">({filters.owners.length} selected)</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has('owners') ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.has('owners') && (
              <div className="px-6 pb-4 space-y-2">
                {availableOwners.map(owner => (
                  <label
                    key={owner.name}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={filters.owners.includes(owner.name)}
                      onChange={() => toggleFilter('owners', owner.name)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${owner.color} text-white flex items-center justify-center text-xs font-medium`}>
                        {owner.initials}
                      </div>
                      <span className="text-sm text-gray-700">{owner.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Budget Range */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('budget')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Budget Range</span>
                {(filters.budgetRange.min > 0 || filters.budgetRange.max < 100000) && (
                  <span className="text-sm text-gray-500">
                    ${filters.budgetRange.min.toLocaleString()} - ${filters.budgetRange.max.toLocaleString()}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has('budget') ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.has('budget') && (
              <div className="px-6 pb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Budget
                  </label>
                  <input
                    type="number"
                    value={filters.budgetRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Budget
                  </label>
                  <input
                    type="number"
                    value={filters.budgetRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="100000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('date')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Due Date Range</span>
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="text-sm text-gray-500">
                    {filters.dateRange.start} - {filters.dateRange.end}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has('date') ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.has('date') && (
              <div className="px-6 pb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset all
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}