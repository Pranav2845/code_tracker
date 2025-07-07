// File: backend/services/codechef.js
import axios from 'axios';
import { load } from 'cheerio';

// Use the recent activity API URL
const RECENT_URL = (username) =>
  `https://www.codechef.com/recent/user?page=1&user_handle=${encodeURIComponent(username)}`;

const PROFILE_URL = (username) =>
  `https://www.codechef.com/users/${encodeURIComponent(username)}`;

// Exported: Fetch CodeChef solved count (from profile page)
export async function fetchCodeChefSolvedCount(username) {
  let html;
  try {
    const resp = await axios.get(PROFILE_URL(username));
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



// Exported: Fetch CodeChef recent accepted problems
export async function fetchCodeChefProblems(username) {
  let data;
  try {
    const resp = await axios.get(RECENT_URL(username));
    data = resp.data;
  } catch {
    throw new Error('User not found');
  }

  // Extract and parse the "content" property (which is an HTML string)
  let content;
  try {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
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

  // Use a Set to keep unique titles
  const seen = new Set();
  const problems = [];

  $('tr').each((_, el) => {
    const link = $(el).find('td').eq(1).find('a[href*="/problems/"]');
    if (!link.length) return;

    const href = link.attr('href');
    const title = link.text().trim();

    const resultTd = $(el).find('td').eq(2);
    const accepted = resultTd.text().includes('(100)');
    if (!accepted) return;

    if (seen.has(title)) return; // skip duplicates
    seen.add(title);

    problems.push({
      id: title,
      title,
      url: href.startsWith('http') ? href : `https://www.codechef.com${href}`,
    });
  });

  return problems;
}

