// Debug.tsx - Debug page for troubleshooting CLI integration issues

import { useState } from 'react'
import { toast } from 'sonner'
import { TauriService } from '../services/tauri'

export default function Debug() {
  const [output, setOutput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<string>) => {
    try {
      setIsLoading(true)
      setOutput(prev => prev + `\n\n=== ${testName} ===\n`)
      
      const result = await testFn()
      setOutput(prev => prev + result + '\n')
      
      toast.success(`${testName} completed`)
    } catch (error) {
      setOutput(prev => prev + `ERROR: ${error}\n`)
      toast.error(`${testName} failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const tests = [
    {
      name: "List All Projects",
      fn: () => TauriService.getProjects()
    },
    {
      name: "List Rooms for Project 1", 
      fn: () => TauriService.getRooms(1)
    },
    {
      name: "List Expenses for Project 1",
      fn: () => TauriService.getExpenses(1)
    },
    {
      name: "Test Add Expense (Debug)",
      fn: () => TauriService.testExpenseAdd()
    },
    {
      name: "Get All Rooms List",
      fn: () => TauriService.getAllRoomsList()
    },
    {
      name: "Python Installation Check",
      fn: () => TauriService.checkPythonInstallation().then(info => JSON.stringify(info, null, 2))
    },
    {
      name: "Python Debug Paths",
      fn: async () => {
        const result = await (window as any).__TAURI__.tauri.invoke('debug_python_paths')
        return JSON.stringify(result, null, 2)
      }
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Debug Console</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Test CLI integration and troubleshoot issues
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {tests.map((test, index) => (
          <button
            key={index}
            onClick={() => runTest(test.name, test.fn)}
            disabled={isLoading}
            className="p-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {test.name}
          </button>
        ))}
      </div>

      {/* Manual Test Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3">Manual Expense Test</h3>
        <button
          onClick={() => runTest("Add Test Expense to Living Room", async () => {
            const testExpense = {
              projectId: 1,
              roomName: "Living Room",
              category: "material" as const,
              cost: 99.99,
              condition: 3,
              notes: "Debug test expense"
            }
            return await TauriService.addExpense(testExpense)
          })}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Test Add Expense to Living Room
        </button>
      </div>

      {/* Quick Room Setup */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-3">Quick Room Setup for Project 1</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Add common rooms to project 1 for testing expenses:
        </p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {['Basement', 'Attic', 'Garage', 'Laundry Room', 'Office'].map(roomName => (
            <button
              key={roomName}
              onClick={() => runTest(`Add ${roomName} Room`, async () => {
                return await TauriService.addRoom({
                  projectId: 1,
                  name: roomName,
                  floor: roomName === 'Basement' ? 0 : roomName === 'Attic' ? 2 : 1,
                  condition: 3,
                  notes: `Auto-created ${roomName.toLowerCase()} for testing`
                })
              })}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              + {roomName}
            </button>
          ))}
        </div>
      </div>

      {/* Clear and Copy Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setOutput('')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Clear Output
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(output)
            toast.success('Output copied to clipboard')
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Copy Output
        </button>
      </div>

      {/* Output Console */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        <div className="whitespace-pre-wrap">
          {output || "Ready for testing... Click a button above to start debugging."}
          {isLoading && (
            <div className="inline-block animate-pulse">
              <span className="text-yellow-400"> ⚡ Running test...</span>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Debug Instructions</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Test "List All Projects" first to verify Python CLI is working</li>
          <li>• Check "List Rooms for Project 1" to see available rooms</li>
          <li>• Use "Test Add Expense" to debug the expense addition issue</li>
          <li>• Copy output and share with developer if issues persist</li>
          <li>• Check browser console (F12) for additional error details</li>
        </ul>
      </div>
    </div>
  )
} 