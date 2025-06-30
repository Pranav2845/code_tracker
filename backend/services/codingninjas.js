// backend/services/codingninjas.js

import axios from 'axios';
/**
 * Fetch solved problems for a Coding Ninjas user.
 * Tries the legacy API first, then falls back to the new code360 endpoint.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchCodingNinjasProblems(username) {
  // 1️⃣ Legacy API used by older profiles
  try {
    const legacyUrl =
      `https://www.codingninjas.com/api/v3/user_profile?username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(legacyUrl);
    const list =
      data?.data?.user_problems ??
      data?.data?.user_details?.practice_problem_stats?.solved_problems ?? [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((p) => ({
        id: p.id || p.problem_id || p.title,
        title: p.title || p.problem_name || '',
        difficulty: p.difficulty_level || p.difficulty || 'Unknown',
        tags: p.tags || [],
        solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
      }));
    }
  } catch (err) {
    console.warn('⚠️ CodingNinjas legacy API failed:', err.message);
  }

  // 2️⃣ Fallback to the new Code360 public API
  try {
    const limit = 100;
    let offset = 0;
    const all = [];
    while (true) {
      const url =
        `https://www.naukri.com/code360/api/v1/user/${encodeURIComponent(username)}/solvedProblems?limit=${limit}&offset=${offset}`;
      const { data } = await axios.get(url);
      const items = data?.solvedProblems || [];
      all.push(...items);
      if (items.length < limit) break;
      offset += limit;
    }

      return all.map((p) => ({
      id: p.problemId || p.id || p.title,
      title: p.title || p.problemTitle || '',
      difficulty: p.difficulty || p.difficultyLevel || 'Unknown',
      tags: p.tags || [],
      solvedAt: p.solvedAt ? new Date(p.solvedAt) : new Date(),
    }));
  } catch (err) {
    console.error('❌ CodingNinjas code360 API error:', err.message);
    return [];
  }
}