// backend/controllers/userController.js
import User from '../models/User.js';
import Problem from '../models/Problem.js'; // ← ensure we can query the Problem collection
import PlatformAccount from '../models/PlatformAccount.js';
import bcrypt from 'bcryptjs';
import { fetchLeetCodeSolvedCount } from '../services/leetcode.js';
import { fetchCSESCount, fetchCSESSubmissionCount } from '../services/cses.js';
import { fetchGFGSolvedCount } from '../services/gfg.js';
import {
  fetchCode360SolvedCount,
  fetchCode360ContributionStats,
  fetchCode360ProfileTotalCount,
} from '../services/code360.js';
import { fetchHackerRankSolvedCount } from '../services/hackerrank.js';

/**
 * GET /api/user/profile
 * Returns the current user's profile information.
 */
export const getUserProfile = async (req, res) => {
  // req.user is populated by authMiddleware
  const { name, email, createdAt, platforms } = req.user;
  res.json({ name, email, createdAt, platforms });
};

/**
 * PATCH /api/user/platforms
 * Updates the user.platforms sub‐document.
 */
export const updatePlatforms = async (req, res) => {
  const { platforms } = req.body;
  const user = req.user;
  const disconnected = [];

  Object.entries(platforms).forEach(([platform, handle]) => {
    const sanitized = handle || '';
    user.platforms[platform].handle = sanitized;
    if (!sanitized) disconnected.push(platform);
  });

  await user.save();
  if (disconnected.length) {
    await Problem.deleteMany({
      user: user._id,
      platform: { $in: disconnected },
    });
    await PlatformAccount.deleteMany({
      user: user._id,
      platform: { $in: disconnected },
    });
  }

  res.json(user.platforms);
};

/**
 * PATCH /api/user/profile
 * Update the user's name and email
 */
