// backend/services/gfg.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetch solved problems from GeeksforGeeks Practice.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchGFGProblems(username) {
  // 1️⃣ Try the “official” practiceapi endpoint
  const officialUrl = `https://practiceapi.geeksforgeeks.org/api/v1/user/get_stats?username=${encodeURIComponent(username)}`;
  try {
    const { data } = await axios.get(officialUrl);
    const problems =
      data?.data?.practice?.problems ||
      data?.practice?.problems ||
      [];
    console.log(`🔍 Official API returned ${problems.length} problems for ${username}`);
    return problems.map(p => ({
      id:         p.pid || p.problemId || p.problem_code || p.title,
      title:      p.problemTitle || p.title || '',
      difficulty: p.difficulty || 'Unknown',
      tags:       p.tags || [],
      solvedAt:   p.solvedOn ? new Date(p.solvedOn) : new Date(),
    }));
  } catch (err) {
    // If the official API 404s (user not found), fall through
    if (err.response?.status === 404) {
      console.warn(`⚠️ Official GfG API 404 for ${username}, falling back…`);
    } else {
      console.error('❌ fetchGFGProblems error for', username, err.response?.data || err.message);
      throw err;
    }
  }

  // 2️⃣ Fallback: unofficial Vercel-hosted API
  try {
    const vercelUrl = `https://geeks-for-geeks-api.vercel.app/${encodeURIComponent(username)}`;
    const { data } = await axios.get(vercelUrl);
    console.log(`🔍 Unofficial API returned ${data.problems.length} problems for ${username}`);
    return data.problems.map(p => ({
      id:         p.name,
      title:      p.name,
      difficulty: p.difficulty || 'Unknown',
      tags:       [],              // not available via this API
      solvedAt:   new Date(),      // timestamp not exposed
    }));
  } catch (err) {
    console.warn(`⚠️ Unofficial API failed for ${username}:`, err.message);
  }

  // 3️⃣ Last-ditch: scrape the public profile page
  try {
    const profileUrl = `https://www.geeksforgeeks.org/user/${encodeURIComponent(username)}`;
    const html = (await axios.get(profileUrl)).data;
    const $ = cheerio.load(html);
    const scraped = [];
    $('.profile-ques-solved li').each((i, el) => {
      const title = $(el).find('a').text().trim();
      scraped.push({
        id:         title,
        title,
        difficulty: 'Unknown',
        tags:       [],
        solvedAt:   new Date(),
      });
    });
    console.log(`🔍 Scraped ${scraped.length} problems from HTML for ${username}`);
    return scraped;
  } catch (err) {
    console.error(`❌ HTML scraping failed for ${username}:`, err.message);
    // Return empty so controller returns a “no problems imported” response
    return [];
  }
}

/**
 * Fetch only the count of solved problems for a GfG user.
 */
export async function fetchGFGSolvedCount(username) {
  const problems = await fetchGFGProblems(username);
  return problems.length;
}
