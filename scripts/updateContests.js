// scripts/updateContests.js

import dotenv from 'dotenv';
dotenv.config(); // <-- TOP! Ensure env is loaded before anything else

console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

import connectDB from '../backend/config/db.js';
import { refreshAllContests } from '../backend/services/contests.js';

await connectDB();
await refreshAllContests();
console.log('Contest refresh complete');
process.exit(0);
