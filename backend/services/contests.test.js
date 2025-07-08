import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
vi.mock('../models/Contest.js', () => ({
  default: { updateOne: vi.fn(), find: vi.fn() }
}));

const Contest = (await import('../models/Contest.js')).default;
const {
  fetchCodeforcesContests,
  fetchLeetCodeContests,
  fetchAtCoderContests,
  refreshAllContests,
  fetchAllContests,
  fetchUpcomingContests,
} = await import('./contests.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchCodeforcesContests', () => {
  it('maps API response', async () => {
    axios.get.mockResolvedValueOnce({
      data: { status: 'OK', result: [{ id: 1, name: 'CF', startTimeSeconds: 0, durationSeconds: 60 }] }
    });
    const list = await fetchCodeforcesContests();
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ platform: 'codeforces', name: 'CF' });
  });
});

describe('fetchLeetCodeContests', () => {
  it('parses contest list', async () => {
    axios.get.mockResolvedValueOnce({ data: { contests: [{ title: 'Weekly', title_slug: 'w', start_time: 0, duration: 60 }] } });
    const list = await fetchLeetCodeContests();
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ platform: 'leetcode', name: 'Weekly' });
    expect(list[0].url).toContain('w');
  });
});

describe('fetchAtCoderContests', () => {
  it('scrapes tables', async () => {
    const html = `<table id="contest-table-upcoming"><tbody><tr><td>2024-01-01 10:00</td><td><a href="/contests/abc">ABC</a></td><td>01:00</td></tr></tbody></table><table id="contest-table-recent"><tbody></tbody></table>`;
    axios.get.mockResolvedValueOnce({ data: html });
    const list = await fetchAtCoderContests();
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ platform: 'atcoder', name: 'ABC' });
  });
});

describe('refreshAllContests', () => {
  it('upserts contests from all sources', async () => {
    const html = `<table id="contest-table-upcoming"><tbody></tbody></table><table id="contest-table-recent"><tbody></tbody></table>`;
    axios.get
      .mockResolvedValueOnce({ data: { status: 'OK', result: [{ id: 1, name: 'CF', startTimeSeconds: 0, durationSeconds: 60 }] } })
      .mockResolvedValueOnce({ data: { contests: [] } })
      .mockResolvedValueOnce({ data: html });

    const list = await refreshAllContests();
    expect(Array.isArray(list)).toBe(true);
    expect(Contest.updateOne).toHaveBeenCalledTimes(1);
  });
});

// Optional: Test fetchAllContests and fetchUpcomingContests with mocked Contest.find
describe('fetchAllContests', () => {
  it('returns upcoming and past contests from DB', async () => {
    const now = new Date();
    Contest.find
      .mockResolvedValueOnce([{ name: 'future', endTime: new Date(now.getTime() + 10000) }])
      .mockResolvedValueOnce([{ name: 'past', endTime: new Date(now.getTime() - 10000) }]);
    const res = await fetchAllContests();
    expect(Array.isArray(res.upcoming)).toBe(true);
    expect(Array.isArray(res.past)).toBe(true);
    expect(res.upcoming[0].name).toBe('future');
    expect(res.past[0].name).toBe('past');
  });
});

describe('fetchUpcomingContests', () => {
  it('returns only upcoming contests', async () => {
    Contest.find.mockResolvedValueOnce([{ name: 'future', endTime: new Date(Date.now() + 10000) }]);
    const res = await fetchUpcomingContests();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].name).toBe('future');
  });
});
