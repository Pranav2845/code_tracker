// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Apply saved theme preference before React renders
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.documentElement.classList.add("dark");
else document.documentElement.classList.remove("dark");

const container = document.getElementById("root");
const root = createRoot(container);

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
