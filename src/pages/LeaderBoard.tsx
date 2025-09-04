//import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Tile from '../components/Tile';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { MessageState } from '../components/MessageBox';
import MessageBox from '../components/MessageBox';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: string;
  task: string;
  taskInterval: number;
  taskIntervalType: string;
  email: string;
  taskUpdates: Set<string>;
  taskStreak: number;
}

const LeaderBoard: React.FC = () => {
  const { instanceId } = useParams();
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userData, setUserData] = useState<Task>({ id: '', task: '', taskInterval: 0, taskIntervalType: '', email: '', taskUpdates: new Set(), taskStreak: 0 });
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    api.get(`/task-instances/taskBoard/${instanceId}`)
      .then(res => {
        setTasks(res.data);
        res.data.forEach((task: Task, index: number) => {
          if (task.email === user?.email) {
            setUserData(task);
            setUserRank(index + 1);
          }
        });
      })
      .catch(() => {
        setMessage({ text: 'Failed to load leaderboard data.', type: 'error' });
      });
  }, [instanceId, user?.email]);

  const handleSendConnection = (email: string) => {
    api.get(`/connections/${email}`)
      .then((res) => {
        if (res.status === 200 && typeof res.data === 'string' && res.data.startsWith('Warn: ')) {
          setMessage({ text: res.data.slice(6), type: 'warn' });
        } else {
          setMessage({ text: `Connection request sent to ${email}`, type: 'success' });
        }
      })
      .catch(err => {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to send connection request.';
        setMessage({ text: msg, type: 'error' });
      });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg min-h-[60vh] mb-[20vh]">
      <h2 className="text-2xl font-extrabold mb-6 text-indigo-700 flex items-center gap-2">
        <span role="img" aria-label="trophy" className="text-3xl">🏆</span>
        Leaderboard
      </h2>
      <MessageBox message={message} setMessage={setMessage} />
      <div className="overflow-y-auto max-h-[60vh] grid gap-4">
        {tasks.map((task, idx) => (
          <Tile key={task.id} className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg text-indigo-800">{task.email}</span>
              <span className="text-xs text-gray-500">
                {task.task} &middot; {task.taskInterval} {task.taskIntervalType}
              </span>
              <span className="text-xs text-gray-400">
                Rank: <span className="font-bold text-indigo-600">#{idx + 1}</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
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
              {task.email !== user?.email && (
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-xs font-semibold shadow"
                  onClick={() => handleSendConnection(task.email)}
                >
                  Send Connection
                </button>
              )}
            </div>
          </Tile>
        ))}
      </div>
      <h2 className='text-xl font-bold mt-16 mb-2 text-indigo-700 flex items-center gap-2'>
        <span role="img" aria-label="user" className="text-2xl">🙋‍♂️</span>
        Your Ranking
      </h2>
      <Tile className="flex items-center justify-between mt-4 bg-indigo-50 border border-indigo-200 shadow">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-lg text-indigo-800">{userData.email}</span>
          <span className="text-xs text-gray-500">
            {userData.task} &middot; {userData.taskInterval} {userData.taskIntervalType}
          </span>
          <span className="text-xs text-gray-400">
            Rank: <span className="font-bold text-indigo-600">#{userRank}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`flex items-center justify-center rounded-full font-bold text-lg
            ${userData.taskStreak > 0
              ? 'bg-orange-400 text-white shadow-lg animate-pulse'
              : 'bg-gray-300 text-gray-500'
            }`}
            style={{ width: '4rem', height: '4rem' }}
            title={userData?.taskStreak > 0 ? 'Streak!' : 'No streak'}
          >
            {userData?.taskStreak > 0 ? (
              <span role="img" aria-label="fire" className="mr-1 text-2xl">🔥</span>
            ) : (
              <span className="mr-1 text-2xl">🟤</span>
            )}
            {userData?.taskStreak}
          </span>
        </div>
      </Tile>
    </div>
  );
};

export default LeaderBoard;