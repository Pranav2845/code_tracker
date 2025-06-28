// src/App.jsx
import React, { useEffect } from "react";
import axios from "axios";
import Routes from "./Routes";

// 1️⃣ All requests to “/api/…” will be forwarded by Vite to your backend on :4028
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; 

// 2️⃣ Inject the JWT token on every request if present
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  // Quick health-check (only run if we have a token)
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    axios
      .get("/user/profile")
      .then((res) => console.log("✅ Profile OK:", res.data))
      .catch((err) => console.error("❌ Profile error:", err));
  }, []);

  return <Routes />;
}

export default App;
