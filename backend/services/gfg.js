// backend/services/gfg.js
import axios from 'axios';

const BASE_URL = 'https://geeks-for-geeks-api.vercel.app';

/**
 * Fetch solved problems for a GeeksforGeeks user using the public API.
 * Returns an array of { id, title, url }.
 */
export async function fetchGFGProblems(username) {
  const { data } = await axios.get(`${BASE_URL}/${encodeURIComponent(username)}`);
  const stats = data?.solvedStats || {};
  const problems = [];
  for (const key of Object.keys(stats)) {
    const questions = Array.isArray(stats[key]?.questions)
      ? stats[key].questions
      : [];
    questions.forEach((q) => {
      problems.push({
        id: q.question,
        title: q.question,
        difficulty: key.charAt(0).toUpperCase() + key.slice(1),
        tags: [],
        solvedAt: new Date(),
        url: q.questionUrl ? `${q.questionUrl}/0` : undefined,
      });
    });
  }
  return problems;
}

/**
 * Fetch total solved problem count for a GeeksforGeeks user.
 */
export async function fetchGFGSolvedCount(username) {
  const { data } = await axios.get(`${BASE_URL}/${encodeURIComponent(username)}`);
  const total = data?.info?.totalProblemsSolved;
  return typeof total === 'number' ? total : 0;
}
