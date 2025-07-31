import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';

interface RemainingBudgetProps {
  amount: number;
}

export function RemainingBudget({ amount }: RemainingBudgetProps) {
  const isOverBudget = amount < 0;
  const percentageRemaining = amount > 0 ? (amount / 10000) * 100 : 0; // Assuming 10k budget
  
  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-6 hover:shadow-monday-hover transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Remaining Budget</h3>
        <Wallet className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${
            isOverBudget ? 'text-danger-500' : 'text-text-primary'
          }`}>
            {isOverBudget ? '-' : ''}${Math.abs(amount).toLocaleString()}
          </span>
          {!isOverBudget && (
            <span className="text-sm text-gray-500">
              ({percentageRemaining.toFixed(0)}% remaining)
            </span>
          )}
        </div>
        
        {isOverBudget ? (
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Over budget by ${Math.abs(amount).toLocaleString()}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget utilization</span>
              <span className="font-medium">{(100 - percentageRemaining).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${100 - percentageRemaining}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Average daily spend</span>
            <span className="font-medium">$83</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Days remaining</span>
            <span className="font-medium">90 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}