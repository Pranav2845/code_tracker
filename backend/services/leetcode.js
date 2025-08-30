import axios from 'axios';

const GQL_URL = 'https://leetcode.com/graphql';

// Paginated submissions query
const SUBMISSION_LIST_QUERY = `
  query submissionList($username: String!, $limit: Int!, $offset: Int!) {
    submissionList(username: $username, limit: $limit, offset: $offset) {
      submissions {
        title
        titleSlug
        timestamp
        statusDisplay
      }
      hasNext
    }
  }
`;

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

const RECENT_AC_SUBMISSION_QUERY = `
  query recentAcSubmissionList($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

// Fetch **all** accepted submissions via pagination
async function fetchAcceptedSubmissions(username) {
  const limit = 20;
  let offset = 0;
  let allItems = [];

  while (true) {
    const { data } = await axios.post(
      GQL_URL,
      {
        query: SUBMISSION_LIST_QUERY,
        variables: { username, limit, offset },
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const list = data?.data?.submissionList;
    if (!list || !list.submissions || list.submissions.length === 0) break;

    allItems = allItems.concat(list.submissions.filter((s) => s.statusDisplay === 'Accepted'));

    if (!list.hasNext) break;
    offset += limit;
  }

  return allItems;
}

// Fetch metadata for each problem
async function fetchProblemDetails(slugs) {
  const result = {};

  for (const slug of slugs) {
    try {
      const { data } = await axios.post(
        GQL_URL,
        { query: QUESTION_DETAIL_QUERY, variables: { titleSlug: slug } },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const q = data.data?.question;
      result[slug] = {
        difficulty: q?.difficulty || 'Unknown',
        tags: q?.topicTags?.map((t) => t.name) || []
      };
    } catch {
      result[slug] = { difficulty: 'Unknown', tags: [] };
    }
  }

  return result;
}

export async function fetchLeetCodeProblems(username) {
  const submissions = await fetchAcceptedSubmissions(username);

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
      solvedAt: new Date(timestamp * 1000),
      url: `https://leetcode.com/problems/${slug}/`
    };
  });
}

// Fetch recent accepted submissions via official GraphQL endpoint
export async function fetchLeetCodeSolvedProblems(username, limit = 50) {
  const { data } = await axios.post(
    GQL_URL,
    {
      query: RECENT_AC_SUBMISSION_QUERY,
      variables: { username, limit },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (data.errors) {
    const message = data.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL error: ${message}`);
  }

    const submissions = data?.data?.recentAcSubmissionList || [];


  return submissions.map((s) => ({
    id: s.titleSlug,
    title: s.title,
    url: `https://leetcode.com/problems/${s.titleSlug}/`,
    solvedAt: s.timestamp ? new Date(s.timestamp * 1000) : undefined,
  }));
}

export async function fetchLeetCodeSolvedCount(username) {
  const { data } = await axios.post(
    GQL_URL,
    { query: USER_STATS_QUERY, variables: { username } },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const stats = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  const totalEntry = stats.find((s) => s.difficulty === 'All');
  if (totalEntry) return totalEntry.count || 0;
  return stats.reduce((sum, s) => sum + (s.count || 0), 0);
}
