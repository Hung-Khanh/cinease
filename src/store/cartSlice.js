import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  seatData: null,
  selectedProducts: [],
  sessionId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setSeatData: (state, action) => {
      state.seatData = action.payload;
    },
    clearSeatData: (state) => {
      state.seatData = null;
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
    },
    clearSelectedProducts: (state) => {
      state.selectedProducts = [];
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    clearSessionId: (state) => {
      state.sessionId = null;
    },
  },
});

export const {
  setSeatData,
  clearSeatData,
  setSelectedProducts,
  clearSelectedProducts,
  setSessionId,
  clearSessionId,
} = cartSlice.actions;

export default cartSlice.reducer;