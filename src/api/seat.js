import api from '../constants/axios';

// Lấy danh sách ghế theo scheduleId
export const getSeats = async (scheduleId) =>
  api.get(`/public/seats?scheduleId=${scheduleId}`);
