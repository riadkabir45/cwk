import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import ProtectedComponent from './ProtectedComponent';
import Avatar from './Avatar';
import { getNavigationItems, type NavItem } from '../lib/navigation';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Refs for dropdown click outside detection
  const tasksDropdownRef = useRef<HTMLDivElement>(null);
  const chatsDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement>(null);
  
  const { toggleSidebar } = useSidebar();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      api.get(`/notifications/count`)
        .then(res => {
          setNotificationCount(res.data || 0);
        })
        .catch(() => setNotificationCount(0));
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tasksDropdownRef.current && !tasksDropdownRef.current.contains(event.target as Node)) {
        setIsTasksOpen(false);
      }
      if (chatsDropdownRef.current && !chatsDropdownRef.current.contains(event.target as Node)) {
        setIsChatsOpen(false);
      }
      if (userMenuDropdownRef.current && !userMenuDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeAllDropdowns = () => {
    setIsTasksOpen(false);
    setIsChatsOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close all dropdowns when mobile menu is toggled
    if (!isMenuOpen) {
      closeAllDropdowns();
    }
  };

  const toggleTasks = () => {
    setIsChatsOpen(false);
    setIsUserMenuOpen(false);
    setIsTasksOpen(!isTasksOpen);
  };

  const toggleChats = () => {
    setIsTasksOpen(false);
    setIsUserMenuOpen(false);
    setIsChatsOpen(!isChatsOpen);
  };

  const toggleUserMenu = () => {
    setIsTasksOpen(false);
    setIsChatsOpen(false);
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth/login');
    }
    setIsUserMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeAllDropdowns();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button 
              onClick={() => toggleSidebar()} 
              className="text-xl sm:text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden xs:inline">CoWork</span>
              <span className="xs:hidden">CW</span>
            </button>
            {user && (
              <>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
                <div className="relative" ref={tasksDropdownRef}>
                  <button
                    onClick={toggleTasks}
                    className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Communities
                    <svg 
                      className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isTasksOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isTasksOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                      <Link
                        to="/tasks/create"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Community
                      </Link>
                      <Link
                        to="/tasks/list"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Browse Communities
                      </Link>
                      <Link
                        to="/tasks/statuses"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        My Communities
                      </Link>
                    </div>
                  )}
                </div>
                <div className="relative" ref={chatsDropdownRef}>
                  <button
                    onClick={toggleChats}
                    className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Chats
                    <svg 
                      className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isChatsOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isChatsOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                      <Link
                        to="/chat/find"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find Chat
                      </Link>
                      <Link
                        to="/chat/connections"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Pending Connections
                      </Link>
                      <Link
                        to="/chat/list"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat List
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleNavigation('/leaderboard')}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                >
                  User Rankings
                </button>
                <ProtectedComponent requiredRoles={['ADMIN', 'MODERATOR']}>
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Admin Panel
                  </button>
                </ProtectedComponent>
              </>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Notification button */}
                <div className="relative">
                  <button
                    className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    onClick={() => navigate('/notifications')}
                    aria-label="Notifications"
                  >
                    <i className='nf nf-oct-bell text-2xl'/>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* User menu button and dropdown */}
                <div className="relative" ref={userMenuDropdownRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <Avatar
                      firstName={user?.user_metadata?.first_name}
                      lastName={user?.user_metadata?.last_name}
                      email={user?.email}
                      size="md"
                      className="shadow-md bg-gradient-to-br from-indigo-500 to-purple-600"
                    />
                    <span className="text-sm font-medium hidden md:block">{getUserDisplayName()}</span>
                    <svg 
                      className={`w-4 h-4 transform transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="px-6 py-2 text-sm font-medium text-indigo-600 bg-white border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle based on menu state */}
      <div className={`sm:hidden border-t border-gray-200 ${isMenuOpen ? 'block animate-in slide-in-from-top-2 duration-300' : 'hidden'}`}>
        {user ? (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50">
            <div className="pt-2 pb-6 space-y-1">{/* Added pb-6 for bottom padding */}
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Communities section */}
              <div className="px-4 py-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Communities</h3>
                <div className="mt-1 space-y-1">
                  <ProtectedComponent requiredRoles={['ADMIN', 'MODERATOR']}>
                    <Link
                      to="/tasks/create"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Community
                    </Link>
                  </ProtectedComponent>
                  <Link
                    to="/tasks/list"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse Communities
                  </Link>
                  <Link
                    to="/tasks/statuses"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Communities
                  </Link>
                </div>
              </div>

              {/* Chats section */}
              <div className="px-4 py-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chats</h3>
                <div className="mt-1 space-y-1">
                  <Link
                    to="/chat/find"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Find Chat
                  </Link>
                  <Link
                    to="/chat/connections"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pending Connections
                  </Link>
                  <Link
                    to="/chat/list"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chat List
                  </Link>
                </div>
              </div>

              <Link
                to="/leaderboard"
                className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                User Rankings
              </Link>

              <Link
                to="/notifications"
                className="flex items-center px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>

              <ProtectedComponent requiredRoles={['ADMIN', 'MODERATOR']}>
                <Link
                  to="/admin"
                  className="block px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              </ProtectedComponent>

              {/* User section */}
              <div className="pt-3 border-t border-gray-200 bg-white">
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      firstName={user?.user_metadata?.first_name}
                      lastName={user?.user_metadata?.last_name}
                      email={user?.email}
                      size="md"
                      className="bg-gradient-to-br from-indigo-500 to-purple-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200 bg-white">
            <div className="flex items-center px-4 space-x-3">
              <Link
                to="/auth/login"
                className="flex-1 text-center px-4 py-2 text-base font-medium text-indigo-600 bg-white border-2 border-indigo-200 rounded-lg hover:bg-indigo-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                className="flex-1 text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-lg hover:from-indigo-600 hover:to-purple-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;