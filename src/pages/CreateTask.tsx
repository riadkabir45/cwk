import React, { useState } from 'react';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { api } from '../lib/api';

const TASK_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / No' },
];

const CreateTask: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('number');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      taskName: taskName,
      numericalTask: taskType === 'number',
    };

    api.post('/tasks', data).then(() => {
      setMessage({ text: 'Community created successfully!', type: 'success' });
    }).catch(() => {
      setMessage({ text: 'Failed to create community.', type: 'error' });
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
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Create Community
        </button>
      </form>
    </div>
  );
};

export default CreateTask;