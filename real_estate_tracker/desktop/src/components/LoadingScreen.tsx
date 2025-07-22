// LoadingScreen.tsx - Professional loading screen for app initialization

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = 'Loading Real Estate Tracker...' }: LoadingScreenProps) {
  return (
    <div className="full-screen center flex-col bg-background">
      {/* App Logo/Icon Area */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-brand-500 rounded-lg center mb-4 animate-pulse">
          {/* TODO: Replace with actual app icon */}
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground">
          Real Estate Tracker
        </h1>
      </div>

      {/* Loading Animation */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Loading Message */}
      <p className="text-muted-foreground text-center max-w-sm">
        {message}
      </p>

      {/* Progress Bar (Indeterminate) */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-brand-500 rounded-full animate-pulse"></div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-8 text-center text-xs text-muted-foreground">
        <p>Version 0.2.0</p>
        <p>Initializing database and services...</p>
      </div>
    </div>
  )
} 