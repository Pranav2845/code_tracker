// backend/routes/user.js
import express from 'express';
import upload from '../middleware/upload.js';
import {
  getUserProfile,
  updateUserProfile,
  updatePlatforms,
  getUserStats,
  getDashboardAnalytics,
  getContributionStats,
  getLeetCodeTotalCount,
  getLeetCodeSolvedProblems,
  getGFGTotalCount,
  getGFGSolvedProblems,
  getCode360TotalCount,
  getCode360SolvedProblems,
  changePassword,
  uploadProfilePhoto,
} from '../controllers/userController.js';

const router = express.Router();

// All mounted at /api/user
router.get   ('/profile',                 getUserProfile);
router.patch ('/profile',                 updateUserProfile);
router.post  ('/profile/photo',           upload.single('photo'), uploadProfilePhoto);

router.patch ('/platforms',               updatePlatforms);
router.get   ('/stats',                   getUserStats);
router.get   ('/analytics',               getDashboardAnalytics);
router.get   ('/contributions',           getContributionStats);

router.get   ('/leetcode/problems/:username', getLeetCodeSolvedProblems);
router.get   ('/leetcode/count/:username',    getLeetCodeTotalCount);

router.get   ('/gfg/problems/:username',  getGFGSolvedProblems);
router.get   ('/gfg/count/:username',     getGFGTotalCount);

router.get   ('/code360/problems/:username', getCode360SolvedProblems);
router.get   ('/code360/count/:username',    getCode360TotalCount);

router.post  ('/change-password',         changePassword);

export default router;
