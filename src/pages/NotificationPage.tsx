import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import MessageBox, { type MessageState } from '../components/MessageBox';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Notification {
  id: string;
  title: string;
  message?: string | null;
  read: boolean;
  timestamp: string;
}

const NotificationPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });

  const loadNotifications = () => {
    if (user) {
      api.get(`/notifications?userId=${user.id}`)
        .then(res => setNotifications(res.data || []))
        .catch(() => setMessage({ text: 'Failed to load notifications.', type: 'error' }));
    }

  }

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    api.get(`/notifications/${id}`)
      .then(() => {
        setNotifications(notifications =>
          notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        );
      })
      .catch(() => setMessage({ text: 'Failed to mark as read.', type: 'error' }));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow min-h-[60vh] mb-[20vh]">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <MessageBox message={message} setMessage={setMessage} />
      <div className="grid gap-4">
        {notifications.length === 0 && (
          <div className="py-3 text-gray-400 text-center">No notifications found.</div>
        )}
        {notifications.map(n => (
          <Tile key={n.id} className={n.read ? 'opacity-60' : ''}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{n.title}</div>
                {n.message && (
                  <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(n.timestamp).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-xs"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;