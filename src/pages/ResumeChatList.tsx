import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Chat {
    "id": string,
    "sender": {
        "id": string,
        "email": string,
        "firstName": string,
        "lastName": string,
        "profilePicture": null
    },
    "receiver": {
        "id": string,
        "email": string,
        "firstName": string,
        "lastName": string,
        "profilePicture": null
    },
    "accepted": boolean,
    "upDateTime": string
}

interface Connection {
  id: string,
  email: string
  firstName: string,
  lastName: string,
  updatedAt: string
}

const ResumeChatList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  useEffect(() => {
    api.get("/connections/accepted")
      .then(res => setChats(res.data || []))
      .catch(() => setMessage({ text: 'Failed to load chats.', type: 'error' }));
  }, );

  useEffect(() => {
    // map chats to connections, if sender email is not current user, get sender id, else receiver id
    const mappedConnections = chats.map(chat => ({
      id: chat.id,
      email: chat.receiver.email !== user?.email ? chat.receiver.email : chat.sender.email,
      firstName: chat.receiver.email !== user?.email ? chat.receiver.firstName : chat.sender.firstName,
      lastName: chat.receiver.email !== user?.email ? chat.receiver.lastName : chat.sender.lastName,
      updatedAt: chat.upDateTime
    }));
    setConnections(mappedConnections);
  },[chats])

  const filteredConnections = connections.filter(chat =>
    chat.firstName.toLowerCase().includes(search.toLowerCase()) ||
    chat.lastName.toLowerCase().includes(search.toLowerCase()) ||
    chat.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleResumeChat = (chat: Connection) => {
    // Implement resume chat logic here (e.g., redirect or open chat)
    setMessage({ text: `Resumed chat with ${chat.firstName} ${chat.lastName}`, type: 'success' });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Resume a Chat</h2>
      <MessageBox message={message} setMessage={setMessage} />
      <input
        type="text"
        placeholder="Search chats..."
        className="w-full border rounded px-3 py-2 mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid gap-4">
        {filteredConnections.map(chat => (
          <Tile key={chat.id}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-lg">{chat.firstName} {chat.lastName}</span>
                <span className="block text-xs text-gray-500">{chat.email}</span>
                <span className="block text-xs text-gray-400 italic mt-1">
                  Last message: {chat.updatedAt}
                </span>
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => handleResumeChat(chat)}
              >
                Open
              </button>
            </div>
          </Tile>
        ))}
        {filteredConnections.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No connections found.</div>
        )}
      </div>
    </div>
  )
};

export default ResumeChatList;