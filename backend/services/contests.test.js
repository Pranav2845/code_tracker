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
  fetchCodeChefContests,
  refreshAllContests,
  fetchAllContests,
  fetchUpcomingContests,
} = await import('./contests.js');
const { detectPlatform } = await import('../routes/contests.js');
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

describe('fetchCodeChefContests', () => {
  it('scrapes future and present tables', async () => {
    const html = `<table id="future-contests-data"><tbody><tr><td>X</td><td><a href="/ABC">ABC Contest</a></td><td>2024-01-02 10:00</td><td>2024-01-02 12:00</td></tr></tbody></table><table id="present-contests-data"><tbody></tbody></table>`;
    axios.get.mockResolvedValueOnce({ data: html });
    const list = await fetchCodeChefContests();
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ platform: 'codechef', name: 'ABC Contest' });
    expect(list[0].url).toContain('/ABC');
  });
});

describe('refreshAllContests', () => {
  it('upserts contests from all sources', async () => {
    const html = `<table id="contest-table-upcoming"><tbody></tbody></table><table id="contest-table-recent"><tbody></tbody></table>`;
        const chef = `<table id="future-contests-data"><tbody></tbody></table><table id="present-contests-data"><tbody></tbody></table>`;
    axios.get
      .mockResolvedValueOnce({ data: { status: 'OK', result: [{ id: 1, name: 'CF', startTimeSeconds: 0, durationSeconds: 60 }] } })
      .mockResolvedValueOnce({ data: html })
      .mockResolvedValueOnce({ data: chef });

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

describe('detectPlatform fallback', () => {
  it('uses provided resource name when host is unknown', () => {
    const platform = detectPlatform('https://unknown.example.com', 'Custom');
    expect(platform).toBe('Custom');
  });
});

describe('detectPlatform known hosts', () => {
  it('returns lowercase platform identifiers', () => {
    expect(detectPlatform('https://leetcode.com/contest')).toBe('leetcode');
    expect(detectPlatform('https://codeforces.com/contest/1')).toBe('codeforces');
    expect(detectPlatform('https://atcoder.jp/')).toBe('atcoder');
    expect(detectPlatform('https://codechef.com/')).toBe('codechef');
    expect(detectPlatform('https://hackerrank.com/challenges')).toBe('hackerrank');
     expect(detectPlatform('https://geeksforgeeks.org/contest')).toBe('gfg');
    expect(detectPlatform('https://www.naukri.com/code360/events')).toBe('code360');
    expect(detectPlatform('https://codingninjas.com/contest')).toBe('code360');
  });
});