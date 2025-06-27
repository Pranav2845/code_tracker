// backend/routes/platform.js
import express from 'express';
import { syncPlatform } from '../controllers/platformController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/sync/:platform', syncPlatform);
export default router;