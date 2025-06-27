
// backend/routes/problem.js
import express from 'express';
import { addProblem, getProblems } from '../controllers/problemController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/', addProblem);
router.get('/', getProblems);
export default router;