import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

const initialState = { items: [], unreadCount: 0, loading: false };

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await apiClient.get('/notifications');
  return { items: data.data, unreadCount: data.meta.unreadCount };
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await apiClient.patch('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items = state.items.map((n) => ({ ...n, readAt: new Date().toISOString() }));
      });
  },
});

export default notificationSlice.reducer;
