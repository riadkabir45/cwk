import React, { useState } from 'react';

const TASK_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / No' },
];

const INTERVAL_UNITS = [
  { value: 'hour', label: 'Hour(s)' },
  { value: 'day', label: 'Day(s)' },
  { value: 'week', label: 'Week(s)' },
  { value: 'month', label: 'Month(s)' },
  { value: 'year', label: 'Year(s)' },
];

const CreateTask: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('number');
  const [interval, setInterval] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState('day');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    alert(
      `Task Created:\nName: ${taskName}\nType: ${TASK_TYPES.find(t => t.value === taskType)?.label}\nInterval: Every ${interval} ${INTERVAL_UNITS.find(u => u.value === intervalUnit)?.label}`
    );
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh] flex flex-col justify-center">
      <h2 className="text-xl font-bold mb-4">Create Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Task Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Task Type</label>
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
        <div>
          <label className="block font-medium mb-1">Check Interval</label>
          <div className="flex space-x-2">
            <input
              type="number"
              className="border rounded px-3 py-2 w-24"
              value={interval}
              min={1}
              onChange={e => setInterval(Number(e.target.value))}
              required
            />
            <select
              className="border rounded px-3 py-2"
              value={intervalUnit}
              onChange={e => setIntervalUnit(e.target.value)}
            >
              {INTERVAL_UNITS.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTask;