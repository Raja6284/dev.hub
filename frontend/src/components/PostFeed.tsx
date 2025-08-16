// import React, { useEffect, useState } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../store';
// import { fetchFeed, createPost, addCommentOptimistic, likePost, deletePost } from '../slices/feedSlice';
// import { useForm } from 'react-hook-form';
// import CommentThread from './CommentThread';
// import ReactMarkdown from 'react-markdown';

// interface PostFormData {
//   title: string;
//   content: string;
//   tags: string;
// }

// const PostFeed: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { posts, hasMore, page } = useSelector((state: RootState) => state.feed);
//   const { user } = useSelector((state: RootState) => state.auth);
//   const { isDark } = useSelector((state: RootState) => state.theme);
//   const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>();
//   const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
//   const [showCreatePost, setShowCreatePost] = useState(false);
//   const [editingPost, setEditingPost] = useState<string | null>(null);

//   useEffect(() => {
//     if (posts.length === 0) {
//       dispatch(fetchFeed(1));
//     }
//   }, [dispatch, posts.length]);

//   const onSubmitPost = async (data: PostFormData) => {
//     try {
//       await dispatch(createPost({ 
//         ...data, 
//         tags: data.tags.split(',').map((t) => t.trim()).filter(t => t) 
//       })).unwrap();
//       reset();
//       setShowCreatePost(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const onSubmitComment = async (postId: string, e: React.FormEvent) => {
//     e.preventDefault();
//     const text = commentInputs[postId];
//     if (!text?.trim()) return;
    
//     try {
//       await dispatch(addCommentOptimistic({ postId, text })).unwrap();
//       setCommentInputs({ ...commentInputs, [postId]: '' });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleLike = async (postId: string) => {
//     try {
//       await dispatch(likePost(postId)).unwrap();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDelete = async (postId: string) => {
//     if (window.confirm('Are you sure you want to delete this post?')) {
//       try {
//         await dispatch(deletePost(postId)).unwrap();
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto space-y-6 py-6">
//       {/* Create Post */}
//       <div className={`p-6 rounded-lg mt-4 shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
//         {!showCreatePost ? (
//           <button
//             onClick={() => setShowCreatePost(true)}
//             className={`w-full text-left p-4 border rounded-lg transition-colors ${
//               isDark 
//                 ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500' 
//                 : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400'
//             }`}
//           >
//             💭 What's on your mind? Share your coding thoughts...
//           </button>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                 Create New Post
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowCreatePost(false);
//                   reset();
//                 }}
//                 className={`text-gray-500 hover:text-gray-700 ${isDark ? 'hover:text-gray-300' : ''}`}
//               >
//                 ✕
//               </button>
//             </div>
            
//             <div>
//               <input
//                 {...register('title', { required: 'Title is required' })}
//                 placeholder="Post title..."
//                 className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-900'
//                 }`}
//               />
//               {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
//             </div>
            
//             <div>
//               <textarea
//                 {...register('content', { required: 'Content is required' })}
//                 placeholder="Write your post content here... (Markdown supported)"
//                 rows={6}
//                 className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-900'
//                 }`}
//               />
//               {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
//             </div>
            
//             <input
//               {...register('tags')}
//               placeholder="Tags (comma-separated): javascript, react, nodejs"
//               className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 isDark 
//                   ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             />
            
//             <div className="flex space-x-3">
//               <button
//                 type="submit"
//                 className="flex-1 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
//               >
//                 📝 Publish Post
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowCreatePost(false);
//                   reset();
//                 }}
//                 className={`px-6 py-3 border rounded-md transition-colors ${
//                   isDark
//                     ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
//                     : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
      
