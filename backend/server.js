// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Public routes
import authRoutes from "./routes/auth.js";

// Protected routes
import userRoutes from "./routes/user.js";
import platformRoutes from "./routes/platform.js";
import problemRoutes from "./routes/problem.js";

// Helpers
import authMiddleware from "./middleware/auth.js";
import { notFound, errorHandler } from "./utils/errorHandler.js";

dotenv.config();
connectDB();

const app = express();

// 1️⃣ Global middleware
app.use(cors());         // enable CORS
app.use(express.json()); // parse JSON bodies

// 2️⃣ Public routes (no JWT required)
app.use("/api/auth", authRoutes);

// 3️⃣ Public heartbeat
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// 4️⃣ Protect everything below with JWT middleware
app.use("/api", authMiddleware);

// 5️⃣ Now mount your protected routes
app.use("/api/user", userRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/problems", problemRoutes);

// 6️⃣ 404 & error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
