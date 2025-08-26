import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import { useAuth } from '../context/AuthContext';
import MessageBox, { type MessageState } from '../components/MessageBox';

interface TaskStatus {
  id: string;
  name: string;
  taskType: string;
  interval: number;
  intervalType: string;
  lastUpdated: string | null;
  updates: (number | boolean | string)[];
}

const TaskStatuses: React.FC = () => {
  const { user } = useAuth();
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  const getUserId = () => {
    if (user?.id) {
      return `${user.id}`;
    }
    return user?.email || 'User45';
  };

  // Move fetch logic to a function
  const loadStatuses = () => {
    fetch(import.meta.env.VITE_SERVER_URI + `/task-instances/userId/${getUserId()}`)
      .then(res => res.json()
      )
      .then((data: TaskStatus[]) => {
        data.forEach(task => {
          task.updates = task.updates.map(update => {
            if (task.taskType.toLowerCase() === 'yes/no') {
              return update === "true" ? true : false;
            }
            return update;
          });
        });
        console.log(data);
        
        setTaskStatuses(data || []);
      })
      .catch(() => setMessage({ text: 'Failed to load tasks.', type: 'error' }));
  };

  useEffect(() => {
    loadStatuses();
    // eslint-disable-next-line
  }, []);

  const handleTileClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    setInputValue('');
    setMessage({ text: '', type: null });
  };

  const handleUpdateSubmit = async (e: React.FormEvent, task: TaskStatus) => {
    e.preventDefault();

    // Validation
    if (task.taskType.toLowerCase() === 'yes/no') {
      const val = inputValue.trim().toLowerCase();
      if (val !== 'yes' && val !== 'no') {
        setMessage({ text: 'Please enter "Yes" or "No".', type: 'error' });
        return;
      }
    } else {
      if (isNaN(Number(inputValue))) {
        setMessage({ text: 'Please enter a valid number.', type: 'error' });
        return;
      }
    }

    // POST request
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URI}/task-updates`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "updateDescription":
              task.taskType.toLowerCase() === 'yes/no'
                ? inputValue.trim().toLowerCase() === 'yes'
                : Number(inputValue),
            "taskInstances": { "id": task.id },
          }),
        }
      );
      if (response.ok) {
        setMessage({ text: 'Status updated successfully!', type: 'success' });
        setInputValue('');
        loadStatuses(); // <-- reload data after success
      } else {
        setMessage({ text: 'Failed to update status.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error updating status.', type: 'error' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-6">Task Status</h2>
      <MessageBox message={message} />
      <div className="space-y-6">
        {taskStatuses.length > 0 ? (
          taskStatuses.map(task => (
          <Tile
            key={task.id}
            className="relative"
            onClick={() => handleTileClick(task.id)}
          >
            <div className="flex justify-between items-center mb-2 cursor-pointer">
              <div>
                <span className="font-semibold">{task.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({task.taskType})
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Every {task.interval} {task.intervalType[0].toUpperCase() + task.intervalType.slice(1).toLowerCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-sm">Recent Statuses:</span>
              <div className="flex gap-2 mt-2">
                {task.updates.length > 0 ? task.updates.slice(-5).map((status, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      task.taskType.toLowerCase() === 'yes/no'
                        ? status
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.taskType.toLowerCase() === 'yes/no'
                      ? (status
                        ? 'Yes'
                        : 'No')
                      : status}
                  </span>
                )) : <span className="text-gray-500 italic">No statuses yet</span>}
              </div>
            </div>
            {task.lastUpdated && (
              <div className="flex justify-end mt-4">
                <span className="text-xs text-gray-500 italic">
                  Last updated: {new Date(task.lastUpdated).toLocaleString()}
                </span>
              </div>
            )}
            {expandedTaskId === task.id && (
              <form
                onSubmit={e => handleUpdateSubmit(e, task)}
                className="bg-slate-100 rounded shadow p-4 mt-4 space-y-4"
                onClick={e => e.stopPropagation()} // Prevents Tile onClick from firing when clicking inside the form
              >
                <div>
                  <label className="block font-medium mb-1">
                    {task.taskType.toLowerCase() === 'yes/no'
                      ? 'Update Status (Yes/No)'
                      : 'Update Status (Number)'}
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={task.taskType.toLowerCase() === 'yes/no' ? 'Yes or No' : 'Enter a number'}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Update Status
                </button>
              </form>
            )}
          </Tile>
        )))
        :(<div className='text-center text-gray-500'>No tasks found</div>)
        }
      </div>
    </div>
  );
};

export default TaskStatuses;