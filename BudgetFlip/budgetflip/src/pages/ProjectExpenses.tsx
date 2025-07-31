import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Receipt, Plus, Search, Filter, Trash2, Edit, 
  ChevronDown, DollarSign, Calendar, Building,
  CheckCircle, XCircle, Clock, AlertCircle,
  Download, Upload, MoreVertical
} from 'lucide-react';
import { expensesAPI, projectsAPI, type Expense, type Project } from '../services/api';
import { format } from 'date-fns';
import { EditExpenseModal } from '../components/modals/EditExpenseModal';
import { QuickExpenseModal } from '../components/QuickExpenseModal';

export function ProjectExpenses() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  // Load project and expenses
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(expense => expense.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category_id === selectedCategory);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'vendor':
          aVal = a.vendor.toLowerCase();
          bVal = b.vendor.toLowerCase();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, selectedStatus, selectedCategory, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load project details
      const projectData = await projectsAPI.getById(projectId!);
      setProject(projectData);

      // Load expenses
      const expensesData = await expensesAPI.getByProject(projectId!);
      setExpenses(expensesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (expense: Partial<Expense>) => {
    try {
      const newExpense = await expensesAPI.create({
        ...expense,
        project_id: projectId!
      });
      setExpenses([newExpense, ...expenses]);
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const handleEditExpense = async (updates: Partial<Expense>) => {
    if (!selectedExpense) return;
    
    try {
      const updatedExpense = await expensesAPI.update(selectedExpense.id, updates);
      setExpenses(expenses.map(exp => 
        exp.id === selectedExpense.id ? updatedExpense : exp
      ));
      setShowEditModal(false);
      setSelectedExpense(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      await expensesAPI.delete(expenseToDelete);
      setExpenses(expenses.filter(exp => exp.id !== expenseToDelete));
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedExpenses).map(id => expensesAPI.delete(id)));
      setExpenses(expenses.filter(exp => !selectedExpenses.has(exp.id)));
      setSelectedExpenses(new Set());
      setShowBulkActions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expenses');
    }
  };

  const toggleExpenseSelection = (id: string) => {
    const newSelection = new Set(selectedExpenses);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedExpenses(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAllExpenses = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map(exp => exp.id)));
      setShowBulkActions(true);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paid':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      case 'paid':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-yellow-50 text-yellow-700';
    }
  };

  // Calculate summary stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const approvedExpenses = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + Number(exp.amount), 0);
  const categories = Array.from(new Set(expenses.map(exp => exp.category_id).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Project'}</h1>
          <p className="text-gray-500 mt-1">Expenses</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <Link 
              to={`/project/${projectId}/overview`}
              className="border-b-2 border-transparent py-4 px-1 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm font-medium text-gray-500 hover:text-gray-700">Overview</span>
            </Link>
            <div className="border-b-2 border-blue-500 py-4 px-1">
              <span className="text-sm font-medium text-blue-600">Expenses</span>
            </div>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
              </div>
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">${approvedExpenses.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${pendingExpenses.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget Remaining</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(Number(project?.budget || 0) - totalExpenses).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="vendor">Vendor</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {showBulkActions && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedExpenses.size})
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0}
                      onChange={selectAllExpenses}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No expenses found</p>
                      <p className="text-sm mt-1">Add your first expense to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.has(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{expense.vendor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${Number(expense.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          {expense.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowEditModal(true);
                            }}
                            className="text-gray-400 hover:text-primary-500 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setExpenseToDelete(expense.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <QuickExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={() => loadData()}
        projectId={projectId}
      />

      {/* Edit Expense Modal */}
      {selectedExpense && (
        <EditExpenseModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          onSave={handleEditExpense}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}