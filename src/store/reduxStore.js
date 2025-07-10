import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import persistConfig from './persistConfig';
import { authReducer, seatReducer, tempBookingReducer } from './authSlice';
import cartReducer from './cartSlice';

const rootReducer = {
    auth: authReducer,
    seat: seatReducer,
    tempBooking: tempBookingReducer,
    cart: cartReducer,
};

export const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));
