// src/api/auth.js
import api from "./axios";

export const register = (data) => api.post("/auth/register", data);
export const login    = (data) => api.post("/auth/login", data);
export const profile  = ()      => api.get("/user/profile");