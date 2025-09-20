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
  lastModified?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface Connection {
    "id": string,
    "sender": {
        "id": string,
        "email": string,
    },
    "receiver": {
        "id": string,
        "email": string,
    },
    "accepted": boolean,
    "createdAt": string,
    "mentor": boolean,
    "currentRating": number
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
  const [otherUser, setOtherUser] = useState<{ email: string } | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [isMentoring, setIsMentoring] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);

  const refreshRate = 5;
  const seenCheckRate = 2; // Check seen status every 2 seconds
  let isMounted = true;

const fetchMessages = () => {
    if (!chatId) return;
    
    api.get(`/messages/${chatId}`)
      .then(res => {
        if (isMounted) {
          setMessages(res.data);
        }
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        if (isMounted) {
          setMessage({ text: 'Failed to load messages.', type: 'error' });
        }
      });
  };

  const checkSeenStatus = () => {
    if (!chatId) return;
    
    api.get(`/messages/${chatId}/status`)
      .then(res => {
        if (isMounted) {
          setMessages(prev => {
            const newMessages = res.data;
            // Only update if there are actual changes to seen status
            const hasSeenChanges = prev.some((prevMsg, index) => {
              const newMsg = newMessages[index];
              return newMsg && prevMsg.seen !== newMsg.seen;
            });
            
            return hasSeenChanges ? newMessages : prev;
          });
        }
      })
      .catch(err => {
        console.error('Error checking seen status:', err);
      });
  };

  const fetchOtherUser = () => {
    if (!chatId) return;
    
    api.get(`/connections/status/${chatId}`)
      .then(res => {
        const connectionData: Connection = res.data;
        setIsMentoring(connectionData.mentor);
        setCurrentRating(connectionData.currentRating || 0);
        
        const otherUserInfo = connectionData.sender.email === user?.email 
          ? connectionData.receiver 
          : connectionData.sender;
        
        if (isMounted) {
          setOtherUser(otherUserInfo);
        }
      })
      .catch(err => {
        console.error('Error fetching other user info:', err);
      });
  };

  useEffect(() => {
    fetchOtherUser();
  }, [chatId, user]);

  useEffect(() => {
    isMounted = true;

    fetchMessages(); // initial fetch
    const interval = setInterval(fetchMessages, refreshRate * 1000);
    
    // Separate interval for checking seen status more frequently
    const seenInterval = setInterval(checkSeenStatus, seenCheckRate * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(seenInterval);
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
        fetchMessages();
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

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };

  const handleSaveEdit = (messageId: string) => {
    if (!editingContent.trim()) return;
    
    api.put(`/messages/${messageId}`, {
      content: editingContent.trim()
    })
      .then(res => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? res.data : msg
        ));
        setEditingMessageId(null);
        setEditingContent('');
        setMessage({ text: 'Message edited successfully!', type: 'success' });
      })
      .catch(err => {
        console.error('Error editing message:', err);
        setMessage({ text: 'Failed to edit message.', type: 'error' });
      });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    api.delete(`/messages/${messageId}`)
      .then(() => {
        fetchMessages(); // Refresh to get updated message
        setMessage({ text: 'Message deleted successfully!', type: 'success' });
      })
      .catch(err => {
        console.error('Error deleting message:', err);
        setMessage({ text: 'Failed to delete message.', type: 'error' });
      });
  };

  const handleSubmitRating = () => {
    if (rating === 0 || !chatId) return;
    
    api.post(`/connections/rate/${chatId}`, {
      rating: rating,
      comment: ''
    })
      .then(() => {
        const action = currentRating !== 0 ? 'updated' : 'submitted';
        const ratingType = rating < 0 ? 'negative' : 'positive';
        setMessage({ text: `${ratingType.charAt(0).toUpperCase() + ratingType.slice(1)} rating ${action} successfully!`, type: 'success' });
        setShowRating(false);
        setRating(0);
        // Refresh connection data to get updated rating
        fetchOtherUser();
      })
      .catch(err => {
        console.error('Error submitting rating:', err);
        const errorMsg = err.response?.data || 'Failed to submit rating';
        setMessage({ text: errorMsg, type: 'error' });
      });
  };

  const StarRating = () => {
    const negativeRatings = [-2, -1];
    const positiveRatings = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex flex-col gap-3">
        {/* Negative Ratings */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-red-600">Poor:</span>
          <div className="flex gap-1">
            {negativeRatings.map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`text-2xl ${rating === value ? 'text-red-500' : 'text-gray-300'} hover:text-red-500 transition-colors`}
                title={value === -2 ? 'Very Poor' : 'Poor'}
              >
                👎
              </button>
            ))}
          </div>
        </div>
        
        {/* Positive Ratings */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-yellow-600">Good:</span>
          <div className="flex gap-1">
            {positiveRatings.map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating && rating > 0 ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                title={`${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg: Message) => msg.senderEmail === user?.email;

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3">
            {otherUser?.email?.[0]?.toUpperCase() || '?'}
          </div>
          Chat with {otherUser?.email || 'Loading...'}
        </h2>
      </div>

      <MessageBox message={message} setMessage={setMessage} />
      
      {/* Mentor Rating Box */}
      {isMentoring && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Rate this Mentor</h3>
              <p className="text-yellow-700">Share your experience with this mentor</p>
              {currentRating !== 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-yellow-600">Current rating:</span>
                  {currentRating < 0 ? (
                    <div className="flex items-center gap-1">
                      <span className={`text-lg text-red-500`}>
                        👎
                      </span>
                      <span className="text-sm text-red-600">({currentRating})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-yellow-600">({currentRating}/5)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowRating(!showRating)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              {showRating ? 'Cancel' : currentRating !== 0 ? 'Update Rating ⭐' : 'Rate ⭐'}
            </button>
          </div>
          
          {showRating && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">
                  {currentRating !== 0 ? 'Update your rating:' : 'Your rating:'}
                </label>
                <StarRating />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {currentRating > 0 ? 'Update Rating' : 'Submit Rating'}
                </button>
                <button
                  onClick={() => {
                    setShowRating(false);
                    setRating(0);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Chat Messages */}
      <div
        ref={chatBoxRef}
        className="h-96 overflow-y-auto p-4 bg-gray-50"
        onScroll={handleScroll}
      >
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <div>No messages yet. Start the conversation!</div>
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-4 flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              isMyMessage(msg) 
                ? 'bg-blue-500 text-white' 
                : msg.isDeleted 
                  ? 'bg-gray-300 text-gray-500 italic' 
                  : 'bg-white border border-gray-200'
            }`}>
              {editingMessageId === msg.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-2 border rounded text-gray-900 resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(msg.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={msg.isDeleted ? 'text-gray-500' : ''}>
                    {msg.content}
                  </div>
                  
                  <div className={`text-xs mt-1 flex items-center justify-between ${
                    isMyMessage(msg) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    <div className="flex items-center space-x-2">
                      {msg.isEdited && !msg.isDeleted && (
                        <span className="italic">edited</span>
                      )}
                      {/* Seen indicator for sent messages */}
                      {isMyMessage(msg) && !msg.isDeleted && (
                        <div className="flex items-center transition-all duration-300">
                          {msg.seen ? (
                            <span className="text-blue-200 font-semibold" title="Seen">
                              ✓✓
                            </span>
                          ) : (
                            <span className="text-blue-300 opacity-70" title="Sent">
                              ✓
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Actions */}
                  {isMyMessage(msg) && !msg.isDeleted && hoveredMessageId === msg.id && (
                    <div className="absolute -top-2 -right-2 flex space-x-1">
                      <button
                        onClick={() => handleEditMessage(msg.id, msg.content)}
                        className="w-6 h-6 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700 flex items-center justify-center"
                        title="Edit message"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                        title="Delete message"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
