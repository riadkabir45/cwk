import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  primaryRole: string;
  roles: string[];
  mentorshipEligible?: boolean;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This endpoint would need to be created on the backend
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const promoteToMentor = async (userId: string) => {
    try {
      const response = await api.post('/api/admin/promote-mentor', { userId });
      alert(response.data.message);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to promote user');
    }
  };

  const assignModerator = async (userId: string) => {
    try {
      const response = await api.post('/api/admin/assign-moderator', { userId });
      alert(response.data.message);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign moderator');
    }
  };

  const removeModerator = async (userId: string) => {
    try {
      const response = await api.delete('/api/admin/remove-moderator', { userId });
      alert(response.data.message);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove moderator');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - User Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">Email</th>
              <th className="px-4 py-2 border text-left">Name</th>
              <th className="px-4 py-2 border text-left">Primary Role</th>
              <th className="px-4 py-2 border text-left">All Roles</th>
              <th className="px-4 py-2 border text-left">Mentor Eligible</th>
              <th className="px-4 py-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">
                  {user.firstName || user.lastName ? 
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                    'N/A'
                  }
                </td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.primaryRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.primaryRole === 'MODERATOR' ? 'bg-yellow-100 text-yellow-800' :
                    user.primaryRole === 'MENTOR' ? 'bg-blue-100 text-blue-800' :
                    user.primaryRole === 'REGISTERED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.primaryRole}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role, index) => (
                      <span key={index} className={`px-1 py-0.5 rounded text-xs ${
                        role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                        role === 'MODERATOR' ? 'bg-yellow-50 text-yellow-700' :
                        role === 'MENTOR' ? 'bg-blue-50 text-blue-700' :
                        role === 'REGISTERED' ? 'bg-green-50 text-green-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 border">
                  {user.mentorshipEligible ? '✅' : '❌'}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col gap-1">
                    {!user.roles.includes('MENTOR') && (
                      <button
                        onClick={() => promoteToMentor(user.id)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Promote to Mentor
                      </button>
                    )}
                    
                    {!user.roles.includes('MODERATOR') && user.primaryRole !== 'ADMIN' && (
                      <button
                        onClick={() => assignModerator(user.id)}
                        className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                      >
                        Make Moderator
                      </button>
                    )}
                    
                    {user.roles.includes('MODERATOR') && user.primaryRole !== 'ADMIN' && (
                      <button
                        onClick={() => removeModerator(user.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Remove Moderator
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
