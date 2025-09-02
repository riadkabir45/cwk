import React, { useEffect, useRef, useState } from 'react';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

interface Message {
  id: string;
  connectionsId: string;
  senderEmail: string;
  content: string;
  seen: boolean;
  createdAt: string;
}


const ChatPage: React.FC = () => {

  const { id } = useParams();

  const chatId = id;


  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const otherUser = user;

  // Fetch messages initially and then every 1s
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = () => {
      api.get(`/messages/${chatId}`)
        .then(res => {
          if (isMounted) setMessages(res.data || []);
        })
        .catch(() => {
          if (isMounted) setMessage({ text: 'Failed to load messages.', type: 'error' });
        });
    };

    fetchMessages(); // initial fetch
    const interval = setInterval(fetchMessages, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };  
  }, [chatId]);

  useEffect(() => {
    if (autoScroll && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!chatBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    api.post(`/messages`, {
      connectionsId: chatId,
      content: input,
    })
      .then(res => {
        setMessages(prev => [...prev, res.data]);
        setInput('');
      })
      .catch(err => {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to send message.';
        setMessage({ text: msg, type: 'error' });
      });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh] flex flex-col">
      <h2 className="text-xl font-bold mb-4">
        Chat with {otherUser?.firstName} {otherUser?.lastName}
      </h2>
      <MessageBox message={message} setMessage={setMessage} />
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto mb-4 bg-slate-50 rounded p-4"
        style={{ maxHeight: '50vh' }}
        onScroll={handleScroll}
      >
        {messages.length === 0 && (
          <div className="text-gray-400 text-center">No messages yet.</div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 flex ${msg.senderEmail === user?.email ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-4 py-2 rounded-lg text-sm
              ${msg.senderEmail === user?.email
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-[10px] text-gray-400 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;