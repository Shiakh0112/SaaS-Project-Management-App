import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBoards = createAsyncThunk('boards/fetchByProject', async (projectId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/boards/${projectId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch boards');
  }
});

export const createBoard = createAsyncThunk('boards/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/boards/create', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create board');
  }
});

export const updateBoard = createAsyncThunk('boards/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/boards/update/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update board');
  }
});

export const deleteBoard = createAsyncThunk('boards/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/boards/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete board');
  }
});

export const fetchLists = createAsyncThunk('boards/fetchLists', async (boardId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/lists/board/${boardId}`);
    return { boardId, lists: res.data.data.lists };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createList = createAsyncThunk('boards/createList', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/lists/create', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create list');
  }
});

export const updateList = createAsyncThunk('boards/updateList', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/lists/update/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteList = createAsyncThunk('boards/deleteList', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/lists/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const boardSlice = createSlice({
  name: 'boards',
  initialState: {
    list: [],
    current: null,
    lists: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentBoard: (state, action) => { state.current = action.payload; },
    clearBoard: (state) => { state.current = null; state.lists = []; },
    setLists: (state, action) => { state.lists = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchBoards.pending, pending)
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.boards;
      })
      .addCase(fetchBoards.rejected, rejected)

      .addCase(createBoard.pending, pending)
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload.data.board);
      })
      .addCase(createBoard.rejected, rejected)

      .addCase(updateBoard.pending, pending)
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data.board;
        state.list = state.list.map((b) => (b._id === updated._id ? updated : b));
        if (state.current?._id === updated._id) state.current = updated;
      })
      .addCase(updateBoard.rejected, rejected)

      .addCase(deleteBoard.pending, pending)
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBoard.rejected, rejected)

      .addCase(fetchLists.fulfilled, (state, action) => {
        state.lists = action.payload.lists;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.push({ ...action.payload.data.list, tasks: [] });
      })
      .addCase(updateList.fulfilled, (state, action) => {
        const updated = action.payload.data.list;
        state.lists = state.lists.map((l) => (l._id === updated._id ? { ...l, ...updated } : l));
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l._id !== action.payload);
      });
  },
});

export const { setCurrentBoard, clearBoard, setLists, clearError } = boardSlice.actions;
export default boardSlice.reducer;
