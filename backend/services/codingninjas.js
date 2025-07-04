import axios from 'axios';
import * as cheerio from 'cheerio';


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

function mapProblem(p) {
  return {
    id: String(p.id ?? p.problem_id ?? p.title ?? p.problemTitle),
    title: p.title || p.problem_title || p.problemTitle || '',
    difficulty: p.difficulty || 'Unknown',
    tags: p.tags || [],
    solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
      };
}

function findProblemArray(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    if (obj.every((o) => typeof o === 'object' && (o.title || o.problem_title))) {
      return obj;
    }
    for (const el of obj) {
      const found = findProblemArray(el);
      if (found) return found;
    }
    return null;
  }
  for (const val of Object.values(obj)) {
    const found = findProblemArray(val);
    if (found) return found;
  }
  return null;
}

async function scrapeCodingNinjasSolvedProblems(username) {
  const url = `https://www.codingninjas.com/studio/profile/${encodeURIComponent(username)}`;
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  const next = $('#__NEXT_DATA__').html();
  if (next) {
    try {
      const json = JSON.parse(next);
      const arr = findProblemArray(json);
      if (Array.isArray(arr)) {
        return arr.map(mapProblem);
      }
    } catch (err) {
      console.warn('⚠️ parse __NEXT_DATA__ failed:', err.message);
    }
  }
  const titles = new Set();
  $('a[href*="/problems/"]').each((i, el) => {
    const t = $(el).text().trim();
    if (t) titles.add(t);
  });
  return Array.from(titles).map((t) => ({
    id: t,
    title: t,
    difficulty: 'Unknown',
    tags: [],
    solvedAt: new Date(),
  }));
}
export async function fetchCodingNinjasProblems(username) {
  try {
    const id = await fetchUserId(username);
    const url = `${BASE_URL}/profile/solved_problems?user_id=${id}`;
    const data = await getWithRetry(url);
    const list = data?.data?.problems || data?.problems || [];
    return list.map(mapProblem);
  } catch (err) {
    console.warn('⚠️ fetchCodingNinjasProblems API failed:', err.message);
    try {
      const scraped = await scrapeCodingNinjasSolvedProblems(username);
      if (Array.isArray(scraped)) return scraped;
    } catch (e) {
      console.warn('⚠️ scrapeCodingNinjasSolvedProblems failed:', e.message);
    }
    throw err;
  }
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
