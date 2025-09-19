import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Tag } from '../types/tag';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  maxTags?: number;
  onError?: (message: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 5,
  onError
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      console.log('Fetching tags from /api/tags/approved...');
      const response = await api.get('/api/tags/approved');
      console.log('Tags response:', response.data);
      setAvailableTags(response.data);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const searchTags = async (keyword: string) => {
    if (!keyword.trim()) {
      fetchTags();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/tags/search?keyword=${encodeURIComponent(keyword)}`);
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error searching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchTags(value);
  };

  const addTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      onError?.(`You can only select up to ${maxTags} tags`);
      return;
    }

    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setShowDropdown(false);
    setSearchTerm('');
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const filteredTags = availableTags.filter(tag => 
    !selectedTags.find(selected => selected.id === tag.id)
  );

  return (
    <div className="space-y-3">
      <label className="block font-medium text-gray-700">Tags</label>
      
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Tag Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2 text-gray-500">Loading...</div>
            ) : filteredTags.length > 0 ? (
              <>
                {filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
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
              </>
            ) : (
              <div className="px-3 py-2 text-gray-500">
                {searchTerm ? 'No tags found' : 'No tags available'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <div className="text-sm text-gray-500">
        {selectedTags.length}/{maxTags} tags selected
      </div>
    </div>
  );
};

export default TagSelector;