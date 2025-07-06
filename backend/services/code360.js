// File: backend/services/code360.js

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.naukri.com/code360/api/v3/public_section';
const MAX_RETRIES = 3;

const AXIOS_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0',
    ...(process.env.CODE360_COOKIES
      ? { Cookie: process.env.CODE360_COOKIES }
      : {}),
  },
};

async function getWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const opts = {
        ...AXIOS_OPTS,
        ...options,
        headers: { ...AXIOS_OPTS.headers, ...(options.headers || {}) },
      };
      const { data } = await axios.get(url, opts);
      return data;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function fetchUserId(username) {
  const differentiator = Date.now();
  const url = `${BASE_URL}/profile/user_details?uuid=${encodeURIComponent(
    username
  )}&request_differentiator=${differentiator}&app_context=publicsection&naukri_request=true`;

  const data = await getWithRetry(url);

  const id =
    data?.data?.profile?.user_id ??
    data?.data?.profile?.id ??
    data?.data?.user_id ??
    data?.data?.user?.user_id ??
    data?.data?.user?.id ??
    data?.user_id ??
    data?.data?.profile?.uuid ??
    data?.data?.profile?.slug ??
    null;

  if (!id) {
    throw new Error('Code360 user not found');
  }
  return id;
}

function mapProblem(p) {
  return {
    id: String(
      p.id ??
      p.problem_id ??
      p.problemId ??
      p.slug ??
      p.title ??
      p.problemTitle ??
      p.problemName ??
      p.problem_name
    ),
    title:
      p.title ||
      p.problem_title ||
      p.problemTitle ||
      p.problemName ||
      p.problem_name ||
      p.slug ||
      '',
    difficulty: p.difficulty || p.level || 'Unknown',
    tags: p.tags || p.topics || [],
    solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
    url:
      p.link ||
      (p.slug
        ? `https://www.naukri.com/code360/problems/${p.slug}`
        : p.problem_slug
        ? `https://www.naukri.com/code360/problems/${p.problem_slug}`
        : undefined),
  };
}

// Recursively finds a problem array in a possibly nested object
function findProblems(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    if (obj.length && obj[0]?.problem_name && obj[0]?.link !== undefined)
      return obj;
    for (const item of obj) {
      const found = findProblems(item);
      if (found) return found;
    }
  } else {
    for (const val of Object.values(obj)) {
      const found = findProblems(val);
      if (found) return found;
    }
  }
  return null;
}

// --- Scraping fallback, now using robust __NEXT_DATA__ parsing ---
async function scrapeCode360SolvedProblems(username) {
  const url = `https://www.naukri.com/code360/profile/${encodeURIComponent(username)}`;
  const { data: html } = await axios.get(url, AXIOS_OPTS);
  const $ = cheerio.load(html);

  const nextData = $('#__NEXT_DATA__').html();
  if (!nextData) throw new Error('Could not find embedded React data!');
  const json = JSON.parse(nextData);

  const arr = findProblems(json);
  if (!arr) throw new Error('Solved problems array not found!');

  return arr.map((p) => ({
    id: String(p.offering_id || p.id),
    title: p.problem_name,
    url: p.link || '#',
    solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
    difficulty: 'Unknown',
    tags: [],
  }));
}

// --- Main exported function: Try API, else fall back to scrape ---
export async function fetchCode360Problems(username) {
  try {
    const problems = [];
    const baseUrl = `${BASE_URL}/profile/view_solved_problems`;

    let page = 1;
    let totalPages = 1;

    do {
      const differentiator = Date.now();
      const baseParams =
        `request_differentiator=${differentiator}&app_context=publicsection&naukri_request=true`;
      const url = `${baseUrl}?page=${page}&screen_name=${encodeURIComponent(
        username
      )}&${baseParams}`;
      const { data } = await axios.get(url, AXIOS_OPTS);

      const arr = data?.data?.problem_submissions || [];
      arr.forEach((p) => {
        problems.push({
          id: String(p.offering_id),
          title: p.problem_name,
          url: p.link || '#',
          solvedAt: p.solved_at ? new Date(p.solved_at) : new Date(),
          difficulty: 'Unknown',
          tags: [],
        });
      });

      totalPages = data?.data?.total_pages || 1;
      page += 1;
    } while (page <= totalPages);

    return problems;
  } catch (err) {
    console.warn(
      `⚠️ fetchCode360Problems API failed for ${username}, falling back to HTML scrape:`,
      err.message
    );
    return await scrapeCode360SolvedProblems(username);
  }
}

export async function fetchCode360ContributionStats(username) {
  const id = await fetchUserId(username);
  const differentiator = Date.now();
  const url = `${BASE_URL}/profile/contributions?user_id=${id}&request_differentiator=${differentiator}&app_context=publicsection&naukri_request=true`;
  const data = await getWithRetry(url);
  return data?.data || data || {};
}

export async function fetchCode360SolvedCount(username) {
  try {
    const stats = await fetchCode360ContributionStats(username);
    const count =
      stats?.solved_count ?? stats?.count?.solved ?? stats?.solved ?? 0;
    return typeof count === 'number' ? count : 0;
  } catch (err) {
    console.warn('⚠️ fetchCode360SolvedCount failed:', err.message);
    return 0;
  }
}

export async function fetchCode360SubmissionCount(username) {
  try {
    const stats = await fetchCode360ContributionStats(username);
    const count =
      stats?.submission_count ??
      stats?.count?.submissions ??
      stats?.submissions ??
      0;
    return typeof count === 'number' ? count : 0;
  } catch (err) {
    console.warn('⚠️ fetchCode360SubmissionCount failed:', err.message);
    return 0;
  }
}

export async function fetchCode360ProfileTotalCount(username) {
  const differentiator = Date.now();
  const url = `${BASE_URL}/profile/user_details?uuid=${encodeURIComponent(
    username
  )}&request_differentiator=${differentiator}&app_context=publicsection&naukri_request=true`;
  try {
    const data = await getWithRetry(url);
    const totalCount =
      data?.data?.profile?.dsa_domain_data?.problem_count_data?.total_count ??
      data?.data?.dsa_domain_data?.problem_count_data?.total_count ??
      data?.dsa_domain_data?.problem_count_data?.total_count ??
      null;
    if (typeof totalCount === 'number') {
      return totalCount;
    } else {
      throw new Error('Total count not found');
    }
  } catch (err) {
    console.warn('⚠️ fetchCode360ProfileTotalCount failed:', err.message);
    return null;
  }
}

// Optionally export the scrape fallback for direct use:
export { scrapeCode360SolvedProblems };
