import axios from 'axios';

// Dynamically picks the base URL according to Vite's current build mode
const API = axios.create({
  baseURL: import.meta.env.MODE === 'production'
    ? 'https://finance-tracker-backend-u3qd.onrender.com/api' // Live Render Backend
    : 'http://localhost:5000/api',                             // Local Development Backend
  withCredentials: true // Crucial for passing HTTP-Only authentication cookies safely
});

// Automatic request interceptor for handling backup Token-based workflows
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;