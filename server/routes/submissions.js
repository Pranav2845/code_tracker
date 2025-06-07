import express from 'express';
import Submission from '../models/Submission.js';

const router = express.Router();

// GET all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new submission
router.post('/', async (req, res) => {
  const { userId, problem, status, code, language } = req.body;
  try {
    const newSubmission = new Submission({ userId, problem, status, code, language });
    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
