import React, { useState } from 'react';
import { api } from '../lib/api';

interface TagSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionSubmitted?: () => void;
}

const TagSuggestionModal: React.FC<TagSuggestionModalProps> = ({
  isOpen,
  onClose,
  onSuggestionSubmitted
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Tag name is required');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Reason for suggestion is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/tags/suggest', {
        name: formData.name,
        description: formData.description,
        reason: formData.reason
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        reason: ''
      });
      
      onSuggestionSubmitted?.();
      onClose();
      
      alert('Tag suggestion submitted successfully! It will be reviewed by a mentor.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Suggest New Tag</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Backend, Frontend, Database"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of what this tag represents..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-10 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Suggestion *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Explain why this tag would be useful for the project..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={500}
              required
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview
            </label>
            <div className="border rounded p-3 bg-gray-50">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name || 'Tag Name'}
              </span>
              {formData.description && (
                <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagSuggestionModal;