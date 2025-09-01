import React, { useEffect } from 'react';

export type MessageState = {
  text: string;
  type: 'success' | 'error' | 'warn' | null;
};

const MessageBox: React.FC<{ message: MessageState; setMessage: React.Dispatch<React.SetStateAction<MessageState>> }> = ({ message, setMessage }) => {
  const timeout = 3;

  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: null });
      }, timeout * 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      className={`
      mb-4 px-4 py-2 rounded text-sm transition-all duration-300
      ${!message.type ? 'opacity-0 h-0' : ''}
      ${message.type === 'success' ? 'bg-green-100 text-green-700 opacity-100' : ''}
      ${message.type === 'error' ? 'bg-red-100 text-red-700 opacity-100' : ''}
      ${message.type === 'warn' ? 'bg-yellow-100 text-yellow-700 opacity-100' : ''}
    `}
      aria-live="polite"
    >
      {message.text}
    </div>
  );
};

export default MessageBox;