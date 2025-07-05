import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: sessionStorage.getItem("token") || null,
  tempBooking: {
    date: null,
    showtime: [],
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

const seatSlice = createSlice({
  name: "seat",
  initialState: {
    selectedSeats: [],
  },
  reducers: {
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
  },
});

const tempBookingSlice = createSlice({
  name: "tempBooking",
  initialState,
  reducers: {
    setTempBooking: (state, action) => {
      state.tempBooking = action.payload;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export const { setSelectedSeats, clearSelectedSeats } = seatSlice.actions;
export const { setTempBooking } = tempBookingSlice.actions;
export const authReducer = authSlice.reducer;
export const seatReducer = seatSlice.reducer;
export const tempBookingReducer = tempBookingSlice.reducer;
