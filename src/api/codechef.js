// src/api/codechef.js
import axios from 'axios';

/**
 * Fetches solved problems for a given CodeChef username.
 * Returns: [{id, title, url}]
 */
export async function fetchCodeChefSolvedProblems(username) {
  const { data } = await axios.get(`/user/codechef/problems/${encodeURIComponent(username)}`);
  return Array.isArray(data.problems) ? data.problems : [];
}