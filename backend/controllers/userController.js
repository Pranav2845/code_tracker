// backend/controllers/userController.js
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import PlatformAccount from '../models/PlatformAccount.js';
import bcrypt from 'bcryptjs';
import {
  fetchLeetCodeSolvedCount,
  fetchLeetCodeSolvedProblems,
} from '../services/leetcode.js';

import { fetchGFGSolvedCount, fetchGFGProblems } from '../services/gfg.js';
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
 * GET /api/user/stats
 * Returns { totalSolved, byPlatform, activeDays }.
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count solved problems per platform from DB
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

    // LeetCode
    const leetcodeHandle = req.user.platforms?.leetcode?.handle;
    if (leetcodeHandle) {
      const dbCount = platformMap.leetcode;
      try {
        const fetched = await fetchLeetCodeSolvedCount(leetcodeHandle);
        platformMap.leetcode = typeof fetched === 'number' ? fetched : dbCount;
      } catch (err) {
        console.error('❌ fetchLeetCodeSolvedCount error:', err);
        platformMap.leetcode = dbCount;
      }
    }

    // Codeforces
    const cfHandle = req.user.platforms?.codeforces?.handle;
    if (cfHandle) {
      const dbCount = platformMap.codeforces;
      try {
        const fetched = await fetchCFSolvedCount(cfHandle);
        platformMap.codeforces = typeof fetched === 'number' ? fetched : dbCount;
      } catch (err) {
        console.error('❌ fetchCFSolvedCount error:', err);
        platformMap.codeforces = dbCount;
      }
    }

  

    // GeeksforGeeks
    const gfgHandle = req.user.platforms?.gfg?.handle;
    if (gfgHandle) {
      const dbCount = platformMap.gfg;
      try {
        const fetched = await fetchGFGSolvedCount(gfgHandle);
        platformMap.gfg = fetched || dbCount;
      } catch (err) {
        console.error('❌ fetchGFGSolvedCount error:', err);
        if (typeof dbCount === 'number') platformMap.gfg = dbCount;
      }
    }

    // CodeChef
    const ccHandle = req.user.platforms?.codechef?.handle;
    if (ccHandle) {
      const dbCount = platformMap.codechef;
      try {
        const fetched = await fetchCodeChefSolvedCount(ccHandle);
        platformMap.codechef = fetched || dbCount;
      } catch (err) {
        console.error('❌ fetchCodeChefSolvedCount error:', err);
        if (typeof dbCount === 'number') platformMap.codechef = dbCount;
      }
    }

    // Code360
    const cnHandle = req.user.platforms?.code360?.handle;
    if (cnHandle) {
      const dbCount = platformMap.code360;
      let count;
      try {
        count = await fetchCode360SolvedCount(cnHandle);
        if (!count) {
          count = await fetchCode360ProfileTotalCount(cnHandle);
        }
      } catch {
        try {
          count = await fetchCode360ProfileTotalCount(cnHandle);
        } catch {
          count = dbCount;
        }
      }
      platformMap.code360 = typeof count === 'number' ? count : dbCount;
    }

    // HackerRank
    const hrHandle = req.user.platforms?.hackerrank?.handle;
    if (hrHandle) {
      const dbCount = platformMap.hackerrank;
      try {
        const fetched = await fetchHackerRankSolvedCount(hrHandle);
        platformMap.hackerrank = fetched || dbCount;
      } catch (err) {
        console.error('❌ fetchHackerRankSolvedCount error:', err);
        if (typeof dbCount === 'number') platformMap.hackerrank = dbCount;
      }
    }

    // Build byPlatform array
    const byPlatform = Object.entries(platformMap).map(([platform, count]) => ({
      _id: platform,
      count,
    }));

    // Total solved
    const totalSolved = byPlatform.reduce((sum, p) => sum + p.count, 0);

    // Active days
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

    // Fetch monthly counts, tag counts, and total solved in one go
    const [agg] = await Problem.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: {
                  month:    { $dateToString: { format: '%Y-%m-01', date: '$solvedAt' } },
                  platform: '$platform',
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.month': 1 } },
          ],
          tagCounts: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const { monthly = [], tagCounts = [], total = [] } = agg || {};

    let connected = Object.entries(req.user.platforms || {})
      .filter(([, p]) => p.handle)
      .map(([k]) => k);
    if (!connected.length) {
      connected = Array.from(new Set(monthly.map(m => m._id.platform)));
    }

    const monthSet = new Set();
    const monthCounts = {};
    monthly.forEach(m => {
      const { month, platform } = m._id;
      monthSet.add(month);
      monthCounts[month] ??= {};
      connected.forEach(p => (monthCounts[month][p] = 0));
      if (connected.includes(platform)) {
        monthCounts[month][platform] = m.count;
      }
    });

    const months = Array.from(monthSet).sort();
    const cumulative = Object.fromEntries(connected.map(p => [p, 0]));
    const progressData = [];
    const platformActivity = [];
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    months.forEach(month => {
      const counts = monthCounts[month];
      connected.forEach(p => { cumulative[p] += counts[p] || 0; });

      const progressEntry = { date: month };
      connected.forEach(p => { progressEntry[p] = cumulative[p]; });
      progressData.push(progressEntry);

      const activityEntry = { month: labels[new Date(month).getUTCMonth()] };
      connected.forEach(p => { activityEntry[p] = counts[p] || 0; });
      platformActivity.push(activityEntry);
    });

    // Topic strength (percent per tag of total solved)
    const totalCount = total[0]?.count || 0;
    const topicStrength = tagCounts.map(t => ({
      topic: t._id,
      score: totalCount ? Math.round((t.count / totalCount) * 100) : 0,
      solved: t.count,
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
 * GET /api/user/leetcode/count/:username
 * Returns the total solved count for the specified LeetCode profile.
 */
export const getLeetCodeTotalCount = async (req, res) => {
  try {
    const { username } = req.params;
    const count = await fetchLeetCodeSolvedCount(username);
    res.json({ totalCount: count });
  } catch (err) {
    console.error('❌ getLeetCodeTotalCount error:', err);
    res.status(500).json({ message: 'Failed to fetch LeetCode total count' });
  }
};

/**
 * GET /api/user/leetcode/problems/:username
 * Fetches recently solved problems for the given LeetCode profile.
 */
export const getLeetCodeSolvedProblems = async (req, res) => {
  try {
    const { username } = req.params;
    const problems = await fetchLeetCodeSolvedProblems(username);
     res.json({ problems });
  } catch (err) {
    console.error('❌ getLeetCodeSolvedProblems error:', err);
    res.status(500).json({ message: 'Failed to fetch LeetCode problems' });
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
 * GET /api/user/gfg/count/:username
 * Returns the total solved count for the specified GFG profile.
 */
export const getGFGTotalCount = async (req, res) => {
  try {
    const { username } = req.params;
    const count = await fetchGFGSolvedCount(username);
    res.json({ totalCount: count });
  } catch (err) {
    console.error('❌ getGFGTotalCount error:', err);
    res.status(500).json({ message: 'Failed to fetch GFG total count' });
  }
};

/**
 * GET /api/user/gfg/problems/:username
 * Fetches solved problems for the given GFG profile.
 */
export const getGFGSolvedProblems = async (req, res) => {
  try {
    const { username } = req.params;
    const problems = await fetchGFGProblems(username);
    const list = Array.isArray(problems)
      ? problems.map((p) => ({ id: p.id, title: p.title, url: p.url }))
      : [];
    res.json({ problems: list });
  } catch (err) {
    console.error('❌ getGFGSolvedProblems error:', err);
    res.status(500).json({ message: 'Failed to fetch GFG problems' });
  }
};

/**
 * GET /api/contests
 * Returns lists of upcoming and past programming contests.
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
