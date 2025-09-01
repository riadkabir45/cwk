import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

const ChatList: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  useEffect(() => {
    api.get('/users')
      .then(res => {
        setUsers(res.data.filter((u: User) => u.email !== user?.email));
      })
      .catch(() => setMessage({ text: 'Failed to load users.', type: 'error' }));
  }, [user]);

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  };

  const handleStartChat = (otherUser: User) => {
    setMessage({ text: `Started chat with ${otherUser.firstName} ${otherUser.lastName}`, type: 'success' });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Start a Chat</h2>
      <MessageBox message={message} />
      <input
        type="text"
        placeholder="Search users..."
        className="w-full border rounded px-3 py-2 mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid gap-4">
        {filteredUsers.map(u => (
          <Tile key={u.id}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {u.profilePicture ? (
                  <img
                    src={u.profilePicture}
                    alt={`${u.firstName} ${u.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {getInitials(u.firstName, u.lastName)}
                  </div>
                )}
                <div>
                  <span className="font-medium text-lg">{u.firstName} {u.lastName}</span>
                  <span className="block text-xs text-gray-500">{u.email}</span>
                </div>
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => handleStartChat(u)}
              >
                Connect
              </button>
            </div>
          </Tile>
        ))}
        {filteredUsers.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;