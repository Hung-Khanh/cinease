
import { configureStore } from "@reduxjs/toolkit";
import { authReducer, seatReducer, tempBookingReducer } from "./authSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seat: seatReducer,
    tempBooking: tempBookingReducer,
    cart: cartReducer, 
  },
});
