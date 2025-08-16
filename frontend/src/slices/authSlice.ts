
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { User, AuthState } from '../types';
import { addNotification } from './notificationSlice';

interface Credentials {
  email: string;
  password: string;
}

const backendurl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Initialize auth state from localStorage
const initializeAuth = (): AuthState => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode<User>(token);
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return { user: decoded, isAuthenticated: true };
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  }
  return { user: null, isAuthenticated: false };
};

export const login = createAsyncThunk('auth/login', async (credentials: Credentials, { dispatch }) => {
  try {
    const res = await axios.post(`${backendurl}/api/auth/login`, credentials);
    localStorage.setItem('token', res.data.token);
    const decoded = jwtDecode<User>(res.data.token);
    dispatch(addNotification('Login successful!'));
    return decoded;
  } catch (err) {
    dispatch(addNotification('Login failed. Please check your credentials.'));
    throw err;
  }
});

export const signup = createAsyncThunk('auth/signup', async (credentials: { name: string } & Credentials, { dispatch }) => {
  try {
    const res = await axios.post(`${backendurl}/api/auth/signup`, credentials);
    localStorage.setItem('token', res.data.token);
    const decoded = jwtDecode<User>(res.data.token);
    dispatch(addNotification('Account created successfully!'));
    return decoded;
  } catch (err) {
    dispatch(addNotification('Signup failed. Please try again.'));
    throw err;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: initializeAuth(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;