//       {/* Posts Feed */}
//       <InfiniteScroll
//         dataLength={posts.length}
//         next={() => dispatch(fetchFeed(page))}
//         hasMore={hasMore}
//         loader={
//           <div className="text-center py-8">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading more posts...</p>
//           </div>
//         }
//         endMessage={
//           <div className="text-center py-8">
//             <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//               🎉 You've reached the end! Time to create some new content.
//             </p>
//           </div>
//         }
//         className="space-y-6"
//       >
//         {posts.map((post) => (
//           <article key={post._id} className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
//             {/* Post Header */}
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
//                   isDark ? 'bg-blue-600' : 'bg-blue-500'
//                 }`}>
//                   {post.user?.name?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div>
//                   <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                     {post.user?.name || 'Anonymous'}
//                   </h4>
//                   <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                     {formatDate(post.createdAt)}
//                   </p>
//                 </div>
//               </div>
              
//               {/* Post Actions for Owner */}
//               {user?.id === post.user?._id && (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setEditingPost(post._id)}
//                     className={`text-sm px-3 py-1 rounded transition-colors ${
//                       isDark
//                         ? 'text-gray-400 hover:text-white hover:bg-gray-700'
//                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                     }`}
//                   >
//                     ✏️ Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(post._id)}
//                     className="text-sm px-3 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Post Content */}
//             <div className="mb-4">
//               <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                 {post.title}
//               </h3>
              
//               {post.tags && post.tags.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {post.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className={`px-2 py-1 text-xs rounded-full ${
//                         isDark 
//                           ? 'bg-blue-900 text-blue-200' 
//                           : 'bg-blue-100 text-blue-800'
//                       }`}
//                     >
//                       #{tag}
//                     </span>
//                   ))}
//                 </div>
//               )}
              
//               <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
//                 <ReactMarkdown>{post.rawContent || post.content}</ReactMarkdown>
//               </div>
//             </div>

//             {/* Post Stats */}
//             <div className={`flex items-center space-x-6 py-3 border-t border-b ${
//               isDark ? 'border-gray-700' : 'border-gray-200'
//             }`}>
//               <button
//                 onClick={() => handleLike(post._id)}
//                 className={`flex items-center space-x-2 text-sm transition-colors ${
//                   post.likes?.includes(user?.id || '')
//                     ? 'text-red-500 hover:text-red-600'
//                     : isDark
//                       ? 'text-gray-400 hover:text-red-400'
//                       : 'text-gray-600 hover:text-red-500'
//                 }`}
//               >
//                 <span>{post.likes?.includes(user?.id || '') ? '❤️' : '🤍'}</span>
//                 <span>{post.likes?.length || 0} likes</span>
//               </button>
              
//               <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                 <span>💬</span>
//                 <span>{post.comments?.length || 0} comments</span>
//               </div>
              
//               <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                 <span>👁️</span>
//                 <span>{post.views || 0} views</span>
//               </div>
//             </div>
            
//             {/* Comments Section */}
//             <div className="mt-4">
//               <form
//                 onSubmit={(e) => onSubmitComment(post._id, e)}
//                 className="flex space-x-3 mb-4"
//               >
//                 <input
//                   value={commentInputs[post._id] || ''}
//                   onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
//                   placeholder="Add a thoughtful comment..."
//                   className={`flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     isDark 
//                       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   }`}
//                 />
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//                 >
//                   💬 Comment
//                 </button>
//               </form>
              
//               <div className="space-y-3">
//                 {post.comments?.map((comment) => (
//                   <CommentThread
//                     key={comment._id}
//                     comment={comment}
//                     postId={post._id}
//                     onComment={() => {}}
//                   />
//                 ))}
//               </div>
//             </div>
//           </article>
//         ))}
//       </InfiniteScroll>
//     </div>
//   );
// };

// export default PostFeed;











import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFeed, createPost, addCommentOptimistic, deletePost, updatePost } from '../slices/feedSlice';
import { useForm, SubmitHandler } from 'react-hook-form';
import ImprovedCommentThread from './ImprovedCommentThread';
import ReactMarkdown from 'react-markdown';

interface PostFormData {
  title: string;
  content: string;
  tags: string;
}

const PostFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, hasMore, page } = useSelector((state: RootState) => state.feed);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<PostFormData>();
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchFeed(1));
    }
  }, [dispatch, posts.length]);

  const onSubmitPost = async (data: PostFormData) => {
    try {
      await dispatch(createPost({ 
        ...data, 
        tags: data.tags.split(',').map((t) => t.trim()).filter(t => t) 
      })).unwrap();
      reset();
      setShowCreatePost(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitEditPost: SubmitHandler<PostFormData> = async (data) => {
    if (!editingPost) return;
    try {
      await dispatch(updatePost({
        _id: editingPost,
        ...data,
        tags: data.tags.split(',').map((t) => t.trim()).filter(t => t),
      })).unwrap();
      setEditingPost(null);
      reset(); // Clear form state after successful edit
    } catch (err) {
      console.error(err);
      // Optionally handle error, e.g., show a toast
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPost(post._id);
    setValue('title', post.title);
    setValue('content', post.rawContent || post.content); // Use rawContent for editing
    setValue('tags', post.tags?.join(', ') || '');
  };
  const onSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    
    try {
      await dispatch(addCommentOptimistic({ postId, text })).unwrap();
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };


  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(postId)).unwrap();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6">
      {/* Create Post */}
      <div className={`p-6 rounded-lg mt-4 shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {!showCreatePost ? (
          <button
            onClick={() => setShowCreatePost(true)}
            className={`w-full text-left p-4 border rounded-lg transition-colors ${
              isDark 
                ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            💭 What's on your mind? Share your coding thoughts...
          </button>
        ) : (
          <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create New Post
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  reset();
                }}
                className={`text-gray-500 hover:text-gray-700 ${isDark ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <div>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="Post title..."
                className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <textarea
                {...register('content', { required: 'Content is required' })}
                placeholder="Write your post content here... (Markdown supported)"
                rows={6}
                className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            
            <input
              {...register('tags')}
              placeholder="Tags (comma-separated): javascript, react, nodejs"
              className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                📝 Publish Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  reset();
                }}
                className={`px-6 py-3 border rounded-md transition-colors ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Posts Feed */}
      <InfiniteScroll
        dataLength={posts.length}
        next={() => dispatch(fetchFeed(page))}
        hasMore={hasMore}
        loader={
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading more posts...</p>
          </div>
        }
        endMessage={
          <div className="text-center py-8">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              🎉 You've reached the end! Time to create some new content.
            </p>
          </div>
        }
        className="space-y-6"
      >
        {posts.map((post) => (
          <article key={post._id} className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  {typeof post.user === "object"
    ? post.user?.name?.charAt(0).toUpperCase()
    : "U"}
                </div>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {typeof post.user === "object" ? post.user?.name : "Anonymous"}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* Post Actions for Owner */}
              {user?.id === (typeof post.user === "object" ? post.user?._id : post.user) && (
                <div className="flex space-x-2">
 {editingPost === post._id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(null);
                        reset(); // Clear form state on cancel
                      }}
                      className={`text-sm px-3 py-1 rounded transition-colors ${
                        isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                  ) : (
                    <>
                      <button
 onClick={() => handleEditClick(post)}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-sm px-3 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Post Content */}
            {editingPost === post._id ? (
              <form onSubmit={handleSubmit(onSubmitEditPost)} className="space-y-4">
                <div>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Post title..."
                    className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    placeholder="Write your post content here... (Markdown supported)"
                    rows={6}
                    className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>

                <input
                  {...register('tags')}
                  placeholder="Tags (comma-separated): javascript, react, nodejs"
                  className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />

                <div className="flex justify-end space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-4">
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {post.title}
                </h3>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${
                        isDark 
                          ? 'bg-blue-900 text-blue-200' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                <ReactMarkdown>{String(post.rawContent || post.content || "")}</ReactMarkdown>
              </div>
              </div>
            )}

            {/* Post Stats */}
            <div className={`flex items-center space-x-6 py-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>💬</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>
              
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>📅</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="mt-4">
              <form
                onSubmit={(e) => onSubmitComment(post._id, e)}
                className="flex space-x-3 mb-4"
              >
                <input
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                  placeholder="Add a thoughtful comment..."
                  className={`flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  💬 Comment
                </button>
              </form>
              
              <div className="space-y-3">
                {post.comments?.map((comment) => (
                  <ImprovedCommentThread
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    onComment={() => {}}
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostFeed;
