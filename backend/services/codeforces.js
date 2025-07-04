// backend/services/codeforces.js
import axios from 'axios';

/**
 * Fetch the most-recent AC submissions for a user from Codeforces.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchCFProblems(handle) {
  // fetch up to 50 submissions
  const res = await axios.get(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=50`
  );

  if (res.data.status !== 'OK') {
    throw new Error(`Codeforces API error: ${res.data.comment || res.data.status}`);
  }

  return res.data.result
    .filter((s) => s.verdict === 'OK')
    .map((s) => ({
      id:         `${s.problem.contestId}_${s.problem.index}`,
      title:      s.problem.name,
      difficulty: s.problem.rating ? String(s.problem.rating) : 'Unknown',
      tags:       s.problem.tags || [],
      solvedAt:   new Date(s.creationTimeSeconds * 1000),
       url:      `https://codeforces.com/problemset/problem/${s.problem.contestId}/${s.problem.index}`,
    }));
}

// Fetch total solved count for a user from Codeforces
export async function fetchCFSolvedCount(handle) {
  const res = await axios.get(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`
  );

  if (res.data.status !== 'OK') {
    throw new Error(`Codeforces API error: ${res.data.comment || res.data.status}`);
  }

  const solved = new Set();
  for (const s of res.data.result) {
    if (s.verdict === 'OK') {
      solved.add(`${s.problem.contestId}_${s.problem.index}`);
    }
  }

  return solved.size;
}
