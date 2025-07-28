import api from "../constants/axios";

export const getSeats = async (scheduleId) =>
  api.get(`/public/seats?scheduleId=${scheduleId}`);
