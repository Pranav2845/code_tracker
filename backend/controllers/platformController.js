// backend/controllers/platformController.js
import PlatformAccount from '../models/PlatformAccount.js';
import Problem         from '../models/Problem.js';
import User            from '../models/User.js';
import { fetchLeetCodeProblems } from '../services/leetcode.js';
import { fetchCFProblems }      from '../services/codeforces.js';

export const syncPlatform = async (req, res) => {
  const { platform } = req.params;     // "leetcode" or "codeforces"
  const { handle }   = req.body;       // e.g. "pranav_pandey02"
  const userId       = req.user._id;   // injected by your auth middleware

  try {
    // 1) Save or update the PlatformAccount record
    let account = await PlatformAccount.findOne({ user: userId, platform });
    if (account) {
      account.handle   = handle;
      account.syncedAt = Date.now();
      await account.save();
    } else {
      account = await PlatformAccount.create({
        user:     userId,
        platform,
        handle,
        syncedAt: Date.now(),
      });
    }

    // 1b) Mirror that handle into the User.platforms sub-document
    await User.findByIdAndUpdate(userId, {
      $set: { [`platforms.${platform}.handle`]: handle }
    });

    // 2) Fetch their solved problems from the external API
    let submissions = [];
    if (platform === 'codeforces') {
      submissions = await fetchCFProblems(handle);
    } else if (platform === 'leetcode') {
      submissions = await fetchLeetCodeProblems(handle);
    } else {
      return res.status(400).json({ message: `Unsupported platform: ${platform}` });
    }

    // 3) Persist into your Problem collection (clear out old ones first)
    await Problem.deleteMany({ user: userId, platform });
    const created = await Promise.all(
      submissions.map(p =>
        Problem.create({
          user:       userId,
          platform:   platform,
          problemId:  p.id,
          title:      p.title,
          difficulty: p.difficulty,
          tags:       p.tags,
          solvedAt:   p.solvedAt,
        })
      )
    );

    // 4) Return the updated account + how many were imported
    res.json({
      account,
      importedCount: created.length
    });

  } catch (err) {
    console.error('Error in syncPlatform:', err);
    // Distinguish external-fetch errors vs. db errors if you like
    res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};
