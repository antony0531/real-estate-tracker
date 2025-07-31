import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
}

export function BudgetGauge({ budget, spent }: BudgetGaugeProps) {
  const [animatedSpent, setAnimatedSpent] = useState(0);
  
  useEffect(() => {
    // Animate the spent value on mount
    const timer = setTimeout(() => {
      setAnimatedSpent(spent);
    }, 100);
    return () => clearTimeout(timer);
  }, [spent]);
  const remaining = budget - animatedSpent;
  const percentage = (animatedSpent / budget) * 100;
  
  const data = [
    { name: 'Spent', value: animatedSpent },
    { name: 'Remaining', value: budget - animatedSpent }
  ];
  
  const getColor = () => {
    if (percentage < 50) return '#00c875'; // Monday green
    if (percentage < 80) return '#ffcb00'; // Monday yellow
    return '#e2445c'; // Monday red
  };

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-6 hover:shadow-monday-hover transition-all duration-200 hover:border-gray-300">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Overview</h3>
      
      <div className="flex items-center">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                <Cell fill={getColor()} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</div>
              <div className="text-sm text-gray-500">used</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 flex-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-sm font-semibold">${budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Spent</span>
              <span className="text-sm font-semibold" style={{ color: getColor() }}>
                ${spent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-sm font-semibold">${remaining.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}