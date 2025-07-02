// backend/services/codingninjas.js

import axios from 'axios';
import fs from 'fs/promises';

// When MOCK_CODINGNINJAS=true, read problems from local JSON instead of calling the API
const USE_MOCK = process.env.MOCK_CODINGNINJAS === 'true';

/**
 * Fetch solved problems for a Coding Ninjas user.
 * Tries the legacy API first, then falls back to the new code360 endpoint.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchCodingNinjasProblems(username) {
  if (USE_MOCK) {
    try {
      const file = await fs.readFile(
        new URL('./mock/codingninjasProblems.json', import.meta.url)
      );
      const data = JSON.parse(file.toString());
      return data.map((p) => ({
        ...p,
        solvedAt: p.solvedAt ? new Date(p.solvedAt) : new Date(),
      }));
    } catch (err) {
      console.warn('⚠️ Failed to load mock CodingNinjas data:', err.message);
    }
  }
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
    const maxPages = 20; // safeguard to prevent infinite loops
    let offset = 0;
    let page = 0;
    const all = [];
    while (page < maxPages) {
      const url =
        `https://www.naukri.com/code360/api/v1/user/${encodeURIComponent(username)}/solvedProblems?limit=${limit}&offset=${offset}`;
      const { data } = await axios.get(url);
      const items = data?.solvedProblems || [];
      all.push(...items);
      if (items.length < limit) break;
      offset += limit;
      page += 1;
    }
    if (page === maxPages) {
      console.warn('⚠️ fetchCodingNinjasProblems reached max pages, stopping early');
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

/**
 * Fetch the total number of solved problems for a Coding Ninjas user.
 *
 * @param {string} username CodingNinjas/Code360 handle
 * @param {string} [token]   Optional JWT for the private Code360 API
 * @returns {Promise<number>} Solved problem count
 */
export async function fetchCodingNinjasSolvedCount(username, token) {
  // 1️⃣ Try the authenticated endpoint when a JWT token is provided
  if (token) {
    try {
      const { data } = await axios.get(
        'https://www.naukri.com/code360/api/v1/user/me/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const count = data?.stats?.totalSolved;
      if (typeof count === 'number') return count;
    } catch (err) {
      console.warn('⚠️ fetchCodingNinjasSolvedCount token error:', err.message);
    }
  }

  // 2️⃣ Fallback to the public search endpoint
  try {
    const url =
      `https://www.naukri.com/code360/api/v1/user/search?username=${encodeURIComponent(
        username
      )}&fields=profile,stats`;
    const { data } = await axios.get(url);
    const count = data?.results?.[0]?.stats?.totalSolved;
    return typeof count === 'number' ? count : 0;
  } catch (err) {
    console.warn('⚠️ fetchCodingNinjasSolvedCount error:', err.message);
    return 0;
  }
}

/**
 * Fetch contribution stats for a Coding Ninjas user via the public Code360 API.
 * This returns the total submission count as well as the per-type counts
 * (e.g. coding vs MCQ submissions).
 *
 * @param {string} username Coding Ninjas/Code360 handle
 * @returns {Promise<{ totalSubmissionCount: number, typeCountMap: Record<string, number> }>}
 */
export async function fetchCodingNinjasContributionStats(username) {
  try {
    // First lookup the user's UUID using the username handle
    const detailsUrl =
      `https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=${encodeURIComponent(
        username
      )}&app_context=publicsection&naukri_request=true`;
    const { data: details } = await axios.get(detailsUrl);
    const uuid =
      details?.data?.user_details?.uuid ||
      details?.data?.profile?.uuid ||
      details?.data?.uuid;
    if (!uuid) {
      console.warn('⚠️ fetchCodingNinjasContributionStats: uuid not found');
      return { totalSubmissionCount: 0, typeCountMap: {} };
    }

    // Build date range for the last year
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);

    const contributionsUrl =
      `https://www.naukri.com/code360/api/v3/public_section/profile/contributions?uuid=${uuid}&end_date=${encodeURIComponent(
        end.toISOString()
      )}&start_date=${encodeURIComponent(
        start.toISOString()
      )}&is_stats_required=true&unified=true&app_context=publicsection&naukri_request=true`;

    const { data: contrib } = await axios.get(contributionsUrl);
    const stats = contrib?.data || {};
    const total = stats.total_submission_count || 0;
    const map = stats.type_count_map || {};
    return { totalSubmissionCount: total, typeCountMap: map };
  } catch (err) {
    console.error('❌ fetchCodingNinjasContributionStats error:', err.message);
    return { totalSubmissionCount: 0, typeCountMap: {} };
  }
}
