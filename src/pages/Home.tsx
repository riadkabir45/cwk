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
}

interface Comment {
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

const Home: React.FC = () => {
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
                        <div className="flex items-center justify-between mb-3">
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