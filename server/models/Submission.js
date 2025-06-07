import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: String,
  problem: String,
  status: String,
  code: String,
  language: String,
}, { timestamps: true });

export default mongoose.model('Submission', SubmissionSchema);
