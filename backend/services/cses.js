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
 * (Optional) Scrape individual solved problems.
 */
export async function fetchCSESProblems(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const { data: html } = await axios.get(`${BASE}/user/${userId}`);
  const $ = load(html);
  const problems = [];
  $('a[href^="/problemset/task/"]').each((_, el) => {
    const link = $(el);
    const id = link.attr('href').split('/').pop();
    const dateText = link.closest('tr').find('td').last().text().trim();
    problems.push({
      id,
      title:     link.text().trim(),
      difficulty:'Unknown',
      tags:      [],
      solvedAt:  dateText ? new Date(dateText) : new Date(),
    });
  });
  return problems;
}

/**
 * Scrape and return the total “problems solved” count.
 * Throws if the user doesn’t exist.
 */
export async function fetchCSESSolvedCount(username) {
  const userId = /^\d+$/.test(username)
    ? Number(username)
    : await findCSESUserId(username);

  const { data: html } = await axios.get(`${BASE}/user/${userId}`);
  const $ = load(html);
  return $('a[href^="/problemset/task/"]').length;
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

  // Look for the “Submission count:” label in the info table
  const label = $('td,th')
    .filter((_, el) => $(el).text().trim() === 'Submission count:')
    .first();

  const text = label.next().text().trim();
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : 0;
}
