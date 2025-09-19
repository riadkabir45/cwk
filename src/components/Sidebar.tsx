import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { getNavigationItems, type NavItem } from '../lib/navigation';

const Sidebar: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Get user role (you might need to adjust this based on your user structure)
  const userRole = user?.user_metadata?.role || user?.role || '';
  const navigationItems = getNavigationItems(userRole);

  useEffect(() => {
    setExpandedMenus(new Set());
  }, [location]);

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  const toggleMenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = '/auth/login';
    }
    toggleSidebar();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => (
      <li key={item.to} className={`${level > 0 ? 'ml-4' : ''}`}>
        {item.children ? (
          <div>
            <button
              onClick={() => toggleMenu(item.label)}
              className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 rounded-lg"
            >
              <div className="flex items-center">
                <span className="font-medium">{item.label}</span>
              </div>
              <svg
                className={`h-4 w-4 transform transition-transform duration-200 ${
                  expandedMenus.has(item.label) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedMenus.has(item.label) && (
              <ul className="mt-1 space-y-1">
                {renderNavItems(item.children, level + 1)}
              </ul>
            )}
          </div>
        ) : (
          <Link
            to={item.to}
            onClick={toggleSidebar}
            className={`flex items-center p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 rounded-lg ${
              location.pathname === item.to ? 'bg-indigo-50 text-indigo-600' : ''
            }`}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        )}
      </li>
    ));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-72 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" className="text-xl font-bold text-indigo-600" onClick={toggleSidebar}>
              CoWork
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar 
                src={user?.user_metadata?.avatar_url || null}
                firstName={user?.user_metadata?.first_name}
                lastName={user?.user_metadata?.last_name}
                email={user?.email}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {renderNavItems(navigationItems)}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;