// backend/routes/platform.js
import express from 'express';

import { syncPlatform } from '../controllers/platformController.js';

const router = express.Router();
router.post('/sync/:platform', syncPlatform);
export default router;