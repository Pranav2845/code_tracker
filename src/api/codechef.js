// src/api/codechef.js
import api from "./axios";

/**
 * Fetches solved problems for a given CodeChef username.
 * Returns: [{id, title, url}]
 */
export async function fetchCodeChefSolvedProblems(username) {
  const { data } = await api.get(
    `/user/codechef/problems/${encodeURIComponent(username)}`
  );
  return Array.isArray(data.problems) ? data.problems : [];
}