// src/api/contests.js
import axios from 'axios';

/**
 * Fetch upcoming contests from the backend.
 * Returns an array of contest objects.
 */
export async function fetchContests() {
  const { data } = await axios.get('/contests');
   return Array.isArray(data) ? data : [];
}