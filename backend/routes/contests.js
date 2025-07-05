import express from 'express';
import { getUpcomingContests } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUpcomingContests);

export default router;