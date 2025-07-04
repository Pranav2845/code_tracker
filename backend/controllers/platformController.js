// backend/controllers/platformController.js

import PlatformAccount from '../models/PlatformAccount.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { fetchLeetCodeProblems } from '../services/leetcode.js';
import { fetchCFProblems } from '../services/codeforces.js';
import { fetchGFGProblems } from '../services/gfg.js';
import { fetchCode360Problems } from '../services/code360.js'; // <-- updated import
import { fetchCSESProblems } from '../services/cses.js';
import { fetchCodeChefProblems } from '../services/codechef.js';
import { fetchHackerRankProblems } from '../services/hackerrank.js';

export const syncPlatform = async (req, res) => {
  // ▶️ DEBUG: incoming request
  console.log('📡 syncPlatform called:', {
    user: req.user && { id: req.user._id, email: req.user.email },
    params: req.params,
    body: req.body,
  });

  // Defensive auth check
  if (!req.user) {
    console.warn('⚠️ syncPlatform: missing req.user');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { platform } = req.params; // e.g. 'gfg'
   const handle = (req.body.handle || '').trim(); // ensure no leading/trailing spaces
  const userId = req.user._id;

  try {
    // 1️⃣ Upsert the PlatformAccount
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

    // 2️⃣ Save handle in User profile
    await User.findByIdAndUpdate(userId, {
      $set: { [`platforms.${platform}.handle`]: handle }
    });

    // 3️⃣ Fetch problems from the chosen service
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
      case 'code360': // <-- updated
        try {
          problems = await fetchCode360Problems(handle); // <-- updated
        } catch (err) {
          console.error('❌ Code360 fetch error:', err.message); // <-- updated
          if (/user not found/i.test(err.message)) {
            return res.status(404).json({ message: 'Code360 user not found' }); // <-- updated
          }
          return res.status(503).json({
            message: 'Code360 could not be reached. Please try again later.' // <-- updated
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

    // 4️⃣ Handle case of no problems
    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(200).json({
        message: '⚠️ No problems imported. Double-check your handle & submission visibility.',
        account,
        importedCount: 0
      });
    }

    // 5️⃣ Clear out old problems and save the new set
    await Problem.deleteMany({ user: userId, platform });
    const created = await Promise.all(
      problems.map(p =>
        Problem.create({
          user:      userId,
          platform,
          problemId: p.id,
          title:     p.title,
          difficulty:p.difficulty,
          tags:      p.tags,
          solvedAt:  p.solvedAt,
        })
      )
    );

    console.log(`🥳 Saved ${created.length} problems for user ${userId} on ${platform}`);
    return res.json({
      message:       '✅ Platform synced successfully!',
      account,
      importedCount: created.length,
    });

  } catch (err) {
    // Log full stack for easier debugging
    console.error('❌ Error in syncPlatform:', err.stack || err);
    return res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};
