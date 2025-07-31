import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BudgetGauge } from '../components/BudgetGauge';
import { SpendProjectionChart } from '../components/SpendProjectionChart';
import { UpcomingDueDates } from '../components/UpcomingDueDates';
import { RemainingBudget } from '../components/RemainingBudget';
import { SummaryCard } from '../components/SummaryCard';
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { projectsAPI, type Project } from '../services/api';

const calculateDaysRemaining = (targetEndDate?: string): string => {
  if (!targetEndDate) return 'N/A';
  const target = new Date(targetEndDate);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days.toString() : '0';
};

const formatStatus = (status?: string): string => {
  if (!status) return 'Unknown';
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function ProjectOverview() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsAPI.getById(id!);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      console.error('Error loading project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !project) {
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

  const projectData = {
    budget: Number(project.budget) || 0,
    spent: Number(project.total_spent) || 0,
    remaining: (Number(project.budget) || 0) - (Number(project.total_spent) || 0)
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
          <p className="text-text-secondary mt-1">Project Overview</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <div className="border-b-2 border-primary-500 py-4 px-1">
              <span className="text-sm font-medium text-primary-500">Overview</span>
            </div>
            <Link 
              to={`/project/${id}/expenses`} 
              className="border-b-2 border-transparent py-4 px-1 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm font-medium text-text-secondary hover:text-text-primary">Expenses</span>
            </Link>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard 
            title="Total Budget"
            value={`$${projectData.budget.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <SummaryCard 
            title="Total Spent"
            value={`$${projectData.spent.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: projectData.budget > 0 ? Math.round((projectData.spent / projectData.budget) * 100) : 0, isPositive: false }}
            color="amber"
          />
          <SummaryCard 
            title="Days Remaining"
            value={calculateDaysRemaining(project.target_end_date)}
            icon={Clock}
            color="green"
          />
          <SummaryCard 
            title="Status"
            value={formatStatus(project.status)}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Budget Overview Card */}
          <div className="md:col-span-2">
            <BudgetGauge budget={projectData.budget} spent={projectData.spent} />
          </div>
          
          {/* Remaining Budget Card */}
          <div className="md:col-span-2">
            <RemainingBudget amount={projectData.remaining} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SpendProjectionChart data={[]} />
          <UpcomingDueDates items={[]} />
        </div>
      </div>
    </div>
  );
}