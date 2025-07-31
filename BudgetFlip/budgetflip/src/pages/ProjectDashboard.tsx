import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle,
  Home, Users, Calendar, FileText, ArrowUpRight, ArrowDownRight,
  Activity, Loader2, PieChart, BarChart3, Hammer, MapPin
} from 'lucide-react';
import { projectsAPI, type Project } from '../services/api';
import { ROOM_CONDITIONS } from '../constants/roomTemplates';

interface ProjectMetrics {
  currentROI: number;
  projectedROI: number;
  burnRate: number;
  daysUntilBudgetExhaustion: number;
  costPerSqFt: number;
  roomsCompleted: number;
  totalRooms: number;
  daysElapsed: number;
  projectedDays: number;
  budgetUtilization: number;
}

interface RoomStatus {
  id: string;
  name: string;
  condition: string;
  budget: number;
  spent: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsAPI.getById(id!);
      setProject(data);
      
      // Calculate metrics
      const calculatedMetrics = calculateProjectMetrics(data);
      setMetrics(calculatedMetrics);
      
      // Mock room data (in real app, this would come from API)
      const mockRooms = generateMockRooms();
      setRooms(mockRooms);
      
      // Mock expense categories
      const mockCategories = generateMockExpenseCategories(data);
      setExpenseCategories(mockCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProjectMetrics = (project: Project): ProjectMetrics => {
    const budget = Number(project.budget) || 0;
    const spent = Number(project.total_spent) || 0;
    const remaining = budget - spent;
    
    // Calculate days
    const startDate = new Date(project.start_date || new Date());
    const targetDate = new Date(project.target_end_date || new Date());
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalProjectDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate burn rate (daily spend)
    const burnRate = daysElapsed > 0 ? spent / daysElapsed : 0;
    const daysUntilBudgetExhaustion = burnRate > 0 ? Math.floor(remaining / burnRate) : 999;
    
    // ROI calculations (mock - in real app would use purchase price and ARV)
    const purchasePrice = budget * 0.6; // Mock: 60% of budget is purchase price
    const estimatedARV = budget * 1.4; // Mock: 40% profit margin target
    const currentValue = purchasePrice + spent;
    const currentROI = ((currentValue - purchasePrice) / purchasePrice) * 100;
    const projectedROI = ((estimatedARV - budget) / budget) * 100;
    
    // Mock other metrics
    const roomsCompleted = 3;
    const totalRooms = 8;
    const costPerSqFt = spent / 1500; // Mock 1500 sq ft
    const budgetUtilization = (spent / budget) * 100;
    
    return {
      currentROI,
      projectedROI,
      burnRate,
      daysUntilBudgetExhaustion,
      costPerSqFt,
      roomsCompleted,
      totalRooms,
      daysElapsed,
      projectedDays: totalProjectDays,
      budgetUtilization
    };
  };

  const generateMockRooms = (): RoomStatus[] => {
    return [
      { id: '1', name: 'Kitchen', condition: 'poor', budget: 25000, spent: 18000, progress: 72, status: 'in_progress' },
      { id: '2', name: 'Master Bathroom', condition: 'fair', budget: 15000, spent: 15000, progress: 100, status: 'completed' },
      { id: '3', name: 'Living Room', condition: 'good', budget: 8000, spent: 7500, progress: 100, status: 'completed' },
      { id: '4', name: 'Master Bedroom', condition: 'fair', budget: 5000, spent: 3000, progress: 60, status: 'in_progress' },
      { id: '5', name: 'Guest Bathroom', condition: 'poor', budget: 8000, spent: 0, progress: 0, status: 'not_started' },
      { id: '6', name: 'Basement', condition: 'poor', budget: 20000, spent: 5000, progress: 25, status: 'in_progress' },
      { id: '7', name: 'Exterior', condition: 'fair', budget: 12000, spent: 12000, progress: 100, status: 'completed' },
      { id: '8', name: 'Garage', condition: 'good', budget: 3000, spent: 0, progress: 0, status: 'not_started' }
    ];
  };

  const generateMockExpenseCategories = (project: Project): ExpenseCategory[] => {
    const total = Number(project.total_spent) || 0;
    return [
      { name: 'Materials', amount: total * 0.4, percentage: 40, color: 'bg-blue-500' },
      { name: 'Labor', amount: total * 0.35, percentage: 35, color: 'bg-green-500' },
      { name: 'Permits', amount: total * 0.05, percentage: 5, color: 'bg-yellow-500' },
      { name: 'Equipment', amount: total * 0.1, percentage: 10, color: 'bg-purple-500' },
      { name: 'Other', amount: total * 0.1, percentage: 10, color: 'bg-gray-500' }
    ];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getRoomStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoomConditionColor = (condition: string): string => {
    const conditionData = ROOM_CONDITIONS.find(c => c.value === condition);
    return conditionData?.color || 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !project || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const budget = Number(project.budget) || 0;
  const spent = Number(project.total_spent) || 0;
  const remaining = budget - spent;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {project.address || 'No address provided'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started {new Date(project.start_date || new Date()).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {project.display_id || `#${project.id.substring(0, 8)}`}
                </span>
              </div>
            </div>
            <Link
              to={`/project/${id}/expenses`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Manage Expenses
            </Link>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Current ROI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Current ROI</span>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${metrics.currentROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.currentROI >= 0 ? '+' : ''}{formatPercentage(metrics.currentROI)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              vs target {formatPercentage(metrics.projectedROI)}
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Budget Used</span>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.budgetUtilization)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, metrics.budgetUtilization)}%` }}
              />
            </div>
          </div>

          {/* Burn Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Daily Burn Rate</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.burnRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.daysUntilBudgetExhaustion} days remaining
            </div>
          </div>

          {/* Room Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Rooms Complete</span>
              <Home className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.roomsCompleted}/{metrics.totalRooms}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage((metrics.roomsCompleted / metrics.totalRooms) * 100)} complete
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Timeline</span>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.daysElapsed} days
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {metrics.projectedDays} projected
            </div>
          </div>
        </div>

        {/* Room Status Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Room Renovation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${getRoomStatusColor(room.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    <span className={`text-xs ${getRoomConditionColor(room.condition)}`}>
                      {room.condition} condition
                    </span>
                  </div>
                  {room.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {room.status === 'in_progress' && <Clock className="w-5 h-5 text-blue-600" />}
                  {room.status === 'not_started' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">{formatCurrency(room.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">{formatCurrency(room.spent)}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{room.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          room.status === 'completed' ? 'bg-green-500' :
                          room.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${room.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h2>
            <div className="space-y-4">
              {expenseCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${category.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Expenses</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(spent)}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Total Budget</span>
                <span className="text-lg font-medium text-gray-900">{formatCurrency(budget)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Total Spent</span>
                <span className="text-lg font-medium text-orange-600">{formatCurrency(spent)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Remaining Budget</span>
                <span className={`text-lg font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(remaining))}
                  {remaining < 0 && ' over'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per Sq Ft</span>
                <span className="text-lg font-medium text-gray-900">
                  {formatCurrency(metrics.costPerSqFt)}/sq ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/project/${id}/expenses`)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Add Expense</h3>
                  <p className="text-sm text-gray-600">Track new costs</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>

          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Generate Report</h3>
                  <p className="text-sm text-gray-600">Export project data</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>

          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Manage Team</h3>
                  <p className="text-sm text-gray-600">Contractors & vendors</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}