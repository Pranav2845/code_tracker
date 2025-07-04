import axios from 'axios';

const BASE_URL = 'https://api.codingninjas.com/api/v3/code360';
const MAX_RETRIES = 3;

async function getWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data } = await axios.get(url, options);
      return data;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function fetchUserId(username) {
  const url = `${BASE_URL}/profile/user_details?username=${encodeURIComponent(username)}`;
  const data = await getWithRetry(url);
  const id =
    data?.data?.user_id ??
    data?.data?.user?.user_id ??
    data?.data?.user?.id ??
    data?.user_id;
  if (!id) {
    throw new Error('Coding Ninjas user not found');
  }
  return id;
}

export async function fetchCodingNinjasProblems(username) {
  const id = await fetchUserId(username);
  const url = `${BASE_URL}/profile/solved_problems?user_id=${id}`;
  const data = await getWithRetry(url);
  const list = data?.data?.problems || data?.problems || [];
  return list.map((p) => ({
    id: String(p.id ?? p.problem_id ?? p.title),
    title: p.title || p.problem_title || '',
    difficulty: p.difficulty || 'Unknown',
    tags: p.tags || [],
    solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
  }));
}

export async function fetchCodingNinjasContributionStats(username) {
  const id = await fetchUserId(username);
  const url = `${BASE_URL}/profile/contributions?user_id=${id}`;
  const data = await getWithRetry(url);
  return data?.data || data || {};
}

export async function fetchCodingNinjasSolvedCount(username) {
  try {
    const stats = await fetchCodingNinjasContributionStats(username);
    const count =
      stats?.solved_count ??
      stats?.count?.solved ??
      stats?.solved ??
      0;
    return typeof count === 'number' ? count : 0;
  } catch (err) {
    console.warn('⚠️ fetchCodingNinjasSolvedCount failed:', err.message);
    return 0;
  }
}

export async function fetchCodingNinjasSubmissionCount(username) {
  try {
    const stats = await fetchCodingNinjasContributionStats(username);
    const count =
      stats?.submission_count ??
      stats?.count?.submissions ??
      stats?.submissions ??
      0;
    return typeof count === 'number' ? count : 0;
  } catch (err) {
    console.warn('⚠️ fetchCodingNinjasSubmissionCount failed:', err.message);
    return 0;
  }
}
