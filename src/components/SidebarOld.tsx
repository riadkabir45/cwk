import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { getNavigationItems, type NavItem } from '../lib/navigation';

const Sidebar: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    // Update active link based on current location
    setActiveLink(location.pathname);
  }, [location]);

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/profile', label: 'My Profile', icon: 'profile' },
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/variables', label: 'Variables', icon: 'variables' },
    { to: '/mentors/leaderboard', label: 'Mentor Leaderboard', icon: 'mentor' },
    { to: '/projects', label: 'Projects', icon: 'projects' },
    { to: '/teams', label: 'Teams', icon: 'teams' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
  ];

  // Add admin link for admins and moderators
  const adminNavLinks = user?.roles?.some(role => ['ADMIN', 'MODERATOR'].includes(role)) || 
                         ['ADMIN', 'MODERATOR'].includes(user?.primaryRole || '') ? [
    { to: '/admin', label: 'Admin Panel', icon: 'admin' }
  ] : [];

  const allNavLinks = [...navLinks, ...adminNavLinks];

  // Helper function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'variables':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
          </svg>
        );
      case 'projects':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        );
      case 'teams':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      case 'mentor':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        );
      case 'admin':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  return (
    <>
      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-slate-200 transition-all duration-300 lg:relative lg:translate-x-0 ${
        isOpen 
          ? 'fixed inset-y-0 left-0 z-30 w-64 transform translate-x-0' 
          : 'fixed inset-y-0 left-0 z-30 w-64 transform -translate-x-full lg:translate-x-0 lg:w-0'
      }`}>
        <div className="h-full flex flex-col">
          <div className={`flex-1 transition-all duration-300 overflow-hidden ${!isOpen ? 'lg:w-0' : 'w-64 lg:w-64'}`}>
            <div className="p-6">
              <div className="flex flex-col h-full">
                {/* Sidebar header - only show on mobile when open */}
                <div className="mb-6 lg:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">CoWork</span>
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sidebar content */}
                <div className="flex-1">
                  <nav className="space-y-2">
                    {allNavLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => {
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth < 1024) {
                            toggleSidebar();
                          }
                        }}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === link.to
                            ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`mr-3 ${
                          activeLink === link.to ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-500'
                        }`}>
                          {renderIcon(link.icon)}
                        </span>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Sidebar footer */}
                <div className="pt-4 border-t border-gray-300">
                  <div className="flex items-center p-3 rounded-lg bg-white shadow-sm">
                    <Avatar
                      firstName={user?.user_metadata?.first_name}
                      lastName={user?.user_metadata?.last_name}
                      email={user?.email}
                      size="md"
                      className="bg-gradient-to-br from-indigo-500 to-purple-600"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{getUserDisplayName()}</p>
                      <Link 
                        to="/profile" 
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            toggleSidebar();
                          }
                        }}
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default Sidebar;