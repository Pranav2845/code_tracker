// backend/services/codingninjas.js

import axios from 'axios';
export async function fetchCodingNinjasProblems(username) {
   const url =
    `https://www.codingninjas.com/api/v3/user_profile?username=${encodeURIComponent(username)}`;

  const { data } = await axios.get(url);

  const problems =
    data?.data?.user_problems ??
    data?.data?.user_details?.practice_problem_stats?.solved_problems ?? [];

  return problems.map((p) => ({
    id: p.id || p.problem_id || p.title,
    title: p.title || p.problem_name || '',
    difficulty: p.difficulty_level || p.difficulty || 'Unknown',
    tags: p.tags || [],
    solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
  }));
}