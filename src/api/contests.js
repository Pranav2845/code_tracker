// src/api/contests.js
import axios from 'axios';

/**
 * Fetch upcoming and past contests from the backend.
 * Returns an object { upcoming: [], past: [] }.
 */
export async function fetchContests() {
   const { data } = await axios.get('/contests/all');
  return {
    upcoming: Array.isArray(data?.upcoming) ? data.upcoming : [],
    past: Array.isArray(data?.past) ? data.past : [],
  };
}