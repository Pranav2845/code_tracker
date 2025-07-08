// scripts/updateContests.js

import dotenv from 'dotenv';
// Use the backend/.env file because the root .env may be in a different format
// when running this script from the project root.
dotenv.config({ path: './backend/.env' });

console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

import connectDB from '../backend/config/db.js';
import { refreshAllContests } from '../backend/services/contests.js';

await connectDB();
await refreshAllContests();
console.log('Contest refresh complete');
process.exit(0);
