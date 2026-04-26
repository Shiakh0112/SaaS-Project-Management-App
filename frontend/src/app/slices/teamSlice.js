import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyTeams = createAsyncThunk('teams/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/teams/my-teams');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch teams');
  }
});

export const fetchTeamById = createAsyncThunk('teams/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch team');
  }
});

export const createTeam = createAsyncThunk('teams/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/teams/create', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create team');
  }
});

export const inviteMember = createAsyncThunk('teams/invite', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/teams/invite', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send invite');
  }
});

export const acceptInvite = createAsyncThunk('teams/acceptInvite', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/teams/accept-invite', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to accept invite');
  }
});

export const rejectInvite = createAsyncThunk('teams/rejectInvite', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/teams/reject-invite', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject invite');
  }
});

export const updateMemberRole = createAsyncThunk('teams/updateRole', async ({ teamId, userId, role }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/teams/update-role/${teamId}`, { userId, role });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update role');
  }
});

export const removeMember = createAsyncThunk('teams/removeMember', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await api.delete(`/teams/remove-member/${teamId}`, { data: { userId } });
    return { teamId, userId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove member');
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTeam: (state) => { state.current = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchMyTeams.pending, pending)
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.teams;
      })
      .addCase(fetchMyTeams.rejected, rejected)

      .addCase(fetchTeamById.pending, pending)
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data.team;
      })
      .addCase(fetchTeamById.rejected, rejected)

      .addCase(createTeam.pending, pending)
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.data.team);
      })
      .addCase(createTeam.rejected, rejected)

      .addCase(inviteMember.pending, pending)
      .addCase(inviteMember.fulfilled, (state) => { state.loading = false; })
      .addCase(inviteMember.rejected, rejected)

      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.current = action.payload.data.team;
        state.list = state.list.map((t) =>
          t._id === action.payload.data.team._id ? action.payload.data.team : t
        );
      })

      .addCase(removeMember.fulfilled, (state, action) => {
        if (state.current) {
          state.current.members = state.current.members.filter(
            (m) => m.user._id !== action.payload.userId
          );
        }
      });
  },
});

export const { clearCurrentTeam, clearError } = teamSlice.actions;
export default teamSlice.reducer;
