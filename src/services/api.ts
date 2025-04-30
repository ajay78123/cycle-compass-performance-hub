import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // Handle error
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('Error response:', error.response);
  } else if (error.request) {
    // No response was received
    console.error('Error request:', error.request);
  } else {
    // Something else caused the error
    console.error('Error message:', error.message);
  }
  return Promise.reject(error);
});

export default api;
