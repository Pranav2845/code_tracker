// backend/routes/userRoutes.js
import express from 'express';
import { getUserProfile, updatePlatforms, getUserStats } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// NO leading `/user` here — these are all mounted at `/api/user`
router.get   ('/profile',   authMiddleware, getUserProfile);
router.patch ('/platforms', authMiddleware, updatePlatforms);
router.get   ('/stats',     authMiddleware, getUserStats);

export default router;
