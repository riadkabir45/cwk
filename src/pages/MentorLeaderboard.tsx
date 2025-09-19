import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface MentorLeaderboard {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  hasPublicProfile: boolean;
  totalRatings: number;
  averageRating: number;
  aggregateRating: number;
  positiveRatings: number;
  negativeRatings: number;
  taskIds: string[];
  taskNames: string[];
  connectionStatus: string; // "none", "pending_sent", "pending_received", "connected", "self"
}

interface Task {
  id: string;
  taskName: string;
}

const MentorLeaderboard: React.FC = () => {
  const [mentors, setMentors] = useState<MentorLeaderboard[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingToMentor, setConnectingToMentor] = useState<string | null>(null);

  const fetchMentorLeaderboard = async (taskFilter?: string) => {
    try {
      setLoading(true);
      const params = taskFilter ? `?taskFilter=${taskFilter}` : '';
      const response = await api.get(`/users/mentors/leaderboard${params}`);
      setMentors(response.data);
    } catch (err) {
      console.error('Error fetching mentor leaderboard:', err);
      setError('Failed to load mentor leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setAllTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchMentorLeaderboard();
    fetchTasks();
  }, []);

  const handleTaskFilterChange = (taskId: string) => {
    setSelectedTask(taskId);
    fetchMentorLeaderboard(taskId || undefined);
  };

  const sendConnectionRequest = async (mentorEmail: string, mentorId: string) => {
    try {
      setConnectingToMentor(mentorId);
      const response = await api.get(`/connections/${mentorEmail}`);
      console.log(response.data);
      
      // Update the mentor's connection status in the local state
      setMentors(prevMentors => 
        prevMentors.map(mentor => 
          mentor.id === mentorId 
            ? { ...mentor, connectionStatus: 'pending_sent' }
            : mentor
        )
      );
      
      // Show success message (you can replace this with a toast notification)
      alert('Connection request sent successfully!');
    } catch (err: any) {
      console.error('Error sending connection request:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to send connection request';
      alert(`Error: ${errorMessage}`);
    } finally {
      setConnectingToMentor(null);
    }
  };

  const getRatingDisplay = (mentor: MentorLeaderboard) => {
    if (mentor.totalRatings === 0) {
      return <span className="text-gray-500">No ratings</span>;
    }

    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${mentor.aggregateRating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {mentor.aggregateRating >= 0 ? '+' : ''}{mentor.aggregateRating}
          </span>
          <span className="text-sm text-gray-500">
            (avg: {mentor.averageRating.toFixed(1)})
          </span>
        </div>
        <div className="flex gap-1 text-xs">
          {mentor.positiveRatings > 0 && (
            <span className="text-green-600">👍 {mentor.positiveRatings}</span>
          )}
          {mentor.negativeRatings > 0 && (
            <span className="text-red-600">👎 {mentor.negativeRatings}</span>
          )}
        </div>
      </div>
    );
  };

  const getConnectionButton = (mentor: MentorLeaderboard) => {
    const isConnecting = connectingToMentor === mentor.id;
    
    switch (mentor.connectionStatus) {
      case 'self':
        return null; // Don't show button for self
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Connected
          </span>
        );
      case 'pending_sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'pending_received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Accept Request
          </span>
        );
      case 'none':
      default:
        return (
          <button
            onClick={() => sendConnectionRequest(mentor.email, mentor.id)}
            disabled={isConnecting}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
              isConnecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading mentor leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-6 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Leaderboard</h1>
        <p className="text-gray-600">Find the best mentors based on community ratings</p>
      </div>

      {/* Task Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label htmlFor="taskFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Task:
        </label>
        <select
          id="taskFilter"
          value={selectedTask}
          onChange={(e) => handleTaskFilterChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Tasks</option>
          {allTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.taskName}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mentors.map((mentor, index) => (
                <tr key={mentor.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index + 1 <= 3 && (
                        <span className="text-2xl mr-2">
                          {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {mentor.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={mentor.profilePicture}
                            alt={`${mentor.firstName} ${mentor.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {mentor.firstName?.[0]?.toUpperCase() || mentor.email[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {mentor.firstName && mentor.lastName 
                            ? `${mentor.firstName} ${mentor.lastName}`
                            : mentor.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getRatingDisplay(mentor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {mentor.totalRatings}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.taskNames.slice(0, 3).map((taskName, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {taskName}
                        </span>
                      ))}
                      {mentor.taskNames.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{mentor.taskNames.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getConnectionButton(mentor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mentors.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🏆</div>
            <div className="text-lg">No mentors found</div>
            <div className="text-sm">Try adjusting your filters or check back later</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorLeaderboard;