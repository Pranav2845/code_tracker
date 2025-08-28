// backend/models/Problem.js
import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: {
    type: String,
    enum: [
      'leetcode',
      'codeforces',
      'hackerrank',
      'gfg',
      'code360',
      'cses',
      'codechef'
    ],
    required: true
  },
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String },
  tags: [String],
 solvedAt: { type: Date, default: Date.now },
  url: String
}, { timestamps: true });

// Ensure we don't store duplicates for the same problem
problemSchema.index({ user: 1, platform: 1, problemId: 1 }, { unique: true });
// Compound index to optimize time-based queries per user
problemSchema.index({ user: 1, solvedAt: -1 });
// Compound index to support tag-based aggregations per user
problemSchema.index({ user: 1, tags: 1 });
export default mongoose.model('Problem', problemSchema);
