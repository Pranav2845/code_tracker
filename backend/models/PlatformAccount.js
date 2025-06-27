// backend/models/PlatformAccount.js
import mongoose from 'mongoose';

const platformAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['leetcode','codeforces','hackerrank'], required: true },
  handle: { type: String, required: true },
  syncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PlatformAccount', platformAccountSchema);
