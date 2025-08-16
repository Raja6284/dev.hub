// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { FeedState, Post, Comment } from '../types';
// import { addNotification } from './notificationSlice';

// export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (page: number, { dispatch }) => {
//   try {
//     const res = await axios.get(`/api/posts/feed?page=${page}&limit=10`);
//     return res.data as { posts: Post[]; hasMore: boolean };
//   } catch (err) {
//     dispatch(addNotification('Failed to fetch feed'));
//     throw err;
//   }
// });

// export const createPost = createAsyncThunk('feed/createPost', async ({ title, content, tags }: { title: string; content: string; tags: string[] }, { dispatch }) => {
//   try {
//     const res = await axios.post(
//       '/api/posts',
//       { title, content, tags },
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       },
//     );
//     dispatch(addNotification('Post created successfully!'));
//     return res.data as Post;
//   } catch (err) {
//     dispatch(addNotification('Failed to create post'));
//     throw err;
//   }
// });

// export const updatePost = createAsyncThunk('feed/updatePost', async ({ id, title, content, tags }: { id: string; title: string; content: string; tags: string[] }, { dispatch }) => {
//   try {
//     const res = await axios.put(
//       `/api/posts/${id}`,
//       { title, content, tags },
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       },
//     );
//     dispatch(addNotification('Post updated successfully!'));
//     return res.data as Post;
//   } catch (err) {
//     dispatch(addNotification('Failed to update post'));
//     throw err;
//   }
// });

// export const deletePost = createAsyncThunk('feed/deletePost', async (id: string, { dispatch }) => {
//   try {
//     await axios.delete(`/api/posts/${id}`, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//     });
//     dispatch(addNotification('Post deleted successfully'));
//     return id;
//   } catch (err) {
//     dispatch(addNotification('Failed to delete post'));
//     throw err;
//   }
// });

// export const likePost = createAsyncThunk('feed/likePost', async (id: string, { dispatch }) => {
//   try {
//     const res = await axios.post(`/api/posts/${id}/like`, {}, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//     });
//     return { id, ...res.data };
//   } catch (err) {
//     dispatch(addNotification('Failed to like post'));
//     throw err;
//   }
// });

// export const addCommentOptimistic = createAsyncThunk(
//   'feed/addComment',
//   async ({ postId, text, parentId }: { postId: string; text: string; parentId?: string }, { dispatch, getState }) => {
//     const state = getState() as { auth: { user: { id: string; name: string } } };
//     const tempId = Date.now().toString();
    
//     dispatch({
//       type: 'feed/addCommentLocal',
//       payload: { postId, text, parentId, tempId, user: state.auth.user },
//     });
    
//     try {
//       const res = await axios.post(
//         '/api/posts/comment',
//         { postId, text, parentId },
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         },
//       );
//       return res.data;
//     } catch (err) {
//       dispatch({
//         type: 'feed/rollbackComment',
//         payload: { postId, tempId },
//       });
//       dispatch(addNotification('Failed to add comment'));
//       throw err;
//     }
//   },
// );

// const feedSlice = createSlice({
//   name: 'feed',
//   initialState: { posts: [], page: 1, hasMore: true } as FeedState,
//   reducers: {
//     addCommentLocal: (state, action) => {
//       const { postId, text, parentId, tempId, user } = action.payload;
//       const post = state.posts.find((p) => p._id === postId);
//       if (post) {
//         const newComment: Comment = { 
//           _id: tempId, 
//           text, 
//           user: user.id,
//           userName: user.name,
//           replies: [],
//           createdAt: new Date().toISOString()
//         };
        
//         if (parentId) {
//           const addReply = (comments: Comment[]): boolean => {
//             for (let c of comments) {
//               if (c._id === parentId) {
//                 c.replies.push(newComment);
//                 return true;
//               }
//               if (addReply(c.replies)) return true;
//             }
//             return false;
//           };
//           addReply(post.comments);
//         } else {
//           post.comments.push(newComment);
//         }
//       }
//     },
//     rollbackComment: (state, action) => {
//       const { postId, tempId } = action.payload;
//       const post = state.posts.find((p) => p._id === postId);
//       if (post) {
//         const removeComment = (comments: Comment[]): boolean => {
//           for (let i = 0; i < comments.length; i++) {
//             if (comments[i]._id === tempId) {
//               comments.splice(i, 1);
//               return true;
//             }
//             if (removeComment(comments[i].replies)) return true;
//           }
//           return false;
//         };
//         removeComment(post.comments);
//       }
//     },
//     resetFeed: (state) => {
//       state.posts = [];
//       state.page = 1;
//       state.hasMore = true;
//     }
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchFeed.fulfilled, (state, action) => {
//       if (action.meta.arg === 1) {
//         // First page - replace posts
//         state.posts = action.payload.posts;
//         state.page = 2;
//       } else {
//         // Subsequent pages - append posts
//         state.posts = [...state.posts, ...action.payload.posts];
//         state.page += 1;
//       }
//       state.hasMore = action.payload.hasMore;
//     });
    
//     builder.addCase(createPost.fulfilled, (state, action) => {
//       state.posts.unshift(action.payload);
//     });
    
//     builder.addCase(updatePost.fulfilled, (state, action) => {
//       const index = state.posts.findIndex(p => p._id === action.payload._id);
//       if (index !== -1) {
//         state.posts[index] = action.payload;
//       }
//     });
    
//     builder.addCase(deletePost.fulfilled, (state, action) => {
//       state.posts = state.posts.filter(p => p._id !== action.payload);
//     });
    
//     builder.addCase(likePost.fulfilled, (state, action) => {
//       const post = state.posts.find(p => p._id === action.payload.id);
//       if (post) {
//         post.likes = action.payload.likes || [];
//       }
//     });
//   },
// });

// export const { resetFeed } = feedSlice.actions;
// export default feedSlice.reducer;







import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { FeedState, Post, Comment } from '../types';
import { addNotification } from './notificationSlice';

const backendurl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (page: number, { dispatch }) => {
  try {
    const res = await axios.get(`${backendurl}/api/posts/feed?page=${page}&limit=10`);
    return res.data as { posts: Post[]; hasMore: boolean };
  } catch (err) {
    dispatch(addNotification('Failed to fetch feed'));
    throw err;
  }
});

