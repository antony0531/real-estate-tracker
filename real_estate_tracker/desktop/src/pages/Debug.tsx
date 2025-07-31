// Debug.tsx - Focused debug page for EXPENSE MODULE testing only

import { useState } from "react";
import { toast } from "sonner";
import { TauriService } from "../services/tauri";

export default function Debug() {
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Expense testing form
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [roomName, setRoomName] = useState<string>("");
  const [expenseCost, setExpenseCost] = useState<number | undefined>(undefined);

  // Project management form
  const [projectName, setProjectName] = useState<string>("");
  const [projectBudget, setProjectBudget] = useState<number | undefined>(
    undefined,
  );
  const [projectType, setProjectType] = useState<string>("single_family");
  const [projectStatus, setProjectStatus] = useState<string>("sf_class_a");

  const runTest = async (testName: string, testFn: () => Promise<string>) => {
    try {
      setIsLoading(true);
      setOutput((prev) => prev + `\n\n=== ${testName} ===\n`);

      const result = await testFn();
      setOutput((prev) => prev + result + "\n");

      toast.success(`${testName} completed`);
    } catch (error) {
      setOutput((prev) => prev + `ERROR: ${error}\n`);
      toast.error(`${testName} failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          🔧 PROJECT & EXPENSE TESTING
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Complete testing for project management and expense tracking
        </p>
      </div>

      {/* PROJECT MANAGEMENT SECTION */}
      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-xl font-semibold mb-4 text-indigo-900 dark:text-indigo-100">
          🏗️ PROJECT MANAGEMENT MODULE
        </h2>

        {/* STEP A: Project Creation */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">
            📋 STEP A: Project Creation & Management
          </h3>

          {/* Project Form */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Project ID:
              </label>
              <input
                type="number"
                value={projectId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectId(val === "" ? undefined : Number(val));
                }}
                placeholder="For Update/Delete"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Project Name:
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Main Street Renovation"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Budget ($):
              </label>
              <input
                type="number"
                value={projectBudget || ""}
                onChange={(e) =>
                  setProjectBudget(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="e.g., 200000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                min="1000"
              />
            </div>
          </div>

          {/* Second Row: Property Type and Class */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Property Type (Create only):
              </label>
              <select
                value={projectType}
                onChange={(e) => {
                  setProjectType(e.target.value);
                  // Auto-update property class when type changes
                  if (e.target.value === "single_family") {
                    setProjectStatus("sf_class_c"); // Default to mid-range
                  } else if (e.target.value === "multifamily") {
                    setProjectStatus("mf_class_b"); // Default to standard
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              >
                <option value="single_family">Single Family</option>
                <option value="multifamily">Multifamily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Property Class (Create only):
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              >
                {projectType === "single_family" ? (
                  <>
                    <option value="sf_class_a">
                      SF Class A - Ultra-Luxury ($2.5-4M)
                    </option>
                    <option value="sf_class_b">
                      SF Class B - Luxury ($1-2M)
                    </option>
                    <option value="sf_class_c">
                      SF Class C - Mid-Range ($700K-999K)
                    </option>
                    <option value="sf_class_d">
                      SF Class D - Budget (&lt;$550K)
                    </option>
                  </>
                ) : (
                  <>
                    <option value="mf_class_a">
                      MF Class A - Premium ($1-1.5M)
                    </option>
                    <option value="mf_class_b">
                      MF Class B - Standard ($750K-900K)
                    </option>
                    <option value="mf_class_c">
                      MF Class C - Value ($500K-749K)
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Project Management Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() =>
                runTest(`Create "${projectName}" Project`, async () => {
                  if (!projectName || !projectBudget) {
                    throw new Error("Project name and budget are required");
                  }
                  return await TauriService.createProject({
                    name: projectName,
                    budget: projectBudget,
                    property_type: projectType,
                    property_class: projectStatus,
                    description: `Created via debug interface - ${new Date().toLocaleDateString()}`,
                  });
                })
              }
              disabled={isLoading || !projectName || !projectBudget}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🏗️ Create Project
            </button>
            <button
              onClick={() =>
                runTest("List All Projects", () => TauriService.getProjects())
              }
              disabled={isLoading}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              📊 List Projects
            </button>
            <button
              onClick={() =>
                runTest(`Update Project ${projectId}`, async () => {
                  if (!projectId) {
                    throw new Error("Project ID is required for update");
                  }
                  if (!projectName && !projectBudget) {
                    throw new Error(
                      "Project name or budget is required for update",
                    );
                  }
                  // Only send name and budget - property type/class cannot be updated
                  const updateData: any = {
                    description: `Updated via debug interface - ${new Date().toLocaleDateString()}`,
                  };
                  if (projectName) updateData.name = projectName;
                  if (projectBudget) updateData.budget = projectBudget;

                  return await TauriService.updateProject(
                    projectId,
                    updateData,
                  );
                })
              }
              disabled={isLoading || !projectId}
              className="p-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              title="Note: Only name and budget can be updated"
            >
              🔄 Update Project
            </button>
            <button
              onClick={() =>
                runTest(`Delete Project ${projectId}`, async () => {
                  if (!projectId) {
                    throw new Error("Project ID is required for delete");
                  }
                  if (
                    !confirm(
                      `Are you sure you want to delete project ${projectId}? This cannot be undone.`,
                    )
                  ) {
                    throw new Error("Delete cancelled by user");
                  }
                  return await TauriService.deleteProject(projectId);
                })
              }
              disabled={isLoading || !projectId}
              className="p-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              🗑️ Delete Project
            </button>
          </div>

          {/* Update Notes */}
          <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border-l-4 border-yellow-500">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              📝 <strong>Update Note:</strong> Property Type and Property Class
              can only be set during creation. Updates only modify Name, Budget,
              and Description.
            </p>
          </div>
        </div>
      </div>

      {/* EXISTING EXPENSE SECTION - Updated title */}
      <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-xl font-semibold mb-4 text-yellow-900 dark:text-yellow-100">
          💰 EXPENSE MANAGEMENT MODULE
        </h2>

        {/* STEP 1: Basic Tests */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">
            📋 STEP 1: Basic Connection Tests
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                runTest("Check Projects", () => TauriService.getProjects())
              }
              disabled={isLoading}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              📊 List Projects
            </button>
            <button
              onClick={() =>
                runTest("Check Rooms in Project 1", () =>
                  TauriService.getRooms(1),
                )
              }
              disabled={isLoading}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🏠 List Rooms
            </button>
          </div>
        </div>
      </div>

      {/* NEW REPORTS & ANALYTICS SECTION */}
      <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h2 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
          📊 REPORTS & ANALYTICS MODULE
        </h2>

        {/* STEP A: Data Collection Tests */}
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">
            📋 STEP A: Advanced Data Collection
          </h3>

          {/* Data Collection Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() =>
                runTest("All Projects Analysis", async () => {
                  const projects = await TauriService.getProjects();
                  const lines = projects
                    .split("\n")
                    .filter(
                      (line) => line.startsWith("│") && line.includes("$"),
                    );
                  return `Found ${lines.length} projects for analysis:\n${projects}`;
                })
              }
              disabled={isLoading}
              className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              📊 Analyze All Projects
            </button>
            <button
              onClick={() =>
                runTest("Budget vs Spent Analysis", async () => {
                  const projects = await TauriService.getProjects();
                  const allExpenses = await TauriService.getAllExpenses();
                  return `Projects Data:\n${projects}\n\n--- EXPENSES ---\n${allExpenses}`;
                })
              }
              disabled={isLoading}
              className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              💰 Budget vs Spent
            </button>
            <button
              onClick={() =>
                runTest("ROI Calculation Test", async () => {
                  // Get project 1 details for ROI calculation example
                  const project = await TauriService.getProject(1);
                  const expenses = await TauriService.getExpenses(1);
                  const budget = await TauriService.getBudgetStatus(1);
                  return `Project Details:\n${project}\n\n--- EXPENSES ---\n${expenses}\n\n--- BUDGET ---\n${budget}`;
                })
              }
              disabled={isLoading}
              className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              📈 ROI Analysis
            </button>
          </div>
        </div>

        {/* STEP B: Advanced Analytics */}
        <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">📈 STEP B: Advanced Analytics</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() =>
                runTest("Trend Analysis", async () => {
                  // Analyze spending trends across projects
                  const projects = await TauriService.getProjects();
                  const expenses = await TauriService.getAllExpenses();
                  return `TREND ANALYSIS:\n\nProjects:\n${projects}\n\nExpenses Across All Projects:\n${expenses}`;
                })
              }
              disabled={isLoading}
              className="p-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
            >
              📈 Spending Trends
            </button>
            <button
              onClick={() =>
                runTest("Cost Variance Report", async () => {
                  // Calculate variance between budgeted and actual costs
                  let report = "COST VARIANCE ANALYSIS:\n\n";
                  for (let i = 1; i <= 5; i++) {
                    try {
                      const budget = await TauriService.getBudgetStatus(i);
                      report += `Project ${i}:\n${budget}\n\n`;
                    } catch (e) {
                      report += `Project ${i}: Not found\n\n`;
                    }
                  }
                  return report;
                })
              }
              disabled={isLoading}
              className="p-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
            >
              📊 Cost Variance
            </button>
          </div>
        </div>

        {/* STEP C: Export & Reporting */}
        <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">
            📄 STEP C: Export & Reporting Features
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() =>
                runTest("Generate Summary Report", async () => {
                  const projects = await TauriService.getProjects();
                  const allExpenses = await TauriService.getAllExpenses();

                  // Parse project count and total budget
                  const projectLines = projects
                    .split("\n")
                    .filter(
                      (line) => line.startsWith("│") && line.includes("$"),
                    );
                  const totalProjects = projectLines.length;

                  let totalBudget = 0;
                  projectLines.forEach((line) => {
                    const budgetMatch = line.match(/\$([0-9,]+)/);
                    if (budgetMatch) {
                      totalBudget += parseInt(budgetMatch[1].replace(/,/g, ""));
                    }
                  });

                  return `EXECUTIVE SUMMARY REPORT
Generated: ${new Date().toLocaleDateString()}

📊 PORTFOLIO OVERVIEW:
• Total Projects: ${totalProjects}
• Total Budget: $${totalBudget.toLocaleString()}
• Active Status: All systems operational

📈 DETAILED DATA:
${projects}

💰 EXPENSE SUMMARY:
${allExpenses}`;
                })
              }
              disabled={isLoading}
              className="p-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              📋 Executive Summary
            </button>
            <button
              onClick={() =>
                runTest("Project Performance Metrics", async () => {
                  let report = "PROJECT PERFORMANCE DASHBOARD:\n\n";

                  // Test performance metrics for first 3 projects
                  for (let i = 1; i <= 3; i++) {
                    try {
                      const project = await TauriService.getProject(i);
                      const rooms = await TauriService.getRooms(i);
                      const budget = await TauriService.getBudgetStatus(i);

                      report += `═══ PROJECT ${i} PERFORMANCE ═══\n`;
                      report += `${project}\n`;
                      report += `ROOMS:\n${rooms}\n`;
                      report += `BUDGET STATUS:\n${budget}\n\n`;
                    } catch (e) {
                      report += `Project ${i}: No data available\n\n`;
                    }
                  }

                  return report;
                })
              }
              disabled={isLoading}
              className="p-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              🎯 Performance Metrics
            </button>
            <button
              onClick={() =>
                runTest("Risk Assessment Report", async () => {
                  const projects = await TauriService.getProjects();
                  let riskReport = "PORTFOLIO RISK ASSESSMENT:\n\n";

                  // Analyze budget risks
                  const projectLines = projects
                    .split("\n")
                    .filter(
                      (line) => line.startsWith("│") && line.includes("$"),
                    );

                  riskReport += `📊 RISK FACTORS IDENTIFIED:\n`;
                  riskReport += `• Projects Analyzed: ${projectLines.length}\n`;
                  riskReport += `• High-Value Projects: ${projectLines.filter((line) => line.includes("5,000,000")).length}\n`;
                  riskReport += `• Planning Stage: ${projectLines.filter((line) => line.includes("Planning")).length}\n`;
                  riskReport += `• In Progress: ${projectLines.filter((line) => line.includes("Progress")).length}\n\n`;

                  riskReport += `DETAILED PROJECT DATA:\n${projects}`;

                  return riskReport;
                })
              }
              disabled={isLoading}
              className="p-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              ⚠️ Risk Assessment
            </button>
          </div>
        </div>

        {/* Success Criteria */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ SUCCESS CRITERIA FOR REPORTS & ANALYTICS
          </h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• ✅ Advanced data collection and analysis</li>
            <li>• ✅ Trend analysis and cost variance reporting</li>
            <li>• ✅ Executive summary generation</li>
            <li>• ✅ Performance metrics and risk assessment</li>
            <li>• ✅ Export functionality and formatted reports</li>
          </ul>
        </div>
      </div>

      {/* STEP 3: Expense Testing */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold mb-3">💰 STEP 3: Test Expense Addition</h3>

        {/* Interactive Form */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Project ID:
            </label>
            <input
              type="number"
              value={projectId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setProjectId(val === "" ? undefined : Number(val));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
              min="1"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Room Name:
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Basement, Kitchen, Attic"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Cost ($):
            </label>
            <input
              type="number"
              value={expenseCost || ""}
              onChange={(e) => setExpenseCost(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              runTest(
                `Add $${expenseCost || 100} expense to ${roomName || "Living Room"}`,
                async () => {
                  const testExpense = {
                    projectId: projectId || 1,
                    roomName: roomName || "Living Room",
                    category: "material" as const,
                    cost: expenseCost || 100,
                    condition: 3,
                    notes: "Debug test expense",
                  };
                  return await TauriService.addExpense(testExpense);
                },
              )
            }
            disabled={isLoading || !roomName || !expenseCost}
            className="p-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            💰 Add Material Expense
          </button>
          <button
            onClick={() =>
              runTest("Test Over-Budget Expense", async () => {
                const testExpense = {
                  projectId: projectId || 1,
                  roomName: roomName || "Living Room",
                  category: "material" as const,
                  cost: 999999, // Way over budget
                  condition: 3,
                  notes: "Over-budget test",
                };
                return await TauriService.addExpense(testExpense);
              })
            }
            disabled={isLoading}
            className="p-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            ⚠️ Test Over-Budget
          </button>
        </div>
      </div>

      {/* STEP 4: Results */}
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h3 className="font-semibold mb-3">📈 STEP 4: View Results</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              runTest("List All Expenses", () =>
                TauriService.getExpenses(projectId || 1),
              )
            }
            disabled={isLoading}
            className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            📋 List Expenses
          </button>
          <button
            onClick={() =>
              runTest("Check Project Budget", () =>
                TauriService.getBudgetStatus(projectId || 1),
              )
            }
            disabled={isLoading}
            className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            💰 Check Budget
          </button>
        </div>
      </div>

      {/* Clear and Copy Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setOutput("")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          🗑️ Clear Output
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(output);
            toast.success("Output copied to clipboard");
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          📋 Copy Output
        </button>
      </div>

      {/* Output Console */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto border">
        <div className="flex justify-between items-center mb-2 border-b border-gray-600 pb-2">
          <span className="text-cyan-400 font-bold">
            🔧 EXPENSE MODULE DEBUG CONSOLE
          </span>
          <span className="text-xs text-gray-400">
            Follow steps 1→2→3→4 above
          </span>
        </div>
        <div className="whitespace-pre-wrap">
          {output ||
            "🚀 READY FOR EXPENSE MODULE TESTING\n\n📋 Follow the steps above:\n1. Test basic connections\n2. Add missing rooms (Basement, Attic, etc.)\n3. Test expense addition with different scenarios\n4. View results and check budget\n\n💡 TIP: Fill in the yellow form first, then click test buttons!"}
          {isLoading && (
            <div className="inline-block animate-pulse">
              <span className="text-yellow-400"> ⚡ Running test...</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Criteria */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          ✅ SUCCESS CRITERIA FOR EXPENSE MODULE
        </h3>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>• ✅ Can list existing projects and rooms</li>
          <li>• ✅ Can add new rooms (Basement, Attic, etc.)</li>
          <li>• ✅ Can add expenses to existing rooms</li>
          <li>• ✅ Over-budget expenses show warnings but still work</li>
          <li>• ✅ Budget calculations update correctly</li>
        </ul>
      </div>
    </div>
  );
}
