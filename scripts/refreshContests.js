// scripts/refreshContests.js
import { refreshAllContests } from '../backend/services/contests.js';
await refreshAllContests();
console.log('Contests refreshed!');
process.exit();
