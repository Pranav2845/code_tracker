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

// Retry wrapper for GET requests
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

// Robust user id fetcher with improved fallbacks
async function fetchUserId(username) {
  const url = `${BASE_URL}/profile/user_details?uuid=${encodeURIComponent(
    username
  )}&request_differentiator=1751613875507&app_context=publicsection&naukri_request=true`;

  const data = await getWithRetry(url);

  // Fallback logic for user id
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

// Normalizes a problem object into standard format
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
      p.slug
        ? `https://www.naukri.com/code360/problems/${p.slug}`
        : p.problem_slug
        ? `https://www.naukri.com/code360/problems/${p.problem_slug}`
        : undefined,
  };
}

// Recursively finds a problem array in a possibly nested object
function findProblemArray(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    if (
      obj.every(
        (o) =>
          typeof o === 'object' &&
          (
            o.title ||
            o.problem_title ||
            o.problemTitle ||
            o.problemName ||
            o.problem_name ||
            o.problemId ||
            o.problem_id ||
            o.slug ||
            o.level ||
            o.topics
          )
      )
    ) {
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

// Scrape fallback for solved problems, for cases where API fails
async function scrapeCode360SolvedProblems(username) {
  const url = `https://www.naukri.com/code360/profile/${encodeURIComponent(
    username
  )}`;
  const { data: html } = await axios.get(url, AXIOS_OPTS);
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

  // Fallback to just extracting visible problem titles
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

// Fetches all solved problems using API, falls back to scrape if needed
export async function fetchCode360Problems(username) {
  try {
    const problems = [];
    const baseParams =
      'request_differentiator=1751613875507&app_context=publicsection&naukri_request=true';
    const baseUrl = `${BASE_URL}/profile/view_solved_problems`;

    let page = 1;
    let totalPages = 1;

    do {
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

// Gets contribution stats for a user
export async function fetchCode360ContributionStats(username) {
  const id = await fetchUserId(username);
  const url = `${BASE_URL}/profile/contributions?user_id=${id}&request_differentiator=1751613875507&app_context=publicsection&naukri_request=true`;
  const data = await getWithRetry(url);
  return data?.data || data || {};
}

// Gets solved count
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

// Gets submission count
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

// Fetches the total problem count as shown on the user's profile
export async function fetchCode360ProfileTotalCount(username) {
  const url = `${BASE_URL}/profile/user_details?uuid=${encodeURIComponent(
    username
  )}&request_differentiator=1751613875507&app_context=publicsection&naukri_request=true`;
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
