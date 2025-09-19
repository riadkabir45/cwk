import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Tag } from '../types/tag';

interface TaskTagListProps {
  taskId: string;
  canSuggestTags?: boolean;
}

const TaskTagList: React.FC<TaskTagListProps> = ({ taskId, canSuggestTags = true }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedTagForSuggestion, setSelectedTagForSuggestion] = useState<Tag | null>(null);
  const [suggestionReason, setSuggestionReason] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.post(`/api/tasks/${taskId}/suggest-tag`, {
        tagId: tag.id,
        reason: reason
      });
      
      alert('Tag suggestion submitted! It will be reviewed by a mentor.');
      setSelectedTagForSuggestion(null);
      setSuggestionReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to suggest tag');
    } finally {
      setLoading(false);
    }
  };

  const getTagsNotOnTask = () => {
    return availableTags.filter(availableTag => 
      !tags.some(taskTag => taskTag.id === availableTag.id)
    );
  };

  const handleSuggestTag = (tag: Tag) => {
    setSelectedTagForSuggestion(tag);
  };

  const submitTagSuggestion = () => {
    if (selectedTagForSuggestion && suggestionReason.trim()) {
      suggestTagForTask(selectedTagForSuggestion, suggestionReason);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Tags</h4>
        {canSuggestTags && getTagsNotOnTask().length > 0 && (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Suggest tag
          </button>
        )}
      </div>

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.color }}
              title={tag.description}
            >
              {tag.name}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No tags assigned</span>
        )}
      </div>

      {/* Tag Suggestion Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Suggest Tag for Task</h3>
              <button
                onClick={() => setShowSuggestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a tag to suggest:
                </label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {getTagsNotOnTask().map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleSuggestTag(tag)}
                      className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center space-x-2 ${
                        selectedTagForSuggestion?.id === tag.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {tag.description && (
                        <span className="text-sm text-gray-500">- {tag.description}</span>
                      )}
                    </button>
                  ))}
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
                  onClick={() => setShowSuggestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitTagSuggestion}
                  disabled={!selectedTagForSuggestion || !suggestionReason.trim() || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Suggesting...' : 'Suggest Tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTagList;