// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  platforms: {
    leetcode: { handle: String },
    codeforces: { handle: String },
    hackerrank: { handle: String },
    gfg: { handle: String },
    code360: { handle: String },
    codechef: { handle: String }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);