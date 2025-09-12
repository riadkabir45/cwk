import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface TaskRanking {
  id: string;
  task: string;
  taskId: string;
  taskInterval: number;
  taskIntervalType: string;
  email: string;
  taskUpdates: (string | boolean)[];
  taskStreak: number;
  lastUpdated: string;
  rank: number;
  numerical: boolean;
}

const UserRankings: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRanking[]>([]);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/task-instances/userRankings')
      .then(res => setTasks(res.data || []))
      .catch(() => setMessage({ text: 'Failed to load user rankings.', type: 'error' }));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Your Task Rankings</h2>
      <MessageBox message={message} setMessage={setMessage} />
      <div className="overflow-y-auto max-h-[60vh] grid gap-4">
        {tasks.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No rankings found.</div>
        )}
        {tasks.map(task => (
          <Tile key={task.id} className="flex items-center justify-between bg-slate-50 border border-slate-200">
            <div>
              <div className="font-semibold text-lg flex items-center gap-2">
                <span>{task.task}</span>
                {task.numerical ? (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Numerical</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Yes/No</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Interval: {task.taskInterval} {task.taskIntervalType}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Last updated: {task.lastUpdated ? new Date(task.lastUpdated).toLocaleString() : 'Never'}
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <span className={`flex items-center justify-center rounded-full font-bold text-lg
                  ${task.taskStreak > 0
                    ? 'bg-orange-400 text-white shadow-lg animate-pulse'
                    : 'bg-gray-300 text-gray-500'
                  }`}
                  style={{ width: '3.5rem', height: '3.5rem' }}
                  title={task.taskStreak > 0 ? 'Streak!' : 'No streak'}
                >
                  {task.taskStreak > 0 ? (
                    <span role="img" aria-label="fire" className="mr-1 text-2xl">🔥</span>
                  ) : (
                    <span className="mr-1 text-2xl">🟤</span>
                  )}
                  {task.taskStreak}
                </span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">
                  Rank: #{task.rank}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-semibold"
                onClick={() => navigate(`/leaderboard/${task.taskId}`)}
              >
                View Leaderboard
              </button>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default UserRankings;