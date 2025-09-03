// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // e.g. https://code-tracker-cg14.onrender.com/api
  headers: { "Content-Type": "application/json" },
  // Do NOT set withCredentials unless you use cookie auth.
});

// Attach Bearer token (stored in sessionStorage or localStorage)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // or localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: global 401 handling
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // e.g., sessionStorage.removeItem("token"); window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
