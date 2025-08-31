// backend/routes/platform.js
import express from 'express';

import { syncPlatform } from '../controllers/platformController.js';
import { ensureUser } from '../controllers/userController.js';

const router = express.Router();
router.post('/sync/:platform', ensureUser, syncPlatform);
export default router;