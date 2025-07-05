import axios from 'axios';

// Fetch upcoming programming contests from the public kontests.net API
export async function fetchUpcomingContests() {
  try {
    const { data } = await axios.get('https://kontests.net/api/v1/all');
    if (!Array.isArray(data)) return [];
    const now = Date.now();
    return data
      .filter(c => new Date(c.start_time).getTime() > now)
      .map(c => ({
        name: c.name,
        site: c.site,
        url: c.url,
        startTime: new Date(c.start_time),
        endTime: new Date(c.end_time),
      }))
      .sort((a, b) => a.startTime - b.startTime);
  } catch (err) {
    console.error('❌ fetchUpcomingContests error:', err.message);
    return [];
  }
}