import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';

export function ProjectExpenses() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Jersey City Renovation</h1>
          <p className="text-gray-500 mt-1">Expenses</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <Link 
              to="/project/123/overview" 
              className="border-b-2 border-transparent py-4 px-1 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm font-medium text-gray-500 hover:text-gray-700">Overview</span>
            </Link>
            <div className="border-b-2 border-blue-500 py-4 px-1">
              <span className="text-sm font-medium text-blue-600">Expenses</span>
            </div>
          </nav>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Expense Tracking Module</h2>
            <p className="text-gray-500 mb-4">Track and manage all your project expenses in one place.</p>
            <p className="text-sm text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}