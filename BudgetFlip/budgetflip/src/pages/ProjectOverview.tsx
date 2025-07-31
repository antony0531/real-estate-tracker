import { Link } from 'react-router-dom';
import { BudgetGauge } from '../components/BudgetGauge';
import { SpendProjectionChart } from '../components/SpendProjectionChart';
import { UpcomingDueDates } from '../components/UpcomingDueDates';
import { RemainingBudget } from '../components/RemainingBudget';
import { SummaryCard } from '../components/SummaryCard';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function ProjectOverview() {
  // Hardcoded data for now
  const projectData = {
    budget: 10000,
    spent: 2500,
    remaining: 7500
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Jersey City Renovation</h1>
          <p className="text-text-secondary mt-1">Project Overview</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <div className="border-b-2 border-primary-500 py-4 px-1">
              <span className="text-sm font-medium text-primary-500">Overview</span>
            </div>
            <Link 
              to="/project/123/expenses" 
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
            value="$10,000"
            icon={DollarSign}
            color="blue"
          />
          <SummaryCard 
            title="Total Spent"
            value="$2,500"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: false }}
            color="amber"
          />
          <SummaryCard 
            title="Days Remaining"
            value="90"
            icon={Clock}
            color="green"
          />
          <SummaryCard 
            title="Tasks Complete"
            value="3/10"
            icon={CheckCircle}
            trend={{ value: 30, isPositive: true }}
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