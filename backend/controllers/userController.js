// backend/controllers/userController.js
import User from '../models/User.js';
import Problem from '../models/Problem.js'; // ✅ Fix: add this line

export const getUserProfile = async (req, res) => {
  res.json(req.user);
};

export const updatePlatforms = async (req, res) => {
  const { platforms } = req.body;
  const user = req.user;

  // for each key in the payload, write it into user.platforms
  Object.entries(platforms).forEach(([platform, handle]) => {
    user.platforms[platform].handle = handle || "";
  });

  await user.save();
  // return the new sub-doc so frontend can refresh the UI
  res.json(user.platforms);
};

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
    console.error("❌ getUserStats error:", error);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};
