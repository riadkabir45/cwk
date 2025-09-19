import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MessageBox from '../components/MessageBox';

interface TaskUpdate {
  id: string;
  taskName: string;
  userName: string;
  updateText: string;
  timestamp: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface CommunityUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  commonTasks: number;
  mutualConnections: number;
  activeStreak: number;
}

interface TaskSuggestion {
  id: string;
  taskName: string;
  description: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  userCount: number;
  completionRate: number;
}

const Home: React.FC = () => {
  const [recentUpdates, setRecentUpdates] = useState<TaskUpdate[]>([]);
  const [communitySuggestions, setCommunitySuggestions] = useState<CommunityUser[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warn' | null }>({ text: '', type: null });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent task updates from community
      const updatesResponse = await api.get('/api/dashboard/recent-updates');
      if (updatesResponse.data) {
        setRecentUpdates(updatesResponse.data);
      }

      // Load community join suggestions
      const communityResponse = await api.get('/api/dashboard/community-suggestions');
      if (communityResponse.data) {
        setCommunitySuggestions(communityResponse.data);
      }

      // Load trending task suggestions
      const tasksResponse = await api.get('/api/dashboard/trending-tasks');
      if (tasksResponse.data) {
        setTaskSuggestions(tasksResponse.data);
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setMessage({
        text: 'Failed to load some dashboard content. You can still navigate using the menu.',
        type: 'warn'
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWithUser = async (userId: string) => {
    try {
      await api.post(`/api/connections/request`, { targetUserId: userId });
      setMessage({
        text: 'Connection request sent successfully!',
        type: 'success'
      });
      
      // Remove from suggestions
      setCommunitySuggestions(prev => prev.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      setMessage({
        text: 'Failed to send connection request. Please try again.',
        type: 'error'
      });
    }
  };

  const joinTask = async (taskId: string) => {
    try {
      await api.post(`/api/tasks/${taskId}/join`);
      setMessage({
        text: 'Successfully joined the task!',
        type: 'success'
      });
      
      // Remove from suggestions
      setTaskSuggestions(prev => prev.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error('Error joining task:', error);
      setMessage({
        text: 'Failed to join task. Please try again.',
        type: 'error'
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageBox message={message} setMessage={setMessage} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome Back to CoWork!</h1>
            <p className="text-xl text-blue-100 mb-8">
              Stay connected with your community and discover new opportunities
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/tasks/create"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Create New Task
              </Link>
              <Link
                to="/tasks/statuses"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                View My Tasks
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed - Recent Updates */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Feed</h2>
              <p className="text-gray-600">See what your community is working on</p>
            </div>
            
            <div className="space-y-6">
              {recentUpdates.length > 0 ? (
                recentUpdates.map((update) => (
                  <div key={update.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {update.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-lg font-semibold text-gray-900">{update.userName}</p>
                          <span className="text-gray-500">completed</span>
                          <p className="text-lg font-medium text-blue-600">{update.taskName}</p>
                        </div>
                        <p className="text-gray-700 mb-3 text-lg">{update.updateText}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {update.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {update.tags.length > 3 && (
                              <span className="text-sm text-gray-500">+{update.tags.length - 3} more</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{formatTimeAgo(update.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent updates</h3>
                  <p className="text-gray-600 mb-6">Connect with others to see their progress updates</p>
                  <Link
                    to="/chat/find"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Community
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Community Suggestions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Connect with Others</h3>
                <p className="text-sm text-gray-600 mt-1">People with similar goals</p>
              </div>
              <div className="p-6 space-y-4">
                {communitySuggestions.length > 0 ? (
                  communitySuggestions.slice(0, 3).map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>• {user.commonTasks} common tasks</p>
                        <p>• {user.activeStreak} day streak</p>
                        {user.mutualConnections > 0 && (
                          <p>• {user.mutualConnections} mutual connections</p>
                        )}
                      </div>
                      <button
                        onClick={() => connectWithUser(user.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Connection Request
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-4">No connection suggestions available</p>
                    <Link
                      to="/chat/find"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Explore Community
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Trending Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Trending Tasks</h3>
                <p className="text-sm text-gray-600 mt-1">Popular in the community</p>
              </div>
              <div className="p-6 space-y-4">
                {taskSuggestions.length > 0 ? (
                  taskSuggestions.slice(0, 3).map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">{task.taskName}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>• {task.userCount} people doing this</p>
                        <p>• {Math.round(task.completionRate)}% completion rate</p>
                      </div>
                      <button
                        onClick={() => joinTask(task.id)}
                        className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Join This Task
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-4">No trending tasks available</p>
                    <Link
                      to="/tasks/list"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Browse All Tasks
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/tasks/create"
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Create New Task
                </Link>
                <Link
                  to="/chat/find"
                  className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  🔍 Find Community
                </Link>
                <Link
                  to="/leaderBoard"
                  className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  🏆 View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;