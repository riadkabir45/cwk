import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const toggleTasks = () => setIsTasksOpen(!isTasksOpen);
  const toggleChats = () => setIsChatsOpen(!isChatsOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth/login');
    }
    setIsUserMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white shadow-sm z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => toggleSidebar()} className="text-lg font-bold text-indigo-600">CWK </button>
            {user && (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleTasks}
                    className="px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
                  >
                    Tasks
                    <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isTasksOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                      <Link
                        to="/tasks/create"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        Create Task
                      </Link>
                      <Link
                        to="/tasks/list"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        Task List
                      </Link>
                      <Link
                        to="/tasks/statuses"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsTasksOpen(false)}
                      >
                        Task Statuses
                      </Link>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={toggleChats}
                    className="px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
                  >
                    Chats
                    <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isChatsOpen && (
                    <div className="absolute left-0 mt-2 w-50 bg-white border rounded shadow-lg z-50">
                      <Link
                        to="/chat/find"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        Find Chat
                      </Link>
                      <Link
                        to="/chat/connections"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        Pending Connections
                      </Link>
                      <Link
                        to="/chat/list"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsChatsOpen(false)}
                      >
                        Chat List
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
                >
                  User Rankings
                </button>
              </>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Notification button */}
                <div className="relative">
                  <button
                    className="relative focus:outline-none"
                    onClick={() => navigate('/notifications')}
                    aria-label="Notifications"
                  >
                    <i className="nf nf-fa-bell text-xl text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </div>
                {/* User menu button and dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="relative w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {getUserInitials()}
                    </div>
                    <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 min-w-[12rem] bg-white border rounded shadow-lg z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            to="/variables"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            Variables
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4 space-x-2">
            <Link
              to="/auth/login"
              className="block w-full text-center px-4 py-2 text-base font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;