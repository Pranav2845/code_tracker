// File: backend/models/Contest.js

import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number },
}, { timestamps: true });

contestSchema.index({ platform: 1, name: 1, startTime: 1 }, { unique: true });

export default mongoose.model('Contest', contestSchema);