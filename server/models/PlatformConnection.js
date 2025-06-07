import mongoose from 'mongoose';

const PlatformConnectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'hackerrank'],
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const PlatformConnection = mongoose.model('PlatformConnection', PlatformConnectionSchema);
export default PlatformConnection;
