import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { hotelAPI, reviewAPI } from "../../services/api";

export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await hotelAPI.getHotels(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotels",
      );
    }
  },
);

export const fetchHotelById = createAsyncThunk(
  "hotels/fetchHotelById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await hotelAPI.getHotel(id);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotel",
      );
    }
  },
);

export const createReview = createAsyncThunk(
  "hotels/createReview",
  async ({ hotel, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await reviewAPI.createReview({ hotel, rating, comment });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review",
      );
    }
  },
);

const hotelSlice = createSlice({
  name: "hotels",
  initialState: {
    hotels: [],
    currentHotel: null,
    rooms: [],
    reviews: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
      state.rooms = [];
      state.reviews = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHotel = action.payload.hotel;
        state.rooms = action.payload.rooms;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
        if (state.currentHotel) {
          state.currentHotel.numReviews =
            (state.currentHotel.numReviews || 0) + 1;
        }
      });
  },
});

export const { clearCurrentHotel, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;
