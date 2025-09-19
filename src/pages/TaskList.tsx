import React, { useEffect, useState } from 'react';
import MessageBox, { type MessageState } from '../components/MessageBox';
import Tile from '../components/Tile';
import TaskTagList from '../components/TaskTagList';
import { api } from '../lib/api';

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


  useEffect(() => {
    api.get('/api/tasks')
      .then(res => setTasks(res.data || []))
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

  const handleJoinCommunity = async (e: React.FormEvent, task: Task) => {
    e.preventDefault();
    
    api.post('/task-instances',{
      task: task.id,
      isNumerical: task.type === 'number',
      taskInterval: intervalValue,
      taskIntervalType: intervalUnit.toUpperCase(),
    })
    .then(() => {
      setMessage({ text: 'Successfully joined the community!', type: 'success' });
    })
    .catch(() => {
      setMessage({ text: 'Failed to join community.', type: 'error' });
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-2">Available Communities</h2>
      <p className="text-gray-600 text-sm mb-4">Join communities to track your progress and connect with others who share similar goals.</p>
      <MessageBox message={message} setMessage={setMessage} />
      <input
        type="text"
        placeholder="Search communities..."
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">{task.taskName}</span>
                <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">
                  {task.type === 'number' ? 'Number' : 'Yes / No'}
                </span>
              </div>
              
              {/* Compact Tag Display for collapsed view */}
              {expandedTaskId !== task.id && (
                <div onClick={e => e.stopPropagation()}>
                  <TaskTagList taskId={task.id} canSuggestTags={false} compact={true} />
                </div>
              )}
            </div>
            {expandedTaskId === task.id && (
              <div 
                onClick={e => e.stopPropagation()}
                className="bg-gray-50 border-t border-gray-200 px-4 pb-4 pt-2 rounded-b space-y-4 animate-fade-in mt-4"
              >
                {/* Task Tags Section */}
                <div className="bg-white rounded-lg p-4 border">
                  <TaskTagList taskId={task.id} canSuggestTags={true} />
                </div>

                {/* Join Community Form */}
                <form
                  onSubmit={e => handleJoinCommunity(e, task)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block font-medium mb-1">How often do you want to check in?</label>
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
                    <label className="block font-medium mb-1">Time period</label>
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
                    Join Community
                  </button>
                </form>
              </div>
            )}
          </Tile>
        ))}
        {filteredTasks.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No communities found.</div>
        )}
      </div>
    </div>
  );
};

export default TaskList;