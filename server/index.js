import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import platformRoutes from './routes/platforms.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder (optional)
app.use(express.static(path.resolve('public')));



// Define a simple homepage route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Code Tracker Backend!</h1>');
});

// Use your existing routes
app.use('/auth', authRoutes);
app.use('/api/platforms', platformRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
