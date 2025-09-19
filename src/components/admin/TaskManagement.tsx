import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MessageBox, { type MessageState } from '../MessageBox';
import YesNoModal from '../YesNoModal';

interface Task {
  id: string;
  taskName: string;
  type: string;
  instances?: string[];
}

interface RenameModalData {
  task: Task;
  newName: string;
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [search, setSearch] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameModalData, setRenameModalData] = useState<RenameModalData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      console.log('Fetching tasks...');
      const response = await api.get('/tasks');
      console.log('Tasks fetched:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setMessage({ text: 'Failed to load tasks', type: 'error' });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRenameTask = async () => {
    if (!renameModalData || !renameModalData.newName.trim()) {
      setMessage({ text: 'Please enter a valid task name', type: 'error' });
      return;
    }

    if (renameLoading) return; // Prevent multiple clicks

    try {
      setRenameLoading(true);
      console.log('Attempting to rename task:', renameModalData.task.id, 'to:', renameModalData.newName.trim());
      
      const response = await api.put(`/tasks/${renameModalData.task.id}/rename`, {
        newName: renameModalData.newName.trim()
      });
      
      console.log('Rename response:', response);
      
      // Update the task in the local state immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === renameModalData.task.id 
            ? { ...task, taskName: renameModalData.newName.trim() }
            : task
        )
      );
      
      // Close modal first
      setShowRenameModal(false);
      setRenameModalData(null);
      
      // Show success message
      setMessage({ text: 'Task renamed successfully!', type: 'success' });
      
      // Refresh the list without showing loading spinner (backup)
      await fetchTasks(false);
      
    } catch (error: any) {
      console.error('Rename error:', error);
      
      // Close modal even on error
      setShowRenameModal(false);
      setRenameModalData(null);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to rename task';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await api.delete(`/tasks/admin/${taskToDelete.id}`);
      
      setMessage({ text: 'Task deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks(); // Refresh the list
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      setMessage({ text: errorMessage, type: 'error' });
    }
  };

  const openRenameModal = (task: Task) => {
    setRenameModalData({ task, newName: task.taskName });
    setShowRenameModal(true);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const filteredTasks = tasks.filter(task => 
    task.taskName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
      </div>

      <MessageBox message={message} setMessage={setMessage} />

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instances
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.taskName}</div>
                  <div className="text-sm text-gray-500">ID: {task.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    task.type === 'number' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {task.type === 'number' ? 'Number' : 'Yes/No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.instances?.length || 0} instances
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openRenameModal(task)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => openDeleteModal(task)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRenameModal && renameModalData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRenameModal(false);
              setRenameModalData(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowRenameModal(false);
              setRenameModalData(null);
            }
          }}
          tabIndex={-1}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
               onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Rename Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Name: {renameModalData.task.taskName}
                </label>
                <input
                  type="text"
                  value={renameModalData.newName}
                  onChange={(e) => setRenameModalData({
                    ...renameModalData,
                    newName: e.target.value
                  })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new task name"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameModalData(null);
                    setRenameLoading(false);
                  }}
                  disabled={renameLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameTask}
                  disabled={renameLoading}
                  className={`flex-1 px-4 py-2 text-white rounded ${
                    renameLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {renameLoading ? 'Renaming...' : 'Rename'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <YesNoModal
        open={showDeleteModal}
        message={`Are you sure you want to delete "${taskToDelete?.taskName}"? This action cannot be undone and will delete all associated task instances and data.`}
        onYes={handleDeleteTask}
        onNo={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        yesLabel="Delete"
        color="red"
      />
    </div>
  );
};

export default TaskManagement;