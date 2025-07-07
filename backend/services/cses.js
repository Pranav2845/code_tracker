// File: backend/services/cses.js
import axios from 'axios';
import { load } from 'cheerio';

const BASE = 'https://cses.fi';

/**
 * Get the master problem list (id, title, url) for mapping.
 */
async function fetchCSESProblemList() {
  const { data: html } = await axios.get(`${BASE}/problemset/`);
  const $ = load(html);
  const problems = [];
  $('table tr').each((_, el) => {
    const link = $(el).find('a[href^="/problemset/task/"]');
    if (!link.length) return;
    const href = link.attr('href');
    const id = href.split('/').filter(Boolean).pop();
    problems.push({
      id,
      title: link.text().trim(),
      url: `${BASE}${href}`,
    });
  });
  return problems;
}

/**
 * Parse user's solved grid and return array of solved problem IDs.
 * (Does NOT rely on cell index; finds the href/task ID.)
 */
async function fetchSolvedProblemIds(userId) {
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);
  const solvedIds = [];
  $('table td').each((i, el) => {
    const cell = $(el);
    const isSolved =
      cell.find('img[alt*="check" i],img[alt*="solved" i]').length ||
      cell.text().trim() === '✓' ||
      cell.find('a.full').length;
    if (isSolved) {
      // Try to extract the problem link/task ID from the cell
      const link = cell.find('a[href^="/problemset/task/"]');
      if (link.length) {
        const href = link.attr('href');
        const id = href?.split('/').filter(Boolean).pop();
        if (id) solvedIds.push(id);
      }
    }
  });
  return solvedIds;
}

/**
 * Find numeric CSES user id for a username (searches all pages).
 */
export async function findCSESUserId(username, maxPages = 10) {
  const search = username.trim().toLowerCase();
  for (let page = 1; page <= maxPages; page++) {
    const { data: html } = await axios.get(`${BASE}/list/user/${page}`);
    const $ = load(html);
    const row = $('table tr').filter((_, el) =>
      $(el).find('a[href^="/user/"]').text().trim().toLowerCase() === search
    ).first();
    if (row.length) {
      const href = row.find('a[href^="/user/"]').attr('href');
      const m = href && href.match(/\/user\/(\d+)/);
      if (m) return Number(m[1]);
    }
    if (!$(`a[href="/list/user/${page + 1}"]`).length) break;
  }
  throw new Error('User not found');
}

/**
 * Return solved problems (id, title, url) for username or userId.
 * This is the function your API should call!
 */
export async function fetchCSESProblems(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);

  let problemList, solvedIds;
  try {
    [problemList, solvedIds] = await Promise.all([
      fetchCSESProblemList(),
      fetchSolvedProblemIds(userId),
    ]);
  } catch (err) {
    console.error('⚠️ fetchCSESProblems failed:', err?.message || err);
    return [];
  }

  // Map by ID (not index)
  const problemMap = Object.fromEntries(problemList.map(p => [p.id, p]));
  return solvedIds.map(id => problemMap[id]).filter(Boolean);
}

/**
 * Get solved count for user from "Solved tasks: X/Y"
 */
export async function fetchCSESSolvedCount(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);
  const match = $('body').text().match(/Solved tasks:\s*(\d+)\s*\/\s*(\d+)/i);
  if (match) return Number(match[1]);
  // fallback: count solved cells
  let solvedCount = 0;
  $('table td').each((_, el) => {
    const cell = $(el);
    const isSolved =
      cell.find('img[alt*="check" i],img[alt*="solved" i]').length ||
      cell.text().trim() === '✓' ||
      cell.find('a.full').length;
    if (isSolved) solvedCount++;
  });
  return solvedCount;
}
