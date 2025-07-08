// File: backend/routes/contests.js
import express from 'express';
import { getContests, refreshContests } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getContests);
router.post('/refresh', refreshContests);

export default router;