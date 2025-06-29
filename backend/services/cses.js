// backend/services/cses.js

import axios from 'axios';
import { load } from 'cheerio';
export async function fetchCSESProblems(username) {
  const url = `https://cses.fi/user/${encodeURIComponent(username)}`;
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
  const url = `https://cses.fi/user/${encodeURIComponent(username)}`;
  const { data: html } = await axios.get(url);

  const $ = load(html);
  return $('a[href^="/problemset/task/"]').length;
}