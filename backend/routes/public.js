// backend/routes/public.js
import express from 'express';
import {
  getCodeChefTotalCount,
  getCodeChefSolvedProblems
} from '../controllers/userController.js';
const router = express.Router();


router.get('/user/codechef/count/:username', getCodeChefTotalCount);
router.get('/user/codechef/problems/:username', getCodeChefSolvedProblems);
export default router;
