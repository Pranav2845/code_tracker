// src/App.jsx
import React, { useEffect } from "react";
import Routes from "./Routes";
import api from "./api/axios";

const DEBUG = import.meta.env.DEV;

function App() {
  // Quick health-check (only run if we have a token)
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    api
      .get("/user/profile")
      .then((res) => {
        if (DEBUG) console.log("✅ Profile OK:", res.data);
      })
      .catch((err) => {
        if (DEBUG) console.error("❌ Profile error:", err);
      });
  }, []);

  return <Routes />;
}

export default App;