import { useState } from 'react';
import { EyeOff, Plus, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';

type TaskStatus = 'working' | 'stuck' | 'done' | 'pending';
type TaskPriority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  budget?: number;
  spent?: number;
}

export function MyWork() {
  const [activeTab, setActiveTab] = useState<'boards' | 'following'>('boards');
  const [hideDoneItems, setHideDoneItems] = useState(false);

  // Mock tasks data organized by time periods
  const tasks: Task[] = [
    // Past Due
    {
      id: '1',
      title: 'Kitchen Cabinet Installation',
      project: 'Jersey City Renovation',
      dueDate: '2024-01-25',
      status: 'stuck',
      priority: 'high',
      assignee: { name: 'Anthony Sandoval', initials: 'AS', color: 'bg-pink-500' },
      budget: 5000,
      spent: 2800
    },
    {
      id: '2',
      title: 'Bathroom Tile Purchase',
      project: 'Brooklyn Townhouse',
      dueDate: '2024-01-28',
      status: 'working',
      priority: 'medium',
      assignee: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
      budget: 1200,
      spent: 0
    },
    // This Week  
    {
      id: '3',
      title: 'Paint Living Room',
      project: 'Queens Duplex',
      dueDate: '2024-02-01',
      status: 'working',
      priority: 'medium',
      assignee: { name: 'Sarah Smith', initials: 'SS', color: 'bg-green-500' },
      budget: 800,
      spent: 320
    },
    {
      id: '4',
      title: 'Install New Flooring',
      project: 'Manhattan Studio',
      dueDate: '2024-02-02',
      status: 'pending',
      priority: 'high',
      assignee: { name: 'Mike Johnson', initials: 'MJ', color: 'bg-purple-500' },
      budget: 3500,
      spent: 0
    },
    {
      id: '5',
      title: 'Electrical Work Complete',
      project: 'Bronx Apartment',
      dueDate: '2024-01-30',
      status: 'done',
      priority: 'high',
      assignee: { name: 'Emily Davis', initials: 'ED', color: 'bg-yellow-500' },
      budget: 2200,
      spent: 2150
    },
    // Next Week
    {
      id: '6',
      title: 'Order Kitchen Appliances',
      project: 'Jersey City Renovation',
      dueDate: '2024-02-08',
      status: 'pending',
      priority: 'low',
      assignee: { name: 'Anthony Sandoval', initials: 'AS', color: 'bg-pink-500' },
      budget: 4500,
      spent: 0
    },
    // Later
    {
      id: '7',
      title: 'Final Inspection',
      project: 'Brooklyn Townhouse',
      dueDate: '2024-02-20',
      status: 'pending',
      priority: 'medium',
      assignee: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' }
    }
  ];

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'working': return 'bg-orange-500';
      case 'stuck': return 'bg-red-500';
      case 'done': return 'bg-green-500';
      case 'pending': return 'bg-gray-400';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const organizeTasksByTime = (tasks: Task[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    const pastDue: Task[] = [];
    const thisWeek: Task[] = [];
    const nextWeek: Task[] = [];
    const later: Task[] = [];

    tasks.forEach(task => {
      if (hideDoneItems && task.status === 'done') return;
      
      const dueDate = new Date(task.dueDate);
      if (dueDate < startOfWeek) {
        pastDue.push(task);
      } else if (dueDate >= startOfWeek && dueDate <= endOfWeek) {
        thisWeek.push(task);
      } else if (dueDate >= startOfNextWeek && dueDate <= endOfNextWeek) {
        nextWeek.push(task);
      } else {
        later.push(task);
      }
    });

    return { pastDue, thisWeek, nextWeek, later };
  };

  const { pastDue, thisWeek, nextWeek, later } = organizeTasksByTime(tasks);

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h3>
          <p className="text-xs text-gray-500">{task.project}</p>
        </div>
        <div className="flex items-center gap-2">
          {getPriorityIcon(task.priority)}
          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 ${task.assignee.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
            {task.assignee.initials}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </div>
        
        {task.budget && (
          <div className="flex items-center text-xs text-gray-500">
            <DollarSign className="w-3 h-3 mr-1" />
            {task.spent}/{task.budget}
          </div>
        )}
      </div>
    </div>
  );

  const TimeSection = ({ title, tasks, isActive = false }: { title: string; tasks: Task[]; isActive?: boolean }) => (
    <div className="mb-6">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${isActive ? 'border-primary-500' : 'border-gray-200'}`}>
        <h3 className={`font-semibold ${isActive ? 'text-primary-500' : 'text-gray-700'}`}>
          {title} ({tasks.length})
        </h3>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No items</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 md:bg-background-secondary">
      <div className="max-w-md mx-auto bg-gray-100 md:bg-background-secondary px-4 py-6 md:hidden">
        {/* Header Controls */}
        <div className="mb-6">
          {/* Tabs */}
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab('boards')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'boards'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              Boards
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'following'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              Following
            </button>
          </div>

          {/* Hide done items toggle */}
          <button
            onClick={() => setHideDoneItems(!hideDoneItems)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hideDoneItems 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Hide done items
          </button>
        </div>

        {/* Time-based sections */}
        {activeTab === 'boards' && (
          <div>
            <TimeSection title="Past Dates" tasks={pastDue} />
            <TimeSection title="This Week" tasks={thisWeek} isActive />
            <TimeSection title="Next Week" tasks={nextWeek} />
            <TimeSection title="Later" tasks={later} />
          </div>
        )}

        {activeTab === 'following' && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No items you're following</p>
            <p className="text-sm text-gray-400">Items you follow will appear here</p>
          </div>
        )}

        {/* Floating Add Button */}
        <button className="fixed bottom-20 right-4 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center z-40">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop fallback */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Work</h1>
            <p className="text-gray-600">This page is optimized for mobile. Please view on a mobile device for the best experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}