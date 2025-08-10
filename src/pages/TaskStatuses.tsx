import React from 'react';

interface TaskStatus {
  id: number;
  name: string;
  type: 'number' | 'yesno';
  interval: number;
  intervalUnit: string;
  statuses: (number | boolean)[];
}

const mockTasks: TaskStatus[] = [
  {
    id: 1,
    name: 'Temperature Check',
    type: 'number',
    interval: 1,
    intervalUnit: 'day',
    statuses: [22, 23, 22, 21, 22],
  },
  {
    id: 2,
    name: 'Door Closed',
    type: 'yesno',
    interval: 1,
    intervalUnit: 'hour',
    statuses: [true, true, false, true, true],
  },
];

const TaskStatuses: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-6">Task Statuses</h2>
      <div className="space-y-6">
        {mockTasks.map(task => (
          <div key={task.id} className="bg-slate-100 rounded shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-semibold">{task.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({task.type === 'number' ? 'Number' : 'Yes / No'})
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Every {task.interval} {task.intervalUnit}
                {task.interval > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="font-medium text-sm">Recent Statuses:</span>
              <div className="flex gap-2 mt-2">
                {task.statuses.slice(-5).map((status, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      task.type === 'yesno'
                        ? status
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.type === 'yesno'
                      ? status
                        ? 'Yes'
                        : 'No'
                      : status}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatuses;