// backend/services/contests.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import Contest from '../models/Contest.js'; // Make sure you have this model

// Fetch Codeforces contests via API
export async function fetchCodeforcesContests() {
  const { data } = await axios.get('https://codeforces.com/api/contest.list');
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error');
  return data.result.map(c => {
    const start = new Date(c.startTimeSeconds * 1000);
    const end = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
    return {
      platform: 'codeforces',
      name: c.name,
      url: `https://codeforces.com/contest/${c.id}`,
      startTime: start,
      endTime: end,
      duration: c.durationSeconds,
    };
  });
}

// Fetch LeetCode contests via API
export async function fetchLeetCodeContests() {
  const { data } = await axios.get('https://leetcode.com/contest/api/list/');
  const list = Array.isArray(data.contests) ? data.contests : [];
  return list.map(c => {
    const start = new Date(c.start_time * 1000);
    const end = new Date((c.start_time + c.duration) * 1000);
    return {
      platform: 'leetcode',
      name: c.title,
      url: `https://leetcode.com/contest/${c.title_slug}`,
      startTime: start,
      endTime: end,
      duration: c.duration,
    };
  });
}

// Fetch AtCoder contests by scraping HTML
export async function fetchAtCoderContests() {
  const { data: html } = await axios.get('https://atcoder.jp/contests/?lang=en');
  const $ = cheerio.load(html);

  function parseTable(sel) {
    const results = [];
    $(sel).find('tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      const timeStr = cells.eq(0).text().trim();
      const nameEl = cells.eq(1).find('a');
      const durationStr = cells.eq(2).text().trim();
      if (!nameEl.attr('href')) return;
      const [h, m] = durationStr.split(':').map(Number);
      const dur = (h || 0) * 3600 + (m || 0) * 60;
      const start = new Date(`${timeStr}+09:00`);
      const end = new Date(start.getTime() + dur * 1000);
      results.push({
        platform: 'atcoder',
        name: nameEl.text().trim(),
        url: `https://atcoder.jp${nameEl.attr('href')}`,
        startTime: start,
        endTime: end,
        duration: dur,
      });
    });
    return results;
  }

  return [
    ...parseTable('#contest-table-upcoming'),
    ...parseTable('#contest-table-recent')
  ];
}

// Fetch CodeChef contests by scraping HTML
export async function fetchCodeChefContests() {
  const { data: html } = await axios.get('https://www.codechef.com/contests');
  const $ = cheerio.load(html);

  const results = [];
  $('#future-contests-data tbody tr, #present-contests-data tbody tr').each((_, el) => {
    const cells = $(el).find('td');
    const nameEl = cells.eq(1).find('a');
    if (!nameEl.attr('href')) return;

    const startStr = cells.eq(2).text().trim();
    const endStr = cells.eq(3).text().trim();

    const start = new Date(startStr);
    const end = new Date(endStr);
    const dur = Math.round((end.getTime() - start.getTime()) / 1000);

    results.push({
      platform: 'codechef',
      name: nameEl.text().trim(),
      url: nameEl.attr('href').startsWith('http') ? nameEl.attr('href') : `https://www.codechef.com${nameEl.attr('href')}`,
      startTime: start,
      endTime: end,
      duration: dur,
    });
  });

  return results;
}

// Optionally, add other fetchers (CodeChef, GFG, etc.) here!

// Refresh all contests and persist to MongoDB
export async function refreshAllContests() {
  const lists = await Promise.all([
    fetchCodeforcesContests(),
    fetchLeetCodeContests(),
    fetchAtCoderContests(),
     fetchCodeChefContests(),
  ]);
  const contests = lists.flat();

  for (const c of contests) {
    await Contest.updateOne(
      { platform: c.platform, name: c.name, startTime: c.startTime },
      { $set: c },
      { upsert: true }
    );
  }
  return contests;
}

// Backwards compatible: fetch all from DB, split by time
export async function fetchAllContests() {
  const now = new Date();
  const upcoming = await Contest.find({ endTime: { $gte: now } }).sort({ startTime: 1 });
  const past = await Contest.find({ endTime: { $lt: now } }).sort({ startTime: -1 });
  return { upcoming, past };
}

// For API endpoints expecting just upcoming contests
export async function fetchUpcomingContests() {
  const { upcoming } = await fetchAllContests();
  return upcoming;
}
