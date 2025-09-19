import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Tag } from '../types/tag';
import TagSuggestionModal from './TagSuggestionModal';

interface TaskTagListProps {
  taskId: string;
  canSuggestTags?: boolean;
  compact?: boolean;
}

const TaskTagList: React.FC<TaskTagListProps> = ({ taskId, canSuggestTags = true, compact = false }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedTagForSuggestion, setSelectedTagForSuggestion] = useState<Tag | null>(null);
  const [suggestionReason, setSuggestionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);

  useEffect(() => {
    fetchTaskTags();
    if (canSuggestTags) {
      fetchAvailableTags();
    }
  }, [taskId, canSuggestTags]);

  const fetchTaskTags = async () => {
    try {
      const response = await api.get(`/api/tasks/${taskId}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching task tags:', error);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await api.get('/api/tags/approved');
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching available tags:', error);
    }
  };

    const suggestTagForTask = async (tag: Tag, reason: string) => {
    try {
      setLoading(true);
      console.log('Suggesting tag for task:', { tagId: tag.id, taskId, reason });
      
      const response = await api.post(`/api/tags/suggest-for-task`, {
        tagId: tag.id,
        taskId,
        reason
      });
      
      console.log('Tag suggestion response:', response.data);
      
      if (response.data.success) {
        alert('Tag suggestion submitted successfully!');
        closeModal();
      } else {
        console.error('Tag suggestion failed:', response.data);
        alert('Failed to submit tag suggestion. Please try again.');
      }
    } catch (error: any) {
      console.error('Error suggesting tag for task:', error);
      console.error('Error response:', error.response);
      alert('Failed to submit tag suggestion. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTag = (tag: Tag) => {
    setSelectedTagForSuggestion(tag);
  };

  const submitTagSuggestion = () => {
    if (selectedTagForSuggestion && suggestionReason.trim()) {
      suggestTagForTask(selectedTagForSuggestion, suggestionReason);
    }
  };

  const closeModal = () => {
    setShowSuggestModal(false);
    setSelectedTagForSuggestion(null);
    setSuggestionReason('');
  };

  const handleNewTagSuggested = () => {
    setShowNewTagModal(false);
    // Refresh available tags by reloading them
    fetchAvailableTags();
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-3"}>
            {!compact && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          {canSuggestTags && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSuggestModal(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Suggest Existing Tag
              </button>
              <button
                onClick={() => setShowNewTagModal(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Suggest New Tag
              </button>
            </div>
          )}
        </div>
      )}

      {compact && canSuggestTags && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tags:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowSuggestModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              + Existing
            </button>
            <span className="text-xs text-gray-400">|</span>
            <button
              onClick={() => setShowNewTagModal(true)}
              className="text-xs text-green-600 hover:text-green-800"
            >
              + New
            </button>
          </div>
        </div>
      )}

      {compact && !canSuggestTags && tags.length > 0 && (
        <span className="text-sm text-gray-600">Tags:</span>
      )}

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map(tag => (
            <span
              key={tag.id}
              className={`inline-flex items-center rounded-full font-medium text-white ${
                compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
              }`}
              style={{ backgroundColor: tag.color }}
              title={tag.description}
            >
              {tag.name}
            </span>
          ))
        ) : (
          !compact && <span className="text-gray-500 text-sm">No tags assigned</span>
        )}
      </div>

      {/* Tag Suggestion Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Suggest Tag for Task</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Existing Tag Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a tag to suggest:
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  You can suggest any tag, even if it's already added. Provide your reasoning below.
                </p>
                  <div className="max-h-40 overflow-y-auto border rounded p-2">
                    {availableTags.length > 0 ? (
                      availableTags.map(tag => {
                        const isAlreadyOnTask = tags.some(taskTag => taskTag.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => handleSuggestTag(tag)}
                            className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center space-x-2 ${
                              selectedTagForSuggestion?.id === tag.id ? 'bg-blue-100' : ''
                            } ${isAlreadyOnTask ? 'opacity-75' : ''}`}
                          >
                            <span 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            {isAlreadyOnTask && (
                              <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                                Already added
                              </span>
                            )}
                            {tag.description && (
                              <span className="text-sm text-gray-500">- {tag.description}</span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm p-2">No approved tags available</p>
                    )}
                  </div>
                </div>

              {selectedTagForSuggestion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for suggestion:
                  </label>
                  <textarea
                    value={suggestionReason}
                    onChange={(e) => setSuggestionReason(e.target.value)}
                    placeholder="Explain why this tag is relevant to this task..."
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitTagSuggestion}
                  disabled={
                    !suggestionReason.trim() || 
                    loading ||
                    !selectedTagForSuggestion
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Suggesting...' : 'Suggest Tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Tag Suggestion Modal */}
      <TagSuggestionModal
        isOpen={showNewTagModal}
        onClose={() => setShowNewTagModal(false)}
        onSuggestionSubmitted={handleNewTagSuggested}
      />
    </div>
  );
};

export default TaskTagList;