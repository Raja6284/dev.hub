import React, { useState } from 'react';
import { Comment } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { addCommentOptimistic } from '../slices/feedSlice';

interface Props {
  comment: Comment;
  postId: string;
  depth?: number;
  maxDepth?: number;
  onComment: (data: { postId: string; text: string; parentId?: string }) => void;
}

const ImprovedCommentThread: React.FC<Props> = ({ 
  comment, 
  postId, 
  depth = 0, 
  maxDepth = 5, 
  onComment 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isDark } = useSelector((state: RootState) => state.theme);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (depth > maxDepth) return null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(addCommentOptimistic({ 
        postId, 
        text: replyText.trim(), 
        parentId: comment._id 
      })).unwrap();
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true); // Show replies after adding one
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : '';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${indentClass} ${depth > 0 ? `border-l-2 ${borderColor} pl-4` : ''}`}>
      <div className={`py-3 ${depth > 0 ? 'mt-3' : ''}`}>
        {/* Comment Header */}
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
          }`}>
            {comment.userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {comment?.userName || 'Anonymous'}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {comment.text}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4">
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={`text-xs font-medium transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-blue-400' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              💬 Reply
            </button>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`text-xs font-medium transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-blue-400' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className={`w-full border p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmitting}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map((reply) => (
            <ImprovedCommentThread
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              maxDepth={maxDepth}
              onComment={onComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImprovedCommentThread;