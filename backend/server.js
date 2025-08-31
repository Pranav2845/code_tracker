import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes     from './routes/user.js';
import platformRoutes from './routes/platform.js';
import problemRoutes  from './routes/problem.js';
import contestRoutes  from './routes/contests.js';

import publicRoutes   from './routes/public.js';
import geminiRoutes   from './routes/gemini.js';

import { notFound, errorHandler } from './utils/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

// 1️⃣ Global middleware
app.use(cors());
app.use(express.json());

// 2️⃣ Public routes (must be before Clerk)
app.use('/api', publicRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/ai', geminiRoutes);


// 4️⃣ Protected resource routes
app.use('/api/user',     userRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/problems', problemRoutes);

// 5️⃣ Health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// 6️⃣ 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
