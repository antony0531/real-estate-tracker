import { ExpenseCategory } from './index'

// Expense data types
export interface Expense {
  id: number
  projectId: number
  roomId?: number
  category: ExpenseCategory
  description: string
  cost: number
  notes?: string
  createdAt: string
  
  // Related data (for joins)
  roomName?: string
  projectName?: string
}

// Form data types for creating/updating expenses
export interface ExpenseFormData {
  category: ExpenseCategory
  description: string
  cost: number
  roomId?: number
  notes?: string
}

// Expense summary types
export interface ExpenseSummary {
  totalExpenses: number
  materialCosts: number
  laborCosts: number
  expenseCount: number
  averageExpense: number
  byCategory: {
    [ExpenseCategory.MATERIAL]: number
    [ExpenseCategory.LABOR]: number
  }
  byRoom: Array<{
    roomId: number
    roomName: string
    totalCost: number
    expenseCount: number
  }>
}

// Budget analysis types
export interface BudgetAnalysis {
  projectId: number
  totalBudget: number
  totalSpent: number
  remaining: number
  percentUsed: number
  isOverBudget: boolean
  
  // Room breakdown
  roomBreakdown: Array<{
    roomId: number
    roomName: string
    budgetAllocated?: number
    totalSpent: number
    percentOfTotal: number
  }>
  
  // Category breakdown
  categoryBreakdown: {
    [ExpenseCategory.MATERIAL]: {
      total: number
      count: number
      percentage: number
    }
    [ExpenseCategory.LABOR]: {
      total: number
      count: number
      percentage: number
    }
  }
  
  // Trend data for charts
  spendingTrend: Array<{
    date: string
    cumulativeSpent: number
    dailySpent: number
  }>
} 