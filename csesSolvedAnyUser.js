// file: csesSolvedAnyUser.js
import axios from 'axios';
import * as cheerio from 'cheerio';

// Replace with your own session cookie!
const COOKIES = 'PHPSESSID=b04b3ea986c3b477051d3c3406185def1172ab6';

async function fetchSolved(userId) {
  const url = `https://cses.fi/problemset/user/${userId}`;
  const { data: html } = await axios.get(url, {
    headers: {
      Cookie: COOKIES,
      'User-Agent': 'Mozilla/5.0'
    }
  });
  const $ = cheerio.load(html);

  const solved = [];
  // The solved problems have class "task-score icon full"
  $('a.task-score.icon.full').each((_, el) => {
    const $el = $(el);
    solved.push($el.attr('title'));
  });
  return solved;
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node csesSolvedAnyUser.js <userId>');
    process.exit(1);
  }
  const solved = await fetchSolved(userId);
  console.log(`Solved: ${solved.length} problems`);
  solved.forEach(name => console.log('- ' + name));
}

main();
