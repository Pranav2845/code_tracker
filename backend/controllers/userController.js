// backend/controllers/userController.js

import User from '../models/User.js';
import Problem from '../models/Problem.js';
import PlatformAccount from '../models/PlatformAccount.js';
import bcrypt from 'bcryptjs';
import { fetchLeetCodeSolvedCount } from '../services/leetcode.js';
import {
  fetchCSESSolvedCount,
  fetchCSESProblems
} from '../services/cses.js';

import { fetchGFGSolvedCount } from '../services/gfg.js';
import {
  fetchCode360SolvedCount,
  fetchCode360ContributionStats,
  fetchCode360ProfileTotalCount,
  fetchCode360Problems,
} from '../services/code360.js';
import { fetchHackerRankSolvedCount } from '../services/hackerrank.js';
import { fetchCodeChefSolvedCount, fetchCodeChefProblems } from '../services/codechef.js';
import { fetchCFSolvedCount } from '../services/codeforces.js';
import Contest from '../models/Contest.js';
import { refreshAllContests } from '../services/contests.js';

/**
 * GET /api/user/profile
 * Returns the current user's profile information.
 */
export const getUserProfile = async (req, res) => {
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
    if (!user) return res.status(404).json({ message: 'User not found' });

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
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('❌ changePassword error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

/**
 * GET /api/user/stats/local
 * Returns `{ totalSolved, byPlatform, activeDays }` purely from MongoDB (no external calls).
 */
export const getUserStatsLocal = async (req, res) => {
  try {
    const userId = req.user._id;

    const byPlatformDB = await Problem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]);

    const supportedPlatforms = [
      'leetcode',
      'codeforces',
      'hackerrank',
      'gfg',
      'code360',
      'cses',
      'codechef',
    ];

    const platformMap = Object.fromEntries(
      supportedPlatforms.map((p) => [p, 0])
    );

    byPlatformDB.forEach((p) => {
      if (supportedPlatforms.includes(p._id)) {
        platformMap[p._id] = p.count;
      } else {
        platformMap[p._id] = p.count;
      }
    });

    const byPlatform = Object.entries(platformMap).map(([platform, count]) => ({
      _id: platform,
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
    console.error('❌ getUserStatsLocal error:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
};

/**
 * GET /api/user/stats
 * Triggers background refresh of external solved counts. Responds 202 immediately.
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const accounts = await PlatformAccount.find({ user: userId });

    const tasks = accounts.map((acc) =>
      (async () => {
        try {
          let count;
          const handle = acc.handle;
          switch (acc.platform) {
            case 'leetcode':
              count = await fetchLeetCodeSolvedCount(handle);
              break;
            case 'codeforces':
              count = await fetchCFSolvedCount(handle);
              break;
            case 'hackerrank':
              count = await fetchHackerRankSolvedCount(handle);
              break;
            case 'gfg':
              count = await fetchGFGSolvedCount(handle);
              break;
            case 'code360':
              try {
                count = await fetchCode360SolvedCount(handle);
                if (!count) {
                  count = await fetchCode360ProfileTotalCount(handle);
                }
              } catch {
                try {
                  count = await fetchCode360ProfileTotalCount(handle);
                } catch {
                  count = undefined;
                }
              }
              break;
            case 'cses':
              count = await fetchCSESSolvedCount(handle);
              break;
            case 'codechef':
              count = await fetchCodeChefSolvedCount(handle);
              break;
            default:
              break;
          }

          if (typeof count === 'number') {
            await PlatformAccount.updateOne(
              { _id: acc._id },
              {
                solvedCount: count,
                solvedCountUpdatedAt: new Date(),
                lastError: undefined,
                lastErrorAt: undefined,
              }
            );
          } else {
            throw new Error('Invalid count');
          }
        } catch (err) {
          await PlatformAccount.updateOne(
            { _id: acc._id },
            {
              lastError: err?.message || String(err),
              lastErrorAt: new Date(),
            }
          );
        }
      })()
    );

    Promise.allSettled(tasks).catch((err) =>
      console.error('❌ stats refresh error:', err)
    );

    res.status(202).json({ accepted: true });
  } catch (err) {
    console.error('❌ getUserStats refresh error:', err);
    res.status(500).json({ message: 'Failed to refresh user stats' });
  }
};

/**
 * GET /api/user/stats/cached
 * Returns cached external solved counts with TTL.
 */
export const getUserStatsCached = async (req, res) => {
  try {
    const userId = req.user._id;
    const accounts = await PlatformAccount.find({ user: userId });
    const ttl = Number(process.env.EXT_FETCH_TTL_MIN || 60) * 60 * 1000;
    const now = Date.now();

    const byPlatform = accounts.map((acc) => {
      let count = null;
      if (
        acc.solvedCountUpdatedAt &&
        now - acc.solvedCountUpdatedAt.getTime() <= ttl
      ) {
        count = acc.solvedCount ?? null;
      }
      return {
        _id: acc.platform,
        count,
        lastError: acc.lastError,
        lastErrorAt: acc.lastErrorAt,
      };
    });

    const totalSolved = byPlatform.reduce((sum, p) => sum + (p.count || 0), 0);

    res.json({ totalSolved, byPlatform });
  } catch (err) {
    console.error('❌ getUserStatsCached error:', err);
    res.status(500).json({ message: 'Failed to fetch cached stats' });
  }
};

/**
 * GET /api/user/analytics
 * Returns progress, platform activity & topic strength data for dashboard.
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Monthly & platform aggregation
    const monthly = await Problem.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m-01', date: '$solvedAt' } },
            platform: '$platform',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    let connected = Object.entries(req.user.platforms || {})
      .filter(([, p]) => p.handle)
      .map(([k]) => k);
    if (!connected.length) {
      connected = Array.from(new Set(monthly.map((m) => m._id.platform)));
    }

    const monthSet = new Set();
    const monthCounts = {};
    monthly.forEach((m) => {
      const { month, platform } = m._id;
      monthSet.add(month);
      monthCounts[month] ??= {};
      connected.forEach((p) => (monthCounts[month][p] = 0));
      if (connected.includes(platform)) {
        monthCounts[month][platform] = m.count;
      }
    });

    const months = Array.from(monthSet).sort();
    const cumulative = Object.fromEntries(connected.map((p) => [p, 0]));
    const progressData = [];
    const platformActivity = [];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    months.forEach((month) => {
      const counts = monthCounts[month];
      connected.forEach((p) => {
        cumulative[p] += counts[p] || 0;
      });

      const progressEntry = { date: month };
      connected.forEach((p) => {
        progressEntry[p] = cumulative[p];
      });
      progressData.push(progressEntry);

      const activityEntry = { month: labels[new Date(month).getUTCMonth()] };
      connected.forEach((p) => {
        activityEntry[p] = counts[p] || 0;
      });
      platformActivity.push(activityEntry);
    });

    // Topic strength
    const tagAgg = await Problem.aggregate([
      { $match: { user: userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);
    const total = await Problem.countDocuments({ user: userId });
    const topicStrength = tagAgg.map((t) => ({
      topic: t._id,
      score: total ? Math.round((t.count / total) * 100) : 0,
    }));

    res.json({ progressData, platformActivity, topicStrength });
  } catch (error) {
    console.error('❌ getDashboardAnalytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

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
    let stats;
    try {
      stats = await fetchCode360ContributionStats(handle);
    } catch {
      return res.status(200).json({ totalSubmissionCount: 0 });
    }
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
 * GET /api/user/cses/problems/:handle
 * Fetches solved problems for the given CSES profile.
 */
export const getCSESSolvedProblems = async (req, res) => {
  try {
    const { handle } = req.params;
    const problems = await fetchCSESProblems(handle);
    const list = Array.isArray(problems)
      ? problems.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
        }))
      : [];
    res.json({ problems: list });
  } catch (err) {
    console.error('❌ getCSESSolvedProblems error:', err);
    res.status(500).json({ message: 'Failed to fetch CSES problems' });
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

/**
 * GET /api/user/code360/problems/:username
 * Fetches solved problems for the given Code360 profile.
 */
export const getCode360SolvedProblems = async (req, res) => {
  try {
    const { username } = req.params;
    const problems = await fetchCode360Problems(username);
    const list = Array.isArray(problems)
      ? problems.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
        }))
      : [];
    res.json({ problems: list });
  } catch (err) {
    console.error('❌ getCode360SolvedProblems error:', err);
    res.status(500).json({ message: 'Failed to fetch Code360 problems' });
  }
};

/**
 * GET /api/user/codechef/count/:username
 * Returns the total solved count for the specified CodeChef profile.
 */
export const getCodeChefTotalCount = async (req, res) => {
  try {
    const { username } = req.params;
    const count = await fetchCodeChefSolvedCount(username);
    res.json({ totalCount: count });
  } catch (err) {
    console.error('❌ getCodeChefTotalCount error:', err);
    res.status(500).json({ message: 'Failed to fetch CodeChef total count' });
  }
};

/**
 * GET /api/user/codechef/problems/:username
 * Fetches solved problems for the given CodeChef profile.
 */
export const getCodeChefSolvedProblems = async (req, res) => {
  try {
    const { username } = req.params;
    const problems = await fetchCodeChefProblems(username);
    // Add this line to debug:
    console.log('CodeChef problems for', username, problems);
    const list = Array.isArray(problems)
      ? problems.map((p) => ({ id: p.id, title: p.title, url: p.url }))
      : [];
    res.json({ problems: list });
  } catch (err) {
    console.error('❌ getCodeChefSolvedProblems error:', err);
    res.status(500).json({ message: 'Failed to fetch CodeChef problems' });
  }
};

/**
 * GET /api/contests
 *  Returns lists of upcoming and past programming contests.
 */
export const getContests = async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Contest.find({ startTime: { $gte: now } })
      .sort({ startTime: 1 });
    const past = await Contest.find({ startTime: { $lt: now } })
      .sort({ startTime: -1 });
    res.json({ upcoming, past });
  } catch (err) {
    console.error('❌ getContests error:', err);
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

export const refreshContests = async (req, res) => {
  try {
    const list = await refreshAllContests();
    res.json({ refreshed: list.length });
  } catch (err) {
    console.error('❌ refreshContests error:', err);
    res.status(500).json({ message: 'Failed to refresh contests' });
  }
};
