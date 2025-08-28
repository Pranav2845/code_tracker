// src/api/leetcode.js
import axios from 'axios';

/**
 * Fetches all solved problems for a given LeetCode username.
 * Returns: [{ id, title, url }]
 */
export async function fetchLeetCodeSolvedProblems(username) {
  const { data } = await axios.get(`/user/leetcode/problems/${encodeURIComponent(username)}`);
  return Array.isArray(data.problems) ? data.problems : [];
}

/**
 * Fetches total number of solved problems for a given LeetCode username.
 */
export async function fetchLeetCodeProfileTotalCount(username) {
  const { data } = await axios.get(`/user/leetcode/count/${encodeURIComponent(username)}`);
  return data.totalCount || 0;
}
