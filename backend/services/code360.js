// File: backend/services/code360.js

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

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

// --- Scraping only: get solved problems from public profile HTML ---
export async function fetchCode360Problems(username) {
  const url = `https://www.naukri.com/code360/profile/${encodeURIComponent(username)}`;
  const { data: html } = await axios.get(url, AXIOS_OPTS);

  // 1. DEBUG: Dump HTML for inspection
  try {
    fs.writeFileSync('code360-profile.html', html); // You can open this file!
  } catch (err) {
    console.warn('Failed to write HTML for debug:', err.message);
  }

  // 2. Extract solved problems
  const $ = cheerio.load(html);
  const problems = [];
  // Loop through .submission-item containers (for each solved problem)
  $('.submission-item').each((i, el) => {
    // Problem name
    const problemName = $(el)
      .find('.problem-name-container .problem-name')
      .first()
      .text()
      .trim();

    // Problem link (if available)
    let problemLink = '';
    const anchor = $(el).find('a[href*="/problems/"]').first();
    if (anchor.length) {
      const href = anchor.attr('href');
      problemLink = href.startsWith('http') ? href : `https://www.naukri.com${href}`;
    }
    // Fallback: generate slug from name
    if (!problemLink && problemName) {
      const slug = problemName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      problemLink = `https://www.naukri.com/code360/problems/${slug}`;
    }

    if (problemName) {
      problems.push({
        id: problemName,
        title: problemName,
        url: problemLink,
        difficulty: '', // Not visible
        tags: [],
        solvedAt: null, // Not visible
      });
    }
  });

  return problems;
}

export { fetchCode360Problems as scrapeCode360SolvedProblems };

// --- The rest (stats etc.) can use API as before ---

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
