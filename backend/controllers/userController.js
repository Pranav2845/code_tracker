// backend/controllers/userController.js
import User from '../models/User.js';
import Problem from '../models/Problem.js'; // ← ensure we can query the Problem collection
import bcrypt from 'bcryptjs';

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

  Object.entries(platforms).forEach(([platform, handle]) => {
    user.platforms[platform].handle = handle || '';
  });

  await user.save();
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

    const totalSolved = await Problem.countDocuments({ user: userId });
    const byPlatform = await Problem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    res.json({ totalSolved, byPlatform });
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
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m-01', date: '$solvedAt' } },
            platform: '$platform'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Build a map of month -> { platform: count }
    const monthCounts = {};
    const monthSet = new Set();
    monthly.forEach((m) => {
      const { month, platform } = m._id;
      monthSet.add(month);
      if (!monthCounts[month]) {
        monthCounts[month] = { leetcode: 0, codeforces: 0, hackerrank: 0 };
      }
      monthCounts[month][platform] = m.count;
    });

    const months = Array.from(monthSet).sort();
    const cumulative = { leetcode: 0, codeforces: 0, hackerrank: 0 };
    const progressData = [];
    const platformActivity = [];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    months.forEach((month) => {
      const counts = monthCounts[month] || {};
      cumulative.leetcode += counts.leetcode || 0;
      cumulative.codeforces += counts.codeforces || 0;
      cumulative.hackerrank += counts.hackerrank || 0;

      progressData.push({
        date: month,
        leetcode: cumulative.leetcode,
        codeforces: cumulative.codeforces,
        hackerrank: cumulative.hackerrank
      });

      const label = monthNames[new Date(month).getUTCMonth()];
      platformActivity.push({
        month: label,
        leetcode: counts.leetcode || 0,
        codeforces: counts.codeforces || 0,
        hackerrank: counts.hackerrank || 0
      });
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