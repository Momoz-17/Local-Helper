import axios from 'axios';

// Ensure only one baseURL is active based on your environment
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://finance-tracker-backend-u3qd.onrender.com/api' // Production Backend
    : 'http://localhost:5000/api',                             // Local Backend
  withCredentials: true // Crucial for passing cookies securely
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;