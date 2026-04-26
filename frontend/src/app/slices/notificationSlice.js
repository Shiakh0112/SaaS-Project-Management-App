import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/notifications/read/${id}`);
    return { id, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read/all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const acceptInvite = createAsyncThunk('notifications/acceptInvite', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/notifications/${id}/accept-invite`);
    return { id, team: res.data.data.team };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to accept invite');
  }
});

export const rejectInvite = createAsyncThunk('notifications/rejectInvite', async (id, { rejectWithValue }) => {
  try {
    await api.post(`/notifications/${id}/reject-invite`);
    return { id };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject invite');
  }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return { id };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
  }
});

export const deleteAllNotifications = createAsyncThunk('notifications/deleteAll', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/notifications/delete/all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete all notifications');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.notifications;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.list = state.list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })

      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })

      .addCase(acceptInvite.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.list = state.list.map((n) => n._id === id ? { ...n, isRead: true, metadata: { ...n.metadata, resolved: true } } : n);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })

      .addCase(rejectInvite.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.list = state.list.map((n) => n._id === id ? { ...n, isRead: true, metadata: { ...n.metadata, resolved: true } } : n);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { id } = action.payload;
        const wasUnread = state.list.find((n) => n._id === id && !n.isRead);
        state.list = state.list.filter((n) => n._id !== id);
        if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      })

      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.list = [];
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
