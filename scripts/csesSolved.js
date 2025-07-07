// File: scripts/csesSolved.js
import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE = 'https://cses.fi';

async function fetchSolvedProblems(userId) {
  const url = `${BASE}/problemset/user/${userId}`;
  const { data: html } = await axios.get(url);

  // Log the full HTML so you can inspect what it actually looks like!
  console.log(html); 
  
  const $ = cheerio.load(html);

  const solved = [];
  $('a.task-score.icon.full').each((_, el) => {
    const $el = $(el);
    const title = $el.attr('title');
    if (title) solved.push(title);
  });

  if (solved.length === 0) {
    $('a.task-score.icon').each((_, el) => {
      const $el = $(el);
      if ($el.hasClass('full') || $el.text().trim() === '✓') {
        const title = $el.attr('title');
        if (title && !solved.includes(title)) solved.push(title);
      }
    });
  }

  return solved;
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node scripts/csesSolved.js <userId>');
    process.exit(1);
  }

  try {
    const solved = await fetchSolvedProblems(userId);
    console.log(`Solved: ${solved.length} problems`);
    solved.forEach(name => console.log(`- ${name}`));
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