export const createPost = createAsyncThunk('feed/createPost', async ({ title, content, tags }: { title: string; content: string; tags: string[] }, { dispatch }) => {
  try {
    const res = await axios.post(
      `${backendurl}/api/posts`,
      { title, content, tags },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    );
    dispatch(addNotification('Post created successfully!'));
    return res.data as Post;
  } catch (err) {
    dispatch(addNotification('Failed to create post'));
    throw err;
  }
});

export const updatePost = createAsyncThunk('feed/updatePost', async ({ _id, title, content, tags }: { _id: string; title: string; content: string; tags: string[] }, { dispatch }) => {
  try {
    const res = await axios.put(
      `${backendurl}/api/posts/${_id}`,
      { title, content, tags },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    );
    dispatch(addNotification('Post updated successfully!'));
    return res.data as Post;
  } catch (err) {
    dispatch(addNotification('Failed to update post'));
    throw err;
  }
});

export const deletePost = createAsyncThunk('feed/deletePost', async (id: string, { dispatch }) => {
  try {
    await axios.delete(`${backendurl}/api/posts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    dispatch(addNotification('Post deleted successfully'));
    return id;
  } catch (err) {
    dispatch(addNotification('Failed to delete post'));
    throw err;
  }
});


export const addCommentOptimistic = createAsyncThunk(
  'feed/addComment',
  async ({ postId, text, parentId }: { postId: string; text: string; parentId?: string }, { dispatch, getState }) => {
    const state = getState() as { auth: { user: { id: string; name: string } } };
    const tempId = Date.now().toString();
    
    dispatch({
      type: 'feed/addCommentLocal',
      payload: { postId, text, parentId, tempId, user: state.auth.user },
    });
    
    try {
      const res = await axios.post(
        `${backendurl}/api/posts/comment`,
        { postId, text, parentId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      return res.data;
    } catch (err) {
      dispatch({
        type: 'feed/rollbackComment',
        payload: { postId, tempId },
      });
      dispatch(addNotification('Failed to add comment'));
      throw err;
    }
  },
);

const feedSlice = createSlice({
  name: 'feed',
  initialState: { posts: [], page: 1, hasMore: true } as FeedState,
  reducers: {
    addCommentLocal: (state, action) => {
      const { postId, text, parentId, tempId, user } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        const newComment: Comment = { 
          _id: tempId, 
          text, 
          user: user.id,
          userName: user.name,
          replies: [],
          createdAt: new Date().toISOString()
        };
        
        if (parentId) {
          const addReply = (comments: Comment[]): boolean => {
            for (let c of comments) {
              if (c._id === parentId) {
                c.replies.push(newComment);
                return true;
              }
              if (addReply(c.replies)) return true;
            }
            return false;
          };
          addReply(post.comments);
        } else {
          post.comments.push(newComment);
        }
      }
    },
    rollbackComment: (state, action) => {
      const { postId, tempId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        const removeComment = (comments: Comment[]): boolean => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === tempId) {
              comments.splice(i, 1);
              return true;
            }
            if (removeComment(comments[i].replies)) return true;
          }
          return false;
        };
        removeComment(post.comments);
      }
    },
    resetFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFeed.fulfilled, (state, action) => {
      if (action.meta.arg === 1) {
        // First page - replace posts
        state.posts = action.payload.posts;
        state.page = 2;
      } else {
        // Subsequent pages - append posts
        state.posts = [...state.posts, ...action.payload.posts];
        state.page += 1;
      }
      state.hasMore = action.payload.hasMore;
    });
    
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.posts.unshift(action.payload);
    });
    
    builder.addCase(updatePost.fulfilled, (state, action) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    });
    
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.posts = state.posts.filter(p => p._id !== action.payload);
    });
  },
});

export const { resetFeed } = feedSlice.actions;
export default feedSlice.reducer;