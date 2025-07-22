// ProjectView.tsx - Individual project details page

import { useParams } from 'react-router-dom'

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="p-6">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Project #{projectId}
            </h1>
            <p className="text-muted-foreground mt-2">
              Project details and management
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline px-4 py-2">
              Edit Project
            </button>
            <button className="btn-primary px-4 py-2">
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Project Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="status-success">Planning</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property Type:</span>
              <span>Loading...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Square Footage:</span>
              <span>Loading...</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Budget:</span>
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Spent:</span>
              <span className="text-orange-600 font-semibold">Loading...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="text-green-600 font-semibold">Loading...</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Progress</h3>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Budget utilization
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="text-sm text-muted-foreground">0% used</div>
          </div>
        </div>
      </div>

      {/* Rooms and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Rooms</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>No rooms added yet</p>
            <button className="btn-outline px-4 py-2 mt-3">
              Add First Room
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded yet</p>
            <button className="btn-outline px-4 py-2 mt-3">
              Add First Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 