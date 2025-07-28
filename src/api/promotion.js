import api from '../constants/axios';

export const getPromotions = async () => api.get('/public/promotions');

export const StaffGetPromotions = async () => api.get(`/employee/products/all`);
