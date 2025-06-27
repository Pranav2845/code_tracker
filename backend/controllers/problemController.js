// backend/controllers/problemController.js
import Problem from '../models/Problem.js';

export const addProblem = async (req, res) => {
  const { platform, problemId, title, difficulty, tags } = req.body;
  try {
    const prob = await Problem.create({
      user: req.user._id,
      platform,
      problemId,
      title,
      difficulty,
      tags
    });
    res.status(201).json(prob);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProblems = async (req, res) => {
  const { platform, tags, difficulty, startDate, endDate } = req.query;
  const filter = { user: req.user._id };
  if (platform) filter.platform = platform;
  if (difficulty) filter.difficulty = difficulty;
  if (tags) filter.tags = { $in: tags.split(',') };
  if (startDate || endDate) {
    filter.solvedAt = {};
    if (startDate) filter.solvedAt.$gte = new Date(startDate);
    if (endDate) filter.solvedAt.$lte = new Date(endDate);
  }
  const probs = await Problem.find(filter);
  res.json(probs);
};
