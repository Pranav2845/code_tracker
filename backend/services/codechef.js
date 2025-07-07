// File: backend/services/codechef.js
import axios from 'axios';
import { load } from 'cheerio';

// Always use a browser-like User-Agent for scraping
const AXIOS_OPTS = {
  headers: { 'User-Agent': 'Mozilla/5.0' }
};

// Use the recent activity API URL
const RECENT_URL = (username) =>
  `https://www.codechef.com/recent/user?page=1&user_handle=${encodeURIComponent(username)}`;

const PROFILE_URL = (username) =>
  `https://www.codechef.com/users/${encodeURIComponent(username)}`;

// Helper: fetch full title from CodeChef problem page
async function fetchProblemTitle(url) {
  try {
    const { data: html } = await axios.get(url, AXIOS_OPTS);
    const $ = load(html);
    // Title is in <h3 class="notranslate"> under .problem-statement
    const title = $('.problem-statement h3.notranslate').first().text().trim();
    return title || null;
  } catch (e) {
    // If failed to fetch, just fallback to null
    return null;
  }
}

// Exported: Fetch CodeChef solved count (from profile page)
export async function fetchCodeChefSolvedCount(username) {
  let html;
  try {
    const resp = await axios.get(PROFILE_URL(username), AXIOS_OPTS);
    html = resp.data;
  } catch (err) {
    throw new Error('User not found');
  }

  // Gate: check if user exists (simple marker check)
  if (!/user-details/i.test(html)) {
    throw new Error('User not found');
  }

  // Match "Total Problems Solved: N"
  const m = html.match(/Total Problems Solved:\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

// Exported: Fetch CodeChef recent accepted problems with full titles
export async function fetchCodeChefProblems(username) {
  let data;
  try {
    const resp = await axios.get(RECENT_URL(username), AXIOS_OPTS);
    data = resp.data;
  } catch {
    throw new Error('User not found');
  }

  // Extract and parse the "content" property (which is an HTML string)
  let content;
  try {
    if (typeof data === 'string') data = JSON.parse(data);
    content = data?.content || '';
  } catch (e) {
    content = '';
  }

  content = content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  const $ = load(content);
  const seen = new Set();
  const problems = [];

  $('tr').each((_, el) => {
    const link = $(el).find('td').eq(1).find('a[href*="/problems/"]');
    if (!link.length) return;
    const href = link.attr('href');
    const code = link.text().trim();
    const resultTd = $(el).find('td').eq(2);
    const accepted = resultTd.text().includes('(100)');
    if (!accepted) return;
    if (seen.has(code)) return; // skip duplicates
    seen.add(code);

    const url = href.startsWith('http') ? href : `https://www.codechef.com${href}`;
    problems.push({
      id: code,
      title: code, // Will be replaced by actual title
      url,
    });
  });

  // --- Fetch and replace with actual titles (sequential for simplicity) ---
  for (const p of problems) {
    const realTitle = await fetchProblemTitle(p.url);
    if (realTitle) p.title = realTitle;
  }

  return problems;
}
