// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // points to your Render backend
  withCredentials: true,                  // needed if you use cookies/JWT
});

export default api;
