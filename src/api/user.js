import api from '../constants/axios';

// Lấy thông tin tài khoản
export const getUserInfo = async () => api.get('/member/account');

// Lịch sử vé
export const getUserTickets = async (params) => api.get('/member/tickets', { params });

// Cập nhật thông tin (có ảnh)
export const updateUserWithImage = async (formData) =>
  api.put('/member/update-with-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Đổi mật khẩu
export const changePassword = async (data) =>
  api.put('/member/change-password', data);
