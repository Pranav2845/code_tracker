import axios from 'axios';
import { load } from 'cheerio';

const BASE = 'https://cses.fi';

/**
 * Return CSES problem list as an array (order matters!).
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
 * Parse user's solved grid and return array of solved cell indices.
 */
async function fetchSolvedGridIndices(userId) {
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);
  const indices = [];
  $('table td').each((i, el) => {
    const cell = $(el);
    const isSolved =
      cell.find('img[alt*="check" i],img[alt*="solved" i]').length ||
      cell.text().trim() === '✓' ||
      cell.hasClass('full');
    if (isSolved) indices.push(i);
  });
  return indices;
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
 */
export async function fetchCSESProblems(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);

  let problemList, solvedIndices;
  try {
    [problemList, solvedIndices] = await Promise.all([
      fetchCSESProblemList(),
      fetchSolvedGridIndices(userId),
    ]);
  } catch (err) {
    console.error('⚠️ fetchCSESProblems failed:', err?.message || err);
    return [];
  }

  // Map indices to problems
  return solvedIndices.map(idx => problemList[idx]).filter(Boolean);
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
      cell.hasClass('full');
    if (isSolved) solvedCount++;
  });
  return solvedCount;
}

/**
 * Read the "Submission count" value from user profile.
 */
export async function fetchCSESSubmissionCount(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);
  try {
    const { data: html } = await axios.get(`${BASE}/user/${userId}`);
    const $ = load(html);
    const label = $('td,th')
      .filter((_, el) => $(el).text().trim() === 'Submission count:')
      .first();
    const text = label.next().text().trim();
    const m = text.match(/\d+/);
    return m ? Number(m[0]) : 0;
  } catch (err) {
    return 0;
  }
}
