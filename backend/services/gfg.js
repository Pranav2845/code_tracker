// backend/services/gfg.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetch solved problems from GeeksforGeeks Practice.
 * Returns an array of { id, title, difficulty, tags, solvedAt }.
 */
export async function fetchGFGProblems(username) {
  // 1️⃣ Try the “official” practiceapi endpoint (note: param key is user_name)
  const officialUrl = `https://practiceapi.geeksforgeeks.org/api/v1/user/get_stats?user_name=${encodeURIComponent(username)}`;
  try {
    const { data } = await axios.get(officialUrl);
    const practice = data?.data?.practice || data?.practice || {};
    const problems = Array.isArray(practice.problems) ? practice.problems : [];
    const solvedCount = practice.problemsSolved ?? practice.problems_solved ?? null;

    console.log(`🔍 Official API returned ${problems.length} problems for ${username}`);
    if (problems.length > 0) {
      return problems.map(p => ({
        id:         p.pid || p.problemId || p.problem_code || p.title,
        title:      p.problemTitle || p.title || '',
        difficulty: p.difficulty || 'Unknown',
        tags:       p.tags || [],
        solvedAt:   p.solvedOn ? new Date(p.solvedOn) : new Date(),
      }));
    }

    // If API reports count but no details, fall back
    if (solvedCount > 0) {
      console.warn(`⚠️ Official API shows ${solvedCount} solved but no detailed problems for ${username}, falling back…`);
    } else {
      // zero solved
      return [];
    }
  } catch (err) {
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
    
    let list = [];

    if (Array.isArray(data?.problems)) {
      // Legacy structure from older versions of the API
      list = data.problems.map(p => ({
        id:         p.name,
        title:      p.name,
        difficulty: p.difficulty || 'Unknown',
        tags:       [],
        solvedAt:   new Date(),
      }));
    } else if (data?.solvedStats && typeof data.solvedStats === 'object') {
      // Newer API structure: solvedStats.{easy,medium,hard,basic}.questions
      for (const [difficulty, obj] of Object.entries(data.solvedStats)) {
        const questions = Array.isArray(obj?.questions) ? obj.questions : [];
        questions.forEach(q => {
          list.push({
            id:         q.question,
            title:      q.question,
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            tags:       [],
            solvedAt:   new Date(),
          });
        });
      }
    }
    console.log(`🔍 Unofficial API returned ${list.length} problems for ${username}`);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn(`⚠️ Unofficial API failed for ${username}:`, err.message);
  }

  // 3️⃣ Last-ditch: scrape the public Practice page
  try {
    const practiceUrl = `https://practice.geeksforgeeks.org/user/${encodeURIComponent(username)}/practice/`;
    const html = (await axios.get(practiceUrl)).data;
    const $ = cheerio.load(html);

    // 3a) Try extracting JSON from Next.js payload
    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
      const payload = JSON.parse(nextData);
      const problems = payload.props?.pageProps?.practiceProblems || [];
      console.log(`🔍 NextData JSON returned ${problems.length} problems for ${username}`);
      return problems.map(p => ({
        id:         p.problemCode,
        title:      p.problemName,
        difficulty: p.problemDifficulty || 'Unknown',
        tags:       p.problemTags || [],
        solvedAt:   p.solvedAt ? new Date(p.solvedAt) : new Date(),
      }));
    }

    // 3b) Link-based scrape fallback
    const scraped = new Set();
    $('a[href*="/practice-problem/"], a[href*="/problems/"]').each((i, el) => {
      const title = $(el).text().trim();
      if (title) scraped.add(title);
    });
    const list = Array.from(scraped).map(title => ({
      id:         title,
      title,
      difficulty: 'Unknown',
      tags:       [],
      solvedAt:   new Date(),
    }));
    console.log(`🔍 Link-based scrape found ${list.length} problems for ${username}`);
    return list;
  } catch (err) {
    console.error(`❌ Scraping fallback failed for ${username}:`, err.message);
    return [];
  }
}

/**
 * Attempt to read just the solved count via the official API.
 * Returns the count or throws on network/HTTP errors.
 */
async function fetchGFGSolvedCountOfficial(username) {
  const url = `https://practiceapi.geeksforgeeks.org/api/v1/user/get_stats?user_name=${encodeURIComponent(username)}`;
  const { data } = await axios.get(url);

  // Helper to recursively search for a numeric property containing "solved"
  const findSolved = obj => {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'number' && key.toLowerCase().includes('solved')) return val;
      if (typeof val === 'string' && key.toLowerCase().includes('solved') && !isNaN(Number(val))) return Number(val);
      if (val && typeof val === 'object') {
        const nested = findSolved(val);
        if (typeof nested === 'number') return nested;
      }
    }
    return undefined;
  };

  const solved = findSolved(data);
  if (typeof solved === 'number') {
    console.log(`🔍 Official API solved count ${solved} for ${username}`);
    return solved;
  }

  const practice = data?.data?.practice || data?.practice || {};
  const problems = Array.isArray(practice.problems) ? practice.problems : [];
  if (problems.length > 0) {
    console.log(`🔍 Derived solved count ${problems.length} from problems array for ${username}`);
    return problems.length;
  }

  throw new Error('Solved count not found in response');
}

// 🔎 Parse "Problems Solved" count from the HTML profile page
function scrapeSolvedCount(html) {
  const $ = cheerio.load(html);
  let text = $('.score_card_value').first().text();
  if (!text) text = $('[class*=score_card_value]').first().text();
  if (!text) {
    const label = $('*').filter((i, el) => /Problems\s*Solved/i.test($(el).text())).first();
    if (label.length) text = label.next().text() || label.text();
  }
  const m = text && text.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/**
 * Fetch only the count of solved problems for a GfG user.
 */
export async function fetchGFGSolvedCount(username) {
  try {
    return await fetchGFGSolvedCountOfficial(username);
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn(`⚠️ Official GfG API 404 for ${username}, falling back to scraping…`);
    } else {
      console.warn(`⚠️ fetchGFGSolvedCountOfficial failed for ${username}:`, err.message);
    }
  }

  // Try scraping just the solved count from the practice page
  try {
    const practiceUrl = `https://practice.geeksforgeeks.org/user/${encodeURIComponent(username)}/practice/`;
    const html = (await axios.get(practiceUrl)).data;
    const scraped = scrapeSolvedCount(html);
    if (typeof scraped === 'number') {
      console.log(`🔍 Scraped solved count ${scraped} for ${username}`);
      return scraped;
    }
  } catch (err) {
    console.warn(`⚠️ scrapeSolvedCount failed for ${username}:`, err.message);
  }

  const problems = await fetchGFGProblems(username);
  return Array.isArray(problems) ? problems.length : 0;
}
