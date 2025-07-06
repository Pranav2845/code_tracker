import axios from 'axios';
import { load } from 'cheerio';

const BASE = 'https://cses.fi';

/**
 * Return full CSES problem list as a map by problem id.
 */
async function fetchCSESProblemMap() {
  const { data: html } = await axios.get(`${BASE}/problemset/`);
  const $ = load(html);
  const problems = {};
  $('table tr').each((_, el) => {
    const link = $(el).find('a[href^="/problemset/task/"]');
    if (!link.length) return;
    const href = link.attr('href');
    const id = href.split('/').filter(Boolean).pop();
    problems[id] = {
      id,
      title: link.text().trim(),
      url: `${BASE}${href}`,
    };
  });
  return problems;
}

/**
 * Parse the user's grid page and extract solved problem IDs from solved cells.
 */
async function fetchCSESSolvedProblemIDs(userId) {
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);
  const solvedIDs = [];

  // Parse grid cells for solved problems
  $('table td').each((_, el) => {
    const cell = $(el);
    // Is this cell solved? CSES uses a green check icon or sometimes a "✓"
    const isSolved =
      cell.find('img[alt*="check" i],img[alt*="solved" i]').length ||
      cell.text().trim() === '✓' ||
      cell.hasClass('full'); // Sometimes solved problems have 'full' class

    if (isSolved) {
      const link = cell.find('a[href^="/problemset/task/"]');
      if (link.length) {
        const href = link.attr('href');
        const id = href.split('/').filter(Boolean).pop();
        if (id) solvedIDs.push(id);
      }
    }
  });

  // Fallback: also try to parse the "Solved tasks: X/Y" just in case
  // (not needed for the name mapping, just for count)
  return solvedIDs;
}

/**
 * Find CSES numeric user id for username (by search)
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
 * Return solved problems (id, title, url) for username or userId
 */
export async function fetchCSESProblems(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);

  const [problemMap, solvedIDs] = await Promise.all([
    fetchCSESProblemMap(),
    fetchCSESSolvedProblemIDs(userId),
  ]);

  // Map each solved ID to its problem info
  return solvedIDs
    .map(id => problemMap[id])
    .filter(Boolean);
}

/**
 * Get the solved count for a user (from "Solved tasks: X/Y" line)
 */
export async function fetchCSESSolvedCount(usernameOrId) {
  const userId = /^\d+$/.test(usernameOrId)
    ? Number(usernameOrId)
    : await findCSESUserId(usernameOrId);
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);
  // Match "Solved tasks: X/Y"
  const match = $('body').text().match(/Solved tasks:\s*(\d+)\s*\/\s*(\d+)/i);
  if (match) {
    return Number(match[1]);
  }
  // Fallback: count solved problems from grid
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
