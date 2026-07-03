import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminAPI.getDashboardStats();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminAPI.getUsers(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUserStatus', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminAPI.toggleUserStatus(id);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    monthlyRevenue: [],
    recentBookings: [],
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.monthlyRevenue = action.payload.monthlyRevenue;
        state.recentBookings = action.payload.recentBookings;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload.data._id);
        if (idx !== -1) state.users[idx] = action.payload.data;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;