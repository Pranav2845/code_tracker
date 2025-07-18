// backend/routes/user.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePlatforms,
  getUserStats,
  getCSESSolvedProblems,
  getDashboardAnalytics,
  getContributionStats,
  getCSESSubmissionCount,
  getCode360TotalCount,
  getCode360SolvedProblems,

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
router.get   ('/code360/problems/:username', getCode360SolvedProblems);
router.get   ('/code360/count/:username', getCode360TotalCount);
router.get   ('/cses/problems/:handle', getCSESSolvedProblems);

export default router;
