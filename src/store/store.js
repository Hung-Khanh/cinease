import { configureStore } from "@reduxjs/toolkit";
import { authReducer, seatReducer } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seat: seatReducer,
  },
});