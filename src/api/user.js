import api from '../constants/axios';

export const getUserInfo = async () => api.get('/member/account');

export const getUserTickets = async (params) => api.get('/member/tickets', { params });

export const updateUserWithImage = async (formData) =>
  api.put('/member/update-with-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const changePassword = async (data) =>
  api.put('/member/change-password', data);
