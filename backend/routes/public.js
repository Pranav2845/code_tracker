// backend/routes/public.js
import express from 'express';
import { getCSESSolvedProblems } from '../controllers/userController.js';
const router = express.Router();

router.get('/cses/problems/:handle', getCSESSolvedProblems);

export default router;
