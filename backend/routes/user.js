// backend/routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  updatePlatforms,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// these are all mounted at /api/user — no extra “/user” prefix here
router.get   ('/profile',   getUserProfile);
router.patch ('/platforms', updatePlatforms);
router.get   ('/stats',     getUserStats);

export default router;
