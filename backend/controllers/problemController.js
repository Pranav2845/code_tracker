// backend/controllers/problemController.js
import Problem from '../models/Problem.js';
import { getAuth } from '@clerk/express';

export const addProblem = async (req, res) => {
  const { platform, problemId, title, difficulty, tags } = req.body;
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const prob = await Problem.create({
      user: userId,
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
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  const filter = { user: userId };
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
