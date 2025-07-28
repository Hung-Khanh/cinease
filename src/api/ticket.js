import api from '../constants/axios';

export const getTicketInfo = async (invoiceId) =>
  api.get(`/member/ticket-info?invoiceId=${invoiceId}`);

export const getScoreHistory = async (type) =>
  api.get('/member/score-history', { params: { type } });
