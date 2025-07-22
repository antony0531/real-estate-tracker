// Dashboard.tsx - Main dashboard page for Real Estate Tracker

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to Real Estate Tracker - Manage your renovation projects
        </p>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-brand-600">0</p>
          <p className="text-sm text-muted-foreground">No projects yet</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
          <p className="text-3xl font-bold text-green-600">$0</p>
          <p className="text-sm text-muted-foreground">Across all projects</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-orange-600">$0</p>
          <p className="text-sm text-muted-foreground">No expenses yet</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="btn-primary px-4 py-2">
            Create New Project
          </button>
          <button className="btn-outline px-4 py-2">
            Add Expense
          </button>
          <button className="btn-outline px-4 py-2">
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>No projects found</p>
          <p className="text-sm mt-2">Create your first project to get started</p>
        </div>
      </div>
    </div>
  )
} 