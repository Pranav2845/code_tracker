import PlatformAccount from '../models/PlatformAccount.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { fetchLeetCodeProblems } from '../services/leetcode.js';
import { fetchCFProblems } from '../services/codeforces.js';
import { fetchGFGProblems } from '../services/gfg.js';
import { fetchCodingNinjasProblems } from '../services/codingninjas.js';
import { fetchCSESProblems } from '../services/cses.js';
import { fetchCodeChefProblems } from '../services/codechef.js';
import { fetchHackerRankProblems } from '../services/hackerrank.js';

export const syncPlatform = async (req, res) => {
  const { platform } = req.params;     // e.g. 'leetcode'
  const { handle } = req.body;         // e.g. 'pranav_pandey02'
  const userId = req.user._id;

  try {
    // 1. Save or update the PlatformAccount
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

    // 2. Update user profile for platform handle
    await User.findByIdAndUpdate(userId, {
      $set: { [`platforms.${platform}.handle`]: handle }
    });

    // 3. Fetch problems based on platform
    let problems = [];
    if (platform === 'leetcode') {
      problems = await fetchLeetCodeProblems(handle);
    } else if (platform === 'codeforces') {
      problems = await fetchCFProblems(handle);
    } 
     else if (platform === 'gfg') {
      problems = await fetchGFGProblems(handle);
    } else if (platform === 'codingninjas') {
      problems = await fetchCodingNinjasProblems(handle);
    } else if (platform === 'cses') {
      problems = await fetchCSESProblems(handle);
    } else if (platform === 'codechef') {
      problems = await fetchCodeChefProblems(handle);
    } else if (platform === 'hackerrank') {
      problems = await fetchHackerRankProblems(handle);
    }
    else {
      return res.status(400).json({ message: `Unsupported platform: ${platform}` });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(200).json({
        message: '⚠️ No problems imported. Double-check your handle & make sure your submissions are public.',
        account,
        importedCount: 0
      });
    }

    // 4. Clear old problems
    await Problem.deleteMany({ user: userId, platform });

    // 5. Save new problems
    const created = await Promise.all(
      problems.map(p =>
        Problem.create({
          user: userId,
          platform,
          problemId: p.id,
          title: p.title,
          difficulty: p.difficulty,
          tags: p.tags,
          solvedAt: p.solvedAt,
        })
      )
    );

    res.json({
      message: '✅ Platform synced successfully!',
      account,
      importedCount: created.length,
    });

  } catch (err) {
    console.error('❌ Error in syncPlatform:', err);
    res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};
