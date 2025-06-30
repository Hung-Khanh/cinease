import api from '../constants/axios';

// Thanh toán (ví dụ)
export const confirmPayment = async (body) =>
  api.post('/member/payment/confirm', body);
