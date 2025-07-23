// Dashboard.tsx - Main dashboard page with overview and quick actions

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { invoke } from '@tauri-apps/api/tauri'

import { TauriService, type AppInfo, type PythonInfo } from '../services/tauri'
import ProjectModal from '../components/ProjectModal'
import ExpenseModal from '../components/ExpenseModal'

interface DashboardStats {
  projectCount: number
  totalBudget: number
  totalSpent: number
  isLoading: boolean
}

interface DebugInfo {
  current_dir: string
  backend_dir: string
  backend_dir_exists: boolean
  venv_python_path: string
  venv_python_exists: boolean
  found_python_path?: string
}

export default function Dashboard() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null) 
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected')
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    isLoading: false
  })
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [projects, setProjects] = useState<Array<{id: number, name: string}>>([])
  const navigate = useNavigate()

  // Debug states
  const [debugOutput, setDebugOutput] = useState<string>('')
  const [testOutput, setTestOutput] = useState<string>('')

  // Test connection and load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setConnectionStatus('testing')
      setStats(prev => ({ ...prev, isLoading: true }))

      // Test connection first
      console.log('Testing Tauri IPC connection...')
      
      // Get app info
      const appData = await TauriService.getAppInfo()
      setAppInfo(appData)
      console.log('App info loaded:', appData)

      // Check Python installation  
      const pythonData = await TauriService.checkPythonInstallation()
      setPythonInfo(pythonData)
      console.log('Python info loaded:', pythonData)

      // Initialize database if needed
      try {
        await TauriService.initializeDatabase()
        console.log('Database initialized')
      } catch (dbError) {
        console.warn('Database already initialized or error:', dbError)
        // Don't treat as fatal error
      }

      // Get projects data with detailed logging
      console.log('[LOADING] Fetching projects data...')
      const projectsOutput = await TauriService.getProjects()
      console.log('[DATA] Raw projects output:', projectsOutput)
      console.log('[DATA] Projects output length:', projectsOutput.length)
      console.log('[DATA] First few lines:', projectsOutput.split('\n').slice(0, 5))
      
      // Parse project count and budget from CLI output  
      const { count: projectCount, totalBudget } = parseProjectData(projectsOutput)
      console.log('[SUCCESS] Parsed project data:', { projectCount, totalBudget })

      // Parse and set projects list for expense modal
      const projectsList = parseProjectsList(projectsOutput)
      setProjects(projectsList)
      console.log('[LIST] Projects list for modal:', projectsList)

      // Calculate total spent across all projects
      console.log('[LOADING] Calculating total spent across all projects...')
      let totalSpent = 0
      try {
        const allExpensesOutput = await TauriService.getAllExpenses()
        totalSpent = calculateTotalExpensesFromOutput(allExpensesOutput)
        console.log('[EXPENSE] Total spent calculated:', totalSpent)
      } catch (expenseError) {
        console.warn('Could not calculate total expenses:', expenseError)
        totalSpent = 0 // Fallback to 0 if expense calculation fails
      }

      setStats({
        projectCount,
        totalBudget,
        totalSpent,
        isLoading: false
      })

      setConnectionStatus('connected')
      toast.success(`Connected! Found ${projectCount} projects with $${totalBudget.toLocaleString()} total budget`)

    } catch (error) {
      console.error('Dashboard data loading failed:', error)
      setConnectionStatus('error')
      setStats(prev => ({ ...prev, isLoading: false }))
      toast.error(`Connection failed: ${TauriService.handleError(error)}`)
    }
  }

  const handleDebugPaths = async () => {
    try {
      console.log('Running Python paths debug...')
      const debug = await invoke<DebugInfo>('debug_python_paths')
      setDebugOutput(JSON.stringify(debug, null, 2))
      console.log('Debug info:', debug)
      toast.success('Debug info loaded - check console')
    } catch (error) {
      console.error('Debug failed:', error)
      toast.error(`Debug failed: ${TauriService.handleError(error)}`)
    }
  }

  const handleTestExecution = async () => {
    try {
      console.log('Testing Python execution...')
      const result = await invoke<string>('test_python_execution')
      setTestOutput(result)
      console.log('Python execution test result:', result)
      toast.success('Python test completed - check console')
      alert(`Python Test Results:\n\n${result}`)
    } catch (error) {
      console.error('Python test failed:', error)
      toast.error(`Python test failed: ${TauriService.handleError(error)}`)
    }
  }

  const parseProjectData = (output: string): { count: number; totalBudget: number } => {
    // Parse CLI table output to extract project data
    console.log('[PARSE] RAW OUTPUT LENGTH:', output.length)
    console.log('[PARSE] RAW OUTPUT (first 500 chars):', JSON.stringify(output.substring(0, 500)))
    
    const lines = output.trim().split('\n')
    let projectCount = 0
    let totalBudget = 0
    
    console.log('[TABLE] Total lines to process:', lines.length)
    console.log('[TABLE] First 10 lines for inspection:')
    lines.slice(0, 10).forEach((line, idx) => {
      console.log(`  Line ${idx}: ${JSON.stringify(line)}`)
    })
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip obvious header/separator lines
      const isHeaderLine = line.includes('━') || 
          line.includes('Real Estate Projects') || 
          line.includes('┏') || 
          line.includes('┗') || 
          line.includes('┃ ID') ||
          line.includes('┡') ||
          line.includes('└') ||
          !line.trim()
          
      if (isHeaderLine) {
        console.log(`[SKIP] Skipping header line ${i}: ${JSON.stringify(line.substring(0, 50))}`)
        continue
      }
      
      // Look for data lines - they should start with │ and have project data
      const startsWithPipe = line.startsWith('│')
      const containsDollar = line.includes('$')
      
      console.log(`[ANALYZE] Line ${i} analysis: starts with pipe? ${startsWithPipe}, contains $? ${containsDollar}`)
      console.log(`    Content: ${JSON.stringify(line.substring(0, 100))}`)
      
      if (startsWithPipe && containsDollar) {
        console.log(`[PROCESS] Processing project line ${i}: "${line}"`)
        
        // Split the line by │ and clean up columns
        const rawColumns = line.split('│')
        const columns = rawColumns.map(col => col.trim()).filter(col => col)
        console.log(`[COLUMNS] Raw columns (${rawColumns.length}):`, rawColumns)
        console.log(`[COLUMNS] Cleaned columns (${columns.length}):`, columns)
        
        // Column structure: [ID, Name, Status, Budget, Type, Created]
        if (columns.length >= 4) {
          const budgetColumn = columns[3] // 4th column (0-indexed)
          console.log(`[BUDGET] Budget column [3]: "${budgetColumn}"`)
          
          // Extract budget value from the budget column
          const budgetMatch = budgetColumn.match(/\$([0-9,]+)/);
          console.log(`[BUDGET] Budget match result:`, budgetMatch)
          
          if (budgetMatch) {
            const budgetString = budgetMatch[1].replace(/,/g, '')
            const budgetValue = parseInt(budgetString, 10)
            console.log(`[BUDGET] Parsing "${budgetString}" -> ${budgetValue}`)
            
            if (!isNaN(budgetValue)) {
              projectCount++
              totalBudget += budgetValue
              console.log(`[SUCCESS] Project #${projectCount}: Budget $${budgetValue.toLocaleString()}, Running total: $${totalBudget.toLocaleString()}`)
            } else {
              console.log(`[ERROR] Could not parse budget value: "${budgetString}" -> NaN`)
            }
          } else {
            console.log(`[ERROR] No budget match found in column: "${budgetColumn}"`)
          }
        } else {
          console.log(`[ERROR] Not enough columns (${columns.length}), expected at least 4`)
        }
      } else {
        if (line.trim()) {
          console.log(`[SKIP] Skipping non-data line ${i}: starts with pipe? ${startsWithPipe}, contains $? ${containsDollar}`)
        }
      }
    }
    
    const result = { count: projectCount, totalBudget }
    console.log('[RESULT] FINAL PARSED RESULT:', result)
    console.log(`[SUMMARY] ${projectCount} projects, $${totalBudget.toLocaleString()} total budget`)
    return result
  }

  const parseProjectsList = (output: string): Array<{id: number, name: string}> => {
    const lines = output.trim().split('\n')
    const projects: Array<{id: number, name: string}> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip obvious header/separator lines
      const isHeaderLine = line.includes('━') || 
          line.includes('Real Estate Projects') || 
          line.includes('┏') || 
          line.includes('┗') || 
          line.includes('┃ ID') ||
          line.includes('┡') ||
          line.includes('└') ||
          !line.trim()
          
      if (isHeaderLine) {
        console.log(`⏭️  Skipping header line ${i}: ${JSON.stringify(line.substring(0, 50))}`)
        continue
      }

      // Look for data lines - they should start with │ and have project data
      const startsWithPipe = line.startsWith('│')
      const containsDollar = line.includes('$')

      if (startsWithPipe && containsDollar) {
        const rawColumns = line.split('│')
        const columns = rawColumns.map(col => col.trim()).filter(col => col)

        if (columns.length >= 4) {
          const idColumn = columns[0] // 1st column (0-indexed)
          const nameColumn = columns[1] // 2nd column (0-indexed)

          if (idColumn && nameColumn) {
            const id = parseInt(idColumn.trim(), 10)
            if (!isNaN(id)) {
              projects.push({ id, name: nameColumn.trim() })
              console.log(`[SUCCESS] Parsed project: ID=${id}, Name="${nameColumn}"`)
            } else {
              console.log(`[WARN] Could not parse ID from column: "${idColumn}"`)
            }
          } else {
            console.log(`[WARN] Could not parse ID or Name from line: ${JSON.stringify(line)}`)
          }
        } else {
          console.log(`[WARN] Not enough columns for project parsing: ${columns.length}`)
        }
      } else {
        if (line.trim()) {
          console.log(`⏭️  Skipping non-data line ${i}: starts with pipe? ${startsWithPipe}, contains $? ${containsDollar}`)
        }
      }
    }
    return projects
  }



  const calculateTotalExpensesFromOutput = (output: string): number => {
    // Parse all expenses from the combined output of all projects
    console.log('[EXPENSE] Parsing total expenses from output length:', output.length)
    
    let totalExpenses = 0
    const projects = output.split('\n---PROJECT_SEPARATOR---\n')
    
    console.log('[EXPENSE] Processing expenses from', projects.length, 'projects')
    
    for (let i = 0; i < projects.length; i++) {
      const projectOutput = projects[i].trim()
      if (!projectOutput) continue
      
      console.log(`[EXPENSE] Processing project ${i + 1} expenses:`)
      
      const lines = projectOutput.split('\n')
      
      for (const line of lines) {
        // Look for expense table rows
        if (line.startsWith('│') && line.includes('$')) {
          const columns = line.split('│').map(col => col.trim()).filter(col => col)
          
          // Find the cost column (should be in format $XX,XXX.XX)
          for (const column of columns) {
            const costMatch = column.match(/\$([0-9,]+\.[0-9]+)/)
            if (costMatch) {
              const costValue = parseFloat(costMatch[1].replace(/,/g, ''))
              if (!isNaN(costValue)) {
                totalExpenses += costValue
                console.log(`[EXPENSE] Found expense: $${costValue}, Running total: $${totalExpenses}`)
                break // Only count one cost per line
              }
            }
          }
        }
        
        // Also look for "Total Cost:" lines at the end of each project
        if (line.includes('Total Cost:')) {
          const totalMatch = line.match(/Total Cost:\s*\$([0-9,]+\.[0-9]+)/)
          if (totalMatch) {
            const totalValue = parseFloat(totalMatch[1].replace(/,/g, ''))
            if (!isNaN(totalValue)) {
              console.log(`[EXPENSE] Found project total: $${totalValue}`)
              // Note: We don't add this to totalExpenses as we've already counted individual expenses
              // This is just for logging/verification
            }
          }
        }
      }
    }
    
    console.log('[EXPENSE] Final total expenses calculated:', totalExpenses)
    return totalExpenses
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'  
      case 'testing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'error': return 'Connection Failed'
      case 'testing': return 'Connecting...'
      default: return 'Unknown'
    }
  }

  const handleCreateProject = async () => {
    setIsProjectModalOpen(true)
  }

  return (
    <div className="p-6">
      {/* Header with Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Welcome to Real Estate Tracker - Manage your renovation projects
            </p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </div>
            {appInfo && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {appInfo.name} v{appInfo.version}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      {pythonInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">System Status</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>Python: {pythonInfo.version}</div>
            <div>Backend: {pythonInfo.has_backend ? '[OK] Available' : '[ERROR] Not Found'}</div>
            <div>Executable: {pythonInfo.executable}</div>
          </div>
        </div>
      )}

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-brand-600">{stats.projectCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.projectCount === 0 ? 'No projects yet' : 'Projects in progress'}
              </p>
            </>
          )}
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalBudget.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Across all projects</p>
            </>
          )}
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
          {stats.isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-orange-600">
                ${stats.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total expenses</p>
            </>
          )}
                  </div>
        </div>

        {/* Debug commands for troubleshooting */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Debug & Troubleshooting</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleDebugPaths}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Debug Python Paths
              </button>
              <button 
                onClick={handleTestExecution}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test Python Execution
              </button>
            </div>
            
            {/* Debug Output */}
            {debugOutput && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                <h4 className="font-medium text-sm mb-2">Debug Output:</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">{debugOutput}</pre>
              </div>
            )}
            
            {/* Test Output */}
            {testOutput && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                <h4 className="font-medium text-sm mb-2">Test Output:</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">{testOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={handleCreateProject}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="font-medium">Create Demo Project</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Add a sample house flip project</div>
              </div>
            </button>
            
            <button 
              onClick={loadDashboardData}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="font-medium">Refresh Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Reload dashboard information</div>
              </div>
            </button>

            <button 
              onClick={() => {
                if (stats.projectCount === 0) {
                  toast.error('Please create a project first before adding expenses')
                  return
                }
                setIsExpenseModalOpen(true)
              }}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="font-medium">Add Expense</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Add a new expense to a project</div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/reports')}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <div className="text-center">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">View detailed project reports</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity / Projects */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="card p-6">
            {stats.isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : stats.projectCount === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first house flipping project to get started!
                </p>
                <button 
                  onClick={handleCreateProject}
                  className="btn-primary"
                >
                  Create Demo Project
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  You have {stats.projectCount} active project{stats.projectCount !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Project details will be displayed here once the UI is fully integrated.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Development/Debug Information */}
        {connectionStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Connection Error</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Failed to connect to the backend. This could be due to:
            </p>
            <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1 mb-3">
              <li>Python not installed or not in PATH</li>
              <li>Backend dependencies missing</li>
              <li>Database initialization failed</li>
              <li>File permissions issues</li>
            </ul>
            <div className="flex gap-2">
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700"
              >
                Retry Connection
              </button>
            </div>
            
            {/* Debug Output */}
            {debugOutput && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                <h4 className="font-medium text-sm mb-2">Debug Output:</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">{debugOutput}</pre>
              </div>
            )}
            
            {/* Test Output */}
            {testOutput && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                <h4 className="font-medium text-sm mb-2">Test Output:</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">{testOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* Integration Test Status */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              [TEST] Integration Test Status
            </h3>
            <div className="text-sm space-y-1">
              <div className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                [OK] React Frontend: Working
              </div>
              <div className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                {connectionStatus === 'connected' ? '[OK]' : '[ERROR]'} Tauri IPC: {getConnectionStatusText()}
              </div>
              <div className={pythonInfo?.has_backend ? 'text-green-600' : 'text-red-600'}>
                {pythonInfo?.has_backend ? '[OK]' : '[ERROR]'} Python CLI Backend: {pythonInfo?.has_backend ? 'Available' : 'Not Found'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                [DATA] Projects Loaded: {stats.projectCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This debug panel is only visible in development mode.
              </div>
            </div>
          </div>
        )}
        
        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={loadDashboardData}
          projects={projects}
        />

        {/* Project Creation Modal */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={loadDashboardData}
        />


      </div>
    )
  } 