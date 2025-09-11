import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import TaskComment from './TaskComment';

interface TaskFeedbackProps {
  taskInstanceId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
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
  replies?: Comment[];
}

interface FeedbackStats {
  taskInstanceId: string;
  totalComments: number;
  topLevelComments: number;
  likeCount: number;
  dislikeCount: number;
  userReaction: string | null;
  hasUserCommented: boolean;
}

const TaskFeedback: React.FC<TaskFeedbackProps> = ({ taskInstanceId, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, taskInstanceId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [commentsRes, statsRes, taskRes] = await Promise.all([
        api.get(`/api/task-feedback/comments/task-instance/${taskInstanceId}`),
        api.get(`/api/task-feedback/stats/task-instance/${taskInstanceId}`),
        api.get(`/task-instances/${taskInstanceId}`)
      ]);
      
      setComments(commentsRes.data || []);
      setStats(statsRes.data);
      setTaskTitle(taskRes.data?.task || 'Task Feedback');
    } catch (err) {
      setError('Failed to load feedback data');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/api/task-feedback/comments', {
        taskInstanceId,
        content: newComment.trim(),
        parentCommentId: null
      });

      setComments([response.data, ...comments]);
      setNewComment('');
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalComments: stats.totalComments + 1,
          topLevelComments: stats.topLevelComments + 1,
          hasUserCommented: true
        });
      }
      
      // Notify parent component to refresh task data
      onUpdate?.();
    } catch (err) {
      setError('Failed to create comment');
      console.error('Error creating comment:', err);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      const response = await api.post('/api/task-feedback/comments', {
        taskInstanceId,
        content: content.trim(),
        parentCommentId: commentId
      });

      // Find the parent comment and add the reply
      const updateComments = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComments(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateComments(comments));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalComments: stats.totalComments + 1
        });
      }
    } catch (err) {
      setError('Failed to create reply');
      console.error('Error creating reply:', err);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const response = await api.put(`/api/task-feedback/comments/${commentId}`, {
        content: content.trim()
      });

      // Update the comment in the list
      const updateComments = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            return response.data;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComments(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateComments(comments));
    } catch (err) {
      setError('Failed to update comment');
      console.error('Error updating comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/api/task-feedback/comments/${commentId}`);

      // Remove the comment from the list
      const removeComment = (commentsList: Comment[]): Comment[] => {
        return commentsList.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };

      setComments(removeComment(comments));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalComments: Math.max(0, stats.totalComments - 1),
          topLevelComments: Math.max(0, stats.topLevelComments - 1)
        });
      }
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
    }
  };

  const handleCommentReaction = async (commentId: string, reactionType: 'LIKE' | 'DISLIKE') => {
    try {
      await api.post(`/api/task-feedback/reactions/comment/${commentId}`, {
        reactionType
      });

      // Update the comment's reaction counts
      const updateComments = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            const wasLiked = comment.userReaction === 'LIKE';
            const wasDisliked = comment.userReaction === 'DISLIKE';
            const isTogglingSame = comment.userReaction === reactionType;

            let newLikeCount = comment.likeCount;
            let newDislikeCount = comment.dislikeCount;
            let newUserReaction: string | null = null;

            if (isTogglingSame) {
              // Removing the reaction
              if (reactionType === 'LIKE') {
                newLikeCount = Math.max(0, comment.likeCount - 1);
              } else {
                newDislikeCount = Math.max(0, comment.dislikeCount - 1);
              }
            } else {
              // Adding or changing reaction
              if (reactionType === 'LIKE') {
                newLikeCount = comment.likeCount + (wasLiked ? 0 : 1);
                newDislikeCount = comment.dislikeCount - (wasDisliked ? 1 : 0);
                newUserReaction = 'LIKE';
              } else {
                newDislikeCount = comment.dislikeCount + (wasDisliked ? 0 : 1);
                newLikeCount = comment.likeCount - (wasLiked ? 1 : 0);
                newUserReaction = 'DISLIKE';
              }
            }

            return {
              ...comment,
              likeCount: newLikeCount,
              dislikeCount: newDislikeCount,
              userReaction: newUserReaction
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComments(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateComments(comments));
    } catch (err) {
      setError('Failed to react to comment');
      console.error('Error reacting to comment:', err);
    }
  };

  const handleTaskInstanceReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
    try {
      await api.post(`/api/task-feedback/reactions/task-instance/${taskInstanceId}`, {
        reactionType
      });

      // Update stats
      if (stats) {
        const wasLiked = stats.userReaction === 'LIKE';
        const wasDisliked = stats.userReaction === 'DISLIKE';
        const isTogglingSame = stats.userReaction === reactionType;

        let newLikeCount = stats.likeCount;
        let newDislikeCount = stats.dislikeCount;
        let newUserReaction: string | null = null;

        if (isTogglingSame) {
          // Removing the reaction
          if (reactionType === 'LIKE') {
            newLikeCount = Math.max(0, stats.likeCount - 1);
          } else {
            newDislikeCount = Math.max(0, stats.dislikeCount - 1);
          }
        } else {
          // Adding or changing reaction
          if (reactionType === 'LIKE') {
            newLikeCount = stats.likeCount + (wasLiked ? 0 : 1);
            newDislikeCount = stats.dislikeCount - (wasDisliked ? 1 : 0);
            newUserReaction = 'LIKE';
          } else {
            newDislikeCount = stats.dislikeCount + (wasDisliked ? 0 : 1);
            newLikeCount = stats.likeCount - (wasLiked ? 1 : 0);
            newUserReaction = 'DISLIKE';
          }
        }

        setStats({
          ...stats,
          likeCount: newLikeCount,
          dislikeCount: newDislikeCount,
          userReaction: newUserReaction
        });
        
        // Notify parent component to refresh task data
        onUpdate?.();
      }
    } catch (err) {
      setError('Failed to react to task');
      console.error('Error reacting to task:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{taskTitle} - Feedback & Discussion</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <>
              {/* Task Reactions */}
              {stats && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleTaskInstanceReaction('LIKE')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        stats.userReaction === 'LIKE'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>👍</span>
                      <span>{stats.likeCount}</span>
                    </button>
                    
                    <button
                      onClick={() => handleTaskInstanceReaction('DISLIKE')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        stats.userReaction === 'DISLIKE'
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>👎</span>
                      <span>{stats.dislikeCount}</span>
                    </button>

                    <span className="text-sm text-gray-500">
                      {stats.totalComments} comments
                    </span>
                  </div>
                </div>
              )}

              {/* New Comment Form */}
              <div className="p-4 border-b border-gray-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <TaskComment
                        key={comment.id}
                        comment={comment}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReact={handleCommentReaction}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFeedback;
