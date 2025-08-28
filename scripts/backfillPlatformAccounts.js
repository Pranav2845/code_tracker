// scripts/backfillPlatformAccounts.js
import dotenv from 'dotenv';
// Use the backend/.env file to ensure database configuration
// when running this script from the project root.
dotenv.config({ path: './backend/.env' });

import connectDB from '../backend/config/db.js';
import PlatformAccount from '../backend/models/PlatformAccount.js';

await connectDB();

const result = await PlatformAccount.updateMany({}, {
  $set: {
    solvedCount: 0,
    solvedCountUpdatedAt: new Date(),
    lastError: null,
    lastErrorAt: null
  }
});

console.log(`Backfilled ${result.modifiedCount} platform accounts`);
process.exit(0);