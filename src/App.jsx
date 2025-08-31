// src/App.jsx
import React, { useEffect } from "react";
import axios from "axios";
import Routes from "./Routes";
import { useAuth } from "@clerk/clerk-react";

const DEBUG = import.meta.env.DEV;

// 1️⃣ All requests to “/api/…” will be forwarded by Vite to your backend on :4028
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "/api";

function App() {
  const { getToken, isLoaded } = useAuth();

  // Register interceptor once Clerk has loaded
  useEffect(() => {
    if (!isLoaded) return;

    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [isLoaded, getToken]);

  // Quick health-check (only run if we have a token)
  useEffect(() => {
    if (!isLoaded) return;

    (async () => {
      const token = await getToken();
      if (!token) return;

      axios
        .get("/user/profile")
        .then((res) => {
          if (DEBUG) console.log("✅ Profile OK:", res.data);
        })
        .catch((err) => {
          if (DEBUG) console.error("❌ Profile error:", err);
        });
    })();
  }, [isLoaded, getToken]);

  return <Routes />;
}

export default App;
