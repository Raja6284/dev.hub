// import React from 'react';
// import { Comment } from '../types';

// interface Props {
//   comment: Comment;
//   depth?: number;
// }

// const CommentThread: React.FC<Props> = ({ comment, depth = 0 }) => {
//   if (depth > 5) return null;

//   return (
//     <div className={`pl-${depth * 4} border-l-2 border-gray-200 mt-2`}>
//       <p className="text-sm md:text-base">{comment.text}</p>
//       {comment.replies.map((reply) => (
//         <CommentThread key={reply._id} comment={reply} depth={depth + 1} />
//       ))}
//     </div>
//   );
// };

// export default CommentThread;





import React, { useState } from 'react';
import { Comment } from '../types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { addCommentOptimistic } from '../slices/feedSlice';

interface Props {
  comment: Comment;
  postId: string;
  depth?: number;
  onComment: (data: { postId: string; text: string; parentId?: string }) => void;
}

const CommentThread: React.FC<Props> = ({ comment, postId, depth = 0, onComment }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [replyText, setReplyText] = useState('');
  const maxDepth = 5;

  if (depth > maxDepth) return null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;
    try {
      await dispatch(addCommentOptimistic({ postId, text: replyText, parentId: comment._id })).unwrap();
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`pl-${depth * 4} border-l-2 border-gray-200 mt-2`}>
      <p className="text-sm md:text-base">{comment.text}</p>
      <form onSubmit={handleReply} className="flex space-x-2 mt-1">
        <input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply..."
          className="flex-1 border p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-sm"
        >
          Reply
        </button>
      </form>
      {comment.replies.map((reply) => (
        <CommentThread
          key={reply._id}
          comment={reply}
          postId={postId}
          depth={depth + 1}
          onComment={onComment}
        />
      ))}
    </div>
  );
};

export default CommentThread;