// backend/routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePlatforms,
  getUserStats,
  getDashboardAnalytics,
  getContributionStats,
  getCSESSubmissionCount,
  changePassword
} from '../controllers/userController.js';

const router = express.Router();

// these are all mounted at /api/user — no extra “/user” prefix here
router.get   ('/profile',   getUserProfile);
router.patch ('/profile',   updateUserProfile);
router.patch ('/platforms', updatePlatforms);
router.get   ('/stats',     getUserStats);
router.get   ('/analytics', getDashboardAnalytics);
router.get   ('/contributions', getContributionStats);
router.get   ('/cses/submissions', getCSESSubmissionCount);
router.post  ('/change-password', changePassword);
export default router;
