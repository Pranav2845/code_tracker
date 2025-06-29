import axios from 'axios';

// Fetch the total solved challenge count for a HackerRank user
export async function fetchHackerRankSolvedCount(username) {
  const url = `https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(username)}/profile`;
  const { data } = await axios.get(url);
  return data?.model?.solved_challenges || 0;
}

// Fetch up to 100 of the user's most recently solved challenges
export async function fetchHackerRankProblems(username) {
  const url = `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/recent_challenges?offset=0&limit=100`;
  const { data } = await axios.get(url);
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
}