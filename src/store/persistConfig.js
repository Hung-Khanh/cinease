import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'seat', 'tempBooking'], // chỉ persist các slice cần thiết
};

export default persistConfig;
