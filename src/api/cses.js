// src/api/cses.js
import axios from "axios";

/**
 * Fetches solved problems for a given CSES handle.
 * Returns: [{id, title, url}]
 */
export async function fetchCSESSolvedProblems(handle) {
  const { data } = await axios.get(`/user/cses/problems/${handle}`);
  // data.problems is array [{id, title, url}]
  return data.problems || [];
}
