import React, { useState } from 'react';
import UserLink from './UserLink';
import Avatar from './Avatar';

// Simple date formatting function
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

interface TaskCommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      hasPublicProfile?: boolean;
    };
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
    likeCount: number;
    dislikeCount: number;
    userReaction: string | null;
    replyCount: number;
    replies?: TaskCommentProps['comment'][];
  };
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReact: (commentId: string, reactionType: 'LIKE' | 'DISLIKE') => void;
  currentUserId?: string;
  level?: number;
}

const TaskComment: React.FC<TaskCommentProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReact,
  currentUserId,
  level = 0
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(level === 0);

  const isAuthor = currentUserId === comment.author.id;
  const maxNestingLevel = 3;

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
    }
  };

  const handleReaction = (reactionType: 'LIKE' | 'DISLIKE') => {
    onReact(comment.id, reactionType);
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Avatar
              firstName={comment.author.firstName}
              lastName={comment.author.lastName}
              email={comment.author.email}
              size="sm"
            />
            <div>
              <UserLink 
                user={comment.author} 
                className="font-medium text-sm"
                showName={true}
              />
              <span className="text-xs text-gray-500 ml-2">
                {formatDistanceToNow(new Date(comment.createdAt))}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 mb-3">{comment.content}</p>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-xs">
          {/* Reactions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleReaction('LIKE')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                comment.userReaction === 'LIKE'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>👍</span>
              <span>{comment.likeCount}</span>
            </button>
            
            <button
              onClick={() => handleReaction('DISLIKE')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                comment.userReaction === 'DISLIKE'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>👎</span>
              <span>{comment.dislikeCount}</span>
            </button>
          </div>

          {/* Reply Button */}
          {level < maxNestingLevel && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-blue-600 hover:text-blue-800"
            >
              Reply
            </button>
          )}

          {/* Edit Button */}
          {isAuthor && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              Edit
            </button>
          )}

          {/* Delete Button */}
          {isAuthor && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this comment?')) {
                  onDelete(comment.id);
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}

          {/* Show/Hide Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 p-3 bg-white rounded-md border">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={2}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <TaskComment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskComment;
