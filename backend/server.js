// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./config/db.js";

import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/user.js";
import platformRoutes from "./routes/platform.js";
import problemRoutes  from "./routes/problem.js";
import contestRoutes  from "./routes/contests.js";
import publicRoutes   from "./routes/public.js";
import geminiRoutes   from "./routes/gemini.js";
import authMiddleware from "./middleware/auth.js";

import { notFound, errorHandler } from "./utils/errorHandler.js";

dotenv.config();

// ---- DB ----
connectDB();

const app = express();

// ---- Files / uploads (ephemeral on Render Free) ----
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---- Middleware ----
const allowedOrigins = [
  "http://localhost:3000",                 // local dev
  "https://code-tracker-7o7s.vercel.app",  // <-- replace with your Vercel domain if different
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ---- Simple health & root (useful for uptime checks) ----
app.get("/", (_req, res) => {
  res.type("text").send("🚀 CodeTracker backend is running on Render");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "code-tracker-backend",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// ---- Public routes (no auth) ----
app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);           // keep before auth
app.use("/api/contests", contestRoutes);
app.use("/api/ai", geminiRoutes);

// Handy ping under /api too
app.get("/api", (_req, res) => {
  res.json({ message: "API is running" });
});

// ---- Protected routes (require auth) ----
app.use("/api", authMiddleware);
app.use("/api/user", userRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/problems", problemRoutes);

// ---- 404 & error handler ----
app.use(notFound);
app.use(errorHandler);

// ---- Start ----
const PORT = process.env.PORT || 5000; // Render will inject PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
