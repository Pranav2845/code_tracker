// File: backend/routes/contests.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

import { refreshContests } from '../controllers/userController.js';

dotenv.config();
const router = express.Router();


// Fetch contests from CLIST API using credentials from .env
router.get('/', async (req, res) => {
  try {
    const resp = await axios.get('https://clist.by/api/v4/contest/', {
       headers: {
          Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
        },
        params: {
          format: 'json',
          resource__in: 'codeforces.com,leetcode.com,atcoder.jp,codechef.com',
          upcoming: true,
          order_by: 'start',
          limit: 100,
        },
      });

    // Map response to frontend friendly format
    // CLIST may return an object with `objects` array or just an array directly
    const objects = Array.isArray(resp.data)
      ? resp.data
      : Array.isArray(resp.data?.objects)
        ? resp.data.objects
        : [];

    const list = objects.map((c) => ({
          platform: c.resource?.name || c.resource?.host || '',
          name: c.event,
          url: c.href,
          startTime: c.start,
          endTime: c.end,
          duration: c.duration,
         }));

    res.json(list);
  } catch (err) {
    console.error('❌ CLIST contests fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Manual refresh of contests stored in DB (optional)
router.post('/refresh', refreshContests);

export default router;