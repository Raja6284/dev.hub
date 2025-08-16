
import { createSlice } from '@reduxjs/toolkit';
import { NotificationState } from '../types';
import { toast } from 'react-toastify';



const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { count: 0, messages: [] } as NotificationState,
  reducers: {
    addNotification: (state, action) => {
      state.messages.push(action.payload);
      state.count += 1;
      toast.info(action.payload);
    },
    clearNotifications: (state) => {
      state.messages = [];
      state.count = 0;
    },
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;