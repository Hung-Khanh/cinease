import axios from 'axios';
const baseUrl = 'https://legally-actual-mollusk.ngrok-free.app/api';

const config = {
    baseURL: baseUrl,
};

const api = axios.create(config);

const handleBefore = (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
};

api.interceptors.request.use(handleBefore);

export default api;