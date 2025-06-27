// backend/services/leetcode.js
import axios from 'axios';

const REST_BASE = 'https://leetcode.com/api';
const GQL_URL   = 'https://leetcode.com/graphql';

/**
 * 1) Page through LeetCode’s REST submissions endpoint.
 *    Returns a flat list of all submissions (up to maxPages * pageSize).
 */
async function fetchAllLeetCodeSubmissions(username, maxPages = 10, pageSize = 50) {
  let offset = 0;
  const allSubs = [];

  for (let page = 0; page < maxPages; page++, offset += pageSize) {
    const url = `${REST_BASE}/submissions/${encodeURIComponent(username)}/?offset=${offset}&limit=${pageSize}`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Node.js)' }
    });

    if (!Array.isArray(data.submissions_dump) || data.submissions_dump.length === 0) {
      break; // no more data
    }

    allSubs.push(...data.submissions_dump);
    if (data.submissions_dump.length < pageSize) {
      break; // last page reached
    }
  }

  return allSubs;
}

/**
 * 2) Given a batch of titleSlugs, fetch each one's difficulty + tags.
 */
const QUESTION_QUERY = `
  query getQuestions($slugs: [String!]!) {
    questionData(slugs: $slugs) {
      titleSlug
      difficulty
      topicTags { name }
    }
  }
`;

async function fetchProblemDetails(slugs) {
  const { data } = await axios.post(
    GQL_URL,
    { query: QUESTION_QUERY, variables: { slugs } },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const list = data.data?.questionData;
  if (!Array.isArray(list)) {
    throw new Error('LeetCode GraphQL returned unexpected shape');
  }

  // build a lookup map: slug → { difficulty, tags }
  return list.reduce((map, q) => {
    map[q.titleSlug] = {
      difficulty: q.difficulty,
      tags:       q.topicTags.map(t => t.name)
    };
    return map;
  }, {});
}

/**
 * 3) Main export: fetch + filter + dedupe + enrich.
 */
export async function fetchLeetCodeProblems(username) {
  // a) pull all submissions
  const submissions = await fetchAllLeetCodeSubmissions(username);

  // b) keep only Accepted ones, and dedupe by slug (most recent only)
  const latestBySlug = submissions
    .filter(s => s.status_display === 'Accepted')
    .reduce((map, s) => {
      const slug = s.title_slug;
      if (!map[slug] || s.timestamp > map[slug].timestamp) {
        map[slug] = s;
      }
      return map;
    }, {});

  const slugs = Object.keys(latestBySlug);
  if (slugs.length === 0) return [];

  // c) fetch each problem’s difficulty + tags
  const details = await fetchProblemDetails(slugs);

  // d) assemble final list
  return slugs.map(slug => {
    const sub  = latestBySlug[slug];
    const meta = details[slug] || { difficulty: 'Unknown', tags: [] };

    return {
      id:         slug,
      title:      sub.title,
      difficulty: meta.difficulty,
      tags:       meta.tags,
      solvedAt:   new Date(sub.timestamp * 1000)
    };
  });
}
