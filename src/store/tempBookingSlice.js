import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieName: "",
  showDate: "",
  showTime: "",
  selectedSeats: [],
  scheduleId: null 
};

const tempBookingSlice = createSlice({
  name: "tempBooking",
  initialState,
  reducers: {
    setBookingInfo: (state, action) => {
      const { movieName, showDate, showTime, scheduleId } = action.payload;
      state.movieName = movieName;
      state.showDate = showDate;
      state.showTime = showTime;
      state.scheduleId = scheduleId;
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearBookingInfo: (state) => {
      state.movieName = "";
      state.showDate = "";
      state.showTime = "";
      state.selectedSeats = [];
      state.scheduleId = null;
    }
  }
});

export const { setBookingInfo, setSelectedSeats, clearBookingInfo } = tempBookingSlice.actions;
export default tempBookingSlice.reducer;
