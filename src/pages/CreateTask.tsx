import React, { useState } from 'react';

const TASK_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / No' },
];

const INTERVAL_UNITS = [
  { value: 'hour', label: 'Hours' },
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
  { value: 'year', label: 'Years' },
];

const CreateTask: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('number');
  const [interval, setInterval] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState('day');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      taskName: taskName,
      taskIntervalType: INTERVAL_UNITS.find(u => u.value === intervalUnit)?.label.toUpperCase(),
      isNumericalTask: taskType === 'number',
      taskInterval: interval,
    };

    try {
      const response = await fetch(import.meta.env.VITE_SERVER_URI + '/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Task created successfully!');
      } else {
        alert('Failed to create task.');
      }
    } catch (error) {
      alert('Error creating task.');
    }
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