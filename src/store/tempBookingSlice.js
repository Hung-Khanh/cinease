import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookingDetails: {
    date: null,           
    selectedScheduleId: null, 
  },
};

const tempBookingSlice = createSlice({
  name: 'tempBooking', 
  initialState,
  reducers: {
    setTempBooking: (state, action) => {
      state.bookingDetails = { ...state.bookingDetails, ...action.payload };
    },
  },
});

export const { setTempBooking } = tempBookingSlice.actions;
export default tempBookingSlice.reducer;