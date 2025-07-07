// backend/services/codechef.js

import axios from 'axios';
import { load } from 'cheerio';

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
    throw new Error('User not found');
  }

  // This check is still safe as a quick "profile exists" gate:
  if (!/user-details/i.test(html)) {
    throw new Error('User not found');
  }

  // Extract “Total Problems Solved: N” if available (optional fallback)
  const m = html.match(/Total Problems Solved:\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Fetches a user's recent solved problems from their CodeChef profile Recent Activity section.
 * Returns: [{ id, title, url }]
 */
export async function fetchCodeChefProblems(username) {
  let html;
  try {
    const resp = await axios.get(PROFILE_URL(username));
    html = resp.data;
  } catch {
    throw new Error('User not found');
  }

  const $ = load(html);
  const problems = [];

  // Find the "Recent Activity" table and extract problem titles and URLs
  $('section:contains("Recent Activity") table tbody tr').each((_, el) => {
    const problemLink = $(el).find('td:nth-child(2) a');
    const title = problemLink.text().trim();
    const href = problemLink.attr('href');
    if (title && href) {
      problems.push({
        id: title, // Use title as id for recent, since it's unique enough
        title,
        url: href.startsWith('http') ? href : `https://www.codechef.com${href}`
      });
    }
  });

  return problems;
}
