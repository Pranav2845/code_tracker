// backend/routes/problem.js
import express from 'express';
import { addProblem, getProblems } from '../controllers/problemController.js';
import { ensureUser } from '../controllers/userController.js';

const router = express.Router();
router.post('/', ensureUser, addProblem);
router.get('/', ensureUser, getProblems);
export default router;