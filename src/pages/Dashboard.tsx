import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MessageBox from '../components/MessageBox';

interface TaskUpdate {
  id: string;
  taskInstanceId?: string;
  taskName: string;
  userName: string;
  updateText: string;
  timestamp: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  comments?: Comment[];
  commentCount?: number;
}interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  replyCount: number;
  likeCount: number;
  dislikeCount: number;
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
  // Comment-related state
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [newComments, setNewComments] = useState<{[key: string]: string}>({});
  const [commentLoading, setCommentLoading] = useState<{[key: string]: boolean}>({});

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

  // Comment functionality
  const toggleComments = (updateId: string) => {
    if (expandedComments[updateId]) {
      setExpandedComments(prev => ({
        ...prev,
        [updateId]: false
      }));
    } else {
      setExpandedComments(prev => ({
        ...prev,
        [updateId]: true
      }));
      // Load comments when expanding
      loadComments(updateId);
    }
  };

  const loadComments = async (updateId: string) => {
    try {
      const update = recentUpdates.find(u => u.id === updateId);
      if (!update?.taskInstanceId) return;
      
      const response = await api.get(`/api/task-feedback/comments/task-instance/${update.taskInstanceId}`);
      if (response.data) {
        // Update the specific update with loaded comments
        setRecentUpdates(prev => prev.map(u => 
          u.id === updateId 
            ? { ...u, comments: response.data, commentCount: response.data.length }
            : u
        ));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setMessage({
        text: 'Failed to load comments.',
        type: 'error'
      });
    }
  };

  const addComment = async (updateId: string) => {
    const commentText = newComments[updateId];
    if (!commentText || !commentText.trim()) return;

    const update = recentUpdates.find(u => u.id === updateId);
    if (!update?.taskInstanceId) return;

    setCommentLoading(prev => ({
      ...prev,
      [updateId]: true
    }));

    try {
      const response = await api.post('/api/task-feedback/comments', {
        taskInstanceId: update.taskInstanceId,
        content: commentText,
        parentCommentId: null
      });
      
      if (response.data) {
        // Add the new comment to the update
        setRecentUpdates(prev => prev.map(u => 
          u.id === updateId 
            ? { 
                ...u, 
                comments: [...(u.comments || []), response.data],
                commentCount: (u.commentCount || 0) + 1
              }
            : u
        ));

        // Clear the comment input
        setNewComments(prev => ({
          ...prev,
          [updateId]: ''
        }));

        setMessage({
          text: 'Comment added successfully!',
          type: 'success'
        });
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      setMessage({
        text: 'Failed to add comment.',
        type: 'error'
      });
    } finally {
      setCommentLoading(prev => ({
        ...prev,
        [updateId]: false
      }));
    }
  };

  const handleCommentChange = (updateId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [updateId]: value
    }));
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent, updateId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment(updateId);
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
                        
                        {/* SIMPLE COMMENT BUTTON TEST */}
                        <div className="bg-green-100 p-2 border rounded">
                          <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            onClick={() => alert('Comment clicked for: ' + update.id)}
                          >
                            💬 Comment
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
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

                        {/* DEBUG: Check if this shows up */}
                        <div className="bg-red-100 p-2 mb-2 text-xs">
                          DEBUG: Update ID: {update.id}, TaskInstanceId: {update.taskInstanceId || 'MISSING'}
                        </div>

                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => toggleComments(update.id)}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>
                              {(update.commentCount || 0) > 0 ? `${update.commentCount} comments` : 'Comment'}
                            </span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedComments[update.id] && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            {/* Existing Comments */}
                            {update.comments && update.comments.length > 0 && (
                              <div className="space-y-3 mb-4">
                                {update.comments.map((comment) => (
                                  <div key={comment.id} className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-xs">
                                          {comment.author.firstName.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                                        <p className="text-sm font-medium text-gray-900">
                                          {comment.author.firstName} {comment.author.lastName}
                                        </p>
                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment */}
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-xs">
                                    {/* Current user initial - you can get this from auth context */}
                                    U
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={newComments[update.id] || ''}
                                  onChange={(e) => handleCommentChange(update.id, e.target.value)}
                                  onKeyPress={(e) => handleCommentKeyPress(e, update.id)}
                                  placeholder="Write a comment..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={2}
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500">Press Enter to post</span>
                                  <button
                                    onClick={() => addComment(update.id)}
                                    disabled={!newComments[update.id]?.trim() || commentLoading[update.id]}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {commentLoading[update.id] ? 'Posting...' : 'Post'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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