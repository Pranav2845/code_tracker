// src/api/contests.js
import axios from 'axios';

/*
 * Fetch upcoming contests from the backend.
 * Requests '/contests' (or '/api/contests' if proxy is configured).
 * Returns an array of contest objects.
 */
export async function fetchContests() {
    const { data } = await axios.get('/contests');
  if (Array.isArray(data?.upcoming)) return data.upcoming;
  return Array.isArray(data) ? data : [];
}