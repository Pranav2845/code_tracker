// src/api/axios.js
import axios from "axios";

// Create a single Axios instance for the whole app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // already includes `/api`
  // withCredentials: true,
});

// Attach token from sessionStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;