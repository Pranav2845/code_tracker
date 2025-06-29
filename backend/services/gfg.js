// backend/services/gfg.js

import axios from 'axios';

/**
 * Fetch solved problems from GeeksforGeeks Practice.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchGFGProblems(username) {
 const url =
    `https://practiceapi.geeksforgeeks.org/api/user/get_stats?username=${encodeURIComponent(username)}`;

  const { data } = await axios.get(url);

  const problems =
    data?.data?.practice?.problems || data?.practice?.problems || [];

  return problems.map((p) => ({
    id: p.pid || p.problemId || p.problem_code || p.title,
    title: p.problemTitle || p.title || '',
    difficulty: p.difficulty || 'Unknown',
    tags: p.tags || [],
    solvedAt: p.solvedOn ? new Date(p.solvedOn) : new Date(),
  }));
}