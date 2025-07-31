import { Calendar, AlertCircle } from 'lucide-react';

interface DueDate {
  id: string;
  title: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  amount?: number;
}

interface UpcomingDueDatesProps {
  items: DueDate[];
}

export function UpcomingDueDates({ items }: UpcomingDueDatesProps) {
  // Hardcoded items for now
  const mockItems: DueDate[] = [
    { id: '1', title: 'Contractor Payment', date: '2024-02-15', priority: 'high', amount: 5000 },
    { id: '2', title: 'Material Delivery', date: '2024-02-18', priority: 'medium' },
    { id: '3', title: 'Permit Renewal', date: '2024-02-20', priority: 'low', amount: 250 },
    { id: '4', title: 'Inspection Fee', date: '2024-02-25', priority: 'medium', amount: 500 }
  ];

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-danger-500 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-warning-500 border-amber-200';
      case 'low':
        return 'bg-green-50 text-success-500 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-monday border border-gray-200 p-6 hover:shadow-monday-hover transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Upcoming Due Dates</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {mockItems.map(item => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${
                item.priority === 'high' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <AlertCircle className={`w-4 h-4 ${
                  item.priority === 'high' ? 'text-red-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {item.amount && (
                <span className="text-sm font-medium text-gray-700">
                  ${item.amount.toLocaleString()}
                </span>
              )}
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPriorityStyles(item.priority)}`}>
                {item.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-4 w-full text-center text-sm text-primary-500 hover:text-primary-600 font-medium">
        View all due dates →
      </button>
    </div>
  );
}