// backend/services/cses.js
import axios from 'axios';
import { load } from 'cheerio';

const BASE = 'https://cses.fi';

/**
 * Find the numeric CSES user‐ID for a given username (throws if not found).
 */
export async function findCSESUserId(username, maxPages = 10) {
  const search = username.trim().toLowerCase();
  for (let page = 1; page <= maxPages; page++) {
    try {
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
    } catch {
      break;
    }
  }
  throw new Error('User not found');
}

/**
 * Scrape and return the master CSES problem list in page order.
 */
export async function fetchCSESProblemList() {
  const { data: html } = await axios.get(`${BASE}/problemset/`);
  const $ = load(html);
  const problems = [];
  $('table tr').each((_, el) => {
    const link = $(el).find('a[href^="/problemset/task/"]').first();
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
 * Fetch solved grid for a user: which indices are solved, and the solved count.
 */
async function fetchSolvedGrid(userId) {
  const { data: html } = await axios.get(`${BASE}/problemset/user/${userId}`);
  const $ = load(html);

  // Find solved indices (cells with checkmark, green bg, or special img)
  const solvedIndices = [];
  $('table td').each((i, el) => {
    const cell = $(el);
    const hasCheck = cell.find('img[alt*="check" i],img[alt*="solved" i]').length;
    const green = cell.css ? cell.css('background-color') === 'green' : false;
    const text = cell.text().trim();
    if (hasCheck || text === '✓' || text === '✔') {
      solvedIndices.push(i);
    }
  });

  // Get solved count from "Solved tasks: X/400"
  let solvedCount = solvedIndices.length;
  let totalCount = $('table td').length;
  const solvedText = $('body').text();
  const m = solvedText.match(/Solved tasks:\s*(\d+)\s*\/\s*(\d+)/i);
  if (m) {
    solvedCount = Number(m[1]);
    totalCount = Number(m[2]);
  }

  return { solvedIndices, solvedCount, totalCount };
}

/**
 * Get array of solved problems (name, id, url) for a given username or userId.
 */
export async function fetchCSESProblems(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const [problemList, grid] = await Promise.all([
    fetchCSESProblemList(),
    fetchSolvedGrid(userId),
  ]);

  const problems = [];
  grid.solvedIndices.forEach(idx => {
    const item = problemList[idx];
    if (item) {
      problems.push({
        id: item.id,
        title: item.title,
        difficulty: 'Unknown',
        tags: [],
        solvedAt: null,
        url: item.url,
      });
    }
  });

  return problems;
}

/**
 * Scrape and return the total “problems solved” count from the solved grid page.
 * Throws if the user doesn’t exist or the profile page is not valid.
 */
export async function fetchCSESSolvedCount(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const { solvedCount } = await fetchSolvedGrid(userId);
  return solvedCount;
}

/**
 * Scrape and return the total problems count (always 400 for CSES, but parsed live).
 */
export async function fetchCSESTotalCount(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const { totalCount } = await fetchSolvedGrid(userId);
  return totalCount;
}

/**
 * Scrape and return the “submission count” from the profile info table.
 * Throws if the user doesn’t exist.
 */
export async function fetchCSESSubmissionCount(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const { data: html } = await axios.get(`${BASE}/user/${userId}`);
  const $ = load(html);

  const label = $('td,th')
    .filter((_, el) => $(el).text().trim() === 'Submission count:')
    .first();

  const text = label.next().text().trim();
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : 0;
}
