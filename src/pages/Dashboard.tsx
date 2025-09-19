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

const Dashboard: React.FC = () => {
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
        text: 'Failed to load dashboard data. Please refresh the page.',
        type: 'error'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MessageBox message={message} setMessage={setMessage} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Stay updated with your community and discover new opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Community Updates */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Updates</h2>
              <p className="text-sm text-gray-600">See what your community is working on</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentUpdates.length > 0 ? (
                recentUpdates.map((update) => (
                  <div key={update.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {update.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{update.userName}</p>
                          <span className="text-sm text-gray-500">completed</span>
                          <p className="text-sm font-medium text-blue-600">{update.taskName}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{update.updateText}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {update.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {update.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{update.tags.length - 3} more</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{formatTimeAgo(update.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No recent updates available</p>
                  <Link to="/chat/find" className="text-blue-600 hover:text-blue-800 text-sm">
                    Connect with others to see their updates
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with suggestions */}
        <div className="space-y-6">
          {/* Community Join Suggestions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">People to Connect</h3>
              <p className="text-sm text-gray-600">Users with similar interests</p>
            </div>
            <div className="p-6 space-y-4">
              {communitySuggestions.length > 0 ? (
                communitySuggestions.slice(0, 3).map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p>• {user.commonTasks} common tasks</p>
                      <p>• {user.activeStreak} day streak</p>
                      {user.mutualConnections > 0 && (
                        <p>• {user.mutualConnections} mutual connections</p>
                      )}
                    </div>
                    <button
                      onClick={() => connectWithUser(user.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No connection suggestions available
                </p>
              )}
              {communitySuggestions.length > 3 && (
                <Link
                  to="/chat/find"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all suggestions
                </Link>
              )}
            </div>
          </div>

          {/* Trending Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Trending Tasks</h3>
              <p className="text-sm text-gray-600">Popular tasks in the community</p>
            </div>
            <div className="p-6 space-y-4">
              {taskSuggestions.length > 0 ? (
                taskSuggestions.slice(0, 3).map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{task.taskName}</h4>
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
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p>• {task.userCount} people doing this</p>
                      <p>• {task.completionRate}% completion rate</p>
                    </div>
                    <button
                      onClick={() => joinTask(task.id)}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Join Task
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No trending tasks available
                </p>
              )}
              {taskSuggestions.length > 3 && (
                <Link
                  to="/tasks/list"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all tasks
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/tasks/create"
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Task
              </Link>
              <Link
                to="/tasks/statuses"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                View My Tasks
              </Link>
              <Link
                to="/chat/find"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Find Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;