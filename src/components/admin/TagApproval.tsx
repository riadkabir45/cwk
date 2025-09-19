import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MessageBox, { type MessageState } from '../MessageBox';

interface TagSuggestion {
  id: string;
  suggestedName: string;
  description?: string;
  justification?: string;
  suggestedBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

interface TaskTagSuggestion {
  id: string;
  suggestedTag: string;
  justification?: string;
  suggestedBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  task: {
    id: string;
    taskName: string;
  };
  createdAt: string;
}

const TagApproval: React.FC = () => {
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [taskTagSuggestions, setTaskTagSuggestions] = useState<TaskTagSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [activeTab, setActiveTab] = useState<'tags' | 'taskTags'>('tags');
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TagSuggestion | TaskTagSuggestion | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTagSuggestions(),
        fetchTaskTagSuggestions()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTagSuggestions = async () => {
    try {
      console.log('Fetching tag suggestions from /api/tags/suggestions/pending');
      const response = await api.get('/api/tags/suggestions/pending');
      console.log('Tag suggestions response:', response.data);
      setTagSuggestions(response.data);
    } catch (error: any) {
      console.error('Error fetching tag suggestions:', error);
      console.error('Error response:', error.response);
      if (error.response?.status !== 403) {
        setMessage({ text: 'Failed to load tag suggestions', type: 'error' });
      }
    }
  };

  const fetchTaskTagSuggestions = async () => {
    try {
      console.log('Fetching task tag suggestions from /api/tags/task-suggestions/pending');
      const response = await api.get('/api/tags/task-suggestions/pending');
      console.log('Task tag suggestions response:', response.data);
      setTaskTagSuggestions(response.data);
    } catch (error: any) {
      console.error('Error fetching task tag suggestions:', error);
      console.error('Error response:', error.response);
      if (error.response?.status !== 403) {
        setMessage({ text: 'Failed to load task tag suggestions', type: 'error' });
      }
    }
  };

  const handleApprove = (suggestion: TagSuggestion | TaskTagSuggestion) => {
    setSelectedSuggestion(suggestion);
    setComment('');
    setShowApprovalModal(true);
  };

  const handleReject = (suggestion: TagSuggestion | TaskTagSuggestion) => {
    setSelectedSuggestion(suggestion);
    setComment('');
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedSuggestion) return;

    try {
      setActionLoading(true);
      const isTaskTag = 'task' in selectedSuggestion;
      const endpoint = isTaskTag 
        ? `/api/tags/task-suggestions/${selectedSuggestion.id}/approve`
        : `/api/tags/suggestions/${selectedSuggestion.id}/approve`;

      await api.post(endpoint, { comment });
      
      setMessage({ text: 'Suggestion approved successfully!', type: 'success' });
      setShowApprovalModal(false);
      setSelectedSuggestion(null);
      setComment('');
      fetchData();
      
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.error || 'Failed to approve suggestion', 
        type: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedSuggestion || !comment.trim()) {
      setMessage({ text: 'Please provide a reason for rejection', type: 'error' });
      return;
    }

    try {
      setActionLoading(true);
      const isTaskTag = 'task' in selectedSuggestion;
      const endpoint = isTaskTag 
        ? `/api/tags/task-suggestions/${selectedSuggestion.id}/reject`
        : `/api/tags/suggestions/${selectedSuggestion.id}/reject`;

      await api.post(endpoint, { comment });
      
      setMessage({ text: 'Suggestion rejected successfully!', type: 'success' });
      setShowRejectionModal(false);
      setSelectedSuggestion(null);
      setComment('');
      fetchData();
      
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.error || 'Failed to reject suggestion', 
        type: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (user: any) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading tag suggestions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tag Approval Management</h2>
      </div>

      <MessageBox message={message} setMessage={setMessage} />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          New Tag Suggestions ({tagSuggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('taskTags')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'taskTags'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Task Tag Suggestions ({taskTagSuggestions.length})
        </button>
      </div>

      {/* Tag Suggestions Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {tagSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending tag suggestions
            </div>
          ) : (
            <div className="grid gap-4">
              {tagSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {suggestion.suggestedName}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      </div>
                      
                      {suggestion.description && (
                        <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      )}
                      
                      {suggestion.justification && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Justification: </span>
                          <span className="text-sm text-gray-600">{suggestion.justification}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Suggested by: {getUserDisplayName(suggestion.suggestedBy)}</span>
                        <span>•</span>
                        <span>{formatDate(suggestion.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(suggestion)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(suggestion)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Tag Suggestions Tab */}
      {activeTab === 'taskTags' && (
        <div className="space-y-4">
          {taskTagSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending task tag suggestions
            </div>
          ) : (
            <div className="grid gap-4">
              {taskTagSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Add "{suggestion.suggestedTag}" to "{suggestion.task.taskName}"
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      </div>
                      
                      {suggestion.justification && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Justification: </span>
                          <span className="text-sm text-gray-600">{suggestion.justification}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Suggested by: {getUserDisplayName(suggestion.suggestedBy)}</span>
                        <span>•</span>
                        <span>{formatDate(suggestion.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(suggestion)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(suggestion)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Approve Suggestion</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to approve this suggestion?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Add a comment about your approval..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedSuggestion(null);
                    setComment('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Suggestion</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Please provide a reason for rejecting this suggestion:
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection *:
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Explain why this suggestion is being rejected..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedSuggestion(null);
                    setComment('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejection}
                  disabled={actionLoading || !comment.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagApproval;