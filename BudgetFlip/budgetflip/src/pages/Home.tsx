import { Plus, Clock, Star, Building, ArrowRight } from 'lucide-react';

export function Home() {
  // Mock data for favorites
  const favorites = [
    {
      id: '1',
      name: 'Jersey City Renovation',
      type: 'project',
      icon: '🏠',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Kitchen Expenses',
      type: 'board',
      icon: '🍴',
      color: 'bg-green-500'
    }
  ];

  // Mock data for recently visited
  const recentlyVisited = [
    {
      id: '1',
      name: 'Brooklyn Townhouse',
      workspace: 'NYC Projects',
      lastVisited: '2 hours ago',
      icon: '🏢',
      color: 'bg-purple-500'
    },
    {
      id: '2',
      name: 'Queens Duplex',
      workspace: 'NYC Projects',
      lastVisited: '1 day ago',
      icon: '🏘️',
      color: 'bg-orange-500'
    },
    {
      id: '3',
      name: 'Manhattan Studio',
      workspace: 'NYC Projects',
      lastVisited: '3 days ago',
      icon: '🌆',
      color: 'bg-pink-500'
    }
  ];

  // Mock data for workspaces
  const workspaces = [
    {
      id: '1',
      name: 'NYC Projects',
      members: 4,
      icon: '🗽',
      color: 'bg-indigo-500'
    },
    {
      id: '2',
      name: 'Personal Properties',
      members: 1,
      icon: '🏡',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 md:bg-background-secondary">
      <div className="max-w-md mx-auto bg-gray-100 md:bg-background-secondary px-4 py-6 md:hidden">
        {/* My favorites */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My favorites</h2>
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
                  {item.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
              </div>
            ))}
            
            {/* Add new favorite card */}
            <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[100px] border-dashed">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Add to favorites</span>
            </button>
          </div>
        </section>

        {/* Recently visited */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recently visited</h2>
            <button className="text-primary-500 text-sm font-medium">
              See all
            </button>
          </div>
          <div className="space-y-3">
            {recentlyVisited.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.workspace}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.lastVisited}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workspaces */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspaces</h2>
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${workspace.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                      {workspace.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{workspace.name}</h3>
                      <p className="text-xs text-gray-500">{workspace.members} member{workspace.members !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            {/* Add workspace button */}
            <button className="w-full bg-primary-500 text-white rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add workspace</span>
            </button>
          </div>
        </section>
      </div>

      {/* Desktop fallback - redirect to projects */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to BudgetFlip</h1>
            <p className="text-gray-600 mb-6">The mobile-first budget management tool for your renovation projects.</p>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              View Projects
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}