// Settings.tsx - Application settings and preferences

export default function Settings() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your Real Estate Tracker experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Application Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Application</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-save</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes as you type
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Database</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Database Location</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Database file path"
                  readOnly
                  value="Loading..."
                />
                <button className="btn-outline px-4 py-2">
                  Browse
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current database file location
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-outline px-4 py-2">
                Backup Database
              </button>
              <button className="btn-outline px-4 py-2">
                Restore Database
              </button>
              <button className="btn-outline px-4 py-2 text-red-600 border-red-300 hover:bg-red-50">
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Export</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Default Export Location</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Export folder path"
                  readOnly
                  value="Loading..."
                />
                <button className="btn-outline px-4 py-2">
                  Browse
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Include room details in exports</h3>
                <p className="text-sm text-muted-foreground">
                  Add room information to CSV exports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>0.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build:</span>
              <span>Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span>Tauri + React</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button className="btn-primary px-6 py-2">
            Save Settings
          </button>
          <button className="btn-outline px-6 py-2">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
} 