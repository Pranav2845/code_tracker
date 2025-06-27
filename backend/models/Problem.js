// backend/models/Problem.js
import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['leetcode','codeforces','hackerrank'], required: true },
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String },
  tags: [String],
  solvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
