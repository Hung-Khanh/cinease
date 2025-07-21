import axios from 'axios';
import baseUrl from './baseUrl';

let api;
if (process.env.NODE_ENV === 'test') {
  // Use default axios instance for test to avoid mock issues
  api = axios;
} else {
  api = axios.create({
    baseURL: baseUrl,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
    }
  });

  const handleBefore = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  };

  api.interceptors.request.use(handleBefore);
}

export default api;