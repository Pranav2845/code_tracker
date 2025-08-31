// backend/routes/user.js
import express from 'express';
import {
  getUserProfile,
  updatePlatforms,
  getUserStats,

  getDashboardAnalytics,
  getContributionStats,

  getLeetCodeTotalCount,
  getLeetCodeSolvedProblems,

  getCode360TotalCount,
  getCode360SolvedProblems,
  ensureUser,
} from '../controllers/userController.js';

const router = express.Router();

// these are all mounted at /api/user — no extra “/user” prefix here
router.get   ('/profile',   ensureUser, getUserProfile);
router.patch ('/platforms', ensureUser, updatePlatforms);
router.get   ('/stats',     ensureUser, getUserStats);
router.get   ('/analytics', ensureUser, getDashboardAnalytics);
router.get   ('/contributions', ensureUser, getContributionStats);
router.get   ('/leetcode/problems/:username', getLeetCodeSolvedProblems);
router.get   ('/leetcode/count/:username', getLeetCodeTotalCount);
router.get   ('/code360/problems/:username', getCode360SolvedProblems);
router.get   ('/code360/count/:username', getCode360TotalCount);

export default router;
