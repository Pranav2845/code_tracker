// File: backend/routes/contests.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

import { refreshContests } from '../controllers/userController.js';

dotenv.config();
const router = express.Router();

export function detectPlatform(url = '', fallback = '') {
  if (!url && !fallback) return '';

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  if (host.includes('codeforces')) return 'codeforces';
  if (host.includes('leetcode')) return 'leetcode';
  if (host.includes('atcoder')) return 'atcoder';
  if (host.includes('codechef')) return 'codechef';
  if (host.includes('hackerrank')) return 'hackerrank';
if (host.includes('geeksforgeeks')) return 'gfg';
  if (host.includes('codingninjas.com')) return 'code360';
  if (host.includes('naukri.com') && url.includes('/code360')) return 'code360';
  return fallback;
}

// Fetch contests from CLIST API using credentials from .env
router.get('/', async (req, res) => {
  try {
    const resp = await axios.get('https://clist.by/api/v4/contest/', {
       headers: {
          Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
        },
        params: {
          format: 'json',
          resource__in: 'codeforces.com,leetcode.com,atcoder.jp,codechef.com,hackerrank.com,geeksforgeeks.org,naukri.com/code360',
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
        id: c.id,
         platform: detectPlatform(c.href, c.resource?.name || c.resource?.host).toLowerCase(),
        name: c.event,
        url: c.href,
        startTime: c.start,
        endTime: c.end,
        duration: c.duration,
        host: c.host || c.resource?.host || '',
        resource: c.resource?.host || c.resource?.name,
        n_problems: c.n_problems ?? null,
       }));

    res.json(list);
  } catch (err) {
    console.error('❌ CLIST contests fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch both upcoming and past contests from CLIST
router.get('/all', async (req, res) => {
  try {
    const headers = {
      Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
    };
    const baseParams = {
      format: 'json',
      resource__in:
        'codeforces.com,leetcode.com,atcoder.jp,codechef.com,hackerrank.com,geeksforgeeks.org,naukri.com/code360',
      order_by: 'start',
      limit: 100,
    };

    const [upcomingResp, pastResp] = await Promise.all([
      axios.get('https://clist.by/api/v4/contest/', {
        headers,
        params: { ...baseParams, upcoming: true },
      }),
      axios.get('https://clist.by/api/v4/contest/', {
        headers,
        params: {
          ...baseParams,
          upcoming: false,
          start__lt: new Date().toISOString(),
        },
      }),
    ]);

    const extract = (resp) =>
      Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data?.objects)
        ? resp.data.objects
        : [];

    const mapList = (objs) =>
      objs.map((c) => ({
        id: c.id,
        platform: detectPlatform(c.href, c.resource?.name || c.resource?.host).toLowerCase(),
        name: c.event,
        url: c.href,
        startTime: c.start,
        endTime: c.end,
        duration: c.duration,
        host: c.host || c.resource?.host || '',
        resource: c.resource?.host || c.resource?.name,
        n_problems: c.n_problems ?? null,
      }));

    const upcoming = mapList(extract(upcomingResp));
    const past = mapList(extract(pastResp));

    res.json({ upcoming, past });
  } catch (err) {
    console.error('❌ CLIST contests fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Manual refresh of contests stored in DB (optional)
router.post('/refresh', refreshContests);

export default router;