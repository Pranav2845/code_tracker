import axios from 'axios';

const GQL_URL = 'https://leetcode.com/graphql';

// GraphQL query to get recent submissions
const RECENT_SUBMISSIONS_QUERY = `
  query recentSubmissions($username: String!) {
    recentSubmissionList(username: $username) {
      title
      titleSlug
      timestamp
      statusDisplay
    }
  }
`;

// GraphQL query to get metadata for one problem
const QUESTION_DETAIL_QUERY = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      titleSlug
      difficulty
      topicTags {
        name
      }
    }
  }
`;

// GraphQL query to get total solved counts per difficulty
const USER_STATS_QUERY = `
  query getUserSolved($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;


// 🔁 Fetch only Accepted submissions from recent 20
async function fetchAcceptedSubmissions(username) {
  const { data } = await axios.post(
    GQL_URL,
    {
      query: RECENT_SUBMISSIONS_QUERY,
      variables: { username }
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const submissions = data?.data?.recentSubmissionList || [];
  return submissions.filter((s) => s.statusDisplay === 'Accepted');
}

// 📘 Fetch metadata for each problem one by one
async function fetchProblemDetails(slugs) {
  const result = {};

  for (const slug of slugs) {
    try {
      const { data } = await axios.post(
        GQL_URL,
        {
          query: QUESTION_DETAIL_QUERY,
          variables: { titleSlug: slug }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const q = data.data?.question;
      if (q) {
        result[slug] = {
          difficulty: q.difficulty || 'Unknown',
          tags: q.topicTags.map((t) => t.name) || []
        };
      }
    } catch (err) {
      console.error(`❌ Failed to fetch metadata for ${slug}:`, err.message);
      result[slug] = { difficulty: 'Unknown', tags: [] };
    }
  }

  return result;
}

// ✅ Final exported function
export async function fetchLeetCodeProblems(username) {
  const submissions = await fetchAcceptedSubmissions(username);

  // Deduplicate by latest timestamp
  const uniqueBySlug = {};
  for (const s of submissions) {
    if (!uniqueBySlug[s.titleSlug] || s.timestamp > uniqueBySlug[s.titleSlug].timestamp) {
      uniqueBySlug[s.titleSlug] = s;
    }
  }

  const slugs = Object.keys(uniqueBySlug);
  if (slugs.length === 0) return [];

  const detailsMap = await fetchProblemDetails(slugs);

  return slugs.map((slug) => {
    const { title, timestamp } = uniqueBySlug[slug];
    const meta = detailsMap[slug] || { difficulty: 'Unknown', tags: [] };

    return {
      id: slug,
      title,
      difficulty: meta.difficulty,
      tags: meta.tags,
      solvedAt: new Date(timestamp * 1000)
    };
  });
}

// ➕ Fetch total solved count for the user
export async function fetchLeetCodeSolvedCount(username) {
  const { data } = await axios.post(
    GQL_URL,
    {
      query: USER_STATS_QUERY,
      variables: { username },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const stats =
    data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  // The "acSubmissionNum" array includes an entry with difficulty "All"
  // which already represents the user's total solved count. Prefer that
  // value when available to avoid double counting.
  const totalEntry = stats.find((s) => s.difficulty === 'All');
  if (totalEntry) {
    return totalEntry.count || 0;
  }
  return stats.reduce((sum, s) => sum + (s.count || 0), 0);
}