//import React, { useState } from 'react';
import Tile from '../components/Tile';

interface Task {
  id: string;
  task: string;
  taskInterval: number;
  taskIntervalType: string;
  userId: string;
  taskUpdates: Set<string>;
  taskStreak: number;
}

const dummyTasks: Task[] = [
  {
    id: '1',
    task: 'Daily Standup',
    taskInterval: 1,
    taskIntervalType: 'DAYS',
    userId: 'user1',
    taskUpdates: new Set(['u1', 'u2']),
    taskStreak: 12,
  },
  {
    id: '2',
    task: 'Code Review',
    taskInterval: 2,
    taskIntervalType: 'DAYS',
    userId: 'user2',
    taskUpdates: new Set(['u3']),
    taskStreak: 10,
  },
  {
    id: '3',
    task: 'Documentation',
    taskInterval: 1,
    taskIntervalType: 'WEEKS',
    userId: 'user3',
    taskUpdates: new Set(['u4', 'u5']),
    taskStreak: 8,
  },
  {
    id: '4',
    task: 'Testing',
    taskInterval: 3,
    taskIntervalType: 'DAYS',
    userId: 'user4',
    taskUpdates: new Set(['u6']),
    taskStreak: 7,
  },
  {
    id: '5',
    task: 'Deployment',
    taskInterval: 1,
    taskIntervalType: 'MONTHS',
    userId: 'user5',
    taskUpdates: new Set(['u7']),
    taskStreak: 6,
  },
  {
    id: '6',
    task: 'Design',
    taskInterval: 2,
    taskIntervalType: 'WEEKS',
    userId: 'user6',
    taskUpdates: new Set(['u8']),
    taskStreak: 5,
  },
  {
    id: '7',
    task: 'Planning',
    taskInterval: 1,
    taskIntervalType: 'DAYS',
    userId: 'user7',
    taskUpdates: new Set(['u9']),
    taskStreak: 4,
  },
  {
    id: '8',
    task: 'Retrospective',
    taskInterval: 1,
    taskIntervalType: 'WEEKS',
    userId: 'user8',
    taskUpdates: new Set(['u10']),
    taskStreak: 3,
  },
  {
    id: '9',
    task: 'Pair Programming',
    taskInterval: 2,
    taskIntervalType: 'DAYS',
    userId: 'user9',
    taskUpdates: new Set(['u11']),
    taskStreak: 2,
  },
  {
    id: '10',
    task: 'Bug Fixing',
    taskInterval: 1,
    taskIntervalType: 'DAYS',
    userId: 'user10',
    taskUpdates: new Set(['u12']),
    taskStreak: 1,
  },
];

const sortedTasks = [...dummyTasks].sort((a, b) => b.taskStreak - a.taskStreak);

const LeaderBoard: React.FC = () => {

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <div className="overflow-y-auto max-h-[60vh] grid gap-4">
        {sortedTasks.map((task, idx) => (
          <Tile key={task.id} className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{task.task}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({task.taskInterval} {task.taskIntervalType})
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`flex items-center justify-center rounded-full font-bold text-lg
                ${task.taskStreak > 0
                  ? 'bg-orange-400 text-white shadow-lg animate-pulse'
                  : 'bg-gray-300 text-gray-500'
                }`}
                style={{ width: '2.5rem', height: '2.5rem' }}
                title={task.taskStreak > 0 ? 'Streak!' : 'No streak'}
              >
                {task.taskStreak > 0 ? (
                  <span role="img" aria-label="fire" className="mr-1 text-2xl">🔥</span>
                ) : (
                  <span className="mr-1 text-2xl">🟤</span>
                )}
                {task.taskStreak}
              </span>
              <span className="text-xl font-bold text-indigo-700">#{idx + 1}</span>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoard;