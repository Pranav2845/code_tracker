// backend/services/codechef.js
import axios from 'axios';

const CODECHEF_BASE = 'https://api.codechef.com';

async function getAccessToken() {
  const id = process.env.CODECHEF_CLIENT_ID;
  const secret = process.env.CODECHEF_CLIENT_SECRET;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'public',
    client_id: id,
    client_secret: secret,
  });

  const { data } = await axios.post(`${CODECHEF_BASE}/oauth/token`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return (
    data?.result?.data?.access_token || data?.access_token || null
  );
}

export async function fetchCodeChefProblems(username) {
  const token = await getAccessToken();
  if (!token) return [];

  const { data } = await axios.get(
    `${CODECHEF_BASE}/users/${encodeURIComponent(username)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const solved =
    data?.result?.data?.content?.fully_solved ||
    data?.result?.data?.content?.user_problems_solved?.fully_solved || {};

  const problems = [];
  Object.values(solved).forEach((arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((p) => {
        const code = p.problemCode || p.problem_code || p;
        problems.push({
          id: code,
          title: p.problemName || p.problem_name || code,
          difficulty: p.difficulty || 'Unknown',
          tags: p.tags || [],
          solvedAt: p.dateSolved ? new Date(p.dateSolved) : new Date(),
        });
      });
    }
  });

  return problems;
}