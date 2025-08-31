// backend/models/PlatformAccount.js
import mongoose from 'mongoose';

const platformAccountSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
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
  handle: { type: String, required: true },
  syncedAt: { type: Date, default: Date.now },
  solvedCount: { type: Number },
  solvedCountUpdatedAt: { type: Date },
  lastError: { type: String },
  lastErrorAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('PlatformAccount', platformAccountSchema);
