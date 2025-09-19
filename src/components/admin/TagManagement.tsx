import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { TagSuggestion, TaskTagSuggestion } from '../../types/tag';

const TagManagement: React.FC = () => {
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [taskTagSuggestions, setTaskTagSuggestions] = useState<TaskTagSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'tags' | 'taskTags'>('tags');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingSuggestions();
  }, []);

  const fetchPendingSuggestions = async () => {
    try {
      setLoading(true);
      const [tagSuggestionsResponse, taskTagSuggestionsResponse] = await Promise.all([
        api.get('/api/tags/suggestions/pending'),
        api.get('/api/tags/task-suggestions/pending')
      ]);
      
      setTagSuggestions(tagSuggestionsResponse.data);
      setTaskTagSuggestions(taskTagSuggestionsResponse.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSuggestionAction = async (suggestionId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await api.put(`/api/tags/suggestions/${suggestionId}/${action}`, {
        moderatorComments: reason
      });
      
      // Remove from list or refetch
      setTagSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      alert(`Tag suggestion ${action}d successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} suggestion`);
    }
  };

  const handleTaskTagSuggestionAction = async (suggestionId: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/api/tags/task-suggestions/${suggestionId}/${action}`);
      
      // Remove from list or refetch
      setTaskTagSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      alert(`Task tag suggestion ${action}d successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} suggestion`);
    }
  };

  const SuggestionCard: React.FC<{
    suggestion: TagSuggestion;
    onAction: (id: string, action: 'approve' | 'reject', reason?: string) => void;
  }> = ({ suggestion, onAction }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className="w-4 h-4 rounded-full border bg-gray-400"
              />
              <h3 className="font-bold text-lg">{suggestion.suggestedName}</h3>
            </div>
            {suggestion.description && (
              <p className="text-gray-600 mb-2">{suggestion.description}</p>
            )}
            <p className="text-sm text-gray-500 mb-2">
              <strong>Reason:</strong> {suggestion.reason}
            </p>
            <p className="text-xs text-gray-400">
              Suggested by: {suggestion.suggestedBy.firstName} {suggestion.suggestedBy.lastName} ({suggestion.suggestedBy.email})
            </p>
            <p className="text-xs text-gray-400">
              On: {new Date(suggestion.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onAction(suggestion.id, 'approve')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">Reject Tag Suggestion</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for rejection (optional):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide feedback to the user..."
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onAction(suggestion.id, 'reject', rejectionReason);
                      setShowRejectModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TaskTagSuggestionCard: React.FC<{
    suggestion: TaskTagSuggestion;
    onAction: (id: string, action: 'approve' | 'reject') => void;
  }> = ({ suggestion, onAction }) => (
    <div className="border rounded-lg p-4 bg-white">
      <div className="mb-3">
        <h3 className="font-bold">Task Tag Suggestion</h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Task:</strong> {suggestion.task.taskName} (ID: {suggestion.task.id})
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Suggested Tag:</strong> {suggestion.suggestedTag.name}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Reason:</strong> {suggestion.reason}
        </p>
        <p className="text-xs text-gray-400">
          Suggested by: {suggestion.suggestedBy.firstName} {suggestion.suggestedBy.lastName} ({suggestion.suggestedBy.email})
        </p>
        <p className="text-xs text-gray-400">
          On: {new Date(suggestion.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onAction(suggestion.id, 'approve')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => onAction(suggestion.id, 'reject')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-6">Loading suggestions...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === 'tags'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          New Tag Suggestions ({tagSuggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('taskTags')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === 'taskTags'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Task Tag Suggestions ({taskTagSuggestions.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'tags' && (
          <>
            {tagSuggestions.length > 0 ? (
              tagSuggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAction={handleTagSuggestionAction}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending tag suggestions
              </div>
            )}
          </>
        )}

        {activeTab === 'taskTags' && (
          <>
            {taskTagSuggestions.length > 0 ? (
              taskTagSuggestions.map(suggestion => (
                <TaskTagSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAction={handleTaskTagSuggestionAction}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending task tag suggestions
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TagManagement;