export const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (typeof name === 'string') {
      user.name = name;
    }

    await user.save();
    const { createdAt, platforms } = user;
    res.json({ name: user.name, email: user.email, createdAt, platforms });
  } catch (err) {
    console.error('❌ updateUserProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * POST /api/user/change-password
 * Change the user's password
 */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('❌ changePassword error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

/**
 * GET /api/user/stats
 * Returns `{ totalSolved, byPlatform }`.
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const byPlatformDB = await Problem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    // Convert aggregation result to map for easier updates
    const platformMap = {};
    byPlatformDB.forEach((p) => {
      platformMap[p._id] = p.count;
    });

    // If user connected LeetCode, fetch total solved count directly
    const leetcodeHandle = req.user.platforms?.leetcode?.handle;
    if (leetcodeHandle) {
      try {
        platformMap.leetcode = await fetchLeetCodeSolvedCount(leetcodeHandle);
      } catch (err) {
        console.error('❌ fetchLeetCodeSolvedCount error:', err);
      }
    }

    // If user connected CSES, fetch solved count via scraper
    const csesHandle = req.user.platforms?.cses?.handle;
    if (csesHandle) {
      try {
        platformMap.cses = await fetchCSESCount(csesHandle);
      } catch (err) {
        console.error('❌ fetchCSESCount error:', err);
      }
    }

    // If user connected GeeksforGeeks, fetch solved count
    const gfgHandle = req.user.platforms?.gfg?.handle;
    if (gfgHandle) {
      const dbCount = platformMap.gfg;
      try {
        const fetchedCount = await fetchGFGSolvedCount(gfgHandle);
        if (fetchedCount) {
          platformMap.gfg = fetchedCount;
        } else if (typeof dbCount === 'number') {
          platformMap.gfg = dbCount;
        }
      } catch (err) {
        console.error('❌ fetchGFGSolvedCount error:', err.message);
        if (typeof dbCount === 'number') {
          platformMap.gfg = dbCount;
        }
      }
    }
    // If user connected Code360, fetch solved count
    const cnHandle = req.user.platforms?.code360?.handle;
    if (cnHandle) {
      const dbCount = platformMap.code360;
      try {
        const fetchedCount = await fetchCode360SolvedCount(cnHandle);
        if (fetchedCount) {
          platformMap.code360 = fetchedCount;
        } else if (typeof dbCount === 'number') {
          platformMap.code360 = dbCount;
        }
      } catch (err) {
        console.error('❌ fetchCode360SolvedCount error:', err.message);
        if (typeof dbCount === 'number') {
          platformMap.code360 = dbCount;
        }
      }
    }

    // If user connected HackerRank, fetch solved count
    const hrHandle = req.user.platforms?.hackerrank?.handle;
    if (hrHandle) {
      const dbCount = platformMap.hackerrank;
      try {
        const fetchedCount = await fetchHackerRankSolvedCount(hrHandle);
        if (fetchedCount) {
          platformMap.hackerrank = fetchedCount;
        } else if (typeof dbCount === 'number') {
          platformMap.hackerrank = dbCount;
        }
      } catch (err) {
        console.error('❌ fetchHackerRankSolvedCount error:', err.message);
        if (typeof dbCount === 'number') {
          platformMap.hackerrank = dbCount;
        }
      }
    }

    const byPlatform = Object.entries(platformMap).map(([id, count]) => ({
      _id: id,
      count,
    }));

    const totalSolved = byPlatform.reduce((sum, p) => sum + p.count, 0);

    const daysAgg = await Problem.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' } },
        },
      },
      { $count: 'count' },
    ]);

    const activeDays = daysAgg[0]?.count || 0;

    res.json({ totalSolved, byPlatform, activeDays });

  } catch (error) {
    console.error('❌ getUserStats error:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
};

/**
 * GET /api/user/analytics
 * Returns progress, platform activity & topic strength data for dashboard.
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Aggregate solved problems by month & platform
    const monthly = await Problem.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m-01', date: '$solvedAt' } },
            platform: '$platform'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Determine connected platforms and build a map of month -> { platform: count }
    let connectedPlatforms = Object.entries(req.user.platforms || {})
      .filter(([, val]) => val && val.handle)
      .map(([key]) => key);

    if (connectedPlatforms.length === 0) {
      connectedPlatforms = Array.from(new Set(monthly.map((m) => m._id.platform)));
    }

    const monthCounts = {};
    const monthSet = new Set();
    monthly.forEach((m) => {
      const { month, platform } = m._id;
      monthSet.add(month);
      if (!monthCounts[month]) {
        monthCounts[month] = {};
        connectedPlatforms.forEach((p) => {
          monthCounts[month][p] = 0;
        });
      }
      if (connectedPlatforms.includes(platform)) {
        monthCounts[month][platform] = m.count;
      }
    });

    const months = Array.from(monthSet).sort();
    const cumulative = {};
    connectedPlatforms.forEach((p) => (cumulative[p] = 0));
    const progressData = [];
    const platformActivity = [];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    months.forEach((month) => {
      const counts = monthCounts[month] || {};
      connectedPlatforms.forEach((p) => {
        cumulative[p] += counts[p] || 0;
      });

      const progressEntry = { date: month };
      connectedPlatforms.forEach((p) => {
        progressEntry[p] = cumulative[p];
      });
      progressData.push(progressEntry);

      const label = monthNames[new Date(month).getUTCMonth()];
      const activityEntry = { month: label };
      connectedPlatforms.forEach((p) => {
        activityEntry[p] = counts[p] || 0;
      });
      platformActivity.push(activityEntry);
    });

    // 2️⃣ Aggregate by tags for topic strength
    const tagAgg = await Problem.aggregate([
      { $match: { user: userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } }
    ]);

    const totalSolved = await Problem.countDocuments({ user: userId });
    const topicStrength = tagAgg.map((t) => ({
      topic: t._id,
      score: totalSolved ? Math.round((t.count / totalSolved) * 100) : 0
    }));

    res.json({ progressData, platformActivity, topicStrength });
  } catch (error) {
    console.error('❌ getDashboardAnalytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

/**
/**
 * GET /api/user/contributions
 * Returns submission statistics from Code360.
 */
export const getContributionStats = async (req, res) => {
  try {
    const handle = req.user?.platforms?.code360?.handle;

    if (!handle) {
      return res.status(400).json({ message: 'Code360 handle not found' });
    }

    const stats = await fetchCode360ContributionStats(handle);

    const totalSubmissionCount =
      stats?.submission_count ??
      stats?.total_submission_count ??
      stats?.count?.submissions ??
      0;

    res.json({ totalSubmissionCount });
  } catch (err) {
    console.error('❌ getContributionStats error:', err);
    res.status(500).json({ message: 'Failed to fetch contribution stats' });
  }
};


/**
 * GET /api/user/cses/submissions
 * Returns the submission count for the logged-in user's CSES account.
 */
export const getCSESSubmissionCount = async (req, res) => {
  try {
    const id = req.user?.platforms?.cses?.handle;
    if (!id) {
      return res.status(400).json({ message: 'CSES ID not found' });
    }
    const count = await fetchCSESSubmissionCount(id);
    res.json({ submissionCount: count });
  } catch (err) {
    console.error('❌ getCSESSubmissionCount error:', err);
    res.status(500).json({ message: 'Failed to fetch CSES submission count' });
  }
};

/**
 * GET /api/user/code360/count/:username
 * Returns the public total solved count for the specified Code360 profile.
 */
export const getCode360TotalCount = async (req, res) => {
  try {
    const { username } = req.params;
    const count = await fetchCode360ProfileTotalCount(username);
    res.json({ totalCount: count });
  } catch (err) {
    console.error('❌ getCode360TotalCount error:', err);
    res.status(500).json({ message: 'Failed to fetch Code360 total count' });
  }
};