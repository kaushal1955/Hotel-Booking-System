import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const { data } = await bookingAPI.createBooking(bookingData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const fetchUserBookings = createAsyncThunk('bookings/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await bookingAPI.getUserBookings();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bookingAPI.cancelBooking(id);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Cancellation failed');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.data;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.bookings.findIndex((b) => b._id === action.payload.data._id);
        if (idx !== -1) state.bookings[idx] = action.payload.data;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;