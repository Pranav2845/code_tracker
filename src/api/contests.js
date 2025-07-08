// src/api/contests.js
import axios from 'axios';

/**
 * Fetch all contests (upcoming and past).
 * Returns an object like { upcoming: [], past: [] }
 */
export async function fetchContests() {
  const { data } = await axios.get('/contests');
  return data;
}