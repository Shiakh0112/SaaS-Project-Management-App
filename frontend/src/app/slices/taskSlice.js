import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTasks = createAsyncThunk('tasks/fetchByBoard', async (boardId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/${boardId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/tasks/create', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/tasks/update/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const moveTask = createAsyncThunk('tasks/move', async ({ id, listId, position }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/tasks/move/${id}`, { listId, position });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to move task');
  }
});

export const addComment = createAsyncThunk('tasks/addComment', async ({ id, data, isFormData }, { rejectWithValue }) => {
  try {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post(`/tasks/comment/${id}`, data, config);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    selectedTask: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedTask: (state, action) => { state.selectedTask = action.payload; },
    clearSelectedTask: (state) => { state.selectedTask = null; },
    clearError: (state) => { state.error = null; },
    // Real-time socket updates
    socketTaskCreated: (state, action) => {
      const exists = state.list.find((t) => t._id === action.payload._id);
      if (!exists) state.list.push(action.payload);
    },
    socketTaskUpdated: (state, action) => {
      state.list = state.list.map((t) => (t._id === action.payload._id ? action.payload : t));
      if (state.selectedTask?._id === action.payload._id) state.selectedTask = action.payload;
    },
    socketTaskDeleted: (state, action) => {
      state.list = state.list.filter((t) => t._id !== action.payload.taskId);
      if (state.selectedTask?._id === action.payload.taskId) state.selectedTask = null;
    },
    socketTaskMoved: (state, action) => {
      state.list = state.list.map((t) => (t._id === action.payload._id ? action.payload : t));
    },
    // Optimistic move for drag & drop
    optimisticMove: (state, action) => {
      const { taskId, newListId, newPosition } = action.payload;
      state.list = state.list.map((t) =>
        t._id === taskId ? { ...t, list: newListId, position: newPosition } : t
      );
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchTasks.pending, pending)
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.tasks;
      })
      .addCase(fetchTasks.rejected, rejected)

      .addCase(createTask.pending, pending)
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload.data.task);
      })
      .addCase(createTask.rejected, rejected)

      .addCase(updateTask.pending, pending)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data.task;
        state.list = state.list.map((t) => (t._id === updated._id ? updated : t));
        if (state.selectedTask?._id === updated._id) state.selectedTask = updated;
      })
      .addCase(updateTask.rejected, rejected)

      .addCase(deleteTask.pending, pending)
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((t) => t._id !== action.payload);
        if (state.selectedTask?._id === action.payload) state.selectedTask = null;
      })
      .addCase(deleteTask.rejected, rejected)

      .addCase(moveTask.fulfilled, (state, action) => {
        const updated = action.payload.data.task;
        state.list = state.list.map((t) => (t._id === updated._id ? updated : t));
      })

      .addCase(addComment.fulfilled, (state, action) => {
        const updated = action.payload.data.task;
        state.list = state.list.map((t) => (t._id === updated._id ? updated : t));
        if (state.selectedTask?._id === updated._id) state.selectedTask = updated;
      });
  },
});

export const {
  setSelectedTask, clearSelectedTask, clearError,
  socketTaskCreated, socketTaskUpdated, socketTaskDeleted,
  socketTaskMoved, optimisticMove,
} = taskSlice.actions;
export default taskSlice.reducer;
