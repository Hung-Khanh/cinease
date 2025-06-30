import api from '../constants/axios';

// Lấy thông tin vé theo invoiceId
export const getTicketInfo = async (invoiceId) =>
  api.get(`/member/ticket-info?invoiceId=${invoiceId}`);

// Lịch sử điểm thưởng
export const getScoreHistory = async (type) =>
  api.get('/member/score-history', { params: { type } });
