import api from '../constants/axios';

// Lấy danh sách khuyến mãi
export const getPromotions = async () => api.get('/public/promotions');
