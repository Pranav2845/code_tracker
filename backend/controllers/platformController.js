// backend/controllers/platformController.js

import PlatformAccount from '../models/PlatformAccount.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { getAuth } from '@clerk/express';

import { fetchLeetCodeProblems } from '../services/leetcode.js';
import { fetchCFProblems } from '../services/codeforces.js';
import { fetchGFGProblems } from '../services/gfg.js';
import {
  fetchCodeChefSolvedCount,
  fetchCodeChefProblems,
} from '../services/codechef.js';

import {
  fetchCode360Problems,
  fetchCode360ProfileTotalCount
} from '../services/code360.js';
import { fetchHackerRankProblems } from '../services/hackerrank.js';

export const syncPlatform = async (req, res) => {
  const { userId } = getAuth(req);
  console.log('📡 syncPlatform called:', {
    userId,
    params: req.params,
    body:   req.body,
  });

  if (!userId) {
    console.warn('⚠️ syncPlatform: missing userId');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { platform } = req.params;
  const handle = (req.body.handle || '').trim();

  // ─── Validate Code360 upfront ───────────────────────────────────────────
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

  // ─── Upsert PlatformAccount ─────────────────────────────────────────────
  let account = await PlatformAccount.findOne({ user: userId, platform });
  if (account) {
    account.handle   = handle;
    account.syncedAt = new Date();
    await account.save();
  } else {
    account = await PlatformAccount.create({
      user:     userId,
      platform,
      handle,
      syncedAt: new Date(),
    });
  }

  // ─── Save handle in User.profile ────────────────────────────────────────
  await User.findByIdAndUpdate(userId, {
    $set: { [`platforms.${platform}.handle`]: handle }
  });

  // ─── Fetch problems for all platforms ───────────────────────────────────
  try {
    let problems = [];
    switch (platform) {
      case 'leetcode':
        problems = await fetchLeetCodeProblems(handle);
        break;

      case 'codechef':
        try {
          problems = await fetchCodeChefProblems(handle);
        } catch (err) {
          console.warn('⚠️ fetchCodeChefProblems failed:', err.message);
          try {
            const solvedCount = await fetchCodeChefSolvedCount(handle);
            await Problem.deleteMany({ user: userId, platform: 'codechef' });
            return res.status(200).json({
              message: '✅ CodeChef synced successfully!',
              account,
              importedCount: solvedCount,
            });
          } catch {
            return res.status(404).json({ message: 'CodeChef user not found' });
          }
        }
        break;

      case 'codeforces':
        problems = await fetchCFProblems(handle);
        break;

      case 'gfg':
        problems = await fetchGFGProblems(handle);
        break;

      case 'code360':
        problems = await fetchCode360Problems(handle);
        break;

      case 'hackerrank': {
        const result = await fetchHackerRankProblems(handle);
        if (result.message) {
          return res.status(200).json({
            message:       result.message,
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

    console.log(
      `✅ fetch${platform} returned ${
        Array.isArray(problems) ? problems.length : 'NON-ARRAY'
      } items`
    );

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(200).json({
        message:       '⚠️ No problems imported. Double-check your handle & submission visibility.',
        account,
        importedCount: 0,
      });
    }

    const docs = problems.map(p => ({
      user:      userId,
      platform,
      problemId: p.id,
      title:     p.title,
      difficulty:p.difficulty,
      tags:      p.tags,
      solvedAt:  p.solvedAt,
      url:       p.url,
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
    return res.status(200).json({
      message:       '✅ Platform synced successfully!',
      account,
      importedCount: insertedCount,
    });

  } catch (err) {
    console.error('❌ Error in syncPlatform:', err.stack || err);
    return res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};
