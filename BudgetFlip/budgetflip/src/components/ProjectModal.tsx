import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ChevronDown, Search, Home } from 'lucide-react';
import { projectsAPI } from '../services/api';
import { ROOM_TEMPLATES, ROOM_CONDITIONS, RoomTemplate } from '../constants/roomTemplates';

interface Room {
  id: string;
  name: string;
  dimensions: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  icon?: string;
  renovationScope?: string[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export function ProjectModal({ isOpen, onClose, onProjectCreated }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    budget: '',
    start_date: new Date().toISOString().split('T')[0],
    target_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planning' as const,
    priority: 'medium' as const,
    description: ''
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addRoom = (template?: RoomTemplate) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: template?.name || '',
      dimensions: template?.typicalDimensions || '',
      condition: 'good',
      notes: '',
      icon: template?.icon,
      renovationScope: []
    };
    setRooms([...rooms, newRoom]);
    setShowRoomDropdown(false);
    setRoomSearch('');
  };

  const filteredRooms = ROOM_TEMPLATES.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(roomSearch.toLowerCase());
    const matchesCategory = !selectedCategory || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(ROOM_TEMPLATES.map(room => room.category)));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoomDropdown(false);
        setRoomSearch('');
        setSelectedCategory(null);
      }
    };

    if (showRoomDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showRoomDropdown]);

  const updateRoom = (id: string, field: keyof Room, value: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.budget || Number(formData.budget) <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const newProject = await projectsAPI.create({
        ...formData,
        budget: Number(formData.budget)
      });
      
      onProjectCreated(newProject);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        budget: '',
        start_date: new Date().toISOString().split('T')[0],
        target_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'planning',
        priority: 'medium',
        description: ''
      });
      setRooms([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-sm text-gray-600 mt-1">Enter project details and add rooms to track renovations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 123 Main Street Renovation"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Property Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 123 Main St, City, State 12345"
              />
            </div>

            {/* Budget and Dates Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="target_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Target End Date
                </label>
                <input
                  type="date"
                  id="target_end_date"
                  name="target_end_date"
                  value={formData.target_end_date}
                  onChange={handleChange}
                  min={formData.start_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div></div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Project details and notes..."
              />
            </div>

            {/* Rooms Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Rooms</h3>
                  <p className="text-sm text-gray-500">Add rooms to track renovation details and conditions</p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors shadow-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Add Room
                    <ChevronDown className={`w-4 h-4 transition-transform ${showRoomDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Room Dropdown */}
                  {showRoomDropdown && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                      {/* Search */}
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search rooms..."
                            value={roomSearch}
                            onChange={(e) => setRoomSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="px-3 py-3 flex gap-2 flex-wrap border-b bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            !selectedCategory 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        {categories.map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              selectedCategory === category 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>

                      {/* Room List */}
                      <div className="flex-1 overflow-y-auto min-h-[300px]">
                        {filteredRooms.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No rooms found</p>
                        ) : (
                          <div className="py-1">
                            {filteredRooms.map(room => (
                              <button
                                key={room.id}
                                type="button"
                                onClick={() => addRoom(room)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <span className="text-2xl">{room.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">{room.name}</div>
                                  <div className="text-xs text-gray-500">Typical: {room.typicalDimensions}</div>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 opacity-50" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Custom Room Option */}
                      <div className="border-t p-2">
                        <button
                          type="button"
                          onClick={() => addRoom()}
                          className="w-full px-3 py-2 text-left text-sm text-primary-600 hover:bg-primary-50 rounded flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Custom Room
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {rooms.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    No rooms added yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Click the "Add Room" button above to start tracking room details
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-primary-300 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {room.icon && <span className="text-3xl">{room.icon}</span>}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {room.name || 'Custom Room'}
                            </h4>
                            <p className="text-xs text-gray-500">Room #{rooms.indexOf(room) + 1}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRoom(room.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Room Name</label>
                          <input
                            type="text"
                            placeholder="Enter room name"
                            value={room.name}
                            onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Dimensions</label>
                          <input
                            type="text"
                            placeholder="e.g., 12x15 ft"
                            value={room.dimensions}
                            onChange={(e) => updateRoom(room.id, 'dimensions', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Condition</label>
                          <select
                            value={room.condition}
                            onChange={(e) => updateRoom(room.id, 'condition', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {ROOM_CONDITIONS.map(condition => (
                              <option key={condition.value} value={condition.value}>
                                {condition.label} - {condition.description}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                          <textarea
                            placeholder="Additional notes about this room..."
                            value={room.notes}
                            onChange={(e) => updateRoom(room.id, 'notes', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}