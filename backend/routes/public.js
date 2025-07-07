// backend/routes/public.js
import express from 'express';
import {
  getCSESSolvedProblems,
  getCodeChefTotalCount,
  getCodeChefSolvedProblems
} from '../controllers/userController.js';
const router = express.Router();

router.get('/cses/problems/:handle', getCSESSolvedProblems);
// alias to match /api/user/cses/problems/:handle without auth
router.get('/user/cses/problems/:handle', getCSESSolvedProblems);
router.get('/user/codechef/count/:username', getCodeChefTotalCount);
router.get('/user/codechef/problems/:username', getCodeChefSolvedProblems);
export default router;
