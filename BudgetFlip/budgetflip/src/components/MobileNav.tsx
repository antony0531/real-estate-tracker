import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Clock, Bell, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/my-work', icon: Clock, label: 'My work' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/more', icon: MoreHorizontal, label: 'More' }
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full px-2 py-2 transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-6 h-6 mb-1" />
                  {path === '/notifications' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary-500' : 'text-gray-500'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-primary-500 rounded-full"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}