
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { CacheState, Bookmark } from '../types';
import { addNotification } from './notificationSlice';

const backendurl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


export const bookmarkResource = createAsyncThunk('cache/bookmarkResource', async (resource: Bookmark['resource'], { dispatch }) => {
  if (!navigator.onLine) {
    let pending = JSON.parse(localStorage.getItem('pendingBookmarks') || '[]');
    pending.push(resource);
    localStorage.setItem('pendingBookmarks', JSON.stringify(pending));
    dispatch(addNotification('Bookmark saved offline'));
    return;
  }
  try {
    const res = await axios.post(
      `${backendurl}/api/bookmarks`,
      { resource },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    );
    dispatch(addNotification('Bookmark added'));
    return res.data as Bookmark;
  } catch (err) {
    dispatch(addNotification('Bookmark failed'));
    throw err;
  }
});

export const syncBookmarks = createAsyncThunk('cache/syncBookmarks', async (_, { dispatch }) => {
  const pending = JSON.parse(localStorage.getItem('pendingBookmarks') || '[]');
  for (let resource of pending) {
    await dispatch(bookmarkResource(resource));
  }
  localStorage.removeItem('pendingBookmarks');
  dispatch(addNotification('Bookmarks synced'));
});

export const fetchTrending = createAsyncThunk('cache/fetchTrending', async (_, { dispatch }) => {
  try {
    const res = await axios.get(`${backendurl}/api/resources/trending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data;
  } catch (err) {
    dispatch(addNotification('Failed to fetch trending repos'));
    throw err;
  }
});

export const fetchBookmarks = createAsyncThunk('cache/fetchBookmarks', async (_, { dispatch }) => {
  try {
    const res = await axios.get(`${backendurl}/api/bookmarks`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data as Bookmark[];
  } catch (err) {
    dispatch(addNotification('Failed to fetch bookmarks'));
    throw err;
  }
});

const cacheSlice = createSlice({
  name: 'cache',
  initialState: { bookmarks: [], trending: [] } as CacheState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(bookmarkResource.fulfilled, (state, action) => {
      if (action.payload) state.bookmarks.push(action.payload);
    });
    builder.addCase(fetchTrending.fulfilled, (state, action) => {
      state.trending = action.payload;
    });
    builder.addCase(fetchBookmarks.fulfilled, (state, action) => {
      state.bookmarks = action.payload;
    });
  },
});

export default cacheSlice.reducer;