import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Home, Clock, 
  AlertCircle, CheckCircle, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, PieChart, BarChart3, Activity
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
  projectsInProfit: number;
  projectsInLoss: number;
  averageTimeToComplete: number;
}

interface RecentActivity {
  id: string;
  type: 'expense' | 'milestone' | 'status_change';
  projectName: string;
  description: string;
  timestamp: string;
  amount?: number;
}

interface ProjectSummary {
  id: string;
  displayId: string;
  name: string;
  status: string;
  investment: number;
  currentValue: number;
  roi: number;
  daysActive: number;
  progress: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageROI: 0,
    projectsInProfit: 0,
    projectsInLoss: 0,
    averageTimeToComplete: 0
  });
  const [topProjects, setTopProjects] = useState<ProjectSummary[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const projects = await projectsAPI.getAll();
      
      // Calculate metrics
      const calculatedMetrics = calculateMetrics(projects);
      setMetrics(calculatedMetrics);
      
      // Get top performing projects
      const sortedProjects = projects
        .map(project => ({
          id: project.id,
          displayId: project.display_id || `#${project.id.substring(0, 8)}`,
          name: project.name,
          status: project.status,
          investment: Number(project.total_spent) || 0,
          currentValue: Number(project.budget) || 0,
          roi: calculateROI(Number(project.budget), Number(project.total_spent)),
          daysActive: calculateDaysActive(project.start_date),
          progress: calculateProgress(project)
        }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5);
      
      setTopProjects(sortedProjects);
      
      // Mock recent activity (in real app, this would come from API)
      setRecentActivity([
        {
          id: '1',
          type: 'expense',
          projectName: 'Brooklyn Townhouse',
          description: 'Kitchen renovation materials',
          timestamp: new Date().toISOString(),
          amount: 5200
        },
        {
          id: '2',
          type: 'milestone',
          projectName: 'Queens Duplex',
          description: 'Demolition phase completed',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          type: 'status_change',
          projectName: 'Manhattan Studio',
          description: 'Status changed to In Progress',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (projects: any[]): DashboardMetrics => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalInvestment = projects.reduce((sum, p) => sum + (Number(p.total_spent) || 0), 0);
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    
    // Mock revenue calculation (in real app, this would be actual sale prices)
    const totalRevenue = completedProjects * 150000; // Mock average sale price
    const totalProfit = totalRevenue - totalInvestment;
    
    const projectsWithProfit = projects.filter(p => {
      const roi = calculateROI(Number(p.budget), Number(p.total_spent));
      return roi > 0;
    });
    
    const averageROI = projectsWithProfit.length > 0
      ? projectsWithProfit.reduce((sum, p) => sum + calculateROI(Number(p.budget), Number(p.total_spent)), 0) / projectsWithProfit.length
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalInvestment,
      totalRevenue,
      totalProfit,
      averageROI,
      projectsInProfit: projectsWithProfit.length,
      projectsInLoss: totalProjects - projectsWithProfit.length,
      averageTimeToComplete: 90 // Mock: 90 days average
    };
  };

  const calculateROI = (budget: number, spent: number): number => {
    if (spent === 0) return 0;
    return ((budget - spent) / spent) * 100;
  };

  const calculateDaysActive = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = (project: any): number => {
    if (!project.total_spent || !project.budget) return 0;
    return Math.min(100, (Number(project.total_spent) / Number(project.budget)) * 100);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Investment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Investment</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalInvestment)}</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Profit</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalProfit)}</div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">8.2%</span>
              <span className="text-gray-500 ml-1">increase</span>
            </div>
          </div>

          {/* Average ROI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Average ROI</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.averageROI)}</div>
            <div className="flex items-center mt-2 text-sm">
              <span className={`text-${metrics.averageROI >= 20 ? 'green' : 'yellow'}-500`}>
                {metrics.averageROI >= 20 ? 'Excellent' : 'Good'} Performance
              </span>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Active Projects</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.activeProjects}</div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">{metrics.completedProjects} completed</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Project Performance</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Projects
              </button>
            </div>
            <div className="space-y-4">
              {topProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => navigate(`/project/${project.id}/overview`)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className="text-sm text-gray-500">{project.displayId}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Investment: {formatCurrency(project.investment)}</span>
                      <span>•</span>
                      <span>{project.daysActive} days</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${project.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {project.roi >= 0 ? '+' : ''}{formatPercentage(project.roi)}
                    </div>
                    <div className="text-sm text-gray-500">ROI</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">In Profit</span>
                  <span className="text-sm font-medium text-green-600">{metrics.projectsInProfit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" 
                       style={{ width: `${(metrics.projectsInProfit / metrics.totalProjects) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Break Even</span>
                  <span className="text-sm font-medium text-yellow-600">2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">In Loss</span>
                  <span className="text-sm font-medium text-red-600">{metrics.projectsInLoss}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" 
                       style={{ width: `${(metrics.projectsInLoss / metrics.totalProjects) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.averageROI)}</div>
                <div className="text-sm text-gray-500">Average ROI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'expense' ? 'bg-red-100' :
                    activity.type === 'milestone' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.type === 'expense' ? <DollarSign className="w-4 h-4 text-red-600" /> :
                     activity.type === 'milestone' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                     <AlertCircle className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.projectName}</div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    {activity.amount && (
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(activity.amount)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/projects')}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-700">New Project</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              
              <Link
                to="/expenses"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Track Expense</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              
              <Link
                to="/reports"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">View Reports</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}