import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { useAuth } from '../context/AuthContext';

interface Chat {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
}

const ResumeChatList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  useEffect(() => {
    // Fetch all chats for current user
    fetch(import.meta.env.VITE_SERVER_URI + `/chats/user/${user?.id}`)
      .then(res => res.json())
      .then(data => setChats(data || []))
      .catch(() => setMessage({ text: 'Failed to load chats.', type: 'error' }));
  }, [user]);

  const filteredChats = chats.filter(chat =>
    chat.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
    chat.otherUser.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleResumeChat = (chat: Chat) => {
    // Implement resume chat logic here (e.g., redirect or open chat)
    setMessage({ text: `Resumed chat with ${chat.otherUser.name}`, type: 'success' });
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
        {filteredChats.map(chat => (
          <Tile key={chat.id}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-lg">{chat.otherUser.name}</span>
                <span className="block text-xs text-gray-500">{chat.otherUser.email}</span>
                <span className="block text-xs text-gray-400 italic mt-1">
                  Last message: {chat.lastMessage}
                </span>
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => handleResumeChat(chat)}
              >
                Resume Chat
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

export default ResumeChatList;