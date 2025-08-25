import React, { useEffect, useState } from 'react';
import MessageBox, { type MessageState } from '../components/MessageBox';
import Tile from '../components/Tile';
import { useAuth } from '../context/AuthContext';

type Task = {
  id: string;
  taskName: string;
  type: 'number' | 'yesno';
};

const INTERVAL_UNITS = [
  { value: 'DAYS', label: 'Days' },
  { value: 'HOURS', label: 'Hours' },
  { value: 'MONTHS', label: 'Months' },
  { value: 'YEARS', label: 'Years' },
];

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState('days');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const { user } = useAuth();

  const getUserId = () => {
    if (user?.id) {
      return `${user.id}`;
    }
    return user?.email || 'user69';
  };

  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URI + '/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data || []);
      })
      .catch(() => setMessage({ text: 'Failed to load tasks.', type: 'error' }));
  }, []);

  const filteredTasks = tasks.filter(task =>
    search === "" ? true : task.taskName.toLowerCase().includes(search.toLowerCase())
  );

  const handleTileClick = (task: Task) => {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(task.id);
      setIntervalValue(1);
      setIntervalUnit('days');
      setMessage({ text: '', type: null });
    }
  };

  const handleInstanceSubmit = async (e: React.FormEvent, task: Task) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URI}/task-instances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "task": { "id" : task.id },
            "taskInterval": intervalValue,
            "taskIntervalType": intervalUnit.toUpperCase(),
            "userId": getUserId()
          }),
        }
      );
      if (response.ok) {
        setMessage({ text: 'Instance created successfully!', type: 'success' });
        setExpandedTaskId(null);
      } else {
        setMessage({ text: 'Failed to create instance.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error creating instance.', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">All Tasks</h2>
      <MessageBox message={message} />
      <input
        type="text"
        placeholder="Search tasks..."
        className="w-full border rounded px-3 py-2 mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <Tile
            key={task.id}
            className={`transition-colors cursor-pointer ${expandedTaskId === task.id ? 'ring-2 ring-slate-400 bg-slate-50' : 'hover:bg-indigo-50'}`}
            onClick={() => handleTileClick(task)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">{task.taskName}</span>
              <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">
                {task.type === 'number' ? 'Number' : 'Yes / No'}
              </span>
            </div>
            {expandedTaskId === task.id && (
              <form
                onClick={e => e.stopPropagation()}
                onSubmit={e => handleInstanceSubmit(e, task)}
                className="bg-gray-50 border-t border-gray-200 px-4 pb-4 pt-2 rounded-b space-y-4 animate-fade-in mt-4"
              >
                <div>
                  <label className="block font-medium mb-1">Interval Value</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border rounded px-3 py-2"
                    value={intervalValue}
                    onChange={e => setIntervalValue(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Interval Unit</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={intervalUnit}
                    onChange={e => setIntervalUnit(e.target.value)}
                  >
                    {INTERVAL_UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Create Instance
                </button>
              </form>
            )}
          </Tile>
        ))}
        {filteredTasks.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No tasks found.</div>
        )}
      </div>
    </div>
  );
};

export default TaskList;