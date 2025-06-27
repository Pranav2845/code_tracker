// backend/routes/problem.js
import express from 'express';
import { addProblem, getProblems } from '../controllers/problemController.js';

const router = express.Router();
router.post('/', addProblem);
router.get('/', getProblems);
export default router;