import { configureStore } from "@reduxjs/toolkit";
import { authReducer, seatReducer, tempBookingReducer } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seat: seatReducer,
    tempBooking:tempBookingReducer
  },
});