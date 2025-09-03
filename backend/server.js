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
connectDB();

const app = express();

// ---- Files / uploads (ephemeral on Render Free) ----
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---- CORS (local dev + production) ----
const isProd = process.env.NODE_ENV === "production";
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "https://code-tracker-7o7s.vercel.app";

const allowedOrigins = isProd
  ? [FRONTEND_ORIGIN] // Set FRONTEND_ORIGIN in Render env to avoid hardcoding
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow Postman/cURL/no-origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: false, // keep false (you use Bearer tokens, not cookies)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // IMPORTANT: reuse the same options

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ---- Root & health ----
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

// ---- Public routes ----
app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);          // must be before auth middleware
app.use("/api/contests", contestRoutes);
app.use("/api/ai", geminiRoutes);

// Ping under /api
app.get("/api", (_req, res) => res.json({ message: "API is running" }));

// ---- Protected routes ----
app.use("/api", authMiddleware);
app.use("/api/user",     userRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/problems", problemRoutes);

// ---- 404 + error handler ----
app.use(notFound);
app.use(errorHandler);

// ---- Start ----
const PORT = process.env.PORT || 5000; // Render injects PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
