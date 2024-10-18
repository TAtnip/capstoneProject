import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Function to refresh the token
const refreshToken = async () => {
  const refresh = localStorage.getItem(REFRESH_TOKEN);
  if (!refresh) {
    return Promise.reject('No refresh token available');
  }
  try {
    const response = await api.post('/api/token/refresh/', { refresh });
    console.log('Valid response received, new access token acquired');
    localStorage.setItem(ACCESS_TOKEN, response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Error refreshing token', error);
    return Promise.reject(error);
  }
};

// Axios interceptor for handling 401 errors due to access token expiration
api.interceptors.response.use(
  (response) => response, // Forward the successful response
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 and this is not a token refresh request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Refresh the access token
        const newAccessToken = await refreshToken();
        // Update the Authorization header with the new token
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        // If refresh token fails, clear localStorage and handle logout
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = '/login'; // Redirect to login if refresh fails to allow the user to re-login
        return Promise.reject(err);
      }
    }

    return Promise.reject(error); // Forward other errors
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;