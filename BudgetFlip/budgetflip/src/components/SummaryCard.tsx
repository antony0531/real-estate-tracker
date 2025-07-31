import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red';
}

export function SummaryCard({ title, value, icon: Icon, trend, color = 'blue' }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600 border-primary-200',
    green: 'bg-green-50 text-success-500 border-green-200',
    amber: 'bg-amber-50 text-warning-500 border-amber-200',
    red: 'bg-red-50 text-danger-500 border-red-200'
  };

  const iconColorClasses = {
    blue: 'text-primary-500',
    green: 'text-success-500',
    amber: 'text-warning-500',
    red: 'text-danger-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-6 hover:shadow-monday-hover transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}