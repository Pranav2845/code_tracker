// backend/routes/platform.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { syncPlatform } from '../controllers/platformController.js';

const router = express.Router();
router.post('/sync/:platform', authMiddleware, syncPlatform);
export default router;