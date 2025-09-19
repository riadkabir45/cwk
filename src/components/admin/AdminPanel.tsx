import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Tile from '../Tile';
import MessageBox, { type MessageState } from '../MessageBox';
import YesNoModal from '../YesNoModal';
import TaskManagement from './TaskManagement';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  primaryRole: string;
  roles: string[];
  mentorshipEligible?: boolean;
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  MODERATOR: 'bg-yellow-100 text-yellow-800',
  MENTOR: 'bg-blue-100 text-blue-800',
  REGISTERED: 'bg-green-100 text-green-800',
  DEFAULT: 'bg-gray-100 text-gray-800',
};

const badgeColors: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700',
  MODERATOR: 'bg-yellow-50 text-yellow-700',
  MENTOR: 'bg-blue-50 text-blue-700',
  REGISTERED: 'bg-green-50 text-green-700',
  DEFAULT: 'bg-gray-50 text-gray-700',
};

type ModalAction =
  | { type: 'promoteMentor'; user: User }
  | { type: 'demoteMentor'; user: User }
  | { type: 'assignModerator'; user: User }
  | { type: 'removeModerator'; user: User }
  | null;

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [search, setSearch] = useState('');
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalYes = async () => {
    if (!modalAction) return;
    const { user } = modalAction;
    try {
      let response;
      switch (modalAction.type) {
        case 'promoteMentor':
          response = await api.post('/api/admin/promote-mentor', { userId: user.id });
          setMessage({ text: response.data.message, type: 'success' });
          break;
        case 'demoteMentor':
          response = await api.post('/api/admin/demote-mentor', { userId: user.id });
          setMessage({ text: response.data.message, type: 'success' });
          break;
        case 'assignModerator':
          response = await api.post('/api/admin/assign-moderator', { userId: user.id });
          setMessage({ text: response.data.message, type: 'success' });
          break;
        case 'removeModerator':
          response = await api.delete('/api/admin/remove-moderator', { userId: user.id });
          setMessage({ text: response.data.message, type: 'success' });
          break;
      }
      fetchUsers();
    } catch (err: any) {
      setMessage({
        text:
          err.response?.data?.error ||
          'Failed to perform action',
        type: 'error',
      });
    } finally {
      setModalAction(null);
    }
  };

  // Filter users by email, firstName, or lastName
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(search.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-10 text-center text-indigo-600 text-xl">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg min-h-[60vh] mb-[20vh]">
      <h1 className="text-3xl font-extrabold mb-8 text-indigo-700 flex items-center gap-2">
        <span role="img" aria-label="admin" className="text-3xl">🛡️</span>
        Admin Panel
      </h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Task Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <div>
          <MessageBox message={message} setMessage={setMessage} />
          <input
            type="text"
            placeholder="Search users by email or name..."
            className="w-full mb-6 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Tile key={user.id} className="flex flex-col md:flex-row justify-between items-center bg-slate-50 border border-slate-200 shadow-sm px-6 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg text-indigo-800">{user.email}</span>
              <span className="text-sm text-gray-700">
                {user.firstName || user.lastName ? 
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                  <span className="italic text-gray-400">N/A</span>
                }
              </span>
              <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm mt-1 ${roleColors[user.primaryRole] || roleColors.DEFAULT}`}>
                {user.primaryRole}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.map((role, index) => (
                  <span key={index} className={`px-2 py-0.5 rounded text-xs font-semibold shadow-sm ${badgeColors[role] || badgeColors.DEFAULT}`}>
                    {role}
                  </span>
                ))}
              </div>
              <span className="mt-1 text-xs">
                Mentor Eligible: {user.mentorshipEligible ? (
                  <span className="text-green-600 font-bold">✅</span>
                ) : (
                  <span className="text-gray-400 font-bold">❌</span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4 md:mt-0">
              {!user.roles.includes('MENTOR') && (
                <button
                  onClick={() => setModalAction({ type: 'promoteMentor', user })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-semibold shadow"
                >
                  Promote to Mentor
                </button>
              )}
              {user.roles.includes('MENTOR') && (
                <button
                  onClick={() => setModalAction({ type: 'demoteMentor', user })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-semibold shadow"
                >
                  Demote from Mentor
                </button>
              )}
              {!user.roles.includes('MODERATOR') && user.primaryRole !== 'ADMIN' && (
                <button
                  onClick={() => setModalAction({ type: 'assignModerator', user })}
                  className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 font-semibold shadow"
                >
                  Make Moderator
                </button>
              )}
              {user.roles.includes('MODERATOR') && user.primaryRole !== 'ADMIN' && (
                <button
                  onClick={() => setModalAction({ type: 'removeModerator', user })}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 font-semibold shadow"
                >
                  Remove Moderator
                </button>
              )}
            </div>
          </Tile>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-lg">
            No users found
          </div>
        )}
          </div>
          <YesNoModal
            open={!!modalAction}
            message={
              modalAction
                ? (() => {
                    switch (modalAction.type) {
                      case 'promoteMentor':
                        return `Are you sure you want to promote ${modalAction.user.email} to Mentor?`;
                      case 'demoteMentor':
                        return `Are you sure you want to demote ${modalAction.user.email} from Mentor?`;
                      case 'assignModerator':
                        return `Are you sure you want to make ${modalAction.user.email} a Moderator?`;
                      case 'removeModerator':
                        return `Are you sure you want to remove Moderator role from ${modalAction.user.email}?`;
                      default:
                        return '';
                    }
                  })()
                : ''
            }
            onYes={handleModalYes}
            onNo={() => setModalAction(null)}
            color={
              modalAction?.type === 'removeModerator'
                ? 'red'
                : modalAction?.type === 'assignModerator'
                ? 'yellow'
                : 'indigo'
            }
          />
        </div>
      ) : (
        <TaskManagement />
      )}
    </div>
  );
};

export default AdminPanel;
