import { Settings, HelpCircle, Shield, Bell, User, LogOut, ChevronRight, Star, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function More() {
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/profile', color: 'text-blue-500' },
        { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-600' },
        { icon: Bell, label: 'Notification Settings', path: '/notification-settings', color: 'text-purple-500' }
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Download, label: 'Install App', path: '/install', color: 'text-green-500' },
        { icon: Star, label: 'Rate BudgetFlip', path: '/rate', color: 'text-yellow-500' },
        { icon: HelpCircle, label: 'Help & Support', path: '/help', color: 'text-orange-500' }
      ]
    },
    {
      title: 'Legal',
      items: [
        { icon: Shield, label: 'Privacy Policy', path: '/privacy', color: 'text-gray-600' },
        { icon: Shield, label: 'Terms of Service', path: '/terms', color: 'text-gray-600' }
      ]
    }
  ];

  const MenuItem = ({ icon: Icon, label, path, color }: { icon: any; label: string; path: string; color: string }) => (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-gray-900 font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 md:bg-background-secondary">
      <div className="max-w-md mx-auto bg-gray-100 md:bg-background-secondary px-4 py-6 md:hidden">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
              <p className="text-xs text-gray-400 mt-1">Free Plan</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
              {section.title}
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
              {section.items.map((item) => (
                <MenuItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              B
            </div>
            <h3 className="font-semibold text-gray-900">BudgetFlip</h3>
            <p className="text-sm text-gray-500">Version 1.0.0</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Desktop fallback */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">More</h1>
            <p className="text-gray-600">This page is optimized for mobile. Please view on a mobile device for the best experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}