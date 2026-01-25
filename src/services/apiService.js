import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired or unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Login API call (use configured endpoint)
export const login = (credentials) => {
  return apiClient.post(API_ENDPOINTS.LOGIN, credentials);
};

// Generic GET request
export const getRequest = (url, config) => {
  return apiClient.get(url, config);
};

// Generic POST request
export const postRequest = (url, data, config) => {
  return apiClient.post(url, data, config);
};

// Generic PUT request
export const putRequest = (url, data, config) => {
  return apiClient.put(url, data, config);
};

// Generic DELETE request
export const deleteRequest = (url) => {
  return apiClient.delete(url);
};

// Logout function
export const logout = () => {
  localStorage.removeItem('jwtToken');
  window.location.href = '/login';
};

export default apiClient;
