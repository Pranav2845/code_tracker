// backend/services/cses.js

import axios from 'axios';
import { load } from 'cheerio';

/**
 * Search the CSES public user list for the numeric id of a username.
 * Iterates pages `https://cses.fi/list/user/{page}` until the user is found
 * or `maxPages` (default 10) is reached.
 *
 * Returns the numeric id or `null` if not found.
 */
export async function findCSESUserId(username, maxPages = 10) {
  const search = username.trim().toLowerCase();
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://cses.fi/list/user/${page}`;
    try {
      const { data: html } = await axios.get(url);
      const $ = load(html);
      const row = $('table tr').filter((_, el) => {
        const name = $(el).find('a[href^="/user/"]').text().trim().toLowerCase();
        return name === search;
      }).first();
      if (row.length) {
        const href = row.find('a[href^="/user/"]').attr('href');
        const m = href && href.match(/\/user\/(\d+)/);
        if (m) return Number(m[1]);
      }
      const nextExists = $(`a[href="/list/user/${page + 1}"]`).length > 0;
      if (!nextExists) break;
    } catch (err) {
      console.warn(`⚠️ findCSESUserId page ${page} error:`, err.message);
      break;
    }
  }
  return null;
}

export async function fetchCSESProblems(username) {
  const id = await findCSESUserId(username);
  if (!id) {
    throw new Error(`CSES user '${username}' not found`);
  }
  const url = `https://cses.fi/user/${id}`;
  const { data: html } = await axios.get(url);

  const $ = load(html);
  const problems = [];

  $('a[href^="/problemset/task/"]').each((_, el) => {
    const link = $(el);
    const id = link.attr('href').split('/').pop();
    const row = link.closest('tr');
    const dateText = row.find('td').last().text().trim();
    const solvedAt = dateText ? new Date(dateText) : new Date();

    problems.push({
      id,
      title: link.text().trim(),
      difficulty: 'Unknown',
      tags: [],
      solvedAt,
    });
  });

  return problems;
}

export async function fetchCSESCount(username) {
   const id = await findCSESUserId(username);
  if (!id) return 0;

  const url = `https://cses.fi/user/${id}`;
  const { data: html } = await axios.get(url);

  const $ = load(html);
  return $('a[href^="/problemset/task/"]').length;
}