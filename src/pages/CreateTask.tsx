import React, { useState } from 'react';
import MessageBox, { type MessageState } from '../components/MessageBox';
import TagSelector from '../components/TagSelector';
import TagSuggestionModal from '../components/TagSuggestionModal';
import { api } from '../lib/api';
import type { Tag } from '../types/tag';

const TASK_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / No' },
];

const CreateTask: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('number');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagSuggestionModal, setShowTagSuggestionModal] = useState(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation: Check if at least one tag is selected
    if (selectedTags.length === 0) {
      setMessage({ text: 'Please select at least one tag before creating a task.', type: 'error' });
      return;
    }
    
    const data = {
      taskName: taskName,
      numericalTask: taskType === 'number',
      tagIds: selectedTags.map(tag => tag.id)
    };

    api.post('/api/tasks', data).then(() => {
      setMessage({ text: 'Community created successfully!', type: 'success' });
      setTaskName('');
      setSelectedTags([]);
    }).catch((error) => {
      // Better error handling from backend
      const errorMessage = error.response?.data?.message || 'Failed to create community.';
      setMessage({ text: errorMessage, type: 'error' });
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh] flex flex-col justify-center">
      <h2 className="text-xl font-bold mb-4">Create Community</h2>
      <MessageBox message={message} setMessage={setMessage} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Community Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Community Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={taskType}
            onChange={e => setTaskType(e.target.value)}
          >
            {TASK_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {/* Tag Selection */}
        <div>
          <TagSelector 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            maxTags={5}
          />
          <button
            type="button"
            onClick={() => setShowTagSuggestionModal(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Can't find the right tag? Suggest a new one
          </button>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Create Community
        </button>
      </form>
      
      <TagSuggestionModal
        isOpen={showTagSuggestionModal}
        onClose={() => setShowTagSuggestionModal(false)}
        onSuggestionSubmitted={() => {
          // Optionally refresh tags in TagSelector
        }}
      />
    </div>
  );
};

export default CreateTask;