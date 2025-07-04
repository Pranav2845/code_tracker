// backend/controllers/platformController.js

import PlatformAccount from '../models/PlatformAccount.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';

import { fetchLeetCodeProblems } from '../services/leetcode.js';
import { fetchCFProblems } from '../services/codeforces.js';
import { fetchGFGProblems } from '../services/gfg.js';
import {
  fetchCode360Problems,
  fetchCode360ProfileTotalCount
} from '../services/code360.js';
import { fetchCSESProblems } from '../services/cses.js';
import { fetchCodeChefProblems } from '../services/codechef.js';
import { fetchHackerRankProblems } from '../services/hackerrank.js';

export const syncPlatform = async (req, res) => {
  console.log('📡 syncPlatform called:', {
    user: req.user && { id: req.user._id, email: req.user.email },
    params: req.params,
    body: req.body,
  });

  if (!req.user) {
    console.warn('⚠️ syncPlatform: missing req.user');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { platform } = req.params;
  const handle = (req.body.handle || '').trim();
  const userId = req.user._id;

  if (platform === 'code360') {
    try {
      const totalCount = await fetchCode360ProfileTotalCount(handle);
      if (totalCount == null) {
        return res.status(404).json({ message: 'Code360 user not found' });
      }
    } catch (err) {
      console.error('❌ Code360 validation error:', err.message);
      return res.status(404).json({ message: 'Code360 user not found' });
    }
  }

  try {
    // 1️⃣ Upsert PlatformAccount
    let account = await PlatformAccount.findOne({ user: userId, platform });
    if (account) {
      account.handle = handle;
      account.syncedAt = new Date();
      await account.save();
    } else {
      account = await PlatformAccount.create({
        user: userId,
        platform,
        handle,
        syncedAt: new Date(),
      });
    }

    // 2️⃣ Save handle in User
    await User.findByIdAndUpdate(userId, {
      $set: { [`platforms.${platform}.handle`]: handle }
    });

    // 3️⃣ Fetch problems
    let problems = [];
    switch (platform) {
      case 'leetcode':
        problems = await fetchLeetCodeProblems(handle);
        break;
      case 'codeforces':
        problems = await fetchCFProblems(handle);
        break;
      case 'gfg':
        problems = await fetchGFGProblems(handle);
        break;
      case 'code360':
        try {
          problems = await fetchCode360Problems(handle);
        } catch (err) {
          console.error('❌ Code360 fetch error:', err.message);
          if (/user not found/i.test(err.message)) {
            return res.status(404).json({ message: 'Code360 user not found' });
          }
          return res.status(503).json({
            message: 'Code360 could not be reached. Please try again later.'
          });
        }
        break;
      case 'cses':
        problems = await fetchCSESProblems(handle);
        break;
      case 'codechef':
        problems = await fetchCodeChefProblems(handle);
        break;
      case 'hackerrank': {
        const result = await fetchHackerRankProblems(handle);
        if (result.message) {
          console.warn(result.message);
          return res.status(200).json({
            message: result.message,
            account,
            importedCount: 0,
          });
        }
        problems = result.problems;
        break;
      }
      default:
        console.error('🚫 Unsupported platform in syncPlatform:', platform);
        return res.status(400).json({ message: `Unsupported platform: ${platform}` });
    }

    console.log(`✅ fetch${platform} returned ${Array.isArray(problems) ? problems.length : 'NON-ARRAY'} items`);

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(200).json({
        message: '⚠️ No problems imported. Double-check your handle & submission visibility.',
        account,
        importedCount: 0
      });
    }

    // 4️⃣ Bulk insert with conflict handling
    const docs = problems.map(p => ({
      user: userId,
      platform,
      problemId: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      solvedAt: p.solvedAt,
    }));

    let insertedCount = 0;
    try {
      const inserted = await Problem.insertMany(docs, { ordered: false });
      insertedCount = inserted.length;
    } catch (insertErr) {
      console.warn('⚠️ insertMany partial failure (duplicates ignored):', insertErr.message);
      insertedCount = insertErr.insertedDocs?.length || 0;
    }

    console.log(`🥳 Saved ${insertedCount} problems for user ${userId} on ${platform}`);
    return res.json({
      message: '✅ Platform synced successfully!',
      account,
      importedCount: insertedCount,
    });

  } catch (err) {
    console.error('❌ Error in syncPlatform:', err.stack || err);
    return res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};
