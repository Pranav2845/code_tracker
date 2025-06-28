// backend/controllers/userController.js
import User from '../models/User.js';
import Problem from '../models/Problem.js'; // ← ensure we can query the Problem collection

/**
 * GET /api/user/profile
 * Returns the current user’s name & email.
 */
export const getUserProfile = async (req, res) => {
  // req.user is populated by authMiddleware
  const { name, email } = req.user;
  res.json({ name, email });
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
