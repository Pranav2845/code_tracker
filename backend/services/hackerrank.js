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
  let total = 0;
  while (true) {
    const pageUrl =
      page === 0
        ? 'https://www.hackerrank.com/submissions/all'
        : `https://www.hackerrank.com/submissions/all?page=${page}`;
    try {
      const { data: html } = await axios.get(pageUrl, AXIOS_OPTS);
      const $ = cheerio.load(html);
      const rows = $('table tbody tr').length;
      if (rows === 0) break;
      total += rows;
      const nextExists = $(`a[href*="?page=${page + 1}"]`).length > 0;
      if (!nextExists) break;
      page += 1;
    } catch (err) {
      console.warn(`⚠️ HackerRank scrape error on page ${page}:`, err.message);
      break;
    }
  }

  return total;
}

// Fetch up to 100 of the user's most recently solved challenges
export async function fetchHackerRankProblems(username) {
  const url = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/recent_challenges?offset=0&limit=100`;
  try {
    const { data } = await axios.get(url, AXIOS_OPTS);
    const list = data?.models || [];

    return list.map((ch) => {
      const ts = ch.created_at || ch.created_at_epoch || ch.completed_at;
      return {
        id: String(ch.id ?? ch.challenge_id ?? ch.slug ?? ch.name),
        title: ch.challenge_name || ch.name || ch.slug,
        difficulty: ch.difficulty_name || 'Unknown',
        tags: [],
        solvedAt: ts ? new Date(Number(ts) * (String(ts).length === 13 ? 1 : 1000)) : new Date(),
      };
    });
  } catch (err) {
    if (err.response?.status === 403) {
      console.warn(
        '⚠️ HackerRank recent_challenges not public for this user, returning empty list'
      );
      return [];
    }
    throw err;
  }
}
