import axios from 'axios';

const SITES = new Set([
  'LeetCode',
  'CodeForces',
  'HackerRank',
  'GeeksforGeeks',
  'Coding Ninjas',
  'CSES',
  'CodeChef'
]);

// Fetch all programming contests from the public kontests.net API
export async function fetchAllContests() {
  try {
    const { data } = await axios.get('https://kontests.net/api/v1/all');
        if (!Array.isArray(data)) return { upcoming: [], past: [] };

    const now = Date.now();
      const contests = data
      .filter(c => SITES.has(c.site))
      .map(c => ({
        name: c.name,
        site: c.site,
        url: c.url,
        startTime: new Date(c.start_time),
              endTime: new Date(c.end_time)
      }));

    const upcoming = [];
    const past = [];
    contests.forEach(c => {
      if (c.endTime.getTime() < now) past.push(c);
      else upcoming.push(c);
    });

    upcoming.sort((a, b) => a.startTime - b.startTime);
    past.sort((a, b) => b.startTime - a.startTime);
    return { upcoming, past };
  } catch (err) {
    console.error('❌ fetchAllContests error:', err.message);
    return { upcoming: [], past: [] };
  }
  }

// Backwards compatibility for existing callers
export async function fetchUpcomingContests() {
  const { upcoming } = await fetchAllContests();
  return upcoming;
}