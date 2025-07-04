// backend/services/codechef.js

import axios from 'axios';

const PROFILE_URL = (username) =>
  `https://www.codechef.com/users/${encodeURIComponent(username)}`;

/**
 * Scrape the CodeChef profile page to get the total problems solved.
 * Throws if the profile page looks like “not found”.
 */
export async function fetchCodeChefSolvedCount(username) {
  let html;
  try {
    const resp = await axios.get(PROFILE_URL(username));
    html = resp.data;
  } catch (err) {
    // e.g. network error, 404 status, etc.
    throw new Error('User not found');
  }

  // 1️⃣ Check for the “Problems Successfully Solved” section
  //    (class only present on real profiles)
  if (!/rating-data-section problems-solved/i.test(html)) {
    throw new Error('User not found');
  }

  // 2️⃣ Extract “Total Problems Solved: N”
  const m = html.match(/Total Problems Solved:\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Stub for fetching individual solved problems.
 */
export async function fetchCodeChefProblems(username) {
  return [];
}
