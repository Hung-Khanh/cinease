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

// Helper to force logout and redirect
function forceLogoutAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  // Clear any other relevant keys if needed
  window.location.replace("/login");
}

if (api && api.interceptors && api.interceptors.response) {
  api.interceptors.response.use(
    (response) => {
      if (
        response?.data?.status === "INACTIVE" ||
        (response?.data?.data && response.data.data.status === "INACTIVE")
      ) {
        forceLogoutAndRedirect();
        return Promise.reject({ forcedLogout: true });
      }
      return response;
    },
    (error) => {
      // If error response contains INACTIVE status, force logout
      if (
        error?.response?.data?.status === "INACTIVE" ||
        (error?.response?.data?.data && error.response.data.data.status === "INACTIVE")
      ) {
        forceLogoutAndRedirect();
        return Promise.reject({ forcedLogout: true });
      }
      return Promise.reject(error);
    }
  );
}

export default api;