// Expenses.tsx - Enhanced with edit and delete functionality

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { TauriService } from "@/services/tauri";
import ExpenseModal from "@/components/ExpenseModal";
import EditExpenseModal from "@/components/modals/EditExpenseModal";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import ScrollableSelect from "@/components/ui/ScrollableSelect";

interface Expense {
  id: number;
  project_id: number;
  project_name: string;
  room_name: string;
  category: "material" | "labor";
  cost: number;
  labor_hours?: number;
  room_condition_after?: number;
  notes?: string;
  date: string;
}

interface Project {
  id: number;
  name: string;
  budget: number;
  rooms: Array<{ name: string }>;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterProject, setFilterProject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);

      // Get all projects first
      const projectsOutput = await TauriService.getProjects();
      const projectsData = parseProjectsFromOutput(projectsOutput);
      setProjects(projectsData);

      // Get all expenses
      const allExpensesOutput = await TauriService.getAllExpenses();
      const expensesData = parseAllExpensesFromOutput(
        allExpensesOutput,
        projectsData,
      );
      setExpenses(expensesData);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      toast.error(
        `Failed to load expenses: ${TauriService.handleError(error)}`,
      );
      setExpenses([]);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseProjectsFromOutput = (output: string) => {
    const lines = output.trim().split("\n");
    const projects: Project[] = [];

    for (const line of lines) {
      if (line.startsWith("│") && line.includes("$")) {
        const columns = line
          .split("│")
          .map((col) => col.trim())
          .filter((col) => col);
        if (columns.length >= 2) {
          const id = parseInt(columns[0]);
          const name = columns[1];
          if (!isNaN(id) && name) {
            projects.push({ id, name, budget: 0, rooms: [] }); // Placeholder for budget and rooms
          }
        }
      }
    }

    return projects;
  };

  const parseAllExpensesFromOutput = (
    output: string,
    projectsData: Project[],
  ): Expense[] => {
    const expenses: Expense[] = [];
    const projectSections = output.split("\n---PROJECT_SEPARATOR---\n");

    projectSections.forEach((section, projectIndex) => {
      const lines = section.trim().split("\n");

      // Find project name from section header or use project index
      let projectName = "Unknown Project";
      let projectId = projectIndex + 1;

      for (const line of lines) {
        if (line.includes("Expenses for Project:")) {
          const match = line.match(/Expenses for Project: (.+)/);
          if (match) {
            projectName = match[1].trim();
            // Try to find project ID from projectsData
            const foundProject = projectsData.find(
              (p) => p.name === projectName,
            );
            if (foundProject) {
              projectId = foundProject.id;
            }
          }
          break;
        }
      }

      // Parse expense table rows
      for (const line of lines) {
        // Skip header and separator lines
        if (
          line.includes("──") ||
          line.includes("Date") ||
          line.includes("Cost") ||
          line.includes("ID")
        ) {
          continue;
        }

        // Look for lines with expense data (containing $ symbol)
        if (line.includes("$")) {
          const columns = line
            .split("│")
            .map((col) => col.trim())
            .filter((col) => col);

          if (columns.length >= 5) {
            // New format: ID, Date, Room, Category, Cost, Notes
            const [id, date, roomName, category, cost, notes] = columns;

            const costMatch = cost.match(/\$([0-9,]+(?:\.[0-9]+)?)/);
            const costValue = costMatch
              ? parseFloat(costMatch[1].replace(/,/g, ""))
              : 0;

            if (costValue > 0) {
              expenses.push({
                id: parseInt(id) || expenses.length + 1,
                project_id: projectId,
                project_name: projectName,
                room_name: roomName || "Unknown Room",
                category: category as "material" | "labor",
                cost: costValue,
                labor_hours: undefined, // Not in new format
                notes: notes || "",
                date: date || "Unknown",
              });
            }
          }
        }
      }
    });

    return expenses;
  };

  const filteredExpenses = expenses.filter((expense) => {
    const projectMatch =
      filterProject === "all" ||
      expense.project_id.toString() === filterProject;
    const categoryMatch =
      filterCategory === "all" ||
      expense.category.toLowerCase() === filterCategory.toLowerCase();
    return projectMatch && categoryMatch;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.cost,
    0,
  );
  const materialExpenses = filteredExpenses
    .filter((e) => e.category.toLowerCase() === "material")
    .reduce((sum, e) => sum + e.cost, 0);
  const laborExpenses = filteredExpenses
    .filter((e) => e.category.toLowerCase() === "labor")
    .reduce((sum, e) => sum + e.cost, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = filteredExpenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + e.cost, 0);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "material":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "labor":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const handleAddExpense = () => {
    if (projects.length === 0) {
      toast.error("Please create a project first before adding expenses");
      return;
    }
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      await TauriService.deleteExpense(selectedExpense.id);
      toast.success("Expense deleted successfully!");
      loadExpenses(); // Reload expenses after deletion
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error(`Failed to delete expense: ${error}`);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleEditSuccess = () => {
    loadExpenses(); // Reload expenses after edit
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Professional Header - Monday.com Style */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
              Expenses
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage project expenses across your portfolio
            </p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            onClick={handleAddExpense}
          >
            + Add Expense
          </button>
        </div>

        {/* Enhanced Filters & Search - Notion Style */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filter & Search
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredExpenses.length} of {expenses.length} expenses
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Project Filter */}
            <div className="md:col-span-2">
              <ScrollableSelect
                label="Project"
                value={filterProject}
                onChange={(value) => setFilterProject(value)}
                options={[
                  {
                    value: "all",
                    label: "All Projects",
                    description: `${expenses.length} total expenses`,
                  },
                  ...projects.map((project) => ({
                    value: project.id.toString(),
                    label: project.name,
                    description: `Budget: $${project.budget?.toLocaleString() || "0"}`,
                  })),
                ]}
                placeholder="Select project filter"
                searchable={true}
                maxHeight="250px"
                className="w-full"
              />
            </div>

            {/* Category Filter */}
            <div>
              <ScrollableSelect
                label="Category"
                value={filterCategory}
                onChange={(value) => setFilterCategory(value)}
                options={[
                  {
                    value: "all",
                    label: "All Categories",
                    description: "Materials and Labor",
                  },
                  {
                    value: "material",
                    label: "Materials",
                    description: "Physical materials and supplies",
                  },
                  {
                    value: "labor",
                    label: "Labor",
                    description: "Work and professional services",
                  },
                ]}
                placeholder="Select category"
                searchable={false}
                maxHeight="200px"
                className="w-full"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterProject("all");
                  setFilterCategory("all");
                }}
                className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards - Monday.com Style */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Expense Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    Total
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All projects
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredExpenses.length} transactions
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    This Month
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                ${thisMonthExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monthly total
              </p>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    Materials
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supplies
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ${materialExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalExpenses > 0
                  ? ((materialExpenses / totalExpenses) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>

          {/* Labor */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    Labor
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Contractors
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${laborExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalExpenses > 0
                  ? ((laborExpenses / totalExpenses) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Expenses Table/List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {expenses.length === 0
              ? "No Expenses Yet"
              : "No Expenses Match Filter"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {expenses.length === 0
              ? "Start tracking your project expenses to monitor spending and stay within budget."
              : "Try adjusting your filters to see more expenses."}
          </p>
          <div className="space-y-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={handleAddExpense}
            >
              {expenses.length === 0 ? "Add First Expense" : "Add New Expense"}
            </button>
            {expenses.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p className="font-medium">Track expenses by:</p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="text-left">
                    <p>• Materials & supplies</p>
                    <p>• Labor & contractors</p>
                  </div>
                  <div className="text-left">
                    <p>• Project categorization</p>
                    <p>• Room-specific tracking</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Expense Transactions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detailed breakdown of all project expenses
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
                    Date & Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/5">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {expense.project_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {expense.date} • {expense.room_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-sm">
                        <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {expense.notes ||
                            `${expense.category} expense in ${expense.room_name}`}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {expense.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}
                        >
                          {expense.category === "material"
                            ? "🔧 Material"
                            : "👷 Labor"}
                        </span>
                        {expense.category === "labor" &&
                          expense.labor_hours && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {expense.labor_hours}h
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ${expense.cost.toLocaleString()}
                        </div>
                        {expense.category === "labor" &&
                          expense.labor_hours && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ${(expense.cost / expense.labor_hours).toFixed(0)}
                              /hr
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-medium transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 font-medium transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadExpenses}
        projects={projects}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        expense={selectedExpense}
        projects={projects}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete this ${selectedExpense?.category} expense of $${selectedExpense?.cost.toLocaleString()}?`}
        itemName={
          selectedExpense?.notes || `${selectedExpense?.category} expense`
        }
        dangerText="This will permanently remove the expense from your project records."
      />
    </div>
  );
}
