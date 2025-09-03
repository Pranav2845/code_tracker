// src/api/gfg.js
import api from "./axios";

/**
 * Fetches solved problems for a given GeeksforGeeks username.
 * Returns: [{ id, title, url }]
 */
export async function fetchGFGSolvedProblems(username) {
  const { data } = await api.get(
    `/user/gfg/problems/${encodeURIComponent(username)}`
  );
  return Array.isArray(data.problems) ? data.problems : [];
}

/**
 * Fetches total number of solved problems for a given GeeksforGeeks username.
 */
export async function fetchGFGProfileTotalCount(username) {
  const { data } = await api.get(
    `/user/gfg/count/${encodeURIComponent(username)}`
  );
  return data.totalCount || 0;
}