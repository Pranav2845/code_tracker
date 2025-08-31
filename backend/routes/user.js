// backend/routes/user.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePlatforms,
  getUserStats,

  getDashboardAnalytics,
  getContributionStats,

  getLeetCodeTotalCount,
  getLeetCodeSolvedProblems,

  getCode360TotalCount,
  getCode360SolvedProblems,

} from '../controllers/userController.js';

const router = express.Router();

// these are all mounted at /api/user — no extra “/user” prefix here
router.get   ('/profile',   getUserProfile);
router.patch ('/profile',   updateUserProfile);
router.patch ('/platforms', updatePlatforms);
router.get   ('/stats',     getUserStats);
router.get   ('/analytics', getDashboardAnalytics);
router.get   ('/contributions', getContributionStats);
router.get   ('/leetcode/problems/:username', getLeetCodeSolvedProblems);
router.get   ('/leetcode/count/:username', getLeetCodeTotalCount);
router.get   ('/code360/problems/:username', getCode360SolvedProblems);
router.get   ('/code360/count/:username', getCode360TotalCount);

export default router;
