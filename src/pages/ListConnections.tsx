import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Connection {
  id: string;
  sender: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  receiver: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  accepted: boolean;
  upDateTime: string;
}


const ListConnections: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Connection[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [acceptedChats, setAcceptedChats] = useState<Connection[]>([]);

  useEffect(() => {
    api.get('/connections')
      .then(res => setChats(res.data || []))
      .catch(() => setMessage({ text: 'Failed to load connections.', type: 'error' }));
  }, [user]);

  const filteredChats = chats.filter(chat =>
    chat.accepted == false &&
    (
      chat.receiver.firstName.toLowerCase().includes(search.toLowerCase()) ||
      chat.receiver.lastName.toLowerCase().includes(search.toLowerCase()) ||
      chat.receiver.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleResumeChat = (chat: Connection) => {
    api.post('/connections', { id: chat.id })
      .then(() => {
        setMessage({ text: `Accepted connection with ${chat.receiver.firstName}`, type: 'success' });
        setAcceptedChats(prev => [...prev, chat]);
      })
      .catch(() => setMessage({ text: 'Failed to accept connection.', type: 'error' }));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Pending Connections</h2>
      <MessageBox message={message} setMessage={setMessage} />
      <input
        type="text"
        placeholder="Search chats..."
        className="w-full border rounded px-3 py-2 mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid gap-4">
        {filteredChats.filter(chat => !acceptedChats.some(ac => ac.id === chat.id)).map(chat => (
          <Tile key={chat.id}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-lg">{chat.sender.email}</span>
                <span className="block text-xs text-gray-500">{chat.sender.email}</span>
                <span className="block text-xs text-gray-400 italic mt-1">
                  Last message: {chat.upDateTime}
                </span>
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => handleResumeChat(chat)}
              >
                Accept
              </button>
            </div>
          </Tile>
        ))}
        {filteredChats.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No chats found.</div>
        )}
      </div>
    </div>
  )
};

export default ListConnections;