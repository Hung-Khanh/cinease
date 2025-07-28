import api from '../constants/axios';

export const confirmPayment = async (body) =>
  api.post('/member/payment/confirm', body);
