import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface SpendProjectionChartProps {
  data: any[];
}

export function SpendProjectionChart({ data }: SpendProjectionChartProps) {
  // Mock data for demonstration
  const mockData = [
    { month: 'Jan', actual: 500, projected: 500 },
    { month: 'Feb', actual: 1200, projected: 1200 },
    { month: 'Mar', actual: 2500, projected: 2500 },
    { month: 'Apr', actual: null, projected: 3800 },
    { month: 'May', actual: null, projected: 5200 },
    { month: 'Jun', actual: null, projected: 6800 },
    { month: 'Jul', actual: null, projected: 8600 },
    { month: 'Aug', actual: null, projected: 10000 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-6 hover:shadow-monday-hover transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Spend Projection</h3>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0073ea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0073ea" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <Tooltip 
              formatter={(value: any) => `$${value?.toLocaleString() || 0}`}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#0073ea" 
              fillOpacity={1} 
              fill="url(#colorActual)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="projected" 
              stroke="#94a3b8" 
              fillOpacity={1} 
              fill="url(#colorProjected)" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Actual Spend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-gray-600">Projected</span>
        </div>
      </div>
    </div>
  );
}