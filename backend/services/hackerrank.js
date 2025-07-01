import axios from 'axios';
import * as cheerio from 'cheerio';

// Always use a browser-like User-Agent and optional cookies for authenticated requests
const AXIOS_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0',
    ...(process.env.HACKERRANK_COOKIES
      ? { Cookie: process.env.HACKERRANK_COOKIES }
      : {}),
  },
};

// Fetch the total solved challenge count for a HackerRank user
export async function fetchHackerRankSolvedCount(username) {
  const url = `https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(username)}/profile`;
  try {
    const { data } = await axios.get(url, AXIOS_OPTS);
    const solved = data?.model?.solved_challenges;
    if (typeof solved === 'number') return solved;
  } catch (err) {
    console.warn('⚠️ HackerRank profile API failed:', err.message);
  }

  // 🕷️ Fallback: scrape submissions list pages (requires login cookies!)
  let page = 0;
  const solved = new Set();
  while (true) {
    const pageUrl =
      page === 0
        ? 'https://www.hackerrank.com/submissions/all'
        : `https://www.hackerrank.com/submissions/all?page=${page}`;
    try {
      const { data: html } = await axios.get(pageUrl, AXIOS_OPTS);
      const $ = cheerio.load(html);

      let found = false;
      $('table tbody tr').each((_, el) => {
        const cells = $(el).find('td');
        const result = cells.eq(3).text().trim();
        if (result === 'Accepted') {
          found = true;
          const name = cells.eq(0).text().trim();
          if (name) solved.add(name);
        }
      });
      if (!found) break;

      const nextExists = $(`a[href*="?page=${page + 1}"]`).length > 0;
      if (!nextExists) break;
      page += 1;
    } catch (err) {
      console.warn(`⚠️ HackerRank scrape error on page ${page}:`, err.message);
      break;
    }
  }

  return solved.size;
}

// Fetch up to 100 of the user's most recently solved challenges
export async function fetchHackerRankProblems(username) {
  const url = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/recent_challenges?offset=0&limit=100`;
  try {
    const { data } = await axios.get(url, AXIOS_OPTS);
    const list = data?.models || [];

    const problems = list.map((ch) => {
      const ts = ch.created_at || ch.created_at_epoch || ch.completed_at;
      let date;
      if (ts) {
        date = new Date(ts);
        // If it's not a valid date (i.e., "Invalid Date")
        if (isNaN(date)) {
          const num = Number(ts);
          if (!Number.isNaN(num)) {
            // Use ms if 13 digits, otherwise treat as seconds
            date = new Date(num * (String(num).length === 13 ? 1 : 1000));
          } else {
            date = new Date();
          }
        }
      } else {
        date = new Date();
      }
      if (isNaN(date)) date = new Date();

      return {
        id: String(ch.id ?? ch.challenge_id ?? ch.slug ?? ch.name),
        title: ch.challenge_name || ch.name || ch.slug,
        difficulty: ch.difficulty_name || 'Unknown',
        tags: [],
        solvedAt: date,
      };
    });

    return { problems };
  } catch (err) {
    const status = err.response?.status;
    if (status >= 400 && status < 600) {
      console.error('❌ fetchHackerRankProblems error:', err.message);
      let message = '⚠️ Failed to fetch HackerRank submissions.';
      if (status === 403) {
        message = '⚠️ HackerRank recent challenges are not public for this user.';
      } else if (status === 404) {
        message = '⚠️ HackerRank user not found.';
      }
      return { problems: [], message };
    }
    throw err;
  }
}
