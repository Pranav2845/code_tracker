// backend/services/gfg.js
import axios from 'axios';

/**
 * Fetch solved problems from GeeksforGeeks Practice.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchGFGProblems(username) {
  const url = `https://practiceapi.geeksforgeeks.org/api/v1/user/get_stats?username=${encodeURIComponent(username)}`;
  try {
    const { data } = await axios.get(url);
    console.log('📦 GFG API raw response for', username, JSON.stringify(data, null, 2));

    const problems =
      data?.data?.practice?.problems
      || data?.practice?.problems
      || [];

    console.log(`🔍 Parsed ${problems.length} problems from GFG payload`);

    return problems.map((p) => ({
      id: p.pid || p.problemId || p.problem_code || p.title,
      title: p.problemTitle || p.title || '',
      difficulty: p.difficulty || 'Unknown',
      tags: p.tags || [],
      solvedAt: p.solvedOn
        ? new Date(p.solvedOn)
        : new Date(),
    }));
  } catch (err) {
    console.error('❌ fetchGFGProblems error for', username, err.response?.data || err.message);
    throw err;
  }
}
