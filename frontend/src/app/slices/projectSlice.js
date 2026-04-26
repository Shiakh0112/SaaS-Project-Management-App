import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects/create', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/update/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject: (state) => { state.current = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchProjects.pending, pending)
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.projects;
      })
      .addCase(fetchProjects.rejected, rejected)

      .addCase(fetchProjectById.pending, pending)
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data.project;
      })
      .addCase(fetchProjectById.rejected, rejected)

      .addCase(createProject.pending, pending)
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.data.project);
      })
      .addCase(createProject.rejected, rejected)

      .addCase(updateProject.pending, pending)
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data.project;
        state.list = state.list.map((p) => (p._id === updated._id ? updated : p));
        if (state.current?._id === updated._id) state.current = updated;
      })
      .addCase(updateProject.rejected, rejected)

      .addCase(deleteProject.pending, pending)
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProject.rejected, rejected);
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
