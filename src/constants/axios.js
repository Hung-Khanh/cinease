import axios from 'axios';
import baseUrl from './baseUrl';

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  }
});

const handleBefore = (config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore);

export default api;