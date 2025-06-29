// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  platforms: {
    leetcode: { handle: String },
    codeforces: { handle: String },
    hackerrank: { handle: String },
    gfg: { handle: String },
    codingninjas: { handle: String },
    cses: { handle: String },
    codechef: { handle: String }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);